-- Drop existing functions and triggers first
DROP FUNCTION IF EXISTS get_project_settings();
DROP FUNCTION IF EXISTS update_project_settings(VARCHAR, INTEGER, INTEGER, DECIMAL, BOOLEAN, VARCHAR);
DROP TRIGGER IF EXISTS update_project_settings_updated_at ON project_settings;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS project_settings CASCADE;

-- Create project_settings table with camelCase column names
CREATE TABLE project_settings (
    id SERIAL PRIMARY KEY,
    "projectName" VARCHAR(255) NOT NULL DEFAULT 'GramX Game',
    "responseDelay" INTEGER NOT NULL DEFAULT 1000,
    "maxTokens" INTEGER NOT NULL DEFAULT 150,
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultProject" VARCHAR(50) NOT NULL DEFAULT 'gramx',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_project_settings_updated_at
    BEFORE UPDATE ON project_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO project_settings (
    "projectName",
    "responseDelay",
    "maxTokens",
    temperature,
    "isActive",
    "defaultProject"
)
VALUES (
    'GramX Game',
    1000,
    150,
    0.70,
    true,
    'gramx'
)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read project settings
CREATE POLICY "Allow authenticated users to read project settings"
ON project_settings
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow authenticated users to insert/update project settings
CREATE POLICY "Allow authenticated users to modify project settings"
ON project_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create RPC functions for project settings
CREATE OR REPLACE FUNCTION get_project_settings()
RETURNS SETOF project_settings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM project_settings LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION update_project_settings(
    p_project_name VARCHAR,
    p_response_delay INTEGER,
    p_max_tokens INTEGER,
    p_temperature DECIMAL,
    p_is_active BOOLEAN,
    p_default_project VARCHAR
)
RETURNS SETOF project_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO project_settings (
        "projectName",
        "responseDelay",
        "maxTokens",
        temperature,
        "isActive",
        "defaultProject"
    )
    VALUES (
        p_project_name,
        p_response_delay,
        p_max_tokens,
        p_temperature,
        p_is_active,
        p_default_project
    )
    ON CONFLICT (id) DO UPDATE
    SET
        "projectName" = p_project_name,
        "responseDelay" = p_response_delay,
        "maxTokens" = p_max_tokens,
        temperature = p_temperature,
        "isActive" = p_is_active,
        "defaultProject" = p_default_project,
        "updatedAt" = CURRENT_TIMESTAMP
    RETURNING *;
END;
$$; 