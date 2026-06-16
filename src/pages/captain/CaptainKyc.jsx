import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  CheckCircle as ValidIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  bg: '#f0fdfa',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
};

export default function CaptainKyc() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    aadhaarFront: false,
    aadhaarBack: false,
    panCard: false,
    selfie: false
  });

  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  // Form Fields State
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateName: '',
    pincode: '',

    aadhaarNumber: '',
    panNumber: '',
    aadhaarFrontUrl: '',
    aadhaarBackUrl: '',
    panCardUrl: '',
    selfieUrl: '',

    nomineeName: '',
    nomineeRelationship: '',
    nomineePhone: '',
    nomineeAadhaar: '',
    nomineeDob: '',

    bankHolderName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankAccountType: 'Savings'
  });

  const API_URL = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('captain_access_token');
        if (!token) {
          navigate('/captain/login');
          return;
        }

        const res = await fetch(`${API_URL}/captain/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Map backend response back into local form fields, replacing nulls with empty strings
          setFormData({
            dob: data.dob || '',
            gender: data.gender || '',
            addressLine1: data.addressLine1 || '',
            addressLine2: data.addressLine2 || '',
            city: data.city || '',
            stateName: data.stateName || '',
            pincode: data.pincode || '',
            aadhaarNumber: data.aadhaarNumber || '',
            panNumber: data.panNumber || '',
            aadhaarFrontUrl: data.aadhaarFrontUrl || '',
            aadhaarBackUrl: data.aadhaarBackUrl || '',
            panCardUrl: data.panCardUrl || '',
            selfieUrl: data.selfieUrl || '',
            nomineeName: data.nomineeName || '',
            nomineeRelationship: data.nomineeRelationship || '',
            nomineePhone: data.nomineePhone || '',
            nomineeAadhaar: data.nomineeAadhaar || '',
            nomineeDob: data.nomineeDob || '',
            bankHolderName: data.bankHolderName || '',
            bankName: data.bankName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankIfsc: data.bankIfsc || '',
            bankAccountType: data.bankAccountType || 'Savings'
          });
        }
      } catch (err) {
        console.error("Failed fetching profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto lookup pincode
    if (name === 'pincode' && value.length === 6) {
      lookupPincode(value);
    }
  };

  const lookupPincode = async (pin) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District,
          stateName: postOffice.State
        }));
        setToast({ open: true, type: 'success', message: `Pincode details auto-filled: ${postOffice.District}, ${postOffice.State}` });
      }
    } catch (e) {
      console.error("Pincode lookup error:", e);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, type: 'error', message: 'File is too large. Max size is 5MB.' });
      return;
    }

    setUploading(prev => ({ ...prev, [field]: true }));

    try {
      const token = localStorage.getItem('captain_access_token');
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch(`${API_URL}/captain/kyc/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [`${field}Url`]: data.url }));
        setToast({ open: true, type: 'success', message: 'Document uploaded successfully to Cloudinary!' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setToast({ open: true, type: 'error', message: 'Failed to upload document. Please try again.' });
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('captain_access_token');
      const res = await fetch(`${API_URL}/captain/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setToast({ open: true, type: 'success', message: 'KYC and profile saved successfully!' });
      } else {
        const err = await res.json();
        setToast({ open: true, type: 'error', message: err.message || 'Failed to save changes.' });
      }
    } catch (err) {
      setToast({ open: true, type: 'error', message: 'Network error. Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: T.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Back to Home Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/captain/home')} sx={{ color: T.textSecondary }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: '800', color: T.text }}>
          Update KYC Details
        </Typography>
      </Box>

      {/* Tabs list */}
      <Box sx={{ borderBottom: 1, borderColor: T.border, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': { bgcolor: T.primary },
            '& .MuiTab-root': {
              fontWeight: 'bold',
              textTransform: 'none',
              minWidth: 90,
              fontSize: '0.85rem',
              color: T.textSecondary,
              '&.Mui-selected': { color: T.primary }
            }
          }}
        >
          <Tab label="Profile" />
          <Tab label="KYC Docs" />
          <Tab label="Nominee" />
          <Tab label="Bank Account" />
        </Tabs>
      </Box>

      {/* Form Card Content */}
      <Card sx={{ borderRadius: '20px', border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="subtitle2" color={T.primary} sx={{ fontWeight: 'bold', mb: 2.5 }}>
                    Personal Profile Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        fullWidth
                        value={formData.dob}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Gender"
                        name="gender"
                        fullWidth
                        value={formData.gender}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Address Line 1"
                        name="addressLine1"
                        fullWidth
                        value={formData.addressLine1}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Address Line 2"
                        name="addressLine2"
                        fullWidth
                        value={formData.addressLine2}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Pincode"
                        name="pincode"
                        fullWidth
                        value={formData.pincode}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="City/District"
                        name="city"
                        fullWidth
                        value={formData.city}
                        onChange={handleChange}
                        disabled
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="State"
                        name="stateName"
                        fullWidth
                        value={formData.stateName}
                        onChange={handleChange}
                        disabled
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="subtitle2" color={T.primary} sx={{ fontWeight: 'bold', mb: 2.5 }}>
                    KYC Identification & Documents
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Aadhaar Number (12 Digits)"
                        name="aadhaarNumber"
                        fullWidth
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="PAN Card Number (ABCDE1234F)"
                        name="panNumber"
                        fullWidth
                        value={formData.panNumber}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>

                    {/* Aadhaar Front File Upload */}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                        Aadhaar Front Photo
                      </Typography>
                      <Box sx={{ border: `1.5px dashed ${T.border}`, borderRadius: '12px', p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                        {formData.aadhaarFrontUrl ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <img src={formData.aadhaarFrontUrl} alt="Aadhaar Front" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
                            <Chip size="small" label="Uploaded to Cloudinary" color="success" />
                          </Box>
                        ) : (
                          <Button variant="text" component="label" startIcon={uploading.aadhaarFront ? <CircularProgress size={20} /> : <UploadIcon />} sx={{ color: T.primary, textTransform: 'none', fontWeight: 'bold' }}>
                            {uploading.aadhaarFront ? 'Uploading...' : 'Choose File'}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhaarFront')} />
                          </Button>
                        )}
                      </Box>
                    </Grid>

                    {/* Aadhaar Back File Upload */}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                        Aadhaar Back Photo
                      </Typography>
                      <Box sx={{ border: `1.5px dashed ${T.border}`, borderRadius: '12px', p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                        {formData.aadhaarBackUrl ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <img src={formData.aadhaarBackUrl} alt="Aadhaar Back" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
                            <Chip size="small" label="Uploaded to Cloudinary" color="success" />
                          </Box>
                        ) : (
                          <Button variant="text" component="label" startIcon={uploading.aadhaarBack ? <CircularProgress size={20} /> : <UploadIcon />} sx={{ color: T.primary, textTransform: 'none', fontWeight: 'bold' }}>
                            {uploading.aadhaarBack ? 'Uploading...' : 'Choose File'}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'aadhaarBack')} />
                          </Button>
                        )}
                      </Box>
                    </Grid>

                    {/* PAN Card Upload */}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                        PAN Card Photo
                      </Typography>
                      <Box sx={{ border: `1.5px dashed ${T.border}`, borderRadius: '12px', p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                        {formData.panCardUrl ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <img src={formData.panCardUrl} alt="PAN Card" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
                            <Chip size="small" label="Uploaded to Cloudinary" color="success" />
                          </Box>
                        ) : (
                          <Button variant="text" component="label" startIcon={uploading.panCard ? <CircularProgress size={20} /> : <UploadIcon />} sx={{ color: T.primary, textTransform: 'none', fontWeight: 'bold' }}>
                            {uploading.panCard ? 'Uploading...' : 'Choose File'}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'panCard')} />
                          </Button>
                        )}
                      </Box>
                    </Grid>

                    {/* Selfie Upload */}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                        Selfie with Aadhaar Card
                      </Typography>
                      <Box sx={{ border: `1.5px dashed ${T.border}`, borderRadius: '12px', p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                        {formData.selfieUrl ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <img src={formData.selfieUrl} alt="Selfie" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
                            <Chip size="small" label="Uploaded to Cloudinary" color="success" />
                          </Box>
                        ) : (
                          <Button variant="text" component="label" startIcon={uploading.selfie ? <CircularProgress size={20} /> : <UploadIcon />} sx={{ color: T.primary, textTransform: 'none', fontWeight: 'bold' }}>
                            {uploading.selfie ? 'Uploading...' : 'Choose File'}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'selfie')} />
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="subtitle2" color={T.primary} sx={{ fontWeight: 'bold', mb: 2.5 }}>
                    Nominee Details (For Account Security)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Nominee Full Name"
                        name="nomineeName"
                        fullWidth
                        value={formData.nomineeName}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Relationship"
                        name="nomineeRelationship"
                        fullWidth
                        value={formData.nomineeRelationship}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      >
                        <MenuItem value="Spouse">Spouse</MenuItem>
                        <MenuItem value="Parent">Parent</MenuItem>
                        <MenuItem value="Child">Child</MenuItem>
                        <MenuItem value="Sibling">Sibling</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Nominee Phone Number"
                        name="nomineePhone"
                        fullWidth
                        value={formData.nomineePhone}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Nominee Aadhaar Number"
                        name="nomineeAadhaar"
                        fullWidth
                        value={formData.nomineeAadhaar}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Nominee Date of Birth"
                        type="date"
                        name="nomineeDob"
                        fullWidth
                        value={formData.nomineeDob}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="subtitle2" color={T.primary} sx={{ fontWeight: 'bold', mb: 2.5 }}>
                    Settlement Bank Account Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Account Holder Name"
                        name="bankHolderName"
                        fullWidth
                        value={formData.bankHolderName}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Bank Name"
                        name="bankName"
                        fullWidth
                        value={formData.bankName}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Account Number"
                        name="bankAccountNumber"
                        fullWidth
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Bank IFSC Code"
                        name="bankIfsc"
                        fullWidth
                        value={formData.bankIfsc}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Account Type"
                        name="bankAccountType"
                        fullWidth
                        value={formData.bankAccountType}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      >
                        <MenuItem value="Savings">Savings</MenuItem>
                        <MenuItem value="Current">Current</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeTab === 0}
                onClick={() => setActiveTab(prev => prev - 1)}
                variant="outlined"
                sx={{ borderRadius: '10px', borderColor: T.border, color: T.textSecondary, textTransform: 'none' }}
              >
                Previous
              </Button>

              {activeTab < 3 ? (
                <Button
                  onClick={() => setActiveTab(prev => prev + 1)}
                  variant="contained"
                  sx={{ background: T.gradient, color: 'white', borderRadius: '10px', textTransform: 'none' }}
                >
                  Next Tab
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{ background: T.gradient, color: 'white', borderRadius: '10px', textTransform: 'none', px: 4 }}
                >
                  {saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Details'}
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.type} onClose={() => setToast(prev => ({ ...prev, open: false }))} sx={{ borderRadius: '12px' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
