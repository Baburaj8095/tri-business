import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Button,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Badge as KycIcon,
  ArrowForwardIos as ArrowIcon,
  Logout as LogoutIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
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

export default function CaptainProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const API_URL = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token_captain');
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
        } else {
          // Fallback to local storage values if API fails
          setProfile({
            username: localStorage.getItem('username_captain') || 'CB_CAPTAIN',
            fullName: localStorage.getItem('fullname_captain') || 'Captain User',
            phone: localStorage.getItem('username_captain')?.replace('CB', '') || '9876543210',
            email: 'captain@trikonekt.com',
            pincode: localStorage.getItem('pincode_captain') || '',
            kycStatus: 'PENDING',
            active: false,
            city: 'District',
            stateName: 'State',
            joinedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Profile fetch failed, using fallbacks:", err);
        setProfile({
          username: localStorage.getItem('username_captain') || 'CB_CAPTAIN',
          fullName: localStorage.getItem('fullname_captain') || 'Captain User',
          phone: localStorage.getItem('username_captain')?.replace('CB', '') || '9876543210',
          email: 'captain@trikonekt.com',
          pincode: localStorage.getItem('pincode_captain') || '',
          kycStatus: 'PENDING',
          active: false,
          city: 'District',
          stateName: 'State',
          joinedAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleCopyId = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(profile.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token_captain');
    localStorage.removeItem('refresh_captain');
    localStorage.removeItem('username_captain');
    localStorage.removeItem('fullname_captain');
    navigate('/login', { replace: true });
  };

  const getKycBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Chip label="Approved" size="small" style={{ backgroundColor: T.success, color: '#fff', fontWeight: 'bold' }} />;
      case 'REJECTED':
        return <Chip label="Rejected" size="small" style={{ backgroundColor: T.danger, color: '#fff', fontWeight: 'bold' }} />;
      default:
        return <Chip label="Pending Review" size="small" style={{ backgroundColor: T.warning, color: '#fff', fontWeight: 'bold' }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: T.primary }} />
      </Box>
    );
  }

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'C';

  return (
    <Box sx={{ py: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Profile Card Header */}
        <Card sx={{ borderRadius: '20px', border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', mb: 3, bgcolor: '#ffffff' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                background: T.gradient, 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                boxShadow: '0 8px 24px rgba(13,148,136,0.25)',
                mb: 2 
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: '800', color: T.text }}>
              {profile?.fullName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, mb: 1 }}>
              <Typography variant="body2" color={T.textSecondary} sx={{ fontWeight: 'medium' }}>
                ID: {profile?.username}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy ID"}>
                <IconButton onClick={handleCopyId} size="small" sx={{ color: T.primary }}>
                  <CopyIcon sx={{ fontSize: '0.95rem' }} />
                </IconButton>
              </Tooltip>
            </Box>

            {profile?.city && (
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'medium' }}>
                {profile.city}, {profile.stateName} — {profile.pincode}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Profile Info Fields List */}
        <Card sx={{ borderRadius: '20px', border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', mb: 3, bgcolor: '#ffffff', overflow: 'hidden' }}>
          <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: '800', color: T.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
              Account Settings
            </Typography>
          </Box>
          <List disablePadding>
            <ListItem sx={{ px: 3, py: 1.8 }}>
              <ListItemText 
                primary={<Typography variant="caption" color="textSecondary">Phone Number</Typography>} 
                secondary={<Typography variant="body1" sx={{ fontWeight: 'semibold', color: T.text }}>{profile?.phone}</Typography>} 
              />
            </ListItem>
            <Divider variant="middle" sx={{ borderColor: T.border }} />
            <ListItem sx={{ px: 3, py: 1.8 }}>
              <ListItemText 
                primary={<Typography variant="caption" color="textSecondary">Email Address</Typography>} 
                secondary={<Typography variant="body1" sx={{ fontWeight: 'semibold', color: T.text }}>{profile?.email || 'Not Provided'}</Typography>} 
              />
            </ListItem>
            <Divider variant="middle" sx={{ borderColor: T.border }} />
            <ListItem sx={{ px: 3, py: 1.8 }}>
              <ListItemText 
                primary={<Typography variant="caption" color="textSecondary">Account Status</Typography>} 
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {profile?.active ? (
                      <Chip icon={<ActiveIcon style={{ color: '#fff' }} />} label="Active" size="small" style={{ backgroundColor: T.success, color: '#fff', fontWeight: 'bold' }} />
                    ) : (
                      <Chip icon={<InactiveIcon style={{ color: '#fff' }} />} label="Inactive" size="small" style={{ backgroundColor: T.danger, color: '#fff', fontWeight: 'bold' }} />
                    )}
                  </Box>
                } 
              />
            </ListItem>
            <Divider variant="middle" sx={{ borderColor: T.border }} />
            <ListItem sx={{ px: 3, py: 1.8 }}>
              <ListItemText 
                primary={<Typography variant="caption" color="textSecondary">KYC Verification</Typography>} 
                secondary={<Box sx={{ mt: 0.5 }}>{getKycBadge(profile?.kycStatus)}</Box>} 
              />
              {profile?.kycStatus === 'REJECTED' && profile?.kycRejectionReason && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                  Reason: {profile.kycRejectionReason}
                </Typography>
              )}
            </ListItem>
            {profile?.joinedAt && (
              <>
                <Divider variant="middle" sx={{ borderColor: T.border }} />
                <ListItem sx={{ px: 3, py: 1.8 }}>
                  <ListItemText 
                    primary={<Typography variant="caption" color="textSecondary">Joined On</Typography>} 
                    secondary={<Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text }}>{new Date(profile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>} 
                  />
                </ListItem>
              </>
            )}
          </List>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/captain/kyc')}
            startIcon={<EditIcon />}
            sx={{
              background: T.gradient,
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(13,148,136,0.2)',
              '&:hover': { background: T.gradient, opacity: 0.95 }
            }}
          >
            Update KYC & Bank Details
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              borderColor: T.border,
              color: T.textSecondary,
              fontWeight: 'bold',
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'none',
              bgcolor: 'white',
              '&:hover': { borderColor: T.primary, color: T.primary, bgcolor: T.bg }
            }}
          >
            Logout Account
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
