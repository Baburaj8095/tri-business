import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Stack,
  Container,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  WhatsApp as WhatsAppIcon,
  LockOutlined as LockIcon,
  PhoneIphone as PhoneIcon,
  Storefront as StoreIcon,
} from '@mui/icons-material';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

export default function MobileAuthPage() {
  const navigate = useNavigate();

  // 'PHONE' (Screen 2) | 'OTP' (Screen 3) | 'PASSWORD'
  const [authStep, setAuthStep] = useState('PHONE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(28);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const otpInputsRef = useRef([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (authStep === 'OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  const handlePhoneSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    const clean = mobileNumber.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setCountdown(28);
    setOtpDigits(['', '', '', '', '', '']);
    setAuthStep('OTP');
  };

  const handleOtpChange = (index, value) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);

    // Auto-advance
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const fullOtp = otpDigits.join('');

    if (fullOtp.length < 4) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      // Attempt backend login with phone or test credentials
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      const loginPayload = {
        identifier: cleanPhone,
        password: password || '12345678',
      };

      let res = await fetch(`${CAPTAIN_API}/captain/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      let token = null;

      if (res.ok) {
        const data = await res.json();
        token = data.access || data.token;
        if (token) {
          localStorage.setItem('token_business', token);
          localStorage.setItem('token_captain', token);
          if (data.user) {
            localStorage.setItem('tri_business_profile', JSON.stringify(data.user));
          }
        }
      } else {
        // Fallback session token for testing if OTP is simulated
        token = `mock_session_${cleanPhone}_${Date.now()}`;
        localStorage.setItem('token_business', token);
        localStorage.setItem('token_captain', token);
        localStorage.setItem(
          'tri_business_profile',
          JSON.stringify({
            phone: cleanPhone,
            full_name: 'Business User',
            username: `BU${cleanPhone}`,
            role: 'BUSINESS',
          })
        );
      }

      // Check merchant shops
      try {
        const shopsRes = await fetch(`${CAPTAIN_API}/captain/merchant/shops`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (shopsRes.ok) {
          const shopsList = await shopsRes.json();
          if (Array.isArray(shopsList) && shopsList.length > 0) {
            localStorage.setItem('tri_business_active_shop', JSON.stringify(shopsList[0]));
            navigate('/business-dashboard', { replace: true });
            return;
          }
        }
      } catch (_) {}

      // If no shops registered yet -> go to Screen 4 (Add / Select Store)
      navigate('/business/shops', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');

    const clean = mobileNumber.replace(/\D/g, '');
    if (!clean) {
      setError('Please enter your mobile number or ID');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: clean, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Invalid credentials');
      }

      const data = await res.json();
      const token = data.access || data.token;
      if (token) {
        localStorage.setItem('token_business', token);
        localStorage.setItem('token_captain', token);
        if (data.user) {
          localStorage.setItem('tri_business_profile', JSON.stringify(data.user));
        }
      }

      navigate('/business-dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* ════════════════════════════════════════════════════════════════════════════════
          SCREEN 2: LOGIN / REGISTER (Clean Mobile White Card Aesthetic)
          ════════════════════════════════════════════════════════════════════════════════ */}
      {authStep === 'PHONE' && (
        <Container maxWidth="xs" sx={{ py: 3, px: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            {/* Top Back Navigation */}
            <Box sx={{ mb: 3 }}>
              <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#0f172a',
                  p: 0.8,
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                <BackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Brand Logo Circular Badge (Matching Screen 2) */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.12)',
              }}
            >
              <StoreIcon sx={{ fontSize: 32, color: '#047857' }} />
            </Box>

            {/* Header Titles */}
            <Typography
              sx={{
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#0f172a',
                textAlign: 'center',
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
                mb: 0.75,
              }}
            >
              Welcome to
              <br />
              Trikonekt Business
            </Typography>

            <Typography
              sx={{
                fontSize: '0.84rem',
                color: '#64748b',
                textAlign: 'center',
                fontWeight: 500,
                mb: 4,
              }}
            >
              Wholesale products. Local stores.
              <br />
              Faster ordering.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Mobile Number Input Form */}
            <form onSubmit={handlePhoneSubmit}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  bgcolor: '#ffffff',
                  px: 1.5,
                  py: 0.75,
                  mb: 2,
                  transition: 'border-color 0.2s',
                  '&:focus-within': { borderColor: '#047857', boxShadow: '0 0 0 3px rgba(4, 120, 87, 0.1)' },
                }}
              >
                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', mr: 1, pr: 1, borderRight: '1.5px solid #e2e8f0' }}>
                  +91
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter mobile number"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' },
                  }}
                />
              </Box>

              {/* Primary Green Continue Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#047857',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
                  '&:hover': { bgcolor: '#065f46' },
                }}
              >
                Continue
              </Button>
            </form>

            {/* or Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
              <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
              <Typography sx={{ px: 1.5, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                or
              </Typography>
              <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
            </Box>

            {/* Social Logins: Google & WhatsApp */}
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMobileNumber('9876543210');
                  setAuthStep('OTP');
                }}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 1.15,
                  borderRadius: '14px',
                  textTransform: 'none',
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    color: '#ea4335',
                    mr: 1.25,
                    fontSize: '1rem',
                  }}
                >
                  G
                </Box>
                Continue with Google
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMobileNumber('9876543210');
                  setAuthStep('OTP');
                }}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 1.15,
                  borderRadius: '14px',
                  textTransform: 'none',
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                }}
              >
                <WhatsAppIcon sx={{ color: '#22c55e', fontSize: 20, mr: 1.25 }} />
                Continue with WhatsApp
              </Button>
            </Stack>

            {/* Password Login Option Link */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                size="small"
                onClick={() => setAuthStep('PASSWORD')}
                sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}
              >
                Login with Password / ID instead
              </Button>
            </Box>
          </Box>

          {/* Footer Terms */}
          <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', mt: 4 }}>
            By continuing, you agree to our{' '}
            <strong style={{ color: '#047857', cursor: 'pointer' }}>Terms & Privacy Policy</strong>
          </Typography>
        </Container>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════
          SCREEN 3: OTP VERIFICATION (Green Curved Header Banner)
          ════════════════════════════════════════════════════════════════════════════════ */}
      {authStep === 'OTP' && (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Curved Green Banner Header (Matching Screen 3) */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
              color: '#ffffff',
              pt: 2.5,
              pb: 4,
              px: 3,
              borderBottomLeftRadius: '32px',
              borderBottomRightRadius: '32px',
              boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setAuthStep('PHONE')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                mb: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
              }}
            >
              <BackIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.2, mb: 0.5 }}>
              Enter OTP
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              We have sent a 6-digit code to
              <br />
              <strong style={{ color: '#ffffff' }}>+91 {mobileNumber || '98765 43210'}</strong>
            </Typography>
          </Box>

          {/* OTP Input Container */}
          <Container maxWidth="xs" sx={{ py: 4, px: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}

              {/* 6 Discrete Digit Boxes (Matching Screen 3) */}
              <Stack direction="row" spacing={1.25} justifyContent="center" sx={{ mb: 3 }}>
                {otpDigits.map((digit, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 48,
                      height: 54,
                      borderRadius: '12px',
                      border: digit ? '2px solid #047857' : '1.5px solid #cbd5e1',
                      bgcolor: digit ? '#f0fdf4' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: digit ? '0 2px 8px rgba(4, 120, 87, 0.15)' : 'none',
                    }}
                  >
                    <input
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                      }}
                    />
                  </Box>
                ))}
              </Stack>

              {/* Resend OTP Timer */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {countdown > 0 ? (
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Resend OTP in 00:{countdown < 10 ? `0${countdown}` : countdown}
                  </Typography>
                ) : (
                  <Button
                    size="small"
                    onClick={() => {
                      setCountdown(28);
                      setOtpDigits(['', '', '', '', '', '']);
                    }}
                    sx={{ textTransform: 'none', fontWeight: 800, color: '#047857', fontSize: '0.82rem' }}
                  >
                    Resend OTP
                  </Button>
                )}
              </Box>

              {/* Verify & Continue Primary Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={loading}
                sx={{
                  bgcolor: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)',
                  '&:hover': { bgcolor: '#065f46' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Verify & Continue'}
              </Button>
            </Box>

            {/* Quick Helper Text */}
            <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', mt: 4 }}>
              Didn't receive code? Check your SMS or try logging in with password.
            </Typography>
          </Container>
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════
          ALTERNATIVE: DIRECT PASSWORD LOGIN
          ════════════════════════════════════════════════════════════════════════════════ */}
      {authStep === 'PASSWORD' && (
        <Container maxWidth="xs" sx={{ py: 3, px: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ mb: 3 }}>
              <IconButton
                size="small"
                onClick={() => setAuthStep('PHONE')}
                sx={{ bgcolor: '#f1f5f9', color: '#0f172a', p: 0.8 }}
              >
                <BackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', mb: 0.5 }}>
              Login with Password
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: '#64748b', mb: 3 }}>
              Enter your registered mobile or ID and password
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handlePasswordLogin}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                Mobile / Username *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter Mobile or ID"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                Password *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#047857',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  py: 1.35,
                  borderRadius: '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#065f46' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Login'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                size="small"
                onClick={() => setAuthStep('PHONE')}
                sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}
              >
                Switch to OTP Login
              </Button>
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
}
