import React, { useState, useEffect } from 'react';
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
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  RadioGroup,
  Radio,
  IconButton,
  InputAdornment,
  Divider,
  Stack,
  Alert,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Person,
  ContactPhone,
  Email,
  LocationOn,
  Lock,
  Assignment,
  Category,
  Store,
  Dashboard,
  GroupAdd
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const UI = {
  primaryGradient: 'linear-gradient(135deg, #228B22 0%, #1B4D3E 100%)',
  orangeGradient: 'linear-gradient(135deg, #1B4D3E 0%, #013220 100%)',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

const CATEGORIES = [
  "Food", "Grocery", "Fruits & Vegetables", "Milk & Milk Products", 
  "Medicines", "Electronics", "Plumbing", "Automobile", 
  "Baby Care", "Education", "Doctor", "Car Shop", "Others"
];

const BUSINESS_TYPES = [
  "Retailer", "Wholesaler", "Service Provider", "Distributor", 
  "Manufacturer", "Yard", "Industry"
];

const BusinessRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    sponsorId: '',
    ownerName: '',
    businessName: '',
    category: '',
    subCategory: { veg: false, nonVeg: false, both: false },
    businessType: '',
    dashboardType: 'Business Dashboard',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
    district: '',
    state: '',
    country: '',
    password: '',
    terms: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubCategoryChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      subCategory: { ...prev.subCategory, [name]: checked }
    }));
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData(prev => ({ ...prev, pincode }));
    
    if (pincode.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            district: postOffice.District,
            state: postOffice.State,
            country: 'India'
          }));
        }
      } catch (err) {
        console.error("Failed to fetch pincode data", err);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sponsorId) newErrors.sponsorId = "Sponsor ID is required";
    if (!formData.ownerName) newErrors.ownerName = "Owner Name is required";
    if (!formData.businessName) newErrors.businessName = "Business Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.mobile) newErrors.mobile = "Mobile Number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.terms) newErrors.terms = "Please accept the terms";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          navigate('/registration/add-products', { state: { category: formData.category } });
        }, 1500);
      }, 2000);
    }
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                color: UI.text, 
                mb: 1.5,
                fontSize: { xs: '1.75rem', md: '2.5rem' } 
              }}
            >
              Offline Business Registration
            </Typography>
            <Typography sx={{ color: UI.textMuted }}>
              Expand your business horizons with our premium digital ecosystem.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            
            {/* SPONSOR & OWNER SECTION */}
            <FormSection icon={<Person sx={{ color: '#228B22' }} />} title="Personal & Sponsor Details">
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <FormField label="Sponsor ID" error={errors.sponsorId}>
                    <TextField
                      fullWidth
                      name="sponsorId"
                      value={formData.sponsorId}
                      onChange={handleInputChange}
                      placeholder="Enter Sponsor ID"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Assignment sx={{ color: UI.textMuted, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField label="Owner Name" error={errors.ownerName}>
                    <TextField
                      fullWidth
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Full Name of Owner"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* BUSINESS INFO SECTION */}
            <FormSection icon={<Business sx={{ color: '#1B4D3E' }} />} title="Business Information">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <FormField label="Business Name" error={errors.businessName}>
                    <TextField
                      fullWidth
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Trade Name / Shop Name"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField label="Business Category" error={errors.category}>
                    <FormControl fullWidth sx={textFieldStyles}>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Category</MenuItem>
                        {CATEGORIES.map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField label="Business Type">
                    <FormControl fullWidth sx={textFieldStyles}>
                      <Select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Type</MenuItem>
                        {BUSINESS_TYPES.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                <AnimatePresence>
                  {formData.category === "Food" && (
                    <Grid item xs={12}>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <FormField label="Sub Category Selection">
                          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 3, border: `1px solid ${UI.border}` }}>
                            <FormGroup row sx={{ justifyContent: 'space-around' }}>
                              <FormControlLabel
                                  control={<Checkbox name="veg" checked={formData.subCategory.veg} onChange={handleSubCategoryChange} color="success" />}
                                  label={<Typography fontWeight={600}>Veg Only</Typography>}
                                />
                                <FormControlLabel
                                  control={<Checkbox name="nonVeg" checked={formData.subCategory.nonVeg} onChange={handleSubCategoryChange} color="error" />}
                                  label={<Typography fontWeight={600}>Non-Veg</Typography>}
                                />
                                <FormControlLabel
                                  control={<Checkbox name="both" checked={formData.subCategory.both} onChange={handleSubCategoryChange} color="primary" />}
                                  label={<Typography fontWeight={600}>Both (Multi-cuisine)</Typography>}
                                />
                            </FormGroup>
                          </Box>
                        </FormField>
                      </motion.div>
                    </Grid>
                  )}
                </AnimatePresence>
              </Grid>
            </FormSection>

            {/* PREFERENCES SECTION */}
            <FormSection icon={<Dashboard sx={{ color: '#013220' }} />} title="Preferences">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <FormField label="Choose Default Dashboard">
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 3, border: `1px solid ${UI.border}` }}>
                      <RadioGroup
                        row
                        name="dashboardType"
                        value={formData.dashboardType}
                        onChange={handleInputChange}
                        sx={{ justifyContent: 'space-around' }}
                      >
                        <FormControlLabel 
                          value="Consumer Dashboard" 
                          control={<Radio color="success" />} 
                          label={<Typography fontWeight={700}>Consumer Interface</Typography>} 
                        />
                        <FormControlLabel 
                          value="Business Dashboard" 
                          control={<Radio color="success" />} 
                          label={<Typography fontWeight={700}>Merchant Dashboard</Typography>} 
                        />
                      </RadioGroup>
                    </Box>
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* CONTACT SECTION */}
            <FormSection icon={<ContactPhone sx={{ color: '#228B22' }} />} title="Contact Information">
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <FormField label="Mobile Number" error={errors.mobile}>
                    <TextField
                      fullWidth
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField label="Email Address">
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@business.com"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* LOCATION SECTION */}
            <FormSection icon={<LocationOn sx={{ color: '#1B4D3E' }} />} title="Location Details">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <FormField label="Street Address / Building">
                    <TextField
                      fullWidth
                      name="address"
                      multiline
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Shop No, Street, Landmark..."
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormField label="Pincode">
                    <TextField
                      fullWidth
                      name="pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      placeholder="6 Digit PIN"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormField label="District">
                    <TextField
                      fullWidth
                      name="district"
                      value={formData.district}
                      disabled
                      placeholder="Auto-filled"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormField label="State">
                    <TextField
                      fullWidth
                      name="state"
                      value={formData.state}
                      disabled
                      placeholder="Auto-filled"
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* SECURITY SECTION */}
            <FormSection icon={<Lock sx={{ color: '#013220' }} />} title="Account Security">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <FormField label="Create Password" error={errors.password}>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Strong unique password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* FOOTER & SUBMIT */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: `1px solid ${UI.border}`, bgcolor: '#fff', mb: 4 }}>
              <FormControlLabel
                control={<Checkbox checked={formData.terms} onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.checked }))} color="success" />}
                label={<Typography sx={{ fontSize: 14, fontWeight: 500 }}>I accept the <Box component="span" sx={{ color: '#1B4D3E', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>Terms & Conditions</Box> and Privacy Policy.</Typography>}
                sx={{ mb: 3 }}
              />
              {errors.terms && <Typography color="error" variant="caption" display="block" sx={{ mt: -2, mb: 2 }}>{errors.terms}</Typography>}
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    flex: 1,
                    py: 2,
                    borderRadius: 4,
                    fontSize: 16,
                    fontWeight: 900,
                    textTransform: 'none',
                    background: UI.primaryGradient,
                    boxShadow: '0 10px 30px rgba(37, 211, 102, 0.3)',
                    '&:hover': {
                      background: UI.primaryGradient,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 15px 35px rgba(37, 211, 102, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? <CircularProgress size={26} color="inherit" /> : 'Confirm & Register'}
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    flex: 1,
                    py: 2,
                    borderRadius: 4,
                    fontSize: 16,
                    fontWeight: 800,
                    textTransform: 'none',
                    borderColor: UI.border,
                    color: UI.textMuted,
                    '&:hover': {
                      borderColor: '#128C7E',
                      color: '#128C7E',
                      bgcolor: '#f0fdf4'
                    }
                  }}
                >
                  Login to Account
                </Button>
              </Stack>
            </Paper>

          </Box>
        </motion.div>
      </Container>

      {success && (
        <Fade in={success}>
          <Box 
            sx={{ 
              position: 'fixed', 
              top: 24, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 2000,
              width: '90%',
              maxWidth: 400
            }}
          >
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ 
                borderRadius: 4, 
                fontWeight: 800,
                boxShadow: '0 10px 40px rgba(37, 211, 102, 0.4)'
              }}
            >
              Registration Successful! Redirecting...
            </Alert>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

const FormSection = ({ icon, title, children }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: { xs: 3, md: 5 }, 
      borderRadius: 6, 
      border: `1px solid ${UI.border}`, 
      bgcolor: '#fff', 
      mb: 5,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 15px 40px rgba(0,0,0,0.04)',
      }
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center" mb={4}>
      <Box 
        sx={{ 
          width: 44, 
          height: 44, 
          borderRadius: 3, 
          bgcolor: '#f0fdf4', 
          display: 'grid', 
          placeItems: 'center',
          boxShadow: '0 4px 10px rgba(37, 211, 102, 0.1)'
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={900} color={UI.text} sx={{ letterSpacing: '-0.02em' }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

const FormField = ({ label, children, error }) => (
  <Stack spacing={1}>
    <Typography 
      variant="subtitle2" 
      sx={{ 
        fontWeight: 800, 
        color: UI.text, 
        ml: 0.5,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      {label}
    </Typography>
    {children}
    {error && (
      <Typography color="error" variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
        {error}
      </Typography>
    )}
  </Stack>
);

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    bgcolor: '#f8fafc',
    minHeight: 56,
    '& fieldset': { borderColor: UI.border },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#228B22', borderWidth: 2 },
  },
  '& .MuiInputBase-input': {
    fontWeight: 600,
    color: UI.text,
    '&::placeholder': { color: '#94a3b8', opacity: 1 },
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
  }
};

export default BusinessRegistration;
