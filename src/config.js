require('dotenv').config();

module.exports = {
  telegramToken: process.env.TELEGRAM_TOKEN,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: process.env.PORT || 3000,
  renderUrl: process.env.RENDER_URL || 'https://your-render-url',
}; 