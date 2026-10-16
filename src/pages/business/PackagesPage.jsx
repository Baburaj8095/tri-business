import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  WorkspacePremium,
  CheckCircle,
  CreditCard,
  Receipt,
  Print,
  Close,
  VerifiedUser,
  QrCode2,
  Storefront,
  LocalShipping,
  Bolt,
  Savings,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import {
  PLAN_TYPES,
  getSubscriptionDetails,
  activateMerchantSubscription,
} from '../../utils/membershipHelper';

const PRIMARY = '#FF6508';
const PRIMARY_DARK = '#E9570A';
const BG = '#F8FAFC';

export default function PackagesPage() {
  const navigate = useNavigate();

  const [subDetails, setSubDetails] = useState(getSubscriptionDetails());
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);

  const refreshDetails = () => {
    setSubDetails(getSubscriptionDetails());
  };

  useEffect(() => {
    refreshDetails();
  }, []);

  const isMemberActive = subDetails.isPrime;

  const handleSubscribe99 = () => {
    setLoading(true);
    setTimeout(() => {
      const res = activateMerchantSubscription(PLAN_TYPES.SUBSCRIPTION_99);
      setLoading(false);
      refreshDetails();
      setToastMsg('₹99 Monthly Merchant Pro Membership activated successfully!');
      setActiveInvoiceModal({
        plan: 'SUBSCRIPTION_99',
        planName: 'Trikonekt Merchant Pro (Monthly Subscription)',
        amount: 99,
        gst: 15.10,
        baseAmount: 83.90,
        validity: '30 Days',
        receiptNo: `TRI-PRO-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
    }, 700);
  };

  const openExistingInvoice = () => {
    setActiveInvoiceModal({
      plan: 'SUBSCRIPTION_99',
      planName: 'Trikonekt Merchant Pro (Monthly Subscription)',
      amount: 99,
      gst: 15.10,
      baseAmount: 83.90,
      validity: '30 Days',
      receiptNo: `TRI-PRO-INV-99`,
      date: subDetails.startedAt
        ? new Date(subDetails.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Active',
    });
  };

  return (
    <AppShell activeTab="/business-dashboard" title="Merchant Membership">
      <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 12 }}>
        {/* Sticky Top Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #E2E8F0',
            px: { xs: 2, sm: 3 },
            py: 1.5,
          }}
        >
          <Container maxWidth="md" sx={{ px: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => navigate('/business-dashboard')} size="small" sx={{ bgcolor: '#F1F5F9' }}>
                <ArrowBack sx={{ fontSize: 18 }} />
              </IconButton>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', lineHeight: 1.2 }}>
                  Merchant Membership
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                  ₹99/Month • One Plan, Complete Access
                </Typography>
              </Box>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="sm" sx={{ pt: 3 }}>
          {/* Toast Alert */}
          {toastMsg && (
            <Alert
              severity="success"
              onClose={() => setToastMsg(null)}
              sx={{ mb: 2.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}
            >
              {toastMsg}
            </Alert>
          )}

          {/* Single High-Conversion Membership Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '28px',
              border: isMemberActive ? '2px solid #10B981' : '2px solid #FF6508',
              bgcolor: '#ffffff',
              boxShadow: isMemberActive
                ? '0 12px 32px rgba(16, 185, 129, 0.12)'
                : '0 12px 32px rgba(255, 101, 8, 0.14)',
              overflow: 'hidden',
              position: 'relative',
              mb: 3,
            }}
          >
            {/* Top Gradient Crown Banner */}
            <Box
              sx={{
                background: isMemberActive
                  ? 'linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)'
                  : 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #FF6508 100%)',
                color: '#ffffff',
                p: { xs: 2.5, sm: 3 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Chip
                    icon={isMemberActive ? <VerifiedUser sx={{ fontSize: '14px !important', color: '#fff !important' }} /> : <Bolt sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                    label={isMemberActive ? 'MEMBER ACTIVE' : 'ALL-IN-ONE MERCHANT PLAN'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 24,
                      mb: 1.2,
                    }}
                  />
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.5rem' }, lineHeight: 1.15 }}>
                    Trikonekt Merchant Pro
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.88)', mt: 0.5, fontWeight: 500 }}>
                    Unlock store onboarding, standee QR, unlimited catalog & delivery
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.18)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <WorkspacePremium sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
              </Box>

              {/* Price Row */}
              <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontSize: { xs: '2.2rem', sm: '2.5rem' }, fontWeight: 900, lineHeight: 1 }}>
                  ₹99
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 700 }}>
                  / month (incl. 18% GST)
                </Typography>
              </Box>
            </Box>

            {/* Content & Feature Checklist */}
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              {/* Active Plan Summary Banner */}
              {isMemberActive ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: '#ECFDF5',
                    border: '1.5px solid #A7F3D0',
                    mb: 3,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#065F46' }}>
                        Your Membership is Active
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600, mt: 0.2 }}>
                        {subDetails.daysLeft} days remaining on your current cycle
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={openExistingInvoice}
                      startIcon={<Receipt sx={{ fontSize: 15 }} />}
                      sx={{
                        borderRadius: '10px',
                        borderColor: '#059669',
                        color: '#065F46',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(5, 150, 105, 0.08)' },
                      }}
                    >
                      View Invoice
                    </Button>
                  </Stack>
                </Box>
              ) : null}

              <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0F172A', mb: 1.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Included With Merchant Pro:
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {[
                  {
                    icon: <QrCode2 sx={{ fontSize: 18, color: '#FF6508' }} />,
                    title: 'Official Merchant Standee QR Code',
                    desc: 'Accept customer payments via UPI, Cards, Net Banking & TRI Coins with instant audio voice alerts',
                  },
                  {
                    icon: <Storefront sx={{ fontSize: 18, color: '#10B981' }} />,
                    title: 'Unlimited Products & Store Catalog',
                    desc: 'Add unlimited items, categories, pricing, barcodes, and manage real-time inventory',
                  },
                  {
                    icon: <CheckCircle sx={{ fontSize: 18, color: '#3B82F6' }} />,
                    title: 'Near Store & Explore Directory Placement',
                    desc: 'High-visibility placement on Tri-Shopping for local customers searching nearby pincodes',
                  },
                  {
                    icon: <Savings sx={{ fontSize: 18, color: '#8B5CF6' }} />,
                    title: '0% Platform Commission On Marketplace Orders',
                    desc: 'Receive direct orders from local customers and keep 100% of your product margins',
                  },
                  {
                    icon: <LocalShipping sx={{ fontSize: 18, color: '#0EA5E9' }} />,
                    title: 'Tri-Sarathi On-Demand Delivery Dispatch',
                    desc: 'Automated rider assignment and live courier tracking from your store to customer doorstep',
                  },
                ].map((feat, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '10px',
                        bgcolor: '#F1F5F9',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      {feat.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.2 }}>
                        {feat.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, mt: 0.2, lineHeight: 1.35 }}>
                        {feat.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {/* GST Tax Transparency Box */}
              <Box sx={{ bgcolor: '#F8FAFC', borderRadius: '14px', p: 1.8, mb: 3, border: '1px solid #E2E8F0' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Base Plan Price (1 Month):</Typography>
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F172A' }}>₹83.90</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>GST @ 18% (CGST 9% + SGST 9%):</Typography>
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F172A' }}>₹15.10</Typography>
                </Stack>
                <Divider sx={{ my: 0.8 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A' }}>Total Payable:</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: PRIMARY }}>₹99.00</Typography>
                </Stack>
              </Box>

              {/* Action Button */}
              {isMemberActive ? (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={openExistingInvoice}
                    startIcon={<Receipt />}
                    sx={{
                      py: 1.4,
                      borderRadius: '16px',
                      borderColor: '#CBD5E1',
                      color: '#0F172A',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                    }}
                  >
                    View Tax Invoice
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubscribe99}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CreditCard />}
                    sx={{
                      py: 1.4,
                      borderRadius: '16px',
                      bgcolor: PRIMARY,
                      fontWeight: 900,
                      fontSize: '0.84rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(255, 101, 8, 0.3)',
                      '&:hover': { bgcolor: PRIMARY_DARK },
                    }}
                  >
                    {loading ? 'Renewing...' : 'Extend +30 Days (₹99)'}
                  </Button>
                </Stack>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubscribe99}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CreditCard />}
                  sx={{
                    py: 1.6,
                    borderRadius: '16px',
                    bgcolor: PRIMARY,
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.94rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 18px rgba(255, 101, 8, 0.35)',
                    '&:hover': { bgcolor: PRIMARY_DARK },
                  }}
                >
                  {loading ? 'Activating Membership...' : 'Activate Merchant Pro — ₹99/mo →'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Container>

        {/* Tax Invoice Modal */}
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
            <Box sx={{ bgcolor: '#0F172A', color: '#fff', p: 2.5, position: 'relative' }}>
              <IconButton
                onClick={() => setActiveInvoiceModal(null)}
                sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.8)' }}
                size="small"
              >
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#FDBA74', textTransform: 'uppercase' }}>
                Tax Invoice & Payment Receipt
              </Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, mt: 0.5 }}>
                Trikonekt Merchant Pro
              </Typography>
            </Box>

            <DialogContent sx={{ p: 2.5 }}>
              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Receipt No:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>{activeInvoiceModal.receiptNo}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Date:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>{activeInvoiceModal.date}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Plan:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>{activeInvoiceModal.planName}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Validity:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: PRIMARY }}>{activeInvoiceModal.validity}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Member Status:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: '#10B981' }}>Verified Merchant Pro ✓</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Base Amount:</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>₹{activeInvoiceModal.baseAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>18% GST (CGST 9% + SGST 9%):</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>₹{activeInvoiceModal.gst.toFixed(2)}</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>Total Paid:</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: PRIMARY }}>₹{activeInvoiceModal.amount.toFixed(2)}</Typography>
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
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
