import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Chip, IconButton, Badge,
  Menu, MenuItem, Button, Stack, CircularProgress,
} from '@mui/material';
import {
  Notifications as BellIcon,
  ChatBubbleOutline as ChatIcon,
  Store as StoreIcon,
  CheckCircle as ActiveIcon,
  ShoppingCart as CartIcon,
  QrCodeScanner as QrIcon,
  AssignmentLate as TaskIcon,
  NotificationsActive as AlertIcon,
  ChevronRight as ChevronRightIcon,
  VerifiedUser as KycActionIcon,
  Storefront as FollowupActionIcon,
  LocalShipping as DeliveryActionIcon,
  QrCode2 as ScannerActionIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { getCaptainDailyBusiness, getCaptainShops } from '../../api/api';
import CaptainReferralModal from './components/CaptainReferralModal';
import CaptainHeader from './components/CaptainHeader';

export default function CaptainHome() {
  const navigate = useNavigate();

  const [captainName, setCaptainName] = useState(localStorage.getItem('fullname_captain') || 'Captain');
  const [captainId, setCaptainId] = useState(localStorage.getItem('username_captain') || '');
  const [locationName, setLocationName] = useState('Territory Assigned');
  const [referralOpen, setReferralOpen] = useState(false);

  // Live stats from backend
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    pendingShops: 0,
    inactiveShops: 0,
    todayOrders: 0,
    todayGmv: 0,
    qrScans: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchLiveHomeData = async () => {
    try {
      setLoading(true);
      const [shopsRes, dailyRes] = await Promise.allSettled([
        getCaptainShops(),
        getCaptainDailyBusiness(),
      ]);

      let shopsList = [];
      if (shopsRes.status === 'fulfilled' && Array.isArray(shopsRes.value)) {
        shopsList = shopsRes.value;
      }

      let daily = {};
      if (dailyRes.status === 'fulfilled' && dailyRes.value) {
        daily = dailyRes.value;
      }

      const activeCount = shopsList.filter(s => String(s.status).toUpperCase() === 'ACTIVE').length;
      const pendingCount = shopsList.filter(s => String(s.status).toUpperCase() === 'PENDING' || !s.is_verified).length;
      const inactiveCount = shopsList.filter(s => String(s.status).toUpperCase() === 'INACTIVE').length;

      const ordersCount = daily.todayOrdersCount ?? daily.todayOrders ?? 0;
      const gmvEstimate = daily.todayGmvEstimate ?? daily.todayGmv ?? 0;
      const qrScansCount = daily.qrScans ?? 0;

      setStats({
        totalShops: daily.totalShops || shopsList.length,
        activeShops: activeCount,
        pendingShops: pendingCount,
        inactiveShops: inactiveCount,
        todayOrders: ordersCount,
        todayGmv: gmvEstimate,
        qrScans: qrScansCount,
      });

      if (daily.pincode) {
        setLocationName(`Pincode: ${daily.pincode}`);
      }
    } catch (err) {
      console.warn('[CaptainHome] Data fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem('fullname_captain');
    const storedId = localStorage.getItem('username_captain');
    if (storedName) setCaptainName(storedName);
    if (storedId) setCaptainId(storedId);

    fetchLiveHomeData();
  }, []);


  return (
    <Box sx={{ pb: 3 }}>

      {/* ── Top Curved Light Illustrated Hero Card (Exact Match to Mockup) ── */}
      <CaptainHeader
        captainName={captainName}
        pincode={stats.pincode}
      >
        {/* Row 3: "Grow Your Network" Section (Integrated seamlessly) */}
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '72%', sm: '64%' } }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.22rem', color: '#9A3412', mb: 0.4 }}>
            Grow Your Network
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, mb: 1.8, fontWeight: 500 }}>
            Share your Captain Sponsor Link to onboard merchants instantly. Your referral code is pre-filled.
          </Typography>
          <Stack direction="row" spacing={1.2}>
            <Button
              onClick={() => setReferralOpen(true)}
              startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#EA580C',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: '12px',
                px: 2,
                py: 0.8,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                '&:hover': { bgcolor: '#C2410C' },
              }}
            >
              Refer Merchant
            </Button>
            <Button
              onClick={() => navigate('/captain/analytics')}
              startIcon={<TrendUpIcon sx={{ fontSize: 16, color: '#EA580C' }} />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: '#EA580C',
                fontWeight: 800,
                fontSize: '0.76rem',
                textTransform: 'none',
                borderRadius: '12px',
                px: 1.8,
                py: 0.8,
                border: '1.5px solid #FED7AA',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                '&:hover': { bgcolor: '#ffffff', borderColor: '#FDBA74' },
              }}
            >
              View Analytics
            </Button>
          </Stack>
        </Box>
      </CaptainHeader>

      {/* ── Page Content Container ── */}
      <Box sx={{ px: 2, mt: 1 }}>

        {/* ── 6 Metric Cards (Live Real Data: 100% Equal Size CSS Grid) ── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.2,
          mb: 2.5,
          width: '100%',
        }}>
          {[
            {
              title: 'Merchants Onboarded',
              val: String(stats.totalShops),
              badge: 'Onboarded',
              badgeColor: '#EA580C',
              badgeBg: '#FFF7ED',
              icon: <StoreIcon sx={{ fontSize: 20, color: '#EA580C' }} />,
              iconBg: '#FFF7ED',
              onClick: () => navigate('/captain/merchants'),
            },
            {
              title: 'Active Stores',
              val: String(stats.activeShops),
              badge: 'Live',
              badgeColor: '#16a34a',
              badgeBg: '#f0fdf4',
              icon: <ActiveIcon sx={{ fontSize: 20, color: '#16a34a' }} />,
              iconBg: '#f0fdf4',
              onClick: () => navigate('/captain/merchants?filter=active'),
            },
            {
              title: 'Total Orders',
              val: String(stats.todayOrders),
              badge: 'This Month',
              badgeColor: '#2563eb',
              badgeBg: '#eff6ff',
              icon: <CartIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
              iconBg: '#eff6ff',
              onClick: () => navigate('/captain/analytics'),
            },
            {
              title: 'Estimated GMV',
              val: stats.todayGmv ? `₹${Number(stats.todayGmv).toLocaleString('en-IN')}` : '₹0',
              badge: 'Turnover',
              badgeColor: '#16a34a',
              badgeBg: '#f0fdf4',
              icon: <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#16a34a' }}>₹</Typography>,
              iconBg: '#f0fdf4',
              onClick: () => navigate('/captain/analytics'),
            },
            {
              title: 'QR Scans',
              val: stats.qrScans ? Number(stats.qrScans).toLocaleString('en-IN') : '0',
              badge: 'Standee',
              badgeColor: '#0891b2',
              badgeBg: '#ecfeff',
              icon: <QrIcon sx={{ fontSize: 20, color: '#06b6d4' }} />,
              iconBg: '#ecfeff',
              onClick: () => navigate('/captain/analytics'),
            },
            {
              title: 'Pending Action',
              val: String(stats.pendingShops),
              badge: stats.pendingShops > 0 ? 'Review' : 'Clear',
              badgeColor: stats.pendingShops > 0 ? '#dc2626' : '#16a34a',
              badgeBg: stats.pendingShops > 0 ? '#fef2f2' : '#f0fdf4',
              icon: <TaskIcon sx={{ fontSize: 20, color: stats.pendingShops > 0 ? '#dc2626' : '#16a34a' }} />,
              iconBg: stats.pendingShops > 0 ? '#fef2f2' : '#f0fdf4',
              onClick: () => navigate('/captain/merchants?filter=pending'),
            },
          ].map((card, i) => (
            <Box
              key={i}
              onClick={card.onClick}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '16px',
                p: 1.2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 126,
                height: '100%',
                boxSizing: 'border-box',
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', bgcolor: card.iconBg,
                display: 'grid', placeItems: 'center', mb: 0.8,
              }}>
                {card.icon}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.02rem', sm: '1.15rem' },
                    color: '#0f172a',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {card.val}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.66rem',
                    color: '#64748b',
                    fontWeight: 600,
                    mt: 0.3,
                    mb: 0.6,
                    lineHeight: 1.15,
                    height: '24px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {card.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={card.badge}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: card.badgeColor,
                      bgcolor: card.badgeBg,
                      borderRadius: '6px',
                      px: 0.2,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── KYC Approvals Pending Banner (Exact Match to Mockup Screen 1) ── */}
        <Box
          onClick={() => navigate('/captain/merchants?filter=pending')}
          sx={{
            bgcolor: '#fff7ed',
            border: '1.5px solid #fed7aa',
            borderRadius: '16px',
            p: 1.8,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            mb: 3,
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
          }}
        >
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px', bgcolor: '#ffedd5',
            display: 'grid', placeItems: 'center', color: '#ea580c', flexShrink: 0,
          }}>
            <AlertIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#9a3412' }}>
              KYC Approvals Pending
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 500 }}>
              {stats.pendingShops > 0
                ? `${stats.pendingShops} merchant${stats.pendingShops > 1 ? 's' : ''} awaiting verification`
                : 'All merchant verifications up to date'}
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ color: '#ea580c' }} />
        </Box>

        {/* ── Action Center Section (Exact Match to Mockup Screen 1) ── */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
              Action Center
            </Typography>
            <Typography
              onClick={() => navigate('/captain/merchants')}
              sx={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800, cursor: 'pointer' }}
            >
              See All
            </Typography>
          </Box>

          <Stack spacing={1.3}>
            {[
              {
                icon: <KycActionIcon sx={{ fontSize: 20, color: '#7c3aed' }} />,
                iconBg: '#f5f3ff',
                title: 'KYC Approvals',
                badge: stats.pendingShops > 0 ? String(stats.pendingShops) : null,
                badgeBg: '#ef4444',
                desc: 'Verify pending merchant documents',
                onClick: () => navigate('/captain/merchants?filter=pending'),
              },
              {
                icon: <FollowupActionIcon sx={{ fontSize: 20, color: '#16a34a' }} />,
                iconBg: '#f0fdf4',
                title: 'Merchant Follow-ups',
                badge: stats.inactiveShops > 0 ? String(stats.inactiveShops) : null,
                badgeBg: '#f59e0b',
                desc: 'Inactive merchants needing attention',
                onClick: () => navigate('/captain/merchants?filter=attention'),
              },
              {
                icon: <DeliveryActionIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
                iconBg: '#eff6ff',
                title: 'Delivery Issues',
                badge: null,
                badgeBg: '#ef4444',
                desc: 'Resolve order delivery issues',
                onClick: () => navigate('/captain/delivery-issues'),
              },
              {
                icon: <ScannerActionIcon sx={{ fontSize: 20, color: '#0891b2' }} />,
                iconBg: '#ecfeff',
                title: 'Scanner Activation',
                badge: null,
                badgeBg: '#2563eb',
                desc: 'Install and activate QR scanners',
                onClick: () => navigate('/scanner'),
              },
            ].map((action, i) => (
              <Box
                key={i}
                onClick={action.onClick}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '16px',
                  p: 1.6,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                }}
              >
                <Box sx={{
                  width: 38, height: 38, borderRadius: '10px', bgcolor: action.iconBg,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  {action.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                      {action.title}
                    </Typography>
                    {action.badge && (
                      <Box sx={{
                        width: 18, height: 18, borderRadius: '50%', bgcolor: action.badgeBg,
                        color: '#ffffff', fontSize: '0.66rem', fontWeight: 900,
                        display: 'grid', placeItems: 'center',
                      }}>
                        {action.badge}
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                    {action.desc}
                  </Typography>
                </Box>
                <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </Box>
            ))}
          </Stack>
        </Box>

      </Box>

      {/* ── Captain Referral Modal for Seamless Merchant Onboarding ── */}
      <CaptainReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        captainId={captainId}
        captainName={captainName}
      />
    </Box>
  );
}
