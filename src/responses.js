/**
 * Pattern-based responses based on user messages
 */
const patternResponses = {
  // Greeting patterns
  'hi': "Hey there! 👋 How's your day going? Have you tried Gramx yet? It's an awesome game!",
  'hello': "Hello! 😊 Always great to meet new friends! Speaking of fun, have you checked out Gramx?",
  'hey': "Hey! 👋 What's up? I've been having a blast playing Gramx lately!",
  
  // Game-related patterns
  'game': "Oh, you're interested in games? 🎮 You should definitely try Gramx! It's super engaging and fun. Want to know more about it?",
  'play': "Looking for something fun to play? 🎯 Gramx is exactly what you need! It's got amazing gameplay and rewards. Want me to tell you more?",
  'gramx': "Ah, Gramx! 🌟 It's such an incredible game! The gameplay is super engaging and the community is amazing. What would you like to know about it?",
  'boring': "Feeling bored? 😴 Let me introduce you to Gramx - it's impossible to be bored when you're playing it! Want to give it a try?",
  
  // Question patterns
  'what is': "Great question! 🤔 I'd love to tell you all about it. Are you asking about Gramx specifically, or would you like to know more?",
  'how to': "I'd be happy to help! 💡 If you're asking about Gramx, I can guide you through getting started. What specifically would you like to know?",
  
  // Interest patterns
  'interested': "That's awesome that you're interested! 🎉 Gramx is definitely worth checking out. Would you like me to explain how to get started?",
  'tell me more': "I'd love to tell you more! 🌟 Gramx is this amazing game where [brief exciting description]. What aspect interests you most?",
  
  // Community patterns
  'community': "Our community is incredible! �� You can join us on:\n" +
  "• Forum: https://community.gramx.io/forum\n" +
  "• Discord: https://discord.gg/gramx\n" +
  "• Twitter: https://twitter.com/gramx\n" +
  "• Reddit: https://reddit.com/r/gramx\n\n" +
  "Which platform would you prefer? I can help you get started! 😊",
  'friends': "Games are always better with friends! 🤝 In Gramx, you can team up with others and have amazing adventures together. Want to join our community?",
  
  // Help patterns
  'help': "I'm here to help! 🤗 Whether you're new to Gramx or an experienced player, I can guide you through anything you need. What can I assist you with?",
  'support': "Need assistance? 🆘 I'm here to help! Whether it's about getting started with Gramx or advanced strategies, just let me know what you need!",
  
  // Feedback patterns
  'like': "That's great to hear! 💖 If you enjoy [what they mentioned], you'll absolutely love Gramx! Want to give it a try?",
  'dont like': "I understand! Everyone has different tastes. 🎯 But I think you might really enjoy Gramx - it's got something for everyone! Want to know more?",
  
  // Default responses for unmatched patterns
  'default': "Hey! 👋 While we're chatting, have you heard about Gramx? It's this amazing game that I think you'd really enjoy!"
};

/**
 * Topic-specific dashboard and resource links
 */
const topicLinks = {
  'ethereum': { 
    topic: 'Ethereum', 
    link: 'https://gram.io/dashboard/ethereum',
    description: 'Ethereum is a leading blockchain platform that enables smart contracts and decentralized applications.'
  },
  'bitcoin': { 
    topic: 'Bitcoin', 
    link: 'https://gram.io/dashboard/bitcoin',
    description: 'Bitcoin is the first and most valuable cryptocurrency, created in 2009 by Satoshi Nakamoto.'
  },
  'crypto': { 
    topic: 'Cryptocurrency', 
    link: 'https://gram.io/dashboard/crypto',
    description: 'Explore the world of cryptocurrencies with real-time data, trends, and analysis.'
  },
  'services': { 
    topic: 'Our Services', 
    link: 'https://gram.io/services',
    description: 'We offer a range of services including portfolio tracking, market alerts, and personalized insights.'
  },
  'dashboard': { 
    topic: 'Dashboard', 
    link: 'https://gram.io/dashboard',
    description: 'Access your personalized dashboard with real-time data visualization and analytics.'
  },
  'analysis': { 
    topic: 'Market Analysis', 
    link: 'https://gram.io/dashboard/analysis',
    description: 'Get in-depth analysis of market trends, token performance, and investment opportunities.'
  },
  'markets': { 
    topic: 'Markets', 
    link: 'https://gram.io/dashboard/markets',
    description: 'Stay updated with real-time market data, exchange rates, and trading volumes.'
  },
  'trends': { 
    topic: 'Trends', 
    link: 'https://gram.io/dashboard/trends',
    description: 'Discover emerging trends, rising tokens, and market sentiment indicators.'
  },
  'portfolio': { 
    topic: 'Portfolio', 
    link: 'https://gram.io/dashboard/portfolio',
    description: 'Track and optimize your crypto portfolio with our advanced management tools.'
  },
  'pricing': { 
    topic: 'Pricing', 
    link: 'https://gram.io/pricing',
    description: 'We offer flexible plans starting at $10/month with a 14-day free trial on all tiers.'
  },
  'features': { 
    topic: 'Features', 
    link: 'https://gram.io/features',
    description: 'Our platform includes real-time analytics, portfolio tracking, market alerts, and much more.'
  },
  'defi': {
    topic: 'DeFi',
    link: 'https://gram.io/dashboard/defi',
    description: 'Decentralized Finance (DeFi) offers financial instruments without relying on intermediaries like banks. Explore protocols, yields, and liquidity pools.'
  },
  'nft': {
    topic: 'NFTs',
    link: 'https://gram.io/dashboard/nft',
    description: 'Non-Fungible Tokens (NFTs) represent ownership of unique digital items. Discover collections, marketplaces, and trading volumes.'
  },
  'solana': {
    topic: 'Solana',
    link: 'https://gram.io/dashboard/solana',
    description: 'Solana is a high-performance blockchain supporting fast, low-cost transactions with its proof-of-history consensus mechanism.'
  },
  'cardano': {
    topic: 'Cardano',
    link: 'https://gram.io/dashboard/cardano',
    description: 'Cardano is a proof-of-stake blockchain platform focused on sustainability, scalability, and transparency through peer-reviewed research.'
  },
  'xrp': {
    topic: 'XRP (Ripple)',
    link: 'https://gram.io/dashboard/xrp',
    description: 'XRP is designed for payments and facilitates fast, low-cost international money transfers through the RippleNet network.'
  },
  'stablecoin': {
    topic: 'Stablecoins',
    link: 'https://gram.io/dashboard/stablecoins',
    description: 'Stablecoins are cryptocurrencies designed to maintain stable value, usually pegged to fiat currencies like USD (USDT, USDC) or using algorithmic mechanisms.'
  },
  'mining': {
    topic: 'Crypto Mining',
    link: 'https://gram.io/dashboard/mining',
    description: 'Cryptocurrency mining validates transactions and adds them to the blockchain through solving complex calculations, with miners rewarded with new coins.'
  },
  'staking': {
    topic: 'Staking',
    link: 'https://gram.io/dashboard/staking',
    description: 'Staking involves holding cryptocurrency in a wallet to support network operations and earn rewards, offering a more energy-efficient alternative to mining.'
  },
  'web3': {
    topic: 'Web3',
    link: 'https://gram.io/dashboard/web3',
    description: 'Web3 refers to a decentralized internet built on blockchain technology, giving users control over their data and digital assets through tokenization.'
  },
  'dao': {
    topic: 'DAOs',
    link: 'https://gram.io/dashboard/daos',
    description: 'Decentralized Autonomous Organizations (DAOs) are community-governed entities with decision-making distributed among members using smart contracts.'
  },
  'layer2': {
    topic: 'Layer 2 Solutions',
    link: 'https://gram.io/dashboard/layer2',
    description: 'Layer 2 solutions are built on top of existing blockchains to improve scalability and reduce transaction costs through optimistic rollups, zk-rollups, and sidechains.'
  },
  'metaverse': {
    topic: 'Metaverse',
    link: 'https://gram.io/dashboard/metaverse',
    description: 'The Metaverse represents virtual worlds where users can interact with digital environments and each other, often incorporating blockchain for digital ownership.'
  },
  'trading': {
    topic: 'Crypto Trading',
    link: 'https://gram.io/dashboard/trading',
    description: 'Cryptocurrency trading involves buying and selling digital assets on exchanges. Explore strategies, tools, and market indicators.'
  }
};

// Add conversation state tracking
const conversationState = new Map();

// Enhanced conversation state interface
const ConversationState = {
  createState() {
    return {
      lastTopic: null,
      topics: new Set(), // All topics discussed
      hasSharedCommunity: false,
      lastMessageTimestamp: Date.now(),
      messageCount: 0,
      userPreferences: {
        interests: new Set(),
        knownTopics: new Set(),
        responseStyle: 'neutral',
        engagementLevel: 'new' // new, interested, engaged, member
      },
      context: {
        lastQuestion: null,
        pendingFollowUp: null,
        unansweredQueries: [],
        lastResponseType: null
      },
      metrics: {
        topicFrequency: {},
        positiveResponses: 0,
        negativeResponses: 0,
        questionsAsked: 0
      }
    };
  },

  /**
   * Update conversation state with new information
   * @param {number} chatId - The chat ID
   * @param {Object} update - The update object containing new information
   */
  updateState(chatId, update) {
    const state = this.getState(chatId);
    const newState = {
      ...state,
      lastMessageTimestamp: Date.now(),
      messageCount: state.messageCount + 1
    };

    // Update topics
    if (update.topic) {
      newState.lastTopic = update.topic;
      newState.topics.add(update.topic);
      newState.metrics.topicFrequency[update.topic] = 
        (newState.metrics.topicFrequency[update.topic] || 0) + 1;
    }

    // Update user preferences
    if (update.interests) {
      update.interests.forEach(interest => 
        newState.userPreferences.interests.add(interest));
    }

    // Update context
    if (update.context) {
      newState.context = {
        ...newState.context,
        ...update.context
      };
    }

    // Update metrics
    if (update.sentiment) {
      if (update.sentiment === 'positive') newState.metrics.positiveResponses++;
      if (update.sentiment === 'negative') newState.metrics.negativeResponses++;
    }

    if (update.isQuestion) {
      newState.metrics.questionsAsked++;
      newState.context.lastQuestion = update.question;
    }

    // Update engagement level based on interaction patterns
    this.updateEngagementLevel(newState);

    conversationState.set(chatId, newState);
    return newState;
  },

  /**
   * Get conversation state for a chat
   * @param {number} chatId - The chat ID
   * @returns {Object} The conversation state
   */
  getState(chatId) {
    if (!conversationState.has(chatId)) {
      conversationState.set(chatId, this.createState());
    }
    return conversationState.get(chatId);
  },

  /**
   * Update user engagement level based on interaction patterns
   * @param {Object} state - The current conversation state
   */
  updateEngagementLevel(state) {
    const { messageCount, metrics, topics } = state;
    const { positiveResponses, questionsAsked } = metrics;
    
    if (messageCount > 20 && positiveResponses > 5 && topics.size > 3) {
      state.userPreferences.engagementLevel = 'engaged';
    } else if (messageCount > 10 && positiveResponses > 2) {
      state.userPreferences.engagementLevel = 'interested';
    } else if (messageCount > 5) {
      state.userPreferences.engagementLevel = 'active';
    }
  },

  /**
   * Check if a topic has been recently discussed
   * @param {number} chatId - The chat ID
   * @param {string} topic - The topic to check
   * @returns {boolean} Whether the topic was recently discussed
   */
  wasRecentlyDiscussed(chatId, topic) {
    const state = this.getState(chatId);
    const topicFrequency = state.metrics.topicFrequency[topic] || 0;
    const timeSinceLastMessage = Date.now() - state.lastMessageTimestamp;
    
    // Consider a topic "recent" if discussed in last 5 minutes and mentioned less than 3 times
    return timeSinceLastMessage < 5 * 60 * 1000 && topicFrequency < 3;
  },

  /**
   * Get pending follow-ups or unanswered queries
   * @param {number} chatId - The chat ID
   * @returns {Object} Pending interactions that need attention
   */
  getPendingInteractions(chatId) {
    const state = this.getState(chatId);
    return {
      followUp: state.context.pendingFollowUp,
      unansweredQueries: state.context.unansweredQueries,
      lastQuestion: state.context.lastQuestion
    };
  }
};

// Community links configuration
const communityLinks = {
  forum: "https://community.gramx.io/forum",
  discord: "https://discord.gg/gramx",
  twitter: "https://twitter.com/gramx",
  reddit: "https://reddit.com/r/gramx"
};

/**
 * Get a response based on matching patterns in the text
 * @param {string} text - The text to check for patterns
 * @returns {string|null} - The matching response or null if no match
 */
function getPatternResponse(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // Check for exact matches first (prioritize longer phrases)
  const keys = Object.keys(patternResponses).sort((a, b) => b.length - a.length);
  
  for (const trigger of keys) {
    if (lowerText.includes(trigger.toLowerCase())) {
      // Add some randomization to responses to seem more natural
      const responses = patternResponses[trigger].split('|');
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // If no match found, return a random default response
  const defaultResponses = patternResponses['default'].split('|');
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

/**
 * Get information for a detected topic
 * @param {string} topic - The detected topic
 * @returns {Object|null} - Topic information or null if not found
 */
function getLinkForTopic(topic) {
  if (!topic) return null;
  
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, info] of Object.entries(topicLinks)) {
    if (lowerTopic.includes(key)) {
      return info;
    }
  }
  
  return { topic: 'general', link: 'https://gram.io', description: 'Visit our website for more information about our services.' };
}

/**
 * Generate a rich response for a specific topic
 * @param {string} topic - The topic to generate a response for
 * @returns {string} - A formatted response about the topic
 */
function getTopicResponse(topic) {
  const info = getLinkForTopic(topic);
  if (!info) return null;
  
  return `📊 *${info.topic}*\n\n${info.description}\n\nLearn more: ${info.link}`;
}

/**
 * Generate a contextual community response based on conversation state
 * @param {number} chatId - The chat ID
 * @returns {string} A contextual community response
 */
function getContextualCommunityResponse(chatId) {
  const state = ConversationState.getState(chatId);
  
  if (state.hasSharedCommunity) {
    return "I see you're interested in our community! Have you had a chance to check out any of the links I shared? I'd be happy to tell you more about what makes each platform special! 😊";
  }
  
  ConversationState.updateState(chatId, { hasSharedCommunity: true });
  return patternResponses.community;
}

// Update exports
module.exports = {
  getPatternResponse,
  getLinkForTopic,
  getTopicResponse,
  patternResponses,
  topicLinks,
  getContextualCommunityResponse,
  ConversationState, // Export the enhanced conversation state manager
  communityLinks
}; 