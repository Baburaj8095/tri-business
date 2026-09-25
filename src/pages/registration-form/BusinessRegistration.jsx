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
  Storefront
} from '@mui/icons-material';
import { motion } from 'framer-motion';

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

  // Business Profile Channels (Matrix Selection)
  // serviceMode: 'ONLINE' | 'OFFLINE' | 'BOTH'
  const [serviceMode, setServiceMode] = useState('ONLINE');
  // customerAudience: 'B2B' | 'B2C' | 'BOTH'
  const [customerAudience, setCustomerAudience] = useState('B2B');

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
  };

  const handlePincodeChange = (e) => {
    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode }));
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
        serviceMode: serviceMode, // 'ONLINE' | 'OFFLINE' | 'BOTH'
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
        localStorage.setItem('service_mode_business', serviceMode);
        localStorage.setItem('user_category', backendCategory);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/business-dashboard', { replace: true });
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: '100vh', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
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
              Merchant Store Registration
            </Typography>
            <Typography sx={{ color: UI.textMuted, fontSize: '0.92rem', mt: 0.5, maxWidth: 480, mx: 'auto' }}>
              Register your business across Online Delivery, Nearby Storefronts, B2B Wholesale, or Retail.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', fontWeight: 700 }} onClose={() => setError('')}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            
            {/* ══════════════════════════════════════════════════════════════════
                SECTION 1: BUSINESS CHANNEL & AUDIENCE SELECTOR MATRIX
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: UI.primary, display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                  <Language sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    Channel & Audience Type *
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Choose how your store operates and who you sell to
                  </Typography>
                </Box>
              </Stack>

              {/* Selector A: Service Operation Mode */}
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.25 }}>
                1. Operating Channel:
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {[
                  { id: 'ONLINE', icon: <Bolt sx={{ fontSize: 20 }} />, title: 'Online Quick Commerce', desc: 'Accept online orders with home delivery & 15-30m dispatch' },
                  { id: 'OFFLINE', icon: <Storefront sx={{ fontSize: 20 }} />, title: 'Nearby Physical Store', desc: 'Walk-in storefront, in-store pickup, and counter payments' },
                  { id: 'BOTH', icon: <Language sx={{ fontSize: 20 }} />, title: 'Omnichannel (Both)', desc: 'Full hybrid: Online Delivery + Physical Local Storefront' },
                ].map((item) => {
                  const sel = serviceMode === item.id;
                  return (
                    <Grid item xs={12} sm={4} key={item.id}>
                      <Box
                        onClick={() => setServiceMode(item.id)}
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
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: sel ? UI.primary : UI.textMuted, mb: 0.75 }}>
                          {item.icon}
                          <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: sel ? UI.primary : UI.text }}>
                            {item.title}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.72rem', color: UI.textMuted, lineHeight: 1.35 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Selector B: Customer Audience Target */}
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.25 }}>
                2. Target Customer Audience:
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { id: 'B2B', title: 'B2B Wholesale', desc: 'Sell bulk quantities to retailers, shops & businesses' },
                  { id: 'B2C', title: 'B2C Retail', desc: 'Sell directly to consumers, households & local shoppers' },
                  { id: 'BOTH', title: 'B2B + B2C (Both)', desc: 'Dual-model: Wholesale bulk pricing + retail consumer catalog' },
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

              {/* Active Profile Summary Chip */}
              <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                  Selected Store Profile:
                </Typography>
                <Chip
                  size="small"
                  label={`${serviceMode} • ${customerAudience === 'BOTH' ? 'B2B + B2C DUAL' : customerAudience === 'B2B' ? 'B2B WHOLESALE' : 'B2C RETAIL'}`}
                  sx={{ bgcolor: '#ecfdf5', color: UI.primary, fontWeight: 900, fontSize: '0.74rem', border: '1px solid #a7f3d0' }}
                />
              </Box>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 2: BUSINESS & STORE DETAILS
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: UI.primary, display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                  <Business sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    Storefront & Owner Details
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Basic registration info for billing and store verification
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
                    placeholder="E.g. Royal Supermarket"
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
                    placeholder="Enter owner name"
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
                    Sponsor / Referral ID (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    name="sponsorId"
                    placeholder="TRPN / Mobile (Optional)"
                    value={formData.sponsorId}
                    onChange={handleInputChange}
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 3: CONTACT & ACCOUNT SECURITY
               ══════════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: UI.primary, display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                  <ContactPhone sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: UI.text }}>
                    Contact & Login Password
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: UI.textMuted }}>
                    Used for logging into your Business Dashboard & OTP alerts
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Primary Mobile Number (+91) *
                  </Typography>
                  <TextField
                    fullWidth
                    name="mobile"
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.mobile)}
                    helperText={formErrors.mobile}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>+91</Typography>
                        </InputAdornment>
                      )
                    }}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Password (min 8 chars) *
                  </Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create secure password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Operating City *
                  </Typography>
                  <TextField
                    fullWidth
                    name="city"
                    placeholder="City / Town"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.city)}
                    helperText={formErrors.city}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Pincode (6 digits) *
                  </Typography>
                  <TextField
                    fullWidth
                    name="pincode"
                    placeholder="6-digit postal code"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    error={Boolean(formErrors.pincode)}
                    helperText={formErrors.pincode}
                    sx={inputFieldSx}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Full Street Address
                  </Typography>
                  <TextField
                    fullWidth
                    name="address"
                    placeholder="Shop No, Building Name, Street / Market Area"
                    value={formData.address}
                    onChange={handleInputChange}
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Terms & Submit Card */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '24px', border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.terms}
                    onChange={(e) => setFormData(p => ({ ...p, terms: e.target.checked }))}
                    color="success"
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#475569' }}>
                    I agree to the <strong style={{ color: UI.primary }}>Trikonekt Merchant Terms & Conditions</strong> and service guidelines.
                  </Typography>
                }
              />
              {formErrors.terms && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 700 }}>
                  {formErrors.terms}
                </Typography>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    flex: 2,
                    height: '48px',
                    bgcolor: UI.primary,
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    borderRadius: '14px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
                    '&:hover': { bgcolor: UI.primaryDark },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Complete Store Registration'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    flex: 1,
                    height: '48px',
                    borderColor: UI.border,
                    color: '#64748b',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    borderRadius: '14px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                  }}
                >
                  Login Instead
                </Button>
              </Stack>
            </Paper>

          </Box>
        </motion.div>
      </Container>

      {success && (
        <Fade in={success}>
          <Box sx={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, width: '90%', maxWidth: 420 }}>
            <Alert severity="success" sx={{ borderRadius: '16px', fontWeight: 900, fontSize: '0.92rem', boxShadow: '0 8px 30px rgba(4, 120, 87, 0.35)' }}>
              🎉 Registration Successful! Redirecting to Dashboard...
            </Alert>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

const inputFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    bgcolor: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: 600,
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#047857', borderWidth: 2 },
  },
  '& .MuiInputBase-input': {
    fontWeight: 600,
    color: '#0f172a',
    py: 1.5,
  }
};
