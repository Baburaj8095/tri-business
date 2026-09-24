import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Slider,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  RestartAlt as ResetIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Inventory2 as InventoryIcon
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import ProductCard from '../../components/business/ProductCard';
import { T, primaryBtnSx, secondaryBtnSx, cardSx } from '../../theme/tokens';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const PAGE_SIZE = 24;
const B2B_CART_KEY = 'tri_business_b2b_cart';

function authHeaders() {
  const token = localStorage.getItem('token_business')
    || localStorage.getItem('token_captain')
    || localStorage.getItem('captain_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function readApiError(res) {
  try {
    const data = await res.json();
    return data.error || data.message || data.details || `HTTP ${res.status}`;
  } catch (_) {
    return `HTTP ${res.status}`;
  }
}

function readB2BCart() {
  try {
    return JSON.parse(localStorage.getItem(B2B_CART_KEY) || 'null');
  } catch (_) {
    return null;
  }
}

const CATEGORY_TABS = [
  { label: 'All', icon: '🛍️' },
  { label: 'Food & Beverage', icon: '🍔' },
  { label: 'Mobiles', icon: '📱' },
  { label: 'Fashion', icon: '👕' },
  { label: 'Electronics', icon: '⚡' },
  { label: 'Home & Furniture', icon: '🛋️' },
  { label: 'Daily Needs', icon: '🧼' }
];

const PROMO_BANNERS = [
  {
    tag: '⚡ 15-30 MINS DISPATCH',
    title: 'Fast Local Wholesale Fulfillment',
    desc: 'Order bulk stock with same-day regional dispatch directly to your store shelves.',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    badge: 'Verified Captains'
  },
  {
    tag: '💥 BULK SUPER SAVER',
    title: 'Flat 20% to 40% Off FMCG Cartons',
    desc: 'Daily staples, beverages & snacks at direct manufacturer wholesale rates.',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    badge: 'Limited Time Deals'
  },
  {
    tag: '🛡️ 100% VERIFIED GST',
    title: 'Instant GST Tax Invoicing',
    desc: 'Save 18% with eligible input tax credit on verified wholesale orders.',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    badge: 'Official Invoices'
  }
];

const TRENDING_TAGS = ['⚡ Fast Dispatch', '🔥 Top Deals', '🥛 Dairy & Milk', '🌾 Rice & Atta', '🍫 Snacks & Sweets', '📦 Bulk Bundles'];

export default function BusinessOnlineMarketplacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Data & Filter State
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [appliedSearch, setAppliedSearch] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Pagination & Loading
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync url param if changed
  useEffect(() => {
    const q = searchParams.get('q');
    if (q != null && q !== appliedSearch) {
      setSearch(q);
      setAppliedSearch(q);
      setOffset(0);
    }
  }, [searchParams]);

  // Fetch Products API
  const fetchProducts = useCallback(async ({ nextOffset = 0 } = {}) => {
    const isLoadMore = nextOffset > 0;
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
        excludeOwn: 'true',
      });
      if (selectedCategory && selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      if (appliedSearch.trim()) {
        params.set('search', appliedSearch.trim());
      }

      const res = await fetch(`${CAPTAIN_API}/captain/business/online-products?${params.toString()}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(await readApiError(res));

      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.products || data.items || []);
      setProducts(prev => (isLoadMore ? [...prev, ...items] : items));
      setHasMore(items.length === PAGE_SIZE);
      setOffset(nextOffset);
    } catch (e) {
      setError(e.message || 'Failed to load B2B marketplace products');
      if (!isLoadMore) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [appliedSearch, selectedCategory]);

  useEffect(() => {
    fetchProducts({ nextOffset: 0 });
  }, [fetchProducts]);

  // Filtered & Sorted in memory
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Price range
    list = list.filter(p => {
      const pr = Number(p.price || 0);
      return pr >= priceRange[0] && pr <= priceRange[1];
    });

    // In stock
    if (inStockOnly) {
      list = list.filter(p => Number(p.stock_qty || p.stock || 0) > 0);
    }

    // Sort
    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return list;
  }, [products, priceRange, inStockOnly, sortBy]);

  // Add to B2B Cart Logic (preserving 100% of existing behavior)
  const handleAddToCart = (product) => {
    const shopId = Number(product.shop_id);
    const sellerId = Number(product.merchant_id || product.seller_id || 0);
    const existing = readB2BCart();
    let nextCart = existing;

    if (existing?.shopId && Number(existing.shopId) !== shopId) {
      const replace = window.confirm(
        'Your B2B cart already contains products from another wholesale merchant. Replace your cart with items from this seller?'
      );
      if (!replace) return;
      nextCart = null;
    }

    if (!nextCart) {
      nextCart = {
        shopId,
        sellerId,
        shopName: product.shop_name || product.business_name || 'B2B Wholesale Merchant',
        items: [],
      };
    }

    const productId = Number(product.id);
    const current = nextCart.items.find(item => Number(item.productId) === productId);
    if (current) {
      const maxQty = Number(product.stock_qty || 999999);
      current.quantity = Math.min(Number(current.quantity || 0) + 1, maxQty);
    } else {
      nextCart.items.push({
        productId,
        title: product.title || product.name || 'B2B Wholesale Product',
        price: Number(product.price || 0),
        mrp: Number(product.mrp || product.price || 0),
        quantity: 1,
        stockQty: Number(product.stock_qty || product.stock || 0),
        image: product.image_url || product.image || '',
        shopId,
        sellerId,
        shopName: product.shop_name || product.business_name || 'B2B Seller',
      });
    }

    localStorage.setItem(B2B_CART_KEY, JSON.stringify(nextCart));
    window.dispatchEvent(new Event('storage')); // Notify AppShell badge
    setToastMsg(`${product.title || 'Product'} added to your wholesale cart.`);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 50000]);
    setInStockOnly(false);
    setSearch('');
    setAppliedSearch('');
  };

  return (
    <AppShell activeTab="/business/online-marketplace">
      <Container maxWidth="xl" sx={{ pt: 3.5, px: { xs: 2, sm: 3, lg: 4 } }}>
        {/* ─── PAGE HEADER & MANAGE ACTION ─── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Online Wholesale Marketplace
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.88rem', mt: 0.25 }}>
              Source products from verified wholesale distributors & manufacturers with instant delivery
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<InventoryIcon />}
            onClick={() => navigate('/business/online-products')}
            sx={{
              bgcolor: '#059669',
              color: '#ffffff',
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              fontWeight: 800,
              fontSize: '0.86rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            + Manage My Products
          </Button>
        </Stack>

        {/* ─── QUICK COMMERCE PROMOTIONAL BANNERS ─── */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 1.5,
            mb: 2.5,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 2 },
          }}
        >
          {PROMO_BANNERS.map((banner, idx) => (
            <Card
              key={idx}
              elevation={0}
              sx={{
                flex: '0 0 auto',
                width: { xs: 290, sm: 340, md: 380 },
                borderRadius: '18px',
                background: banner.gradient,
                color: '#ffffff',
                p: 2.5,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <Box sx={{ display: 'inline-block', bgcolor: 'rgba(255,255,255,0.22)', px: 1, py: 0.35, borderRadius: '6px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.5px', mb: 1 }}>
                {banner.tag}
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.25, mb: 0.5 }}>
                {banner.title}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.35 }}>
                {banner.desc}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* ─── BLINKIT STYLE QUICK SEARCH BAR ─── */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
            fullWidth
            placeholder="Search 10,000+ wholesale products, brands, FMCG staples, beverages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearch(search.trim());
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#059669', fontSize: 24, ml: 0.5, mr: 0.5 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <Button
                  onClick={() => setAppliedSearch(search.trim())}
                  sx={{
                    bgcolor: '#059669',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    px: 2,
                    py: 0.75,
                    '&:hover': { bgcolor: '#047857' }
                  }}
                >
                  Search
                </Button>
              ),
              sx: {
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                pr: 1,
                py: 0.5,
                boxShadow: '0 2px 10px rgba(15,23,42,0.03)',
                '&.Mui-focused': { borderColor: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }
              }
            }}
          />

          {/* Trending Search Tags Strip */}
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', mt: 1.5, pb: 0.5 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              POPULAR:
            </Typography>
            {TRENDING_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                clickable
                onClick={() => {
                  const cleaned = tag.replace(/[^a-zA-Z0-9 ]/g, '').trim();
                  setSearch(cleaned);
                  setAppliedSearch(cleaned);
                }}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* ─── BLINKIT STYLE CATEGORY TABS SLIDER ─── */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            overflowX: 'auto',
            pb: 1.5,
            mb: 3,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 2 },
          }}
        >
          {CATEGORY_TABS.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <Button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                sx={{
                  flexShrink: 0,
                  borderRadius: '14px',
                  px: 2.2,
                  py: 0.9,
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 800 : 600,
                  textTransform: 'none',
                  bgcolor: isSelected ? '#059669' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: `1.5px solid ${isSelected ? '#059669' : '#e2e8f0'}`,
                  boxShadow: isSelected ? '0 4px 14px rgba(5,150,105,0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.85,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#047857' : '#f8fafc',
                    borderColor: isSelected ? '#047857' : '#cbd5e1',
                  }
                }}
              >
                <Box component="span" sx={{ fontSize: '1.15rem' }}>{cat.icon}</Box>
                <Typography component="span" sx={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 600, color: 'inherit' }}>
                  {cat.label}
                </Typography>
              </Button>
            );
          })}
        </Box>

        {/* ─── MAIN 2-COLUMN VIEWPORT (Desktop Sidebar + Products Grid) ─── */}
        <Grid container spacing={3.5}>
          {/* ── LEFT FILTER SIDEBAR (Desktop) ── */}
          {isDesktop && (
            <Grid item xs={12} md={3.2} lg={2.8}>
              <Card elevation={0} sx={{ ...cardSx, p: 2.5, position: 'sticky', top: 90, borderRadius: '18px' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    Filters
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
                    sx={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 }}
                  >
                    Clear Filters
                  </Button>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Categories Checkboxes */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 750, fontSize: '0.82rem', color: '#0f172a', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Category
                  </Typography>
                  <Stack spacing={0.5}>
                    {CATEGORY_TABS.slice(1).map((cat) => (
                      <FormControlLabel
                        key={cat.label}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedCategory === cat.label}
                            onChange={() => setSelectedCategory(selectedCategory === cat.label ? 'All' : cat.label)}
                            sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#059669' } }}
                          />
                        }
                        label={<Typography sx={{ fontSize: '0.84rem', color: '#334155' }}>{cat.icon} {cat.label}</Typography>}
                      />
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* Price Range Slider */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 750, fontSize: '0.82rem', color: T.text, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Price Range
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, val) => setPriceRange(val)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={50000}
                    step={500}
                    sx={{
                      color: T.primary,
                      '& .MuiSlider-thumb': { width: 16, height: 16 },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>
                      ₹{priceRange[0]}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>
                      ₹{priceRange[1]}+
                    </Typography>
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* Availability Checkbox */}
                <Box>
                  <Typography sx={{ fontWeight: 750, fontSize: '0.82rem', color: T.text, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Availability
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.84rem', color: T.textSecondary }}>In Stock Only</Typography>}
                  />
                </Box>
              </Card>
            </Grid>
          )}

          {/* ── RIGHT PRODUCTS GRID ── */}
          <Grid item xs={12} md={isDesktop ? 8.8 : 12} lg={isDesktop ? 9.2 : 12}>
            {/* Top Toolbar: Search input on mobile / Sort by dropdown */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.text }}>
                  {displayedProducts.length} products found
                </Typography>
                {selectedCategory !== 'All' && (
                  <Typography sx={{ fontSize: '0.8rem', color: T.textMuted }}>
                    in <strong style={{ color: T.primary }}>{selectedCategory}</strong>
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                {/* Search Bar on small screens */}
                <TextField
                  size="small"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setAppliedSearch(search.trim());
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: T.textMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    display: { xs: 'block', sm: 'none' },
                    flex: 1,
                    '& .MuiOutlinedInput-root': { borderRadius: T.radiusSm, bgcolor: T.surface }
                  }}
                />

                {/* Sort Dropdown */}
                <Select
                  size="small"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{
                    bgcolor: T.surface,
                    borderRadius: T.radiusSm,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    minWidth: 160,
                    '& fieldset': { borderColor: T.border },
                  }}
                >
                  <MenuItem value="relevance">Sort by: Relevance</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                </Select>
              </Stack>
            </Stack>

            {/* Error Feedback */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: T.radiusSm }}>
                {error}
              </Alert>
            )}

            {/* Products Grid */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 12 }}>
                <CircularProgress sx={{ color: T.primary }} />
                <Typography sx={{ mt: 2, color: T.textSecondary, fontWeight: 600, fontSize: '0.9rem' }}>
                  Loading wholesale products...
                </Typography>
              </Box>
            ) : displayedProducts.length === 0 ? (
              <Card elevation={0} sx={{ ...cardSx, p: 6, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: T.surfaceAlt,
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 32, color: T.textMuted }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: T.text, mb: 0.5 }}>
                  No wholesale products found
                </Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.85rem', mb: 2.5 }}>
                  Try changing your category filters, search keywords, or price range.
                </Typography>
                <Button onClick={handleClearFilters} sx={secondaryBtnSx}>
                  Reset All Filters
                </Button>
              </Card>
            ) : (
              <>
                <Grid container spacing={2.5}>
                  {displayedProducts.map((product) => (
                    <Grid item xs={6} sm={4} lg={3} key={product.id}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onClick={() => navigate(`/business/online-marketplace`)}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Load More Button */}
                {hasMore && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={() => fetchProducts({ nextOffset: offset + PAGE_SIZE })}
                      disabled={loadingMore}
                      sx={{
                        ...secondaryBtnSx,
                        px: 4,
                        py: 1.2,
                        borderColor: T.primary,
                        color: T.primary,
                        '&:hover': { bgcolor: T.primaryLight, borderColor: T.primary }
                      }}
                    >
                      {loadingMore ? 'Loading More Products...' : 'Load More Products'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg('')}
        message={toastMsg}
      />
    </AppShell>
  );
}