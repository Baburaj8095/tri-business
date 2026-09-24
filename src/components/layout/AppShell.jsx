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
  Tooltip
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
  ShieldOutlined as KycIcon
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
  { label: 'Ads Manager', path: '/business/ads', icon: <AdsIcon /> },
  { label: 'My Shops', path: '/business/shops', icon: <ShopsIcon /> },
  { label: 'Profile & KYC', path: '/business/profile', icon: <ProfileIcon /> },
];

export default function AppShell({ children, activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1199px

  // Stores & Profile State
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [cartCount, setCartCount] = useState(0);

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
    // Trigger any custom event if needed
    window.dispatchEvent(new Event('active_shop_changed'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token_business');
    localStorage.removeItem('token_captain');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('refresh_captain');
    navigate('/login');
  };

  const initials = profile?.business_name
    ? profile.business_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'TB';

  const isCurrentActive = (path) => {
    if (path === '/business-dashboard') {
      return location.pathname === '/business-dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: T.bg }}>
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
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: T.primaryLight,
                color: T.primary,
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${T.primary}33`,
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
                  fontSize: '0.85rem'
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: T.text }} noWrap>
                  {profile?.business_name || 'My Business'}
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
        {/* ─── TOP APP BAR (Consistent across all pages) ─── */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            bgcolor: T.surface,
            borderBottom: `1px solid ${T.border}`,
            px: { xs: 2, sm: 3, lg: 4 },
            height: T.topBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
          }}
        >
          {/* Mobile/Tablet Brand Indicator */}
          {!isDesktop && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 1.5, cursor: 'pointer' }} onClick={() => navigate('/business-dashboard')}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.primaryLight, display: 'grid', placeItems: 'center' }}>
                <StoreIcon sx={{ fontSize: 20, color: T.primary }} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: T.text, display: { xs: 'none', sm: 'block' } }}>
                Trikonekt
              </Typography>
            </Stack>
          )}

          {/* Universal Search Bar Input */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              bgcolor: T.surfaceAlt,
              borderRadius: T.radiusFull,
              px: 2,
              py: 0.65,
              width: { sm: 260, md: 360, lg: 440 },
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
              placeholder="Search for products, stores, categories..."
              sx={{ flex: 1, fontSize: '0.88rem', color: T.text }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/business/online-marketplace?q=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
          </Box>

          {/* Context Controls (Store Switcher, Notifications, Cart, Profile) */}
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            {/* Store Switcher Pill (Matching Screen 1 & Screen 8 in Reference Design) */}
            <Button
              onClick={() => setStoreModalOpen(true)}
              sx={{
                bgcolor: T.surfaceAlt,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusFull,
                px: { xs: 1.25, sm: 2 },
                py: 0.6,
                textTransform: 'none',
                color: T.text,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                maxWidth: { xs: 170, sm: 280, md: 320 },
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
                    fontSize: { xs: '0.78rem', sm: '0.84rem' },
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

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: T.textSecondary,
                  '&:hover': { bgcolor: T.surfaceAlt, color: T.text }
                }}
              >
                <Badge color="error" variant="dot">
                  <BellIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* B2B Cart Icon */}
            <Tooltip title="B2B Wholesale Cart">
              <IconButton
                onClick={() => navigate('/business/online-marketplace/cart')}
                sx={{
                  color: T.textSecondary,
                  '&:hover': { bgcolor: T.surfaceAlt, color: T.text }
                }}
              >
                <Badge badgeContent={cartCount} color="success" max={99}>
                  <CartIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Avatar */}
            <IconButton
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{ p: 0.5 }}
            >
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

        {/* ─── PAGE CONTENT CONTAINER ─── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pb: { xs: `${T.mobileNavHeight + 24}px`, lg: 5 },
            maxWidth: T.maxContentWidth,
            width: '100%',
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* ─── MOBILE BOTTOM NAVIGATION DOCK (Screen 12 in Reference Design) ─── */}
      {!isDesktop && (
        <Box
          component="nav"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: T.mobileNavHeight,
            bgcolor: T.surface,
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            px: 1,
            zIndex: 1050,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {[
            { label: 'Home', path: '/business-dashboard', icon: <HomeIcon /> },
            { label: 'Marketplace', path: '/business/online-marketplace', icon: <MarketplaceIcon /> },
            { label: 'Nearby', path: '/business/nearby-stores', icon: <NearbyIcon /> },
            { label: 'Orders', path: '/business/orders', icon: <OrdersIcon /> },
            { label: 'Inventory', path: '/business/inventory', icon: <InventoryIcon /> },
          ].map((item) => {
            const active = isCurrentActive(item.path);
            return (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 0.75,
                  px: 0.5,
                  color: active ? T.primary : T.textMuted,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent' },
                }}
              >
                {React.cloneElement(item.icon, {
                  sx: { fontSize: 22, color: active ? T.primary : T.textMuted, mb: 0.25 }
                })}
                <Typography sx={{ fontSize: '0.68rem', fontWeight: active ? 800 : 500 }}>
                  {item.label}
                </Typography>
              </Button>
            );
          })}
        </Box>
      )}

      {/* ─── STORE SWITCHER MODAL / SHEET ─── */}
      <StoreSwitcherModal
        open={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        stores={shops}
        activeShop={activeShop}
        onSelectShop={handleSelectShop}
      />

      {/* ─── USER PROFILE MENU POPOVER ─── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 240,
            borderRadius: T.radiusMd,
            boxShadow: T.shadowLg,
            border: `1px solid ${T.border}`,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: T.text }}>
            {profile?.business_name || 'Business Account'}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
            {profile?.mobile_number || profile?.phone || 'Merchant Profile'}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/business/profile'); }}>
          <ListItemIcon><ProfileIcon fontSize="small" sx={{ color: T.textSecondary }} /></ListItemIcon>
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/business/kyc'); }}>
          <ListItemIcon><KycIcon fontSize="small" sx={{ color: T.textSecondary }} /></ListItemIcon>
          KYC Verification
        </MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/business/shops'); }}>
          <ListItemIcon><ShopsIcon fontSize="small" sx={{ color: T.textSecondary }} /></ListItemIcon>
          Manage Shops
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: T.error }}>
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: T.error }} /></ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}
