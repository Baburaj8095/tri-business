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

        {/* 1. WALLET BALANCE CARD (White Card with Orange Accents) */}
        <Card
          sx={{
            mb: 2.5,
            borderRadius: T.radiusXl,
            bgcolor: T.surface,
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadowSm,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 140,
              height: 140,
              background: "radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none",
            }}
          />
          <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
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
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
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

            {/* Authoritative Server Balance */}
            <Typography sx={{ fontSize: { xs: "1.85rem", sm: "2.3rem" }, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", my: 1 }}>
              {loading ? (
                <Skeleton width={180} height={48} />
              ) : (
                `₹${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </Typography>

            <Typography sx={{ fontSize: "0.78rem", color: T.textMuted, mb: 2 }}>
              Settled into your primary bank account daily. No hidden platform deduction.
            </Typography>

            {/* Quick Balance Actions */}
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
                  boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
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

        {/* 2. DIRECT FACTORY RESTOCK BANNER */}
        <Card
          onClick={() => navigate("/business/online-marketplace")}
          sx={{
            mb: 2.5,
            borderRadius: T.radiusLg,
            background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
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
                  <Typography sx={{ fontSize: "0.78rem", color: T.textSecondary }}>
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

        {/* 3. BUSINESS OVERVIEW — 4 COMPACT KPI CARDS */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "0.76rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.6px", mb: 1.5, px: 0.5 }}>
            Business Overview
          </Typography>

          <Grid container spacing={1.5}>
            {/* KPI 1: Active Shops */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/shops")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 2,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: T.textSecondary }}>
                    Active Shops
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center" }}>
                    <ShopsIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: T.text }}>
                  {loading ? <Skeleton width={40} /> : activeShopsCount}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: T.textMuted, mt: 0.25 }}>
                  {shops.length > activeShopsCount ? `${shops.length - activeShopsCount} pending review` : "All outlets live"}
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
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: T.textSecondary }}>
                    New Orders
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: T.primaryLight, color: T.primary, display: "grid", placeItems: "center" }}>
                    <OrdersIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: pendingPaymentsCount > 0 ? T.primary : T.text }}>
                  {loading ? <Skeleton width={40} /> : pendingPaymentsCount}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: pendingPaymentsCount > 0 ? T.primary : T.textMuted, fontWeight: pendingPaymentsCount > 0 ? 700 : 500, mt: 0.25 }}>
                  {pendingPaymentsCount > 0 ? "Awaiting your action" : "Up to date"}
                </Typography>
              </Card>
            </Grid>

            {/* KPI 3: Total Sales */}
            <Grid item xs={6} sm={3}>
              <Card
                sx={{
                  ...cardHoverSx,
                  p: 2,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: T.textSecondary }}>
                    Total Sales
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#10B981", display: "grid", placeItems: "center" }}>
                    <SalesIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: T.text }} noWrap>
                  {loading ? <Skeleton width={60} /> : totalSalesAmount !== null ? `₹${totalSalesAmount.toLocaleString("en-IN")}` : "₹0"}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: T.textMuted, mt: 0.25 }}>
                  Authoritative offline & online
                </Typography>
              </Card>
            </Grid>

            {/* KPI 4: Rating */}
            <Grid item xs={6} sm={3}>
              <Card
                sx={{
                  ...cardHoverSx,
                  p: 2,
                  height: "100%",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: T.textSecondary }}>
                    Rating
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#FEF3C7", color: "#D97706", display: "grid", placeItems: "center" }}>
                    <StarIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: T.text }}>
                  {loading ? <Skeleton width={40} /> : ratingValue ? `${ratingValue} ★` : "—"}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: T.textMuted, mt: 0.25 }}>
                  {ratingValue ? "Customer rating" : "No ratings yet"}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 4. KYC STATUS BANNER (If not yet verified) */}
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

        {/* 5. PRIME 750 BADGE */}
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

        {/* 6. QUICK ACTIONS (Frequently Used Merchant Modules) */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "0.76rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.6px", mb: 1.5, px: 0.5 }}>
            Frequently Used Modules
          </Typography>

          <Grid container spacing={1.5}>
            {[
              {
                title: "My Shops",
                desc: "Manage branches & timings",
                path: "/business/shops",
                icon: <ShopsIcon sx={{ fontSize: 24 }} />,
                iconColor: T.primary,
                iconBg: T.primaryLight,
              },
              {
                title: "Tri Inventory & Billing",
                desc: "Stock barcode POS & catalog",
                path: "/business/inventory",
                icon: <InventoryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#2563EB",
                iconBg: "#EFF6FF",
              },
              {
                title: "Online Products",
                desc: "Manage online listings",
                path: "/business/online-products",
                icon: <DeliveryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#7C3AED",
                iconBg: "#F5F3FF",
              },
              {
                title: "Ads & Campaigns",
                desc: "Promote store & boost sales",
                path: "/business/ads",
                icon: <AdsIcon sx={{ fontSize: 24 }} />,
                iconColor: "#EA580C",
                iconBg: "#FFF7ED",
              },
            ].map((action) => (
              <Grid item xs={6} sm={3} key={action.title}>
                <Card
                  onClick={() => navigate(action.path)}
                  sx={{
                    ...cardHoverSx,
                    cursor: "pointer",
                    p: 2,
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
                        mb: 1.5,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: T.text, mb: 0.25 }}>
                      {action.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: T.textSecondary, lineHeight: 1.3 }}>
                      {action.desc}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5, color: T.primary }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>Open</Typography>
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 7. B2B PROMOS / ADS CAROUSEL (If any available from backend) */}
        {b2bAds.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, px: 0.5 }}>
              <AdsIcon sx={{ color: T.primary, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: T.text }}>
                Featured Wholesale Banners
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { display: "none" } }}>
              {b2bAds.map((ad) => (
                <Card
                  key={ad.id}
                  onClick={() => ad.target_url && window.open(ad.target_url, "_blank")}
                  sx={{
                    minWidth: { xs: 260, sm: 300 },
                    maxWidth: 320,
                    borderRadius: T.radiusLg,
                    border: `1px solid ${T.border}`,
                    boxShadow: T.shadowSm,
                    cursor: ad.target_url ? "pointer" : "default",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {ad.image_url && (
                    <Box sx={{ height: 110, background: `url(${ad.image_url}) center/cover no-repeat` }} />
                  )}
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: T.text, mb: 0.25 }} noWrap>
                      {ad.title}
                    </Typography>
                    {ad.description && (
                      <Typography sx={{ fontSize: "0.75rem", color: T.textSecondary, lineHeight: 1.3 }} noWrap>
                        {ad.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

      </Container>
    </AppShell>
  );
}
