-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sentiment TEXT,
  topic TEXT,
  engagement_level TEXT
);

CREATE TABLE IF NOT EXISTS conversation_state (
  chat_id BIGINT PRIMARY KEY,
  last_topic TEXT,
  topics TEXT[],
  has_shared_community BOOLEAN DEFAULT FALSE,
  last_message_timestamp TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  user_preferences JSONB DEFAULT '{
    "interests": [],
    "knownTopics": [],
    "responseStyle": "neutral",
    "engagementLevel": "new"
  }',
  context JSONB DEFAULT '{
    "lastQuestion": null,
    "pendingFollowUp": null,
    "unansweredQueries": [],
    "lastResponseType": null
  }',
  metrics JSONB DEFAULT '{
    "topicFrequency": {},
    "positiveResponses": 0,
    "negativeResponses": 0,
    "questionsAsked": 0
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_responses (
  id SERIAL PRIMARY KEY,
  trigger TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_chat_id ON chat_history(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_bot_responses_trigger ON bot_responses(trigger);

-- Add some default bot responses
INSERT INTO bot_responses (trigger, response, category) VALUES
('hi', 'Hey {user}! 👋 How can I help you explore the crypto world today?', 'greeting'),
('hello', 'Hello {user}! 😊 What aspect of crypto interests you most?', 'greeting'),
('help', 'I''m here to help, {user}! 🤗 Whether you''re new to crypto or an experienced trader, I can guide you through anything you need.', 'help'),
('thanks', 'You''re welcome, {user}! 😊 Let me know if you need anything else!', 'gratitude'),
('bye', 'Take care, {user}! 👋 Looking forward to our next chat!', 'farewell');

-- Add default bot configuration
INSERT INTO bot_config (key, value, description) VALUES
('response_delay', '{"min": 1, "max": 3}', 'Delay range in seconds before bot responds'),
('typing_simulation', '{"enabled": true, "speed": 200}', 'Typing simulation settings'),
('follow_up_chance', '0.7', 'Probability of sending a follow-up message'),
('max_daily_messages', '100', 'Maximum messages per user per day');

-- Enable row level security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON chat_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON chat_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON conversation_state FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for all users" ON conversation_state FOR ALL USING (true);

CREATE POLICY "Enable read access for authenticated users" ON bot_responses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for admins" ON bot_responses FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Enable read access for authenticated users" ON bot_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for admins" ON bot_config FOR ALL USING (auth.role() = 'admin'); 