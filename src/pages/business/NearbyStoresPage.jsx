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
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.6rem' }, color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              Nearby Stores
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.35, lineHeight: 1.35, fontWeight: 500 }}>
              Explore and connect with trusted B2B/B2C stores near your location
            </Typography>
          </Box>

          {/* Map / List Segmented Toggle Pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
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
                fontWeight: viewMode === 'map' ? 800 : 600,
                textTransform: 'none',
                bgcolor: viewMode === 'map' ? T.primary : 'transparent',
                color: viewMode === 'map' ? '#ffffff' : '#64748b',
                minWidth: 0,
                boxShadow: viewMode === 'map' ? '0 2px 6px rgba(6,78,59,0.25)' : 'none',
                '&:hover': { bgcolor: viewMode === 'map' ? T.primaryDark : '#f8fafc' },
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
                fontWeight: viewMode === 'list' ? 800 : 600,
                textTransform: 'none',
                bgcolor: viewMode === 'list' ? T.primary : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#64748b',
                minWidth: 0,
                boxShadow: viewMode === 'list' ? '0 2px 6px rgba(6, 78, 59, 0.25)' : 'none',
                '&:hover': { bgcolor: viewMode === 'list' ? T.primaryDark : '#f8fafc' },
              }}
            >
              List
            </Button>
          </Box>
        </Stack>

        {/* ══════════════════════════════════════════════════════════════════════════
            2. SEARCH BAR WITH QR SCANNER & FILTER BUTTON
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
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => navigate('/scanner')} sx={{ color: T.primary }}>
                    <QrIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#ffffff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                height: '44px',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: T.primary }
              },
              '& .MuiInputBase-input': { fontSize: '0.86rem', color: '#0f172a' }
            }}
          />

          <IconButton
            onClick={() => alert('Filter options: Distance, Rating, Cashbacks, Verified.')}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: '#f8fafc', borderColor: T.primary }
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
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 800 : 600,
                  textTransform: 'none',
                  bgcolor: isSelected ? T.primary : '#ffffff',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: `1px solid ${isSelected ? T.primary : '#e2e8f0'}`,
                  boxShadow: isSelected ? '0 2px 8px rgba(6, 78, 59, 0.25)' : 'none',
                  '&:hover': {
                    bgcolor: isSelected ? T.primaryDark : '#f8fafc',
                    borderColor: isSelected ? T.primaryDark : '#cbd5e1',
                  }
                }}
              >
                {cat}
              </Button>
            );
          })}
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            4. STORE CARDS LIST (Matching Attached Image Exactly)
           ══════════════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: T.primary }} />
            <Typography sx={{ mt: 2, color: '#64748b', fontWeight: 600, fontSize: '0.88rem' }}>
              Finding stores near you...
            </Typography>
          </Box>
        ) : filteredStores.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <StorefrontIcon sx={{ fontSize: 48, color: T.primary, mb: 1, opacity: 0.85 }} />
            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', mb: 0.5 }}>
              No B2B Wholesale Stores Found Nearby
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.84rem', maxWidth: 420, mx: 'auto', mb: 2 }}>
              There are currently no other B2B wholesale distributors registered near your location. You can order wholesale catalog products directly via B2B Online.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/business/online-marketplace')}
              sx={{
                bgcolor: T.primary,
                '&:hover': { bgcolor: T.primaryDark },
                borderRadius: '10px',
                px: 2.5,
                py: 1,
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
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
