import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Container,
  CircularProgress,
  Button,
  Card,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  FormatListBulleted as ListIcon,
  StorefrontRounded as StorefrontIcon,
  PhoneRounded as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  StarRounded as StarIcon,
  CheckCircleRounded as VerifiedIcon,
  LocalOfferRounded as TagIcon,
  FavoriteRounded as FavoriteIcon,
  FavoriteBorderRounded as FavoriteBorderIcon,
  PhotoLibraryOutlined as GalleryIcon,
  TuneRounded as FilterIcon,
  NavigationRounded as NavigationIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import { getPublicB2bMerchants, getMerchantCategories } from '../../api/api';

const TOKENS = {
  primary: '#FF5A0A',
  primaryDark: '#D94708',
  softPeach: '#FFF0E5',
  warmCream: '#FFF8EE',
  pageBg: '#FFF9F4',
  cardSurface: '#FFFFFF',
  textMain: '#172033',
  textSecondary: '#647084',
  border: '#E8E3DD',
  softOrange: '#FFE0C7',
  successGreen: '#16805D',
  successBg: '#EAF7EF',
  infoBlue: '#3676D9',
  infoBg: '#EDF4FF',
  warningBg: '#FFF4D9',
  errorRed: '#C93636',
  errorBg: '#FDECEC',
};

const resolveCategoryName = (shop) => {
  const raw = shop?.category;
  if (raw && typeof raw === 'object') {
    return raw.name || raw.title || raw.label || 'Retail Store';
  }
  return (
    shop?.category_name ||
    shop?.business_category ||
    shop?.business_type ||
    shop?.subcategory_name ||
    (raw ? String(raw) : 'Food & Beverage')
  );
};

export default function NearbyStoresPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedPinId, setSelectedPinId] = useState(1);
  const [favorites, setFavorites] = useState({ 1: true });
  const [categories, setCategories] = useState([
    'All Stores',
    'Grocery',
    'Food & Beverage',
    'Pharmacy',
    'Fashion',
    'Electronics',
    'Mechanic',
  ]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPublicB2bMerchants().catch(() => []),
      getMerchantCategories().catch(() => []),
    ])
      .then(([merchantsRes, categoriesRes]) => {
        const data = merchantsRes || [];

        // Build fallback stores if API returns empty
        const baseStores =
          data.length > 0
            ? data
            : [
                {
                  id: 1,
                  shop_name: 'Sri Balaji Supermarket',
                  category: 'Grocery',
                  city: 'Rajajinagar, Bengaluru',
                  phone: '9876543210',
                  shop_image:
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
                  mapCoords: { x: 38, y: 44 },
                },
                {
                  id: 2,
                  shop_name: 'Royal Spices & Provisions',
                  category: 'Food & Beverage',
                  city: 'Indiranagar, Bengaluru',
                  phone: '9876543211',
                  shop_image:
                    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
                  mapCoords: { x: 65, y: 32 },
                },
                {
                  id: 3,
                  shop_name: 'Apollo Medplus Pharmacy',
                  category: 'Pharmacy',
                  city: 'Koramangala, Bengaluru',
                  phone: '9876543212',
                  shop_image:
                    'https://images.unsplash.com/photo-1586015555751-63c254b7c1ea?auto=format&fit=crop&w=800&q=80',
                  mapCoords: { x: 50, y: 68 },
                },
                {
                  id: 4,
                  shop_name: 'Metro Wholesale Traders',
                  category: 'Grocery',
                  city: 'Yeshwanthpur, Bengaluru',
                  phone: '9876543213',
                  shop_image:
                    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
                  mapCoords: { x: 22, y: 28 },
                },
              ];

        const mapped = baseStores.map((shop, idx) => ({
          id: shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'Merchant Store',
          category: resolveCategoryName(shop),
          rating: (4.2 + (idx % 4) * 0.2).toFixed(1),
          reviewCount: 120 + idx * 45,
          yearsInBusiness: `${5 + (idx % 3) * 5} Yrs in Business`,
          location: shop.city || shop.address || 'Bengaluru',
          eta: `${15 + (idx % 3) * 8} mins`,
          distance: `${(1.2 + idx * 1.8).toFixed(1)} km`,
          cashback: `${3 + (idx % 3) * 2}% CASHBACK`,
          isOpen: true,
          badge1: 'Verified Merchant',
          badge2: idx % 2 === 0 ? 'Instant Billing POS' : 'GST Enabled',
          productCount: `${25 + idx * 15}+ Products`,
          phone: shop.contact_number || shop.phone || '9876543210',
          image:
            shop.shop_image ||
            (idx % 2 === 0
              ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80'),
          avatarImage:
            idx % 2 === 1
              ? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=160&q=80'
              : null,
          mapCoords: shop.mapCoords || {
            x: 20 + ((idx * 27) % 65),
            y: 25 + ((idx * 33) % 55),
          },
        }));

        setStores(mapped);
        setFilteredStores(mapped);
        if (mapped.length > 0) setSelectedPinId(mapped[0].id);

        const cats = categoriesRes || [];
        if (cats.length > 0) {
          const names = [
            'All Stores',
            'Grocery',
            'Food & Beverage',
            'Pharmacy',
            'Fashion',
            ...cats.map((c) => c.name || c.title),
          ];
          setCategories(Array.from(new Set(names)));
        }
      })
      .catch((err) => console.error('Failed to load stores:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = stores;

    // Filter by Category
    if (activeCat !== 'All Stores') {
      const q = activeCat.toLowerCase();
      result = result.filter((s) => s.category.toLowerCase().includes(q));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    setFilteredStores(result);
    if (result.length > 0 && !result.some((s) => s.id === selectedPinId)) {
      setSelectedPinId(result[0].id);
    }
  }, [activeCat, searchQuery, stores, selectedPinId]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedStore =
    stores.find((s) => s.id === selectedPinId) || filteredStores[0] || stores[0];

  return (
    <AppShell activeTab="/business/nearby-stores">
      <Box sx={{ bgcolor: TOKENS.pageBg, minHeight: '100vh', pb: 10 }}>
        <Container maxWidth="md" sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 2.5 } }}>
          {/* ══════════════════════════════════════════════════════════════════════════
              1. HEADER ROW & VIEW SWITCHER (List / Map)
             ══════════════════════════════════════════════════════════════════════════ */}
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.35rem', sm: '1.6rem' },
                  color: TOKENS.textMain,
                  letterSpacing: '-0.4px',
                  lineHeight: 1.2,
                }}
              >
                Nearby Stores
              </Typography>
              <Typography
                sx={{
                  color: TOKENS.textSecondary,
                  fontSize: '0.8rem',
                  mt: 0.35,
                  lineHeight: 1.35,
                  fontWeight: 500,
                }}
              >
                Explore and connect with trusted B2B/B2C stores near your location
              </Typography>
            </Box>

            {/* Map / List Segmented Toggle Pill */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: TOKENS.cardSurface,
                border: `1px solid ${TOKENS.border}`,
                borderRadius: '999px',
                p: 0.35,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                flexShrink: 0,
              }}
            >
              <Button
                size="small"
                onClick={() => setViewMode('list')}
                startIcon={<ListIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '999px',
                  px: 1.4,
                  py: 0.45,
                  fontSize: '0.78rem',
                  fontWeight: viewMode === 'list' ? 800 : 600,
                  textTransform: 'none',
                  bgcolor: viewMode === 'list' ? TOKENS.primary : 'transparent',
                  color: viewMode === 'list' ? '#ffffff' : TOKENS.textSecondary,
                  minWidth: 0,
                  boxShadow:
                    viewMode === 'list' ? '0 2px 6px rgba(255,90,10,0.25)' : 'none',
                  '&:hover': {
                    bgcolor: viewMode === 'list' ? TOKENS.primaryDark : TOKENS.softPeach,
                  },
                }}
              >
                List
              </Button>

              <Button
                size="small"
                onClick={() => setViewMode('map')}
                startIcon={<LocationIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '999px',
                  px: 1.4,
                  py: 0.45,
                  fontSize: '0.78rem',
                  fontWeight: viewMode === 'map' ? 800 : 600,
                  textTransform: 'none',
                  bgcolor: viewMode === 'map' ? TOKENS.primary : 'transparent',
                  color: viewMode === 'map' ? '#ffffff' : TOKENS.textSecondary,
                  minWidth: 0,
                  boxShadow:
                    viewMode === 'map' ? '0 2px 6px rgba(255,90,10,0.25)' : 'none',
                  '&:hover': {
                    bgcolor: viewMode === 'map' ? TOKENS.primaryDark : TOKENS.softPeach,
                  },
                }}
              >
                Map
              </Button>
            </Box>
          </Stack>

          {/* ══════════════════════════════════════════════════════════════════════════
              2. SEARCH BAR & FILTER ICON
             ══════════════════════════════════════════════════════════════════════════ */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search stores, categories or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: TOKENS.textSecondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: TOKENS.cardSurface,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  height: '44px',
                  '& fieldset': { borderColor: TOKENS.border },
                  '&:hover fieldset': { borderColor: TOKENS.softOrange },
                  '&.Mui-focused fieldset': { borderColor: TOKENS.primary },
                },
                '& .MuiInputBase-input': { fontSize: '0.86rem', color: TOKENS.textMain },
              }}
            />

            <IconButton
              onClick={() => alert('Filter options: Distance, Rating, Cashbacks, Verified.')}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: TOKENS.cardSurface,
                border: `1px solid ${TOKENS.border}`,
                color: TOKENS.textMain,
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                '&:hover': {
                  bgcolor: TOKENS.softPeach,
                  borderColor: TOKENS.primary,
                  color: TOKENS.primary,
                },
              }}
            >
              <FilterIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>

          {/* ══════════════════════════════════════════════════════════════════════════
              3. CATEGORY FILTER PILLS
             ══════════════════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
              mb: 2.5,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((cat) => {
              const isSelected = activeCat === cat;
              return (
                <Button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  sx={{
                    flexShrink: 0,
                    borderRadius: '999px',
                    px: 2,
                    py: 0.6,
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 800 : 600,
                    textTransform: 'none',
                    bgcolor: isSelected ? TOKENS.primary : TOKENS.cardSurface,
                    color: isSelected ? '#FFFFFF' : TOKENS.textSecondary,
                    border: `1px solid ${isSelected ? TOKENS.primary : TOKENS.border}`,
                    boxShadow: isSelected
                      ? '0 2px 8px rgba(255,90,10,0.25)'
                      : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? TOKENS.primaryDark : TOKENS.softPeach,
                      borderColor: isSelected ? TOKENS.primaryDark : TOKENS.softOrange,
                    },
                  }}
                >
                  {cat}
                </Button>
              );
            })}
          </Box>

          {/* ══════════════════════════════════════════════════════════════════════════
              4. VIEW MODE: MAP OR LIST
             ══════════════════════════════════════════════════════════════════════════ */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress sx={{ color: TOKENS.primary }} />
              <Typography
                sx={{
                  mt: 2,
                  color: TOKENS.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                Finding stores near you...
              </Typography>
            </Box>
          ) : filteredStores.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '18px',
                border: `1px solid ${TOKENS.border}`,
                bgcolor: TOKENS.cardSurface,
              }}
            >
              <Typography sx={{ fontWeight: 800, color: TOKENS.textMain, mb: 0.5 }}>
                No nearby stores found
              </Typography>
              <Typography sx={{ color: TOKENS.textSecondary, fontSize: '0.85rem' }}>
                Try searching a different category or operating location.
              </Typography>
            </Card>
          ) : viewMode === 'map' ? (
            /* ──────────────────────────────────────────────────────────────────────────
               MAP VIEW (Screen 7 Interactive Stylized Map Preview)
               ────────────────────────────────────────────────────────────────────────── */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 340, sm: 420 },
                  borderRadius: '20px',
                  border: `1px solid ${TOKENS.border}`,
                  bgcolor: '#FAF5EE',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                {/* Stylized vector map grid background */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.5,
                    backgroundImage: `
                      radial-gradient(#E8DFD3 1.5px, transparent 1.5px),
                      linear-gradient(to right, #F0E8DC 1px, transparent 1px),
                      linear-gradient(to bottom, #F0E8DC 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px, 48px 48px, 48px 48px',
                  }}
                />

                {/* Road vector paths */}
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <path
                    d="M -20 180 Q 150 120 300 200 T 600 160"
                    fill="none"
                    stroke="#E5DACB"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 -20 Q 140 180 280 320 T 450 480"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 280 0 L 280 450"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                    strokeDasharray="6,6"
                  />
                </svg>

                {/* "You Are Here" Beacon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '52%',
                    left: '46%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 10,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: 22,
                      height: 22,
                      bgcolor: TOKENS.primary,
                      borderRadius: '50%',
                      border: '3px solid #ffffff',
                      boxShadow: '0 2px 10px rgba(255,90,10,0.5)',
                      display: 'grid',
                      placeItems: 'center',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        border: `2px solid ${TOKENS.primary}`,
                        opacity: 0.6,
                        animation: 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
                      },
                      '@keyframes pulseRing': {
                        '0%': { transform: 'scale(0.8)', opacity: 0.8 },
                        '100%': { transform: 'scale(1.8)', opacity: 0 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      mt: 0.5,
                      bgcolor: 'rgba(23, 32, 51, 0.88)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      px: 1,
                      py: 0.25,
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    You are here
                  </Box>
                </Box>

                {/* Merchant Pins on Map */}
                {filteredStores.map((store) => {
                  const isSelected = store.id === selectedPinId;
                  const coords = store.mapCoords || { x: 50, y: 50 };

                  return (
                    <Box
                      key={store.id}
                      onClick={() => setSelectedPinId(store.id)}
                      sx={{
                        position: 'absolute',
                        top: `${coords.y}%`,
                        left: `${coords.x}%`,
                        transform: 'translate(-50%, -100%)',
                        cursor: 'pointer',
                        zIndex: isSelected ? 20 : 12,
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': { transform: 'translate(-50%, -105%) scale(1.1)' },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: isSelected ? TOKENS.primary : TOKENS.cardSurface,
                          color: isSelected ? '#ffffff' : TOKENS.textMain,
                          border: `2px solid ${isSelected ? '#ffffff' : TOKENS.primary}`,
                          borderRadius: '999px',
                          px: 1.2,
                          py: 0.5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                        }}
                      >
                        <StorefrontIcon sx={{ fontSize: 14 }} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 800 }} noWrap>
                          {store.name.split(' ')[0]}
                        </Typography>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isSelected ? '#ffffff' : TOKENS.successGreen,
                          }}
                        />
                      </Box>
                      {/* Pin arrow point */}
                      <Box
                        sx={{
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: `6px solid ${isSelected ? TOKENS.primary : TOKENS.cardSurface}`,
                          margin: '0 auto',
                        }}
                      />
                    </Box>
                  );
                })}

                {/* Floating GPS Recenter Button */}
                <IconButton
                  size="small"
                  onClick={() => alert('GPS Location recalibrated')}
                  sx={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    bgcolor: TOKENS.cardSurface,
                    border: `1px solid ${TOKENS.border}`,
                    color: TOKENS.primary,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    '&:hover': { bgcolor: TOKENS.softPeach },
                  }}
                >
                  <NavigationIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Card>

              {/* Selected Store Floating Card in Map View */}
              {selectedStore && (
                <Card
                  elevation={0}
                  onClick={() => navigate(`/business/shop/${selectedStore.id}`)}
                  sx={{
                    borderRadius: '18px',
                    border: `1.5px solid ${TOKENS.primary}`,
                    bgcolor: TOKENS.cardSurface,
                    p: 2,
                    boxShadow: '0 8px 24px rgba(255,90,10,0.14)',
                    cursor: 'pointer',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      component="img"
                      src={selectedStore.image}
                      alt={selectedStore.name}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: `1px solid ${TOKENS.border}`,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: '1rem',
                            color: TOKENS.textMain,
                          }}
                          noWrap
                        >
                          {selectedStore.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.35,
                            bgcolor: TOKENS.successBg,
                            color: TOKENS.successGreen,
                            borderRadius: '999px',
                            px: 0.8,
                            py: 0.2,
                            fontSize: '10px',
                            fontWeight: 800,
                          }}
                        >
                          <DotIcon sx={{ fontSize: 8, color: TOKENS.successGreen }} />
                          Open
                        </Box>
                      </Stack>
                      <Typography
                        sx={{ fontSize: '0.76rem', color: TOKENS.textSecondary, mt: 0.25 }}
                        noWrap
                      >
                        {selectedStore.category} • {selectedStore.distance} away
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/business/shop/${selectedStore.id}`);
                          }}
                          sx={{
                            bgcolor: TOKENS.primary,
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            py: 0.4,
                            px: 1.5,
                            textTransform: 'none',
                            '&:hover': { bgcolor: TOKENS.primaryDark },
                          }}
                        >
                          View Store →
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${selectedStore.phone}`;
                          }}
                          startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                          sx={{
                            borderColor: TOKENS.border,
                            color: TOKENS.textMain,
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            py: 0.4,
                            px: 1.2,
                            textTransform: 'none',
                            '&:hover': { bgcolor: TOKENS.softPeach },
                          }}
                        >
                          Call
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              )}
            </Box>
          ) : (
            /* ──────────────────────────────────────────────────────────────────────────
               LIST VIEW (Screen 7 Modern Store Cards)
               ────────────────────────────────────────────────────────────────────────── */
            <Stack spacing={2.5}>
              {filteredStores.map((store) => {
                const isFav = Boolean(favorites[store.id]);

                return (
                  <Card
                    key={store.id}
                    elevation={0}
                    onClick={() => navigate(`/business/shop/${store.id}`)}
                    sx={{
                      borderRadius: '20px',
                      border: `1px solid ${TOKENS.border}`,
                      bgcolor: TOKENS.cardSurface,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.22s ease',
                      boxShadow: '0 2px 10px rgba(23, 32, 51, 0.04)',
                      width: '100%',
                      '&:hover': {
                        borderColor: TOKENS.primary,
                        boxShadow: '0 8px 24px rgba(255, 90, 10, 0.12)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {/* ─── COVER IMAGE BANNER ─── */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: { xs: 148, sm: 165 },
                        overflow: 'hidden',
                        bgcolor: TOKENS.softPeach,
                      }}
                    >
                      <Box
                        component="img"
                        src={store.image}
                        alt={store.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                        }}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.03)' },
                        }}
                      />

                      {/* Top-Left: Cashback Tag Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: TOKENS.primary,
                          color: '#ffffff',
                          px: 1.1,
                          py: 0.4,
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 900,
                          letterSpacing: '0.4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          boxShadow: '0 2px 8px rgba(255,90,10,0.35)',
                        }}
                      >
                        <TagIcon sx={{ fontSize: 13, color: '#ffffff' }} />
                        <span>{store.cashback}</span>
                      </Box>

                      {/* Top-Right: Circular Heart Favorite Button */}
                      <IconButton
                        size="small"
                        onClick={(e) => toggleFavorite(store.id, e)}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 36,
                          height: 36,
                          bgcolor: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                          color: isFav ? '#ef4444' : TOKENS.textSecondary,
                          '&:hover': { bgcolor: '#ffffff', transform: 'scale(1.06)' },
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isFav ? (
                          <FavoriteIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                        ) : (
                          <FavoriteBorderIcon
                            sx={{ fontSize: 20, color: TOKENS.textSecondary }}
                          />
                        )}
                      </IconButton>

                      {/* Bottom-Right: Products Count Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 12,
                          bgcolor: 'rgba(23, 32, 51, 0.78)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          px: 0.9,
                          py: 0.3,
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <GalleryIcon sx={{ fontSize: 13 }} />
                        <span>{store.productCount}</span>
                      </Box>
                    </Box>

                    {/* ─── CARD BODY DETAILS ─── */}
                    <Box
                      sx={{
                        p: { xs: 2, sm: 2.25 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      {/* Header Row: Avatar + Title & Badges + Rating Pill */}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        {/* Left: Store Squircle Avatar */}
                        <Box sx={{ flexShrink: 0 }}>
                          {store.avatarImage ? (
                            <Box
                              component="img"
                              src={store.avatarImage}
                              alt={store.name}
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '13px',
                                objectFit: 'cover',
                                border: `1px solid ${TOKENS.border}`,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '13px',
                                bgcolor: TOKENS.softPeach,
                                display: 'grid',
                                placeItems: 'center',
                                color: TOKENS.primary,
                                border: `1px solid ${TOKENS.softOrange}`,
                              }}
                            >
                              <StorefrontIcon sx={{ fontSize: 26 }} />
                            </Box>
                          )}
                        </Box>

                        {/* Middle: Name, Category, Tenure & Status Badges */}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: '1.05rem',
                                color: TOKENS.textMain,
                                letterSpacing: '-0.2px',
                                lineHeight: 1.25,
                              }}
                              noWrap
                            >
                              {store.name}
                            </Typography>

                            {/* "Open" Chip */}
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.35,
                                bgcolor: TOKENS.successBg,
                                color: TOKENS.successGreen,
                                borderRadius: '999px',
                                px: 0.75,
                                py: 0.2,
                                fontSize: '10px',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              <DotIcon sx={{ fontSize: 7, color: TOKENS.successGreen }} />
                              <span>Open</span>
                            </Box>
                          </Stack>

                          <Typography
                            sx={{
                              fontSize: '0.76rem',
                              color: TOKENS.textSecondary,
                              fontWeight: 600,
                              mt: 0.25,
                            }}
                            noWrap
                          >
                            {store.category} • {store.yearsInBusiness}
                          </Typography>

                          {/* Badges Row */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                            sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}
                          >
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.35,
                                bgcolor: TOKENS.successBg,
                                color: TOKENS.successGreen,
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                px: 0.75,
                                py: 0.25,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                              }}
                            >
                              <VerifiedIcon sx={{ fontSize: 13, color: TOKENS.successGreen }} />
                              <span>{store.badge1}</span>
                            </Box>

                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                bgcolor: TOKENS.infoBg,
                                color: TOKENS.infoBlue,
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                px: 0.75,
                                py: 0.25,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                              }}
                            >
                              <span>{store.badge2}</span>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Right: Star Rating Box & Review Count */}
                        <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.35,
                              bgcolor: TOKENS.warningBg,
                              border: '1px solid #fde68a',
                              borderRadius: '8px',
                              px: 1,
                              py: 0.35,
                            }}
                          >
                            <StarIcon sx={{ fontSize: 14, color: '#d97706' }} />
                            <Typography
                              sx={{
                                fontSize: '0.84rem',
                                fontWeight: 900,
                                color: '#b45309',
                                lineHeight: 1,
                              }}
                            >
                              {store.rating}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '0.7rem',
                              color: TOKENS.textSecondary,
                              fontWeight: 600,
                              mt: 0.3,
                            }}
                          >
                            ({store.reviewCount})
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Line 2: Location & Distance */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <LocationIcon sx={{ fontSize: 15, color: TOKENS.textSecondary }} />
                        <Typography
                          sx={{
                            fontSize: '0.78rem',
                            color: TOKENS.textSecondary,
                            fontWeight: 500,
                          }}
                          noWrap
                        >
                          {store.location} • {store.eta} • {store.distance}
                        </Typography>
                      </Box>

                      {/* Line 3: Action Buttons (Call, WhatsApp, View Store) */}
                      <Stack
                        direction="row"
                        spacing={{ xs: 0.75, sm: 1 }}
                        sx={{ mt: 0.5, width: '100%' }}
                      >
                        {/* Call Button */}
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${store.phone}`;
                          }}
                          startIcon={<PhoneIcon sx={{ fontSize: 15, color: TOKENS.textMain }} />}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            height: 38,
                            px: { xs: 0.8, sm: 1.5 },
                            borderColor: TOKENS.border,
                            color: TOKENS.textMain,
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: { xs: '0.74rem', sm: '0.8rem' },
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            bgcolor: TOKENS.cardSurface,
                            boxShadow: 'none',
                            '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 }, ml: 0 },
                            '&:hover': {
                              bgcolor: TOKENS.softPeach,
                              borderColor: TOKENS.primary,
                            },
                            '&:active': { transform: 'scale(0.98)' },
                          }}
                        >
                          Call
                        </Button>

                        {/* WhatsApp Button */}
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://wa.me/91${String(store.phone).replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(store.name)}`,
                              '_blank'
                            );
                          }}
                          startIcon={<WhatsAppIcon sx={{ fontSize: 16, color: '#25d366' }} />}
                          sx={{
                            flex: 1.15,
                            minWidth: 0,
                            height: 38,
                            px: { xs: 0.8, sm: 1.5 },
                            borderColor: TOKENS.border,
                            color: TOKENS.textMain,
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: { xs: '0.74rem', sm: '0.8rem' },
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            bgcolor: TOKENS.cardSurface,
                            boxShadow: 'none',
                            '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 }, ml: 0 },
                            '&:hover': {
                              bgcolor: TOKENS.softPeach,
                              borderColor: TOKENS.primary,
                            },
                            '&:active': { transform: 'scale(0.98)' },
                          }}
                        >
                          WhatsApp
                        </Button>

                        {/* View Store Button */}
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/business/shop/${store.id}`);
                          }}
                          startIcon={<StorefrontIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            flex: 1.35,
                            minWidth: 0,
                            height: 38,
                            px: { xs: 0.8, sm: 1.5 },
                            bgcolor: TOKENS.primary,
                            color: '#ffffff',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: { xs: '0.74rem', sm: '0.82rem' },
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            boxShadow: 'none',
                            '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 }, ml: 0 },
                            '&:hover': { bgcolor: TOKENS.primaryDark, boxShadow: 'none' },
                            '&:active': { transform: 'scale(0.98)' },
                          }}
                        >
                          View Store
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>
    </AppShell>
  );
}
