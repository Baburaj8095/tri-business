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
                boxShadow: viewMode === 'map' ? '0 2px 6px rgba(255,101,8,0.25)' : 'none',
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
                boxShadow: viewMode === 'list' ? '0 2px 6px rgba(255,101,8,0.25)' : 'none',
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
                  boxShadow: isSelected ? '0 2px 8px rgba(255,101,8,0.25)' : 'none',
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
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                    width: '100%',
                    '&:hover': {
                      borderColor: '#ea580c',
                      boxShadow: '0 8px 24px rgba(21, 128, 61, 0.12)',
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
                      bgcolor: '#f1f5f9',
                    }}
                  >
                    <Box
                      component="img"
                      src={store.image}
                      alt={store.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
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
                    {/* Top-Left: Cashback Tag Badge */}
                    {store.cashback && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'rgba(6, 78, 59, 0.92)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          px: 1,
                          py: 0.4,
                          borderRadius: '8px',
                          fontSize: '9.5px',
                          fontWeight: 900,
                          letterSpacing: '0.4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      >
                        <TagIcon sx={{ fontSize: 13, color: '#ffffff' }} />
                        <span>{store.cashback}</span>
                      </Box>
                    )}

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
                        color: isFav ? '#ef4444' : '#64748b',
                        '&:hover': { bgcolor: '#ffffff', transform: 'scale(1.06)' },
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isFav ? (
                        <FavoriteIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 20, color: '#64748b' }} />
                      )}
                    </IconButton>

                    {/* Bottom-Right: Products Count Badge */}
                    {store.productCount && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 12,
                          bgcolor: 'rgba(15, 23, 42, 0.76)',
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
                    )}
                  </Box>

                  {/* ─── CARD BODY DETAILS ─── */}
                  <Box sx={{ p: { xs: 2, sm: 2.25 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    
                    {/* Header Row: Avatar + Title & Badges + Rating Pill */}
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
                      
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
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '13px',
                              bgcolor: '#dcfce7',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#ea580c',
                              border: '1px solid #bbf7d0',
                            }}
                          >
                            <StorefrontIcon sx={{ fontSize: 28 }} />
                          </Box>
                        )}
                      </Box>

                      {/* Middle: Name, Category, Tenure & Status Badges */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
                          {store.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, mt: 0.25 }} noWrap>
                          {store.category} • {store.yearsInBusiness}
                        </Typography>

                        {/* Badges Row */}
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.35,
                              bgcolor: '#fff7ed',
                              color: '#9a3412',
                              border: '1px solid #a7f3d0',
                              borderRadius: '6px',
                              px: 0.75,
                              py: 0.25,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                            }}
                          >
                            <VerifiedIcon sx={{ fontSize: 13, color: '#ea580c' }} />
                            <span>{store.badge1}</span>
                          </Box>

                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              bgcolor: '#eff6ff',
                              color: '#1e40af',
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
                      {store.rating && (
                        <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.35,
                              bgcolor: '#FFF7ED',
                              border: '1px solid #FED7AA',
                              borderRadius: '8px',
                              px: 1,
                              py: 0.35,
                            }}
                          >
                            <StarIcon sx={{ fontSize: 14, color: '#EA580C' }} />
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>
                              {store.rating}
                            </Typography>
                          </Box>
                          {store.reviewCount && (
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, mt: 0.3 }}>
                              ({store.reviewCount})
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Stack>

                    {/* Line 2: Location & Distance */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <LocationIcon sx={{ fontSize: 15, color: '#64748b' }} />
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }} noWrap>
                        {[store.location, store.eta, store.distance].filter(Boolean).join(' • ')}
                      </Typography>
                    </Box>

                    {/* Line 3: 3 Action Buttons (Call, WhatsApp, View Store) - Guaranteed Zero Breaking */}
                    <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} sx={{ mt: 0.5, width: '100%' }}>
                      {/* Call Button */}
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${store.phone}`;
                        }}
                        startIcon={<PhoneIcon sx={{ fontSize: 15, color: '#ea580c' }} />}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          height: 38,
                          px: { xs: 0.8, sm: 1.5 },
                          borderColor: '#e2e8f0',
                          color: '#0f172a',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: { xs: '0.74rem', sm: '0.8rem' },
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          bgcolor: '#ffffff',
                          boxShadow: 'none',
                          '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 }, ml: 0 },
                          '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                          '&:active': { transform: 'scale(0.98)' }
                        }}
                      >
                        Call
                      </Button>

                      {/* WhatsApp Button */}
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/91${String(store.phone).replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(store.name)}`, '_blank');
                        }}
                        startIcon={<WhatsAppIcon sx={{ fontSize: 16, color: '#25d366' }} />}
                        sx={{
                          flex: 1.15,
                          minWidth: 0,
                          height: 38,
                          px: { xs: 0.8, sm: 1.5 },
                          borderColor: '#e2e8f0',
                          color: '#0f172a',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: { xs: '0.74rem', sm: '0.8rem' },
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          bgcolor: '#ffffff',
                          boxShadow: 'none',
                          '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 }, ml: 0 },
                          '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                          '&:active': { transform: 'scale(0.98)' }
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
                          bgcolor: '#ea580c',
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: { xs: '0.74rem', sm: '0.82rem' },
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          boxShadow: 'none',
                          '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 }, ml: 0 },
                          '&:hover': { bgcolor: '#c2410c', boxShadow: 'none' },
                          '&:active': { transform: 'scale(0.98)' }
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
    </AppShell>
  );
}
