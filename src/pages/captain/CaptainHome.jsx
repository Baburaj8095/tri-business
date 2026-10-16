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

export default function CaptainHome() {
  const navigate = useNavigate();

  const [captainName, setCaptainName] = useState(localStorage.getItem('fullname_captain') || 'Captain');
  const [captainId, setCaptainId] = useState(localStorage.getItem('username_captain') || '');
  const [isOnline, setIsOnline] = useState(true);
  const [locationName, setLocationName] = useState('Territory Assigned');
  const [referralOpen, setReferralOpen] = useState(false);

  // Status menu anchor
  const [statusAnchor, setStatusAnchor] = useState(null);

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

      {/* ── Top Curved Orange Header (Exact Match to Mockup Screen 1) ── */}
      <Box sx={{
        background: 'linear-gradient(145deg, #431407 0%, #7c2d12 55%, #EA580C 100%)',
        color: '#ffffff',
        pt: 3,
        pb: 3,
        px: 2.5,
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Storefront outline graphic in header background (Mockup Screen 1) */}
        <Box sx={{
          position: 'absolute', right: 10, bottom: 5, opacity: 0.15, pointerEvents: 'none',
        }}>
          <StoreIcon sx={{ fontSize: 90, color: '#ffffff' }} />
        </Box>

        {/* Row 1: Avatar, Greeting "Hi, Tri Captain", Gold Tier badge, PIN & Bell */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Avatar Circle with initial "T" */}
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              fontSize: '1.3rem',
              color: '#ffffff',
            }}>
              {(captainName || 'T').charAt(0).toUpperCase()}
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Hi, {captainName || 'Tri Captain'}
                </Typography>
                <Chip
                  label="⭐ Gold Tier"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(253, 224, 71, 0.22)',
                    color: '#fef08a',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                    border: '1px solid rgba(253, 224, 71, 0.4)',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2, color: 'rgba(255, 255, 255, 0.9)' }}>
                <LocationIcon sx={{ fontSize: 14, color: '#fef08a' }} />
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 600 }}>
                  PIN: {stats.pincode || '560073'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Notification Bell Icon (Single frosted button like Mockup Screen 1) */}
          <IconButton
            size="small"
            sx={{
              color: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              p: 1,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Badge color="error" variant="dot">
              <BellIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Box>

        {/* Row 2: Online Status Pill + Receiving Tasks Pill side-by-side (Mockup Screen 1) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
          <Box
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: isOnline ? '#4ade80' : '#f87171',
              boxShadow: isOnline ? '0 0 8px #4ade80' : 'none',
            }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#ffffff' }}>
              {isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>

          <Box
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Box sx={{ width: 6, height: 6, bgcolor: '#f97316', transform: 'rotate(45deg)' }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#ffffff' }}>
              Receiving Tasks ⌵
            </Typography>
          </Box>

          <Menu
            anchorEl={statusAnchor}
            open={Boolean(statusAnchor)}
            onClose={() => setStatusAnchor(null)}
          >
            <MenuItem onClick={() => { setIsOnline(true); setStatusAnchor(null); }}>
              🟢 Online (Receiving Tasks)
            </MenuItem>
            <MenuItem onClick={() => { setIsOnline(false); setStatusAnchor(null); }}>
              🔴 Offline
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* ── Page Content Container ── */}
      <Box sx={{ px: 2, mt: 2.5 }}>

        {/* ── Banner: Grow Your Network (Exact Match to Mockup Screen 1) ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
          borderRadius: '20px',
          p: 2.5,
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          mb: 3,
        }}>
          {/* Subtle line chart background decoration */}
          <Box sx={{
            position: 'absolute', right: -10, top: 0, bottom: 0, width: '45%',
            opacity: 0.25, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendUpIcon sx={{ fontSize: 120, color: '#ffffff' }} />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '85%', sm: '75%' } }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 0.4 }}>
              Grow Your Network
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, mb: 1.8, fontWeight: 500 }}>
              Share your Captain Sponsor Link to onboard merchants instantly. Your referral code is pre-filled.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => setReferralOpen(true)}
                startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#EA580C',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.7,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                  '&:hover': { bgcolor: '#FFF7ED' },
                }}
              >
                Refer Merchant
              </Button>
              <Button
                onClick={() => navigate('/captain/analytics')}
                startIcon={<TrendUpIcon sx={{ fontSize: 16 }} />}
                endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 1.6,
                  py: 0.7,
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                View Analytics
              </Button>
            </Stack>
          </Box>
        </Box>

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
              title: 'Assigned Stores',
              val: String(stats.totalShops),
              badge: 'Assigned',
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
