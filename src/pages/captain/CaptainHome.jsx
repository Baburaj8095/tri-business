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
  Skeleton,
  Avatar,
  Divider,
  Paper
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

  const API_URL = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

  useEffect(() => {
    // Fetch profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token_captain');
        if (!token) {
          navigate('/login');
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
          localStorage.setItem('fullname_captain', data.fullName);
        } else {
          // Fallback to local storage values if API fails
          const storedName = localStorage.getItem('fullname_captain') || 'Captain';
          const storedUsername = localStorage.getItem('username_captain') || 'CB_CAPTAIN';
          const storedPincode = localStorage.getItem('pincode_captain') || '';
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
        const storedName = localStorage.getItem('fullname_captain') || 'Captain';
        const storedUsername = localStorage.getItem('username_captain') || 'CB_CAPTAIN';
        const storedPincode = localStorage.getItem('pincode_captain') || '';
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
    <Box sx={{ py: 1 }}>
      {/* Unified Fintech Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0891b2 100%)',
            color: 'white',
            borderRadius: '24px',
            boxShadow: '0 12px 30px rgba(13,148,136,0.22)',
            p: 3,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decorative glow circles */}
          <Box
            sx={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              filter: 'blur(20px)',
              pointerEvents: 'none'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '100px',
              height: '100px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              filter: 'blur(15px)',
              pointerEvents: 'none'
            }}
          />

          {/* Row 1: Greetings & Profile Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, letterSpacing: 0.5 }}>
                {getGreeting().toUpperCase()}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {profile?.fullName}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                width: 44,
                height: 44,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {profile?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Row 2: Captain ID Chip */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Chip
              label={profile?.username}
              onClick={handleCopyId}
              onDelete={handleCopyId}
              deleteIcon={
                <Tooltip title={copied ? "Copied!" : "Copy ID"}>
                  <CopyIcon style={{ fontSize: '0.85rem', color: 'white' }} />
                </Tooltip>
              }
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 'bold',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                '& .MuiChip-deleteIcon': { color: 'white', '&:hover': { color: '#e2e8f0' } }
              }}
            />
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', mb: 2.5 }} />

          {/* Row 3: Integrated Metrics */}
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', fontSize: '0.75rem', fontWeight: 500 }}>
                  Referrals
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: '800', mt: 0.5 }}>
                  0
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sx={{ borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', fontSize: '0.75rem', fontWeight: 500 }}>
                  Earnings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: '800', mt: 0.5 }}>
                  ₹0.00
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', fontSize: '0.75rem', fontWeight: 500, mb: 0.5 }}>
                  KYC Status
                </Typography>
                {/* Beautiful custom inline chip */}
                {profile?.kycStatus?.toUpperCase() === 'APPROVED' ? (
                  <Box sx={{ bgcolor: T.success, color: 'white', px: 1.2, py: 0.3, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ApprovedIcon style={{ fontSize: '0.85rem' }} /> Approved
                  </Box>
                ) : profile?.kycStatus?.toUpperCase() === 'REJECTED' ? (
                  <Box sx={{ bgcolor: T.danger, color: 'white', px: 1.2, py: 0.3, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RejectedIcon style={{ fontSize: '0.85rem' }} /> Rejected
                  </Box>
                ) : (
                  <Box sx={{ bgcolor: '#f59e0b', color: 'white', px: 1.2, py: 0.3, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PendingIcon style={{ fontSize: '0.85rem' }} /> Pending
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Card>
      </motion.div>

      {/* Contextual Action Notification Alert if KYC is not Approved */}
      {profile?.kycStatus !== 'APPROVED' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card
            sx={{
              borderRadius: '20px',
              border: `1px dashed ${profile?.kycStatus === 'REJECTED' ? T.danger : '#f59e0b'}`,
              bgcolor: profile?.kycStatus === 'REJECTED' ? '#fef2f2' : '#fffbeb',
              boxShadow: 'none',
              mb: 3,
              p: 2.5
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '12px',
                  bgcolor: profile?.kycStatus === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                  color: profile?.kycStatus === 'REJECTED' ? T.danger : '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertIcon />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#0f172a' }}>
                  {profile?.kycStatus === 'REJECTED' ? 'KYC Verification Rejected' : 'KYC Verification Required'}
                </Typography>
                <Typography variant="caption" sx={{ color: T.textSecondary, mt: 0.5, display: 'block', lineHeight: 1.4 }}>
                  {profile?.kycStatus === 'REJECTED'
                    ? 'Your documents were rejected. Please click here to upload valid documents and bank details.'
                    : 'Complete your profile, nominee details, and bank account information to activate payouts and assignments.'}
                </Typography>
                <Button
                  onClick={() => navigate('/captain/kyc')}
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 1.5,
                    bgcolor: profile?.kycStatus === 'REJECTED' ? T.danger : '#d97706',
                    '&:hover': { bgcolor: profile?.kycStatus === 'REJECTED' ? '#dc2626' : '#b45309' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    boxShadow: 'none'
                  }}
                >
                  Verify Documents
                </Button>
              </Box>
            </Box>
          </Card>
        </motion.div>
      )}

      {/* Quick Links Circular Grid */}
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: T.text, mb: 1.5, px: 0.5 }}>
        Quick Services
      </Typography>
      <Paper
        sx={{
          borderRadius: '20px',
          p: 2.5,
          mb: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          border: `1px solid ${T.border}`,
          background: '#ffffff'
        }}
      >
        <Grid container spacing={2} justifyContent="space-around">
          {/* Service 1: KYC */}
          <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <IconButton
              onClick={() => navigate('/captain/kyc')}
              sx={{
                width: 52,
                height: 52,
                bgcolor: T.primaryLight,
                color: T.primary,
                mb: 1,
                boxShadow: '0 8px 16px rgba(13,148,136,0.06)',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#ccfbf1', transform: 'translateY(-2px)' }
              }}
            >
              <KycIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: '700', color: T.text, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              Complete KYC
            </Typography>
          </Grid>

          {/* Service 2: Profile */}
          <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <IconButton
              onClick={() => navigate('/captain/profile')}
              sx={{
                width: 52,
                height: 52,
                bgcolor: T.primaryLight,
                color: T.primary,
                mb: 1,
                boxShadow: '0 8px 16px rgba(13,148,136,0.06)',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#ccfbf1', transform: 'translateY(-2px)' }
              }}
            >
              <ProfileIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: '700', color: T.text, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              My Profile
            </Typography>
          </Grid>

          {/* Service 3: Merchants */}
          <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <IconButton
              onClick={() => handleActionClick(null, 'Merchant List')}
              sx={{
                width: 52,
                height: 52,
                bgcolor: '#f1f5f9',
                color: '#64748b',
                mb: 1,
                boxShadow: '0 8px 16px rgba(0,0,0,0.01)',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#e2e8f0', transform: 'translateY(-2px)' }
              }}
            >
              <StoreIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: '700', color: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              Merchants
            </Typography>
          </Grid>

          {/* Service 4: Trizones */}
          <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <IconButton
              onClick={() => handleActionClick(null, 'Trizone List')}
              sx={{
                width: 52,
                height: 52,
                bgcolor: '#f1f5f9',
                color: '#64748b',
                mb: 1,
                boxShadow: '0 8px 16px rgba(0,0,0,0.01)',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#e2e8f0', transform: 'translateY(-2px)' }
              }}
            >
              <GridIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: '700', color: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              Trizones
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Promo Card: Refer & Earn */}
      <Card
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)',
          color: 'white',
          p: 2.5,
          boxShadow: 'none',
          mb: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            width: 100,
            height: 100,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)'
          }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: '800', mb: 0.5 }}>
          Refer & Earn Payouts!
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 1.5, lineHeight: 1.35 }}>
          Refer new captains using your Sponsor ID and earn ₹15 cash directly into your wallet upon their successful registration.
        </Typography>
        <Button
          size="small"
          onClick={handleCopyId}
          sx={{
            bgcolor: 'white',
            color: '#0e7490',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': { bgcolor: '#f8fafc' }
          }}
        >
          {copied ? 'Sponsor ID Copied!' : 'Copy Sponsor ID'}
        </Button>
      </Card>

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
