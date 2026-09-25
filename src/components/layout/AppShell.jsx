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
  CloseRounded as CloseIcon,
  EditRounded as EditIcon,
  CheckCircleRounded as CheckCircleIcon,
  AddRounded as AddIcon,
  ArrowOutwardRounded as ArrowOutwardIcon
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

export default function AppShell({ children, activeTab, title, hideHeader = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px

  const shouldHideHeader = hideHeader;

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

        {/* ─── MOBILE FIXED TOP HEADER (Context-Aware: Orders vs Home) ─── */}
        {!isDesktop && !shouldHideHeader && (
          (() => {
            const isOrdersPage = location.pathname.startsWith('/business/orders') || activeTab === '/business/orders';

            if (isOrdersPage) {
              return (
                <Box
                  component="header"
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '62px',
                    zIndex: 1100,
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                    <IconButton
                      onClick={() => navigate('/business-dashboard')}
                      sx={{ bgcolor: '#f8fafc', color: '#0f172a', p: 1, '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                      <BackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2 }} noWrap>
                        Orders & Deliveries
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }} noWrap>
                        {activeShop?.shop_name || displayName} • {profile?.service_mode || 'Online B2C'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      aria-label="Cart"
                      onClick={() => navigate('/business/online-marketplace/cart')}
                      sx={{ color: '#0f172a', p: 0.8 }}
                    >
                      <Badge badgeContent={cartCount} color="success" max={99}>
                        <CartIcon sx={{ fontSize: 22 }} />
                      </Badge>
                    </IconButton>
                    <IconButton
                      onClick={() => setStoreModalOpen(true)}
                      title="Switch Store"
                      sx={{ bgcolor: '#ecfdf5', color: '#047857', p: 0.8, '&:hover': { bgcolor: '#d1fae5' } }}
                    >
                      <NearbyIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Stack>
                </Box>
              );
            }

            // Default Home Dashboard Header
            return (
              <Box
                component="header"
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '108px',
                  zIndex: 1100,
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #0d9488 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(6, 78, 59, 0.28)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.25,
                }}
              >
                {/* Top Row: Merchant Profile Info & Action Icons */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar
                      onClick={() => setMobileDrawerOpen(true)}
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: '#064e3b',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        border: '2px solid rgba(255,255,255,0.85)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      {initials}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }}>
                        {getGreeting()}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.2 }}>
                        <Typography sx={{ fontSize: '0.94rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }} noWrap>
                          {displayName}
                        </Typography>
                        <Chip
                          label="ONLINE"
                          size="small"
                          sx={{
                            bgcolor: '#10b981',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.62rem',
                            height: '18px',
                            letterSpacing: '0.5px',
                            px: 0.2
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      aria-label="Notifications"
                      sx={{ color: '#ffffff', p: 0.75, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                    >
                      <Badge color="error" variant="dot">
                        <BellIcon sx={{ fontSize: 21 }} />
                      </Badge>
                    </IconButton>

                    <IconButton
                      aria-label="Cart"
                      onClick={() => navigate('/business/online-marketplace/cart')}
                      sx={{ color: '#ffffff', p: 0.75, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                    >
                      <Badge badgeContent={cartCount || 2} color="warning" max={99}>
                        <CartIcon sx={{ fontSize: 21 }} />
                      </Badge>
                    </IconButton>

                    <IconButton
                      aria-label="Profile"
                      onClick={() => navigate('/business/profile')}
                      sx={{ color: '#ffffff', p: 0.75, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                    >
                      <WalletIcon sx={{ fontSize: 21 }} />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Bottom Row: Operating Store / Outlet Selector Card */}
                <Box
                  onClick={() => setStoreModalOpen(true)}
                  sx={{
                    height: '40px',
                    px: 1.25,
                    bgcolor: 'rgba(0,0,0,0.18)',
                    borderRadius: '11px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.26)' }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '7px',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      <StoreIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }} noWrap>
                        Operating Store / Outlet
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, mt: 0.15 }} noWrap>
                        📍 {activeShop ? `${activeShop.shop_name}${activeShop.city ? `, ${activeShop.city}` : ''}` : `${displayName}, Bengaluru`}
                      </Typography>
                    </Box>
                  </Stack>
                  <ArrowDownIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', flexShrink: 0, ml: 1 }} />
                </Box>
              </Box>
            );
          })()
        )}

        {/* ─── PAGE CONTENT CONTAINER (Guaranteed Breathing Room) ─── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: {
              xs: shouldHideHeader
                ? '0px'
                : (location.pathname.startsWith('/business/orders') || activeTab === '/business/orders')
                  ? '72px'
                  : '110px',
              lg: '24px'
            },
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
              color: isCurrentActive('/business-dashboard') ? '#047857' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <HomeIcon sx={{ fontSize: 22, color: isCurrentActive('/business-dashboard') ? '#047857' : '#64748B', mb: 0.25 }} />
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
              color: isCurrentActive('/business/online-marketplace') ? '#047857' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <MarketplaceIcon sx={{ fontSize: 22, color: isCurrentActive('/business/online-marketplace') ? '#047857' : '#64748B', mb: 0.25 }} />
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
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.45)',
                border: '3px solid #ffffff',
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.92)' }
              }}
            >
              <ScanIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/scanner') ? 800 : 600, color: isCurrentActive('/scanner') ? '#047857' : '#64748B', mt: 0.25 }}>
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
              color: isCurrentActive('/business/nearby-stores') ? '#047857' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <NearbyIcon sx={{ fontSize: 22, color: isCurrentActive('/business/nearby-stores') ? '#047857' : '#64748B', mb: 0.25 }} />
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
              color: isCurrentActive('/business/orders') ? '#047857' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <OrdersIcon sx={{ fontSize: 22, color: isCurrentActive('/business/orders') ? '#047857' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business/orders') ? 800 : 600 }}>
              Orders
            </Typography>
          </Button>
        </Box>
      )}

      {/* ─── MOBILE SLIDING DRAWER MENU (100% Pixel Match to Reference Design) ─── */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 340, sm: 360 },
            maxWidth: '92vw',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '6px 0 28px rgba(15, 23, 42, 0.18)',
          }
        }}
      >
        <Box sx={{ overflowY: 'auto', flex: 1, bgcolor: '#ffffff' }}>
          {/* Drawer Top Profile Banner with Wavy Gradient */}
          <Box
            sx={{
              p: 2.5,
              pb: 4.5,
              background: 'linear-gradient(135deg, #059669 0%, #10B981 60%, #047857 100%)',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Luminous background abstract accents */}
            <Box sx={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -20, left: 60, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

            {/* Profile Row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                {/* Avatar with Edit Badge */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: '#064e3b',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      border: '2.5px solid #ffffff',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileDrawerOpen(false);
                      navigate('/business/profile');
                    }}
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      color: '#0f172a',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    <EditIcon sx={{ fontSize: 12, color: '#0f172a' }} />
                  </Box>
                </Box>

                {/* Name & Location Info */}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.1 }}>
                    Merchant Partner
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#ffffff', lineHeight: 1.25, mt: 0.2 }} noWrap>
                    {displayName}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.25}
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setStoreModalOpen(true);
                    }}
                    sx={{ cursor: 'pointer', mt: 0.4 }}
                  >
                    <NearbyIcon sx={{ fontSize: 13, color: '#34d399' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }} noWrap>
                      {activeShop?.city ? `${activeShop.city}, Karnataka` : 'Bengaluru, Karnataka'}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
                  </Stack>
                </Box>
              </Stack>

              {/* Badges on Right */}
              <Stack spacing={0.6} alignItems="flex-end" sx={{ flexShrink: 0, ml: 1 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    bgcolor: '#065f46',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '20px',
                    px: 1,
                    py: 0.35,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 13, color: '#34d399' }} />
                  Verified Business
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    borderRadius: '20px',
                    px: 1,
                    py: 0.35,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)'
                  }}
                >
                  👑 Gold Tier
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* White Rounded Sheet Body (Overlaps header with top border radius) */}
          <Box
            sx={{
              mt: -2.5,
              borderRadius: '24px 24px 0 0',
              bgcolor: '#ffffff',
              pt: 2.25,
              px: 2,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* 1. Merchant Balance Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: '18px',
                bgcolor: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                mb: 2.5,
              }}
            >
              {/* Header row */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#dcfce7', display: 'grid', placeItems: 'center', color: '#047857' }}>
                    <WalletIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Merchant Balance
                  </Typography>
                </Stack>
                <Chip
                  label="⚡ Instant"
                  size="small"
                  sx={{ bgcolor: '#dcfce7', color: '#047857', fontWeight: 800, fontSize: '0.68rem', height: 22, px: 0.5 }}
                />
              </Stack>

              {/* Balance Amount */}
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', my: 1.25 }}>
                ₹45,280.00
              </Typography>

              {/* Action Buttons: Add Funds & Withdraw */}
              <Stack direction="row" spacing={1.25}>
                <Button
                  variant="contained"
                  onClick={() => { setMobileDrawerOpen(false); navigate('/business/profile'); }}
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    flex: 1,
                    height: 40,
                    bgcolor: '#047857',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '11px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#065f46', boxShadow: 'none' },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                  Add Funds
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => { setMobileDrawerOpen(false); navigate('/business/profile'); }}
                  startIcon={<ArrowOutwardIcon sx={{ fontSize: 17 }} />}
                  sx={{
                    flex: 1,
                    height: 40,
                    borderColor: '#cbd5e1',
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '11px',
                    '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                  Withdraw
                </Button>
              </Stack>
            </Box>

            {/* 2. Business Modules Section Header */}
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1.25, px: 0.5 }}>
              Business Modules
            </Typography>

            {/* 3. 7 Business Module Cards */}
            <Stack spacing={1.1} sx={{ pb: 2 }}>
              {[
                { label: 'My Shops', subtitle: 'Add new branch or update details', path: '/business/shops', icon: <ShopsIcon />, color: '#059669', bg: '#ecfdf5' },
                { label: 'Tri Inventory & Billing', subtitle: 'Stock counts, barcodes, and billing', path: '/business/inventory', icon: <InventoryIcon />, color: '#2563eb', bg: '#eff6ff' },
                { label: 'Manage Online Products', subtitle: 'Add, edit and manage your listings', path: '/business/online-products', icon: <StoreIcon />, color: '#9333ea', bg: '#faf5ff' },
                { label: 'Ads & Campaigns', subtitle: 'Run banners & sponsored listings', path: '/business/ads', icon: <AdsIcon />, color: '#ea580c', bg: '#fff7ed' },
                { label: 'Delivery (Tri Sarathi)', subtitle: 'Manage delivery partners and orders', path: '/business/delivery', icon: <DeliveryIcon />, color: '#0284c7', bg: '#f0f9ff' },
                { label: 'Business Profile', subtitle: 'View and update your business details', path: '/business/profile', icon: <ProfileIcon />, color: '#db2777', bg: '#fdf2f8' },
                { label: 'KYC Verification', subtitle: 'Business documents & PAN status', path: '/business/kyc', icon: <KycIcon />, color: '#0d9488', bg: '#f0fdfa' },
              ].map((item) => (
                <Box
                  key={item.label}
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate(item.path);
                  }}
                  sx={{
                    p: 1.4,
                    borderRadius: '16px',
                    border: '1.5px solid #f1f5f9',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    '&:hover': {
                      borderColor: '#cbd5e1',
                      bgcolor: '#f8fafc',
                      transform: 'translateX(3px)'
                    },
                    '&:active': { transform: 'scale(0.99)' }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '12px',
                        bgcolor: item.bg,
                        color: item.color,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.25 }} noWrap>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.2 }} noWrap>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                  <ChevronRightIcon sx={{ fontSize: 18, color: '#94a3b8', ml: 1, flexShrink: 0 }} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Drawer Footer with Sign Out Button */}
        <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
          <Button
            fullWidth
            onClick={() => {
              setMobileDrawerOpen(false);
              setLogoutModalOpen(true);
            }}
            startIcon={<LogoutIcon sx={{ color: '#ef4444', fontSize: 19 }} />}
            sx={{
              justifyContent: 'center',
              py: 1.2,
              borderRadius: '13px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#ef4444',
              bgcolor: '#fef2f2',
              border: '1.5px solid #fee2e2',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#fee2e2' },
              '&:active': { transform: 'scale(0.99)' }
            }}
          >
            Sign Out of Account
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

      {/* ─── LOGOUT CONFIRMATION BOTTOM DRAWER (No Popup) ─── */}
      <Drawer
        anchor="bottom"
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            maxWidth: 480,
            mx: 'auto',
            width: '100%',
            p: 3,
            pb: 4,
            bgcolor: '#ffffff',
            boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.18)',
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: '#cbd5e1', borderRadius: 999, mx: 'auto', mb: 2 }} />
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <LogoutIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0F172A', mb: 0.5 }}>
            Confirm Logout
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mb: 2.5, px: 2 }}>
            Are you sure you want to log out of your business account? This will end your active session.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setLogoutModalOpen(false)}
              sx={{ borderColor: '#e2e8f0', color: '#64748B', fontWeight: 700, borderRadius: '12px', py: 1.2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogout}
              sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, borderRadius: '12px', py: 1.2, textTransform: 'none', '&:hover': { bgcolor: '#dc2626' } }}
            >
              Log Out
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
