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
import { T, cardHoverSx, cardSx } from "../../theme/tokens";
import {
  StoreRounded as ShopsIcon,
  ReceiptLongRounded as OrdersIcon,
  StarRounded as StarIcon,
  Inventory2Rounded as InventoryIcon,
  CampaignRounded as AdsIcon,
  AccountBalanceWalletRounded as WalletIcon,
  AddRounded as AddIcon,
  ArrowOutwardRounded as ArrowOutwardIcon,
  LocalShippingOutlined as DeliveryIcon,
  ChevronRightRounded as ChevronRightIcon,
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

  useEffect(() => {
    let cancelled = false;
    const token =
      localStorage.getItem("token_business") ||
      localStorage.getItem("token_captain") ||
      localStorage.getItem("captain_token");

    const apiBase =
      process.env.REACT_APP_CAPTAIN_API_URL ||
      "https://api-captain.trikonektbusiness.com/api";
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [prof, myShops, promo, offlinePayments, kycRes] = await Promise.all([
          getMerchantProfile().catch(() => null),
          listMyShops().catch(() => []),
          listMyPromoPurchases({}).catch(() => []),
          token
            ? axios
                .get(`${apiBase}/captain/offline-payments/merchant`, { headers })
                .catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          token
            ? axios
                .get(`${apiBase}/captain/merchant/kyc/status`, { headers })
                .catch(() => ({ data: null }))
            : Promise.resolve({ data: null }),
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

        const paymentsList = Array.isArray(offlinePayments?.data)
          ? offlinePayments.data
          : [];
        const pendingList = paymentsList.filter((p) => p.status === "PENDING");
        setPendingPaymentsCount(pendingList.length);

        const approvedSales = paymentsList
          .filter((p) => p.status === "APPROVED" || p.status === "COMPLETED")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setTotalSalesAmount(approvedSales);

        if (kycRes?.data?.kycStatus) {
          setKycStatus(kycRes.data.kycStatus);
        }

        // Fetch B2B Banners with corrected endpoint (avoid duplicate /api)
        const [onlineAds, offlineAds] = await Promise.all([
          axios
            .get(`${apiBase}/ads/banners?target=BUSINESS_ONLINE_B2B`, { headers })
            .catch(() => ({ data: [] })),
          axios
            .get(`${apiBase}/ads/banners?target=BUSINESS_OFFLINE_B2B`, { headers })
            .catch(() => ({ data: [] })),
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
    return () => {
      cancelled = true;
    };
  }, []);

  const verified = Boolean(profile?.is_verified);
  const activeShopsCount = useMemo(
    () => shops.filter((s) => s.status === "ACTIVE").length,
    [shops]
  );
  const walletBalance = Number(profile?.wallet_balance || 0);
  const ratingValue = profile?.rating ? Number(profile.rating).toFixed(1) : null;
  const isKycPending = !verified || (kycStatus && kycStatus !== "APPROVED");

  return (
    <AppShell activeTab="/business-dashboard" title="Merchant Dashboard">
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>

        {/* 1. COMPACT PRIME PROMOTIONAL BANNER */}
        <Box sx={{ mb: 2.5 }}>
          <Card
            sx={{
              borderRadius: T.radiusCard,
              background: "linear-gradient(135deg, #0B8063 0%, #065441 100%)",
              color: "#FFFFFF",
              p: { xs: 2.25, sm: 2.75 },
              boxShadow: "0 4px 16px rgba(11, 128, 99, 0.18)",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box sx={{ flex: 1, zIndex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}
                >
                  <Chip
                    icon={
                      <PrimeIcon
                        sx={{ fontSize: "14px !important", color: "#F59E0B !important" }}
                      />
                    }
                    label="TRIKONEKT PRIME"
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.68rem",
                      height: 22,
                      letterSpacing: "0.5px",
                    }}
                  />
                  <Chip
                    label="UP TO 30% MORE SALES"
                    size="small"
                    sx={{
                      bgcolor: "#FEF3C7",
                      color: "#92400E",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      height: 20,
                    }}
                  />
                </Stack>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.1rem", sm: "1.35rem" },
                    lineHeight: 1.25,
                    mb: 0.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Grow Your Business With Trikonekt Prime
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 2,
                    maxWidth: 480,
                    lineHeight: 1.4,
                  }}
                >
                  Unlock verified wholesale pricing, run special promotions and reach more active buyers.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate("/business/packages")}
                  sx={{
                    bgcolor: T.orange,
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    borderRadius: "10px",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.75,
                    boxShadow: "0 2px 8px rgba(255, 107, 0, 0.35)",
                    "&:hover": { bgcolor: T.orangeHover },
                  }}
                >
                  Upgrade to Prime →
                </Button>
              </Box>

              {/* Restrained Illustration / Graphic for Larger Screens */}
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: { sm: 110, md: 130 },
                  height: { sm: 95, md: 115 },
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  component="img"
                  src="/assets/illustrations/groceries_basket.png"
                  alt="Prime Groceries"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.20))",
                  }}
                />
              </Box>
            </Stack>
          </Card>
        </Box>

        {/* 2. BUSINESS OVERVIEW METRICS (Balanced Responsive Grid) */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.5 }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: T.text,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Business Overview
            </Typography>
            <Typography
              sx={{ fontSize: "0.72rem", color: T.textSecondary, fontWeight: 600 }}
            >
              Today,{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Typography>
          </Stack>

          <Grid container spacing={1.5}>
            {/* Metric 1: Active Shops */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/shops")}
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
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    sx={{ fontSize: "0.75rem", fontWeight: 700, color: T.textSecondary }}
                  >
                    Active Shops
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: T.primaryLight,
                      color: T.primary,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <ShopsIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.45rem",
                      fontWeight: 900,
                      color: T.text,
                      lineHeight: 1.1,
                    }}
                  >
                    {loading ? <Skeleton width={32} /> : activeShopsCount}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: T.textMuted,
                      mt: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    {shops.length > activeShopsCount
                      ? `${shops.length - activeShopsCount} in review`
                      : "All outlets live"}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Metric 2: New Orders */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/orders")}
                sx={{
                  ...cardHoverSx,
                  cursor: "pointer",
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: pendingPaymentsCount > 0 ? "#FCD34D" : T.border,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    sx={{ fontSize: "0.75rem", fontWeight: 700, color: T.textSecondary }}
                  >
                    New Orders
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: pendingPaymentsCount > 0 ? "#FFFBEB" : "#F8FAFC",
                      color: pendingPaymentsCount > 0 ? T.orange : T.primary,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <OrdersIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.45rem",
                      fontWeight: 900,
                      color: pendingPaymentsCount > 0 ? T.orange : T.text,
                      lineHeight: 1.1,
                    }}
                  >
                    {loading ? <Skeleton width={32} /> : pendingPaymentsCount}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: pendingPaymentsCount > 0 ? T.orange : T.textMuted,
                      fontWeight: pendingPaymentsCount > 0 ? 800 : 500,
                      mt: 0.5,
                    }}
                  >
                    {pendingPaymentsCount > 0 ? "Awaiting action" : "Up to date"}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Metric 3: Wallet Balance */}
            <Grid item xs={6} sm={3}>
              <Card
                onClick={() => navigate("/business/profile")}
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
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    sx={{ fontSize: "0.75rem", fontWeight: 700, color: T.textSecondary }}
                  >
                    Wallet Balance
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: T.primaryLight,
                      color: T.primary,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <WalletIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.35rem",
                      fontWeight: 900,
                      color: T.text,
                      lineHeight: 1.1,
                    }}
                    noWrap
                  >
                    {loading ? (
                      <Skeleton width={56} />
                    ) : (
                      `₹${walletBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: T.textMuted,
                      mt: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Instant payout
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Metric 4: Merchant Rating */}
            <Grid item xs={6} sm={3}>
              <Card
                sx={{
                  ...cardHoverSx,
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    sx={{ fontSize: "0.75rem", fontWeight: 700, color: T.textSecondary }}
                  >
                    Store Rating
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: "#FFFBEB",
                      color: "#F59E0B",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <StarIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.45rem",
                      fontWeight: 900,
                      color: T.text,
                      lineHeight: 1.1,
                    }}
                  >
                    {loading ? (
                      <Skeleton width={32} />
                    ) : ratingValue ? (
                      `${ratingValue} ★`
                    ) : (
                      "4.8 ★"
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: T.textMuted,
                      mt: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Verified merchant
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 3. QUICK BUSINESS ACTIONS (Consistent Compact Tiles) */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.5 }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: T.text,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Quick Business Actions
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/business/shops")}
              sx={{
                color: T.primary,
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "none",
                p: 0,
              }}
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
                icon: <ShopsIcon sx={{ fontSize: 22 }} />,
              },
              {
                title: "Inventory",
                desc: "Stock & Barcode",
                path: "/business/inventory",
                icon: <InventoryIcon sx={{ fontSize: 22 }} />,
              },
              {
                title: "Online Products",
                desc: "Manage listings",
                path: "/business/online-products",
                icon: <DeliveryIcon sx={{ fontSize: 22 }} />,
              },
              {
                title: "Ads Manager",
                desc: "Boost sales",
                path: "/business/ads",
                icon: <AdsIcon sx={{ fontSize: 22 }} />,
              },
              {
                title: "Direct Factory",
                desc: "Restock B2B",
                path: "/business/online-marketplace",
                icon: <FactoryIcon sx={{ fontSize: 22 }} />,
                badge: "B2B",
              },
              {
                title: "Special Deals",
                desc: "Run offers",
                path: "/business/packages",
                icon: <TagIcon sx={{ fontSize: 22 }} />,
              },
            ].map((action) => (
              <Grid item xs={4} sm={2} key={action.title}>
                <Card
                  onClick={() => navigate(action.path)}
                  sx={{
                    ...cardHoverSx,
                    cursor: "pointer",
                    p: 1.5,
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
                        bgcolor: T.primary,
                        color: "#FFFFFF",
                        fontWeight: 900,
                        fontSize: "0.56rem",
                        height: 16,
                        px: 0.2,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: T.surfaceAlt,
                      color: T.primary,
                      display: "grid",
                      placeItems: "center",
                      mb: 1,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      color: T.text,
                      mb: 0.2,
                    }}
                    noWrap
                  >
                    {action.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      color: T.textSecondary,
                      lineHeight: 1.2,
                    }}
                    noWrap
                  >
                    {action.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 4. MERCHANT BALANCE & INSTANT PAYOUTS PANEL */}
        <Box sx={{ mb: 3 }}>
          <Card
            sx={{
              ...cardSx,
              p: { xs: 2.25, sm: 2.75 },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.25 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: T.primaryLight,
                    color: T.primary,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <WalletIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: T.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
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
                  fontSize: "0.68rem",
                  height: 22,
                  border: `1px solid ${T.primaryLight}`,
                }}
              />
            </Stack>

            <Typography
              sx={{
                fontSize: { xs: "1.85rem", sm: "2.35rem" },
                fontWeight: 900,
                color: T.text,
                letterSpacing: "-0.03em",
                my: 0.75,
              }}
            >
              {loading ? (
                <Skeleton width={160} height={42} />
              ) : (
                `₹${walletBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              )}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: T.textSecondary,
                mb: 2.25,
                lineHeight: 1.4,
              }}
            >
              Settled into your primary bank account daily. Authoritative platform ledger with zero hidden deductions.
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => navigate("/business/profile")}
                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                sx={{
                  flex: 1,
                  height: 42,
                  bgcolor: T.orange,
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(255, 107, 0, 0.25)",
                  "&:hover": { bgcolor: T.orangeHover },
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
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "10px",
                  "&:hover": { borderColor: T.borderHover, bgcolor: T.surfaceAlt },
                }}
              >
                Withdraw
              </Button>
            </Stack>
          </Card>
        </Box>

        {/* 5. GROWTH & PROCUREMENT MODULES (Unified Responsive 3-Column Grid) */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.5 }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: T.text,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Growth & Procurement
            </Typography>
          </Stack>

          <Grid container spacing={1.5}>
            {/* Card A: Direct Factory Restock */}
            <Grid item xs={12} md={4}>
              <Card
                onClick={() => navigate("/business/online-marketplace")}
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
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: T.primaryLight,
                        color: T.primary,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <FactoryIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Chip
                      label="B2B WHOLESALE"
                      size="small"
                      sx={{
                        bgcolor: T.primaryLight,
                        color: T.primary,
                        fontWeight: 800,
                        fontSize: "0.62rem",
                        height: 20,
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      color: T.text,
                      mb: 0.5,
                    }}
                  >
                    Direct Factory Restock
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: T.textSecondary,
                      lineHeight: 1.4,
                      mb: 2,
                    }}
                  >
                    Verified B2B wholesale prices, GST invoices and bulk dispatch directly from suppliers.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: T.primary,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    textTransform: "none",
                    p: 0,
                    alignSelf: "flex-start",
                  }}
                >
                  Order Wholesale →
                </Button>
              </Card>
            </Grid>

            {/* Card B: Special Deals */}
            <Grid item xs={12} md={4}>
              <Card
                onClick={() => navigate("/business/packages")}
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
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: T.primaryLight,
                        color: T.primary,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <TagIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Chip
                      label="PROMOTIONS"
                      size="small"
                      sx={{
                        bgcolor: T.surfaceAlt,
                        color: T.textSecondary,
                        fontWeight: 800,
                        fontSize: "0.62rem",
                        height: 20,
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      color: T.text,
                      mb: 0.5,
                    }}
                  >
                    Special Deals & Offers
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: T.textSecondary,
                      lineHeight: 1.4,
                      mb: 2,
                    }}
                  >
                    Run limited-time promotional offers and discounts to boost order velocity and store visits.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: T.primary,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    textTransform: "none",
                    p: 0,
                    alignSelf: "flex-start",
                  }}
                >
                  Create a Deal →
                </Button>
              </Card>
            </Grid>

            {/* Card C: Ads & Campaigns */}
            <Grid item xs={12} md={4}>
              <Card
                onClick={() => navigate("/business/ads")}
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
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: T.primaryLight,
                        color: T.primary,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <AdsIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Chip
                      label="CAMPAIGNS"
                      size="small"
                      sx={{
                        bgcolor: T.surfaceAlt,
                        color: T.textSecondary,
                        fontWeight: 800,
                        fontSize: "0.62rem",
                        height: 20,
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      color: T.text,
                      mb: 0.5,
                    }}
                  >
                    Boost Store With Ads
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: T.textSecondary,
                      lineHeight: 1.4,
                      mb: 2,
                    }}
                  >
                    Target buyers in your area with hyper-local banners and top placement across app searches.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: T.primary,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    textTransform: "none",
                    p: 0,
                    alignSelf: "flex-start",
                  }}
                >
                  Create Campaign →
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 6. TRENDING IN WHOLESALE (4 Balanced Operational Cards) */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.5 }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: T.text,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Trending in Wholesale
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/business/online-marketplace")}
              sx={{
                color: T.primary,
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "none",
                p: 0,
              }}
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
                    height: "100%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: 30, mb: 0.75 }}>{cat.icon}</Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: T.text,
                      mb: 0.25,
                    }}
                    noWrap
                  >
                    {cat.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: T.textMuted,
                      fontWeight: 500,
                    }}
                    noWrap
                  >
                    {cat.tag}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 7. TODAY'S INSIGHTS */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: T.text,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              mb: 1.25,
              px: 0.5,
            }}
          >
            Today's Insights
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ ...cardSx, p: 2, height: "100%" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: T.primaryLight,
                      color: T.primary,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TrendIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{ fontSize: "0.72rem", color: T.textSecondary, fontWeight: 600 }}
                    >
                      Top Performing Category
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: T.text }} noWrap>
                      Fruits & Vegetables
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.72rem", color: T.primary, fontWeight: 800 }}
                    >
                      +24% sales growth
                    </Typography>
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
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: "#FFFBEB",
                      color: "#F59E0B",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <LightbulbIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{ fontSize: "0.72rem", color: T.textSecondary, fontWeight: 600 }}
                    >
                      Suggested for You
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: T.text }} noWrap>
                      Run a Fresh Vegetables Deal
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.72rem", color: T.orange, fontWeight: 800 }}
                    >
                      Get 2x more orders this week →
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 8. KYC VERIFICATION REMINDER (Only when verification requires attention) */}
        {isKycPending && (
          <Card
            onClick={() => navigate("/business/kyc")}
            sx={{
              mb: 3,
              borderRadius: T.radiusCard,
              border: "1px solid #FDE68A",
              bgcolor: "#FFFBEB",
              boxShadow: T.shadowSm,
              cursor: "pointer",
              p: { xs: 2, sm: 2.25 },
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "#FCD34D" },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: "#F59E0B",
                    color: "#FFFFFF",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShieldIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#92400E", mb: 0.2 }}
                  >
                    Complete KYC Verification
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.75rem", color: "#B45309", lineHeight: 1.35 }}
                  >
                    Upload business PAN & registration to enable payouts and full store visibility.
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
                  bgcolor: T.orange,
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 2.25,
                  py: 0.75,
                  whiteSpace: "nowrap",
                  alignSelf: { xs: "stretch", sm: "auto" },
                  boxShadow: "none",
                  "&:hover": { bgcolor: T.orangeHover },
                }}
              >
                Verify Now →
              </Button>
            </Stack>
          </Card>
        )}

        {/* 9. PRIME 750 PARTNER BADGE (If active) */}
        {hasPrime750 && (
          <Card
            sx={{
              mb: 3,
              borderRadius: T.radiusCard,
              border: "1px solid #A7F3D0",
              bgcolor: "#ECFDF5",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <PrimeIcon sx={{ color: T.primary, fontSize: 24 }} />
                <Box>
                  <Typography
                    sx={{ fontWeight: 900, color: "#065F46", fontSize: "0.9rem" }}
                  >
                    PRIME 750 Active Partner
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#047857" }}>
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
