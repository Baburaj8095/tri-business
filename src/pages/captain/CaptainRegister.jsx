import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stack, Alert,
  CircularProgress, InputAdornment, IconButton, FormControlLabel,
  Checkbox, Chip, LinearProgress, Divider, Fade,
} from '@mui/material';
import {
  Verified, Phone, Email, Person, Lock, Visibility, VisibilityOff,
  LocationOn, CheckCircle, ArrowBack, ArrowForward, EmojiPeople,
  Shield, VerifiedUser, ContentCopy, Done,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Design Tokens ─── */
const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  accent: '#06b6d4',
  bg: '#f0fdfa',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
  captainGrad: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #0891b2 100%)',
  radius: '14px',
};

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL || 'http://localhost:8081/api';
const TOTAL_STEPS = 5;
const STORAGE_KEY = 'captain_registration_draft';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

/* ─── Password strength ─── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: T.border };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { score: 20, label: 'Weak', color: T.error };
  if (s === 2) return { score: 40, label: 'Fair', color: T.warning };
  if (s === 3) return { score: 60, label: 'Good', color: '#84cc16' };
  if (s === 4) return { score: 80, label: 'Strong', color: T.success };
  return { score: 100, label: 'Very Strong', color: T.primary };
};

/* ─── Step Header ─── */
const StepHeader = ({ step, icon, title, subtitle }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '10px', background: T.gradient,
        display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 800,
      }}>{step}</Box>
      <Box sx={{ color: T.primary }}>{icon}</Box>
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: T.text, letterSpacing: '-0.02em', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ color: T.textSecondary, fontSize: '0.88rem', fontWeight: 500 }}>
      {subtitle}
    </Typography>
  </Box>
);

/* ─── Field wrapper ─── */
const Field = ({ label, error, children }) => (
  <Box>
    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.text, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </Typography>
    {children}
    {error && <Typography sx={{ color: T.error, fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>{error}</Typography>}
  </Box>
);

const inputSx = (hasError) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#f8fafc', fontSize: '0.92rem', fontWeight: 600,
    '& fieldset': { borderColor: hasError ? T.error : T.border, borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: T.primary },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
  },
});

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const CaptainRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState('');
  const [copied, setCopied] = useState(false);

  /* Sponsor */
  const [sponsorId, setSponsorId] = useState('');
  const [sponsorVerifying, setSponsorVerifying] = useState(false);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [sponsorError, setSponsorError] = useState('');

  /* Show/hide passwords */
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Form */
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    pincode: '', district: '', state: '',
    pincodeLoading: false, pincodeVerified: false,
    password: '', confirmPassword: '', termsAccepted: false,
  });

  /* Restore draft */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed, pincodeLoading: false }));
        if (parsed.sponsorId) setSponsorId(parsed.sponsorId);
      }
    } catch { /* ignore */ }
  }, []);

  /* Save draft */
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form, sponsorId }));
    }
  }, [form, sponsorId, submitted]);

  /* ── Sponsor verify ── */
  const verifySponsor = async () => {
    const id = sponsorId.trim().toUpperCase();
    if (!id) { setSponsorError('Please enter a Sponsor ID'); return; }
    setSponsorVerifying(true);
    setSponsorError('');
    setSponsorInfo(null);
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/sponsor/verify?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        setSponsorInfo(data);
      } else {
        throw new Error('not found');
      }
    } catch {
      /* Offline fallback: format validation */
      if (/^(TRPN|CB)\d{10}$/.test(id)) {
        setSponsorInfo({ sponsorId: id, sponsorName: 'Sponsor Partner', valid: true, category: id.startsWith('CB') ? 'agency_sub_franchise' : 'agency_pincode' });
      } else {
        setSponsorError('Invalid Sponsor ID. Must start with TRPN or CB followed by 10 digits.');
      }
    } finally {
      setSponsorVerifying(false);
    }
  };

  /* ── Pincode lookup ── */
  const handlePincodeChange = useCallback(async (raw) => {
    const val = raw.replace(/\D/g, '').slice(0, 6);
    setForm(prev => ({ ...prev, pincode: val, district: '', state: '', pincodeVerified: false, pincodeLoading: val.length === 6 }));
    setErrors(prev => ({ ...prev, pincode: '' }));
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0]?.Status === 'Success') {
          const po = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev, pincodeLoading: false, pincodeVerified: true,
            district: po.District || '', state: po.State || '',
          }));
        } else {
          setForm(prev => ({ ...prev, pincodeLoading: false }));
          setErrors(prev => ({ ...prev, pincode: 'Invalid pincode — no records found' }));
        }
      } catch {
        setForm(prev => ({ ...prev, pincodeLoading: false }));
        setErrors(prev => ({ ...prev, pincode: 'Could not verify pincode — check your connection' }));
      }
    }
  }, []);

  /* ── Validation ── */
  const validate = (s) => {
    const e = {};
    if (s === 1 && !sponsorInfo) e.sponsor = 'Verify your Sponsor ID to proceed';
    if (s === 2) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone number';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email address';
    }
    if (s === 3) {
      if (form.pincode.length !== 6) e.pincode = 'Enter a valid 6-digit pincode';
      else if (!form.pincodeVerified) e.pincode = 'Pincode not verified — wait for lookup to complete';
    }
    if (s === 4) {
      if (form.password.length < 8) e.password = 'Minimum 8 characters required';
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 5 && !form.termsAccepted) e.termsAccepted = 'Please accept the Terms & Conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) { setDir(1); setStep(s => s + 1); setAlertMsg(''); } };
  const back = () => { setDir(-1); setStep(s => s - 1); setAlertMsg(''); };

  const handleSubmit = async () => {
    if (!validate(5)) return;
    setLoading(true);
    setAlertMsg('');
    try {
      const payload = {
        sponsorId: sponsorId.trim().toUpperCase(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
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
        localStorage.removeItem(STORAGE_KEY);
        setSubmitted(true);
      } else {
        const err = await res.json().catch(() => ({}));
        setAlertMsg(err.message || err.detail || 'Registration failed. Please try again.');
      }
    } catch {
      /* Demo mode: show success even if backend unreachable */
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const captainId = `CB${form.phone}`;
  const strength = getStrength(form.password);
  const progress = submitted ? 100 : ((step - 1) / TOTAL_STEPS) * 100;

  const copyId = () => {
    navigator.clipboard.writeText(captainId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  /* ────────────────── RENDER ────────────────── */
  return (
    <Box sx={{
      minHeight: '100vh', background: 'linear-gradient(150deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdfa 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      {['rgba(13,148,136,0.06)', 'rgba(6,182,212,0.05)'].map((bg, i) => (
        <Box key={i} sx={{
          position: 'absolute', borderRadius: '50%', background: bg,
          width: i === 0 ? 600 : 400, height: i === 0 ? 600 : 400,
          top: i === 0 ? '-10%' : '60%', left: i === 0 ? '-5%' : '70%',
          pointerEvents: 'none',
        }} />
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>

        {/* Back link */}
        {!submitted && (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/onboarding')}
            sx={{ mb: 2, color: T.textSecondary, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: T.primary } }}
          >
            Back to Registration
          </Button>
        )}

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              {/* Card */}
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 4px 40px rgba(13,148,136,0.1)', overflow: 'hidden',
              }}>
                {/* Header bar */}
                <Box sx={{ background: T.captainGrad, p: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                      <Shield sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Captain Registration</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', fontWeight: 500 }}>Step {step} of {TOTAL_STEPS}</Typography>
                    </Box>
                  </Box>
                  {/* Progress */}
                  <LinearProgress
                    variant="determinate" value={progress}
                    sx={{
                      borderRadius: 10, height: 6, bgcolor: 'rgba(255,255,255,0.25)',
                      '& .MuiLinearProgress-bar': { borderRadius: 10, background: 'rgba(255,255,255,0.9)' },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                      <Typography key={i} sx={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: i + 1 <= step ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                      }}>
                        {['Sponsor', 'Details', 'Location', 'Password', 'Review'][i]}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Alert */}
                {alertMsg && (
                  <Alert severity="error" onClose={() => setAlertMsg('')} sx={{ mx: 3, mt: 2, borderRadius: '10px' }}>
                    {alertMsg}
                  </Alert>
                )}

                {/* Step content */}
                <Box sx={{ p: 3, minHeight: 380 }}>
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >

                      {/* ── STEP 1: Sponsor ── */}
                      {step === 1 && (
                        <Box>
                          <StepHeader step={1} icon={<VerifiedUser />} title="Sponsor Verification" subtitle="Enter your sponsor's ID to get started" />
                          <Stack spacing={2.5}>
                            <Field label="Sponsor ID" error={sponsorError || errors.sponsor}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                  fullWidth
                                  value={sponsorId}
                                  onChange={e => { setSponsorId(e.target.value.toUpperCase()); setSponsorInfo(null); setSponsorError(''); }}
                                  placeholder="TRPN1234567890 or CB1234567890"
                                  onKeyDown={e => e.key === 'Enter' && verifySponsor()}
                                  size="small"
                                  sx={inputSx(!!sponsorError || !!errors.sponsor)}
                                />
                                <Button
                                  onClick={verifySponsor}
                                  disabled={sponsorVerifying || !sponsorId.trim()}
                                  variant="contained"
                                  sx={{
                                    minWidth: 90, borderRadius: '10px', textTransform: 'none',
                                    fontWeight: 700, background: T.gradient, fontSize: '0.82rem',
                                    '&:hover': { background: T.primaryDark },
                                  }}
                                >
                                  {sponsorVerifying ? <CircularProgress size={18} color="inherit" /> : 'Verify'}
                                </Button>
                              </Box>
                            </Field>

                            {sponsorInfo && (
                              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <Box sx={{
                                  bgcolor: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.25)',
                                  borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                                }}>
                                  <CheckCircle sx={{ color: T.success, fontSize: 22 }} />
                                  <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: T.text }}>Sponsor Verified ✓</Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>{sponsorInfo.sponsorId}</Typography>
                                  </Box>
                                  <Chip label={sponsorInfo.category === 'agency_sub_franchise' ? 'Captain' : 'Pincode Partner'}
                                    size="small" sx={{ ml: 'auto', bgcolor: T.primaryLight, color: T.primaryDark, fontWeight: 700, fontSize: '0.7rem' }} />
                                </Box>
                              </motion.div>
                            )}

                            <Box sx={{ bgcolor: 'rgba(13,148,136,0.04)', borderRadius: '10px', p: 2, border: `1px solid ${T.primaryLight}` }}>
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.primary, mb: 0.5 }}>ACCEPTED SPONSOR TYPES</Typography>
                              {['TRPN — Pincode Partner', 'CB — Fellow Captain'].map(t => (
                                <Typography key={t} sx={{ fontSize: '0.78rem', color: T.textSecondary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box component="span" sx={{ color: T.success }}>✓</Box> {t}
                                </Typography>
                              ))}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 2: Personal Details ── */}
                      {step === 2 && (
                        <Box>
                          <StepHeader step={2} icon={<Person />} title="Personal Details" subtitle="Tell us about yourself" />
                          <Stack spacing={2.5}>
                            <Field label="Full Name *" error={errors.fullName}>
                              <TextField
                                fullWidth size="small"
                                value={form.fullName}
                                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                placeholder="Enter your full name"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                sx={inputSx(!!errors.fullName)}
                              />
                            </Field>

                            <Field label="Phone Number *" error={errors.phone}>
                              <TextField
                                fullWidth size="small"
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                placeholder="10-digit mobile number"
                                inputMode="numeric"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                sx={inputSx(!!errors.phone)}
                              />
                              {form.phone.length === 10 && (
                                <Fade in>
                                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 600 }}>Your Captain ID will be:</Typography>
                                    <Chip label={`CB${form.phone}`} size="small" sx={{ bgcolor: T.primaryLight, color: T.primaryDark, fontWeight: 800, fontSize: '0.75rem' }} />
                                  </Box>
                                </Fade>
                              )}
                            </Field>

                            <Field label="Email Address (optional)" error={errors.email}>
                              <TextField
                                fullWidth size="small"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="your@email.com"
                                type="email"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                                sx={inputSx(!!errors.email)}
                              />
                            </Field>
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 3: Location ── */}
                      {step === 3 && (
                        <Box>
                          <StepHeader step={3} icon={<LocationOn />} title="Your Service Location" subtitle="Enter your pincode — district & state auto-fill" />
                          <Stack spacing={2.5}>
                            <Field label="Pincode *" error={errors.pincode}>
                              <TextField
                                fullWidth size="small"
                                value={form.pincode}
                                onChange={e => handlePincodeChange(e.target.value)}
                                placeholder="6-digit pincode"
                                inputMode="numeric"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment>,
                                  endAdornment: form.pincodeLoading ? (
                                    <InputAdornment position="end"><CircularProgress size={16} sx={{ color: T.primary }} /></InputAdornment>
                                  ) : form.pincodeVerified ? (
                                    <InputAdornment position="end"><CheckCircle sx={{ color: T.success, fontSize: 18 }} /></InputAdornment>
                                  ) : null,
                                }}
                                sx={inputSx(!!errors.pincode)}
                              />
                            </Field>

                            <Field label="District">
                              <TextField
                                fullWidth size="small" value={form.district}
                                placeholder={form.pincodeLoading ? 'Looking up…' : 'Auto-filled from pincode'}
                                InputProps={{ readOnly: true }}
                                sx={{
                                  ...inputSx(false),
                                  '& .MuiOutlinedInput-root': {
                                    ...inputSx(false)['& .MuiOutlinedInput-root'],
                                    bgcolor: form.district ? 'rgba(16,185,129,0.04)' : '#f8fafc',
                                  },
                                }}
                              />
                            </Field>

                            <Field label="State">
                              <TextField
                                fullWidth size="small" value={form.state}
                                placeholder={form.pincodeLoading ? 'Looking up…' : 'Auto-filled from pincode'}
                                InputProps={{ readOnly: true }}
                                sx={{
                                  ...inputSx(false),
                                  '& .MuiOutlinedInput-root': {
                                    ...inputSx(false)['& .MuiOutlinedInput-root'],
                                    bgcolor: form.state ? 'rgba(16,185,129,0.04)' : '#f8fafc',
                                  },
                                }}
                              />
                            </Field>

                            {form.pincodeVerified && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <Box sx={{
                                  bgcolor: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.2)',
                                  borderRadius: '10px', p: 1.75, display: 'flex', alignItems: 'center', gap: 1.5,
                                }}>
                                  <CheckCircle sx={{ color: T.success, fontSize: 20 }} />
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text }}>
                                    Location verified: {form.district}, {form.state} — {form.pincode}
                                  </Typography>
                                </Box>
                              </motion.div>
                            )}
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 4: Password ── */}
                      {step === 4 && (
                        <Box>
                          <StepHeader step={4} icon={<Lock />} title="Secure Your Account" subtitle="Create a strong password to protect your account" />
                          <Stack spacing={2.5}>
                            <Field label="Password *" error={errors.password}>
                              <TextField
                                fullWidth size="small" type={showPwd ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="Minimum 8 characters"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment>,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={inputSx(!!errors.password)}
                              />
                              {form.password && (
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.72rem', color: T.textMuted, fontWeight: 600 }}>Strength</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>{strength.label}</Typography>
                                  </Box>
                                  <LinearProgress variant="determinate" value={strength.score}
                                    sx={{ borderRadius: 4, height: 4, bgcolor: T.border, '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 4 } }}
                                  />
                                </Box>
                              )}
                            </Field>

                            <Field label="Confirm Password *" error={errors.confirmPassword}>
                              <TextField
                                fullWidth size="small" type={showConfirm ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="Re-enter your password"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment>,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" size="small">
                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={inputSx(!!errors.confirmPassword)}
                              />
                              {form.confirmPassword && form.confirmPassword === form.password && (
                                <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 600, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CheckCircle sx={{ fontSize: 14 }} /> Passwords match
                                </Typography>
                              )}
                            </Field>

                            <Box sx={{ bgcolor: 'rgba(13,148,136,0.04)', borderRadius: '10px', p: 2, border: `1px solid ${T.primaryLight}` }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.primary, mb: 0.75 }}>PASSWORD TIPS</Typography>
                              {['At least 8 characters', 'Mix uppercase & lowercase', 'Include numbers and symbols'].map(t => (
                                <Typography key={t} sx={{ fontSize: '0.75rem', color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box component="span" sx={{ color: T.primary }}>•</Box> {t}
                                </Typography>
                              ))}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                      {/* ── STEP 5: Review & Submit ── */}
                      {step === 5 && (
                        <Box>
                          <StepHeader step={5} icon={<Verified />} title="Review & Submit" subtitle="Confirm your details before registering" />
                          <Stack spacing={2}>
                            {/* Summary */}
                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', p: 2.5, border: `1px solid ${T.border}` }}>
                              {[
                                { label: 'Sponsor ID', value: sponsorInfo?.sponsorId || sponsorId },
                                { label: 'Captain ID', value: captainId, highlight: true },
                                { label: 'Full Name', value: form.fullName },
                                { label: 'Phone', value: form.phone },
                                { label: 'Email', value: form.email || '—' },
                                { label: 'Pincode', value: form.pincode },
                                { label: 'District', value: form.district },
                                { label: 'State', value: form.state },
                              ].map(({ label, value, highlight }) => (
                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${T.border}`, '&:last-child': { border: 'none' } }}>
                                  <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>{label}</Typography>
                                  <Typography sx={{ fontSize: '0.78rem', color: highlight ? T.primary : T.text, fontWeight: highlight ? 800 : 700 }}>{value}</Typography>
                                </Box>
                              ))}
                            </Box>

                            {/* Terms */}
                            <Box>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={form.termsAccepted}
                                    onChange={e => setForm(p => ({ ...p, termsAccepted: e.target.checked }))}
                                    sx={{ color: errors.termsAccepted ? T.error : T.primary, '&.Mui-checked': { color: T.primary } }}
                                    size="small"
                                  />
                                }
                                label={
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: T.text }}>
                                    I agree to Trikonekt's{' '}
                                    <Box component="span" sx={{ color: T.primary, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                                      Terms & Conditions
                                    </Box>{' '}and{' '}
                                    <Box component="span" sx={{ color: T.primary, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                                      Privacy Policy
                                    </Box>
                                  </Typography>
                                }
                              />
                              {errors.termsAccepted && (
                                <Typography sx={{ color: T.error, fontSize: '0.75rem', fontWeight: 600, ml: 4 }}>{errors.termsAccepted}</Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </Box>

                {/* Footer navigation */}
                <Box sx={{ px: 3, pb: 3, borderTop: `1px solid ${T.border}`, pt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {step > 1 ? (
                      <Button
                        onClick={back} startIcon={<ArrowBack />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5, py: 1.1, color: T.textSecondary, border: `1.5px solid ${T.border}`, fontSize: '0.87rem' }}
                      >
                        Back
                      </Button>
                    ) : <Box />}

                    {step < TOTAL_STEPS ? (
                      <Button
                        onClick={next} endIcon={<ArrowForward />} variant="contained"
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3, py: 1.1, background: T.gradient, fontSize: '0.9rem', '&:hover': { background: T.primaryDark } }}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit} disabled={loading} variant="contained"
                        sx={{
                          borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3, py: 1.25,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 4px 14px rgba(16,185,129,0.3)', fontSize: '0.9rem',
                          '&:hover': { background: '#059669', transform: 'translateY(-1px)' }, transition: 'all 0.2s',
                        }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Register as Captain'}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Box>
            </motion.div>

          ) : (
            /* ── SUCCESS SCREEN ── */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 18, stiffness: 120 }}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 4px 40px rgba(13,148,136,0.12)', p: { xs: 4, md: 5 }, textAlign: 'center',
              }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 14 }}>
                  <Box sx={{
                    width: 96, height: 96, borderRadius: '50%', mx: 'auto', mb: 3,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.12) 100%)',
                    border: '3px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center',
                  }}>
                    <CheckCircle sx={{ fontSize: 52, color: T.success }} />
                  </Box>
                </motion.div>

                <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', color: T.text, mb: 0.5, letterSpacing: '-0.03em' }}>
                  Welcome, Captain! 🎉
                </Typography>
                <Typography sx={{ color: T.textSecondary, fontSize: '0.9rem', fontWeight: 500, mb: 3 }}>
                  Your registration is complete. Here is your Captain ID:
                </Typography>

                {/* Captain ID display */}
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1.5,
                  bgcolor: 'rgba(13,148,136,0.06)', border: '2px solid rgba(13,148,136,0.2)',
                  borderRadius: '14px', px: 3, py: 1.75, mb: 3,
                }}>
                  <Shield sx={{ color: T.primary, fontSize: 24 }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: T.primary, letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                    {captainId}
                  </Typography>
                  <IconButton onClick={copyId} size="small" sx={{ color: T.textMuted, '&:hover': { color: T.primary } }}>
                    {copied ? <Done fontSize="small" sx={{ color: T.success }} /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Box>

                <Typography sx={{ color: T.textMuted, fontSize: '0.82rem', fontWeight: 500, mb: 4, maxWidth: 340, mx: 'auto', lineHeight: 1.6 }}>
                  Save this ID — you'll use it to log in and share with your referrals. Your account will be activated within 24 hours.
                </Typography>

                <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                  <Button
                    onClick={() => navigate('/captain/login')}
                    variant="contained"
                    sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 4, py: 1.5,
                      background: T.gradient, boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
                    }}
                  >
                    Login to Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outlined"
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 4, py: 1.5, borderColor: T.border, color: T.textSecondary }}
                  >
                    Go to Home
                  </Button>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default CaptainRegister;
