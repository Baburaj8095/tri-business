import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
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
  Alert
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
  HiOutlineHandshake,
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
  LuCircleHelp
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
import SearchBar from "../../components/business/SearchBar";
import { getPublicB2bMerchants, getMerchantProfile, updateMerchantProfile } from "../../api/api";
import "../consumer-ecommerce/consumerEcommerce.css";

const UI = {
  bg: "#f1f1f1",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  textMuted: "#64748b",
  primary: "#228B22",
  secondary: "#1B4D3E",
  onPrimary: "#ffffff",
  headerGradient: "linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)",
};

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
  { label: 'Daily Needs', icon: LuGift },
  { label: 'Mobiles', icon: LuSmartphone },
  { label: 'Fashion', icon: LuShirt },
  { label: 'Furniture', icon: LuSofa },
  { label: 'Beauty', icon: LuTag },
];

const ADS = [
  { id: 1, title: "Watch & Earn", caption: "Watch short brand ads and unlock reward points." },
  { id: 2, title: "Banner Ad", caption: "Fashion offers and nearby deals for your selected area." },
  { id: 3, title: "Banner Ad", caption: "Furniture and appliance launches from local businesses." },
];

const ONLINE_B2B_ADS = [
  { id: 1, title: "Wholesale Grocery Supply", offer: "Bulk orders for local stores", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80" },
  { id: 2, title: "Fashion Distributor Deals", offer: "New stock for retailers", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80" },
  { id: 3, title: "Furniture Trade Offers", offer: "Office and shop setup packages", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80" },
  { id: 4, title: "Restaurant Vendor Network", offer: "Suppliers for daily business needs", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80" },
];

const PRODUCTS = [
  { id: 1, name: "Home Office Chair", mrp: "Rs. 12,499", price: "Rs. 9,999", discount: "20% OFF" },
  { id: 2, name: "Smart Watch Pro", mrp: "Rs. 6,799", price: "Rs. 4,999", discount: "26% OFF" },
  { id: 3, name: "Mixer Grinder", mrp: "Rs. 3,950", price: "Rs. 2,899", discount: "27% OFF" },
  { id: 4, name: "Industrial Tool Kit", mrp: "Rs. 8,400", price: "Rs. 6,299", discount: "25% OFF" },
];

const FOOTER_ITEMS = [
  { id: "home-top", label: "Home", icon: HiOutlineHome },
  { id: "tri-zone-footer", label: "Tri Zone", icon: HiOutlineSquares2X2 },
  { id: "scanner-section", label: "Scanner", icon: HiOutlineQrCode, raised: true },
  { id: "product-section", label: "Online", icon: HiOutlineGlobeAlt },
  { id: "city-search-section", label: "Nearby", icon: HiOutlineBuildingStorefront },
];

const DRAWER_ITEMS = [
  { label: "Wallet", action: "wallet", icon: LuWallet },
  { label: "Orders", action: "orders", icon: HiOutlineBuildingStorefront },
  { label: "Password Reset", action: "passwordReset", icon: LuLock },
  { label: "Add Shop", action: "addShop", icon: LuStore },
  { label: "kyc", action: "kyc", icon: LuShieldCheck },
  { label: "Completed Orders", action: "completedOrders", icon: LuFileText },
  { label: "Terms & Condition", action: "terms", icon: LuBookOpen },
  { label: "Refund Policy", action: "refund", icon: LuInfo },
  { label: "Refer Frendiends", action: "refer", icon: LuGift },
];

function sectionCardStyles() {
  return {
    borderRadius: 3,
    bgcolor: UI.surface,
    border: `1px solid ${alpha(UI.text, 0.05)}`,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    width: "100%",
    minWidth: 0,
  };
}

function SectionShell({ title, subtitle, action, children }) {
  return (
    <Card sx={sectionCardStyles()}>
      <CardContent sx={{ p: { xs: 1.35, sm: 1.8 }, "&:last-child": { pb: { xs: 1.35, sm: 1.8 } } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={0.55}
          sx={{ mb: 1.15 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 850, color: UI.text, lineHeight: 1.25 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: 11.5, color: UI.textMuted, lineHeight: 1.3, mt: 0.15 }}>
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
              bgcolor: alpha(UI.primary, 0.08),
              border: `1px solid ${alpha(UI.primary, 0.16)}`,
              boxShadow: "none",
              "&:hover": {
                bgcolor: alpha(UI.primary, 0.1),
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
                  fontFamily: "Poppins",
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
              minHeight: { xs: 32, sm: 36 },
              textTransform: "none",
              fontWeight: 800,
              fontSize: 12,
              bgcolor: UI.secondary,
              color: UI.onPrimary,
              boxShadow: "0 2px 8px rgba(27, 77, 62, 0.22)",
              "&:hover": { bgcolor: UI.secondary, boxShadow: "0 2px 8px rgba(27, 77, 62, 0.22)" },
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
  const filteredCities = TOP_CITIES.filter((city) => city.name.toLowerCase().includes(query.toLowerCase()));

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
              <MyLocationOutlinedIcon />
              <Typography fontWeight={800}>Nearby / Detect my location</Typography>
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
  return (
    <Card
      sx={{
        ...sectionCardStyles(),
        minWidth: { xs: "72vw", sm: 236 },
        width: { xs: "72vw", sm: 236 },
        maxWidth: 236,
        flexShrink: 0,
        scrollSnapAlign: "start",
      }}
    >
      <CardContent sx={{ p: 1.2, "&:last-child": { pb: 1.2 } }}>
        <Stack spacing={0.95}>
          <Box
            component="img"
            src={shop.image}
            alt={shop.name}
            sx={{
              width: "100%",
              height: 108,
              objectFit: "cover",
              borderRadius: 1.8,
              display: "block",
              bgcolor: alpha(UI.primary, 0.05),
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: UI.text, lineHeight: 1.25 }}>
              {shop.shop_name || shop.business_name || shop.full_name || "Merchant Shop"}
            </Typography>
            <Typography sx={{ fontSize: 10.8, color: UI.textMuted, mt: 0.25, lineHeight: 1.3 }}>
              {shop.city || shop.address || "Local Area"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                borderRadius: 1.6,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 11,
                minHeight: 34,
                bgcolor: UI.primary,
                color: UI.onPrimary,
                boxShadow: "none",
                "&:hover": { bgcolor: UI.secondary, boxShadow: "none" },
              }}
            >
              Follow
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FlagOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 1.6,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 11,
                minHeight: 34,
                borderColor: UI.border,
                color: UI.text,
                minWidth: 0,
                px: 1,
              }}
            >
              Report
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ item }) {
  const Icon = item.icon;
  return (
    <Card
      sx={{
        minWidth: { xs: 80, sm: 100 },
        width: { xs: 80, sm: 100 },
        height: { xs: 86, sm: 106 },
        flexShrink: 0,
        scrollSnapAlign: "start",
        border: `1px solid ${alpha("#dbe3ee", 0.74)}`,
        borderRadius: 3,
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#ffffff",
        overflow: "visible",
      }}
    >
      <Icon style={{ fontSize: 26, color: UI.primary, marginBottom: 6, strokeWidth: 2.1 }} />
      <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: UI.text, textAlign: "center", lineHeight: 1.1 }}>
        {item.label}
      </Typography>
    </Card>
  );
}

function AllCategoriesSection() {
  return (
    <Box
      id="categories-section"
      sx={{
        borderRadius: { xs: 4, sm: 4.5 },
        bgcolor: UI.surface,
        border: `1px solid ${alpha(UI.text, 0.04)}`,
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
        px: { xs: 2, sm: 2.7 },
        py: { xs: 2.1, sm: 2.5 },
        mt: 1.15,
        mb: 1.25,
      }}
    >
      <Typography
        component="h2"
        sx={{
          color: "#031933",
          fontSize: { xs: 25, sm: 31 },
          fontWeight: 900,
          lineHeight: 1.08,
          mb: { xs: 2, sm: 2.2 },
        }}
      >
        All Categories
      </Typography>
      <ScrollRow gap={{ xs: 1.3, sm: 2 }} pb={0.15}>
        {ALL_CATEGORIES.map((cat) => (
          <CategoryCard key={cat.label} item={cat} />
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
  return (
    <Card
      sx={{
        minWidth: { xs: "76vw", sm: 292 },
        width: { xs: "76vw", sm: 292 },
        maxWidth: 292,
        height: 136,
        flexShrink: 0,
        scrollSnapAlign: "start",
        borderRadius: 3,
        border: 0,
        overflow: "hidden",
        position: "relative",
        bgcolor: UI.surface,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
        backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.38) 58%, rgba(15, 23, 42, 0.08) 100%), url("${item.image}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          p: 1.55,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ alignSelf: "flex-start", px: 0.9, py: 0.35, borderRadius: 999, bgcolor: alpha(UI.primary, 0.92), color: UI.onPrimary, fontSize: 10, fontWeight: 900, lineHeight: 1.2 }}>
          Online B2B Ads
        </Box>
        <Box sx={{ maxWidth: "72%" }}>
          <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 900, lineHeight: 1.15 }}>
            {item.title}
          </Typography>
          <Typography sx={{ color: alpha("#fff", 0.88), fontSize: 11.5, fontWeight: 700, mt: 0.45 }}>
            {item.offer}
          </Typography>
        </Box>
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
        borderRadius: 3,
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url("${city.image}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' }
      }}
    >
      <Box sx={{ position: 'absolute', bottom: 13, left: 13, right: 13 }}>
        <Typography sx={{ color: '#fff', fontSize: 15, fontWeight: 900, mb: 0.2, lineHeight: 1.15 }}>
          {city.name}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 10.5, fontWeight: 700 }}>
          {city.businesses} businesses
        </Typography>
      </Box>
    </Card>
  );
}

function ProductCard({ product }) {
  return (
    <Card sx={{ ...sectionCardStyles(), height: "100%" }}>
      <CardContent sx={{ p: 1.15, height: "100%", "&:last-child": { pb: 1.15 } }}>
        <Stack spacing={0.85} height="100%">
          <PlaceholderImage label="Product Image" minHeight={104} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: UI.text, lineHeight: 1.25, minHeight: 30 }}>
              {product.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                color: UI.textMuted,
                textDecoration: "line-through",
                mt: 0.35,
              }}
            >
              {product.mrp}
            </Typography>
            <Stack direction="row" spacing={0.55} alignItems="center" sx={{ mt: 0.35, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 12.2, fontWeight: 850, color: UI.primary, lineHeight: 1.2 }}>
                {product.price}
              </Typography>
              <Box
                sx={{
                  height: 18,
                  px: 0.65,
                  borderRadius: 999,
                  bgcolor: alpha(UI.primary, 0.12),
                  color: UI.primary,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 9.5,
                  fontWeight: 800,
                }}
              >
                {product.discount}
              </Box>
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.65} sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddShoppingCartRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 10.5,
                bgcolor: UI.primary,
                color: UI.onPrimary,
                boxShadow: "none",
                minWidth: 0,
                minHeight: 32,
                px: 0.65,
                "& .MuiButton-startIcon": { mr: 0.45 },
                "&:hover": { bgcolor: UI.secondary, boxShadow: "none" },
              }}
            >
              Add
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FavoriteBorderRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 10.5,
                borderColor: UI.border,
                color: UI.text,
                minWidth: 0,
                minHeight: 32,
                px: 0.65,
                "& .MuiButton-startIcon": { mr: 0.45 },
              }}
            >
              Wish
            </Button>
          </Stack>
        </Stack>
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

function AppDrawer({ open, onClose, onAction, profile }) {
  const displayName = profile?.business_name || profile?.full_name || localStorage.getItem('business_full_name') || 'Business User';
  const displayPhone = profile?.mobile_number || profile?.username || localStorage.getItem('business_phone') || '';
  const username = profile?.username || localStorage.getItem('username_business') || '';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BU';

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "78vw",
          maxWidth: 300,
          bgcolor: UI.surface,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: 2, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 900, color: UI.text }}>
            Menu
          </Typography>
          <IconButton onClick={onClose} sx={{ color: UI.text }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Card
          sx={{
            borderRadius: 3,
            bgcolor: alpha(UI.primary, 0.08),
            border: `1px solid ${alpha(UI.primary, 0.14)}`,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 1.6 }}>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: UI.primary,
                  color: UI.onPrimary,
                  fontWeight: 800,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: UI.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </Typography>
                {username && (
                  <Typography sx={{ fontSize: 11, color: UI.primary, fontWeight: 700 }}>
                    @{username}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 10.5, color: UI.textMuted }}>
                  {displayPhone || 'Business Account'}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 1, borderColor: alpha(UI.primary, 0.1) }} />
            <Button
              variant="text"
              size="small"
              onClick={() => {
                onClose();
                onAction("profile");
              }}
              sx={{
                textTransform: 'none',
                color: UI.primary,
                fontWeight: 700,
                fontSize: 11.5,
                p: 0,
                minHeight: 0,
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: 'transparent', color: UI.secondary }
              }}
            >
              Edit Business Profile →
            </Button>
          </CardContent>
        </Card>

        {/* Wallet Balance Card with Premium Gradient */}
        <Card
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(34, 139, 34, 0.18)',
            border: 0,
            mt: 1.5,
            cursor: 'pointer'
          }}
          onClick={() => {
            onClose();
            onAction("wallet");
          }}
        >
          <CardContent sx={{ p: 1.6, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.15)', p: 1, borderRadius: '8px' }}>
              <AccountBalanceWalletOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', mb: 0.1 }}>
                Wallet Balance
              </Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1 }}>
                ₹ {Number(profile?.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Stack spacing={0.6} sx={{ mt: 1.5 }}>
          {DRAWER_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.label}
                onClick={() => onAction(item.action)}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  color: UI.text,
                  borderRadius: 2.2,
                  px: 1.2,
                  py: 1,
                  bgcolor: alpha(UI.primary, 0.04),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Icon sx={{ color: UI.primary, fontSize: 20 }} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: UI.text }}>
                    {item.label}
                  </Typography>
                </Stack>
                <ArrowForwardIosRoundedIcon sx={{ fontSize: 14, color: UI.textMuted }} />
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Divider sx={{ mb: 1.2 }} />
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onAction("logout")}
            sx={{
              borderRadius: 2.2,
              py: 1.1,
              textTransform: "none",
              fontWeight: 800,
              fontSize: 12.5,
              borderColor: alpha(UI.text, 0.18),
              color: UI.text,
            }}
          >
            Logout
          </Button>
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
        width: "100vw",
        zIndex: 1300,
        display: "block",
        px: { xs: 1.5, sm: 3 },
        pt: 2,
        pb: 0,
        bgcolor: "rgba(246, 238, 226, 0.88)",
        boxShadow: "0 -18px 34px rgba(120, 84, 43, 0.12)",
      }}
    >
      <Card
        sx={{
          maxWidth: 820,
          mx: "auto",
          height: { xs: 64, sm: 74 },
          borderRadius: 0,
          borderTopLeftRadius: { xs: 24, sm: 30 },
          borderTopRightRadius: { xs: 24, sm: 30 },
          border: 0,
          bgcolor: UI.surface,
          boxShadow: "0 -10px 28px rgba(15, 23, 42, 0.08)",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${FOOTER_ITEMS.length}, minmax(0, 1fr))`,
            alignItems: "center",
            height: "100%",
            px: { xs: 0.25, sm: 2 },
            width: "100%",
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
                  py: 0,
                  height: "100%",
                  borderRadius: 0,
                  textTransform: "none",
                  color: scanner ? UI.textMuted : textColor,
                  bgcolor: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.35,
                  lineHeight: 1.1,
                  width: "100%",
                  transform: scanner ? "translateY(-16px)" : "none",
                  "&:hover": {
                    bgcolor: "transparent",
                  },
                }}
              >
                {scanner ? (
                  <Box
                    sx={{
                      width: { xs: 58, sm: 68 },
                      height: { xs: 58, sm: 68 },
                      borderRadius: "50%",
                      bgcolor: alpha(UI.primary, 0.14),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: -0.25,
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 44, sm: 52 },
                        height: { xs: 44, sm: 52 },
                        borderRadius: "50%",
                        bgcolor: UI.primary,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 8px 18px ${alpha(UI.primary, 0.34)}`,
                      }}
                    >
                      <Icon style={{ fontSize: 24, strokeWidth: 2.1 }} />
                    </Box>
                  </Box>
                ) : (
                  <Icon style={{ fontSize: 22, strokeWidth: 1.9 }} />
                )}
                <Typography
                  sx={{
                    fontSize: { xs: 10.5, sm: 12.5 },
                    fontWeight: 700,
                    textAlign: "center",
                    color: scanner ? UI.textMuted : textColor,
                    fontFamily: "Poppins",
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
      </Card>
    </Box>
  );
}

function BusinessDashboard() {
  const navigate = useNavigate();
  const [activeFooterItem, setActiveFooterItem] = useState("home-top");
  const [selectedCity, setSelectedCity] = useState("560091");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [b2bShops, setB2bShops] = useState([]);
  const [profile, setProfile] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    business_name: '',
    mobile_number: '',
    address: '',
    commission_percent: '',
    service_mode: 'BOTH'
  });
  const joinPrimePath = "/demo/join-prime";

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
            address: data.address || '',
            commission_percent: data.commission_percent || '',
            service_mode: data.service_mode || 'BOTH',
          });
        }
      })
      .catch((err) => console.error("Failed to load merchant profile:", err));
  }, []);

  const handleScrollTo = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFooterNavigate = (action) => {
    if (action === "tri-zone-footer" || action === "product-section") {
      setToastMsg("This feature is coming soon!");
      return;
    }
    if (action === "city-search-section") {
      navigate("/business/nearby-stores");
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
      navigate("/business/shops");
      return;
    }
    if (action === "passwordReset") {
      setActiveModal("passwordReset");
      return;
    }
    if (action === "addShop") {
      navigate("/business/shops");
      return;
    }
    if (action === "kyc") {
      setActiveModal("kyc");
      return;
    }
    if (action === "completedOrders") {
      setActiveModal("completedOrders");
      return;
    }
    if (action === "terms") {
      setActiveModal("terms");
      return;
    }
    if (action === "refund") {
      setActiveModal("refund");
      return;
    }
    if (action === "refer") {
      setActiveModal("refer");
      return;
    }
    if (action === "logout") {
      setActiveModal("logout");
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
    localStorage.removeItem('access_token_business');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('refresh_token_business');
    localStorage.removeItem('username_business');
    localStorage.removeItem('business_id');
    localStorage.removeItem('business_full_name');
    localStorage.removeItem('business_phone');
    localStorage.removeItem('triBusinessUser');
    localStorage.removeItem('triBusinessProfilePic');
    setActiveModal(null);
    navigate('/login');
  };

  return (
    <div className="ce-app">
      <header className="ce-header">
        <div className="ce-header-inner">
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              width: 44,
              height: 44,
              color: "#ffffff",
              p: 0,
              minWidth: 0,
              borderRadius: "50%",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            <MenuRoundedIcon sx={{ fontSize: 24 }} />
          </IconButton>
          
          <h1 className="ce-title" style={{ marginLeft: '6px' }}>Business Dashboard</h1>
          
          <div className="ce-header-actions">
            <HeaderActionButton ariaLabel="Notifications">
              <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
            </HeaderActionButton>
            <HeaderActionButton
              ariaLabel="Wallet"
              onClick={() => navigate("/user/franchise-wallet")}
            >
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 20 }} />
            </HeaderActionButton>
            <HeaderActionButton ariaLabel="Location">
              <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
            </HeaderActionButton>
          </div>
        </div>
      </header>

      <main 
        className="ce-container"
        style={{ 
          maxWidth: 640, 
          margin: '0 auto',
          paddingTop: '74px',
          paddingBottom: '132px'
        }}
      >
        <Stack spacing={1.15}>
          <Box id="home-top">
            <Box sx={{ px: { xs: 0, sm: 0 }, mt: -2 }}>
              <SearchBar
                onClick={() => setSearchModalOpen(true)}
                topCities={TOP_CITIES}
                onCitySelect={(cityName) => setSelectedCity(cityName)}
              />
              <AllCategoriesSection />
              <Box id="city-search-section" sx={{ px: { xs: 0, sm: 0 } }}>
                <SearchBarCard
                  selectedLocation={selectedCity}
                  onSearchClick={() => setSearchModalOpen(true)}
                  onJoinPrimeClick={() => navigate(joinPrimePath)}
                />
              </Box>
            </Box>
          </Box>

          <Box id="online-b2b-ads-section" sx={{ mt: -0.25 }}>
            <ComingSoonOverlay label="Online Coming Soon">
              <ScrollRow gap={1} pb={0.15}>
                {ONLINE_B2B_ADS.map((item) => (
                  <OnlineB2BAdCard key={item.id} item={item} />
                ))}
              </ScrollRow>
            </ComingSoonOverlay>
          </Box>

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

          <Box id="ads-section">
            <ScrollRow gap={1}>
              {ADS.map((item) => (
                <AdBannerCard key={item.id} item={item} />
              ))}
            </ScrollRow>
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
              <span style={{ fontSize: "24px" }}>🤝</span>
              <Typography sx={{ fontWeight: 800, fontSize: 12.2, lineHeight: 1.2, textAlign: "center" }}>For Better Society</Typography>
            </Button>
            <Button
              fullWidth
              onClick={() => navigate("/business/inventory-billing")}
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
              <span style={{ fontSize: "24px" }}>📑</span>
              <Typography sx={{ fontWeight: 800, fontSize: 12.2, lineHeight: 1.2, textAlign: "center" }}>Tri Inventory & Billing</Typography>
            </Button>
          </Stack>

          <Box id="product-section">
            <ComingSoonOverlay label="Online Products Coming Soon">
              <SectionShell
                title="Deals for You"
                subtitle="Discounted products picked for your account"
              >
                <StickyDeliveryButton onClick={() => navigate("/business/tri-sarathi-delivery")} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.9,
                    width: "100%",
                  }}
                >
                  {PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </Box>
              </SectionShell>
            </ComingSoonOverlay>
          </Box>

        </Stack>
      </main>

      <SearchCityModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectCity={(cityName) => {
          setSelectedCity(cityName);
          setSearchModalOpen(false);
        }}
      />
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAction={handleDrawerAction} profile={profile} />
      <MobileFooterNav activeItem={activeFooterItem} onNavigate={handleFooterNavigate} />

      {/* Edit Profile Modal */}
      <Dialog open={activeModal === 'edit'} onClose={() => setActiveModal(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text, pb: 1 }}>Edit Business Profile</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent sx={{ pt: 1 }}>
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
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted, fontWeight: 700 }}>Cancel</Button>
            <Button type="submit" disabled={loading} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Wallet Dialog */}
      <Dialog open={activeModal === 'wallet'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Wallet Balance</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)', 
            color: '#fff', 
            borderRadius: 3, 
            p: 3, 
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(34, 139, 34, 0.18)',
            mb: 2,
            minWidth: 240
          }}>
            <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', mb: 1, fontWeight: 700 }}>Wallet Balance</Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 900 }}>₹ {Number(profile?.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={activeModal === 'passwordReset'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Reset Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 260 }}>
            <TextField label="Current Password" type="password" fullWidth size="small" />
            <TextField label="New Password" type="password" fullWidth size="small" />
            <TextField label="Confirm New Password" type="password" fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted }}>Cancel</Button>
          <Button 
            onClick={() => {
              setActiveModal(null);
              setToastMsg("Password reset request submitted successfully!");
            }} 
            variant="contained" 
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Dialog */}
      <Dialog open={activeModal === 'kyc'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>KYC Verification Details</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Your business profile registration is active.
            
            To upgrade your account limits, verify or submit verification documents (GSTIN, PAN, and Shop Registration certificate), please navigate to the Shop Registration dashboard or contact support.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completed Orders Dialog */}
      <Dialog open={activeModal === 'completedOrders'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Completed Orders</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Detailed summaries, transaction receipts, and order histories are available under the Store Management panel.
            
            Tap on "Shops" on the bottom navigation bar to view your store orders and sales reporting.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setActiveModal(null); navigate("/business/shops"); }} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
            Go to Shops
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={activeModal === 'terms'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Terms & Conditions</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Welcome to Trikonekt Business. By enabling store integration, you agree to:
            
            1. Deliver genuine products to customers.
            2. Maintain correct store locations and GPS coordinates.
            3. Process eligible customer refunds in accordance with standard return windows.
            
            Trikonekt reserves the right to suspend store profiles that violate local trade guidelines.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Policy Dialog */}
      <Dialog open={activeModal === 'refund'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Refund Policy</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: UI.textMuted, fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            Standard Refund Processing:
            
            Refunds for cancelled or returned customer orders are credited back to their wallet or bank accounts within 3 to 5 business days. Merchants are requested to verify return items before approving refund requests via the Shop dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refer Friends Dialog */}
      <Dialog open={activeModal === 'refer'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Refer Friends</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: UI.textMuted, fontSize: 14, mb: 2 }}>
            Share the joy of growing business together! Invite your friends to join Trikonekt Business using your Sponsor ID.
          </Typography>
          <Box sx={{ p: 2, bgcolor: alpha(UI.primary, 0.05), borderRadius: 2, border: `1px dashed ${UI.primary}`, textAlign: 'center', mb: 2 }}>
            <Typography variant="caption" sx={{ color: UI.textMuted, fontWeight: 700 }}>YOUR SPONSOR ID</Typography>
            <Typography variant="h6" sx={{ color: UI.primary, fontWeight: 900, mt: 0.5 }}>
              {profile?.username || localStorage.getItem('username_business') || 'TRPN8095809500'}
            </Typography>
          </Box>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => {
              navigator.clipboard.writeText(profile?.username || localStorage.getItem('username_business') || 'TRPN8095809500');
              setToastMsg("Referral code copied to clipboard!");
            }}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
          >
            Copy Code
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: UI.primary, color: '#fff', '&:hover': { bgcolor: UI.secondary } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation */}
      <Dialog open={activeModal === 'logout'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UI.text }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: UI.textMuted, fontSize: 14 }}>
            Are you sure you want to log out of your business account? This will end your current session.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveModal(null)} sx={{ textTransform: 'none', color: UI.textMuted, fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, bgcolor: 'error.main', color: '#fff' }}>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>

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
    </div>
  );
}

export default BusinessDashboard;
