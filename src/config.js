require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_TOKEN', 'SUPABASE_URL', 'SUPABASE_KEY', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

module.exports = {
  telegramToken: process.env.TELEGRAM_TOKEN,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: process.env.PORT || 3000,
  renderUrl: process.env.RENDER_URL || 'https://your-render-url',
}; 