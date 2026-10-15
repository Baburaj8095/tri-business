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
  Chip,
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
  QrCodeScanner as QrIcon,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import { T, cardHoverSx } from '../../theme/tokens';
import { getPublicB2bMerchants, getMerchantCategories } from '../../api/api';

const resolveCategoryName = (shop) => {
  const raw = shop?.category;
  if (raw && typeof raw === 'object') {
    return raw.name || raw.title || raw.label || 'Retail Store';
  }
  return shop?.category_name || shop?.business_category || shop?.business_type || shop?.subcategory_name || (raw ? String(raw) : 'Food & Beverage');
};

export default function NearbyStoresPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [favorites, setFavorites] = useState({ 1: true });
  const [categories, setCategories] = useState([
    'All Stores',
    'Mechanic',
    'Food & Beverage',
    'Pharma',
    'Grocery',
    'Fashion',
  ]);

  useEffect(() => {
    setLoading(true);
    const storedPhone = (typeof localStorage !== 'undefined' && (localStorage.getItem('business_phone') || localStorage.getItem('username_business') || localStorage.getItem('business_username'))) || '';
    const currentCleanPhone = storedPhone.replace(/\D/g, '').slice(-10);
    const activeShopId = typeof localStorage !== 'undefined' ? localStorage.getItem('active_merchant_shop_id') : null;
    const storedFullName = (typeof localStorage !== 'undefined' && localStorage.getItem('business_full_name')) || '';

    Promise.all([
      getPublicB2bMerchants().catch(() => []),
      getMerchantCategories().catch(() => [])
    ])
      .then(([merchantsRes, categoriesRes]) => {
        const data = Array.isArray(merchantsRes) ? merchantsRes : [];

        // Filter out logged-in merchant's own shop so they only see other B2B wholesale suppliers
        const otherStores = data.filter(shop => {
          const shopPhone = String(shop.contact_number || shop.phone || '').replace(/\D/g, '').slice(-10);
          if (activeShopId && String(shop.id) === String(activeShopId)) return false;
          if (currentCleanPhone && shopPhone && shopPhone === currentCleanPhone) return false;
          if (storedFullName && shop.shop_name && storedFullName.toLowerCase().trim() === shop.shop_name.toLowerCase().trim()) return false;
          return true;
        });

        const mapped = otherStores.map((shop) => ({
          id: shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'B2B Wholesale Store',
          category: resolveCategoryName(shop),
          rating: shop.rating ? Number(shop.rating).toFixed(1) : null,
          reviewCount: shop.review_count || shop.reviews_count || null,
          yearsInBusiness: shop.service_mode === 'B2B' ? 'B2B Wholesale Supplier' : 'Verified Merchant',
          location: shop.city || shop.address || 'Karnataka',
          eta: shop.eta || null,
          distance: shop.distance ? `${Number(shop.distance).toFixed(1)} km` : null,
          cashback: shop.cashback_rate ? `${shop.cashback_rate}% Cashback` : null,
          badge1: shop.is_verified ? 'Verified Supplier' : 'Verified Merchant',
          badge2: shop.service_mode ? `${shop.service_mode} Billing` : 'GST Enabled',
          productCount: shop.product_count ? `${shop.product_count} Products` : null,
          phone: shop.contact_number || shop.phone || '',
          image: shop.shop_image || shop.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          avatarImage: null,
        }));

        setStores(mapped);
        setFilteredStores(mapped);

        const cats = categoriesRes || [];
        if (cats.length > 0) {
          const names = ['All Stores', 'Mechanic', 'Food & Beverage', 'Pharma', ...cats.map(c => c.name)];
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
      result = result.filter(s => s.category.toLowerCase().includes(q));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    setFilteredStores(result);
  }, [activeCat, searchQuery, stores]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppShell activeTab="/business/nearby-stores">
      <Container maxWidth="md" sx={{ pt: { xs: 2, sm: 3 }, pb: 4, px: { xs: 2, sm: 2.5 } }}>
        
        {/* ══════════════════════════════════════════════════════════════════════════
            1. TITLE & VIEW SWITCHER PILL (Map / List)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.35rem' }, color: '#14231D', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              Nearby Stores
            </Typography>
          </Box>

          {/* Map / List Segmented Toggle Pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#ffffff',
              border: '1px solid #E2E8E5',
              borderRadius: '999px',
              p: 0.35,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              flexShrink: 0,
            }}
          >
            <Button
              size="small"
              onClick={() => setViewMode('map')}
              startIcon={<LocationIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '999px',
                px: 1.4,
                py: 0.45,
                fontSize: '0.78rem',
                fontWeight: viewMode === 'map' ? 700 : 500,
                textTransform: 'none',
                bgcolor: viewMode === 'map' ? '#064E3B' : 'transparent',
                color: viewMode === 'map' ? '#ffffff' : '#64746C',
                minWidth: 0,
                boxShadow: 'none',
                '&:hover': { bgcolor: viewMode === 'map' ? '#043C2E' : '#F8FAF9' },
              }}
            >
              Map
            </Button>

            <Button
              size="small"
              onClick={() => setViewMode('list')}
              startIcon={<ListIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '999px',
                px: 1.4,
                py: 0.45,
                fontSize: '0.78rem',
                fontWeight: viewMode === 'list' ? 700 : 500,
                textTransform: 'none',
                bgcolor: viewMode === 'list' ? '#064E3B' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#64746C',
                minWidth: 0,
                boxShadow: 'none',
                '&:hover': { bgcolor: viewMode === 'list' ? '#043C2E' : '#F8FAF9' },
              }}
            >
              List
            </Button>
          </Box>
        </Stack>

        {/* ══════════════════════════════════════════════════════════════════════════
            2. SEARCH BAR WITH FILTER BUTTON
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
                  <SearchIcon sx={{ color: '#87938D', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => navigate('/scanner')} sx={{ color: '#064E3B' }}>
                    <QrIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#ffffff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: '44px',
                '& fieldset': { borderColor: '#E2E8E5' },
                '&:hover fieldset': { borderColor: '#CBD5D0' },
                '&.Mui-focused fieldset': { borderColor: '#0F7A5B', borderWidth: 1.5 }
              },
              '& .MuiInputBase-input': { fontSize: '0.86rem', color: '#14231D' },
              '& .MuiInputBase-input::placeholder': { color: '#87938D', opacity: 1 }
            }}
          />

          <IconButton
            onClick={() => alert('Filter options: Distance, Rating, Cashbacks, Verified.')}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #E2E8E5',
              color: '#14231D',
              flexShrink: 0,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#F8FAF9', borderColor: '#CBD5D0' }
            }}
          >
            <FilterIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        {/* ══════════════════════════════════════════════════════════════════════════
            3. CATEGORY CHIPS ROW (Pill Design)
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
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  textTransform: 'none',
                  bgcolor: isSelected ? '#064E3B' : '#ffffff',
                  color: isSelected ? '#FFFFFF' : '#64746C',
                  border: `1px solid ${isSelected ? '#064E3B' : '#E2E8E5'}`,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: isSelected ? '#043C2E' : '#F8FAF9',
                    borderColor: isSelected ? '#043C2E' : '#CBD5D0',
                  }
                }}
              >
                {cat}
              </Button>
            );
          })}
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            4. STORE CARDS LIST OR EMPTY STATE
           ══════════════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#064E3B' }} />
            <Typography sx={{ mt: 2, color: '#64746C', fontWeight: 500, fontSize: '0.88rem' }}>
              Finding stores near you...
            </Typography>
          </Box>
        ) : filteredStores.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px solid #E2E8E5',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 10px rgba(20, 35, 29, 0.04)',
              my: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#EAF5F0',
                color: '#064E3B',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#14231D', fontSize: '1.2rem', mb: 1 }}>
              No B2B Wholesale Stores Found Nearby
            </Typography>
            <Typography sx={{ color: '#64746C', fontSize: '0.85rem', maxWidth: 400, mx: 'auto', mb: 3, lineHeight: 1.5 }}>
              There are currently no other B2B wholesale distributors registered near your location. You can order wholesale catalog products directly via B2B Online.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/business/online-marketplace')}
              sx={{
                bgcolor: '#FF6B00',
                '&:hover': { bgcolor: '#E85D04' },
                borderRadius: '12px',
                px: 3,
                minHeight: '44px',
                fontWeight: 600,
                fontSize: '0.86rem',
                textTransform: 'none',
                boxShadow: 'none',
              }}
            >
              Browse B2B Online Wholesale
            </Button>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                elevation={0}
                onClick={() => navigate(`/business/shop/${store.id}`)}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  p: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  '&:hover': {
                    borderColor: '#064E3B',
                    boxShadow: '0 4px 14px rgba(6, 78, 59, 0.08)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {/* Left: Store Image Thumbnail */}
                  <Box
                    component="img"
                    src={store.image}
                    alt={store.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                    }}
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '1px solid #f1f5f9',
                    }}
                  />

                  {/* Right: Store Information */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    {/* Row 1: Store Name & B2B Badge */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.94rem',
                          color: '#0f172a',
                          lineHeight: 1.25,
                        }}
                        noWrap
                      >
                        {store.name}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          px: 0.75,
                          py: 0.15,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        B2B
                      </Box>
                    </Stack>

                    {/* Row 2: Category */}
                    <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, mt: 0.2 }} noWrap>
                      {store.category}
                    </Typography>

                    {/* Row 3: Rating, Distance, Chevron */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.35 }}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Stack direction="row" alignItems="center" spacing={0.35}>
                          <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                            {store.rating || '4.5'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                            ({store.reviewCount || '120'})
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                          📍 {store.distance || '1.2 km'}
                        </Typography>
                      </Stack>
                      <ChevronRightIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </Stack>

                    {/* Row 4: Status Badges Row */}
                    <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      <Stack direction="row" alignItems="center" spacing={0.3}>
                        <VerifiedIcon sx={{ fontSize: 13, color: '#059669' }} />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669' }}>
                          Verified Supplier
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.68rem', color: '#cbd5e1' }}>•</Typography>
                      <Stack direction="row" alignItems="center" spacing={0.35}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10b981' }} />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669' }}>
                          Open
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.68rem', color: '#cbd5e1' }}>•</Typography>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>
                        Min Order ₹500
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

      </Container>
    </AppShell>
  );
}
