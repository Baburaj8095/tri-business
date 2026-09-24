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
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6 }}>
      {/* Header Bar */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${PD} 0%, ${P} 100%)`, 
          color: '#ffffff', 
          py: 2.5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton 
                onClick={() => navigate('/business-dashboard')} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.12)', 
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                  My B2B Orders
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  Track purchases & payments from B2B wholesale sellers
                </Typography>
              </Box>
            </Stack>
            <Button 
              onClick={loadOrders} 
              startIcon={<Refresh />} 
              sx={{ 
                color: '#fff', 
                bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Main Body */}
      <Container maxWidth="lg" sx={{ py: 3.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: P }} />
            <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600, fontSize: 14 }}>
              Loading your B2B orders...
            </Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Card 
            elevation={0} 
            sx={{ 
              border: `1px solid ${BOR}`, 
              borderRadius: '20px', 
              bgcolor: '#ffffff',
              boxShadow: '0 4px 16px rgba(15,23,42,0.03)' 
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Box 
                sx={{ 
                  width: 72, 
                  height: 72, 
                  borderRadius: '50%', 
                  bgcolor: '#f1f5f9', 
                  display: 'grid', 
                  placeItems: 'center', 
                  mx: 'auto', 
                  mb: 2 
                }}
              >
                <ShoppingBag sx={{ fontSize: 36, color: '#94a3b8' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5 }}>
                No B2B orders yet
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: 14, mb: 3 }}>
                You haven't placed any wholesale orders from other merchants yet.
              </Typography>
              <Button 
                sx={{ 
                  bgcolor: P, 
                  borderRadius: '12px', 
                  px: 3.5, 
                  py: 1.2, 
                  fontWeight: 800, 
                  textTransform: 'none',
                  '&:hover': { bgcolor: PD }
                }} 
                variant="contained" 
                onClick={() => navigate('/business/online-marketplace')}
              >
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2.5}>
            {orders.map(order => {
              const terminal = ['CANCELLED', 'REJECTED', 'COMPLETED'].includes(order.status);
              const canCancel = ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status);
              const canPay = !terminal && order.payment_status !== 'PAID' && order.payment_status !== 'PENDING_APPROVAL';
              const input = paymentInputs[order.id] || {};

              return (
                <Card 
                  key={order.id} 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${BOR}`, 
                    borderRadius: '18px', 
                    bgcolor: '#ffffff',
                    boxShadow: '0 4px 14px rgba(15,23,42,0.02)',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    {/* Header Row */}
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      justifyContent="space-between" 
                      alignItems={{ xs: 'flex-start', sm: 'center' }} 
                      spacing={1.5}
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
                          {order.order_number || `B2B Order #${order.id}`}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                          Seller: <span style={{ color: '#0f172a', fontWeight: 700 }}>{order.shop_name || order.seller_name || 'Merchant'}</span>
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip 
                          label={`Status: ${order.status}`} 
                          color={statusColor(order.status)} 
                          size="small"
                          sx={{ fontWeight: 800, borderRadius: '8px' }} 
                        />
                        <Chip 
                          label={`Payment: ${order.payment_status}`} 
                          color={statusColor(order.payment_status)} 
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 800, borderRadius: '8px' }} 
                        />
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Ordered Items List */}
                    <Box sx={{ my: 2 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 750, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                        Order Items
                      </Typography>
                      <Stack spacing={0.75}>
                        {(order.items || []).map(item => (
                          <Box 
                            key={item.id || item.product_id}
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              p: 1.25,
                              borderRadius: '10px',
                              bgcolor: '#f8fafc',
                              border: '1px solid #f1f5f9'
                            }}
                          >
                            <Typography sx={{ fontSize: 13.5, fontWeight: 650, color: '#1e293b' }}>
                              {item.product_title || item.productTitle} 
                              <span style={{ color: '#64748b', fontWeight: 500 }}> × {item.quantity}</span>
                            </Typography>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                              {money(item.line_total || item.price * item.quantity)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Total Summary */}
                    <Stack 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center"
                      sx={{ 
                        mt: 2, 
                        p: 1.5, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(34,139,34,0.06)', 
                        border: '1px solid rgba(34,139,34,0.15)' 
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: 15, color: PD }}>
                        Grand Total
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: 18, color: P }}>
                        {money(order.grand_total || order.grandTotal)}
                      </Typography>
                    </Stack>

                    {/* Payment Inputs for Pending Payment */}
                    {canPay && (
                      <Box 
                        sx={{ 
                          mt: 2.5, 
                          p: 2, 
                          borderRadius: '14px', 
                          border: '1px solid #e2e8f0', 
                          bgcolor: '#f8fafc' 
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#1e293b', mb: 1.5 }}>
                          Submit Payment Details to Seller
                        </Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
                          <TextField 
                            size="small" 
                            label="Amount" 
                            value={input.amount || order.grand_total || ''} 
                            onChange={e => setPaymentInputs(p => ({ ...p, [order.id]: { ...input, amount: e.target.value } }))} 
                            sx={{ bgcolor: '#fff', borderRadius: '8px', minWidth: { xs: '100%', md: 160 } }}
                          />
                          <TextField 
                            size="small" 
                            label="Payment reference / UTR" 
                            placeholder="e.g. UPI Ref / Bank Txn ID"
                            value={input.reference || ''} 
                            onChange={e => setPaymentInputs(p => ({ ...p, [order.id]: { ...input, reference: e.target.value } }))} 
                            sx={{ bgcolor: '#fff', borderRadius: '8px', flex: 1, minWidth: { xs: '100%', md: 240 } }}
                          />
                          <Button 
                            variant="contained" 
                            startIcon={<Payments />} 
                            disabled={actioningId === order.id} 
                            onClick={() => submitPayment(order)} 
                            sx={{ 
                              bgcolor: P, 
                              borderRadius: '10px', 
                              px: 3, 
                              py: 1, 
                              fontWeight: 800, 
                              textTransform: 'none',
                              minWidth: { xs: '100%', md: 170 },
                              '&:hover': { bgcolor: PD }
                            }}
                          >
                            {actioningId === order.id ? 'Submitting...' : 'Submit Payment'}
                          </Button>
                        </Stack>
                      </Box>
                    )}

                    {/* Cancel Action */}
                    {canCancel && (
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          color="error" 
                          variant="outlined"
                          size="small"
                          disabled={actioningId === order.id} 
                          onClick={() => cancelOrder(order.id)} 
                          sx={{ 
                            borderRadius: '10px', 
                            textTransform: 'none', 
                            fontWeight: 700,
                            borderColor: '#fca5a5'
                          }}
                        >
                          Cancel Order
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}