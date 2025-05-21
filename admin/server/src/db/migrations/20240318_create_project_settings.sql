-- Create project_settings table
CREATE TABLE IF NOT EXISTS project_settings (
    id SERIAL PRIMARY KEY,
    projectName VARCHAR(255) NOT NULL DEFAULT 'GramX Game',
    responseDelay INTEGER NOT NULL DEFAULT 1000,
    maxTokens INTEGER NOT NULL DEFAULT 150,
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    isActive BOOLEAN NOT NULL DEFAULT true,
    defaultProject VARCHAR(50) NOT NULL DEFAULT 'gramx',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if table is empty
INSERT INTO project_settings (
    projectName,
    responseDelay,
    maxTokens,
    temperature,
    isActive,
    defaultProject
)
SELECT
    'GramX Game',
    1000,
    150,
    0.70,
    true,
    'gramx'
WHERE NOT EXISTS (SELECT 1 FROM project_settings);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_project_settings_updated_at
    BEFORE UPDATE ON project_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 