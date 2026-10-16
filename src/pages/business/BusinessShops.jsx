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
  Drawer,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { getGPSLocation } from "../../utils/locationHelper";
import AppShell from "../../components/layout/AppShell";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StoreIcon from "@mui/icons-material/Store";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import MapIcon from "@mui/icons-material/Map";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import { LuX } from "react-icons/lu";
import PrimeMembershipModal from "../../components/business/PrimeMembershipModal";
import MerchantStandeeCard from "../../components/business/MerchantStandeeCard";
import { isMerchantPrime } from "../../utils/membershipHelper";

import {
  listMyShops,
  createShop,
  updateShop,
  deleteShop,
  getMerchantCategories,
  createMerchantCategory,
  getMerchantProfile,
} from "../../api/api";

/* ── Design Tokens (TriShopping Orange Theme) ── */
const T = {
  primary: '#EA580C',       // Signature TriShopping Orange
  primaryDark: '#C2410C',   // Deep Orange
  primaryLight: '#FFF7ED',  // Warm Orange Tint (orange-50)
  accent: '#F59E0B',        // Amber Highlight
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
  gradient: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
  btnGradient: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
  cardShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
  radius: '20px',
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
  const normalized = (!status || status === 0 || status === '0' || String(status).toUpperCase() === 'ACTIVE' || status === true)
    ? 'ACTIVE'
    : String(status).toUpperCase();

  const isPending = normalized === 'PENDING';
  const isRejected = normalized === 'REJECTED';

  return (
    <Chip
      size="small"
      label={isPending ? 'PENDING' : isRejected ? 'REJECTED' : 'ACTIVE'}
      sx={{
        fontWeight: 800,
        fontSize: '0.68rem',
        borderRadius: '8px',
        bgcolor: isPending ? '#fef3c7' : isRejected ? '#fee2e2' : '#ecfdf5',
        color: isPending ? '#b45309' : isRejected ? '#dc2626' : '#047857',
        border: `1px solid ${isPending ? '#fde68a' : isRejected ? '#fecaca' : '#a7f3d0'}`,
        height: '22px',
      }}
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
  const [primeModalOpen, setPrimeModalOpen] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("ALL");

  const shopImageRef = useRef(null);
  const bannerRef = useRef(null);
  const docsRef = useRef(null);

  const [profile, setProfile] = useState(null);

  const emptyForm = useMemo(
    () => {
      const storedMode = localStorage.getItem('service_mode_business');
      const defaultMode = storedMode === 'OFFLINE' ? 'OFFLINE' : 'ONLINE';
      return {
        id: null,
        shop_name: "",
        service_mode: defaultMode,
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
        scan_pay_commission_percent: "",
        business_documents: [],
      };
    },
    []
  );

  const [form, setForm] = useState(emptyForm);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle state to display/hide map picker
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [qrModalShop, setQrModalShop] = useState(null);

  async function fetchShops() {
    setLoading(true);
    setError("");
    try {
      const res = await listMyShops();
      const data = Array.isArray(res) ? res : res?.results || [];
      setShops(data);
    } catch (err) {
      console.warn("Could not fetch shops:", err);
      // Soft fallback for new accounts without shops - don't show intrusive error banner
      setShops([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShops();
    getMerchantProfile()
      .then(p => {
        setProfile(p);
        const resolvedMode = (p?.service_mode === 'OFFLINE' || p?.service_mode === 'ONLINE')
          ? p.service_mode
          : (localStorage.getItem('service_mode_business') === 'OFFLINE' ? 'OFFLINE' : 'ONLINE');
        setForm(prev => {
          if (!prev.id) {
            return { ...prev, service_mode: resolvedMode };
          }
          return prev;
        });
      })
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
    const resolvedMode = (profile?.service_mode === 'OFFLINE' || profile?.service_mode === 'ONLINE')
      ? profile.service_mode
      : (localStorage.getItem('service_mode_business') === 'OFFLINE' ? 'OFFLINE' : 'ONLINE');
    setForm({
      ...emptyForm,
      service_mode: resolvedMode,
    });
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

  const handleShopPincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm(p => ({ ...p, pincode: val }));

    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            setForm(p => ({
              ...p,
              city: po.District || po.Block || p.city,
              state: po.State || p.state,
            }));
          }
        }
      } catch (err) {
        console.warn("Could not auto-fetch shop pincode details:", err);
      }
    }
  };

  const startEdit = (shop) => {
    // Resolve category matching with merchant categories
    let resolvedCategory = "";
    if (shop.category || shop.category_id) {
      resolvedCategory = String(shop.category || shop.category_id);
    } else if (profile?.business_category || profile?.category) {
      const catName = String(profile.business_category || profile.category).toLowerCase();
      const matched = merchantCategories.find(c => String(c.name).toLowerCase() === catName || String(c.id) === catName);
      if (matched) resolvedCategory = String(matched.id);
    }
    if (!resolvedCategory && merchantCategories.length > 0) {
      resolvedCategory = String(merchantCategories[0].id);
    }

    const resolvedPhone = shop.contact_number || shop.phone || shop.mobile || profile?.phone || profile?.mobile_number || localStorage.getItem('business_phone') || localStorage.getItem('user_phone') || "";
    const resolvedEmail = shop.email || profile?.email || localStorage.getItem('business_email') || localStorage.getItem('user_email') || "";
    const resolvedAddress = shop.address || profile?.address || localStorage.getItem('business_address') || "";
    const resolvedCity = shop.city || profile?.city || localStorage.getItem('business_city') || "Bengaluru";
    const resolvedState = shop.state || profile?.state || localStorage.getItem('business_state') || "Karnataka";
    const resolvedPincode = shop.pincode || profile?.pincode || localStorage.getItem('business_pincode') || "560001";
    const resolvedDescription = shop.description || (shop.shop_name ? `${shop.shop_name} Outlet Store` : "Official Store Outlet");

    const rawMode = String(shop.serviceMode || shop.service_mode || "").toUpperCase();
    const resolvedServiceMode = rawMode === 'OFFLINE' ? 'OFFLINE' : 'ONLINE';

    setForm({
      id: shop.id,
      shop_name: shop.shop_name || profile?.business_name || "Store",
      service_mode: resolvedServiceMode,
      address: resolvedAddress,
      city: resolvedCity,
      latitude: shop.latitude || "",
      longitude: shop.longitude || "",
      contact_number: resolvedPhone,
      shop_image: null,
      shop_image_url: shop.shop_image || "",
      email: resolvedEmail,
      category: resolvedCategory,
      state: resolvedState,
      pincode: resolvedPincode,
      description: resolvedDescription,
      banner: null,
      banner_url: shop.banner || "",
      gst_number: shop.gst_number || profile?.gst_number || "",
      pan_number: shop.pan_number || profile?.pan_number || "",
      business_reg_number: shop.business_reg_number || "",
      home_delivery_enabled: Boolean(shop.home_delivery_enabled),
      delivery_radius_km: String(shop.delivery_radius_km ?? 5),
      min_order_value: String(shop.min_order_value ?? 0),
      base_delivery_fee: String(shop.base_delivery_fee ?? 0),
      discount_percent: String(shop.discountPercent ?? shop.discount_percent ?? 0),
      scan_pay_commission_percent: String(shop.scanPayCommissionPercent ?? shop.scan_pay_commission_percent ?? 2),
      business_documents: [],
    });
    setDrawerOpen(true);
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
    // Primary shop is included with merchant onboarding; additional branch shops require Prime membership
    if (!form.id && shops.length > 0 && !isMerchantPrime()) {
      setPrimeModalOpen(true);
      return;
    }
    if (!form.shop_name.trim()) { setError("Store Name is required."); return; }
    if (!form.contact_number.trim()) { setError("Mobile is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.category) { setError("Category is required."); return; }
    if (!form.address.trim()) { setError("Address is required."); return; }
    if (!form.state.trim()) { setError("State is required."); return; }
    if (!form.pincode.trim()) { setError("Pincode is required."); return; }
    const finalDescription = form.description?.trim() || `${form.shop_name || 'Store'} Official Outlet Store`;
    if (!form.id) {
      if (!form.shop_image && !form.shop_image_url) { setError("Shop photo is required."); return; }
      if (!form.banner && !form.banner_url) { setError("Banner image is required."); return; }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      shop_name: form.shop_name,
      service_mode: form.service_mode === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
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
      description: finalDescription,
      banner: form.banner,
      gst_number: form.gst_number,
      pan_number: form.pan_number,
      business_reg_number: form.business_reg_number,
      home_delivery_enabled: Boolean(form.home_delivery_enabled),
      delivery_radius_km: Math.min(Number(form.delivery_radius_km) || 5, 25),
      min_order_value: Math.max(Number(form.min_order_value) || 0, 0),
      base_delivery_fee: Math.max(Number(form.base_delivery_fee) || 0, 0),
      discount_percent: Math.max(0, Math.min(100, Number(form.discount_percent) || 0)),
      scan_pay_commission_percent: Math.max(0.5, Math.min(15, Number(form.scan_pay_commission_percent) || 2)),
      business_documents: form.business_documents,
    };

    try {
      const isEdit = !!form.id;
      if (isEdit) {
        await updateShop(form.id, payload);
      } else {
        await createShop(payload);
      }
      resetForm();
      setDrawerOpen(false);
      setSuccess(isEdit ? "Shop details updated successfully." : "Shop registered successfully.");
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

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const mode = String(s.serviceMode || s.service_mode || "").toUpperCase();
      if (modeFilter === "ONLINE" && mode !== "ONLINE") return false;
      if (modeFilter === "OFFLINE" && mode !== "OFFLINE") return false;
      if (shopSearch.trim()) {
        const q = shopSearch.toLowerCase();
        const name = (s.shop_name || "").toLowerCase();
        const city = (s.city || "").toLowerCase();
        const cat = (s.category || "").toLowerCase();
        return name.includes(q) || city.includes(q) || cat.includes(q);
      }
      return true;
    });
  }, [shops, modeFilter, shopSearch]);

  const onlineCount = useMemo(() => {
    return shops.filter(s => String(s.serviceMode || s.service_mode || "").toUpperCase() === "ONLINE").length;
  }, [shops]);

  const offlineCount = useMemo(() => {
    return shops.filter(s => String(s.serviceMode || s.service_mode || "").toUpperCase() === "OFFLINE").length;
  }, [shops]);

  return (
    <AppShell activeTab="/business/shops" title="My Shops">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Top Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, color: '#14231D', lineHeight: 1.25, fontSize: { xs: '1.25rem', sm: '1.35rem' } }}>
              Store Management
            </Typography>
          </Box>
          {(!shops || shops.length === 0) ? (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/registration-wizard')}
              sx={{
                bgcolor: '#FF5A0A',
                color: '#ffffff',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                minHeight: '40px',
                px: { xs: 2, sm: 2.5 },
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': { bgcolor: '#D94708' },
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              + Add Store
            </Button>
          ) : (
            <Chip
              label="1 Store Active"
              size="small"
              sx={{
                bgcolor: '#EAF7EF',
                color: '#16805D',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: '9999px',
                border: '1px solid #BBF7D0',
                height: 32,
                px: 1,
              }}
            />
          )}
        </Stack>

        {/* Notifications */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess("")}>{success}</Alert>}

        {/* ── Slide-up Add / Edit Store Bottom Drawer ── */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); resetForm(); }}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              maxHeight: '92vh',
              bgcolor: '#fff',
              p: { xs: 2.5, sm: 3.5 },
              overflowY: 'auto'
            }
          }}
        >
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: T.text }}>
                {form.id ? "✏️ Edit Store Details" : "🏪 Add Store"}
              </Typography>
              <Typography variant="caption" sx={{ color: T.textSecondary, fontWeight: 500 }}>
                Configure location, timings, delivery radius, and store info
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => { setDrawerOpen(false); resetForm(); }} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
              <LuX size={18} />
            </IconButton>
          </Stack>

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

                    {/* Service Mode Selector - Strictly ONLINE or OFFLINE, never BOTH */}
                    <Box>
                      <Typography sx={labelSx}>Service Mode *</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 0.5 }}>
                        <Box
                          onClick={() => setForm(p => ({ ...p, service_mode: 'ONLINE' }))}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            border: `2px solid ${form.service_mode === 'ONLINE' ? T.primary : T.border}`,
                            bgcolor: form.service_mode === 'ONLINE' ? T.primaryLight : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: form.service_mode === 'ONLINE' ? T.primary : T.text, mb: 0.25 }}>
                            🌐 ONLINE
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: T.textSecondary, lineHeight: 1.3 }}>
                            Online Store & Delivery
                          </Typography>
                        </Box>

                        <Box
                          onClick={() => setForm(p => ({ ...p, service_mode: 'OFFLINE' }))}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            border: `2px solid ${form.service_mode === 'OFFLINE' ? T.primary : T.border}`,
                            bgcolor: form.service_mode === 'OFFLINE' ? T.primaryLight : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: form.service_mode === 'OFFLINE' ? T.primary : T.text, mb: 0.25 }}>
                            🏬 OFFLINE
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: T.textSecondary, lineHeight: 1.3 }}>
                            Nearby Store & Scan & Pay
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.68rem', color: T.textMuted, mt: 0.75, fontWeight: 500 }}>
                        Note: Trikonekt does not support combined modes. To operate both Online & Offline, register separate stores with the same mobile number.
                      </Typography>
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
                        onChange={handleShopPincodeChange}
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

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(59, 130, 246, 0.04)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                      <Typography sx={{ fontWeight: 850, fontSize: '0.92rem', color: '#1d4ed8', mb: 2 }}>
                        💳 Scan &amp; Pay Network Commission
                      </Typography>
                      <Box>
                        <Box component="span" sx={labelSx}>Scan &amp; Pay Network Commission (%)</Box>
                        <TextField
                          type="number"
                          fullWidth
                          value={form.scan_pay_commission_percent}
                          onChange={(e) => setForm(p => ({ ...p, scan_pay_commission_percent: e.target.value }))}
                          inputProps={{ min: 0.5, max: 15, step: 0.1 }}
                          placeholder="e.g. 2.0%"
                          helperText="Fee on net Razorpay captured amount, distributed to local Captains & Territory Partners"
                          sx={inputSx}
                        />
                      </Box>
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
        </Drawer>

        {/* ── Existing Shop List (Full Width Grid) ── */}
        <Box sx={{ mb: 4 }}>
          {/* Search & Filter Header Strip */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 850, color: T.text, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Your Registered Stores ({filteredShops.length})
              </Typography>

              {/* Search Bar */}
              <Box sx={{ width: { xs: '100%', sm: 300 } }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search stores by name, city..."
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#ffffff',
                      fontSize: '0.82rem',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: '#cbd5e1' },
                      '&.Mui-focused fieldset': { borderColor: T.primary },
                    },
                  }}
                />
              </Box>
            </Stack>

            {/* Filter Pills */}
            <Stack
              direction="row"
              spacing={1}
              className="no-scrollbar"
              sx={{
                overflowX: 'auto',
                pb: 0.5,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {[
                { id: 'ALL', label: `All Stores (${shops.length})` },
                { id: 'ONLINE', label: `Online Stores (${onlineCount})` },
                { id: 'OFFLINE', label: `Nearby Outlets (${offlineCount})` },
              ].map((pill) => {
                const isSelected = modeFilter === pill.id;
                return (
                  <Chip
                    key={pill.id}
                    label={pill.label}
                    onClick={() => setModeFilter(pill.id)}
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                      height: 34,
                      px: 0.75,
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#FF5A0A' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#647084',
                      border: `1px solid ${isSelected ? '#FF5A0A' : '#E8E3DD'}`,
                      boxShadow: 'none',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      '&:hover': {
                        bgcolor: isSelected ? '#D94708' : '#FFF9F4',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#FF5A0A' }} />
            </Box>
          ) : filteredShops.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                bgcolor: '#ffffff',
                border: '1px solid #E8E3DD',
                p: { xs: 4, sm: 6 },
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                maxWidth: 480,
                mx: 'auto',
                my: { xs: 4, sm: 8 },
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: '#FFF0E5',
                  color: '#FF5A0A',
                  border: '1px solid #FFE0C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <StoreIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography sx={{ color: '#172033', fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
                {shopSearch || modeFilter !== 'ALL' ? 'No Matching Stores' : 'No Stores Registered Yet'}
              </Typography>
              <Typography sx={{ color: '#647084', fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.5, maxWidth: 360, mx: 'auto', mb: 3 }}>
                {shopSearch || modeFilter !== 'ALL'
                  ? 'Try clearing your search query or switching filters to see your registered outlet.'
                  : 'Register your retail storefront to start accepting online orders, manage inventory and reach more customers.'}
              </Typography>
              {shops.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/registration-wizard')}
                  sx={{
                    bgcolor: '#FF5A0A',
                    color: '#ffffff',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    px: 3.5,
                    py: 1.1,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#D94708' },
                  }}
                >
                  Add Your Store
                </Button>
              )}
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredShops.map((s, idx) => (
                <Grid item xs={12} sm={filteredShops.length === 1 ? 8 : 6} md={filteredShops.length === 1 ? 6 : 4} key={s.id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '20px',
                      boxShadow: '0 4px 16px rgba(23, 32, 51, 0.055)',
                      bgcolor: '#ffffff',
                      border: '1.5px solid #E4EAF2',
                      overflow: 'hidden',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 24px rgba(234, 88, 12, 0.1)',
                        borderColor: '#fed7aa',
                      }
                    }}
                  >
                    {/* Store Card Header Banner (TriShopping Orange Theme) */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: s.shop_image ? 140 : 100,
                        background: s.shop_image
                          ? 'transparent'
                          : 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        px: 2.5,
                      }}
                    >
                      {s.shop_image ? (
                        <Box
                          component="img"
                          src={s.shop_image}
                          alt={s.shop_name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ zIndex: 1 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '12px',
                              bgcolor: 'rgba(255, 255, 255, 0.22)',
                              color: '#ffffff',
                              display: 'grid',
                              placeItems: 'center',
                              border: '1.5px solid rgba(255, 255, 255, 0.45)',
                            }}
                          >
                            <StoreIcon sx={{ fontSize: 24 }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: '#ffffff', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.2 }} noWrap>
                              {s.shop_name}
                            </Typography>
                            <Typography sx={{ color: '#fed7aa', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }} noWrap>
                              {s.category || 'RETAIL STORE'}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* Floating Status & Primary Badge on Top Right */}
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                        {idx === 0 && (
                          <Chip
                            size="small"
                            label="PRIMARY"
                            sx={{
                              height: 22,
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              bgcolor: 'rgba(15, 23, 42, 0.85)',
                              color: '#ffffff',
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          />
                        )}
                        <StatusChip status={s.status} />
                      </Stack>
                    </Box>

                    {/* Store Details Body */}
                    <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
                      {s.shop_image && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', mb: 0.25 }}>
                            {s.shop_name}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            {s.category || 'RETAIL STORE'}
                          </Typography>
                        </Box>
                      )}

                      {/* Operating Hours & Location Line (Screen 2 Mockup) */}
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.75 }}>
                        <AccessTimeIcon sx={{ fontSize: 15, color: '#f97316', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                          Open 8:00 AM - 10:00 PM • {s.city || 'Bangalore'}
                        </Typography>
                      </Stack>

                      {/* Quick Metric Pills Strip (Screen 2 Mockup: Products, Orders, Rating) */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                          size="small"
                          icon={<ShoppingBagIcon sx={{ fontSize: '13px !important', color: '#2563eb !important' }} />}
                          label={`${s.products_count ?? s.product_count ?? 0} Products`}
                          sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                          }}
                        />
                        <Chip
                          size="small"
                          icon={<StoreIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
                          label={`${s.orders_count ?? s.order_count ?? 0} Orders`}
                          sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                          }}
                        />
                        <Chip
                          size="small"
                          icon={<StarIcon sx={{ fontSize: '13px !important', color: '#d97706 !important' }} />}
                          label={`${s.rating ? Number(s.rating).toFixed(1) : '4.8'} ★`}
                          sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                          }}
                        />
                      </Stack>

                      {/* Tag Badges */}
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                        <Chip
                          size="small"
                          label={(s.serviceMode || s.service_mode) === 'ONLINE' ? 'ONLINE STORE' : 'B2C NEARBY STORE'}
                          sx={{ 
                            fontWeight: 800, 
                            fontSize: '0.68rem', 
                            height: 22,
                            borderRadius: '6px',
                            bgcolor: (s.serviceMode || s.service_mode) === 'ONLINE' ? '#eff6ff' : '#ecfdf5',
                            color: (s.serviceMode || s.service_mode) === 'ONLINE' ? '#2563eb' : '#059669',
                            border: '1px solid rgba(0,0,0,0.06)'
                          }}
                        />
                        <Chip
                          size="small"
                          label={s.home_delivery_enabled ? 'Home Delivery Active' : 'No Home Delivery'}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 22,
                            borderRadius: '6px',
                            bgcolor: s.home_delivery_enabled ? '#ecfdf5' : '#f8fafc',
                            color: s.home_delivery_enabled ? '#047857' : '#64748b',
                            border: `1px solid ${s.home_delivery_enabled ? '#a7f3d0' : '#e2e8f0'}`
                          }}
                        />
                        {Number(s.discountPercent || s.discount_percent) > 0 && (
                          <Chip
                            size="small"
                            label={`${s.discountPercent || s.discount_percent}% Storewide Discount`}
                            sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px', bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                          />
                        )}
                        {Number(s.scanPayCommissionPercent || s.scan_pay_commission_percent || 0) > 0 && (
                          <Chip
                            size="small"
                            label={`${s.scanPayCommissionPercent || s.scan_pay_commission_percent || 0}% S&P Network Fee`}
                            sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px', bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                          />
                        )}
                      </Stack>

                      {/* Location & Contact Info */}
                      <Stack spacing={0.75} sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#475569' }}>
                          <PlaceIcon sx={{ fontSize: 16, color: '#EA580C', flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                            {s.city || 'Store Location'} (Pincode: {s.pincode || '—'})
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#475569' }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#EA580C', flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                            {s.contact_number || 'No contact specified'}
                          </Typography>
                        </Stack>
                      </Stack>

                      {s.description && (
                        <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mb: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                          {s.description}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                      {/* Standardized Bottom Action Buttons (TriShopping Theme) */}
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 'auto' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
                          onClick={() => navigate(`/business/shops/${s.id}/products`)}
                          sx={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            bgcolor: '#FF6B00',
                            color: '#ffffff',
                            boxShadow: 'none',
                            whiteSpace: 'nowrap',
                            '&:hover': { bgcolor: '#E85D04' },
                            '&:active': { transform: 'scale(0.98)' }
                          }}
                        >
                          {s.home_delivery_enabled ? 'Delivery Products' : 'Manage Products'}
                        </Button>

                        <IconButton
                          size="small"
                          onClick={() => setQrModalShop(s)}
                          sx={{
                            bgcolor: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: '10px',
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            border: '1px solid #bfdbfe',
                            '&:hover': { bgcolor: '#dbeafe' }
                          }}
                          title="Scan & Pay QR Standee"
                        >
                          <QrCode2Icon sx={{ fontSize: 20 }} />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => startEdit(s)}
                          sx={{
                            bgcolor: '#f1f5f9',
                            color: '#0f172a',
                            borderRadius: '10px',
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            border: '1px solid #e2e8f0',
                            '&:hover': { bgcolor: '#e2e8f0' }
                          }}
                          title="Edit Shop"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleDelete(s.id)}
                          sx={{
                            bgcolor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '10px',
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            border: '1px solid #fecaca',
                            '&:hover': { bgcolor: '#fecaca' }
                          }}
                          title="Delete Shop"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

      </Container>

      {/* ── Category Creation Bottom Drawer ── */}
      <Drawer
        anchor="bottom"
        open={categoryDialogOpen}
        onClose={() => { setCategoryDialogOpen(false); resetCategoryDialog(); }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxWidth: 480,
            mx: 'auto',
            p: 3,
            pt: 1.5,
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: T.text }}>Create Category</Typography>
          <IconButton size="small" onClick={() => { setCategoryDialogOpen(false); resetCategoryDialog(); }}>
            <LuX size={18} />
          </IconButton>
        </Stack>
        <Stack spacing={2}>
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
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setCategoryDialogOpen(false); resetCategoryDialog(); }}
              sx={{ color: T.textSecondary, borderColor: T.border, textTransform: 'none', fontWeight: 800, borderRadius: '12px', py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCreateCategory}
              disabled={creatingCategory}
              sx={{ bgcolor: T.primary, color: '#fff', textTransform: 'none', fontWeight: 800, borderRadius: '12px', py: 1.2, '&:hover': { bgcolor: T.primaryDark } }}
            >
              {creatingCategory ? 'Creating…' : 'Create Category'}
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* ── Official Merchant QR Standee Modal (Revamped Acrylic Design) ── */}
      <Dialog
        open={Boolean(qrModalShop)}
        onClose={() => setQrModalShop(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '28px',
            p: { xs: 1.5, sm: 2 },
            bgcolor: '#FFFDF9',
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        {qrModalShop && (
          <MerchantStandeeCard
            shop={qrModalShop}
            onClose={() => setQrModalShop(null)}
            showActions={true}
          />
        )}
      </Dialog>

      <PrimeMembershipModal
        open={primeModalOpen}
        onClose={() => setPrimeModalOpen(false)}
        featureName="add and register new merchant stores"
      />
    </AppShell>
  );
}
