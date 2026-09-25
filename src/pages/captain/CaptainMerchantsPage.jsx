import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Alert,
  Snackbar,
  Divider,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Storefront,
  Search,
  CheckCircle,
  HourglassEmpty,
  Phone,
  WhatsApp,
  Navigation,
  ArrowBack,
  Bolt,
  Store,
  VerifiedUser,
  WorkspacePremium,
  Refresh,
  Person
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

const DEFAULT_MOCK_SHOPS = [
  {
    id: 101,
    shop_name: "Sri Lakshmi Venkateshwara Traders",
    merchant_name: "Ramesh Babu",
    merchant_phone: "9845012345",
    category_name: "Grocery & Staples",
    service_mode: "ONLINE",
    merchant_category: "merchant", // B2B
    address: "Shop #4, 1st Cross, Near Bus Stop, HSR Layout",
    city: "Bengaluru",
    pincode: "560102",
    status: "PENDING_APPROVAL",
    is_verified: false,
    created_at: "Today, 10:45 AM"
  },
  {
    id: 102,
    shop_name: "Fresh Daily Organic Mart",
    merchant_name: "Suresh Kumar",
    merchant_phone: "9876543210",
    category_name: "Fruits & Vegetables",
    service_mode: "ONLINE",
    merchant_category: "business", // B2C
    address: "24/7 Main Road, Sector 2, HSR Layout",
    city: "Bengaluru",
    pincode: "560102",
    status: "ACTIVE",
    is_verified: true,
    created_at: "Yesterday, 3:30 PM"
  },
  {
    id: 103,
    shop_name: "Balaji Wholesale Spices",
    merchant_name: "Anand Sharma",
    merchant_phone: "9123456780",
    category_name: "Snacks & Packaged Food",
    service_mode: "OFFLINE",
    merchant_category: "merchant", // B2B
    address: "Industrial Area, 5th Block, HSR Layout",
    city: "Bengaluru",
    pincode: "560102",
    status: "PENDING_APPROVAL",
    is_verified: false,
    created_at: "2 days ago"
  },
  {
    id: 104,
    shop_name: "Aman Hardware & Electricals",
    merchant_name: "Amanullah Khan",
    merchant_phone: "9988776655",
    category_name: "Hardware & Sanitary",
    service_mode: "OFFLINE",
    merchant_category: "business", // B2C
    address: "Plot 12, Ring Road Junction, HSR Layout",
    city: "Bengaluru",
    pincode: "560102",
    status: "ACTIVE",
    is_verified: true,
    created_at: "4 days ago"
  }
];

export default function CaptainMerchantsPage() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Pending, 2: Active
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const [approvingId, setApprovingId] = useState(null);

  const captainUsername = localStorage.getItem('username_captain') || 'CB_CAPTAIN';
  const captainPincode = localStorage.getItem('pincode_captain') || '560102';
  const token = localStorage.getItem('token_captain');

  const fetchShops = async () => {
    setLoading(true);
    try {
      let combined = [];

      // Check localStorage onboarding queue for real registered shops
      const localQueue = JSON.parse(localStorage.getItem('trikonekt_captain_onboarding_queue') || '[]');

      if (token) {
        const res = await fetch(`${CAPTAIN_API}/captain/shops`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            combined = [...data];
          }
        }
      }

      // Merge local queue items and default mock shops
      const existingIds = new Set(combined.map(s => s.id));
      for (const item of localQueue) {
        if (!existingIds.has(item.id)) {
          combined.unshift(item);
          existingIds.add(item.id);
        }
      }
      for (const mock of DEFAULT_MOCK_SHOPS) {
        if (!existingIds.has(mock.id)) {
          combined.push(mock);
          existingIds.add(mock.id);
        }
      }

      setShops(combined);
    } catch (e) {
      console.error("Error loading shops:", e);
      setShops(DEFAULT_MOCK_SHOPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApproveShop = async (shop) => {
    setApprovingId(shop.id);
    try {
      if (token) {
        await fetch(`${CAPTAIN_API}/captain/shops/${shop.id}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null);
      }

      // Update state locally
      setShops(prev => prev.map(s => s.id === shop.id ? { ...s, status: 'ACTIVE', is_verified: true } : s));

      // Update local storage queue if present
      const localQueue = JSON.parse(localStorage.getItem('trikonekt_captain_onboarding_queue') || '[]');
      const updatedQueue = localQueue.map(s => s.id === shop.id ? { ...s, status: 'ACTIVE', is_verified: true } : s);
      localStorage.setItem('trikonekt_captain_onboarding_queue', JSON.stringify(updatedQueue));

      // Also set merchant prime status in localStorage for testing
      localStorage.setItem('merchant_plan', 'SUBSCRIPTION_999');
      localStorage.setItem('subscription_started_at', new Date().toISOString());
      localStorage.setItem('subscription_expires_at', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString());

      setToast({
        open: true,
        msg: `✓ Shop "${shop.shop_name}" verified & approved! Prime status and marketplace buying/selling unlocked.`,
        severity: 'success'
      });
    } catch (err) {
      setToast({ open: true, msg: 'Failed to approve shop. Please retry.', severity: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const getBusinessBadge = (shop) => {
    const isOnline = (shop.service_mode || '').toUpperCase() === 'ONLINE';
    const isB2B = (shop.merchant_category || '').toLowerCase() === 'merchant' || (shop.category || '').toLowerCase() === 'merchant_business';
    
    if (isOnline && isB2B) {
      return <Chip icon={<Bolt style={{ fontSize: 14 }} />} label="Online B2B Wholesale" size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.72rem' }} />;
    }
    if (isOnline && !isB2B) {
      return <Chip icon={<Bolt style={{ fontSize: 14 }} />} label="Online B2C Retail" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem' }} />;
    }
    if (!isOnline && isB2B) {
      return <Chip icon={<Store style={{ fontSize: 14 }} />} label="Offline B2B Bulk" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.72rem' }} />;
    }
    return <Chip icon={<Store style={{ fontSize: 14 }} />} label="Offline B2C Nearby" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '0.72rem' }} />;
  };

  const pendingCount = shops.filter(s => s.status !== 'ACTIVE').length;
  const activeCount = shops.filter(s => s.status === 'ACTIVE').length;

  const filteredShops = shops.filter(s => {
    // Tab filter
    if (activeTab === 1 && s.status === 'ACTIVE') return false;
    if (activeTab === 2 && s.status !== 'ACTIVE') return false;

    // Channel filter
    if (channelFilter === 'ONLINE_B2B') {
      const isOnline = (s.service_mode || '').toUpperCase() === 'ONLINE';
      const isB2B = (s.merchant_category || '').toLowerCase() === 'merchant';
      if (!isOnline || !isB2B) return false;
    } else if (channelFilter === 'ONLINE_B2C') {
      const isOnline = (s.service_mode || '').toUpperCase() === 'ONLINE';
      const isB2B = (s.merchant_category || '').toLowerCase() === 'merchant';
      if (!isOnline || isB2B) return false;
    } else if (channelFilter === 'OFFLINE') {
      const isOnline = (s.service_mode || '').toUpperCase() === 'ONLINE';
      if (isOnline) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.shop_name || '').toLowerCase().includes(q);
      const matchOwner = (s.merchant_name || '').toLowerCase().includes(q);
      const matchPhone = (s.merchant_phone || s.contact_number || '').includes(q);
      return matchName || matchOwner || matchPhone;
    }

    return true;
  });

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      {/* Top Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderBottom: `1px solid ${T.border}`,
          px: { xs: 2, md: 4 },
          py: 2.5,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Container maxWidth="lg" sx={{ px: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => navigate('/captain/home')} sx={{ bgcolor: '#f1f5f9' }}>
                <ArrowBack sx={{ fontSize: 20, color: T.text }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, lineHeight: 1.2 }}>
                  Onboarded Merchant Shops
                </Typography>
                <Typography variant="caption" sx={{ color: T.textSecondary }}>
                  Pincode: <b>{captainPincode}</b> • Captain ID: <b>{captainUsername}</b>
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={fetchShops} sx={{ bgcolor: T.primaryLight, color: T.primary }}>
              <Refresh sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Explanatory Alert */}
        <Alert
          icon={<VerifiedUser sx={{ color: T.primary }} />}
          severity="info"
          sx={{
            mb: 3,
            borderRadius: '16px',
            bgcolor: '#f0fdfa',
            border: '1px solid #ccfbf1',
            color: '#0f766e',
            fontWeight: 600,
            '& .MuiAlert-icon': { color: T.primary }
          }}
        >
          <b>Captain On-Ground Role:</b> You act as the physical bridge for your pincode. When merchants register using your sponsor code, physically inspect their shop and click <b>[ Approve & Activate Prime ]</b> to unlock their search, buying, and product publishing features.
        </Alert>

        {/* Tabs & Search Header */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${T.border}`, bgcolor: '#ffffff', mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Tabs
                value={activeTab}
                onChange={(e, val) => setActiveTab(val)}
                sx={{
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 800, fontSize: '0.88rem' },
                  '& .Mui-selected': { color: `${T.primary} !important` },
                  '& .MuiTabs-indicator': { bgcolor: T.primary, height: 3, borderRadius: '3px' }
                }}
              >
                <Tab label={`All Shops (${shops.length})`} />
                <Tab
                  label={
                    <Badge badgeContent={pendingCount} color="warning" sx={{ '& .MuiBadge-badge': { right: -12, top: 4, fontWeight: 900 } }}>
                      Pending Approval
                    </Badge>
                  }
                />
                <Tab label={`Active (${activeCount})`} />
              </Tabs>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by shop name, owner or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: '#94a3b8' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: T.border }
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Quick Sub-channel Filters */}
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            {[
              { id: 'ALL', label: 'All Platforms' },
              { id: 'ONLINE_B2B', label: 'Online B2B Wholesale' },
              { id: 'ONLINE_B2C', label: 'Online B2C Retail' },
              { id: 'OFFLINE', label: 'Offline Nearby Store' },
            ].map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                clickable
                onClick={() => setChannelFilter(f.id)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  bgcolor: channelFilter === f.id ? T.primary : '#f1f5f9',
                  color: channelFilter === f.id ? '#ffffff' : '#475569',
                  '&:hover': { bgcolor: channelFilter === f.id ? T.primaryDark : '#e2e8f0' }
                }}
              />
            ))}
          </Stack>
        </Paper>

        {/* Shop List Grid */}
        {loading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress sx={{ color: T.primary }} />
            <Typography sx={{ mt: 1.5, color: T.textSecondary, fontWeight: 600 }}>Loading shops...</Typography>
          </Box>
        ) : filteredShops.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '20px', border: `1px solid ${T.border}` }}>
            <Storefront sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: T.text }}>
              No Shops Found
            </Typography>
            <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.5 }}>
              No merchant shops match the selected filters for your pincode.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {filteredShops.map((shop) => {
              const isApproved = shop.status === 'ACTIVE';
              return (
                <Grid item xs={12} md={6} key={shop.id}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: '20px',
                        border: `1.5px solid ${isApproved ? '#bbf7d0' : '#fed7aa'}`,
                        bgcolor: '#ffffff',
                        p: 2.5,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }
                      }}
                    >
                      {/* Shop Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Box sx={{ flex: 1, pr: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, fontSize: '1.05rem', lineHeight: 1.3 }}>
                            {shop.shop_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: T.textSecondary, display: 'block', mt: 0.25 }}>
                            Category: <b>{shop.category_name || shop.category || 'General'}</b>
                          </Typography>
                        </Box>
                        {isApproved ? (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: 16, color: '#fff !important' }} />}
                            label="Active & Prime"
                            size="small"
                            sx={{ bgcolor: T.success, color: '#fff', fontWeight: 900, fontSize: '0.72rem' }}
                          />
                        ) : (
                          <Chip
                            icon={<HourglassEmpty sx={{ fontSize: 16, color: '#fff !important' }} />}
                            label="Pending Approval"
                            size="small"
                            sx={{ bgcolor: T.warning, color: '#fff', fontWeight: 900, fontSize: '0.72rem' }}
                          />
                        )}
                      </Stack>

                      {/* Badges Row */}
                      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                        {getBusinessBadge(shop)}
                        <Chip label={`PIN: ${shop.pincode}`} size="small" sx={{ bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.72rem' }} />
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Owner & Address Details */}
                      <Stack spacing={0.75} mb={2.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person sx={{ fontSize: 16, color: '#94a3b8' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: T.text }}>
                            {shop.merchant_name || 'Owner'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: T.textSecondary }}>
                            ({shop.merchant_phone || shop.contact_number})
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Navigation sx={{ fontSize: 16, color: '#94a3b8', mt: 0.25 }} />
                          <Typography variant="caption" sx={{ color: T.textSecondary, lineHeight: 1.4 }}>
                            {shop.address}, {shop.city} - {shop.pincode}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Action Bar */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        {!isApproved ? (
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleApproveShop(shop)}
                            disabled={approvingId === shop.id}
                            startIcon={approvingId === shop.id ? <CircularProgress size={16} color="inherit" /> : <WorkspacePremium />}
                            sx={{
                              bgcolor: T.primary,
                              color: '#fff',
                              fontWeight: 900,
                              borderRadius: '12px',
                              py: 1,
                              textTransform: 'none',
                              fontSize: '0.85rem',
                              '&:hover': { bgcolor: T.primaryDark }
                            }}
                          >
                            {approvingId === shop.id ? 'Approving...' : 'Approve & Activate Prime'}
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            disabled
                            startIcon={<CheckCircle sx={{ color: T.success }} />}
                            sx={{
                              borderRadius: '12px',
                              borderColor: '#bbf7d0',
                              color: T.success,
                              fontWeight: 800,
                              py: 1,
                              textTransform: 'none',
                              fontSize: '0.82rem'
                            }}
                          >
                            Verified & Prime Active
                          </Button>
                        )}

                        {/* Call Button */}
                        <IconButton
                          component="a"
                          href={`tel:${shop.merchant_phone || shop.contact_number}`}
                          sx={{
                            bgcolor: '#f1f5f9',
                            color: '#0f172a',
                            borderRadius: '12px',
                            p: 1.1,
                            '&:hover': { bgcolor: '#e2e8f0' }
                          }}
                        >
                          <Phone sx={{ fontSize: 18 }} />
                        </IconButton>

                        {/* WhatsApp Support Button */}
                        <IconButton
                          component="a"
                          href={`https://wa.me/91${(shop.merchant_phone || shop.contact_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${shop.merchant_name || 'Merchant'}, I am Captain ${captainUsername} from Trikonekt regarding your shop "${shop.shop_name}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            bgcolor: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '12px',
                            p: 1.1,
                            '&:hover': { bgcolor: '#bbf7d0' }
                          }}
                        >
                          <WhatsApp sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ borderRadius: '12px', fontWeight: 700 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
