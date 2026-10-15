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
  const [quickActionIndex, setQuickActionIndex] = useState(0);
  const quickActionsRef = React.useRef(null);

  const banners = useMemo(() => [
    {
      id: "emerald",
      image: "/assets/banners/business_banner_emerald.png",
      alt: "Grow Your Business with Trikonekt Business",
      link: "/business/packages",
    },
    {
      id: "light",
      image: "/assets/banners/business_banner_light.png",
      alt: "Manage Stores, Products & Reach More Customers",
      link: "/business/online-marketplace",
    },
  ], []);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % 2);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleQuickActionsScroll = (e) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const cardWidth = 184 + 10;
    const index = Math.min(5, Math.max(0, Math.round(scrollLeft / cardWidth)));
    setQuickActionIndex(index);
  };

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
              boxShadow: "0 4px 16px rgba(20, 35, 29, 0.08)",
              border: "1px solid #E2E8E5",
              cursor: "pointer",
              bgcolor: "#022C22",
              aspectRatio: { xs: "1024 / 375", sm: "1024 / 350" },
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
              }}
            />
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
                  bgcolor: activeBannerIdx === idx ? "#064E3B" : "#CBD5D0",
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
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {/* Card 1: Active Shops */}
            <Card
              onClick={() => navigate("/business/shops")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.75, sm: 2 },
                borderRadius: "16px",
                bgcolor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                boxShadow: "0 2px 10px rgba(20, 35, 29, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: { xs: 130, sm: 140 },
                transition: "all 0.15s ease",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#DCFCE7",
                  color: "#15803D",
                  display: "grid",
                  placeItems: "center",
                  mb: 0.5,
                }}
              >
                <ShopsIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" }, fontWeight: 700, color: "#64746C" }}>
                  Active Shops
                </Typography>
                <Typography sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 900, color: "#14231D", lineHeight: 1.1, my: 0.35 }}>
                  {loading ? <Skeleton width={32} /> : activeShopsCount}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.72rem", color: "#15803D", fontWeight: 700 }}>
                {activeShopsCount > 0 ? `${activeShopsCount} registered` : "No active shops"}
              </Typography>
            </Card>

            {/* Card 2: New Orders */}
            <Card
              onClick={() => navigate("/business/orders")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.75, sm: 2 },
                borderRadius: "16px",
                bgcolor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                boxShadow: "0 2px 10px rgba(20, 35, 29, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: { xs: 130, sm: 140 },
                transition: "all 0.15s ease",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#DBEAFE",
                  color: "#2563EB",
                  display: "grid",
                  placeItems: "center",
                  mb: 0.5,
                }}
              >
                <OrdersIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" }, fontWeight: 700, color: "#64746C" }}>
                  New Orders
                </Typography>
                <Typography sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 900, color: "#14231D", lineHeight: 1.1, my: 0.35 }}>
                  {loading ? <Skeleton width={32} /> : pendingPaymentsCount}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography sx={{ fontSize: "0.72rem", color: "#2563EB", fontWeight: 700 }}>
                  {pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pending` : "No pending orders"}
                </Typography>
              </Stack>
            </Card>

            {/* Card 3: Wallet Balance */}
            <Card
              onClick={() => navigate("/business/profile")}
              sx={{
                cursor: "pointer",
                p: { xs: 1.75, sm: 2 },
                borderRadius: "16px",
                bgcolor: "#FFF8ED",
                border: "1px solid #E2E8E5",
                boxShadow: "0 2px 10px rgba(20, 35, 29, 0.04)",
                gridColumn: { xs: "span 2", sm: "span 1" },
                minHeight: { xs: 130, sm: 140 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#FEF3C7",
                    color: "#B45309",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <WalletIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" }, fontWeight: 700, color: "#64746C" }}>
                  Wallet Balance
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                  fontWeight: 900,
                  color: "#14231D",
                  lineHeight: 1.1,
                  my: 0.35,
                }}
              >
                {loading ? <Skeleton width={80} /> : `₹${Number(walletBalance || 0).toLocaleString("en-IN")}`}
              </Typography>

              <Typography sx={{ fontSize: "0.72rem", color: "#B45309", fontWeight: 700 }}>
                ⚡ Instant Payout
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* ─── 3. QUICK BUSINESS ACTIONS (Horizontal Scroll Carousel) ─── */}
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
                color: "#059669",
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "none",
                p: 0,
              }}
            >
              View All →
            </Button>
          </Stack>

          {/* Carousel container with touch scrolling and snap alignment */}
          <Box
            ref={quickActionsRef}
            onScroll={handleQuickActionsScroll}
            sx={{
              display: "flex",
              gap: { xs: 1.25, sm: 1.5 },
              overflowX: "auto",
              py: 0.5,
              px: 0.25,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {[
              {
                title: "My Shops",
                desc: "Manage branches",
                path: "/business/shops",
                icon: <ShopsIcon sx={{ fontSize: 20 }} />,
                iconColor: "#10B981",
                iconBg: "#ECFDF5",
              },
              {
                title: "Inventory",
                desc: "Stock & Barcode",
                path: "/business/inventory",
                icon: <InventoryIcon sx={{ fontSize: 20 }} />,
                iconColor: "#3B82F6",
                iconBg: "#EFF6FF",
              },
              {
                title: "Online Products",
                desc: "Manage listings",
                path: "/business/online-products",
                icon: <MallIcon sx={{ fontSize: 20 }} />,
                iconColor: "#8B5CF6",
                iconBg: "#FAF5FF",
              },
              {
                title: "Direct Factory",
                desc: "Restock B2B",
                badge: "B2B",
                path: "/business/online-marketplace",
                icon: <CartIcon sx={{ fontSize: 20 }} />,
                iconColor: "#F97316",
                iconBg: "#FFF7ED",
              },
              {
                title: "Special Deals",
                desc: "Create offers",
                path: "/business/packages",
                icon: <TagIcon sx={{ fontSize: 20 }} />,
                iconColor: "#F59E0B",
                iconBg: "#FEF3C7",
              },
              {
                title: "Ads Manager",
                desc: "Boost sales",
                path: "/business/ads",
                icon: <AdsIcon sx={{ fontSize: 20 }} />,
                iconColor: "#EC4899",
                iconBg: "#FDF2F8",
              },
            ].map((action) => (
              <Card
                key={action.title}
                onClick={() => navigate(action.path)}
                sx={{
                  cursor: "pointer",
                  flex: "0 0 auto",
                  width: { xs: 184, sm: 196 },
                  p: { xs: 1.5, sm: 1.75 },
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  scrollSnapAlign: "start",
                  transition: "all 0.15s ease",
                  position: "relative",
                  "&:hover": {
                    borderColor: "#CBD5E1",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                {action.badge && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                      bgcolor: "#DCFCE7",
                      color: "#16A34A",
                      border: "1px solid #BBF7D0",
                      fontWeight: 900,
                      fontSize: "0.55rem",
                      px: 0.6,
                      py: 0.1,
                      borderRadius: "4px",
                    }}
                  >
                    {action.badge}
                  </Box>
                )}

                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1, pr: 0.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: action.iconBg,
                      color: action.iconColor,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "0.82rem", sm: "0.85rem" },
                        color: "#0F172A",
                        lineHeight: 1.25,
                        whiteSpace: "normal",
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: "#64748B",
                        lineHeight: 1.25,
                        mt: 0.25,
                        whiteSpace: "normal",
                      }}
                    >
                      {action.desc}
                    </Typography>
                  </Box>
                </Stack>

                <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
              </Card>
            ))}
          </Box>

          {/* Carousel Progress Indicators */}
          <Stack
            direction="row"
            spacing={0.75}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 1.5 }}
          >
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <Box
                key={idx}
                sx={{
                  width: quickActionIndex === idx ? 20 : 5,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: quickActionIndex === idx ? "#059669" : "rgba(148, 163, 184, 0.35)",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </Stack>
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
                color: "#059669",
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
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: { xs: 1, sm: 1.5 },
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
            ].map((cat) => (
              <Card
                key={cat.title}
                onClick={() => navigate("/business/online-marketplace")}
                sx={{
                  cursor: "pointer",
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: "16px",
                  bgcolor: cat.bg,
                  border: `1px solid ${cat.border}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: { xs: 154, sm: 176 },
                  transition: "all 0.15s ease",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)" },
                }}
              >
                {/* Product Photo Box with contain mode & shadow */}
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 66, sm: 84 },
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
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      color: "#0F172A",
                      lineHeight: 1.25,
                      minHeight: { xs: "2.5em", sm: "2.5em" },
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      wordBreak: "break-word",
                      mb: 0.25,
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
                    pt: 0.25,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.6rem", sm: "0.68rem" },
                      color: "#64748B",
                      lineHeight: 1.2,
                      fontWeight: 600,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                      color: "#059669",
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

        {/* ─── 5. TODAY'S INSIGHTS (Side-by-Side Dual Action Cards) ─── */}
        <Box sx={{ mb: 2 }}>
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
                    bgcolor: "#ECFDF5",
                    color: "#10B981",
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
                      bgcolor: "#ECFDF5",
                      color: "#059669",
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
                  <Typography sx={{ fontSize: "0.68rem", color: "#EA580C", fontWeight: 800 }} noWrap>
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
