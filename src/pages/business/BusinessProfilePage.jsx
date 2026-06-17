import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/EditOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import StoreIcon from '@mui/icons-material/StorefrontOutlined';
import OrdersIcon from '@mui/icons-material/ListAltOutlined';
import ProfileIcon from '@mui/icons-material/PersonOutlineOutlined';
import {
  LuLock,
  LuPhone,
  LuLogOut,
  LuUser,
  LuWallet,
  LuStore,
  LuShieldCheck,
  LuPercent,
  LuFileText,
  LuBookOpen,
  LuInfo,
  LuCircleHelp,
} from 'react-icons/lu';

import { getMerchantProfile, updateMerchantProfile } from "../../api/api";

const T = {
  primary: '#228B22',       // Forest Green
  primaryDark: '#1B4D3E',   // Dark Forest Green
  primaryLight: '#e9f5e9',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gradient: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)',
  cardShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
  radius: '16px',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#fff',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderHover },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { color: T.textMuted, '&.Mui-focused': { color: T.primary } },
  '& .MuiInputBase-input': { fontWeight: 600, color: T.text },
};

export default function BusinessProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('triBusinessUser') || 'null');
    } catch (_) {
      return null;
    }
  });

  const [activeModal, setActiveModal] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    business_name: '',
    mobile_number: '',
    address: '',
    commission_percent: '',
    service_mode: 'BOTH'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await getMerchantProfile();
        if (p) {
          setProfile(p);
          localStorage.setItem('triBusinessUser', JSON.stringify(p));
          localStorage.setItem('business_full_name', p.business_name || p.full_name || '');
          localStorage.setItem('business_phone', p.mobile_number || p.username || '');
          setEditForm({
            business_name: p.business_name || '',
            mobile_number: p.mobile_number || '',
            address: p.address || '',
            commission_percent: p.commission_percent || '',
            service_mode: p.service_mode || 'BOTH',
          });
        }
      } catch (err) {
        console.error('Failed to load merchant profile details:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const p = await updateMerchantProfile({
        ...editForm,
        commission_percent: editForm.commission_percent ? parseFloat(editForm.commission_percent) : 0,
      });
      if (p) {
        setProfile(p);
        localStorage.setItem('triBusinessUser', JSON.stringify(p));
        localStorage.setItem('business_full_name', p.business_name || p.full_name || '');
        localStorage.setItem('business_phone', p.mobile_number || p.username || '');
        setIsSuccess(true);
        setTimeout(() => { setIsSuccess(false); setActiveModal(null); }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('access_token_business');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('refresh_token_business');
    localStorage.removeItem('username_business');
    localStorage.removeItem('business_id');
    localStorage.removeItem('business_full_name');
    localStorage.removeItem('business_phone');
    localStorage.removeItem('triBusinessUser');
    localStorage.removeItem('triBusinessProfilePic');
    setActiveModal(null);
    navigate('/login');
  };

  const displayName = profile?.business_name || profile?.full_name || 'My Business';
  const rawMobile = profile?.mobile_number || profile?.username || '';
  const displayMobile = rawMobile ? (rawMobile.startsWith('+91') ? rawMobile : `+91 ${rawMobile}`) : '—';
  const walletBalance = profile?.walletBalance ?? 0;

  // Custom list of menu options from screenshot layout
  const menuItems = [
    {
      label: 'KYC',
      icon: <LuShieldCheck size={20} />,
      onClick: () => setActiveModal('kyc')
    },
    {
      label: 'Company Commissions',
      icon: <LuPercent size={20} />,
      onClick: () => setActiveModal('commissions')
    },
    {
      label: 'Completed Orders',
      icon: <LuFileText size={20} />,
      onClick: () => setActiveModal('orders')
    },
    {
      label: 'Terms & Conditions',
      icon: <LuBookOpen size={20} />,
      onClick: () => setActiveModal('terms')
    },
    {
      label: 'Privacy Policy',
      icon: <LuLock size={20} />,
      onClick: () => setActiveModal('privacy')
    },
    {
      label: 'Refund Policy',
      icon: <LuInfo size={20} />,
      onClick: () => setActiveModal('refund')
    },
    {
      label: 'Contact Us',
      icon: <LuPhone size={20} />,
      onClick: () => setActiveModal('contact')
    },
    {
      label: 'About Us',
      icon: <LuCircleHelp size={20} />,
      onClick: () => setActiveModal('about')
    },
    {
      label: 'Log out',
      icon: <LuLogOut size={20} />,
      color: T.error,
      onClick: () => setActiveModal('logout')
    }
  ];

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 12 }}>
      {/* Title Header Bar */}
      <Box sx={{ bgcolor: T.primary, py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
          Profile
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 3, px: 2 }}>
        <Stack spacing={2.5}>
          {/* Shop Details Card */}
          <Card 
            onClick={() => setActiveModal('edit')}
            sx={{ 
              borderRadius: T.radius, 
              boxShadow: T.cardShadow, 
              border: `1px solid ${T.border}`, 
              bgcolor: T.surface,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: T.primary,
                boxShadow: '0 4px 18px rgba(0,0,0,0.06)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Edit indicator */}
              <Box sx={{ position: 'absolute', top: 12, right: 12, color: T.textMuted }}>
                <EditIcon sx={{ fontSize: 15 }} />
              </Box>

              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={3.75}>
                  <Typography sx={{ fontWeight: 800, color: T.textSecondary, fontSize: '0.86rem' }}>Shop Name</Typography>
                </Grid>
                <Grid item xs={0.5}>
                  <Typography sx={{ fontWeight: 800, color: T.textSecondary, fontSize: '0.86rem' }}>:</Typography>
                </Grid>
                <Grid item xs={7.75}>
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.86rem' }}>{displayName}</Typography>
                </Grid>

                <Grid item xs={3.75}>
                  <Typography sx={{ fontWeight: 800, color: T.textSecondary, fontSize: '0.86rem' }}>Mobile</Typography>
                </Grid>
                <Grid item xs={0.5}>
                  <Typography sx={{ fontWeight: 800, color: T.textSecondary, fontSize: '0.86rem' }}>:</Typography>
                </Grid>
                <Grid item xs={7.75}>
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.86rem' }}>{displayMobile}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Wallet Balance Card */}
          <Card 
            sx={{ 
              background: T.gradient, 
              color: '#fff', 
              borderRadius: T.radius, 
              boxShadow: '0 8px 24px rgba(34, 139, 34, 0.18)',
              border: 0,
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.15)', p: 1.5, borderRadius: '12px' }}>
                <LuWallet size={24} color="#fff" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', letterSpacing: 0.5, mb: 0.25 }}>
                  Wallet Balance
                </Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.1 }}>
                  ₹ {Number(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Navigation Links Card List */}
          <Card sx={{ borderRadius: T.radius, boxShadow: T.cardShadow, border: `1px solid ${T.border}`, bgcolor: T.surface, overflow: 'hidden' }}>
            <List disablePadding>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={item.onClick} sx={{ py: 2, px: 2.5 }}>
                      <ListItemIcon sx={{ minWidth: 38, color: item.color || '#2e5b9a' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 600, 
                          color: item.color || T.text 
                        }} 
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < menuItems.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Stack>
      </Container>

      {/* ── Fixed Bottom Navigation Bar ── */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          zIndex: 1000,
          borderTop: `1px solid ${T.border}`,
          bgcolor: T.surface,
          boxShadow: "0 -4px 15px rgba(0,0,0,0.03)",
        }}
      >
        <Stack 
          direction="row" 
          justifyContent="space-around" 
          alignItems="center"
          sx={{ height: 64, maxWidth: 600, mx: 'auto' }}
        >
          <IconButton 
            onClick={() => navigate('/business-dashboard')} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, color: T.textMuted, '&:hover': { color: T.primary } }}
          >
            <HomeIcon sx={{ fontSize: 22 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Home</Typography>
          </IconButton>

          <IconButton 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, color: T.textMuted, '&:hover': { color: T.primary } }}
          >
            <WalletIcon sx={{ fontSize: 22 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Wallet</Typography>
          </IconButton>

          <IconButton 
            onClick={() => navigate('/business/shops')} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, color: T.textMuted, '&:hover': { color: T.primary } }}
          >
            <StoreIcon sx={{ fontSize: 22 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Shops</Typography>
          </IconButton>

          <IconButton 
            onClick={() => navigate('/business/shops')} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, color: T.textMuted, '&:hover': { color: T.primary } }}
          >
            <OrdersIcon sx={{ fontSize: 22 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Orders</Typography>
          </IconButton>

          <IconButton 
            onClick={() => navigate('/business/profile')} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, color: T.primary }}
          >
            <ProfileIcon sx={{ fontSize: 22 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 800 }}>Profile</Typography>
          </IconButton>
        </Stack>
      </Box>

      {/* ── Dialogs/Modals ── */}
      
      {/* Edit Profile Modal */}
      <Dialog open={activeModal === 'edit'} onClose={() => setActiveModal(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text, pb: 1 }}>Edit Business Profile</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              {errorMsg && <Alert severity="error" sx={{ borderRadius: '10px' }}>{errorMsg}</Alert>}
              {isSuccess && <Alert severity="success" sx={{ borderRadius: '10px' }}>Profile updated successfully!</Alert>}
              <TextField
                label="Business Name"
                fullWidth
                value={editForm.business_name}
                onChange={(e) => setEditForm(p => ({ ...p, business_name: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Contact Number"
                fullWidth
                value={editForm.mobile_number}
                onChange={(e) => setEditForm(p => ({ ...p, mobile_number: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Business Address"
                fullWidth
                multiline
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))}
                sx={inputSx}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: T.textSecondary, fontWeight: 700 }}>Cancel</Button>
            <Button type="submit" disabled={loading} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, '&:hover': { bgcolor: T.primaryDark } }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* KYC Dialog */}
      <Dialog open={activeModal === 'kyc'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>KYC Verification Details</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Your business profile registration is active.
            
            To upgrade your account limits, verify or submit verification documents (GSTIN, PAN, and Shop Registration certificate), please navigate to the Shop Registration dashboard or contact support.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Commissions Dialog */}
      <Dialog open={activeModal === 'commissions'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Company Commissions</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Your store is currently enrolled in the standard merchant fee structure.
            
            • Payment Gateway: 1.8% + GST per transaction
            • Referral Commission: ₹10 credit for referring new merchants
            • Franchise Partner Share: Variable based on product category
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completed Orders Dialog */}
      <Dialog open={activeModal === 'orders'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Completed Orders</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Detailed summaries, transaction receipts, and order histories are available under the Store Management panel.
            
            Tap on "Shops" on the bottom navigation bar to view your store orders and sales reporting.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={activeModal === 'terms'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Terms & Conditions</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Welcome to Trikonekt Business. By enabling store integration, you agree to:
            
            1. Deliver genuine products to customers.
            2. Maintain correct store locations and GPS coordinates.
            3. Process eligible customer refunds in accordance with standard return windows.
            
            Trikonekt reserves the right to suspend store profiles that violate local trade guidelines.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={activeModal === 'privacy'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Privacy Policy</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            We prioritize merchant data protection.
            
            We collect basic contact info, shop images, and coordinates to list your business on the customer app. We never sell your personal information or transaction history to third-party advertisers. All location-tracking services run solely to process order deliveries.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Policy Dialog */}
      <Dialog open={activeModal === 'refund'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Refund Policy</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Standard Refund Processing:
            
            Refunds for cancelled or returned customer orders are credited back to their wallet or bank accounts within 3 to 5 business days. Merchants are requested to verify return items before approving refund requests via the Shop dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Support Dialog */}
      <Dialog open={activeModal === 'contact'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Contact Us</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Trikonekt Business Support:
            
            • Phone Support: +91 8095 8095 80
            • Email Helpdesk: partners@trikonekt.com
            • Office: Indiranagar, Bangalore, India
            
            Operational Hours: 9:00 AM to 8:00 PM (Monday - Saturday)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* About Us Dialog */}
      <Dialog open={activeModal === 'about'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>About Trikonekt</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Trikonekt Merchant Portal
            Version 1.2.0 (Build 3022)
            
            We empower local offline store owners to setup digital store profiles, manage inventory catalogues, and receive hyper-local deliveries through our integrated captain and sub-franchise networks.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.primary, color: '#fff', '&:hover': { bgcolor: T.primaryDark } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation */}
      <Dialog open={activeModal === 'logout'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: T.text }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary, fontSize: 14 }}>
            Are you sure you want to log out of your business account? This will end your current session.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: T.textSecondary, fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: T.error, color: '#fff', '&:hover': { bgcolor: '#dc2626' } }}>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
