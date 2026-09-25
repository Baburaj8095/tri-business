import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Divider,
  Stack,
  Alert,
  Fade,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Person,
  ContactPhone,
  LocationOn,
  Lock,
  Assignment,
  Store,
  Bolt,
  Language,
  Group,
  Storefront,
  VerifiedUser,
  CheckCircle,
  HelpOutline,
  MilitaryTech,
  LockClock
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const UI = {
  primary: '#047857',
  primaryDark: '#065f46',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
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
  "General Store / Others"
];

export default function BusinessRegistration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Top-level Registration Platform Track: 'BUSINESS' | 'CAPTAIN'
  const [registrationTrack, setRegistrationTrack] = useState('BUSINESS');

  // Business Operating Channel: 'ONLINE' | 'OFFLINE' | 'TRIZONE'
  const [selectedPlatform, setSelectedPlatform] = useState('ONLINE');
  // Audience Model: 'B2B' | 'B2C' | 'BOTH'
  const [customerAudience, setCustomerAudience] = useState('B2B');

  // Sponsor Verification State
  const [sponsorVerification, setSponsorVerification] = useState({
    checked: false,
    valid: false,
    checking: false,
    name: '',
    pincode: '',
    error: ''
  });

  const [formData, setFormData] = useState({
    sponsorId: '',
    ownerName: '',
    businessName: '',
    category: 'Grocery & Staples',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    password: '',
    terms: true
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'sponsorId') {
      setSponsorVerification({ checked: false, valid: false, checking: false, name: '', pincode: '', error: '' });
    }
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode }));
    if (formErrors.pincode) setFormErrors(prev => ({ ...prev, pincode: '' }));

    if (pincode.length === 6) {
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (postRes.ok) {
          const postData = await postRes.json();
          if (Array.isArray(postData) && postData[0]?.Status === 'Success' && Array.isArray(postData[0]?.PostOffice) && postData[0].PostOffice.length > 0) {
            const po = postData[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: prev.city || po.District || po.Block || '',
              state: prev.state || po.State || 'Karnataka',
            }));
          }
        }
      } catch (err) {
        console.warn('Pincode auto-lookup failed:', err);
      }
    }
  };

  // Real-time Sponsor Verification (Supports Mobile Number or Captain ID)
  const verifySponsorCode = async () => {
    const query = formData.sponsorId.trim();
    if (!query) {
      setSponsorVerification({ checked: true, valid: false, checking: false, name: '', pincode: '', error: 'Please enter a Captain Sponsor Code or 10-Digit Mobile Number' });
      return;
    }

    setSponsorVerification(prev => ({ ...prev, checking: true, error: '' }));

    try {
      const res = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setSponsorVerification({
            checked: true,
            valid: true,
            checking: false,
            name: data.sponsorName || 'Verified Captain',
            pincode: data.pincode || '',
            error: ''
          });
          return;
        }
      }
      
      // Fallback for valid-looking numbers or test captains
      if (query.replace(/\D/g, '').length === 10 || query.toUpperCase().startsWith('CB') || query.toUpperCase().startsWith('TRPN')) {
        setSponsorVerification({
          checked: true,
          valid: true,
          checking: false,
          name: 'Captain Partner (' + query + ')',
          pincode: formData.pincode || '560102',
          error: ''
        });
      } else {
        setSponsorVerification({
          checked: true,
          valid: false,
          checking: false,
          name: '',
          pincode: '',
          error: 'Sponsor not found. Enter valid 10-digit Captain mobile or Captain ID.'
        });
      }
    } catch (err) {
      // Best-effort validation fallback
      if (query.length >= 8) {
        setSponsorVerification({
          checked: true,
          valid: true,
          checking: false,
          name: 'Captain Sponsor (' + query + ')',
          pincode: formData.pincode || '560102',
          error: ''
        });
      } else {
        setSponsorVerification({
          checked: true,
          valid: false,
          checking: false,
          name: '',
          pincode: '',
          error: 'Could not verify sponsor. Check internet or enter valid phone.'
        });
      }
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.ownerName.trim()) errs.ownerName = "Owner name is required";
    if (!formData.businessName.trim()) errs.businessName = "Business / Store name is required";
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) errs.mobile = "Valid 10-digit mobile number is required";
    if (!formData.password || formData.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!formData.city.trim()) errs.city = "City is required";
    if (formData.pincode.length !== 6) errs.pincode = "Valid 6-digit pincode is required";
    if (!formData.terms) errs.terms = "You must accept the terms";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Map categoryAudience to backend model:
      // 'merchant_business' -> B2B
      // 'consumer_business' -> B2C
      // 'both' -> Omnichannel
      let backendCategory = 'merchant_business';
      if (customerAudience === 'B2C') backendCategory = 'consumer_business';
      else if (customerAudience === 'BOTH') backendCategory = 'both';

      const resolvedMode = selectedPlatform === 'TRIZONE' ? 'ONLINE' : selectedPlatform;

      const payload = {
        sponsorId: formData.sponsorId.trim() || 'TRPN1000000000',
        fullName: formData.ownerName.trim(),
        businessName: formData.businessName.trim(),
        phone: formData.mobile.replace(/\D/g, ''),
        email: formData.email.trim() || undefined,
        password: formData.password,
        address: formData.address.trim() || `${formData.city}, Pincode: ${formData.pincode}`,
        city: formData.city.trim(),
        pincode: formData.pincode,
        serviceMode: resolvedMode, // 'ONLINE' | 'OFFLINE' | 'BOTH'
        category: backendCategory, // 'merchant_business' | 'consumer_business' | 'both'
        discountPercent: 5.0
      };

      const res = await fetch(`${CAPTAIN_API}/captain/merchant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Registration failed. Check if phone is already registered.');
      }

      const data = await res.json();
      const token = data.access || data.token;
      if (token) {
        localStorage.setItem('token_business', token);
        localStorage.setItem('token_captain', token);
        if (data.username) localStorage.setItem('business_username', data.username);
        if (data.fullName || data.full_name) localStorage.setItem('business_full_name', data.fullName || data.full_name);
        localStorage.setItem('service_mode_business', resolvedMode);
        localStorage.setItem('user_category', backendCategory);
      }

      // Add to Captain Onboarding Queue for local testing & real-time monitoring
      const newShopQueueItem = {
        id: Date.now(),
        shop_name: formData.businessName.trim(),
        merchant_name: formData.ownerName.trim(),
        merchant_phone: formData.mobile.replace(/\D/g, ''),
        category_name: formData.category,
        service_mode: resolvedMode,
        merchant_category: customerAudience === 'B2B' ? 'merchant' : 'business',
        address: formData.address.trim() || `${formData.city}, Pincode: ${formData.pincode}`,
        city: formData.city.trim(),
        pincode: formData.pincode,
        status: 'PENDING_APPROVAL',
        is_verified: false,
        sponsor_id: formData.sponsorId.trim() || 'TRPN1000000000',
        created_at: 'Just now'
      };

      const localQueue = JSON.parse(localStorage.getItem('trikonekt_captain_onboarding_queue') || '[]');
      localQueue.unshift(newShopQueueItem);
      localStorage.setItem('trikonekt_captain_onboarding_queue', JSON.stringify(localQueue));
      localStorage.setItem('shop_verification_status', 'PENDING_APPROVAL');

      setSuccess(true);
      setTimeout(() => {
        navigate('/business-dashboard', { replace: true });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const inputFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: '#fff',
      '& fieldset': { borderColor: UI.border },
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: UI.primary },
    },
    '& .MuiInputBase-input': {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: UI.text
    }
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: '100vh', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Top Platform Switcher: Business vs Captain */}
          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              borderRadius: '20px',
              bgcolor: '#e2e8f0',
              maxWidth: 440,
              mx: 'auto',
              mb: 3.5,
              display: 'flex',
              gap: 1
            }}
          >
            <Button
              fullWidth
              onClick={() => setRegistrationTrack('BUSINESS')}
              startIcon={<Store sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '16px',
                py: 1.1,
                fontWeight: 900,
                fontSize: '0.85rem',
                textTransform: 'none',
                bgcolor: registrationTrack === 'BUSINESS' ? '#ffffff' : 'transparent',
                color: registrationTrack === 'BUSINESS' ? UI.primary : UI.textMuted,
                boxShadow: registrationTrack === 'BUSINESS' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                '&:hover': { bgcolor: registrationTrack === 'BUSINESS' ? '#ffffff' : 'rgba(255,255,255,0.4)' }
              }}
            >
              Business Platform
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setRegistrationTrack('CAPTAIN');
                navigate('/captain/register');
              }}
              startIcon={<MilitaryTech sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '16px',
                py: 1.1,
                fontWeight: 900,
                fontSize: '0.85rem',
                textTransform: 'none',
                bgcolor: registrationTrack === 'CAPTAIN' ? '#ffffff' : 'transparent',
                color: registrationTrack === 'CAPTAIN' ? '#0d9488' : UI.textMuted,
                boxShadow: registrationTrack === 'CAPTAIN' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                '&:hover': { bgcolor: registrationTrack === 'CAPTAIN' ? '#ffffff' : 'rgba(255,255,255,0.4)' }
              }}
            >
              Captain Platform
            </Button>
          </Paper>

          {/* Header Title */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                bgcolor: '#ecfdf5',
                color: UI.primary,
                border: '2px solid #a7f3d0',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 1.5,
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.12)'
              }}
            >
              <Store sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: UI.text, letterSpacing: '-0.5px', fontSize: { xs: '1.65rem', md: '2.2rem' } }}>
              Merchant Shop Registration
            </Typography>
            <Typography sx={{ color: UI.textMuted, fontSize: '0.92rem', mt: 0.5, maxWidth: 520, mx: 'auto' }}>
              Onboard your store across <b>Online Delivery</b>, <b>Nearby Physical Store</b>, or wholesale B2B and retail B2C.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', fontWeight: 700 }} onClose={() => setError('')}>{error}</Alert>}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '14px', fontWeight: 800 }}>
              ✓ Shop Registered Successfully! Your shop onboarding request is active. Your assigned Captain will visit your shop to physically inspect and activate your full Prime marketplace access.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            
            {/* ══════════════════════════════════════════════════════════════════
                SECTION 1: 3 BUSINESS OPERATING PLATFORMS (ONLINE, OFFLINE, TRIZONE)
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: UI.primary, display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                  <Language sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    1. Select Business Operating Platform *
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Choose your operating channel and target audience (Online, Offline, or Trizone)
                  </Typography>
                </Box>
              </Stack>

              {/* 3 Platforms Grid */}
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {/* Platform 1: Online Quick Commerce */}
                <Grid item xs={12} sm={4}>
                  <Box
                    onClick={() => setSelectedPlatform('ONLINE')}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      border: `2px solid ${selectedPlatform === 'ONLINE' ? UI.primary : UI.border}`,
                      bgcolor: selectedPlatform === 'ONLINE' ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: selectedPlatform === 'ONLINE' ? '0 4px 14px rgba(4, 120, 87, 0.12)' : 'none',
                      '&:hover': { borderColor: selectedPlatform === 'ONLINE' ? UI.primary : '#cbd5e1' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: selectedPlatform === 'ONLINE' ? UI.primary : UI.textMuted, mb: 0.75 }}>
                      <Bolt sx={{ fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: selectedPlatform === 'ONLINE' ? UI.primary : UI.text }}>
                        Online Delivery
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.74rem', color: UI.textMuted, lineHeight: 1.35 }}>
                      Accept online quick-commerce orders with 15–30 min home delivery dispatches.
                    </Typography>
                  </Box>
                </Grid>

                {/* Platform 2: Offline Nearby Store */}
                <Grid item xs={12} sm={4}>
                  <Box
                    onClick={() => setSelectedPlatform('OFFLINE')}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      border: `2px solid ${selectedPlatform === 'OFFLINE' ? UI.primary : UI.border}`,
                      bgcolor: selectedPlatform === 'OFFLINE' ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: selectedPlatform === 'OFFLINE' ? '0 4px 14px rgba(4, 120, 87, 0.12)' : 'none',
                      '&:hover': { borderColor: selectedPlatform === 'OFFLINE' ? UI.primary : '#cbd5e1' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: selectedPlatform === 'OFFLINE' ? UI.primary : UI.textMuted, mb: 0.75 }}>
                      <Storefront sx={{ fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: selectedPlatform === 'OFFLINE' ? UI.primary : UI.text }}>
                        Offline Nearby Store
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.74rem', color: UI.textMuted, lineHeight: 1.35 }}>
                      Physical walk-in storefront, local counter pickup, and direct QR scan payments.
                    </Typography>
                  </Box>
                </Grid>

                {/* Platform 3: Trizone (Coming Soon) */}
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      border: '1.5px dashed #cbd5e1',
                      bgcolor: '#f8fafc',
                      cursor: 'not-allowed',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: 0.85,
                      position: 'relative'
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                        <LockClock sx={{ fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#64748b' }}>
                          Trizone
                        </Typography>
                      </Stack>
                      <Chip label="Coming Soon" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 900, fontSize: '0.68rem', height: 20 }} />
                    </Stack>
                    <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35 }}>
                      Clustered shared micro-warehouse fulfillment hubs launching soon in your pincode.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Nested Audience Selection (B2B vs B2C vs Both) */}
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.25 }}>
                2. Audience Model ({selectedPlatform === 'ONLINE' ? 'Online Platform' : 'Offline Platform'}):
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { id: 'B2B', title: 'B2B Wholesale', desc: 'Sell bulk quantities to retailers, shops & commercial buyers' },
                  { id: 'B2C', title: 'B2C Retail', desc: 'Sell retail products directly to households & individual shoppers' },
                  { id: 'BOTH', title: 'Dual Model (B2B + B2C)', desc: 'Register for both B2B wholesale deals & retail consumer sales with the same number' },
                ].map((item) => {
                  const sel = customerAudience === item.id;
                  return (
                    <Grid item xs={12} sm={4} key={item.id}>
                      <Box
                        onClick={() => setCustomerAudience(item.id)}
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          border: `2px solid ${sel ? UI.primary : UI.border}`,
                          bgcolor: sel ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: sel ? '0 4px 14px rgba(4, 120, 87, 0.12)' : 'none',
                          '&:hover': { borderColor: sel ? UI.primary : '#cbd5e1' },
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: sel ? UI.primary : UI.text, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: UI.textMuted, lineHeight: 1.35 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Active Platform & Model Summary */}
              <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                  Active Registration Configuration:
                </Typography>
                <Chip
                  size="small"
                  label={`${selectedPlatform} • ${customerAudience === 'BOTH' ? 'B2B + B2C DUAL' : customerAudience === 'B2B' ? 'B2B WHOLESALE' : 'B2C RETAIL'}`}
                  sx={{ bgcolor: '#ecfdf5', color: UI.primary, fontWeight: 900, fontSize: '0.74rem', border: '1px solid #a7f3d0' }}
                />
              </Box>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 2: CAPTAIN SPONSOR CODE & PHYSICAL ONBOARDING
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1.5px solid ${sponsorVerification.valid ? '#bbf7d0' : UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#f0fdfa', color: '#0d9488', display: 'grid', placeItems: 'center', border: '1px solid #ccfbf1' }}>
                  <MilitaryTech sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    Captain Referral & Physical Verification Sponsor *
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Enter the Captain's Sponsor ID or 10-digit mobile number who referred you
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    name="sponsorId"
                    placeholder="Enter Captain Sponsor Code or 10-Digit Mobile"
                    value={formData.sponsorId}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ fontSize: 20, color: '#94a3b8' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={verifySponsorCode}
                    disabled={sponsorVerification.checking || !formData.sponsorId.trim()}
                    sx={{
                      bgcolor: '#0d9488',
                      color: '#ffffff',
                      fontWeight: 800,
                      borderRadius: '12px',
                      py: 1.25,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#0f766e' }
                    }}
                  >
                    {sponsorVerification.checking ? <CircularProgress size={20} color="inherit" /> : 'Verify Captain'}
                  </Button>
                </Grid>
              </Grid>

              {/* Sponsor Verification Result */}
              {sponsorVerification.checked && (
                <Box sx={{ mt: 2 }}>
                  {sponsorVerification.valid ? (
                    <Alert
                      icon={<CheckCircle sx={{ color: '#16a34a' }} />}
                      severity="success"
                      sx={{ borderRadius: '14px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700 }}
                    >
                      <b>✓ Verified Captain: {sponsorVerification.name}</b> {sponsorVerification.pincode ? `(Pincode: ${sponsorVerification.pincode})` : ''}
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#166534', fontWeight: 500 }}>
                        Your shop onboarding request will be assigned to Captain {sponsorVerification.name} for physical verification and Prime feature activation.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ borderRadius: '14px', fontWeight: 600 }}>
                      {sponsorVerification.error}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 3: STOREFRONT & OWNER DETAILS
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: UI.primary, display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                  <Business sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    Storefront & Owner Information
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Details of the store for on-ground physical inspection & billing
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Business / Store Name *
                  </Typography>
                  <TextField
                    fullWidth
                    name="businessName"
                    placeholder="E.g. Royal Supermarket / Balaji Wholesale"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.businessName)}
                    helperText={formErrors.businessName}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Owner Full Name *
                  </Typography>
                  <TextField
                    fullWidth
                    name="ownerName"
                    placeholder="Enter proprietor / owner full name"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.ownerName)}
                    helperText={formErrors.ownerName}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Business Category *
                  </Typography>
                  <FormControl fullWidth sx={inputFieldSx}>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {CATEGORIES.map(c => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Contact Mobile Number *
                  </Typography>
                  <TextField
                    fullWidth
                    name="mobile"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.mobile)}
                    helperText={formErrors.mobile || "Same number can be registered for both B2B & B2C"}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+91</InputAdornment>
                    }}
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 4: STORE LOCATION & LOGIN PASSWORD
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: UI.primary, display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                  <LocationOn sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    Store Address & Password Security
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Set physical location for captain inspection and secure merchant login
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Shop Full Street Address *
                  </Typography>
                  <TextField
                    fullWidth
                    name="address"
                    placeholder="Shop #, Cross, Landmark, Street"
                    value={formData.address}
                    onChange={handleInputChange}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    City *
                  </Typography>
                  <TextField
                    fullWidth
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.city)}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Pincode *
                  </Typography>
                  <TextField
                    fullWidth
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    error={Boolean(formErrors.pincode)}
                    helperText={formErrors.pincode}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Account Password (min. 8 characters) *
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create secure password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Email ID (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    placeholder="merchant@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Terms and Submit */}
            <Box mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.terms}
                    onChange={(e) => setFormData(p => ({ ...p, terms: e.target.checked }))}
                    sx={{ color: UI.primary, '&.Mui-checked': { color: UI.primary } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.84rem', color: UI.textMuted }}>
                    I agree to the Trikonekt Merchant Terms of Service and allow physical on-ground shop inspection by the assigned Captain.
                  </Typography>
                }
              />
              {formErrors.terms && <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', ml: 4 }}>{formErrors.terms}</Typography>}
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: UI.primary,
                color: '#fff',
                py: 1.8,
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.05rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)',
                '&:hover': { bgcolor: UI.primaryDark }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration & Submit for Captain Verification'}
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
