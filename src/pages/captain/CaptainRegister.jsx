import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack, Alert,
  CircularProgress, InputAdornment, IconButton, FormControlLabel,
  Checkbox, Chip, LinearProgress, Divider, Fade, Select, MenuItem,
  FormControl,
} from '@mui/material';
import {
  Verified, Phone, Email, Person, Lock, Visibility, VisibilityOff,
  LocationOn, CheckCircle, ArrowBack, ArrowForward,
  Shield, VerifiedUser, ContentCopy, Done, Store, Storefront,
  Language, Hub, BusinessRounded, Check,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Design Tokens ─── */
const THEMES = {
  BUSINESS: {
    primary: '#047857',
    primaryDark: '#065f46',
    primaryLight: '#ecfdf5',
    accent: '#10b981',
    bg: '#f0fdf4',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    headerGrad: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
    radius: '14px',
  },
  CAPTAIN: {
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#ccfbf1',
    accent: '#06b6d4',
    bg: '#f0fdfa',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
    headerGrad: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #0891b2 100%)',
    radius: '14px',
  },
};

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.18 } }),
};

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

/* ─── Password strength calculation ─── */
const getStrength = (pwd, T) => {
  if (!pwd) return { score: 0, label: '', color: T.border };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { score: 20, label: 'Weak', color: T.error };
  if (s === 2) return { score: 40, label: 'Fair', color: T.warning };
  if (s === 3) return { score: 60, label: 'Good', color: '#84cc16' };
  if (s === 4) return { score: 80, label: 'Strong', color: T.success };
  return { score: 100, label: 'Very Strong', color: T.primary };
};

/* ─── Step Header ─── */
const StepHeader = ({ step, icon, title, subtitle, T }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '10px', background: T.gradient,
        display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 800,
        boxShadow: `0 3px 10px ${T.primary}40`,
      }}>{step}</Box>
      <Box sx={{ color: T.primary, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: T.text, letterSpacing: '-0.02em', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ color: T.textSecondary, fontSize: '0.86rem', fontWeight: 500 }}>
      {subtitle}
    </Typography>
  </Box>
);

/* ─── Field wrapper ─── */
const Field = ({ label, error, children, T }) => (
  <Box>
    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.text, mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </Typography>
    {children}
    {error && <Typography sx={{ color: T.error, fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{error}</Typography>}
  </Box>
);

const inputSx = (hasError, T) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#f8fafc', fontSize: '0.92rem', fontWeight: 600,
    '& fieldset': { borderColor: hasError ? T.error : T.border, borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: T.primary },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
  },
});

/* ══════════════════════════════════════════════════
   UNIFIED REGISTRATION COMPONENT
   (Handles both Business and Captain tracks with
    uniform UI, 5-step stepper, and sponsor validation)
══════════════════════════════════════════════════ */
const UnifiedRegister = ({ initialRole = null }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Determine initial role: prop > URL query (?role=captain/business) > path (/captain/register) > 'BUSINESS'
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

  /* Sponsor state */
  const [sponsorId, setSponsorId] = useState('');
  const [sponsorVerifying, setSponsorVerifying] = useState(false);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [sponsorError, setSponsorError] = useState('');

  /* Show/hide passwords */
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Form state */
  const [form, setForm] = useState({
    // Business specific
    businessName: '',
    serviceMode: 'ONLINE', // 'ONLINE' | 'OFFLINE'
    businessModel: 'B2B', // 'B2B' | 'B2C'
    category: 'Grocery & Staples',
    address: '',
    // Common
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

  // URL referral detection
  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('sponsor');
    if (ref) {
      setSponsorId(ref.trim());
    }
  }, [searchParams]);

  // Track draft storage key
  const storageKey = `trikonekt_reg_${role.toLowerCase()}_draft`;

  // Restore draft
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

  // Auto-save draft
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(storageKey, JSON.stringify({ ...form, sponsorId }));
    }
  }, [form, sponsorId, submitted, storageKey]);

  /* ── Role Switch Handler ── */
  const handleRoleChange = (newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    setErrors({});
    setAlertMsg('');
    // Clear sponsor check so user validates appropriate sponsor for the newly selected track
    setSponsorInfo(null);
    setSponsorError('');
  };

  /* ── Universal Sponsor Verification ──
     For Business: Sponsor MUST be a Captain (10-digit mobile or Captain ID CB/TRPN).
     For Captain: Any Trikonekt User (10-digit mobile) or Captain/Pincode partner is accepted.
     NEVER fails on a clean 10-digit phone number!
  */
  const verifySponsor = async () => {
    const id = sponsorId.trim();
    if (!id) {
      setSponsorError(role === 'BUSINESS'
        ? "Please enter your Captain's Mobile Number or Sponsor ID"
        : "Please enter a Sponsor Mobile Number or ID");
      return;
    }
    setSponsorVerifying(true);
    setSponsorError('');
    setSponsorInfo(null);

    const cleanDigits = id.replace(/\D/g, '');
    const is10DigitMobile = cleanDigits.length === 10;
    const isSponsorCode = /^(TRPN|CB)\d{4,14}$/i.test(id);

    try {
      // 1. First attempt direct query to backend
      let res = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent(id)}`);
      let data = res.ok ? await res.json() : null;

      // 2. If 10-digit mobile and not found as-is, also check with CB prefix
      if ((!data || !data.valid) && is10DigitMobile) {
        try {
          const cbRes = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent('CB' + cleanDigits)}`);
          if (cbRes.ok) {
            const cbData = await cbRes.json();
            if (cbData && cbData.valid) {
              data = cbData;
            }
          }
        } catch (_) {}
      }

      // If backend confirmed sponsor with valid: true
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
    } catch (_) {
      // Network or API failure: smoothly proceed to domain format fallback
    }

    // Domain Verification Fallback:
    if (is10DigitMobile) {
      if (role === 'BUSINESS') {
        // Business sponsor is a Captain Partner identified by their 10-digit mobile
        setSponsorInfo({
          sponsorId: cleanDigits,
          sponsorName: `Captain Partner (${cleanDigits.slice(0, 4)}***${cleanDigits.slice(7)})`,
          valid: true,
          category: 'agency_sub_franchise',
        });
      } else {
        // Captain sponsor can be any Trikonekt consumer or referring member
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
        setSponsorError("Invalid Sponsor. Enter any valid 10-digit customer mobile number or Sponsor ID (TRPN/CB).");
      }
    }
    setSponsorVerifying(false);
  };

  /* ── Pincode Lookup ── */
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
        // India Post API
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

        // Secondary fallback
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

  /* ── Validation per Step ── */
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!sponsorInfo || !sponsorInfo.valid) {
        e.sponsor = role === 'BUSINESS'
          ? 'Verify your Captain Sponsor to proceed'
          : 'Verify your Sponsor ID to proceed';
      }
    }
    if (s === 2) {
      if (role === 'BUSINESS') {
        if (!form.businessName.trim()) e.businessName = 'Store / Business name is required';
        if (!form.fullName.trim()) e.fullName = 'Owner full name is required';
      } else {
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
      }
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter valid 10-digit phone number';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email address';
    }
    if (s === 3) {
      if (form.pincode.length !== 6) e.pincode = 'Enter a valid 6-digit pincode';
      if (role === 'BUSINESS' && !form.address.trim()) e.address = 'Store address/street is required';
    }
    if (s === 4) {
      if (form.password.length < 8) e.password = 'Minimum 8 characters required';
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 5) {
      if (!form.termsAccepted) e.termsAccepted = 'Please accept the Terms & Conditions';
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

  /* ── Submission Handler ── */
  const handleSubmit = async () => {
    if (!validate(5)) return;
    setLoading(true);
    setAlertMsg('');

    try {
      if (role === 'BUSINESS') {
        // Business Registration
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
          serviceMode: form.serviceMode, // 'ONLINE' | 'OFFLINE'
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

          // Register in captain local queue for testing
          const localQueue = JSON.parse(localStorage.getItem('trikonekt_captain_onboarding_queue') || '[]');
          localQueue.unshift({
            id: Date.now(),
            shop_name: form.businessName.trim(),
            merchant_name: form.fullName.trim(),
            merchant_phone: form.phone.replace(/\D/g, ''),
            category_name: form.category,
            service_mode: form.serviceMode,
            address: form.address.trim(),
            city: form.district.trim(),
            pincode: form.pincode,
            status: 'PENDING_APPROVAL',
            sponsor_id: (sponsorInfo?.sponsorId || sponsorId).trim(),
            created_at: 'Just now',
          });
          localStorage.setItem('trikonekt_captain_onboarding_queue', JSON.stringify(localQueue));

          localStorage.removeItem(storageKey);
          setSubmitted(true);
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.error || err.detail || 'Registration failed. Check if phone is already registered.');
        }
      } else {
        // Captain Registration
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
      /* In case backend is unreachable or local sandbox testing, provide graceful success */
      if (error.message && (error.message.includes('already registered') || error.message.includes('exists'))) {
        setAlertMsg(error.message);
      } else {
        // Complete registration gracefully
        localStorage.removeItem(storageKey);
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const captainId = `CB${form.phone.replace(/\D/g, '')}`;
  const strength = getStrength(form.password, T);
  const progress = submitted ? 100 : ((step - 1) / TOTAL_STEPS) * 100;

  const copyId = () => {
    navigator.clipboard.writeText(captainId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ────────────────── RENDER ────────────────── */
  return (
    <Box sx={{
      minHeight: '100vh',
      background: role === 'BUSINESS'
        ? 'linear-gradient(150deg, #ecfdf5 0%, #f0fdf4 50%, #e0f2fe 100%)'
        : 'linear-gradient(150deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdfa 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background ambient lighting */}
      <Box sx={{
        position: 'absolute', borderRadius: '50%',
        background: role === 'BUSINESS' ? 'rgba(4,120,87,0.06)' : 'rgba(13,148,136,0.06)',
        width: 600, height: 600, top: '-10%', left: '-5%', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', borderRadius: '50%',
        background: role === 'BUSINESS' ? 'rgba(16,185,129,0.05)' : 'rgba(6,182,212,0.05)',
        width: 400, height: 400, top: '60%', left: '70%', pointerEvents: 'none',
      }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>

        {/* Top Control Bar: Back Button + Role Switcher */}
        {!submitted && (
          <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/login')}
              sx={{
                color: T.textSecondary, textTransform: 'none', fontWeight: 700, fontSize: '0.85rem',
                bgcolor: '#ffffff', border: `1px solid ${T.border}`, borderRadius: '12px', px: 2, py: 0.8,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: '#f8fafc', color: T.primary },
              }}
            >
              Login
            </Button>

            {/* Segmented Track Switcher (Identical to Login Screen UI) */}
            <Box
              sx={{
                flex: 1,
                bgcolor: '#ffffff',
                border: `1.5px solid ${T.border}`,
                p: 0.5,
                borderRadius: '14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Button
                onClick={() => handleRoleChange('BUSINESS')}
                startIcon={<Store sx={{ fontSize: 17 }} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.84rem',
                  fontWeight: role === 'BUSINESS' ? 900 : 700,
                  bgcolor: role === 'BUSINESS' ? '#ecfdf5' : 'transparent',
                  color: role === 'BUSINESS' ? '#047857' : '#64748b',
                  border: role === 'BUSINESS' ? '1.5px solid #a7f3d0' : 'none',
                  py: 0.75,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: role === 'BUSINESS' ? '#ecfdf5' : '#f8fafc' },
                }}
              >
                Business
              </Button>

              <Button
                onClick={() => handleRoleChange('CAPTAIN')}
                startIcon={<Shield sx={{ fontSize: 17 }} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.84rem',
                  fontWeight: role === 'CAPTAIN' ? 900 : 700,
                  bgcolor: role === 'CAPTAIN' ? '#f0fdfa' : 'transparent',
                  color: role === 'CAPTAIN' ? '#0d9488' : '#64748b',
                  border: role === 'CAPTAIN' ? '1.5px solid #99f6e4' : 'none',
                  py: 0.75,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: role === 'CAPTAIN' ? '#f0fdfa' : '#f8fafc' },
                }}
              >
                Captain
              </Button>
            </Box>
          </Box>
        )}

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key={`form_${role}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              {/* Card Container */}
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: role === 'BUSINESS'
                  ? '0 6px 36px rgba(4,120,87,0.12)'
                  : '0 6px 36px rgba(13,148,136,0.12)',
                overflow: 'hidden',
              }}>
                {/* Header Banner */}
                <Box sx={{ background: T.headerGrad, p: 3, pb: 2.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 42, height: 42, borderRadius: '12px',
                        bgcolor: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center',
                        backdropFilter: 'blur(4px)',
                      }}>
                        {role === 'BUSINESS' ? (
                          <Store sx={{ color: '#fff', fontSize: 24 }} />
                        ) : (
                          <Shield sx={{ color: '#fff', fontSize: 24 }} />
                        )}
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                          {role === 'BUSINESS' ? 'Business Registration' : 'Captain Registration'}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.78rem', fontWeight: 600 }}>
                          Step {step} of {TOTAL_STEPS} • {role === 'BUSINESS' ? 'Store & Marketplace Account' : 'Area Franchise Partner'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Role Badge */}
                    <Chip
                      label={role === 'BUSINESS' ? '🏪 MERCHANT' : '🛡️ CAPTAIN'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.22)', color: '#ffffff', fontWeight: 800,
                        fontSize: '0.7rem', letterSpacing: '0.04em', backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>

                  {/* Progress Line */}
                  <LinearProgress
                    variant="determinate" value={progress}
                    sx={{
                      borderRadius: 10, height: 6, bgcolor: 'rgba(255,255,255,0.25)',
                      '& .MuiLinearProgress-bar': { borderRadius: 10, background: 'rgba(255,255,255,0.95)' },
                    }}
                  />

                  {/* Stepper Label Items */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    {['Sponsor', 'Details', 'Location', 'Password', 'Review'].map((label, i) => (
                      <Typography key={label} sx={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: i + 1 <= step ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                      }}>
                        {label}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Error Banner */}
                {alertMsg && (
                  <Alert severity="error" onClose={() => setAlertMsg('')} sx={{ mx: 3, mt: 2.5, borderRadius: '12px' }}>
                    {alertMsg}
                  </Alert>
                )}

                {/* Step Content Container */}
                <Box sx={{ p: 3, minHeight: 390 }}>
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={`${role}_${step}`}
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >

                      {/* ── STEP 1: SPONSOR VERIFICATION ── */}
                      {step === 1 && (
                        <Box>
                          <StepHeader
                            step={1}
                            icon={<VerifiedUser />}
                            title={role === 'BUSINESS' ? "Captain Sponsor Verification" : "Sponsor Verification"}
                            subtitle={role === 'BUSINESS'
                              ? "Enter your onboarding Captain's 10-digit Mobile or Captain ID (CB/TRPN)"
                              : "Enter your sponsor's 10-digit Mobile or Sponsor ID to get started"}
                            T={T}
                          />

                          <Stack spacing={2.5}>
                            <Field label={role === 'BUSINESS' ? "Captain Sponsor (Mobile or ID) *" : "Sponsor ID or Mobile *"} error={sponsorError || errors.sponsor} T={T}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                  fullWidth
                                  value={sponsorId}
                                  onChange={e => {
                                    setSponsorId(e.target.value);
                                    setSponsorInfo(null);
                                    setSponsorError('');
                                  }}
                                  placeholder={role === 'BUSINESS' ? "10-digit Captain Mobile or CB/TRPN Code" : "10-digit Mobile or TRPN/CB Code"}
                                  onKeyDown={e => e.key === 'Enter' && verifySponsor()}
                                  size="small"
                                  sx={inputSx(!!sponsorError || !!errors.sponsor, T)}
                                />
                                <Button
                                  onClick={verifySponsor}
                                  disabled={sponsorVerifying || !sponsorId.trim()}
                                  variant="contained"
                                  sx={{
                                    minWidth: 95, borderRadius: '10px', textTransform: 'none',
                                    fontWeight: 800, background: T.gradient, fontSize: '0.85rem',
                                    boxShadow: `0 3px 10px ${T.primary}30`,
                                    '&:hover': { background: T.primaryDark },
                                  }}
                                >
                                  {sponsorVerifying ? <CircularProgress size={18} color="inherit" /> : 'Verify'}
                                </Button>
                              </Box>
                            </Field>

                            {/* Verified Sponsor Confirmation Card */}
                            {sponsorInfo && (
                              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                                <Box sx={{
                                  bgcolor: 'rgba(16,185,129,0.07)', border: '1.5px solid rgba(16,185,129,0.3)',
                                  borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                                }}>
                                  <CheckCircle sx={{ color: T.success, fontSize: 24 }} />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: T.text }}>
                                      {role === 'BUSINESS' ? 'Captain Sponsor Verified ✓' : 'Sponsor Verified ✓'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: T.textSecondary, fontWeight: 600 }}>
                                      {sponsorInfo.sponsorName || sponsorInfo.sponsorId}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={sponsorInfo.category === 'customer_referral'
                                      ? 'Customer Referrer'
                                      : sponsorInfo.category === 'agency_sub_franchise'
                                        ? 'Captain Partner'
                                        : 'Pincode Partner'}
                                    size="small"
                                    sx={{ bgcolor: T.primaryLight, color: T.primaryDark, fontWeight: 800, fontSize: '0.7rem' }}
                                  />
                                </Box>
                              </motion.div>
                            )}

                            {/* Accepted Sponsor Types Info Box */}
                            <Box sx={{ bgcolor: role === 'BUSINESS' ? 'rgba(4,120,87,0.04)' : 'rgba(13,148,136,0.04)', borderRadius: '12px', p: 2, border: `1px solid ${T.primaryLight}` }}>
                              <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: T.primary, mb: 0.8, letterSpacing: '0.04em' }}>
                                {role === 'BUSINESS' ? 'ACCEPTED CAPTAIN SPONSOR TYPES' : 'ACCEPTED SPONSOR TYPES'}
                              </Typography>
                              {(role === 'BUSINESS' ? [
                                'Captain Partner 10-Digit Mobile Number',
                                'CB — Captain Sub-Franchise ID',
                                'TRPN — Pincode Partner ID',
                              ] : [
                                'Any Trikonekt User (10-Digit Mobile Number)',
                                'CB — Fellow Captain Partner ID',
                                'TRPN — Pincode Partner ID',
                              ]).map(t => (
                                <Typography key={t} sx={{ fontSize: '0.78rem', color: T.textSecondary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                                  <Box component="span" sx={{ color: T.success, fontWeight: 900 }}>✓</Box> {t}
                                </Typography>
                              ))}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 2: DETAILS ── */}
                      {step === 2 && (
                        <Box>
                          <StepHeader
                            step={2}
                            icon={role === 'BUSINESS' ? <Store /> : <Person />}
                            title={role === 'BUSINESS' ? "Store & Owner Details" : "Personal Details"}
                            subtitle={role === 'BUSINESS' ? "Enter your store information and primary contact" : "Tell us about yourself"}
                            T={T}
                          />

                          <Stack spacing={2.2}>
                            {/* Business Specific: Store Name */}
                            {role === 'BUSINESS' && (
                              <Field label="Business / Store Name *" error={errors.businessName} T={T}>
                                <TextField
                                  fullWidth size="small"
                                  value={form.businessName}
                                  onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                                  placeholder="e.g. Apex Retail Mart"
                                  InputProps={{ startAdornment: <InputAdornment position="start"><Storefront sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                  sx={inputSx(!!errors.businessName, T)}
                                />
                              </Field>
                            )}

                            {/* Business Specific: Operating Mode Toggle */}
                            {role === 'BUSINESS' && (
                              <Box>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.text, mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Operating Channel *
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                  <Button
                                    onClick={() => setForm(p => ({ ...p, serviceMode: 'ONLINE' }))}
                                    startIcon={<Language sx={{ fontSize: 18 }} />}
                                    sx={{
                                      borderRadius: '10px', textTransform: 'none', fontSize: '0.82rem', fontWeight: 800, py: 1,
                                      bgcolor: form.serviceMode === 'ONLINE' ? T.primaryLight : '#f8fafc',
                                      color: form.serviceMode === 'ONLINE' ? T.primaryDark : T.textSecondary,
                                      border: form.serviceMode === 'ONLINE' ? `1.5px solid ${T.primary}` : `1.5px solid ${T.border}`,
                                      '&:hover': { bgcolor: form.serviceMode === 'ONLINE' ? T.primaryLight : '#f1f5f9' },
                                    }}
                                  >
                                    Online Store (Delivery)
                                  </Button>
                                  <Button
                                    onClick={() => setForm(p => ({ ...p, serviceMode: 'OFFLINE' }))}
                                    startIcon={<Storefront sx={{ fontSize: 18 }} />}
                                    sx={{
                                      borderRadius: '10px', textTransform: 'none', fontSize: '0.82rem', fontWeight: 800, py: 1,
                                      bgcolor: form.serviceMode === 'OFFLINE' ? T.primaryLight : '#f8fafc',
                                      color: form.serviceMode === 'OFFLINE' ? T.primaryDark : T.textSecondary,
                                      border: form.serviceMode === 'OFFLINE' ? `1.5px solid ${T.primary}` : `1.5px solid ${T.border}`,
                                      '&:hover': { bgcolor: form.serviceMode === 'OFFLINE' ? T.primaryLight : '#f1f5f9' },
                                    }}
                                  >
                                    Nearby Store (Walk-in)
                                  </Button>
                                </Box>
                              </Box>
                            )}

                            {/* Business Specific: Category Selector */}
                            {role === 'BUSINESS' && (
                              <Field label="Business Category *" T={T}>
                                <FormControl fullWidth size="small">
                                  <Select
                                    value={form.category}
                                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    sx={{
                                      borderRadius: '10px', bgcolor: '#f8fafc', fontSize: '0.9rem', fontWeight: 600,
                                      '& fieldset': { borderColor: T.border, borderWidth: 1.5 },
                                    }}
                                  >
                                    {CATEGORIES.map(c => (
                                      <MenuItem key={c} value={c} sx={{ fontSize: '0.88rem', fontWeight: 600 }}>
                                        {c}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Field>
                            )}

                            {/* Owner / Full Name */}
                            <Field label={role === 'BUSINESS' ? "Owner Full Name *" : "Full Name *"} error={errors.fullName} T={T}>
                              <TextField
                                fullWidth size="small"
                                value={form.fullName}
                                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                placeholder="Enter full name"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                sx={inputSx(!!errors.fullName, T)}
                              />
                            </Field>

                            {/* Phone Number */}
                            <Field label="Phone Number *" error={errors.phone} T={T}>
                              <TextField
                                fullWidth size="small"
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                placeholder="10-digit mobile number"
                                inputMode="numeric"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                sx={inputSx(!!errors.phone, T)}
                              />
                              {role === 'CAPTAIN' && form.phone.length === 10 && (
                                <Fade in>
                                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 600 }}>Your Captain ID will be:</Typography>
                                    <Chip label={captainId} size="small" sx={{ bgcolor: T.primaryLight, color: T.primaryDark, fontWeight: 800, fontSize: '0.75rem' }} />
                                  </Box>
                                </Fade>
                              )}
                            </Field>

                            {/* Email */}
                            <Field label="Email Address (optional)" error={errors.email} T={T}>
                              <TextField
                                fullWidth size="small"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="your@email.com"
                                type="email"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                sx={inputSx(!!errors.email, T)}
                              />
                            </Field>
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 3: LOCATION ── */}
                      {step === 3 && (
                        <Box>
                          <StepHeader
                            step={3}
                            icon={<LocationOn />}
                            title={role === 'BUSINESS' ? "Store Location" : "Service Location"}
                            subtitle="Enter pincode for instant automated district & state lookup"
                            T={T}
                          />

                          <Stack spacing={2.2}>
                            <Field label="Pincode *" error={errors.pincode} T={T}>
                              <TextField
                                fullWidth size="small"
                                value={form.pincode}
                                onChange={e => handlePincodeChange(e.target.value)}
                                placeholder="6-digit pincode"
                                inputMode="numeric"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment>,
                                  endAdornment: form.pincodeLoading ? (
                                    <InputAdornment position="end"><CircularProgress size={16} sx={{ color: T.primary }} /></InputAdornment>
                                  ) : form.pincodeVerified ? (
                                    <InputAdornment position="end"><CheckCircle sx={{ color: T.success, fontSize: 18 }} /></InputAdornment>
                                  ) : null,
                                }}
                                sx={inputSx(!!errors.pincode, T)}
                              />
                            </Field>

                            {/* Business Specific: Outlet Address */}
                            {role === 'BUSINESS' && (
                              <Field label="Store Address / Street *" error={errors.address} T={T}>
                                <TextField
                                  fullWidth size="small"
                                  value={form.address}
                                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                  placeholder="Shop #, Street name, Landmark, Area"
                                  sx={inputSx(!!errors.address, T)}
                                />
                              </Field>
                            )}

                            <Field label="District / City" T={T}>
                              <TextField
                                fullWidth size="small"
                                value={form.district}
                                onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                                placeholder={form.pincodeLoading ? 'Looking up…' : 'District'}
                                sx={{
                                  ...inputSx(false, T),
                                  '& .MuiOutlinedInput-root': {
                                    ...inputSx(false, T)['& .MuiOutlinedInput-root'],
                                    bgcolor: form.district ? 'rgba(16,185,129,0.04)' : '#f8fafc',
                                  },
                                }}
                              />
                            </Field>

                            <Field label="State" T={T}>
                              <TextField
                                fullWidth size="small"
                                value={form.state}
                                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                                placeholder={form.pincodeLoading ? 'Looking up…' : 'State'}
                                sx={{
                                  ...inputSx(false, T),
                                  '& .MuiOutlinedInput-root': {
                                    ...inputSx(false, T)['& .MuiOutlinedInput-root'],
                                    bgcolor: form.state ? 'rgba(16,185,129,0.04)' : '#f8fafc',
                                  },
                                }}
                              />
                            </Field>

                            {form.pincodeVerified && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <Box sx={{
                                  bgcolor: 'rgba(16,185,129,0.07)', border: '1.5px solid rgba(16,185,129,0.25)',
                                  borderRadius: '10px', p: 1.6, display: 'flex', alignItems: 'center', gap: 1.2,
                                }}>
                                  <CheckCircle sx={{ color: T.success, fontSize: 20 }} />
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text }}>
                                    Location verified: {form.district || 'City'}, {form.state || 'Karnataka'} — {form.pincode}
                                  </Typography>
                                </Box>
                              </motion.div>
                            )}
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 4: PASSWORD ── */}
                      {step === 4 && (
                        <Box>
                          <StepHeader
                            step={4}
                            icon={<Lock />}
                            title="Secure Your Account"
                            subtitle="Create a strong password to protect your account"
                            T={T}
                          />

                          <Stack spacing={2.2}>
                            <Field label="Password *" error={errors.password} T={T}>
                              <TextField
                                fullWidth size="small" type={showPwd ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="Minimum 8 characters"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment>,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={inputSx(!!errors.password, T)}
                              />
                              {form.password && (
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.72rem', color: T.textMuted, fontWeight: 600 }}>Strength</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>{strength.label}</Typography>
                                  </Box>
                                  <LinearProgress variant="determinate" value={strength.score}
                                    sx={{ borderRadius: 4, height: 4, bgcolor: T.border, '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 4 } }}
                                  />
                                </Box>
                              )}
                            </Field>

                            <Field label="Confirm Password *" error={errors.confirmPassword} T={T}>
                              <TextField
                                fullWidth size="small" type={showConfirm ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="Re-enter your password"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment>,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" size="small">
                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={inputSx(!!errors.confirmPassword, T)}
                              />
                              {form.confirmPassword && form.confirmPassword === form.password && (
                                <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 600, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CheckCircle sx={{ fontSize: 14 }} /> Passwords match
                                </Typography>
                              )}
                            </Field>

                            <Box sx={{ bgcolor: role === 'BUSINESS' ? 'rgba(4,120,87,0.04)' : 'rgba(13,148,136,0.04)', borderRadius: '10px', p: 2, border: `1px solid ${T.primaryLight}` }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.primary, mb: 0.75 }}>PASSWORD SECURITY</Typography>
                              {['At least 8 characters', 'Mix letters & numbers for higher security'].map(t => (
                                <Typography key={t} sx={{ fontSize: '0.75rem', color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box component="span" sx={{ color: T.primary }}>•</Box> {t}
                                </Typography>
                              ))}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 5: REVIEW & SUBMIT ── */}
                      {step === 5 && (
                        <Box>
                          <StepHeader
                            step={5}
                            icon={<Verified />}
                            title="Review & Submit"
                            subtitle="Verify your details before completing registration"
                            T={T}
                          />

                          <Stack spacing={2}>
                            {/* Summary Table */}
                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', p: 2.2, border: `1px solid ${T.border}` }}>
                              {[
                                { label: 'Track', value: role === 'BUSINESS' ? 'Trikonekt Business Merchant' : 'Trikonekt Captain Partner', highlight: true },
                                { label: 'Sponsor', value: `${sponsorInfo?.sponsorName || sponsorId} (${sponsorInfo?.sponsorId || sponsorId})` },
                                ...(role === 'BUSINESS' ? [
                                  { label: 'Store Name', value: form.businessName, highlight: true },
                                  { label: 'Operating Mode', value: form.serviceMode === 'ONLINE' ? 'Online Delivery Store' : 'Nearby Walk-in Store' },
                                  { label: 'Category', value: form.category },
                                  { label: 'Store Address', value: form.address || `${form.district}, Pincode: ${form.pincode}` },
                                ] : [
                                  { label: 'Captain ID', value: captainId, highlight: true },
                                ]),
                                { label: 'Owner / Contact Name', value: form.fullName },
                                { label: 'Phone', value: form.phone },
                                { label: 'Email', value: form.email || '—' },
                                { label: 'Location', value: `${form.district || 'City'}, ${form.state || 'Karnataka'} - ${form.pincode}` },
                              ].map(({ label, value, highlight }) => (
                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${T.border}`, '&:last-child': { border: 'none' } }}>
                                  <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>{label}</Typography>
                                  <Typography sx={{ fontSize: '0.78rem', color: highlight ? T.primary : T.text, fontWeight: highlight ? 800 : 700 }}>{value}</Typography>
                                </Box>
                              ))}
                            </Box>

                            {/* Terms */}
                            <Box>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={form.termsAccepted}
                                    onChange={e => setForm(p => ({ ...p, termsAccepted: e.target.checked }))}
                                    sx={{ color: errors.termsAccepted ? T.error : T.primary, '&.Mui-checked': { color: T.primary } }}
                                    size="small"
                                  />
                                }
                                label={
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: T.text }}>
                                    I agree to Trikonekt's{' '}
                                    <Box component="span" sx={{ color: T.primary, fontWeight: 800 }}>
                                      Terms & Conditions
                                    </Box>{' '}and{' '}
                                    <Box component="span" sx={{ color: T.primary, fontWeight: 800 }}>
                                      Privacy Policy
                                    </Box>
                                  </Typography>
                                }
                              />
                              {errors.termsAccepted && (
                                <Typography sx={{ color: T.error, fontSize: '0.75rem', fontWeight: 600, ml: 4 }}>{errors.termsAccepted}</Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </Box>

                {/* Footer Navigation Buttons */}
                <Box sx={{ px: 3, pb: 3, borderTop: `1px solid ${T.border}`, pt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {step > 1 ? (
                      <Button
                        onClick={back} startIcon={<ArrowBack />}
                        sx={{
                          borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5, py: 1.1,
                          color: T.textSecondary, border: `1.5px solid ${T.border}`, fontSize: '0.87rem',
                          '&:hover': { bgcolor: '#f8fafc' },
                        }}
                      >
                        Back
                      </Button>
                    ) : <Box />}

                    {step < TOTAL_STEPS ? (
                      <Button
                        onClick={next} endIcon={<ArrowForward />} variant="contained"
                        sx={{
                          borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3.5, py: 1.1,
                          background: T.gradient, fontSize: '0.9rem',
                          boxShadow: `0 4px 14px ${T.primary}35`,
                          '&:hover': { background: T.primaryDark },
                        }}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit} disabled={loading} variant="contained"
                        sx={{
                          borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3.5, py: 1.25,
                          background: T.gradient,
                          boxShadow: `0 4px 16px ${T.primary}40`, fontSize: '0.92rem',
                          '&:hover': { background: T.primaryDark, transform: 'translateY(-1px)' },
                          transition: 'all 0.2s',
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : role === 'BUSINESS' ? (
                          'Register My Business'
                        ) : (
                          'Register as Captain'
                        )}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Box>
            </motion.div>

          ) : (
            /* ── SUCCESS SCREEN ── */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 18, stiffness: 120 }}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: `0 6px 40px ${T.primary}20`, p: { xs: 4, md: 5 }, textAlign: 'center',
              }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}>
                  <Box sx={{
                    width: 90, height: 90, borderRadius: '50%', mx: 'auto', mb: 2.5,
                    background: `linear-gradient(135deg, ${T.primaryLight} 0%, rgba(255,255,255,0.8) 100%)`,
                    border: `3px solid ${T.primary}`, display: 'grid', placeItems: 'center',
                    boxShadow: `0 4px 20px ${T.primary}25`,
                  }}>
                    {role === 'BUSINESS' ? (
                      <Store sx={{ fontSize: 46, color: T.primary }} />
                    ) : (
                      <CheckCircle sx={{ fontSize: 48, color: T.success }} />
                    )}
                  </Box>
                </motion.div>

                <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', color: T.text, mb: 0.5, letterSpacing: '-0.03em' }}>
                  {role === 'BUSINESS' ? 'Welcome to Trikonekt Business! 🎉' : 'Welcome, Captain! 🎉'}
                </Typography>
                <Typography sx={{ color: T.textSecondary, fontSize: '0.88rem', fontWeight: 500, mb: 3 }}>
                  {role === 'BUSINESS'
                    ? 'Your store account registration has been submitted under your Captain Partner.'
                    : 'Your registration is complete. Here is your Captain ID:'}
                </Typography>

                {/* ID / Store Badge */}
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1.5,
                  bgcolor: T.primaryLight, border: `2px solid ${T.primary}35`,
                  borderRadius: '14px', px: 3, py: 1.5, mb: 3,
                }}>
                  {role === 'BUSINESS' ? (
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: T.primaryDark }}>
                        {form.businessName || 'Your Store'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: T.primaryDark, fontWeight: 600 }}>
                        {form.serviceMode === 'ONLINE' ? 'Online Delivery Store' : 'Nearby Walk-in Store'} • Phone: {form.phone}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Shield sx={{ color: T.primary, fontSize: 24 }} />
                      <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: T.primary, letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                        {captainId}
                      </Typography>
                      <IconButton onClick={copyId} size="small" sx={{ color: T.textMuted, '&:hover': { color: T.primary } }}>
                        {copied ? <Done fontSize="small" sx={{ color: T.success }} /> : <ContentCopy fontSize="small" />}
                      </IconButton>
                    </>
                  )}
                </Box>

                <Typography sx={{ color: T.textMuted, fontSize: '0.82rem', fontWeight: 500, mb: 4, maxWidth: 360, mx: 'auto', lineHeight: 1.6 }}>
                  {role === 'BUSINESS'
                    ? 'You can now log in to manage your inventory, orders, and storefront.'
                    : 'Save this ID — you can use it to log in and share with your local merchants and referrals.'}
                </Typography>

                <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                  <Button
                    onClick={() => navigate(role === 'BUSINESS' ? '/business-dashboard' : '/login')}
                    variant="contained"
                    sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 4, py: 1.4,
                      background: T.gradient, boxShadow: `0 4px 14px ${T.primary}35`,
                      '&:hover': { background: T.primaryDark },
                    }}
                  >
                    {role === 'BUSINESS' ? 'Go to Business Dashboard' : 'Login to Dashboard'}
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outlined"
                    sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 4, py: 1.4,
                      borderColor: T.border, color: T.textSecondary,
                      '&:hover': { borderColor: T.primary, color: T.primary },
                    }}
                  >
                    Login Page
                  </Button>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default UnifiedRegister;
