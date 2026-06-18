import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack,
  Alert, CircularProgress, InputAdornment, IconButton, Divider,
} from '@mui/material';
import {
  Lock, Visibility, VisibilityOff, Shield, ArrowBack, Phone,
  EmojiPeople, ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/* ─── Design Tokens ─── */
const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  accent: '#06b6d4',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
  darkGrad: 'linear-gradient(150deg, #0f172a 0%, #0f766e 60%, #0891b2 100%)',
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) { setError('Enter your ID or phone number'); return; }
    if (!password) { setError('Enter your password'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        const role = data.role;
        const category = data.category;
        
        if (role === 'agency' || category === 'agency_sub_franchise') {
          // Store using api.js namespace convention: token_captain / refresh_captain
          localStorage.setItem('token_captain', data.access);
          localStorage.setItem('refresh_captain', data.refresh);
          localStorage.setItem('username_captain', data.username || identifier);
          localStorage.setItem('fullname_captain', data.fullName || '');
          navigate('/captain/home');
        } else {
          // Store using api.js namespace convention: token_business / refresh_business
          localStorage.setItem('token_business', data.access);
          localStorage.setItem('refresh_business', data.refresh);
          localStorage.setItem('username_business', data.username || identifier);
          localStorage.setItem('fullname_business', data.fullName || '');
          navigate('/business-dashboard');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || err.detail || 'Invalid credentials. Please check your ID and password.');
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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)',
        top: '-15%', right: '-10%', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        bottom: '-10%', left: '-8%', pointerEvents: 'none',
      }} />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: '#fff' } }}
        >
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Logo / Branding */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Box sx={{
                width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, rgba(13,148,136,0.3) 0%, rgba(6,182,212,0.3) 100%)',
                border: '1.5px solid rgba(13,148,136,0.4)',
                display: 'grid', placeItems: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <Shield sx={{ fontSize: 36, color: '#fff' }} />
              </Box>
            </motion.div>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Login to Trikonekt
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, fontSize: '0.95rem' }}>
                  Enter your credentials to access your dashboard
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
              p: { xs: 3, sm: 4 },
              boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{ mb: 3, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', '& .MuiAlert-icon': { color: '#f87171' } }}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={2.5}>
              {/* Identifier */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  User ID
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Enter User ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    sx={inputSx(!!error)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmojiPeople fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
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
                  py: 1.5, fontSize: '1rem', mt: 0.5,
                  background: T.gradient,
                  boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
                  '&:hover': { background: T.primaryDark, transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(13,148,136,0.5)' },
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
                  onClick={() => navigate('/register')}
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
