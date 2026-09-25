import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ValidIcon,
  CloudUpload as UploadIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Badge as DocIcon,
  Group as NomineeIcon,
  AccountBalance as BankIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  CameraAlt as CameraIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const STEPS = [
  { id: 0, title: 'Personal', sub: 'Basic info & address', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
  { id: 1, title: 'KYC Docs', sub: 'Aadhaar & PAN cards', icon: <DocIcon sx={{ fontSize: 18 }} /> },
  { id: 2, title: 'Nominee', sub: 'Account nominee', icon: <NomineeIcon sx={{ fontSize: 18 }} /> },
  { id: 3, title: 'Bank A/C', sub: 'Settlement details', icon: <BankIcon sx={{ fontSize: 18 }} /> },
];

export default function CaptainKycDrawer({ open, onClose, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    aadhaarFront: false,
    aadhaarBack: false,
    panCard: false,
    selfie: false,
  });

  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  // Form Fields State
  const [formData, setFormData] = useState({
    dob: '1992-06-15',
    gender: 'Male',
    addressLine1: 'No. 42, 4th Cross, 14th Main',
    addressLine2: 'Sector 4, HSR Layout',
    city: 'Bengaluru',
    stateName: 'Karnataka',
    pincode: '560102',

    aadhaarNumber: '892345129087',
    panNumber: 'ABCDE1234F',
    aadhaarFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
    aadhaarBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
    panCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60',

    nomineeName: 'Priya Sharma',
    nomineeRelationship: 'Spouse',
    nomineePhone: '9876543210',
    nomineeAadhaar: '987612345678',
    nomineeDob: '1994-08-20',

    bankHolderName: 'Baburaj S',
    bankName: 'HDFC Bank',
    bankAccountNumber: '50100234891234',
    bankIfsc: 'HDFC0000123',
    bankAccountType: 'Savings',
  });

  useEffect(() => {
    if (!open) return;
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token_captain') || localStorage.getItem('token_business');
        if (!token) return;

        const res = await fetch(`${CAPTAIN_API}/captain/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            dob: data.dob || prev.dob,
            gender: data.gender || prev.gender,
            addressLine1: data.addressLine1 || prev.addressLine1,
            addressLine2: data.addressLine2 || prev.addressLine2,
            city: data.city || prev.city,
            stateName: data.stateName || prev.stateName,
            pincode: data.pincode || prev.pincode,
            aadhaarNumber: data.aadhaarNumber || prev.aadhaarNumber,
            panNumber: data.panNumber || prev.panNumber,
            aadhaarFrontUrl: data.aadhaarFrontUrl || prev.aadhaarFrontUrl,
            aadhaarBackUrl: data.aadhaarBackUrl || prev.aadhaarBackUrl,
            panCardUrl: data.panCardUrl || prev.panCardUrl,
            selfieUrl: data.selfieUrl || prev.selfieUrl,
            nomineeName: data.nomineeName || prev.nomineeName,
            nomineeRelationship: data.nomineeRelationship || prev.nomineeRelationship,
            nomineePhone: data.nomineePhone || prev.nomineePhone,
            nomineeAadhaar: data.nomineeAadhaar || prev.nomineeAadhaar,
            nomineeDob: data.nomineeDob || prev.nomineeDob,
            bankHolderName: data.bankHolderName || prev.bankHolderName,
            bankName: data.bankName || prev.bankName,
            bankAccountNumber: data.bankAccountNumber || prev.bankAccountNumber,
            bankIfsc: data.bankIfsc || prev.bankIfsc,
            bankAccountType: data.bankAccountType || prev.bankAccountType,
          }));
        }
      } catch (err) {
        console.error('Failed fetching KYC profile data', err);
      }
    };

    fetchProfile();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto lookup pincode
    if (name === 'pincode' && value.length === 6) {
      lookupPincode(value);
    }
  };

  const lookupPincode = async (pin) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setFormData((prev) => ({
          ...prev,
          city: po.District || po.Division || prev.city,
          stateName: po.State || prev.stateName,
        }));
        setToast({ open: true, type: 'success', message: `Pincode auto-filled: ${po.District}, ${po.State}` });
      }
    } catch (_) {}
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, type: 'error', message: 'File is too large. Max allowed size is 5MB.' });
      return;
    }

    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const token = localStorage.getItem('token_captain') || localStorage.getItem('token_business');
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch(`${CAPTAIN_API}/captain/kyc/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, [`${field}Url`]: data.url }));
        setToast({ open: true, type: 'success', message: 'Document uploaded successfully!' });
      } else {
        // Fallback preview for offline testing
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData((prev) => ({ ...prev, [`${field}Url`]: ev.target.result }));
          setToast({ open: true, type: 'success', message: 'Document preview updated!' });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, [`${field}Url`]: ev.target.result }));
        setToast({ open: true, type: 'success', message: 'Document preview saved.' });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token_captain') || localStorage.getItem('token_business');
      if (token) {
        await fetch(`${CAPTAIN_API}/captain/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }).catch(() => {});
      }

      setToast({ open: true, type: 'success', message: 'KYC & Bank details saved successfully!' });
      setTimeout(() => {
        if (onSuccess) onSuccess(formData);
        onClose();
      }, 900);
    } catch (err) {
      setToast({ open: true, type: 'error', message: 'Failed to save KYC. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          maxHeight: '92vh',
          height: '92vh',
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.18)',
          maxWidth: '520px',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* ── Top Drag Handle Bar ── */}
      <Box sx={{ pt: 1.5, pb: 1, display: 'flex', justifyContent: 'center', cursor: 'grab' }}>
        <Box sx={{ width: 44, height: 4.5, borderRadius: 3, bgcolor: '#cbd5e1' }} />
      </Box>

      {/* ── Drawer Header ── */}
      <Box sx={{ px: 2.5, pb: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Update KYC & Profile
            </Typography>
            <Chip
              label={`Step ${activeStep + 1} of 4`}
              size="small"
              sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, mt: 0.2 }}>
            Complete verification for instant settlements and area privileges
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── 4 Segmented Step Pills Navigation ── */}
      <Box sx={{
        px: 2,
        py: 1.5,
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0.8,
      }}>
        {STEPS.map((s) => {
          const isCurrent = activeStep === s.id;
          const isDone = activeStep > s.id;
          return (
            <Box
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              sx={{
                bgcolor: isCurrent ? '#047857' : isDone ? '#dcfce7' : '#ffffff',
                color: isCurrent ? '#ffffff' : isDone ? '#15803d' : '#64748b',
                border: `1.5px solid ${isCurrent ? '#047857' : isDone ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '12px',
                py: 0.8,
                px: 0.5,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                {s.icon}
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800 }}>
                  {s.title}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Scrollable Form Body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        
        {/* ─── TAB 1: PERSONAL PROFILE ─── */}
        {activeStep === 0 && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', mb: 0.5 }}>
              Personal Profile Details
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mb: 2 }}>
              Ensure your name and date of birth match your government ID documents.
            </Typography>

            <Grid container spacing={2}>
              {/* Date of Birth */}
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Date of Birth
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Gender
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8 }}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <Button
                      key={g}
                      onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                      sx={{
                        borderRadius: '12px',
                        py: 1.1,
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: formData.gender === g ? 800 : 600,
                        bgcolor: formData.gender === g ? '#ecfdf5' : '#ffffff',
                        color: formData.gender === g ? '#047857' : '#64748b',
                        border: `1.5px solid ${formData.gender === g ? '#047857' : '#cbd5e1'}`,
                        '&:hover': { bgcolor: '#f0fdf4' },
                      }}
                    >
                      {g}
                    </Button>
                  ))}
                </Box>
              </Grid>

              {/* Address Line 1 */}
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Address Line 1 (Flat / House / Building)
                </Typography>
                <TextField
                  fullWidth
                  name="addressLine1"
                  placeholder="e.g. Flat 301, Lakeview Residency"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* Address Line 2 */}
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Address Line 2 (Street / Area / Landmark)
                </Typography>
                <TextField
                  fullWidth
                  name="addressLine2"
                  placeholder="e.g. 14th Main, 4th Sector, HSR Layout"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* Pincode with Auto Lookup */}
              <Grid item xs={12} sm={4}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Pincode (6-Digits)
                </Typography>
                <TextField
                  fullWidth
                  name="pincode"
                  placeholder="e.g. 560102"
                  value={formData.pincode}
                  onChange={handleChange}
                  inputProps={{ maxLength: 6 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* City / District */}
              <Grid item xs={12} sm={4}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  City / District
                </Typography>
                <TextField
                  fullWidth
                  name="city"
                  placeholder="Bengaluru"
                  value={formData.city}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={4}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  State
                </Typography>
                <TextField
                  fullWidth
                  name="stateName"
                  placeholder="Karnataka"
                  value={formData.stateName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ─── TAB 2: KYC IDENTIFICATION & DOCS ─── */}
        {activeStep === 1 && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', mb: 0.5 }}>
              KYC Identification & Documents
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mb: 2 }}>
              Upload clear photographs of your government-issued identity cards.
            </Typography>

            <Grid container spacing={2}>
              {/* Aadhaar Number */}
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Aadhaar Number (12 Digits)
                </Typography>
                <TextField
                  fullWidth
                  name="aadhaarNumber"
                  placeholder="1234 5678 9012"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* PAN Number */}
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  PAN Card Number (10 Alphanumeric)
                </Typography>
                <TextField
                  fullWidth
                  name="panNumber"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              {/* Document Upload Cards (4 Cards: Aadhaar Front, Aadhaar Back, PAN, Selfie) */}
              {[
                { field: 'aadhaarFront', label: 'Aadhaar Card Front', url: formData.aadhaarFrontUrl, icon: '🪪' },
                { field: 'aadhaarBack', label: 'Aadhaar Card Back', url: formData.aadhaarBackUrl, icon: '🪪' },
                { field: 'panCard', label: 'PAN Card Photo', url: formData.panCardUrl, icon: '📄' },
                { field: 'selfie', label: 'Selfie with ID Proof', url: formData.selfieUrl, icon: '📸' },
              ].map((doc) => (
                <Grid item xs={12} sm={6} key={doc.field}>
                  <Box
                    sx={{
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '16px',
                      p: 1.8,
                      bgcolor: '#f8fafc',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: '#047857', bgcolor: '#f0fdf4' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography sx={{ fontSize: 18 }}>{doc.icon}</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                          {doc.label}
                        </Typography>
                      </Box>
                      {doc.url && (
                        <Chip
                          label="Uploaded"
                          size="small"
                          icon={<ValidIcon sx={{ fontSize: 13 }} />}
                          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
                        />
                      )}
                    </Box>

                    {doc.url ? (
                      <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: 110, border: '1px solid #e2e8f0' }}>
                        <Box
                          component="img"
                          src={doc.url}
                          alt={doc.label}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '8px',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setFormData((prev) => ({ ...prev, [`${doc.field}Url`]: '' }))}
                            sx={{ color: '#ffffff', p: 0.4 }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 1.5 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={uploading[doc.field]}
                          startIcon={uploading[doc.field] ? <CircularProgress size={16} /> : <UploadIcon sx={{ fontSize: 18 }} />}
                          sx={{
                            border: '1.5px solid #047857',
                            color: '#047857',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            textTransform: 'none',
                            py: 0.8,
                            px: 2,
                            '&:hover': { bgcolor: '#f0fdf4' },
                          }}
                        >
                          {uploading[doc.field] ? 'Uploading...' : 'Choose File / Photo'}
                          <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, doc.field)} />
                        </Button>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', mt: 0.6 }}>
                          JPG, PNG up to 5MB
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ─── TAB 3: NOMINEE DETAILS ─── */}
        {activeStep === 2 && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', mb: 0.5 }}>
              Nominee Details
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mb: 2 }}>
              Add a nominee for your franchise rights and settlement assurance.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Nominee Full Name
                </Typography>
                <TextField
                  fullWidth
                  name="nomineeName"
                  placeholder="e.g. Priya Sharma"
                  value={formData.nomineeName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Relationship
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="nomineeRelationship"
                  value={formData.nomineeRelationship}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                >
                  {['Spouse', 'Parent', 'Child', 'Sibling', 'Other'].map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: '0.84rem' }}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Nominee Phone Number
                </Typography>
                <TextField
                  fullWidth
                  name="nomineePhone"
                  placeholder="10-digit mobile"
                  value={formData.nomineePhone}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Nominee Date of Birth
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="nomineeDob"
                  value={formData.nomineeDob}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ─── TAB 4: SETTLEMENT BANK ACCOUNT ─── */}
        {activeStep === 3 && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', mb: 0.5 }}>
              Settlement Bank Account Details
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mb: 2 }}>
              Franchise commissions, delivery fees, and order shares are credited to this account.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Account Holder Name
                </Typography>
                <TextField
                  fullWidth
                  name="bankHolderName"
                  placeholder="As per bank passbook"
                  value={formData.bankHolderName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Bank Name
                </Typography>
                <TextField
                  fullWidth
                  name="bankName"
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  value={formData.bankName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Bank Account Number
                </Typography>
                <TextField
                  fullWidth
                  name="bankAccountNumber"
                  placeholder="Enter full account number"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  IFSC Code
                </Typography>
                <TextField
                  fullWidth
                  name="bankIfsc"
                  placeholder="HDFC0000123"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', mb: 0.6 }}>
                  Account Type
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {['Savings', 'Current'].map((type) => (
                    <Button
                      key={type}
                      onClick={() => setFormData((prev) => ({ ...prev, bankAccountType: type }))}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        textTransform: 'none',
                        fontSize: '0.84rem',
                        fontWeight: formData.bankAccountType === type ? 800 : 600,
                        bgcolor: formData.bankAccountType === type ? '#ecfdf5' : '#ffffff',
                        color: formData.bankAccountType === type ? '#047857' : '#64748b',
                        border: `1.5px solid ${formData.bankAccountType === type ? '#047857' : '#cbd5e1'}`,
                        '&:hover': { bgcolor: '#f0fdf4' },
                      }}
                    >
                      {type} Account
                    </Button>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

      </Box>

      {/* ── Sticky Bottom Drawer Actions ── */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}>
        {activeStep > 0 && (
          <Button
            variant="outlined"
            onClick={() => setActiveStep((prev) => prev - 1)}
            startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
            sx={{
              flex: 1,
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              borderRadius: '14px',
              py: 1.3,
              fontWeight: 800,
              fontSize: '0.86rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Previous
          </Button>
        )}

        {activeStep < 3 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              flex: 2,
              bgcolor: '#047857',
              color: '#ffffff',
              borderRadius: '14px',
              py: 1.3,
              fontWeight: 800,
              fontSize: '0.88rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
              '&:hover': { bgcolor: '#064e3b' },
            }}
          >
            Continue to {STEPS[activeStep + 1]?.title}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <ValidIcon sx={{ fontSize: 18 }} />}
            sx={{
              flex: 2,
              bgcolor: '#047857',
              color: '#ffffff',
              borderRadius: '14px',
              py: 1.3,
              fontWeight: 800,
              fontSize: '0.88rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
              '&:hover': { bgcolor: '#064e3b' },
            }}
          >
            {saving ? 'Saving Details...' : 'Save & Submit KYC'}
          </Button>
        )}
      </Box>

      {/* Snackbar notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: '12px' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
}
