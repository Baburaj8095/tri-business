import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ArrowBack, Payments, Refresh, ShoppingBag } from '@mui/icons-material';

const P = '#228B22';
const PD = '#1B4D3E';
const BG = '#f8fafc';
const BOR = '#e2e8f0';
const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

function authHeaders() {
  const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain') || localStorage.getItem('captain_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiError(res) {
  try { const data = await res.json(); return data.error || data.message || data.details || `HTTP ${res.status}`; } catch (_) { return `HTTP ${res.status}`; }
}

function money(v) { return `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function statusColor(status) {
  if (['COMPLETED', 'DELIVERED', 'PAID'].includes(status)) return 'success';
  if (['CANCELLED', 'REJECTED', 'FAILED'].includes(status)) return 'error';
  if (['PENDING_CONFIRMATION', 'PENDING_APPROVAL', 'PACKING'].includes(status)) return 'warning';
  return 'default';
}

export default function BusinessB2BOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadOrders() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/orders`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await apiError(res));
      setOrders(await res.json());
    } catch (e) { setError(e.message || 'Failed to load B2B orders.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadOrders(); }, []);

  async function cancelOrder(orderId) {
    if (!window.confirm('Cancel this B2B order?')) return;
    setActioningId(orderId); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/orders/${orderId}/cancel`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ cancellationReason: 'Cancelled by buyer' })
      });
      if (!res.ok) throw new Error(await apiError(res));
      setSuccess('B2B order cancelled.');
      loadOrders();
    } catch (e) { setError(e.message || 'Failed to cancel order.'); }
    finally { setActioningId(null); }
  }

  async function submitPayment(order) {
    const input = paymentInputs[order.id] || {};
    setActioningId(order.id); setError(''); setSuccess('');
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/business/orders/${order.id}/payment`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({
          amount: Number(input.amount || order.grand_total || order.subtotal || 0),
          payment_method: 'MANUAL',
          reference: input.reference || '',
          notes: input.notes || ''
        })
      });
      if (!res.ok) throw new Error(await apiError(res));
      setSuccess('Payment submitted for seller approval.');
      setPaymentInputs(prev => ({ ...prev, [order.id]: {} }));
      loadOrders();
    } catch (e) { setError(e.message || 'Failed to submit payment.'); }
    finally { setActioningId(null); }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 5 }}>
      <Box sx={{ bgcolor: PD, color: '#fff', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton onClick={() => navigate('/business-dashboard')} sx={{ color: '#fff' }}><ArrowBack /></IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={900}>My B2B Orders</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Track purchases from other B2B merchants</Typography>
            </Box>
            <Button onClick={loadOrders} startIcon={<Refresh />} sx={{ color: '#fff' }}>Refresh</Button>
          </Stack>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {loading ? <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress sx={{ color: P }} /></Box> : orders.length === 0 ? (
          <Card elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3 }}><CardContent sx={{ textAlign: 'center', py: 6 }}><ShoppingBag sx={{ fontSize: 48, color: '#cbd5e1' }} /><Typography fontWeight={900}>No B2B orders yet</Typography><Button sx={{ mt: 2, bgcolor: P }} variant="contained" onClick={() => navigate('/business/online-marketplace')}>Browse Marketplace</Button></CardContent></Card>
        ) : <Stack spacing={2}>{orders.map(order => {
          const terminal = ['CANCELLED', 'REJECTED', 'COMPLETED'].includes(order.status);
          const canCancel = ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status);
          const canPay = !terminal && order.payment_status !== 'PAID' && order.payment_status !== 'PENDING_APPROVAL';
          const input = paymentInputs[order.id] || {};
          return <Card key={order.id} elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 3 }}><CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Box><Typography fontWeight={900}>{order.order_number || `B2B #${order.id}`}</Typography><Typography fontSize={13} color="text.secondary">Seller: {order.shop_name || order.seller_name}</Typography></Box>
              <Stack direction="row" spacing={1}><Chip label={order.status} color={statusColor(order.status)} /><Chip label={order.payment_status} color={statusColor(order.payment_status)} /></Stack>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {(order.items || []).map(item => <Typography key={item.id || item.product_id} fontSize={14}>• {item.product_title || item.productTitle} × {item.quantity} — {money(item.line_total || item.price * item.quantity)}</Typography>)}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}><Typography fontWeight={800}>Total</Typography><Typography fontWeight={900}>{money(order.grand_total || order.grandTotal)}</Typography></Stack>
            {canPay && <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 2 }}>
              <TextField size="small" label="Amount" value={input.amount || order.grand_total || ''} onChange={e => setPaymentInputs(p => ({ ...p, [order.id]: { ...input, amount: e.target.value } }))} />
              <TextField size="small" label="Payment reference" value={input.reference || ''} onChange={e => setPaymentInputs(p => ({ ...p, [order.id]: { ...input, reference: e.target.value } }))} />
              <Button variant="contained" startIcon={<Payments />} disabled={actioningId === order.id} onClick={() => submitPayment(order)} sx={{ bgcolor: P }}>Submit Payment</Button>
            </Stack>}
            {canCancel && <Button color="error" disabled={actioningId === order.id} onClick={() => cancelOrder(order.id)} sx={{ mt: 1 }}>Cancel Order</Button>}
          </CardContent></Card>;
        })}</Stack>}
      </Container>
    </Box>
  );
}