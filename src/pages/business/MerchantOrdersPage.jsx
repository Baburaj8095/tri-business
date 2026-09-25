import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Alert, 
  Container, Tabs, Tab, IconButton, Chip, FormControl, InputLabel, Select, MenuItem, Divider,
  Drawer, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import { 
  LuStore, LuPhone, LuDollarSign, LuCalendar, LuCheck, LuX, LuChevronLeft, 
  LuShoppingBag, LuVolume2, LuClipboard, LuTruck, LuUser, LuAlertTriangle, LuTimer, LuHistory,
  LuSlidersHorizontal
} from 'react-icons/lu';
import AppShell from '../../components/layout/AppShell';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const PRIMARY = "#228B22";
const PRIMARY_DARK = "#1B4D3E";
const BG = "#f1f5f9";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#e2e8f0";

function DribbbleOrderCard({ order, onDetails, onAction, actioningId, isB2B = false }) {
  const isIncoming = order.status === 'PENDING_CONFIRMATION' || order.status === 'PENDING';
  const isCompleted = order.status === 'COMPLETED' || order.status === 'SUCCESS' || order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';
  
  // Status label & color matching Dribbble Caffeine Coffee Shop UI
  let statusLabel = 'In Progress';
  let statusBg = '#eff6ff';
  let statusColor = '#1d4ed8';
  if (isCompleted) {
    statusLabel = 'Success';
    statusBg = '#dcfce7';
    statusColor = '#15803d';
  } else if (isIncoming) {
    statusLabel = 'Pending';
    statusBg = '#fef3c7';
    statusColor = '#b45309';
  } else if (isCancelled) {
    statusLabel = 'Cancelled';
    statusBg = '#fee2e2';
    statusColor = '#b91c1c';
  }

  const itemsList = order.items || [];
  const itemCount = itemsList.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) || (order.itemCount || 1);
  const itemsSummary = itemsList.length > 0
    ? itemsList.map(it => `${it.quantity || 1}x ${it.productTitle || it.product_title || it.title || 'Item'}`).join(', ')
    : `${itemCount}x Order Item`;
  
  const totalAmount = Number(order.total || order.amount || 0);
  const storeName = order.shop_name || order.storeName || (order.shop && order.shop.shop_name) || (isB2B ? 'B2B Wholesale Store' : 'Trikonekt Store');
  const customerName = order.customerName || order.userName || (order.buyer && order.buyer.name) || (order.userId ? `Customer #${order.userId}` : 'Customer');

  const formatDateString = (dateStr) => {
    try {
      if (!dateStr) return 'Monday, 23 Apr 2024 • 18:44';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return `${weekday}, ${day} ${month} ${year} • ${time}`;
    } catch (_) {
      return String(dateStr || 'Recent Order');
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: isIncoming ? '0 4px 16px rgba(34, 139, 34, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Top Row: Status badge & See Details */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Chip
            size="small"
            label={statusLabel}
            sx={{
              bgcolor: statusBg,
              color: statusColor,
              fontWeight: 800,
              fontSize: '0.75rem',
              borderRadius: '12px',
              px: 0.5,
              height: 24,
            }}
          />
          <Button
            size="small"
            onClick={() => onDetails(order)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#64748b',
              p: 0,
              minWidth: 'auto',
              '&:hover': { bgcolor: 'transparent', color: '#0f172a' }
            }}
          >
            See Details &gt;
          </Button>
        </Stack>

        {/* Store & Customer Title */}
        <Typography sx={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a', mb: 0.4, lineHeight: 1.3 }}>
          {storeName} to {customerName}
        </Typography>

        {/* Timestamp */}
        <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, mb: 1.2 }}>
          {formatDateString(order.createdAt || order.created_at)}
        </Typography>

        {/* Item Summary line */}
        <Typography sx={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600, mb: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
          {itemsSummary}
        </Typography>

        <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

        {/* Bottom Row: Count • Price and Action Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'} • ₹{totalAmount.toFixed(2)}
          </Typography>

          {isIncoming ? (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                disabled={actioningId === order.id}
                onClick={() => onAction(order.id, 'CONFIRMED')}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.6,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#15803d' }
                }}
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={actioningId === order.id}
                onClick={() => onAction(order.id, 'CANCELLED')}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 1.5,
                  py: 0.6,
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.04)' }
                }}
              >
                Reject
              </Button>
            </Stack>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDetails(order)}
              sx={{
                borderColor: '#9A5832',
                color: '#9A5832',
                fontWeight: 800,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 2.2,
                py: 0.6,
                '&:hover': { bgcolor: 'rgba(154, 88, 50, 0.06)', borderColor: '#804524' }
              }}
            >
              Re-Order
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token_business') || 
                localStorage.getItem('token_captain') || 
                localStorage.getItem('captain_token') || 
                localStorage.getItem('token') || 
                localStorage.getItem('admin_token');

  const [profile, setProfile] = useState(null);

  // CHANNEL MODE: 'OFFLINE', 'ONLINE' or 'B2B'
  const [channelMode, setChannelMode] = useState(() => {
    const cat = localStorage.getItem('user_category') || 'merchant';
    const mode = localStorage.getItem('service_mode_business') || 'OFFLINE';
    const isB2B = cat === 'merchant' || cat === 'merchant_business';
    if (isB2B) return 'B2B';
    if (mode === 'ONLINE') return 'ONLINE';
    return 'OFFLINE';
  });

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

  // 4. B2B Orders State
  const [b2bOrders, setB2bOrders] = useState([]);
  const [loadingB2bOrders, setLoadingB2bOrders] = useState(false);

  // 5. Dribbble-Style Order Filter & Details Drawer States
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL'); // 'ALL' | 'DELIVERY' | 'PICKUP'
  const [dateSortFilter, setDateSortFilter] = useState('LATEST'); // 'LATEST' | '1_DAY' | '3_DAYS' | '1_WEEK' | '1_MONTH'
  const [detailsOrder, setDetailsOrder] = useState(null);

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
      setLoading(false);
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
          setError('Session expired or unauthenticated. Please sign in with your mobile number.');
          setLoading(false);
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
      setLoading(false);
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

  // Load profile & default channelMode
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`${CAPTAIN_API_URL}/captain/merchant/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const p = res.data || {};
        setProfile(p);
        
        const resolvedCategory = p.category || localStorage.getItem('user_category') || 'merchant';
        const resolvedMode = p.service_mode || localStorage.getItem('service_mode_business') || 'OFFLINE';
        
        const isB2B = resolvedCategory === 'merchant' || resolvedCategory === 'merchant_business';
        if (isB2B) {
          setChannelMode('B2B');
        } else if (resolvedMode === 'ONLINE') {
          setChannelMode('ONLINE');
        } else {
          setChannelMode('OFFLINE');
        }
      })
      .catch(err => {
        console.warn("Failed to load merchant profile", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Initial loading triggers depending on channelMode
  useEffect(() => {
    if (channelMode === 'OFFLINE') {
      fetchPendingPayments();
    } else if (channelMode === 'ONLINE') {
      fetchMerchantShops();
    } else if (channelMode === 'B2B') {
      fetchB2bOrders();
    }
  }, [channelMode]);

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
          setError('Session expired or unauthenticated. Please sign in again.');
          setActioningId(null);
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

  const fetchB2bOrders = async () => {
    if (!token) return;
    setLoadingB2bOrders(true);
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/business/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setB2bOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // 400 or 404 simply means this merchant does not have an active seller profile
      setB2bOrders([]);
    } finally {
      setLoadingB2bOrders(false);
    }
  };

  const handleB2bOrderTransition = async (orderId, targetStatus) => {
    setActioningId(orderId);
    setError('');
    setSuccess('');
    try {
      await axios.post(
        `${CAPTAIN_API_URL}/captain/business/seller/orders/${orderId}/transition`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`B2B Order #${orderId} was successfully moved to state: ${targetStatus}.`);
      setActioningId(null);
      fetchB2bOrders();
    } catch (err) {
      console.error('Failed to transition B2B order status:', err);
      setError(err.response?.data?.message || 'Failed to shift B2B order status.');
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

  const formatDateDribbble = (dateStr) => {
    try {
      if (!dateStr) return 'Monday, 23 Apr 2024 • 18:44';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return `${weekday}, ${day} ${month} ${year} • ${time}`;
    } catch (_) {
      return String(dateStr || 'Recent Order');
    }
  };

  const applyFilterAndSort = (ordersList) => {
    if (!Array.isArray(ordersList)) return [];
    let list = [...ordersList];

    // Filter by Order Type (ALL | DELIVERY | PICKUP)
    if (orderTypeFilter === 'DELIVERY') {
      list = list.filter(o => !o.delivery_type || o.delivery_type === 'DELIVERY' || o.deliveryType === 'DELIVERY' || o.orderType !== 'PICKUP');
    } else if (orderTypeFilter === 'PICKUP') {
      list = list.filter(o => o.delivery_type === 'PICKUP' || o.deliveryType === 'PICKUP' || o.orderType === 'PICKUP');
    }

    // Filter by Date
    const now = Date.now();
    if (dateSortFilter === '1_DAY') {
      list = list.filter(o => {
        const t = new Date(o.createdAt || o.created_at || now).getTime();
        return (now - t) <= 24 * 60 * 60 * 1000;
      });
    } else if (dateSortFilter === '3_DAYS') {
      list = list.filter(o => {
        const t = new Date(o.createdAt || o.created_at || now).getTime();
        return (now - t) <= 3 * 24 * 60 * 60 * 1000;
      });
    } else if (dateSortFilter === '1_WEEK') {
      list = list.filter(o => {
        const t = new Date(o.createdAt || o.created_at || now).getTime();
        return (now - t) <= 7 * 24 * 60 * 60 * 1000;
      });
    } else if (dateSortFilter === '1_MONTH') {
      list = list.filter(o => {
        const t = new Date(o.createdAt || o.created_at || now).getTime();
        return (now - t) <= 30 * 24 * 60 * 60 * 1000;
      });
    }

    // Sort by Date (Latest first)
    list.sort((a, b) => {
      const ta = new Date(a.createdAt || a.created_at || 0).getTime();
      const tb = new Date(b.createdAt || b.created_at || 0).getTime();
      return tb - ta;
    });

    return list;
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

  // B2B Status groupings
  const incomingB2b = b2bOrders.filter(o => o.status === 'PENDING' || o.status === 'PENDING_CONFIRMATION');
  const processingB2b = b2bOrders.filter(o => ['PROCESSING', 'SHIPPED', 'CONFIRMED', 'PREPARING', 'DISPATCHED'].includes(o.status));
  const completedB2b = b2bOrders.filter(o => o.status === 'COMPLETED');
  const cancelledB2b = b2bOrders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status));

  const cat = profile?.category || localStorage.getItem('user_category') || 'merchant';
  const mode = profile?.service_mode || localStorage.getItem('service_mode_business') || 'OFFLINE';
  
  const isB2BUser = cat === 'merchant' || cat === 'merchant_business';
  const isOnlineOnly = mode === 'ONLINE';
  const showToggles = !isB2BUser && !isOnlineOnly;

  const getPageTitle = () => {
    if (isB2BUser) {
      return isOnlineOnly ? 'Online B2B Orders' : 'Offline B2B Orders';
    }
    return isOnlineOnly ? 'Online B2C Orders' : 'Offline C2C/B2C Orders';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: BG }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <AppShell activeTab="/business/orders">
      <Container maxWidth="xl" sx={{ pt: 3.5, px: { xs: 2, sm: 3, lg: 4 }, pb: 6 }}>
        {/* Header Bar matching Dribbble Caffeine Coffee Shop - media_1790313642021.png */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: TEXT, letterSpacing: '-0.5px' }}>
              Orders
            </Typography>
            <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.84rem', mt: 0.25, fontWeight: 500 }}>
              {orderTypeFilter !== 'ALL' || dateSortFilter !== 'LATEST'
                ? `Filter: ${orderTypeFilter} • ${dateSortFilter.replace('_', ' ')}`
                : getPageTitle()}
            </Typography>
          </Box>

          <IconButton
            onClick={() => setFilterDrawerOpen(true)}
            sx={{
              bgcolor: '#ffffff',
              border: (orderTypeFilter !== 'ALL' || dateSortFilter !== 'LATEST') ? '1.5px solid #9A5832' : '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              color: (orderTypeFilter !== 'ALL' || dateSortFilter !== 'LATEST') ? '#9A5832' : '#0f172a',
              p: 1.2,
              borderRadius: '12px',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
            title="Filter Orders"
          >
            <LuSlidersHorizontal size={20} />
          </IconButton>
        </Stack>

        {/* Unauthenticated Sign-in Prompt Banner */}
        {!token && (
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: '16px',
              border: '1.5px solid #cbd5e1',
              bgcolor: '#f8fafc',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                Sign In to View Live Store Orders
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.25 }}>
                You are currently browsing in preview mode. Sign in with your registered mobile number to accept live orders and approve settlements.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: PRIMARY,
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: '10px',
                px: 2.5,
                py: 0.9,
                textTransform: 'none',
                flexShrink: 0,
                '&:hover': { bgcolor: PRIMARY_DARK },
              }}
            >
              Sign In with Mobile
            </Button>
          </Box>
        )}
        
        {/* Toggle Channel selector pill buttons (Offline payments / Online deliveries) */}
        {showToggles && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '24px', width: '100%' }}>
              <Button
                fullWidth
                size="small"
                onClick={() => setChannelMode('OFFLINE')}
                startIcon={<LuStore size={14} />}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  py: 1,
                  bgcolor: channelMode === 'OFFLINE' ? '#1B4D3E' : 'transparent',
                  color: channelMode === 'OFFLINE' ? '#fff' : TEXT_SECONDARY,
                  '&:hover': { bgcolor: channelMode === 'OFFLINE' ? '#143d31' : '#e2e8f0' }
                }}
              >
                Counter Pay
              </Button>
              <Button
                fullWidth
                size="small"
                onClick={() => setChannelMode('ONLINE')}
                startIcon={<LuShoppingBag size={14} />}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  py: 1,
                  bgcolor: channelMode === 'ONLINE' ? '#1B4D3E' : 'transparent',
                  color: channelMode === 'ONLINE' ? '#fff' : TEXT_SECONDARY,
                  '&:hover': { bgcolor: channelMode === 'ONLINE' ? '#143d31' : '#e2e8f0' }
                }}
              >
                Delivery Track {channelMode === 'ONLINE' && pollAlertActive && "🚨"}
              </Button>
            </Stack>
          </Box>
        )}
        
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
                            {(pm.onlineOrderId || pm.online_order_id) && (
                              <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 800 }}>
                                DELIVERY ORDER: #{pm.onlineOrderId || pm.online_order_id}
                              </Typography>
                            )}
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
          <Stack spacing={2.5}>
            
            {/* Store Picker Card (Clean, World-Class Light Design) */}
            <Card
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#ecfdf5',
                    color: '#047857',
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  <LuStore size={18} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', lineHeight: 1.2 }}>
                    Select Operating Store Location
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 500 }}>
                    Switch storefront to view specific incoming orders
                  </Typography>
                </Box>
              </Stack>

              <FormControl fullWidth size="small">
                <Select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    bgcolor: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#047857', borderWidth: 2 },
                  }}
                >
                  {shops.map(s => (
                    <MenuItem key={s.id} value={s.id.toString()} style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      🏪 {s.shop_name} ({s.city || 'Standard Area'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Card>

            {/* Segmented Tab Pill Control (iOS / Blinkit Quick Commerce standard) */}
            <Box
              sx={{
                bgcolor: '#f1f5f9',
                p: 0.5,
                borderRadius: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0.5,
              }}
            >
              {[
                { label: 'New', count: incomingOrders.length, value: 0 },
                { label: 'Active', count: inProgressOrders.length, value: 1 },
                { label: 'Fulfilled', count: completedOrders.length, value: 2 },
                { label: 'Cancelled', count: cancelledOrders.length, value: 3 },
              ].map((tab) => {
                const isSelected = onlineTabValue === tab.value;
                return (
                  <Button
                    key={tab.label}
                    onClick={() => setOnlineTabValue(tab.value)}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      py: 0.85,
                      px: 0.5,
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      bgcolor: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#064e3b' : '#64748b',
                      boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    <span>{tab.label}</span>
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        px: 0.6,
                        py: 0.1,
                        borderRadius: '99px',
                        bgcolor: isSelected ? '#ecfdf5' : '#e2e8f0',
                        color: isSelected ? '#047857' : '#64748b',
                      }}
                    >
                      {tab.count}
                    </Box>
                  </Button>
                );
              })}
            </Box>

            {/* Orders Feed Viewport */}
            <Box>
              {loadingOnlineOrders ? (
                <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress size={32} sx={{ color: '#047857' }} />
                </Box>
              ) : (
                (() => {
                  let subtabArray = [];
                  if (onlineTabValue === 0) subtabArray = incomingOrders;
                  else if (onlineTabValue === 1) subtabArray = inProgressOrders;
                  else if (onlineTabValue === 2) subtabArray = completedOrders;
                  else subtabArray = cancelledOrders;

                  const filteredList = applyFilterAndSort(subtabArray);

                  if (filteredList.length === 0) {
                    return (
                      <Card
                        elevation={0}
                        sx={{
                          p: 5,
                          borderRadius: '20px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#ffffff',
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#ecfdf5',
                            color: '#047857',
                            border: '2px solid #a7f3d0',
                            display: 'grid',
                            placeItems: 'center',
                            mx: 'auto',
                            mb: 2,
                            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.1)'
                          }}
                        >
                          <LuShoppingBag size={28} />
                        </Box>
                        <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '1.1rem', mb: 0.5 }}>
                          No Orders in this Status
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, maxWidth: 320, mx: 'auto', mb: 2.5 }}>
                          Live incoming customer orders for this store will appear here in real-time.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            if (selectedShopId) fetchOnlineOrders(selectedShopId);
                          }}
                          sx={{
                            borderColor: '#047857',
                            color: '#047857',
                            fontWeight: 800,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            height: '34px',
                            px: 2.5,
                            '&:hover': { bgcolor: '#ecfdf5', borderColor: '#065f46' }
                          }}
                        >
                          ↻ Refresh Orders
                        </Button>
                      </Card>
                    );
                  }

                  return (
                    <Stack spacing={2}>
                      {filteredList.map((order) => (
                        <DribbbleOrderCard
                          key={order.id}
                          order={order}
                          onDetails={(ord) => setDetailsOrder(ord)}
                          onAction={handleOnlineOrderTransition}
                          actioningId={actioningId}
                        />
                      ))}
                    </Stack>
                  );
                })()
              )}
            </Box>

          </Stack>
        )}

        {/* ========================================================= */}
        {/* VIEW C: B2B ONLINE / OFFLINE ORDERS RECEIVED             */}
        {/* ========================================================= */}
        {channelMode === 'B2B' && (
          <Stack spacing={3}>
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
                <Tab label={`New (${incomingB2b.length})`} />
                <Tab label={`Active (${processingB2b.length})`} />
                <Tab label="Fulfilled" />
                <Tab label="Cancelled" />
              </Tabs>

              {loadingB2bOrders ? (
                <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress size={32} sx={{ color: PRIMARY }} />
                </Box>
              ) : (
                (() => {
                  let subtabArray = [];
                  if (onlineTabValue === 0) subtabArray = incomingB2b;
                  else if (onlineTabValue === 1) subtabArray = processingB2b;
                  else if (onlineTabValue === 2) subtabArray = completedB2b;
                  else subtabArray = cancelledB2b;

                  const filteredList = applyFilterAndSort(subtabArray);

                  if (filteredList.length === 0) {
                    return (
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <LuClipboard size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                        <Typography sx={{ color: TEXT_MUTED, fontWeight: 700, fontSize: '0.9rem' }}>
                          No B2B wholesale orders found matching filter.
                        </Typography>
                      </CardContent>
                    );
                  }

                  return (
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={2}>
                        {filteredList.map((order) => (
                          <DribbbleOrderCard
                            key={order.id}
                            order={order}
                            onDetails={(ord) => setDetailsOrder(ord)}
                            onAction={handleB2bOrderTransition}
                            actioningId={actioningId}
                            isB2B={true}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  );
                })()
              )}
            </Card>
          </Stack>
        )}

      </Container>

      {/* ── Dribbble Caffeine-Style Order Filter Bottom Drawer (Matching media_1790313642021.png) ── */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '85vh',
            bgcolor: '#ffffff',
            p: { xs: 2.5, sm: 3.5 },
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2.5 }} />

        {/* Section 1: Order Type */}
        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', mb: 1.5 }}>
          Order Type
        </Typography>
        <RadioGroup
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value)}
          sx={{ mb: 3 }}
        >
          {[
            { value: 'ALL', label: 'All' },
            { value: 'DELIVERY', label: 'Delivery' },
            { value: 'PICKUP', label: 'Pick Up' },
          ].map(opt => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#9A5832' } }} />}
              label={<Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>{opt.label}</Typography>}
              sx={{ my: 0.2 }}
            />
          ))}
        </RadioGroup>

        {/* Section 2: Sort by Date */}
        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', mb: 1.5 }}>
          Sort by Date
        </Typography>
        <RadioGroup
          value={dateSortFilter}
          onChange={(e) => setDateSortFilter(e.target.value)}
          sx={{ mb: 3.5 }}
        >
          {[
            { value: 'LATEST', label: 'Latest' },
            { value: '1_DAY', label: 'Last 1 day' },
            { value: '3_DAYS', label: 'Last 3 days' },
            { value: '1_WEEK', label: 'Last 1 week' },
            { value: '1_MONTH', label: 'Last 1 month' },
          ].map(opt => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#9A5832' } }} />}
              label={<Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>{opt.label}</Typography>}
              sx={{ my: 0.2 }}
            />
          ))}
        </RadioGroup>

        {/* Apply Filter Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => setFilterDrawerOpen(false)}
          sx={{
            bgcolor: '#9A5832',
            color: '#fff',
            py: 1.6,
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.95rem',
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(154, 88, 50, 0.3)',
            '&:hover': { bgcolor: '#804524' }
          }}
        >
          Apply Filter
        </Button>
      </Drawer>

      {/* ── Order Details Bottom Drawer ── */}
      <Drawer
        anchor="bottom"
        open={!!detailsOrder}
        onClose={() => setDetailsOrder(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '90vh',
            bgcolor: '#ffffff',
            p: { xs: 2.5, sm: 3.5 },
            overflowY: 'auto'
          }
        }}
      >
        {detailsOrder && (
          <Box>
            <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>
                  Order Details #{detailsOrder.id}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  {formatDateDribbble(detailsOrder.createdAt || detailsOrder.created_at)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setDetailsOrder(null)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
                <LuX size={18} />
              </IconButton>
            </Stack>

            {/* Customer & Address Details */}
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '14px', mb: 2.5, border: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', mb: 1 }}>
                Order Info
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                {detailsOrder.customerName || detailsOrder.userName || (detailsOrder.buyer && detailsOrder.buyer.name) || `Customer #${detailsOrder.userId || detailsOrder.id}`}
              </Typography>
              {detailsOrder.contactPhone && (
                <Typography sx={{ fontSize: '0.85rem', color: '#475569', mt: 0.25 }}>
                  📞 {detailsOrder.contactPhone}
                </Typography>
              )}
              {detailsOrder.shippingAddress && (
                <Typography sx={{ fontSize: '0.85rem', color: '#475569', mt: 0.25 }}>
                  📍 {detailsOrder.shippingAddress}
                </Typography>
              )}
              {detailsOrder.notes && (
                <Box sx={{ mt: 1, p: 1, bgcolor: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#64748b' }}>
                    Note: "{detailsOrder.notes}"
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Items Breakdown */}
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', mb: 1.5 }}>
              Items in Order ({detailsOrder.items?.length || 0})
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              {(detailsOrder.items || []).map((it, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      {it.productTitle || it.product_title || it.title || 'Item'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Qty: {it.quantity} × ₹{Number(it.price || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    ₹{(Number(it.quantity || 1) * Number(it.price || 0)).toFixed(2)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* Payment Summary */}
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '14px', mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Items Amount</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>₹{Number(detailsOrder.total || detailsOrder.total_amount || 0).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Payment Method</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{detailsOrder.paymentMethod || 'UPI / Online'}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>Total Bill</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#ea580c' }}>₹{Number(detailsOrder.total || detailsOrder.total_amount || 0).toFixed(2)}</Typography>
              </Stack>
            </Box>

            {/* Lifecycle Action Buttons */}
            {detailsOrder.status === 'PENDING_CONFIRMATION' && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  color="success"
                  onClick={() => { handleOnlineOrderTransition(detailsOrder.id, 'CONFIRMED'); setDetailsOrder(null); }}
                  sx={{ py: 1.4, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                >
                  Accept Order
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  onClick={() => { handleOnlineOrderTransition(detailsOrder.id, 'CANCELLED'); setDetailsOrder(null); }}
                  sx={{ py: 1.4, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                >
                  Reject Order
                </Button>
              </Stack>
            )}

            {detailsOrder.status === 'CONFIRMED' && (
              <Button
                variant="contained"
                fullWidth
                color="warning"
                onClick={() => { handleOnlineOrderTransition(detailsOrder.id, 'PREPARING'); setDetailsOrder(null); }}
                sx={{ py: 1.4, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
              >
                Mark Preparing
              </Button>
            )}

            {detailsOrder.status === 'PREPARING' && (
              <Button
                variant="contained"
                fullWidth
                sx={{ py: 1.4, borderRadius: '12px', fontWeight: 800, textTransform: 'none', bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
                onClick={() => { handleOnlineOrderTransition(detailsOrder.id, 'DISPATCHED'); setDetailsOrder(null); }}
              >
                Dispatch with TriSarathi
              </Button>
            )}

            {detailsOrder.status === 'DISPATCHED' && (
              <Button
                variant="contained"
                fullWidth
                color="success"
                onClick={() => { handleOnlineOrderTransition(detailsOrder.id, 'COMPLETED'); setDetailsOrder(null); }}
                sx={{ py: 1.4, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
              >
                Confirm Delivered
              </Button>
            )}
          </Box>
        )}
      </Drawer>
    </AppShell>
  );
}




