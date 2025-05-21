const { supabase } = require('../supabase');

// Initialize in-memory storage if not already initialized
if (!global.memoryStorage) {
  global.memoryStorage = {
    messages: [],
    states: new Map(),
    responses: new Map()
  };
}

/**
 * Save a message to storage (Supabase or in-memory fallback)
 * @param {number} chatId - The chat ID where the message was sent
 * @param {number} userId - The user ID who sent the message
 * @param {string} message - The message content
 * @returns {Promise} - A promise that resolves when the message is saved
 */
async function saveMessage(chatId, userId, message) {
  try {
    // Use in-memory storage if Supabase is disabled
    if (!supabase || !global.supabaseEnabled) {
      global.memoryStorage.messages.push({
        chat_id: chatId,
        user_id: userId,
        message,
        timestamp: new Date().toISOString()
      });
      return { data: null, error: null };
    }
    
    const { data, error } = await supabase.from('chat_history').insert({
      chat_id: chatId,
      user_id: userId,
      message,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error saving message to Supabase:', error);
      // Fallback to in-memory storage
      global.memoryStorage.messages.push({
        chat_id: chatId,
        user_id: userId,
        message,
        timestamp: new Date().toISOString()
      });
    }
    
    return { data, error };
  } catch (error) {
    console.error('Exception saving message:', error);
    // Fallback to in-memory storage
    global.memoryStorage.messages.push({
      chat_id: chatId,
      user_id: userId,
      message,
      timestamp: new Date().toISOString()
    });
    return { data: null, error };
  }
}

/**
 * Get recent messages from storage
 * @param {number} chatId - The chat ID to get messages from
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} - Array of messages
 */
async function getRecentMessages(chatId, limit = 50) {
  try {
    // Use in-memory storage if Supabase is disabled
    if (!supabase || !global.supabaseEnabled) {
      return global.memoryStorage.messages
        .filter(msg => msg.chat_id === chatId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
    
    const { data, error } = await supabase
      .from('chat_history')
      .select('message, user_id, timestamp')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching messages from Supabase:', error);
      // Fallback to in-memory storage
      return global.memoryStorage.messages
        .filter(msg => msg.chat_id === chatId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching messages:', error);
    // Fallback to in-memory storage
    return global.memoryStorage.messages
      .filter(msg => msg.chat_id === chatId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

module.exports = {
  saveMessage,
  getRecentMessages
}; 