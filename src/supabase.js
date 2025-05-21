const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabase = null;
let supabaseEnabled = true;

// Initialize in-memory storage
if (!global.memoryStorage) {
  global.memoryStorage = {
    messages: [],
    states: new Map(),
    responses: new Map()
  };
}

/**
 * Initialize the Supabase client
 * @returns {Promise} A promise that resolves when initialization is complete
 */
async function initializeSupabase() {
  // Only initialize Supabase if credentials are provided
  if (config.supabaseUrl && config.supabaseKey) {
    try {
      supabase = createClient(config.supabaseUrl, config.supabaseKey);
      console.log('Supabase client initialized successfully');
      
      // Test table access to verify permissions
      const { error } = await supabase.from('chat_history').select('count');
      if (error) {
        console.error('Supabase permissions error:', error.message);
        console.log('Falling back to in-memory storage due to Supabase permissions issue');
        supabaseEnabled = false;
      } else {
        console.log('Supabase permissions verified successfully');
      }
    } catch (err) {
      console.error('Error testing Supabase connection:', err);
      supabaseEnabled = false;
    }
  } else {
    console.warn('Supabase credentials not provided. Using in-memory storage.');
    supabaseEnabled = false;
  }
  
  return { supabase, supabaseEnabled };
}

// Immediately call initializeSupabase if this module is directly required
if (config.supabaseUrl && config.supabaseKey) {
  initializeSupabase().catch(error => {
    console.error('Error during automatic Supabase initialization:', error);
    supabaseEnabled = false;
  });
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
    // Use in-memory storage if Supabase is disabled or has permission issues
    if (!supabase || !supabaseEnabled) {
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
      // If we get a permission error, disable Supabase for future operations
      if (error.code === '42501') {
        console.error('Supabase permissions error. Switching to in-memory storage:', error.message);
        supabaseEnabled = false;
      } else {
        console.error('Error saving message to Supabase:', error);
      }
      
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
    
    // Fallback to in-memory storage on exception
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
 * Get recent messages from storage (Supabase or in-memory fallback)
 * @param {number} chatId - The chat ID to get messages from
 * @param {number} limit - The maximum number of messages to retrieve
 * @returns {Promise<Array>} - A promise that resolves to an array of messages
 */
async function getRecentMessages(chatId, limit = 50) {
  try {
    // Use in-memory storage if Supabase is disabled or has permission issues
    if (!supabase || !supabaseEnabled) {
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
      // If we get a permission error, disable Supabase for future operations
      if (error.code === '42501') {
        console.error('Supabase permissions error. Switching to in-memory storage:', error.message);
        supabaseEnabled = false;
      } else {
        console.error('Error fetching messages from Supabase:', error);
      }
      
      // Fallback to in-memory storage
      return global.memoryStorage.messages
        .filter(msg => msg.chat_id === chatId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching messages:', error);
    
    // Fallback to in-memory storage on exception
    return global.memoryStorage.messages
      .filter(msg => msg.chat_id === chatId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

module.exports = { 
  saveMessage, 
  getRecentMessages,
  initializeSupabase
}; 