import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Divider,
  CircularProgress,
  InputAdornment,
  Container,
  Select,
  MenuItem,
  ListSubheader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { getGPSLocation } from "../../utils/locationHelper";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import MapIcon from "@mui/icons-material/Map";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { LuX } from "react-icons/lu";

import {
  listMyShops,
  createShop,
  updateShop,
  deleteShop,
  getMerchantCategories,
  createMerchantCategory,
  getMerchantProfile,
} from "../../api/api";

/* ── Design Tokens ── */
const T = {
  primary: '#228B22',       // Forest Green
  primaryDark: '#1B4D3E',   // Dark Forest Green
  primaryLight: '#e9f5e9',
  accent: '#f97316',        // Orange accent
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gradient: 'linear-gradient(135deg, #228B22 0%, #1B4D3E 100%)',
  btnGradient: 'linear-gradient(135deg, #228B22 0%, #0d9488 100%)',
  cardShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
  radius: '16px',
};

const labelSx = {
  fontSize: '0.85rem',
  fontWeight: 800,
  color: T.text,
  mb: 0.75,
  display: 'block',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#fff',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderHover },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { color: T.textMuted, '&.Mui-focused': { color: T.primary } },
  '& .MuiInputBase-input': { fontWeight: 600, color: T.text, py: 1.5 },
};

function StatusChip({ status }) {
  const s = String(status || "").toUpperCase();
  let color = "default";
  if (s === "ACTIVE") color = "success";
  if (s === "PENDING") color = "warning";
  if (s === "REJECTED") color = "error";

  return (
    <Chip
      size="small"
      label={s}
      color={color}
      variant={s === "ACTIVE" ? "filled" : "outlined"}
      sx={{ fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px' }}
    />
  );
}

export default function BusinessShops() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [merchantCategories, setMerchantCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", audience: "MERCHANT", sortOrder: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Search filter state for category selection
  const [categorySearch, setCategorySearch] = useState("");

  const shopImageRef = useRef(null);
  const bannerRef = useRef(null);
  const docsRef = useRef(null);

  const [profile, setProfile] = useState(null);

  const emptyForm = useMemo(
    () => ({
      id: null,
      shop_name: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      contact_number: "",
      shop_image: null,
      shop_image_url: "",
      email: "",
      category: "",
      state: "",
      pincode: "",
      description: "",
      banner: null,
      banner_url: "",
      gst_number: "",
      pan_number: "",
      business_reg_number: "",
      home_delivery_enabled: false,
      delivery_radius_km: "5",
      min_order_value: "0",
      base_delivery_fee: "0",
      discount_percent: "",
      business_documents: [],
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);

  // Toggle state to display/hide map picker
  const [showMapPicker, setShowMapPicker] = useState(false);

  async function fetchShops() {
    setLoading(true);
    setError("");
    try {
      const res = await listMyShops();
      const data = Array.isArray(res) ? res : res?.results || [];
      setShops(data);
    } catch (err) {
      setError("Failed to fetch shops. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShops();
    getMerchantProfile()
      .then(p => setProfile(p))
      .catch(err => console.error("Error loading profile in BusinessShops:", err));
  }, []);

  useEffect(() => {
    let mounted = true;
    setCategoriesLoading(true);
    getMerchantCategories()
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res) ? res : res?.results || [];
        setMerchantCategories(data);
      })
      .catch(() => {
        if (!mounted) return;
        setMerchantCategories([]);
      })
      .finally(() => {
        if (mounted) setCategoriesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setSuccess("");
    setError("");
    setShowMapPicker(false);
    setCategorySearch("");
  };

  const resetCategoryDialog = () => {
    setNewCategory({ name: "", audience: "MERCHANT", sortOrder: "" });
    setError("");
  };

  const handleCreateCategory = async () => {
    const name = String(newCategory.name || "").trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }
    setCreatingCategory(true);
    setError("");
    try {
      const created = await createMerchantCategory({
        name,
        audience: String(newCategory.audience || "MERCHANT").toUpperCase(),
        sortOrder: newCategory.sortOrder === "" ? null : Number(newCategory.sortOrder),
      });
      setSuccess(`Category \"${created?.name || name}\" created successfully.`);
      setCategoryDialogOpen(false);
      resetCategoryDialog();
      setCategoriesLoading(true);
      const res = await getMerchantCategories();
      const data = Array.isArray(res) ? res : res?.results || [];
      setMerchantCategories(data);
      setCategorySearch("");
    } catch (err) {
      setError(err?.message || "Failed to create category.");
    } finally {
      setCreatingCategory(false);
      setCategoriesLoading(false);
    }
  };

  const handlePickShopImage = (e) => {
    const f = e?.target?.files?.[0] || null;
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        setError("Shop image exceeds the 10MB maximum limit.");
        return;
      }
      setError("");
      setForm((p) => ({
        ...p,
        shop_image: f,
        shop_image_url: URL.createObjectURL(f),
      }));
    }
  };

  const handlePickBanner = (e) => {
    const f = e?.target?.files?.[0] || null;
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        setError("Banner image exceeds the 10MB maximum limit.");
        return;
      }
      setError("");
      setForm((p) => ({
        ...p,
        banner: f,
        banner_url: URL.createObjectURL(f),
      }));
    }
  };

  const handleDocs = (e) => {
    const files = Array.from(e.target.files || []);
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      setError("Some verification documents exceed the 10MB maximum limit.");
      return;
    }
    setError("");
    setForm(p => ({
      ...p,
      business_documents: [...p.business_documents, ...files].slice(0, 5)
    }));
  };

  const removeDoc = (idx) => {
    setForm(p => ({
      ...p,
      business_documents: p.business_documents.filter((_, i) => i !== idx)
    }));
  };

  const handleUseMyLocation = async () => {
    setGpsLoading(true);
    setError("");
    setSuccess("");
    try {
      const loc = await getGPSLocation();
      setForm((p) => ({
        ...p,
        latitude: String(loc.lat),
        longitude: String(loc.lng),
        address: loc.formattedAddress || p.address,
        city: loc.city || p.city,
        state: loc.state || p.state,
        pincode: loc.pincode || p.pincode,
      }));
      setSuccess("Map coordinates and address fetched correctly.");
      setShowMapPicker(false);
    } catch (err) {
      setError(err.message || "Unable to retrieve coordinates. Please enter manually.");
    } finally {
      setGpsLoading(false);
    }
  };

  const startEdit = (shop) => {
    setForm({
      id: shop.id,
      shop_name: shop.shop_name || "",
      address: shop.address || "",
      city: shop.city || "",
      latitude: shop.latitude || "",
      longitude: shop.longitude || "",
      contact_number: shop.contact_number || "",
      shop_image: null,
      shop_image_url: shop.shop_image || "",
      email: shop.email || "",
      category: String(shop.category || shop.category_id || ""),
      state: shop.state || "",
      pincode: shop.pincode || "",
      description: shop.description || "",
      banner: null,
      banner_url: shop.banner || "",
      gst_number: shop.gst_number || "",
      pan_number: shop.pan_number || "",
      business_reg_number: shop.business_reg_number || "",
      home_delivery_enabled: Boolean(shop.home_delivery_enabled),
      delivery_radius_km: String(shop.delivery_radius_km ?? 5),
      min_order_value: String(shop.min_order_value ?? 0),
      base_delivery_fee: String(shop.base_delivery_fee ?? 0),
      discount_percent: String(shop.discountPercent ?? shop.discount_percent ?? 0),
      business_documents: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteShop(id);
      setSuccess("Shop deleted successfully.");
      fetchShops();
      if (form.id === id) {
        resetForm();
      }
    } catch {
      setError("Failed to delete shop.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shop_name.trim()) { setError("Store Name is required."); return; }
    if (!form.contact_number.trim()) { setError("Mobile is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.category) { setError("Category is required."); return; }
    if (!form.address.trim()) { setError("Address is required."); return; }
    if (!form.state.trim()) { setError("State is required."); return; }
    if (!form.pincode.trim()) { setError("Pincode is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.shop_image && !form.shop_image_url) { setError("Shop photo is required."); return; }
    if (!form.banner && !form.banner_url) { setError("Banner image is required."); return; }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      shop_name: form.shop_name,
      address: form.address,
      city: form.city || "Indiranagar",
      latitude: form.latitude || "0.0",
      longitude: form.longitude || "0.0",
      contact_number: form.contact_number,
      shop_image: form.shop_image,
      email: form.email,
      category: form.category,
      state: form.state,
      pincode: form.pincode,
      description: form.description,
      banner: form.banner,
      gst_number: form.gst_number,
      pan_number: form.pan_number,
      business_reg_number: form.business_reg_number,
      home_delivery_enabled: Boolean(form.home_delivery_enabled),
      delivery_radius_km: Math.min(Number(form.delivery_radius_km) || 5, 25),
      min_order_value: Math.max(Number(form.min_order_value) || 0, 0),
      base_delivery_fee: Math.max(Number(form.base_delivery_fee) || 0, 0),
      discount_percent: Math.max(0, Math.min(100, Number(form.discount_percent) || 0)),
      business_documents: form.business_documents,
    };

    try {
      if (form.id) {
        await updateShop(form.id, payload);
        setSuccess("Shop details updated successfully.");
      } else {
        await createShop(payload);
        setSuccess("Shop registered successfully.");
      }
      resetForm();
      fetchShops();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save shop details.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = merchantCategories.filter((c) =>
    String(c?.name || "").toLowerCase().includes(categorySearch.toLowerCase())
  );

  const categoryLabelById = useMemo(() => {
    const map = new Map();
    merchantCategories.forEach((c) => {
      map.set(String(c.id), c.name);
    });
    return map;
  }, [merchantCategories]);

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Top Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton
            onClick={() => navigate("/business-dashboard")}
            sx={{
              bgcolor: T.surface,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              color: T.primary,
              "&:hover": { bgcolor: alpha(T.primary, 0.08) }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 950, color: T.text, lineHeight: 1.2 }}>
              Register Retail Store
            </Typography>
            <Typography variant="body2" sx={{ color: T.textSecondary, fontWeight: 500 }}>
              Create shop profiles, configure locations, and submit verification documents
            </Typography>
          </Box>
        </Stack>

        {/* Notifications */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess("")}>{success}</Alert>}

        <Grid container spacing={4}>
          {/* Left Side: Shop Registration Form */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: T.radius,
                boxShadow: T.cardShadow,
                bgcolor: T.surface,
                border: `1px solid ${alpha(T.border, 0.5)}`,
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                {profile?.service_mode === 'ONLINE' ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="warning" sx={{ borderRadius: '12px', fontWeight: 700, mb: 3 }}>
                      Online Store Mode Enabled
                    </Alert>
                    <Typography sx={{ fontSize: '0.92rem', color: T.textSecondary, mb: 2.5, fontWeight: 600, lineHeight: 1.5 }}>
                      As an ONLINE merchant, you do not manage physical shops manually. Your default online store is auto-registered under-the-hood to manage your catalog.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/business/inventory')}
                      sx={{ bgcolor: T.primary, textTransform: 'none', fontWeight: 800, borderRadius: '10px', '&:hover': { bgcolor: T.primaryDark } }}
                    >
                      Manage Online Inventory
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, mb: 3.5 }}>
                      {form.id ? "✏️ Edit Store Details" : "🏪 Add Store"}
                    </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Store Name */}
                    <Box>
                      <Typography sx={labelSx}>Store Name *</Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter Store Name"
                        value={form.shop_name}
                        onChange={(e) => setForm(p => ({ ...p, shop_name: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Business Type Select */}
                    {/* Mobile */}
                    <Box>
                      <Typography sx={labelSx}>Mobile *</Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter Mobile"
                        value={form.contact_number}
                        onChange={(e) => setForm(p => ({ ...p, contact_number: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Email */}
                    <Box>
                      <Typography sx={labelSx}>Email *</Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Category Search dropdown */}
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography sx={labelSx}>Category *</Typography>
                        <Button
                          size="small"
                          onClick={() => setCategoryDialogOpen(true)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            color: T.primary,
                            px: 1,
                            minWidth: 0,
                          }}
                        >
                          + Add Category
                        </Button>
                      </Stack>
                      <Select
                        fullWidth
                        displayEmpty
                        value={form.category}
                        onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                        renderValue={(value) => {
                          if (!value) return "Select Category";
                          return categoryLabelById.get(String(value)) || String(value);
                        }}
                        MenuProps={{
                          autoFocus: false,
                          PaperProps: { sx: { maxHeight: 300, borderRadius: '12px' } }
                        }}
                        sx={{
                          borderRadius: '12px',
                          bgcolor: '#fff',
                          '& fieldset': { borderColor: T.border },
                          '&:hover fieldset': { borderColor: T.borderHover },
                          '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 2 },
                          '& .MuiSelect-select': { fontWeight: 600, color: T.text, py: 1.5 }
                        }}
                      >
                        <MenuItem value="" disabled sx={{ fontWeight: 600, color: T.textMuted }}>Select Category</MenuItem>
                        
                        <ListSubheader disableSticky sx={{ px: 1.5, py: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Search Category"
                            fullWidth
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            sx={inputSx}
                          />
                        </ListSubheader>

                        {categoriesLoading ? (
                          <MenuItem disabled sx={{ fontWeight: 600 }}>Loading categories...</MenuItem>
                        ) : filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <MenuItem key={cat.id} value={String(cat.id)} sx={{ fontWeight: 600 }}>
                              {cat.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled sx={{ fontWeight: 600 }}>No categories available</MenuItem>
                        )}
                      </Select>
                    </Box>

                    {/* Address */}
                    <Box>
                      <Typography sx={labelSx}>Address *</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Enter Address"
                        value={form.address}
                        onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Map Address Picker */}
                    <Box>
                      <Typography sx={labelSx}>Map Address *</Typography>
                      <Box
                        onClick={() => setShowMapPicker(true)}
                        sx={{
                          border: `1.5px solid ${T.border}`,
                          borderRadius: '12px',
                          bgcolor: '#fff',
                          p: 2.5,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          '&:hover': { borderColor: T.primary, bgcolor: alpha(T.primary, 0.02) }
                        }}
                      >
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: (form.latitude && form.longitude) ? T.text : T.textMuted }}>
                          {(form.latitude && form.longitude) 
                            ? `Lat: ${form.latitude}, Lng: ${form.longitude}` 
                            : 'Tap to get address'
                          }
                        </Typography>
                        <GpsFixedIcon sx={{ color: T.primary, fontSize: 20 }} />
                      </Box>
                    </Box>

                    {/* Google Maps Location Picker (Moved from Onboarding) */}
                    {showMapPicker && (
                      <Box sx={{
                        border: `2px dashed ${T.primary}`, borderRadius: '12px', bgcolor: alpha(T.primary, 0.03),
                        py: 4, px: 2, textAlign: 'center', transition: 'all 0.2s',
                        position: 'relative'
                      }}>
                        <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={(e) => { e.stopPropagation(); setShowMapPicker(false); }}>
                          <LuX size={18} />
                        </IconButton>
                        <MapIcon sx={{ fontSize: 36, color: T.primary, mb: 1 }} />
                        <Typography sx={{ color: T.text, fontWeight: 700, fontSize: '0.85rem' }}>Google Maps Location Picker</Typography>
                        <Typography sx={{ color: T.textSecondary, fontSize: '0.75rem', mt: 0.5, mb: 2 }}>
                          Click below to fetch and save your live location coordinates.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={handleUseMyLocation}
                          disabled={gpsLoading}
                          startIcon={gpsLoading ? <CircularProgress size={16} color="inherit" /> : <GpsFixedIcon />}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 800,
                            bgcolor: T.primary,
                            '&:hover': { bgcolor: T.primaryDark },
                          }}
                        >
                          {gpsLoading ? "Fetching..." : "Use Current Location"}
                        </Button>
                        {(form.latitude && form.longitude) && (
                          <Typography sx={{ color: T.primaryDark, fontSize: '0.75rem', mt: 1.5, fontWeight: 700 }}>
                            Saved: {form.latitude}, {form.longitude}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* State */}
                    <Box>
                      <Typography sx={labelSx}>State *</Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter State"
                        value={form.state}
                        onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Pincode */}
                    <Box>
                      <Typography sx={labelSx}>Pincode *</Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter Pincode"
                        value={form.pincode}
                        onChange={(e) => setForm(p => ({ ...p, pincode: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Description */}
                    <Box>
                      <Typography sx={labelSx}>Description *</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter Store Description"
                        value={form.description}
                        onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                        sx={inputSx}
                      />
                    </Box>

                    {/* Logo Select */}
                    {/* Shop Photo Select */}
                    <Box>
                      <Typography sx={labelSx}>Shop Photo *</Typography>
                      <input type="file" ref={shopImageRef} hidden accept="image/*" onChange={handlePickShopImage} />
                      <Box
                        onClick={() => shopImageRef.current?.click()}
                        sx={{
                          border: `1.5px solid ${T.border}`,
                          borderRadius: '12px',
                          bgcolor: '#fff',
                          p: 2.5,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: T.primary, bgcolor: alpha(T.primary, 0.02) }
                        }}
                      >
                        {form.shop_image_url ? (
                          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                            <Avatar src={form.shop_image_url} sx={{ width: 44, height: 44, borderRadius: '8px' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: T.text }}>Shop Photo Attached. Tap to change.</Typography>
                          </Stack>
                        ) : (
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: T.textMuted }}>
                            Tap to select shop photo
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Banner Select */}
                    <Box>
                      <Typography sx={labelSx}>Banner *</Typography>
                      <input type="file" ref={bannerRef} hidden accept="image/*" onChange={handlePickBanner} />
                      <Box
                        onClick={() => bannerRef.current?.click()}
                        sx={{
                          border: `1.5px solid ${T.border}`,
                          borderRadius: '12px',
                          bgcolor: '#fff',
                          p: 2.5,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: T.primary, bgcolor: alpha(T.primary, 0.02) }
                        }}
                      >
                        {form.banner_url ? (
                          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                            <img src={form.banner_url} alt="Banner" style={{ width: 60, height: 36, objectFit: 'cover', borderRadius: '4px' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: T.text }}>Banner Attached. Tap to change.</Typography>
                          </Stack>
                        ) : (
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: T.textMuted }}>
                            Tap to select Banner
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: T.border }} />

                    {/* Home Delivery Settings */}
                    <Box sx={{ p: 2, bgcolor: alpha(T.accent, 0.05), borderRadius: '12px', border: `1px solid ${alpha(T.accent, 0.15)}` }}>
                      <Typography sx={{ fontWeight: 850, fontSize: '0.92rem', color: T.accent, mb: 2 }}>
                        🚚 Home Delivery Settings
                      </Typography>

                      <Stack spacing={2.5}>
                        <Box>
                          <Typography sx={labelSx}>Offer Home Delivery?</Typography>
                          <Select
                            fullWidth
                            value={form.home_delivery_enabled ? 'yes' : 'no'}
                            onChange={(e) => setForm(p => ({ ...p, home_delivery_enabled: e.target.value === 'yes' }))}
                            sx={{ borderRadius: '12px', bgcolor: '#fff', '& .MuiSelect-select': { fontWeight: 700, py: 1.5 } }}
                          >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                          </Select>
                        </Box>

                        <TextField
                          label="Delivery Radius KM (max 25)"
                          type="number"
                          fullWidth
                          value={form.delivery_radius_km}
                          onChange={(e) => setForm(p => ({ ...p, delivery_radius_km: String(Math.min(Number(e.target.value) || 0, 25)) }))}
                          inputProps={{ min: 1, max: 25, step: 0.5 }}
                          disabled={!form.home_delivery_enabled}
                          sx={inputSx}
                        />

                        <TextField
                          label="Minimum Order Value"
                          type="number"
                          fullWidth
                          value={form.min_order_value}
                          onChange={(e) => setForm(p => ({ ...p, min_order_value: e.target.value }))}
                          inputProps={{ min: 0, step: 1 }}
                          disabled={!form.home_delivery_enabled}
                          sx={inputSx}
                        />

                        <TextField
                          label="Base Delivery Fee"
                          type="number"
                          fullWidth
                          value={form.base_delivery_fee}
                          onChange={(e) => setForm(p => ({ ...p, base_delivery_fee: e.target.value }))}
                          inputProps={{ min: 0, step: 1 }}
                          disabled={!form.home_delivery_enabled}
                          sx={inputSx}
                        />
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: T.border }} />

                    {/* Storewide Discount */}
                    <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.04)', borderRadius: '12px', border: `1px solid rgba(239, 68, 68, 0.15)` }}>
                      <Typography sx={{ fontWeight: 850, fontSize: '0.92rem', color: '#dc2626', mb: 2 }}>
                        🏷️ Storewide Discount
                      </Typography>
                      <TextField
                        label="Storewide Discount Percent (%)"
                        type="number"
                        fullWidth
                        value={form.discount_percent}
                        onChange={(e) => setForm(p => ({ ...p, discount_percent: e.target.value }))}
                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                        placeholder="e.g. 10 for 10% off storewide"
                        sx={inputSx}
                      />
                    </Box>

                    <Divider sx={{ my: 2, borderColor: T.border }} />

                    {/* Business Verification Details (Moved from Onboarding) */}
                    <Box sx={{ p: 2, bgcolor: alpha(T.primary, 0.04), borderRadius: '12px', border: `1px solid ${alpha(T.primary, 0.1)}` }}>
                      <Typography sx={{ fontWeight: 850, fontSize: '0.92rem', color: T.primary, mb: 2 }}>
                        Business Verification Docs (Optional)
                      </Typography>

                      <Stack spacing={2.5}>
                        <TextField
                          label="GST Number"
                          fullWidth
                          value={form.gst_number}
                          onChange={(e) => setForm(p => ({ ...p, gst_number: e.target.value.toUpperCase() }))}
                          placeholder="e.g. 22AAAAA1111A1Z1"
                          sx={inputSx}
                        />

                        <TextField
                          label="PAN Number"
                          fullWidth
                          value={form.pan_number}
                          onChange={(e) => setForm(p => ({ ...p, pan_number: e.target.value.toUpperCase() }))}
                          placeholder="e.g. ABCDE1234F"
                          sx={inputSx}
                        />

                        <TextField
                          label="Business Registration Number"
                          fullWidth
                          value={form.business_reg_number}
                          onChange={(e) => setForm(p => ({ ...p, business_reg_number: e.target.value }))}
                          placeholder="CIN / LLPIN / Registration ID"
                          sx={inputSx}
                        />

                        <Box>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: T.text, mb: 1 }}>Documents Upload</Typography>
                          <input type="file" ref={docsRef} hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocs} />
                          <Box
                            onClick={() => docsRef.current?.click()}
                            sx={{
                              border: `2px dashed ${T.border}`, borderRadius: '12px', bgcolor: '#fff',
                              p: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                              '&:hover': { borderColor: T.primary }
                            }}
                          >
                            <CloudUploadIcon sx={{ fontSize: 24, color: T.primary, mb: 0.5 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: T.text }}>
                              Upload documents (up to 5)
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: T.textMuted, mt: 0.25 }}>PDF, JPG, PNG (Max 10MB each)</Typography>
                          </Box>
                          {form.business_documents.length > 0 && (
                            <Stack spacing={1} sx={{ mt: 2 }}>
                              {form.business_documents.map((doc, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, bgcolor: '#fff', borderRadius: '8px', border: `1px solid ${T.border}` }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                    <AttachFileIcon sx={{ fontSize: 16, color: T.primary, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 650, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {doc.name}
                                    </Typography>
                                  </Stack>
                                  <IconButton size="small" color="error" onClick={() => removeDoc(idx)}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                      {form.id && (
                        <Button
                          variant="outlined"
                          onClick={resetForm}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 700,
                            color: T.textSecondary,
                            borderColor: T.border,
                            "&:hover": { bgcolor: alpha(T.border, 0.2) }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={saving}
                        variant="contained"
                        sx={{
                          flex: 2,
                          py: 1.5,
                          borderRadius: "12px",
                          fontWeight: 850,
                          textTransform: "none",
                          bgcolor: '#3b82f6', // Match the blue header button color
                          color: '#fff',
                          boxShadow: 'none',
                          "&:hover": { bgcolor: '#2563eb' }
                        }}
                      >
                        {saving ? <CircularProgress size={24} color="inherit" /> : form.id ? "Save Changes" : "Add Store"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side: Existing Shop List */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: T.text }}>
                Your Shops ({shops.length})
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="success" />
              </Box>
            ) : shops.length === 0 ? (
              <Card sx={{ borderRadius: T.radius, bgcolor: T.surface, border: `1px solid ${T.border}`, p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: T.textSecondary, fontWeight: 700 }}>
                  No shops created yet.
                </Typography>
                <Typography variant="body2" sx={{ color: T.textMuted, mt: 0.5 }}>
                  Fill out the form on the left to add your first storefront.
                </Typography>
              </Card>
            ) : (
              <Stack spacing={3}>
                {shops.map((s) => (
                  <Card
                    key={s.id}
                    sx={{
                      borderRadius: T.radius,
                      boxShadow: T.cardShadow,
                      bgcolor: T.surface,
                      border: `1px solid ${alpha(T.border, 0.6)}`,
                      overflow: "hidden",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                        borderColor: alpha(T.primary, 0.3)
                      }
                    }}
                  >
                    <Grid container>
                      {/* Left: Image banner inside the card */}
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ height: { xs: 150, sm: "100%" }, minHeight: { sm: 180 }, position: 'relative', bgcolor: alpha(T.primary, 0.05) }}>
                          {s.shop_image ? (
                            <img
                              src={s.shop_image}
                              alt={s.shop_name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.textMuted }}>
                              <StoreIcon sx={{ fontSize: 44 }} />
                            </Box>
                          )}
                          <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
                            <StatusChip status={s.status} />
                          </Box>
                        </Box>
                      </Grid>

                      {/* Right: Info */}
                      <Grid item xs={12} sm={8}>
                        <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%" }}>
                          <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: T.text, mb: 0.5 }}>
                            {s.shop_name}
                          </Typography>

                          <Typography variant="caption" sx={{ fontWeight: 700, color: T.primary, mb: 1.5, display: 'block' }}>
                            {s.category || 'RETAIL STORE'}
                          </Typography>

                          <Stack spacing={0.75} sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                              <Chip
                                size="small"
                               label={(s.serviceMode || s.service_mode) === 'ONLINE' ? 'ONLINE STORE' : (s.serviceMode || s.service_mode) === 'BOTH' ? 'ONLINE + NEARBY STORE' : 'B2C NEARBY STORE'}
                                sx={{ 
                                  fontWeight: 800, 
                                  fontSize: '0.68rem', 
                                  bgcolor: (s.serviceMode || s.service_mode) === 'ONLINE' ? '#eff6ff' : (s.serviceMode || s.service_mode) === 'BOTH' ? '#f5f3ff' : '#ecfdf5',
                                  color: (s.serviceMode || s.service_mode) === 'ONLINE' ? '#2563eb' : (s.serviceMode || s.service_mode) === 'BOTH' ? '#7c3aed' : '#059669'
                                }}
                              />
                              {Number(s.discountPercent || s.discount_percent) > 0 && (
                                <Chip
                                  size="small"
                                  label={`${s.discountPercent || s.discount_percent}% Storewide Discount`}
                                  sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#fef2f2', color: '#dc2626' }}
                                />
                              )}
                              <Chip
                                size="small"
                                label={s.home_delivery_enabled ? 'Home Delivery On' : 'No Home Delivery'}
                                color={s.home_delivery_enabled ? 'success' : 'default'}
                                sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                              />
                              {s.home_delivery_enabled && (
                                <Chip
                                  size="small"
                                  label={`Radius ${Math.min(Number(s.delivery_radius_km) || 5, 25)} km`}
                                  sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: alpha(T.accent, 0.1), color: T.accent }}
                                />
                              )}
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: T.textSecondary }}>
                              <PlaceIcon sx={{ fontSize: 15, color: T.textMuted }} />
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                {s.city} (Pincode: {s.pincode || '—'})
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: T.textSecondary }}>
                              <PhoneIcon sx={{ fontSize: 15, color: T.textMuted }} />
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                {s.contact_number}
                              </Typography>
                            </Stack>
                          </Stack>

                          {s.description && (
                            <Typography variant="caption" sx={{ color: T.textMuted, mb: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, minHeight: 32 }}>
                              {s.description}
                            </Typography>
                          )}

                          <Divider sx={{ my: 1.5, borderColor: T.border }} />

                          {/* Actions */}
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: "auto" }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ShoppingBagIcon sx={{ fontSize: 14 }} />}
                              onClick={() => navigate(`/business/shops/${s.id}/products`)}
                              sx={{
                                flexGrow: 1,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                borderColor: T.primary,
                                color: T.primary,
                                "&:hover": { bgcolor: alpha(T.primary, 0.05), borderColor: T.primaryDark }
                              }}
                            >
                              {s.home_delivery_enabled ? 'Manage Delivery Products' : 'Manage Products'}
                            </Button>

                            <IconButton
                              size="small"
                              onClick={() => startEdit(s)}
                              sx={{
                                bgcolor: alpha(T.primary, 0.05),
                                color: T.primary,
                                borderRadius: '8px',
                                width: 32,
                                height: 32,
                                "&:hover": { bgcolor: alpha(T.primary, 0.15) }
                              }}
                              title="Edit Shop"
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => handleDelete(s.id)}
                              sx={{
                                bgcolor: alpha(T.error, 0.05),
                                color: T.error,
                                borderRadius: '8px',
                                width: 32,
                                height: 32,
                                "&:hover": { bgcolor: alpha(T.error, 0.15) }
                              }}
                              title="Delete Shop"
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>

      <Dialog open={categoryDialogOpen} onClose={() => { setCategoryDialogOpen(false); resetCategoryDialog(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: T.text }}>Create Category</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              fullWidth
              value={newCategory.name}
              onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
              sx={inputSx}
            />
            <TextField
              label="Audience"
              select
              fullWidth
              value={newCategory.audience}
              onChange={(e) => setNewCategory((p) => ({ ...p, audience: e.target.value }))}
              sx={inputSx}
            >
              <MenuItem value="MERCHANT">Merchant</MenuItem>
              <MenuItem value="CONSUMER">Consumer</MenuItem>
            </TextField>
            <TextField
              label="Sort Order"
              fullWidth
              type="number"
              value={newCategory.sortOrder}
              onChange={(e) => setNewCategory((p) => ({ ...p, sortOrder: e.target.value }))}
              helperText="Optional — leave blank to auto-assign"
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => { setCategoryDialogOpen(false); resetCategoryDialog(); }}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCategory}
            disabled={creatingCategory}
            sx={{ bgcolor: T.primary, textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: T.primaryDark } }}
          >
            {creatingCategory ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
