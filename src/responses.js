/**
 * Pattern-based responses based on user messages
 */
const patternResponses = {
  'help': 'Need assistance? Check our FAQ: https://gram.io/faq',
  'pricing': 'Explore Gram pricing: https://gram.io/pricing. We offer flexible plans starting at $10/month with a 14-day free trial!',
  'feature': 'Discover Gram features: https://gram.io/features. Our platform includes real-time analytics, portfolio tracking, and market alerts.',
  'contact': 'Reach our support team: https://gram.io/contact',
  'tutorial': 'Watch our tutorials: https://gram.io/tutorials',
  'subscribe': 'Subscribe to our newsletter: https://gram.io/newsletter',
  'join': 'Join our community: https://gram.io/community',
  'what\'s the pricing': 'Our pricing plans start at $10/month for the Basic plan, $25/month for Pro, and $50/month for Enterprise. All plans come with a 14-day free trial. Check details at https://gram.io/pricing',
  'tell me about ethereum': 'Ethereum is a decentralized blockchain platform that enables smart contracts and decentralized applications (DApps). It\'s the second-largest cryptocurrency by market cap. Learn more at https://gram.io/dashboard/ethereum',
  'ethereum': 'Ethereum is a leading blockchain platform for smart contracts and DApps. View real-time Ethereum data and analysis at https://gram.io/dashboard/ethereum',
  'bitcoin': 'Bitcoin is the first and most valuable cryptocurrency, created in 2009 by Satoshi Nakamoto. Track Bitcoin prices and trends at https://gram.io/dashboard/bitcoin',
  'defi': 'Decentralized Finance (DeFi) offers financial instruments without relying on intermediaries like banks. Explore DeFi protocols and yields at https://gram.io/dashboard/defi',
  'nft': 'Non-Fungible Tokens (NFTs) are unique digital assets representing ownership of items. Discover trending NFT collections at https://gram.io/dashboard/nft',
  'solana': 'Solana is a high-performance blockchain supporting fast, low-cost transactions. It uses a proof-of-history consensus mechanism. Check Solana stats at https://gram.io/dashboard/solana',
  'cardano': 'Cardano is a proof-of-stake blockchain platform focused on sustainability, scalability, and transparency. View Cardano metrics at https://gram.io/dashboard/cardano',
  'ripple': 'Ripple (XRP) is designed for payments and facilitates fast, low-cost international money transfers. Monitor XRP performance at https://gram.io/dashboard/xrp',
  'stablecoin': 'Stablecoins are cryptocurrencies designed to maintain stable value, usually pegged to fiat currencies like USD. Track stablecoin markets at https://gram.io/dashboard/stablecoins',
  'mining': 'Cryptocurrency mining is the process of validating transactions and adding them to the blockchain through solving complex calculations. Learn about mining profitability at https://gram.io/dashboard/mining',
  'staking': 'Staking involves holding cryptocurrency in a wallet to support network operations and earn rewards. Compare staking yields at https://gram.io/dashboard/staking',
  'web3': 'Web3 refers to a decentralized internet built on blockchain technology, giving users control over their data and digital assets. Explore Web3 projects at https://gram.io/dashboard/web3',
  'dao': 'Decentralized Autonomous Organizations (DAOs) are community-governed entities with decision-making distributed among members. Discover top DAOs at https://gram.io/dashboard/daos',
  'layer 2': 'Layer 2 solutions are built on top of existing blockchains to improve scalability and reduce transaction costs. Compare Layer 2 networks at https://gram.io/dashboard/layer2'
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
      return patternResponses[trigger];
    }
  }

  // Check for partial matches for common topics
  if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
    return patternResponses['pricing'];
  }
  
  if (lowerText.includes('eth') && !lowerText.includes('ethereum')) {
    return patternResponses['ethereum'];
  }
  
  if (lowerText.includes('btc') && !lowerText.includes('bitcoin')) {
    return patternResponses['bitcoin'];
  }

  if (lowerText.includes('assist') || lowerText.includes('support') || lowerText.includes('how do i')) {
    return patternResponses['help'];
  }
  
  return null;
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

module.exports = { 
  getPatternResponse, 
  getLinkForTopic,
  getTopicResponse,
  patternResponses,
  topicLinks
}; 