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
            placeholder="Search nearby stores by name, area or service..."
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
              '& .MuiOutlinedInput-root': { borderRadius: T.radiusSm, '& fieldset': { borderColor: T.border } }
            }}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 1.25,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: T.border, borderRadius: 2 },
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

        {/* ─── STORES LIST (Matching Image 1 Screen 4) ─── */}
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
              <Grid item xs={12} md={6} key={store.id}>
                <Card
                  elevation={0}
                  sx={{
                    ...cardHoverSx,
                    p: { xs: 2, sm: 2.5 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2.5,
                    alignItems: { xs: 'stretch', sm: 'center' },
                  }}
                >
                  {/* Store Thumbnail */}
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 150 },
                      height: 120,
                      borderRadius: T.radiusMd,
                      overflow: 'hidden',
                      bgcolor: T.surfaceAlt,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={store.image}
                      alt={store.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>

                  {/* Store Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: T.text }} noWrap>
                        {store.name}
                      </Typography>
                      <Chip
                        size="small"
                        label="Nearby"
                        sx={{
                          bgcolor: T.surfaceAlt,
                          color: T.textSecondary,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          height: 22,
                        }}
                      />
                    </Stack>

                    <Typography sx={{ fontSize: '0.82rem', color: T.textSecondary, mb: 1 }} noWrap>
                      {store.category} • <strong style={{ color: T.text }}>{store.location}</strong>
                    </Typography>

                    {/* Ratings & Cashback Row */}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: '#D97706' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: T.text }}>
                          {store.rating}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
                          ({store.reviewCount})
                        </Typography>
                      </Stack>

                      <Chip
                        size="small"
                        label={store.cashback}
                        sx={{
                          bgcolor: T.successBg,
                          color: T.successText,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          height: 22,
                          border: `1px solid ${T.successBorder}`,
                        }}
                      />
                    </Stack>

                    {/* Action Buttons Row */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        onClick={() => store.phone && window.open(`tel:${store.phone}`)}
                        sx={{
                          ...secondaryBtnSx,
                          py: 0.5,
                          px: 1.5,
                          fontSize: '0.78rem',
                          color: T.primary,
                        }}
                      >
                        Call
                      </Button>
                      <Button
                        size="small"
                        startIcon={<PayIcon sx={{ fontSize: 16 }} />}
                        onClick={() => navigate(`/business/shop/${store.id}`)}
                        sx={{
                          ...secondaryBtnSx,
                          py: 0.5,
                          px: 1.5,
                          fontSize: '0.78rem',
                        }}
                      >
                        Pay
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeliveryIcon sx={{ fontSize: 16 }} />}
                        onClick={() => navigate(`/business/delivery`)}
                        sx={{
                          ...secondaryBtnSx,
                          py: 0.5,
                          px: 1.5,
                          fontSize: '0.78rem',
                        }}
                      >
                        Delivery
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/business/shop/${store.id}`)}
                        sx={{
                          ...primaryBtnSx,
                          py: 0.55,
                          px: 2,
                          fontSize: '0.8rem',
                          ml: 'auto',
                        }}
                      >
                        View
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
