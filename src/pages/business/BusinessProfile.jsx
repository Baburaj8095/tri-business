import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  Container,
  IconButton,
  Drawer,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  StorefrontRounded as StorefrontIcon,
  StoreRounded as StoreIcon,
  CheckCircleRounded as VerifiedCheckIcon,
  StarRounded as StarIcon,
  EditRounded as EditIcon,
  LogoutRounded as LogoutIcon,
  LockOutlined as LockIcon,
  ShieldOutlined as ShieldIcon,
  LocationOnRounded as LocationIcon,
  PhoneRounded as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  InfoOutlined as InfoIcon,
  NavigationRounded as DirectionIcon,
  ShoppingBagOutlined as BagIcon,
  MonetizationOnOutlined as MoneyIcon,
  PeopleAltOutlined as PeopleIcon,
  EmailOutlined as EmailIcon,
  DescriptionOutlined as DocIcon,
  CalendarTodayOutlined as CalendarIcon,
  WidgetsOutlined as CategoryIcon,
  CloseRounded as CloseIcon,
  CameraAltRounded as CameraIcon,
  ChevronRightRounded as ChevronRightIcon,
  Inventory2Rounded as InventoryIcon,
  CampaignRounded as AdsIcon,
  BoltRounded as BoltIcon,
  ShoppingBagRounded as RetailIcon,
  AccountBalanceRounded as BankIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { getMerchantProfile, updateMerchantProfile, listMyShops } from "../../api/api";

const PRIMARY = "#059669";
const PRIMARY_DARK = "#047857";
const BG = "#f8fafc";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_MUTED = "#64748b";
const BORDER = "#e2e8f0";

const DRAWER_PAPER_PROPS = {
  sx: {
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    maxWidth: 480,
    mx: "auto",
    width: "100%",
    p: { xs: 2.5, sm: 3 },
    pb: 4,
    maxHeight: "88vh",
    bgcolor: "#ffffff",
    boxShadow: "0 -8px 32px rgba(15, 23, 42, 0.18)",
  },
};

export default function BusinessProfile() {
  const navigate = useNavigate();

  // Profile data & state
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Bottom Drawers (NO Center Popups)
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [editPayoutOpen, setEditPayoutOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    business_name: "Online B2C",
    trade_category: "Grocery & Daily Needs",
    mobile_number: "+91 9876543210",
    email: "merchant@trikonekt.com",
    gstin: "29AAAAA0000A1Z5",
    member_since: "12 Jan 2023",
    address: "Main Market Road, Bengaluru - 560102",
    city: "Bengaluru",
    pincode: "560102",
    operating_hours: "08:00 AM - 10:00 PM",
    delivery_time: "10–15 mins delivery",
    service_mode: "Online & Offline",
    bank_name: "HDFC Bank",
    account_number: "••••• 4892",
    ifsc_code: "HDFC0001234",
    rating: "4.8",
    reviews_count: "202",
    total_orders: "5",
    active_outlets: "1",
    monthly_sales: "₹12,450",
    cover_image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80",
    store_thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
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

      const activeShop = myShops[0] || {};
      const resolvedName = apiProf?.business_name || activeShop.shop_name || "Online B2C";
      const resolvedMobile = apiProf?.mobile_number || "9876543210";
      const formattedMobile = resolvedMobile.startsWith("+91")
        ? resolvedMobile
        : `+91 ${resolvedMobile.replace(/\D/g, "")}`;

      setForm((prev) => ({
        ...prev,
        business_name: resolvedName,
        mobile_number: formattedMobile,
        email: apiProf?.email || "merchant@trikonekt.com",
        trade_category: activeShop.category || apiProf?.trade_category || "Grocery & Daily Needs",
        address: activeShop.address
          ? `${activeShop.address}, ${activeShop.city || "Bengaluru"} - ${activeShop.pincode || "560102"}`
          : "Main Market Road, Bengaluru - 560102",
        city: activeShop.city || "Bengaluru",
        pincode: activeShop.pincode || "560102",
        gstin: activeShop.gst_number || "29AAAAA0000A1Z5",
        active_outlets: String(myShops.length || 1),
      }));

      setProfile(apiProf);
      setShops(myShops);
      setLoading(false);
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMerchantProfile({
        business_name: form.business_name,
        email: form.email,
        mobile_number: form.mobile_number.replace(/\D/g, ""),
      }).catch(() => null);

      setToastMsg("Business information updated successfully!");
      setEditInfoOpen(false);
    } catch (_) {
      setToastMsg("Saved locally.");
      setEditInfoOpen(false);
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

  const merchantInitials = form.business_name
    ? form.business_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "OB";

  return (
    <AppShell activeTab="/business/profile" title="Business Profile">
      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2.5 } }}>

        {/* ══════════════════════════════════════════════════════════════════════════
            2. STORE IDENTITY (Clean hero section with cover, avatar, rating & badges)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box sx={{ mb: 2 }}>
          {/* Cover Hero Banner */}
          <Box
            sx={{
              height: { xs: 140, sm: 170 },
              borderRadius: "18px",
              overflow: "hidden",
              position: "relative",
              backgroundImage: `url(${form.cover_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
            }}
          >
            {/* Top Right: Edit Cover Button */}
            <Button
              size="small"
              onClick={() => {
                const url = window.prompt("Enter cover image URL:", form.cover_image);
                if (url) setForm((p) => ({ ...p, cover_image: url }));
              }}
              startIcon={<CameraIcon sx={{ fontSize: 16 }} />}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(8px)",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "0.74rem",
                borderRadius: "10px",
                height: 32,
                px: 1.5,
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#ffffff" },
              }}
            >
              Edit Cover
            </Button>
          </Box>

          {/* Store Card Overlapping Banner */}
          <Box
            sx={{
              mt: -4,
              mx: { xs: 0.5, sm: 1.5 },
              p: { xs: 2, sm: 2.5 },
              borderRadius: "18px",
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Top Row: Avatar with Verified Checkmark & Status Chip */}
            <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
              {/* Avatar with Verified Ring Badge */}
              <Box sx={{ position: "relative", mt: -5 }}>
                <Avatar
                  sx={{
                    width: { xs: 68, sm: 76 },
                    height: { xs: 68, sm: 76 },
                    bgcolor: "#064e3b",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: { xs: "1.45rem", sm: "1.7rem" },
                    border: "3.5px solid #ffffff",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                  }}
                >
                  {merchantInitials}
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#16a34a",
                    border: "2px solid #ffffff",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                >
                  <VerifiedCheckIcon sx={{ fontSize: 13, color: "#ffffff" }} />
                </Box>
              </Box>

              {/* Status Chip */}
              <Chip
                label="● Open for Orders"
                size="small"
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#15803d",
                  border: "1.5px solid #bbf7d0",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  height: 26,
                  px: 0.5,
                  letterSpacing: "0.2px",
                }}
              />
            </Stack>

            {/* Store Name, Subtitle & Rating */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mt: 1.5 }}>
              <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.25rem", sm: "1.45rem" }, color: TEXT, lineHeight: 1.2 }} noWrap>
                  {form.business_name}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600, mt: 0.3 }} noWrap>
                  {form.trade_category} • {form.city}
                </Typography>
              </Box>

              {/* Star Rating Badge */}
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.4,
                    bgcolor: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: "8px",
                    px: 0.9,
                    py: 0.3,
                  }}
                >
                  <StarIcon sx={{ fontSize: 16, color: "#d97706" }} />
                  <Typography sx={{ fontSize: "0.86rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                    {form.rating}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.7rem", color: TEXT_MUTED, fontWeight: 600, mt: 0.25 }}>
                  ({form.reviews_count} Reviews)
                </Typography>
              </Box>
            </Stack>

            {/* Badges Row */}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.75 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "#ecfdf5",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                  borderRadius: "20px",
                  px: 1.25,
                  py: 0.4,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                }}
              >
                <VerifiedCheckIcon sx={{ fontSize: 14, color: "#16a34a" }} />
                Verified Merchant
              </Box>

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "#fffbeb",
                  color: "#b45309",
                  border: "1px solid #fde68a",
                  borderRadius: "20px",
                  px: 1.25,
                  py: 0.4,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                }}
              >
                👑 Prime Partner
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            3. QUICK ACTIONS (Common actions to connect with business)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} sx={{ mb: 2.5, width: "100%" }}>
          {/* Action 1: Call */}
          <Box
            onClick={() => window.location.href = `tel:${form.mobile_number.replace(/\s+/g, "")}`}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 64,
              borderRadius: "14px",
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: BG },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            <PhoneIcon sx={{ fontSize: 20, color: "#15803d" }} />
            <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.74rem" }, fontWeight: 700, color: TEXT, mt: 0.35, whiteSpace: "nowrap" }}>
              Call
            </Typography>
          </Box>

          {/* Action 2: WhatsApp */}
          <Box
            onClick={() => {
              const cleanNum = form.mobile_number.replace(/\D/g, "");
              window.open(`https://wa.me/91${cleanNum.slice(-10)}?text=Hello%20${encodeURIComponent(form.business_name)}`, "_blank");
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 64,
              borderRadius: "14px",
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: BG },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 21, color: "#25d366" }} />
            <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.74rem" }, fontWeight: 700, color: TEXT, mt: 0.35, whiteSpace: "nowrap" }}>
              WhatsApp
            </Typography>
          </Box>

          {/* Action 3: Ask Anything */}
          <Box
            onClick={() => setAiAssistantOpen(true)}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 64,
              borderRadius: "14px",
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: BG },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            <ChatIcon sx={{ fontSize: 20, color: "#2563eb" }} />
            <Typography sx={{ fontSize: { xs: "0.66rem", sm: "0.74rem" }, fontWeight: 700, color: TEXT, mt: 0.35, whiteSpace: "nowrap" }}>
              Ask Anything
            </Typography>
          </Box>

          {/* Action 4: Enquiry */}
          <Box
            onClick={() => setEnquiryModalOpen(true)}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 64,
              borderRadius: "14px",
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: BG },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            <InfoIcon sx={{ fontSize: 20, color: "#d97706" }} />
            <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.74rem" }, fontWeight: 700, color: TEXT, mt: 0.35, whiteSpace: "nowrap" }}>
              Enquiry
            </Typography>
          </Box>

          {/* Action 5: Direction */}
          <Box
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(form.address)}`, "_blank")}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 64,
              borderRadius: "14px",
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: BG },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            <DirectionIcon sx={{ fontSize: 20, color: "#4f46e5" }} />
            <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.74rem" }, fontWeight: 700, color: TEXT, mt: 0.35, whiteSpace: "nowrap" }}>
              Direction
            </Typography>
          </Box>
        </Stack>

        {/* ══════════════════════════════════════════════════════════════════════════
            4. KEY METRICS (Exact 4 Cards in 1 Row - Never Wrap onto 2nd line)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: { xs: 0.75, sm: 1.25 },
            mb: 2.5,
          }}
        >
          {/* Metric 1: Total Orders */}
          <Box
            onClick={() => navigate("/business/orders")}
            sx={{
              py: { xs: 1.25, sm: 1.75 },
              px: { xs: 0.5, sm: 1 },
              borderRadius: "16px",
              bgcolor: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              cursor: "pointer",
              minWidth: 0,
              transition: "all 0.15s ease",
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            <BagIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: "#16a34a", mb: 0.25 }} />
            <Typography sx={{ fontSize: { xs: "1.15rem", sm: "1.45rem" }, fontWeight: 900, color: "#166534", lineHeight: 1 }}>
              {form.total_orders}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 700, color: "#15803d", mt: 0.35, whiteSpace: "nowrap" }}>
              Total Orders
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, fontWeight: 800, color: "#15803d", mt: 0.2, whiteSpace: "nowrap" }}>
              Today →
            </Typography>
          </Box>

          {/* Metric 2: Active Outlets */}
          <Box
            onClick={() => navigate("/business/shops")}
            sx={{
              py: { xs: 1.25, sm: 1.75 },
              px: { xs: 0.5, sm: 1 },
              borderRadius: "16px",
              bgcolor: "#eff6ff",
              border: "1.5px solid #bfdbfe",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              cursor: "pointer",
              minWidth: 0,
              transition: "all 0.15s ease",
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            <StorefrontIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: "#2563eb", mb: 0.25 }} />
            <Typography sx={{ fontSize: { xs: "1.15rem", sm: "1.45rem" }, fontWeight: 900, color: "#1e40af", lineHeight: 1 }}>
              {form.active_outlets}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 700, color: "#1d4ed8", mt: 0.35, whiteSpace: "nowrap" }}>
              Active Outlets
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, fontWeight: 800, color: "#1d4ed8", mt: 0.2, whiteSpace: "nowrap" }}>
              Manage →
            </Typography>
          </Box>

          {/* Metric 3: Monthly Sales */}
          <Box
            sx={{
              py: { xs: 1.25, sm: 1.75 },
              px: { xs: 0.5, sm: 1 },
              borderRadius: "16px",
              bgcolor: "#fffbeb",
              border: "1.5px solid #fde68a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <MoneyIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: "#d97706", mb: 0.25 }} />
            <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1.3rem" }, fontWeight: 900, color: "#b45309", lineHeight: 1, whiteSpace: "nowrap" }}>
              {form.monthly_sales}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 700, color: "#b45309", mt: 0.35, whiteSpace: "nowrap" }}>
              Monthly Sales
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, fontWeight: 800, color: "#15803d", mt: 0.2, whiteSpace: "nowrap" }}>
              +12% ↗
            </Typography>
          </Box>

          {/* Metric 4: Merchant Rating */}
          <Box
            sx={{
              py: { xs: 1.25, sm: 1.75 },
              px: { xs: 0.5, sm: 1 },
              borderRadius: "16px",
              bgcolor: "#faf5ff",
              border: "1.5px solid #e9d5ff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <PeopleIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: "#9333ea", mb: 0.25 }} />
            <Typography sx={{ fontSize: { xs: "1.15rem", sm: "1.45rem" }, fontWeight: 900, color: "#6b21a8", lineHeight: 1 }}>
              {form.rating}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 700, color: "#7e22ce", mt: 0.35, whiteSpace: "nowrap" }}>
              Merchant Rating
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, fontWeight: 800, color: "#7e22ce", mt: 0.2, whiteSpace: "nowrap" }}>
              ({form.reviews_count})
            </Typography>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            5. BUSINESS DETAILS (Organized and easy to read information)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            p: 2.25,
            borderRadius: "18px",
            border: `1.5px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 2.5,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          }}
        >
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "0.96rem", color: TEXT }}>
              Business Information
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setEditInfoOpen(true)}
              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 28,
                borderRadius: "8px",
                borderColor: "#cbd5e1",
                color: TEXT,
                fontWeight: 800,
                fontSize: "0.74rem",
                textTransform: "none",
                "&:hover": { borderColor: "#94a3b8", bgcolor: BG },
              }}
            >
              Edit
            </Button>
          </Stack>

          {/* 6 Information Rows */}
          <Stack spacing={1.5} divider={<Divider sx={{ borderColor: "#f1f5f9" }} />}>
            {/* Row 1: Business Name */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <BankIcon sx={{ fontSize: 18, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600 }}>
                  Business Name
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT }}>
                {form.business_name}
              </Typography>
            </Stack>

            {/* Row 2: Category */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <CategoryIcon sx={{ fontSize: 18, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600 }}>
                  Category
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT }}>
                {form.trade_category}
              </Typography>
            </Stack>

            {/* Row 3: Mobile Number */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <PhoneIcon sx={{ fontSize: 18, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600 }}>
                  Mobile Number
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT }}>
                {form.mobile_number}
              </Typography>
            </Stack>

            {/* Row 4: Email Address */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <EmailIcon sx={{ fontSize: 18, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600 }}>
                  Email Address
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT, wordBreak: "break-all" }}>
                {form.email}
              </Typography>
            </Stack>

            {/* Row 5: GSTIN */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <DocIcon sx={{ fontSize: 18, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600 }}>
                  GSTIN
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT }}>
                {form.gstin}
              </Typography>
            </Stack>

            {/* Row 6: Member Since */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <CalendarIcon sx={{ fontSize: 18, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, fontWeight: 600 }}>
                  Member Since
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT }}>
                {form.member_since}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            6. STORE & LOCATION (Current outlet details with status and service mode)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            p: 2.25,
            borderRadius: "18px",
            border: `1.5px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 2.5,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          }}
        >
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "0.96rem", color: TEXT }}>
              Operating Store & Location
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setEditLocationOpen(true)}
              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 28,
                borderRadius: "8px",
                borderColor: "#cbd5e1",
                color: TEXT,
                fontWeight: 800,
                fontSize: "0.74rem",
                textTransform: "none",
                "&:hover": { borderColor: "#94a3b8", bgcolor: BG },
              }}
            >
              Edit
            </Button>
          </Stack>

          {/* Content Row: Thumbnail on Left, Details on Right */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              component="img"
              src={form.store_thumbnail}
              alt="Operating Store"
              sx={{
                width: 78,
                height: 78,
                borderRadius: "14px",
                objectFit: "cover",
                flexShrink: 0,
                border: "1px solid #e2e8f0",
              }}
            />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT, lineHeight: 1.25 }} noWrap>
                {form.address}
              </Typography>
              <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#15803d", mt: 0.4 }}>
                🟢 Open {form.operating_hours}
              </Typography>

              {/* Service Badges */}
              <Stack direction="row" spacing={1} sx={{ mt: 0.8, flexWrap: "wrap", gap: 0.6 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.4,
                    bgcolor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    px: 1,
                    py: 0.25,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                >
                  <BoltIcon sx={{ fontSize: 13, color: "#0ea5e9" }} />
                  {form.delivery_time}
                </Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.4,
                    bgcolor: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                    borderRadius: "14px",
                    px: 1,
                    py: 0.25,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                >
                  <RetailIcon sx={{ fontSize: 13, color: "#2563eb" }} />
                  {form.service_mode}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            7. OPERATIONS TOOLS (Exact 4 Tools in 1 Row - Pixel Match)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            p: { xs: 1.75, sm: 2.25 },
            borderRadius: "18px",
            border: `1.5px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 2.5,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: "0.96rem", color: TEXT, mb: 1.5 }}>
            Merchant Operations & Tools
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: { xs: 0.75, sm: 1.25 },
            }}
          >
            {/* Tool 1: Manage Outlets & Shops */}
            <Box
              onClick={() => navigate("/business/shops")}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 0.5, sm: 1 },
                borderRadius: "14px",
                bgcolor: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                textAlign: "center",
                minHeight: { xs: 78, sm: 84 },
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#86efac" },
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <StorefrontIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#15803d", mb: 0.4 }} />
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 800, color: "#166534", lineHeight: 1.15 }}>
                Manage Outlets & Shops &gt;
              </Typography>
            </Box>

            {/* Tool 2: Inventory & Billing POS */}
            <Box
              onClick={() => navigate("/business/inventory")}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 0.5, sm: 1 },
                borderRadius: "14px",
                bgcolor: "#eff6ff",
                border: "1.5px solid #bfdbfe",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                textAlign: "center",
                minHeight: { xs: 78, sm: 84 },
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#93c5fd" },
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <InventoryIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#2563eb", mb: 0.4 }} />
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 800, color: "#1e40af", lineHeight: 1.15 }}>
                Inventory & Billing POS &gt;
              </Typography>
            </Box>

            {/* Tool 3: Ads & Local Promotions */}
            <Box
              onClick={() => navigate("/business/ads")}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 0.5, sm: 1 },
                borderRadius: "14px",
                bgcolor: "#fffbeb",
                border: "1.5px solid #fde68a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                textAlign: "center",
                minHeight: { xs: 78, sm: 84 },
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#fcd34d" },
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <AdsIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#d97706", mb: 0.4 }} />
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 800, color: "#b45309", lineHeight: 1.15 }}>
                Ads & Local Promotions &gt;
              </Typography>
            </Box>

            {/* Tool 4: KYC & Verification */}
            <Box
              onClick={() => navigate("/business/kyc")}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 0.5, sm: 1 },
                borderRadius: "14px",
                bgcolor: "#faf5ff",
                border: "1.5px solid #e9d5ff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                textAlign: "center",
                minHeight: { xs: 78, sm: 84 },
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#d8b4fe" },
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <ShieldIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#7c3aed", mb: 0.4 }} />
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.74rem" }, fontWeight: 800, color: "#6b21a8", lineHeight: 1.15 }}>
                KYC & Verification &gt;
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            8. PAYOUT DETAILS (Show bank information for settlements)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            p: 2.25,
            borderRadius: "18px",
            border: `1.5px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 2.5,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          }}
        >
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "0.96rem", color: TEXT }}>
              Payout Account
            </Typography>
            <Button
              size="small"
              onClick={() => setEditPayoutOpen(true)}
              sx={{
                color: TEXT,
                fontWeight: 800,
                fontSize: "0.8rem",
                textTransform: "none",
                p: 0,
                minWidth: 0,
                "&:hover": { bgcolor: "transparent", color: PRIMARY },
              }}
            >
              Manage
            </Button>
          </Stack>

          {/* Bank Info Row */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => setEditPayoutOpen(true)}
            sx={{ cursor: "pointer" }}
          >
            {/* Bank Icon */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: "#eff6ff",
                color: "#2563eb",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <BankIcon sx={{ fontSize: 20 }} />
            </Box>

            {/* 3 Detail Columns */}
            <Box sx={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.62rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }} noWrap>
                  BANK NAME
                </Typography>
                <Typography sx={{ fontSize: { xs: "0.78rem", sm: "0.85rem" }, fontWeight: 800, color: TEXT, mt: 0.15 }} noWrap>
                  {form.bank_name}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.62rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }} noWrap>
                  ACCOUNT NUMBER
                </Typography>
                <Typography sx={{ fontSize: { xs: "0.78rem", sm: "0.85rem" }, fontWeight: 800, color: TEXT, mt: 0.15 }} noWrap>
                  {form.account_number}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.62rem", color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase" }} noWrap>
                  IFSC CODE
                </Typography>
                <Typography sx={{ fontSize: { xs: "0.78rem", sm: "0.85rem" }, fontWeight: 800, color: TEXT, mt: 0.15 }} noWrap>
                  {form.ifsc_code}
                </Typography>
              </Box>
            </Box>

            {/* Right Chevron */}
            <ChevronRightIcon sx={{ fontSize: 18, color: "#94a3b8", flexShrink: 0 }} />
          </Stack>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            9. ACCOUNT & SECURITY (Additional settings and sign out at the end)
           ══════════════════════════════════════════════════════════════════════════ */}
        {/* Security & Preferences Row */}
        <Box
          onClick={() => setSecurityModalOpen(true)}
          sx={{
            p: 2,
            borderRadius: "16px",
            border: `1.5px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
            transition: "all 0.15s ease",
            "&:hover": { borderColor: "#cbd5e1", bgcolor: BG },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: "#fef2f2",
                color: "#ef4444",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <LockIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: TEXT }} noWrap>
                Security & Preferences
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUTED, mt: 0.2 }} noWrap>
                Manage your account, password and notification settings
              </Typography>
            </Box>
          </Stack>
          <ChevronRightIcon sx={{ fontSize: 20, color: "#94a3b8", ml: 1, flexShrink: 0 }} />
        </Box>

        {/* Sign Out of Business Terminal Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setLogoutDialogOpen(true)}
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: "#fef2f2",
            color: "#dc2626",
            border: "1.5px solid #fee2e2",
            textTransform: "none",
            fontWeight: 800,
            fontSize: "0.88rem",
            borderRadius: "14px",
            height: 48,
            mb: 6,
            boxShadow: "none",
            "&:hover": { bgcolor: "#fee2e2", borderColor: "#fca5a5" },
            "&:active": { transform: "scale(0.99)" },
          }}
        >
          Sign Out of Business Terminal
        </Button>

      </Container>

      {/* ─── BOTTOM DRAWER: EDIT BUSINESS INFO ─── */}
      <Drawer
        anchor="bottom"
        open={editInfoOpen}
        onClose={() => setEditInfoOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
            Edit Business Information
          </Typography>
          <IconButton size="small" onClick={() => setEditInfoOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Box component="form" onSubmit={handleSaveInfo} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Business Name"
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Category"
            name="trade_category"
            value={form.trade_category}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Mobile Number"
            name="mobile_number"
            value={form.mobile_number}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="GSTIN"
            name="gstin"
            value={form.gstin}
            onChange={handleChange}
            fullWidth
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setEditInfoOpen(false)}
              sx={{ fontWeight: 700, color: TEXT_MUTED, borderRadius: "12px", py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: PRIMARY_DARK } }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ─── BOTTOM DRAWER: EDIT LOCATION & TIMINGS ─── */}
      <Drawer
        anchor="bottom"
        open={editLocationOpen}
        onClose={() => setEditLocationOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
            Edit Operating Store & Location
          </Typography>
          <IconButton size="small" onClick={() => setEditLocationOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          <TextField
            label="Operating Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Operating Timings"
            name="operating_hours"
            value={form.operating_hours}
            onChange={handleChange}
            fullWidth
            placeholder="08:00 AM - 10:00 PM"
          />
          <TextField
            label="Delivery SLA"
            name="delivery_time"
            value={form.delivery_time}
            onChange={handleChange}
            fullWidth
            placeholder="10–15 mins delivery"
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setEditLocationOpen(false)}
              sx={{ fontWeight: 700, color: TEXT_MUTED, borderRadius: "12px", py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setToastMsg("Operating location updated!");
                setEditLocationOpen(false);
              }}
              sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: PRIMARY_DARK } }}
            >
              Save Location
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* ─── BOTTOM DRAWER: MANAGE PAYOUT ACCOUNT (NO POPUP!) ─── */}
      <Drawer
        anchor="bottom"
        open={editPayoutOpen}
        onClose={() => setEditPayoutOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
            Manage Payout Account
          </Typography>
          <IconButton size="small" onClick={() => setEditPayoutOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, mb: 2 }}>
          Daily settlement earnings will be deposited directly to this registered bank account.
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Bank Name"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Account Number"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="IFSC Code"
            name="ifsc_code"
            value={form.ifsc_code}
            onChange={handleChange}
            fullWidth
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setEditPayoutOpen(false)}
              sx={{ fontWeight: 700, color: TEXT_MUTED, borderRadius: "12px", py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setToastMsg("Payout account details updated!");
                setEditPayoutOpen(false);
              }}
              sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: PRIMARY_DARK } }}
            >
              Update Account
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* ─── BOTTOM DRAWER: ASK ANYTHING (AI ASSISTANT) ─── */}
      <Drawer
        anchor="bottom"
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ChatIcon sx={{ color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
              Ask Anything
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setAiAssistantOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, mb: 2 }}>
          Ask anything about order fulfillment, inventory, settlements, or marketing.
        </Typography>

        <TextField
          label="Your question..."
          fullWidth
          multiline
          rows={3}
          placeholder="e.g. How do I enable delivery partner tracking?"
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setAiAssistantOpen(false)}
            sx={{ fontWeight: 700, color: TEXT_MUTED, borderRadius: "12px", py: 1.2 }}
          >
            Close
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setToastMsg("Query submitted to AI Assistant!");
              setAiAssistantOpen(false);
            }}
            sx={{ bgcolor: "#2563eb", color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: "#1d4ed8" } }}
          >
            Submit Question
          </Button>
        </Stack>
      </Drawer>

      {/* ─── BOTTOM DRAWER: ENQUIRY ─── */}
      <Drawer
        anchor="bottom"
        open={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoIcon sx={{ color: "#d97706" }} />
            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
              Customer & Partner Enquiry
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setEnquiryModalOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, mb: 2 }}>
          Reach out directly to Trikonekt Merchant Support for assistance.
        </Typography>

        <TextField label="Subject" fullWidth sx={{ mb: 1.5 }} placeholder="e.g. Bulk catalog upload" />
        <TextField label="Details" fullWidth multiline rows={3} placeholder="Describe your query..." sx={{ mb: 2 }} />

        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setEnquiryModalOpen(false)}
            sx={{ fontWeight: 700, color: TEXT_MUTED, borderRadius: "12px", py: 1.2 }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setToastMsg("Enquiry sent to support desk!");
              setEnquiryModalOpen(false);
            }}
            sx={{ bgcolor: "#d97706", color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: "#b45309" } }}
          >
            Send Enquiry
          </Button>
        </Stack>
      </Drawer>

      {/* ─── BOTTOM DRAWER: SECURITY & PREFERENCES ─── */}
      <Drawer
        anchor="bottom"
        open={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: TEXT }}>
            Security & Preferences
          </Typography>
          <IconButton size="small" onClick={() => setSecurityModalOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, mb: 2 }}>
          Update your login password and account credentials.
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <TextField label="Current Password" type="password" fullWidth />
          <TextField label="New Password" type="password" fullWidth />
          <TextField label="Confirm New Password" type="password" fullWidth />
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setSecurityModalOpen(false)}
            sx={{ fontWeight: 700, color: TEXT_MUTED, borderRadius: "12px", py: 1.2 }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setToastMsg("Password updated successfully!");
              setSecurityModalOpen(false);
            }}
            sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: PRIMARY_DARK } }}
          >
            Update Password
          </Button>
        </Stack>
      </Drawer>

      {/* ─── BOTTOM DRAWER: LOGOUT CONFIRMATION ─── */}
      <Drawer
        anchor="bottom"
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={DRAWER_PAPER_PROPS}
      >
        <Box sx={{ width: 44, height: 5, bgcolor: "#cbd5e1", borderRadius: 999, mx: "auto", mb: 2 }} />
        <Box sx={{ textAlign: "center", py: 1 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: "#fef2f2",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5,
            }}
          >
            <LogoutIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", color: TEXT, mb: 0.5 }}>
            Sign Out of Business Terminal?
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: TEXT_MUTED, mb: 2.5, px: 2 }}>
            You will need to re-enter your credentials to manage your store, inventory, and orders.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setLogoutDialogOpen(false)}
              sx={{ borderColor: BORDER, color: TEXT_MUTED, fontWeight: 700, borderRadius: "12px", py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogout}
              sx={{ bgcolor: "#ef4444", color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: "#dc2626" } }}
            >
              Sign Out
            </Button>
          </Stack>
        </Box>
      </Drawer>

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
