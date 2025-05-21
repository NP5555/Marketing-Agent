import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { supabase } from './utils/supabaseClient';
import AuthLayout from './components/layouts/AuthLayout';
import MainLayout from './components/layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const OffersPage = lazy(() => import('./pages/offers/OffersPage'));
const LinksPage = lazy(() => import('./pages/links/LinksPage'));
const BotConfigPage = lazy(() => import('./pages/bot/BotConfigPage'));
const ProjectSettingsPage = lazy(() => import('./pages/bot/ProjectSettingsPage'));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status on app load
    const checkAuth = async () => {
      try {
        await supabase.auth.getSession();
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthProvider>
      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <CircularProgress />
        </Box>
      }>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          
          {/* App Routes - Protected */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/bot-config" element={<BotConfigPage />} />
            <Route path="/project-settings" element={<ProjectSettingsPage />} />
          </Route>
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
} 