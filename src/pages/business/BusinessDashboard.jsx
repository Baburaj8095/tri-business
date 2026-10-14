import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Avatar,
  Container,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getMerchantProfile,
  listMyShops,
  listMyPromoPurchases,
} from "../../api/api";
import AppShell from "../../components/layout/AppShell";
import { T, cardHoverSx } from "../../theme/tokens";
import {
  StoreRounded as ShopsIcon,
  ReceiptLongRounded as OrdersIcon,
  TrendingUpRounded as SalesIcon,
  StarRounded as StarIcon,
  Inventory2Rounded as InventoryIcon,
  StorefrontRounded as StorefrontIcon,
  CampaignRounded as AdsIcon,
  AccountBalanceWalletRounded as WalletIcon,
  AddRounded as AddIcon,
  ArrowOutwardRounded as ArrowOutwardIcon,
  LocalShippingOutlined as DeliveryIcon,
  ChevronRightRounded as ChevronRightIcon,
  VerifiedUserRounded as VerifiedIcon,
  WarningAmberRounded as WarningIcon,
  WorkspacePremiumRounded as PrimeIcon,
  LocalOfferRounded as TagIcon,
  PrecisionManufacturingRounded as FactoryIcon,
  ShieldRounded as ShieldIcon,
  LightbulbRounded as LightbulbIcon,
  TrendingUpRounded as TrendIcon,
} from "@mui/icons-material";

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [hasPrime750, setHasPrime750] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [totalSalesAmount, setTotalSalesAmount] = useState(null);
  const [kycStatus, setKycStatus] = useState("NOT_STARTED");
  const [loading, setLoading] = useState(true);
  const [b2bAds, setB2bAds] = useState([]);
  const [bgTheme, setBgTheme] = useState(() => localStorage.getItem('tri_home_bg_theme') || 'warm-ivory');

  const handleSelectTheme = (themeKey) => {
    localStorage.setItem('tri_home_bg_theme', themeKey);
    setBgTheme(themeKey);
    window.dispatchEvent(new Event('tri_theme_change'));
  };

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token_business") ||
                  localStorage.getItem("token_captain") ||
                  localStorage.getItem("captain_token");

    const apiBase = process.env.REACT_APP_CAPTAIN_API_URL || "https://api-captain.trikonektbusiness.com/api";
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [prof, myShops, promo, offlinePayments, kycRes] = await Promise.all([
          getMerchantProfile().catch(() => null),
          listMyShops().catch(() => []),
          listMyPromoPurchases({}).catch(() => []),
          token ? axios.get(`${apiBase}/captain/offline-payments/merchant`, { headers }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          token ? axios.get(`${apiBase}/captain/merchant/kyc/status`, { headers }).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
        ]);

        if (cancelled) return;

        if (prof) setProfile(prof);

        const shopList = Array.isArray(myShops) ? myShops : myShops?.results || [];
        setShops(shopList);

        const promoRows = Array.isArray(promo) ? promo : promo?.results || [];
        const isPrime = promoRows.some((row) => {
          const st = String(row?.status || "").toUpperCase();
          if (st !== "APPROVED") return false;
          const pkg = row?.package || {};
          return Number(pkg?.price) >= 700;
        });
        setHasPrime750(isPrime);

        const paymentsList = Array.isArray(offlinePayments.data) ? offlinePayments.data : [];
        const pendingList = paymentsList.filter(p => p.status === "PENDING");
        setPendingPaymentsCount(pendingList.length);

        // Calculate total sales from approved offline transactions if available
        const approvedSales = paymentsList
          .filter(p => p.status === "APPROVED" || p.status === "COMPLETED")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setTotalSalesAmount(approvedSales);

        if (kycRes.data?.kycStatus) {
          setKycStatus(kycRes.data.kycStatus);
        }

        // Fetch B2B Banners
        const [onlineAds, offlineAds] = await Promise.all([
          axios.get(`${apiBase}/api/ads/banners?target=BUSINESS_ONLINE_B2B`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${apiBase}/api/ads/banners?target=BUSINESS_OFFLINE_B2B`, { headers }).catch(() => ({ data: [] }))
        ]);
        const combinedAds = [...(onlineAds.data || []), ...(offlineAds.data || [])];
        setB2bAds(combinedAds);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();
    return () => { cancelled = true; };
  }, []);

  const verified = Boolean(profile?.is_verified);
  const activeShopsCount = useMemo(() => shops.filter((s) => s.status === "ACTIVE").length, [shops]);
  const walletBalance = Number(profile?.wallet_balance || 0);
  const ratingValue = profile?.rating ? Number(profile.rating).toFixed(1) : null;

  return (
    <AppShell activeTab="/business-dashboard" title="Merchant Dashboard">
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>

        {/* 0. BACKGROUND THEME VARIATIONS (Matching Mockup Top-Right) */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Theme Variation
          </Typography>
          <Stack direction="row" spacing={0.75}>
            {[
              { id: 'warm-ivory', label: '🌾 Warm Ivory (Default)' },
              { id: 'soft-gradient', label: '🎨 Soft Gradient' },
              { id: 'pattern', label: '📐 Pattern' },
            ].map((thm) => (
              <Chip
                key={thm.id}
                label={thm.label}
                size="small"
                clickable
                onClick={() => handleSelectTheme(thm.id)}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 24,
                  bgcolor: bgTheme === thm.id ? T.primary : '#FFFFFF',
                  color: bgTheme === thm.id ? '#FFFFFF' : T.textSecondary,
                  border: `1.5px solid ${bgTheme === thm.id ? T.primary : T.border}`,
                  boxShadow: bgTheme === thm.id ? '0 2px 6px rgba(255,101,8,0.25)' : 'none',
                  '&:hover': { bgcolor: bgTheme === thm.id ? T.primaryDark : '#F8FAFC' },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* 1. HERO PROMOTIONAL BANNER CAROUSEL (Top of Screen 1) */}
        <Box sx={{ mb: 3 }}>
          <Card
            sx={{
              borderRadius: "22px",
              background: "url('/assets/banners/prime-promotion-background.svg') center / cover no-repeat, linear-gradient(135deg, #FF7A1A 0%, #E94D00 100%)",
              color: "#ffffff",
              p: { xs: 2.5, sm: 3 },
              boxShadow: "0 8px 24px rgba(255, 101, 8, 0.28)",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box sx={{ flex: 1, zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    icon={<PrimeIcon sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                    label="TRIKONEKT PRIME"
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.22)",
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: "0.65rem",
                      height: 22,
                      letterSpacing: "0.5px",
                    }}
                  />
                  <Chip
                    label="UP TO 30% MORE SALES"
                    size="small"
                    sx={{
                      bgcolor: "#FFFFFF",
                      color: "#E94D00",
                      fontWeight: 900,
                      fontSize: "0.62rem",
                      height: 20,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    }}
                  />
                </Stack>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.15rem", sm: "1.45rem" }, lineHeight: 1.25, mb: 0.75, letterSpacing: "-0.02em" }}>
                  Grow Your Business With Trikonekt Prime
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.92)", mb: 2, maxWidth: 440, lineHeight: 1.4 }}>
                  Get verified, unlock wholesale prices, run special deals and reach more customers.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate("/business/packages")}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#E94D00",
                    fontWeight: 900,
                    fontSize: "0.8rem",
                    borderRadius: "24px",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.75,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
                    "&:hover": { bgcolor: "#FFF7ED" },
                  }}
                >
                  Upgrade to Prime →
                </Button>
              </Box>

              {/* Basket Illustration */}
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: { sm: 140, md: 170 },
                  height: { sm: 120, md: 140 },
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  component="img"
                  src="/assets/illustrations/groceries_basket.png"
                  alt="Prime Groceries"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
                  }}
                />
              </Box>
            </Stack>

            {/* Carousel Dots Indicator */}
            <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 2 }}>
              <Box sx={{ width: 16, height: 4, borderRadius: 2, bgcolor: "#FFFFFF" }} />
              <Box sx={{ width: 6, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.4)" }} />
              <Box sx={{ width: 6, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.4)" }} />
              <Box sx={{ width: 6, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.4)" }} />
            </Stack>
          </Card>
        </Box>

        {/* 2. BUSINESS OVERVIEW (4 KPI Cards from Screen 1) */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, px: 0.5 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Business Overview
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: T.textSecondary, fontWeight: 600 }}>
              Today, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
          </Stack>

          <Grid container spacing={1.5}>
            {/* KPI 1: Active Shops */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/shops")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 2,
                  borderRadius: "20px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    Active Shops
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#FFF3E8", color: "#FF6508", display: "grid", placeItems: "center" }}>
                    <ShopsIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
                  {loading ? <Skeleton width={36} /> : activeShopsCount}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: 0.5, fontWeight: 500 }}>
                  {shops.length > activeShopsCount ? `${shops.length - activeShopsCount} in review` : "All outlets live"}
                </Typography>
              </Card>
            </Grid>

            {/* KPI 2: New Orders */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/orders")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 2,
                  borderRadius: "20px",
                  border: `1.5px solid ${pendingPaymentsCount > 0 ? "#FED7AA" : T.border}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    New Orders
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#EFF6FF", color: "#3678E5", display: "grid", placeItems: "center" }}>
                    <OrdersIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: pendingPaymentsCount > 0 ? "#FF6508" : T.text, lineHeight: 1.1 }}>
                  {loading ? <Skeleton width={36} /> : pendingPaymentsCount}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: pendingPaymentsCount > 0 ? "#FF6508" : T.textMuted, fontWeight: pendingPaymentsCount > 0 ? 800 : 500, mt: 0.5 }}>
                  {pendingPaymentsCount > 0 ? "Awaiting action" : "Up to date"}
                </Typography>
              </Card>
            </Grid>

            {/* KPI 3: Wallet Balance */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/profile")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 2,
                  borderRadius: "20px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    Wallet Balance
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#ECFDF5", color: "#159A65", display: "grid", placeItems: "center" }}>
                    <WalletIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: T.text, lineHeight: 1.1 }} noWrap>
                  {loading ? <Skeleton width={60} /> : `₹${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: 0.5, fontWeight: 500 }}>
                  Instant payout
                </Typography>
              </Card>
            </Grid>

            {/* KPI 4: Rating */}
            <Grid item xs={6} sm={3}>
              <Card
                sx={{
                  ...cardHoverSx,
                  p: 2,
                  borderRadius: "20px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    Rating
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#FEFCE8", color: "#F2A900", display: "grid", placeItems: "center" }}>
                    <StarIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
                  {loading ? <Skeleton width={36} /> : ratingValue ? `${ratingValue} ★` : "4.8 ★"}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: 0.5, fontWeight: 500 }}>
                  Verified merchant
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 3. QUICK BUSINESS ACTIONS (Screen 1 with View All) */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, px: 0.5 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Quick Business Actions
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/business/shops")}
              sx={{ color: T.primary, fontWeight: 800, fontSize: "0.75rem", textTransform: "none", p: 0 }}
            >
              View All →
            </Button>
          </Stack>

          <Grid container spacing={1.5}>
            {[
              {
                title: "My Shops",
                desc: "Manage branches",
                path: "/business/shops",
                icon: <ShopsIcon sx={{ fontSize: 24 }} />,
                iconColor: "#FF6508",
                iconBg: "#FFF3E8",
              },
              {
                title: "Inventory",
                desc: "Stock & Barcode",
                path: "/business/inventory",
                icon: <InventoryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#3678E5",
                iconBg: "#EFF6FF",
              },
              {
                title: "Online Products",
                desc: "Manage listings",
                path: "/business/online-products",
                icon: <DeliveryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#8758E8",
                iconBg: "#F5F3FF",
              },
              {
                title: "Ads & Campaigns",
                desc: "Boost sales",
                path: "/business/ads",
                icon: <AdsIcon sx={{ fontSize: 24 }} />,
                iconColor: "#FF6508",
                iconBg: "#FFF3E8",
              },
              {
                title: "Direct Factory",
                desc: "Restock B2B",
                badge: "NEW",
                path: "/business/online-marketplace",
                icon: <FactoryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#FF6508",
                iconBg: "#FFF3E8",
              },
              {
                title: "Special Deals",
                desc: "Run offers",
                path: "/business/packages",
                icon: <TagIcon sx={{ fontSize: 24 }} />,
                iconColor: "#E5484D",
                iconBg: "#FEF2F2",
              },
            ].map((action) => (
              <Grid item xs={4} sm={2} key={action.title}>
                <Card
                  onClick={() => navigate(action.path)}
                  sx={{
                    ...cardHoverSx,
                    cursor: "pointer",
                    p: 1.5,
                    borderRadius: "20px",
                    border: `1.5px solid ${T.border}`,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  {action.badge && (
                    <Chip
                      label={action.badge}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "#FF6508",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: "0.58rem",
                        height: 16,
                        px: 0.2,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      bgcolor: action.iconBg,
                      color: action.iconColor,
                      display: "grid",
                      placeItems: "center",
                      mb: 1,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: T.text, mb: 0.25 }} noWrap>
                    {action.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: T.textSecondary, lineHeight: 1.2 }} noWrap>
                    {action.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 4. COMPLETE KYC VERIFICATION BANNER */}
        <Card
          onClick={() => navigate("/business/kyc")}
          sx={{
            mb: 3,
            borderRadius: "20px",
            border: `1.5px solid #FED7AA`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
            cursor: "pointer",
            p: { xs: 2, sm: 2.25 },
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.75} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#FF6508",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(255, 101, 8, 0.25)",
                }}
              >
                <ShieldIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: T.text, mb: 0.25 }}>
                  Complete KYC Verification
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: T.textSecondary, lineHeight: 1.35 }}>
                  Upload PAN & business registration to enable payouts and full store visibility.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/business/kyc");
              }}
              sx={{
                bgcolor: "#FF6508",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.78rem",
                borderRadius: "20px",
                textTransform: "none",
                px: 2.5,
                py: 0.75,
                whiteSpace: "nowrap",
                alignSelf: { xs: "stretch", sm: "auto" },
                boxShadow: "0 4px 12px rgba(255, 101, 8, 0.25)",
                "&:hover": { bgcolor: "#E9570A" },
              }}
            >
              Verify Now →
            </Button>
          </Stack>
        </Card>

        {/* 5. TRENDING IN WHOLESALE */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, px: 0.5 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Trending in Wholesale
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/business/online-marketplace")}
              sx={{ color: T.primary, fontWeight: 800, fontSize: "0.75rem", textTransform: "none", p: 0 }}
            >
              View All →
            </Button>
          </Stack>

          <Grid container spacing={1.5}>
            {[
              { title: "Fruits & Vegetables", tag: "Fresh Wholesale", icon: "🥦" },
              { title: "Dairy & Milk", tag: "Daily Supplies", icon: "🥛" },
              { title: "Atta, Rice & Dal", tag: "Bulk Staples", icon: "🌾" },
              { title: "Snacks & Drinks", tag: "Packaged FMCG", icon: "🥤" },
            ].map((cat) => (
              <Grid item xs={6} sm={3} key={cat.title}>
                <Card
                  onClick={() => navigate("/business/online-marketplace")}
                  sx={{
                    ...cardHoverSx,
                    cursor: "pointer",
                    p: 2,
                    borderRadius: "20px",
                    border: `1.5px solid ${T.border}`,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontSize: 32, mb: 1 }}>{cat.icon}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: T.text, mb: 0.25 }}>
                    {cat.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, fontWeight: 500 }}>
                    {cat.tag}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 6. TODAY'S INSIGHTS */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.5, px: 0.5 }}>
            Today's Insights
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: "20px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#ECFDF5", color: "#159A65", display: "grid", placeItems: "center" }}>
                    <TrendIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: T.textMuted, fontWeight: 600 }}>Top Performing Category</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: T.text }}>Fruits & Vegetables</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#159A65", fontWeight: 800 }}>+24% sales growth</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                onClick={() => navigate("/business/packages")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 2,
                  borderRadius: "20px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#FEFCE8", color: "#F2A900", display: "grid", placeItems: "center" }}>
                    <LightbulbIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.72rem", color: T.textMuted, fontWeight: 600 }}>Suggested for You</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: T.text }}>Run a Fresh Vegetables Deal</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: T.primary, fontWeight: 800 }}>Get 2x more orders this week →</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 7. MERCHANT BALANCE & INSTANT PAYOUTS CARD */}
        <Card
          sx={{
            mb: 3,
            borderRadius: "22px",
            bgcolor: "#FFFFFF",
            border: `1.5px solid ${T.border}`,
            boxShadow: "0 4px 16px rgba(23, 32, 51, 0.055), 0 1px 3px rgba(23, 32, 51, 0.04)",
            p: { xs: 2.25, sm: 2.75 },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  bgcolor: T.primaryLight,
                  color: T.primary,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <WalletIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Merchant Balance
              </Typography>
            </Stack>
            <Chip
              label="⚡ Instant Payouts"
              size="small"
              sx={{
                bgcolor: T.primaryLight,
                color: T.primary,
                fontWeight: 800,
                fontSize: "0.7rem",
                height: 24,
                border: `1px solid ${T.primaryLight}`,
              }}
            />
          </Stack>

          <Typography sx={{ fontSize: { xs: "1.9rem", sm: "2.4rem" }, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", my: 1 }}>
            {loading ? (
              <Skeleton width={180} height={48} />
            ) : (
              `₹${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </Typography>

          <Typography sx={{ fontSize: "0.76rem", color: T.textMuted, mb: 2 }}>
            Settled into your primary bank account daily. No hidden platform deductions.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => navigate("/business/profile")}
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: 1,
                height: 42,
                bgcolor: T.primary,
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(255, 101, 8, 0.25)",
                "&:hover": { bgcolor: T.primaryDark },
              }}
            >
              + Add Funds
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/business/profile")}
              startIcon={<ArrowOutwardIcon sx={{ fontSize: 17 }} />}
              sx={{
                flex: 1,
                height: 42,
                borderColor: T.border,
                bgcolor: "#FFFFFF",
                color: T.text,
                fontSize: "0.85rem",
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "20px",
                "&:hover": { borderColor: T.textSecondary, bgcolor: "#F8FAFC" },
              }}
            >
              Withdraw
            </Button>
          </Stack>
        </Card>

        {/* 8. DIRECT FACTORY RESTOCK BANNER */}
        <Card
          onClick={() => navigate("/business/online-marketplace")}
          sx={{
            mb: 2.5,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
            border: "1.5px solid #FED7AA",
            cursor: "pointer",
            p: 2,
            transition: "all 0.15s ease",
            "&:hover": { boxShadow: T.shadowMd, transform: "translateY(-1px)" },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#FF6508",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(255,101,8,0.25)",
                }}
              >
                <FactoryIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: T.text }}>
                    Direct Factory Restock
                  </Typography>
                  <Chip label="NEW" size="small" sx={{ bgcolor: "#FF6508", color: "#fff", fontWeight: 900, fontSize: "0.6rem", height: 18 }} />
                </Stack>
                <Typography sx={{ fontSize: "0.76rem", color: T.textSecondary }}>
                  Verified B2B wholesale prices, GST invoices & bulk dispatch
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
              sx={{ color: T.primary, fontWeight: 900, fontSize: "0.8rem", textTransform: "none", whiteSpace: "nowrap" }}
            >
              Order Wholesale →
            </Button>
          </Stack>
        </Card>

        {/* 9. SPECIAL DEALS FOR YOU BANNER (Vector Banner Asset) */}
        <Card
          onClick={() => navigate("/business/packages")}
          sx={{
            mb: 2.5,
            borderRadius: "20px",
            background: "url('/assets/banners/special-deals-background.svg') center / cover no-repeat, linear-gradient(135deg, #F2E9FF 0%, #E5F1FF 100%)",
            border: "1.5px solid #D8B4FE",
            cursor: "pointer",
            p: 2.25,
            transition: "all 0.15s ease",
            "&:hover": { boxShadow: T.shadowMd, transform: "translateY(-1px)" },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#8758E8",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(135,88,232,0.25)",
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: 20 }}>%</Typography>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: T.text }}>
                    Special Deals for You
                  </Typography>
                  <Chip label="20% OFF" size="small" sx={{ bgcolor: "#E5484D", color: "#fff", fontWeight: 900, fontSize: "0.6rem", height: 18 }} />
                </Stack>
                <Typography sx={{ fontSize: "0.76rem", color: T.textSecondary }}>
                  Run limited time offers and get more orders
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
              sx={{ color: "#8758E8", fontWeight: 900, fontSize: "0.8rem", textTransform: "none", whiteSpace: "nowrap" }}
            >
              Create a Deal →
            </Button>
          </Stack>
        </Card>

        {/* 10. BOOST YOUR STORE WITH ADS BANNER (Vector Banner Asset) */}
        <Card
          onClick={() => navigate("/business/ads")}
          sx={{
            mb: 3,
            borderRadius: "20px",
            background: "url('/assets/banners/ads-campaign-background.svg') center / cover no-repeat, linear-gradient(135deg, #DDF8ED 0%, #EAF6FF 100%)",
            border: "1.5px solid #A7F3D0",
            cursor: "pointer",
            p: 2.25,
            transition: "all 0.15s ease",
            "&:hover": { boxShadow: T.shadowMd, transform: "translateY(-1px)" },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#159A65",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(21,154,101,0.25)",
                }}
              >
                <AdsIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: T.text }}>
                  Boost Your Store with Ads
                </Typography>
                <Typography sx={{ fontSize: "0.76rem", color: T.textSecondary }}>
                  Reach more customers in your area and online
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
              sx={{ color: "#159A65", fontWeight: 900, fontSize: "0.8rem", textTransform: "none", whiteSpace: "nowrap" }}
            >
              Create Campaign →
            </Button>
          </Stack>
        </Card>

        {/* 11. PRIME 750 BADGE */}
        {hasPrime750 && (
          <Card sx={{ mb: 3, borderRadius: "20px", border: "1px solid #FDE68A", bgcolor: "#FFFBEB" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <PrimeIcon sx={{ color: "#D97706", fontSize: 24 }} />
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#92400E", fontSize: "0.9rem" }}>
                    PRIME 750 Active Partner
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#B45309" }}>
                    Zero commission holds, priority wholesale matching & boost active.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

      </Container>
    </AppShell>
  );
}
