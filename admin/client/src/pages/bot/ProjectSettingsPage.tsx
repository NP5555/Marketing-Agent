import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { supabase } from '../../utils/supabaseClient';

interface ProjectSettings {
  projectName: string;
  responseDelay: number;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  defaultProject: string;
}

const defaultSettings: ProjectSettings = {
  projectName: 'GramX Game',
  responseDelay: 1000,
  maxTokens: 150,
  temperature: 0.7,
  isActive: true,
  defaultProject: 'gramx',
};

export default function ProjectSettingsPage() {
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('project_settings')
          .select('*')
          .single();

        if (error) throw error;

        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('project_settings')
        .upsert(settings);

      if (error) throw error;

      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={settings.projectName}
                onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Project</InputLabel>
                <Select
                  value={settings.defaultProject}
                  label="Default Project"
                  onChange={(e) => setSettings({ ...settings, defaultProject: e.target.value })}
                >
                  <MenuItem value="gramx">GramX Game</MenuItem>
                  <MenuItem value="custom">Custom Project</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Response Delay (ms)</Typography>
              <Slider
                value={settings.responseDelay}
                min={0}
                max={5000}
                step={100}
                onChange={(_, value) => setSettings({ ...settings, responseDelay: value as number })}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0ms' },
                  { value: 2500, label: '2.5s' },
                  { value: 5000, label: '5s' },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Temperature</Typography>
              <Slider
                value={settings.temperature}
                min={0}
                max={1}
                step={0.1}
                onChange={(_, value) => setSettings({ ...settings, temperature: value as number })}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0' },
                  { value: 0.5, label: '0.5' },
                  { value: 1, label: '1' },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Max Tokens</Typography>
              <Slider
                value={settings.maxTokens}
                min={50}
                max={500}
                step={10}
                onChange={(_, value) => setSettings({ ...settings, maxTokens: value as number })}
                valueLabelDisplay="auto"
                marks={[
                  { value: 50, label: '50' },
                  { value: 250, label: '250' },
                  { value: 500, label: '500' },
                ]}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.isActive}
                    onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                  />
                }
                label="Project Active"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : undefined}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 