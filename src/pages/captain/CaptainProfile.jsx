import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Grid,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Notifications as BellIcon,
  ContentCopy as CopyIcon,
  CheckCircle as ActiveIcon,
  VerifiedUser as ShieldIcon,
  Storefront as StoreIcon,
  TrendingUp as TrendUpIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as BankIcon,
  QrCodeScanner as QrIcon,
  HelpOutline as HelpIcon,
  Logout as LogoutIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import CaptainKycDrawer from './components/CaptainKycDrawer';
import { getCaptainShops, getCaptainDailyBusiness, getCaptainProfile } from '../../api/api';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

export default function CaptainProfile({ autoOpenKyc = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [captainName, setCaptainName] = useState(localStorage.getItem('fullname_captain') || 'Captain Partner');
  const [captainId, setCaptainId] = useState(localStorage.getItem('username_captain') || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState(localStorage.getItem('pincode_captain') || '');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [kycStatus, setKycStatus] = useState('PENDING');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Live Statistics
  const [assignedMerchantsCount, setAssignedMerchantsCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [territoryName, setTerritoryName] = useState('');
  const [monthlyGmv, setMonthlyGmv] = useState(0);

  // KYC Bottom Drawer State
  const [kycDrawerOpen, setKycDrawerOpen] = useState(() => autoOpenKyc || searchParams.get('action') === 'kyc');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('fullname_captain');
    const storedId = localStorage.getItem('username_captain');
    const storedPin = localStorage.getItem('pincode_captain');

    if (storedName) setCaptainName(storedName);
    if (storedId) {
      setCaptainId(storedId);
      const cleanPhone = storedId.replace(/\D/g, '');
      if (cleanPhone.length === 10) setPhone(`+91 ${cleanPhone}`);
    }
    if (storedPin) setPincode(storedPin);

    // Fetch profile and live shops details from backend
    const fetchLiveProfileData = async () => {
      try {
        const [profRes, shopsRes, dailyRes] = await Promise.allSettled([
          getCaptainProfile(),
          getCaptainShops(),
          getCaptainDailyBusiness(),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value) {
          const data = profRes.value;
          if (data.fullName) setCaptainName(data.fullName);
          if (data.phone) setPhone(data.phone.startsWith('+91') ? data.phone : `+91 ${data.phone}`);
          if (data.email) setEmail(data.email);
          if (data.pincode) setPincode(data.pincode);
          if (data.city) setCity(data.city);
          if (data.stateName) setStateName(data.stateName);
          if (data.kycStatus) setKycStatus(data.kycStatus);
          if (data.territory) setTerritoryName(data.territory);
          if (data.bankName) setBankName(data.bankName);
          if (data.accountNumber) setAccountNumber(data.accountNumber);
        }

        let shopsCount = 0;
        if (shopsRes.status === 'fulfilled' && Array.isArray(shopsRes.value)) {
          shopsCount = shopsRes.value.length;
          setAssignedMerchantsCount(shopsCount);
        }

        if (dailyRes.status === 'fulfilled' && dailyRes.value) {
          const d = dailyRes.value;
          const gmv = Number(d.monthlyGmv || (Number(d.todayGmvEstimate || 0) * 30) || 0);
          const earn = Number(d.monthlyEarnings || Math.round(gmv * 0.03) || 0);
          setMonthlyGmv(gmv);
          setMonthlyEarnings(earn);
          if (d.pincode && !territoryName) {
            setTerritoryName(`PIN: ${d.pincode} Zone`);
          }
        } else {
          setMonthlyGmv(0);
          setMonthlyEarnings(0);
        }
      } catch (err) {
        console.warn('[CaptainProfile] Error loading profile stats:', err);
      }
    };

    fetchLiveProfileData();
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(captainId);
    setCopied(true);
    setToastMsg('Captain ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token_captain');
    localStorage.removeItem('refresh_captain');
    localStorage.removeItem('username_captain');
    localStorage.removeItem('fullname_captain');
    localStorage.removeItem('token_business');
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ pb: 4 }}>

      {/* ── Top Curved Orange Header (Matches CaptainHome) ── */}
      <Box sx={{
        background: 'linear-gradient(145deg, #431407 0%, #7c2d12 55%, #EA580C 100%)',
        color: '#ffffff',
        pt: 3,
        pb: 3.5,
        px: 2.5,
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
      }}>
        {/* Row 1: Avatar, Greeting, Name, Badges & Header Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              border: '2.5px solid rgba(255, 255, 255, 0.5)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            }}>
              {String(captainName || 'B').charAt(0).toUpperCase()}
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                Franchise Partner Profile
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {captainName}
                </Typography>
                <Chip
                  label="⭐ Gold Tier"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(253, 224, 71, 0.22)',
                    color: '#fef08a',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                    border: '1px solid rgba(253, 224, 71, 0.4)',
                  }}
                />
              </Box>

              {/* Captain ID with copy */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, fontFamily: 'monospace' }}>
                  {captainId}
                </Typography>
                <IconButton onClick={handleCopyId} size="small" sx={{ color: 'rgba(255, 255, 255, 0.8)', p: 0.2 }}>
                  <CopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <IconButton
            size="small"
            sx={{ color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.15)', p: 0.8 }}
          >
            <BellIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Territory Location Pill */}
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.8,
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          px: 1.5,
          py: 0.6,
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}>
          <LocationIcon sx={{ fontSize: 16, color: '#fef08a' }} />
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#ffffff' }}>
            {[city, stateName].filter(Boolean).join(', ') || 'Bengaluru Zone'} • PIN {pincode || '560073'}
          </Typography>
        </Box>
      </Box>

      {/* ── Page Content Container ── */}
      <Box sx={{ px: 2, mt: 2.5 }}>

        {/* ── 4 Quick Metric Summary Cards (Equal Size 2x2 Grid) ── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          mb: 2.5,
          width: '100%',
        }}>
          {[
            { label: 'Assigned Merchants', val: `${assignedMerchantsCount}`, icon: <StoreIcon sx={{ fontSize: 18, color: '#EA580C' }} />, bg: '#fff7ed' },
            { label: 'Monthly Earnings', val: `₹${monthlyEarnings.toLocaleString('en-IN')}`, icon: <TrendUpIcon sx={{ fontSize: 18, color: '#16a34a' }} />, bg: '#f0fdf4' },
            { label: 'Captain Rating', val: '4.9 ⭐', icon: <StarIcon sx={{ fontSize: 18, color: '#eab308' }} />, bg: '#fefce8' },
            { label: 'Active Territory', val: territoryName || `${city || 'Bengaluru'} Zone`, icon: <LocationIcon sx={{ fontSize: 18, color: '#0284c7' }} />, bg: '#f0f9ff' },
          ].map((m, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                p: 1.6,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 112,
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', bgcolor: m.bg,
                display: 'grid', placeItems: 'center', mb: 1,
              }}>
                {m.icon}
              </Box>
              <Box>
                <Typography sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.05rem', sm: '1.2rem' },
                  color: '#0f172a',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {m.val}
                </Typography>
                <Typography sx={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: 600,
                  mt: 0.3,
                  lineHeight: 1.25,
                }}>
                  {m.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── World-Class KYC Status Card with Drawer Trigger ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #EA580C 100%)',
          borderRadius: '20px',
          p: 2.2,
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          mb: 2.5,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle shield watermark */}
          <Box sx={{
            position: 'absolute', right: -15, top: -10, opacity: 0.18, pointerEvents: 'none',
          }}>
            <ShieldIcon sx={{ fontSize: 120, color: '#ffffff' }} />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <ShieldIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#ffffff' }}>
                  KYC Verification
                </Typography>
              </Box>

              <Chip
                label={kycStatus === 'VERIFIED' ? 'Verified Partner' : 'Pending Review'}
                size="small"
                sx={{
                  bgcolor: kycStatus === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                  color: kycStatus === 'VERIFIED' ? '#15803d' : '#b45309',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 22,
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, mb: 2 }}>
              Aadhaar, PAN Card, Settlement Bank, and Nominee details are configured for instant earnings payouts.
            </Typography>

            <Button
              onClick={() => setKycDrawerOpen(true)}
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#ffffff',
                color: '#EA580C',
                fontWeight: 900,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: '12px',
                px: 2.2,
                py: 0.8,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                '&:hover': { bgcolor: '#FFF0E5' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              Update KYC & Bank Details
            </Button>
          </Box>
        </Box>

        {/* ── Franchise Territory & Territory Card ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', mb: 1.5 }}>
            Franchise Territory
          </Typography>

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Assigned Pincode
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                {pincode}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#f1f5f9' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StoreIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Cluster & Area
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {territoryName || (city ? `${city} Zone` : (pincode ? `PIN ${pincode}` : 'Assigned Territory'))}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#f1f5f9' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ActiveIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Operational Status
                </Typography>
              </Box>
              <Chip
                label="Active & Receiving Tasks"
                size="small"
                sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
              />
            </Box>
          </Stack>
        </Box>

        {/* ── Settlement Bank Account Card ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
              Settlement Bank Account
            </Typography>
            <Typography
              onClick={() => setKycDrawerOpen(true)}
              sx={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 800, cursor: 'pointer' }}
            >
              {bankName ? 'Edit Details' : 'Add Bank'}
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BankIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Bank & Account
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {bankName ? `${bankName} •••• ${(accountNumber || '0000').slice(-4)}` : 'Bank Not Linked (Add in KYC)'}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#f1f5f9' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                Payout Frequency
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#16a34a' }}>
                Instant Daily Settlements (T+0)
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ── Quick Tools & Support Section ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 1.5,
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          {[
            {
              icon: <QrIcon sx={{ fontSize: 20, color: '#EA580C' }} />,
              iconBg: '#FFF0E5',
              title: 'Merchant QR Scanner',
              desc: 'Scan merchant QR codes & register shop counters',
              onClick: () => navigate('/scanner'),
            },
            {
              icon: <HelpIcon sx={{ fontSize: 20, color: '#0284c7' }} />,
              iconBg: '#f0f9ff',
              title: 'Captain Support Hotline',
              desc: 'Toll-free franchise partner assistance (24/7)',
              onClick: () => { window.location.href = 'tel:18001234567'; },
            },
          ].map((item, idx) => (
            <Box
              key={idx}
              onClick={item.onClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.2,
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Box sx={{
                width: 38, height: 38, borderRadius: '10px', bgcolor: item.iconBg,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {item.desc}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
            </Box>
          ))}
        </Box>

        {/* ── Logout Button ── */}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setLogoutDialogOpen(true)}
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderColor: '#fca5a5',
            color: '#dc2626',
            borderRadius: '14px',
            py: 1.3,
            fontWeight: 800,
            fontSize: '0.88rem',
            textTransform: 'none',
            bgcolor: '#fef2f2',
            '&:hover': { bgcolor: '#fee2e2', borderColor: '#ef4444' },
          }}
        >
          Sign Out of Captain Portal
        </Button>

      </Box>

      {/* ── Bottom Nav Drawer for KYC Details ── */}
      <CaptainKycDrawer
        open={kycDrawerOpen}
        onClose={() => setKycDrawerOpen(false)}
        onSuccess={() => {
          setToastMsg('KYC details updated successfully!');
          setKycStatus('VERIFIED');
        }}
      />

      {/* ── Logout Confirmation Dialog ── */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
          Sign Out?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748b' }}>
            Are you sure you want to log out of your Captain partner account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLogoutConfirm}
            sx={{ bgcolor: '#dc2626', color: '#ffffff', fontWeight: 800, borderRadius: '10px', textTransform: 'none', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            Confirm Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setToastMsg('')} sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {toastMsg}
        </Alert>
      </Snackbar>

    </Box>
  );
}
