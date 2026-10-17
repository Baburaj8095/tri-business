import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Chip, IconButton, Badge,
  Menu, MenuItem, Stack, CircularProgress, Alert, Button, Snackbar,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Search as SearchIcon,
  Tune as FilterIcon,
  Map as MapIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  QrCode2 as QrIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { getCaptainShops, approveCaptainShop } from '../../api/api';
import CaptainReferralModal from './components/CaptainReferralModal';
import CaptainHeader from './components/CaptainHeader';

export default function CaptainMerchantsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const handleDirectApprove = async (shopId, shopName) => {
    try {
      setApprovingId(shopId);
      await approveCaptainShop(shopId);
      setMerchants(prev =>
        prev.map(m =>
          m.id === String(shopId)
            ? { ...m, status: 'ACTIVE', kycVerified: true, qrActive: true }
            : m
        )
      );
      setSuccessToast(`✓ "${shopName}" verified & activated! QR Standee is now live.`);
    } catch (err) {
      setError(`Failed to approve ${shopName}: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCaptainShops();
      if (Array.isArray(data)) {
        const formatted = data.map(s => {
          const st = String(s.status || 'PENDING').toUpperCase();
          const addr = [s.address, s.city, s.pincode].filter(Boolean).join(', ');
          return {
            id: String(s.id),
            name: s.shop_name || 'Merchant Shop',
            status: st,
            category: s.category_name || s.merchant_category || 'Retail Store',
            area: s.city || s.address || 'Bengaluru',
            distance: s.pincode ? `PIN: ${s.pincode}` : 'Local',
            rating: '4.8',
            reviews: 12,
            orders: 15,
            monthlySales: st === 'ACTIVE' ? 'Active' : 'Pending',
            healthScore: st === 'ACTIVE' ? 92 : 60,
            kycVerified: Boolean(s.is_verified),
            qrActive: st === 'ACTIVE',
            address: addr || 'Address on file',
            hours: '08:00 AM - 10:00 PM',
            ownerName: s.merchant_name || 'Store Owner',
            ownerPhone: s.merchant_phone || s.contact_number || '',
            image: s.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60',
          };
        });
        setMerchants(formatted);
      } else {
        setMerchants([]);
      }
    } catch (err) {
      console.warn('[CaptainMerchantsPage] Failed to fetch live shops:', err.message);
      setError('Unable to load live shops from server. Showing assigned directory.');
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const initialFilter = searchParams.get('filter');
  const getFilterId = () => {
    if (initialFilter === 'active') return 'ACTIVE';
    if (initialFilter === 'pending') return 'PENDING';
    if (initialFilter === 'attention') return 'NEEDS_ATTENTION';
    return 'ALL';
  };

  const [activeFilter, setActiveFilter] = useState(getFilterId);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAnchor, setSortAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('Last Activity');

  // Dynamic Counts
  const counts = useMemo(() => {
    const all = merchants.length;
    const active = merchants.filter(m => m.status === 'ACTIVE').length;
    const pending = merchants.filter(m => m.status === 'PENDING' || !m.kycVerified).length;
    const attention = merchants.filter(m => m.status === 'INACTIVE' || m.status === 'NEEDS_ATTENTION' || m.status === 'REJECTED').length;
    return { all, active, pending, attention };
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.ownerPhone.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'ACTIVE') return m.status === 'ACTIVE';
      if (activeFilter === 'PENDING') return m.status === 'PENDING' || !m.kycVerified;
      if (activeFilter === 'NEEDS_ATTENTION') return m.status === 'NEEDS_ATTENTION' || m.status === 'INACTIVE' || m.status === 'REJECTED';
      return true;
    });
  }, [merchants, searchQuery, activeFilter]);

  return (
    <Box sx={{ pb: 3 }}>

      {/* ── Top Header Bar (Unified Captain Illustrated Header) ── */}
      <CaptainHeader
        onRefresh={fetchShops}
        refreshLoading={loading}
        rightActions={
          <Button
            size="small"
            startIcon={<ShareIcon sx={{ fontSize: 15 }} />}
            onClick={() => setReferralModalOpen(true)}
            sx={{
              bgcolor: '#EA580C',
              color: '#ffffff',
              borderRadius: '999px',
              px: 1.5,
              py: 0.5,
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
              '&:hover': { bgcolor: '#C2410C' },
            }}
          >
            Refer Merchant
          </Button>
        }
        subtitle={`Merchant Network • ${merchants.length} Stores Assigned`}
      />

      {/* ── Page Content Container ── */}
      <Box sx={{ px: 2, mt: 2 }}>

        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.78rem' }}>
            {error}
          </Alert>
        )}

        {/* ── Search Input Bar (Matches Mockup Screen 2) ── */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          px: 1.5,
          py: 0.4,
          mb: 1.8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
          <TextField
            fullWidth
            variant="standard"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search merchants by name, area or category..."
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' },
            }}
          />
          <IconButton size="small" sx={{ color: '#64748b', p: 0.5 }}>
            <FilterIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Filter Pills (Exact Match to Mockup Screen 2) ── */}
        <Box sx={{
          display: 'flex',
          gap: 0.8,
          overflowX: 'auto',
          pb: 1.5,
          '::-webkit-scrollbar': { display: 'none' },
        }}>
          {[
            { id: 'ALL', label: `All (${counts.all})` },
            { id: 'ACTIVE', label: `Active (${counts.active})` },
            { id: 'PENDING', label: `Pending (${counts.pending})` },
            { id: 'NEEDS_ATTENTION', label: `Needs Attention (${counts.attention})` },
          ].map(tab => (
            <Chip
              key={tab.id}
              label={tab.label}
              onClick={() => setActiveFilter(tab.id)}
              sx={{
                bgcolor: activeFilter === tab.id ? '#EA580C' : '#ffffff',
                color: activeFilter === tab.id ? '#ffffff' : '#64748b',
                border: activeFilter === tab.id ? 'none' : '1px solid #e2e8f0',
                fontWeight: 700,
                fontSize: '0.76rem',
                height: 32,
                cursor: 'pointer',
                boxShadow: activeFilter === tab.id ? '0 2px 6px rgba(234, 88, 12, 0.25)' : 'none',
                '&:hover': { bgcolor: activeFilter === tab.id ? '#C2410C' : '#f8fafc' },
              }}
            />
          ))}
        </Box>

        {/* ── Interactive Map View / Preview Card (Matches Mockup Screen 2) ── */}
        <Box sx={{
          position: 'relative',
          borderRadius: '18px',
          height: 120,
          background: 'linear-gradient(135deg, #e0f2fe 0%, #FFF7ED 100%)',
          border: '1.5px solid #cbd5e1',
          overflow: 'hidden',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          {/* Map grid lines graphic */}
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(#EA580C 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }} />

          {/* Map pins */}
          <Box sx={{ position: 'absolute', top: 20, left: 40, color: '#3b82f6', fontSize: 18 }}>📍</Box>
          <Box sx={{ position: 'absolute', top: 35, left: 140, color: '#EA580C', fontSize: 22 }}>📍</Box>
          <Box sx={{ position: 'absolute', top: 25, right: 80, color: '#f59e0b', fontSize: 20 }}>📍</Box>

          <Box />

          <Box sx={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{
              bgcolor: 'rgba(255, 255, 255, 0.92)', px: 1.2, py: 0.4,
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 0.5,
              backdropFilter: 'blur(4px)', border: '1px solid rgba(255, 255, 255, 0.8)',
            }}>
              <LocationIcon sx={{ fontSize: 14, color: '#EA580C' }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
                Bengaluru, Karnataka
              </Typography>
            </Box>

            <Box sx={{
              bgcolor: '#EA580C', color: '#ffffff', px: 1.5, py: 0.5,
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 0.6,
              fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
              '&:hover': { bgcolor: '#C2410C' },
            }}>
              <MapIcon sx={{ fontSize: 14 }} />
              Map View
            </Box>
          </Box>
        </Box>

        {/* ── Merchant List Section Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.96rem', color: '#0f172a' }}>
            Merchants ({filteredMerchants.length})
          </Typography>

          <Box
            onClick={(e) => setSortAnchor(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}
          >
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
              Sort: <strong style={{ color: '#0f172a' }}>{sortBy}</strong> ⌵
            </Typography>
          </Box>

          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
          >
            {['Last Activity', 'Highest Orders', 'Rating', 'Health Score'].map(opt => (
              <MenuItem key={opt} onClick={() => { setSortBy(opt); setSortAnchor(null); }} sx={{ fontSize: '0.82rem' }}>
                {opt}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* ── List of Merchant Cards ── */}
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#EA580C', mb: 2 }} />
            <Typography sx={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
              Loading assigned merchants...
            </Typography>
          </Box>
        ) : filteredMerchants.length === 0 ? (
          <Box sx={{
            bgcolor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px dashed #cbd5e1',
            p: 4,
            textAlign: 'center',
            my: 2,
          }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#FFF7ED',
              color: '#EA580C',
              display: 'grid',
              placeItems: 'center',
              mx: 'auto',
              mb: 2,
            }}>
              <QrIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a', mb: 0.5 }}>
              No Merchants Found
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', maxWidth: 300, mx: 'auto', mb: 2.5 }}>
              {activeFilter !== 'ALL'
                ? `No merchants match the "${activeFilter}" filter in your assigned network.`
                : 'No merchants have been registered in your pincode yet. Onboard your first merchant store now.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={() => setReferralModalOpen(true)}
              sx={{
                bgcolor: '#EA580C',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 2.5,
                py: 1,
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                '&:hover': { bgcolor: '#C2410C' },
              }}
            >
              Refer Merchant Store
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.8}>
            {filteredMerchants.map(merchant => (
              <Box
                key={merchant.id}
                onClick={() => navigate(`/captain/merchant/${merchant.id}`)}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #e2e8f0',
                  p: 1.8,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: '#cbd5e1', transform: 'translateY(-1px)' },
                }}
              >
                {/* Top row: Thumbnail, Name, Status Pill, Category, Distance, Rating */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                  <Box
                    component="img"
                    src={merchant.image}
                    alt={merchant.name}
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '1px solid #f1f5f9',
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {merchant.name}
                      </Typography>

                      <Chip
                        label={merchant.status === 'ACTIVE' ? 'Active' : merchant.status === 'PENDING' ? 'Pending Approval' : merchant.status === 'INACTIVE' ? 'Inactive' : 'Needs Attention'}
                        size="small"
                        sx={{
                          bgcolor: merchant.status === 'ACTIVE' ? '#dcfce7' : merchant.status === 'PENDING' ? '#fef3c7' : merchant.status === 'INACTIVE' ? '#fee2e2' : '#fef3c7',
                          color: merchant.status === 'ACTIVE' ? '#15803d' : merchant.status === 'PENDING' ? '#b45309' : merchant.status === 'INACTIVE' ? '#b91c1c' : '#b45309',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 20,
                        }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, mb: 0.3 }}>
                      {merchant.category}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                        {merchant.area} • {merchant.distance}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#eab308' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#0f172a' }}>
                          {merchant.rating}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 20, alignSelf: 'center' }} />
                </Box>

                {/* 3-Column Metrics (Orders | Monthly Sales | Health Score) */}
                <Box sx={{
                  bgcolor: '#f8fafc',
                  borderRadius: '12px',
                  p: 1.2,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  textAlign: 'center',
                  mb: 1.2,
                }}>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                      {merchant.orders}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                      Orders
                    </Typography>
                  </Box>
                  <Box sx={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                      {merchant.monthlySales}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                      Monthly Sales
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{
                      fontWeight: 900,
                      fontSize: '0.94rem',
                      color: merchant.healthScore >= 80 ? '#16a34a' : merchant.healthScore >= 60 ? '#f59e0b' : '#dc2626',
                    }}>
                      {merchant.healthScore}%
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                      Health Score
                    </Typography>
                  </Box>
                </Box>

                {/* Badges: KYC Verified + QR Active (Exact Match to Mockup) */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.5,
                      bgcolor: merchant.kycVerified ? '#dcfce7' : '#fef3c7',
                      color: merchant.kycVerified ? '#15803d' : '#b45309',
                      px: 1, py: 0.3, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {merchant.kycVerified ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : <WarningIcon sx={{ fontSize: 13 }} />}
                      {merchant.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                    </Box>

                    <Box sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.5,
                      bgcolor: merchant.qrActive ? '#eff6ff' : '#fef2f2',
                      color: merchant.qrActive ? '#1d4ed8' : '#b91c1c',
                      px: 1, py: 0.3, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      <QrIcon sx={{ fontSize: 13 }} />
                      {merchant.qrActive ? 'QR Active' : 'QR Inactive'}
                    </Box>
                  </Box>

                  {/* 1-Click Direct Approval Button on Card */}
                  {merchant.status !== 'ACTIVE' && (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={approvingId === merchant.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectApprove(merchant.id, merchant.name);
                      }}
                      startIcon={approvingId === merchant.id ? <CircularProgress size={12} sx={{ color: '#ffffff' }} /> : <CheckCircleIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        bgcolor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 1.5,
                        py: 0.4,
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                        '&:hover': { bgcolor: '#15803d' },
                      }}
                    >
                      {approvingId === merchant.id ? 'Activating...' : 'Approve & Activate'}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        )}

      </Box>

      {/* ── Success Toast Notification ── */}
      <Snackbar
        open={Boolean(successToast)}
        autoHideDuration={4000}
        onClose={() => setSuccessToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: '12px' }}>
          {successToast}
        </Alert>
      </Snackbar>

      {/* ── Captain Merchant Referral Modal ── */}
      <CaptainReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        captainId={localStorage.getItem('username_captain')}
        captainName={localStorage.getItem('fullname_captain')}
      />
    </Box>
  );
}
