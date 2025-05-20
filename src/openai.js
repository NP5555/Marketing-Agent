const { OpenAI } = require('openai');
const config = require('./config');

let openai = null;

// Initialize OpenAI API if key is provided
if (config.openaiApiKey && config.openaiApiKey !== 'your-openai-api-key') {
  openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });
  console.log('OpenAI API initialized successfully');
} else {
  console.warn('OpenAI API key not provided or is using placeholder value. OpenAI features will be disabled.');
}

/**
 * Analyze a message using OpenAI API to identify topics and intent
 * @param {string} message - The message to analyze
 * @param {Array} context - Recent messages for context
 * @param {boolean} isGroupChat - Whether the message is from a group chat
 * @returns {Promise<Object|null>} - A promise that resolves to the analysis result or null
 */
async function analyzeWithOpenAI(message, context = [], isGroupChat = false) {
  try {
    if (!openai) {
      console.warn('OpenAI model not initialized, skipping analysis');
      return null;
    }
    
    // Extract just the message text from context objects
    const contextMessages = context
      .map(item => item.message || item)
      .join('\n');
    
    const prompt = `
      You are an AI assistant for a crypto and blockchain information service.
      
      ${isGroupChat ? 'This message is from a group chat. Be attentive to any crypto or blockchain related topics, even if they\'re not direct questions. Monitor the conversation for opportunities to provide value about crypto topics.' : ''}
      
      Analyze the following message to:
      1. Identify if it's a question or mention about cryptocurrencies, blockchain, or crypto-related topics
      2. Determine the main topic (e.g., Ethereum, Bitcoin, DeFi, NFTs, crypto markets)
      3. Extract key entities, specific questions, or areas where you can provide value
      
      Common topics to look for: 
      - Cryptocurrencies: Bitcoin, Ethereum, Solana, Cardano, XRP, stablecoins, altcoins, memecoins
      - Blockchain technology: smart contracts, consensus mechanisms, layer 2 solutions, scaling
      - Trading & Investment: market trends, price predictions, trading strategies, portfolio management
      - DeFi & Web3: lending, borrowing, yield farming, DAOs, dApps, staking, governance
      - NFTs: collections, marketplaces, minting, royalties
      - Regulation & Adoption: government policies, institutional adoption, retail usage
      - Crypto Prices: current prices, price predictions, market movements, trading volumes
      - Technical Analysis: chart patterns, indicators, trading signals
      - Project Updates: protocol upgrades, new features, token launches, airdrops
      
      Return a JSON object with this structure:
      {
        "isQuestion": true/false,
        "topic": "specific topic name or null",
        "entities": ["entity1", "entity2"],
        "intent": "question", "information_seeking", "debate", "opinion", "price_inquiry", etc.,
        "relevance": 0-10 (how relevant to crypto/blockchain, with 10 being highly relevant),
        "requestType": "price", "explanation", "comparison", "news", "prediction", "general", etc.
      }
      
      Previous context:
      ${contextMessages}
      
      Current message:
      ${message}
      
      JSON response:
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a cryptocurrency and blockchain analysis system. You analyze messages to identify crypto-related topics and user intents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const text = response.choices[0].message.content.trim();
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Error parsing OpenAI JSON response:', e);
      return null;
    }
  } catch (error) {
    console.error('Error analyzing message with OpenAI:', error);
    return null;
  }
}

/**
 * Generate a response to a user query using OpenAI
 * @param {string} message - The user's message
 * @param {Object} analysis - The analysis of the message
 * @returns {Promise<string|null>} - A promise that resolves to the generated response
 */
async function generateResponse(message, analysis) {
  try {
    if (!openai) {
      console.warn('OpenAI model not initialized, skipping response generation');
      return null;
    }
    
    // Set up specific handling based on request type if available
    let additionalGuidelines = '';
    
    if (analysis && analysis.requestType) {
      switch (analysis.requestType) {
        case 'price':
          additionalGuidelines = `
            - Provide real-time price information based on your most recent knowledge
            - For current prices, include approximate values with a disclaimer about potential fluctuations
            - Mention recent price movements if relevant
            - Offer insights about market factors affecting the price
          `;
          break;
        case 'explanation':
          additionalGuidelines = `
            - Provide clear, concise explanations of crypto concepts
            - Use analogies to explain complex technical concepts
            - Break down explanations into digestible parts
            - Acknowledge different perspectives on controversial topics
          `;
          break;
        case 'comparison':
          additionalGuidelines = `
            - Compare projects based on technology, use cases, and market position
            - Be fair and balanced in your comparisons
            - Highlight key differentiators between projects
            - Include recent developments that might impact the comparison
          `;
          break;
        case 'news':
          additionalGuidelines = `
            - Provide the most current information available to you
            - Focus on explaining the context and implications of recent developments
            - Specify the timeframe of your information (e.g., "As of my last update...")
          `;
          break;
        case 'prediction':
          additionalGuidelines = `
            - Acknowledge that cryptocurrency markets are highly volatile
            - Discuss factors that could influence future developments
            - Present balanced perspectives on potential outcomes
            - Base any predictions on current trends and analytical frameworks
          `;
          break;
      }
    }
    
    const prompt = `
      Respond to the following user message in a friendly, helpful, and informative tone. If this is a group chat, make your response valuable to multiple participants.
      
      User message: "${message}"
      
      Message analysis: ${JSON.stringify(analysis)}
      
      Guidelines:
      - Be concise but informative (3-5 sentences is ideal)
      - Include up-to-date information about cryptocurrencies and blockchain based on your knowledge
      - For pricing questions, provide your most recent information while acknowledging potential changes
      - For technical questions, provide accurate explanations without oversimplifying
      - When appropriate, explain both pros and cons or different perspectives
      - For price-related questions, note that crypto markets are volatile 
      - If asked about a specific crypto project, mention its key features, use cases, relative market position, and recent developments
      ${additionalGuidelines}
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable assistant for a crypto and blockchain information service with access to the latest information. You provide helpful, accurate and up-to-date information about cryptocurrency and blockchain technology.'
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
    console.error('Error generating response with OpenAI:', error);
    return null;
  }
}

/**
 * Get current information about a specific cryptocurrency or market trend
 * @param {string} topic - The crypto topic to get information about
 * @returns {Promise<string|null>} - A promise that resolves to the generated information
 */
async function getCryptoInformation(topic) {
  try {
    if (!openai) {
      return null;
    }
    
    const prompt = `
      Provide up-to-date information about ${topic} for a user interested in crypto.
      
      Your response should:
      - Include current information and recent developments about ${topic}
      - Focus on providing factual information and context about ${topic}
      - Include key characteristics, use cases, or significance in the crypto ecosystem
      - Mention any notable recent developments, news, or trends related to this topic
      - Be concise (3-5 sentences is ideal)
      - Include approximate price information if relevant to the topic
      - Specify the timeframe of your information (e.g., "As of my last update...")
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a cryptocurrency and blockchain expert assistant with access to the latest information. Your responses are conversational, informative, and helpful for someone interested in crypto.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting crypto information with OpenAI:', error);
    return null;
  }
}

module.exports = { 
  analyzeWithOpenAI, 
  generateResponse, 
  getCryptoInformation,
  openai 
}; 