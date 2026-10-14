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
  Phone, LocationOn, Email, Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const TOTAL_STEPS = 4;

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
  return { score: 100, label: 'Very Strong', color: '#EA580C' };
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
      borderColor: hasError ? '#ef4444' : '#EA580C',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#EA580C',
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

  // Merchant-only registration
  const role = 'BUSINESS';

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
    storeName: '',
    operatingModel: 'ONLINE', // 'ONLINE' | 'OFFLINE' | 'TRIZONE'
    salesType: 'B2C',         // 'B2B' | 'B2C' | 'BOTH'
    serviceMode: 'ONLINE',    // 'ONLINE' | 'OFFLINE' | 'BOTH'
    businessModel: 'B2C',     // 'B2B' | 'B2C'
    category: 'General Store / Others',
    storeAddress: '',
    address: '',
    fullName: '',
    phone: '',
    storeContactNumber: '',
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
      let data = null;
      try { data = await res.json(); } catch (_) {}

      if ((!data || !data.valid) && is10DigitMobile) {
        try {
          const cbRes = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent('CB' + cleanDigits)}`);
          try {
            const cbData = await cbRes.json();
            if (cbData && cbData.valid) data = cbData;
          } catch (_) {}
        } catch (_) {}
      }

      if (data && data.valid === true) {
        setSponsorInfo({
          sponsorId: data.sponsorId || id,
          sponsorName: data.sponsorName || 'Captain Partner',
          category: data.category || 'agency_sub_franchise',
          pincode: data.pincode || '',
          district: data.district || '',
          state: data.state || '',
          valid: true,
        });
        setSponsorVerifying(false);
        return;
      } else {
        setSponsorError(role === 'BUSINESS'
          ? "Captain not found or inactive. Please enter a registered 10-digit Captain mobile or official Captain ID (CB/TRPN)."
          : "Sponsor not found or inactive. Please enter a valid registered Sponsor ID or mobile number.");
      }
    } catch (netErr) {
      setSponsorError("Unable to verify sponsor right now. Please check your network connection.");
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
  /* ── Validation ── */
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!sponsorInfo || !sponsorInfo.valid) {
        e.sponsor = 'Verify your Captain Sponsor to proceed';
      }
    }
    if (s === 2) {
      if (!form.businessName.trim()) e.businessName = 'Business name is required';
      if (!form.fullName.trim()) e.fullName = 'Owner full name is required';
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Valid 10-digit mobile number required';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
      if (form.pincode.length !== 6) e.pincode = 'Valid 6-digit pincode is required';
    }
    if (s === 3) {
      if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
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
    if (!validate(3)) {
      setStep(3);
      return;
    }
    setLoading(true);
    setAlertMsg('');

    try {
      const backendCategory = (form.salesType === 'B2B') ? 'merchant_business' : 'consumer_business';
      let resolvedServiceMode = form.operatingModel; // 'ONLINE' | 'OFFLINE' | 'TRIZONE'
      if (resolvedServiceMode === 'TRIZONE') {
        resolvedServiceMode = 'BOTH';
      }

      const payload = {
        sponsorId: (sponsorInfo?.sponsorId || sponsorId).trim().toUpperCase(),
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        phone: form.phone.replace(/\D/g, ''),
        email: form.email.trim() || undefined,
        password: form.password,
        address: `${form.district || 'City'}, Pincode: ${form.pincode}`,
        city: form.district?.trim() || 'Bengaluru',
        pincode: form.pincode,
        serviceMode: resolvedServiceMode,
        category: backendCategory,
        discountPercent: 5.0,
      };

      const res = await fetch(`${CAPTAIN_API}/captain/merchant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 201) {
        const token = data.access || data.token;
        if (token) {
          localStorage.setItem('token_business', token);
          if (data.username) localStorage.setItem('business_username', data.username);
          if (data.fullName || data.full_name) localStorage.setItem('business_full_name', data.fullName || data.full_name);
          localStorage.setItem('service_mode_business', resolvedServiceMode);
          localStorage.setItem('user_category', backendCategory);
        }
        localStorage.removeItem(storageKey);
        setSubmitted(true);
      } else {
        throw new Error(data.message || data.error || data.detail || 'Registration failed. Check if phone is already registered.');
      }
    } catch (error) {
      setAlertMsg(error.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  const stepLabels = ['Sponsor', 'Business', 'Security', 'Review'];


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
        background: 'linear-gradient(180deg, #EA580C 0%, rgba(4,120,87,0) 100%)',
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
            Merchant Store Registration
          </Typography>
        </Box>

        {/* Business Portal Indicator */}
        <Box sx={{
          bgcolor: '#FFF7ED',
          borderRadius: '16px',
          px: 1.5,
          py: 0.4,
          border: '1px solid #FED7AA',
        }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C' }}>
            Tri-Business
          </Typography>
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
                      bgcolor: isCurrent || isDone ? '#EA580C' : '#ffffff',
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
                      color: isCurrent ? '#EA580C' : isDone ? '#0f172a' : '#94a3b8',
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
                      bgcolor: stepNum < step ? '#EA580C' : '#e2e8f0',
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
                        border: `1.5px solid ${sponsorError || errors.sponsor ? '#ef4444' : sponsorInfo ? '#10b981' : '#cbd5e1'}`,
                        borderRadius: '14px',
                        bgcolor: '#ffffff',
                        px: 1.5,
                        py: 0.6,
                        transition: 'all 0.2s',
                        '&:focus-within': {
                          borderColor: '#EA580C',
                          boxShadow: '0 0 0 3px rgba(8, 127, 91, 0.12)',
                        },
                      }}>
                        <Person sx={{ color: '#94a3b8', fontSize: 22, mr: 1 }} />

                        <TextField
                          fullWidth
                          variant="standard"
                          value={sponsorId}
                          onChange={e => {
                            setSponsorId(e.target.value);
                            setSponsorInfo(null);
                            setSponsorError('');
                          }}
                          placeholder={role === 'BUSINESS' ? "CB9689570448" : "e.g. 9876543210"}
                          onKeyDown={e => e.key === 'Enter' && verifySponsor()}
                          InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' },
                          }}
                        />

                        {sponsorId && (
                          <IconButton
                            size="small"
                            onClick={() => { setSponsorId(''); setSponsorInfo(null); }}
                            sx={{ color: '#94a3b8', p: 0.5, mr: 0.8 }}
                          >
                            <CloseIcon sx={{ fontSize: 18 }} />
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
                            fontSize: '0.86rem',
                            bgcolor: '#EA580C',
                            color: '#ffffff',
                            px: 2.2,
                            py: 0.75,
                            minWidth: 78,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#C2410C' },
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

                    {/* Card 1: Verified Sponsor Confirmation Card (Exact Match to Mockup) */}
                    {sponsorInfo && (
                      <Box sx={{
                        bgcolor: '#f0fdf4',
                        border: '1.5px solid #FED7AA',
                        borderRadius: '16px',
                        p: 2,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                          <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#15803d' }}>
                            Captain Verified
                          </Typography>
                        </Box>

                        <Stack spacing={0.6}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Name</Typography>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{sponsorInfo.sponsorName}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Captain ID</Typography>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{sponsorInfo.sponsorId}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Territory</Typography>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{sponsorInfo.district || 'Bengaluru Urban'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Pincode Zone</Typography>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{sponsorInfo.pincode || '5600XX'}</Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {/* Card 2: You're now linked with Captain */}
                    {sponsorInfo && (
                      <Box sx={{
                        bgcolor: '#f0fdfa',
                        border: '1px solid #ccfbf1',
                        borderRadius: '16px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.8,
                      }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: '#e6fdf5',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          border: '1px solid #99f6e4',
                        }}>
                          <Storefront sx={{ fontSize: 26, color: '#EA580C' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', mb: 0.3 }}>
                            You're now linked with Captain
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                            You can register your business under this Captain and get access to local support, orders and growth opportunities.
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Card 3: Why link with a Captain? 3-column benefits */}
                    <Box sx={{
                      bgcolor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      p: 2,
                    }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', mb: 1.5 }}>
                        💡 Why link with a Captain?
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, textAlign: 'center' }}>
                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                          <Typography sx={{ fontSize: 22, mb: 0.5 }}>🤝</Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#0f172a' }}>
                            Local Support
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                          <Typography sx={{ fontSize: 22, mb: 0.5 }}>📊</Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#0f172a' }}>
                            Faster Approvals
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                          <Typography sx={{ fontSize: 22, mb: 0.5 }}>👥</Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#0f172a' }}>
                            Access to More Buyers
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card 4: Info Note */}
                    <Box sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: '14px',
                      p: 1.5,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                    }}>
                      <Typography sx={{ color: '#64748b', fontSize: 18 }}>ⓘ</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                        Enter any active Trikonekt Captain's 10-digit mobile number, or their official CB or TRPN code.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 2: BUSINESS & MODEL SETUP
              ══════════════════════════════════════════ */}
              {step === 2 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#102033', letterSpacing: '-0.02em', mb: 0.4 }}>
                      Business & Model Setup
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                      Choose your business operating model and enter legal owner details.
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel label="Business Name" required error={errors.businessName} />
                      <TextField
                        fullWidth
                        value={form.businessName}
                        onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                        placeholder="e.g. Metro Mart / Online B2C Store"
                        sx={inputSx(!!errors.businessName)}
                      />
                      {errors.businessName && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.businessName}</Typography>}
                    </Box>

                    <Box>
                      <FieldLabel label="Business Category" required />
                      <FormControl fullWidth>
                        <Select
                          value={form.category}
                          onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                          sx={{
                            borderRadius: '12px', bgcolor: '#ffffff', fontSize: '0.92rem', fontWeight: 600,
                            '& fieldset': { borderColor: '#cbd5e1', borderWidth: 1.5 },
                            '&:hover fieldset': { borderColor: '#EA580C' },
                            '&.Mui-focused fieldset': { borderColor: '#EA580C', borderWidth: 2 },
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

                    {/* Business Operating Model (Online / Offline / TriZone) */}
                    <Box>
                      <FieldLabel label="Business Operating Model" required />
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2 }}>
                        {[
                          { id: 'ONLINE', icon: '🌐', title: 'Online', desc: 'Sell on Trikonekt Online Marketplace' },
                          { id: 'OFFLINE', icon: '🏬', title: 'Offline', desc: 'Physical Store (Scan & Pay QR)' },
                          { id: 'TRIZONE', icon: '⚖️', title: 'TriZone', desc: 'Territory Hyperlocal Network' },
                        ].map(m => {
                          const isSelected = form.operatingModel === m.id;
                          return (
                            <Box
                              key={m.id}
                              onClick={() => setForm(p => ({ ...p, operatingModel: m.id, serviceMode: m.id === 'TRIZONE' ? 'BOTH' : m.id }))}
                              sx={{
                                p: 1.6,
                                borderRadius: '14px',
                                border: `1.5px solid ${isSelected ? '#EA580C' : '#e2e8f0'}`,
                                bgcolor: isSelected ? '#f0fdf4' : '#ffffff',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                '&:hover': { borderColor: '#EA580C' },
                              }}
                            >
                              <Typography sx={{ fontSize: 24, mb: 0.5 }}>{m.icon}</Typography>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? '#EA580C' : '#0f172a', mb: 0.3 }}>
                                {m.title}
                              </Typography>
                              <Typography sx={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.3 }}>
                                {m.desc}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Sales Type (B2B / B2C / Both) */}
                    <Box>
                      <FieldLabel label="Sales Type" required />
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2 }}>
                        {[
                          { id: 'B2B', title: 'B2B', desc: 'Wholesale Business' },
                          { id: 'B2C', title: 'B2C', desc: 'Retail Consumer' },
                          { id: 'BOTH', title: 'Both', desc: 'B2B & B2C Multi-tier' },
                        ].map(s => {
                          const isSelected = form.salesType === s.id;
                          return (
                            <Box
                              key={s.id}
                              onClick={() => setForm(p => ({ ...p, salesType: s.id, businessModel: s.id === 'BOTH' ? 'B2C' : s.id }))}
                              sx={{
                                p: 1.4,
                                borderRadius: '14px',
                                border: `1.5px solid ${isSelected ? '#EA580C' : '#e2e8f0'}`,
                                bgcolor: isSelected ? '#f0fdf4' : '#ffffff',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': { borderColor: '#EA580C' },
                              }}
                            >
                              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: isSelected ? '#EA580C' : '#0f172a' }}>
                                {s.title}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                                {s.desc}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Owner Full Name */}
                    <Box>
                      <FieldLabel label="Owner Full Name" required error={errors.fullName} />
                      <TextField
                        fullWidth
                        value={form.fullName}
                        onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="e.g. Ramesh Kumar"
                        sx={inputSx(!!errors.fullName)}
                      />
                      {errors.fullName && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.fullName}</Typography>}
                    </Box>

                    {/* Mobile Number */}
                    <Box>
                      <FieldLabel label="Mobile Number (Login ID)" required error={errors.phone} />
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
                          endAdornment: form.phone.length === 10 ? (
                            <InputAdornment position="end">
                              <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                      {errors.phone && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.phone}</Typography>}
                    </Box>

                    {/* Official Email */}
                    <Box>
                      <FieldLabel label="Official Email" badge="(Optional)" error={errors.email} />
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

                    {/* Business Pincode with Auto Location */}
                    <Box>
                      <FieldLabel label="Business Location Pincode" required error={errors.pincode} />
                      <TextField
                        fullWidth
                        value={form.pincode || ''}
                        onChange={e => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 560001"
                        inputMode="numeric"
                        sx={inputSx(!!errors.pincode)}
                        InputProps={{
                          endAdornment: form.pincodeLoading ? (
                            <InputAdornment position="end"><CircularProgress size={16} sx={{ color: '#EA580C' }} /></InputAdornment>
                          ) : form.pincodeVerified ? (
                            <InputAdornment position="end">
                              <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                      {form.district && form.state && (
                        <Typography sx={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 700, mt: 0.5 }}>
                          📍 {form.district}, {form.state}
                        </Typography>
                      )}
                      {errors.pincode && <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, mt: 0.5 }}>{errors.pincode}</Typography>}
                    </Box>

                    {/* Post-Registration Dashboard Info Note */}
                    <Box sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: '14px',
                      p: 1.8,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                    }}>
                      <Typography sx={{ color: '#EA580C', fontSize: 18, lineHeight: 1 }}>ⓘ</Typography>
                      <Box>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', mb: 0.2 }}>
                          Store Setup & KYC Completed in Dashboard
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                          Store location, POS scanner, inventory catalog, and official verification (PAN & GST) are configured easily inside your Merchant Dashboard after login.
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 3: SECURITY & CREDENTIALS
              ══════════════════════════════════════════ */}
              {step === 3 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.4 }}>
                      Account Security
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                      Set up your login password and accept terms.
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <FieldLabel label="Set Password" required error={errors.password} />
                      <TextField
                        fullWidth
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
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
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: strength.color, mt: 0.6 }}>
                          {strength.label} password
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <FieldLabel label="Confirm Password" required error={errors.confirmPassword} />
                      <TextField
                        fullWidth
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
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
                    </Box>

                    {/* 4 Password Rules Checklist */}
                    <Box sx={{ mt: 1 }}>
                      <Stack spacing={0.6}>
                        {[
                          { text: 'At least 8 characters', met: form.password.length >= 8 },
                          { text: 'One uppercase letter', met: /[A-Z]/.test(form.password) },
                          { text: 'One lowercase letter', met: /[a-z]/.test(form.password) },
                          { text: 'One number or special character', met: /[0-9^A-Za-z0-9]/.test(form.password) },
                        ].map((rule, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 16, height: 16, borderRadius: '50%',
                              bgcolor: rule.met ? '#10b981' : '#e2e8f0',
                              color: '#fff', display: 'grid', placeItems: 'center',
                              fontSize: '0.65rem',
                            }}>
                              {rule.met ? '✓' : ''}
                            </Box>
                            <Typography sx={{ fontSize: '0.74rem', color: rule.met ? '#0f172a' : '#64748b', fontWeight: rule.met ? 700 : 500 }}>
                              {rule.text}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Terms & Conditions confirmation */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.termsAccepted}
                          onChange={e => setForm(p => ({ ...p, termsAccepted: e.target.checked }))}
                          sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '0.74rem', color: '#334155', fontWeight: 600 }}>
                          I agree to the <Box component="span" sx={{ color: '#EA580C', textDecoration: 'underline' }}>Terms & Conditions</Box> and <Box component="span" sx={{ color: '#EA580C', textDecoration: 'underline' }}>Privacy Policy</Box>
                        </Typography>
                      }
                    />
                    {errors.termsAccepted && (
                      <Typography sx={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600 }}>
                        {errors.termsAccepted}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════
                  STEP 4: REVIEW & SUBMIT
              ══════════════════════════════════════════ */}
              {step === 4 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', mb: 0.3 }}>
                      Review & Register
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                      Please review your details before launching your business account.
                    </Typography>
                  </Box>

                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {/* Card 1: Sponsor Information */}
                    <Box sx={{ bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', p: 1.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 18, color: '#EA580C' }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                            Captain Sponsor
                          </Typography>
                        </Box>
                        <Typography
                          onClick={() => setStep(1)}
                          sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#EA580C', cursor: 'pointer' }}
                        >
                          Edit
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
                        {sponsorInfo?.sponsorName || 'Captain Partner'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                        ID: {sponsorInfo?.sponsorId || sponsorId} • {sponsorInfo?.district || 'Territory'}
                      </Typography>
                    </Box>

                    {/* Card 2: Business & Model Information */}
                    <Box sx={{ bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', p: 1.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Store sx={{ fontSize: 18, color: '#EA580C' }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                            Business Details
                          </Typography>
                        </Box>
                        <Typography
                          onClick={() => setStep(2)}
                          sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#EA580C', cursor: 'pointer' }}
                        >
                          Edit
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
                        {form.businessName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Category: {form.category}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Model: <strong>{form.operatingModel === 'ONLINE' ? 'Online' : form.operatingModel === 'OFFLINE' ? 'Offline' : 'TriZone'} [{form.salesType}]</strong>
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Location: {form.district || 'City'}, {form.state || 'State'} - {form.pincode}
                      </Typography>
                    </Box>

                    {/* Card 3: Owner / Login Credentials */}
                    <Box sx={{ bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', p: 1.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Lock sx={{ fontSize: 18, color: '#EA580C' }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                            Owner & Login ID
                          </Typography>
                        </Box>
                        <Typography
                          onClick={() => setStep(2)}
                          sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#EA580C', cursor: 'pointer' }}
                        >
                          Edit
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
                        {form.fullName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Login Mobile: +91 {form.phone}
                      </Typography>
                      {form.email && (
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Email: {form.email}
                        </Typography>
                      )}
                    </Box>

                    {/* Post-Registration Roadmap Card */}
                    <Box sx={{ bgcolor: '#f0fdf4', borderRadius: '16px', border: '1.5px solid #FED7AA', p: 1.8 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', mb: 0.8 }}>
                        ✓ Post-Registration Setup (Inside Dashboard)
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: '0.73rem', color: '#334155' }}>
                          1. <strong>Business KYC:</strong> Add PAN & GST documents for payout verification.
                        </Typography>
                        <Typography sx={{ fontSize: '0.73rem', color: '#334155' }}>
                          2. <strong>Store Details:</strong> Configure physical store location & Scan & Pay POS.
                        </Typography>
                        <Typography sx={{ fontSize: '0.73rem', color: '#334155' }}>
                          3. <strong>Product Catalog:</strong> Add wholesale/retail inventory items.
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ── Bottom Full-Width Continue / Create Account Button ── */}
              <Box sx={{ mt: 'auto', pt: 1, pb: 2 }}>
                {step < TOTAL_STEPS ? (
                  <Button
                    fullWidth
                    onClick={next}
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    variant="contained"
                    sx={{
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.4,
                      bgcolor: '#EA580C',
                      fontSize: '0.94rem',
                      boxShadow: '0 4px 14px rgba(8, 127, 91, 0.25)',
                      '&:hover': { bgcolor: '#C2410C' },
                    }}
                  >
                    Continue →
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    endIcon={!loading && <ArrowForward sx={{ fontSize: 18 }} />}
                    sx={{
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.4,
                      bgcolor: '#EA580C',
                      fontSize: '0.94rem',
                      boxShadow: '0 4px 14px rgba(8, 127, 91, 0.25)',
                      '&:hover': { bgcolor: '#C2410C' },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Create Account →'
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
                bgcolor: '#EA580C',
                display: 'grid',
                placeItems: 'center',
                color: '#ffffff',
                mb: 2.5,
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)',
              }}>
                <Check sx={{ fontSize: 44, stroke: '#ffffff', strokeWidth: 1.5 }} />
              </Box>

              <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                Registration Successful!
              </Typography>

              <Typography sx={{ color: '#64748b', fontSize: '0.86rem', fontWeight: 500, mb: 3 }}>
                Welcome to Trikonekt Business
              </Typography>

              {/* 4 Green Bullet Items */}
              <Box sx={{ width: '100%', maxWidth: 320, textAlign: 'left', mb: 4 }}>
                <Stack spacing={1.5}>
                  {[
                    'Merchant account created',
                    `Model: ${form.operatingModel === 'ONLINE' ? 'Online' : form.operatingModel === 'OFFLINE' ? 'Offline' : 'TriZone'} [${form.salesType}]`,
                    'Captain sponsor linked',
                    'Ready for KYC & Store setup',
                  ].map((item, i) => (
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

              {/* Action Buttons */}
              <Box sx={{ width: '100%', mt: 'auto' }}>
                <Button
                  fullWidth
                  onClick={() => navigate('/business-dashboard')}
                  variant="contained"
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1.4,
                    bgcolor: '#EA580C',
                    fontSize: '0.94rem',
                    mb: 1.2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#C2410C' },
                  }}
                >
                  Go to Business Dashboard →
                </Button>

                <Button
                  fullWidth
                  onClick={() => navigate('/business/kyc')}
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    color: '#EA580C',
                    borderColor: '#EA580C',
                    py: 1.2,
                    fontSize: '0.88rem',
                    mb: 1,
                    '&:hover': { bgcolor: '#f0fdf4', borderColor: '#C2410C' },
                  }}
                >
                  Complete KYC (PAN & GST) Now
                </Button>

                <Button
                  fullWidth
                  onClick={() => navigate('/login')}
                  variant="text"
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    color: '#64748b',
                    fontSize: '0.84rem',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  Return to Login
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

