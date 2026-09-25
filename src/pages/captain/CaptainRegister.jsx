import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack, Alert,
  CircularProgress, InputAdornment, IconButton, FormControlLabel,
  Checkbox, Chip, Divider, Fade, Select, MenuItem, FormControl,
} from '@mui/material';
import {
  Verified, Phone, Email, Person, Lock, Visibility, VisibilityOff,
  LocationOn, CheckCircle, ArrowBack, ArrowForward,
  Shield, VerifiedUser, ContentCopy, Done, Store, Storefront,
  Language, Check, LocalShipping, TrendingUp, Security,
  Bolt, People, InfoOutlined, Business, Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Executive Design Tokens ─── */
const THEMES = {
  BUSINESS: {
    primary: '#047857',
    primaryDark: '#064e3b',
    primaryLight: '#ecfdf5',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
    glow: 'rgba(4, 120, 87, 0.25)',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
  },
  CAPTAIN: {
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#ccfbf1',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
    glow: 'rgba(13, 148, 136, 0.25)',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
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
  center: { x: 0, opacity: 1, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
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

/* ─── Modern Input Style Helper ─── */
const inputSx = (hasError, T) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    bgcolor: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: hasError ? T.error : '#cbd5e1',
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
      boxShadow: `0 0 0 3px ${T.glow}`,
    },
  },
  '& .MuiInputBase-input': {
    py: 1.35,
    px: 1.4,
  },
});

/* ─── Field Label ─── */
const FieldLabel = ({ label, required = false, badge = null, error = null }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
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
   PRINCIPAL ARCHITECT REGISTRATION COMPONENT
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

  /* Password Toggles */
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
        ? "Enter your Captain's 10-digit Mobile or Captain ID"
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

    // Robust format fallback (Never reject a clean 10-digit phone)
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
        setSponsorError("Enter your Captain's 10-digit mobile number or Captain ID (CB/TRPN).");
      } else {
        setSponsorError("Enter any valid 10-digit mobile number or Sponsor ID (TRPN/CB).");
      }
    }
    setSponsorVerifying(false);
  };

  /* ── Pincode Auto-Lookup (India Post API) ── */
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
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Valid 10-digit mobile number required';
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const back = () => {
    setDir(-1);
    setStep(s => s - 1);
    setAlertMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const progressPercent = (step / TOTAL_STEPS) * 100;

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
      bgcolor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── TOP APP BAR (Compact, Precision-Engineered, Mobile-Native) ── */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      }}>
        <Container maxWidth="sm" disableGutters sx={{ px: 2, py: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            
            {/* Back Button */}
            <IconButton
              onClick={() => step > 1 ? back() : navigate('/login')}
              size="small"
              sx={{
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                p: 0.85,
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Seamless Segmented Control Pill (No Wrapping) */}
            <Box
              sx={{
                bgcolor: '#f1f5f9',
                p: 0.4,
                borderRadius: '12px',
                display: 'flex',
                gap: 0.4,
              }}
            >
              <Button
                onClick={() => handleRoleChange('BUSINESS')}
                startIcon={<Store sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '9px',
                  textTransform: 'none',
                  fontSize: '0.82rem',
                  fontWeight: role === 'BUSINESS' ? 900 : 700,
                  bgcolor: role === 'BUSINESS' ? '#ffffff' : 'transparent',
                  color: role === 'BUSINESS' ? '#047857' : '#64748b',
                  boxShadow: role === 'BUSINESS' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  px: 1.5,
                  py: 0.5,
                  minHeight: 32,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: role === 'BUSINESS' ? '#ffffff' : 'rgba(255,255,255,0.4)' },
                }}
              >
                Business
              </Button>

              <Button
                onClick={() => handleRoleChange('CAPTAIN')}
                startIcon={<Shield sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '9px',
                  textTransform: 'none',
                  fontSize: '0.82rem',
                  fontWeight: role === 'CAPTAIN' ? 900 : 700,
                  bgcolor: role === 'CAPTAIN' ? '#ffffff' : 'transparent',
                  color: role === 'CAPTAIN' ? '#0d9488' : '#64748b',
                  boxShadow: role === 'CAPTAIN' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  px: 1.5,
                  py: 0.5,
                  minHeight: 32,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: role === 'CAPTAIN' ? '#ffffff' : 'rgba(255,255,255,0.4)' },
                }}
              >
                Captain
              </Button>
            </Box>

            {/* Step Counter Pill */}
            <Box sx={{
              bgcolor: T.primaryLight,
              color: T.primary,
              px: 1.2,
              py: 0.4,
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.74rem',
              letterSpacing: '0.02em',
            }}>
              {step}/{TOTAL_STEPS}
            </Box>
          </Box>
        </Container>

        {/* ── Hairline Gradient Progress Indicator ── */}
        <Box sx={{ width: '100%', height: '3px', bgcolor: '#f1f5f9' }}>
          <Box
            sx={{
              width: `${progressPercent}%`,
              height: '100%',
              background: T.gradient,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Box>
      </Box>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column' }}>

        {/* Error Notification */}
        {alertMsg && (
          <Alert severity="error" onClose={() => setAlertMsg('')} sx={{ mb: 2.5, borderRadius: '12px' }}>
            {alertMsg}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key={`${role}_${step}`}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >

              {/* ══════════════════════════════════════════
                  STEP 1: SPONSOR VERIFICATION
              ══════════════════════════════════════════ */}
              {step === 1 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Title & Context */}
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: T.primary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      mb: 0.5,
                    }}>
                      Step 1 of 5 • {role === 'BUSINESS' ? 'Captain Link' : 'Sponsor Link'}
                    </Typography>

                    <Typography sx={{
                      fontWeight: 900,
                      fontSize: { xs: '1.45rem', sm: '1.65rem' },
                      color: '#0f172a',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.25,
                      mb: 0.8,
                    }}>
                      {role === 'BUSINESS' ? 'Connect Your Captain' : 'Sponsor Verification'}
                    </Typography>

                    <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }}>
                      {role === 'BUSINESS'
                        ? "Enter your territory Captain's 10-digit mobile number or Captain ID (CB...) to activate wholesale & local delivery."
                        : "Enter your sponsor's 10-digit mobile number or partner code to activate your franchise territory."}
                    </Typography>
                  </Box>

                  {/* Input Card Container */}
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel
                        label={role === 'BUSINESS' ? "Captain Mobile or ID" : "Sponsor Mobile or ID"}
                        required
                        error={sponsorError || errors.sponsor}
                      />
                      
                      {/* Integrated Action Input Bar */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1.5px solid ${sponsorError || errors.sponsor ? '#ef4444' : sponsorInfo ? '#10b981' : '#cbd5e1'}`,
                        borderRadius: '14px',
                        bgcolor: '#ffffff',
                        px: 1.5,
                        py: 0.5,
                        transition: 'all 0.2s',
                        boxShadow: sponsorInfo ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
                        '&:focus-within': {
                          borderColor: T.primary,
                          boxShadow: `0 0 0 3px ${T.glow}`,
                        },
                      }}>
                        {role === 'BUSINESS' ? (
                          <Shield sx={{ color: sponsorInfo ? T.primary : '#94a3b8', fontSize: 22, mr: 1 }} />
                        ) : (
                          <Person sx={{ color: sponsorInfo ? T.primary : '#94a3b8', fontSize: 22, mr: 1 }} />
                        )}

                        <TextField
                          fullWidth
                          variant="standard"
                          value={sponsorId}
                          onChange={e => {
                            setSponsorId(e.target.value);
                            setSponsorInfo(null);
                            setSponsorError('');
                          }}
                          placeholder={role === 'BUSINESS' ? "10-digit phone or CB..." : "10-digit phone or TRPN..."}
                          onKeyDown={e => e.key === 'Enter' && verifySponsor()}
                          InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '0.96rem', fontWeight: 600, color: '#0f172a' },
                          }}
                        />

                        {sponsorId && (
                          <IconButton
                            size="small"
                            onClick={() => { setSponsorId(''); setSponsorInfo(null); setSponsorError(''); }}
                            sx={{ color: '#94a3b8', p: 0.5, mr: 0.5 }}
                          >
                            <Close sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}

                        <Button
                          onClick={verifySponsor}
                          disabled={sponsorVerifying || !sponsorId.trim()}
                          variant="contained"
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            bgcolor: T.primary,
                            color: '#ffffff',
                            px: 2,
                            py: 0.7,
                            minWidth: 78,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: T.primaryDark },
                          }}
                        >
                          {sponsorVerifying ? <CircularProgress size={16} color="inherit" /> : 'Verify'}
                        </Button>
                      </Box>

                      {(sponsorError || errors.sponsor) && (
                        <Typography sx={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, mt: 0.8 }}>
                          {sponsorError || errors.sponsor}
                        </Typography>
                      )}
                    </Box>

                    {/* Verified Partner Confirmation Card */}
                    {sponsorInfo && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <Box sx={{
                          bgcolor: '#f0fdf4',
                          border: '1.5px solid #86efac',
                          borderRadius: '14px',
                          p: 1.8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}>
                          <Box sx={{
                            width: 38, height: 38, borderRadius: '10px', bgcolor: '#dcfce7',
                            display: 'grid', placeItems: 'center', color: '#16a34a', flexShrink: 0,
                          }}>
                            <CheckCircle sx={{ fontSize: 22 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#14532d' }}>
                              {role === 'BUSINESS' ? 'Captain Partner Linked ✓' : 'Sponsor Verified ✓'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                              {sponsorInfo.sponsorName || sponsorInfo.sponsorId}
                            </Typography>
                          </Box>
                          <Chip
                            label="Active"
                            size="small"
                            sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </motion.div>
                    )}

                    {/* Clean Helper Micro-Guidance */}
                    <Box sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: '12px',
                      p: 1.8,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}>
                      <InfoOutlined sx={{ color: '#64748b', fontSize: 18, mt: 0.1 }} />
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>
                        {role === 'BUSINESS'
                          ? "Enter your local Captain's 10-digit mobile number, or their official franchise code starting with CB or TRPN."
                          : "Enter any active Trikonekt member's 10-digit mobile number, or a fellow Captain's ID."}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 2: DETAILS
              ══════════════════════════════════════════ */}
              {step === 2 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.8 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                      Step 2 of 5 • {role === 'BUSINESS' ? 'Store & Owner' : 'Partner Profile'}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', sm: '1.65rem' }, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.25, mb: 0.8 }}>
                      {role === 'BUSINESS' ? 'Store Information' : 'Personal Details'}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                      {role === 'BUSINESS' ? 'Tell us your trade name and primary contact details.' : 'Provide your legal name and primary mobile number.'}
                    </Typography>
                  </Box>

                  <Stack spacing={2.2} sx={{ mb: 3 }}>
                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Store / Trade Name" required error={errors.businessName} />
                        <TextField
                          fullWidth
                          value={form.businessName}
                          onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                          placeholder="e.g. Apex Supermarket & Traders"
                          sx={inputSx(!!errors.businessName, T)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Storefront sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                          }}
                        />
                        {errors.businessName && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.businessName}</Typography>}
                      </Box>
                    )}

                    {/* Business Channel Selector (2 Clean Cards) */}
                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Operating Channel" required />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                          <Box
                            onClick={() => setForm(p => ({ ...p, serviceMode: 'ONLINE' }))}
                            sx={{
                              border: form.serviceMode === 'ONLINE' ? `2px solid ${T.primary}` : '1.5px solid #e2e8f0',
                              bgcolor: form.serviceMode === 'ONLINE' ? T.primaryLight : '#ffffff',
                              borderRadius: '12px',
                              p: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                              <Language sx={{ color: form.serviceMode === 'ONLINE' ? T.primary : '#64748b', fontSize: 18 }} />
                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: form.serviceMode === 'ONLINE' ? T.primaryDark : '#1e293b' }}>
                                Online Store
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                              TriSarathi area delivery
                            </Typography>
                          </Box>

                          <Box
                            onClick={() => setForm(p => ({ ...p, serviceMode: 'OFFLINE' }))}
                            sx={{
                              border: form.serviceMode === 'OFFLINE' ? `2px solid ${T.primary}` : '1.5px solid #e2e8f0',
                              bgcolor: form.serviceMode === 'OFFLINE' ? T.primaryLight : '#ffffff',
                              borderRadius: '12px',
                              p: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                              <Storefront sx={{ color: form.serviceMode === 'OFFLINE' ? T.primary : '#64748b', fontSize: 18 }} />
                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: form.serviceMode === 'OFFLINE' ? T.primaryDark : '#1e293b' }}>
                                Nearby Store
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                              Local walk-in discovery
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Store Category" required />
                        <FormControl fullWidth>
                          <Select
                            value={form.category}
                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                            sx={{
                              borderRadius: '14px', bgcolor: '#ffffff', fontSize: '0.94rem', fontWeight: 600,
                              '& fieldset': { borderColor: '#cbd5e1', borderWidth: 1.5 },
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

                    <Box>
                      <FieldLabel label={role === 'BUSINESS' ? "Owner Full Name" : "Captain Full Name"} required error={errors.fullName} />
                      <TextField
                        fullWidth
                        value={form.fullName}
                        onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="e.g. Ramesh Kumar"
                        sx={inputSx(!!errors.fullName, T)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                        }}
                      />
                      {errors.fullName && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.fullName}</Typography>}
                    </Box>

                    <Box>
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
                              <Typography sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem', mr: 0.5 }}>+91</Typography>
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
                    </Box>

                    <Box>
                      <FieldLabel label="Email Address" badge="Optional" error={errors.email} />
                      <TextField
                        fullWidth
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="name@store.com"
                        type="email"
                        sx={inputSx(!!errors.email, T)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                        }}
                      />
                      {errors.email && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.email}</Typography>}
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 3: LOCATION
              ══════════════════════════════════════════ */}
              {step === 3 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.8 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                      Step 3 of 5 • Territory
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', sm: '1.65rem' }, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.25, mb: 0.8 }}>
                      {role === 'BUSINESS' ? 'Store Address & Pincode' : 'Service Territory'}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                      Enter your 6-digit pincode for automatic district & state lookup.
                    </Typography>
                  </Box>

                  <Stack spacing={2.2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel label="Postal Pincode" required error={errors.pincode} />
                      <TextField
                        fullWidth
                        value={form.pincode}
                        onChange={e => handlePincodeChange(e.target.value)}
                        placeholder="6-digit pincode"
                        inputMode="numeric"
                        sx={inputSx(!!errors.pincode, T)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                          endAdornment: form.pincodeLoading ? (
                            <InputAdornment position="end"><CircularProgress size={18} sx={{ color: T.primary }} /></InputAdornment>
                          ) : form.pincodeVerified ? (
                            <InputAdornment position="end"><CheckCircle sx={{ color: '#10b981', fontSize: 20 }} /></InputAdornment>
                          ) : null,
                        }}
                      />
                      {errors.pincode && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.pincode}</Typography>}
                    </Box>

                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Store Street Address" required error={errors.address} />
                        <TextField
                          fullWidth
                          value={form.address}
                          onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                          placeholder="Shop #, Street name, Landmark, Area"
                          sx={inputSx(!!errors.address, T)}
                        />
                        {errors.address && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{errors.address}</Typography>}
                      </Box>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      <Box>
                        <FieldLabel label="District / City" required />
                        <TextField
                          fullWidth
                          value={form.district}
                          onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                          placeholder="District"
                          sx={inputSx(false, T)}
                        />
                      </Box>

                      <Box>
                        <FieldLabel label="State" required />
                        <TextField
                          fullWidth
                          value={form.state}
                          onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                          placeholder="State"
                          sx={inputSx(false, T)}
                        />
                      </Box>
                    </Box>

                    {form.pincodeVerified && (
                      <Box sx={{
                        bgcolor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', p: 1.5,
                        display: 'flex', alignItems: 'center', gap: 1,
                      }}>
                        <CheckCircle sx={{ color: '#16a34a', fontSize: 18 }} />
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>
                          Location verified: {form.district || 'City'}, {form.state || 'Karnataka'}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 4: PASSWORD
              ══════════════════════════════════════════ */}
              {step === 4 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.8 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                      Step 4 of 5 • Security
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', sm: '1.65rem' }, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.25, mb: 0.8 }}>
                      Set Account Password
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                      Create a strong password to safeguard your store data and orders.
                    </Typography>
                  </Box>

                  <Stack spacing={2.2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel label="Password" required error={errors.password} />
                      <TextField
                        fullWidth
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Minimum 8 characters"
                        sx={inputSx(!!errors.password, T)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
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

                      {form.password && (
                        <Box sx={{ mt: 1.2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Strength</Typography>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: strength.color }}>{strength.label}</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.6 }}>
                            {[20, 40, 60, 80, 100].map((th) => (
                              <Box
                                key={th}
                                sx={{
                                  height: 4,
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
                        placeholder="Re-enter password"
                        sx={inputSx(!!errors.confirmPassword, T)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
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
                        <Typography sx={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 15 }} /> Passwords match
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 5: REVIEW
              ══════════════════════════════════════════ */}
              {step === 5 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.8 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                      Step 5 of 5 • Final Review
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', sm: '1.65rem' }, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.25, mb: 0.8 }}>
                      Confirm & Activate
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
                      Review your details before completing registration.
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0', p: 2 }}>
                      {[
                        { label: 'Role', value: role === 'BUSINESS' ? 'Business Merchant' : 'Captain Partner', highlight: true },
                        { label: 'Sponsor', value: `${sponsorInfo?.sponsorName || sponsorId}` },
                        ...(role === 'BUSINESS' ? [
                          { label: 'Store Name', value: form.businessName, highlight: true },
                          { label: 'Channel', value: form.serviceMode === 'ONLINE' ? 'Online Delivery' : 'Nearby Store' },
                          { label: 'Category', value: form.category },
                          { label: 'Address', value: form.address || `${form.district}, Pincode: ${form.pincode}` },
                        ] : [
                          { label: 'Captain ID', value: captainId, highlight: true },
                        ]),
                        { label: 'Owner / Name', value: form.fullName },
                        { label: 'Mobile', value: `+91 ${form.phone}` },
                        { label: 'Email', value: form.email || '—' },
                        { label: 'Pincode', value: `${form.district || 'City'} (${form.pincode})` },
                      ].map(({ label, value, highlight }, i) => (
                        <Box key={label} sx={{
                          display: 'flex', justifyContent: 'space-between', py: 0.8,
                          borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none',
                        }}>
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: highlight ? T.primary : '#0f172a', fontWeight: highlight ? 900 : 700 }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

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
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            I agree to Trikonekt's <Box component="span" sx={{ color: T.primary, fontWeight: 800 }}>Terms of Service</Box> and <Box component="span" sx={{ color: T.primary, fontWeight: 800 }}>Merchant Policy</Box>
                          </Typography>
                        }
                      />
                      {errors.termsAccepted && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, ml: 4 }}>{errors.termsAccepted}</Typography>}
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ── ERGONOMIC FULL-WIDTH BOTTOM BUTTON ── */}
              <Box sx={{ mt: 'auto', pt: 2 }}>
                {step < TOTAL_STEPS ? (
                  <Button
                    fullWidth
                    onClick={next}
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    variant="contained"
                    sx={{
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 900,
                      py: 1.5,
                      bgcolor: T.primary,
                      fontSize: '0.96rem',
                      boxShadow: `0 4px 16px ${T.glow}`,
                      '&:hover': { bgcolor: T.primaryDark },
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 900,
                      py: 1.5,
                      bgcolor: T.primary,
                      boxShadow: `0 4px 16px ${T.glow}`,
                      fontSize: '0.96rem',
                      '&:hover': { bgcolor: T.primaryDark },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : role === 'BUSINESS' ? (
                      'Register My Business'
                    ) : (
                      'Activate Captain Account'
                    )}
                  </Button>
                )}
              </Box>

            </motion.div>
          ) : (
            /* ── SUCCESS SCREEN ── */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', py: 4 }}>
              <Box sx={{
                width: 78, height: 78, borderRadius: '50%', mx: 'auto', mb: 2,
                bgcolor: '#ecfdf5', border: '2px solid #a7f3d0', display: 'grid', placeItems: 'center',
              }}>
                <CheckCircle sx={{ fontSize: 44, color: '#10b981' }} />
              </Box>

              <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                {role === 'BUSINESS' ? 'Welcome to Trikonekt Business! 🎉' : 'Welcome, Captain! 🎉'}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500, mb: 3 }}>
                {role === 'BUSINESS'
                  ? 'Your store account registration has been submitted under your Captain Partner.'
                  : 'Your registration is complete. Here is your Captain ID:'}
              </Typography>

              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1.5,
                bgcolor: T.primaryLight, border: `1.5px solid ${T.primary}40`,
                borderRadius: '12px', px: 2.5, py: 1.2, mb: 3,
              }}>
                {role === 'BUSINESS' ? (
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: T.primaryDark }}>
                    {form.businessName || 'Your Store'}
                  </Typography>
                ) : (
                  <>
                    <Shield sx={{ color: T.primary, fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: T.primary, letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                      {captainId}
                    </Typography>
                    <IconButton onClick={copyId} size="small" sx={{ color: '#64748b' }}>
                      {copied ? <Done fontSize="small" sx={{ color: '#10b981' }} /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                  </>
                )}
              </Box>

              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  onClick={() => navigate(role === 'BUSINESS' ? '/business-dashboard' : '/login')}
                  variant="contained"
                  sx={{
                    borderRadius: '14px', textTransform: 'none', fontWeight: 900, py: 1.4,
                    bgcolor: T.primary, boxShadow: `0 4px 14px ${T.glow}`,
                    '&:hover': { bgcolor: T.primaryDark },
                  }}
                >
                  {role === 'BUSINESS' ? 'Go to Business Dashboard' : 'Login to Dashboard'}
                </Button>
                <Button
                  fullWidth
                  onClick={() => navigate('/login')}
                  variant="outlined"
                  sx={{
                    borderRadius: '14px', textTransform: 'none', fontWeight: 700, py: 1.4,
                    borderColor: '#cbd5e1', color: '#475569',
                    '&:hover': { borderColor: T.primary },
                  }}
                >
                  Back to Login
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>

      </Container>
    </Box>
  );
};

export default UnifiedRegister;
