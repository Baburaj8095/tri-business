import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Divider, IconButton, Stack, Typography } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';

const P = '#228B22';
const PD = '#1B4D3E';
const BG = '#f8fafc';
const BOR = '#e2e8f0';
const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

function authHeaders() {
  const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain') || localStorage.getItem('captain_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function apiError(res) { try { const d = await res.json(); return d.error || d.message || d.details || `HTTP ${res.status}`; } catch (_) { return `HTTP ${res.status}`; } }
function money(v) { return `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function color(s) { if (['COMPLETED', 'DELIVERED', 'PAID'].includes(s)) return 'success'; if (['CANCELLED', 'REJECTED'].includes(s)) return 'error'; if (['PENDING_CONFIRMATION', 'PENDING_APPROVAL', 'PACKING'].includes(s)) return 'warning'; return 'default'; }

const transitions = {
  PENDING_CONFIRMATION: [{ label: 'Accept', status: 'CONFIRMED' }, { label: 'Reject', status: 'REJECTED', danger: true }],
  CONFIRMED: [{ label: 'Start Packing', status: 'PACKING' }, { label: 'Cancel', status: 'CANCELLED', danger: true }],
  PACKING: [{ label: 'Dispatch', status: 'DISPATCHED' }, { label: 'Cancel', status: 'CANCELLED', danger: true }],
  DISPATCHED: [{ label: 'Mark Delivered', status: 'DELIVERED' }],
  DELIVERED: [{ label: 'Complete', status: 'COMPLETED' }],
};

export default function BusinessB2BSellerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadOrders() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/seller/orders`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await apiError(res));
      setOrders(await res.json());
    } catch (e) { setError(e.message || 'Failed to load seller B2B orders.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadOrders(); }, []);

  async function transition(orderId, status) {
    setActioningId(orderId); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/seller/orders/${orderId}/transition`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(await apiError(res));
      setSuccess(`Order moved to ${status}.`); loadOrders();
    } catch (e) { setError(e.message || 'Failed to update order.'); }
    finally { setActioningId(null); }
  }

  async function paymentAction(orderId, action) {
    setActioningId(orderId); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/seller/orders/${orderId}/payment/action`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ action }) });
      if (!res.ok) throw new Error(await apiError(res));
      setSuccess(`Payment ${action.toLowerCase()}ed.`); loadOrders();
    } catch (e) { setError(e.message || 'Failed to action payment.'); }
    finally { setActioningId(null); }
  }

  return <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 5 }}>
    <Box sx={{ bgcolor: PD, color: '#fff', py: 2 }}><Container maxWidth="lg"><Stack direction="row" spacing={1.5} alignItems="center"><IconButton onClick={() => navigate('/business-dashboard')} sx={{ color: '#fff' }}><ArrowBack /></IconButton><Box sx={{ flex: 1 }}><Typography variant="h6" fontWeight={900}>Seller B2B Orders</Typography><Typography variant="caption" sx={{ opacity: 0.85 }}>Process merchant-to-merchant orders</Typography></Box><Button onClick={loadOrders} startIcon={<Refresh />} sx={{ color: '#fff' }}>Refresh</Button></Stack></Container></Box>
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress sx={{ color: P }} /></Box> : orders.length === 0 ? <Alert severity="info">No B2B seller orders yet.</Alert> : <Stack spacing={2}>{orders.map(order => <Card key={order.id} elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3 }}><CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}><Box><Typography fontWeight={900}>{order.order_number || `B2B #${order.id}`}</Typography><Typography fontSize={13} color="text.secondary">Buyer: {order.buyer_name || order.buyerName || `#${order.buyer_id}`}</Typography></Box><Stack direction="row" spacing={1}><Chip label={order.status} color={color(order.status)} /><Chip label={order.payment_status} color={color(order.payment_status)} /></Stack></Stack>
        <Divider sx={{ my: 1.5 }} />
        {(order.items || []).map(item => <Typography key={item.id || item.product_id} fontSize={14}>• {item.product_title || item.productTitle} × {item.quantity} — {money(item.line_total || item.price * item.quantity)}</Typography>)}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}><Typography fontWeight={800}>Total</Typography><Typography fontWeight={900}>{money(order.grand_total || order.grandTotal)}</Typography></Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {order.payment_status === 'PENDING_APPROVAL' && <><Button disabled={actioningId === order.id} variant="contained" onClick={() => paymentAction(order.id, 'ACCEPT')} sx={{ bgcolor: P }}>Approve Payment</Button><Button disabled={actioningId === order.id} color="error" variant="outlined" onClick={() => paymentAction(order.id, 'REJECT')}>Reject Payment</Button></>}
          {(transitions[order.status] || []).map(t => <Button key={t.status} disabled={actioningId === order.id} color={t.danger ? 'error' : 'primary'} variant={t.danger ? 'outlined' : 'contained'} onClick={() => transition(order.id, t.status)} sx={!t.danger ? { bgcolor: P } : undefined}>{t.label}</Button>)}
        </Stack>
      </CardContent></Card>)}</Stack>}
    </Container>
  </Box>;
}