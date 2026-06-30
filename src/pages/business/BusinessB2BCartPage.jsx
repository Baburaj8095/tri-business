import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, Container, Divider,
  IconButton, Stack, TextField, Typography
} from '@mui/material';
import { ArrowBack, Delete, Remove, Add, ShoppingCartCheckout } from '@mui/icons-material';

const P = '#228B22';
const PD = '#1B4D3E';
const BG = '#f8fafc';
const BOR = '#e2e8f0';
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
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0), [items]);

  useEffect(() => { writeCart(cart); }, [cart]);

  function updateQty(productId, delta) {
    setValidation(null);
    setCart(prev => {
      if (!prev) return prev;
      const nextItems = prev.items.map(item => {
        if (Number(item.productId) !== Number(productId)) return item;
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
      const nextItems = prev.items.filter(item => Number(item.productId) !== Number(productId));
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
        body: JSON.stringify({ shop_id: cart.shopId, items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })) }),
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
    const validated = validation?.is_valid ? validation : await validateCart();
    if (!validated?.is_valid) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ shop_id: cart.shopId, notes, items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })) }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      const order = await res.json();
      localStorage.removeItem(CART_KEY);
      setCart(null);
      setSuccess(`B2B order ${order.order_number || `#${order.id}`} placed successfully.`);
      setTimeout(() => navigate('/business/b2b-orders'), 900);
    } catch (e) {
      setError(e.message || 'Failed to place B2B order.');
    } finally { setLoading(false); }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 5 }}>
      <Box sx={{ bgcolor: PD, color: '#fff', py: 2 }}>
        <Container sx={{ maxWidth: '430px !important', px: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => navigate('/business/online-marketplace')} sx={{ color: '#fff' }}><ArrowBack /></IconButton>
            <Box>
              <Typography variant="h6" fontWeight={900}>B2B Cart</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>One seller/shop per cart</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container sx={{ maxWidth: '430px !important', py: 3, px: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {!items.length ? (
          <Card elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography fontWeight={900}>Your B2B cart is empty</Typography>
              <Button onClick={() => navigate('/business/online-marketplace')} sx={{ mt: 2, bgcolor: P }} variant="contained">Browse Marketplace</Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            <Alert severity="info">Seller: <strong>{cart.shopName}</strong></Alert>
            {items.map(item => (
              <Card key={item.productId} elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" gap={2} alignItems="center">
                    <Box component="img" src={item.image || ''} alt="" sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover', bgcolor: '#f1f5f9' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={900}>{item.title}</Typography>
                      <Typography color="text.secondary" fontSize={13}>{money(item.price)} × {item.quantity}</Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton size="small" onClick={() => updateQty(item.productId, -1)}><Remove /></IconButton>
                      <Typography fontWeight={900}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQty(item.productId, 1)}><Add /></IconButton>
                    </Stack>
                    <IconButton color="error" onClick={() => removeItem(item.productId)}><Delete /></IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Card elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3 }}>
              <CardContent>
                <TextField fullWidth multiline minRows={2} label="Order notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between"><Typography fontWeight={800}>Subtotal</Typography><Typography fontWeight={900}>{money(subtotal)}</Typography></Stack>
                {validation && <Alert sx={{ mt: 2 }} severity={validation.is_valid ? 'success' : 'warning'}>{validation.message}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button variant="outlined" disabled={loading} onClick={validateCart} sx={{ flex: 1, borderColor: P, color: P }}>Validate Cart</Button>
                  <Button variant="contained" disabled={loading} onClick={placeOrder} startIcon={loading ? <CircularProgress size={16} /> : <ShoppingCartCheckout />} sx={{ flex: 1, bgcolor: P, '&:hover': { bgcolor: PD } }}>Place B2B Order</Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>
    </Box>
  );
}