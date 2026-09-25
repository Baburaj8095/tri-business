import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  WorkspacePremium,
  CheckCircle,
  Lock,
  Bolt,
  CreditCard,
  CalendarToday,
  Receipt,
  Download,
  Print,
  InfoOutlined,
  Close,
  Stars,
  VerifiedUser,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import {
  PLAN_TYPES,
  getSubscriptionDetails,
  activateMerchantSubscription,
} from '../../utils/membershipHelper';

const PRIMARY = '#228B22';
const PRIMARY_DARK = '#1B4D3E';
const ACCENT = '#f97316';
const BG = '#faf8f3';

export default function PackagesPage() {
  const navigate = useNavigate();

  const [subDetails, setSubDetails] = useState(getSubscriptionDetails());
  const [loadingPlan, setLoadingPlan] = useState(null); // '750' | '99' | null
  const [toastMsg, setToastMsg] = useState(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);

  const refreshDetails = () => {
    setSubDetails(getSubscriptionDetails());
  };

  useEffect(() => {
    refreshDetails();
  }, []);

  const has750 = subDetails.plan === PLAN_TYPES.SUBSCRIPTION_750;
  const has99 = subDetails.plan === PLAN_TYPES.SUBSCRIPTION_99;
  const isFree = subDetails.plan === PLAN_TYPES.FREE;

  const handleSubscribe750 = () => {
    if (has99) {
      setToastMsg('You have committed to the ₹99 Monthly Plan. You cannot switch to the ₹750 Yearly Package until the tenure completes.');
      return;
    }
    if (has750 && !subDetails.isExpired) {
      setToastMsg('You already have an active ₹750 Yearly Subscription.');
      return;
    }

    setLoadingPlan('750');
    setTimeout(() => {
      const res = activateMerchantSubscription(PLAN_TYPES.SUBSCRIPTION_750);
      setLoadingPlan(null);
      refreshDetails();
      setToastMsg(res.message);
      // Auto open invoice preview
      setActiveInvoiceModal({
        plan: 'SUBSCRIPTION_750',
        planName: '₹750 Yearly Prime Membership',
        amount: 750,
        gst: 114.41,
        baseAmount: 635.59,
        coinsCredited: 615,
        validity: '365 Days',
        receiptNo: `TRI-SUB-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
    }, 900);
  };

  const handleSubscribe99 = () => {
    if (has750) {
      setToastMsg('You have activated the ₹750 Yearly Membership. The ₹99 Monthly Plan is not applicable for your account.');
      return;
    }
    if (has99 && !subDetails.isExpired && subDetails.daysLeft > 3) {
      setToastMsg(`Month ${subDetails.tenureMonths} of 12 is active (${subDetails.daysLeft} days remaining). You can renew near expiry.`);
      return;
    }

    setLoadingPlan('99');
    setTimeout(() => {
      const res = activateMerchantSubscription(PLAN_TYPES.SUBSCRIPTION_99);
      setLoadingPlan(null);
      refreshDetails();
      setToastMsg(res.message);
      setActiveInvoiceModal({
        plan: 'SUBSCRIPTION_99',
        planName: `₹99 Monthly Prime Membership (Month ${res.tenureMonths} of 12)`,
        amount: 99,
        gst: 15.10,
        baseAmount: 83.90,
        coinsCredited: 81.18,
        validity: '30 Days',
        receiptNo: `TRI-SUB-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
    }, 900);
  };

  const openExistingInvoice = (planType) => {
    setActiveInvoiceModal({
      plan: planType,
      planName: planType === PLAN_TYPES.SUBSCRIPTION_750 ? '₹750 Yearly Prime Membership' : `₹99 Monthly Prime Membership (Month ${subDetails.tenureMonths || 1} of 12)`,
      amount: planType === PLAN_TYPES.SUBSCRIPTION_750 ? 750 : 99,
      gst: planType === PLAN_TYPES.SUBSCRIPTION_750 ? 114.41 : 15.10,
      baseAmount: planType === PLAN_TYPES.SUBSCRIPTION_750 ? 635.59 : 83.90,
      coinsCredited: planType === PLAN_TYPES.SUBSCRIPTION_750 ? 615 : 81.18,
      validity: planType === PLAN_TYPES.SUBSCRIPTION_750 ? '365 Days' : '30 Days',
      receiptNo: `TRI-SUB-INV-${planType === PLAN_TYPES.SUBSCRIPTION_750 ? '750' : '99'}`,
      date: subDetails.startedAt ? new Date(subDetails.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active',
    });
  };

  return (
    <AppShell activeTab="/business-dashboard" title="Prime Packages">
      <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 12 }}>
        {/* Sticky Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            px: { xs: 2, sm: 3 },
            py: 1.75,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#334155',
                  width: 38,
                  height: 38,
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
                aria-label="Go back"
              >
                <ArrowBack sx={{ fontSize: 20 }} />
              </IconButton>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.05rem', sm: '1.25rem' },
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <WorkspacePremium sx={{ color: '#d97706', fontSize: 22 }} />
                  Trikonekt Prime Packages
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                  Merchant Membership Plans • ₹750/Year or ₹99/Month
                </Typography>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
          {/* Toast Alert */}
          {toastMsg && (
            <Alert
              severity="info"
              onClose={() => setToastMsg(null)}
              sx={{ mb: 2.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}
            >
              {toastMsg}
            </Alert>
          )}

          {/* Current Membership Status Banner */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              mb: 3,
              border: isFree ? '1.5px solid #cbd5e1' : '1.5px solid #10b981',
              bgcolor: isFree ? '#ffffff' : '#f0fdf4',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '16px',
                    bgcolor: isFree ? '#f1f5f9' : '#dcfce7',
                    color: isFree ? '#64748b' : PRIMARY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isFree ? <Lock sx={{ fontSize: 26 }} /> : <VerifiedUser sx={{ fontSize: 28 }} />}
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                      {has750
                        ? '₹750 Annual Prime Membership'
                        : has99
                        ? `₹99 Monthly Prime (Month ${subDetails.tenureMonths || 1}/12)`
                        : 'Free Merchant Plan (Onboarded)'}
                    </Typography>
                    <Chip
                      size="small"
                      label={isFree ? 'FREE' : 'PRIME ACTIVE'}
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        bgcolor: isFree ? '#f1f5f9' : PRIMARY,
                        color: isFree ? '#475569' : '#ffffff',
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.3 }}>
                    {isFree
                      ? 'Upgrade to Prime to add merchant shops, list products & place B2B wholesale orders.'
                      : `${subDetails.daysLeft} days remaining • Rewards and permissions unlocked • Wallet: ${subDetails.triCoins} TRI Coins`}
                  </Typography>
                </Box>
              </Stack>

              {!isFree && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => openExistingInvoice(subDetails.plan)}
                  startIcon={<Receipt sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    borderColor: PRIMARY,
                    color: PRIMARY,
                    '&:hover': { bgcolor: alpha(PRIMARY, 0.05) },
                  }}
                >
                  View Invoice
                </Button>
              )}
            </Stack>

            {/* Tenure tracker if on 99 track */}
            {has99 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #cbd5e1' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                    12-Month Tenure Progress
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>
                    Month {subDetails.tenureMonths || 1} of 12
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={((subDetails.tenureMonths || 1) / 12) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0f2fe',
                    '& .MuiLinearProgress-bar': { bgcolor: '#0284c7', borderRadius: 4 },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Policy Guidance Alert */}
          {isFree && (
            <Box
              sx={{
                bgcolor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '16px',
                p: 2,
                mb: 3,
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <InfoOutlined sx={{ color: '#0284c7', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: '#0369a1', textTransform: 'uppercase' }}>
                  Subscription Selection Policy
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#0c4a6e', mt: 0.25, lineHeight: 1.45 }}>
                  • <strong>₹750 Yearly Package:</strong> 1 full year benefits with instant 615 TRI Coins. If chosen, the ₹99 monthly option will be disabled.<br />
                  • <strong>₹99 Monthly Package:</strong> Commits to a 12-month tenure (1st month + 11 monthly renewals). If chosen, you cannot switch to the ₹750 package.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Packages Grid */}
          <Grid container spacing={3}>
            {/* Package 1: ₹750 Yearly */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: '24px',
                  border: has99 ? '2px solid #e2e8f0' : has750 ? '2px solid #10b981' : '2px solid #f59e0b',
                  bgcolor: has99 ? '#f8fafc' : '#ffffff',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: has99 ? 0.7 : 1,
                }}
              >
                {/* Top Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: has99 ? '#64748b' : has750 ? '#10b981' : ACCENT,
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    px: 1.75,
                    py: 0.6,
                    borderBottomLeftRadius: '16px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {has99 ? <><Lock sx={{ fontSize: 13 }} /> LOCKED • 99 TRACK CHOSEN</> : has750 ? <><CheckCircle sx={{ fontSize: 13 }} /> ACTIVE (1 YEAR)</> : 'ANNUAL • 1 YEAR VALIDITY'}
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        bgcolor: '#fff7ed',
                        color: ACCENT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <WorkspacePremium sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: ACCENT, textTransform: 'uppercase' }}>
                        1 Year Validity (365 Days)
                      </Typography>
                      <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                        ₹750 Yearly Package
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Price Row */}
                  <Box sx={{ py: 2, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', mb: 2.5 }}>
                    <Stack direction="row" alignItems="baseline" spacing={0.75}>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                        ₹750
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                        / 1 Year (₹62.5/month)
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: PRIMARY, mt: 0.5 }}>
                      ✨ Instant 615 TRI Coins Credited (₹750 - 18% GST = 615)
                    </Typography>
                  </Box>

                  {/* Benefits List */}
                  <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                    {[
                      'Add & Manage Unlimited Merchant Shops',
                      'Add Products to Inventory with Live Online Sync',
                      'Browse & Place Orders in B2B Wholesale Marketplace',
                      'Instant 615 TRI Coins (461.25 Earning + 153.75 Savings)',
                      'Full 1 Year Active Cashback & Platform Rewards',
                      'KYC Verification & Referral Commissions Eligible',
                    ].map((item, i) => (
                      <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircle sx={{ fontSize: 17, color: PRIMARY, mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {/* Action Button */}
                  {has99 ? (
                    <Button
                      fullWidth
                      disabled
                      startIcon={<Lock />}
                      sx={{
                        py: 1.5,
                        borderRadius: '16px',
                        bgcolor: '#e2e8f0',
                        color: '#64748b',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                      }}
                    >
                      Locked (Committed to ₹99 Plan)
                    </Button>
                  ) : has750 && !subDetails.isExpired ? (
                    <Stack spacing={1}>
                      <Button
                        fullWidth
                        disabled
                        startIcon={<CheckCircle />}
                        sx={{
                          py: 1.5,
                          borderRadius: '16px',
                          bgcolor: PRIMARY,
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                        }}
                      >
                        Subscription Active (1 Year) ✓
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => openExistingInvoice(PLAN_TYPES.SUBSCRIPTION_750)}
                        startIcon={<Receipt />}
                        sx={{
                          py: 1,
                          borderRadius: '14px',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                        }}
                      >
                        View & Print Tax Invoice (₹750)
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubscribe750}
                      disabled={loadingPlan !== null}
                      startIcon={loadingPlan === '750' ? <CircularProgress size={16} color="inherit" /> : <Bolt />}
                      sx={{
                        py: 1.6,
                        borderRadius: '16px',
                        bgcolor: ACCENT,
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                        '&:hover': { bgcolor: '#ea580c' },
                      }}
                    >
                      {loadingPlan === '750' ? 'Activating Annual Prime...' : 'Subscribe ₹750 / Year →'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Package 2: ₹99 Monthly */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: '24px',
                  border: has750 ? '2px solid #e2e8f0' : has99 ? '2px solid #10b981' : '2px solid #0284c7',
                  bgcolor: has750 ? '#f8fafc' : '#ffffff',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: has750 ? 0.7 : 1,
                }}
              >
                {/* Top Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: has750 ? '#64748b' : has99 ? '#10b981' : '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    px: 1.75,
                    py: 0.6,
                    borderBottomLeftRadius: '16px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {has750 ? <><Lock sx={{ fontSize: 13 }} /> LOCKED • 750 YEARLY ACTIVE</> : has99 ? <><CheckCircle sx={{ fontSize: 13 }} /> ACTIVE (MONTH {subDetails.tenureMonths || 1}/12)</> : 'MONTHLY • 12 MONTHS TENURE'}
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        bgcolor: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CreditCard sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                        30 Days Validity (12 Months Tenure)
                      </Typography>
                      <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                        ₹99 Monthly Package
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Price Row */}
                  <Box sx={{ py: 2, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', mb: 2.5 }}>
                    <Stack direction="row" alignItems="baseline" spacing={0.75}>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                        ₹99
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                        / 1 Month
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: PRIMARY, mt: 0.5 }}>
                      ✨ Instant 81.18 TRI Coins Credited each renewal
                    </Typography>
                  </Box>

                  {/* Benefits List */}
                  <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                    {[
                      'Add & Manage Unlimited Merchant Shops',
                      'Add Products to Inventory with Live Online Sync',
                      'Browse & Place Orders in B2B Wholesale Marketplace',
                      'Instant 81.18 TRI Coins Credited (60.88 Earning + 20.30 Savings)',
                      '30 Days Validity per renewal (12 monthly cycle commitment)',
                      'Consistent Monthly Cashbacks & Platform Rewards',
                    ].map((item, i) => (
                      <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircle sx={{ fontSize: 17, color: PRIMARY, mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {/* Action Button */}
                  {has750 ? (
                    <Button
                      fullWidth
                      disabled
                      startIcon={<Lock />}
                      sx={{
                        py: 1.5,
                        borderRadius: '16px',
                        bgcolor: '#e2e8f0',
                        color: '#64748b',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                      }}
                    >
                      Locked (Yearly Plan Active)
                    </Button>
                  ) : has99 && !subDetails.isExpired ? (
                    <Stack spacing={1}>
                      <Button
                        fullWidth
                        disabled
                        startIcon={<CheckCircle />}
                        sx={{
                          py: 1.5,
                          borderRadius: '16px',
                          bgcolor: PRIMARY,
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                        }}
                      >
                        Month {subDetails.tenureMonths || 1}/12 Active ✓
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => openExistingInvoice(PLAN_TYPES.SUBSCRIPTION_99)}
                        startIcon={<Receipt />}
                        sx={{
                          py: 1,
                          borderRadius: '14px',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                        }}
                      >
                        View & Print Tax Invoice (₹99)
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubscribe99}
                      disabled={loadingPlan !== null}
                      startIcon={loadingPlan === '99' ? <CircularProgress size={16} color="inherit" /> : <CreditCard />}
                      sx={{
                        py: 1.6,
                        borderRadius: '16px',
                        bgcolor: '#0f172a',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#1e293b' },
                      }}
                    >
                      {loadingPlan === '99' ? 'Activating Month 1...' : has99 ? `Renew Month ${(subDetails.tenureMonths || 0) + 1} of 12 (₹99) →` : 'Subscribe Month 1 of 12 (₹99) →'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Invoice Modal */}
        {activeInvoiceModal && (
          <Dialog
            open={Boolean(activeInvoiceModal)}
            onClose={() => setActiveInvoiceModal(null)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: { borderRadius: '24px', overflow: 'hidden' },
            }}
          >
            <Box sx={{ bgcolor: '#1B4D3E', color: '#fff', p: 2.5, position: 'relative' }}>
              <IconButton
                onClick={() => setActiveInvoiceModal(null)}
                sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.8)' }}
                size="small"
              >
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase' }}>
                Tax Invoice & Payment Receipt
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, mt: 0.5 }}>
                Trikonekt Prime Subscription
              </Typography>
            </Box>

            <DialogContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Receipt No:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{activeInvoiceModal.receiptNo}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Date:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{activeInvoiceModal.date}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Plan Description:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{activeInvoiceModal.planName}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Validity:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: PRIMARY }}>{activeInvoiceModal.validity}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TRI Coins Credited:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: PRIMARY }}>+{activeInvoiceModal.coinsCredited} Coins</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Base Amount:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>₹{activeInvoiceModal.baseAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>18% GST (CGST 9% + SGST 9%):</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>₹{activeInvoiceModal.gst.toFixed(2)}</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>Total Paid:</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: PRIMARY }}>₹{activeInvoiceModal.amount.toFixed(2)}</Typography>
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => window.print()}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
              >
                Print Receipt
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveInvoiceModal(null)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', bgcolor: PRIMARY }}
              >
                Done
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </AppShell>
  );
}
