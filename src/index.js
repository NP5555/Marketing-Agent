const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { saveMessage, getRecentMessages } = require('./db/storage');
const { ConversationState } = require('./conversationState');
const { 
  analyzeWithOpenAI, 
  generateResponse, 
  getContextualCommunityResponse,
  getTopicResponse,
  customizeResponse
} = require('./openai');
require('dotenv').config();

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Initialize Express
const app = express();
app.use(express.json());

// Initialize Supabase with validation
let supabase = null;
global.supabaseEnabled = true;

try {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Supabase configuration missing. Please check your .env file.');
  }
  
  // Validate URL format
  new URL(process.env.SUPABASE_URL);
  
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  console.log('Starting with in-memory fallback storage');
  global.supabaseEnabled = false;
  // Initialize in-memory storage as fallback
  global.memoryStorage = {
    messages: [],
    states: new Map(),
    responses: new Map()
  };
}

// Initialize Telegram Bot with polling
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
  onlyFirstMatch: true // Only process first matching command
});

// Handle polling errors
bot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.message.includes('terminated by other getUpdates request')) {
    console.log('Another bot instance is running. This is expected during development with nodemon.');
    return;
  }
  console.error('Polling error:', error);
});

console.log('Bot starting in polling mode...');

// Group chat tracking for conversation context
const groupChatTracker = {
  groups: new Map(),
  trackMention(chatId, topic) {
    if (!this.groups.has(chatId)) {
      this.groups.set(chatId, {
        lastMention: Date.now(),
        messageCount: 1,
        topicCount: {},
        sentiment: 'neutral',
      });
    }
    const groupData = this.groups.get(chatId);
    groupData.lastMention = Date.now();
    groupData.messageCount += 1;
    if (topic) {
      groupData.topicCount[topic] = (groupData.topicCount[topic] || 0) + 1;
    }
  },
  isActiveDiscussion(chatId) {
    if (!this.groups.has(chatId)) return false;
    const groupData = this.groups.get(chatId);
    const timeSinceLastMention = Date.now() - groupData.lastMention;
    return timeSinceLastMention < 5 * 60 * 1000 && groupData.messageCount >= 3;
  },
  getTopTopics(chatId, limit = 3) {
    if (!this.groups.has(chatId)) return [];
    const groupData = this.groups.get(chatId);
    return Object.entries(groupData.topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  },
};

// Simulate human-like typing with more natural variations
async function simulateHumanTyping(bot, chatId, messageLength) {
  // Base typing speed: 200-300 characters per minute (varies by person)
  const typingSpeedCharsPerMinute = 200 + Math.random() * 100;
  const millisecondsPerChar = (60 * 1000) / typingSpeedCharsPerMinute;
  
  // Calculate total typing time based on message length
  let typingTime = messageLength * millisecondsPerChar;
  
  // Add natural pauses
  const numberOfPauses = Math.floor(messageLength / 30); // Pause every ~30 chars
  const pauseDuration = numberOfPauses * (300 + Math.random() * 700); // 300-1000ms pauses
  
  // Add initial reaction time (people don't start typing immediately)
  const reactionTime = 500 + Math.random() * 1000; // 500-1500ms reaction time
  
  // Total delay including typing, pauses, and reaction
  const totalDelay = Math.min(typingTime + pauseDuration + reactionTime, 8000); // Cap at 8 seconds
  
  // Break into chunks of max 4 seconds (Telegram's typing indicator limit)
  const chunks = Math.ceil(totalDelay / 4000);
  for (let i = 0; i < chunks; i++) {
    await bot.sendChatAction(chatId, 'typing');
    // For last chunk, use remaining time, otherwise use full 4 seconds
    const chunkDuration = i === chunks - 1 ? 
      totalDelay - (i * 4000) : 
      4000;
    await new Promise(resolve => setTimeout(resolve, chunkDuration));
  }
}

// Fetch dynamic content from Supabase
async function fetchContent(type) {
  const { data, error } = await supabase.from(type).select('*').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }
  return data;
}

// Fetch custom bot responses from Supabase
async function fetchBotResponses() {
  const { data, error } = await supabase.from('bot_responses').select('*');
  if (error) {
    console.error('Error fetching bot responses:', error);
    return {};
  }
  const responses = {};
  data.forEach(({ trigger, response }) => {
    responses[trigger.toLowerCase()] = response;
  });
  return responses;
}

// Handle incoming messages
bot.on('message', async (msg) => {
  try {
    if (!msg.text) return; // Ignore non-text messages
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    const userName = msg.from.first_name || 'friend';
    
    console.log(`Message from ${userName} (${userId}) in chat ${chatId}: ${text}`);

    // Save message to storage
    await saveMessage(chatId, userId, text);

    // Get conversation state and recent messages
    const state = ConversationState.getState(chatId);
    const recentMessages = await getRecentMessages(chatId, 5);

    // Analyze message with OpenAI
    const analysis = await analyzeWithOpenAI(text, recentMessages, chatId);
    if (!analysis) {
      console.warn('Message analysis failed, using fallback');
    }

    // Simulate typing before responding
    await simulateHumanTyping(bot, chatId, text.length);

    // Generate response using enhanced conversation state
    let response;
    
    // Handle explicit community interest
    if (text.toLowerCase() === 'yes' && state.context.lastResponseType === 'community_invite') {
      response = await getContextualCommunityResponse(chatId);
    } else {
      // Generate normal response
      response = await generateResponse(text, analysis, chatId, userName);
    }

    // If response generation failed, use simple fallback
    if (!response) {
      response = `Hey ${userName}, I'm here to help! What would you like to know about our platform? 😊`;
    }

    // Send response with appropriate delay
    await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

    // Handle follow-up based on analysis
    if (analysis?.followUp?.needed && Math.random() < 0.7) { // 70% chance for follow-up
      await new Promise(resolve => setTimeout(resolve, 2000));
      await simulateHumanTyping(bot, chatId, 50);
      
      const followUp = analysis.followUp.suggestion || 
        `What aspects of ${analysis.topic || 'our platform'} interest you most? 🤔`;
      
      await bot.sendMessage(chatId, followUp);
    }

  } catch (error) {
    console.error('Error handling message:', error);
    try {
      await bot.sendMessage(msg.chat.id, 
        "I'm having trouble processing that right now. Could you try again in a moment? 😅");
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'friend';

    // Initialize conversation state
    ConversationState.updateState(chatId, {
      context: { lastResponseType: 'greeting' },
      userPreferences: { engagementLevel: 'new' }
    });

    const messages = [
      `Hey ${userName}! 👋 Welcome to our crypto platform!`,
      `I'm here to help you explore the exciting world of cryptocurrency and blockchain technology. 🌟`,
      `What interests you most? Trading, DeFi, NFTs, or something else? Let me know! 😊`
    ];

    for (const message of messages) {
      await simulateHumanTyping(bot, chatId, message.length);
      await bot.sendMessage(chatId, message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error handling start command:', error);
  }
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'friend';
    
    await simulateHumanTyping(bot, chatId, 100);
    await bot.sendMessage(chatId, 
      `Hi ${userName}! 👋 Here's how I can help:\n\n` +
      `• Ask me about any crypto topic 📚\n` +
      `• Get market insights and analysis 📊\n` +
      `• Learn about our platform features 🛠\n` +
      `• Join our community discussions 👥\n\n` +
      `What would you like to explore first? 😊`
    );
  } catch (error) {
    console.error('Error handling help command:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});