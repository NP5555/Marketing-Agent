import React, { useState, useEffect } from 'react';
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
} from '@mui/material';

interface ProjectSettings {
  projectName: string;
  responseDelay: number;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  defaultProject: string;
}

const ProjectSettings: React.FC = () => {
  const [settings, setSettings] = useState<ProjectSettings>({
    projectName: 'GramX Game',
    responseDelay: 1000,
    maxTokens: 150,
    temperature: 0.7,
    isActive: true,
    defaultProject: 'gramx',
  });

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save settings
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Settings
      </Typography>
      
      <Card sx={{ mb: 3 }}>
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
                sx={{ mt: 2 }}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectSettings; 