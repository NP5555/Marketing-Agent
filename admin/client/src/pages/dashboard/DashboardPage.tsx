import { useEffect, useState } from 'react';
import { 
  Typography, Grid, Paper, Box, CircularProgress, 
  Card, CardContent, CardHeader, Divider 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { supabase } from '../../utils/supabaseClient';

// Mock data - to be replaced with real data
const mockOfferData = [
  { name: 'Offer 1', clicks: 400, conversions: 240 },
  { name: 'Offer 2', clicks: 300, conversions: 139 },
  { name: 'Offer 3', clicks: 200, conversions: 98 },
  { name: 'Offer 4', clicks: 278, conversions: 120 },
  { name: 'Offer 5', clicks: 189, conversions: 85 },
];

const mockUserData = [
  { date: '2023-01', users: 400 },
  { date: '2023-02', users: 450 },
  { date: '2023-03', users: 550 },
  { date: '2023-04', users: 700 },
  { date: '2023-05', users: 900 },
  { date: '2023-06', users: 1000 },
];

// Dashboard stats type
interface DashboardStats {
  offerCount: number;
  activeOfferCount: number;
  totalLinks: number;
  totalClicks: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // This would fetch real data from Supabase in production
    const fetchDashboardData = async () => {
      try {
        // Example queries - these will need to be updated with actual schema 
        // const { data: offers } = await supabase.from('offers').select('*');
        // const { data: activeOffers } = await supabase.from('offers').select('*').eq('is_active', true);
        // const { data: links } = await supabase.from('referral_links').select('*');
        
        // For now, using mock data
        setStats({
          offerCount: 5,
          activeOfferCount: 3,
          totalLinks: 25,
          totalClicks: 1200
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Offers
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.offerCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Offers
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.activeOfferCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Referral Links
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalLinks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Clicks
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalClicks}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Offer Performance" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mockOfferData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#8884d8" name="Clicks" />
                  <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="User Growth" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={mockUserData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 