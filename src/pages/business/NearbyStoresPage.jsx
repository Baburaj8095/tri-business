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
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Map as MapIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Payment as PayIcon,
  LocalShipping as DeliveryIcon,
  StarRounded as StarIcon,
  ArrowForward as ArrowRightIcon
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import { T, cardHoverSx, primaryBtnSx, secondaryBtnSx } from '../../theme/tokens';
import { getPublicB2bMerchants, getMerchantCategories } from '../../api/api';

const resolveCategoryName = (shop) => {
  const raw = shop?.category;
  if (raw && typeof raw === 'object') {
    return raw.name || raw.title || raw.label || 'Retail Store';
  }
  return shop?.category_name || shop?.business_category || shop?.business_type || shop?.subcategory_name || (raw ? String(raw) : 'Retail Store');
};

export default function NearbyStoresPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['All Stores', 'Mechanic', 'Food & Beverage', 'Grocery', 'Pharmacy', 'Fashion']);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPublicB2bMerchants().catch(() => []),
      getMerchantCategories().catch(() => [])
    ])
      .then(([merchantsRes, categoriesRes]) => {
        const data = merchantsRes || [];
        const mapped = data.map(shop => ({
          id: shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'Merchant Store',
          category: resolveCategoryName(shop),
          rating: '4.5',
          reviewCount: 202,
          location: shop.city || shop.address || 'Local Area',
          distance: 'Nearby',
          cashback: '5% Cashback',
          status: 'Open now',
          phone: shop.contact_number || shop.phone || '',
          image: shop.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        }));
        setStores(mapped);
        setFilteredStores(mapped);

        const cats = categoriesRes || [];
        if (cats.length > 0) {
          const names = ['All Stores', ...cats.map(c => c.name)];
          setCategories(Array.from(new Set(names)));
        }
      })
      .catch(err => console.error('Failed to load stores:', err))
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

  return (
    <AppShell activeTab="/business/nearby-stores">
      <Container maxWidth="xl" sx={{ pt: { xs: 2, sm: 3.5 }, px: { xs: 1.5, sm: 3, lg: 4 } }}>
        {/* ─── HEADER BAR (Matching Image 1 Screen 4) ─── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>
              Nearby Stores
            </Typography>
            <Typography sx={{ color: T.textSecondary, fontSize: '0.88rem', mt: 0.25 }}>
              Explore and connect with B2B/B2C stores near your operating location
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() => alert('Map View is integrated with store GPS coordinates.')}
            sx={{
              ...secondaryBtnSx,
              borderColor: T.primary,
              color: T.primary,
              fontWeight: 800,
              px: 2.5,
              '&:hover': { bgcolor: T.primaryLight, borderColor: T.primary }
            }}
          >
            Map View
          </Button>
        </Stack>

        {/* ─── SEARCH INPUT & CATEGORY PILLS ─── */}
        <Stack spacing={2} sx={{ mb: 3.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search stores, categories or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: T.textMuted, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 540,
              bgcolor: T.surface,
              '& .MuiOutlinedInput-root': { borderRadius: '14px', '& fieldset': { borderColor: T.border } }
            }}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 1.25,
              overflowX: 'auto',
              pb: 1,
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
                    borderRadius: T.radiusFull,
                    px: 2.2,
                    py: 0.65,
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 800 : 600,
                    textTransform: 'none',
                    bgcolor: isSelected ? T.primary : T.surface,
                    color: isSelected ? '#FFFFFF' : T.textSecondary,
                    border: `1px solid ${isSelected ? T.primary : T.border}`,
                    boxShadow: isSelected ? '0 2px 8px rgba(34,139,34,0.2)' : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? T.primaryHover : T.surfaceAlt,
                      borderColor: isSelected ? T.primaryHover : T.borderHover,
                    }
                  }}
                >
                  {cat}
                </Button>
              );
            })}
          </Box>
        </Stack>

        {/* ─── STORES LIST (Matching Image 1 Screen 12) ─── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <CircularProgress sx={{ color: T.primary }} />
            <Typography sx={{ mt: 2, color: T.textSecondary, fontWeight: 600, fontSize: '0.9rem' }}>
              Finding stores near you...
            </Typography>
          </Box>
        ) : filteredStores.length === 0 ? (
          <Card elevation={0} sx={{ ...cardHoverSx, p: 6, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: T.text, mb: 0.5 }}>
              No nearby stores found
            </Typography>
            <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>
              Try searching a different category or operating location.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {filteredStores.map((store) => (
              <Grid item xs={12} sm={6} lg={4} key={store.id}>
                <Card
                  elevation={0}
                  onClick={() => navigate(`/business/shop/${store.id}`)}
                  sx={{
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                    height: '100%',
                    width: '100%',
                    '&:hover': {
                      borderColor: '#047857',
                      boxShadow: '0 8px 24px rgba(4, 120, 87, 0.12)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  {/* Full-Width Store Cover Image Banner */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 154, sm: 168 },
                      overflow: 'hidden',
                      bgcolor: '#f1f5f9',
                    }}
                  >
                    <Box
                      component="img"
                      src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                      alt={store.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.04)' },
                      }}
                    />

                    {/* Top Floating Badges */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ position: 'absolute', top: 10, left: 10, right: 10 }}
                    >
                      <Box
                        sx={{
                          bgcolor: 'rgba(6, 78, 59, 0.92)',
                          backdropFilter: 'blur(6px)',
                          color: '#ffffff',
                          px: 1,
                          py: 0.35,
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.4px',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        5% CASHBACK
                      </Box>

                      <IconButton
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(4px)',
                          p: 0.6,
                          color: '#64748b',
                          '&:hover': { bgcolor: '#ffffff', color: '#d97706' },
                        }}
                      >
                        <StarIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>

                    {/* Bottom Floating Delivery & Distance Tag */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        bgcolor: 'rgba(15, 23, 42, 0.78)',
                        backdropFilter: 'blur(6px)',
                        color: '#ffffff',
                        px: 1.1,
                        py: 0.35,
                        borderRadius: '8px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      📍 {store.location || 'Local Area'} • 26 mins • 8.4 km
                    </Box>
                  </Box>

                  {/* Card Content & Details */}
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, gap: 1.5 }}>
                    {/* Header Row: Title & Rating */}
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.2px' }} noWrap>
                          {store.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.4,
                            bgcolor: '#ecfdf5',
                            px: 0.85,
                            py: 0.3,
                            borderRadius: '8px',
                            border: '1px solid #a7f3d0',
                            flexShrink: 0,
                          }}
                        >
                          <StarIcon sx={{ fontSize: 13, color: '#047857' }} />
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: '#047857' }}>
                            {store.rating || '4.5'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, mt: 0.3 }} noWrap>
                        {store.category} • 25 Yrs In Business
                      </Typography>
                    </Box>

                    {/* Badges Row */}
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        size="small"
                        label="✓ Verified Merchant"
                        sx={{
                          bgcolor: '#f0fdf4',
                          color: '#15803d',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                          border: '1px solid #bbf7d0',
                        }}
                      />
                      <Chip
                        size="small"
                        label="Instant Billing POS"
                        sx={{
                          bgcolor: '#f8fafc',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 22,
                          border: '1px solid #e2e8f0',
                        }}
                      />
                    </Stack>

                    {/* Full-Width Prominent View Store Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/business/shop/${store.id}`);
                      }}
                      startIcon={<StoreIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        mt: 'auto',
                        bgcolor: '#047857',
                        color: '#ffffff',
                        height: '42px',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        borderRadius: '12px',
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)',
                        '&:hover': { bgcolor: '#065f46', boxShadow: '0 4px 14px rgba(4, 120, 87, 0.35)' },
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      View Store
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </AppShell>
  );
}
