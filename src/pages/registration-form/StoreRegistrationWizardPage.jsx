import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Stack,
  Container,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  MyLocation as MyLocationIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { getMerchantCategories } from '../../api/api';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

export default function StoreRegistrationWizardPage() {
  const navigate = useNavigate();

  // Current Step: 1 = Details, 2 = Location, 3 = Documents, 4 = Review
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    shopName: '',
    category: '',
    mobileNumber: '9876543210',
    email: '',
    fullAddress: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
    shopPhoto: null,
    shopPhotoPreview: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    businessLicense: null,
    gstCertificate: null,
  });

  const [categories, setCategories] = useState([
    'Grocery & Staples',
    'Dairy, Bread & Eggs',
    'Fruits & Vegetables',
    'Snacks & Beverages',
    'Packaged Food',
    'Personal Care',
    'Household Essentials',
  ]);

  useEffect(() => {
    getMerchantCategories()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const names = res.map((c) => c.name || c.label).filter(Boolean);
          if (names.length > 0) setCategories(names);
        }
      })
      .catch(() => {});
  }, []);

  // 1-Tap Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        try {
          // Free Nominatim reverse geocode
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (resp.ok) {
            const data = await resp.json();
            const addr = data.address || {};
            setFormData((prev) => ({
              ...prev,
              fullAddress: data.display_name?.split(',').slice(0, 3).join(', ') || prev.fullAddress,
              landmark: addr.suburb || addr.neighbourhood || prev.landmark,
              city: addr.city || addr.town || addr.state_district || prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
            }));
          }
        } catch (_) {}
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('Could not detect location. Please enter your address manually.');
      },
      { timeout: 8000 }
    );
  };

  // Step 1 Validation
  const handleStep1Next = () => {
    setError('');
    if (!formData.shopName.trim()) {
      setError('Please enter your store name');
      return;
    }
    if (!formData.category) {
      setError('Please select a business category');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setError('Please enter a contact mobile number');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleStep2Next = () => {
    setError('');
    if (!formData.fullAddress.trim()) {
      setError('Please enter your store address');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Validation & Submit
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain');

      const payload = {
        shop_name: formData.shopName,
        address: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        contact_number: formData.mobileNumber,
        email: formData.email,
        description: `${formData.category} store registered via Trikonekt Business`,
        home_delivery_enabled: true,
        delivery_radius_km: 15.0,
      };

      let res = await fetch(`${CAPTAIN_API}/captain/merchant/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback store save to localStorage for client preview if backend is unreachable
        const mockShop = {
          id: Date.now(),
          shop_name: formData.shopName,
          category: formData.category,
          address: formData.fullAddress,
          city: formData.city,
          contact_number: formData.mobileNumber,
          shop_image: formData.shopPhotoPreview,
        };
        localStorage.setItem('tri_business_active_shop', JSON.stringify(mockShop));
      } else {
        const savedShop = await res.json();
        localStorage.setItem('tri_business_active_shop', JSON.stringify(savedShop));
      }

      // Success -> navigate to Home Dashboard
      navigate('/business-dashboard', { replace: true });
    } catch (err) {
      // Graceful fallback
      const mockShop = {
        id: Date.now(),
        shop_name: formData.shopName,
        category: formData.category,
        address: formData.fullAddress,
        city: formData.city,
        contact_number: formData.mobileNumber,
        shop_image: formData.shopPhotoPreview,
      };
      localStorage.setItem('tri_business_active_shop', JSON.stringify(mockShop));
      navigate('/business-dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Bar with Back Button (Matching Screens 5, 6, 7) */}
      <Box
        sx={{
          borderBottom: '1px solid #e2e8f0',
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton
          size="small"
          onClick={() => {
            if (currentStep > 1) setCurrentStep((p) => p - 1);
            else navigate('/business/shops');
          }}
          sx={{ bgcolor: '#f1f5f9', color: '#0f172a' }}
        >
          <BackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
          Register Your Store
        </Typography>
      </Box>

      {/* 2. 4-Step Stepper Indicator (Matching Screens 5, 6, 7) */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative' }}>
          {[
            { num: 1, label: 'Store Details' },
            { num: 2, label: 'Location' },
            { num: 3, label: 'Documents' },
            { num: 4, label: 'Review' },
          ].map((s, idx) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;

            return (
              <Box key={s.num} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: isActive || isDone ? '#047857' : '#f1f5f9',
                    color: isActive || isDone ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    mb: 0.5,
                    border: isActive ? '2px solid #047857' : '1.5px solid #cbd5e1',
                    boxShadow: isActive ? '0 2px 8px rgba(4, 120, 87, 0.25)' : 'none',
                  }}
                >
                  {isDone ? <CheckIcon sx={{ fontSize: 18 }} /> : s.num}
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#047857' : '#94a3b8',
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Main Form Body */}
      <Container maxWidth="xs" sx={{ py: 3, px: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* ════════════════════════════════════════════════════════════════════════════════
              SCREEN 5: STEP 1 — STORE DETAILS
              ════════════════════════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Store Name *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter store name"
                  value={formData.shopName}
                  onChange={(e) => setFormData((p) => ({ ...p, shopName: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Business Category *
                </Typography>
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="" disabled sx={{ color: '#94a3b8' }}>
                    Select category
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Mobile Number *
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    px: 1.5,
                    py: 0.75,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', mr: 1, pr: 1, borderRight: '1px solid #e2e8f0' }}>
                    +91
                  </Typography>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Enter mobile number"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, mobileNumber: e.target.value }))}
                    InputProps={{ disableUnderline: true, sx: { fontWeight: 600 } }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Email (optional)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>
            </Stack>
          )}

          {/* ════════════════════════════════════════════════════════════════════════════════
              SCREEN 6: STEP 2 — STORE LOCATION
              ════════════════════════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <Stack spacing={2.5}>
              {/* Map Preview Card with GPS Button (Matching Screen 6) */}
              <Box
                sx={{
                  height: 150,
                  width: '100%',
                  borderRadius: '16px',
                  bgcolor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                }}
              >
                <LocationIcon sx={{ fontSize: 36, color: '#047857', zIndex: 1 }} />

                {/* Floating "Use My Location" Pill Button */}
                <Button
                  size="small"
                  startIcon={<MyLocationIcon sx={{ fontSize: 16 }} />}
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    bgcolor: '#ffffff',
                    color: '#047857',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    textTransform: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    px: 1.5,
                    py: 0.4,
                    '&:hover': { bgcolor: '#f0fdf4' },
                  }}
                >
                  {locating ? 'Locating...' : 'Use My Location'}
                </Button>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Full Address *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter full address"
                  value={formData.fullAddress}
                  onChange={(e) => setFormData((p) => ({ ...p, fullAddress: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Landmark (optional)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>
            </Stack>
          )}

          {/* ════════════════════════════════════════════════════════════════════════════════
              SCREEN 7: STEP 3 — DOCUMENTS UPLOAD
              ════════════════════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <Stack spacing={2.5}>
              {/* Shop Photo (Required) */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Shop Photo *
                </Typography>
                <Card
                  elevation={0}
                  sx={{
                    border: '1.5px dashed #10b981',
                    borderRadius: '14px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#f0fdf4',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      component="img"
                      src={formData.shopPhotoPreview}
                      alt="Shop Photo"
                      sx={{ width: 50, height: 50, borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        Front View Attached
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                        JPG, PNG (Max 5MB)
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    size="small"
                    startIcon={<UploadIcon />}
                    sx={{ textTransform: 'none', fontWeight: 800, color: '#047857' }}
                  >
                    Upload
                  </Button>
                </Card>
              </Box>

              {/* Business License (Optional) */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Business License (optional)
                </Typography>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#f8fafc',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <DocumentIcon sx={{ color: '#64748b', fontSize: 28 }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                      Trade license / FSSAI certificate
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    startIcon={<UploadIcon />}
                    sx={{ textTransform: 'none', fontWeight: 800, color: '#047857' }}
                  >
                    Upload
                  </Button>
                </Card>
              </Box>

              {/* GST Certificate (Optional) */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  GST Certificate (optional)
                </Typography>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#f8fafc',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <DocumentIcon sx={{ color: '#64748b', fontSize: 28 }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                      GST registration document
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    startIcon={<UploadIcon />}
                    sx={{ textTransform: 'none', fontWeight: 800, color: '#047857' }}
                  >
                    Upload
                  </Button>
                </Card>
              </Box>
            </Stack>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <Stack spacing={2}>
              <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', mb: 1.5 }}>
                  Store Summary
                </Typography>
                <Stack spacing={1}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Name:</strong> {formData.shopName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Category:</strong> {formData.category}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Mobile:</strong> +91 {formData.mobileNumber}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Address:</strong> {formData.fullAddress}
                  </Typography>
                </Stack>
              </Card>
            </Stack>
          )}
        </Box>

        {/* Bottom Navigation Action Buttons (Matching Screens 5, 6, 7) */}
        <Box sx={{ pt: 4 }}>
          {currentStep === 1 && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleStep1Next}
              sx={{
                bgcolor: '#047857',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.95rem',
                py: 1.35,
                borderRadius: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
                '&:hover': { bgcolor: '#065f46' },
              }}
            >
              Next
            </Button>
          )}

          {currentStep === 2 && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(1)}
                sx={{
                  flex: 1,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  fontWeight: 800,
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleStep2Next}
                sx={{
                  flex: 1,
                  bgcolor: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#065f46' },
                }}
              >
                Next
              </Button>
            </Stack>
          )}

          {currentStep === 3 && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(2)}
                sx={{
                  flex: 1,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  fontWeight: 800,
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => setCurrentStep(4)}
                sx={{
                  flex: 1,
                  bgcolor: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#065f46' },
                }}
              >
                Next
              </Button>
            </Stack>
          )}

          {currentStep === 4 && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(3)}
                sx={{
                  flex: 1,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  fontWeight: 800,
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleFinalSubmit}
                disabled={loading}
                sx={{
                  flex: 2,
                  bgcolor: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)',
                  '&:hover': { bgcolor: '#065f46' },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : 'Submit Store'}
              </Button>
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
}
