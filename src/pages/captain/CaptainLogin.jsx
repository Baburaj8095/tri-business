import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack,
  Alert, CircularProgress, InputAdornment, IconButton, Divider, Chip
} from '@mui/material';
import {
  Lock, Visibility, VisibilityOff, Shield, ArrowBack, Phone,
  Person, ArrowForward, Business, Storefront, Language, LocationOn
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/* ─── Design Tokens ─── */
const T = {
  primary: '#228B22',
  primaryDark: '#1B4D3E',
  primaryLight: '#ecfdf5',
  accent: '#10b981',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  gradient: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)',
  darkGrad: 'linear-gradient(150deg, #091e17 0%, #1B4D3E 60%, #143d31 100%)',
};

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const inputSx = (hasError) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: 'rgba(255,255,255,0.08)',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
    '& fieldset': { borderColor: hasError ? T.error : 'rgba(255,255,255,0.2)', borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: T.accent, borderWidth: 2 },
    '& input::placeholder': { color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' },
    '& input': { color: '#fff' },
  },
  '& .MuiInputAdornment-root svg': { color: 'rgba(255,255,255,0.5)' },
});

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Account Type and Channel Selector for Mobile Login
  const [loginMode, setLoginMode] = useState('PHONE'); // 'PHONE' | 'CUSTOM_ID'
  const [accountType, setAccountType] = useState('B2B'); // 'B2B' | 'B2C'
  const [serviceCategory, setServiceCategory] = useState('ONLINE'); // 'ONLINE' | 'OFFLINE'

  const isPhoneNumber = /^\d{10}$/.test(identifier.trim());
  const derivedPrefix = `${serviceCategory === 'ONLINE' ? 'ON' : 'NS'}${accountType}`;
  const targetUsername = loginMode === 'PHONE' && isPhoneNumber ? `${derivedPrefix}${identifier.trim()}` : identifier.trim();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) { 
      setError(loginMode === 'PHONE' ? 'Enter your 10-digit mobile number' : 'Enter your User ID'); 
      return; 
    }
    if (!password) { setError('Enter your password'); return; }

    let finalIdentifier = identifier.trim();
    if (loginMode === 'PHONE' && /^\d{10}$/.test(finalIdentifier)) {
      finalIdentifier = `${derivedPrefix}${finalIdentifier}`;
    }

    setLoading(true);
    try {
      let res = await fetch(`${CAPTAIN_API}/captain/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: finalIdentifier, password }),
      });

      // If initial attempt with prefix failed and user entered phone number, try raw phone number fallback
      if (!res.ok && finalIdentifier !== identifier.trim()) {
        const fallbackRes = await fetch(`${CAPTAIN_API}/captain/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password }),
        });
        if (fallbackRes.ok) {
          res = fallbackRes;
          finalIdentifier = identifier.trim();
        }
      }

      if (res.ok) {
        const data = await res.json();
        const role = data.role;
        const category = data.category;
        
        if (role === 'agency' || category === 'agency_sub_franchise') {
          localStorage.setItem('token_captain', data.access);
          localStorage.setItem('refresh_captain', data.refresh);
          localStorage.setItem('username_captain', data.username || finalIdentifier);
          localStorage.setItem('fullname_captain', data.fullName || '');
          navigate('/captain/home');
        } else {
          localStorage.setItem('token_business', data.access);
          localStorage.setItem('refresh_business', data.refresh);
          localStorage.setItem('username_business', data.username || finalIdentifier);
          localStorage.setItem('fullname_business', data.fullName || '');
          localStorage.setItem('service_mode_business', data.serviceMode || serviceCategory || 'OFFLINE');
          navigate('/business-dashboard');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || err.detail || 'Invalid credentials. Please check your credentials and account type.');
      }
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: T.darkGrad,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,139,34,0.18) 0%, transparent 70%)',
        top: '-15%', right: '-10%', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        bottom: '-10%', left: '-8%', pointerEvents: 'none',
      }} />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2.5, color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: '#fff' } }}
        >
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Logo / Branding */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Box sx={{
                width: 68, height: 68, borderRadius: '20px', mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, rgba(34,139,34,0.3) 0%, rgba(16,185,129,0.3) 100%)',
                border: '1.5px solid rgba(16,185,129,0.4)',
                display: 'grid', placeItems: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <Shield sx={{ fontSize: 34, color: '#10b981' }} />
              </Box>
            </motion.div>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.5px' }}>
              Trikonekt Business Login
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, fontSize: '0.9rem' }}>
              Sign into your wholesale or retail merchant account
            </Typography>
          </Box>

          {/* Login Card */}
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              bgcolor: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              p: { xs: 2.5, sm: 3.5 },
              boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{ mb: 2.5, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', '& .MuiAlert-icon': { color: '#f87171' } }}
              >
                {error}
              </Alert>
            )}

            {/* Mode Selector Tabs: Mobile vs User ID */}
            <Stack direction="row" spacing={1} sx={{ mb: 2.5, bgcolor: 'rgba(0,0,0,0.2)', p: 0.5, borderRadius: '12px' }}>
              <Button
                fullWidth
                size="small"
                onClick={() => setLoginMode('PHONE')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  py: 0.8,
                  bgcolor: loginMode === 'PHONE' ? '#228B22' : 'transparent',
                  color: loginMode === 'PHONE' ? '#fff' : 'rgba(255,255,255,0.6)',
                  '&:hover': { bgcolor: loginMode === 'PHONE' ? '#1B4D3E' : 'rgba(255,255,255,0.05)' },
                }}
              >
                Mobile Number
              </Button>
              <Button
                fullWidth
                size="small"
                onClick={() => setLoginMode('CUSTOM_ID')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  py: 0.8,
                  bgcolor: loginMode === 'CUSTOM_ID' ? '#228B22' : 'transparent',
                  color: loginMode === 'CUSTOM_ID' ? '#fff' : 'rgba(255,255,255,0.6)',
                  '&:hover': { bgcolor: loginMode === 'CUSTOM_ID' ? '#1B4D3E' : 'rgba(255,255,255,0.05)' },
                }}
              >
                User ID / Captain
              </Button>
            </Stack>

            <Stack spacing={2}>
              {/* Account Category & Channel Selector (when in PHONE mode) */}
              {loginMode === 'PHONE' && (
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', p: 1.75, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Business Type */}
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    1. Select Account Type
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <Chip
                      clickable
                      icon={<Business sx={{ fontSize: '16px !important', color: accountType === 'B2B' ? '#fff !important' : 'inherit' }} />}
                      label="B2B Wholesale"
                      onClick={() => setAccountType('B2B')}
                      sx={{
                        flex: 1,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        py: 2,
                        bgcolor: accountType === 'B2B' ? '#228B22' : 'rgba(255,255,255,0.08)',
                        color: accountType === 'B2B' ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1.5px solid ${accountType === 'B2B' ? '#10b981' : 'transparent'}`,
                      }}
                    />
                    <Chip
                      clickable
                      icon={<Storefront sx={{ fontSize: '16px !important', color: accountType === 'B2C' ? '#fff !important' : 'inherit' }} />}
                      label="B2C Retail"
                      onClick={() => setAccountType('B2C')}
                      sx={{
                        flex: 1,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        py: 2,
                        bgcolor: accountType === 'B2C' ? '#228B22' : 'rgba(255,255,255,0.08)',
                        color: accountType === 'B2C' ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1.5px solid ${accountType === 'B2C' ? '#10b981' : 'transparent'}`,
                      }}
                    />
                  </Stack>

                  {/* Channel Mode */}
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    2. Select Sales Channel
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      clickable
                      icon={<Language sx={{ fontSize: '16px !important', color: serviceCategory === 'ONLINE' ? '#fff !important' : 'inherit' }} />}
                      label="Online Delivery"
                      onClick={() => setServiceCategory('ONLINE')}
                      sx={{
                        flex: 1,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        py: 2,
                        bgcolor: serviceCategory === 'ONLINE' ? '#1B4D3E' : 'rgba(255,255,255,0.08)',
                        color: serviceCategory === 'ONLINE' ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1.5px solid ${serviceCategory === 'ONLINE' ? '#10b981' : 'transparent'}`,
                      }}
                    />
                    <Chip
                      clickable
                      icon={<LocationOn sx={{ fontSize: '16px !important', color: serviceCategory === 'OFFLINE' ? '#fff !important' : 'inherit' }} />}
                      label="Nearby Store"
                      onClick={() => setServiceCategory('OFFLINE')}
                      sx={{
                        flex: 1,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        py: 2,
                        bgcolor: serviceCategory === 'OFFLINE' ? '#1B4D3E' : 'rgba(255,255,255,0.08)',
                        color: serviceCategory === 'OFFLINE' ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1.5px solid ${serviceCategory === 'OFFLINE' ? '#10b981' : 'transparent'}`,
                      }}
                    />
                  </Stack>
                </Box>
              )}

              {/* Identifier */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {loginMode === 'PHONE' ? 'Mobile Number' : 'User ID'}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={loginMode === 'PHONE' ? 'Enter 10-digit mobile number' : 'Enter User ID (e.g. CB...)'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  sx={inputSx(!!error)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {loginMode === 'PHONE' ? <Phone fontSize="small" /> : <Person fontSize="small" />}
                      </InputAdornment>
                    ),
                  }}
                />
                {loginMode === 'PHONE' && identifier.trim().length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={`Logging in as: ${targetUsername}`}
                      sx={{
                        bgcolor: isPhoneNumber ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: isPhoneNumber ? '#10b981' : 'rgba(255,255,255,0.6)',
                        border: `1px solid ${isPhoneNumber ? 'rgba(16, 185, 129, 0.3)' : 'transparent'}`,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Password */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx(false)}
                />
              </Box>

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={loading ? null : <ArrowForward />}
                sx={{
                  borderRadius: '12px', textTransform: 'none', fontWeight: 800,
                  py: 1.5, fontSize: '1rem', mt: 1,
                  background: T.gradient,
                  boxShadow: '0 4px 20px rgba(34,139,34,0.4)',
                  '&:hover': { background: T.primaryDark, transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(34,139,34,0.5)' },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Login to Dashboard'}
              </Button>
            </Stack>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Register link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>
                Don&apos;t have an account?{' '}
                <Box
                  component="span"
                  onClick={() => navigate('/registration?role=captain')}
                  sx={{ color: T.accent, fontWeight: 800, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Register Now
                </Box>
              </Typography>
            </Box>
          </Box>

          {/* Info chips */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
            {['CB Prefix ID', 'JWT Secured', '24h Support'].map(label => (
              <Box key={label} sx={{
                px: 1.75, py: 0.5, borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(255,255,255,0.04)',
              }}>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default UnifiedLogin;
