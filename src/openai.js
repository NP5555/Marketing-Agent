const { OpenAI } = require('openai');
const config = require('./config');
const { ConversationState } = require('./conversationState');

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

// Helper functions
async function getContextualCommunityResponse(chatId) {
  const state = ConversationState.getState(chatId);
  const responses = [
    "Doing great! Been keeping up with all the latest market moves. What brings you to our community? 💡",
    "All good here! Just saw some exciting updates on our trading channels. Want to check them out? 🚀",
    "Pretty pumped about today's market! Have you seen our live trading insights? 📊",
    "Fantastic! Our community's been buzzing about the latest trends. What caught your eye? ✨",
    "Excited to chat! Our trading rooms are super active today. Want to join the discussion? 🌟"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

async function getTopicResponse(topic) {
  const responses = {
    trading: "Trading is exciting! We have real-time market data and expert analysis to help you make informed decisions. 📊",
    defi: "DeFi is revolutionizing finance! Our platform supports various DeFi protocols and yield farming strategies. 🌱",
    nft: "NFTs are transforming digital ownership! We have guides on minting, trading, and discovering unique NFTs. 🎨",
    default: "That's an interesting topic! Our platform has lots of resources to help you learn more. What specific aspects interest you? 🤔"
  };
  return responses[topic.toLowerCase()] || responses.default;
}

async function customizeResponse(response, userName, preferences) {
  let customized = response.replace('{user}', userName);
  
  // Adjust response style based on user preferences
  switch (preferences.responseStyle) {
    case 'technical':
      customized = customized.replace(/(!|\?)+/g, '.');
      break;
    case 'casual':
      customized = customized.replace(/\./g, '!');
      break;
  }
  
  return customized;
}

/**
 * Analyze a message using OpenAI API to identify topics and intent
 * @param {string} message - The message to analyze
 * @param {Array} context - Recent messages for context
 * @param {number} chatId - The chat ID for state tracking
 * @returns {Promise<Object|null>} - A promise that resolves to the analysis result or null
 */
async function analyzeWithOpenAI(message, context = [], chatId) {
  try {
    if (!openai) {
      console.warn('OpenAI model not initialized, skipping analysis');
      return null;
    }
    
    // Get conversation state for additional context
    const state = ConversationState.getState(chatId);
    
    // Extract just the message text from context objects
    const contextMessages = context
      .map(item => item.message || item)
      .join('\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a crypto and blockchain analysis system that helps understand user messages and engagement.'
        },
        {
          role: 'user',
          content: `
            Analyze the message and context to identify:
            1. Main topic/intent
            2. User sentiment and engagement
            3. Questions or information requests
            4. Potential follow-up points
            5. Community engagement opportunities

            Current conversation state:
            - User engagement level: ${state.userPreferences.engagementLevel}
            - Known interests: ${Array.from(state.userPreferences.interests).join(', ')}
            - Previous topics: ${Array.from(state.topics).join(', ')}
            - Last topic: ${state.lastTopic || 'none'}
            - Message count: ${state.messageCount}

            Recent conversation context:
            ${contextMessages}

            Current message to analyze:
            "${message}"

            Return a JSON object with:
            {
              "topic": string | null,
              "intent": "question" | "statement" | "feedback" | "greeting",
              "sentiment": "positive" | "negative" | "neutral",
              "engagement": {
                "level": "passive" | "curious" | "interested" | "enthusiastic",
                "type": "learning" | "discussing" | "contributing" | "seeking_help"
              },
              "interests": string[],
              "questions": {
                "asked": boolean,
                "type": "general" | "technical" | "community" | null,
                "topic": string | null
              },
              "followUp": {
                "needed": boolean,
                "type": string | null,
                "suggestion": string | null
              },
              "communityOpportunity": {
                "exists": boolean,
                "type": string | null,
                "approach": string | null
              }
            }
          `
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content.trim());
    
    // Update conversation state with new information
    ConversationState.updateState(chatId, {
      topic: analysis.topic,
      interests: analysis.interests,
      sentiment: analysis.sentiment,
      isQuestion: analysis.questions.asked,
      question: analysis.questions.asked ? {
        type: analysis.questions.type,
        topic: analysis.questions.topic
      } : null,
      context: {
        pendingFollowUp: analysis.followUp.needed ? {
          type: analysis.followUp.type,
          suggestion: analysis.followUp.suggestion
        } : null
      }
    });
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing message with OpenAI:', error);
    return {
      topic: null,
      intent: 'statement',
      sentiment: 'neutral',
      engagement: { level: 'passive', type: 'learning' },
      interests: [],
      questions: { asked: false, type: null, topic: null },
      followUp: { needed: false, type: null, suggestion: null },
      communityOpportunity: { exists: false, type: null, approach: null }
    };
  }
}

/**
 * Generate a response using OpenAI that considers conversation history and state
 * @param {string} message - The user's message
 * @param {Object} analysis - The message analysis
 * @param {number} chatId - The chat ID for state tracking
 * @param {string} userName - The user's name
 * @returns {Promise<string|null>} - A promise that resolves to the generated response
 */
async function generateResponse(message, analysis, chatId, userName) {
  try {
    if (!openai) {
      console.warn('OpenAI model not initialized, skipping response generation');
      return null;
    }
    
    const state = ConversationState.getState(chatId);
    const isFirstMessage = state.messageCount <= 1;
    
    // Handle casual greetings and small talk differently
    const casualPatterns = {
      greetings: /^(hi|hey|hello|howdy|hola|what'?s up|sup)/i,
      howAreYou: /how are you|how('?s| is) it going|how('?s| have) you been/i,
      thanks: /^(thanks|thank you|thx|ty)/i,
      bye: /^(bye|goodbye|see you|cya|later)/i
    };

    if (casualPatterns.howAreYou.test(message.toLowerCase())) {
      return getContextualCommunityResponse(chatId);
    }

    if (casualPatterns.greetings.test(message.toLowerCase())) {
      const greetings = [
        isFirstMessage ? 
          `Hey ${userName}! Ready to explore the exciting world of crypto? 👋` :
          "Welcome! What's catching your interest in crypto today? 👋",
        isFirstMessage ?
          `Hi ${userName}! You've come to the right place for crypto insights! 🌟` :
          "Perfect timing! Our community's discussing some hot market moves! 🌟",
        isFirstMessage ?
          `Hello ${userName}! Excited to have you join our crypto community! ✨` :
          "Great to see you! Want to check out today's top trading signals? ✨"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (casualPatterns.thanks.test(message.toLowerCase())) {
      const responses = [
        "Anytime! Our platform's got tons more insights to share. Want to see? 😊",
        "Glad to help! Check out our live trading room for more pro tips! 🌟",
        "That's what we're here for! Ready to dive deeper into our analysis? 💪"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (casualPatterns.bye.test(message.toLowerCase())) {
      const responses = [
        "Catch you later! Don't miss our daily market updates! 👋",
        "See you soon! Remember to check our signals channel! ✨",
        "Take care! Our community's here 24/7 when you need us! 🚀"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a conversational AI agent for a cryptocurrency community group, designed to assist users with a friendly, professional, and human-like tone. Your role is to provide accurate, concise, and relevant information about cryptocurrencies, blockchain technology, trading, and related topics, with a focus on Ethereum and other user-specified interests.

Behavioral Guidelines:
1. Communicate like a knowledgeable friend who is passionate about crypto, using a warm, approachable, and professional tone.
2. Avoid repetitive phrases (e.g., "Hey there," "What's up") and excessive emojis (limit to one per response, if appropriate).
3. Answer user questions directly and concisely, providing specific, actionable information or insights.
4. If a user expresses interest in a specific topic, provide a brief overview of developments, use cases, or trends.
5. Avoid asking multiple follow-up questions. Limit to one relevant, open-ended question that feels natural.
6. Offer tailored recommendations based on the user's stated interests or needs.
7. Seamlessly integrate information about our platform to highlight its benefits without being pushy.
8. Frame suggestions as helpful tips rather than sales pitches.
9. Maintain awareness of the conversation history to avoid repeating suggestions or questions.
10. Keep responses short (2-3 sentences) while providing valuable information.

Remember to stay on topic, avoid generic filler responses, and prioritize answering questions over asking counter-questions.`
        },
        {
          role: 'user',
          content: `
            Generate a short, engaging response that guides users to our platform features.
            
            User Message: "${message}"
            First Time User: ${isFirstMessage}
            Analysis: ${JSON.stringify(analysis, null, 2)}
            
            Current conversation state:
            - User engagement: ${state.userPreferences.engagementLevel}
            - Known interests: ${Array.from(state.userPreferences.interests).join(', ')}
            - Message count: ${state.messageCount}
            
            Guidelines:
            1. Keep it super short and casual
            2. Sound like a friendly trader
            3. Mention relevant platform features
            4. End with engaging question
            5. Use max 1 emoji
            6. If market-related, reference our tools
            7. For news/updates, mention our channels
          `
        }
      ],
      temperature: 0.7,
    });
    
    const generatedResponse = response.choices[0].message.content.trim();
    
    // Update conversation state
    ConversationState.updateState(chatId, {
      context: { lastResponseType: 'generated' }
    });
    
    return generatedResponse;
  } catch (error) {
    console.error('Error generating response with OpenAI:', error);
    return "What's catching your eye in the crypto world today? 👀";
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
          content: 'You are a cryptocurrency and blockchain expert providing accurate, up-to-date information about the crypto market. Your responses should be concise (3-5 sentences), informative, and focused on the specific topic. Avoid repetitive phrases and limit emoji use to one if appropriate. Provide factual information while maintaining a warm, knowledgeable tone. Include relevant developments, use cases, or trends. When applicable, naturally mention platform features that might help the user explore the topic further.'
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
  getContextualCommunityResponse,
  getTopicResponse,
  customizeResponse,
  getCryptoInformation,
  openai
}; 