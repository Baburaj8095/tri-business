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
      <Container maxWidth="xl" sx={{ pt: 3.5, px: { xs: 2, sm: 3, lg: 4 } }}>
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
          <Grid container spacing={2}>
            {filteredStores.map((store) => (
              <Grid item xs={12} md={6} key={store.id}>
                <Card
                  elevation={0}
                  onClick={() => navigate(`/business/shop/${store.id}`)}
                  sx={{
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    p: { xs: 1.75, sm: 2 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1.75,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    height: '100%',
                    minHeight: { xs: 136, sm: 140 },
                    boxSizing: 'border-box',
                    '&:hover': {
                      borderColor: '#047857',
                      boxShadow: '0 6px 20px rgba(4, 120, 87, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Store Thumbnail with Discount Floating Badge (Strict 92x92 size) */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: 88, sm: 96 },
                      minWidth: { xs: 88, sm: 96 },
                      height: { xs: 88, sm: 96 },
                      minHeight: { xs: 88, sm: 96 },
                      borderRadius: '14px',
                      overflow: 'hidden',
                      bgcolor: '#f1f5f9',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={store.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        bgcolor: 'rgba(6, 78, 59, 0.92)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        px: 0.75,
                        py: 0.2,
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: 800,
                        letterSpacing: '0.2px',
                      }}
                    >
                      5% CASHBACK
                    </Box>
                  </Box>

                  {/* Store Info Container */}
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: { xs: 88, sm: 96 } }}>
                    {/* Top Row: Name and Bookmark */}
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1.2 }} noWrap>
                          {store.name}
                        </Typography>
                        <IconButton size="small" onClick={(e) => e.stopPropagation()} sx={{ p: 0.2, color: '#94a3b8' }}>
                          <StarIcon sx={{ fontSize: 17, color: '#cbd5e1' }} />
                        </IconButton>
                      </Stack>

                      {/* Rating • Category */}
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: '#ecfdf5', px: 0.6, py: 0.15, borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          <StarIcon sx={{ fontSize: 11, color: '#047857' }} />
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857' }}>
                            {store.rating || '4.3'}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }} noWrap>
                          {store.category} • 25 Yrs
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Location & ETA */}
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }} noWrap>
                      📍 {store.location} • 26 mins • 8.4 km
                    </Typography>

                    {/* Bottom Row: Verified Badge and View Store Button */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Chip
                        size="small"
                        label="✓ Verified"
                        sx={{
                          bgcolor: '#f0fdf4',
                          color: '#15803d',
                          fontWeight: 800,
                          fontSize: '0.66rem',
                          height: 22,
                          border: '1px solid #bbf7d0',
                        }}
                      />

                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/business/shop/${store.id}`);
                        }}
                        sx={{
                          bgcolor: '#047857',
                          color: '#ffffff',
                          height: '32px',
                          px: 2,
                          minWidth: '88px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          borderRadius: '10px',
                          textTransform: 'none',
                          boxShadow: '0 2px 6px rgba(4, 120, 87, 0.2)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          '&:hover': { bgcolor: '#065f46' },
                          '&:active': { transform: 'scale(0.96)' }
                        }}
                      >
                        View Store
                      </Button>
                    </Stack>
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
