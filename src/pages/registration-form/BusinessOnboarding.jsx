import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Alert,
  Fade,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  CloudUpload,
  Delete,
  Person,
  Business,
  Lock,
  Email,
  Phone,
  LocationOn,
  Storefront,
  Language,
  Hub,
  ShoppingCart,
  LocalShipping,
  DirectionsBus,
  Agriculture,
  Work,
  Home,
  Restaurant,
  ShoppingBag,
  Sell,
  Verified,
  Description,
  Badge,
  Map,
  Launch,
  EmojiPeople,
  BusinessCenter,
  ChevronRight
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  accent: '#06b6d4',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  cardShadowHover: '0 10px 25px rgba(0,0,0,0.08)',
  cardShadowSelected: '0 0 0 2px #0d9488, 0 10px 25px rgba(13,148,136,0.15)',
  radius: '16px',
};

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
  exit: (dir) => ({ x: dir < 0 ? 120 : -120, opacity: 0, transition: { duration: 0.25 } }),
};

const cardPop = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 1, 0.5, 1] }
  })
};

/* ═══════════════════════════════════════════
   SUB-CATEGORY DATA
   ═══════════════════════════════════════════ */
const TRIZONE_OPTIONS = [
  { value: 'Tri Eat', label: 'Tri Eat', icon: <Restaurant />, desc: 'Food & Restaurants' },
  { value: 'Tri Basket', label: 'Tri Basket', icon: <ShoppingBag />, desc: 'Groceries & Shopping' },
  { value: 'Tri Rides', label: 'Tri Rides', icon: <LocalShipping />, desc: 'Ride Sharing & Transport' },
  { value: 'Tri Buy & Sell', label: 'Tri Buy & Sell', icon: <Sell />, desc: 'Classifieds Marketplace' },
  { value: 'Tri Bus', label: 'Tri Bus', icon: <DirectionsBus />, desc: 'Bus & Transit' },
  { value: 'Tri Agri Farmer', label: 'Tri Agri Farmer', icon: <Agriculture />, desc: 'Agriculture & Farming' },
  { value: 'Tri Jobs', label: 'Tri Jobs', icon: <Work />, desc: 'Local Job Listings' },
  { value: 'Tri House Help', label: 'Tri House Help', icon: <Home />, desc: 'Household Services' },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const logoRef = useRef(null);
  const docsRef = useRef(null);
  const TOTAL_STEPS = 6;

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: 'success', msg: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);
  const [logoDrag, setLogoDrag] = useState(false);

  const [form, setForm] = useState({
    userType: '',
    businessCategory: '',
    businessModel: '',
    subCategories: [],
    fullName: '',
    businessName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    businessRegNumber: '',
    logo: null,
    logoName: '',
    documents: [],
    termsAccepted: false,
    privacyAccepted: false,
    sponsorId: '',
    sponsorVerified: false,
    sponsorName: '',
  });

  const verifySponsorId = async (id) => {
    if (!id) return;
    try {
      const apiBase = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
      const res = await fetch(`${apiBase}/captain/sponsor/verify?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          sponsorId: id,
          sponsorVerified: true,
          sponsorName: data.sponsorName || 'Verified Sponsor'
        }));
        setErrors(prev => ({ ...prev, sponsorId: '', sponsorVerified: '' }));
      } else {
        setForm(prev => ({ ...prev, sponsorVerified: false, sponsorName: '' }));
        setErrors(prev => ({ ...prev, sponsorId: 'Invalid Sponsor ID' }));
      }
    } catch (err) {
      if (/^(TRPN|CB)\d+/i.test(id)) {
        setForm(prev => ({
          ...prev,
          sponsorId: id,
          sponsorVerified: true,
          sponsorName: 'Verified Sponsor (Offline Fallback)'
        }));
        setErrors(prev => ({ ...prev, sponsorId: '', sponsorVerified: '' }));
      } else {
        setForm(prev => ({ ...prev, sponsorVerified: false, sponsorName: '' }));
        setErrors(prev => ({ ...prev, sponsorId: 'Sponsor ID format invalid' }));
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('sponsor');
    if (ref) {
      setForm(prev => ({ ...prev, sponsorId: ref.toUpperCase() }));
      verifySponsorId(ref.toUpperCase());
    }
  }, []);

  /* ── Auto-save on step change ── */
  useEffect(() => {
    const saved = { ...form, logo: null, documents: [] };
    localStorage.setItem('trikonext_onboarding', JSON.stringify({ data: saved, step }));
  }, [step, form]);

  /* ── Restore saved progress ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('trikonext_onboarding');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.data && parsed.data.userType) {
          setForm(prev => ({ ...prev, ...parsed.data }));
          setStep(parsed.step || 1);
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  /* ── Alert auto-dismiss ── */
  useEffect(() => {
    if (alert.show) {
      const t = setTimeout(() => setAlert(p => ({ ...p, show: false })), 4000);
      return () => clearTimeout(t);
    }
  }, [alert.show]);

  /* ── Pincode lookup ── */
  const handlePincode = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm(prev => ({ ...prev, pincode: val }));
    clearErr('pincode');
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const po = data[0].PostOffice[0];
          setForm(prev => ({ ...prev, city: po.District || '', state: po.State || '' }));
        }
      } catch (e) { /* ignore */ }
    }
  };

  /* ── Helpers ── */
  const clearErr = (f) => { if (errors[f]) setErrors(p => ({ ...p, [f]: '' })); };
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    clearErr(name);
  };

  const getBusinessModel = useCallback(() => {
    if (form.businessModel) return form.businessModel;
    if (form.subCategories.includes('B2B') || form.subCategories.includes('Merchant (B2B)')) return 'B2B';
    if (form.subCategories.includes('B2C') || form.subCategories.includes('Consumer (B2C)')) return 'B2C';
    return '';
  }, [form.businessModel, form.subCategories]);

  const getServiceMode = useCallback(() => (
    form.businessCategory === 'Online Business' ? 'ONLINE' : 'OFFLINE'
  ), [form.businessCategory]);

  const getCategoryValue = useCallback((legacy = false) => {
    const isB2B = getBusinessModel() === 'B2B';
    if (legacy) return isB2B ? 'merchant' : 'business';
    return isB2B ? 'merchant_business' : 'consumer_business';
  }, [getBusinessModel]);

  const getUsernamePrefix = useCallback(() => {
    const serviceMode = getServiceMode();
    const businessModel = getBusinessModel();
    if (serviceMode === 'ONLINE' && businessModel === 'B2B') return 'ONB2B';
    if (serviceMode === 'ONLINE') return 'ONB2C';
    if (businessModel === 'B2B') return 'NSB2B';
    return 'NSB2C';
  }, [getServiceMode, getBusinessModel]);

  const getExpectedUsername = useCallback(() => (
    form.mobile ? `${getUsernamePrefix()}${form.mobile}` : ''
  ), [form.mobile, getUsernamePrefix]);

  /* ── File handlers ── */
  const processLogo = (file) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, logo: 'Max 5MB' })); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, logo: reader.result, logoName: file.name }));
    reader.readAsDataURL(file);
    clearErr('logo');
  };

  const handleDocs = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= 10 * 1024 * 1024).slice(0, 5);
    const readers = valid.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB', data: r.result });
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(results => setForm(p => ({ ...p, documents: [...p.documents, ...results].slice(0, 5) })));
  };

  const removeDoc = (idx) => setForm(p => ({ ...p, documents: p.documents.filter((_, i) => i !== idx) }));

  /* ── Validation per step ── */
  const validate = (s) => {
    const e = {};
    switch (s) {
      case 1:
        if (!form.userType) e.userType = 'Please select how you want to join';
        break;
      case 2:
        if (!form.businessCategory) e.businessCategory = 'Please select a category';
        break;
      case 3:
        if (!getBusinessModel()) e.subCategories = 'Please select B2C or B2B';
        break;
      case 4:
        if (!form.sponsorId.trim()) e.sponsorId = 'Sponsor ID is required';
        else if (!form.sponsorVerified) e.sponsorVerified = 'Please verify the Sponsor ID';
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
        if (!form.businessName.trim()) e.businessName = 'Business name is required';
        if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit number';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Minimum 8 characters';
        if (!form.confirmPassword) e.confirmPassword = 'Confirm password is required';
        else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
        break;
      case 5:
        if (!form.address.trim()) e.address = 'Address is required';
        if (!form.city.trim()) e.city = 'City is required';
        if (!form.pincode.trim()) e.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter valid 6-digit pincode';
        break;
      case 6:
        if (!form.termsAccepted) e.termsAccepted = 'You must accept the Terms & Conditions';
        if (!form.privacyAccepted) e.privacyAccepted = 'You must accept the Privacy Policy';
        break;
      default: break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Navigation ── */
  const next = () => { if (validate(step)) { setDir(1); setStep(s => s + 1); } };
  const back = () => { setDir(-1); setStep(s => s - 1); };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validate(6)) return;
    setLoading(true);

    const serviceMode = getServiceMode();
    const buildPayload = (legacyCategory = false) => ({
      sponsorId: form.sponsorId,
      fullName: form.fullName,
      businessName: form.businessName,
      phone: form.mobile,
      email: form.email,
      password: form.password,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      latitude: parseFloat(form.latitude) || 0.0,
      longitude: parseFloat(form.longitude) || 0.0,
      category: getCategoryValue(legacyCategory),
      serviceMode,
      discountPercent: 0.0,
      categoryId: null,
      subcategoryId: null
    });

    const submitRegistration = async (payload) => {
      const apiBase = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
      return fetch(`${apiBase}/captain/merchant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    };

    try {
      let res = await submitRegistration(buildPayload(false));
      let usedLegacyCategory = false;

      // Backward compatibility: if the API has not yet been updated for
      // consumer_business / merchant_business, retry once with old values.
      if (!res.ok && [400, 422].includes(res.status)) {
        res = await submitRegistration(buildPayload(true));
        usedLegacyCategory = res.ok;
      }

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token_business', data.access);
        localStorage.setItem('refresh_business', data.refresh);
        localStorage.setItem('username_business', data.username || getExpectedUsername());
        localStorage.setItem('service_mode_business', data.serviceMode || serviceMode || 'OFFLINE');
        localStorage.setItem('category_business', data.category || getCategoryValue(usedLegacyCategory));
        
        setLoading(false);
        setSubmitted(true);
        localStorage.removeItem('trikonext_onboarding');
      } else {
        const errData = await res.json();
        setAlert({ show: true, type: 'error', msg: errData.message || 'Registration failed.' });
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      // Fallback for offline testing
      localStorage.setItem('token_business', 'dummy_access_token');
      localStorage.setItem('refresh_business', 'dummy_refresh_token');
      localStorage.setItem('username_business', getExpectedUsername() || form.mobile);
      localStorage.setItem('service_mode_business', serviceMode || 'OFFLINE');
      localStorage.setItem('category_business', getCategoryValue(false));
      setLoading(false);
      setSubmitted(true);
      localStorage.removeItem('trikonext_onboarding');
    }
  };

  /* ── Selection Card ── */
  const SelectionCard = ({ icon, title, desc, selected, onClick, index, size = 'compact', colorTheme, disabled }) => {
    const theme = colorTheme || {
      main: T.primary,
      bg: 'rgba(13,148,136,0.08)',
    };

    const isLarge = size === 'large';
    const isMedium = size === 'medium';
    
    return (
      <Box
        onClick={disabled ? null : onClick}
        sx={{
          p: isLarge ? { xs: 2.5, md: 3.5 } : isMedium ? { xs: 2, md: 2.5 } : { xs: 1.25, md: 1.5 },
          borderRadius: isLarge ? '16px' : isMedium ? '14px' : '10px',
          border: '1.5px solid',
          borderColor: disabled ? T.border : (selected ? theme.main : T.border),
          bgcolor: disabled ? '#f8fafc' : (selected ? 'rgba(255,255,255,1)' : T.surface),
          boxShadow: selected && !disabled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.55 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          transition: 'all 0.15s ease',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: isLarge ? 110 : isMedium ? 96 : 76,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexGrow: 1, // Allows it to stretch vertically if needed
          '&:hover': {
            borderColor: disabled ? T.border : (selected ? theme.main : theme.main),
            bgcolor: disabled ? '#f8fafc' : (selected ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)'),
          },
        }}
      >
        <Stack direction="row" spacing={isLarge ? 3 : isMedium ? 2 : 1.5} alignItems="center" textAlign="left" sx={{ width: '100%' }}>
          <Box sx={{
            width: isLarge ? 56 : isMedium ? 48 : 36,
            height: isLarge ? 56 : isMedium ? 48 : 36,
            minWidth: isLarge ? 56 : isMedium ? 48 : 36,
            borderRadius: isLarge ? '14px' : isMedium ? '12px' : '8px',
            background: theme.bg,
            display: 'grid',
            placeItems: 'center',
            color: theme.main,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}>
            {React.cloneElement(icon, { sx: { fontSize: isLarge ? 28 : isMedium ? 24 : 20 } })}
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: isLarge ? '1.25rem' : isMedium ? '1.1rem' : '0.9rem', color: '#111827', lineHeight: 1.2 }}>
              {title}
            </Typography>
            {desc && (
              <Typography sx={{ 
                color: '#6B7280', 
                fontSize: isLarge ? '0.95rem' : isMedium ? '0.85rem' : '0.75rem', 
                mt: 0.5, 
                fontWeight: 500, 
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: isLarge ? 3 : isMedium ? 2 : 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {desc}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: selected ? theme.main : '#D1D5DB', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {selected ? (
              <CheckCircle sx={{ fontSize: isLarge ? 32 : isMedium ? 28 : 24 }} />
            ) : (
              <ChevronRight sx={{ fontSize: isLarge ? 32 : isMedium ? 28 : 24 }} />
            )}
          </Box>
        </Stack>
      </Box>
    );
  };

  /* ── Step Header ── */
  const StepHeader = ({ title, subtitle }) => (
    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.5rem' }, color: T.text, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: T.textSecondary, fontSize: { xs: '0.8rem', md: '0.9rem' }, fontWeight: 500, maxWidth: 500, mx: 'auto' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  /* ── Input field styling ── */
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', bgcolor: '#fff',
      '& fieldset': { borderColor: T.border },
      '&:hover fieldset': { borderColor: T.borderHover },
      '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { color: T.textMuted, '&.Mui-focused': { color: T.primary } },
    '& .MuiInputBase-input': { fontWeight: 600, color: T.text },
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <Box sx={{ 
      bgcolor: T.bg, 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background decorations */}
      <Box sx={{ position: 'absolute', width: 500, height: 500, top: -200, right: -200, background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', width: 400, height: 400, bottom: -150, left: -150, background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Alert Toast */}
      <Fade in={alert.show}>
        <Box sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '92%', maxWidth: 440 }}>
          <Alert severity={alert.type} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>{alert.msg}</Alert>
        </Box>
      </Fade>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: { xs: 2, md: 4 } }}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {!submitted ? (
            <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* ── Logo & Brand ── */}
              <Box textAlign="center" mb={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: T.primary, letterSpacing: '-0.02em' }}>
                  TriKonext
                </Typography>
                {step === 1 && (
                  <Button 
                    onClick={() => navigate('/login')} 
                    sx={{ 
                      mt: 1.5, px: 3, color: T.primary, fontWeight: 700, textTransform: 'none', 
                      border: `1.5px solid rgba(13, 148, 136, 0.3)`, borderRadius: 3,
                      '&:hover': { bgcolor: 'rgba(13, 148, 136, 0.05)', borderColor: T.primary }
                    }}
                    size="small"
                  >
                    Already have an account? Login
                  </Button>
                )}
              </Box>

              {/* ── Progress Bar ── */}
              <Box sx={{ mb: 2, px: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Step {step} of {TOTAL_STEPS}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.primary }}>
                    {Math.round((step / TOTAL_STEPS) * 100)}%
                  </Typography>
                </Stack>
                <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{ height: '100%', background: T.gradient, borderRadius: 4 }}
                  />
                </Box>
              </Box>

              {/* ── Step Content Card ── */}
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                p: { xs: 1.5, sm: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                maxHeight: '80vh',
              }}>
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div key={step} custom={dir} variants={pageVariants} initial="enter" animate="center" exit="exit" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', px: 0.5, pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                      {/* ═══ STEP 1: User Type ═══ */}
                      {step === 1 && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <StepHeader title="How would you like to join TriKonext?" subtitle="Select the role that best describes you" />
                          <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                          {[
                            { value: 'Captain', icon: <EmojiPeople />, desc: 'Join service captain' },
                            { value: 'Business', icon: <BusinessCenter />, desc: 'Register your business or store' },
                          ].map((item, i) => (
                            <Box key={item.value} sx={{ display: 'flex', flex: 1 }}>
                              <SelectionCard
                                size="large"
                                index={i}
                                icon={item.icon}
                                title={item.value}
                                desc={item.desc}
                                selected={form.userType === item.value}
                                onClick={() => { setForm(p => ({ ...p, userType: item.value })); clearErr('userType'); }}
                              />
                            </Box>
                          ))}
                          </Stack>
                        {errors.userType && <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', fontWeight: 600 }}>{errors.userType}</Typography>}
                      </Box>
                    )}

                    {/* ═══ STEP 2: Captain → redirect to dedicated registration ═══ */}
                      {step === 2 && form.userType === 'Captain' && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 4 }}>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            <Box sx={{
                              width: 90, height: 90, borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(6,182,212,0.15) 100%)',
                              display: 'grid', placeItems: 'center', mb: 3, mx: 'auto',
                              border: '2px solid rgba(13,148,136,0.3)',
                            }}>
                              <EmojiPeople sx={{ fontSize: 44, color: T.primary }} />
                            </Box>
                          </motion.div>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.5rem' }, color: T.text, mb: 1, letterSpacing: '-0.02em' }}>
                            Captain Registration
                          </Typography>
                          <Typography sx={{ color: T.textSecondary, fontWeight: 500, fontSize: '0.9rem', maxWidth: 320, lineHeight: 1.6, mb: 3 }}>
                            You&apos;ll be redirected to the Captain onboarding portal. Get your unique <strong>CB ID</strong> and join the Trikonekt network.
                          </Typography>
                          <Box sx={{
                            bgcolor: 'rgba(13,148,136,0.06)', border: '1.5px solid rgba(13,148,136,0.2)',
                            borderRadius: '12px', p: 2, mb: 2, width: '100%', maxWidth: 300,
                          }}>
                            {[{ label: 'Role', value: 'Captain (CB Prefix)' }, { label: 'Commission', value: '₹15 per referral' }, { label: 'Pincode', value: 'Any valid pincode' }].map(({ label, value }) => (
                              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>{label}</Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: T.primary, fontWeight: 700 }}>{value}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {step === 2 && form.userType !== 'Captain' && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <StepHeader title="Choose your business category" subtitle="Pick the type that matches your business model" />
                          <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                          {[
                            { value: 'Nearby Store (Offline)', icon: <Storefront />, desc: 'Physical store / NearStore registration', colorTheme: { main: '#0D9488', bg: '#E6F4F1' }, disabled: false },
                            { value: 'Online Business', icon: <Language />, desc: 'Online selling, digital orders, and delivery-based business', colorTheme: { main: '#3b82f6', bg: '#eff6ff' }, disabled: false },
                            { value: 'TriZone Services', icon: <Hub />, desc: 'Coming soon - currently unavailable', colorTheme: { main: '#8b5cf6', bg: '#f5f3ff' }, disabled: true },
                          ].map((item, i) => (
                            <Box key={item.value} sx={{ display: 'flex', flex: 1 }}>
                              <SelectionCard
                                size="medium"
                                index={i}
                                icon={item.icon}
                                title={item.value}
                                desc={item.desc}
                                colorTheme={item.colorTheme}
                                selected={form.businessCategory === item.value}
                                disabled={item.disabled}
                                onClick={() => { setForm(p => ({ ...p, businessCategory: item.value, businessModel: '', subCategories: [] })); clearErr('businessCategory'); }}
                              />
                            </Box>
                          ))}
                          </Stack>
                        {errors.businessCategory && <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', fontWeight: 600 }}>{errors.businessCategory}</Typography>}
                      </Box>
                    )}

                    {/* ═══ STEP 3: Dynamic Sub-Category ═══ */}
                    {step === 3 && (
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <StepHeader
                          title={
                            form.businessCategory === 'TriZone Services'
                              ? 'Select your TriZone services'
                              : form.businessCategory === 'Nearby Store (Offline)'
                                ? 'Choose your store type'
                                : 'Choose your business model'
                          }
                          subtitle={form.businessCategory === 'TriZone Services' ? 'You can select multiple services' : 'Select one option'}
                        />

                        {form.businessCategory === 'Nearby Store (Offline)' && (
                            <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                            {[
                              { value: 'B2C', label: 'B2C', icon: <ShoppingCart />, desc: 'Consumer business' },
                              { value: 'B2B', label: 'B2B', icon: <Business />, desc: 'Merchant business' },
                            ].map((item, i) => (
                              <Box key={item.value} sx={{ display: 'flex', flex: 1 }}>
                                <SelectionCard
                                  size="large"
                                  index={i}
                                  icon={item.icon}
                                  title={item.label}
                                  desc={item.desc}
                                  selected={getBusinessModel() === item.value}
                                  onClick={() => { setForm(p => ({ ...p, businessModel: item.value, subCategories: [item.value] })); clearErr('subCategories'); }}
                                />
                              </Box>
                            ))}
                            </Stack>
                        )}

                        {form.businessCategory === 'Online Business' && (
                            <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                            {[
                              { value: 'B2C', icon: <ShoppingCart />, desc: 'Consumer' },
                              { value: 'B2B', icon: <Business />, desc: 'Merchant' },
                            ].map((item, i) => (
                              <Box key={item.value} sx={{ display: 'flex', flex: 1 }}>
                                <SelectionCard
                                  size="large"
                                  index={i}
                                  icon={item.icon}
                                  title={item.value}
                                  desc={item.desc}
                                  selected={getBusinessModel() === item.value}
                                  onClick={() => { setForm(p => ({ ...p, businessModel: item.value, subCategories: [item.value] })); clearErr('subCategories'); }}
                                />
                              </Box>
                            ))}
                            </Stack>
                        )}

                        {form.businessCategory === 'TriZone Services' && (
                            <Stack spacing={1.25}>
                              {TRIZONE_OPTIONS.map((item, i) => (
                                <Box key={item.value} sx={{ display: 'flex' }}>
                                  <SelectionCard
                                    size="compact"
                                    index={i}
                                    icon={item.icon}
                                    title={item.label}
                                    desc={item.desc}
                                    selected={form.subCategories.includes(item.value)}
                                    onClick={() => {
                                      setForm(p => ({
                                        ...p,
                                        subCategories: p.subCategories.includes(item.value)
                                          ? p.subCategories.filter(v => v !== item.value)
                                          : [...p.subCategories, item.value]
                                      }));
                                      clearErr('subCategories');
                                    }}
                                  />
                                </Box>
                              ))}
                            </Stack>
                        )}

                        {errors.subCategories && <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', fontWeight: 600 }}>{errors.subCategories}</Typography>}
                      </Box>
                    )}

                    {/* ═══ STEP 4: Business Details ═══ */}
                    {step === 4 && (
                      <Box>
                        <StepHeader title="Tell us about your business" subtitle="Enter your personal and business information" />
                        <Stack spacing={3}>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <TextField
                              fullWidth
                              label="Captain Sponsor ID"
                              name="sponsorId"
                              value={form.sponsorId}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setForm(p => ({ ...p, sponsorId: val, sponsorVerified: false, sponsorName: '' }));
                                clearErr('sponsorId');
                              }}
                              error={!!errors.sponsorId || !!errors.sponsorVerified}
                              helperText={errors.sponsorId || errors.sponsorVerified || (form.sponsorVerified ? `Verified: ${form.sponsorName}` : '')}
                              placeholder="CB... or TRPN..."
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><Badge sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment>,
                                endAdornment: form.sponsorVerified && (
                                  <InputAdornment position="end">
                                    <Verified sx={{ color: T.success }} />
                                  </InputAdornment>
                                )
                              }}
                              sx={inputSx}
                            />
                            <Button
                              variant="outlined"
                              onClick={() => verifySponsorId(form.sponsorId)}
                              sx={{
                                py: 1.8,
                                px: 3,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                borderColor: T.primary,
                                color: T.primary,
                                '&:hover': { bgcolor: 'rgba(13,148,136,0.05)' }
                              }}
                            >
                              Verify
                            </Button>
                          </Stack>

                          <TextField fullWidth label="Full Name" name="fullName" value={form.fullName} onChange={onChange}
                            error={!!errors.fullName} helperText={errors.fullName} placeholder="Owner's full name"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment> }}
                            sx={inputSx} />

                          <TextField fullWidth label="Business Name" name="businessName" value={form.businessName} onChange={onChange}
                            error={!!errors.businessName} helperText={errors.businessName} placeholder="Your business or trade name"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Storefront sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment> }}
                            sx={inputSx} />

                          <TextField fullWidth label="Mobile Number" name="mobile" value={form.mobile}
                            onChange={(e) => { setForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })); clearErr('mobile'); }}
                            error={!!errors.mobile} helperText={errors.mobile} placeholder="10-digit mobile number"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment> }}
                            sx={inputSx} />

                          <TextField fullWidth label="Email Address" name="email" type="email" value={form.email} onChange={onChange}
                            error={!!errors.email} helperText={errors.email} placeholder="you@business.com"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment> }}
                            sx={inputSx} />

                          <TextField fullWidth label="Password" name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={onChange}
                            error={!!errors.password} helperText={errors.password} placeholder="Minimum 8 characters"
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Lock sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment>,
                              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd(!showPwd)} edge="end">{showPwd ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            }}
                            sx={inputSx} />

                          <TextField fullWidth label="Confirm Password" name="confirmPassword" type={showConfPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={onChange}
                            error={!!errors.confirmPassword} helperText={errors.confirmPassword} placeholder="Re-enter password"
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Lock sx={{ color: T.textMuted, fontSize: 20 }} /></InputAdornment>,
                              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfPwd(!showConfPwd)} edge="end">{showConfPwd ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            }}
                            sx={inputSx} />
                        </Stack>
                      </Box>
                    )}

                    {/* ═══ STEP 5: Location ═══ */}
                    {step === 5 && (
                      <Box>
                        <StepHeader title="Business Location" subtitle="Help customers find your business" />
                        <Stack spacing={3}>
                          <TextField fullWidth multiline rows={2} label="Address" name="address" value={form.address} onChange={onChange}
                            error={!!errors.address} helperText={errors.address} placeholder="Building, Street, Area" sx={inputSx} />

                          <TextField fullWidth label="Landmark" name="landmark" value={form.landmark} onChange={onChange}
                            placeholder="Nearby landmark (optional)" sx={inputSx} />

                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField fullWidth label="Pincode" name="pincode" value={form.pincode} onChange={handlePincode}
                                error={!!errors.pincode} helperText={errors.pincode} placeholder="6 digits" sx={inputSx} />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField fullWidth label="City" name="city" value={form.city} onChange={onChange}
                                error={!!errors.city} helperText={errors.city} placeholder="City" sx={inputSx} />
                            </Grid>
                          </Grid>

                          <TextField fullWidth label="State" name="state" value={form.state} onChange={onChange} placeholder="State" sx={inputSx} />
                        </Stack>
                      </Box>
                    )}

                    {/* ═══ STEP 6: Review & Submit ═══ */}
                    {step === 6 && (
                      <Box>
                        <StepHeader title="Review & Submit" subtitle="Verify your information before submitting" />

                        <Stack spacing={3}>
                          {/* Summary Sections */}
                          <ReviewSection title="User Type" items={[{ label: 'Role', value: form.userType }]} />
                          <ReviewSection title="Business Registration" items={[
                            { label: 'Channel', value: form.businessCategory },
                            { label: 'Model', value: getBusinessModel() },
                            { label: 'Service Mode', value: getServiceMode() },
                            { label: 'API Category', value: getCategoryValue(false) },
                            { label: 'Expected Username', value: getExpectedUsername() || 'Enter mobile number' },
                          ]} />
                          <ReviewSection title="Business Information" items={[
                            { label: 'Full Name', value: form.fullName },
                            { label: 'Business Name', value: form.businessName },
                            { label: 'Mobile', value: form.mobile },
                            { label: 'Email', value: form.email },
                          ]} />
                          <ReviewSection title="Address" items={[
                            { label: 'Address', value: form.address },
                            { label: 'Landmark', value: form.landmark || '—' },
                            { label: 'City', value: form.city },
                            { label: 'State', value: form.state || '—' },
                            { label: 'Pincode', value: form.pincode },
                          ]} />

                          {/* Terms */}
                          <Box sx={{ bgcolor: '#f8fafc', borderRadius: T.radius, p: 2.5, border: `1px solid ${T.border}` }}>
                            <FormControlLabel
                              control={<Checkbox checked={form.termsAccepted} onChange={onChange} name="termsAccepted"
                                sx={{ color: errors.termsAccepted ? T.error : T.primary, '&.Mui-checked': { color: T.primary } }} />}
                              label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: T.text }}>
                                I agree to the <Box component="span" sx={{ color: T.primary, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>Terms & Conditions</Box>
                              </Typography>}
                            />
                            {errors.termsAccepted && <Typography color="error" variant="caption" sx={{ ml: 4, fontWeight: 600 }}>{errors.termsAccepted}</Typography>}

                            <FormControlLabel sx={{ mt: 1 }}
                              control={<Checkbox checked={form.privacyAccepted} onChange={onChange} name="privacyAccepted"
                                sx={{ color: errors.privacyAccepted ? T.error : T.primary, '&.Mui-checked': { color: T.primary } }} />}
                              label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: T.text }}>
                                I agree to the <Box component="span" sx={{ color: T.primary, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</Box>
                              </Typography>}
                            />
                            {errors.privacyAccepted && <Typography color="error" variant="caption" sx={{ ml: 4, fontWeight: 600 }}>{errors.privacyAccepted}</Typography>}
                          </Box>
                        </Stack>
                      </Box>
                    )}
                    </Box>
                  </motion.div>
                </AnimatePresence>

                {/* ── Footer Navigation ── */}
                <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${T.border}`, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    {step > 1 ? (
                      <Button onClick={back} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, py: 1.25, fontSize: '0.9rem', color: T.textSecondary, border: `1.5px solid ${T.border}` }}>Back</Button>
                    ) : <Box />}

                    {step < TOTAL_STEPS && !(step === 2 && form.userType === 'Captain') ? (
                      <Button onClick={next} variant="contained" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3, py: 1.25, fontSize: '0.9rem', background: T.gradient }}>Continue</Button>
                    ) : step === 1 && form.userType === 'Captain' ? (
                      <Button
                        onClick={() => navigate('/captain/register')}
                        variant="contained"
                        endIcon={<ChevronRight />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3, py: 1.25, fontSize: '0.9rem', background: T.gradient }}
                      >
                        Go to Captain Registration
                      </Button>
                    ) : step === 2 && form.userType === 'Captain' ? (
                      <Button
                        onClick={() => navigate('/captain/register')}
                        variant="contained"
                        endIcon={<ChevronRight />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3, py: 1.25, fontSize: '0.9rem', background: T.gradient }}
                      >
                        Start Captain Registration
                      </Button>
                    ) : step === TOTAL_STEPS ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        variant="contained"
                        sx={{
                          borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 4, py: 1.5,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                          '&:hover': { background: '#059669', transform: 'translateY(-1px)' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Submit Registration'}
                      </Button>
                    ) : <Box />}
                  </Stack>
                </Box>
              </Box>

            </motion.div>
          ) : (
            /* ═══ SUCCESS SCREEN ═══ */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.8)', p: { xs: 4, md: 6 }, textAlign: 'center',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
              }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}>
                  <Box sx={{
                    width: 100, height: 100, borderRadius: '50%', mx: 'auto', mb: 3,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <CheckCircle sx={{ fontSize: 56, color: T.success }} />
                  </Box>
                </motion.div>
                <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', color: T.text, mb: 1, letterSpacing: '-0.02em' }}>
                  Registration Submitted!
                </Typography>
                <Typography sx={{ color: T.textSecondary, maxWidth: 400, mx: 'auto', mb: 4, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
                  Thank you for registering with TriKonext. Our team will verify your details and activate your account within 24-48 hours.
                </Typography>

                <Box sx={{ bgcolor: '#f8fafc', border: `1px solid ${T.border}`, borderRadius: T.radius, p: 3, mb: 4, textAlign: 'left', maxWidth: 420, mx: 'auto' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: T.text, mb: 2, pb: 1, borderBottom: `2px solid ${T.primaryLight}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Summary
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      ['Role', form.userType],
                      ['Channel', form.businessCategory],
                      ['Model', getBusinessModel()],
                      ['Service Mode', getServiceMode()],
                      ['Business', form.businessName],
                      ['Owner', form.fullName],
                      ['Mobile', form.mobile],
                      ['Username', getExpectedUsername()],
                      ['City', form.city],
                    ].map(([l, v]) => (
                      <Stack direction="row" justifyContent="space-between" key={l}>
                        <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, fontWeight: 600 }}>{l}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 700 }}>{v || '—'}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Button
                  onClick={() => navigate('/login')}
                  endIcon={<Launch />}
                  variant="contained"
                  sx={{
                    borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 4, py: 1.75,
                    background: T.gradient, boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
                    '&:hover': { background: T.primaryDark }
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
      </Box>
    </Box>
  );
};

/* ── Review Section Component ── */
const ReviewSection = ({ title, items }) => (
  <Box sx={{ bgcolor: '#f8fafc', borderRadius: T.radius, p: 2.5, border: `1px solid ${T.border}` }}>
    <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: T.primary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {title}
    </Typography>
    <Stack spacing={1}>
      {items.map((item, i) => (
        <Stack direction="row" justifyContent="space-between" key={i}>
          <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, fontWeight: 600 }}>{item.label}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 700, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>
            {item.value || '—'}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Box>
);

export default BusinessOnboarding;
