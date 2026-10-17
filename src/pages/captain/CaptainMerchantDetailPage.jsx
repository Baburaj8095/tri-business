import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Chip, IconButton, Button,
  Divider, Stack, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Share as ShareIcon,
  Star as StarIcon,
  QrCode2 as QrIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Payment as PayoutIcon,
  ChevronRight as ChevronRightIcon,
  Description as DocIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  OpenInNew as OpenInNewIcon,
  Storefront as StoreIcon,
} from '@mui/icons-material';
import {
  getCaptainShopDetail,
  getPublicShopDetail,
  getCaptainShopKyc,
  getCaptainShopOrders,
  approveCaptainShop,
  rejectCaptainShop,
} from '../../api/api';

export default function CaptainMerchantDetailPage() {
  const navigate = useNavigate();
  const { id, tab } = useParams();
  const cleanId = String(id || '').replace(/\/.*$/, '').trim();

  const getInitialTab = () => {
    if (tab === '2' || tab === 'kyc') return 'KYC & Docs';
    if (tab === '1' || tab === 'orders') return 'Orders';
    if (tab === '3' || tab === 'activity') return 'Activity';
    return 'Overview';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState('');
  const [error, setError] = useState('');

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Live Shop & Merchant state
  const [merchant, setMerchant] = useState({
    id: cleanId || '1',
    name: 'Merchant Store',
    status: 'Pending',
    category: 'Retail Store',
    area: 'Bengaluru',
    rating: '4.8',
    reviews: 0,
    healthScore: 75,
    totalOrders: 0,
    monthlySales: '₹0',
    qrScans: 0,
    onTime: '100%',
    address: 'Address on file',
    distance: 'Territory Assigned',
    hours: '08:00 AM - 10:00 PM',
    ownerName: 'Store Owner',
    ownerPhone: '',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60',
  });

  // Live KYC details state
  const [kycDetails, setKycDetails] = useState({
    kyc_status: 'PENDING',
    pan_number: '',
    pan_card_url: '',
    is_gst_registered: false,
    gstin: '',
    gst_legal_name: '',
    gst_certificate_url: '',
    business_proof_type: '',
    business_proof_url: '',
    kyc_rejection_reason: '',
  });

  // Live Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadAllData = async () => {
    if (!cleanId) return;
    try {
      setLoading(true);
      setError('');

      // Fetch shop details, KYC, and orders concurrently
      const [shopRes, kycRes, ordersRes] = await Promise.allSettled([
        getCaptainShopDetail(cleanId).catch(() => getPublicShopDetail(cleanId)),
        getCaptainShopKyc(cleanId),
        getCaptainShopOrders(cleanId),
      ]);

      if (shopRes.status === 'fulfilled' && shopRes.value) {
        const s = shopRes.value;
        const isActive = s.status === 'ACTIVE' || s.shop_status === 'ACTIVE';
        const fullAddress = [s.address || s.shop_address, s.city || s.shop_city, s.pincode || s.shop_pincode]
          .filter(Boolean)
          .join(', ');

        setMerchant(prev => ({
          ...prev,
          id: String(s.id || s.shop_id || cleanId),
          name: s.shop_name || s.name || prev.name,
          status: isActive ? 'Active' : (s.status || s.shop_status || 'Pending'),
          category: s.category_name || s.category || prev.category,
          area: s.city || s.shop_city || prev.area,
          address: fullAddress || prev.address,
          ownerPhone: s.contact_number || s.merchant_phone || prev.ownerPhone,
          ownerName: s.merchant_name || prev.ownerName,
          image: s.shop_image || prev.image,
          distance: (s.pincode || s.shop_pincode) ? `PIN: ${s.pincode || s.shop_pincode}` : prev.distance,
          totalOrders: Number(s.orders_count || s.total_orders || 0),
          monthlySales: s.total_sales ? `₹${Number(s.total_sales).toLocaleString('en-IN')}` : '₹0',
          healthScore: isActive ? 92 : 60,
        }));
      }

      if (kycRes.status === 'fulfilled' && kycRes.value) {
        setKycDetails(kycRes.value);
      }

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value);
      }
    } catch (err) {
      console.warn('[CaptainMerchantDetailPage] Data load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [cleanId]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      setError('');
      const targetId = merchant.id || cleanId;
      const res = await approveCaptainShop(targetId);
      setMerchant(prev => ({ ...prev, status: 'Active', healthScore: 92 }));
      setKycDetails(prev => ({ ...prev, kyc_status: 'VERIFIED' }));
      setApprovalMsg(res?.message || 'Shop & KYC successfully verified and approved! Merchant store is now live.');
    } catch (err) {
      setError(err.message || 'Failed to approve shop');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectSubmit = async () => {
    try {
      setRejecting(true);
      setError('');
      const targetId = merchant.id || cleanId;
      const reason = rejectReason.trim() || 'KYC documents require review and resubmission.';
      const res = await rejectCaptainShop(targetId, reason);
      setMerchant(prev => ({ ...prev, status: 'Rejected' }));
      setKycDetails(prev => ({ ...prev, kyc_status: 'REJECTED', kyc_rejection_reason: reason }));
      setApprovalMsg(res?.message || 'Shop registration rejected. Feedback sent to merchant.');
      setRejectDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to reject shop');
    } finally {
      setRejecting(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${(merchant.ownerPhone || '').replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${(merchant.ownerPhone || '').replace(/\D/g, '')}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: merchant.name, text: `Check out ${merchant.name} on Trikonekt`, url: window.location.href });
    }
  };

  const isStoreActive = merchant.status.toUpperCase() === 'ACTIVE';
  const isKycVerified = kycDetails.kyc_status === 'VERIFIED';

  return (
    <Box sx={{ pb: 10 }}>

      {/* ── Top Header Navigation Bar ── */}
      <Box sx={{
        px: 2,
        pt: 2.5,
        pb: 1.5,
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <IconButton onClick={() => navigate('/captain/merchants')} size="small" sx={{ color: '#0f172a' }}>
          <BackIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleCall} size="small" sx={{ color: '#EA580C', bgcolor: '#FFF0E5', p: 0.8 }}>
            <PhoneIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={handleWhatsApp} size="small" sx={{ color: '#16a34a', bgcolor: '#f0fdf4', p: 0.8 }}>
            <WhatsAppIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={handleShare} size="small" sx={{ color: '#64748b', bgcolor: '#f8fafc', p: 0.8 }}>
            <ShareIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Alerts for Approval / Error ── */}
      {approvalMsg && (
        <Alert severity="success" sx={{ mx: 2, mt: 1.5, borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
          {approvalMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 1.5, borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
          {error}
        </Alert>
      )}

      {/* ── Store Pending Verification Banner ── */}
      {!isStoreActive && (
        <Box sx={{
          mx: 2,
          mt: 1.5,
          p: 1.75,
          bgcolor: '#FFF7ED',
          border: '1.5px solid #FFD8A8',
          borderRadius: '16px',
        }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#C2410C' }}>
                Store Awaiting Captain Verification & KYC Approval
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.25 }}>
                Verify merchant KYC documents, store address & contact. Once approved, the merchant store goes live immediately.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setRejectDialogOpen(true)}
                sx={{
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleApprove}
                disabled={approving}
                startIcon={approving ? <CircularProgress size={14} sx={{ color: '#ffffff' }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                  '&:hover': { bgcolor: '#15803d' },
                }}
              >
                {approving ? 'Activating...' : 'Approve & Activate'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* ── Merchant Store Header Profile ── */}
      <Box sx={{ p: 2, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
          <Box
            component="img"
            src={merchant.image}
            alt={merchant.name}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              objectFit: 'cover',
              border: '1.5px solid #e2e8f0',
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                {merchant.name}
              </Typography>
              <Chip
                label={isStoreActive ? 'Active' : merchant.status}
                size="small"
                sx={{
                  bgcolor: isStoreActive ? '#dcfce7' : '#fef3c7',
                  color: isStoreActive ? '#15803d' : '#b45309',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
              <Box sx={{
                width: 22, height: 22, borderRadius: '6px', bgcolor: isStoreActive ? '#f0fdf4' : '#fff7ed',
                display: 'grid', placeItems: 'center', color: isStoreActive ? '#047857' : '#ea580c',
              }}>
                <QrIcon sx={{ fontSize: 15 }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <StarIcon sx={{ fontSize: 15, color: '#eab308' }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
                  {merchant.rating}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  ({orders.length} orders)
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              {merchant.category} • {merchant.ownerName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Tab Navigation ── */}
      <Box sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        px: 1,
      }}>
        {['Overview', 'Orders', 'KYC & Docs', 'Activity'].map(tab => (
          <Box
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              py: 1.3,
              cursor: 'pointer',
              position: 'relative',
              color: activeTab === tab ? '#EA580C' : '#64748b',
              fontWeight: activeTab === tab ? 800 : 600,
              fontSize: '0.84rem',
            }}
          >
            {tab} {tab === 'Orders' && `(${orders.length})`}
            {activeTab === tab && (
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: '#EA580C',
                borderRadius: '3px 3px 0 0',
              }} />
            )}
          </Box>
        ))}
      </Box>

      {/* ── Tab Content Container ── */}
      <Box sx={{ p: 2 }}>

        {/* ══════════════ TAB 1: OVERVIEW ══════════════ */}
        {activeTab === 'Overview' && (
          <Box>
            {/* Health Score Card */}
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              p: 2.2,
              mb: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', mb: 1.8 }}>
                Merchant Health & Status
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" width="100%" height="100%">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={isStoreActive ? '#047857' : '#ea580c'}
                      strokeWidth="3.5"
                      strokeDasharray={`${merchant.healthScore}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1 }}>
                      {merchant.healthScore}%
                    </Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: isStoreActive ? '#16a34a' : '#ea580c', fontWeight: 800, mt: 0.2 }}>
                      {isStoreActive ? 'Active' : 'Pending'}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={0.6}>
                  {[
                    isStoreActive ? 'Store Verified & Active' : 'Store Awaiting Captain Verification',
                    isKycVerified ? 'KYC Documents Approved' : 'KYC Review Pending',
                    orders.length > 0 ? `${orders.length} Orders Recorded` : 'Ready to receive orders',
                    'Direct Sponsor Captain Assigned',
                  ].map((sig, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{
                        width: 16, height: 16, borderRadius: '50%',
                        bgcolor: i < 2 && !isStoreActive ? '#fef3c7' : '#dcfce7',
                        display: 'grid', placeItems: 'center',
                        color: i < 2 && !isStoreActive ? '#b45309' : '#16a34a',
                      }}>
                        <CheckIcon sx={{ fontSize: 11, strokeWidth: 2 }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.74rem', color: '#334155', fontWeight: 600 }}>
                        {sig}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* Quick Metrics Grid */}
            <Grid container spacing={1.2} sx={{ mb: 2 }}>
              {[
                { val: String(orders.length), lbl: 'Total Orders' },
                { val: merchant.monthlySales, lbl: 'Sales Volume' },
                { val: isKycVerified ? 'Verified' : 'Pending', lbl: 'KYC Status' },
                { val: isStoreActive ? 'Live' : 'Pending', lbl: 'Store Mode' },
              ].map((m, i) => (
                <Grid item xs={3} key={i}>
                  <Box sx={{
                    bgcolor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', p: 1.2,
                    textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.val}
                    </Typography>
                    <Typography sx={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600, mt: 0.2 }}>
                      {m.lbl}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Store Information Card */}
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              p: 2,
              mb: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
                  Store Information
                </Typography>
                <Chip
                  label={merchant.status}
                  size="small"
                  sx={{
                    bgcolor: isStoreActive ? '#dcfce7' : '#fef3c7',
                    color: isStoreActive ? '#15803d' : '#b45309',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                  }}
                />
              </Box>

              <Stack spacing={1.4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 18, color: '#EA580C', mt: 0.2 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                      {merchant.address}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {merchant.distance}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>
                    {merchant.hours}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>
                    {merchant.ownerName} • <Box component="span" sx={{ color: '#EA580C' }}>{merchant.ownerPhone}</Box>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}

        {/* ══════════════ TAB 2: ORDERS ══════════════ */}
        {activeTab === 'Orders' && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                Store Orders ({orders.length})
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Live customer orders
              </Typography>
            </Box>

            {orders.length === 0 ? (
              <Box sx={{
                bgcolor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px dashed #cbd5e1',
                p: 4,
                textAlign: 'center',
              }}>
                <CartIcon sx={{ fontSize: 36, color: '#94a3b8', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  No Orders Recorded Yet
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.5 }}>
                  When consumers place online delivery or store pickup orders, they will appear here in real time.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {orders.map((order, idx) => {
                  const status = String(order.status || 'PENDING').toUpperCase();
                  const isDelivered = status === 'DELIVERED';
                  const isAccepted = status === 'ACCEPTED' || status === 'CONFIRMED';
                  const isCancelled = status === 'CANCELLED' || status === 'REJECTED';

                  return (
                    <Box
                      key={order.id || idx}
                      sx={{
                        bgcolor: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        p: 1.8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a' }}>
                          #{order.order_number || `ORD-${order.id}`}
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            bgcolor: isDelivered ? '#dcfce7' : isAccepted ? '#eff6ff' : isCancelled ? '#fee2e2' : '#fef3c7',
                            color: isDelivered ? '#15803d' : isAccepted ? '#1d4ed8' : isCancelled ? '#b91c1c' : '#b45309',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 22,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {order.payment_method || 'Online'} • {order.payment_status || 'Paid'}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a' }}>
                          ₹{Number(order.grand_total || order.total || 0).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}

        {/* ══════════════ TAB 3: KYC & DOCS ══════════════ */}
        {activeTab === 'KYC & Docs' && (
          <Box>
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              p: 2,
              mb: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                    Merchant KYC Review
                  </Typography>
                  <Chip
                    label={isKycVerified ? 'KYC Verified' : kycDetails.kyc_status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                    size="small"
                    icon={isKycVerified ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : undefined}
                    sx={{
                      bgcolor: isKycVerified ? '#dcfce7' : kycDetails.kyc_status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                      color: isKycVerified ? '#15803d' : kycDetails.kyc_status === 'REJECTED' ? '#b91c1c' : '#b45309',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                    }}
                  />
                </Box>
              </Box>

              {kycDetails.kyc_rejection_reason && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.76rem' }}>
                  <strong>Rejection Note:</strong> {kycDetails.kyc_rejection_reason}
                </Alert>
              )}

              {/* 3 Document Cards */}
              <Stack spacing={1.5}>
                {/* 1. PAN Card */}
                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                      🪪 PAN Card
                    </Typography>
                    {kycDetails.pan_card_url ? (
                      <Button
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                        onClick={() => window.open(kycDetails.pan_card_url, '_blank')}
                        sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'none', color: '#EA580C', p: 0 }}
                      >
                        View Document
                      </Button>
                    ) : (
                      <Chip label="Not Uploaded" size="small" sx={{ fontSize: '0.64rem', height: 18 }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                    PAN: {kycDetails.pan_number || 'Not provided'}
                  </Typography>
                </Box>

                {/* 2. GSTIN Certificate */}
                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                      📄 GSTIN Registration
                    </Typography>
                    {kycDetails.gst_certificate_url ? (
                      <Button
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                        onClick={() => window.open(kycDetails.gst_certificate_url, '_blank')}
                        sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'none', color: '#EA580C', p: 0 }}
                      >
                        View Certificate
                      </Button>
                    ) : (
                      <Chip label={kycDetails.is_gst_registered ? 'Upload Pending' : 'Non-GST'} size="small" sx={{ fontSize: '0.64rem', height: 18 }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                    GSTIN: {kycDetails.gstin || (kycDetails.is_gst_registered ? 'Pending' : 'Unregistered / Composite')}
                  </Typography>
                  {kycDetails.gst_legal_name && (
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Trade Name: {kycDetails.gst_legal_name}
                    </Typography>
                  )}
                </Box>

                {/* 3. Business Proof / License */}
                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                      🏢 Business Proof / Shop License
                    </Typography>
                    {kycDetails.business_proof_url ? (
                      <Button
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                        onClick={() => window.open(kycDetails.business_proof_url, '_blank')}
                        sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'none', color: '#EA580C', p: 0 }}
                      >
                        View Proof
                      </Button>
                    ) : (
                      <Chip label="Not Uploaded" size="small" sx={{ fontSize: '0.64rem', height: 18 }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                    Type: {kycDetails.business_proof_type || 'Trade License / Shop Act / Electricity Bill'}
                  </Typography>
                </Box>
              </Stack>

              {/* Action Buttons inside KYC Tab */}
              {!isStoreActive && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontSize: '0.76rem', color: '#475569', mb: 1.5, fontWeight: 600 }}>
                    As the sponsoring Captain, verify that the documents match the merchant store details before activating:
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      onClick={() => setRejectDialogOpen(true)}
                      sx={{
                        flex: 1,
                        color: '#dc2626',
                        borderColor: '#fca5a5',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        textTransform: 'none',
                        borderRadius: '10px',
                        py: 1,
                        '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                      }}
                    >
                      Reject Documents
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleApprove}
                      disabled={approving}
                      startIcon={approving ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <CheckCircleIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        flex: 2,
                        bgcolor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.84rem',
                        textTransform: 'none',
                        borderRadius: '10px',
                        py: 1,
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                        '&:hover': { bgcolor: '#15803d' },
                      }}
                    >
                      {approving ? 'Verifying...' : 'Approve KYC & Activate Store'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* ══════════════ TAB 4: ACTIVITY ══════════════ */}
        {activeTab === 'Activity' && (
          <Box>
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              p: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', mb: 2 }}>
                Onboarding & Audit Timeline
              </Typography>

              <Stack spacing={2}>
                {[
                  {
                    title: isStoreActive ? 'Store Activated & Live' : 'Store Registration Submitted',
                    time: isStoreActive ? 'Approved by Captain' : 'Pending Verification',
                    color: isStoreActive ? '#16a34a' : '#ea580c',
                    bg: isStoreActive ? '#dcfce7' : '#fff7ed',
                  },
                  {
                    title: isKycVerified ? 'KYC Documents Verified' : 'KYC Submitted for Review',
                    time: isKycVerified ? 'PAN & Business Proof Validated' : 'Awaiting Review',
                    color: isKycVerified ? '#16a34a' : '#ea580c',
                    bg: isKycVerified ? '#dcfce7' : '#fff7ed',
                  },
                  {
                    title: 'Merchant Onboarded under Captain',
                    time: merchant.distance || 'Territory Assigned',
                    color: '#2563eb',
                    bg: '#eff6ff',
                  },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 12, height: 12, borderRadius: '50%',
                      bgcolor: item.color,
                      flexShrink: 0,
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {item.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

      </Box>

      {/* ── Fixed Bottom Action Bar ── */}
      <Box sx={{
        position: 'fixed',
        bottom: 64,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        p: 1.5,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
      }}>
        <Box sx={{ maxWidth: '520px', mx: 'auto', display: 'flex', gap: 1.5 }}>
          <Button
            onClick={handleCall}
            startIcon={<PhoneIcon sx={{ fontSize: 18 }} />}
            sx={{
              flex: 1,
              border: '1.5px solid #EA580C',
              color: '#EA580C',
              borderRadius: '12px',
              py: 1.2,
              fontWeight: 800,
              fontSize: '0.86rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#FFF0E5' },
            }}
          >
            Call Owner
          </Button>

          {!isStoreActive ? (
            <Button
              onClick={handleApprove}
              disabled={approving}
              startIcon={approving ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <CheckCircleIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: 1.6,
                bgcolor: '#16a34a',
                color: '#ffffff',
                borderRadius: '12px',
                py: 1.2,
                fontWeight: 900,
                fontSize: '0.86rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                '&:hover': { bgcolor: '#15803d' },
              }}
            >
              {approving ? 'Activating...' : 'Approve & Activate Shop'}
            </Button>
          ) : (
            <Button
              onClick={() => setActiveTab('Orders')}
              startIcon={<CartIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: 1.4,
                bgcolor: '#EA580C',
                color: '#ffffff',
                borderRadius: '12px',
                py: 1.2,
                fontWeight: 800,
                fontSize: '0.86rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                '&:hover': { bgcolor: '#C2410C' },
              }}
            >
              View Orders ({orders.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Reject Modal Dialog ── */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
          Reject Merchant KYC / Shop
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mb: 2 }}>
            Please enter the reason for rejecting this merchant registration so they can rectify and resubmit their documents.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. PAN card image is blurry, or GSTIN certificate does not match the shop name."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.82rem' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRejectSubmit}
            disabled={rejecting}
            sx={{
              bgcolor: '#dc2626',
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#b91c1c' },
            }}
          >
            {rejecting ? 'Submitting...' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
