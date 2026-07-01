import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Chip,
  CircularProgress,
  IconButton
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  ArrowForward
} from "@mui/icons-material";
import { LuChevronLeft, LuShieldCheck } from "react-icons/lu";
import axios from "axios";
import { getAccessToken } from "../../api/api";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_CONSUMER_API_URL || "https://www.trikonekt.com/api";

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PRIMARY = "#228B22";
const PRIMARY_DARK = "#1B4D3E";
const BG = "#f1f5f9";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const BORDER = "#e2e8f0";

export default function BusinessKYC() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // DigiLocker KYC state
  const [dlStatus, setDlStatus] = useState("NOT_STARTED"); // NOT_STARTED, IN_PROGRESS, PENDING, VERIFIED, REJECTED
  const [dlProfile, setDlProfile] = useState(null);

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  const fetchDlStatus = async () => {
    try {
      setLoading(true);
      const res = await API.get("/kyc/status");
      if (res?.data?.status) {
        const status = res.data.status;
        setDlStatus(status);
        if (status === "PENDING" || status === "VERIFIED" || status === "REJECTED") {
          const profileRes = await API.get("/kyc/profile");
          if (profileRes?.data) {
            setDlProfile(profileRes.data);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch DigiLocker status", err);
    } finally {
      setLoading(false);
    }
  };

  const startDigiLockerKyc = async () => {
    try {
      setSaving(true);
      clearAlerts();
      const res = await API.post("/kyc/start");
      const url = res?.data?.data?.authorization_url || res?.data?.authorization_url;
      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to generate DigiLocker verification link.");
      }
    } catch (err) {
      setError("Failed to initiate DigiLocker KYC: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callback = params.get("kyc_callback");
    if (callback === "success") {
      setMessage("DigiLocker verification completed! Your profile is pending admin approval.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (callback === "error") {
      const errorMsg = params.get("error") || "Unknown error";
      setError("DigiLocker verification failed: " + decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchDlStatus();
  }, []);

  const renderStatusHeader = () => {
    const statusConfig = {
      NOT_STARTED: {
        label: "KYC Unverified",
        color: "error",
        icon: <Cancel />,
        desc: "Please verify your identity using DigiLocker to publish products, list shops, and activate B2B sales."
      },
      IN_PROGRESS: {
        label: "Verification In Progress",
        color: "warning",
        icon: <Pending />,
        desc: "You have started the DigiLocker verification. Please complete the flow."
      },
      PENDING: {
        label: "Pending Admin Approval",
        color: "warning",
        icon: <Pending />,
        desc: "Aadhaar details fetched successfully. Admin moderation is pending."
      },
      VERIFIED: {
        label: "KYC Verified",
        color: "success",
        icon: <CheckCircle />,
        desc: "Congratulations! Your identity is verified. Product listings, shops, and B2B marketplace publishing are fully enabled."
      },
      REJECTED: {
        label: "KYC Rejected",
        color: "error",
        icon: <Cancel />,
        desc: `Verification rejected. Remarks: ${dlProfile?.remarks || "Please try again."}`
      }
    };

    const cfg = statusConfig[dlStatus] || statusConfig.NOT_STARTED;

    return (
      <Card sx={{ mb: 4, borderLeft: 6, borderColor: `${cfg.color}.main`, bgcolor: SURFACE }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} variant="filled" sx={{ fontWeight: 800 }} />
                {dlStatus === "VERIFIED" && <Chip label="Marketplace Publishing Enabled" color="success" size="small" variant="outlined" />}
              </Stack>
              <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                {cfg.desc}
              </Typography>
            </Box>
            {dlStatus === "VERIFIED" && dlProfile?.verified_at && (
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY }} display="block">
                  Verified On: {new Date(dlProfile.verified_at).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      bgcolor: '#f8fafc', 
      minHeight: '100vh', 
      pb: 6, 
      maxWidth: '430px', 
      margin: '0 auto', 
      boxShadow: '0 0 20px rgba(0,0,0,0.05)', 
      borderLeft: '1px solid #e2e8f0', 
      borderRight: '1px solid #e2e8f0' 
    }}>
      {/* Top sticky header */}
      <Box sx={{ bgcolor: '#1B4D3E', background: 'linear-gradient(135deg, #1B4D3E 0%, #143d31 100%)', zIndex: 10, py: 2 }}>
        <Container>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.12)', 
                  border: '1px solid rgba(255,255,255,0.25)', 
                  color: '#ffffff', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  width: 38,
                  height: 38
                }}
              >
                <LuChevronLeft size={20} />
              </IconButton>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#ffffff', lineHeight: 1.2 }}>
                  Business KYC
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                  Verify identity to activate merchant status
                </Typography>
              </Box>
            </Stack>
            <LuShieldCheck size={22} color="#10b981" />
          </Stack>
        </Container>
      </Box>

      <Container sx={{ mt: 3, px: 2 }}>
        {renderStatusHeader()}

        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3, bgcolor: SURFACE, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Box>
              {(dlStatus === "NOT_STARTED" || dlStatus === "REJECTED" || dlStatus === "IN_PROGRESS") && (
                <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center", bgcolor: "rgba(34, 139, 34, 0.05)", borderStyle: "dashed" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: PRIMARY_DARK }}>
                    Authenticate with DigiLocker
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, maxW: 550, mx: "auto", color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                    DigiLocker is a secure government portal that provides access to authentic digital documents. We verify your Aadhaar details via DigiLocker to approve your merchant profile.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={startDigiLockerKyc}
                    disabled={saving}
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 800,
                      bgcolor: PRIMARY,
                      textTransform: "none",
                      color: "#fff",
                      "&:hover": { bgcolor: PRIMARY_DARK }
                    }}
                  >
                    {saving ? "Redirecting..." : "Start DigiLocker Verification"}
                  </Button>
                </Paper>
              )}

              {(dlStatus === "PENDING" || dlStatus === "VERIFIED" || dlStatus === "REJECTED") && dlProfile && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: TEXT }}>
                    Aadhaar Identity Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, border: `1px solid ${BORDER}` }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={3} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                        {dlProfile.photo ? (
                          <Avatar
                            src={`data:image/jpeg;base64,${dlProfile.photo}`}
                            variant="rounded"
                            sx={{ width: 110, height: 130, border: "2px solid #ccc", boxShadow: 1 }}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 110, height: 130, bgcolor: PRIMARY }}>
                            {dlProfile.name ? dlProfile.name.charAt(0) : "M"}
                          </Avatar>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Name (as per Aadhaar)</Typography>
                            <Typography sx={{ fontWeight: 700, color: TEXT }}>{dlProfile.name}</Typography>
                          </Grid>
                          <Grid item xs={6} md={4}>
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Date of Birth</Typography>
                            <Typography sx={{ fontWeight: 600, color: TEXT }}>{dlProfile.dob}</Typography>
                          </Grid>
                          <Grid item xs={6} md={4}>
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Gender</Typography>
                            <Typography sx={{ fontWeight: 600, color: TEXT }}>{dlProfile.gender === "M" ? "Male" : dlProfile.gender === "F" ? "Female" : dlProfile.gender}</Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Aadhaar (Last 4 Digits)</Typography>
                            <Typography sx={{ fontWeight: 600, color: TEXT }}>xxxx-xxxx-{dlProfile.aadhaarLast4 || "8095"}</Typography>
                          </Grid>
                          {dlProfile.email && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>DigiLocker Email</Typography>
                              <Typography sx={{ fontWeight: 600, color: TEXT }}>{dlProfile.email}</Typography>
                            </Grid>
                          )}
                          {dlProfile.mobile && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>DigiLocker Mobile</Typography>
                              <Typography sx={{ fontWeight: 600, color: TEXT }}>{dlProfile.mobile}</Typography>
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: TEXT }}>{dlProfile.address}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Issued Documents list */}
                  {dlProfile.issuedDocumentsJson && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: TEXT }}>
                        Linked Issued Documents
                      </Typography>
                      <Paper variant="outlined" sx={{ borderRadius: 2, border: `1px solid ${BORDER}` }}>
                        <List dense>
                          {(() => {
                            try {
                              const docs = JSON.parse(dlProfile.issuedDocumentsJson);
                              const items = docs?.items || [];
                              if (items.length === 0) return <ListItem><ListItemText primary="No issued documents linked." /></ListItem>;
                              return items.map((doc, idx) => (
                                <ListItem key={idx} divider={idx < items.length - 1}>
                                  <ListItemText
                                    primary={doc.name}
                                    secondary={`URI: ${doc.uri} | Type: ${doc.type || "Document"}`}
                                    primaryTypographyProps={{ fontWeight: 700, color: TEXT }}
                                  />
                                </ListItem>
                              ));
                            } catch {
                              return <ListItem><ListItemText primary="Could not parse linked documents." /></ListItem>;
                            }
                          })()}
                        </List>
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
