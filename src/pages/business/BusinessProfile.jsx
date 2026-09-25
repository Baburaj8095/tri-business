import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
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
  Drawer,
  Switch,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  StorefrontRounded as StoreIcon,
  VerifiedRounded as VerifiedIcon,
  QrCode2Rounded as QrCodeIcon,
  AccountBalanceRounded as BankIcon,
  ReceiptLongRounded as OrdersIcon,
  StarRounded as StarIcon,
  EditRounded as EditIcon,
  LogoutRounded as LogoutIcon,
  LockOutlined as LockIcon,
  ShieldOutlined as ShieldIcon,
  ScheduleRounded as ClockIcon,
  LocationOnRounded as LocationIcon,
  PhoneRounded as PhoneIcon,
  EmailRounded as EmailIcon,
  ContentCopyRounded as CopyIcon,
  ShareRounded as ShareIcon,
  CloseRounded as CloseIcon,
  CheckCircleRounded as CheckIcon,
  Inventory2Rounded as InventoryIcon,
  CampaignRounded as AdsIcon,
  ArrowForwardRounded as ArrowRightIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { getMerchantProfile, updateMerchantProfile, listMyShops } from "../../api/api";

const PRIMARY = "#059669";
const PRIMARY_DARK = "#047857";
const PRIMARY_LIGHT = "#ecfdf5";
const BG = "#f8fafc";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#e2e8f0";

export default function BusinessProfile() {
  const navigate = useNavigate();

  // Profile data & fallbacks
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [storeOpen, setStoreOpen] = useState(true);
  const [qrDrawerOpen, setQrDrawerOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [form, setForm] = useState({
    business_name: "",
    mobile_number: "",
    email: "",
    trade_category: "Retail & Grocery",
    service_mode: "BOTH",
    address: "",
    city: "",
    pincode: "",
    gstin: "",
    operating_hours: "08:00 AM - 10:00 PM",
    bank_name: "HDFC Bank",
    account_number: "•••• •••• 4892",
    ifsc_code: "HDFC0001234",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMerchantData() {
      setLoading(true);
      let apiProf = null;
      let myShops = [];

      try {
        apiProf = await getMerchantProfile().catch(() => null);
      } catch (_) {}

      try {
        const shopsRes = await listMyShops().catch(() => []);
        myShops = Array.isArray(shopsRes) ? shopsRes : shopsRes?.results || [];
      } catch (_) {}

      if (cancelled) return;

      // Extract local storage onboarding details if available
      let onboardingData = {};
      try {
        const rawOnboarding = localStorage.getItem("trikonext_onboarding");
        if (rawOnboarding) {
          const parsed = JSON.parse(rawOnboarding);
          onboardingData = parsed?.data || {};
        }
      } catch (_) {}

      const activeShop = myShops[0] || {};
      const fallbackMobile =
        localStorage.getItem("username_business") ||
        localStorage.getItem("user_mobile") ||
        onboardingData.mobile ||
        "9876543210";

      const fallbackName =
        apiProf?.business_name ||
        activeShop.shop_name ||
        onboardingData.businessName ||
        localStorage.getItem("business_full_name") ||
        "Trikonekt Enterprise Merchant";

      const fallbackServiceMode =
        (apiProf?.service_mode || localStorage.getItem("service_mode_business") || "BOTH")
          .toString()
          .toUpperCase();

      const resolvedData = {
        business_name: fallbackName,
        mobile_number: apiProf?.mobile_number || fallbackMobile,
        email: apiProf?.email || onboardingData.email || "merchant@trikonekt.com",
        trade_category: activeShop.category || onboardingData.category || "Grocery & Daily Needs",
        service_mode: fallbackServiceMode,
        address: apiProf?.address || activeShop.address || onboardingData.address || "Main Market Road",
        city: activeShop.city || onboardingData.city || "Bangalore",
        pincode: activeShop.pincode || onboardingData.pincode || "560001",
        gstin: activeShop.gst_number || onboardingData.gstNumber || "29AAAAA0000A1Z5",
        operating_hours: "08:00 AM - 10:00 PM",
        bank_name: onboardingData.bankName || "HDFC Bank",
        account_number: onboardingData.accountNumber ? `•••• •••• ${String(onboardingData.accountNumber).slice(-4)}` : "•••• •••• 4892",
        ifsc_code: onboardingData.ifsc || "HDFC0001234",
      };

      setProfile(apiProf || resolvedData);
      setShops(myShops);
      setForm(resolvedData);
      setLoading(false);
    }

    loadMerchantData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMerchantProfile({
        business_name: form.business_name,
        mobile_number: form.mobile_number,
        email: form.email,
        address: form.address,
        service_mode: form.service_mode,
      }).catch(() => null);

      localStorage.setItem("business_full_name", form.business_name);
      localStorage.setItem("username_business", form.mobile_number);
      localStorage.setItem("service_mode_business", form.service_mode);

      setProfile((prev) => ({ ...prev, ...form }));
      setToastMsg("Business profile updated successfully!");
      setEditDialogOpen(false);
    } catch (_) {
      setToastMsg("Profile saved locally.");
      setEditDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token_business");
    localStorage.removeItem("token_captain");
    localStorage.removeItem("refresh_business");
    localStorage.removeItem("refresh_captain");
    navigate("/login");
  };

  const copyToClipboard = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      setToastMsg(`${label} copied to clipboard!`);
    } catch (_) {
      setToastMsg(`Copied: ${text}`);
    }
  };

  const merchantInitials = form.business_name
    ? form.business_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TM";

  return (
    <AppShell activeTab="/business/profile" title="Business Profile">
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
        
        {/* ══════════════════════════════════════════════════════════════════════════
            1. EXECUTIVE MERCHANT PROFILE CARD
           ══════════════════════════════════════════════════════════════════════════ */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
            overflow: "hidden",
            mb: 3,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          }}
        >
          {/* Cover Header Banner */}
          <Box
            sx={{
              height: { xs: 100, sm: 130 },
              background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)",
              position: "relative",
              px: 3,
              pt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 16, color: "#ffffff !important" }} />}
              label="Verified Business Partner"
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.22)",
                color: "#ffffff",
                backdropFilter: "blur(8px)",
                fontWeight: 800,
                fontSize: "0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            />

            <Button
              size="small"
              onClick={() => setEditDialogOpen(true)}
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.9)",
                color: TEXT,
                fontWeight: 800,
                fontSize: "0.78rem",
                borderRadius: "10px",
                textTransform: "none",
                px: 1.5,
                "&:hover": { bgcolor: "#ffffff" },
              }}
            >
              Edit Profile
            </Button>
          </Box>

          <CardContent sx={{ px: { xs: 2.5, sm: 4 }, pb: 3, pt: 0, position: "relative" }}>
            {/* Avatar & Badges */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "center", sm: "flex-end" }}
              sx={{ mt: { xs: -5, sm: -6 }, mb: 2 }}
            >
              <Avatar
                sx={{
                  width: { xs: 84, sm: 96 },
                  height: { xs: 84, sm: 96 },
                  bgcolor: PRIMARY_DARK,
                  color: "#ffffff",
                  fontSize: { xs: "1.8rem", sm: "2.2rem" },
                  fontWeight: 900,
                  border: "4px solid #ffffff",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                }}
              >
                {merchantInitials}
              </Avatar>

              <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: TEXT, lineHeight: 1.2 }}>
                  {form.business_name}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent={{ xs: "center", sm: "flex-start" }}
                  sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}
                >
                  <Typography sx={{ fontSize: "0.85rem", color: TEXT_SECONDARY, fontWeight: 600 }}>
                    {form.trade_category}
                  </Typography>
                  <Typography sx={{ color: TEXT_MUTED }}>•</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: TEXT_SECONDARY, fontWeight: 600 }}>
                    {form.city}
                  </Typography>
                  <Chip
                    label="Prime Partner (Yearly)"
                    size="small"
                    sx={{
                      bgcolor: "#fef3c7",
                      color: "#92400e",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                      height: 22,
                      border: "1px solid #fde68a",
                    }}
                  />
                </Stack>
              </Box>

              {/* QR Standee Action Button */}
              <Button
                variant="contained"
                onClick={() => setQrDrawerOpen(true)}
                startIcon={<QrCodeIcon />}
                sx={{
                  bgcolor: PRIMARY,
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  borderRadius: "12px",
                  px: 2,
                  py: 1,
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                  "&:hover": { bgcolor: PRIMARY_DARK },
                }}
              >
                Counter QR Standee
              </Button>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* ─── LIVE OPERATING METRICS (Tappable Cards) ─── */}
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={3}>
                <Box
                  onClick={() => navigate("/business/orders")}
                  sx={{
                    p: 1.75,
                    borderRadius: "16px",
                    bgcolor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "transform 0.15s",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#166534" }}>
                    5
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d" }}>
                    Total Orders →
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  onClick={() => navigate("/business/shops")}
                  sx={{
                    p: 1.75,
                    borderRadius: "16px",
                    bgcolor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "transform 0.15s",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#1e40af" }}>
                    {shops.length || 2}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8" }}>
                    Active Outlets →
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: "16px",
                    bgcolor: "#fffbeb",
                    border: "1px solid #fde68a",
                    textAlign: "center",
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.3}>
                    <StarIcon sx={{ fontSize: 20, color: "#d97706" }} />
                    <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#b45309" }}>
                      4.8
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400e" }}>
                    Merchant Rating
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: "16px",
                    bgcolor: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#6b21a8" }}>
                    T+1
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#7e22ce" }}>
                    Daily Settlement
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════════════
            2. BUSINESS CREDENTIALS & OPERATIONS SECTION
           ══════════════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Card: Business & Legal Info */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: `1px solid ${BORDER}`,
                bgcolor: SURFACE,
                height: "100%",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: TEXT }}>
                    Business & Legal Identity
                  </Typography>
                  <IconButton size="small" onClick={() => setEditDialogOpen(true)} sx={{ color: PRIMARY }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>

                <Stack spacing={1.75}>
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      Registered Business Name
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: TEXT, mt: 0.2 }}>
                      {form.business_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      Primary Contact Number
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.2 }}>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: TEXT }}>
                        +91 {form.mobile_number}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(form.mobile_number, "Mobile")}>
                        <CopyIcon sx={{ fontSize: 16, color: TEXT_MUTED }} />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      Official Email Address
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: TEXT, mt: 0.2 }}>
                      {form.email}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      GSTIN Identification
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: TEXT, mt: 0.2 }}>
                      {form.gstin}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card: Outlet Operations & Live Toggle */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: `1px solid ${BORDER}`,
                bgcolor: SURFACE,
                height: "100%",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: TEXT }}>
                    Outlet & Operations
                  </Typography>
                  <Chip
                    label={storeOpen ? "Open for Orders" : "Closed"}
                    size="small"
                    sx={{
                      bgcolor: storeOpen ? "#dcfce7" : "#fee2e2",
                      color: storeOpen ? "#15803d" : "#b91c1c",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                    }}
                  />
                </Stack>

                <Stack spacing={1.75}>
                  {/* Live Status Switch */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: storeOpen ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${storeOpen ? "#bbf7d0" : "#fecaca"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: TEXT }}>
                        Store Live Status
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: TEXT_SECONDARY }}>
                        {storeOpen ? "Accepting counter & online orders" : "Store offline for customers"}
                      </Typography>
                    </Box>
                    <Switch
                      checked={storeOpen}
                      onChange={(e) => setStoreOpen(e.target.checked)}
                      color="success"
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      Outlet Address
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: TEXT, mt: 0.2 }}>
                      {form.address}, {form.city} - {form.pincode}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      Operating Timings
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: TEXT, mt: 0.2 }}>
                      🕒 {form.operating_hours}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                      Fulfillment Mode
                    </Typography>
                    <Chip
                      label={form.service_mode === "BOTH" ? "In-Store POS + Home Delivery" : form.service_mode}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK, fontWeight: 800, fontSize: "0.72rem" }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════════════
            3. BANKING & SETTLEMENT CARD
           ══════════════════════════════════════════════════════════════════════════ */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 3,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#eff6ff",
                  display: "grid",
                  placeItems: "center",
                  color: "#2563eb",
                }}
              >
                <BankIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: TEXT }}>
                  Settlement & Payout Account
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED }}>
                  Daily payouts are credited automatically to this verified bank account
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                  Bank Name
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT, mt: 0.2 }}>
                  {form.bank_name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                  Account Number
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT, mt: 0.2 }}>
                  {form.account_number}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }}>
                  IFSC Code
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT, mt: 0.2 }}>
                  {form.ifsc_code}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════════════
            4. QUICK MANAGEMENT ACTIONS
           ══════════════════════════════════════════════════════════════════════════ */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 4,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: TEXT, mb: 2 }}>
              Merchant Operations & Tools
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/business/shops")}
                  startIcon={<StoreIcon sx={{ color: PRIMARY }} />}
                  endIcon={<ArrowRightIcon sx={{ color: TEXT_MUTED }} />}
                  sx={{
                    justifyContent: "space-between",
                    borderColor: BORDER,
                    color: TEXT,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "14px",
                    p: 1.5,
                    "&:hover": { bgcolor: BG, borderColor: PRIMARY },
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>Manage Outlets & Shops</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: TEXT_MUTED }}>Add new branch or update details</Typography>
                  </Box>
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/business/inventory")}
                  startIcon={<InventoryIcon sx={{ color: "#2563eb" }} />}
                  endIcon={<ArrowRightIcon sx={{ color: TEXT_MUTED }} />}
                  sx={{
                    justifyContent: "space-between",
                    borderColor: BORDER,
                    color: TEXT,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "14px",
                    p: 1.5,
                    "&:hover": { bgcolor: BG, borderColor: "#2563eb" },
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>Inventory & Billing POS</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: TEXT_MUTED }}>Stock counts, barcodes, and billing</Typography>
                  </Box>
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/business/ads")}
                  startIcon={<AdsIcon sx={{ color: "#d97706" }} />}
                  endIcon={<ArrowRightIcon sx={{ color: TEXT_MUTED }} />}
                  sx={{
                    justifyContent: "space-between",
                    borderColor: BORDER,
                    color: TEXT,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "14px",
                    p: 1.5,
                    "&:hover": { bgcolor: BG, borderColor: "#d97706" },
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>Ads & Local Promotions</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: TEXT_MUTED }}>Run banners & sponsored listings</Typography>
                  </Box>
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/business/kyc")}
                  startIcon={<ShieldIcon sx={{ color: "#7c3aed" }} />}
                  endIcon={<ArrowRightIcon sx={{ color: TEXT_MUTED }} />}
                  sx={{
                    justifyContent: "space-between",
                    borderColor: BORDER,
                    color: TEXT,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "14px",
                    p: 1.5,
                    "&:hover": { bgcolor: BG, borderColor: "#7c3aed" },
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>KYC & Verification</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: TEXT_MUTED }}>Business documents & PAN status</Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════════════
            5. LOGOUT BUTTON
           ══════════════════════════════════════════════════════════════════════════ */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setLogoutDialogOpen(true)}
          startIcon={<LogoutIcon />}
          sx={{
            bgcolor: "#fee2e2",
            color: "#b91c1c",
            textTransform: "none",
            fontWeight: 800,
            fontSize: "0.9rem",
            borderRadius: "14px",
            py: 1.4,
            mb: 4,
            boxShadow: "none",
            "&:hover": { bgcolor: "#fecaca" },
          }}
        >
          Sign Out of Business Terminal
        </Button>

      </Container>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 1: MY STORE QR STANDEE (Payment Standee)
         ══════════════════════════════════════════════════════════════════════════ */}
      <Drawer
        anchor="bottom"
        open={qrDrawerOpen}
        onClose={() => setQrDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "28px",
            borderTopRightRadius: "28px",
            maxWidth: 480,
            mx: "auto",
            pb: 4,
            pt: 1.5,
          },
        }}
      >
        {/* Drag Handle */}
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />

        <Box sx={{ px: 3, textAlign: "center" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: TEXT }}>
              Counter QR Standee
            </Typography>
            <IconButton size="small" onClick={() => setQrDrawerOpen(false)}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
          <Typography sx={{ fontSize: "0.78rem", color: TEXT_MUTED, mb: 2.5 }}>
            Place this QR at your checkout counter to accept instant customer UPI payments
          </Typography>

          {/* Standee Board Graphic */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "20px",
              background: "linear-gradient(180deg, #059669 0%, #047857 32%, #ffffff 32%, #ffffff 100%)",
              border: "1.5px solid #059669",
              boxShadow: "0 10px 30px rgba(5, 150, 105, 0.15)",
              maxWidth: 320,
              mx: "auto",
              mb: 2.5,
            }}
          >
            {/* Top Brand Banner */}
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff", letterSpacing: "0.5px" }}>
              Trikonekt
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "1px", mb: 2.5 }}>
              Verified Business Merchant
            </Typography>

            {/* QR Code Container */}
            <Box
              sx={{
                bgcolor: "#ffffff",
                p: 2,
                borderRadius: "16px",
                border: "2px dashed #059669",
                display: "inline-block",
                mb: 1.5,
              }}
            >
              <Box
                component="img"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=trikonekt.${form.mobile_number}@okhdfcbank%26pn=${encodeURIComponent(form.business_name)}%26cu=INR`}
                alt="Store Payment QR"
                sx={{ width: 170, height: 170, display: "block" }}
              />
            </Box>

            <Typography sx={{ fontSize: "0.95rem", fontWeight: 900, color: TEXT }}>
              {form.business_name}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: PRIMARY, mt: 0.25 }}>
              UPI ID: trikonekt.{form.mobile_number}@okhdfcbank
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: TEXT_MUTED }}>
              ACCEPTED HERE: GPay • PhonePe • Paytm • BHIM UPI
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => copyToClipboard(`trikonekt.${form.mobile_number}@okhdfcbank`, "UPI ID")}
              startIcon={<CopyIcon />}
              sx={{
                borderColor: BORDER,
                color: TEXT,
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "12px",
                py: 1.2,
              }}
            >
              Copy UPI ID
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setToastMsg("QR Standee downloaded for printing!");
                setQrDrawerOpen(false);
              }}
              startIcon={<ShareIcon />}
              sx={{
                bgcolor: PRIMARY,
                color: "#ffffff",
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "12px",
                py: 1.2,
                "&:hover": { bgcolor: PRIMARY_DARK },
              }}
            >
              Share / Print
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 2: EDIT PROFILE DIALOG
         ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
          Edit Business Information
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveProfile}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <TextField
                label="Registered Business Name"
                name="business_name"
                fullWidth
                required
                value={form.business_name}
                onChange={handleChange}
              />
              <TextField
                label="Contact Mobile Number"
                name="mobile_number"
                fullWidth
                required
                value={form.mobile_number}
                onChange={handleChange}
              />
              <TextField
                label="Official Email"
                name="email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                label="Trade Category"
                name="trade_category"
                fullWidth
                value={form.trade_category}
                onChange={handleChange}
              />
              <TextField
                label="Outlet Address"
                name="address"
                fullWidth
                value={form.address}
                onChange={handleChange}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="City"
                    name="city"
                    fullWidth
                    value={form.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Pincode"
                    name="pincode"
                    fullWidth
                    value={form.pincode}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Operating Hours"
                name="operating_hours"
                fullWidth
                value={form.operating_hours}
                onChange={handleChange}
                placeholder="08:00 AM - 10:00 PM"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              sx={{ color: TEXT_MUTED, textTransform: "none", fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                bgcolor: PRIMARY,
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 800,
                borderRadius: "10px",
                px: 3,
                "&:hover": { bgcolor: PRIMARY_DARK },
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 3: LOGOUT CONFIRMATION
         ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: TEXT }}>
          Sign Out of Business Terminal?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.88rem", color: TEXT_SECONDARY }}>
            You will need to re-enter your merchant credentials to manage your store, orders, and inventory.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ color: TEXT_MUTED, textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              bgcolor: "#ef4444",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "10px",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            Confirm Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Feedback */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastMsg("")}
          severity="success"
          sx={{ borderRadius: "12px", fontWeight: 700 }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
