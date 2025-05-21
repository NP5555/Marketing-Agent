-- Get project settings
CREATE OR REPLACE FUNCTION get_project_settings()
RETURNS TABLE (
    id INTEGER,
    project_name VARCHAR,
    response_delay INTEGER,
    max_tokens INTEGER,
    temperature DECIMAL,
    is_active BOOLEAN,
    default_project VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM project_settings
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Update project settings
CREATE OR REPLACE FUNCTION update_project_settings(
    p_project_name VARCHAR,
    p_response_delay INTEGER,
    p_max_tokens INTEGER,
    p_temperature DECIMAL,
    p_is_active BOOLEAN,
    p_default_project VARCHAR
) RETURNS project_settings
SECURITY DEFINER
AS $$
DECLARE
    updated_settings project_settings;
BEGIN
    UPDATE project_settings
    SET
        project_name = p_project_name,
        response_delay = p_response_delay,
        max_tokens = p_max_tokens,
        temperature = p_temperature,
        is_active = p_is_active,
        default_project = p_default_project,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT id FROM project_settings LIMIT 1)
    RETURNING * INTO updated_settings;

    IF NOT FOUND THEN
        INSERT INTO project_settings (
            project_name,
            response_delay,
            max_tokens,
            temperature,
            is_active,
            default_project
        ) VALUES (
            p_project_name,
            p_response_delay,
            p_max_tokens,
            p_temperature,
            p_is_active,
            p_default_project
        ) RETURNING * INTO updated_settings;
    END IF;

    RETURN updated_settings;
END;
$$ LANGUAGE plpgsql; 