import { useState, useEffect } from 'react';
import { 
  Typography, Box, CircularProgress, TextField, Button,
  Paper, Tabs, Tab, Card, CardHeader, CardContent, Grid,
  Divider, Slider, FormControl, InputLabel, MenuItem, Select,
  Stack, Switch, FormControlLabel, FormGroup
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { supabase, BotConfig } from '../../utils/supabaseClient';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bot-config-tabpanel-${index}`}
      aria-labelledby={`bot-config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function BotConfigPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Config state
  const [responseDelay, setResponseDelay] = useState<number>(2);
  const [greetingMessage, setGreetingMessage] = useState<string>('Welcome to our marketing bot!');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState<boolean>(true);
  
  // Fetch configuration on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // This would fetch the real config from the API
        // For now, just setting default values
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch bot configuration');
        console.error(err);
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveGeneralSettings = () => {
    console.log('Saving general settings', {
      responseDelay,
      greetingMessage,
      autoReplyEnabled
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Bot Configuration
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="bot configuration tabs"
        >
          <Tab label="General Settings" />
          <Tab label="Message Templates" />
          <Tab label="Auto-Reply Rules" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Card variant="outlined">
            <CardHeader title="Response Settings" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Response Delay (seconds)
                  </Typography>
                  <Slider
                    value={responseDelay}
                    onChange={(_, newValue) => setResponseDelay(newValue as number)}
                    min={0}
                    max={10}
                    step={0.5}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: '0s' },
                      { value: 5, label: '5s' },
                      { value: 10, label: '10s' }
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={autoReplyEnabled} 
                          onChange={(e) => setAutoReplyEnabled(e.target.checked)} 
                        />
                      } 
                      label="Enable Auto-Reply" 
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardHeader title="Greeting Settings" />
            <Divider />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Greeting Message"
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                helperText="This message will be sent when a user first interacts with the bot"
              />
            </CardContent>
          </Card>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveGeneralSettings}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography>
            Message template editor would go here, allowing editing of message templates
            for different scenarios.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography>
            Auto-reply rule configuration would go here, allowing setting up of
            rules for when the bot should automatically respond.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
} 