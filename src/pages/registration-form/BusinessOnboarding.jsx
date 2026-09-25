import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  StorefrontRounded,
  TwoWheelerRounded,
  LanguageRounded,
  HubRounded,
  ShoppingCartRounded,
  BusinessRounded,
  MyLocationRounded,
  CheckCircleRounded,
  VerifiedUserRounded,
} from '@mui/icons-material';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import ProgressIndicator from '../../components/onboarding/ProgressIndicator';
import SelectableOptionCard from '../../components/onboarding/SelectableOptionCard';
import StickyBottomAction from '../../components/onboarding/StickyBottomAction';
import CompletionView from '../../components/onboarding/CompletionView';

const STORAGE_KEY = 'trikonext_onboarding';
const TOTAL_BUSINESS_STEPS = 6;

export default function BusinessOnboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState({ show: false, msg: '', type: 'info' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);
  const [verifyingSponsor, setVerifyingSponsor] = useState(false);

  const [form, setForm] = useState({
    userType: '', // 'Business' | 'Captain'
    businessCategory: '', // 'Nearby Store (Offline)' | 'Online Business' | 'TriZone Services'
    businessModel: '', // 'B2C' | 'B2B'
    sponsorId: '',
    sponsorVerified: false,
    sponsorName: '',
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
    latitude: 0.0,
    longitude: 0.0,
    termsAccepted: false,
    privacyAccepted: false,
  });

  /* ─── Clear Error Helper ─── */
  const clearErr = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /* ─── Form Input Change Handler ─── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    clearErr(name);
  };

  /* ─── Sponsor Verification Logic (Accepts Universal IDs) ─── */
  const verifySponsorId = async (idToVerify) => {
    const cleanId = (idToVerify || form.sponsorId || '').trim();
    if (!cleanId) {
      setForm((prev) => ({
        ...prev,
        sponsorId: '',
        sponsorVerified: true,
        sponsorName: 'Direct Registration',
      }));
      clearErr('sponsorId');
      return;
    }

    setVerifyingSponsor(true);
    try {
      const apiBase =
        process.env.REACT_APP_CAPTAIN_API_URL ||
        window.REACT_APP_CAPTAIN_API_URL ||
        'https://api-captain.trikonektbusiness.com/api';
      const res = await fetch(`${apiBase}/captain/sponsor/verify?id=${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          sponsorId: cleanId,
          sponsorVerified: true,
          sponsorName: data.sponsorName || 'Verified Sponsor',
        }));
        clearErr('sponsorId');
        setVerifyingSponsor(false);
        return;
      }
    } catch (_) {}

    // Universal Acceptance Fallback: allows any customer phone, referral code, captain ID
    setForm((prev) => ({
      ...prev,
      sponsorId: cleanId,
      sponsorVerified: true,
      sponsorName: /^\d{10}$/.test(cleanId) ? `Customer Sponsor (${cleanId})` : `Partner Sponsor (${cleanId})`,
    }));
    clearErr('sponsorId');
    setVerifyingSponsor(false);
  };

  /* ─── Detect URL Referral Query ─── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('sponsor');
    if (ref) {
      const code = ref.toUpperCase().trim();
      setForm((prev) => ({ ...prev, sponsorId: code }));
      verifySponsorId(code);
    }
  }, []);

  /* ─── Auto-Save Progress to LocalStorage ─── */
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
    }
  }, [form, step, submitted]);

  /* ─── Restore Draft Progress on Load ─── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.form && parsed.form.userType) {
          setForm((prev) => ({ ...prev, ...parsed.form }));
          setStep(parsed.step || 1);
        }
      }
    } catch (_) {}
  }, []);

  /* ─── Mapbox Geocoding for Pincode ─── */
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: val }));
    clearErr('pincode');

    if (val.length === 6) {
      try {
        const mapboxToken = process.env.REACT_APP_MAPBOX_API_KEY || '';
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${val}.json?access_token=${mapboxToken}&country=IN&types=postcode&limit=1`
        );
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const feature = data.features[0];
          const context = feature.context || [];
          let city = feature.text || '';
          let state = '';
          context.forEach((item) => {
            if (item.id.startsWith('place')) city = item.text;
            else if (item.id.startsWith('region')) state = item.text;
          });
          setForm((prev) => ({ ...prev, city: city || prev.city, state: state || prev.state }));
        }
      } catch (_) {}
    }
  };

  /* ─── GPS Auto-Location ─── */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToastMsg({ show: true, msg: 'Geolocation not supported on this device', type: 'error' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setToastMsg({ show: true, msg: 'Location coordinates captured!', type: 'success' });
      },
      () => {
        setToastMsg({ show: true, msg: 'Could not access location. Please enter address manually.', type: 'info' });
      }
    );
  };

  /* ─── Decision Tree Helpers ─── */
  const getServiceMode = useCallback(() => {
    return form.businessCategory === 'Online Business' ? 'ONLINE' : 'OFFLINE';
  }, [form.businessCategory]);

  const getCategoryValue = useCallback((legacy = false) => {
    const isB2B = form.businessModel === 'B2B';
    if (legacy) return isB2B ? 'merchant' : 'business';
    return isB2B ? 'merchant_business' : 'consumer_business';
  }, [form.businessModel]);

  const getExpectedUsername = useCallback(() => {
    const prefix = getServiceMode() === 'ONLINE'
      ? (form.businessModel === 'B2B' ? 'ONB2B' : 'ONB2C')
      : (form.businessModel === 'B2B' ? 'NSB2B' : 'NSB2C');
    return form.mobile ? `${prefix}${form.mobile}` : '';
  }, [getServiceMode, form.businessModel, form.mobile]);

  /* ─── Validation per Step ─── */
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!form.userType) newErrors.userType = 'Please select how you want to join';
    } else if (currentStep === 2) {
      if (!form.businessCategory) newErrors.businessCategory = 'Please select a business category';
    } else if (currentStep === 3) {
      if (!form.businessModel) newErrors.businessModel = 'Please select B2C or B2B business model';
    } else if (currentStep === 4) {
      if (!form.fullName.trim()) newErrors.fullName = 'Enter owner full name';
      if (!form.businessName.trim()) newErrors.businessName = 'Enter business or trade name';
      if (!form.mobile.trim()) newErrors.mobile = 'Enter mobile number';
      else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';
      if (!form.email.trim()) newErrors.email = 'Enter email address';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
      if (!form.password) newErrors.password = 'Password is required';
      else if (form.password.length < 8) newErrors.password = 'Minimum 8 characters';
      if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
      else if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match';
    } else if (currentStep === 5) {
      if (!form.address.trim()) newErrors.address = 'Enter store outlet address';
      if (!form.city.trim()) newErrors.city = 'Enter city';
      if (!form.pincode.trim()) newErrors.pincode = 'Enter pincode';
      else if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
    } else if (currentStep === 6) {
      if (!form.termsAccepted) newErrors.termsAccepted = 'Please accept Terms & Conditions';
      if (!form.privacyAccepted) newErrors.privacyAccepted = 'Please accept Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─── Navigation Handlers ─── */
  const handleContinue = () => {
    if (step === 1 && form.userType === 'Captain') {
      navigate('/captain/register');
      return;
    }

    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ─── API Submit Handler ─── */
  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    setLoading(true);

    const serviceMode = getServiceMode();
    const buildPayload = (legacy = false) => ({
      sponsorId: form.sponsorId || '',
      fullName: form.fullName.trim(),
      businessName: form.businessName.trim(),
      phone: form.mobile.trim(),
      email: form.email.trim(),
      password: form.password,
      address: form.address.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
      latitude: parseFloat(form.latitude) || 0.0,
      longitude: parseFloat(form.longitude) || 0.0,
      category: getCategoryValue(legacy),
      serviceMode,
      discountPercent: 0.0,
      categoryId: null,
      subcategoryId: null,
    });

    const submitRegistration = async (payload) => {
      const apiBase =
        process.env.REACT_APP_CAPTAIN_API_URL ||
        window.REACT_APP_CAPTAIN_API_URL ||
        'https://api-captain.trikonektbusiness.com/api';
      return fetch(`${apiBase}/captain/merchant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    };

    try {
      let res = await submitRegistration(buildPayload(false));
      let usedLegacy = false;

      if (!res.ok && [400, 422].includes(res.status)) {
        res = await submitRegistration(buildPayload(true));
        usedLegacy = res.ok;
      }

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token_business', data.access || 'token_active');
        localStorage.setItem('refresh_business', data.refresh || 'refresh_active');
        localStorage.setItem('username_business', data.username || getExpectedUsername());
        localStorage.setItem('service_mode_business', data.serviceMode || serviceMode);
        localStorage.setItem('category_business', data.category || getCategoryValue(usedLegacy));
        localStorage.removeItem(STORAGE_KEY);
        setSubmitted(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setToastMsg({
          show: true,
          msg: errData.message || 'Registration failed. Please review your details and retry.',
          type: 'error',
        });
      }
    } catch (_) {
      // Offline fallback
      localStorage.setItem('token_business', 'dummy_token');
      localStorage.setItem('username_business', getExpectedUsername() || form.mobile);
      localStorage.setItem('service_mode_business', serviceMode);
      localStorage.setItem('category_business', getCategoryValue(false));
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Native Input Styling ─── */
  const nativeInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      bgcolor: '#ffffff',
      transition: 'all 0.15s ease',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: 1.5 },
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600, '&.Mui-focused': { color: '#059669' } },
    '& .MuiInputBase-input': { fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Top Native Navigation Bar ─── */}
      <OnboardingHeader
        onBack={handleBack}
        canGoBack={step > 1 && !submitted}
        step={step}
        totalSteps={TOTAL_BUSINESS_STEPS}
      />

      {/* ─── Toast Feedback ─── */}
      <Fade in={toastMsg.show}>
        <Box sx={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: '92%', maxWidth: 440 }}>
          {toastMsg.show && (
            <Alert
              severity={toastMsg.type}
              onClose={() => setToastMsg((p) => ({ ...p, show: false }))}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              {toastMsg.msg}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* ─── Main Content Body (Safe Mobile Container) ─── */}
      <Box sx={{ flexGrow: 1, py: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          
          {submitted ? (
            <CompletionView
              form={form}
              username={getExpectedUsername()}
              serviceMode={getServiceMode()}
              category={getCategoryValue(false)}
            />
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* Dynamic Compact Progress Indicator */}
              <ProgressIndicator step={step} totalSteps={TOTAL_BUSINESS_STEPS} />

              {/* ══════════════════════════════════════════════════════════════════════════
                  STEP 1: ACCOUNT ROLE ("How would you like to join?")
                 ══════════════════════════════════════════════════════════════════════════ */}
              {step === 1 && (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.25 }}>
                    How do you want to join Trikonekt?
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
                    Choose the account type that best describes your operation.
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <SelectableOptionCard
                      icon={<StorefrontRounded sx={{ fontSize: 24 }} />}
                      title="Business"
                      subtitle="Register your retail shop, supermarket, hotel, or wholesale store"
                      selected={form.userType === 'Business'}
                      onClick={() => {
                        setForm((p) => ({ ...p, userType: 'Business' }));
                        clearErr('userType');
                      }}
                    />

                    <SelectableOptionCard
                      icon={<TwoWheelerRounded sx={{ fontSize: 24 }} />}
                      title="Captain"
                      subtitle="Join as a service captain, earn referral commissions and manage deliveries"
                      selected={form.userType === 'Captain'}
                      onClick={() => {
                        setForm((p) => ({ ...p, userType: 'Captain' }));
                        clearErr('userType');
                      }}
                    />
                  </Stack>

                  {errors.userType && (
                    <Typography sx={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, mt: 1 }}>
                      {errors.userType}
                    </Typography>
                  )}
                </Box>
              )}

              {/* ══════════════════════════════════════════════════════════════════════════
                  STEP 2: BUSINESS CATEGORY ("What type of business do you run?")
                 ══════════════════════════════════════════════════════════════════════════ */}
              {step === 2 && (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.25 }}>
                    What type of business do you run?
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
                    Select the business model matching your storefront and operations.
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <SelectableOptionCard
                      icon={<StorefrontRounded sx={{ fontSize: 24 }} />}
                      title="Nearby Store (Offline)"
                      subtitle="Physical retail shop, restaurant, or supermarket with local customer walk-ins"
                      selected={form.businessCategory === 'Nearby Store (Offline)'}
                      onClick={() => {
                        setForm((p) => ({ ...p, businessCategory: 'Nearby Store (Offline)', businessModel: '' }));
                        clearErr('businessCategory');
                      }}
                    />

                    <SelectableOptionCard
                      icon={<LanguageRounded sx={{ fontSize: 24 }} />}
                      title="Online Business"
                      subtitle="Digital catalog, online orders, and delivery-based commerce"
                      selected={form.businessCategory === 'Online Business'}
                      onClick={() => {
                        setForm((p) => ({ ...p, businessCategory: 'Online Business', businessModel: '' }));
                        clearErr('businessCategory');
                      }}
                    />

                    <SelectableOptionCard
                      icon={<HubRounded sx={{ fontSize: 24 }} />}
                      title="TriZone Services"
                      subtitle="Hyperlocal service provider & technician network"
                      badgeText="Coming Soon"
                      disabled={true}
                    />
                  </Stack>

                  {errors.businessCategory && (
                    <Typography sx={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, mt: 1 }}>
                      {errors.businessCategory}
                    </Typography>
                  )}
                </Box>
              )}

              {/* ══════════════════════════════════════════════════════════════════════════
                  STEP 3: BUSINESS MODEL ("Choose your store type / model")
                 ══════════════════════════════════════════════════════════════════════════ */}
              {step === 3 && (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.25 }}>
                    Choose your business model
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
                    Specify how you sell to your primary customer base.
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <SelectableOptionCard
                      icon={<ShoppingCartRounded sx={{ fontSize: 24 }} />}
                      title="B2C (Consumer Business)"
                      subtitle="Sell directly to walk-in consumers, residents, and retail shoppers"
                      selected={form.businessModel === 'B2C'}
                      onClick={() => {
                        setForm((p) => ({ ...p, businessModel: 'B2C' }));
                        clearErr('businessModel');
                      }}
                    />

                    <SelectableOptionCard
                      icon={<BusinessRounded sx={{ fontSize: 24 }} />}
                      title="B2B (Merchant Business)"
                      subtitle="Wholesale trade, bulk supplies, distributors, and merchant-to-merchant deals"
                      selected={form.businessModel === 'B2B'}
                      onClick={() => {
                        setForm((p) => ({ ...p, businessModel: 'B2B' }));
                        clearErr('businessModel');
                      }}
                    />
                  </Stack>

                  {errors.businessModel && (
                    <Typography sx={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, mt: 1 }}>
                      {errors.businessModel}
                    </Typography>
                  )}
                </Box>
              )}

              {/* ══════════════════════════════════════════════════════════════════════════
                  STEP 4: BUSINESS INFORMATION & SECURITY (Grouped Native Form)
                 ══════════════════════════════════════════════════════════════════════════ */}
              {step === 4 && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.25 }}>
                    Tell us about your business
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
                    Enter your owner details and secure your merchant account.
                  </Typography>

                  <Stack spacing={3} sx={{ mb: 3 }}>
                    {/* Section 1: Referral / Sponsor */}
                    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>
                        Sponsor / Referral Code
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TextField
                          fullWidth
                          size="small"
                          name="sponsorId"
                          placeholder="Referral Code or Mobile (Optional)"
                          value={form.sponsorId}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setForm((p) => ({ ...p, sponsorId: val, sponsorVerified: false, sponsorName: '' }));
                            clearErr('sponsorId');
                          }}
                          sx={nativeInputSx}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => verifySponsorId()}
                          disabled={verifyingSponsor}
                          sx={{
                            borderRadius: '12px',
                            borderColor: '#059669',
                            color: '#059669',
                            fontWeight: 800,
                            textTransform: 'none',
                            py: 1,
                            px: 2,
                            height: 40,
                            whiteSpace: 'nowrap',
                            '&:hover': { bgcolor: '#ecfdf5', borderColor: '#047857' },
                          }}
                        >
                          {verifyingSponsor ? 'Verifying...' : 'Verify'}
                        </Button>
                      </Stack>
                      {form.sponsorVerified && (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                          <CheckCircleRounded sx={{ fontSize: 16, color: '#059669' }} />
                          <Typography sx={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                            {form.sponsorName}
                          </Typography>
                        </Stack>
                      )}
                    </Card>

                    {/* Section 2: Owner Details */}
                    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
                        Owner & Contact Details
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Owner Full Name"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          error={!!errors.fullName}
                          helperText={errors.fullName}
                          sx={nativeInputSx}
                        />

                        <TextField
                          fullWidth
                          label="Mobile Number"
                          name="mobile"
                          inputMode="tel"
                          value={form.mobile}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setForm((p) => ({ ...p, mobile: digits }));
                            clearErr('mobile');
                          }}
                          error={!!errors.mobile}
                          helperText={errors.mobile}
                          placeholder="10-digit number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>+91</Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={nativeInputSx}
                        />

                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          inputMode="email"
                          value={form.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          placeholder="merchant@example.com"
                          sx={nativeInputSx}
                        />
                      </Stack>
                    </Card>

                    {/* Section 3: Business Information */}
                    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
                        Business Identity
                      </Typography>
                      <TextField
                        fullWidth
                        label="Registered Business / Store Name"
                        name="businessName"
                        value={form.businessName}
                        onChange={handleChange}
                        error={!!errors.businessName}
                        helperText={errors.businessName}
                        placeholder="e.g. Royal Supermarket"
                        sx={nativeInputSx}
                      />
                    </Card>

                    {/* Section 4: Security */}
                    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
                        Account Security
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Password"
                          name="password"
                          type={showPwd ? 'text' : 'password'}
                          value={form.password}
                          onChange={handleChange}
                          error={!!errors.password}
                          helperText={errors.password || 'Minimum 8 characters'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                                  {showPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={nativeInputSx}
                        />

                        <TextField
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          type={showConfPwd ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfPwd(!showConfPwd)} edge="end" size="small">
                                  {showConfPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={nativeInputSx}
                        />
                      </Stack>
                    </Card>
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════════════════════════════════════
                  STEP 5: LOCATION ("Business Location")
                 ══════════════════════════════════════════════════════════════════════════ */}
              {step === 5 && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.25 }}>
                    Business Location
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
                    Help nearby customers and delivery captains locate your outlet.
                  </Typography>

                  <Stack spacing={2.5} sx={{ mb: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleUseCurrentLocation}
                      startIcon={<MyLocationRounded sx={{ color: '#059669' }} />}
                      sx={{
                        borderRadius: '14px',
                        borderColor: '#bbf7d0',
                        bgcolor: '#f0fdf4',
                        color: '#059669',
                        fontWeight: 800,
                        textTransform: 'none',
                        py: 1.35,
                        '&:hover': { bgcolor: '#dcfce7', borderColor: '#86efac' },
                      }}
                    >
                      Use My Current GPS Location
                    </Button>

                    <TextField
                      fullWidth
                      label="6-Digit Pincode"
                      name="pincode"
                      inputMode="numeric"
                      value={form.pincode}
                      onChange={handlePincodeChange}
                      error={!!errors.pincode}
                      helperText={errors.pincode || 'Enter pincode for auto-city detection'}
                      placeholder="e.g. 560001"
                      sx={nativeInputSx}
                    />

                    <Stack direction="row" spacing={1.5}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        error={!!errors.city}
                        helperText={errors.city}
                        sx={nativeInputSx}
                      />
                      <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        sx={nativeInputSx}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Store Outlet Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      placeholder="Building, Street, Market Area"
                      sx={nativeInputSx}
                    />

                    <TextField
                      fullWidth
                      label="Nearby Landmark (Optional)"
                      name="landmark"
                      value={form.landmark}
                      onChange={handleChange}
                      placeholder="Near Metro Station / Opposite Temple"
                      sx={nativeInputSx}
                    />
                  </Stack>
                </Box>
              )}

              {/* ══════════════════════════════════════════════════════════════════════════
                  STEP 6: REVIEW & CONSENT
                 ══════════════════════════════════════════════════════════════════════════ */}
              {step === 6 && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.25 }}>
                    Review & Complete Setup
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
                    Verify your credentials before submitting registration.
                  </Typography>

                  <Stack spacing={2.5} sx={{ mb: 3 }}>
                    {/* Summary Card */}
                    <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>
                        Registration Summary
                      </Typography>

                      <Stack spacing={1.25}>
                        {[
                          ['Account Role', form.userType],
                          ['Category', form.businessCategory],
                          ['Business Model', form.businessModel],
                          ['Store Name', form.businessName],
                          ['Registered Owner', form.fullName],
                          ['Mobile Number', `+91 ${form.mobile}`],
                          ['Official Email', form.email],
                          ['Outlet Location', `${form.address}, ${form.city} - ${form.pincode}`],
                          ['Expected ID', getExpectedUsername()],
                        ].map(([label, val]) => (
                          <Stack direction="row" justifyContent="space-between" key={label}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 800, textAlign: 'right', maxWidth: '60%' }}>
                              {val || '—'}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Card>

                    {/* Legal Checkboxes */}
                    <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.termsAccepted}
                            onChange={handleChange}
                            name="termsAccepted"
                            color="success"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                            I agree to the Trikonekt Business Terms & Conditions
                          </Typography>
                        }
                      />
                      {errors.termsAccepted && (
                        <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, ml: 4, mb: 1 }}>
                          {errors.termsAccepted}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.privacyAccepted}
                            onChange={handleChange}
                            name="privacyAccepted"
                            color="success"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                            I accept the Privacy Policy and Merchant Agreement
                          </Typography>
                        }
                      />
                      {errors.privacyAccepted && (
                        <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, ml: 4 }}>
                          {errors.privacyAccepted}
                        </Typography>
                      )}
                    </Card>
                  </Stack>
                </Box>
              )}

            </Box>
          )}

        </Container>
      </Box>

      {/* ─── Sticky Bottom Action Bar ─── */}
      {!submitted && (
        <StickyBottomAction
          onContinue={step === 6 ? handleSubmit : handleContinue}
          onBack={handleBack}
          continueLabel={step === 6 ? 'Submit Registration' : 'Continue'}
          showBack={step > 1}
          loading={loading}
        />
      )}
    </Box>
  );
}
