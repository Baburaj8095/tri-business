import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Storefront as StoreIcon,
  GridView as GridIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  bg: '#f0fdfa',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
};

export default function CaptainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Determine active tab based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/captain/home')) return 0;
    if (path.includes('/captain/profile')) return 1;
    return 0;
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('captain_access_token');
    const storedName = localStorage.getItem('captain_full_name');

    if (!token) {
      navigate('/captain/login');
    } else {
      setFullName(storedName || 'Captain');
      setLoading(false);
    }
  }, [navigate]);

  const handleNavChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/captain/home');
    } else if (newValue === 1) {
      navigate('/captain/profile');
    } else if (newValue === 2) {
      setSnackbarMsg('Merchant List is coming soon!');
      setSnackbarOpen(true);
    } else if (newValue === 3) {
      setSnackbarMsg('Trizone List is coming soon!');
      setSnackbarOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('captain_access_token');
    localStorage.removeItem('captain_refresh_token');
    localStorage.removeItem('captain_username');
    localStorage.removeItem('captain_full_name');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: T.bg }}>
        <CircularProgress sx={{ color: T.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: T.bg }}>
      {/* Top Header App Bar */}
      <AppBar position="fixed" sx={{ background: T.gradient, boxShadow: '0 4px 12px rgba(13,148,136,0.15)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ bgcolor: 'white', color: T.primary, fontWeight: 'bold', width: 32, height: 32, fontSize: '0.9rem' }}
            >
              TK
            </Avatar>
            <Typography variant="h6" component="div" sx={{ fontWeight: '800', letterSpacing: 0.5 }}>
              TRIKONEKT
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                Welcome back,
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {fullName}
              </Typography>
            </Box>
            <Avatar 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, fontWeight: 'bold' }}
            >
              {fullName.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton onClick={handleLogout} color="inherit" size="small" title="Logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: '76px', // offset AppBar
          pb: '80px', // offset Bottom Nav
          px: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: '500px', // Mobile-focused narrow frame
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>

      {/* Fixed Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          borderTop: `1px solid ${T.border}`,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.05)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={handleNavChange}
          sx={{
            height: 64,
            '& .Mui-selected': {
              color: `${T.primary} !important`,
              '& .MuiSvgIcon-root': {
                color: T.primary,
                transform: 'scale(1.1)',
                transition: 'all 0.2s ease'
              }
            }
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
          <BottomNavigationAction label="Merchants" icon={<StoreIcon />} />
          <BottomNavigationAction label="Trizones" icon={<GridIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Notification Toast */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%', borderRadius: '12px' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
