import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
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
import { T, cardHoverSx } from "../../theme/tokens";
import {
  StoreRounded as ShopsIcon,
  ReceiptLongRounded as OrdersIcon,
  Inventory2Rounded as InventoryIcon,
  CampaignRounded as AdsIcon,
  AccountBalanceWalletRounded as WalletIcon,
  ShoppingCartRounded as CartIcon,
  LocalMallRounded as MallIcon,
  LocalOfferRounded as TagIcon,
  ChevronRightRounded as ChevronRightIcon,
  WorkspacePremiumRounded as PrimeIcon,
  CalendarTodayOutlined as CalendarIcon,
  TrendingUpRounded as TrendIcon,
  LightbulbRounded as LightbulbIcon,
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

  const banners = useMemo(() => [
    {
      id: "grow-business",
      image: "/assets/trikonekt/banners/grow-your-business-hd.png",
      alt: "Grow Your Business with Trikonekt Business",
      link: "/business/packages",
    },
    {
      id: "factory-direct",
      image: "/assets/trikonekt/banners/direct-from-factory-hd.png",
      alt: "Manage Stores, Products & Reach More Customers",
      link: "/business/online-marketplace",
    },
    {
      id: "wholesale-deals",
      image: "/assets/trikonekt/banners/wholesale-deals-hd.png",
      alt: "Wholesale Deals For Your Business",
      link: "/business/online-marketplace",
    },
  ], []);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

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

  const activeShopsCount = useMemo(
    () => shops.filter((s) => s.status === "ACTIVE").length,
    [shops]
  );
  const walletBalance = Number(profile?.wallet_balance || 0);

  return (
    <AppShell activeTab="/business-dashboard" title="Merchant Dashboard">
      <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1.75, sm: 2.5 }, maxWidth: "100%", width: "100%", overflowX: "hidden" }}>

        {/* ─── 1. PROMOTIONAL HERO BANNER CAROUSEL ─── */}
        <Box sx={{ mb: 2.75 }}>
          <Box
            onClick={() => navigate(banners[activeBannerIdx].link)}
            sx={{
              position: "relative",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(23, 32, 51, 0.06)",
              border: "1px solid #E8E3DD",
              cursor: "pointer",
              bgcolor: "#FFF8EE",
              aspectRatio: "387 / 127",
              maxHeight: { md: 260, lg: 300 },
              width: "100%",
              transition: "transform 0.15s ease",
              "&:active": { transform: "scale(0.99)" },
            }}
          >
            <Box
              component="img"
              src={banners[activeBannerIdx].image}
              alt={banners[activeBannerIdx].alt}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "opacity 0.4s ease-in-out",
                imageRendering: "-webkit-optimize-contrast",
                WebkitBackfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            />
            {/* Position indicator badge matching mockup */}
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: 8, sm: 12 },
                right: { xs: 8, sm: 12 },
                bgcolor: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(4px)",
                color: "#FFFFFF",
                fontSize: "0.64rem",
                fontWeight: 800,
                px: 1,
                py: 0.25,
                borderRadius: "10px",
                lineHeight: 1.2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            >
              {activeBannerIdx + 1}/{banners.length}
            </Box>
          </Box>

          {/* Pagination Dots */}
          <Stack
            direction="row"
            spacing={0.75}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 1.25 }}
          >
            {banners.map((b, idx) => (
              <Box
                key={b.id}
                onClick={() => setActiveBannerIdx(idx)}
                sx={{
                  width: activeBannerIdx === idx ? 22 : 6,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: activeBannerIdx === idx ? "#FF5A0A" : "#E8E3DD",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* ─── 2. BUSINESS OVERVIEW (Responsive 2-Column Grid) ─── */}
        <Box sx={{ mb: 2.75 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.25 }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Business Overview
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: "pointer" }}>
              <CalendarIcon sx={{ fontSize: 14, color: "#64748B" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
                Today, 15 Oct 2026 ›
              </Typography>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {/* Card 1: Active Shops (Matching Mockup Screen 1) */}
            <Card
              onClick={() => navigate("/business/shops")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.25, sm: 1.75 },
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E8E3DD",
                boxShadow: "0 1px 3px rgba(23, 32, 51, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: { xs: 116, sm: 130 },
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#16805D", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(22, 128, 93, 0.12)" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: "10px",
                  bgcolor: "#EAF7EF",
                  color: "#16805D",
                  display: "grid",
                  placeItems: "center",
                  mb: 0.5,
                }}
              >
                <ShopsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, fontWeight: 600, color: "#647084" }} noWrap>
                  Active Shops
                </Typography>
                <Typography sx={{ fontSize: { xs: "1.35rem", sm: "1.75rem" }, fontWeight: 900, color: "#172033", lineHeight: 1.1, my: 0.2 }}>
                  {loading ? <Skeleton width={24} /> : activeShopsCount}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.68rem" }, color: "#16805D", fontWeight: 700 }} noWrap>
                {activeShopsCount > 0 ? `+${activeShopsCount} this month` : "No active shops"}
              </Typography>
            </Card>

            {/* Card 2: New Orders (Matching Mockup Screen 1) */}
            <Card
              onClick={() => navigate("/business/orders")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.25, sm: 1.75 },
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E8E3DD",
                boxShadow: "0 1px 3px rgba(23, 32, 51, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: { xs: 116, sm: 130 },
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#3676D9", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(54, 118, 217, 0.12)" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: "10px",
                  bgcolor: "#EDF4FF",
                  color: "#3676D9",
                  display: "grid",
                  placeItems: "center",
                  mb: 0.5,
                }}
              >
                <OrdersIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, fontWeight: 600, color: "#647084" }} noWrap>
                  New Orders
                </Typography>
                <Typography sx={{ fontSize: { xs: "1.35rem", sm: "1.75rem" }, fontWeight: 900, color: "#172033", lineHeight: 1.1, my: 0.2 }}>
                  {loading ? <Skeleton width={24} /> : pendingPaymentsCount}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.68rem" }, color: "#3676D9", fontWeight: 700 }} noWrap>
                {pendingPaymentsCount > 0 ? `+20% pending` : "+20%"}
              </Typography>
            </Card>

            {/* Card 3: Wallet Balance (Matching Mockup Screen 1) */}
            <Card
              onClick={() => navigate("/business/profile")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.25, sm: 1.75 },
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E8E3DD",
                boxShadow: "0 1px 3px rgba(23, 32, 51, 0.04)",
                minHeight: { xs: 116, sm: 130 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#FF5A0A", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(255, 90, 10, 0.12)" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: "10px",
                  bgcolor: "#FFF0E5",
                  color: "#FF5A0A",
                  display: "grid",
                  placeItems: "center",
                  mb: 0.5,
                }}
              >
                <WalletIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, fontWeight: 600, color: "#647084" }} noWrap>
                  Wallet Balance
                </Typography>
                <Typography sx={{ fontSize: { xs: "1.05rem", sm: "1.45rem" }, fontWeight: 900, color: "#172033", lineHeight: 1.1, my: 0.2 }} noWrap>
                  {loading ? <Skeleton width={50} /> : `₹${Number(walletBalance || 0).toLocaleString("en-IN")}`}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: "0.60rem", sm: "0.66rem" }, color: "#FF5A0A", fontWeight: 700 }} noWrap>
                ⚡ Instant Payout
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* ─── 3. QUICK BUSINESS ACTIONS (5 Shortcuts matching Mockup Screen 1) ─── */}
        <Box sx={{ mb: 2.75, width: "100%", minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.25 }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#0F172A",
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
                color: "#FF5A0A",
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "none",
                p: 0,
              }}
            >
              View All →
            </Button>
          </Stack>

          {/* 5 Icon Shortcuts matching Screen 1 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: { xs: 1, sm: 1.5 },
              py: 0.5,
              px: 0.25,
            }}
          >
            {[
              {
                title: "My Shops",
                path: "/business/shops",
                icon: <ShopsIcon sx={{ fontSize: 24 }} />,
                iconColor: "#16805D",
                iconBg: "#EAF7EF",
              },
              {
                title: "Inventory",
                path: "/business/inventory",
                icon: <InventoryIcon sx={{ fontSize: 24 }} />,
                iconColor: "#3676D9",
                iconBg: "#EDF4FF",
              },
              {
                title: "Online Products",
                path: "/business/online-products",
                icon: <MallIcon sx={{ fontSize: 24 }} />,
                iconColor: "#8B5CF6",
                iconBg: "#FAF5FF",
              },
              {
                title: "Direct Factory",
                badge: "B2B",
                path: "/business/online-marketplace",
                icon: <CartIcon sx={{ fontSize: 24 }} />,
                iconColor: "#FF5A0A",
                iconBg: "#FFF0E5",
              },
              {
                title: "Special Deals",
                path: "/business/packages",
                icon: <TagIcon sx={{ fontSize: 24 }} />,
                iconColor: "#EF4444",
                iconBg: "#FEE2E2",
              },
            ].map((action) => (
              <Box
                key={action.title}
                onClick={() => navigate(action.path)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { transform: "translateY(-2px)" },
                  "&:active": { transform: "scale(0.96)" },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 52, sm: 58 },
                    height: { xs: 52, sm: 58 },
                    borderRadius: "16px",
                    bgcolor: action.iconBg,
                    color: action.iconColor,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 1px 4px rgba(23, 32, 51, 0.05)",
                    border: "1px solid rgba(0,0,0,0.03)",
                    mb: 0.8,
                  }}
                >
                  {action.badge && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        bgcolor: "#16805D",
                        color: "#FFFFFF",
                        fontWeight: 900,
                        fontSize: "0.52rem",
                        px: 0.6,
                        py: 0.1,
                        borderRadius: "6px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      {action.badge}
                    </Box>
                  )}
                  {action.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.74rem" },
                    fontWeight: 700,
                    color: "#172033",
                    textAlign: "center",
                    lineHeight: 1.15,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {action.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ─── 4. TRENDING IN WHOLESALE (4 Photo Category Cards) ─── */}
        <Box sx={{ mb: 2.75 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.25, px: 0.25 }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#0F172A",
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
                color: "#FF5A0A",
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "none",
                p: 0,
              }}
            >
              View All →
            </Button>
          </Stack>

          <Box
            className="no-scrollbar"
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: { xs: 1.25, sm: 1.75 },
              pb: 1,
              pt: 0.25,
              px: 0.25,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {[
              {
                title: "Fruits & Vegetables",
                tag: "Fresh Wholesale",
                bg: "#ECFDF5",
                border: "#A7F3D0",
                img: "/assets/categories/cat_fruits_veg.png",
                fallback: "🥦",
              },
              {
                title: "Dairy, Bread & Eggs",
                tag: "Daily Supplies",
                bg: "#EFF6FF",
                border: "#BFDBFE",
                img: "/assets/categories/cat_dairy_bread.png",
                fallback: "🥛",
              },
              {
                title: "Atta, Rice & Dal",
                tag: "Bulk Staples",
                bg: "#FFFBEB",
                border: "#FDE68A",
                img: "/assets/categories/cat_atta_rice.png",
                fallback: "🌾",
              },
              {
                title: "Snacks & Drinks",
                tag: "Packaged FMCG",
                bg: "#FDF2F8",
                border: "#FBCFE8",
                img: "/assets/categories/cat_snacks_drinks.png",
                fallback: "🥤",
              },
              {
                title: "Cooking Oil & Ghee",
                tag: "Bulk Kitchen",
                bg: "#FFF7ED",
                border: "#FED7AA",
                img: "/assets/trikonekt/products/cooking-oil-reference.jpg",
                fallback: "🍳",
              },
              {
                title: "Spices & Masala",
                tag: "Authentic Brands",
                bg: "#FEF2F2",
                border: "#FECACA",
                img: "/assets/trikonekt/products/spices-reference.jpg",
                fallback: "🌶️",
              },
            ].map((cat) => (
              <Card
                key={cat.title}
                onClick={() => navigate("/business/online-marketplace")}
                sx={{
                  cursor: "pointer",
                  p: { xs: 1.25, sm: 1.5 },
                  borderRadius: "16px",
                  bgcolor: cat.bg,
                  border: `1px solid ${cat.border}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: { xs: 158, sm: 174 },
                  width: { xs: 136, sm: 154 },
                  minWidth: { xs: 136, sm: 154 },
                  maxWidth: { xs: 146, sm: 164 },
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)" },
                  "&:active": { transform: "scale(0.98)" },
                }}
              >
                {/* Product Photo Box with contain mode & shadow */}
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 72, sm: 84 },
                    borderRadius: "10px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={cat.img}
                    alt={cat.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "8px",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                    }}
                  />
                </Box>

                {/* Title with consistent 2-line clamp and spacing */}
                <Box sx={{ flex: 1, minWidth: 0, mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "0.76rem", sm: "0.82rem" },
                      color: "#0F172A",
                      lineHeight: 1.25,
                      minHeight: { xs: "2.5em", sm: "2.5em" },
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      wordBreak: "break-word",
                    }}
                  >
                    {cat.title}
                  </Typography>
                </Box>

                {/* Footer Row: Tag on left, Circular Chevron on right (no collision!) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 0.5,
                    mt: "auto",
                    pt: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.64rem", sm: "0.70rem" },
                      color: "#64748B",
                      lineHeight: 1.2,
                      fontWeight: 600,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.tag}
                  </Typography>
                  <Box
                    sx={{
                      width: { xs: 20, sm: 22 },
                      height: { xs: 20, sm: 22 },
                      borderRadius: "50%",
                      bgcolor: "#FFFFFF",
                      color: "#FF5A0A",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: { xs: 13, sm: 15 } }} />
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>

        {/* ─── 5. BUSINESS INSIGHTS (Side-by-Side Dual Action Cards matching Mockup) ─── */}
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#0F172A",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              mb: 1.25,
              px: 0.25,
            }}
          >
            Business Insights
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))" },
              gap: { xs: 1.25, sm: 1.5 },
            }}
          >
            {/* Insight 1: Top Performing Category */}
            <Card
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: 0,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#EAF7EF",
                    color: "#16805D",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <TrendIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 600 }} noWrap>
                    Top Performing Category
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.82rem", sm: "0.9rem" }, color: "#0F172A", my: 0.15 }} noWrap>
                    Fruits & Vegetables
                  </Typography>
                  <Chip
                    label="+24% sales growth"
                    size="small"
                    sx={{
                      bgcolor: "#EAF7EF",
                      color: "#16805D",
                      fontWeight: 800,
                      fontSize: "0.62rem",
                      height: 18,
                      px: 0.5,
                    }}
                  />
                </Box>
              </Stack>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  ml: 0.75,
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </Box>
            </Card>

            {/* Insight 2: Suggested for You */}
            <Card
              onClick={() => navigate("/business/packages")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: 0,
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#CBD5E1" },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#FEF3C7",
                    color: "#F59E0B",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <LightbulbIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 600 }} noWrap>
                    Suggested for You
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.82rem", sm: "0.9rem" }, color: "#0F172A", my: 0.15 }} noWrap>
                    Run a Fresh Vegetables Deal
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "#FF5A0A", fontWeight: 800 }} noWrap>
                    Get 2x more orders →
                  </Typography>
                </Box>
              </Stack>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  ml: 0.75,
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </Box>
            </Card>
          </Box>
        </Box>

      </Container>
    </AppShell>
  );
}
