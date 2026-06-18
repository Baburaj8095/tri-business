import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { getMerchantProfile, updateMerchantProfile } from "../../api/api";
import { LuChevronLeft, LuEdit2 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const PRIMARY = "#228B22";
const PRIMARY_DARK = "#1B4D3E";
const BG = "#f1f5f9";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#e2e8f0";

export default function BusinessProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [form, setForm] = useState({
    business_name: "",
    mobile_number: "",
    commission_percent: "",
    service_mode: "BOTH",
    address: "",
    email: "",
    age: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const p = await getMerchantProfile();
        if (!cancelled) {
          setProfile(p || {});
          setForm({
            business_name: p?.business_name || "",
            mobile_number: p?.mobile_number || "",
            commission_percent:
              p?.commission_percent != null && p.commission_percent !== ""
                ? String(p.commission_percent)
                : "",
            service_mode: (p?.service_mode || "BOTH").toString().toUpperCase(),
            address: p?.address || "",
            email: p?.email || "",
            age: p?.age || "",
          });
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load merchant profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target || {};
    if (!name) return;
    if (name === "mobile_number") {
      const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: digits }));
      return;
    }
    if (name === "commission_percent") {
      const v = String(value || "")
        .replace(/[^0-9.]/g, "")
        .slice(0, 6);
      setForm((prev) => ({ ...prev, [name]: v }));
      return;
    }
    if (name === "age") {
      const v = String(value || "").replace(/\D/g, "").slice(0, 3);
      setForm((prev) => ({ ...prev, [name]: v }));
      return;
    }
    if (name === "service_mode") {
      setForm((prev) => ({ ...prev, [name]: String(value || "").toUpperCase() }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (!form.business_name.trim()) {
        throw new Error("Business Name is required.");
      }
      if (!/^\d{10}$/.test(String(form.mobile_number || ""))) {
        throw new Error("Enter a valid 10-digit Mobile Number.");
      }
      const cp = parseFloat(String(form.commission_percent || "").trim());
      const commissionValid =
        String(form.commission_percent || "").trim() === "" ||
        (Number.isFinite(cp) && cp >= 0 && cp <= 100);
      if (!commissionValid) {
        throw new Error("Commission must be a number between 0 and 100.");
      }
      const sm = String(form.service_mode || "BOTH").toUpperCase();
      const serviceValid = ["ONLINE", "OFFLINE", "BOTH"].includes(sm);
      if (!serviceValid) {
        throw new Error("Service Mode must be one of: ONLINE, OFFLINE, BOTH.");
      }

      const payload = {
        business_name: form.business_name || "",
        mobile_number: form.mobile_number || "",
        ...(String(form.commission_percent || "").trim() !== "" && {
          commission_percent: parseFloat(form.commission_percent),
        }),
        service_mode: sm,
        address: form.address || "",
        email: form.email || "",
        age: form.age ? parseInt(form.age) : null,
      };
      const updated = await updateMerchantProfile(payload);
      setProfile(updated || {});
      setSuccess("Profile updated successfully.");
      setEditMode(false);
      setEditDialogOpen(false);
    } catch (e) {
      const msg =
        e?.response?.data
          ? JSON.stringify(e.response.data)
          : e?.message || "Failed to update profile.";
      setError(typeof msg === "string" ? msg : String(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleEditField = (field) => {
    setEditField(field);
    setEditDialogOpen(true);
  };

  const getInitials = () => {
    if (form?.business_name) {
      return form.business_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "BU";
  };

  const verified = Boolean(profile?.is_verified);

  if (loading) {
    return (
      <Box sx={{ bgcolor: BG, minHeight: "100vh", p: 2, display: "grid", placeItems: "center" }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BG, minHeight: "100vh", pb: 4 }}>
      {/* Header with Back Button */}
      <Box sx={{ bgcolor: SURFACE, py: 2, borderBottom: `1px solid ${BORDER}`, mb: 2 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              size="small"
              onClick={() => navigate("/business-dashboard")}
              sx={{
                bgcolor: "#f1f5f9",
                color: TEXT,
                "&:hover": { bgcolor: BORDER },
              }}
            >
              <LuChevronLeft size={20} />
            </IconButton>
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: TEXT }}>
              Business Profile
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md">
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* PROFILE HEADER CARD */}
        <Card sx={{ mb: 3, borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "none" }}>
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: PRIMARY,
                color: SURFACE,
                fontWeight: 900,
                fontSize: "2.5rem",
                mx: "auto",
                mb: 2,
              }}
            >
              {getInitials()}
            </Avatar>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: TEXT }}>
                {form.business_name || "Business User"}
              </Typography>
              {verified && (
                <Box sx={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: PRIMARY, color: SURFACE, fontSize: '0.75rem', fontWeight: 900 }}>
                  ✓
                </Box>
              )}
            </Stack>

            <Chip
              label={verified ? "Verified Merchant" : "Pending Verification"}
              color={verified ? "success" : "default"}
              sx={{ mb: 3, fontWeight: 700 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Quick Stats */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: PRIMARY }}>
                    5
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: TEXT_MUTED, fontWeight: 600, mt: 0.5 }}>
                    Total Orders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: TEXT }}>
                    2
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: TEXT_MUTED, fontWeight: 600, mt: 0.5 }}>
                    Active Shops
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: PRIMARY }}>
                    4.8
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: TEXT_MUTED, fontWeight: 600, mt: 0.5 }}>
                    Rating
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* BUSINESS INFORMATION SECTION */}
        <Card sx={{ mb: 3, borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
                Business Information
              </Typography>
              <Button
                size="small"
                startIcon={<LuEdit2 size={16} />}
                onClick={() => setEditMode(!editMode)}
                sx={{
                  color: PRIMARY,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(34, 139, 34, 0.08)" },
                }}
              >
                {editMode ? "Done" : "Edit"}
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Business Name */}
            <Stack sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                Business Name
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: BORDER },
                      "&:hover fieldset": { borderColor: "rgb(200,200,200)" },
                    },
                  }}
                />
              ) : (
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                  {form.business_name || "Not provided"}
                </Typography>
              )}
            </Stack>

            {/* Email */}
            <Stack sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                Email
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: BORDER },
                      "&:hover fieldset": { borderColor: "rgb(200,200,200)" },
                    },
                  }}
                />
              ) : (
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                  {form.email || "Not provided"}
                </Typography>
              )}
            </Stack>

            {/* Age */}
            <Stack sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                Age
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  size="small"
                  inputProps={{ min: 18, max: 120 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: BORDER },
                      "&:hover fieldset": { borderColor: "rgb(200,200,200)" },
                    },
                  }}
                />
              ) : (
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                  {form.age || "Not provided"}
                </Typography>
              )}
            </Stack>

            {/* Address */}
            <Stack sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                Address
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: BORDER },
                      "&:hover fieldset": { borderColor: "rgb(200,200,200)" },
                    },
                  }}
                />
              ) : (
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                  {form.address || "Not provided"}
                </Typography>
              )}
            </Stack>

            {editMode && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={saving}
                sx={{
                  bgcolor: PRIMARY,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "12px",
                  py: 1.2,
                  mt: 2,
                  "&:hover": { bgcolor: PRIMARY_DARK },
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* MORE DETAILS */}
        <Card sx={{ mb: 3, borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT, mb: 2 }}>
              Additional Details
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                    Mobile Number
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                    {form.mobile_number || "Not provided"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                    Commission %
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                    {form.commission_percent || "Not set"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                    Service Mode
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                    {form.service_mode || "BOTH"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT_MUTED, mb: 0.75 }}>
                    Member Since
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
                    18 Jan 2024
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card sx={{ mb: 3, borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT, mb: 3 }}>
              Quick Actions
            </Typography>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/business/shops")}
                sx={{
                  borderColor: BORDER,
                  color: TEXT,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "12px",
                  py: 1.2,
                  "&:hover": { bgcolor: BG, borderColor: PRIMARY },
                }}
              >
                👥 Manage Shops
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: BORDER,
                  color: TEXT,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "12px",
                  py: 1.2,
                  "&:hover": { bgcolor: BG, borderColor: PRIMARY },
                }}
              >
                🏦 Bank Details
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: BORDER,
                  color: TEXT,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "12px",
                  py: 1.2,
                  "&:hover": { bgcolor: BG, borderColor: PRIMARY },
                }}
              >
                📋 KYC Documents
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: BORDER,
                  color: TEXT,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "12px",
                  py: 1.2,
                  "&:hover": { bgcolor: BG, borderColor: PRIMARY },
                }}
              >
                🔐 Change Password
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* LOGOUT */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#ef4444",
            color: SURFACE,
            textTransform: "none",
            fontWeight: 800,
            borderRadius: "12px",
            py: 1.4,
            mb: 4,
            "&:hover": { bgcolor: "#dc2626" },
          }}
        >
          🚪 Logout
        </Button>
      </Container>
    </Box>
  );
}
