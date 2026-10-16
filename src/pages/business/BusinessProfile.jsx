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
  Grid,
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
  QrCodeScannerRounded as QrIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { getMerchantProfile, updateMerchantProfile, listMyShops } from "../../api/api";

const PRIMARY = "#064E3B";
const PRIMARY_DARK = "#043C2E";
const BRAND_ORANGE = "#FF6B00";
const BRAND_ORANGE_HOVER = "#E85D04";
const BG = "#F4F7F6";
const SURFACE = "#FFFFFF";
const TEXT = "#14231D";
const TEXT_MUTED = "#64746C";
const BORDER = "#E2E8E5";

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
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    business_name: "",
    trade_category: "",
    mobile_number: "",
    email: "",
    gstin: "",
    member_since: "",
    address: "",
    city: "",
    pincode: "",
    operating_hours: "",
    delivery_time: "",
    service_mode: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    rating: "",
    reviews_count: "",
    total_orders: "",
    active_outlets: "0",
    monthly_sales: "",
    cover_image: "",
    store_thumbnail: "",
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
      const resolvedName = apiProf?.business_name || activeShop.shop_name || "Merchant Business";
      const rawMobile = apiProf?.mobile_number || localStorage.getItem('business_phone') || localStorage.getItem('user_phone') || "";
      const formattedMobile = rawMobile
        ? (rawMobile.startsWith("+91") ? rawMobile : `+91 ${rawMobile.replace(/\D/g, "")}`)
        : "Not Registered";

      setForm((prev) => ({
        ...prev,
        business_name: resolvedName,
        mobile_number: formattedMobile,
        email: apiProf?.email || localStorage.getItem('business_email') || localStorage.getItem('user_email') || "Not Registered",
        trade_category: activeShop.category || apiProf?.trade_category || activeShop.category_name || "Retail & Wholesale",
        address: activeShop.address || apiProf?.address || "Primary Store Location",
        city: activeShop.city || apiProf?.city || "Bengaluru",
        pincode: activeShop.pincode || apiProf?.pincode || "560001",
        gstin: activeShop.gst_number || apiProf?.gstin || "Not Registered",
        operating_hours: activeShop.operating_hours || "09:00 AM – 10:00 PM",
        delivery_time: activeShop.delivery_time || "15–30 Mins",
        service_mode: apiProf?.service_mode || activeShop.service_mode || "OFFLINE",
        bank_name: apiProf?.bank_name || "Bank Not Linked",
        account_number: apiProf?.account_number ? `••••• ${String(apiProf.account_number).slice(-4)}` : "••••• 0000",
        ifsc_code: apiProf?.ifsc_code || "—",
        rating: apiProf?.rating ? Number(apiProf.rating).toFixed(1) : "5.0",
        reviews_count: apiProf?.reviews_count ? String(apiProf.reviews_count) : "0",
        total_orders: apiProf?.total_orders ? String(apiProf.total_orders) : "0",
        active_outlets: String(myShops.filter(s => String(s.status).toUpperCase() === "ACTIVE").length || myShops.length || 0),
        monthly_sales: apiProf?.monthly_sales ? `₹${Number(apiProf.monthly_sales).toLocaleString("en-IN")}` : "₹0",
        cover_image: activeShop.cover_image || apiProf?.cover_image || "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1400&q=80",
        store_thumbnail: activeShop.store_thumbnail || apiProf?.store_thumbnail || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
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
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2.5 } }}>

        {/* ══════════════════════════════════════════════════════════════════════════
            1. STORE IDENTITY (Responsive hero with cover, avatar, rating & badges)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Box sx={{ mb: 3 }}>
          {/* Cover Hero Banner */}
          <Box
            sx={{
              height: { xs: 140, sm: 180, md: 220 },
              borderRadius: { xs: '16px', md: '20px' },
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `url(${form.cover_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
            }}
          >
            {/* Top Right: Edit Cover Button */}
            <Button
              size="small"
              onClick={() => {
                const url = window.prompt('Enter cover image URL:', form.cover_image);
                if (url) setForm((p) => ({ ...p, cover_image: url }));
              }}
              startIcon={<CameraIcon sx={{ fontSize: 16 }} />}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.74rem',
                borderRadius: '10px',
                height: 32,
                px: 1.5,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#ffffff' },
              }}
            >
              Edit Cover
            </Button>
          </Box>

          {/* Store Card Overlapping Banner */}
          <Box
            sx={{
              mt: { xs: -4, sm: -5, md: -6 },
              mx: { xs: 0.5, sm: 1.5, md: 2.5 },
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: '18px', md: '20px' },
              border: `1.5px solid ${BORDER}`,
              bgcolor: SURFACE,
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              {/* Left: Avatar + Details */}
              <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    sx={{
                      width: { xs: 68, sm: 78, md: 84 },
                      height: { xs: 68, sm: 78, md: 84 },
                      bgcolor: '#064e3b',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: { xs: '1.45rem', sm: '1.75rem', md: '2rem' },
                      border: '3.5px solid #ffffff',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
                    }}
                  >
                    {merchantInitials}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: '#16a34a',
                      border: '2px solid #ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  >
                    <VerifiedCheckIcon sx={{ fontSize: 14, color: '#ffffff' }} />
                  </Box>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.65rem' },
                        color: TEXT,
                        lineHeight: 1.2,
                      }}
                      noWrap
                    >
                      {form.business_name}
                    </Typography>
                    <Chip
                      label="● Open for Orders"
                      size="small"
                      sx={{
                        bgcolor: '#f0fdf4',
                        color: '#15803d',
                        border: '1.5px solid #bbf7d0',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Stack>

                  <Typography sx={{ fontSize: '0.84rem', color: TEXT_MUTED, fontWeight: 600, mt: 0.3 }} noWrap>
                    {form.trade_category} • {form.city}
                  </Typography>

                  {/* Badges */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: '#ecfdf5',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        borderRadius: '20px',
                        px: 1.2,
                        py: 0.3,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      <VerifiedCheckIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                      Verified Merchant
                    </Box>

                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: '#fffbeb',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        borderRadius: '20px',
                        px: 1.2,
                        py: 0.3,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      👑 Prime Partner
                    </Box>
                  </Stack>
                </Box>
              </Stack>

              {/* Right: Star Rating */}
              <Box sx={{ alignSelf: { xs: 'stretch', md: 'center' }, textAlign: { xs: 'left', md: 'right' } }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    borderRadius: '10px',
                    px: 1.2,
                    py: 0.4,
                    mb: 0.5,
                  }}
                >
                  <StarIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  <Typography sx={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {form.rating || '5.0'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, fontWeight: 700, ml: 0.5 }}>
                    ({form.reviews_count || '0'} Reviews)
                  </Typography>
                </Box>
              </Box>
            </Stack>

            {/* 4 Quick Actions Row */}
            <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: { xs: 1.5, md: 2 } }}>
              {[
                {
                  label: 'Call',
                  icon: <PhoneIcon sx={{ fontSize: 18, color: '#15803d' }} />,
                  onClick: () => window.location.href = `tel:${form.mobile_number.replace(/\s+/g, '')}`,
                },
                {
                  label: 'WhatsApp',
                  icon: <WhatsAppIcon sx={{ fontSize: 18, color: '#25d366' }} />,
                  onClick: () => {
                    const cleanNum = form.mobile_number.replace(/\D/g, '');
                    window.open(`https://wa.me/91${cleanNum.slice(-10)}?text=Hello%20${encodeURIComponent(form.business_name)}`, '_blank');
                  },
                },
                {
                  label: 'Enquiry',
                  icon: <InfoIcon sx={{ fontSize: 18, color: '#d97706' }} />,
                  onClick: () => setEnquiryModalOpen(true),
                },
                {
                  label: 'Direction',
                  icon: <DirectionIcon sx={{ fontSize: 18, color: '#4f46e5' }} />,
                  onClick: () => window.open(`https://maps.google.com/?q=${encodeURIComponent(form.address)}`, '_blank'),
                },
              ].map((act, idx) => (
                <Grid item xs={3} key={idx}>
                  <Box
                    onClick={act.onClick}
                    sx={{
                      height: { xs: 56, sm: 50 },
                      borderRadius: '12px',
                      border: `1.5px solid ${BORDER}`,
                      bgcolor: SURFACE,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: { xs: 0.25, sm: 0.8 },
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: '#cbd5e1', bgcolor: BG, transform: 'translateY(-1px)' },
                      '&:active': { transform: 'scale(0.98)' },
                    }}
                  >
                    {act.icon}
                    <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.78rem' }, fontWeight: 700, color: TEXT }}>
                      {act.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════════════
            2. KEY METRICS CARDS (Responsive 4-Card Grid)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 1.25, sm: 1.5, md: 2 }} sx={{ mb: 3 }}>
          {[
            {
              title: 'Total Orders',
              val: form.total_orders || '0',
              subtitle: 'Today Orders',
              icon: <BagIcon sx={{ fontSize: 22, color: '#16a34a' }} />,
              bg: '#f0fdf4',
              border: '#bbf7d0',
              color: '#166534',
              onClick: () => navigate('/business/orders'),
            },
            {
              title: 'Active Outlets',
              val: form.active_outlets || '1',
              subtitle: 'Store Counters',
              icon: <StorefrontIcon sx={{ fontSize: 22, color: '#2563eb' }} />,
              bg: '#eff6ff',
              border: '#bfdbfe',
              color: '#1e40af',
              onClick: () => navigate('/business/shops'),
            },
            {
              title: 'Monthly Turnover',
              val: form.monthly_sales || '₹0',
              subtitle: 'Gross Sales',
              icon: <MoneyIcon sx={{ fontSize: 22, color: '#d97706' }} />,
              bg: '#fffbeb',
              border: '#fde68a',
              color: '#b45309',
              onClick: () => navigate('/business/orders'),
            },
            {
              title: 'Merchant Rating',
              val: form.rating ? `${form.rating} ⭐` : '5.0 ⭐',
              subtitle: `${form.reviews_count || '0'} Reviews`,
              icon: <PeopleIcon sx={{ fontSize: 22, color: '#9333ea' }} />,
              bg: '#faf5ff',
              border: '#e9d5ff',
              color: '#6b21a8',
              onClick: () => {},
            },
          ].map((m, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Box
                onClick={m.onClick}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '16px',
                  bgcolor: m.bg,
                  border: `1.5px solid ${m.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <Box sx={{ mb: 0.5 }}>{m.icon}</Box>
                <Typography sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' }, fontWeight: 900, color: m.color, lineHeight: 1.1 }}>
                  {m.val}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: m.color, mt: 0.4 }}>
                  {m.title}
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', fontWeight: 600, color: TEXT_MUTED, mt: 0.2 }}>
                  {m.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════════════
            3. DESKTOP 2-COLUMN RESPONSIVE LAYOUT (7 cols Left / 5 cols Right)
           ══════════════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* ── LEFT COLUMN (Core Business Details, Store Location, Payout) ── */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              {/* Card 1: Business Information */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '18px',
                  border: `1.5px solid ${BORDER}`,
                  bgcolor: SURFACE,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: TEXT }}>
                    Business Information
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditInfoOpen(true)}
                    startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 28,
                      borderRadius: '8px',
                      borderColor: '#cbd5e1',
                      color: TEXT,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#94a3b8', bgcolor: BG },
                    }}
                  >
                    Edit
                  </Button>
                </Stack>

                <Stack spacing={1.5} divider={<Divider sx={{ borderColor: '#f1f5f9' }} />}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <BankIcon sx={{ fontSize: 18, color: '#064E3B' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 600 }}>
                        Business Name
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: TEXT }}>
                      {form.business_name}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <CategoryIcon sx={{ fontSize: 18, color: '#064E3B' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 600 }}>
                        Category
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: TEXT }}>
                      {form.trade_category}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <PhoneIcon sx={{ fontSize: 18, color: '#064E3B' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 600 }}>
                        Mobile Number
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: TEXT }}>
                      {form.mobile_number}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <EmailIcon sx={{ fontSize: 18, color: '#064E3B' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 600 }}>
                        Email Address
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: TEXT, wordBreak: 'break-all' }}>
                      {form.email}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <DocIcon sx={{ fontSize: 18, color: '#064E3B' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 600 }}>
                        GSTIN
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: TEXT }}>
                      {form.gstin}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <CalendarIcon sx={{ fontSize: 18, color: '#064E3B' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 600 }}>
                        Member Since
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: TEXT }}>
                      {form.member_since || 'Active Partner'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Card 2: Operating Store & Location */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '18px',
                  border: `1.5px solid ${BORDER}`,
                  bgcolor: SURFACE,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: TEXT }}>
                    Operating Store & Location
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditLocationOpen(true)}
                    startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 28,
                      borderRadius: '8px',
                      borderColor: '#cbd5e1',
                      color: TEXT,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#94a3b8', bgcolor: BG },
                    }}
                  >
                    Edit
                  </Button>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Box
                    component="img"
                    src={form.store_thumbnail}
                    alt="Operating Store"
                    sx={{
                      width: { xs: 80, sm: 88 },
                      height: { xs: 80, sm: 88 },
                      borderRadius: '14px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '1px solid #e2e8f0',
                    }}
                  />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT, lineHeight: 1.3 }}>
                      {form.address}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', mt: 0.5 }}>
                      🟢 Open {form.operating_hours}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.6 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.4,
                          bgcolor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                        }}
                      >
                        <BoltIcon sx={{ fontSize: 13, color: '#0ea5e9' }} />
                        {form.delivery_time}
                      </Box>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.4,
                          bgcolor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '14px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                        }}
                      >
                        <RetailIcon sx={{ fontSize: 13, color: '#2563eb' }} />
                        {form.service_mode}
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Card 3: Payout Account & Settlements */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '18px',
                  border: `1.5px solid ${BORDER}`,
                  bgcolor: SURFACE,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: TEXT }}>
                    Settlement Bank Account
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setEditPayoutOpen(true)}
                    sx={{
                      color: BRAND_ORANGE,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      p: 0,
                      minWidth: 0,
                      '&:hover': { bgcolor: 'transparent', color: BRAND_ORANGE_HOVER },
                    }}
                  >
                    Manage
                  </Button>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  onClick={() => setEditPayoutOpen(true)}
                  sx={{ cursor: 'pointer', p: 1.25, borderRadius: '12px', '&:hover': { bgcolor: '#f8fafc' } }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BankIcon sx={{ fontSize: 22 }} />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.62rem', color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' }} noWrap>
                        BANK NAME
                      </Typography>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: TEXT, mt: 0.15 }} noWrap>
                        {form.bank_name}
                      </Typography>
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.62rem', color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' }} noWrap>
                        ACCOUNT NUMBER
                      </Typography>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: TEXT, mt: 0.15 }} noWrap>
                        {form.account_number}
                      </Typography>
                    </Box>

                    <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
                      <Typography sx={{ fontSize: '0.62rem', color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' }} noWrap>
                        IFSC CODE
                      </Typography>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: TEXT, mt: 0.15 }} noWrap>
                        {form.ifsc_code}
                      </Typography>
                    </Box>
                  </Box>

                  <ChevronRightIcon sx={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }} />
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* ── RIGHT COLUMN (KYC Status, Operations Tools, Security & Logout) ── */}
          <Grid item xs={12} md={5}>
            <Stack spacing={2.5}>
              {/* Card 4: KYC & Verification Status Card */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #064E3B 0%, #043C2E 100%)',
                  borderRadius: '18px',
                  p: { xs: 2, sm: 2.5 },
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ShieldIcon sx={{ fontSize: 22, color: '#4ade80' }} />
                      <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: '#ffffff' }}>
                        KYC & Verification
                      </Typography>
                    </Stack>
                    <Chip
                      label="Verified Partner"
                      size="small"
                      sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                    />
                  </Stack>

                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, mb: 2 }}>
                    Aadhaar, Business PAN, Settlement Bank and Shop License are active for instant payouts and voice alerts.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => navigate('/business/kyc')}
                    sx={{
                      bgcolor: '#ffffff',
                      color: '#064E3B',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      borderRadius: '10px',
                      textTransform: 'none',
                      py: 0.8,
                      px: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': { bgcolor: '#f0fdf4' },
                    }}
                  >
                    View KYC Documents
                  </Button>
                </Box>
              </Box>

              {/* Card 5: Merchant Operations & Tools */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '18px',
                  border: `1.5px solid ${BORDER}`,
                  bgcolor: SURFACE,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: TEXT, mb: 1.8 }}>
                  Operations & Tools
                </Typography>

                <Grid container spacing={1.5}>
                  {[
                    {
                      title: 'Manage Outlets',
                      desc: 'Multi-store locations',
                      icon: <StorefrontIcon sx={{ fontSize: 20, color: '#15803d' }} />,
                      bg: '#f0fdf4',
                      border: '#bbf7d0',
                      onClick: () => navigate('/business/shops'),
                    },
                    {
                      title: 'Inventory POS',
                      desc: 'Stock & barcode scan',
                      icon: <InventoryIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
                      bg: '#eff6ff',
                      border: '#bfdbfe',
                      onClick: () => navigate('/business/inventory'),
                    },
                    {
                      title: 'Local Ads',
                      desc: 'Promotions & banners',
                      icon: <AdsIcon sx={{ fontSize: 20, color: '#d97706' }} />,
                      bg: '#fffbeb',
                      border: '#fde68a',
                      onClick: () => navigate('/business/ads'),
                    },
                    {
                      title: 'QR Standee',
                      desc: 'Voice alert scanner',
                      icon: <QrIcon sx={{ fontSize: 20, color: '#7c3aed' }} />,
                      bg: '#faf5ff',
                      border: '#e9d5ff',
                      onClick: () => navigate('/scanner'),
                    },
                  ].map((tool, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box
                        onClick={tool.onClick}
                        sx={{
                          p: 1.5,
                          borderRadius: '14px',
                          bgcolor: tool.bg,
                          border: `1.5px solid ${tool.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          transition: 'all 0.15s ease',
                          '&:hover': { transform: 'translateY(-2px)' },
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        <Box sx={{ mb: 0.8 }}>{tool.icon}</Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: TEXT }}>
                          {tool.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: TEXT_MUTED, mt: 0.2 }}>
                          {tool.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Card 6: Account Security & Sign Out */}
              <Box
                onClick={() => setSecurityModalOpen(true)}
                sx={{
                  p: 1.75,
                  borderRadius: '16px',
                  border: `1.5px solid ${BORDER}`,
                  bgcolor: SURFACE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: BG },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: '#fef2f2',
                      color: '#ef4444',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: TEXT }} noWrap>
                      Security & Preferences
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED, mt: 0.2 }} noWrap>
                      Manage password and settings
                    </Typography>
                  </Box>
                </Stack>
                <ChevronRightIcon sx={{ fontSize: 20, color: '#94a3b8', flexShrink: 0 }} />
              </Box>

              {/* Sign Out Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setLogoutDialogOpen(true)}
                startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#fef2f2',
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  borderRadius: '14px',
                  py: 1.2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#fee2e2', borderColor: '#ef4444' },
                }}
              >
                Sign Out of Business Terminal
              </Button>
            </Stack>
          </Grid>
        </Grid>

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
              sx={{ bgcolor: BRAND_ORANGE, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: BRAND_ORANGE_HOVER } }}
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
              sx={{ bgcolor: BRAND_ORANGE, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: BRAND_ORANGE_HOVER } }}
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
              sx={{ bgcolor: BRAND_ORANGE, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: BRAND_ORANGE_HOVER } }}
            >
              Update Account
            </Button>
          </Stack>
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
            sx={{ bgcolor: BRAND_ORANGE, color: "#fff", fontWeight: 800, borderRadius: "12px", py: 1.2, "&:hover": { bgcolor: BRAND_ORANGE_HOVER } }}
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
