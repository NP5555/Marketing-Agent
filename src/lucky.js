/**
 * List of fun responses for the "Lucky Feature"
 */
const luckyResponses = [
  "🚀 Fun fact: Gram's dashboard tracks over 1000 assets in real-time!",
  "💫 You're a Gram star! Here's a tip: Use keyboard shortcuts for faster navigation.",
  "📊 Did you know? Gram's community grew 50% in the last quarter!",
  "🏆 Achievement unlocked: You're among the top 10% of active Gram users!",
  "💎 Insider tip: Try our new dark mode for late-night analysis sessions.",
  "🌐 Gram trivia: Our platform processes over 1M data points every minute.",
  "🔍 Pro tip: You can customize your dashboard widgets for better insights.",
  "📱 Have you tried our mobile app? It's now 30% faster!",
  "⚡ Power user move: Set up alerts for price movements on your favorite assets.",
  "🎯 Goal setting tip: Track your portfolio performance against custom benchmarks."
];

/**
 * Check if a message should trigger the lucky feature
 * @param {string} message - The message to check
 * @returns {boolean} - Whether the message should trigger the lucky feature
 */
function shouldTriggerLuckyFeature(message) {
  if (!message) return false;
  
  // Check if message contains "gram" and has 10% chance of triggering
  const containsGram = message.toLowerCase().includes('gram');
  const randomChance = Math.random() < 0.1; // 10% chance
  
  return containsGram && randomChance;
}

/**
 * Get a random lucky response
 * @returns {string} - A random fun response
 */
function getLuckyResponse() {
  const randomIndex = Math.floor(Math.random() * luckyResponses.length);
  return luckyResponses[randomIndex];
}

module.exports = { shouldTriggerLuckyFeature, getLuckyResponse }; 