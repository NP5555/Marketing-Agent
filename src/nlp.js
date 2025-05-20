const { OpenAI } = require('openai');
const config = require('./config');

let openai = null;

// Only initialize OpenAI if API key is provided
if (config.openaiApiKey && config.openaiApiKey !== 'your-openai-api-key') {
  openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });
  console.log('OpenAI API initialized successfully');
} else {
  console.warn('OpenAI API key not provided or is using placeholder value. NLP features will be disabled.');
}

/**
 * Analyze a message to identify topics using OpenAI
 * @param {string} message - The message to analyze
 * @param {Array} context - Recent messages for context
 * @returns {Promise<string|null>} - A promise that resolves to the detected topic or null
 */
async function analyzeMessage(message, context) {
  try {
    // If OpenAI isn't initialized, use basic keyword detection
    if (!openai) {
      return basicTopicDetection(message);
    }
    
    // Extract just the message text from context objects
    const contextMessages = context.map(item => item.message || item).join('\n');
    
    const prompt = `
      Analyze the following message and its context to identify the main topic related to Gram (e.g., Ethereum, Gram services, crypto, dashboard).
      Return only the topic name or null if no relevant topic is found.
      
      Context from recent messages:
      ${contextMessages}
      
      Current message:
      ${message}
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You analyze messages to identify cryptocurrency and blockchain-related topics. Return only the topic name or "null" if no relevant topic is found.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });
    
    const result = response.choices[0].message.content.trim();
    return result === 'null' ? null : result;
  } catch (error) {
    console.error('Error analyzing message with OpenAI:', error);
    // Fallback to basic keyword detection
    return basicTopicDetection(message);
  }
}

/**
 * Basic topic detection using keywords when OpenAI is not available
 * @param {string} message - The message to analyze
 * @returns {string|null} - The detected topic or null
 */
function basicTopicDetection(message) {
  if (!message) return null;
  
  const lowerMessage = message.toLowerCase();
  const topics = {
    'ethereum': ['ethereum', 'eth', 'ether', 'ethreum', 'etherium', 'etherieum', 'vitalik', 'buterin', 'erc20', 'erc721', 'erc1155', 'gas fees', 'gwei'],
    'bitcoin': ['bitcoin', 'btc', 'satoshi', 'bitcion', 'bit coin', 'nakamoto', 'sats', 'digital gold', 'bitcoin halving', 'btc halving'],
    'crypto': ['crypto', 'cryptocurrency', 'token', 'blockchain', 'defi', 'nft', 'coin', 'digital currency', 'tokenomics', 'web3', 'tokenization'],
    'pricing': ['pricing', 'price', 'cost', 'charge', 'fee', 'subscription cost', 'how much', 'pay', 'payment'],
    'features': ['feature', 'capabilities', 'can do', 'functions', 'functionality'],
    'services': ['service', 'subscription', 'plan', 'offer'],
    'dashboard': ['dashboard', 'chart', 'graph', 'analytics', 'monitor', 'tracking'],
    'analysis': ['analysis', 'analyze', 'research', 'study', 'data'],
    'markets': ['market', 'exchange', 'trading', 'trader', 'buy', 'sell', 'volume', 'liquidity', 'order book', 'market cap', 'mcap'],
    'trends': ['trend', 'trending', 'popular', 'momentum', 'movement', 'bullish', 'bearish', 'bull run', 'bear market'],
    'portfolio': ['portfolio', 'investment', 'asset', 'holding', 'balance', 'diversification', 'allocation'],
    'defi': ['defi', 'decentralized finance', 'yield farming', 'liquidity mining', 'amm', 'dex', 'lending', 'borrowing', 'staking', 'yield', 'apy', 'tvl'],
    'nft': ['nft', 'non-fungible token', 'collectible', 'digital art', 'pfp', 'profile picture', 'mint', 'opensea', 'rarible', 'royalty'],
    'solana': ['solana', 'sol', 'solona', 'proof of history', 'phantom wallet'],
    'cardano': ['cardano', 'ada', 'hoskinson', 'charles hoskinson', 'ouroboros'],
    'xrp': ['xrp', 'ripple', 'ripplenet', 'xrpl'],
    'stablecoin': ['stablecoin', 'usdt', 'tether', 'usdc', 'dai', 'peg', 'pegged', 'depeg', 'fiat-backed'],
    'mining': ['mining', 'miner', 'asic', 'hashrate', 'hash rate', 'proof of work', 'pow'],
    'staking': ['staking', 'stake', 'validator', 'delegation', 'proof of stake', 'pos'],
    'web3': ['web3', 'web 3', 'web 3.0', 'decentralized web', 'decentralized internet', 'dapp', 'decentralized app'],
    'dao': ['dao', 'decentralized autonomous organization', 'governance', 'proposal', 'vote', 'token voting'],
    'layer2': ['layer 2', 'l2', 'scaling', 'rollup', 'optimistic rollup', 'zk rollup', 'sidechain', 'polygon', 'arbitrum', 'optimism'],
    'metaverse': ['metaverse', 'virtual world', 'virtual land', 'digital land', 'sandbox', 'decentraland', 'virtual reality', 'vr'],
    'trading': ['trading', 'trade', 'spot', 'futures', 'options', 'leverage', 'long', 'short', 'position', 'technical analysis', 'ta', 'chart pattern']
  };
  
  // First check for word boundaries to avoid false positives
  for (const [topic, keywords] of Object.entries(topics)) {
    for (const keyword of keywords) {
      // Check for word boundaries using regex
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        return topic;
      }
    }
  }
  
  // If no matches with word boundaries, check for substring matches
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return topic;
    }
  }
  
  return null;
}

module.exports = { analyzeMessage }; 