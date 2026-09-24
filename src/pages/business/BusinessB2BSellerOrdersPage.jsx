import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Divider, IconButton, Stack, Typography } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';

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

  return (
    <AppShell activeTab="/business/orders" title="Seller B2B Orders">
      {/* Main Body */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
              Seller B2B Orders
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Process wholesale merchant orders & verify incoming payments
            </Typography>
          </Box>
          <Button 
            onClick={loadOrders} 
            startIcon={<Refresh />} 
            variant="outlined"
            size="small"
            sx={{ 
              color: PD, 
              borderColor: BOR,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { borderColor: P, bgcolor: '#f0fdf4' }
            }}
          >
            Refresh
          </Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress sx={{ color: P }} />
            <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600, fontSize: 14 }}>
              Loading incoming wholesale orders...
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
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5 }}>
                No B2B seller orders yet
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: 14 }}>
                When other businesses purchase your online wholesale products, they will appear here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2.5}>
            {orders.map(order => (
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
                        Buyer: <span style={{ color: '#0f172a', fontWeight: 700 }}>{order.buyer_name || order.buyerName || `Merchant #${order.buyer_id}`}</span>
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip 
                        label={`Status: ${order.status}`} 
                        color={color(order.status)} 
                        size="small"
                        sx={{ fontWeight: 800, borderRadius: '8px' }} 
                      />
                      <Chip 
                        label={`Payment: ${order.payment_status}`} 
                        color={color(order.payment_status)} 
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 800, borderRadius: '8px' }} 
                      />
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Order Items */}
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

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 2.5 }}>
                    {order.payment_status === 'PENDING_APPROVAL' && (
                      <>
                        <Button 
                          disabled={actioningId === order.id} 
                          variant="contained" 
                          onClick={() => paymentAction(order.id, 'ACCEPT')} 
                          sx={{ 
                            bgcolor: P, 
                            borderRadius: '10px', 
                            textTransform: 'none', 
                            fontWeight: 800,
                            px: 2.5,
                            py: 1,
                            '&:hover': { bgcolor: PD }
                          }}
                        >
                          Approve Payment
                        </Button>
                        <Button 
                          disabled={actioningId === order.id} 
                          color="error" 
                          variant="outlined" 
                          onClick={() => paymentAction(order.id, 'REJECT')}
                          sx={{ 
                            borderRadius: '10px', 
                            textTransform: 'none', 
                            fontWeight: 700,
                            px: 2.5,
                            py: 1
                          }}
                        >
                          Reject Payment
                        </Button>
                      </>
                    )}
                    {(transitions[order.status] || []).map(t => (
                      <Button 
                        key={t.status} 
                        disabled={actioningId === order.id} 
                        color={t.danger ? 'error' : 'primary'} 
                        variant={t.danger ? 'outlined' : 'contained'} 
                        onClick={() => transition(order.id, t.status)} 
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          px: 2.5,
                          py: 1,
                          ...(!t.danger ? { bgcolor: P, '&:hover': { bgcolor: PD } } : {})
                        }}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </AppShell>
  );
}