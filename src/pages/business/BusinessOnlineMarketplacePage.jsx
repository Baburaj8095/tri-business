import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Business as BusinessIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as DeliveryIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  ShoppingBag as ProductIcon,
  Storefront as StoreIcon,
} from '@mui/icons-material';

const P = '#228B22';
const PD = '#1B4D3E';
const BG = '#f8fafc';
const SUR = '#ffffff';
const TXT = '#0f172a';
const MUT = '#64748b';
const BOR = '#e2e8f0';

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

function fmtCurrency(val) {
  return `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function resolveImage(product) {
  return product.image_url || product.image || product.shop_image || '';
}

function readB2BCart() {
  try {
    return JSON.parse(localStorage.getItem(B2B_CART_KEY) || 'null');
  } catch (_) {
    return null;
  }
}

function cartItemCount(cart) {
  return (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function MarketplaceProductCard({ product, onAddToCart }) {
  const image = resolveImage(product);
  const title = product.title || product.name || 'Online B2B Product';
  const shopName = product.shop_name || product.business_name || product.merchant_name || 'B2B Merchant';

  return (
    <Card elevation={0} sx={{ height: '100%', border: `1px solid ${BOR}`, borderRadius: 3, overflow: 'hidden', bgcolor: SUR }}>
      <Box sx={{ height: 120, bgcolor: '#f1f5f9', position: 'relative', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        {image ? (
          <Box component="img" src={image} alt={title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ProductIcon sx={{ fontSize: 52, color: '#cbd5e1' }} />
        )}
        <Chip
          size="small"
          label={product.service_mode || 'ONLINE'}
          icon={<DeliveryIcon />}
          sx={{
            position: 'absolute', top: 10, right: 10,
            bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800,
            '& .MuiChip-icon': { fontSize: 15, color: '#047857' },
          }}
        />
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.1}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 900, color: TXT, lineHeight: 1.25 }} noWrap>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: MUT, fontWeight: 700, mt: 0.25 }} noWrap>
              {product.category || 'General'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography sx={{ color: P, fontWeight: 900, fontSize: 15 }}>{fmtCurrency(product.price)}</Typography>
            <Chip size="small" label={`Stock: ${product.stock_qty ?? 0}`} sx={{ bgcolor: '#f1f5f9', color: TXT, fontWeight: 800 }} />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.75, borderTop: `1px solid ${BOR}` }}>
            <Avatar src={product.shop_image || ''} sx={{ width: 34, height: 34, bgcolor: '#e0f2fe', color: '#0369a1' }}>
              <StoreIcon fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: TXT }} noWrap>{shopName}</Typography>
              <Typography sx={{ fontSize: 11.5, color: MUT, fontWeight: 650 }} noWrap>{product.shop_city || 'Online B2B seller'}</Typography>
            </Box>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            startIcon={<CartIcon />}
            onClick={() => onAddToCart(product)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 850, bgcolor: P, '&:hover': { bgcolor: PD } }}
          >
            Add to Cart
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BusinessOnlineMarketplacePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(() => cartItemCount(readB2BCart()));
  const [success, setSuccess] = useState('');

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
    return ['All', ...values];
  }, [products]);

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
      if (category) params.set('category', category);
      if (appliedSearch.trim()) params.set('search', appliedSearch.trim());

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
  }, [appliedSearch, category]);

  useEffect(() => {
    fetchProducts({ nextOffset: 0 });
  }, [fetchProducts]);

  function applySearch() {
    setAppliedSearch(search.trim());
    setOffset(0);
  }

  function handleCategory(nextCategory) {
    setCategory(nextCategory === 'All' ? '' : nextCategory);
    setOffset(0);
  }

  function handleAddToCart(product) {
    const shopId = Number(product.shop_id);
    const sellerId = Number(product.merchant_id || product.seller_id || 0);
    const existing = readB2BCart();
    let nextCart = existing;

    if (existing?.shopId && Number(existing.shopId) !== shopId) {
      const replace = window.confirm('Your B2B cart already contains products from another seller. Replace it with this seller?');
      if (!replace) return;
      nextCart = null;
    }

    if (!nextCart) {
      nextCart = {
        shopId,
        sellerId,
        shopName: product.shop_name || product.business_name || 'B2B Seller',
        items: [],
      };
    }

    const productId = Number(product.id);
    const current = nextCart.items.find(item => Number(item.productId) === productId);
    if (current) {
      const maxQty = Number(product.stock_qty || 0);
      current.quantity = Math.min(Number(current.quantity || 0) + 1, maxQty || Number(current.quantity || 0) + 1);
    } else {
      nextCart.items.push({
        productId,
        title: product.title || 'B2B Product',
        price: Number(product.price || 0),
        mrp: Number(product.mrp || product.price || 0),
        quantity: 1,
        stockQty: Number(product.stock_qty || 0),
        image: resolveImage(product),
        shopId,
        sellerId,
        shopName: product.shop_name || product.business_name || 'B2B Seller',
      });
    }

    localStorage.setItem(B2B_CART_KEY, JSON.stringify(nextCart));
    setCartCount(cartItemCount(nextCart));
    setSuccess(`${product.title || 'Product'} added to B2B cart.`);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, maxWidth: '430px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderLeft: `1px solid ${BOR}`, borderRight: `1px solid ${BOR}` }}>
      <Box sx={{ bgcolor: PD, color: '#fff', py: 2 }}>
        <Container disableGutters sx={{ px: 2 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <IconButton 
              onClick={() => navigate('/business-dashboard')} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.12)', 
                border: '1px solid rgba(255,255,255,0.25)', 
                color: '#ffffff', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                width: 38,
                height: 38
              }}
            >
              <BackIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: `${P}55`, color: '#fff' }}>
              <BusinessIcon />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={800}>Online B2B Marketplace</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Browse active online products from other B2B merchants
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={() => navigate('/business/online-marketplace/cart')} sx={{ color: '#fff' }}>
              <Badge badgeContent={cartCount} color="error">
                <CartIcon />
              </Badge>
            </IconButton>
          </Stack>
        </Container>
      </Box>
 
      <Container sx={{ py: 3, px: 2 }}>
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
          This page is for browsing B2B products from other online merchants. To manage your own listings, use <strong>Manage My Online Products</strong>.
        </Alert>

        <Card elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3, mb: 2.5 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products, descriptions, or shops…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: MUT }} /></InputAdornment> }}
              />
              <Button variant="contained" onClick={applySearch} sx={{ bgcolor: P, borderRadius: 2, px: 3, fontWeight: 850, textTransform: 'none', '&:hover': { bgcolor: PD } }}>
                Search
              </Button>
            </Stack>

            <Stack direction="row" gap={1} sx={{ mt: 2, overflowX: 'auto', pb: 0.5 }}>
              {categories.map(cat => {
                const selected = (cat === 'All' && !category) || category === cat;
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    onClick={() => handleCategory(cat)}
                    color={selected ? 'success' : 'default'}
                    sx={{ fontWeight: 800, flexShrink: 0 }}
                  />
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: TXT }}>Browse Online Products</Typography>
            <Typography sx={{ fontSize: 12.5, color: MUT, fontWeight: 650 }}>
              {products.length} product{products.length === 1 ? '' : 's'} loaded
            </Typography>
          </Box>
          <InventoryIcon sx={{ color: P }} />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: P }} />
            <Typography sx={{ mt: 1, color: MUT, fontWeight: 700 }}>Loading B2B marketplace products…</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, border: `2px dashed ${BOR}`, borderRadius: 3, bgcolor: SUR }}>
            <ProductIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ color: TXT, fontWeight: 900 }}>No B2B online products found</Typography>
            <Typography sx={{ color: MUT, fontSize: 13, mt: 0.5 }}>Try a different search or category.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px', mb: 2 }}>
              {products.map((product) => (
                <Box sx={{ width: 'calc(50% - 6px)', boxSizing: 'border-box' }} key={`${product.id}-${product.shop_id}`}>
                  <MarketplaceProductCard product={product} onAddToCart={handleAddToCart} />
                </Box>
              ))}
            </Box>

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  disabled={loadingMore}
                  onClick={() => fetchProducts({ nextOffset: offset + PAGE_SIZE })}
                  sx={{ borderColor: P, color: P, borderRadius: 2, fontWeight: 850, textTransform: 'none' }}
                >
                  {loadingMore ? 'Loading…' : 'Load More Products'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}