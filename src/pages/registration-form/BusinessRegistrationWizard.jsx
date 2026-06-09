import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Alert,
  Fade,
  CircularProgress,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
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
  CloudUpload,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Delete,
  Description,
  Verified,
  PhonelinkSetup,
  Security,
  Save,
  Info,
  Storefront,
  Launch
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';

// Premium Design System & Theme Styling Tokens
const UI = {
  primary: '#0d9488', // Teal 600
  primaryHover: '#0f766e', // Teal 700
  primaryLight: '#ccfbf1', // Teal 100
  accent: '#06b6d4', // Cyan 500
  bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  surface: '#ffffff',
  text: '#0f172a', // Slate 900
  textMuted: '#64748b', // Slate 500
  border: '#cbd5e1', // Slate 300
  error: '#ef4444', // Red 500
  success: '#10b981', // Emerald 500
  gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
  glow: '0 0 15px rgba(13, 148, 136, 0.15)',
  glass: 'rgba(255, 255, 255, 0.85)',
};

// Dropdown Categories definition
const BUSINESS_TYPES = [
  { label: 'Nearby Store (Offline)', value: 'Nearby Store (Offline)' },
  { label: 'Online Business', value: 'Online Business' },
  { label: 'TriZone', value: 'TriZone' }
];

const SUB_CATEGORIES = {
  'Nearby Store (Offline)': [
    { label: 'Consumer Dashboard (B2C)', value: 'Consumer Dashboard (B2C)' },
    { label: 'Merchant Dashboard (B2B)', value: 'Merchant Dashboard (B2B)' }
  ],
  'Online Business': [
    { label: 'B2C Business Model', value: 'B2C' },
    { label: 'B2B Business Model', value: 'B2B' }
  ],
  'TriZone': [
    { label: 'Tri ENT (Entertainment)', value: 'Tri ENT' },
    { label: 'Tri Basket (Groceries & Shopping)', value: 'Tri Basket' },
    { label: 'Tri Rides (Ride Sharing & Transport)', value: 'Tri Rides' },
    { label: 'Tri Buy & Sell (Classifieds Marketplace)', value: 'Tri Buy & Sell' },
    { label: 'Tri Buy (Direct Buying)', value: 'Tri Buy' },
    { label: 'Tri Agriculture/Farmer (Agri-products)', value: 'Tri Agriculture/Farmer' },
    { label: 'Tri Jobs (Local Hiring)', value: 'Tri Jobs' },
    { label: 'Tri Household Help (Local services)', value: 'Tri Household Help' }
  ]
};

// Framer Motion Animation Settings
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 150 : -150,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] // Custom ease-out
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 150 : -150,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const BusinessRegistrationWizard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Registration State
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    pincode: '',
    gstNumber: '',
    description: '',
    logo: null, // Holds Base64 representation of image file
    logoName: '',
    logoSize: '',
    businessType: '',
    subCategory: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpRefs = useRef([]);

  // Draft & Alerts States
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'success', message: '' });
  const [termsOpen, setTermsOpen] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('business_wizard_draft');
    if (savedDraft) {
      setShowRestorePrompt(true);
    }
  }, []);

  // OTP Countdown Timer Effect
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Alert dismiss timeout
  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  // Pincode Lookup API
  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
    setErrors(prev => ({ ...prev, pincode: '' }));

    if (value.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District || postOffice.Block || '',
          }));
        } else {
          setErrors(prev => ({ ...prev, pincode: 'Invalid Pincode. Please check.' }));
        }
      } catch (err) {
        console.error("Failed to fetch pincode info", err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  // Drag and Drop Logo Handlers
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogoFile(e.dataTransfer.files[0]);
    }
  };

  const processLogoFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: "Only image files (JPG, PNG, WEBP) are supported." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: "File size exceeds maximum 5MB limit." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        logo: reader.result,
        logoName: file.name,
        logoSize: (file.size / 1024).toFixed(1) + ' KB'
      }));
      setErrors(prev => ({ ...prev, logo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processLogoFile(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null, logoName: '', logoSize: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Draft functions
  const handleSaveDraft = () => {
    localStorage.setItem('business_wizard_draft', JSON.stringify({
      data: formData,
      step,
      mobileVerified
    }));
    setAlertInfo({
      show: true,
      type: 'success',
      message: 'Progress successfully saved as draft!'
    });
  };

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem('business_wizard_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data);
        setStep(parsed.step || 1);
        setMobileVerified(parsed.mobileVerified || false);
        setAlertInfo({
          show: true,
          type: 'success',
          message: 'Draft restored successfully!'
        });
      }
    } catch (e) {
      console.error("Failed to restore draft", e);
    }
    setShowRestorePrompt(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('business_wizard_draft');
    setShowRestorePrompt(false);
    setAlertInfo({
      show: true,
      type: 'info',
      message: 'Draft discarded. Form cleared.'
    });
  };

  // Step fields validation
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = "Business Name is required";
      if (!formData.businessType) newErrors.businessType = "Please select a Business Type";
      if (!formData.subCategory) newErrors.subCategory = "Please select a sub-category";
      if (!formData.description.trim()) {
        newErrors.description = "Business description is required";
      } else if (formData.description.trim().length < 10) {
        newErrors.description = "Description should be at least 10 characters";
      }
      if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gstNumber)) {
        newErrors.gstNumber = "Invalid GST format (Example: 22AAAAA1111A1Z1)";
      }
    } else if (currentStep === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
      else if (formData.fullName.trim().length < 3) newErrors.fullName = "Name must be at least 3 characters";

      if (!formData.email.trim()) newErrors.email = "Email Address is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";

      if (!formData.mobile.trim()) newErrors.mobile = "Mobile Number is required";
      else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile Number must be 10 digits";

      if (!mobileVerified) {
        newErrors.mobile = "Please verify your mobile number using OTP to proceed";
      }
    } else if (currentStep === 3) {
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be exactly 6 digits";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.address.trim()) newErrors.address = "Business Address is required";
    } else if (currentStep === 4) {
      const pwd = formData.password;
      if (!pwd) newErrors.password = "Password is required";
      else if (pwd.length < 8) newErrors.password = "Password must be at least 8 characters";
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(pwd)) {
        newErrors.password = "Password must contain uppercase, lowercase, numbers, and special characters";
      }

      if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
      else if (formData.confirmPassword !== pwd) newErrors.confirmPassword = "Passwords do not match";

      if (!formData.terms) newErrors.terms = "You must accept the Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(step)) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  // Password strength calculation helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', score: 0, color: '#e2e8f0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: 'Weak', score, color: UI.error };
    if (score <= 4) return { label: 'Medium', score, color: '#f97316' }; // orange
    return { label: 'Strong', score, color: UI.success };
  };

  // OTP mockup verification helper
  const handleSendOtp = () => {
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      setErrors(prev => ({ ...prev, mobile: "Please enter a valid 10-digit mobile number first" }));
      return;
    }
    setIsSendingOtp(true);
    setOtpError('');
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpTimer(59);
      setOtp(['', '', '', '', '', '']);
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'OTP Code sent successfully! (Use code 123456 to test)'
      });
      // Focus first OTP field
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 100);
    }, 1500);
  };

  const handleOtpInputChange = (val, index) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next field
    if (cleaned && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP code");
      return;
    }

    if (otpCode === '123456') {
      setMobileVerified(true);
      setOtpSent(false);
      setOtpError('');
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Mobile number verified successfully!'
      });
    } else {
      setOtpError("Incorrect OTP code. Try again (Test code: 123456)");
    }
  };

  // Submit Action
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      setLoading(true);
      // Simulate API submit call
      setTimeout(() => {
        setLoading(false);
        setSubmitSuccess(true);
        localStorage.removeItem('business_wizard_draft');
      }, 2500);
    }
  };

  // Form Field on change handler
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const currentPasswordStrength = getPasswordStrength(formData.password);

  return (
    <Box sx={{
      background: UI.bg,
      minHeight: '100vh',
      fontFamily: '"Poppins", sans-serif',
      py: { xs: 4, md: 8 },
      px: 2,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: { xs: '200px', md: '400px' },
        height: { xs: '200px', md: '400px' },
        top: '-10%',
        left: '-10%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        zIndex: 0
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: { xs: '250px', md: '500px' },
        height: { xs: '250px', md: '500px' },
        bottom: '-10%',
        right: '-10%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        zIndex: 0
      }
    }}>
      <Container maxWidth="md" sx={{ zIndex: 1, position: 'relative' }}>
        {/* Floating Save Draft Toast Alert */}
        <Fade in={alertInfo.show}>
          <Box sx={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '90%',
            maxWidth: 450,
          }}>
            <Alert
              severity={alertInfo.type}
              variant="filled"
              sx={{
                borderRadius: 4,
                fontWeight: 600,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                bgcolor: alertInfo.type === 'success' ? UI.primary : undefined
              }}
            >
              {alertInfo.message}
            </Alert>
          </Box>
        </Fade>

        {/* RESTORE DRAFT PROMPT DIALOG */}
        <Dialog
          open={showRestorePrompt}
          onClose={() => setShowRestorePrompt(false)}
          PaperProps={{
            sx: {
              borderRadius: 6,
              p: 2,
              maxWidth: 450,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: UI.primary, fontWeight: 800, fontSize: '1.25rem' }}>
            <Info /> Restore Draft?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: UI.text, fontWeight: 500, mt: 1 }}>
              We found a previously saved draft of your registration. Would you like to restore it and pick up where you left off?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
            <Button
              onClick={handleDiscardDraft}
              color="error"
              variant="outlined"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: UI.border,
                color: UI.textMuted,
                '&:hover': {
                  borderColor: UI.error,
                  color: UI.error,
                  bgcolor: 'rgba(239, 68, 68, 0.05)'
                }
              }}
            >
              Start Fresh
            </Button>
            <Button
              onClick={handleRestoreDraft}
              variant="contained"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                background: UI.gradient,
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                '&:hover': {
                  background: UI.primaryHover
                }
              }}
            >
              Restore Progress
            </Button>
          </DialogActions>
        </Dialog>

        {/* TERMS AND CONDITIONS MODAL */}
        <Dialog
          open={termsOpen}
          onClose={() => setTermsOpen(false)}
          scroll="paper"
          PaperProps={{
            sx: {
              borderRadius: 6,
              maxWidth: 600,
              bgcolor: 'rgba(255, 255, 255, 0.98)',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: UI.text, borderBottom: `1px solid ${UI.border}`, pb: 2 }}>
            Terms & Conditions & Privacy Policy
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <DialogContentText sx={{ color: UI.text, fontSize: '0.9rem', lineHeight: 1.6 }}>
              <strong>1. Acceptance of Terms</strong><br />
              Welcome to Tri-Business, the local business marketplace platform. By checking the terms box and registering your business, you agree to comply with and be bound by these Terms & Conditions.<br /><br />
              <strong>2. Registration Obligations</strong><br />
              You agree to provide true, accurate, current, and complete information about your business as prompted by this registration form. Maintaining inaccurate data may lead to immediate suspension of your merchant account.<br /><br />
              <strong>3. OTP & Account Security</strong><br />
              Verification of your mobile number is mandatory to authenticate and protect merchant dashboards. You are responsible for keeping your login password confidential.<br /><br />
              <strong>4. Privacy Policy</strong><br />
              Your privacy is of utmost importance to us. We store your business information securely and only use it to facilitate connections with customers on our B2C and B2B marketplace layers. We do not sell your contact details to third parties.<br /><br />
              <strong>5. Directory Listing & Dashboard Rights</strong><br />
              Based on your selection (Nearby Store, Online Business, or TriZone), your profile will be rendered appropriately in consumer searches. TriZone services agree to respond to customer inquiries in a timely manner.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${UI.border}`, px: 3, py: 2 }}>
            <Button
              onClick={() => setTermsOpen(false)}
              variant="contained"
              sx={{
                borderRadius: 3,
                bgcolor: UI.primary,
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: UI.primaryHover }
              }}
            >
              Accept & Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* WIZARD CARD & CONTENT */}
        <AnimatePresence mode="wait">
          {!submitSuccess ? (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header Title Section */}
              <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: UI.text,
                    mb: 1.5,
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2
                  }}
                >
                  Register Your <Box component="span" sx={{ color: UI.primary }}>Business</Box>
                </Typography>
                <Typography sx={{ color: UI.textMuted, fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 500, maxWidth: '550px', mx: 'auto' }}>
                  Join the marketplace platform and scale your operations with modern B2C and B2B digital toolkits.
                </Typography>
              </Box>

              {/* Progress Wizard Stepper */}
              <Box sx={{ mb: 5, px: { xs: 1, md: 4 } }}>
                {/* Horizontal Progress Line */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', mb: 2 }}>
                  <Box sx={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                    height: '4px',
                    bgcolor: 'rgba(0,0,0,0.06)',
                    borderRadius: 2,
                    zIndex: 0
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    width: `${((step - 1) / 3) * 100}%`,
                    height: '4px',
                    background: UI.gradient,
                    borderRadius: 2,
                    zIndex: 0,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />

                  {[
                    { label: 'Business', icon: <Business fontSize="small" /> },
                    { label: 'Contact', icon: <Person fontSize="small" /> },
                    { label: 'Location', icon: <LocationOn fontSize="small" /> },
                    { label: 'Security', icon: <Lock fontSize="small" /> }
                  ].map((s, idx) => {
                    const stepNum = idx + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;

                    return (
                      <Box key={s.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '60px' }}>
                        <motion.div
                          animate={isActive ? { scale: [1, 1.1, 1], boxShadow: '0 0 12px rgba(13,148,136,0.5)' } : { scale: 1 }}
                          transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: stepNum < step ? () => { setDirection(stepNum > step ? 1 : -1); setStep(stepNum); } : 'default',
                            background: isCompleted ? UI.gradient : (isActive ? UI.surface : '#e2e8f0'),
                            border: `2px solid ${isCompleted ? 'transparent' : (isActive ? UI.primary : '#cbd5e1')}`,
                            color: isCompleted ? '#ffffff' : (isActive ? UI.primary : UI.textMuted),
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isCompleted ? <CheckCircle sx={{ fontSize: 20 }} /> : s.icon}
                        </motion.div>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 1,
                            fontWeight: isActive || isCompleted ? 700 : 500,
                            color: isActive ? UI.primary : (isCompleted ? UI.text : UI.textMuted),
                            fontSize: { xs: '10px', md: '12px' },
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {s.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Main Card Body */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  background: UI.glass,
                  backdropFilter: 'blur(20px)',
                  boxShadow: UI.boxShadow,
                  overflow: 'hidden'
                }}
              >
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      style={{ width: '100%' }}
                    >
                      {/* STEP 1: BUSINESS PROFILE DETAILS */}
                      {step === 1 && (
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: UI.text, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Storefront sx={{ color: UI.primary }} /> Business Profile
                          </Typography>
                          <Grid container spacing={3.5}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Business Name"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                error={!!errors.businessName}
                                helperText={errors.businessName}
                                placeholder="Enter legal business or trade name"
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Autocomplete
                                options={BUSINESS_TYPES}
                                getOptionLabel={(option) => option.label}
                                value={BUSINESS_TYPES.find(opt => opt.value === formData.businessType) || null}
                                onChange={(e, newValue) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    businessType: newValue ? newValue.value : '',
                                    subCategory: '' // Reset sub-category on parent change
                                  }));
                                  setErrors(prev => ({ ...prev, businessType: '', subCategory: '' }));
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Business Type"
                                    error={!!errors.businessType}
                                    helperText={errors.businessType}
                                    sx={textFieldStyles}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Autocomplete
                                disabled={!formData.businessType}
                                options={SUB_CATEGORIES[formData.businessType] || []}
                                getOptionLabel={(option) => option.label}
                                value={(SUB_CATEGORIES[formData.businessType] || []).find(opt => opt.value === formData.subCategory) || null}
                                onChange={(e, newValue) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    subCategory: newValue ? newValue.value : ''
                                  }));
                                  setErrors(prev => ({ ...prev, subCategory: '' }));
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={
                                      !formData.businessType
                                        ? "Sub Category"
                                        : formData.businessType === "Nearby Store (Offline)"
                                          ? "Store Category"
                                          : formData.businessType === "Online Business"
                                            ? "Business Model"
                                            : "Service Category"
                                    }
                                    error={!!errors.subCategory}
                                    helperText={errors.subCategory}
                                    placeholder={!formData.businessType ? "Choose type first" : "Search and select"}
                                    sx={textFieldStyles}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="GST Number (Optional)"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleChange}
                                error={!!errors.gstNumber}
                                helperText={errors.gstNumber || "Format: 15-character alphanumeric GSTIN (e.g. 22AAAAA1111A1Z1)"}
                                placeholder="Enter business GST registration number"
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Business Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                error={!!errors.description}
                                helperText={errors.description || `${formData.description.length}/300 characters (min 10)`}
                                placeholder="Write a short summary about products or services you offer..."
                                inputProps={{ maxLength: 300 }}
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: UI.text, mb: 1, ml: 0.5 }}>
                                Business Logo Upload
                              </Typography>
                              <Box
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                sx={{
                                  border: `2px dashed ${dragOver ? UI.primary : UI.border}`,
                                  borderRadius: 4,
                                  bgcolor: dragOver ? 'rgba(13, 148, 136, 0.04)' : '#f8fafc',
                                  p: 3,
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                  '&:hover': {
                                    borderColor: UI.primary,
                                    bgcolor: 'rgba(13, 148, 136, 0.02)'
                                  }
                                }}
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileSelect}
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                />
                                {!formData.logo ? (
                                  <Stack spacing={1} alignItems="center">
                                    <CloudUpload sx={{ fontSize: 36, color: UI.primary }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: UI.text }}>
                                      Drag & Drop Logo here or <Box component="span" sx={{ color: UI.primary, textDecoration: 'underline' }}>browse</Box>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: UI.textMuted }}>
                                      PNG, JPG, WEBP formats supported (Max 5MB)
                                    </Typography>
                                  </Stack>
                                ) : (
                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center" justifyContent="center">
                                    <Box
                                      component="img"
                                      src={formData.logo}
                                      alt="Logo preview"
                                      sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 3,
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        border: `1px solid ${UI.border}`
                                      }}
                                    />
                                    <Box textAlign="left" sx={{ flexGrow: { sm: 1 }, textAlign: { xs: 'center', sm: 'left' } }}>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: UI.text, wordBreak: 'break-all' }}>
                                        {formData.logoName || 'business_logo.png'}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: UI.textMuted, display: 'block' }}>
                                        Size: {formData.logoSize || 'Unknown size'}
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      color="error"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeLogo();
                                      }}
                                      sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Stack>
                                )}
                              </Box>
                              {errors.logo && (
                                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 600, ml: 1 }}>
                                  {errors.logo}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* STEP 2: PERSONAL & CONTACT VERIFICATION */}
                      {step === 2 && (
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: UI.text, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ color: UI.primary }} /> Contact Information
                          </Typography>
                          <Grid container spacing={3.5}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                error={!!errors.fullName}
                                helperText={errors.fullName}
                                placeholder="Enter registered owner's full name"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Person sx={{ color: UI.textMuted }} />
                                    </InputAdornment>
                                  )
                                }}
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                placeholder="Example: owner@business.com"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Email sx={{ color: UI.textMuted }} />
                                    </InputAdornment>
                                  )
                                }}
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                                <TextField
                                  fullWidth
                                  label="Mobile Number"
                                  name="mobile"
                                  disabled={mobileVerified || otpSent}
                                  value={formData.mobile}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                                    setFormData(prev => ({ ...prev, mobile: val }));
                                    setErrors(prev => ({ ...prev, mobile: '' }));
                                  }}
                                  error={!!errors.mobile}
                                  helperText={errors.mobile}
                                  placeholder="10-digit mobile number"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <ContactPhone sx={{ color: UI.textMuted }} />
                                      </InputAdornment>
                                    ),
                                    endAdornment: mobileVerified && (
                                      <InputAdornment position="end">
                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: UI.success }}>
                                          <Verified fontSize="small" />
                                          <Typography variant="caption" fontWeight={700}>Verified</Typography>
                                        </Stack>
                                      </InputAdornment>
                                    )
                                  }}
                                  sx={textFieldStyles}
                                />
                                {!mobileVerified && !otpSent && (
                                  <Button
                                    variant="contained"
                                    onClick={handleSendOtp}
                                    disabled={isSendingOtp}
                                    sx={{
                                      minWidth: { xs: '100%', sm: 140 },
                                      height: 56,
                                      borderRadius: 4,
                                      textTransform: 'none',
                                      fontWeight: 700,
                                      bgcolor: UI.primary,
                                      '&:hover': { bgcolor: UI.primaryHover },
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    {isSendingOtp ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                                  </Button>
                                )}
                              </Stack>
                            </Grid>

                            {/* OTP Entry Section */}
                            <AnimatePresence>
                              {otpSent && (
                                <Grid item xs={12}>
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <Box sx={{ bgcolor: 'rgba(13, 148, 136, 0.04)', p: 3.5, borderRadius: 4, border: `1px solid ${UI.primaryLight}` }}>
                                      <Stack spacing={2.5} alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <PhonelinkSetup sx={{ color: UI.primary }} />
                                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: UI.text }}>
                                            Enter Verification Code
                                          </Typography>
                                        </Stack>

                                        <Typography variant="caption" sx={{ color: UI.textMuted, textAlign: 'center', mb: 1 }}>
                                          We sent a 6-digit verification code to <strong>+91 {formData.mobile}</strong>.
                                          <br />
                                          <Box component="span" sx={{ color: UI.primary, fontWeight: 700 }}>Test Code: 123456</Box>
                                        </Typography>

                                        {/* OTP Input Boxes */}
                                        <Stack direction="row" spacing={1.5} justifyContent="center">
                                          {otp.map((digit, idx) => (
                                            <input
                                              key={idx}
                                              type="text"
                                              maxLength={1}
                                              value={digit}
                                              ref={(el) => (otpRefs.current[idx] = el)}
                                              onChange={(e) => handleOtpInputChange(e.target.value, idx)}
                                              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                              style={{
                                                width: '42px',
                                                height: '48px',
                                                borderRadius: '8px',
                                                border: `2px solid ${otpError ? UI.error : UI.border}`,
                                                textAlign: 'center',
                                                fontSize: '1.25rem',
                                                fontWeight: '800',
                                                outline: 'none',
                                                background: '#ffffff',
                                                color: UI.text,
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.borderColor = UI.primary;
                                                e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                                              }}
                                              onBlur={(e) => {
                                                e.target.style.borderColor = otpError ? UI.error : UI.border;
                                                e.target.style.boxShadow = 'none';
                                              }}
                                            />
                                          ))}
                                        </Stack>

                                        {otpError && (
                                          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                                            {otpError}
                                          </Typography>
                                        )}

                                        <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%', justifyContent: 'center', mt: 1 }}>
                                          <Typography variant="caption" sx={{ color: UI.textMuted, fontWeight: 600 }}>
                                            {otpTimer > 0 ? (
                                              `Resend OTP in ${otpTimer}s`
                                            ) : (
                                              <Button
                                                onClick={handleSendOtp}
                                                variant="text"
                                                sx={{ textTransform: 'none', fontWeight: 800, color: UI.primary, minWidth: 0, p: 0 }}
                                              >
                                                Resend OTP
                                              </Button>
                                            )}
                                          </Typography>

                                          <Button
                                            variant="contained"
                                            onClick={handleVerifyOtp}
                                            sx={{
                                              borderRadius: 3,
                                              px: 3,
                                              textTransform: 'none',
                                              fontWeight: 700,
                                              bgcolor: UI.primary,
                                              '&:hover': { bgcolor: UI.primaryHover }
                                            }}
                                          >
                                            Verify Code
                                          </Button>
                                        </Stack>
                                      </Stack>
                                    </Box>
                                  </motion.div>
                                </Grid>
                              )}
                            </AnimatePresence>
                          </Grid>
                        </Box>
                      )}

                      {/* STEP 3: ADDRESS & LOCATION INFORMATION */}
                      {step === 3 && (
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: UI.text, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ color: UI.primary }} /> Location Details
                          </Typography>
                          <Grid container spacing={3.5}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handlePincodeChange}
                                error={!!errors.pincode}
                                helperText={errors.pincode}
                                placeholder="6-digit postal code"
                                InputProps={{
                                  endAdornment: pincodeLoading && (
                                    <InputAdornment position="end">
                                      <CircularProgress size={20} color="inherit" />
                                    </InputAdornment>
                                  )
                                }}
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="City / Region"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={!!errors.city}
                                helperText={errors.city}
                                placeholder="Enter city name"
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Business Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                error={!!errors.address}
                                helperText={errors.address}
                                placeholder="Plot/Building No., Street Name, Landmark..."
                                sx={textFieldStyles}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* STEP 4: SECURITY & T&C PREVIEW */}
                      {step === 4 && (
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: UI.text, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Security sx={{ color: UI.primary }} /> Account Security
                          </Typography>
                          <Grid container spacing={3.5}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                placeholder="Minimum 8 characters with numbers & symbols"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Lock sx={{ color: UI.textMuted }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                                sx={textFieldStyles}
                              />

                              {/* Password Strength Meter */}
                              {formData.password && (
                                <Box sx={{ mt: 1.5, px: 0.5 }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: UI.textMuted }}>
                                      Password Strength:
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: currentPasswordStrength.color }}>
                                      {currentPasswordStrength.label}
                                    </Typography>
                                  </Stack>
                                  <Box sx={{
                                    height: '6px',
                                    borderRadius: 3,
                                    bgcolor: 'rgba(0,0,0,0.06)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}>
                                    <Box sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      height: '100%',
                                      width: `${(currentPasswordStrength.score / 5) * 100}%`,
                                      bgcolor: currentPasswordStrength.color,
                                      transition: 'width 0.3s ease'
                                    }} />
                                  </Box>
                                </Box>
                              )}
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                placeholder="Re-enter password to match"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Lock sx={{ color: UI.textMuted }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                                sx={textFieldStyles}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Box sx={{
                                border: `1px solid ${errors.terms ? UI.error : UI.border}`,
                                borderRadius: 4,
                                p: 2,
                                bgcolor: '#f8fafc',
                                transition: 'border-color 0.2s'
                              }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formData.terms}
                                      onChange={handleChange}
                                      name="terms"
                                      color="teal"
                                      sx={{
                                        color: errors.terms ? UI.error : UI.primary,
                                        '&.Mui-checked': { color: UI.primary }
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: UI.text }}>
                                      I accept the{' '}
                                      <Box
                                        component="span"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setTermsOpen(true);
                                        }}
                                        sx={{
                                          color: UI.primary,
                                          textDecoration: 'underline',
                                          cursor: 'pointer',
                                          fontWeight: 800,
                                          '&:hover': { color: UI.primaryHover }
                                        }}
                                      >
                                        Terms & Conditions
                                      </Box>{' '}
                                      and privacy guidelines of Tri-Business.
                                    </Typography>
                                  }
                                />
                                {errors.terms && (
                                  <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block', fontWeight: 600, ml: 3.5 }}>
                                    {errors.terms}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* Sticky Form Action Footer */}
                      <Divider sx={{ my: 4, opacity: 0.6 }} />

                      <Stack
                        direction={{ xs: 'column-reverse', sm: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        {/* Draft Saver Button */}
                        <Tooltip title="Save your current progress to resume later">
                          <Button
                            variant="outlined"
                            onClick={handleSaveDraft}
                            startIcon={<Save />}
                            sx={{
                              width: { xs: '100%', sm: 'auto' },
                              borderRadius: 3.5,
                              textTransform: 'none',
                              fontWeight: 700,
                              borderColor: UI.border,
                              color: UI.textMuted,
                              px: 3,
                              py: 1.5,
                              '&:hover': {
                                borderColor: UI.primary,
                                color: UI.primary,
                                bgcolor: 'rgba(13, 148, 136, 0.03)'
                              }
                            }}
                          >
                            Save Draft
                          </Button>
                        </Tooltip>

                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          {step > 1 && (
                            <Button
                              variant="outlined"
                              onClick={handleBack}
                              startIcon={<ArrowBack />}
                              sx={{
                                flexGrow: 1,
                                borderRadius: 3.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                borderColor: UI.primary,
                                color: UI.primary,
                                px: 3.5,
                                py: 1.5,
                                '&:hover': {
                                  borderColor: UI.primaryHover,
                                  bgcolor: 'rgba(13, 148, 136, 0.05)'
                                }
                              }}
                            >
                              Back
                            </Button>
                          )}

                          {step < 4 ? (
                            <Button
                              variant="contained"
                              onClick={handleNext}
                              endIcon={<ArrowForward />}
                              sx={{
                                flexGrow: 1,
                                borderRadius: 3.5,
                                textTransform: 'none',
                                fontWeight: 800,
                                px: 4,
                                py: 1.5,
                                background: UI.gradient,
                                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                                '&:hover': {
                                  background: UI.primaryHover,
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 6px 18px rgba(13, 148, 136, 0.4)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Next
                            </Button>
                          ) : (
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={loading}
                              sx={{
                                flexGrow: 1,
                                borderRadius: 3.5,
                                textTransform: 'none',
                                fontWeight: 800,
                                px: 4,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                                '&:hover': {
                                  background: '#059669',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {loading ? (
                                <CircularProgress size={24} color="inherit" />
                              ) : (
                                'Submit Registration'
                              )}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </motion.div>
                  </AnimatePresence>
                </form>
              </Paper>
            </motion.div>
          ) : (
            // REGISTRATION SUBMIT SUCCESS VIEW
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  background: UI.glass,
                  backdropFilter: 'blur(20px)',
                  boxShadow: UI.boxShadow,
                  textAlign: 'center'
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <CheckCircle sx={{ fontSize: 90, color: UI.success, mb: 3 }} />
                </motion.div>

                <Typography variant="h4" sx={{ fontWeight: 900, color: UI.text, mb: 1, letterSpacing: '-0.02em' }}>
                  Registration Successful!
                </Typography>
                <Typography sx={{ color: UI.textMuted, maxWidth: 450, mx: 'auto', mb: 4, fontSize: '0.95rem', fontWeight: 500 }}>
                  Your business has been added to our pending catalog. The administration team will verify details and activate your dashboard.
                </Typography>

                {/* Registered Info Summary Panel */}
                <Box
                  sx={{
                    bgcolor: '#f8fafc',
                    border: `1px solid ${UI.border}`,
                    borderRadius: 4,
                    p: 3,
                    mb: 5,
                    textAlign: 'left',
                    maxWidth: 500,
                    mx: 'auto'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UI.text, mb: 2, borderBottom: `2px solid ${UI.primaryLight}`, pb: 0.75 }}>
                    Registration Summary
                  </Typography>

                  <Stack spacing={1.5}>
                    <SummaryRow label="Business Name" value={formData.businessName} />
                    <SummaryRow label="Business Type" value={formData.businessType} />
                    <SummaryRow label="Sub Category" value={formData.subCategory} />
                    <SummaryRow label="Registered Owner" value={formData.fullName} />
                    <SummaryRow label="Contact Mobile" value={`+91 ${formData.mobile}`} />
                    <SummaryRow label="City & Pin" value={`${formData.city} - ${formData.pincode}`} />
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  endIcon={<Launch />}
                  sx={{
                    borderRadius: 3.5,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 4,
                    py: 1.75,
                    background: UI.gradient,
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                    '&:hover': {
                      background: UI.primaryHover,
                      boxShadow: '0 6px 18px rgba(13, 148, 136, 0.4)'
                    }
                  }}
                >
                  Go to Marketplace Home
                </Button>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

// Summary Row Component
const SummaryRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2}>
    <Typography variant="body2" sx={{ color: UI.textMuted, fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: UI.text, fontWeight: 700, textAlign: 'right' }}>
      {value || 'N/A'}
    </Typography>
  </Stack>
);

// Customized premium styles for Mui TextFields
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    bgcolor: '#ffffff',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: UI.border },
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: UI.primary, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': {
    color: UI.textMuted,
    fontWeight: 500,
    '&.Mui-focused': { color: UI.primary }
  },
  '& .MuiInputBase-input': {
    fontWeight: 600,
    color: UI.text,
  },
  mb: 0.5
};

export default BusinessRegistrationWizard;
