const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const { saveMessage, getRecentMessages, initializeSupabase } = require('./supabase');
const { analyzeMessage } = require('./nlp');
const { getPatternResponse, getLinkForTopic, getTopicResponse } = require('./responses');
const { shouldTriggerLuckyFeature, getLuckyResponse } = require('./lucky');
const { analyzeWithOpenAI, generateResponse, getCryptoInformation, openai } = require('./openai');

// Create Express app
const app = express();
app.use(express.json());

// Initialize bot with token
const bot = new TelegramBot(config.telegramToken);

// Bot info
let botInfo = null;

// Group chat tracking to monitor crypto conversations
const groupChatTracker = {
  // Structure: { chatId: { lastCryptoMention: timestamp, topicCount: { bitcoin: 2, ethereum: 1 } } }
  groups: new Map(),
  
  // Add a mention of a crypto topic in a group
  trackMention(chatId, topic) {
    if (!this.groups.has(chatId)) {
      this.groups.set(chatId, {
        lastCryptoMention: Date.now(),
        messageCount: 1,
        topicCount: {}
      });
    }
    
    const groupData = this.groups.get(chatId);
    groupData.lastCryptoMention = Date.now();
    groupData.messageCount += 1;
    
    if (topic) {
      if (!groupData.topicCount[topic]) {
        groupData.topicCount[topic] = 1;
      } else {
        groupData.topicCount[topic] += 1;
      }
    }
  },
  
  // Check if a group is actively discussing crypto
  isActiveCryptoDiscussion(chatId) {
    if (!this.groups.has(chatId)) return false;
    
    const groupData = this.groups.get(chatId);
    const timeSinceLastMention = Date.now() - groupData.lastCryptoMention;
    const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    
    return timeSinceLastMention < ACTIVE_THRESHOLD_MS && groupData.messageCount >= 3;
  },
  
  // Get the most mentioned topics in a group
  getTopTopics(chatId, limit = 3) {
    if (!this.groups.has(chatId)) return [];
    
    const groupData = this.groups.get(chatId);
    if (!groupData.topicCount) return [];
    
    return Object.entries(groupData.topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  },
  
  // Add a new method to determine if we should initiate a crypto conversation
  shouldInitiateCryptoConversation(chatId) {
    if (!this.groups.has(chatId)) return false;
    
    const groupData = this.groups.get(chatId);
    const timeSinceLastMention = Date.now() - groupData.lastCryptoMention;
    const CONVERSATION_COOLDOWN = 30 * 60 * 1000; // 30 minutes
    
    // Check if enough time has passed since last mention and there's been enough message activity
    return timeSinceLastMention > CONVERSATION_COOLDOWN && groupData.messageCount >= 5;
  },
  
  // Get a random crypto topic to start a conversation about
  getRandomCryptoTopic() {
    const cryptoTopics = [
      'Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Web3', 'Crypto market trends', 
      'Blockchain technology', 'Stablecoins', 'Layer 2 solutions', 'DAOs'
    ];
    
    return cryptoTopics[Math.floor(Math.random() * cryptoTopics.length)];
  }
};

// Set webhook for production environment
if (process.env.NODE_ENV === 'production') {
  const webhookUrl = `${config.renderUrl}/webhook`;
  bot.setWebHook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);
} else {
  // Use polling for development
  bot.startPolling();
  console.log('Bot started polling for updates');
}

// Initialize Supabase client
initializeSupabase().then(() => {
  console.log('Supabase client initialized successfully');
}).catch(error => {
  console.error('Error initializing Supabase client:', error);
});

// Get bot info on startup
bot.getMe().then(info => {
  botInfo = info;
  console.log(`Bot initialized: @${info.username}`);
  console.log('Bot details:', JSON.stringify(info));
  
  // Log mismatch warning if first_name contains @ or different username
  if (info.first_name.includes('@') || info.first_name.toLowerCase().includes(info.username.toLowerCase())) {
    console.log(`⚠️ WARNING: Bot first_name (${info.first_name}) contains @ or username, which may cause mention detection issues`);
  }
  
  // Special handling for direct API calls to keep the bot responsive
  setInterval(async () => {
    try {
      const updates = await bot._request('getUpdates', {
        offset: -1,
        limit: 5,
        timeout: 0
      });
      
      if (updates && updates.result && updates.result.length > 0) {
        updates.result.forEach(update => {
          if (update.message && update.message.text && update.message.text.includes(`@${info.username}`)) {
            console.log('Found direct mention in update:', update.message.text);
          }
        });
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    }
  }, 10000); // Check every 10 seconds
}).catch(error => {
  console.error('Error getting bot info:', error);
});

// Webhook endpoint for Telegram
app.post('/webhook', (req, res) => {
  if (req.body) {
    bot.processUpdate(req.body);
  }
  res.sendStatus(200);
});

// Handle chat_member events (when members join or leave a chat)
bot.on('chat_member', async (chatMember) => {
  try {
    if (chatMember.new_chat_member.status === 'member' && 
        (chatMember.old_chat_member.status === 'left' || chatMember.old_chat_member.status === 'restricted')) {
      // A user has joined the chat
      const chatId = chatMember.chat.id;
      const user = chatMember.new_chat_member.user;
      
      // Skip if it's the bot itself
      if (botInfo && user.id === botInfo.id) return;
      
      // Welcome the new user
      const userName = user.first_name || 'there';
      const welcomeMessage = `Welcome to the group, ${userName}! 👋 Feel free to introduce yourself and join the conversation.`;
      await bot.sendMessage(chatId, welcomeMessage);
      
      console.log(`Welcomed new member ${user.id} (${userName}) in chat ${chatId}`);
    }
  } catch (error) {
    console.error('Error handling chat_member event:', error);
  }
});

// Handle bot's chat member updates (when bot joins or leaves a chat)
bot.on('my_chat_member', async (chatMember) => {
  try {
    // Check if the bot was just added to a group
    if (chatMember.new_chat_member.status === 'member' && 
        chatMember.old_chat_member.status === 'left') {
      const chatId = chatMember.chat.id;
      
      // Send an introduction message
      await bot.sendMessage(chatId, 
        `👋 Hello everyone! I'm your new assistant bot.\n\n` +
        `I can help with information, answer questions, and provide resources.\n\n` +
        `To get started, try typing '/help' to see what I can do!`
      );
      
      console.log(`Bot was added to chat ${chatId} - sent introduction message`);
    }
  } catch (error) {
    console.error('Error handling my_chat_member event:', error);
  }
});

// Handle incoming messages
bot.on('message', async (msg) => {
  try {
    // Handle new chat members
    if (msg.new_chat_member || msg.new_chat_members) {
      await handleNewChatMember(msg);
      return;
    }
    
    if (!msg.text) return; // Ignore non-text messages
    
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    const isPrivateChat = msg.chat.type === 'private';
    
    console.log(`Received message: ${text} from user ${userId} in chat ${chatId}, chat type: ${msg.chat.type}`);
    
    // FAST PATH: Direct detection for explicit mentions in group chats
    if (!isPrivateChat && botInfo && text.includes(`@${botInfo.username}`)) {
      console.log(`🔔 DIRECT MENTION in group detected: ${text}`);
      
      // Send a typing indicator immediately
      bot.sendChatAction(chatId, 'typing');
      
      // Save message to database
      await saveMessage(chatId, userId, text);
      
      // Clean the text by removing the mention
      const cleanedText = text.replace(new RegExp(`@${botInfo.username}\\b`, 'gi'), '').trim();
      console.log(`📝 Processing direct mention, extracted question: "${cleanedText}"`);
      
      try {
        // Add a realistic delay
        await delay(1000 + Math.random() * 1500);
        
        // Generate a response directly
        let response = null;
        
        if (cleanedText.toLowerCase().includes('ethereum')) {
          console.log(`📊 Ethereum question detected`);
          response = "Ethereum's future looks promising with the ongoing development of Ethereum 2.0, scaling solutions like Layer 2s, and the growing DeFi and NFT ecosystems. The transition to proof-of-stake has significantly reduced energy consumption while improving scalability, and developers continue building innovative applications on the platform. Key areas to watch include further scalability improvements, regulatory developments, and competition from alternative smart contract platforms.";
        } else {
          const analysis = await analyzeWithOpenAI(cleanedText, [], false);
          console.log(`Analysis result:`, analysis ? JSON.stringify(analysis) : 'no analysis');
          
          response = await generateResponse(cleanedText, analysis || { isQuestion: true, relevance: 9, topic: 'cryptocurrency' });
        }
        
        if (response) {
          console.log(`✅ Sending response to direct mention`);
          await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
          return;  // Exit early after handling direct mention
        }
      } catch (error) {
        console.error('❌ Error processing direct group mention:', error);
        
        // Fallback response for errors
        await bot.sendMessage(chatId, "I'm processing your question, but I'm experiencing some technical difficulties right now. Please try again in a moment.");
        return;
      }
    }
    
    // Continue with regular message processing
    // Handle /start command
    if (text.startsWith('/start')) {
      await handleStartCommand(msg);
      return;
    }
    
    // Handle /help command
    if (text.startsWith('/help')) {
      await handleHelpCommand(msg);
      return;
    }
    
    // Handle topic-specific commands (e.g., /bitcoin, /ethereum, /defi)
    if (text.startsWith('/') && text.length > 1) {
      const success = await handleTopicCommand(msg);
      if (success) return; // If handled successfully, exit
    }
    
    // Save message to Supabase
    await saveMessage(chatId, userId, text);
    
    // First, try to get recent messages for context
    let recentMessages = [];
    try {
      recentMessages = await getRecentMessages(chatId, 5);
    } catch (error) {
      console.error('Error fetching recent messages:', error);
    }
    
    // Try to analyze with OpenAI first (better AI capabilities)
    let analysis = null;
    try {
      analysis = await analyzeWithOpenAI(text, recentMessages, !isPrivateChat);
    } catch (error) {
      console.error('Error analyzing with OpenAI:', error);
      // If OpenAI fails due to rate limit, log it but continue with fallbacks
      if (error.message && error.message.includes('Quota exceeded')) {
        console.log('OpenAI API rate limit reached, using fallbacks');
      }
    }
    
    // Fallback to basic NLP if OpenAI failed
    let detectedTopic = analysis ? analysis.topic : null;
    if (!detectedTopic) {
      detectedTopic = await analyzeMessage(text, recentMessages);
    }
    
    // If we're in a group chat, track the conversation
    if (!isPrivateChat && detectedTopic) {
      groupChatTracker.trackMention(chatId, detectedTopic);
    }
    
    // First, check if it's a direct question or high-relevance message to the bot
    let isBotMentioned = false;
    let cleanedText = text;
    
    // Check for direct mentions in group chats with very explicit pattern matching
    if (!isPrivateChat && botInfo) {
      console.log(`Checking message for mentions: "${text}"`);
      
      // Check for full mention format (@Username)
      const mentionRegex = new RegExp(`@${botInfo.username}\\b`, 'i');
      if (mentionRegex.test(text)) {
        console.log(`✅ Direct @mention match found: ${text}`);
        cleanedText = text.replace(mentionRegex, '').trim();
        isBotMentioned = true;
      } 
      // Check for message starting with username without @
      else if (text.toLowerCase().startsWith(botInfo.username.toLowerCase())) {
        console.log(`✅ Username at start of message: ${text}`);
        cleanedText = text.substring(botInfo.username.length).trim();
        isBotMentioned = true;
      }
      // Check for reply to bot's message
      else if (msg.reply_to_message && msg.reply_to_message.from && 
               msg.reply_to_message.from.id === botInfo.id) {
        console.log(`✅ Reply to bot's message: ${text}`);
        isBotMentioned = true;
      }
      // Check for first name match (but be careful if first_name contains @)
      else if (botInfo.first_name && !botInfo.first_name.includes('@') && 
               text.toLowerCase().includes(botInfo.first_name.toLowerCase())) {
        console.log(`✅ Bot first name mentioned: ${text}`);
        isBotMentioned = true;
      }
      // Check for high relevance message from analysis
      else if (analysis && analysis.relevance >= 7) {
        console.log(`✅ High relevance message (${analysis.relevance}): ${text}`);
        isBotMentioned = true;
      }
      
      // Additional check for @botusername format (most common in Telegram)
      const atUsername = `@${botInfo.username}`;
      if (text.includes(atUsername)) {
        console.log(`✅ DIRECT MENTION FOUND: ${atUsername} in message: "${text}"`);
        isBotMentioned = true;
        // Force response for direct mentions regardless of other checks
        cleanedText = text.replace(atUsername, '').trim();
      }
    } else if (isPrivateChat) {
      // Always respond in private chats
      isBotMentioned = true;
    }
    
    // Debug log for any mentions
    if (!isPrivateChat && (text.includes('@') || isBotMentioned)) {
      console.log(`Mention analysis completed for: "${text}"`);
      console.log(`Bot username: ${botInfo ? botInfo.username : 'unknown'}`);
      console.log(`Is bot mentioned: ${isBotMentioned}`);
      console.log(`Cleaned text: "${cleanedText}"`);
    }
    
    // In private chats, always respond. In group chats, only respond if mentioned or high relevance
    if (isPrivateChat || isBotMentioned) {
      // Show typing indicator to make the bot feel more realistic
      bot.sendChatAction(chatId, 'typing');
      
      // First try to get a OpenAI-generated response if it's likely a crypto-related question
      let response = null;
      
      if (analysis && (analysis.isQuestion || analysis.relevance >= 5)) {
        try {
          // Add a longer delay for complex analysis (2-4 seconds)
          await delay(2000 + Math.random() * 2000);
          // Use the cleaned text for better responses when mentioned
          response = await generateResponse(isBotMentioned && cleanedText !== text ? cleanedText : text, analysis);
        } catch (error) {
          console.error('Error generating response with OpenAI:', error);
          
          // If it's a rate limit error, try using pattern responses
          if (error.message && error.message.includes('Quota exceeded')) {
            console.log('OpenAI API rate limit reached, using pattern responses');
            // Fall through to the pattern response logic below
          }
        }
      }
      
      // If OpenAI didn't provide a response, try pattern matching
      if (!response) {
        // Add a short delay for pattern matching (0.5-1.5 seconds)
        await delay(500 + Math.random() * 1000);
        response = getPatternResponse(text);
      }
      
      // If we found a topic but no specific response, provide generic topic info
      if (!response && detectedTopic) {
        // Add a short delay for topic response (1-2 seconds)
        await delay(1000 + Math.random() * 1000);
        const topicInfo = getLinkForTopic(detectedTopic);
        if (topicInfo) {
          response = getTopicResponse(detectedTopic);
        }
      }
      
      // If we still don't have a response and it seems like a question, use pre-defined fallbacks for common questions
      if (!response && text.includes('?')) {
        try {
          // Add delay for fallback response generation (1.5-3 seconds)
          await delay(1500 + Math.random() * 1500);
          response = await generateResponse(text, { isQuestion: true, relevance: 5 });
        } catch (error) {
          console.error('Error generating fallback response with OpenAI:', error);
          
          // Add a short delay for hardcoded fallbacks (0.5-1.5 seconds)
          await delay(500 + Math.random() * 1000);
          
          // Use fallback responses for common crypto questions
          if (text.toLowerCase().includes('bitcoin') || text.toLowerCase().includes('btc')) {
            response = "Bitcoin is the first and most valuable cryptocurrency, created by an anonymous entity known as Satoshi Nakamoto in 2009. It operates on a decentralized blockchain and has a limited supply of 21 million coins.";
          } else if (text.toLowerCase().includes('ethereum') || text.toLowerCase().includes('eth')) {
            response = "Ethereum is a programmable blockchain that allows users to create decentralized applications and smart contracts. It was proposed in 2013 by Vitalik Buterin and has evolved into a leading platform for DeFi, NFTs, and other blockchain applications.";
          } else if (text.toLowerCase().includes('price') || text.toLowerCase().includes('worth') || text.toLowerCase().includes('value')) {
            response = "I don't have real-time price data, but you can check current cryptocurrency prices on exchanges like Binance, Coinbase, or CoinMarketCap. Remember that crypto prices are highly volatile and can change rapidly.";
          } else if (text.toLowerCase().includes('invest') || text.toLowerCase().includes('buy') || text.toLowerCase().includes('purchase')) {
            response = "Cryptocurrency investment involves significant risks due to market volatility. It's important to do your own research, only invest what you can afford to lose, and consider consulting with a financial advisor before making investment decisions.";
          } else if (text.toLowerCase().includes('wallet') || text.toLowerCase().includes('store')) {
            response = "Cryptocurrency wallets come in several forms: hardware wallets (like Ledger or Trezor), software wallets (like MetaMask or Trust Wallet), and exchange wallets. Hardware wallets are generally considered the most secure for long-term storage.";
          }
        }
      }
      
      // Final fallback response if nothing else matched
      if (!response) {
        // Add a short delay for the generic fallback (0.5-1 second)
        await delay(500 + Math.random() * 500);
        response = "I'm not sure I understand. Could you rephrase your question about cryptocurrency or blockchain technology?";
      }
      
      // Send the response
      if (response) {
        await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
      }
    }
    
    // If we're in a group chat, consider initiating a conversation about crypto
    if (!isPrivateChat && Math.random() < 0.05 && groupChatTracker.shouldInitiateCryptoConversation(chatId)) {
      const topic = groupChatTracker.getRandomCryptoTopic();
      const conversation = await generateCryptoConversationStarter(topic);
      
      if (conversation) {
        await bot.sendMessage(chatId, conversation);
        // Update tracking to prevent too frequent initiations
        groupChatTracker.trackMention(chatId, topic);
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

/**
 * Handle the /start command
 * @param {Object} msg - The Telegram message object
 */
async function handleStartCommand(msg) {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'there';
  
  // Send a welcome message
  await bot.sendMessage(chatId,
    `👋 Hello ${userName}!\n\n` +
    `I'm your friendly crypto assistant bot, upgraded with OpenAI to provide real-time information and insights on crypto topics.\n\n` +
    `You can ask me questions about cryptocurrencies, blockchain technology, DeFi, NFTs, market trends, and more.\n\n` +
    `I'm constantly analyzing conversations to provide relevant information and adding value to crypto discussions.\n\n` +
    `Type /help to see what else I can do!`
  );
  
  console.log(`Sent start message to user ${msg.from.id} in chat ${chatId}`);
}

/**
 * Handle the /help command
 * @param {Object} msg - The Telegram message object
 */
async function handleHelpCommand(msg) {
  const chatId = msg.chat.id;
  
  // Send a help message with available commands
  await bot.sendMessage(chatId,
    `🔍 *Commands and Features*\n\n` +
    `I'm powered by OpenAI to provide you with real-time crypto information. Here's what I can do:\n\n` +
    `• Answer questions about cryptocurrencies and blockchain\n` +
    `• Provide insights on market trends and price movements\n` +
    `• Explain crypto concepts and technologies\n` +
    `• Share information about specific projects\n` +
    `• Help with technical aspects of crypto\n\n` +
    `*Commands:*\n` +
    `/topic [topic] - Get information about a specific crypto topic\n` +
    `/help - Show this help message\n\n` +
    `You can also just chat with me normally about any crypto-related topics!`,
    { parse_mode: 'Markdown' }
  );
  
  console.log(`Sent help message to user ${msg.from.id} in chat ${chatId}`);
}

/**
 * Handle new chat members by sending a welcome message
 * @param {Object} msg - The Telegram message object
 */
async function handleNewChatMember(msg) {
  try {
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members || [msg.new_chat_member];
    
    for (const member of newMembers) {
      if (botInfo && member.id === botInfo.id) {
        // Bot was added to a new group - add a short delay before responding
        await delay(1000);
        await bot.sendMessage(chatId, 'Thanks for adding me to this group! I\'m here to help. Type /help to see what I can do.');
        continue;
      }
      
      // Welcome the new user - with a small random delay to seem more natural
      await delay(500 + Math.random() * 1000);
      const userName = member.first_name || 'there';
      const welcomeMessage = `Welcome to the group, ${userName}! 👋 Feel free to introduce yourself and join the conversation.`;
      await bot.sendMessage(chatId, welcomeMessage);
    }
  } catch (error) {
    console.error('Error handling new chat member:', error);
  }
}

/**
 * Creates a delay to simulate processing time
 * @param {number} ms - The number of milliseconds to delay
 * @returns {Promise<void>} - A promise that resolves after the specified delay
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Handle topic-specific commands (e.g., /bitcoin, /ethereum)
 * @param {Object} msg - The Telegram message object
 * @returns {Promise<boolean>} - A promise that resolves to true if the command was handled
 */
async function handleTopicCommand(msg) {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Extract the command name without the slash and any potential bot username
    // E.g., "/bitcoin@MyBot" becomes "bitcoin"
    const commandMatch = text.match(/^\/([a-zA-Z0-9_]+)(?:@\w+)?/);
    if (!commandMatch) return false;
    
    const topicName = commandMatch[1].toLowerCase();
    
    // Skip common commands that have their own handlers
    if (['start', 'help'].includes(topicName)) return false;
    
    // First, try to get crypto information using OpenAI
    let response = null;
    
    if (openai) {
      try {
        // Add a typing indicator to show the bot is "thinking"
        bot.sendChatAction(chatId, 'typing');
        
        // Add a realistic delay (2-4 seconds) to simulate processing time
        await delay(2000 + Math.random() * 2000);
        
        response = await getCryptoInformation(topicName);
      } catch (error) {
        console.error('Error getting crypto information with OpenAI:', error);
        // Check if it's a rate limit error
        if (error.message && error.message.includes('Quota exceeded')) {
          console.log('OpenAI API rate limit reached, using fallback responses');
        }
      }
    }
    
    // If OpenAI didn't provide a response, fall back to our predefined responses
    if (!response) {
      // Check pattern responses
      response = getPatternResponse(topicName);
      
      // If no pattern response, check topic links
      if (!response) {
        const topicInfo = getLinkForTopic(topicName);
        if (topicInfo) {
          response = getTopicResponse(topicName);
        }
      }
      
      // If still no response, use common fallbacks for popular topics
      if (!response) {
        const fallbackResponses = {
          'bitcoin': "Bitcoin is the first and most valuable cryptocurrency, created by an anonymous entity known as Satoshi Nakamoto in 2009. It operates on a decentralized blockchain and has a limited supply of 21 million coins.",
          'ethereum': "Ethereum is a blockchain platform that enables smart contracts and decentralized applications (dApps). Unlike Bitcoin which primarily serves as a digital currency, Ethereum provides a platform for developing various blockchain applications.",
          'defi': "DeFi (Decentralized Finance) refers to financial applications built on blockchain technology that operate without central intermediaries like banks. It includes lending platforms, decentralized exchanges, and yield farming opportunities, primarily built on Ethereum.",
          'nft': "NFTs (Non-Fungible Tokens) are unique digital assets that represent ownership of specific items like digital art, collectibles, or virtual real estate. Unlike cryptocurrencies, each NFT has distinct value and cannot be exchanged on a 1:1 basis.",
          'web3': "Web3 refers to the next generation of the internet built on decentralized protocols like blockchain. It aims to shift control from centralized platforms to users, enabling ownership of digital assets and data through cryptocurrencies, NFTs, and DAOs.",
          'dao': "DAOs (Decentralized Autonomous Organizations) are community-governed entities with decision-making distributed among members using blockchain technology. They use smart contracts to enforce rules and often utilize governance tokens for voting.",
          'staking': "Staking involves locking up cryptocurrency to support a blockchain network's operations and security through proof-of-stake consensus. Participants earn rewards for validating transactions and securing the network, similar to interest in traditional finance.",
          'mining': "Cryptocurrency mining is the process of validating transactions and adding them to the blockchain by solving complex mathematical problems. Miners are rewarded with new coins and transaction fees for their computational work.",
          'metaverse': "The metaverse refers to interconnected virtual worlds where users can interact, own digital assets, and participate in social and economic activities. Blockchain technology enables true ownership of virtual land, items, and identities within these digital realms."
        };
        
        response = fallbackResponses[topicName];
      }
      
      // Add a small delay (1-2 seconds) even for fallback responses
      if (response) {
        bot.sendChatAction(chatId, 'typing');
        await delay(1000 + Math.random() * 1000);
      }
    }
    
    // If we have a response, send it
    if (response) {
      await saveMessage(chatId, msg.from.id, text); // Save command to Supabase
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
      return true;
    }
    
    // If topic not found in our predefined responses or OpenAI info, try to generate with OpenAI
    if (openai) {
      try {
        // Add typing indicator and delay for this more complex generation
        bot.sendChatAction(chatId, 'typing');
        await delay(3000 + Math.random() * 2000);
        
        const analysisResult = await analyzeWithOpenAI(topicName, [], false);
        
        if (analysisResult && analysisResult.topic) {
          const generatedResponse = await generateResponse(`Tell me about ${topicName}`, analysisResult);
          
          if (generatedResponse) {
            await bot.sendMessage(chatId, generatedResponse, { parse_mode: 'Markdown' });
            return true;
          }
        }
      } catch (error) {
        console.error('Error generating response for topic command:', error);
        
        // If still no response, return a generic message with a small delay
        bot.sendChatAction(chatId, 'typing');
        await delay(1000 + Math.random() * 500);
        
        await bot.sendMessage(chatId, `I don't have specific information about "${topicName}" at the moment. Try asking about Bitcoin, Ethereum, DeFi, NFTs, or other popular crypto topics.`, { parse_mode: 'Markdown' });
        return true;
      }
    }
    
    return false; // Command not handled
  } catch (error) {
    console.error('Error handling topic command:', error);
    return false;
  }
}

/**
 * Generate a conversation starter about a crypto topic
 * @param {string} topic - The crypto topic to discuss
 * @returns {Promise<string>} - The generated conversation starter
 */
async function generateCryptoConversationStarter(topic) {
  try {
    if (!openai) {
      // Fallback to predefined conversation starters
      const starters = {
        'Bitcoin': 'Have you all been following Bitcoin\'s price action lately? Any thoughts on where it might be headed?',
        'Ethereum': 'Curious about Ethereum\'s development progress? What do you think about its upcoming updates?',
        'DeFi': 'Anyone here using any DeFi protocols? Which ones do you find most promising?',
        'NFTs': 'NFT market has been evolving a lot. Has anyone been collecting or creating NFTs lately?',
        'Web3': 'How do you all see Web3 evolving in the next few years? Any particular use cases you\'re excited about?'
      };
      
      return starters[topic] || `What are your thoughts on ${topic} these days? Anything interesting happening there?`;
    }
    
    // Use OpenAI to generate a more personalized conversation starter
    const prompt = `
      Generate a natural, friendly conversation starter about ${topic} for a group chat.
      
      The message should:
      - Be conversational and casual (like something a real person would say)
      - Include a question to encourage responses
      - Be brief (1-2 sentences)
      - Sound genuinely curious and not salesy or promotional
      - Not include phrases like "I'm curious" or "I've been thinking"
      - Not announce that you're changing the subject
      
      Just write the conversation starter directly without any explanations or preamble.
    `;
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates natural-sounding conversation starters for group chats.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating conversation starter with OpenAI:', error);
      // Fallback to predefined starters if OpenAI fails
      const starters = {
        'Bitcoin': 'Have you all been following Bitcoin\'s price action lately? Any thoughts on where it might be headed?',
        'Ethereum': 'Curious about Ethereum\'s development progress? What do you think about its upcoming updates?',
        'DeFi': 'Anyone here using any DeFi protocols? Which ones do you find most promising?',
        'NFTs': 'NFT market has been evolving a lot. Has anyone been collecting or creating NFTs lately?',
        'Web3': 'How do you all see Web3 evolving in the next few years? Any particular use cases you\'re excited about?'
      };
      
      return starters[topic] || `What are your thoughts on ${topic} these days? Anything interesting happening there?`;
    }
  } catch (error) {
    console.error('Error in generateCryptoConversationStarter:', error);
    return `What are your thoughts on ${topic} these days? Anything interesting happening there?`;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
