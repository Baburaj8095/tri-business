import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Drawer,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  StorefrontRounded as StoreIcon,
  ReceiptLongRounded as OrdersIcon,
  CheckCircleRounded as CheckIcon,
  CancelRounded as CancelIcon,
  ShoppingBagRounded as BagIcon,
  LocalShippingRounded as DeliveryIcon,
  StoreRounded as PickupIcon,
  TuneRounded as FilterIcon,
  CloseRounded as CloseIcon,
  VolumeUpRounded as VolumeIcon,
  ChevronRightRounded as ChevronRightIcon,
  PaymentRounded as PaymentIcon,
  LocationOnRounded as LocationIcon,
  PhoneRounded as PhoneIcon,
  AccessTimeRounded as TimeIcon,
  SearchRounded as SearchIcon,
  SwapVertRounded as SortIcon,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import { T, cardHoverSx } from '../../theme/tokens';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

/**
 * Screen 2: Modern Order Card matching Reference Mockup
 */
function ModernOrderCard({ order, onDetails, onAction, actioningId, isB2B = false }) {
  const isIncoming = order.status === 'PENDING_CONFIRMATION' || order.status === 'PENDING';
  const isCompleted = order.status === 'COMPLETED' || order.status === 'SUCCESS' || order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';

  let statusLabel = 'Active';
  let statusBg = '#FEF3C7';
  let statusColor = '#D97706';

  if (isIncoming) {
    statusLabel = 'New';
    statusBg = '#EFF6FF';
    statusColor = '#2563EB';
  } else if (isCompleted) {
    statusLabel = 'Fulfilled';
    statusBg = '#ECFDF5';
    statusColor = '#059669';
  } else if (isCancelled) {
    statusLabel = 'Cancelled';
    statusBg = '#FEF2F2';
    statusColor = '#DC2626';
  }

  const itemsList = order.items || [];
  const itemCount = itemsList.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) || (order.itemCount || 1);
  const totalAmount = Number(order.total || order.amount || order.total_amount || 0);

  const customerName = order.customerName || order.userName || (order.buyer && order.buyer.name) || (order.userId ? `Customer #${order.userId}` : 'Customer');
  const orderNum = order.orderNumber || order.order_number || order.id;

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return '10 Oct 2026, 10:24 AM';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '10 Oct 2026, 10:24 AM';
    }
  };

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name?.slice(0, 2) || 'CU').toUpperCase();
  };

  const isCurrentActioning = actioningId === order.id;

  return (
    <Card
      elevation={0}
      onClick={() => onDetails(order)}
      sx={{
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        '&:hover': {
          borderColor: '#064E3B',
          boxShadow: '0 4px 14px rgba(6,78,59,0.08)',
        },
      }}
    >
      {/* Top Row: #ORD-XXXXX, Status Chip, Chevron > */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
            #{orderNum}
          </Typography>
          <Box
            sx={{
              bgcolor: statusBg,
              color: statusColor,
              fontWeight: 800,
              fontSize: '0.68rem',
              px: 1,
              py: 0.2,
              borderRadius: '6px',
            }}
          >
            {statusLabel}
          </Box>
        </Stack>
        <ChevronRightIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
      </Stack>

      {/* Row 2: Date & Time */}
      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, mb: 1.5 }}>
        {formatDate(order.createdAt || order.created_at)}
      </Typography>

      {/* Row 3: Customer Avatar + Name & Count/Price */}
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.75 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: '#F3E8FF',
            color: '#7E22CE',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: '0.75rem',
            flexShrink: 0,
          }}
        >
          {getInitials(customerName)}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', lineHeight: 1.25 }} noWrap>
            {customerName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mt: 0.25 }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} • ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Stack>

      {/* Row 4: Item thumbnails & Action Button */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* Item Thumbnails */}
        <Stack direction="row" spacing={0.75} alignItems="center">
          {(itemsList.length > 0 ? itemsList : [{ image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=120&q=80' }]).slice(0, 3).map((item, idx) => (
            <Box
              key={idx}
              component="img"
              src={item.image || item.product_image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=120&q=80'}
              alt="item"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';
              }}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid #F1F5F9',
                bgcolor: '#F8FAFC',
              }}
            />
          ))}
        </Stack>

        {/* Action Button: View or Accept */}
        <Stack direction="row" spacing={1}>
          {isIncoming && (
            <Button
              size="small"
              variant="contained"
              disabled={isCurrentActioning}
              onClick={(e) => {
                e.stopPropagation();
                onAction(order.id, 'CONFIRMED');
              }}
              sx={{
                bgcolor: '#064E3B',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.76rem',
                textTransform: 'none',
                borderRadius: '8px',
                px: 1.75,
                py: 0.45,
                '&:hover': { bgcolor: '#04382A' },
              }}
            >
              Accept
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onDetails(order);
            }}
            sx={{
              borderColor: '#CBD5E1',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '0.76rem',
              textTransform: 'none',
              borderRadius: '8px',
              px: 1.75,
              py: 0.45,
              bgcolor: '#ffffff',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            View
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token_business') ||
                localStorage.getItem('token_captain') ||
                localStorage.getItem('captain_token');

  const [profile, setProfile] = useState(null);

  // Channel Mode: 'ONLINE', 'B2B', or 'OFFLINE'
  const [channelMode, setChannelMode] = useState(() => {
    const cat = localStorage.getItem('user_category') || 'merchant';
    const mode = localStorage.getItem('service_mode_business') || 'OFFLINE';
    const isB2B = cat === 'merchant' || cat === 'merchant_business';
    if (isB2B) return 'B2B';
    if (mode === 'ONLINE') return 'ONLINE';
    return 'ONLINE'; // Default to online orders feed
  });

  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status Tabs: 0 = New, 1 = Active, 2 = Fulfilled, 3 = Cancelled
  const [statusTab, setStatusTab] = useState(0);

  // Online Orders State
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [loadingOnlineOrders, setLoadingOnlineOrders] = useState(false);

  // B2B Orders State
  const [b2bOrders, setB2bOrders] = useState([]);
  const [loadingB2bOrders, setLoadingB2bOrders] = useState(false);

  // Offline Counter Payments State
  const [payments, setPayments] = useState([]);

  // Filter Drawer & Details Drawer
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  const [dateSortFilter, setDateSortFilter] = useState('LATEST');
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const pollIntervalRef = useRef(null);

  // Fetch Shops
  const fetchMerchantShops = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/merchant/shops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const shopList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setShops(shopList);
      if (shopList.length > 0 && !selectedShopId) {
        const activeSaved = localStorage.getItem('active_merchant_shop_id');
        const match = shopList.find(s => String(s.id) === String(activeSaved));
        setSelectedShopId(match ? String(match.id) : String(shopList[0].id));
      }
    } catch (err) {
      console.error('Failed to fetch merchant shops:', err);
    }
  };

  // Fetch Online Orders (Zero Mock Data)
  const fetchOnlineOrders = async (shopId) => {
    if (!token || !shopId) return;
    setLoadingOnlineOrders(true);
    setError('');
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/merchant/shops/${shopId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setOnlineOrders(data);
    } catch (err) {
      console.error('Failed to fetch online shop orders:', err);
      setError('Unable to load orders from server. Please check your internet connection.');
      setOnlineOrders([]);
    } finally {
      setLoadingOnlineOrders(false);
    }
  };

  // Fetch B2B Wholesale Orders (Zero Mock Data)
  const fetchB2bOrders = async () => {
    if (!token) return;
    setLoadingB2bOrders(true);
    setError('');
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/business/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setB2bOrders(data);
    } catch (err) {
      console.error('Failed to load B2B orders:', err);
      setError('Unable to load B2B wholesale orders from server.');
      setB2bOrders([]);
    } finally {
      setLoadingB2bOrders(false);
    }
  };

  // Fetch Offline Counter Payments
  const fetchPendingPayments = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/captain/offline-payments/merchant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch offline payments:', err);
    }
  };

  // Initial Load
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        if (token) {
          const profRes = await axios.get(`${CAPTAIN_API_URL}/captain/merchant/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null);
          if (!cancelled && profRes?.data) setProfile(profRes.data);
        }
        await fetchMerchantShops();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [token]);

  // Handle Mode Switch
  useEffect(() => {
    if (channelMode === 'ONLINE' && selectedShopId) {
      fetchOnlineOrders(selectedShopId);
    } else if (channelMode === 'B2B') {
      fetchB2bOrders();
    } else if (channelMode === 'OFFLINE') {
      fetchPendingPayments();
    }
  }, [channelMode, selectedShopId]);

  // Order Lifecycle Transitions with Zero Mock Updates
  const handleOnlineOrderTransition = async (orderId, targetStatus) => {
    setActioningId(orderId);
    setError('');
    setSuccess('');
    try {
      await axios.post(
        `${CAPTAIN_API_URL}/captain/merchant/shops/${selectedShopId}/orders/${orderId}/transition`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Order #${orderId} moved to status: ${targetStatus}.`);
      setActioningId(null);
      fetchOnlineOrders(selectedShopId);
    } catch (err) {
      console.error('Failed to transition order:', err);
      setError(err.response?.data?.message || `Failed to update Order #${orderId}. Please try again.`);
      setActioningId(null);
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
      setSuccess(`B2B Order #${orderId} updated to: ${targetStatus}.`);
      setActioningId(null);
      fetchB2bOrders();
    } catch (err) {
      console.error('Failed to transition B2B order:', err);
      setError(err.response?.data?.message || `Failed to update B2B Order #${orderId}.`);
      setActioningId(null);
    }
  };

  // Order Groupings for Online & B2B
  const currentOrders = channelMode === 'B2B' ? b2bOrders : onlineOrders;

  const newOrders = useMemo(() =>
    currentOrders.filter(o => o.status === 'PENDING' || o.status === 'PENDING_CONFIRMATION'),
    [currentOrders]
  );
  const activeOrders = useMemo(() =>
    currentOrders.filter(o => ['CONFIRMED', 'PREPARING', 'DISPATCHED', 'PROCESSING', 'SHIPPED'].includes(o.status)),
    [currentOrders]
  );
  const fulfilledOrders = useMemo(() =>
    currentOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED' || o.status === 'SUCCESS'),
    [currentOrders]
  );
  const cancelledOrders = useMemo(() =>
    currentOrders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED'),
    [currentOrders]
  );

  // Selected tab list
  const activeTabOrders = useMemo(() => {
    let list = [];
    if (statusTab === 0) list = newOrders;
    else if (statusTab === 1) list = activeOrders;
    else if (statusTab === 2) list = fulfilledOrders;
    else list = cancelledOrders;

    if (orderTypeFilter === 'DELIVERY') {
      list = list.filter(o => (o.delivery_type || o.deliveryType || 'DELIVERY').toUpperCase() !== 'PICKUP');
    } else if (orderTypeFilter === 'PICKUP') {
      list = list.filter(o => (o.delivery_type || o.deliveryType || '').toUpperCase() === 'PICKUP');
    }

    return list;
  }, [statusTab, newOrders, activeOrders, fulfilledOrders, cancelledOrders, orderTypeFilter]);

  return (
    <AppShell activeTab="/business/orders" title="Orders & Deliveries">
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>

        {/* 1. Header Bar with Outlet Subtitle & Filter Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', sm: '1.4rem' }, color: T.text, letterSpacing: '-0.3px' }}>
              Orders & Deliveries
            </Typography>
            <Typography sx={{ color: T.textSecondary, fontSize: '0.8rem', mt: 0.25, fontWeight: 500 }}>
              {channelMode === 'B2B' ? 'Wholesale Supplier Orders' : 'Live Retail Customer Orders'}
            </Typography>
          </Box>

          <IconButton
            onClick={() => setFilterDrawerOpen(true)}
            sx={{
              bgcolor: T.surface,
              border: `1.5px solid ${orderTypeFilter !== 'ALL' ? T.primary : T.border}`,
              color: orderTypeFilter !== 'ALL' ? T.primary : T.text,
              borderRadius: T.radiusSm,
              p: 1,
            }}
          >
            <FilterIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        {/* Unauthenticated Alert if No Token */}
        {!token && (
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: T.radiusMd, fontWeight: 700 }}>
            Please sign in with your merchant credentials to receive and fulfill orders.
          </Alert>
        )}

        {/* Feedback alerts */}
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: T.radiusMd, fontWeight: 700 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: T.radiusMd, fontWeight: 700 }}>{success}</Alert>}

        {/* 2. Channel Mode Pill Selector (B2C Online / B2B Wholesale / Offline Counter) */}
        <Box sx={{ mb: 2, bgcolor: '#FFFFFF', p: 0.5, borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex' }}>
          {[
            { id: 'ONLINE', label: 'B2C Retail', icon: <BagIcon sx={{ fontSize: 16 }} /> },
            { id: 'B2B', label: 'B2B Wholesale', icon: <StoreIcon sx={{ fontSize: 16 }} /> },
          ].map((mode) => {
            const isSelected = channelMode === mode.id;
            return (
              <Button
                key={mode.id}
                onClick={() => setChannelMode(mode.id)}
                startIcon={mode.icon}
                sx={{
                  flex: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.8rem',
                  py: 0.8,
                  bgcolor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? '#064E3B' : '#64748B',
                  border: isSelected ? '1.5px solid #064E3B' : '1.5px solid transparent',
                  boxShadow: isSelected ? '0 1px 4px rgba(6,78,59,0.12)' : 'none',
                  '&:hover': { bgcolor: isSelected ? '#FFFFFF' : '#F8FAFC' },
                }}
              >
                {mode.label}
              </Button>
            );
          })}
        </Box>

        {/* 3. Operating Store Selector (If Multiple Outlets) */}
        {channelMode === 'ONLINE' && shops.length > 1 && (
          <Card sx={{ mb: 2, p: 1.5, borderRadius: T.radiusMd, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <StoreIcon sx={{ color: T.primary, fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text, minWidth: 100 }}>
                Outlet:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  sx={{
                    borderRadius: T.radiusSm,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    bgcolor: T.surfaceAlt,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
                  }}
                >
                  {shops.map(s => (
                    <MenuItem key={s.id} value={String(s.id)} sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {s.shop_name} ({s.city || 'Main Branch'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Card>
        )}

        {/* 4. STATUS TABS (New, Active, Fulfilled, Cancelled) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            p: 0.5,
            bgcolor: '#F1F5F9',
            borderRadius: '999px',
            gap: 0.5,
            mb: 2,
          }}
        >
          {[
            { label: 'New', count: newOrders.length, value: 0 },
            { label: 'Active', count: activeOrders.length, value: 1 },
            { label: 'Fulfilled', count: fulfilledOrders.length, value: 2 },
            { label: 'Cancelled', count: cancelledOrders.length, value: 3 },
          ].map((tab) => {
            const isSelected = statusTab === tab.value;
            return (
              <Button
                key={tab.label}
                onClick={() => setStatusTab(tab.value)}
                sx={{
                  borderRadius: '999px',
                  textTransform: 'none',
                  py: 0.7,
                  px: 0.5,
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  bgcolor: isSelected ? '#064E3B' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#64748B',
                  boxShadow: isSelected ? '0 2px 8px rgba(6,78,59,0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  '&:hover': { bgcolor: isSelected ? '#04382A' : '#E2E8F0' },
                }}
              >
                <span>{tab.label}</span>
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    px: 0.6,
                    py: 0.1,
                    borderRadius: '999px',
                    bgcolor: isSelected ? 'rgba(255,255,255,0.22)' : '#E2E8F0',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {tab.count}
                </Box>
              </Button>
            );
          })}
        </Box>

        {/* Search & Filters Toolbar */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search orders..."
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 19 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#ffffff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: '40px',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: '#064E3B' },
              },
              '& .MuiInputBase-input': { fontSize: '0.82rem', color: '#0f172a' },
            }}
          />
          <Button
            size="small"
            onClick={() => setFilterDrawerOpen(true)}
            startIcon={<FilterIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              borderRadius: '12px',
              px: 1.5,
              fontWeight: 800,
              fontSize: '0.76rem',
              textTransform: 'none',
              flexShrink: 0,
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            Filters
          </Button>
          <Button
            size="small"
            onClick={() => setDateSortFilter(prev => prev === 'LATEST' ? 'OLDEST' : 'LATEST')}
            startIcon={<SortIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              borderRadius: '12px',
              px: 1.5,
              fontWeight: 800,
              fontSize: '0.76rem',
              textTransform: 'none',
              flexShrink: 0,
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            {dateSortFilter === 'LATEST' ? 'Newest' : 'Oldest'}
          </Button>
        </Stack>

        {/* 5. ORDERS FEED OR HONEST EMPTY STATE */}
        {(loadingOnlineOrders || loadingB2bOrders) ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={32} sx={{ color: T.primary }} />
          </Box>
        ) : activeTabOrders.length === 0 ? (
          <Card
            sx={{
              p: 5,
              borderRadius: T.radiusXl,
              border: `1px solid ${T.border}`,
              bgcolor: T.surface,
              textAlign: 'center',
              boxShadow: T.shadowSm,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: T.primaryLight,
                color: T.primary,
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <OrdersIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{ color: T.text, fontWeight: 900, fontSize: '1.05rem', mb: 0.5 }}>
              No {['New', 'Active', 'Fulfilled', 'Cancelled'][statusTab]} Orders
            </Typography>
            <Typography sx={{ color: T.textSecondary, fontSize: '0.8rem', maxWidth: 320, mx: 'auto', mb: 2 }}>
              Authoritative live orders for this outlet will appear here automatically when received.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                if (channelMode === 'B2B') fetchB2bOrders();
                else if (selectedShopId) fetchOnlineOrders(selectedShopId);
              }}
              sx={{
                borderColor: T.primary,
                color: T.primary,
                fontWeight: 800,
                borderRadius: T.radiusSm,
                textTransform: 'none',
                fontSize: '0.78rem',
                '&:hover': { bgcolor: T.primaryLight },
              }}
            >
              ↻ Refresh Orders
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {activeTabOrders.map((order) => (
              <ModernOrderCard
                key={order.id}
                order={order}
                onDetails={(ord) => setDetailsOrder(ord)}
                onAction={channelMode === 'B2B' ? handleB2bOrderTransition : handleOnlineOrderTransition}
                actioningId={actioningId}
                isB2B={channelMode === 'B2B'}
              />
            ))}
          </Stack>
        )}

        {/* 6. Filter Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { width: { xs: '85%', sm: 340 }, p: 3 } }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: T.text }}>
              Filter Orders
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: T.textSecondary, mb: 1, textTransform: 'uppercase' }}>
            Fulfillment Type
          </Typography>
          <RadioGroup value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)} sx={{ mb: 3 }}>
            <FormControlLabel value="ALL" control={<Radio sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }} />} label="All Orders" />
            <FormControlLabel value="DELIVERY" control={<Radio sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }} />} label="Door Delivery Only" />
            <FormControlLabel value="PICKUP" control={<Radio sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }} />} label="Store Pickup Only" />
          </RadioGroup>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterDrawerOpen(false)}
            sx={{
              bgcolor: T.primary,
              color: '#ffffff',
              py: 1.2,
              borderRadius: T.radiusSm,
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { bgcolor: T.primaryDark },
            }}
          >
            Apply Filters
          </Button>
        </Drawer>

        {/* 7. Order Details Drawer */}
        <Drawer
          anchor="bottom"
          open={Boolean(detailsOrder)}
          onClose={() => setDetailsOrder(null)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              maxHeight: '85vh',
              bgcolor: T.surface,
              p: { xs: 2.5, sm: 3.5 },
              overflowY: 'auto',
            }
          }}
        >
          {detailsOrder && (
            <Box>
              <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: T.border, mx: 'auto', mb: 2 }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: T.text }}>
                    Order Details #{detailsOrder.orderNumber || detailsOrder.id}
                  </Typography>
                  <Typography sx={{ color: T.textMuted, fontSize: '0.78rem' }}>
                    Placed via {channelMode === 'B2B' ? 'B2B Wholesale' : 'Trikonekt Online'}
                  </Typography>
                </Box>
                <IconButton onClick={() => setDetailsOrder(null)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              {/* Customer & Address */}
              <Box sx={{ bgcolor: T.surfaceAlt, p: 2, borderRadius: T.radiusMd, mb: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: T.textMuted, textTransform: 'uppercase', mb: 0.5 }}>
                  Customer
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.text }}>
                  {detailsOrder.customerName || detailsOrder.userName || (detailsOrder.buyer && detailsOrder.buyer.name) || 'Customer'}
                </Typography>
                {detailsOrder.contactPhone && (
                  <Typography sx={{ fontSize: '0.82rem', color: T.textSecondary, mt: 0.25 }}>
                    📞 {detailsOrder.contactPhone}
                  </Typography>
                )}
                {detailsOrder.shippingAddress && (
                  <Typography sx={{ fontSize: '0.82rem', color: T.textSecondary, mt: 0.25 }}>
                    📍 {typeof detailsOrder.shippingAddress === 'object'
                      ? `${detailsOrder.shippingAddress.street || ''}, ${detailsOrder.shippingAddress.city || ''} ${detailsOrder.shippingAddress.pincode || ''}`
                      : String(detailsOrder.shippingAddress)}
                  </Typography>
                )}
              </Box>

              {/* Items List */}
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: T.text, mb: 1 }}>
                Order Items ({detailsOrder.items?.length || 1})
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {(detailsOrder.items || []).map((it, idx) => (
                  <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.25, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusSm }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: T.text }}>
                        {it.productTitle || it.title || 'Product Item'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
                        Qty: {it.quantity || 1} × ₹{Number(it.unitPrice || it.price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: T.text }}>
                      ₹{((Number(it.quantity) || 1) * (Number(it.unitPrice || it.price) || 0)).toFixed(2)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Total & Action */}
              <Box sx={{ p: 2, bgcolor: T.surfaceAlt, borderRadius: T.radiusMd, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: T.text }}>Total Bill</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: T.primary }}>
                    ₹{Number(detailsOrder.total || detailsOrder.amount || 0).toFixed(2)}
                  </Typography>
                </Stack>
              </Box>

              {/* Lifecycle Actions */}
              {(detailsOrder.status === 'PENDING' || detailsOrder.status === 'PENDING_CONFIRMATION') && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      if (channelMode === 'B2B') handleB2bOrderTransition(detailsOrder.id, 'PROCESSING');
                      else handleOnlineOrderTransition(detailsOrder.id, 'CONFIRMED');
                      setDetailsOrder(null);
                    }}
                    sx={{ py: 1.2, bgcolor: T.primary, color: '#fff', fontWeight: 800, borderRadius: T.radiusSm, textTransform: 'none', '&:hover': { bgcolor: T.primaryDark } }}
                  >
                    Accept Order
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      if (channelMode === 'B2B') handleB2bOrderTransition(detailsOrder.id, 'CANCELLED');
                      else handleOnlineOrderTransition(detailsOrder.id, 'CANCELLED');
                      setDetailsOrder(null);
                    }}
                    sx={{ py: 1.2, borderColor: '#FECACA', color: '#DC2626', fontWeight: 800, borderRadius: T.radiusSm, textTransform: 'none', '&:hover': { bgcolor: '#FEF2F2' } }}
                  >
                    Reject Order
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Drawer>

      </Container>
    </AppShell>
  );
}
