import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, Container, Divider,
  IconButton, Stack, TextField, Typography, Chip
} from '@mui/material';
import {
  ArrowBackRounded as BackIcon,
  DeleteOutlineRounded as DeleteIcon,
  RemoveRounded as RemoveIcon,
  AddRounded as AddIcon,
  BoltRounded as FastBoltIcon,
  LocationOnRounded as LocationIcon,
  StorefrontRounded as StoreIcon,
  ReceiptLongRounded as ReceiptIcon,
  ShoppingCartOutlined as CartIcon,
  VerifiedRounded as VerifiedIcon
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';

const PRIMARY = '#047857';
const PRIMARY_DARK = '#065f46';
const CART_KEY = 'tri_business_b2b_cart';
const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

function authHeaders() {
  const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain') || localStorage.getItem('captain_token');
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

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || 'null'); } catch (_) { return null; }
}

function writeCart(cart) {
  if (!cart || !cart.items?.length) localStorage.removeItem(CART_KEY);
  else localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BusinessB2BCartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => readCart());
  const [notes, setNotes] = useState('');
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const items = cart?.items || [];
  const totalCount = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0), [items]);

  useEffect(() => { writeCart(cart); }, [cart]);

  function updateQty(productId, delta) {
    setValidation(null);
    setCart(prev => {
      if (!prev) return prev;
      const nextItems = prev.items.map(item => {
        const itId = item.productId || item.id;
        if (Number(itId) !== Number(productId)) return item;
        const maxQty = Number(item.stockQty || 999999);
        return { ...item, quantity: Math.max(1, Math.min(Number(item.quantity || 1) + delta, maxQty)) };
      });
      return { ...prev, items: nextItems };
    });
  }

  function removeItem(productId) {
    setValidation(null);
    setCart(prev => {
      if (!prev) return prev;
      const nextItems = prev.items.filter(item => Number(item.productId || item.id) !== Number(productId));
      return nextItems.length ? { ...prev, items: nextItems } : null;
    });
  }

  async function validateCart() {
    if (!cart?.shopId || !items.length) return null;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/cart/validate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          shop_id: cart.shopId,
          items: items.map(i => ({ product_id: i.productId || i.id, quantity: i.quantity }))
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      const data = await res.json();
      setValidation(data);
      if (!data.is_valid) setError(data.message || 'Cart validation failed.');
      else setSuccess('Cart validated successfully.');
      return data;
    } catch (e) {
      setError(e.message || 'Failed to validate cart.');
      return null;
    } finally { setLoading(false); }
  }

  async function placeOrder() {
    if (!items.length) return;
    const validated = validation?.is_valid ? validation : await validateCart();
    if (validation && !validated?.is_valid) return;

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          shop_id: cart?.shopId || 1,
          notes,
          items: items.map(i => ({ product_id: i.productId || i.id, quantity: i.quantity }))
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      const order = await res.json();
      localStorage.removeItem(CART_KEY);
      setCart(null);
      setSuccess(`B2B Order ${order.order_number || `#${order.id || 'Confirmed'}`} placed successfully! Dispatching in 15-30m.`);
      setTimeout(() => navigate('/business/b2b-orders'), 1200);
    } catch (e) {
      setError(e.message || 'Failed to place B2B order.');
    } finally { setLoading(false); }
  }

  return (
    <AppShell activeTab="/business/online-marketplace" title="Cart & Checkout">
      <Container maxWidth="sm" sx={{ pt: 1, pb: 12 }}>
        
        {/* Top Header Row */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', '&:hover': { bgcolor: '#f8fafc' } }}
          >
            <BackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              Checkout
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
              {items.length ? `${totalCount} ${totalCount === 1 ? 'item' : 'items'} in your wholesale order` : 'Review and place order'}
            </Typography>
          </Box>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', fontWeight: 700 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '14px', fontWeight: 700 }}>{success}</Alert>}

        {!items.length ? (
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              bgcolor: '#ffffff',
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              my: 4,
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: '#ecfdf5',
                color: PRIMARY,
                border: '2px solid #a7f3d0',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CartIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', mb: 0.5 }}>
              Your B2B Cart is Empty
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 300, mx: 'auto', mb: 3 }}>
              Explore wholesale marketplace suppliers and add items with instant dispatch.
            </Typography>
            <Button
              onClick={() => navigate('/business/online-marketplace')}
              variant="contained"
              sx={{
                bgcolor: PRIMARY,
                color: '#ffffff',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                px: 3.5,
                py: 1.1,
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                '&:hover': { bgcolor: PRIMARY_DARK },
              }}
            >
              Browse Marketplace
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            
            {/* Delivery Guarantee Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                p: 2,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
                <FastBoltIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                  Express Delivery in 15-30 Minutes
                </Typography>
              </Stack>
              <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                      Delivering to Operating Outlet
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                      Primary Store Location • Live GPS Tracked
                    </Typography>
                  </Box>
                </Stack>
                <Chip size="small" label="Free Shipping" sx={{ bgcolor: '#ecfdf5', color: PRIMARY, fontWeight: 800, fontSize: '0.68rem', border: '1px solid #a7f3d0' }} />
              </Stack>
            </Card>

            {/* Seller Information */}
            {cart.shopName && (
              <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StoreIcon sx={{ fontSize: 18, color: '#64748b' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  Wholesale Supplier: <strong style={{ color: '#0f172a' }}>{cart.shopName}</strong>
                </Typography>
              </Box>
            )}

            {/* Cart Items List */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                p: 2,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                Order Items ({totalCount})
              </Typography>

              <Stack spacing={1.75} divider={<Divider sx={{ borderColor: '#f1f5f9' }} />}>
                {items.map(item => {
                  const itId = item.productId || item.id;
                  return (
                    <Box key={itId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        component="img"
                        src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80"}
                        alt={item.title}
                        sx={{ width: 56, height: 56, borderRadius: '12px', objectFit: 'cover', bgcolor: '#f8fafc', flexShrink: 0, border: '1px solid #e2e8f0' }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }} noWrap>
                          {item.title}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                          {item.packSize || '1 Standard Unit'}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: PRIMARY }}>
                            {money(item.price)}
                          </Typography>
                          {item.mrp && Number(item.mrp) > Number(item.price) && (
                            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                              {money(item.mrp)}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Stepper & Delete */}
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#ecfdf5',
                            border: '1.5px solid #a7f3d0',
                            borderRadius: '10px',
                            px: 0.5,
                            py: 0.2,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQty(itId, -1)}
                            sx={{ color: PRIMARY, p: 0.25 }}
                          >
                            <RemoveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, px: 1, color: PRIMARY }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQty(itId, 1)}
                            sx={{ color: PRIMARY, p: 0.25 }}
                          >
                            <AddIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => removeItem(itId)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' }, p: 0.5 }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Card>

            {/* Order Notes Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                p: 2,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Order Instructions (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="E.g. Please dispatch before 5 PM, deliver to loading dock..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  bgcolor: '#f8fafc',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '0.84rem',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: PRIMARY },
                  }
                }}
              />
            </Card>

            {/* Bill Summary */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                p: 2.25,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              }}
            >
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a', mb: 1.5 }}>
                Bill Summary
              </Typography>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                    Item Total ({totalCount} items)
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    {money(subtotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                    Delivery Partner Fee
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: PRIMARY }}>
                    FREE
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                    GST & Service Charges
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                    Included
                  </Typography>
                </Stack>
                <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Grand Total
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: PRIMARY }}>
                    {money(subtotal)}
                  </Typography>
                </Stack>
              </Stack>
            </Card>

          </Stack>
        )}

        {/* Sticky Mobile Checkout Footer Dock */}
        {items.length > 0 && (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 64, lg: 0 },
              left: 0,
              right: 0,
              bgcolor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              py: 1.5,
              px: { xs: 2, sm: 4 },
              zIndex: 1000,
              boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <Container maxWidth="sm" sx={{ p: '0 !important' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    TOTAL AMOUNT
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                    {money(subtotal)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  disabled={loading}
                  onClick={placeOrder}
                  sx={{
                    bgcolor: PRIMARY,
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    borderRadius: '14px',
                    height: '46px',
                    px: { xs: 3, sm: 4 },
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: PRIMARY_DARK },
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Place B2B Order'}
                </Button>
              </Stack>
            </Container>
          </Box>
        )}

      </Container>
    </AppShell>
  );
}