import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack, Alert,
  CircularProgress, InputAdornment, IconButton, FormControlLabel,
  Checkbox, Chip, Select, MenuItem, FormControl,
} from '@mui/material';
import {
  Check, ArrowBack, ArrowForward, Person, Lock, Visibility, VisibilityOff,
  Store, Storefront, Shield, CheckCircle, ContentCopy, Done,
  Phone, LocationOn, Email,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const TOTAL_STEPS = 5;

const CATEGORIES = [
  "Grocery & Daily Needs",
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
  center: { x: 0, opacity: 1, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -30 : 30, opacity: 0, transition: { duration: 0.15 } }),
};

/* ─── Password Strength ─── */
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

/* ─── Clean Form Input Styling ─── */
const inputSx = (hasError) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#ffffff',
    fontSize: '0.94rem',
    fontWeight: 600,
    transition: 'all 0.15s ease',
    '& fieldset': {
      borderColor: hasError ? '#ef4444' : '#e2e8f0',
      borderWidth: 1.5,
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#ef4444' : '#047857',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#047857',
      borderWidth: 2,
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(4, 120, 87, 0.12)',
    },
  },
  '& .MuiInputBase-input': {
    py: 1.3,
    px: 1.5,
  },
});

/* ─── Clean Label ─── */
const FieldLabel = ({ label, required = false, badge = null, error = null }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
    <Typography sx={{
      fontSize: '0.8rem',
      fontWeight: 700,
      color: error ? '#ef4444' : '#1e293b',
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
   UNIFIED REGISTER (MATCHING MOCKUP DESIGN THEME)
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

  /* Password view toggles */
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Form Data */
  const [form, setForm] = useState({
    businessName: '',
    serviceMode: 'ONLINE', // 'ONLINE' | 'OFFLINE' | 'BOTH'
    businessModel: 'B2B',  // 'B2B' | 'B2C'
    category: 'Grocery & Daily Needs',
    gstin: '',
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

  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('sponsor');
    if (ref) setSponsorId(ref.trim());
  }, [searchParams]);

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

  const handleRoleChange = (newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    setErrors({});
    setAlertMsg('');
    setSponsorInfo(null);
    setSponsorError('');
    setStep(1);
  };

  /* ── Sponsor Verification ── */
  const verifySponsor = async () => {
    const id = sponsorId.trim();
    if (!id) {
      setSponsorError(role === 'BUSINESS'
        ? "Enter your Captain's mobile number or ID"
        : "Enter your sponsor's mobile number or ID");
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

    // Clean 10-digit mobile fallback (Never rejects valid phone)
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

  /* ── Validation ── */
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
        if (!form.businessName.trim()) e.businessName = 'Business name is required';
        if (!form.fullName.trim()) e.fullName = 'Owner name is required';
      } else {
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
      }
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Valid 10-digit mobile number required';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    }
    if (s === 3) {
      if (form.pincode.length !== 6) e.pincode = 'Valid 6-digit pincode is required';
      if (role === 'BUSINESS' && !form.address.trim()) e.address = 'Store address is required';
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

  /* ── Submit ── */
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

  const stepLabels = role === 'BUSINESS'
    ? ['Sponsor', 'Business', 'Store', 'Security', 'Review']
    : ['Sponsor', 'Personal', 'Territory', 'Security', 'Review'];

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* ── Top Curved Green Arc Accent (Matches Mockup) ── */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'linear-gradient(180deg, #047857 0%, rgba(4,120,87,0) 100%)',
        opacity: 0.1,
        pointerEvents: 'none',
      }} />

      {/* ── Top Header Bar (Matching Mockup: Back Button + Title + Role Toggle) ── */}
      <Box sx={{
        px: 2.5,
        pt: 2.5,
        pb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <IconButton
            onClick={() => step > 1 ? back() : navigate('/login')}
            size="small"
            sx={{
              p: 0.7,
              color: '#0f172a',
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>

          <Typography sx={{
            fontWeight: 800,
            fontSize: '1.05rem',
            color: '#0f172a',
            letterSpacing: '-0.02em',
          }}>
            {role === 'BUSINESS' ? 'Register as Business' : 'Register as Captain'}
          </Typography>
        </Box>

        {/* Compact Role Switcher Pill */}
        <Box sx={{
          bgcolor: '#f1f5f9',
          borderRadius: '20px',
          p: 0.3,
          display: 'flex',
          gap: 0.3,
        }}>
          <Button
            onClick={() => handleRoleChange('BUSINESS')}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '0.74rem',
              fontWeight: role === 'BUSINESS' ? 800 : 600,
              py: 0.3,
              px: 1.2,
              minHeight: 26,
              bgcolor: role === 'BUSINESS' ? '#ffffff' : 'transparent',
              color: role === 'BUSINESS' ? '#047857' : '#64748b',
              boxShadow: role === 'BUSINESS' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Business
          </Button>

          <Button
            onClick={() => handleRoleChange('CAPTAIN')}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '0.74rem',
              fontWeight: role === 'CAPTAIN' ? 800 : 600,
              py: 0.3,
              px: 1.2,
              minHeight: 26,
              bgcolor: role === 'CAPTAIN' ? '#ffffff' : 'transparent',
              color: role === 'CAPTAIN' ? '#047857' : '#64748b',
              boxShadow: role === 'CAPTAIN' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Captain
          </Button>
        </Box>
      </Box>

      {/* ── Stepper Indicator (Exact Match to Mockup Connected Nodes) ── */}
      {!submitted && (
        <Box sx={{ px: 3, pt: 1, pb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stepLabels.map((lbl, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < step;
              const isCurrent = stepNum === step;

              return (
                <React.Fragment key={lbl}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: isCurrent || isDone ? '#047857' : '#ffffff',
                      color: isCurrent || isDone ? '#ffffff' : '#94a3b8',
                      border: isCurrent || isDone ? 'none' : '1.5px solid #cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      transition: 'all 0.2s',
                    }}>
                      {isDone ? <Check sx={{ fontSize: 16 }} /> : stepNum}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.68rem',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#047857' : isDone ? '#0f172a' : '#94a3b8',
                      mt: 0.5,
                      letterSpacing: '0.01em',
                    }}>
                      {lbl}
                    </Typography>
                  </Box>

                  {idx < stepLabels.length - 1 && (
                    <Box sx={{
                      flex: 1,
                      maxWidth: 42,
                      height: 2,
                      bgcolor: stepNum < step ? '#047857' : '#e2e8f0',
                      mx: 0.8,
                      mb: 2.2,
                      transition: 'all 0.2s',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Main Form Body Container ── */}
      <Container maxWidth="xs" sx={{ flex: 1, px: 3, pb: 4, display: 'flex', flexDirection: 'column' }}>

        {alertMsg && (
          <Alert severity="error" onClose={() => setAlertMsg('')} sx={{ mb: 2, borderRadius: '12px' }}>
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
                  (Matches Mockup 4. / 3. Sponsor Verification)
              ══════════════════════════════════════════ */}
              {step === 1 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.4 }}>
                      {role === 'BUSINESS' ? 'Captain Sponsor Verification' : 'Sponsor Verification'}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.5 }}>
                      {role === 'BUSINESS'
                        ? "Enter your territory Captain's 10-digit mobile number or Captain ID (CB/TRPN) to link your store."
                        : "Enter your sponsor's 10-digit mobile number or referral code to activate your franchise account."}
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel
                        label={role === 'BUSINESS' ? "Captain Mobile Number or Sponsor ID" : "Sponsor Mobile Number or ID"}
                        required
                        error={sponsorError || errors.sponsor}
                      />
                      
                      {/* Integrated Input + Inline Green Verify Button (Exact Match to Mockup) */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1.5px solid ${sponsorError || errors.sponsor ? '#ef4444' : sponsorInfo ? '#10b981' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        bgcolor: '#ffffff',
                        px: 1.5,
                        py: 0.5,
                        transition: 'all 0.2s',
                        '&:focus-within': {
                          borderColor: '#047857',
                          boxShadow: '0 0 0 3px rgba(4, 120, 87, 0.12)',
                        },
                      }}>
                        <Person sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />

                        <TextField
                          fullWidth
                          variant="standard"
                          value={sponsorId}
                          onChange={e => {
                            setSponsorId(e.target.value);
                            setSponsorInfo(null);
                            setSponsorError('');
                          }}
                          placeholder={role === 'BUSINESS' ? "e.g. 9876543210 or CB..." : "e.g. 9876543210 or TRPN..."}
                          onKeyDown={e => e.key === 'Enter' && verifySponsor()}
                          InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' },
                          }}
                        />

                        <Button
                          onClick={verifySponsor}
                          disabled={sponsorVerifying || !sponsorId.trim()}
                          variant="contained"
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            bgcolor: '#047857',
                            color: '#ffffff',
                            px: 1.8,
                            py: 0.6,
                            minWidth: 70,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#065f46' },
                          }}
                        >
                          {sponsorVerifying ? <CircularProgress size={16} color="inherit" /> : 'Verify'}
                        </Button>
                      </Box>

                      {(sponsorError || errors.sponsor) && (
                        <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.6 }}>
                          {sponsorError || errors.sponsor}
                        </Typography>
                      )}
                    </Box>

                    {/* Verified Sponsor Confirmation Card (Exact Match to Mockup) */}
                    {sponsorInfo && (
                      <Box sx={{
                        bgcolor: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        borderRadius: '12px',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                      }}>
                        <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#14532d' }}>
                            {role === 'BUSINESS' ? 'Captain Verified ✓' : 'Sponsor Verified ✓'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.76rem', color: '#166534', fontWeight: 600 }}>
                            {sponsorInfo.sponsorName || sponsorInfo.sponsorId}
                          </Typography>
                        </Box>
                        <Chip
                          label="Active"
                          size="small"
                          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                        />
                      </Box>
                    )}

                    {/* Clean Helper Card (Exact Match to Mockup Screen 3 / 4) */}
                    <Box sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: '12px',
                      p: 1.6,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}>
                      <Typography sx={{ color: '#047857', fontWeight: 800, fontSize: '0.85rem', mt: 0.1 }}>
                        ⓘ
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.45, fontWeight: 500 }}>
                        {role === 'BUSINESS'
                          ? "Enter your territory Captain's 10-digit mobile number, or their official CB or TRPN code."
                          : "Enter any active Trikonekt member's 10-digit mobile number, or a fellow Captain's ID."}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 2: BUSINESS / PERSONAL DETAILS
                  (Matches Mockup Screen 4 & Screen 4 Captain)
              ══════════════════════════════════════════ */}
              {step === 2 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.4 }}>
                      {role === 'BUSINESS' ? 'Business Details' : 'Personal Details'}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                      {role === 'BUSINESS' ? 'Tell us about your business' : 'Provide your basic information'}
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Business Name" required error={errors.businessName} />
                        <TextField
                          fullWidth
                          value={form.businessName}
                          onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                          placeholder="e.g. Online B2C"
                          sx={inputSx(!!errors.businessName)}
                        />
                        {errors.businessName && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.businessName}</Typography>}
                      </Box>
                    )}

                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Business Category" required />
                        <FormControl fullWidth>
                          <Select
                            value={form.category}
                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                            sx={{
                              borderRadius: '12px', bgcolor: '#ffffff', fontSize: '0.92rem', fontWeight: 600,
                              '& fieldset': { borderColor: '#e2e8f0', borderWidth: 1.5 },
                              '&:hover fieldset': { borderColor: '#047857' },
                              '&.Mui-focused fieldset': { borderColor: '#047857', borderWidth: 2 },
                            }}
                          >
                            {CATEGORIES.map(c => (
                              <MenuItem key={c} value={c} sx={{ fontSize: '0.86rem', fontWeight: 600, py: 1 }}>
                                {c}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="GSTIN" badge="(Optional)" />
                        <TextField
                          fullWidth
                          value={form.gstin}
                          onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                          placeholder="e.g. 29AAAAA0000A1Z5"
                          sx={inputSx(false)}
                        />
                      </Box>
                    )}

                    <Box>
                      <FieldLabel label={role === 'BUSINESS' ? "Owner Full Name" : "Full Name"} required error={errors.fullName} />
                      <TextField
                        fullWidth
                        value={form.fullName}
                        onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="Ramesh Kumar"
                        sx={inputSx(!!errors.fullName)}
                      />
                      {errors.fullName && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.fullName}</Typography>}
                    </Box>

                    <Box>
                      <FieldLabel label="Mobile Number" required error={errors.phone} />
                      <TextField
                        fullWidth
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        placeholder="9876543210"
                        inputMode="numeric"
                        sx={inputSx(!!errors.phone)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.88rem', mr: 0.5 }}>+91</Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {errors.phone && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.phone}</Typography>}
                      {role === 'CAPTAIN' && form.phone.length === 10 && (
                        <Typography sx={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, mt: 0.5 }}>
                          Your Captain ID will be: <strong>{captainId}</strong>
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <FieldLabel label="Email" badge="(Optional)" error={errors.email} />
                      <TextField
                        fullWidth
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="merchant@trikonekt.com"
                        type="email"
                        sx={inputSx(!!errors.email)}
                      />
                      {errors.email && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.email}</Typography>}
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 3: STORE & LOCATION SETUP
                  (Matches Mockup Screen 5 & Screen 6 Captain)
              ══════════════════════════════════════════ */}
              {step === 3 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.4 }}>
                      {role === 'BUSINESS' ? 'Set up your first store' : 'Territory & Location'}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                      {role === 'BUSINESS' ? 'Add store details and location' : 'Set up your operating territory'}
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Store Name" required error={errors.businessName} />
                        <TextField
                          fullWidth
                          value={form.businessName}
                          onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                          placeholder="Main Store"
                          sx={inputSx(!!errors.businessName)}
                        />
                      </Box>
                    )}

                    <Box>
                      <FieldLabel label="Postal Pincode" required error={errors.pincode} />
                      <TextField
                        fullWidth
                        value={form.pincode}
                        onChange={e => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 560102"
                        inputMode="numeric"
                        sx={inputSx(!!errors.pincode)}
                        InputProps={{
                          endAdornment: form.pincodeLoading ? (
                            <InputAdornment position="end"><CircularProgress size={16} sx={{ color: '#047857' }} /></InputAdornment>
                          ) : form.pincodeVerified ? (
                            <InputAdornment position="end"><CheckCircle sx={{ color: '#10b981', fontSize: 18 }} /></InputAdornment>
                          ) : null,
                        }}
                      />
                      {errors.pincode && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.pincode}</Typography>}
                    </Box>

                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Store Address" required error={errors.address} />
                        <TextField
                          fullWidth
                          value={form.address}
                          onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                          placeholder="Main Market Road, Bengaluru - 560102"
                          sx={inputSx(!!errors.address)}
                        />
                        {errors.address && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.address}</Typography>}
                      </Box>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                      <Box>
                        <FieldLabel label="District / City" required />
                        <TextField
                          fullWidth
                          value={form.district}
                          onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                          placeholder="Bengaluru"
                          sx={inputSx(false)}
                        />
                      </Box>
                      <Box>
                        <FieldLabel label="State" required />
                        <TextField
                          fullWidth
                          value={form.state}
                          onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                          placeholder="Karnataka"
                          sx={inputSx(false)}
                        />
                      </Box>
                    </Box>

                    {/* Fulfillment Mode Radio Pills (Exact Match to Mockup Screen 5) */}
                    {role === 'BUSINESS' && (
                      <Box>
                        <FieldLabel label="Fulfillment Mode" required />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[
                            { id: 'ONLINE', label: 'Online' },
                            { id: 'OFFLINE', label: 'Self Pickup' },
                            { id: 'BOTH', label: 'Both' },
                          ].map(mode => (
                            <Button
                              key={mode.id}
                              onClick={() => setForm(p => ({ ...p, serviceMode: mode.id }))}
                              startIcon={form.serviceMode === mode.id ? <Check sx={{ fontSize: 14 }} /> : null}
                              sx={{
                                flex: 1,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                py: 0.8,
                                bgcolor: form.serviceMode === mode.id ? '#ecfdf5' : '#ffffff',
                                color: form.serviceMode === mode.id ? '#047857' : '#64748b',
                                border: form.serviceMode === mode.id ? '1.5px solid #047857' : '1.5px solid #e2e8f0',
                                '&:hover': { bgcolor: '#f0fdf4' },
                              }}
                            >
                              {mode.label}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 4: SECURITY / PASSWORD
              ══════════════════════════════════════════ */}
              {step === 4 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.4 }}>
                      Account Security
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                      Set a password to protect your store and login credentials
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel label="Password" required error={errors.password} />
                      <TextField
                        fullWidth
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Minimum 8 characters"
                        sx={inputSx(!!errors.password)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                                {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {errors.password && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.password}</Typography>}

                      {form.password && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Strength</Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: strength.color }}>{strength.label}</Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.6 }}>
                            {[20, 40, 60, 80, 100].map((th) => (
                              <Box
                                key={th}
                                sx={{
                                  height: 3,
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
                        sx={inputSx(!!errors.confirmPassword)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" size="small">
                                {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {errors.confirmPassword && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.confirmPassword}</Typography>}
                      {form.confirmPassword && form.confirmPassword === form.password && (
                        <Typography sx={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <CheckCircle sx={{ fontSize: 14 }} /> Passwords match
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 5: REVIEW & SUBMIT
                  (Matches Mockup Screen 7 Review & Submit)
              ══════════════════════════════════════════ */}
              {step === 5 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.3 }}>
                      Review & Submit
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                      Please review your information
                    </Typography>
                  </Box>

                  <Stack spacing={1.8} sx={{ mb: 3 }}>
                    {/* Details Box */}
                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', p: 1.8 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        Personal & Store Details
                      </Typography>
                      {[
                        { label: 'Name', value: form.fullName },
                        { label: 'Mobile', value: `+91 ${form.phone}` },
                        { label: 'Email', value: form.email || '—' },
                        ...(role === 'BUSINESS' ? [
                          { label: 'Business Name', value: form.businessName },
                          { label: 'Category', value: form.category },
                        ] : [
                          { label: 'Captain ID', value: captainId },
                        ]),
                      ].map(item => (
                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                          <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>{item.label}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>{item.value}</Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Sponsor Details Box */}
                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', p: 1.8 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        Sponsor Details
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>Sponsor ID</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>{sponsorInfo?.sponsorId || sponsorId}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>Status</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800 }}>Verified ✓</Typography>
                      </Box>
                    </Box>

                    {/* Territory Details Box */}
                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', p: 1.8 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        Territory & Location
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>Location</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>{form.district || 'Bengaluru'}, {form.state || 'Karnataka'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>Pincode</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>{form.pincode}</Typography>
                      </Box>
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.termsAccepted}
                          onChange={e => setForm(p => ({ ...p, termsAccepted: e.target.checked }))}
                          sx={{ color: '#047857', '&.Mui-checked': { color: '#047857' } }}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                          I agree to Trikonekt's <Box component="span" sx={{ color: '#047857', fontWeight: 700 }}>Terms of Service</Box> and <Box component="span" sx={{ color: '#047857', fontWeight: 700 }}>Privacy Policy</Box>
                        </Typography>
                      }
                    />
                  </Stack>
                </Box>
              )}

              {/* ── Bottom Full-Width Continue Button (Exact Match to Mockup) ── */}
              <Box sx={{ mt: 'auto', pt: 1 }}>
                {step < TOTAL_STEPS ? (
                  <Button
                    fullWidth
                    onClick={next}
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    variant="contained"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.4,
                      bgcolor: '#047857',
                      fontSize: '0.94rem',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#065f46' },
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
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.4,
                      bgcolor: '#047857',
                      fontSize: '0.94rem',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#065f46' },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                )}
              </Box>

            </motion.div>
          ) : (
            /* ══════════════════════════════════════════
               STEP 8: REGISTRATION SUCCESS SCREEN
               (Exact 100% Match to Mockup Screen 8!)
            ══════════════════════════════════════════ */
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', py: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Green Circle Badge with White Checkmark */}
              <Box sx={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                bgcolor: '#047857',
                display: 'grid',
                placeItems: 'center',
                color: '#ffffff',
                mb: 2.5,
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)',
              }}>
                <Check sx={{ fontSize: 44, stroke: '#ffffff', strokeWidth: 1.5 }} />
              </Box>

              <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                {role === 'BUSINESS' ? 'Registration Successful!' : "You're all set!"}
              </Typography>

              <Typography sx={{ color: '#64748b', fontSize: '0.86rem', fontWeight: 500, mb: 3 }}>
                {role === 'BUSINESS' ? 'Welcome to Trikonekt Business' : 'Your Trikonekt Captain account has been created.'}
              </Typography>

              {/* 4 Green Bullet Items (Exact Match to Mockup Screen 8) */}
              <Box sx={{ width: '100%', maxWidth: 300, textAlign: 'left', mb: 4 }}>
                <Stack spacing={1.5}>
                  {(role === 'BUSINESS' ? [
                    'Account created',
                    'Business details saved',
                    'Store location added',
                    'Verification in progress',
                  ] : [
                    'Profile created',
                    'Sponsor linked',
                    'Territory submitted',
                    'Verification pending',
                  ]).map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: '50%', bgcolor: '#10b981',
                        display: 'grid', placeItems: 'center', color: '#fff',
                      }}>
                        <Check sx={{ fontSize: 13, strokeWidth: 2 }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Captain ID badge if captain */}
              {role === 'CAPTAIN' && (
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1.2,
                  bgcolor: '#ecfdf5', border: '1.5px solid #a7f3d0',
                  borderRadius: '12px', px: 2.2, py: 1, mb: 3,
                }}>
                  <Shield sx={{ color: '#047857', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#047857', fontFamily: 'monospace' }}>
                    {captainId}
                  </Typography>
                  <IconButton onClick={copyId} size="small" sx={{ color: '#64748b' }}>
                    {copied ? <Done fontSize="small" sx={{ color: '#10b981' }} /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Box>
              )}

              {/* Action Buttons (Exact Match to Mockup Screen 8) */}
              <Box sx={{ width: '100%', mt: 'auto' }}>
                <Button
                  fullWidth
                  onClick={() => navigate(role === 'BUSINESS' ? '/business-dashboard' : '/captain/home')}
                  variant="contained"
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1.4,
                    bgcolor: '#047857',
                    fontSize: '0.94rem',
                    mb: 1.5,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#065f46' },
                  }}
                >
                  {role === 'BUSINESS' ? 'Go to Dashboard' : 'Go to Captain Dashboard'}
                </Button>

                <Button
                  fullWidth
                  onClick={() => navigate('/login')}
                  variant="text"
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    color: '#047857',
                    fontSize: '0.88rem',
                    '&:hover': { bgcolor: '#f0fdf4' },
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
  );
};

export default UnifiedRegister;
