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

        {/* 1. HERO PROMOTIONAL BANNER CAROUSEL (Top of Screen 1) */}
        <Box sx={{ mb: 2.5 }}>
          {b2bAds.length > 0 ? (
            <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "18px" }}>
              <Box
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  "&::-webkit-scrollbar": { display: "none" },
                  gap: 1.5,
                }}
              >
                {b2bAds.map((ad, idx) => (
                  <Card
                    key={ad.id || idx}
                    onClick={() => ad.target_url && window.open(ad.target_url, "_blank")}
                    sx={{
                      minWidth: "100%",
                      scrollSnapAlign: "start",
                      borderRadius: "18px",
                      background: "linear-gradient(135deg, #FF6508 0%, #E9570A 100%)",
                      color: "#ffffff",
                      p: { xs: 2.5, sm: 3 },
                      cursor: ad.target_url ? "pointer" : "default",
                      boxShadow: "0 6px 20px rgba(255, 101, 8, 0.25)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box sx={{ pr: 2 }}>
                        <Chip
                          label="SPECIAL OFFER"
                          size="small"
                          sx={{ bgcolor: "rgba(255,255,255,0.22)", color: "#ffffff", fontWeight: 800, fontSize: "0.65rem", height: 20, mb: 1 }}
                        />
                        <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.05rem", sm: "1.25rem" }, lineHeight: 1.25, mb: 0.5 }}>
                          {ad.title || "Grow Your Sales With Trikonekt Prime"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.9)", mb: 1.5 }}>
                          {ad.subtitle || "Upgrade today to unlock priority search placement & zero commission holds."}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/business/packages");
                          }}
                          sx={{
                            bgcolor: "#ffffff",
                            color: "#E9570A",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            borderRadius: "20px",
                            textTransform: "none",
                            px: 2,
                            "&:hover": { bgcolor: "#f8fafc" },
                          }}
                        >
                          Upgrade to Prime
                        </Button>
                      </Box>
                      {ad.image_url ? (
                        <Box
                          component="img"
                          src={ad.image_url}
                          alt="Banner"
                          sx={{ width: 90, height: 90, objectFit: "cover", borderRadius: "14px", flexShrink: 0 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.18)",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <PrimeIcon sx={{ fontSize: 40, color: "#ffffff" }} />
                        </Box>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Box>
            </Box>
          ) : (
            <Card
              sx={{
                borderRadius: "18px",
                background: "linear-gradient(135deg, #FF6508 0%, #E9570A 100%)",
                color: "#ffffff",
                p: { xs: 2.25, sm: 2.75 },
                boxShadow: "0 6px 20px rgba(255, 101, 8, 0.25)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ pr: 1.5, zIndex: 1 }}>
                  <Chip
                    label="PROMOTION"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.22)", color: "#ffffff", fontWeight: 800, fontSize: "0.62rem", height: 20, mb: 0.75 }}
                  />
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: "1rem", sm: "1.15rem" }, lineHeight: 1.25, mb: 0.5 }}>
                    Grow Your Sales With Trikonekt Prime
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", mb: 1.5 }}>
                    Boost store visibility, attract new customers and get wholesale discounts.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate("/business/packages")}
                    sx={{
                      bgcolor: "#ffffff",
                      color: "#E9570A",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      borderRadius: "20px",
                      textTransform: "none",
                      px: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    Upgrade to Prime
                  </Button>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  <PrimeIcon sx={{ fontSize: 36, color: "#ffffff" }} />
                </Box>
              </Stack>
            </Card>
          )}
        </Box>

        {/* 2. 4 COMPACT KPI CARDS (Exact 2x2 Grid from Screen 1) */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={1.5}>
            {/* KPI 1: Active Shops */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/shops")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 1.75,
                  borderRadius: "16px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: T.surface,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    Active Shops
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#FFF3E8", color: "#FF6508", display: "grid", placeItems: "center" }}>
                    <ShopsIcon sx={{ fontSize: 17 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.45rem", fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
                  {loading ? <Skeleton width={36} /> : activeShopsCount}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: 0.4 }}>
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
                  p: 1.75,
                  borderRadius: "16px",
                  border: `1.5px solid ${pendingPaymentsCount > 0 ? "#FED7AA" : T.border}`,
                  bgcolor: T.surface,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    New Orders
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#EFF6FF", color: "#3678E5", display: "grid", placeItems: "center" }}>
                    <OrdersIcon sx={{ fontSize: 17 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.45rem", fontWeight: 900, color: pendingPaymentsCount > 0 ? "#FF6508" : T.text, lineHeight: 1.1 }}>
                  {loading ? <Skeleton width={36} /> : pendingPaymentsCount}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: pendingPaymentsCount > 0 ? "#FF6508" : T.textMuted, fontWeight: pendingPaymentsCount > 0 ? 800 : 500, mt: 0.4 }}>
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
                  p: 1.75,
                  borderRadius: "16px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: T.surface,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    Wallet Balance
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#159A65", display: "grid", placeItems: "center" }}>
                    <WalletIcon sx={{ fontSize: 17 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: T.text, lineHeight: 1.1 }} noWrap>
                  {loading ? <Skeleton width={60} /> : `₹${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: 0.4 }}>
                  Instant withdrawal
                </Typography>
              </Card>
            </Grid>

            {/* KPI 4: Rating */}
            <Grid item xs={6} sm={3}>
              <Card
                sx={{
                  ...cardHoverSx,
                  p: 1.75,
                  borderRadius: "16px",
                  border: `1.5px solid ${T.border}`,
                  bgcolor: T.surface,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: T.textSecondary }}>
                    Rating
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#FEFCE8", color: "#F2A900", display: "grid", placeItems: "center" }}>
                    <StarIcon sx={{ fontSize: 17 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.45rem", fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
                  {loading ? <Skeleton width={36} /> : ratingValue ? `${ratingValue} ★` : "5.0 ★"}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: 0.4 }}>
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
                desc: "Manage branches & timings",
                path: "/business/shops",
                icon: <ShopsIcon sx={{ fontSize: 24 }} />,
                iconColor: "#FF6508",
                iconBg: "#FFF3E8",
              },
              {
                title: "Tri Inventory",
                desc: "Stock barcode POS & catalog",
                path: "/business/inventory",
                icon: <InventoryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#3678E5",
                iconBg: "#EFF6FF",
              },
              {
                title: "Online Products",
                desc: "Manage online listings",
                path: "/business/online-products",
                icon: <DeliveryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#8758E8",
                iconBg: "#F5F3FF",
              },
              {
                title: "Ads & Campaigns",
                desc: "Promote store & boost sales",
                path: "/business/ads",
                icon: <AdsIcon sx={{ fontSize: 24 }} />,
                iconColor: "#FF6508",
                iconBg: "#FFF3E8",
              },
            ].map((action) => (
              <Grid item xs={6} sm={3} key={action.title}>
                <Card
                  onClick={() => navigate(action.path)}
                  sx={{
                    ...cardHoverSx,
                    cursor: "pointer",
                    p: 2,
                    borderRadius: "16px",
                    border: `1.5px solid ${T.border}`,
                    bgcolor: T.surface,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: action.iconBg,
                        color: action.iconColor,
                        display: "grid",
                        placeItems: "center",
                        mb: 1.25,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: T.text, mb: 0.25 }}>
                      {action.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: T.textSecondary, lineHeight: 1.3 }}>
                      {action.desc}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5, color: T.primary }}>
                    <Typography sx={{ fontSize: "0.74rem", fontWeight: 800 }}>Open</Typography>
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 4. MERCHANT BALANCE & INSTANT PAYOUTS CARD */}
        <Card
          sx={{
            mb: 2.5,
            borderRadius: "18px",
            bgcolor: T.surface,
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadowSm,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 2.25, sm: 2.75 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "10px",
                    bgcolor: T.primaryLight,
                    color: T.primary,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <WalletIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
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

            <Typography sx={{ fontSize: { xs: "1.85rem", sm: "2.3rem" }, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", my: 1 }}>
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
                  borderRadius: T.radiusMd,
                  boxShadow: "0 4px 12px rgba(255, 101, 8, 0.25)",
                  "&:hover": { bgcolor: T.primaryDark },
                }}
              >
                Add Funds
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/business/profile")}
                startIcon={<ArrowOutwardIcon sx={{ fontSize: 17 }} />}
                sx={{
                  flex: 1,
                  height: 42,
                  borderColor: T.border,
                  bgcolor: T.surface,
                  color: T.text,
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: T.radiusMd,
                  "&:hover": { borderColor: T.textSecondary, bgcolor: T.surfaceAlt },
                }}
              >
                Withdraw
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* 5. DIRECT FACTORY RESTOCK BANNER */}
        <Card
          onClick={() => navigate("/business/online-marketplace")}
          sx={{
            mb: 2.5,
            borderRadius: "18px",
            background: "linear-gradient(135deg, #FFF3E8 0%, #FFEDD5 100%)",
            border: "1.5px solid #FED7AA",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              boxShadow: T.shadowMd,
              transform: "translateY(-1px)",
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: T.primary,
                    color: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: T.text }}>
                    Direct Factory Restock
                  </Typography>
                  <Typography sx={{ fontSize: "0.76rem", color: T.textSecondary }}>
                    Verified B2B wholesale prices, GST invoices & bulk dispatch
                  </Typography>
                </Box>
              </Stack>
              <Button
                size="small"
                endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: T.primary,
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  p: 0,
                  minWidth: "auto",
                }}
              >
                Order Wholesale
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* 6. KYC STATUS BANNER (If not yet verified) */}
        {kycStatus !== "VERIFIED" && (
          <Card
            onClick={() => navigate("/business/kyc")}
            sx={{
              mb: 3,
              borderRadius: T.radiusLg,
              bgcolor: kycStatus === "PENDING" ? "#FEFCE8" : "#FFF7ED",
              border: `1.5px solid ${kycStatus === "PENDING" ? "#FEF08A" : "#FED7AA"}`,
              cursor: "pointer",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      bgcolor: kycStatus === "PENDING" ? "#F59E0B" : T.primary,
                      color: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {kycStatus === "PENDING" ? "⏳" : <WarningIcon sx={{ fontSize: 20 }} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: T.text }}>
                      {kycStatus === "PENDING" ? "KYC Review In Progress" : "Complete KYC Verification"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: T.textSecondary }}>
                      {kycStatus === "PENDING"
                        ? "Your business documents are being verified by our compliance team."
                        : "Upload PAN & business registration to enable payouts and full store visibility."}
                    </Typography>
                  </Box>
                </Stack>
                <ChevronRightIcon sx={{ color: T.textMuted }} />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 7. PRIME 750 BADGE */}
        {hasPrime750 && (
          <Card sx={{ mb: 3, borderRadius: T.radiusLg, border: "1px solid #FDE68A", bgcolor: "#FFFBEB" }}>
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
