import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  IconButton,
  Autocomplete,
  Divider,
  Paper,
  alpha,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  Videocam as VideocamIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Reviews as ReviewsIcon,
  Campaign as CampaignIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  DateRange as DateRangeIcon,
  Image as ImageIcon,
  HomeOutlined as HomeOutlinedIcon,
  WidgetsOutlined as WidgetsOutlinedIcon,
  CenterFocusWeak as ScannerFocusIcon,
  ShoppingBagOutlined as ShoppingBagOutlinedIcon,
  StorefrontOutlined as StorefrontOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const UI = {
  primary: "#93c193",
  secondary: "#93c193",
  darkGreen: "#93c193",
  lightGreen: "#93c193",
  bg: "#93c193",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#93c193",
  borderLight: "#93c193",
  shadow: "rgba(147, 193, 147, 0.08)",
  shadowSoft: "rgba(147, 193, 147, 0.04)",
  gradient: "linear-gradient(135deg, #93c193 0%, #93c193 100%)",
  gradientSoft: "linear-gradient(135deg, rgba(147, 193, 147, 0.1) 0%, rgba(147, 193, 147, 0.05) 100%)",
};

const CATEGORIES = ["Food", "Grocery", "Electronics", "Fashion", "Others"];
const BRANDS = ["Brand A", "Brand B", "Brand C", "Custom"];
const PRODUCT_TYPES = ["ISI", "Non-ISI", "Premium"];

const FOOTER_ITEMS = [
  { label: "Home", icon: HomeOutlinedIcon, active: true },
  { label: "Tri Zone", icon: WidgetsOutlinedIcon },
  { label: "Scanner", icon: ScannerFocusIcon, raised: true },
  { label: "Online", icon: ShoppingBagOutlinedIcon },
  { label: "Nearby", icon: StorefrontOutlinedIcon },
];

/* ── Reusable Section Card ────────────────────────────────────────── */
const Section = ({ title, children, icon: Icon }) => (
  <Card
    sx={{
      mb: 2,
      borderRadius: 0,
      boxShadow: `0 4px 16px ${UI.shadow}, 0 2px 8px ${UI.shadowSoft}`,
      border: `1px solid ${UI.borderLight}`,
      bgcolor: UI.surface,
      overflow: "hidden",
      backdropFilter: "blur(8px)",
      position: "relative",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 6px 20px ${UI.shadow}, 0 3px 10px ${UI.shadowSoft}`,
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: UI.gradient,
        borderRadius: "0 0 0 0",
      },
    }}
  >
    <CardContent sx={{
      p: { xs: 2, sm: 3 },
      "&:last-child": { pb: { xs: 2, sm: 3 } },
      background: UI.gradientSoft,
    }}>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        color={UI.primary}
        sx={{
          mb: 2,
          textTransform: "none",
          letterSpacing: 0.5,
          fontSize: { xs: 15, sm: 17 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontFamily: 'Poppins',
          position: "relative",
        }}
      >
        {Icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: alpha(UI.primary, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: UI.primary,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        )}
        <Box>
          <Typography
            component="span"
            sx={{
              fontSize: "inherit",
              fontWeight: 600,
              color: UI.primary,
              fontFamily: 'Poppins',
            }}
          >
            {title}
          </Typography>
        </Box>
      </Typography>
      <Divider sx={{
        mb: 2,
        borderColor: alpha(UI.primary, 0.1),
        borderWidth: "1px",
      }} />
      {children}
    </CardContent>
  </Card>
);

/* ── Reusable Text Field ──────────────────────────────────────────── */
const FormInput = ({ sx, InputLabelProps, ...props }) => (
  <TextField
    fullWidth
    variant="outlined"
    size="medium"
    {...props}
    InputLabelProps={{
      ...InputLabelProps,
      shrink: InputLabelProps?.shrink,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 0,
        bgcolor: UI.surface,
        border: `2px solid ${UI.borderLight}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: 64,
        fontSize: { xs: 14, sm: 15 },
        fontFamily: 'Poppins',
        fontWeight: 500,
        alignItems: "center",
        overflow: "visible",
        "& fieldset": {
          border: "none",
          borderRadius: 0,
        },
        "&.MuiInputBase-multiline": {
          alignItems: "flex-start",
          minHeight: 118,
          padding: 0,
        },
        "&.MuiInputBase-adornedStart": {
          paddingLeft: "16px",
        },
        "&.Mui-focused .MuiInputBase-input::placeholder": {
          opacity: 1,
        },
        "&:hover": {
          borderColor: alpha(UI.primary, 0.3),
          bgcolor: alpha(UI.primary, 0.02),
          boxShadow: `0 0 0 4px ${alpha(UI.primary, 0.08)}`,
        },
        "&.Mui-focused": {
          borderColor: UI.primary,
          bgcolor: UI.surface,
          boxShadow: `0 0 0 6px ${alpha(UI.primary, 0.12)}, 0 4px 12px ${alpha(UI.primary, 0.15)}`,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        "&.Mui-focused:hover": {
          borderColor: UI.primary,
        },
      },
      "& .MuiInputLabel-root": {
        fontWeight: 500,
        color: UI.textMuted,
        fontSize: { xs: 13, sm: 14 },
        fontFamily: 'Poppins',
        lineHeight: 1.2,
        maxWidth: "calc(100% - 32px)",
        transform: "translate(16px, 22px) scale(1)",
        transformOrigin: "left top",
        transition: "color 0.2s ease, transform 0.2s ease, background-color 0.2s ease",
        zIndex: 1,
        "&.Mui-focused, &.MuiFormLabel-filled": {
          transform: "translate(14px, -10px) scale(0.82)",
          color: UI.primary,
          fontWeight: 600,
          backgroundColor: UI.surface,
          px: 0.75,
          borderRadius: 1,
          maxWidth: "calc(122% - 32px)",
        },
        "&.MuiInputLabel-shrink": {
          transform: "translate(14px, -10px) scale(0.82)",
          backgroundColor: UI.surface,
          px: 0.75,
          borderRadius: 1,
          maxWidth: "calc(122% - 32px)",
        },
      },
      "& .MuiInputBase-input": {
        fontFamily: 'Poppins',
        fontWeight: 500,
        height: "auto",
        minHeight: "24px",
        padding: "26px 16px 12px",
        boxSizing: "border-box",
        lineHeight: 1.4,
        "&::placeholder": {
          color: alpha(UI.textMuted, 0.7),
          opacity: 0,
          transition: "opacity 0.2s ease",
        },
      },
      "& .MuiAutocomplete-inputRoot": {
        paddingTop: "0 !important",
        paddingBottom: "0 !important",
        paddingLeft: "0 !important",
        minHeight: 64,
      },
      "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
        minWidth: "0 !important",
        padding: "26px 40px 12px 16px !important",
      },
      "& .MuiAutocomplete-endAdornment": {
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
      },
      "& .MuiInputBase-inputMultiline": {
        padding: "30px 16px 14px",
        minHeight: "74px",
        resize: "vertical",
      },
      "& .MuiInputBase-inputAdornedStart": {
        paddingLeft: "8px !important",
      },
      "& .MuiInputAdornment-root": {
        color: UI.primary,
        flexShrink: 0,
        height: "auto",
        maxHeight: "none",
        marginRight: "2px",
        marginTop: "20px",
        alignSelf: "flex-start",
        "& .MuiTypography-root": {
          fontWeight: 600,
          fontFamily: 'Poppins',
        },
      },
      "& input[type='date']": {
        minWidth: 0,
        width: "100%",
      },
      ...sx,
    }}
  />
);

/* ── Upload Card ──────────────────────────────────────────────────── */
const UploadCard = ({ icon, label }) => (
  <Button
    variant="outlined"
    component="label"
    fullWidth
    sx={{
      py: { xs: 3, sm: 4 },
      borderStyle: "dashed",
      borderWidth: 2,
      borderRadius: 16,
      borderColor: UI.border,
      color: UI.textMuted,
      flexDirection: "column",
      gap: 1.5,
      minHeight: { xs: 100, sm: 110 },
      bgcolor: alpha(UI.primary, 0.02),
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: UI.gradientSoft,
        opacity: 0,
        transition: "opacity 0.3s ease",
      },
      "&:hover": {
        borderColor: UI.primary,
        color: UI.primary,
        bgcolor: alpha(UI.primary, 0.05),
        transform: "translateY(-1px)",
        boxShadow: `0 6px 20px ${alpha(UI.primary, 0.15)}`,
        "&::before": {
          opacity: 1,
        },
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: `0 3px 10px ${alpha(UI.primary, 0.1)}`,
      },
      fontFamily: 'Poppins',
      fontWeight: 500,
      textTransform: "none",
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "12px",
        bgcolor: alpha(UI.primary, 0.1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: UI.primary,
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: UI.primary,
          color: UI.surface,
          transform: "scale(1.05)",
        },
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="body1"
      fontWeight={600}
      sx={{
        fontSize: { xs: 13, sm: 14 },
        fontFamily: 'Poppins',
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        fontSize: { xs: 11, sm: 12 },
        fontFamily: 'Poppins',
        opacity: 0.7,
        textAlign: "center",
      }}
    >
      Click to upload
    </Typography>
    <input type="file" hidden />
  </Button>
);

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                  */
/* ══════════════════════════════════════════════════════════════════ */
const BottomFooter = () => (
  <Box
    sx={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1200,
      px: { xs: 1.5, sm: 3 },
      pt: 2,
      bgcolor: "rgba(246, 238, 226, 0.88)",
      boxShadow: "0 -18px 34px rgba(120, 84, 43, 0.12)",
    }}
  >
    <Box
      sx={{
        position: "relative",
        maxWidth: 820,
        mx: "auto",
        height: { xs: 118, sm: 126 },
        bgcolor: UI.surface,
        borderTopLeftRadius: { xs: 36, sm: 42 },
        borderTopRightRadius: { xs: 36, sm: 42 },
        boxShadow: "0 -10px 28px rgba(15, 23, 42, 0.08)",
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        alignItems: "center",
        px: { xs: 0.5, sm: 2 },
        overflow: "visible",
      }}
    >
      {FOOTER_ITEMS.map((item) => {
        const Icon = item.icon;
        const textColor = item.active ? UI.primary : "#6b7280";

        return (
          <Box
            component="button"
            type="button"
            key={item.label}
            sx={{
              appearance: "none",
              border: 0,
              bgcolor: "transparent",
              p: 0,
              minWidth: 0,
              height: "100%",
              color: textColor,
              cursor: "pointer",
              fontFamily: "Poppins",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              transform: item.raised ? "translateY(-26px)" : "none",
              "&:focus-visible": {
                outline: `2px solid ${UI.primary}`,
                outlineOffset: 4,
                borderRadius: 3,
              },
            }}
          >
            {item.raised ? (
              <Box
                sx={{
                  width: { xs: 84, sm: 102 },
                  height: { xs: 84, sm: 102 },
                  borderRadius: "50%",
                  bgcolor: alpha(UI.primary, 0.14),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: -0.5,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 64, sm: 76 },
                    height: { xs: 64, sm: 76 },
                    borderRadius: "50%",
                    bgcolor: UI.primary,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 10px 22px ${alpha(UI.primary, 0.34)}`,
                  }}
                >
                  <Icon sx={{ fontSize: { xs: 32, sm: 38 } }} />
                </Box>
              </Box>
            ) : (
              <Icon sx={{ fontSize: { xs: 31, sm: 36 } }} />
            )}
            <Typography
              component="span"
              sx={{
                color: textColor,
                fontSize: { xs: 13, sm: 16 },
                fontWeight: 700,
                fontFamily: "Poppins",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default function ProductRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    brandName: "",
    unit: "",
    productName: "",
    size: "",
    weight: "",
    description: "",
    mrp: "",
    discount: "",
    extraDiscount: "",
    consumerComm: "",
    companyComm: "",
    productType: "ISI",
    mfgDate: "",
    expiryDate: "",
    hsnCode: "",
    sku: "",
    courierCharges: "",
    additionalCourier: "",
    includedInMRP: false,
    returnOrder: false,
    tracking: false,
    trikonetAds: false,
    frontBanner: false,
    cashbackAds: false,
    review: "",
  });

  const handleSave = () => {
    if (!formData.productName || !formData.mrp) {
      alert("Product Name and MRP are required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Product saved successfully!");
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      category: "", subCategory: "", brandName: "", unit: "", productName: "", size: "", weight: "",
      description: "", mrp: "", discount: "", extraDiscount: "", consumerComm: "",
      companyComm: "", productType: "ISI", mfgDate: "", expiryDate: "", hsnCode: "", sku: "",
      courierCharges: "", additionalCourier: "", includedInMRP: false, returnOrder: false, tracking: false,
      trikonetAds: false, frontBanner: false, cashbackAds: false, review: "",
    });
  };

  return (
    <Box
      sx={{
        bgcolor: UI.bg,
        minHeight: "100vh",
        pb: { xs: 18, sm: 20 },
        overflowX: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(UI.primary, 0.03)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(UI.primary, 0.02)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha(UI.primary, 0.01)} 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: UI.gradient,
          color: "#fff",
          pt: { xs: 3, sm: 4 },
          pb: { xs: 6, sm: 7 },
          px: { xs: 3, sm: 4 },
          textAlign: "center",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          position: "relative",
          boxShadow: `0 6px 24px ${alpha(UI.primary, 0.3)}, 0 3px 12px ${alpha(UI.primary, 0.2)}`,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: "absolute",
            left: { xs: 16, sm: 24 },
            top: { xs: 16, sm: 24 },
            color: "#fff",
            bgcolor: alpha("#fff", 0.1),
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            width: 44,
            height: 44,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: alpha("#fff", 0.2),
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 22 }} />
        </IconButton>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            lineHeight: 1.2,
            fontFamily: 'Poppins',
            mb: 1,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Product Registration
        </Typography>
        <Typography
          variant="body1"
          sx={{
            opacity: 0.9,
            fontSize: { xs: 13, sm: 14 },
            fontFamily: 'Poppins',
            fontWeight: 400,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Add your product to the marketplace
        </Typography>
        <Box
          sx={{
            position: "absolute",
            bottom: -16,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 32,
            bgcolor: alpha("#fff", 0.1),
            borderRadius: "16px 16px 0 0",
            backdropFilter: "blur(10px)",
          }}
        />
      </Box>

      {/* ── Form Body ─────────────────────────────────────────────── */}
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: -3,
          px: { xs: 2, sm: 3 },
          position: "relative",
          zIndex: 1,
        }}
      >

        {/* Product Details */}
        <Section title="Product Details" icon={StoreIcon}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={CATEGORIES}
              value={formData.category}
              onChange={(event, newValue) => setFormData({ ...formData, category: newValue || "" })}
              renderInput={(params) => (
                <FormInput
                  {...params}
                  label="Category"
                  placeholder="Select category"
                />
              )}
            />
            <Autocomplete
              options={BRANDS}
              value={formData.brandName}
              onChange={(event, newValue) => setFormData({ ...formData, brandName: newValue || "" })}
              renderInput={(params) => (
                <FormInput
                  {...params}
                  label="Brand Name"
                  placeholder="Select brand"
                />
              )}
            />
            <FormInput
              label="Product Name *"
              placeholder="e.g. Premium Cotton Polo Shirt"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
            <FormInput
              label="Product Size"
              placeholder="XL, 42"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            />
            <FormInput
              label="Product Weight"
              placeholder="500g"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
            <FormInput
              multiline
              rows={3}
              label="Product Description"
              placeholder="Add product materials, features, usage, or care details"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </Section>

        {/* Pricing */}
        <Section title="Pricing & Commissions" icon={AttachMoneyIcon}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormInput
              label="MRP (Maximum Retail Price) *"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            />
            <FormInput
              label="Discount (%)"
              type="number"
              placeholder="0"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            />
            <FormInput
              label="Extra Discount"
              type="number"
              placeholder="0"
              value={formData.extraDiscount}
              onChange={(e) => setFormData({ ...formData, extraDiscount: e.target.value })}
            />
            <FormInput
              label="Consumer Commission"
              type="number"
              placeholder="₹"
              value={formData.consumerComm}
              onChange={(e) => setFormData({ ...formData, consumerComm: e.target.value })}
            />
            <FormInput
              label="Company Commission"
              type="number"
              placeholder="₹"
              value={formData.companyComm}
              onChange={(e) => setFormData({ ...formData, companyComm: e.target.value })}
            />
          </Box>
        </Section>

        {/* Product Information */}
        <Section title="Product Information" icon={DateRangeIcon}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormInput
              label="Manufacturing Date"
              type="date"
              placeholder=""
              InputLabelProps={{ shrink: true }}
              value={formData.mfgDate}
              onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
            />
            <FormInput
              label="Expiry Date"
              type="date"
              placeholder=""
              InputLabelProps={{ shrink: true }}
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
            <Autocomplete
              freeSolo
              options={PRODUCT_TYPES}
              value={formData.productType}
              onChange={(_, newValue) => setFormData({ ...formData, productType: newValue || '' })}
              onInputChange={(_, newInputValue) => setFormData({ ...formData, productType: newInputValue })}
              renderInput={(params) => (
                <FormInput {...params} label="Product Type / Quality" placeholder="Select or type type" />
              )}
            />
          </Box>
        </Section>

        {/* Media */}
        <Section title="Product Media" icon={ImageIcon}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <UploadCard icon={<CloudUploadIcon />} label="Product Image" />
            <UploadCard icon={<VideocamIcon />} label="Product Video" />
            <UploadCard icon={<Inventory2OutlinedIcon />} label="Packing Video" />
          </Box>
        </Section>

        {/* Delivery */}
        <Section title="Delivery & Returns" icon={LocalShippingIcon}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormInput
              label="Basic Courier Charges"
              value={formData.courierCharges}
              onChange={(e) => setFormData({ ...formData, courierCharges: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            />
            <FormInput
              label="Additional Courier"
              value={formData.additionalCourier}
              onChange={(e) => setFormData({ ...formData, additionalCourier: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            />
          </Box>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.includedInMRP}
                  onChange={(e) => setFormData({ ...formData, includedInMRP: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: UI.primary,
                      '& + .MuiSwitch-track': {
                        backgroundColor: UI.primary,
                      },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: UI.border,
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 2px 8px ${alpha(UI.primary, 0.3)}`,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    fontWeight: 500,
                    fontFamily: 'Poppins',
                    color: UI.text,
                  }}
                >
                  Shipping Included in MRP
                </Typography>
              }
              sx={{
                margin: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1.5,
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.returnOrder}
                  onChange={(e) => setFormData({ ...formData, returnOrder: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: UI.primary,
                      '& + .MuiSwitch-track': {
                        backgroundColor: UI.primary,
                      },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: UI.border,
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 2px 8px ${alpha(UI.primary, 0.3)}`,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    fontWeight: 500,
                    fontFamily: 'Poppins',
                    color: UI.text,
                  }}
                >
                  Allow Return Orders
                </Typography>
              }
              sx={{
                margin: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1.5,
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.tracking}
                  onChange={(e) => setFormData({ ...formData, tracking: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: UI.primary,
                      '& + .MuiSwitch-track': {
                        backgroundColor: UI.primary,
                      },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: UI.border,
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 2px 8px ${alpha(UI.primary, 0.3)}`,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    fontWeight: 500,
                    fontFamily: 'Poppins',
                    color: UI.text,
                  }}
                >
                  Enable Live Tracking
                </Typography>
              }
              sx={{
                margin: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1.5,
                },
              }}
            />
          </Stack>
        </Section>

        {/* Ratings */}
        <Section title="Ratings & Reviews" icon={ReviewsIcon}>
          <Box sx={{ mb: 2, p: 2, borderRadius: 16, bgcolor: alpha(UI.primary, 0.02), border: `1px solid ${UI.borderLight}` }}>
            <Typography
              variant="body1"
              fontWeight={600}
              color={UI.text}
              sx={{
                fontSize: 14,
                fontFamily: 'Poppins',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <StarIcon sx={{ color: "#fbbf24", fontSize: 18 }} />
              Global Merchant Rating
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(45deg, #fbbf24, #f59e0b)`,
                      borderRadius: '4px',
                      opacity: 0.1,
                      zIndex: -1,
                    },
                  }}
                >
                  <StarIcon
                    sx={{
                      color: "#fbbf24",
                      fontSize: { xs: 20, sm: 24 },
                      filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                </Box>
              ))}
              <Box sx={{ ml: 1.5, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{
                    fontSize: 18,
                    color: UI.primary,
                    fontFamily: 'Poppins',
                  }}
                >
                  4.8
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: UI.textMuted,
                    fontFamily: 'Poppins',
                    fontSize: 12,
                  }}
                >
                  / 5.0
                </Typography>
              </Box>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                color: UI.textMuted,
                fontFamily: 'Poppins',
                fontSize: 12,
                fontStyle: 'italic',
              }}
            >
              Based on 2,847 customer reviews
            </Typography>
          </Box>
          <FormInput
            multiline
            rows={3}
            label="Featured Customer Review"
            placeholder="Share a recent customer testimonial or positive feedback..."
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          />
        </Section>

        {/* Advertisement */}
        <Section title="Advertisement Control" icon={CampaignIcon}>
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.trikonetAds}
                  onChange={(e) => setFormData({ ...formData, trikonetAds: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: UI.primary,
                      '& + .MuiSwitch-track': {
                        backgroundColor: UI.primary,
                      },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: UI.border,
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 2px 8px ${alpha(UI.primary, 0.3)}`,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    fontWeight: 500,
                    fontFamily: 'Poppins',
                    color: UI.text,
                  }}
                >
                  Trikonet Deals Banner Ads
                </Typography>
              }
              sx={{
                margin: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1.5,
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.frontBanner}
                  onChange={(e) => setFormData({ ...formData, frontBanner: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: UI.primary,
                      '& + .MuiSwitch-track': {
                        backgroundColor: UI.primary,
                      },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: UI.border,
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 2px 8px ${alpha(UI.primary, 0.3)}`,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    fontWeight: 500,
                    fontFamily: 'Poppins',
                    color: UI.text,
                  }}
                >
                  Online Front Banner Promotion
                </Typography>
              }
              sx={{
                margin: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1.5,
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.cashbackAds}
                  onChange={(e) => setFormData({ ...formData, cashbackAds: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: UI.primary,
                      '& + .MuiSwitch-track': {
                        backgroundColor: UI.primary,
                      },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: UI.border,
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 2px 8px ${alpha(UI.primary, 0.3)}`,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    fontWeight: 500,
                    fontFamily: 'Poppins',
                    color: UI.text,
                  }}
                >
                  Cashback & Reward Campaigns
                </Typography>
              }
              sx={{
                margin: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1.5,
                },
              }}
            />
          </Stack>
        </Section>

        {/* ── Buttons ─────────────────────────────────────────────── */}
        <Stack spacing={1.5} sx={{ mt: 1, pb: 4 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={loading}
            sx={{
              py: { xs: 1.75, sm: 2 },
              borderRadius: 16,
              background: UI.gradient,
              color: "#fff",
              fontWeight: 600,
              fontSize: { xs: 15, sm: 16 },
              textTransform: "none",
              boxShadow: `0 6px 20px ${alpha(UI.primary, 0.4)}, 0 3px 10px ${alpha(UI.primary, 0.3)}`,
              minHeight: 52,
              fontFamily: 'Poppins',
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transition: "left 0.5s",
              },
              "&:hover": {
                background: UI.gradient,
                transform: "translateY(-1px)",
                boxShadow: `0 8px 24px ${alpha(UI.primary, 0.5)}, 0 4px 12px ${alpha(UI.primary, 0.4)}`,
                "&::before": {
                  left: "100%",
                },
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: `0 3px 12px ${alpha(UI.primary, 0.3)}`,
              },
              "&:disabled": {
                background: UI.border,
                color: UI.textMuted,
                boxShadow: "none",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <>
                <ShoppingCartIcon sx={{ mr: 1, fontSize: 18 }} />
                Register Product
              </>
            )}
          </Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleReset}
              sx={{
                py: { xs: 1.5, sm: 1.75 },
                borderRadius: 12,
                borderColor: UI.primary,
                borderWidth: 2,
                color: UI.primary,
                fontWeight: 600,
                fontSize: { xs: 14, sm: 15 },
                textTransform: "none",
                minHeight: 48,
                fontFamily: 'Poppins',
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: alpha(UI.primary, 0.05),
                  borderColor: UI.primary,
                  transform: "translateY(-1px)",
                  boxShadow: `0 3px 10px ${alpha(UI.primary, 0.2)}`,
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              Reset Form
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                py: { xs: 1.5, sm: 1.75 },
                borderRadius: 12,
                borderColor: UI.primary,
                borderWidth: 2,
                color: UI.primary,
                fontWeight: 600,
                fontSize: { xs: 14, sm: 15 },
                textTransform: "none",
                minHeight: 48,
                fontFamily: 'Poppins',
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: alpha(UI.primary, 0.05),
                  borderColor: UI.primary,
                  transform: "translateY(-1px)",
                  boxShadow: `0 3px 10px ${alpha(UI.primary, 0.2)}`,
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              Preview Product
            </Button>
          </Stack>
        </Stack>
      </Box>
      <BottomFooter />
    </Box>
  );
}
