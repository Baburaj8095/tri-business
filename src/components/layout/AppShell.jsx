import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  InputBase,
  Stack,
  useMediaQuery,
  useTheme,
  Button,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  HomeRounded as HomeIcon,
  StorefrontRounded as MarketplaceIcon,
  LocationOnRounded as NearbyIcon,
  ReceiptLongRounded as OrdersIcon,
  Inventory2Rounded as InventoryIcon,
  CampaignRounded as AdsIcon,
  StoreRounded as ShopsIcon,
  StoreRounded as StoreIcon,
  PersonRounded as ProfileIcon,
  SearchRounded as SearchIcon,
  NotificationsNoneRounded as BellIcon,
  ShoppingCartOutlined as CartIcon,
  KeyboardArrowDownRounded as ArrowDownIcon,
  LogoutRounded as LogoutIcon,
  QrCodeScannerRounded as ScanIcon,
  MoreHorizRounded as MoreIcon,
  VerifiedRounded as VerifiedIcon,
  ShieldOutlined as KycIcon,
  AccountBalanceWalletOutlined as WalletIcon,
  ArrowBackRounded as BackIcon,
  LocalShippingOutlined as DeliveryIcon,
  LockOutlined as LockIcon,
  ChevronRightRounded as ChevronRightIcon,
  CloseRounded as CloseIcon
} from '@mui/icons-material';
import { T } from '../../theme/tokens';
import StoreSwitcherModal from './StoreSwitcherModal';
import { getMerchantProfile, listMyShops } from '../../api/api';

const NAV_ITEMS = [
  { label: 'Home', path: '/business-dashboard', icon: <HomeIcon /> },
  { label: 'Online Marketplace', path: '/business/online-marketplace', icon: <MarketplaceIcon /> },
  { label: 'Nearby Stores', path: '/business/nearby-stores', icon: <NearbyIcon /> },
  { label: 'Orders', path: '/business/orders', icon: <OrdersIcon /> },
  { label: 'Inventory', path: '/business/inventory', icon: <InventoryIcon /> },
  { label: 'Manage Online Products', path: '/business/online-products', icon: <InventoryIcon /> },
  { label: 'Ads Manager', path: '/business/ads', icon: <AdsIcon /> },
  { label: 'My Shops', path: '/business/shops', icon: <ShopsIcon /> },
  { label: 'Profile & KYC', path: '/business/profile', icon: <ProfileIcon /> },
];

export default function AppShell({ children, activeTab, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px

  // Stores & Profile State
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Dynamic Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Load cart count from localStorage
  const updateCartCount = () => {
    try {
      const raw = localStorage.getItem('tri_business_b2b_cart');
      if (raw) {
        const cart = JSON.parse(raw);
        const count = (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (_) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  // Fetch Profile & Shops
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [prof, myShops] = await Promise.all([
          getMerchantProfile().catch(() => null),
          listMyShops().catch(() => [])
        ]);

        if (cancelled) return;
        if (prof) setProfile(prof);

        const list = Array.isArray(myShops) ? myShops : myShops?.results || [];
        setShops(list);

        const savedShopId = localStorage.getItem('active_merchant_shop_id');
        if (savedShopId && list.length > 0) {
          const match = list.find(s => String(s.id) === String(savedShopId));
          setActiveShop(match || list[0]);
        } else if (list.length > 0) {
          setActiveShop(list[0]);
          localStorage.setItem('active_merchant_shop_id', String(list[0].id));
        }
      } catch (err) {
        console.error('AppShell failed to load merchant data', err);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleSelectShop = (shop) => {
    setActiveShop(shop);
    localStorage.setItem('active_merchant_shop_id', String(shop.id));
    window.dispatchEvent(new Event('active_shop_changed'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token_business');
    localStorage.removeItem('token_captain');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('refresh_captain');
    navigate('/login');
  };

  const displayName = profile?.business_name || profile?.full_name || localStorage.getItem('business_full_name') || 'Business User';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BU';

  const isCurrentActive = (path) => {
    if (path === '/business-dashboard') {
      return location.pathname === '/business-dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isHome = location.pathname === '/business-dashboard' || location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: T.bg, fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* ─── DESKTOP SIDEBAR NAVIGATION (Images 1 & Web Mockups) ─── */}
      {isDesktop && (
        <Box
          component="aside"
          sx={{
            width: T.sidebarWidth,
            flexShrink: 0,
            bgcolor: T.surface,
            borderRight: `1px solid ${T.border}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 1100,
          }}
        >
          {/* Logo Area */}
          <Box
            onClick={() => navigate('/business-dashboard')}
            sx={{
              p: 2.75,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: T.primaryLight,
                color: T.primary,
                display: 'grid',
                placeItems: 'center',
                border: `1.5px solid ${T.primary}33`,
              }}
            >
              <StoreIcon sx={{ fontSize: 22, color: T.primary }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: T.text, lineHeight: 1.1 }}>
                Trikonekt
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', color: T.primary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Business
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links List */}
          <Box sx={{ flex: 1, py: 2, px: 1.5, overflowY: 'auto' }}>
            <Stack spacing={0.6}>
              {NAV_ITEMS.map((item) => {
                const active = isCurrentActive(item.path);
                return (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    startIcon={React.cloneElement(item.icon, {
                      sx: { fontSize: 20, color: active ? T.primary : T.textSecondary }
                    })}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1.15,
                      borderRadius: T.radiusSm,
                      textTransform: 'none',
                      fontSize: '0.88rem',
                      fontWeight: active ? 800 : 600,
                      color: active ? T.primary : T.textSecondary,
                      bgcolor: active ? T.primaryLight : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: active ? T.primaryLight : T.surfaceAlt,
                        color: active ? T.primary : T.text,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* User Profile Mini Footer */}
          <Box sx={{ p: 2, borderTop: `1px solid ${T.border}` }}>
            <Box
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: T.radiusSm,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: T.surfaceAlt }
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: T.primaryDark,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: T.text }} noWrap>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }} noWrap>
                  {profile?.service_mode || 'Merchant'}
                </Typography>
              </Box>
              <ArrowDownIcon sx={{ fontSize: 18, color: T.textMuted }} />
            </Box>
          </Box>
        </Box>
      )}

      {/* ─── MAIN CONTENT VIEWPORT ─── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ─── DESKTOP TOP BAR (Only on Desktop) ─── */}
        {isDesktop && (
          <Box
            component="header"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              bgcolor: T.surface,
              borderBottom: `1px solid ${T.border}`,
              px: 4,
              height: T.topBarHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
            }}
          >
            {/* Universal Search Bar Input */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: T.surfaceAlt,
                borderRadius: T.radiusFull,
                px: 2,
                py: 0.65,
                width: { md: 360, lg: 440 },
                border: `1px solid ${T.border}`,
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  bgcolor: T.surface,
                  borderColor: T.primary,
                  boxShadow: '0 0 0 3px rgba(34, 139, 34, 0.1)',
                }
              }}
            >
              <SearchIcon sx={{ color: T.textMuted, fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder="Search products, stores, categories..."
                sx={{ flex: 1, fontSize: '0.88rem', color: T.text }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/business/online-marketplace?q=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
              />
            </Box>

            {/* Context Controls (Store Switcher, Notifications, Cart, Profile) */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Button
                onClick={() => setStoreModalOpen(true)}
                sx={{
                  bgcolor: T.surfaceAlt,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusFull,
                  px: 2,
                  py: 0.6,
                  textTransform: 'none',
                  color: T.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  maxWidth: 320,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: T.primary,
                    bgcolor: T.primaryLight,
                  }
                }}
              >
                <NearbyIcon sx={{ fontSize: 18, color: T.primary, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    sx={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      color: T.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {activeShop ? activeShop.shop_name : 'Select Store Outlet'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: T.textMuted, lineHeight: 1 }} noWrap>
                    {activeShop?.city || 'Operating Location'}
                  </Typography>
                </Box>
                <ArrowDownIcon sx={{ fontSize: 18, color: T.textMuted, flexShrink: 0 }} />
              </Button>

              <Tooltip title="Notifications">
                <IconButton sx={{ color: T.textSecondary, '&:hover': { bgcolor: T.surfaceAlt, color: T.text } }}>
                  <Badge color="error" variant="dot">
                    <BellIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="B2B Wholesale Cart">
                <IconButton
                  onClick={() => navigate('/business/online-marketplace/cart')}
                  sx={{ color: T.textSecondary, '&:hover': { bgcolor: T.surfaceAlt, color: T.text } }}
                >
                  <Badge badgeContent={cartCount} color="success" max={99}>
                    <CartIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: T.primaryDark,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: `2px solid ${T.primaryAccent}`,
                  }}
                >
                  {initials}
                </Avatar>
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* ─── MOBILE FIXED TOP HEADER (Screen 1 & 2 Brand Pine Green Header) ─── */}
        {!isDesktop && (
          <Box
            component="header"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '106px',
              zIndex: 1100,
              bgcolor: '#1B4D3E',
              background: 'linear-gradient(135deg, #1B4D3E 0%, #12372C 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Top Greeting & Controls Row */}
            <Box
              sx={{
                height: '60px',
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Left: Avatar or Back Button */}
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                {!isHome ? (
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                      color: '#ffffff',
                      p: 0.75,
                      bgcolor: 'rgba(255,255,255,0.12)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <BackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                ) : null}

                <Avatar
                  onClick={() => setMobileDrawerOpen(true)}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: '1.5px solid rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {initials}
                </Avatar>

                {/* Center Merchant Info */}
                <Box sx={{ minWidth: 0, flex: 1, ml: 0.5 }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px', lineHeight: 1.1 }}>
                    {getGreeting()}
                  </Typography>
                  <Typography sx={{ fontSize: '14.5px', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }} noWrap>
                    {displayName}
                  </Typography>
                </Box>
              </Stack>

              {/* Right Action Icons */}
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  aria-label="Notifications"
                  sx={{ color: '#ffffff', p: 0.85, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
                >
                  <Badge color="error" variant="dot">
                    <BellIcon sx={{ fontSize: 21 }} />
                  </Badge>
                </IconButton>

                <IconButton
                  aria-label="Cart"
                  onClick={() => navigate('/business/online-marketplace/cart')}
                  sx={{ color: '#ffffff', p: 0.85, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
                >
                  <Badge badgeContent={cartCount} color="success" max={99}>
                    <CartIcon sx={{ fontSize: 21 }} />
                  </Badge>
                </IconButton>

                <IconButton
                  aria-label="Wallet"
                  onClick={() => navigate('/business/profile')}
                  sx={{ color: '#ffffff', p: 0.85, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
                >
                  <WalletIcon sx={{ fontSize: 21 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Bottom Row: Operating Store Selector (Clickable Pill) */}
            <Box
              onClick={() => setStoreModalOpen(true)}
              sx={{
                height: '46px',
                px: 2,
                bgcolor: 'rgba(0,0,0,0.16)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.22)' }
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '8.5px', fontWeight: 750, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  Operating Store / Outlet
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.15 }}>
                  <NearbyIcon sx={{ fontSize: 13, color: '#10b981', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#ffffff' }} noWrap>
                    {activeShop ? `${activeShop.shop_name}${activeShop.city ? `, ${activeShop.city}` : ''}` : 'Select Operating Store Location'}
                  </Typography>
                </Stack>
              </Box>
              <ArrowDownIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', flexShrink: 0, ml: 1 }} />
            </Box>
          </Box>
        )}

        {/* ─── PAGE CONTENT CONTAINER (Guaranteed Breathing Room) ─── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: { xs: '118px', lg: '24px' },
            pb: { xs: '84px', lg: '40px' },
            maxWidth: T.maxContentWidth,
            width: '100%',
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* ─── MOBILE FIXED BOTTOM NAVIGATION DOCK (Persistent Across ALL Screens) ─── */}
      {!isDesktop && (
        <Box
          component="nav"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            bgcolor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            px: 0.5,
            zIndex: 1100,
            boxShadow: '0 -4px 18px rgba(0,0,0,0.06)',
          }}
        >
          {/* Tab 1: Home */}
          <Button
            onClick={() => navigate('/business-dashboard')}
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 0.75,
              px: 0.5,
              color: isCurrentActive('/business-dashboard') ? '#10B981' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <HomeIcon sx={{ fontSize: 22, color: isCurrentActive('/business-dashboard') ? '#10B981' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business-dashboard') ? 800 : 600 }}>
              Home
            </Typography>
          </Button>

          {/* Tab 2: Online Marketplace */}
          <Button
            onClick={() => navigate('/business/online-marketplace')}
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 0.75,
              px: 0.5,
              color: isCurrentActive('/business/online-marketplace') ? '#10B981' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <MarketplaceIcon sx={{ fontSize: 22, color: isCurrentActive('/business/online-marketplace') ? '#10B981' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business/online-marketplace') ? 800 : 600 }}>
              Online
            </Typography>
          </Button>

          {/* Tab 3: Raised Emerald Center Scanner Button */}
          <Box
            onClick={() => navigate('/scanner')}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flex: 1,
              mt: -2.75,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: '#10B981',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)',
                border: '3px solid #ffffff',
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.92)' }
              }}
            >
              <ScanIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/scanner') ? 800 : 600, color: isCurrentActive('/scanner') ? '#10B981' : '#64748B', mt: 0.25 }}>
              Scanner
            </Typography>
          </Box>

          {/* Tab 4: Nearby Stores */}
          <Button
            onClick={() => navigate('/business/nearby-stores')}
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 0.75,
              px: 0.5,
              color: isCurrentActive('/business/nearby-stores') ? '#10B981' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <NearbyIcon sx={{ fontSize: 22, color: isCurrentActive('/business/nearby-stores') ? '#10B981' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business/nearby-stores') ? 800 : 600 }}>
              Nearby
            </Typography>
          </Button>

          {/* Tab 5: Orders */}
          <Button
            onClick={() => navigate('/business/orders')}
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 0.75,
              px: 0.5,
              color: isCurrentActive('/business/orders') ? '#10B981' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <OrdersIcon sx={{ fontSize: 22, color: isCurrentActive('/business/orders') ? '#10B981' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business/orders') ? 800 : 600 }}>
              Orders
            </Typography>
          </Button>
        </Box>
      )}

      {/* ─── MOBILE SLIDING DRAWER MENU ─── */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }
        }}
      >
        <Box>
          {/* Drawer Top Profile Banner */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: '#1B4D3E',
              background: 'linear-gradient(135deg, #1B4D3E 0%, #12372C 100%)',
              color: '#ffffff',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 46,
                  height: 46,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: '2px solid rgba(255,255,255,0.8)'
                }}
              >
                {initials}
              </Avatar>
              <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: '#ffffff' }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', mt: 0.25 }}>
              {profile?.email || profile?.mobile_number || 'Merchant Partner'}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Chip
                label={profile?.is_verified ? 'Verified Merchant' : 'Merchant'}
                size="small"
                sx={{ bgcolor: 'rgba(16, 185, 129, 0.25)', color: '#34d399', fontWeight: 800, fontSize: '0.7rem' }}
              />
              <Chip
                label={profile?.service_mode || 'B2B/B2C'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Stack>
          </Box>

          {/* Drawer Navigation Links */}
          <Box sx={{ p: 1.5 }}>
            <Stack spacing={0.5}>
              {[
                { label: 'My Shops', path: '/business/shops', icon: <ShopsIcon /> },
                { label: 'Tri Inventory & Billing', path: '/business/inventory', icon: <InventoryIcon /> },
                { label: 'Manage Online Products', path: '/business/online-products', icon: <MarketplaceIcon /> },
                { label: 'Ads Manager', path: '/business/ads', icon: <AdsIcon /> },
                { label: 'Delivery (Tri Sarathi)', path: '/business/delivery', icon: <DeliveryIcon /> },
                { label: 'Business Profile', path: '/business/profile', icon: <ProfileIcon /> },
                { label: 'KYC Verification', path: '/business/kyc', icon: <KycIcon /> },
              ].map((item) => (
                <Button
                  key={item.label}
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate(item.path);
                  }}
                  startIcon={React.cloneElement(item.icon, { sx: { fontSize: 20, color: '#1B4D3E' } })}
                  endIcon={<ChevronRightIcon sx={{ fontSize: 18, color: '#94A3B8' }} />}
                  sx={{
                    justifyContent: 'space-between',
                    width: '100%',
                    px: 1.75,
                    py: 1.2,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    '&:hover': { bgcolor: '#F8FAFC' }
                  }}
                >
                  <Box sx={{ flex: 1, textAlign: 'left', ml: 1 }}>{item.label}</Box>
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Drawer Footer with Logout */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button
            fullWidth
            onClick={() => {
              setMobileDrawerOpen(false);
              setLogoutModalOpen(true);
            }}
            startIcon={<LogoutIcon sx={{ color: '#EF4444' }} />}
            sx={{
              justifyContent: 'flex-start',
              px: 2,
              py: 1.1,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#EF4444',
              '&:hover': { bgcolor: '#FEF2F2' }
            }}
          >
            Log Out
          </Button>
        </Box>
      </Drawer>

      {/* ─── STORE SWITCHER MODAL / SHEET ─── */}
      <StoreSwitcherModal
        open={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        stores={shops}
        activeShop={activeShop}
        onSelectShop={handleSelectShop}
      />

      {/* ─── DESKTOP USER MENU ─── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            width: 220,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            p: 0.5,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: T.text }} noWrap>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }} noWrap>
            {profile?.mobile_number || 'Merchant Partner'}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/business/profile'); }}>
          <ListItemIcon><ProfileIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Business Profile</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/business/kyc'); }}>
          <ListItemIcon><KycIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>KYC Status</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/business/shops'); }}>
          <ListItemIcon><ShopsIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Manage Shops</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setUserMenuAnchor(null); setLogoutModalOpen(true); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon sx={{ fontSize: 18, color: 'error.main' }} /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Log Out</Typography>
        </MenuItem>
      </Menu>

      {/* ─── LOGOUT CONFIRMATION DIALOG ─── */}
      <Dialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748B', fontSize: 14 }}>
            Are you sure you want to log out of your business account? This will end your active session.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutModalOpen(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: '#dc2626' } }}
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
