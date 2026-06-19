import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Alert, 
  Container, Tabs, Tab, IconButton, Chip, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { 
  LuStore, LuPhone, LuDollarSign, LuCalendar, LuCheck, LuX, LuChevronLeft, 
  LuShoppingBag, LuVolume2, LuClipboard, LuTruck, LuUser, LuAlertTriangle, LuTimer, LuHistory 
} from 'react-icons/lu';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const PRIMARY = "#228B22";
const PRIMARY_DARK = "#1B4D3E";
const BG = "#f1f5f9";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#e2e8f0";

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain');

  // CHANNEL MODE: 'OFFLINE' (Counter Manual Payments) or 'ONLINE' (B2C Delivery Orders)
  const [channelMode, setChannelMode] = useState('OFFLINE');

  // 1. Common / Loading States
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2. Offline Payments State
  const [payments, setPayments] = useState([]);
  const [offlineTabValue, setOfflineTabValue] = useState(0); // 0 = Pending, 1 = History

  // 3. Online Orders State
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [onlineTabValue, setOnlineTabValue] = useState(0); // 0 = Incoming, 1 = In Progress, 2 = Completed, 3 = Cancelled
  const [loadingOnlineOrders, setLoadingOnlineOrders] = useState(false);
  const [pollAlertActive, setPollAlertActive] = useState(false);

  // Polling interval reference
  const pollIntervalRef = useRef(null);

  // --- HTML5 Web Audio API notification synthesizer ---
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Make a sweet double electronic alert ping
      const times = [0, 0.15];
      times.forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay); // A5 pitch: clear beacon beep
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });

      // Close context later to avoid memory leakage
      setTimeout(() => {
        try { ctx.close(); } catch (_) {}
      }, 1000);
    } catch (err) {
      console.warn("Sound synthesis bypassed:", err);
    }
  };

  // 4. Fetch offline payments
  const fetchPendingPayments = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${CAPTAIN_API_URL}/captain/offline-payments/merchant`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPayments(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token_business');
          localStorage.removeItem('token_captain');
          navigate('/login');
          return;
        }
        console.error('Failed to load merchant pending payments:', err);
        setError('Error loading pending customer payments.');
        setLoading(false);
      });
  };

  // 5. Fetch merchant shops (for online delivery assignment)
  const fetchMerchantShops = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/merchant/shops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const shopList = res.data || [];
      setShops(shopList);
      if (shopList.length > 0 && !selectedShopId) {
        setSelectedShopId(shopList[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch merchant shops:', err);
      setError('Unable to load your shop list.');
    }
  };

  // 6. Fetch online delivery orders for current shop selection
  const fetchOnlineOrders = async (shopId) => {
    if (!token || !shopId) return;
    setLoadingOnlineOrders(true);
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/merchant/shops/${shopId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnlineOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch online shop orders:', err);
    } finally {
      setLoadingOnlineOrders(false);
    }
  };

  // Initial loading triggers
  useEffect(() => {
    if (channelMode === 'OFFLINE') {
      fetchPendingPayments();
    } else {
      fetchMerchantShops().then(() => {
        setLoading(false);
      });
    }
  }, [channelMode, navigate, token]);

  // Handle online orders fetch whenever shopId changes
  useEffect(() => {
    if (channelMode === 'ONLINE' && selectedShopId) {
      fetchOnlineOrders(selectedShopId);
    }
  }, [selectedShopId, channelMode]);

  // Polling implementation for unconfirmed online orders sound alert
  useEffect(() => {
    if (channelMode === 'ONLINE' && selectedShopId) {
      // Clear any existing active schedule
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      const runSoundPoll = () => {
        axios.get(`${CAPTAIN_API_URL}/captain/merchant/shops/${selectedShopId}/orders/unconfirmed-sound-poll`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            const data = res.data || {};
            if (data.trigger_sound_alert) {
              setPollAlertActive(true);
              playNotificationSound();
              // Auto-refresh the order list quietly in background for high-priority incoming alerts
              fetchOnlineOrders(selectedShopId);
            } else {
              setPollAlertActive(false);
            }
          })
          .catch(err => {
            console.warn('Silent unconfirmed sound-poll error, ignoring...', err);
          });
      };

      // Poll immediately and then repeat every 5 seconds
      runSoundPoll();
      pollIntervalRef.current = setInterval(runSoundPoll, 5000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [selectedShopId, channelMode]);

  // 7. Handlers for actions (Approval, Status transitions, etc.)
  const handleOfflinePaymentAction = (id, action) => {
    setActioningId(id);
    setError('');
    setSuccess('');

    axios.post(
      `${CAPTAIN_API_URL}/captain/offline-payments/${id}/action`,
      { action: action },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(res => {
        setSuccess(res.data?.message || `Payment ${action.toLowerCase()}ed successfully.`);
        setActioningId(null);
        fetchPendingPayments();
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token_business');
          localStorage.removeItem('token_captain');
          navigate('/login');
          return;
        }
        console.error(`Failed to ${action.toLowerCase()} payment:`, err);
        setError(err.response?.data?.message || `Failed to process payment ${action.toLowerCase()} request.`);
        setActioningId(null);
      });
  };

  const handleOnlineOrderTransition = async (orderId, targetStatus) => {
    setActioningId(orderId);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(
        `${CAPTAIN_API_URL}/captain/merchant/shops/${selectedShopId}/orders/${orderId}/transition`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Order #${orderId} was successfully moved to state: ${targetStatus}.`);
      setActioningId(null);
      // Reload order arrays
      fetchOnlineOrders(selectedShopId);
    } catch (err) {
      console.error('Failed to transition online order status:', err);
      setError(err.response?.data?.message || 'Failed to shift order status state. Ensure database sync is correct.');
      setActioningId(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  };

  // Offline groupings:
  const pendingPayments = payments.filter(p => p.status?.toUpperCase() === 'PENDING');
  const historyPayments = payments.filter(p => p.status?.toUpperCase() !== 'PENDING');

  // Online groupings based on order state sub-tabs:
  // 0 = Incoming (PENDING_CONFIRMATION)
  // 1 = In Progress (CONFIRMED, PREPARING, DISPATCHED)
  // 2 = Completed (COMPLETED)
  // 3 = Cancelled / Rejected (CANCELLED, REJECTED)
  const incomingOrders = onlineOrders.filter(o => o.status === 'PENDING_CONFIRMATION');
  const inProgressOrders = onlineOrders.filter(o => ['CONFIRMED', 'PREPARING', 'DISPATCHED'].includes(o.status));
  const completedOrders = onlineOrders.filter(o => o.status === 'COMPLETED');
  const cancelledOrders = onlineOrders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status));

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: BG }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BG, minHeight: '100vh', pb: 4 }}>
      
      {/* 1. Header Navigation */}
      <Box sx={{ bgcolor: SURFACE, py: 2, borderBottom: `1px solid ${BORDER}`, mb: 2 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                size="small"
                onClick={() => navigate('/business-dashboard')}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: TEXT,
                  '&:hover': { bgcolor: BORDER },
                }}
              >
                <LuChevronLeft size={20} />
              </IconButton>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: TEXT }}>
                Merchant Control Hub
              </Typography>
            </Stack>

            {/* Toggle Channel selector pill buttons (Offline payments / Online deliveries) */}
            <Stack direction="row" spacing={1} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '24px' }}>
              <Button
                size="small"
                onClick={() => setChannelMode('OFFLINE')}
                startIcon={<LuStore size={14} />}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.75,
                  bgcolor: channelMode === 'OFFLINE' ? PRIMARY : 'transparent',
                  color: channelMode === 'OFFLINE' ? '#fff' : TEXT_SECONDARY,
                  '&:hover': { bgcolor: channelMode === 'OFFLINE' ? PRIMARY_DARK : '#e2e8f0' }
                }}
              >
                Counter Pay
              </Button>
              <Button
                size="small"
                onClick={() => setChannelMode('ONLINE')}
                startIcon={<LuShoppingBag size={14} />}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.75,
                  bgcolor: channelMode === 'ONLINE' ? PRIMARY : 'transparent',
                  color: channelMode === 'ONLINE' ? '#fff' : TEXT_SECONDARY,
                  '&:hover': { bgcolor: channelMode === 'ONLINE' ? PRIMARY_DARK : '#e2e8f0' }
                }}
              >
                Delivery Track {channelMode === 'ONLINE' && pollAlertActive && "🚨"}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 2. Main Body Container */}
      <Container maxWidth="md">
        
        {/* Error / Success Feedback alerts */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>{success}</Alert>}

        {/* Polling Sound Trigger Active Warning Banner */}
        {pollAlertActive && (
          <Alert 
            severity="warning" 
            icon={<LuVolume2 className="animate-pulse" />}
            sx={{ mb: 3, borderRadius: '12px', fontWeight: 800, bgcolor: 'rgba(245,158,11,0.1)', color: '#d97706' }}
            action={
              <Button color="inherit" size="small" onClick={() => playNotificationSound()} sx={{ fontWeight: 800 }}>
                PING NOW
              </Button>
            }
          >
            🔊 Incoming pending confirmation orders! Auto synthesized bell chiming...
          </Alert>
        )}

        {/* ========================================================= */}
        {/* VIEW A: OFFLINE MANUAL COUNTER PAYMENTS                   */}
        {/* ========================================================= */}
        {channelMode === 'OFFLINE' && (
          <Card sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
            <Tabs 
              value={offlineTabValue} 
              onChange={(e, val) => setOfflineTabValue(val)}
              sx={{
                borderBottom: `1px solid ${BORDER}`,
                '& .MuiTab-root': {
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: TEXT_MUTED,
                  textTransform: 'none',
                  minWidth: 155,
                },
                '& .Mui-selected': {
                  color: PRIMARY,
                },
                '& .MuiTabs-indicator': {
                  bgcolor: PRIMARY,
                  height: 3,
                }
              }}
            >
              <Tab label={`Pending Verify (${pendingPayments.length})`} />
              <Tab label="Offline History Archive" />
            </Tabs>

            {/* Offline List render */}
            {((offlineTabValue === 0 ? pendingPayments : historyPayments).length === 0) ? (
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: TEXT_MUTED, fontWeight: 700 }}>
                  {offlineTabValue === 0 ? 'No pending verifying counter payments' : 'Empty offline payments log'}
                </Typography>
              </CardContent>
            ) : (
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {(offlineTabValue === 0 ? pendingPayments : historyPayments).map((pm) => (
                    <Card key={pm.id} sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none', bgcolor: SURFACE }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ 
                              width: 44, height: 44, borderRadius: '12px', 
                              bgcolor: 'rgba(34, 139, 34, 0.1)', color: PRIMARY, 
                              display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '1.1rem'
                            }}>
                              {String(pm.consumerName || 'U')[0].toUpperCase()}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: TEXT, fontSize: '0.95rem' }}>
                                {pm.consumerName}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: TEXT_MUTED, mt: 0.25 }}>
                                <LuPhone size={12} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {pm.consumerPhone}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: PRIMARY }}>
                              ₹{Number(pm.amount || 0).toFixed(2)}
                            </Typography>
                            <Chip 
                              label={pm.status} 
                              size="small" 
                              color={pm.status === 'APPROVED' ? 'success' : pm.status === 'REJECTED' ? 'error' : 'default'}
                              sx={{ fontWeight: 700, mt: 0.5, fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Stack>

                        <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack spacing={0.25}>
                            <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 700 }}>
                              REF: {pm.refId}
                            </Typography>
                            <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 600 }}>
                              SHOP: {pm.shopName}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 700 }}>
                            {formatDate(pm.createdAt)}
                          </Typography>
                        </Stack>

                        {pm.status === 'PENDING' && (
                          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              startIcon={<LuCheck />}
                              disabled={actioningId !== null}
                              onClick={() => handleOfflinePaymentAction(pm.id, 'ACCEPT')}
                              size="small"
                              sx={{
                                flex: 1, bgcolor: PRIMARY, textTransform: 'none', fontWeight: 800, borderRadius: '8px', py: 1,
                                '&:hover': { bgcolor: PRIMARY_DARK }
                              }}
                            >
                              Approve Pay
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<LuX />}
                              disabled={actioningId !== null}
                              onClick={() => handleOfflinePaymentAction(pm.id, 'REJECT')}
                              size="small"
                              sx={{
                                flex: 1, borderColor: '#ef4444', color: '#ef4444', textTransform: 'none', fontWeight: 800, borderRadius: '8px', py: 1,
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.04)' }
                              }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        )}

                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            )}
          </Card>
        )}

        {/* ========================================================= */}
        {/* VIEW B: ONLINE B2C DELIVERY ORDERS                       */}
        {/* ========================================================= */}
        {channelMode === 'ONLINE' && (
          <Stack spacing={3}>
            
            {/* Store Picker dropdown (Handles corporate/multi-shop merchant profiles) */}
            <Card sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
              <Typography sx={{ fontWeight: 800, color: TEXT, mb: 1.5, fontSize: '0.9rem' }}>
                Select Active Business Location
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="shop-select-label">Merchant Shop Location</InputLabel>
                <Select
                  labelId="shop-select-label"
                  label="Merchant Shop Location"
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  sx={{ borderRadius: '10px', fontWeight: 700 }}
                >
                  {shops.map(s => (
                    <MenuItem key={s.id} value={s.id.toString()} style={{ fontWeight: 600 }}>
                      🏠 {s.shop_name} ({s.city || 'Standard Area'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Card>

            {/* Main Delivery Tab Group */}
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
              <Tabs 
                value={onlineTabValue} 
                onChange={(e, val) => setOnlineTabValue(val)}
                variant="fullWidth"
                sx={{
                  borderBottom: `1px solid ${BORDER}`,
                  '& .MuiTab-root': {
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: TEXT_MUTED,
                    textTransform: 'none',
                    py: 1.5
                  },
                  '& .Mui-selected': {
                    color: PRIMARY,
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: PRIMARY,
                    height: 3,
                  }
                }}
              >
                <Tab label={`New (${incomingOrders.length})`} />
                <Tab label={`Active (${inProgressOrders.length})`} />
                <Tab label="Fulfilled" />
                <Tab label="Cancelled" />
              </Tabs>

              {loadingOnlineOrders ? (
                <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress size={32} sx={{ color: PRIMARY }} />
                </Box>
              ) : (
                (() => {
                  let subtabArray = [];
                  if (onlineTabValue === 0) subtabArray = incomingOrders;
                  else if (onlineTabValue === 1) subtabArray = inProgressOrders;
                  else if (onlineTabValue === 2) subtabArray = completedOrders;
                  else subtabArray = cancelledOrders;

                  if (subtabArray.length === 0) {
                    return (
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <LuClipboard size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                        <Typography sx={{ color: TEXT_MUTED, fontWeight: 700, fontSize: '0.9rem' }}>
                          No delivery orders found in this category.
                        </Typography>
                      </CardContent>
                    );
                  }

                  return (
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={2.5}>
                        {subtabArray.map((order) => {
                          const isIncoming = order.status === 'PENDING_CONFIRMATION';
                          return (
                            <Card 
                              key={order.id} 
                              sx={{ 
                                borderRadius: '12px', border: `1px solid #cbd5e1`, 
                                boxShadow: isIncoming ? '0 4px 14px rgba(22, 139, 34, 0.08)' : 'none', 
                                bgcolor: SURFACE 
                              }}
                            >
                              <CardContent sx={{ p: 2.5 }}>
                                
                                {/* Header (ID + Status) */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'grid', placeItems: 'center' }}>
                                      <LuShoppingBag size={15} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 900, color: TEXT, fontSize: '0.95rem' }}>
                                      Order #{order.id}
                                    </Typography>
                                  </Stack>

                                  <Box>
                                    {order.status === 'PENDING_CONFIRMATION' && <Chip label="Awaiting Approval" size="small" icon={<LuTimer size={12} />} sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#d97706', fontWeight: 800, fontSize: '0.75rem', p: '2px' }} />}
                                    {order.status === 'CONFIRMED' && <Chip label="Accepted" size="small" color="primary" sx={{ fontWeight: 800, fontSize: '0.75rem' }} />}
                                    {order.status === 'PREPARING' && <Chip label="Preparing" size="small" color="warning" sx={{ fontWeight: 800, fontSize: '0.75rem' }} />}
                                    {order.status === 'DISPATCHED' && <Chip label="Out for Delivery" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.1)', color: '#a855f7', fontWeight: 800, fontSize: '0.75rem' }} />}
                                    {order.status === 'COMPLETED' && <Chip label="Delivered" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.75rem' }} />}
                                    {order.status === 'CANCELLED' && <Chip label="Cancelled" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.75rem' }} />}
                                  </Box>
                                </Stack>

                                {/* Items Box */}
                                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '8px', mb: 2, border: '1px solid #f1f5f9' }}>
                                  <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 800, display: 'block', mb: 0.5 }}>
                                    ORDER SPECIFICS:
                                  </Typography>
                                  <Stack spacing={0.5}>
                                    {order.items && order.items.map((it, idx) => (
                                      <Typography key={idx} sx={{ fontSize: '0.85rem', color: TEXT, fontWeight: 700 }}>
                                        • {it.productTitle || it.product_title || 'Catalog Item'} <span style={{ color: TEXT_SECONDARY }}>x{it.quantity}</span> (₹{it.price})
                                      </Typography>
                                    ))}
                                  </Stack>
                                  {order.notes && (
                                    <Box sx={{ mt: 1.5, borderTop: '1px solid #f1f5f9', pt: 1 }}>
                                      <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#64748b', display: 'block', fontWeight: 600 }}>
                                        💬 Instructions: "{order.notes}"
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                {/* Order metadata */}
                                <Stack spacing={0.5} sx={{ mb: 2, fontSize: '0.8rem', color: TEXT_MUTED }}>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <LuUser size={13} />
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                      Shopper Account ID: #{order.userId}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <LuCalendar size={13} />
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                      Placed at: {formatDate(order.createdAt)}
                                    </Typography>
                                  </Stack>
                                </Stack>

                                <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                                {/* Total and Actions */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 800 }}>
                                      TOTAL BILL
                                    </Typography>
                                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>
                                      ₹{order.total.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontWeight: 600 }}>
                                      Payment: {order.paymentMethod || 'ONLINE'} ({order.paymentStatus || 'PENDING'})
                                    </Typography>
                                  </Box>

                                  {/* Interactive Action Buttons based on lifecycle status */}
                                  <Stack direction="row" spacing={1}>
                                    {order.status === 'PENDING_CONFIRMATION' && (
                                      <>
                                        <Button
                                          variant="contained"
                                          size="small"
                                          color="success"
                                          disabled={actioningId !== null}
                                          onClick={() => handleOnlineOrderTransition(order.id, 'CONFIRMED')}
                                          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          color="error"
                                          disabled={actioningId !== null}
                                          onClick={() => handleOnlineOrderTransition(order.id, 'CANCELLED')}
                                          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}

                                    {order.status === 'CONFIRMED' && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        color="warning"
                                        disabled={actioningId !== null}
                                        onClick={() => handleOnlineOrderTransition(order.id, 'PREPARING')}
                                        sx={{ textTransform: 'none', fontWeight: 900, borderRadius: '8px' }}
                                      >
                                        Start Preparing
                                      </Button>
                                    )}

                                    {order.status === 'PREPARING' && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        disabled={actioningId !== null}
                                        onClick={() => handleOnlineOrderTransition(order.id, 'DISPATCHED')}
                                        sx={{ textTransform: 'none', fontWeight: 900, borderRadius: '8px', bgcolor: '#a855f7', color: '#fff', '&:hover': { bgcolor: '#9333ea' } }}
                                      >
                                        Dispatch Order
                                      </Button>
                                    )}

                                    {order.status === 'DISPATCHED' && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        color="success"
                                        disabled={actioningId !== null}
                                        onClick={() => handleOnlineOrderTransition(order.id, 'COMPLETED')}
                                        sx={{ textTransform: 'none', fontWeight: 900, borderRadius: '8px' }}
                                      >
                                        Deliver Order
                                      </Button>
                                    )}

                                    {/* Reject trigger / fallback cancel option for active orders */}
                                    {['CONFIRMED', 'PREPARING', 'DISPATCHED'].includes(order.status) && (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        disabled={actioningId !== null}
                                        onClick={() => handleOnlineOrderTransition(order.id, 'CANCELLED')}
                                        sx={{ textTransform: 'none', fontWeight: 800, padding: '4px', minWidth: '32px' }}
                                      >
                                        <LuX />
                                      </Button>
                                    )}
                                  </Stack>
                                </Stack>

                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  );
                })()
              )}
            </Card>

          </Stack>
        )}

      </Container>
    </Box>
  );
}


