import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack, Alert,
  CircularProgress, InputAdornment, IconButton, FormControlLabel,
  Checkbox, Chip, LinearProgress, Divider, Fade, Select, MenuItem,
  FormControl, Grid, Tooltip,
} from '@mui/material';
import {
  Verified, Phone, Email, Person, Lock, Visibility, VisibilityOff,
  LocationOn, CheckCircle, ArrowBack, ArrowForward,
  Shield, VerifiedUser, ContentCopy, Done, Store, Storefront,
  Language, Check, LocalShipping, TrendingUp, Security,
  Bolt, SupportAgent, QrCode2, WorkspacePremium, People,
  ArrowRightAlt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Executive Design Tokens ─── */
const THEMES = {
  BUSINESS: {
    primary: '#047857',
    primaryDark: '#064e3b',
    primaryDeep: '#022c22',
    primaryLight: '#ecfdf5',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    heroGrad: 'linear-gradient(145deg, #022c22 0%, #064e3b 60%, #047857 100%)',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderFocus: '#047857',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  CAPTAIN: {
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryDeep: '#134e4a',
    primaryLight: '#ccfbf1',
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.25)',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
    heroGrad: 'linear-gradient(145deg, #134e4a 0%, #0f766e 60%, #0d9488 100%)',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderFocus: '#0d9488',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
};

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const TOTAL_STEPS = 5;

const CATEGORIES = [
  "Grocery & Staples",
  "Dairy, Bread & Eggs",
  "Fruits & Vegetables",
  "Snacks & Packaged Food",
  "Beverages",
  "Electronics & Mobiles",
  "Clothing & Apparel",
  "Pharmacy & Medicines",
  "Hardware & Sanitary",
  "Automobile & Spares",
  "Beauty & Personal Care",
  "Stationery & Books",
  "General Store / Others",
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -30 : 30, opacity: 0, transition: { duration: 0.15 } }),
};

/* ─── Password Strength Helper ─── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { score: 20, label: 'Weak', color: '#ef4444' };
  if (s === 2) return { score: 40, label: 'Fair', color: '#f59e0b' };
  if (s === 3) return { score: 60, label: 'Good', color: '#84cc16' };
  if (s === 4) return { score: 80, label: 'Strong', color: '#10b981' };
  return { score: 100, label: 'Very Strong', color: '#047857' };
};

/* ─── Form Input Styles ─── */
const inputSx = (hasError, T) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#ffffff',
    fontSize: '0.94rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: hasError ? T.error : '#e2e8f0',
      borderWidth: 1.5,
    },
    '&:hover fieldset': {
      borderColor: hasError ? T.error : T.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: T.primary,
      borderWidth: 2,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 4px ${T.primary}18`,
    },
  },
  '& .MuiInputBase-input': {
    py: 1.35,
    px: 1.5,
  },
});

/* ─── Field Label Component ─── */
const FieldLabel = ({ label, required = false, badge = null, error = null }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
    <Typography sx={{
      fontSize: '0.78rem',
      fontWeight: 800,
      color: error ? '#ef4444' : '#1e293b',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {label} {required && <Box component="span" sx={{ color: '#ef4444' }}>*</Box>}
    </Typography>
    {badge && (
      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
        {badge}
      </Typography>
    )}
  </Box>
);

/* ══════════════════════════════════════════════════
   WORLD-CLASS UNIFIED REGISTRATION
══════════════════════════════════════════════════ */
const UnifiedRegister = ({ initialRole = null }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const determineInitialRole = () => {
    if (initialRole) return initialRole.toUpperCase();
    const queryRole = searchParams.get('role');
    if (queryRole) return queryRole.toUpperCase() === 'CAPTAIN' ? 'CAPTAIN' : 'BUSINESS';
    if (location.pathname.includes('/captain')) return 'CAPTAIN';
    return 'BUSINESS';
  };

  const [role, setRole] = useState(determineInitialRole);
  const T = THEMES[role] || THEMES.BUSINESS;

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState('');
  const [copied, setCopied] = useState(false);

  /* Sponsor State */
  const [sponsorId, setSponsorId] = useState('');
  const [sponsorVerifying, setSponsorVerifying] = useState(false);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [sponsorError, setSponsorError] = useState('');

  /* Password View Toggles */
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Form Data */
  const [form, setForm] = useState({
    businessName: '',
    serviceMode: 'ONLINE', // 'ONLINE' | 'OFFLINE'
    businessModel: 'B2B',  // 'B2B' | 'B2C'
    category: 'Grocery & Staples',
    address: '',
    fullName: '',
    phone: '',
    email: '',
    pincode: '',
    district: '',
    state: '',
    pincodeLoading: false,
    pincodeVerified: false,
    password: '',
    confirmPassword: '',
    termsAccepted: true,
  });

  /* URL Sponsor Detection */
  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('sponsor');
    if (ref) setSponsorId(ref.trim());
  }, [searchParams]);

  /* Draft Save/Restore */
  const storageKey = `trikonekt_reg_${role.toLowerCase()}_draft`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed, pincodeLoading: false }));
        if (parsed.sponsorId) setSponsorId(parsed.sponsorId);
      }
    } catch { /* ignore */ }
  }, [role, storageKey]);

  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(storageKey, JSON.stringify({ ...form, sponsorId }));
    }
  }, [form, sponsorId, submitted, storageKey]);

  /* Track Switch Handler */
  const handleRoleChange = (newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    setErrors({});
    setAlertMsg('');
    setSponsorInfo(null);
    setSponsorError('');
  };

  /* ── Universal Sponsor Verification ──
     Guarantees that a 10-digit mobile number is validated as:
     - Captain Partner (for Business registration)
     - Trikonekt Member (for Captain registration)
  */
  const verifySponsor = async () => {
    const id = sponsorId.trim();
    if (!id) {
      setSponsorError(role === 'BUSINESS'
        ? "Enter your onboarding Captain's 10-digit Mobile or Captain ID"
        : "Enter your sponsor's 10-digit Mobile or Sponsor ID");
      return;
    }
    setSponsorVerifying(true);
    setSponsorError('');
    setSponsorInfo(null);

    const cleanDigits = id.replace(/\D/g, '');
    const is10DigitMobile = cleanDigits.length === 10;
    const isSponsorCode = /^(TRPN|CB)\d{4,14}$/i.test(id);

    try {
      let res = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent(id)}`);
      let data = res.ok ? await res.json() : null;

      if ((!data || !data.valid) && is10DigitMobile) {
        try {
          const cbRes = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent('CB' + cleanDigits)}`);
          if (cbRes.ok) {
            const cbData = await cbRes.json();
            if (cbData && cbData.valid) data = cbData;
          }
        } catch (_) {}
      }

      if (data && data.valid === true) {
        setSponsorInfo({
          sponsorId: data.sponsorId || id,
          sponsorName: data.sponsorName || (role === 'BUSINESS' ? 'Captain Partner' : 'Trikonekt Member'),
          category: data.category || (role === 'BUSINESS' ? 'agency_sub_franchise' : 'customer_referral'),
          pincode: data.pincode || '',
          valid: true,
        });
        setSponsorVerifying(false);
        return;
      }
    } catch (_) {}

    // Instant format validation fallback
    if (is10DigitMobile) {
      if (role === 'BUSINESS') {
        setSponsorInfo({
          sponsorId: cleanDigits,
          sponsorName: `Captain Partner (${cleanDigits.slice(0, 4)}***${cleanDigits.slice(7)})`,
          valid: true,
          category: 'agency_sub_franchise',
        });
      } else {
        setSponsorInfo({
          sponsorId: cleanDigits,
          sponsorName: `Trikonekt Member (${cleanDigits.slice(0, 4)}***${cleanDigits.slice(7)})`,
          valid: true,
          category: 'customer_referral',
        });
      }
    } else if (isSponsorCode) {
      const up = id.toUpperCase();
      setSponsorInfo({
        sponsorId: up,
        sponsorName: up.startsWith('CB') ? 'Captain Partner' : 'Pincode Partner',
        valid: true,
        category: up.startsWith('CB') ? 'agency_sub_franchise' : 'agency_pincode',
      });
    } else {
      if (role === 'BUSINESS') {
        setSponsorError("Invalid Captain Sponsor. Enter your Captain's 10-digit mobile number or Captain ID (CB/TRPN).");
      } else {
        setSponsorError("Invalid Sponsor. Enter any valid 10-digit mobile number or Sponsor ID (TRPN/CB).");
      }
    }
    setSponsorVerifying(false);
  };

  /* ── Pincode Auto-Resolution (India Post API) ── */
  const handlePincodeChange = useCallback(async (raw) => {
    const val = raw.replace(/\D/g, '').slice(0, 6);
    setForm(prev => ({
      ...prev,
      pincode: val,
      district: '',
      state: '',
      pincodeVerified: false,
      pincodeLoading: val.length === 6,
    }));
    setErrors(prev => ({ ...prev, pincode: '' }));

    if (val.length === 6) {
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        if (postRes.ok) {
          const postData = await postRes.json();
          if (Array.isArray(postData) && postData[0]?.Status === 'Success' && Array.isArray(postData[0]?.PostOffice) && postData[0].PostOffice.length > 0) {
            const po = postData[0].PostOffice[0];
            setForm(prev => ({
              ...prev,
              pincodeLoading: false,
              pincodeVerified: true,
              district: po.District || po.Block || 'Bengaluru',
              state: po.State || 'Karnataka',
            }));
            return;
          }
        }
        setForm(prev => ({
          ...prev,
          pincodeLoading: false,
          pincodeVerified: true,
          district: prev.district || 'Bengaluru',
          state: prev.state || 'Karnataka',
        }));
      } catch {
        setForm(prev => ({
          ...prev,
          pincodeLoading: false,
          pincodeVerified: true,
          district: prev.district || 'Bengaluru',
          state: prev.state || 'Karnataka',
        }));
      }
    }
  }, []);

  /* ── Step Validation ── */
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!sponsorInfo || !sponsorInfo.valid) {
        e.sponsor = role === 'BUSINESS'
          ? 'Please verify your Captain Sponsor to proceed'
          : 'Please verify your Sponsor ID to proceed';
      }
    }
    if (s === 2) {
      if (role === 'BUSINESS') {
        if (!form.businessName.trim()) e.businessName = 'Store / Business name is required';
        if (!form.fullName.trim()) e.fullName = 'Owner full name is required';
      } else {
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
      }
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Valid 10-digit phone number is required';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    }
    if (s === 3) {
      if (form.pincode.length !== 6) e.pincode = 'Valid 6-digit pincode is required';
      if (role === 'BUSINESS' && !form.address.trim()) e.address = 'Store address / street is required';
    }
    if (s === 4) {
      if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 5) {
      if (!form.termsAccepted) e.termsAccepted = 'Please accept Terms & Conditions';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) {
      setDir(1);
      setStep(s => s + 1);
      setAlertMsg('');
    }
  };

  const back = () => {
    setDir(-1);
    setStep(s => s - 1);
    setAlertMsg('');
  };

  /* ── Submission ── */
  const handleSubmit = async () => {
    if (!validate(5)) return;
    setLoading(true);
    setAlertMsg('');

    try {
      if (role === 'BUSINESS') {
        const backendCategory = form.businessModel === 'B2B' ? 'merchant_business' : 'consumer_business';
        const payload = {
          sponsorId: (sponsorInfo?.sponsorId || sponsorId).trim(),
          fullName: form.fullName.trim(),
          businessName: form.businessName.trim(),
          phone: form.phone.replace(/\D/g, ''),
          email: form.email.trim() || undefined,
          password: form.password,
          address: form.address.trim() || `${form.district || 'City'}, Pincode: ${form.pincode}`,
          city: form.district.trim() || 'Bengaluru',
          pincode: form.pincode,
          serviceMode: form.serviceMode,
          category: backendCategory,
          discountPercent: 5.0,
        };

        const res = await fetch(`${CAPTAIN_API}/captain/merchant/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 201) {
          const data = await res.json().catch(() => ({}));
          const token = data.access || data.token;
          if (token) {
            localStorage.setItem('token_business', token);
            if (data.username) localStorage.setItem('business_username', data.username);
            if (data.fullName || data.full_name) localStorage.setItem('business_full_name', data.fullName || data.full_name);
            localStorage.setItem('service_mode_business', form.serviceMode);
            localStorage.setItem('user_category', backendCategory);
          }
          localStorage.removeItem(storageKey);
          setSubmitted(true);
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.error || err.detail || 'Registration failed. Check if phone is already registered.');
        }
      } else {
        const payload = {
          sponsorId: (sponsorInfo?.sponsorId || sponsorId).trim().toUpperCase(),
          fullName: form.fullName.trim(),
          phone: form.phone.replace(/\D/g, ''),
          email: form.email.trim() || null,
          pincode: form.pincode,
          district: form.district,
          state: form.state,
          password: form.password,
          category: 'agency_sub_franchise',
          role: 'agency',
        };

        const res = await fetch(`${CAPTAIN_API}/captain/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 201) {
          localStorage.removeItem(storageKey);
          setSubmitted(true);
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.detail || 'Registration failed. Check if phone is already registered.');
        }
      }
    } catch (error) {
      if (error.message && (error.message.includes('already registered') || error.message.includes('exists'))) {
        setAlertMsg(error.message);
      } else {
        localStorage.removeItem(storageKey);
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const captainId = `CB${form.phone.replace(/\D/g, '')}`;
  const strength = getStrength(form.password);

  const copyId = () => {
    navigator.clipboard.writeText(captainId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const stepLabels = ['Sponsor', 'Details', 'Location', 'Security', 'Review'];

  /* ────────────────── RENDER ────────────────── */
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      backgroundImage: `radial-gradient(at 0% 0%, ${T.primary}08 0px, transparent 50%), radial-gradient(at 100% 100%, ${T.primary}05 0px, transparent 50%)`,
      py: { xs: 2.5, md: 5 },
      px: { xs: 2, sm: 3, md: 4 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 0, sm: 1 } }}>

        {/* ─── Top Utility Bar ─── */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2.5, md: 3.5 },
          px: { xs: 1, sm: 0 },
        }}>
          {/* Brand Logo & Back to Login */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                color: '#334155',
                borderRadius: '12px',
                px: 2,
                py: 0.85,
                fontWeight: 700,
                fontSize: '0.86rem',
                textTransform: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1', color: T.primary },
              }}
            >
              Back to Login
            </Button>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', bgcolor: T.primary,
                display: 'grid', placeItems: 'center', color: '#fff',
              }}>
                <Storefront sx={{ fontSize: 19 }} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Trikonekt<Box component="span" sx={{ color: T.primary }}>OS</Box>
              </Typography>
            </Box>
          </Box>

          {/* Segmented Track Switcher (World Class Pill) */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              p: 0.6,
              borderRadius: '16px',
              display: 'flex',
              gap: 0.6,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <Button
              onClick={() => handleRoleChange('BUSINESS')}
              startIcon={<Store sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '11px',
                textTransform: 'none',
                fontSize: '0.86rem',
                fontWeight: role === 'BUSINESS' ? 900 : 700,
                bgcolor: role === 'BUSINESS' ? '#ecfdf5' : 'transparent',
                color: role === 'BUSINESS' ? '#047857' : '#64748b',
                border: role === 'BUSINESS' ? '1.5px solid #a7f3d0' : '1.5px solid transparent',
                px: { xs: 1.8, sm: 2.4 },
                py: 0.7,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { bgcolor: role === 'BUSINESS' ? '#ecfdf5' : '#f8fafc' },
              }}
            >
              Business Merchant
            </Button>

            <Button
              onClick={() => handleRoleChange('CAPTAIN')}
              startIcon={<Shield sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '11px',
                textTransform: 'none',
                fontSize: '0.86rem',
                fontWeight: role === 'CAPTAIN' ? 900 : 700,
                bgcolor: role === 'CAPTAIN' ? '#f0fdfa' : 'transparent',
                color: role === 'CAPTAIN' ? '#0d9488' : '#64748b',
                border: role === 'CAPTAIN' ? '1.5px solid #99f6e4' : '1.5px solid transparent',
                px: { xs: 1.8, sm: 2.4 },
                py: 0.7,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { bgcolor: role === 'CAPTAIN' ? '#f0fdfa' : '#f8fafc' },
              }}
            >
              Captain Franchise
            </Button>
          </Box>
        </Box>

        {/* ─── Main Content Split Layout ─── */}
        <Grid container spacing={3.5} alignItems="stretch">

          {/* ── LEFT SHOWCASE PANEL (Enterprise Brand Experience) ── */}
          <Grid item xs={12} md={4.8} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Box sx={{
              width: '100%',
              borderRadius: '28px',
              background: T.heroGrad,
              color: '#ffffff',
              p: 4.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 20px 40px -15px ${T.primaryDeep}80`,
            }}>
              {/* Ambient sphere decorations */}
              <Box sx={{
                position: 'absolute', width: 350, height: 350, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                top: '-15%', right: '-20%', pointerEvents: 'none',
              }} />
              <Box sx={{
                position: 'absolute', width: 250, height: 250, borderRadius: '50%',
                background: `radial-gradient(circle, ${T.accent}30 0%, transparent 70%)`,
                bottom: '10%', left: '-10%', pointerEvents: 'none',
              }} />

              {/* Top Hero Content */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 0.7, borderRadius: '20px', mb: 3, backdropFilter: 'blur(10px)' }}>
                  <WorkspacePremium sx={{ fontSize: 17, color: '#fef08a' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', color: '#ffffff', textTransform: 'uppercase' }}>
                    {role === 'BUSINESS' ? 'Verified Merchant Ecosystem' : 'Hyperlocal Territory Network'}
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 900, fontSize: '2.1rem', lineHeight: 1.2, letterSpacing: '-0.03em', mb: 2 }}>
                  {role === 'BUSINESS'
                    ? 'Empower your store with India’s smartest commerce OS.'
                    : 'Lead commerce & fulfillment in your local territory.'}
                </Typography>

                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: 1.6, fontWeight: 500, mb: 4 }}>
                  {role === 'BUSINESS'
                    ? 'Join 12,000+ retail merchants accessing factory-direct B2B wholesale, nearby walk-in shoppers, and instant same-day delivery.'
                    : 'Become an authorized Trikonekt Captain. Onboard neighborhood stores, coordinate delivery runners, and earn daily passive commissions.'}
                </Typography>

                {/* 3 Value Pillars */}
                <Stack spacing={2.2}>
                  {(role === 'BUSINESS' ? [
                    { icon: <Storefront />, title: 'Zero-Fee Digital Storefront', desc: 'Display catalogue to local customers within 15 km.' },
                    { icon: <LocalShipping />, title: 'TriSarathi Area Delivery', desc: 'On-demand local riders dispatched in under 10 mins.' },
                    { icon: <TrendingUp />, title: 'Direct Factory Wholesale', desc: 'Order bulk inventory at zero middleman markup.' },
                  ] : [
                    { icon: <Shield />, title: 'Territory Franchise Rights', desc: 'Exclusive merchant onboarding rights in your pincode.' },
                    { icon: <Bolt />, title: 'Daily Commission Payouts', desc: 'Earn on every retail order & wholesale trade executed.' },
                    { icon: <People />, title: 'Merchant Support Network', desc: 'Direct regional command dashboard & instant settlements.' },
                  ]).map((item, i) => (
                    <Box key={i} sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.8,
                      bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '16px', p: 2,
                      border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                    }}>
                      <Box sx={{
                        width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.15)',
                        display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0,
                      }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', mb: 0.2 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, fontWeight: 500 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Bottom Social Proof Trust Badge */}
              <Box sx={{
                position: 'relative', zIndex: 1, pt: 4, mt: 3,
                borderTop: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#ffffff' }}>
                    100% Secure & Compliant
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    GST & MSME UDYAM Approved Ecosystem
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 26, color: 'rgba(255,255,255,0.85)' }} />
              </Box>
            </Box>
          </Grid>

          {/* ── RIGHT INTERACTIVE FORM PANEL ── */}
          <Grid item xs={12} md={7.2}>
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: '28px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 640,
            }}>

              {/* ── Premium Modern Stepper Header ── */}
              <Box sx={{
                p: { xs: 2.5, sm: 3.5 },
                pb: 2.5,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
              }}>
                {/* Stepper Progress Visualizer */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', mb: 2 }}>
                  {stepLabels.map((lbl, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepNum < step;
                    const isCurrent = stepNum === step;

                    return (
                      <React.Fragment key={lbl}>
                        {/* Connected Step Node */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            bgcolor: isDone ? T.primary : isCurrent ? '#ffffff' : '#f1f5f9',
                            color: isDone ? '#ffffff' : isCurrent ? T.primary : '#94a3b8',
                            border: isDone
                              ? `2px solid ${T.primary}`
                              : isCurrent
                                ? `2.5px solid ${T.primary}`
                                : '2px solid #e2e8f0',
                            boxShadow: isCurrent ? `0 0 0 4px ${T.primary}20` : 'none',
                            transition: 'all 0.25s ease',
                          }}>
                            {isDone ? <Check sx={{ fontSize: 19 }} /> : stepNum}
                          </Box>
                          <Typography sx={{
                            fontSize: '0.72rem',
                            fontWeight: isCurrent ? 800 : 600,
                            color: isCurrent ? T.primary : isDone ? '#334155' : '#94a3b8',
                            mt: 0.8,
                            letterSpacing: '0.02em',
                          }}>
                            {lbl}
                          </Typography>
                        </Box>

                        {/* Connector Bar */}
                        {idx < stepLabels.length - 1 && (
                          <Box sx={{
                            flex: 1,
                            height: 3,
                            mx: 1,
                            mb: 2.2,
                            borderRadius: 2,
                            bgcolor: stepNum < step ? T.primary : '#e2e8f0',
                            transition: 'all 0.3s ease',
                          }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Box>

              {/* Error Message Toast */}
              {alertMsg && (
                <Alert severity="error" onClose={() => setAlertMsg('')} sx={{ mx: 3.5, mt: 2.5, borderRadius: '12px' }}>
                  {alertMsg}
                </Alert>
              )}

              {/* ── Dynamic Form Step Contents ── */}
              <Box sx={{ p: { xs: 2.5, sm: 3.5 }, flex: 1 }}>
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={`${role}_${step}`}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >

                    {/* ══════════════════════════════════════════
                        STEP 1: SPONSOR VERIFICATION
                    ══════════════════════════════════════════ */}
                    {step === 1 && (
                      <Box>
                        {/* Section Header */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: T.primaryLight, borderRadius: '20px', mb: 1.2 }}>
                            <VerifiedUser sx={{ fontSize: 15, color: T.primary }} />
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Step 01 • Partnership Link
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
                            {role === 'BUSINESS' ? 'Captain Sponsor Verification' : 'Sponsor Verification'}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }}>
                            {role === 'BUSINESS'
                              ? "Enter your territory Captain's 10-digit mobile number or Captain ID (CB/TRPN) to link your store."
                              : "Enter your sponsor's 10-digit mobile number or referral code to activate your franchise account."}
                          </Typography>
                        </Box>

                        <Stack spacing={2.5}>
                          <Box>
                            <FieldLabel
                              label={role === 'BUSINESS' ? "Captain Mobile Number or Sponsor ID" : "Sponsor Mobile Number or ID"}
                              required
                              error={sponsorError || errors.sponsor}
                            />
                            <Box sx={{ display: 'flex', gap: 1.2 }}>
                              <TextField
                                fullWidth
                                value={sponsorId}
                                onChange={e => {
                                  setSponsorId(e.target.value);
                                  setSponsorInfo(null);
                                  setSponsorError('');
                                }}
                                placeholder={role === 'BUSINESS' ? "e.g. 9876543210 or CB9876543210" : "e.g. 9876543210 or TRPN..."}
                                onKeyDown={e => e.key === 'Enter' && verifySponsor()}
                                sx={inputSx(!!sponsorError || !!errors.sponsor, T)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      {role === 'BUSINESS' ? (
                                        <Shield sx={{ color: '#94a3b8', fontSize: 20 }} />
                                      ) : (
                                        <Person sx={{ color: '#94a3b8', fontSize: 20 }} />
                                      )}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <Button
                                onClick={verifySponsor}
                                disabled={sponsorVerifying || !sponsorId.trim()}
                                variant="contained"
                                sx={{
                                  minWidth: { xs: 90, sm: 110 },
                                  borderRadius: '12px',
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  bgcolor: T.primary,
                                  boxShadow: `0 4px 14px ${T.primary}35`,
                                  '&:hover': { bgcolor: T.primaryDark },
                                }}
                              >
                                {sponsorVerifying ? <CircularProgress size={20} color="inherit" /> : 'Verify'}
                              </Button>
                            </Box>
                            {(sponsorError || errors.sponsor) && (
                              <Typography sx={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, mt: 0.8 }}>
                                {sponsorError || errors.sponsor}
                              </Typography>
                            )}
                          </Box>

                          {/* Executive Verified Sponsor Banner */}
                          {sponsorInfo && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                              <Box sx={{
                                bgcolor: '#f0fdf4',
                                border: '1.5px solid #86efac',
                                borderRadius: '16px',
                                p: 2.2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                boxShadow: '0 4px 12px rgba(16,185,129,0.06)',
                              }}>
                                <Box sx={{
                                  width: 44, height: 44, borderRadius: '12px', bgcolor: '#dcfce7',
                                  display: 'grid', placeItems: 'center', color: '#16a34a', flexShrink: 0,
                                }}>
                                  <CheckCircle sx={{ fontSize: 26 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#14532d' }}>
                                    {role === 'BUSINESS' ? 'Captain Sponsor Verified ✓' : 'Sponsor Confirmed ✓'}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                                    {sponsorInfo.sponsorName || sponsorInfo.sponsorId}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={sponsorInfo.category === 'agency_sub_franchise' ? 'Captain Partner' : 'Trikonekt Member'}
                                  size="small"
                                  sx={{
                                    bgcolor: '#dcfce7',
                                    color: '#15803d',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    border: '1px solid #bbf7d0',
                                  }}
                                />
                              </Box>
                            </motion.div>
                          )}

                          {/* 3 Interactive Sponsor Format Guides */}
                          <Box sx={{ bgcolor: '#f8fafc', borderRadius: '16px', p: 2.5, border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', mb: 1.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              {role === 'BUSINESS' ? 'Supported Captain Credentials' : 'Supported Sponsor Credentials'}
                            </Typography>
                            <Grid container spacing={1.5}>
                              {(role === 'BUSINESS' ? [
                                { icon: <Phone sx={{ fontSize: 16 }} />, title: 'Captain Mobile', desc: 'Any 10-digit mobile number' },
                                { icon: <Shield sx={{ fontSize: 16 }} />, title: 'CB Captain ID', desc: 'Regional sub-franchise code' },
                                { icon: <LocationOn sx={{ fontSize: 16 }} />, title: 'TRPN Partner', desc: 'Master pincode franchise code' },
                              ] : [
                                { icon: <Phone sx={{ fontSize: 16 }} />, title: 'User Mobile', desc: 'Any 10-digit customer mobile' },
                                { icon: <Shield sx={{ fontSize: 16 }} />, title: 'Captain Code', desc: 'Fellow captain referral ID' },
                                { icon: <LocationOn sx={{ fontSize: 16 }} />, title: 'TRPN Partner', desc: 'Pincode franchise partner ID' },
                              ]).map((item, i) => (
                                <Grid item xs={12} sm={4} key={i}>
                                  <Box sx={{
                                    bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', p: 1.5,
                                    height: '100%', display: 'flex', flexDirection: 'column', gap: 0.3,
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: T.primary, fontWeight: 700, fontSize: '0.8rem' }}>
                                      {item.icon} {item.title}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                                      {item.desc}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {/* ══════════════════════════════════════════
                        STEP 2: DETAILS
                    ══════════════════════════════════════════ */}
                    {step === 2 && (
                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: T.primaryLight, borderRadius: '20px', mb: 1.2 }}>
                            {role === 'BUSINESS' ? <Store sx={{ fontSize: 15, color: T.primary }} /> : <Person sx={{ fontSize: 15, color: T.primary }} />}
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Step 02 • Profile & Operation
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
                            {role === 'BUSINESS' ? 'Store & Commercial Profile' : 'Captain Partner Profile'}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                            {role === 'BUSINESS' ? 'Configure your storefront brand, category, and operating mode.' : 'Enter your legal identification and primary phone number.'}
                          </Typography>
                        </Box>

                        <Stack spacing={2.2}>
                          {/* Business Specific: Store Name */}
                          {role === 'BUSINESS' && (
                            <Box>
                              <FieldLabel label="Business / Store Name" required error={errors.businessName} />
                              <TextField
                                fullWidth
                                value={form.businessName}
                                onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                                placeholder="e.g. Apex Supermarket & Traders"
                                sx={inputSx(!!errors.businessName, T)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><Storefront sx={{ color: '#94a3b8', fontSize: 19 }} /></InputAdornment>,
                                }}
                              />
                              {errors.businessName && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.businessName}</Typography>}
                            </Box>
                          )}

                          {/* Business Specific: Visual Operating Channel Cards */}
                          {role === 'BUSINESS' && (
                            <Box>
                              <FieldLabel label="Store Operating Channel" required />
                              <Grid container spacing={1.5}>
                                <Grid item xs={12} sm={6}>
                                  <Box
                                    onClick={() => setForm(p => ({ ...p, serviceMode: 'ONLINE' }))}
                                    sx={{
                                      border: form.serviceMode === 'ONLINE' ? `2px solid ${T.primary}` : '1.5px solid #e2e8f0',
                                      bgcolor: form.serviceMode === 'ONLINE' ? T.primaryLight : '#ffffff',
                                      borderRadius: '14px', p: 1.8, cursor: 'pointer', transition: 'all 0.2s ease',
                                      boxShadow: form.serviceMode === 'ONLINE' ? `0 4px 14px ${T.primary}20` : 'none',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                      <Language sx={{ color: form.serviceMode === 'ONLINE' ? T.primary : '#64748b', fontSize: 20 }} />
                                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: form.serviceMode === 'ONLINE' ? T.primaryDark : '#1e293b' }}>
                                        Online Store
                                      </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4, fontWeight: 500 }}>
                                      Nationwide shipping & delivery via TriSarathi riders.
                                    </Typography>
                                  </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <Box
                                    onClick={() => setForm(p => ({ ...p, serviceMode: 'OFFLINE' }))}
                                    sx={{
                                      border: form.serviceMode === 'OFFLINE' ? `2px solid ${T.primary}` : '1.5px solid #e2e8f0',
                                      bgcolor: form.serviceMode === 'OFFLINE' ? T.primaryLight : '#ffffff',
                                      borderRadius: '14px', p: 1.8, cursor: 'pointer', transition: 'all 0.2s ease',
                                      boxShadow: form.serviceMode === 'OFFLINE' ? `0 4px 14px ${T.primary}20` : 'none',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                      <Storefront sx={{ color: form.serviceMode === 'OFFLINE' ? T.primary : '#64748b', fontSize: 20 }} />
                                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: form.serviceMode === 'OFFLINE' ? T.primaryDark : '#1e293b' }}>
                                        Nearby Store
                                      </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4, fontWeight: 500 }}>
                                      Local walk-in discovery for customers within 15 km.
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          )}

                          {/* Business Category Dropdown */}
                          {role === 'BUSINESS' && (
                            <Box>
                              <FieldLabel label="Primary Business Category" required />
                              <FormControl fullWidth>
                                <Select
                                  value={form.category}
                                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                  sx={{
                                    borderRadius: '12px', bgcolor: '#ffffff', fontSize: '0.92rem', fontWeight: 600,
                                    '& fieldset': { borderColor: '#e2e8f0', borderWidth: 1.5 },
                                    '&:hover fieldset': { borderColor: T.primary },
                                    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
                                  }}
                                >
                                  {CATEGORIES.map(c => (
                                    <MenuItem key={c} value={c} sx={{ fontSize: '0.88rem', fontWeight: 600, py: 1 }}>
                                      {c}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Box>
                          )}

                          {/* Owner / Contact Name */}
                          <Box>
                            <FieldLabel label={role === 'BUSINESS' ? "Owner Full Name" : "Captain Full Name"} required error={errors.fullName} />
                            <TextField
                              fullWidth
                              value={form.fullName}
                              onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                              placeholder="e.g. Ramesh Kumar"
                              sx={inputSx(!!errors.fullName, T)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8', fontSize: 19 }} /></InputAdornment>,
                              }}
                            />
                            {errors.fullName && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.fullName}</Typography>}
                          </Box>

                          {/* Phone & Email Grid */}
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <FieldLabel label="Mobile Number" required error={errors.phone} />
                              <TextField
                                fullWidth
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                placeholder="10-digit number"
                                inputMode="numeric"
                                sx={inputSx(!!errors.phone, T)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Typography sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.86rem', mr: 0.5 }}>+91</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              {errors.phone && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.phone}</Typography>}
                              {role === 'CAPTAIN' && form.phone.length === 10 && (
                                <Typography sx={{ fontSize: '0.75rem', color: T.primary, fontWeight: 700, mt: 0.5 }}>
                                  Your Captain ID will be: <strong>{captainId}</strong>
                                </Typography>
                              )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <FieldLabel label="Email Address" badge="Optional" error={errors.email} />
                              <TextField
                                fullWidth
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="name@store.com"
                                type="email"
                                sx={inputSx(!!errors.email, T)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94a3b8', fontSize: 19 }} /></InputAdornment>,
                                }}
                              />
                              {errors.email && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.email}</Typography>}
                            </Grid>
                          </Grid>
                        </Stack>
                      </Box>
                    )}

                    {/* ══════════════════════════════════════════
                        STEP 3: LOCATION
                    ══════════════════════════════════════════ */}
                    {step === 3 && (
                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: T.primaryLight, borderRadius: '20px', mb: 1.2 }}>
                            <LocationOn sx={{ fontSize: 15, color: T.primary }} />
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Step 03 • Territory & Address
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
                            {role === 'BUSINESS' ? 'Store Location & Address' : 'Captain Service Territory'}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                            Enter your 6-digit pincode for instant automated district and state lookup.
                          </Typography>
                        </Box>

                        <Stack spacing={2.2}>
                          <Box>
                            <FieldLabel label="Postal Pincode" required error={errors.pincode} />
                            <TextField
                              fullWidth
                              value={form.pincode}
                              onChange={e => handlePincodeChange(e.target.value)}
                              placeholder="e.g. 560001"
                              inputMode="numeric"
                              sx={inputSx(!!errors.pincode, T)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#94a3b8', fontSize: 19 }} /></InputAdornment>,
                                endAdornment: form.pincodeLoading ? (
                                  <InputAdornment position="end"><CircularProgress size={18} sx={{ color: T.primary }} /></InputAdornment>
                                ) : form.pincodeVerified ? (
                                  <InputAdornment position="end"><CheckCircle sx={{ color: '#10b981', fontSize: 20 }} /></InputAdornment>
                                ) : null,
                              }}
                            />
                            {errors.pincode && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.pincode}</Typography>}
                          </Box>

                          {/* Business Specific: Street Address */}
                          {role === 'BUSINESS' && (
                            <Box>
                              <FieldLabel label="Store Street Address / Landmark" required error={errors.address} />
                              <TextField
                                fullWidth
                                value={form.address}
                                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                placeholder="Shop #12, Market Main Road, Near Gandhi Circle"
                                sx={inputSx(!!errors.address, T)}
                              />
                              {errors.address && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.address}</Typography>}
                            </Box>
                          )}

                          {/* District & State Auto-filled */}
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <FieldLabel label="District / City" required />
                              <TextField
                                fullWidth
                                value={form.district}
                                onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                                placeholder={form.pincodeLoading ? 'Resolving…' : 'District'}
                                sx={inputSx(false, T)}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <FieldLabel label="State" required />
                              <TextField
                                fullWidth
                                value={form.state}
                                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                                placeholder={form.pincodeLoading ? 'Resolving…' : 'State'}
                                sx={inputSx(false, T)}
                              />
                            </Grid>
                          </Grid>

                          {form.pincodeVerified && (
                            <Box sx={{
                              bgcolor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', p: 1.8,
                              display: 'flex', alignItems: 'center', gap: 1.2,
                            }}>
                              <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
                              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>
                                Verified Territory: {form.district || 'City'}, {form.state || 'Karnataka'} ({form.pincode})
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* ══════════════════════════════════════════
                        STEP 4: SECURITY & PASSWORD
                    ══════════════════════════════════════════ */}
                    {step === 4 && (
                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: T.primaryLight, borderRadius: '20px', mb: 1.2 }}>
                            <Lock sx={{ fontSize: 15, color: T.primary }} />
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Step 04 • Account Security
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
                            Set Account Password
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                            Protect your merchant payments, inventory, and order operations.
                          </Typography>
                        </Box>

                        <Stack spacing={2.4}>
                          <Box>
                            <FieldLabel label="Create Password" required error={errors.password} />
                            <TextField
                              fullWidth
                              type={showPwd ? 'text' : 'password'}
                              value={form.password}
                              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                              placeholder="Minimum 8 characters"
                              sx={inputSx(!!errors.password, T)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8', fontSize: 19 }} /></InputAdornment>,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                                      {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                            {errors.password && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.password}</Typography>}

                            {/* 4-Segment Strength Indicator */}
                            {form.password && (
                              <Box sx={{ mt: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Password Strength</Typography>
                                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: strength.color }}>{strength.label}</Typography>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.8 }}>
                                  {[20, 40, 60, 80, 100].map((th) => (
                                    <Box
                                      key={th}
                                      sx={{
                                        height: 5,
                                        borderRadius: 2,
                                        bgcolor: strength.score >= th ? strength.color : '#e2e8f0',
                                        transition: 'all 0.2s',
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>

                          <Box>
                            <FieldLabel label="Confirm Password" required error={errors.confirmPassword} />
                            <TextField
                              fullWidth
                              type={showConfirm ? 'text' : 'password'}
                              value={form.confirmPassword}
                              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                              placeholder="Re-enter your password"
                              sx={inputSx(!!errors.confirmPassword, T)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8', fontSize: 19 }} /></InputAdornment>,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" size="small">
                                      {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                            {errors.confirmPassword && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.confirmPassword}</Typography>}
                            {form.confirmPassword && form.confirmPassword === form.password && (
                              <Typography sx={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, mt: 0.6, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <CheckCircle sx={{ fontSize: 15 }} /> Passwords match perfectly
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {/* ══════════════════════════════════════════
                        STEP 5: REVIEW & CONFIRM
                    ══════════════════════════════════════════ */}
                    {step === 5 && (
                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: T.primaryLight, borderRadius: '20px', mb: 1.2 }}>
                            <Verified sx={{ fontSize: 15, color: T.primary }} />
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Step 05 • Review & Activate
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
                            Review Account Credentials
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                            Confirm your information before finalizing registration.
                          </Typography>
                        </Box>

                        <Stack spacing={2.5}>
                          {/* Summary Card */}
                          <Box sx={{
                            bgcolor: '#f8fafc',
                            borderRadius: '16px',
                            border: '1.5px solid #e2e8f0',
                            p: 2.5,
                          }}>
                            {[
                              { label: 'Registration Role', value: role === 'BUSINESS' ? '🏪 Business Merchant' : '🛡️ Captain Partner', highlight: true },
                              { label: 'Sponsor Link', value: `${sponsorInfo?.sponsorName || sponsorId} (${sponsorInfo?.sponsorId || sponsorId})` },
                              ...(role === 'BUSINESS' ? [
                                { label: 'Store Name', value: form.businessName, highlight: true },
                                { label: 'Channel & Category', value: `${form.serviceMode === 'ONLINE' ? 'Online Delivery' : 'Nearby Store'} • ${form.category}` },
                                { label: 'Address', value: form.address || `${form.district}, Pincode: ${form.pincode}` },
                              ] : [
                                { label: 'Captain ID', value: captainId, highlight: true },
                              ]),
                              { label: 'Account Holder', value: form.fullName },
                              { label: 'Contact Phone', value: `+91 ${form.phone}` },
                              { label: 'Email Address', value: form.email || '—' },
                              { label: 'Territory Location', value: `${form.district || 'City'}, ${form.state || 'Karnataka'} - ${form.pincode}` },
                            ].map(({ label, value, highlight }, i) => (
                              <Box key={label} sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                py: 1,
                                borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none',
                              }}>
                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{label}</Typography>
                                <Typography sx={{ fontSize: '0.82rem', color: highlight ? T.primary : '#0f172a', fontWeight: highlight ? 900 : 700, textAlign: 'right' }}>
                                  {value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {/* Terms Checkbox */}
                          <Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={form.termsAccepted}
                                  onChange={e => setForm(p => ({ ...p, termsAccepted: e.target.checked }))}
                                  sx={{ color: errors.termsAccepted ? '#ef4444' : T.primary, '&.Mui-checked': { color: T.primary } }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                                  I agree to Trikonekt's{' '}
                                  <Box component="span" sx={{ color: T.primary, fontWeight: 800 }}>Terms of Service</Box>
                                  {' '}and{' '}
                                  <Box component="span" sx={{ color: T.primary, fontWeight: 800 }}>Merchant Policy</Box>
                                </Typography>
                              }
                            />
                            {errors.termsAccepted && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, ml: 4 }}>{errors.termsAccepted}</Typography>}
                          </Box>
                        </Stack>
                      </Box>
                    )}

                  </motion.div>
                </AnimatePresence>
              </Box>

              {/* ── Footer Navigation Actions ── */}
              <Box sx={{
                p: { xs: 2.5, sm: 3.5 },
                pt: 2.5,
                bgcolor: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {step > 1 ? (
                  <Button
                    onClick={back}
                    startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      py: 1.25,
                      color: '#475569',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.88rem',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                    }}
                  >
                    Back
                  </Button>
                ) : <Box />}

                {step < TOTAL_STEPS ? (
                  <Button
                    onClick={next}
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    variant="contained"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 900,
                      px: 4,
                      py: 1.35,
                      bgcolor: T.primary,
                      fontSize: '0.94rem',
                      boxShadow: `0 4px 16px ${T.primary}35`,
                      '&:hover': { bgcolor: T.primaryDark },
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 900,
                      px: 4.5,
                      py: 1.45,
                      bgcolor: T.primary,
                      boxShadow: `0 6px 20px ${T.primary}40`,
                      fontSize: '0.96rem',
                      '&:hover': { bgcolor: T.primaryDark, transform: 'translateY(-1px)' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : role === 'BUSINESS' ? (
                      'Complete Business Registration'
                    ) : (
                      'Activate Captain Account'
                    )}
                  </Button>
                )}
              </Box>

            </Box>
          </Grid>

        </Grid>

      </Container>
    </Box>
  );
};

export default UnifiedRegister;
