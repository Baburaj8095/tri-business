import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Storefront as StoreIcon,
  QrCodeScanner as QrScanIcon,
  TrendingUp as AnalyticsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export default function CaptainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/captain/home')) return 'home';
    if (path.includes('/captain/merchants') || path.includes('/captain/merchant/')) return 'merchants';
    if (path.includes('/captain/analytics')) return 'analytics';
    if (path.includes('/captain/profile') || path.includes('/captain/kyc')) return 'profile';
    if (path.includes('/scanner')) return 'scanner';
    return 'home';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const token = localStorage.getItem('token_captain');
    const storedName = localStorage.getItem('fullname_captain');

    if (!token) {
      navigate('/login');
    } else {
      setFullName(storedName || 'Captain');
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#047857' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      pb: '76px', // space for bottom nav
    }}>
      {/* ── Main Dynamic Screen Canvas ── */}
      <Box component="main" sx={{ flexGrow: 1, width: '100%', maxWidth: '520px', mx: 'auto' }}>
        <Outlet />
      </Box>

      {/* ── Fixed Bottom Navigation (Mockup Exact Match: 5 Tabs with Floating QR Center) ── */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
      }}>
        <Box sx={{
          maxWidth: '520px',
          mx: 'auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          px: 1,
          position: 'relative',
        }}>
          {/* Tab 1: Home */}
          <Box
            onClick={() => navigate('/captain/home')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flex: 1,
              py: 0.5,
              color: activeTab === 'home' ? '#047857' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <HomeIcon sx={{ fontSize: 24, mb: 0.2 }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: activeTab === 'home' ? 800 : 600 }}>
              Home
            </Typography>
          </Box>

          {/* Tab 2: Merchants */}
          <Box
            onClick={() => navigate('/captain/merchants')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flex: 1,
              py: 0.5,
              color: activeTab === 'merchants' ? '#047857' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <StoreIcon sx={{ fontSize: 24, mb: 0.2 }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: activeTab === 'merchants' ? 800 : 600 }}>
              Merchants
            </Typography>
          </Box>

          {/* Tab 3: Scanner (Floating Emerald Circle in Center) */}
          <Box sx={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              onClick={() => navigate('/scanner')}
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: '#047857',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 18px rgba(4, 120, 87, 0.45)',
                cursor: 'pointer',
                position: 'absolute',
                top: -22,
                border: '3px solid #ffffff',
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              <QrScanIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#94a3b8',
              mt: 3.8,
            }}>
              Scanner
            </Typography>
          </Box>

          {/* Tab 4: Analytics */}
          <Box
            onClick={() => navigate('/captain/analytics')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flex: 1,
              py: 0.5,
              color: activeTab === 'analytics' ? '#047857' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <AnalyticsIcon sx={{ fontSize: 24, mb: 0.2 }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: activeTab === 'analytics' ? 800 : 600 }}>
              Analytics
            </Typography>
          </Box>

          {/* Tab 5: Profile */}
          <Box
            onClick={() => navigate('/captain/profile')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flex: 1,
              py: 0.5,
              color: activeTab === 'profile' ? '#047857' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <PersonIcon sx={{ fontSize: 24, mb: 0.2 }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: activeTab === 'profile' ? 800 : 600 }}>
              Profile
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Snackbar notification */}
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
