import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Skeleton
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as ApprovedIcon,
  PendingActions as PendingIcon,
  Cancel as RejectedIcon,
  AccountBox as ProfileIcon,
  Badge as KycIcon,
  Storefront as StoreIcon,
  GridView as GridIcon,
  NotificationsActive as AlertIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  accent: '#06b6d4',
  bg: '#f0fdfa',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
};

const BANNERS = [
  { id: 1, text: "Complete your KYC to activate your account and unlock earnings", actionText: "Complete KYC", actionPath: "/captain/kyc", bg: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' },
  { id: 2, text: "Refer new captains to the network and earn ₹15 per registration!", actionText: "Refer Now", actionPath: null, bg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' },
  { id: 3, text: "Welcome to the Trikonekt Captain program. Grow your business daily.", actionText: "Explore More", actionPath: null, bg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }
];

export default function CaptainHome() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [copied, setCopied] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const API_URL = window.REACT_APP_CAPTAIN_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    // Fetch profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('captain_access_token');
        if (!token) {
          navigate('/captain/login');
          return;
        }

        const res = await fetch(`${API_URL}/captain/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          // Sync full name in local storage if updated
          localStorage.setItem('captain_full_name', data.fullName);
        } else {
          // Fallback to local storage values if API fails
          const storedName = localStorage.getItem('captain_full_name') || 'Captain';
          const storedUsername = localStorage.getItem('captain_username') || 'CB_CAPTAIN';
          const storedPincode = localStorage.getItem('captain_pincode') || '';
          setProfile({
            username: storedUsername,
            fullName: storedName,
            pincode: storedPincode,
            kycStatus: 'PENDING',
            active: false
          });
        }
      } catch (err) {
        console.error("Profile fetch failed, using fallbacks:", err);
        const storedName = localStorage.getItem('captain_full_name') || 'Captain';
        const storedUsername = localStorage.getItem('captain_username') || 'CB_CAPTAIN';
        const storedPincode = localStorage.getItem('captain_pincode') || '';
        setProfile({
          username: storedUsername,
          fullName: storedName,
          pincode: storedPincode,
          kycStatus: 'PENDING',
          active: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Auto slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCopyId = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(profile.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleActionClick = (path, name) => {
    if (path) {
      navigate(path);
    } else {
      setToastMsg(`${name} is coming soon!`);
      setToastOpen(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getKycChip = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Chip icon={<ApprovedIcon style={{ color: '#fff' }} />} label="KYC Approved" style={{ backgroundColor: T.success, color: '#fff', fontWeight: 'bold' }} />;
      case 'REJECTED':
        return <Chip icon={<RejectedIcon style={{ color: '#fff' }} />} label="KYC Rejected" style={{ backgroundColor: T.danger, color: '#fff', fontWeight: 'bold' }} />;
      default:
        return <Chip icon={<PendingIcon style={{ color: '#fff' }} />} label="KYC Pending" style={{ backgroundColor: T.warning, color: '#fff', fontWeight: 'bold' }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px', mb: 3 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px', mb: 3 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}><Skeleton variant="rectangular" height={90} sx={{ borderRadius: '12px' }} /></Grid>
          <Grid item xs={4}><Skeleton variant="rectangular" height={90} sx={{ borderRadius: '12px' }} /></Grid>
          <Grid item xs={4}><Skeleton variant="rectangular" height={90} sx={{ borderRadius: '12px' }} /></Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: '16px' }} /></Grid>
          <Grid item xs={6}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: '16px' }} /></Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header Profile Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="body2" color={T.textSecondary} sx={{ fontWeight: 'medium' }}>
              {getGreeting()},
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: '800', color: T.text }}>
              {profile?.fullName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
              <Chip
                label={profile?.username}
                size="small"
                onClick={handleCopyId}
                onDelete={handleCopyId}
                deleteIcon={
                  <Tooltip title={copied ? "Copied!" : "Copy ID"}>
                    <CopyIcon style={{ fontSize: '0.9rem', color: T.primary }} />
                  </Tooltip>
                }
                sx={{ 
                  bgcolor: T.primaryLight, 
                  color: T.primaryDark, 
                  fontWeight: 'bold',
                  border: `1px solid ${T.primary}22`,
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
          <IconButton sx={{ bgcolor: 'white', border: `1px solid ${T.border}`, p: 1.2 }}>
            <AlertIcon sx={{ color: T.primary }} />
          </IconButton>
        </Box>
      </motion.div>

      {/* Auto Sliding Banner */}
      <Box sx={{ mb: 4, position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <Card sx={{ background: BANNERS[activeBanner].bg, color: 'white', minHeight: 150, borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
              <CardContent sx={{ p: 3, width: '100%' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2, fontSize: '0.95rem', lineHeight: 1.4 }}>
                  {BANNERS[activeBanner].text}
                </Typography>
                {BANNERS[activeBanner].actionText && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleActionClick(BANNERS[activeBanner].actionPath, BANNERS[activeBanner].actionText)}
                    sx={{
                      bgcolor: 'white',
                      color: T.primaryDark,
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#f8fafc', boxShadow: 'none' }
                    }}
                  >
                    {BANNERS[activeBanner].actionText}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        {/* Carousel Dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5 }}>
          {BANNERS.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: idx === activeBanner ? 20 : 6,
                height: 6,
                borderRadius: 3,
                bgcolor: idx === activeBanner ? T.primary : T.border,
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Quick Stats Grid */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: T.text, mb: 1.5 }}>
        Quick Overview
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${T.border}`, boxShadow: 'none', textAlign: 'center', p: 1.5, bgcolor: '#ffffff' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'medium' }}>Referrals</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: T.text, mt: 0.5 }}>0</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${T.border}`, boxShadow: 'none', textAlign: 'center', p: 1.5, bgcolor: '#ffffff' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'medium' }}>Earnings</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: T.text, mt: 0.5 }}>₹0.00</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${T.border}`, boxShadow: 'none', textAlign: 'center', p: 1.5, bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'medium', mb: 0.5 }}>KYC Status</Typography>
            <Box sx={{ transform: 'scale(0.85)', mt: -0.5 }}>
              {getKycChip(profile?.kycStatus)}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Action Grid */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: T.text, mb: 1.5 }}>
        Quick Links
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card 
            onClick={() => navigate('/captain/kyc')}
            sx={{ 
              borderRadius: '16px', 
              border: `1px solid ${T.border}`, 
              boxShadow: 'none', 
              cursor: 'pointer',
              bgcolor: 'white',
              '&:hover': { border: `1px solid ${T.primary}` }
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: T.primaryLight, color: T.primary, mb: 1.5 }}>
                <KycIcon />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: T.text }}>
                Complete KYC
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                Nominee & bank details
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card 
            onClick={() => navigate('/captain/profile')}
            sx={{ 
              borderRadius: '16px', 
              border: `1px solid ${T.border}`, 
              boxShadow: 'none', 
              cursor: 'pointer',
              bgcolor: 'white',
              '&:hover': { border: `1px solid ${T.primary}` }
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: T.primaryLight, color: T.primary, mb: 1.5 }}>
                <ProfileIcon />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: T.text }}>
                My Profile
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                View account info
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card 
            onClick={() => handleActionClick(null, 'Merchant List')}
            sx={{ 
              borderRadius: '16px', 
              border: `1px solid ${T.border}`, 
              boxShadow: 'none', 
              cursor: 'pointer',
              bgcolor: 'white',
              '&:hover': { border: `1px solid ${T.primary}` }
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f1f5f9', color: '#64748b', mb: 1.5 }}>
                <StoreIcon />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: T.text }}>
                Merchants
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                Coming soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card 
            onClick={() => handleActionClick(null, 'Trizone List')}
            sx={{ 
              borderRadius: '16px', 
              border: `1px solid ${T.border}`, 
              boxShadow: 'none', 
              cursor: 'pointer',
              bgcolor: 'white',
              '&:hover': { border: `1px solid ${T.primary}` }
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f1f5f9', color: '#64748b', mb: 1.5 }}>
                <GridIcon />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: T.text }}>
                Trizones
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                Coming soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar alerts */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="info" sx={{ width: '100%', borderRadius: '12px' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
