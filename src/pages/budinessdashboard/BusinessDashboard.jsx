import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import AppShell from "../../components/layout/AppShell";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import {
  HiOutlineBars3BottomLeft,
  HiOutlineBell,
  HiOutlineWallet,
  HiOutlineMapPin,
  HiOutlineMagnifyingGlass,
  HiOutlineMap,
  HiOutlineHome,
  HiOutlineGlobeAlt,
  HiOutlineQrCode,
  HiOutlineSquares2X2,
  HiOutlineChevronRight,
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlineBuildingStorefront,
  HiOutlineHeart,
  HiOutlineFlag,
  HiOutlinePlayCircle,
  HiOutlineShoppingCart,
  HiOutlineUser
} from 'react-icons/hi2';
import { 
  LuGift, 
  LuSmartphone, 
  LuShirt, 
  LuSofa, 
  LuTag, 
  LuLock, 
  LuShieldCheck, 
  LuFileText, 
  LuBookOpen, 
  LuInfo, 
  LuLogOut, 
  LuStore, 
  LuWallet,
  LuPercent,
  LuPhone,
  LuCircleHelp,
  LuPackage
} from 'react-icons/lu';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';
import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PrimeMembershipModal from "../../components/business/PrimeMembershipModal";
import { getSubscriptionDetails, isMerchantPrime } from "../../utils/membershipHelper";
import SearchBar from "../../components/business/SearchBar";
import { getPublicB2bMerchants, getMerchantProfile, updateMerchantProfile, listMyShops } from "../../api/api";
import "../consumer-ecommerce/consumerEcommerce.css";
import { getGPSLocation } from "../../utils/locationHelper";

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const apiBase = process.env.REACT_APP_API_URL || 'https://www.trikonekt.com/api';
  let origin = '';
  try {
    const url = new URL(apiBase, window.location.origin);
    origin = url.origin;
  } catch (e) {
    origin = window.location.origin;
  }
  const cleanImg = img.startsWith("/") ? img.slice(1) : img;
  const mediaPath = cleanImg.startsWith("media/") ? cleanImg : `media/${cleanImg}`;
  return `${origin}/${mediaPath}`;
};

const UI = {
  bg: "#f8fafc",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  primary: "#228B22",
  secondary: "#1B4D3E",
  onPrimary: "#ffffff",
  headerGradient: "linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)",
};

const dashboardTheme = createTheme({
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  palette: {
    primary: {
      main: '#228B22',
      dark: '#1B4D3E',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
});

const QUICK_LOCATIONS = [
  {
    id: "nearby",
    title: "Nearby",
    icon: HiOutlineMapPin,
    bg: "linear-gradient(135deg, #e9f1ff 0%, #cfdfff 100%)",
    fg: "#1B4D3E",
  },
  {
    id: "karnataka",
    title: "Karnataka",
    icon: HiOutlineMapPin,
    bg: "linear-gradient(135deg, #bad4ff 0%, #8db6f5 100%)",
    fg: "#143f77",
  },
  {
    id: "maharashtra",
    title: "Maharashtra",
    icon: HiOutlineMapPin,
    bg: "linear-gradient(135deg, #d6e5ff 0%, #a8c6f7 100%)",
    fg: "#173c76",
  },
  {
    id: "tamilnadu",
    title: "Tamil Nadu",
    icon: HiOutlineMapPin,
    bg: "linear-gradient(135deg, #c8dcff 0%, #8db6f5 100%)",
    fg: "#173c76",
  },
  {
    id: "allstates",
    title: "All States",
    icon: HiOutlineGlobeAlt,
    bg: "linear-gradient(135deg, #dce9ff 0%, #b7cdf4 100%)",
    fg: "#173c76",
  },
];

const TOP_CITIES = [
  { id: 1, name: "Bangalore", businesses: "12.4K+", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Hyderabad", businesses: "8.7K+", image: "https://images.unsplash.com/photo-1626139575955-75b90a723feb?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Mumbai", businesses: "15.8K+", image: "https://images.unsplash.com/photo-1566550969633-670a81af30ad?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Chennai", businesses: "7.2K+", image: "https://images.unsplash.com/photo-1582510003544-2d095665039b?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Delhi", businesses: "20.1K+", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "Pune", businesses: "6.5K+", image: "https://images.unsplash.com/photo-1565019053020-13d461b65101?auto=format&fit=crop&w=400&q=80" },
  { id: 7, name: "Kolkata", businesses: "9.3K+", image: "https://images.unsplash.com/photo-1558431382-27e39cbef4bc?auto=format&fit=crop&w=400&q=80" },
  { id: 8, name: "Ahmedabad", businesses: "5.8K+", image: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=400&q=80" },
  { id: 9, name: "Kochi", businesses: "3.4K+", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80" },
  { id: 10, name: "Chandigarh", businesses: "4.2K+", image: "https://images.unsplash.com/photo-1624314138470-5a2f24623f10?auto=format&fit=crop&w=400&q=80" },
];

const SHOPS = [
  { id: 1, name: "Profile Name of the Shop", place: "Bangalore, Karnataka", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Near by Fashion Store", place: "Pune, Maharashtra", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Prime Appliance House", place: "Chennai, Tamil Nadu", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Mechanical Works Yard", place: "Tirupati, Andhra Pradesh", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80" },
];

const ALL_CATEGORIES = [
  { label: 'Vegetables & Fruits', image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=160&q=80", bg: "#ecfdf5" },
  { label: 'Atta, Rice & Dal', image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=80", bg: "#fef3c7" },
  { label: 'Dairy, Bread & Eggs', image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=80", bg: "#e0f2fe" },
  { label: 'Snacks & Drinks', image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=160&q=80", bg: "#fffbeb" },
  { label: 'Daily Needs', image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=160&q=80", bg: "#f0fdf4" },
  { label: 'Mobiles', icon: LuSmartphone, bg: "#eff6ff" },
  { label: 'Fashion', icon: LuShirt, bg: "#faf5ff" },
  { label: 'Furniture', icon: LuSofa, bg: "#fdf2f8" },
  { label: 'Beauty', icon: LuTag, bg: "#fff1f2" },
];

const ADS = [
  { id: 1, title: "Watch & Earn", caption: "Watch short brand ads and unlock reward points." },
  { id: 2, title: "Banner Ad", caption: "Fashion offers and nearby deals for your selected area." },
  { id: 3, title: "Banner Ad", caption: "Furniture and appliance launches from local businesses." },
];

const ONLINE_B2B_ADS = [
  { 
    id: 1, 
    badge: "⚡ Mega Wholesale",
    badgeColor: "#dc2626",
    title: "Grocery & FMCG Hub", 
    offer: "Up to 45% OFF on bulk staples, oils & packaged goods", 
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
    cta: "Explore Deals",
    moq: "Min MOQ: ₹5,000",
    supplier: "Verified Distributor",
  },
  { 
    id: 2, 
    badge: "🔥 Trade Exclusive",
    badgeColor: "#7c3aed",
    title: "Fashion & Apparel Stock", 
    offer: "Fresh seasonal catalogue for retail clothing stores", 
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
    cta: "Browse Apparel",
    moq: "Min MOQ: 20 pcs",
    supplier: "Direct Factory",
  },
  { 
    id: 3, 
    badge: "⭐ Direct Factory",
    badgeColor: "#0284c7",
    title: "Commercial & Office Fitout", 
    offer: "Ergonomic seating & retail fixtures at wholesale rates", 
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80",
    cta: "View Catalog",
    moq: "Pan-India Freight",
    supplier: "ISO Certified",
  },
  { 
    id: 4, 
    badge: "💎 Fresh Harvest",
    badgeColor: "#16a34a",
    title: "Restaurant & Cafe Supply", 
    offer: "Daily farm-to-kitchen supply network with credit terms", 
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
    cta: "Supply Network",
    moq: "Same Day Dispatch",
    supplier: "Cold Chain Verified",
  },
  { 
    id: 5, 
    badge: "🚀 Electronics Trade",
    badgeColor: "#ea580c",
    title: "Mobile Accessories & Gadgets", 
    offer: "Factory direct cables, chargers & smart watch bundles", 
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=700&q=80",
    cta: "Bulk Pricing",
    moq: "Min MOQ: 50 pcs",
    supplier: "Authorized OEM",
  },
  { 
    id: 6, 
    badge: "📦 Eco Packaging",
    badgeColor: "#059669",
    title: "Corrugated Boxes & Bags", 
    offer: "Custom printed cartons & eco delivery bags for retailers", 
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=700&q=80",
    cta: "Order Samples",
    moq: "Custom Branding",
    supplier: "Direct Manufacturer",
  },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Royal Supreme Basmati Rice (25 kg Bag)",
    mrp: "Rs. 3,200",
    price: "Rs. 2,450",
    discount: "23% OFF",
    packSize: "25 kg Sack",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Pure Cold Pressed Mustard Oil (15 L Tin)",
    mrp: "Rs. 2,400",
    price: "Rs. 1,890",
    discount: "21% OFF",
    packSize: "15 L Can",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Farm Fresh Grade-A Red Onions (50 kg)",
    mrp: "Rs. 1,800",
    price: "Rs. 1,350",
    discount: "25% OFF",
    packSize: "50 kg Mandi Bag",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Eco-friendly Meal Box 3-CP (Pack of 200)",
    mrp: "Rs. 1,400",
    price: "Rs. 980",
    discount: "30% OFF",
    packSize: "200 Pcs Box",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80",
  },
];

const FOOTER_ITEMS = [
  { id: "home-top", label: "Home", icon: HiOutlineHome },
  { id: "tri-zone-footer", label: "Tri Zone", icon: HiOutlineSquares2X2 },
  { id: "scanner-section", label: "Scanner", icon: HiOutlineQrCode, raised: true },
  { id: "online-marketplace", label: "Online", icon: HiOutlineGlobeAlt },
  { id: "city-search-section", label: "Nearby", icon: HiOutlineBuildingStorefront },
];

const DRAWER_ITEMS = [
  { label: "Wallet", action: "wallet", icon: LuWallet },
  { label: "Orders", action: "orders", icon: HiOutlineBuildingStorefront },
  { label: "Password Reset", action: "passwordReset", icon: LuLock },
  { label: "Add Shop", action: "addShop", icon: LuStore },
  { label: "Manage Online Products", action: "onlineProducts", icon: LuTag },
  { label: "Inventory", action: "inventory", icon: LuPackage },
  { label: "KYC Verification", action: "kyc", icon: LuShieldCheck },
  { label: "Completed Orders", action: "completedOrders", icon: LuFileText },
  { label: "Terms & Conditions", action: "terms", icon: LuBookOpen },
  { label: "Refund Policy", action: "refund", icon: LuInfo },
  { label: "Refer Friends", action: "refer", icon: LuGift },
];

function sectionCardStyles() {
  return {
    borderRadius: '16px',
    bgcolor: UI.surface,
    border: `1px solid ${UI.border}`,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.02)",
    width: "100%",
    minWidth: 0,
  };
}

function SectionShell({ title, subtitle, action, children }) {
  return (
    <Card sx={sectionCardStyles()}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={0.55}
          sx={{ mb: 1.5 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: UI.text, lineHeight: 1.25 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: 12, color: UI.textMuted, lineHeight: 1.3, mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function ComingSoonOverlay({ children, label = "Coming Soon" }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ opacity: 0.5, pointerEvents: 'none', filter: 'blur(1.5px)' }}>
        {children}
      </Box>
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10
      }}>
        <Box sx={{ 
          bgcolor: 'rgba(0,0,0,0.75)', color: '#fff', 
          px: 3, py: 1.2, borderRadius: 3, 
          fontWeight: 800, fontSize: 14,
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {label}
        </Box>
      </Box>
    </Box>
  );
}

function ScrollRow({ children, gap = 1, pb = 0.35 }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap,
        overflowX: "auto",
        overflowY: "hidden",
        width: "100%",
        pb,
        scrollBehavior: "smooth",
        scrollSnapType: "x proximity",
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(UI.primary, 0.22),
          borderRadius: 999,
        },
      }}
    >
      {children}
    </Box>
  );
}

function HeaderActionButton({ children, onClick, ariaLabel }) {
  return (
    <IconButton
      aria-label={ariaLabel}
      onClick={onClick}
      sx={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        color: "#ffffff",
        flexShrink: 0,
        "&:hover": { bgcolor: alpha("#ffffff", 0.1) },
      }}
    >
      {children}
    </IconButton>
  );
}

function PlaceholderImage({ label, minHeight = 104 }) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight,
        borderRadius: 2,
        border: `1px dashed ${alpha(UI.primary, 0.32)}`,
        bgcolor: alpha(UI.primary, 0.05),
        display: "grid",
        placeItems: "center",
        color: UI.textMuted,
        fontSize: 11.5,
        fontWeight: 700,
        textAlign: "center",
        px: 1,
      }}
    >
      {label}
    </Box>
  );
}

function SearchBarCard({ selectedLocation, onSearchClick, onJoinPrimeClick }) {
  return (
    <Box
      sx={{
        px: { xs: 1.1, sm: 1.3 },
        pb: { xs: 1, sm: 1.15 },
      }}
    >
      <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
          <Button
            onClick={onSearchClick}
            sx={{
              flex: 1,
              justifyContent: "flex-start",
              textTransform: "none",
              borderRadius: 999,
              minHeight: { xs: 36, sm: 40 },
              px: { xs: 1.05, sm: 1.3 },
              color: UI.text,
              minWidth: 0,
              bgcolor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#e2e8f0",
                borderColor: "#cbd5e1"
              },
            }}
          >
            <Stack direction="row" spacing={0.55} alignItems="center" sx={{ minWidth: 0, width: "100%" }}>
              <HiOutlineMapPin style={{ fontSize: 19, color: UI.primary, flexShrink: 0 }} />
              <Typography
                sx={{
                  color: UI.text,
                  fontSize: { xs: 13.5, sm: 14.5 },
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                Deliver to {selectedLocation || "560091"}
              </Typography>
              <HiOutlineChevronRight
                style={{
                  fontSize: 16,
                  color: UI.textMuted,
                  flexShrink: 0,
                  transform: "rotate(90deg)",
                }}
              />
            </Stack>
          </Button>

          <Button
            variant="contained"
            onClick={onJoinPrimeClick}
            sx={{
              flexShrink: 0,
              borderRadius: 999,
              px: { xs: 1.45, sm: 2 },
              py: 0,
              minWidth: { xs: 90, sm: 106 },
              minHeight: { xs: 36, sm: 40 },
              textTransform: "none",
              fontWeight: 800,
              fontSize: 12,
              background: "linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)",
              color: UI.onPrimary,
              boxShadow: "0 4px 12px rgba(34, 139, 34, 0.15)",
              "&:hover": {
                background: "linear-gradient(135deg, #153c30 0%, #1a6d1a 100%)",
                boxShadow: "0 4px 12px rgba(34, 139, 34, 0.25)"
              },
            }}
          >
            Join Prime
          </Button>
      </Stack>
    </Box>
  );
}

function QuickLocationCard({ item }) {
  const Icon = item.icon;

  return (
    <Box sx={{ width: 76, minWidth: 76, flexShrink: 0, textAlign: "center", scrollSnapAlign: "start" }}>
      <Box
        sx={{
          width: 60,
          height: 60,
          mx: "auto",
          borderRadius: "50%",
          background: item.bg,
          color: item.fg,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 8px 20px rgba(15,82,186,0.10)",
          border: `1px solid ${alpha(UI.primary, 0.12)}`,
        }}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Box>
      <Typography
        sx={{
          mt: 0.85,
          fontSize: 10.5,
          fontWeight: 700,
          color: UI.text,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {item.title}
      </Typography>
    </Box>
  );
}

function SearchCityModal({ open, onClose, onSelectCity }) {
  const [query, setQuery] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const filteredCities = TOP_CITIES.filter((city) => city.name.toLowerCase().includes(query.toLowerCase()));

  const handleDetect = async () => {
    setGpsLoading(true);
    try {
      const loc = await getGPSLocation();
      onSelectCity(loc.pincode || loc.city || "Bangalore");
    } catch (err) {
      alert(err.message || "Failed to detect location.");
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen
      TransitionProps={{ unmountOnExit: true }}
    >
      <Box sx={{ height: "100vh", bgcolor: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={onClose} sx={{ color: UI.text }}>
              <HiOutlineXMark fontSize={24} />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={900}>Select City</Typography>
              <Typography variant="body2" color={UI.textMuted} sx={{ mt: 0.25 }}>Choose a city from the submenu below</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Search Input */}
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: "10px 16px",
              display: "flex",
              alignItems: "center",
              borderRadius: 3,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0"
            }}
          >
            <SearchRoundedIcon sx={{ color: UI.textMuted, mr: 1.5 }} />
            <InputBase
              autoFocus
              fullWidth
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city, area or landmark..."
              sx={{ fontWeight: 600, fontSize: 16 }}
            />
          </Paper>
        </Box>

        {/* Action List */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Button
            fullWidth
            onClick={handleDetect}
            disabled={gpsLoading}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              py: 2,
              px: 3,
              color: UI.primary,
              borderBottom: "1px solid #f8fafc"
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {gpsLoading ? <CircularProgress size={20} color="inherit" /> : <MyLocationOutlinedIcon />}
              <Typography fontWeight={800}>{gpsLoading ? "Detecting..." : "Nearby / Detect my location"}</Typography>
            </Stack>
          </Button>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={900} color={UI.textMuted} sx={{ mb: 2.5, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
              City Menu
            </Typography>
            <Stack spacing={1}>
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <Button
                    key={city.id}
                    fullWidth
                    onClick={() => {
                      onSelectCity(city.name);
                    }}
                    sx={{
                      justifyContent: "space-between",
                      textTransform: "none",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      color: UI.text,
                      px: 3,
                      py: 1.75,
                      bgcolor: "#fff",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>{city.name}</Typography>
                    <HiOutlineChevronRight style={{ fontSize: 18, color: UI.textMuted }} />
                  </Button>
                ))
              ) : (
                <Typography color={UI.textMuted} sx={{ fontSize: 13, mt: 1 }}>
                  No matching cities found.
                </Typography>
              )}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={900} color={UI.textMuted} sx={{ mb: 2.5, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
                Popular Cities
              </Typography>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: 3 
              }}>
                {TOP_CITIES.map((city) => (
                  <Stack 
                    key={city.id} 
                    spacing={1} 
                    alignItems="center" 
                    onClick={() => onSelectCity(city.name)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Avatar
                      src={city.image}
                      sx={{
                        width: 64,
                        height: 64,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        border: "2px solid #fff"
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: UI.text,
                        textAlign: "center"
                      }}
                    >
                      {city.name}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

function ShopCard({ shop }) {
  const navigate = useNavigate();
  const defaultShopImg = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80";
  const rawImg = shop?.image || shop?.shop_image || shop?.image_url || shop?.logo || shop?.banner_image;
  const resolvedImg = rawImg ? resolveImageUrl(rawImg) : defaultShopImg;
  const [imgSrc, setImgSrc] = useState(resolvedImg);

  const shopName = shop?.shop_name || shop?.name || shop?.business_name || shop?.full_name || "Merchant Store";
  const shopLoc = shop?.city || shop?.address || "Local Area";

  const handleViewStore = () => {
    if (shop?.id) {
      navigate(`/business/shop/${shop.id}`);
    } else {
      navigate('/business/nearby-stores');
    }
  };

  return (
    <Card
      onClick={handleViewStore}
      sx={{
        ...sectionCardStyles(),
        minWidth: { xs: "72vw", sm: 236 },
        width: { xs: "72vw", sm: 236 },
        maxWidth: 236,
        flexShrink: 0,
        scrollSnapAlign: "start",
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.09)' },
      }}
    >
      <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
        <Stack spacing={1}>
          <Box
            component="img"
            src={imgSrc}
            alt={shopName}
            onError={() => setImgSrc(defaultShopImg)}
            sx={{
              width: "100%",
              height: 118,
              objectFit: "cover",
              borderRadius: '12px',
              display: "block",
              bgcolor: alpha(UI.primary, 0.05),
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: UI.text, lineHeight: 1.25 }} noWrap>
              {shopName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: UI.textMuted, mt: 0.25, lineHeight: 1.3 }} noWrap>
              {shopLoc}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => { e.stopPropagation(); handleViewStore(); }}
            startIcon={<HiOutlineBuildingStorefront style={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '12px',
              textTransform: "none",
              fontWeight: 800,
              fontSize: '0.78rem',
              py: 0.85,
              bgcolor: UI.primary,
              color: UI.onPrimary,
              boxShadow: "none",
              "&:hover": { bgcolor: UI.secondary, boxShadow: "none" },
            }}
          >
            View Store
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ item, onClick }) {
  const Icon = item.icon;
  return (
    <Card
      onClick={onClick}
      sx={{
        minWidth: { xs: 84, sm: 100 },
        width: { xs: 84, sm: 100 },
        height: { xs: 90, sm: 106 },
        flexShrink: 0,
        scrollSnapAlign: "start",
        border: `1.5px solid #e2e8f0`,
        borderRadius: '18px',
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: item.bg || "#ffffff",
        cursor: 'pointer',
        p: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#10b981',
          transform: 'translateY(-2px)',
          boxShadow: "0 8px 20px rgba(16, 185, 129, 0.12)",
        }
      }}
    >
      {item.image ? (
        <Box
          component="img"
          src={item.image}
          alt={item.label}
          sx={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover', mb: 0.6 }}
        />
      ) : Icon ? (
        <Icon style={{ fontSize: 26, color: '#16a34a', marginBottom: 6 }} />
      ) : (
        <ShoppingBagOutlinedIcon sx={{ fontSize: 26, color: '#16a34a', mb: 0.6 }} />
      )}
      <Typography
        sx={{
          fontSize: { xs: '0.68rem', sm: '0.74rem' },
          fontWeight: 800,
          color: '#0f172a',
          textAlign: "center",
          lineHeight: 1.15,
          maxHeight: '2.4em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.label}
      </Typography>
    </Card>
  );
}

function AllCategoriesSection({ onCategoryClick }) {
  return (
    <Box
      id="categories-section"
      sx={{
        borderRadius: '20px',
        bgcolor: '#ffffff',
        border: `1px solid #e2e8f0`,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
        px: 2,
        py: 2,
        mt: 0.5,
        mb: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box>
          <Typography
            component="h2"
            sx={{
              color: "#0f172a",
              fontSize: '1.15rem',
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            Shop by Category
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            Instant 10-15 min dispatch • Sourced from verified sellers
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => onCategoryClick?.("Vegetables & Fruits")}
          sx={{ textTransform: 'none', fontWeight: 800, color: '#10b981', fontSize: '0.78rem' }}
        >
          See All →
        </Button>
      </Stack>
      <ScrollRow gap={1.25} pb={0.5}>
        {ALL_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.label}
            item={cat}
            onClick={() => onCategoryClick?.(cat.label)}
          />
        ))}
      </ScrollRow>
    </Box>
  );
}

function AdBannerCard({ item }) {
  return (
    <Card
      sx={{
        ...sectionCardStyles(),
        minWidth: { xs: "80vw", sm: 300 },
        width: { xs: "80vw", sm: 300 },
        maxWidth: 300,
        flexShrink: 0,
        scrollSnapAlign: "start",
        bgcolor: alpha(UI.primary, 0.08),
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
        <Stack spacing={0.95}>
          <PlaceholderImage label="Ads Banner Placeholder" minHeight={112} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: UI.text, lineHeight: 1.25 }}>
              {item.title}
            </Typography>
            <Typography sx={{ fontSize: 10.8, color: UI.textMuted, lineHeight: 1.38, mt: 0.25 }}>
              {item.caption}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PlayCircleOutlineRoundedIcon sx={{ fontSize: 17 }} />}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 1.6,
              textTransform: "none",
              fontWeight: 800,
              fontSize: 11,
              minHeight: 34,
              bgcolor: UI.primary,
              color: UI.onPrimary,
              boxShadow: "none",
              "&:hover": { bgcolor: UI.secondary, boxShadow: "none" },
            }}
          >
            Watch & Earn Ads
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function OnlineB2BAdCard({ item }) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate('/business/online-marketplace')}
      sx={{
        minWidth: { xs: "82vw", sm: 310 },
        width: { xs: "82vw", sm: 310 },
        maxWidth: 320,
        height: 154,
        flexShrink: 0,
        scrollSnapAlign: "start",
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: "hidden",
        position: "relative",
        cursor: 'pointer',
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
        backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.65) 60%, rgba(15, 23, 42, 0.25) 100%), url("${item.image}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: 'transform 0.22s ease-in-out',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          p: 1.75,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: item.badgeColor || UI.primary,
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {item.badge || 'Online B2B Ads'}
          </Box>
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              color: '#fff',
              fontSize: 9.5,
              fontWeight: 700,
              px: 0.9,
              py: 0.25,
              borderRadius: 999,
            }}
          >
            {item.moq || 'Wholesale'}
          </Box>
        </Stack>

        <Box sx={{ maxWidth: "85%" }}>
          <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 900, lineHeight: 1.2 }}>
            {item.title}
          </Typography>
          <Typography sx={{ color: alpha("#fff", 0.9), fontSize: 11, fontWeight: 600, mt: 0.35 }}>
            {item.offer}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 0.5 }}>
          <Typography sx={{ color: alpha("#fff", 0.75), fontSize: 10, fontWeight: 700 }}>
            {item.supplier || 'Verified Merchant'}
          </Typography>
          <Box
            sx={{
              bgcolor: '#fff',
              color: '#0f172a',
              px: 1.25,
              py: 0.45,
              borderRadius: '8px',
              fontSize: 10.5,
              fontWeight: 800,
            }}
          >
            {item.cta || 'View Offer →'}
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

function CityCard({ city }) {
  return (
    <Card
      sx={{
        ...sectionCardStyles(),
        minWidth: 148,
        width: 148,
        height: 166,
        flexShrink: 0,
        scrollSnapAlign: "start",
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        borderRadius: '16px',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url("${city.image}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' }
      }}
    >
      <Box sx={{ position: 'absolute', bottom: 13, left: 13, right: 13 }}>
        <Typography sx={{ color: '#fff', fontSize: 15, fontWeight: 800, mb: 0.2, lineHeight: 1.15 }}>
          {city.name}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 10.5, fontWeight: 600 }}>
          {city.businesses} businesses
        </Typography>
      </Box>
    </Card>
  );
}

function ProductCard({ product }) {
  const [qty, setQty] = React.useState(0);
  const [wished, setWished] = React.useState(false);

  const displayPrice = product.price && product.price !== '₹ —' && product.price !== 'Rs. —'
    ? product.price
    : (product.mrp ? `Rs. ${Math.round(parseInt(String(product.mrp).replace(/\D/g, '') || '500') * 0.75)}` : 'Rs. 499');

  const handleAdd = () => {
    setQty(1);
    try {
      const raw = localStorage.getItem('tri_business_b2b_cart');
      const cart = raw ? JSON.parse(raw) : { items: [] };
      const items = cart.items || [];
      const existing = items.find(i => String(i.id) === String(product.id));
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        items.push({
          id: product.id,
          title: product.name,
          price: parseInt(String(displayPrice).replace(/\D/g, '') || '499'),
          image: product.image,
          quantity: 1,
        });
      }
      localStorage.setItem('tri_business_b2b_cart', JSON.stringify({ ...cart, items }));
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}
  };

  const handleIncrement = () => {
    setQty(prev => prev + 1);
    try {
      const raw = localStorage.getItem('tri_business_b2b_cart');
      if (raw) {
        const cart = JSON.parse(raw);
        const item = (cart.items || []).find(i => String(i.id) === String(product.id));
        if (item) {
          item.quantity += 1;
          localStorage.setItem('tri_business_b2b_cart', JSON.stringify(cart));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (_) {}
  };

  const handleDecrement = () => {
    setQty(prev => {
      const next = prev - 1;
      try {
        const raw = localStorage.getItem('tri_business_b2b_cart');
        if (raw) {
          const cart = JSON.parse(raw);
          if (next <= 0) {
            cart.items = (cart.items || []).filter(i => String(i.id) !== String(product.id));
          } else {
            const item = (cart.items || []).find(i => String(i.id) === String(product.id));
            if (item) item.quantity = next;
          }
          localStorage.setItem('tri_business_b2b_cart', JSON.stringify(cart));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (_) {}
      return Math.max(0, next);
    });
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: UI.primary,
          boxShadow: '0 6px 18px rgba(5, 150, 105, 0.12)',
        },
      }}
    >
      {/* Wishlist Button Top-Right Overlay */}
      <IconButton
        size="small"
        onClick={() => setWished(!wished)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          p: 0.5,
          color: wished ? '#ef4444' : '#94a3b8',
          '&:hover': { bgcolor: '#ffffff' },
        }}
      >
        <FavoriteBorderRoundedIcon sx={{ fontSize: 16, color: wished ? '#ef4444' : '#94a3b8' }} />
      </IconButton>

      {/* Product Image Frame */}
      <Box
        sx={{
          height: { xs: 130, sm: 150 },
          width: '100%',
          bgcolor: '#f8fafc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1.25,
          overflow: 'hidden',
          borderRadius: '16px 16px 0 0',
        }}
      >
        <Box
          component="img"
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
          }}
          sx={{
            maxHeight: { xs: 110, sm: 130 },
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: 1.5 } }}>
        <Box>
          {product.packSize && (
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontSize: '0.68rem',
                fontWeight: 800,
                px: 0.75,
                py: 0.2,
                borderRadius: '6px',
                mb: 0.5,
              }}
            >
              {product.packSize}
            </Box>
          )}

          <Typography
            sx={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: UI.text,
              lineHeight: 1.25,
              height: '2.5em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.name}
          </Typography>

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: UI.primary, lineHeight: 1 }}>
              {displayPrice}
            </Typography>
            {product.mrp && (
              <Typography sx={{ fontSize: '0.72rem', color: UI.textMuted, textDecoration: 'line-through', fontWeight: 600 }}>
                {product.mrp}
              </Typography>
            )}
            {product.discount && (
              <Box
                sx={{
                  px: 0.6,
                  py: 0.15,
                  borderRadius: '6px',
                  bgcolor: alpha(UI.primary, 0.12),
                  color: UI.primary,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                {product.discount}
              </Box>
            )}
          </Stack>
        </Box>

        {/* Action Button: Add or Stepper */}
        <Box sx={{ mt: 1.5 }}>
          {qty === 0 ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdd}
              startIcon={<AddShoppingCartRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                bgcolor: UI.primary,
                color: '#ffffff',
                boxShadow: 'none',
                py: 0.75,
                '&:hover': { bgcolor: UI.secondary, boxShadow: 'none' },
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                bgcolor: '#ecfdf5',
                border: '1.5px solid #10b981',
                borderRadius: '10px',
                p: 0.25,
              }}
            >
              <IconButton size="small" onClick={handleDecrement} sx={{ color: '#059669', p: 0.5 }}>
                <RemoveRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#059669' }}>
                {qty}
              </Typography>
              <IconButton size="small" onClick={handleIncrement} sx={{ color: '#059669', p: 0.5 }}>
                <AddRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function StickyDeliveryButton({ onClick }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 74, sm: 78 },
        zIndex: 20,
        mb: 1.35,
        mx: -0.25,
        pt: 0.1,
        pb: 0.65,
        bgcolor: UI.surface,
      }}
    >
      <Button
        fullWidth
        variant="contained"
        onClick={onClick}
        sx={{
          minHeight: 40,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 900,
          fontSize: 12,
          bgcolor: UI.primary,
          color: UI.onPrimary,
          boxShadow: "0 10px 22px rgba(34,139,34,0.20)",
          "&:hover": {
            bgcolor: UI.secondary,
            boxShadow: "0 10px 22px rgba(34,139,34,0.20)",
          },
        }}
      >
        Tri Sarathi Delivery
      </Button>
    </Box>
  );
}

function AppDrawer({ open, onClose, onAction, profile, orderCount = 0, shopsCount = 0, adsCount = 0 }) {
  const displayName = profile?.business_name || profile?.full_name || localStorage.getItem('business_full_name') || 'Business User';
  const displayPhone = profile?.mobile_number || profile?.username || localStorage.getItem('business_phone') || '';
  const username = profile?.username || localStorage.getItem('username_business') || '';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BU';

  const isOnline = String(profile?.service_mode || localStorage.getItem('service_mode_business') || '').toUpperCase() === 'ONLINE';

  const menuGroups = [
    {
      title: "Account",
      items: [
        { label: "Orders", action: "orders", icon: LuFileText },
        { label: "Completed Orders", action: "completedOrders", icon: LuFileText },
        { label: "Wallet", action: "wallet", icon: AccountBalanceWalletOutlinedIcon },
        { label: "Profile & Security", action: "profile", icon: HiOutlineUser },
      ]
    },
    {
      title: "Business",
      items: [
        ...(isOnline ? [] : [{ label: "My Shops", action: "addShop", icon: LuStore }]),
        { label: "Inventory Management", action: "inventoryManagement", icon: LuFileText },
        { label: "Ads Manager", action: "ads", icon: CampaignOutlinedIcon },
        { label: "Reports & Analytics", action: "reports", icon: AssignmentOutlinedIcon },
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Help Center", action: "help", icon: LuCircleHelp },
        { label: "Terms & Conditions", action: "terms", icon: LuBookOpen },
        { label: "Refund Policy", action: "refund", icon: LuInfo },
        { label: "Refer & Earn", action: "refer", icon: LuGift },
      ]
    }
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "85vw",
          maxWidth: 320,
          bgcolor: UI.surface,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: UI.text }}>
            Business Account
          </Typography>
          <IconButton onClick={onClose} sx={{ color: UI.text }}>
            <CloseRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Stack>

        {/* Scrollable Content Container */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", pb: 3 }}>
          
          {/* Profile Card */}
          <Box
            sx={{
              mx: 2,
              mt: 0.5,
              mb: 2,
              p: 2,
              borderRadius: 4,
              background: "linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)",
              color: "#fff",
              position: "relative"
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => { onClose(); onAction("profile"); }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 18,
                  border: "2px solid rgba(255, 255, 255, 0.4)"
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontSize: 15, fontWeight: 950, color: "#fff", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </Typography>
                  <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#4ade80" }} />
                </Stack>
                <Typography sx={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.85)", fontWeight: 600 }}>
                  @{username || "business_user"}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(255, 255, 255, 0.8)", mt: 0.25 }}>
                  Retail Store · Gulbarga
                </Typography>
              </Box>
              <KeyboardArrowRightRoundedIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
            </Stack>

            {/* Verified badge pill */}
            <Box sx={{ mt: 1.5, display: "flex", gap: 1, alignItems: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 999,
                }}
              >
                <ShieldRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: 0.2 }}>
                  Verified Business
                </Typography>
              </Box>
            </Box>

            {/* Edit profile link */}
            <Button
              variant="text"
              onClick={() => {
                onClose();
                onAction("profile");
              }}
              sx={{
                mt: 1.5,
                p: 0,
                textTransform: "none",
                color: "#fff",
                fontWeight: 800,
                fontSize: 11.5,
                minWidth: 0,
                minHeight: 0,
                justifyContent: "flex-start",
                "&:hover": { bgcolor: "transparent", opacity: 0.9 }
              }}
            >
              Edit Business Profile →
            </Button>
          </Box>

          {/* Metrics Row (Total Orders, Wallet Balance etc.) */}
          <Card
            elevation={0}
            sx={{
              mx: 2,
              mb: 2.5,
              border: "1px solid #e2e8f0",
              borderRadius: 3.5,
              bgcolor: "#fff"
            }}
          >
            <CardContent sx={{ p: "12px !important" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5 }}>
                
                {/* Total Orders */}
                <Box 
                  onClick={() => { onClose(); onAction("orders"); }}
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", px: 0.5 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, width: 28 }}>
                    <ShoppingBagOutlinedIcon style={{ fontSize: 18, color: UI.primary }} />
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 900, color: UI.text, mt: 0.25 }}>
                    {orderCount}
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: UI.textMuted, textAlign: "center", mt: 0.25, lineHeight: 1.1 }}>
                    Total Orders
                  </Typography>
                </Box>

                {/* Wallet Balance */}
                <Box 
                  onClick={() => { onClose(); onAction("wallet"); }}
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", px: 0.5, borderLeft: "1px solid #f1f5f9" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, width: 28 }}>
                    <AccountBalanceWalletOutlinedIcon style={{ fontSize: 18, color: UI.primary }} />
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 900, color: UI.text, mt: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
                    ₹{profile?.walletBalance !== undefined ? Math.floor(profile.walletBalance) : "0"}
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: UI.textMuted, textAlign: "center", mt: 0.25, lineHeight: 1.1 }}>
                    Wallet Balance
                  </Typography>
                </Box>

                {/* Total Shops */}
                <Box 
                  onClick={() => { onClose(); onAction("addShop"); }}
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", px: 0.5, borderLeft: "1px solid #f1f5f9" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, width: 28 }}>
                    <StorefrontOutlinedIcon style={{ fontSize: 18, color: UI.primary }} />
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 900, color: UI.text, mt: 0.25 }}>
                    {shopsCount}
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: UI.textMuted, textAlign: "center", mt: 0.25, lineHeight: 1.1 }}>
                    Total Shops
                  </Typography>
                </Box>

                {/* Active Ads */}
                <Box 
                  onClick={() => { onClose(); onAction("ads"); }}
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", px: 0.5, borderLeft: "1px solid #f1f5f9" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, width: 28 }}>
                    <CampaignOutlinedIcon style={{ fontSize: 18, color: UI.primary }} />
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 900, color: UI.text, mt: 0.25 }}>
                    {adsCount}
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: UI.textMuted, textAlign: "center", mt: 0.25, lineHeight: 1.1 }}>
                    Active Ads
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions Title & Grid */}
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: UI.text, mb: 1.2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              {[
                { label: "Wallet", action: "wallet", icon: AccountBalanceWalletOutlinedIcon },
                { label: "Orders", action: "orders", icon: LuFileText },
                { label: "KYC", action: "kyc", icon: LuShieldCheck },
                ...(isOnline ? [] : [{ label: "Add Shop", action: "addShop", icon: StorefrontOutlinedIcon }]),
                { label: "Ads Manager", action: "ads", icon: CampaignOutlinedIcon },
                { label: "Reports", action: "reports", icon: AssignmentOutlinedIcon },
              ].map((btn) => {
                const ActionIcon = btn.icon;
                return (
                  <Button
                    key={btn.label}
                    onClick={() => {
                      onClose();
                      onAction(btn.action);
                    }}
                    sx={{
                      flexDirection: "column",
                      textTransform: "none",
                      bgcolor: "rgba(34, 139, 34, 0.04)",
                      border: "1px solid rgba(34, 139, 34, 0.08)",
                      borderRadius: 2.2,
                      py: 1.5,
                      px: 0.5,
                      minWidth: 0,
                      color: UI.text,
                      "&:hover": { bgcolor: "rgba(34, 139, 34, 0.08)" }
                    }}
                  >
                    <ActionIcon sx={{ fontSize: 20, color: UI.primary, mb: 0.5 }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: UI.text }}>
                      {btn.label}
                    </Typography>
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Grouped lists */}
          <Stack spacing={2.5} sx={{ px: 2, mb: 1 }}>
            {menuGroups.map((group) => (
              <Box key={group.title}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: UI.text, mb: 0.8 }}>
                  {group.title}
                </Typography>
                <Stack spacing={0.25} sx={{ border: "1px solid #f1f5f9", borderRadius: 3, overflow: "hidden", bgcolor: "#fff" }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.label}
                        onClick={() => onAction(item.action)}
                        sx={{
                          justifyContent: "space-between",
                          textTransform: "none",
                          color: UI.text,
                          borderRadius: 0,
                          px: 1.5,
                          py: 1.1,
                          bgcolor: "transparent",
                          borderBottom: "1px solid #f8fafc",
                          "&:last-child": { borderBottom: "none" },
                          "&:hover": { bgcolor: "#f8fafc" }
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          {typeof Icon === 'function' ? (
                            <Icon style={{ color: UI.primary, fontSize: 18 }} />
                          ) : (
                            <Icon sx={{ color: UI.primary, fontSize: 18 }} />
                          )}
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: UI.text }}>
                            {item.label}
                          </Typography>
                        </Stack>
                        <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: "#64748b" }} />
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Logout Section */}
          <Box sx={{ px: 2, mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onAction("logout")}
              startIcon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 900,
                fontSize: 13,
                borderColor: "#fca5a5",
                color: "#ef4444",
                bgcolor: "#fef2f2",
                "&:hover": {
                  borderColor: "#ef4444",
                  bgcolor: "#fee2e2"
                }
              }}
            >
              Logout
            </Button>
          </Box>

        </Box>

        {/* Footer Brand Logo Box */}
        <Box sx={{ px: 2, pb: 2, pt: 1.5, borderTop: "1px solid #e2e8f0" }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 3,
              bgcolor: "#f8fafc",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 1.3
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2.2,
                bgcolor: "rgba(34, 139, 34, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <ShieldRoundedIcon sx={{ fontSize: 18, color: UI.primary }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: UI.text }}>
                Trikonekt Business
              </Typography>
              <Typography sx={{ fontSize: 10, color: UI.textMuted }}>
                Version 2.3.0
              </Typography>
            </Box>
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#228B22" }} />
          </Box>
        </Box>

      </Box>
    </Drawer>
  );
}

function MobileFooterNav({ activeItem, onNavigate }) {
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        zIndex: 1300,
        bgcolor: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #e2e8f0",
        boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.03)",
        pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
        pt: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: 640,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: `repeat(${FOOTER_ITEMS.length}, minmax(0, 1fr))`,
          alignItems: "center",
          height: 56,
          px: 1,
        }}
      >
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = activeItem === item.id;
          const scanner = item.raised;
          const textColor = selected ? UI.primary : UI.textMuted;

          return (
            <Button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              sx={{
                minWidth: 0,
                px: 0,
                py: 0.5,
                height: "100%",
                borderRadius: 0,
                textTransform: "none",
                color: scanner ? UI.textMuted : textColor,
                bgcolor: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                lineHeight: 1,
                width: "100%",
                transform: scanner ? "translateY(-10px)" : "none",
                "&:hover": {
                  bgcolor: "transparent",
                },
              }}
            >
              {scanner ? (
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor: alpha(UI.primary, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: UI.primary,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 12px ${alpha(UI.primary, 0.3)}`,
                    }}
                  >
                    <Icon style={{ fontSize: 22, strokeWidth: 2 }} />
                  </Box>
                </Box>
              ) : (
                <Icon style={{ fontSize: 20, strokeWidth: 2, color: selected ? UI.primary : '#64748b' }} />
              )}
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: selected ? 800 : 600,
                  textAlign: "center",
                  color: selected ? UI.primary : '#64748b',
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

function BusinessDashboard() {
  const navigate = useNavigate();
  const [activeFooterItem, setActiveFooterItem] = useState("home-top");
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      return localStorage.getItem("selectedCity") || localStorage.getItem("user_pincode") || "560091";
    } catch (_) {
      return "560091";
    }
  });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [b2bShops, setB2bShops] = useState([]);
  const [profile, setProfile] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [activeShop, setActiveShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [locationDrawerOpen, setLocationDrawerOpen] = useState(false);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    try {
      localStorage.setItem("selectedCity", cityName);
      localStorage.setItem("user_pincode", cityName);
    } catch (_) {}
  };
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    business_name: '',
    mobile_number: '',
    email: '',
    age: '',
    address: '',
    commission_percent: '',
    service_mode: 'BOTH'
  });
  const joinPrimePath = "/demo/join-prime";
  const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
  // Read service mode from localStorage (set on login/registration)
  const serviceMode = localStorage.getItem('service_mode_business') || 'OFFLINE';
  const isOnlineMerchant = serviceMode === 'ONLINE' || serviceMode === 'BOTH';

  const [sponsoredShops, setSponsoredShops] = useState(ONLINE_B2B_ADS);
  const [featuredProducts, setFeaturedProducts] = useState(PRODUCTS);
  const [bannerAds, setBannerAds] = useState(ADS);
  const [primeModalOpen, setPrimeModalOpen] = useState(false);
  const [primeFeatureName, setPrimeFeatureName] = useState('access this feature');

  // Dynamic metrics fetching (Ads count)
  useEffect(() => {
    const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain');
    if (!token) return;

    fetch(`${CAPTAIN_API_URL}/captain/merchant/ads`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setAdsCount(data.length);
        }
      })
      .catch(err => console.warn("Failed to fetch ads count:", err));
  }, [CAPTAIN_API_URL]);

  // Dynamic metrics fetching (Orders count)
  useEffect(() => {
    const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain');
    if (!token || !profile) return;

    const cat = profile.category || localStorage.getItem('user_category') || 'merchant';
    const isB2B = cat === 'merchant' || cat === 'merchant_business';

    if (isB2B) {
      fetch(`${CAPTAIN_API_URL}/captain/business/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data)) {
            setOrderCount(data.length);
          }
        })
        .catch(err => console.warn("Failed to fetch B2B orders count:", err));
    } else {
      if (!shops || shops.length === 0) {
        setOrderCount(0);
        return;
      }
      
      const fetchShopOrders = async () => {
        let total = 0;
        for (const shop of shops) {
          try {
            const res = await fetch(`${CAPTAIN_API_URL}/captain/merchant/shops/${shop.id}/orders`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                total += data.length;
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch B2C orders for shop ${shop.id}:`, e);
          }
        }
        setOrderCount(total);
      };
      
      fetchShopOrders();
    }
  }, [shops, profile, CAPTAIN_API_URL]);

  useEffect(() => {
    // Fetch all marketplace ads in a single call
    fetch(`${CAPTAIN_API_URL}/api/ads/all?bannerLimit=6&shopLimit=8&productLimit=8`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        if (Array.isArray(data.sponsored_shops) && data.sponsored_shops.length > 0) {
          const apiAds = data.sponsored_shops.map(ad => ({
            id: ad.id,
            badge: "⚡ Wholesale Deal",
            badgeColor: "#dc2626",
            title: ad.title || ad.shop_name || 'Sponsored Shop',
            offer: ad.description || 'Exclusive wholesale trade offer',
            image: resolveImageUrl(ad.image_url || ad.shop_image) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
            shopId: ad.shop_id,
            cta: 'View Offer →',
            moq: 'Wholesale Trade',
            supplier: 'Verified Supplier',
          }));
          setSponsoredShops([...apiAds, ...ONLINE_B2B_ADS]);
        }
        if (Array.isArray(data.featured_products) && data.featured_products.length > 0) {
          setFeaturedProducts(data.featured_products.map(ad => {
            const rawPrice = Number(ad.product_price) || (ad.product_mrp ? Math.round(Number(ad.product_mrp) * 0.75) : 349);
            const rawMrp = Number(ad.product_mrp) || Math.round(rawPrice * 1.3);
            const discount = Math.max(10, Math.round(((rawMrp - rawPrice) / rawMrp) * 100));
            return {
              id: ad.id,
              name: ad.product_title || ad.title || 'Wholesale Featured Product',
              mrp: `Rs. ${Math.round(rawMrp).toLocaleString()}`,
              price: `Rs. ${Math.round(rawPrice).toLocaleString()}`,
              discount: `${discount}% OFF`,
              packSize: ad.pack_size || 'Wholesale Pack',
              image: resolveImageUrl(ad.image_url || ad.product_image) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
              productId: ad.product_id,
            };
          }));
        }
        if (Array.isArray(data.banners) && data.banners.length > 0) {
          setBannerAds(data.banners.map(ad => ({
            id: ad.id,
            title: ad.title,
            caption: ad.description || '',
            image: resolveImageUrl(ad.image_url) || null,
          })));
        }
      })
      .catch(() => { /* keep static fallbacks on error */ });
  }, [CAPTAIN_API_URL]);

  React.useEffect(() => {
    getPublicB2bMerchants()
      .then((data) => setB2bShops(data || []))
      .catch((err) => console.error("Failed to load B2B merchants:", err));

    getMerchantProfile()
      .then((data) => {
        if (data) {
          setProfile(data);
          localStorage.setItem('business_full_name', data.business_name || data.full_name || '');
          localStorage.setItem('business_phone', data.mobile_number || data.username || '');
          setEditForm({
            business_name: data.business_name || '',
            mobile_number: data.mobile_number || '',
            email: data.email || '',
            age: data.age != null ? String(data.age) : '',
            address: data.address || '',
            commission_percent: data.commission_percent || '',
            service_mode: data.service_mode || 'BOTH',
          });
        }
      })
      .catch((err) => console.error("Failed to load merchant profile:", err));

    listMyShops()
      .then((data) => {
        if (data && data.length > 0) {
          setShops(data);
          const savedShopId = localStorage.getItem('active_merchant_shop_id');
          const active = data.find(s => String(s.id) === savedShopId) || data[0];
          if (active) {
            setActiveShop(active);
            localStorage.setItem('active_merchant_shop_id', String(active.id));
          }
        }
      })
      .catch((err) => console.error("Failed to load merchant shops:", err));
  }, []);

  const handleScrollTo = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFooterNavigate = (action) => {
    if (action === "tri-zone-footer") {
      setToastMsg("TriZone features are coming soon!");
      return;
    }
    if (action === "city-search-section") {
      navigate("/business/nearby-stores");
      return;
    }
    if (action === "online-marketplace") {
      navigate("/business/online-marketplace");
      return;
    }
    setActiveFooterItem(action);
    if (action === "home-top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "scanner-section") {
      navigate("/demo/scanner");
    } else {
      handleScrollTo(action);
    }
  };

  const handleDrawerAction = (action) => {
    setDrawerOpen(false);
    if (action === "profile") {
      setActiveModal("edit");
      return;
    }
    if (action === "wallet") {
      setActiveModal("wallet");
      return;
    }
    if (action === "orders") {
      navigate("/business/orders");
      return;
    }
    if (action === "packages" || action === "prime") {
      navigate("/business/packages");
      return;
    }
    if (action === "passwordReset") {
      setActiveModal("passwordReset");
      return;
    }
    if (action === "addShop") {
      if (!isMerchantPrime()) {
        setPrimeFeatureName("add and register new merchant shops");
        setPrimeModalOpen(true);
        return;
      }
      navigate("/business/shops");
      return;
    }
    if (action === "onlineProducts") {
      navigate("/business/online-products");
      return;
    }
    if (action === "inventory" || action === "inventoryManagement") {
      if (!isMerchantPrime()) {
        setPrimeFeatureName("manage product inventory");
        setPrimeModalOpen(true);
        return;
      }
      navigate("/business/inventory");
      return;
    }
    if (["reports", "help"].includes(action)) {
      setToastMsg("This feature is coming soon!");
      return;
    }
    handleScrollTo(action);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setToastMsg('');
    setLoading(true);
    try {
      const p = await updateMerchantProfile({
        ...editForm,
        age: editForm.age ? parseInt(editForm.age, 10) : null,
        commission_percent: editForm.commission_percent ? parseFloat(editForm.commission_percent) : 0,
      });
      if (p) {
        setProfile(p);
        localStorage.setItem('triBusinessUser', JSON.stringify(p));
        localStorage.setItem('business_full_name', p.business_name || p.full_name || '');
        localStorage.setItem('business_phone', p.mobile_number || p.username || '');
        setToastMsg("Profile updated successfully!");
        setActiveModal(null);
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token_business');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('username_business');
    localStorage.removeItem('business_id');
    localStorage.removeItem('business_full_name');
    localStorage.removeItem('business_phone');
    localStorage.removeItem('triBusinessUser');
    localStorage.removeItem('triBusinessProfilePic');
    setActiveModal(null);
    navigate('/login');
  };

  const displayName = profile?.business_name || profile?.full_name || localStorage.getItem('business_full_name') || 'Business User';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BU';

  return (
    <ThemeProvider theme={dashboardTheme}>
      <AppShell activeTab="/business-dashboard" title="Dashboard">
      <div className="ce-app" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box 
        sx={{ 
          maxWidth: { xs: 640, lg: 1240 }, 
          margin: '0 auto',
          px: { xs: 1, sm: 2, lg: 3 }
        }}
      >
        {/* Hero Promo Banner (Desktop & Mobile) */}
        <Box
          sx={{
            mb: 2.5,
            p: { xs: 2.5, sm: 3.5, lg: 4 },
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 60%, #047857 100%)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(5, 150, 105, 0.22)'
          }}
        >
          {/* Luminous background accent */}
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', pointerEvents: 'none' }} />

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ maxWidth: 650, position: 'relative' }}>
              <Chip label="⚡ B2B QUICK COMMERCE & WHOLESALE" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 900, fontSize: '10.5px', mb: 1.25 }} />
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.75, letterSpacing: '-0.02em', fontSize: { xs: '1.25rem', sm: '1.75rem' } }}>
                Grow Your Business With Trikonekt
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.82rem', sm: '0.95rem' }, mb: 2, lineHeight: 1.45 }}>
                Connect with verified wholesale suppliers, order inventory with 15-30m dispatch, and scale your sales pipeline across India.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/business/online-marketplace')}
                  startIcon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    flex: 1,
                    height: '42px',
                    bgcolor: '#ffffff',
                    color: '#064e3b',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    whiteSpace: 'nowrap',
                    px: 2,
                    '&:hover': { bgcolor: '#f0fdf4' },
                    '&:active': { transform: 'scale(0.97)' }
                  }}
                >
                  Wholesale Marketplace
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/business/inventory')}
                  startIcon={<Inventory2RoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    flex: 1,
                    height: '42px',
                    bgcolor: 'rgba(255, 255, 255, 0.16)',
                    borderColor: 'rgba(255, 255, 255, 0.45)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    borderRadius: '12px',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    px: 2,
                    backdropFilter: 'blur(4px)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)', borderColor: '#ffffff' },
                    '&:active': { transform: 'scale(0.97)' }
                  }}
                >
                  Manage Inventory
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* 4 Merchant KPI Metric Cards with Modern World-Class Light Design */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.75, mb: 3 }}>
          <Card
            elevation={0}
            onClick={() => navigate('/business/shops')}
            sx={{
              p: 2,
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              '&:hover': { borderColor: '#10b981', transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.1)' }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#ecfdf5', color: '#047857', display: 'grid', placeItems: 'center', border: '1px solid #a7f3d0' }}>
                <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Shops
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {b2bShops.length || shops.length || 1}
            </Typography>
          </Card>

          <Card
            elevation={0}
            onClick={() => navigate('/business/orders')}
            sx={{
              p: 2,
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              '&:hover': { borderColor: '#2563eb', transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.1)' }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', border: '1px solid #bfdbfe' }}>
                <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Orders
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {orderCount || 0}
            </Typography>
          </Card>

          <Card
            elevation={0}
            onClick={() => navigate('/business/profile')}
            sx={{
              p: 2,
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              '&:hover': { borderColor: '#059669', transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.1)' }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#f0fdf4', color: '#059669', display: 'grid', placeItems: 'center', border: '1px solid #bbf7d0' }}>
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Wallet Balance
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', letterSpacing: '-0.5px' }}>
              ₹{Number(profile?.wallet_balance || 0).toLocaleString('en-IN')}
            </Typography>
          </Card>

          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#fffbeb', color: '#d97706', display: 'grid', placeItems: 'center', border: '1px solid #fde68a' }}>
                <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Rating
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706', letterSpacing: '-0.5px' }}>
              4.8 ★
            </Typography>
          </Card>
        </Box>

        {/* Prime Membership Status Banner */}
        <Box
          onClick={() => navigate('/business/packages')}
          sx={{
            p: 2,
            borderRadius: '16px',
            border: '1.5px solid #f59e0b',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.1)',
            transition: 'all 0.18s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)' },
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: '#f59e0b',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#92400e' }}>
                  {isMerchantPrime() ? 'Trikonekt Member Active' : 'Become a Member • ₹999 / Year'}
                </Typography>
                <Chip
                  size="small"
                  label={isMerchantPrime() ? 'MEMBER' : 'FREE'}
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    bgcolor: isMerchantPrime() ? '#10b981' : '#f59e0b',
                    color: '#fff',
                  }}
                />
              </Stack>
              <Typography sx={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600, mt: 0.2 }}>
                {isMerchantPrime()
                  ? 'All merchant features, shops & wholesale ordering unlocked'
                  : 'Become a Member • ₹999/Year like OLX for unlimited shops, products & orders'}
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: '#d97706',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.72rem',
              borderRadius: '10px',
              px: 1.75,
              py: 0.6,
              textTransform: 'none',
              boxShadow: 'none',
              flexShrink: 0,
              '&:hover': { bgcolor: '#b45309', boxShadow: 'none' },
            }}
          >
            {isMerchantPrime() ? 'View Plan →' : 'Become Member →'}
          </Button>
        </Box>

        <Stack spacing={1.5}>

          <Box id="online-b2b-ads-section" sx={{ mt: -0.25 }}>
            <SectionShell
              title="Online B2B Ads"
              subtitle="Sponsored wholesale and trade offers"
            >
              <ScrollRow gap={1} pb={0.15}>
                {sponsoredShops.map((item) => (
                  <OnlineB2BAdCard key={item.id} item={item} />
                ))}
              </ScrollRow>
            </SectionShell>
          </Box>

          {/* Blinkit Category Gateway */}
          <AllCategoriesSection
            onCategoryClick={(categoryLabel) => navigate(`/business/online-marketplace?category=${encodeURIComponent(categoryLabel)}`)}
          />

          <Box id="business-shops">
            <SectionShell
              title="Nearby Stores"
              subtitle="Browse B2B merchants in your area"
            >
              {Array.isArray(b2bShops) && b2bShops.length > 0 ? (
                <ScrollRow gap={0.9}>
                  {b2bShops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} />
                  ))}
                </ScrollRow>
              ) : (
                <Typography sx={{ p: 2, fontSize: 13, color: UI.textMuted, textAlign: "center" }}>
                  No nearby stores found right now.
                </Typography>
              )}
            </SectionShell>
          </Box>

          <Stack direction="row" spacing={1} sx={{ px: 0.15 }}>
            <Button
              fullWidth
              onClick={() => navigate("/business/for-better-society")}
              sx={{
                borderRadius: 2.5,
                py: 1.55,
                textTransform: "none",
                display: "flex",
                flexDirection: "column",
                gap: 0.55,
                bgcolor: alpha("#8b5cf6", 0.08),
                color: "#6d28d9",
                boxShadow: "none",
                border: `1px solid ${alpha("#8b5cf6", 0.15)}`,
                "&:hover": { bgcolor: alpha("#8b5cf6", 0.12), boxShadow: "none" }
              }}
            >
              <HandshakeOutlinedIcon sx={{ fontSize: 26, color: "#6d28d9" }} />
              <Typography sx={{ fontWeight: 800, fontSize: 12.2, lineHeight: 1.2, textAlign: "center" }}>For Better Society</Typography>
            </Button>
            <Button
              fullWidth
              onClick={() => navigate("/business/inventory")}
              sx={{
                borderRadius: 2.5,
                py: 1.55,
                textTransform: "none",
                display: "flex",
                flexDirection: "column",
                gap: 0.55,
                bgcolor: alpha("#10b981", 0.08),
                color: "#047857",
                boxShadow: "none",
                border: `1px solid ${alpha("#10b981", 0.15)}`,
                "&:hover": { bgcolor: alpha("#10b981", 0.12), boxShadow: "none" }
              }}
            >
              <LuFileText size={26} color="#047857" />
              <Typography sx={{ fontWeight: 800, fontSize: 12.2, lineHeight: 1.2, textAlign: "center" }}>Tri Inventory & Billing</Typography>
            </Button>
          </Stack>

          {/* Online B2B actions — browsing and own-product management stay separate */}
          {isOnlineMerchant && (
            <Box sx={{ mb: 1 }}>
              <SectionShell
                title="Online B2B"
                subtitle="Browse marketplace products or manage only your own listings"
              >
                <Stack spacing={1.25}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<HiOutlineShoppingCart size={20} />}
                    onClick={() => navigate('/business/online-marketplace')}
                    sx={{
                      bgcolor: UI.primary,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '12px',
                      py: 1.4,
                      fontSize: '0.95rem',
                      '&:hover': { bgcolor: UI.secondary },
                    }}
                  >
                    Browse B2B Online Marketplace
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LuPackage size={20} />}
                    onClick={() => navigate('/business/online-products')}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#2563eb',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '12px',
                      py: 1.25,
                      fontSize: '0.9rem',
                      '&:hover': { bgcolor: 'rgba(59,130,246,0.08)', borderColor: '#2563eb' },
                    }}
                  >
                    Manage My Online Products
                  </Button>
                </Stack>
              </SectionShell>
            </Box>
          )}

          <Box id="product-section">
            <SectionShell
              title="Deals for You"
              subtitle="Discounted products picked for your area"
            >
              {/* <StickyDeliveryButton onClick={() => navigate("/business/tri-sarathi-delivery")} /> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                  gap: { xs: 1, md: 2 },
                  width: "100%",
                }}
              >
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Box>
            </SectionShell>
          </Box>

        </Stack>
      </Box>

      {/* Edit Profile Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'edit'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, pb: 2 }}>Edit Business Profile</Typography>
        <Box component="form" onSubmit={handleEditSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Business Name"
              fullWidth
              value={editForm.business_name}
              onChange={(e) => setEditForm(p => ({ ...p, business_name: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha(UI.text, 0.15) },
                  '&:hover fieldset': { borderColor: UI.primary },
                  '&.Mui-focused fieldset': { borderColor: UI.primary, borderWidth: 2 },
                },
                '& .MuiInputLabel-root': { color: UI.textMuted, '&.Mui-focused': { color: UI.primary } },
                '& .MuiInputBase-input': { fontWeight: 600, color: UI.text },
              }}
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={editForm.mobile_number}
              onChange={(e) => setEditForm(p => ({ ...p, mobile_number: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha(UI.text, 0.15) },
                  '&:hover fieldset': { borderColor: UI.primary },
                  '&.Mui-focused fieldset': { borderColor: UI.primary, borderWidth: 2 },
                },
                '& .MuiInputLabel-root': { color: UI.textMuted, '&.Mui-focused': { color: UI.primary } },
                '& .MuiInputBase-input': { fontWeight: 600, color: UI.text },
              }}
            />
            <TextField
              label="Email Address"
              fullWidth
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha(UI.text, 0.15) },
                  '&:hover fieldset': { borderColor: UI.primary },
                  '&.Mui-focused fieldset': { borderColor: UI.primary, borderWidth: 2 },
                },
                '& .MuiInputLabel-root': { color: UI.textMuted, '&.Mui-focused': { color: UI.primary } },
                '& .MuiInputBase-input': { fontWeight: 600, color: UI.text },
              }}
            />
            <TextField
              label="Age"
              fullWidth
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm(p => ({ ...p, age: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha(UI.text, 0.15) },
                  '&:hover fieldset': { borderColor: UI.primary },
                  '&.Mui-focused fieldset': { borderColor: UI.primary, borderWidth: 2 },
                },
                '& .MuiInputLabel-root': { color: UI.textMuted, '&.Mui-focused': { color: UI.primary } },
                '& .MuiInputBase-input': { fontWeight: 600, color: UI.text },
              }}
            />
            <TextField
              label="Business Address"
              fullWidth
              multiline
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha(UI.text, 0.15) },
                  '&:hover fieldset': { borderColor: UI.primary },
                  '&.Mui-focused fieldset': { borderColor: UI.primary, borderWidth: 2 },
                },
                '& .MuiInputLabel-root': { color: UI.textMuted, '&.Mui-focused': { color: UI.primary } },
                '& .MuiInputBase-input': { fontWeight: 600, color: UI.text },
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 3, pb: 1 }}>
            <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted, fontWeight: 700 }}>Cancel</Button>
            <Button type="submit" disabled={loading} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary }, borderRadius: '12px', px: 3 }}>
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Wallet Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'wallet'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 2 }}>Wallet Balance</Typography>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)', 
          color: '#fff', 
          borderRadius: 3, 
          p: 3, 
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(34, 139, 34, 0.18)',
          mb: 3
        }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', mb: 1, fontWeight: 700 }}>Available Balance</Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 900 }}>₹ {Number(profile?.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
        </Box>
        <Button onClick={() => setActiveModal(null)} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', py: 1.25, borderRadius: '14px', '&:hover': { bgcolor: UI.secondary } }}>
          Close
        </Button>
      </Drawer>

      {/* Password Reset Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'passwordReset'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 2 }}>Reset Password</Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Current Password" type="password" fullWidth size="small" />
          <TextField label="New Password" type="password" fullWidth size="small" />
          <TextField label="Confirm New Password" type="password" fullWidth size="small" />
        </Stack>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 3, pb: 1 }}>
          <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted, fontWeight: 700 }}>Cancel</Button>
          <Button 
            onClick={() => {
              setActiveModal(null);
              setToastMsg("Password reset request submitted successfully!");
            }} 
            variant="contained" 
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', borderRadius: '12px', px: 3, '&:hover': { bgcolor: UI.secondary } }}
          >
            Submit
          </Button>
        </Stack>
      </Drawer>

      {/* KYC Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'kyc'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 1.5 }}>KYC Verification Details</Typography>
        <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6, mb: 3 }}>
          Your business profile registration is active.
          
          To upgrade your account limits, verify or submit verification documents (GSTIN, PAN, and Shop Registration certificate), please navigate to the Shop Registration dashboard or contact support.
        </Typography>
        <Button onClick={() => setActiveModal(null)} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', py: 1.25, borderRadius: '14px', '&:hover': { bgcolor: UI.secondary } }}>
          Close
        </Button>
      </Drawer>

      {/* Completed Orders Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'completedOrders'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 1.5 }}>Completed Orders</Typography>
        <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6, mb: 3 }}>
          Detailed summaries, transaction receipts, and pending customer payments are available under the Orders panel.
          
          Tap on "Go to Orders" below to view and manage customer payments.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ pb: 1 }}>
          <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted, fontWeight: 700, flex: 1 }}>Close</Button>
          <Button onClick={() => { setActiveModal(null); navigate("/business/orders"); }} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', flex: 1.5, borderRadius: '12px', py: 1.25, '&:hover': { bgcolor: UI.secondary } }}>
            Go to Orders
          </Button>
        </Stack>
      </Drawer>

      {/* Terms Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 1.5 }}>Terms & Conditions</Typography>
        <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6, mb: 3 }}>
          Welcome to Trikonekt Business. By enabling store integration, you agree to:
          
          1. Deliver genuine products to customers.
          2. Maintain correct store locations and GPS coordinates.
          3. Process eligible customer refunds in accordance with standard return windows.
          
          Trikonekt reserves the right to suspend store profiles that violate local trade guidelines.
        </Typography>
        <Button onClick={() => setActiveModal(null)} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', py: 1.25, borderRadius: '14px', '&:hover': { bgcolor: UI.secondary } }}>
          Close
        </Button>
      </Drawer>

      {/* Refund Policy Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'refund'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 1.5 }}>Refund Policy</Typography>
        <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6, mb: 3 }}>
          Standard Refund Processing:
          
          Refunds for cancelled or returned customer orders are credited back to their wallet or bank accounts within 3 to 5 business days. Merchants are requested to verify return items before approving refund requests via the Shop dashboard.
        </Typography>
        <Button onClick={() => setActiveModal(null)} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', py: 1.25, borderRadius: '14px', '&:hover': { bgcolor: UI.secondary } }}>
          Close
        </Button>
      </Drawer>

      {/* Refer Friends Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'refer'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 1.5 }}>Refer Friends</Typography>
        <Typography sx={{ color: UI.textMuted, fontSize: 14, mb: 2 }}>
          Share the joy of growing business together! Invite your friends to join Trikonekt Business using your Sponsor ID.
        </Typography>
        <Box sx={{ p: 2, bgcolor: alpha(UI.primary, 0.05), borderRadius: 2, border: `1px dashed ${UI.primary}`, textAlign: 'center', mb: 2 }}>
          <Typography variant="caption" sx={{ color: UI.textMuted, fontWeight: 700 }}>YOUR SPONSOR ID</Typography>
          <Typography variant="h6" sx={{ color: UI.primary, fontWeight: 900, mt: 0.5 }}>
            {profile?.username || localStorage.getItem('username_business') || 'TRPN8095809500'}
          </Typography>
        </Box>
        <Stack spacing={1.5} sx={{ pb: 1 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => {
              navigator.clipboard.writeText(profile?.username || localStorage.getItem('username_business') || 'TRPN8095809500');
              setToastMsg("Referral code copied to clipboard!");
            }}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', py: 1.2 }}
          >
            Copy Code
          </Button>
          <Button onClick={() => setActiveModal(null)} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', py: 1.25, borderRadius: '14px', '&:hover': { bgcolor: UI.secondary } }}>
            Close
          </Button>
        </Stack>
      </Drawer>

      {/* Logout Confirmation Drawer */}
      <Drawer
        anchor="bottom"
        open={activeModal === 'logout'}
        onClose={() => setActiveModal(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: UI.text, mb: 1.5 }}>Confirm Logout</Typography>
        <Typography sx={{ color: UI.textMuted, fontSize: 14, mb: 3 }}>
          Are you sure you want to log out of your business account? This will end your current session.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ pb: 1 }}>
          <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted, fontWeight: 700, flex: 1 }}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: 'error.main', color: '#fff', flex: 1, borderRadius: '12px', py: 1.25, '&:hover': { bgcolor: 'error.dark' } }}>
            Log Out
          </Button>
        </Stack>
      </Drawer>

      <PrimeMembershipModal
        open={primeModalOpen}
        onClose={() => setPrimeModalOpen(false)}
        featureName={primeFeatureName}
      />

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3000}
        onClose={() => setToastMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 80, sm: 24 } }}
      >
        <Alert onClose={() => setToastMsg("")} severity="info" sx={{ width: "100%", bgcolor: UI.primary, color: "#fff", "& .MuiAlert-icon": { color: "#fff" } }}>
          {toastMsg}
        </Alert>
      </Snackbar>

      {/* Floating Cart Pill if B2B cart has items */}
      {(() => {
        let sc = null;
        try { sc = JSON.parse(localStorage.getItem('tri_business_b2b_cart') || 'null'); } catch(e) {}
        const count = (sc?.items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0);
        const subtotal = (sc?.items || []).reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
        if (count <= 0) return null;
        return (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 68, sm: 80 },
              left: 0,
              right: 0,
              zIndex: 40,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              onClick={() => navigate('/business/online-marketplace')}
              sx={{
                bgcolor: '#15803d',
                color: '#ffffff',
                borderRadius: '999px',
                px: 2.25,
                py: 1.15,
                boxShadow: '0 8px 24px rgba(21, 128, 61, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                cursor: 'pointer',
                maxWidth: 420,
                width: '100%',
                transition: 'transform 0.15s, background-color 0.15s',
                '&:hover': { bgcolor: '#166534', transform: 'scale(1.02)' },
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, lineHeight: 1.1 }}>
                  View cart
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#bbf7d0', fontWeight: 700 }}>
                  {count} items • ₹{subtotal.toFixed(2)}
                </Typography>
              </Box>
              <KeyboardArrowRightRoundedIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            </Box>
          </Box>
        );
      })()}
      </div>
      </AppShell>
    </ThemeProvider>
  );
}

export default BusinessDashboard;
