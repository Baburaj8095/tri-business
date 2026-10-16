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
  VerifiedRounded as VerifiedIcon,
  ShieldOutlined as KycIcon,
  AccountBalanceWalletOutlined as WalletIcon,
  ArrowBackRounded as BackIcon,
  LocalShippingOutlined as DeliveryIcon,
  ChevronRightRounded as ChevronRightIcon,
  EditRounded as EditIcon,
  AddRounded as AddIcon,
  ArrowOutwardRounded as ArrowOutwardIcon,
  CloseRounded as CloseIcon,
  HelpOutlineRounded as HelpIcon,
  SettingsOutlined as SettingsIcon,
  LocalOfferOutlined as OfferIcon,
} from '@mui/icons-material';
import { T } from '../../theme/tokens';
import StoreSwitcherModal from './StoreSwitcherModal';
import { getMerchantProfile, listMyShops } from '../../api/api';

const NAV_ITEMS = [
  { label: 'Home', path: '/business-dashboard', icon: <HomeIcon /> },
  { label: 'Online Market', path: '/business/online-marketplace', icon: <MarketplaceIcon /> },
  { label: 'Nearby Stores', path: '/business/nearby-stores', icon: <NearbyIcon /> },
  { label: 'Orders', path: '/business/orders', icon: <OrdersIcon /> },
  { label: 'Inventory', path: '/business/inventory', icon: <InventoryIcon /> },
  { label: 'Online Products', path: '/business/online-products', icon: <DeliveryIcon /> },
  { label: 'Ads Manager', path: '/business/ads', icon: <AdsIcon /> },
  { label: 'My Shops', path: '/business/shops', icon: <ShopsIcon /> },
  { label: 'Profile & KYC', path: '/business/profile', icon: <ProfileIcon /> },
];

export default function AppShell({ children, activeTab, title, hideHeader = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 900px for desktop & laptop layout

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
      return ['/business-dashboard', '/', '/merchant', '/v2/business-dashboard'].includes(location.pathname);
    }
    return location.pathname.startsWith(path);
  };

  const isHome = ['/business-dashboard', '/', '/merchant', '/v2/business-dashboard'].includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', bgcolor: T.bg, fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* ─── DESKTOP SIDEBAR NAVIGATION (Images 1 & Web Mockups) ─── */}
      {isDesktop && (
        <Box
          component="aside"
          sx={{
            width: { md: 230, lg: T.sidebarWidth || 260 },
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
                      borderRadius: T.radiusMd,
                      textTransform: 'none',
                      fontSize: '0.88rem',
                      fontWeight: active ? 800 : 600,
                      color: active ? T.primary : T.textSecondary,
                      bgcolor: active ? T.primaryLight : 'transparent',
                      borderLeft: active ? `3px solid ${T.primary}` : '3px solid transparent',
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
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
              px: { md: 2, lg: 3.5 },
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
                width: { md: 280, lg: 420 },
                border: `1px solid ${T.border}`,
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  bgcolor: T.surface,
                  borderColor: T.primary,
                  boxShadow: '0 0 0 3px rgba(234, 88, 12, 0.12)',
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
                  maxWidth: { md: 220, lg: 320 },
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
                  <Badge badgeContent={cartCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#EA580C', color: '#fff', fontWeight: 800 } }} max={99}>
                    <CartIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: T.primary,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: `2px solid ${T.primaryLight}`,
                  }}
                >
                  {initials}
                </Avatar>
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* ─── MOBILE STICKY TOP HEADER (Non-covering, context-aware) ─── */}
        {!isDesktop && !shouldHideHeader && (
          (() => {
            const isHomeRoute = ['/business-dashboard', '/', '/merchant', '/v2/business-dashboard'].includes(location.pathname);
            const isMarketplace = location.pathname.startsWith('/business/online-marketplace') || activeTab === '/business/online-marketplace';
            const isNearby = location.pathname.startsWith('/business/nearby-stores') || activeTab === '/business/nearby-stores';
            const isOrdersPage = location.pathname.startsWith('/business/orders') || location.pathname.startsWith('/business/b2b-orders') || activeTab === '/business/orders';

            // Dedicated pages manage their own contextual sticky headers (Screens 2, 3, 5, 7)
            if (isMarketplace || isNearby) {
              return null;
            }

            // Screen 4: Orders & Deliveries Mobile Sticky Header
            if (isOrdersPage) {
              return (
                <Box
                  component="header"
                  className="tri-sticky-header"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                    <IconButton
                      onClick={() => navigate('/business-dashboard')}
                      sx={{ bgcolor: '#f8fafc', color: '#0f172a', p: 0.9, '&:hover': { bgcolor: '#f1f5f9' }, flexShrink: 0 }}
                    >
                      <BackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.94rem', sm: '1.05rem' }, color: '#0f172a', lineHeight: 1.2 }} noWrap>
                        Orders & Deliveries
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }} noWrap>
                        {displayName} • Online B2B
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                    <IconButton
                      aria-label="Cart"
                      onClick={() => navigate('/business/online-marketplace/cart')}
                      sx={{ color: '#0f172a', p: 0.8 }}
                    >
                      <Badge badgeContent={cartCount} color="success" max={99}>
                        <CartIcon sx={{ fontSize: 21 }} />
                      </Badge>
                    </IconButton>
                    <IconButton
                      onClick={() => setStoreModalOpen(true)}
                      title="Switch Store"
                      sx={{ bgcolor: '#FFF7ED', color: '#EA580C', p: 0.8, '&:hover': { bgcolor: '#FFEDD5' } }}
                    >
                      <NearbyIcon sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Stack>
                </Box>
              );
            }

            // Screen 1: Home Dashboard Mobile Sticky Header (Matching Mockup Screen 1)
            if (isHomeRoute) {
              return (
                <Box
                  component="header"
                  className="tri-sticky-header-light"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    bgcolor: '#FFF9F4',
                    borderBottom: '1px solid #E8E3DD',
                    display: 'flex',
                    flexDirection: 'column',
                    px: { xs: 1.5, sm: 2 },
                    py: 1.25,
                    gap: 1.25,
                  }}
                >
                  {/* Top Row: Merchant Profile Info & Action Icons */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar
                          onClick={() => setMobileDrawerOpen(true)}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: '#FF5A0A',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '1.05rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(255, 90, 10, 0.25)',
                            '&:hover': { transform: 'scale(1.05)' },
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          {initials}
                        </Avatar>
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 500, color: '#647084', lineHeight: 1.1 }}>
                          {getGreeting()}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.2 }}>
                          <Typography sx={{ fontSize: { xs: '0.98rem', sm: '1.05rem' }, fontWeight: 900, color: '#172033', lineHeight: 1.2 }} noWrap>
                            {displayName}
                          </Typography>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.4,
                              bgcolor: '#EAF7EF',
                              color: '#16805D',
                              border: '1px solid #B2E2CE',
                              borderRadius: '9999px',
                              px: 0.85,
                              py: 0.15,
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              letterSpacing: '0.2px',
                              flexShrink: 0,
                            }}
                          >
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#16805D' }} />
                            Online
                          </Box>
                        </Stack>
                        <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: '#FF5A0A', lineHeight: 1.1, mt: 0.25 }}>
                          Merchant Partner
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <IconButton
                        aria-label="Notifications"
                        onClick={() => navigate('/business/notifications')}
                        sx={{ color: '#172033', p: 0.7, '&:hover': { bgcolor: '#FFF0E5' } }}
                      >
                        <Badge color="error" variant="dot">
                          <BellIcon sx={{ fontSize: 22 }} />
                        </Badge>
                      </IconButton>
                      <IconButton
                        aria-label="Cart"
                        onClick={() => navigate('/business/online-marketplace/cart')}
                        sx={{ color: '#172033', p: 0.7, '&:hover': { bgcolor: '#FFF0E5' } }}
                      >
                        <Badge badgeContent={cartCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#FF5A0A', color: '#fff', fontWeight: 800 } }} max={99}>
                          <CartIcon sx={{ fontSize: 22 }} />
                        </Badge>
                      </IconButton>
                      <IconButton
                        aria-label="Wallet"
                        onClick={() => navigate('/business/profile')}
                        sx={{ color: '#172033', p: 0.7, '&:hover': { bgcolor: '#FFF0E5' } }}
                      >
                        <WalletIcon sx={{ fontSize: 22 }} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Bottom Row: Operating Store / Outlet Selector Card (Matching Mockup Screen 1) */}
                  <Box
                    onClick={() => setStoreModalOpen(true)}
                    sx={{
                      minHeight: '44px',
                      px: 1.5,
                      py: 0.8,
                      bgcolor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E8E3DD',
                      boxShadow: '0 1px 3px rgba(23, 32, 51, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: '#FF5A0A', bgcolor: '#FFFBF7' }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          bgcolor: '#FF5A0A',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(255, 90, 10, 0.25)'
                        }}
                      >
                        <StoreIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: '0.64rem', fontWeight: 600, color: '#647084', lineHeight: 1 }} noWrap>
                          Operating Store / Outlet
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.82rem', sm: '0.86rem' }, fontWeight: 800, color: '#172033', lineHeight: 1.25, mt: 0.2 }} noWrap>
                          {activeShop ? `${activeShop.shop_name}${activeShop.city ? `, ${activeShop.city}` : ''}` : `Tri shop, Bangalore`}
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowDownIcon sx={{ fontSize: 20, color: '#647084', flexShrink: 0, ml: 0.5 }} />
                  </Box>
                </Box>
              );
            }

            // Standard General Header for Other Secondary Pages
            return (
              <Box
                component="header"
                className="tri-sticky-header"
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  bgcolor: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ bgcolor: '#f8fafc', color: '#0f172a', p: 0.8, '&:hover': { bgcolor: '#f1f5f9' }, flexShrink: 0 }}
                  >
                    <BackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.94rem', sm: '1.05rem' }, color: '#0f172a', lineHeight: 1.2 }} noWrap>
                    {title || 'Trikonekt Business'}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                  <IconButton
                    aria-label="Cart"
                    onClick={() => navigate('/business/online-marketplace/cart')}
                    sx={{ color: '#0f172a', p: 0.8 }}
                  >
                    <Badge badgeContent={cartCount} color="success" max={99}>
                      <CartIcon sx={{ fontSize: 21 }} />
                    </Badge>
                  </IconButton>
                  <IconButton
                    onClick={() => setStoreModalOpen(true)}
                    title="Switch Store"
                    sx={{ bgcolor: '#FFF7ED', color: '#EA580C', p: 0.8, '&:hover': { bgcolor: '#FFEDD5' } }}
                  >
                    <NearbyIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Stack>
              </Box>
            );
          })()
        )}

        {/* ─── PAGE CONTENT CONTAINER (Clean Light Background #F7F9FC) ─── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: { xs: 0, md: '20px' },
            pb: { xs: '84px', md: '40px' },
            px: { xs: 0, md: '20px', lg: '32px' },
            maxWidth: T.maxContentWidth,
            width: '100%',
            overflowX: 'hidden',
            mx: 'auto',
            bgcolor: '#F4F7F6',
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
              color: isCurrentActive('/business-dashboard') ? '#FF5A0A' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <HomeIcon sx={{ fontSize: 22, color: isCurrentActive('/business-dashboard') ? '#FF5A0A' : '#64748B', mb: 0.25 }} />
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
              color: isCurrentActive('/business/online-marketplace') ? '#FF5A0A' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <MarketplaceIcon sx={{ fontSize: 22, color: isCurrentActive('/business/online-marketplace') ? '#FF5A0A' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business/online-marketplace') ? 800 : 600 }}>
              Online
            </Typography>
          </Button>

          {/* Tab 3: Raised Center Scanner Button */}
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
                background: 'linear-gradient(135deg, #FF6B00 0%, #E55F00 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 14px rgba(255, 107, 0, 0.40)',
                border: '3px solid #ffffff',
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.92)' }
              }}
            >
              <ScanIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/scanner') ? 800 : 600, color: isCurrentActive('/scanner') ? '#FF5A0A' : '#64748B', mt: 0.25 }}>
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
              color: isCurrentActive('/business/nearby-stores') ? '#FF5A0A' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <NearbyIcon sx={{ fontSize: 22, color: isCurrentActive('/business/nearby-stores') ? '#FF5A0A' : '#64748B', mb: 0.25 }} />
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
              color: isCurrentActive('/business/orders') ? '#FF5A0A' : '#64748B',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <OrdersIcon sx={{ fontSize: 22, color: isCurrentActive('/business/orders') ? '#FF5A0A' : '#64748B', mb: 0.25 }} />
            <Typography sx={{ fontSize: '10.5px', fontWeight: isCurrentActive('/business/orders') ? 800 : 600 }}>
              Orders
            </Typography>
          </Button>
        </Box>
      )}

      {/* ─── MOBILE SLIDING DRAWER MENU (Matching Mockup Screen 10) ─── */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 320, sm: 340 },
            maxWidth: '88vw',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '6px 0 28px rgba(23, 32, 51, 0.12)',
          }
        }}
      >
        <Box sx={{ overflowY: 'auto', flex: 1, bgcolor: '#FFFFFF', p: 2.5 }}>
          {/* Top Header: Avatar, Name, Online Badge, and Close Button */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #E8E3DD' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#FF5A0A',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  boxShadow: '0 2px 8px rgba(255, 90, 10, 0.25)',
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.6}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#172033', lineHeight: 1.2 }} noWrap>
                    {displayName}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.35,
                      bgcolor: '#EAF7EF',
                      color: '#16805D',
                      border: '1px solid #B2E2CE',
                      borderRadius: '9999px',
                      px: 0.75,
                      py: 0.1,
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#16805D' }} />
                    Online
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: '0.72rem', color: '#647084', fontWeight: 600, mt: 0.2 }}>
                  Merchant Partner
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              sx={{ color: '#172033', p: 0.75, '&:hover': { bgcolor: '#F1F5F9' } }}
            >
              <CloseIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Stack>

          {/* Drawer Navigation List matching Screen 10 */}
          <Stack spacing={0.75}>
            {[
              { label: 'My Profile', path: '/business/profile', icon: <ProfileIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'My Shops', path: '/business/shops', icon: <ShopsIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'Inventory & Products', path: '/business/inventory', icon: <InventoryIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'Orders & Deliveries', path: '/business/orders', icon: <OrdersIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'Wallet & Payments', path: '/business/profile', icon: <WalletIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'Offers & Promotions', path: '/business/packages', icon: <OfferIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'Help & Support', path: '/business/support', icon: <HelpIcon sx={{ fontSize: 20, color: '#647084' }} /> },
              { label: 'Settings', path: '/business/settings', icon: <SettingsIcon sx={{ fontSize: 20, color: '#647084' }} /> },
            ].map((item) => (
              <Box
                key={item.label}
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate(item.path);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#FFF9F4',
                    '& .drawer-label': { color: '#FF5A0A' },
                    '& .drawer-chevron': { color: '#FF5A0A', transform: 'translateX(2px)' },
                  },
                  '&:active': { transform: 'scale(0.99)' }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {item.icon}
                  <Typography className="drawer-label" sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#172033', transition: 'color 0.15s ease' }}>
                    {item.label}
                  </Typography>
                </Stack>
                <ChevronRightIcon className="drawer-chevron" sx={{ fontSize: 18, color: '#94A3B8', transition: 'all 0.15s ease' }} />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Drawer Footer: Logout matching Screen 10 */}
        <Box sx={{ p: 2, borderTop: '1px solid #E8E3DD', bgcolor: '#FFFFFF' }}>
          <Button
            fullWidth
            onClick={() => {
              setMobileDrawerOpen(false);
              setLogoutModalOpen(true);
            }}
            startIcon={<LogoutIcon sx={{ color: '#C93636', fontSize: 20 }} />}
            sx={{
              justifyContent: 'flex-start',
              px: 2,
              py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#C93636',
              bgcolor: '#FDECEC',
              border: '1px solid #F8B4B4',
              '&:hover': { bgcolor: '#FCD8D8' },
              '&:active': { transform: 'scale(0.99)' }
            }}
          >
            Logout
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
