import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Switch,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  ArrowForward,
  ArrowBack,
  CloudUpload,
  Description,
  Check,
} from "@mui/icons-material";
import { LuChevronLeft, LuShieldCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const PRIMARY = "#EA580C";
const PRIMARY_DARK = "#C2410C";
const BG = "#f8fafc";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#64748b";
const BORDER = "#e2e8f0";

export default function BusinessKYC() {
  const navigate = useNavigate();

  // Wizard Sub-steps: 1 = Section Overview, 2 = Identity Documents, 3 = GST Details, 4 = Review & Submit
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // KYC Data State
  const [kycData, setKycData] = useState({
    panNumber: "",
    panCardUrl: "",
    isGstRegistered: false,
    gstin: "",
    gstLegalName: "",
    gstCertificateUrl: "",
    businessProofType: "Udyam / MSME Certificate",
    businessProofUrl: "",
    kycStatus: "NOT_STARTED", // NOT_STARTED, PENDING, VERIFIED, REJECTED
    kycRejectionReason: "",
    verifiedAt: null,
  });

  const panFileRef = useRef(null);
  const proofFileRef = useRef(null);
  const gstFileRef = useRef(null);

  const [uploadingPan, setUploadingPan] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadingGst, setUploadingGst] = useState(false);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token_business");
      if (!token) return;

      const res = await fetch(`${CAPTAIN_API}/captain/merchant/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKycData(prev => ({
          ...prev,
          panNumber: data.panNumber || "",
          panCardUrl: data.panCardUrl || "",
          isGstRegistered: Boolean(data.isGstRegistered),
          gstin: data.gstin || "",
          gstLegalName: data.gstLegalName || "",
          gstCertificateUrl: data.gstCertificateUrl || "",
          businessProofType: data.businessProofType || "Udyam / MSME Certificate",
          businessProofUrl: data.businessProofUrl || "",
          kycStatus: data.kycStatus || "NOT_STARTED",
          kycRejectionReason: data.kycRejectionReason || "",
          verifiedAt: data.verifiedAt || null,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch KYC status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const token = localStorage.getItem("token_business");
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (type === "PAN") setUploadingPan(true);
      if (type === "PROOF") setUploadingProof(true);
      if (type === "GST") setUploadingGst(true);
      setError("");

      const res = await fetch(`${CAPTAIN_API}/captain/merchant/kyc/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "PAN") setKycData(p => ({ ...p, panCardUrl: data.url }));
        if (type === "PROOF") setKycData(p => ({ ...p, businessProofUrl: data.url }));
        if (type === "GST") setKycData(p => ({ ...p, gstCertificateUrl: data.url }));
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to upload document");
      }
    } catch (err) {
      setError("Network error while uploading file");
    } finally {
      if (type === "PAN") setUploadingPan(false);
      if (type === "PROOF") setUploadingProof(false);
      if (type === "GST") setUploadingGst(false);
    }
  };

  const handleSaveAndSubmit = async () => {
    setError("");
    setMessage("");

    // Validate PAN format
    const pan = kycData.panNumber.trim().toUpperCase();
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      setError("Valid 10-character PAN number is required (e.g. ABCDE1234F)");
      setActiveStep(2);
      return;
    }

    // Validate GSTIN if registered
    if (kycData.isGstRegistered) {
      const gstin = kycData.gstin.trim().toUpperCase();
      if (!gstin || !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gstin)) {
        setError("Valid 15-character GSTIN is required when GST registered (e.g. 29ABCDE1234F1Z5)");
        setActiveStep(3);
        return;
      }
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token_business");
      const res = await fetch(`${CAPTAIN_API}/captain/merchant/kyc/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          panNumber: pan,
          panCardUrl: kycData.panCardUrl,
          isGstRegistered: kycData.isGstRegistered,
          gstin: kycData.isGstRegistered ? kycData.gstin.trim().toUpperCase() : null,
          gstLegalName: kycData.gstLegalName,
          gstCertificateUrl: kycData.gstCertificateUrl,
          businessProofType: kycData.businessProofType,
          businessProofUrl: kycData.businessProofUrl,
        }),
      });

      if (res.ok) {
        setMessage("KYC documents submitted successfully! Verification is pending.");
        setKycData(p => ({ ...p, kycStatus: "PENDING" }));
        setActiveStep(1);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to submit KYC");
      }
    } catch (err) {
      setError("Network error while submitting KYC");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activeTab="/business/profile" title="KYC Verification">
      <Container maxWidth="xs" sx={{ py: 3, px: 2 }}>
        {/* Top Header Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <IconButton
            size="small"
            onClick={() => activeStep > 1 ? setActiveStep(s => s - 1) : navigate(-1)}
            sx={{ mr: 1, color: TEXT }}
          >
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: TEXT }}>
            {activeStep === 1 && "KYC Verification"}
            {activeStep === 2 && "Identity Documents"}
            {activeStep === 3 && "GST Details"}
            {activeStep === 4 && "Review & Submit"}
          </Typography>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}
        {message && <Alert severity="success" onClose={() => setMessage("")} sx={{ mb: 2, borderRadius: "12px" }}>{message}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} sx={{ color: PRIMARY }} />
          </Box>
        ) : (
          <>
            {/* ══════════════════════════════════════════
                VIEW 1: KYC SECTION OVERVIEW & STATUS
                (Matches Mockup: KYC Section + KYC Status)
            ══════════════════════════════════════════ */}
            {activeStep === 1 && (
              <Box>
                {/* Status Hero Card */}
                <Card sx={{
                  borderRadius: '16px',
                  border: `1.5px solid ${
                    kycData.kycStatus === 'VERIFIED' ? '#a7f3d0' :
                    kycData.kycStatus === 'PENDING' ? '#fde68a' :
                    kycData.kycStatus === 'REJECTED' ? '#fecaca' : '#fed7aa'
                  }`,
                  bgcolor: kycData.kycStatus === 'VERIFIED' ? '#f0fdf4' :
                           kycData.kycStatus === 'PENDING' ? '#fffbeb' :
                           kycData.kycStatus === 'REJECTED' ? '#fef2f2' : '#fff7ed',
                  boxShadow: 'none',
                  mb: 3,
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: kycData.kycStatus === 'VERIFIED' ? '#10b981' :
                                 kycData.kycStatus === 'PENDING' ? '#f59e0b' :
                                 kycData.kycStatus === 'REJECTED' ? '#ef4444' : '#f97316',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}>
                        {kycData.kycStatus === 'VERIFIED' && <CheckCircle sx={{ fontSize: 24 }} />}
                        {kycData.kycStatus === 'PENDING' && <Pending sx={{ fontSize: 24 }} />}
                        {kycData.kycStatus === 'REJECTED' && <Cancel sx={{ fontSize: 24 }} />}
                        {kycData.kycStatus === 'NOT_STARTED' && <Description sx={{ fontSize: 22 }} />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: TEXT }}>
                          {kycData.kycStatus === 'NOT_STARTED' && "KYC Not Started"}
                          {kycData.kycStatus === 'PENDING' && "Pending Verification"}
                          {kycData.kycStatus === 'VERIFIED' && "KYC Verified"}
                          {kycData.kycStatus === 'REJECTED' && "KYC Rejected"}
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>
                          {kycData.kycStatus === 'NOT_STARTED' && "Complete your business verification to unlock all features and start selling."}
                          {kycData.kycStatus === 'PENDING' && "Documents submitted. We will verify within 1-2 business days."}
                          {kycData.kycStatus === 'VERIFIED' && "Your KYC is verified. All features, orders, and settlements unlocked."}
                          {kycData.kycStatus === 'REJECTED' && (kycData.kycRejectionReason || "Some documents were not valid. Please re-submit the correct documents.")}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* 4 Steps Checklist Card */}
                <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: TEXT, mb: 1.5 }}>
                  Verification Steps
                </Typography>

                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  {/* Step 1: Business Information */}
                  <Paper sx={{
                    p: 1.8,
                    borderRadius: '14px',
                    border: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#EA580C', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.78rem', fontWeight: 800 }}>
                        1
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: TEXT }}>
                        Business Information
                      </Typography>
                    </Stack>
                    <Chip label="Completed" size="small" sx={{ bgcolor: '#FFF7ED', color: '#EA580C', fontWeight: 700, fontSize: '0.7rem' }} />
                  </Paper>

                  {/* Step 2: Identity Documents */}
                  <Paper
                    onClick={() => setActiveStep(2)}
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      border: `1.5px solid ${activeStep === 2 ? '#EA580C' : BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#EA580C', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.78rem', fontWeight: 800 }}>
                        2
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: TEXT }}>
                        Identity Documents
                      </Typography>
                    </Stack>
                    <Chip
                      label={kycData.panNumber ? "Saved" : "Pending"}
                      size="small"
                      sx={{
                        bgcolor: kycData.panNumber ? '#FFF7ED' : '#fef3c7',
                        color: kycData.panNumber ? '#EA580C' : '#b45309',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Paper>

                  {/* Step 3: GST Details */}
                  <Paper
                    onClick={() => setActiveStep(3)}
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      border: `1px solid ${BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#64748b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.78rem', fontWeight: 800 }}>
                        3
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: TEXT }}>
                        GST Verification
                      </Typography>
                    </Stack>
                    <Chip label="Optional" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '0.7rem' }} />
                  </Paper>

                  {/* Step 4: Review & Submit */}
                  <Paper
                    onClick={() => setActiveStep(4)}
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      border: `1px solid ${BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#64748b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.78rem', fontWeight: 800 }}>
                        4
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: TEXT }}>
                        Review & Submit
                      </Typography>
                    </Stack>
                    <Chip label={kycData.kycStatus === 'NOT_STARTED' ? "Pending" : kycData.kycStatus} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                  </Paper>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                  sx={{
                    borderRadius: '14px',
                    bgcolor: PRIMARY,
                    py: 1.3,
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.94rem',
                    '&:hover': { bgcolor: PRIMARY_DARK },
                  }}
                >
                  {kycData.kycStatus === 'NOT_STARTED' ? 'Start Verification →' : 'Update KYC Documents →'}
                </Button>
              </Box>
            )}

            {/* ══════════════════════════════════════════
                VIEW 2: IDENTITY DOCUMENTS (PAN + PROOF)
                (Matches Mockup Screen 3: Identity Documents)
            ══════════════════════════════════════════ */}
            {activeStep === 2 && (
              <Box>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.82rem', mb: 2.5 }}>
                  Upload your PAN and other required business verification documents.
                </Typography>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  {/* PAN Card Input & Upload */}
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT, mb: 0.6 }}>
                      PAN Card Number <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
                    </Typography>
                    <TextField
                      fullWidth
                      value={kycData.panNumber}
                      onChange={e => setKycData(p => ({ ...p, panNumber: e.target.value.toUpperCase().slice(0, 10) }))}
                      placeholder="e.g. ABCDE1234F"
                      inputProps={{ maxLength: 10 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                        }
                      }}
                    />

                    {/* PAN Upload Box */}
                    <input
                      type="file"
                      ref={panFileRef}
                      style={{ display: 'none' }}
                      accept="image/*,.pdf"
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'PAN')}
                    />
                    <Box
                      onClick={() => panFileRef.current?.click()}
                      sx={{
                        mt: 1.5,
                        p: 2.5,
                        borderRadius: '14px',
                        border: '1.5px dashed #cbd5e1',
                        bgcolor: '#f8fafc',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: PRIMARY, bgcolor: '#f0fdf4' },
                      }}
                    >
                      {uploadingPan ? (
                        <CircularProgress size={24} sx={{ color: PRIMARY }} />
                      ) : kycData.panCardUrl ? (
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          <CheckCircle sx={{ color: '#EA580C', fontSize: 20 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#EA580C' }}>
                            PAN Document Uploaded (Click to replace)
                          </Typography>
                        </Stack>
                      ) : (
                        <>
                          <CloudUpload sx={{ color: '#64748b', fontSize: 28, mb: 0.5 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT }}>
                            Tap to upload PAN card
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: TEXT_SECONDARY }}>
                            JPG, PNG or PDF (Max 5 MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Business Proof Document */}
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT, mb: 0.6 }}>
                      Business Proof <Box component="span" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>(Optional)</Box>
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: TEXT_SECONDARY, mb: 1 }}>
                      Upload any one of: Shop Act License, Trade License, Udyam / MSME Certificate, or other relevant document.
                    </Typography>

                    <input
                      type="file"
                      ref={proofFileRef}
                      style={{ display: 'none' }}
                      accept="image/*,.pdf"
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'PROOF')}
                    />
                    <Box
                      onClick={() => proofFileRef.current?.click()}
                      sx={{
                        p: 2.5,
                        borderRadius: '14px',
                        border: '1.5px dashed #cbd5e1',
                        bgcolor: '#f8fafc',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: PRIMARY, bgcolor: '#FFF7ED' },
                      }}
                    >
                      {uploadingProof ? (
                        <CircularProgress size={24} sx={{ color: PRIMARY }} />
                      ) : kycData.businessProofUrl ? (
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          <CheckCircle sx={{ color: '#EA580C', fontSize: 20 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#EA580C' }}>
                            Proof Document Uploaded (Click to replace)
                          </Typography>
                        </Stack>
                      ) : (
                        <>
                          <CloudUpload sx={{ color: '#64748b', fontSize: 28, mb: 0.5 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT }}>
                            Tap to upload Business Proof
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: TEXT_SECONDARY }}>
                            JPG, PNG or PDF (Max 5 MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    const pan = kycData.panNumber.trim().toUpperCase();
                    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
                      setError("Please enter a valid 10-character PAN number (e.g. ABCDE1234F)");
                      return;
                    }
                    setError("");
                    setActiveStep(3);
                  }}
                  sx={{
                    borderRadius: '14px',
                    bgcolor: PRIMARY,
                    py: 1.3,
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.94rem',
                    '&:hover': { bgcolor: PRIMARY_DARK },
                  }}
                >
                  Continue to GST Details →
                </Button>
              </Box>
            )}

            {/* ══════════════════════════════════════════
                VIEW 3: GST DETAILS (CONDITIONAL TOGGLE)
                (Matches Mockup Screen 4: GST Details)
            ══════════════════════════════════════════ */}
            {activeStep === 3 && (
              <Box>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.82rem', mb: 2.5 }}>
                  Provide your GST details if you are GST registered.
                </Typography>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  {/* I am GST Registered Toggle Card */}
                  <Paper sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: `1.5px solid ${kycData.isGstRegistered ? '#a7f3d0' : BORDER}`,
                    bgcolor: kycData.isGstRegistered ? '#f0fdf4' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        bgcolor: kycData.isGstRegistered ? '#dcfce7' : '#f1f5f9',
                        display: 'grid',
                        placeItems: 'center',
                        color: kycData.isGstRegistered ? '#15803d' : '#64748b',
                      }}>
                        <Description sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: TEXT }}>
                          I am GST Registered
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: TEXT_SECONDARY }}>
                          Toggle on if you hold an active GSTIN
                        </Typography>
                      </Box>
                    </Stack>
                    <Switch
                      checked={kycData.isGstRegistered}
                      onChange={e => setKycData(p => ({ ...p, isGstRegistered: e.target.checked }))}
                      color="success"
                    />
                  </Paper>

                  {/* GSTIN Input (Visible only if toggle is ON) */}
                  {kycData.isGstRegistered && (
                    <Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT, mb: 0.6 }}>
                        GSTIN <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
                      </Typography>
                      <TextField
                        fullWidth
                        value={kycData.gstin}
                        onChange={e => setKycData(p => ({ ...p, gstin: e.target.value.toUpperCase().slice(0, 15) }))}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        inputProps={{ maxLength: 15 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                          }
                        }}
                      />

                      {/* Valid format feedback card */}
                      {kycData.gstin.length === 15 && /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(kycData.gstin) && (
                        <Box sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                        }}>
                          <CheckCircle sx={{ color: '#16a34a', fontSize: 18 }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>
                              Valid GSTIN Format
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#166534' }}>
                              State Code: {kycData.gstin.slice(0, 2)} • PAN: {kycData.gstin.slice(2, 12)}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* GST Certificate Upload Box */}
                      <input
                        type="file"
                        ref={gstFileRef}
                        style={{ display: 'none' }}
                        accept="image/*,.pdf"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'GST')}
                      />
                      <Box
                        onClick={() => gstFileRef.current?.click()}
                        sx={{
                          mt: 1.5,
                          p: 2,
                          borderRadius: '14px',
                          border: '1.5px dashed #cbd5e1',
                          bgcolor: '#f8fafc',
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { borderColor: PRIMARY, bgcolor: '#f0fdf4' },
                        }}
                      >
                        {uploadingGst ? (
                          <CircularProgress size={20} sx={{ color: PRIMARY }} />
                        ) : kycData.gstCertificateUrl ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <CheckCircle sx={{ color: '#EA580C', fontSize: 18 }} />
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#EA580C' }}>
                              GST Certificate Uploaded (Click to replace)
                            </Typography>
                          </Stack>
                        ) : (
                          <>
                            <CloudUpload sx={{ color: '#64748b', fontSize: 24, mb: 0.3 }} />
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT }}>
                              Upload GST Certificate (Optional)
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  )}
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    if (kycData.isGstRegistered) {
                      const gstin = kycData.gstin.trim().toUpperCase();
                      if (!gstin || !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gstin)) {
                        setError("Please enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)");
                        return;
                      }
                    }
                    setError("");
                    setActiveStep(4);
                  }}
                  sx={{
                    borderRadius: '14px',
                    bgcolor: PRIMARY,
                    py: 1.3,
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.94rem',
                    '&:hover': { bgcolor: PRIMARY_DARK },
                  }}
                >
                  Continue to Review →
                </Button>
              </Box>
            )}

            {/* ══════════════════════════════════════════
                VIEW 4: REVIEW & SUBMIT
                (Matches Mockup: Review & Submit)
            ══════════════════════════════════════════ */}
            {activeStep === 4 && (
              <Box>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.82rem', mb: 2 }}>
                  Please review your KYC details before final submission.
                </Typography>

                <Stack spacing={1.8} sx={{ mb: 3 }}>
                  {/* Summary Card */}
                  <Paper sx={{ p: 2, borderRadius: '16px', border: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: TEXT, mb: 1.2 }}>
                      Identity Information
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: TEXT_SECONDARY }}>PAN Number</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: TEXT }}>{kycData.panNumber || "—"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: TEXT_SECONDARY }}>PAN Document</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: kycData.panCardUrl ? '#10b981' : TEXT_SECONDARY }}>
                        {kycData.panCardUrl ? "Uploaded ✓" : "Not Provided"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: TEXT_SECONDARY }}>Business Proof</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: kycData.businessProofUrl ? '#10b981' : TEXT_SECONDARY }}>
                        {kycData.businessProofUrl ? "Uploaded ✓" : "Not Provided"}
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 2, borderRadius: '16px', border: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: TEXT, mb: 1.2 }}>
                      Tax & GST Information
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: TEXT_SECONDARY }}>GST Registered</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: TEXT }}>
                        {kycData.isGstRegistered ? "Yes" : "No"}
                      </Typography>
                    </Box>
                    {kycData.isGstRegistered && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography sx={{ fontSize: '0.78rem', color: TEXT_SECONDARY }}>GSTIN</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: TEXT }}>{kycData.gstin || "—"}</Typography>
                      </Box>
                    )}
                  </Paper>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={saving}
                  onClick={handleSaveAndSubmit}
                  sx={{
                    borderRadius: '14px',
                    bgcolor: PRIMARY,
                    py: 1.4,
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.94rem',
                    '&:hover': { bgcolor: PRIMARY_DARK },
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'Submit KYC for Verification'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </AppShell>
  );
}
