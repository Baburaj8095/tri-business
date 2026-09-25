import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button, Stack, MenuItem,
  TextareaAutosize, FormHelperText, CircularProgress, Alert, Paper, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Collapse,
  Grid, InputLabel, CardMedia, InputAdornment, useMediaQuery, useTheme, Container
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimeMembershipModal from "../../components/business/PrimeMembershipModal";
import { isMerchantPrime } from "../../utils/membershipHelper";

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

import {
  getMerchantProfile,
  listMyShops,
  createShop,
  getMerchantCategories,
  createMyShopProduct,
  listMyShopProducts,
  updateMyShopProduct,
  deleteMyShopProduct,
} from "../../api/api";

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Beauty & Personal Care",
  "Other",
];

const compressImage = (file, maxSizeMB = 0.8) => {
  return new Promise((resolve) => {
    if (file.size / 1024 / 1024 < maxSizeMB) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
    };
  });
};

function MobileInventoryProductCard({ p, onEdit, onDelete }) {
  const defaultImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";
  const rawImg = p.image || p.image_url || p.product_image;
  const initialImg = rawImg ? resolveImageUrl(rawImg) : defaultImg;
  const [imgSrc, setImgSrc] = useState(initialImg);

  const qty = Number(p.stock_qty || p.stockQty || 0);
  const price = Number(p.price || 0);
  const mrp = Number(p.mrp || (price > 0 ? (price * 1.25).toFixed(0) : 0));
  const discountPercent = p.discountPercent || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  let stockBadgeBg = "#ecfdf5";
  let stockBadgeColor = "#059669";
  let stockLabel = `In Stock (${qty} units)`;
  if (qty === 0) {
    stockBadgeBg = "#fef2f2";
    stockBadgeColor = "#dc2626";
    stockLabel = "Out of Stock";
  } else if (qty <= 10) {
    stockBadgeBg = "#fffbeb";
    stockBadgeColor = "#d97706";
    stockLabel = `Low Stock (${qty} left)`;
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)' },
      }}
    >
      <Stack direction="row" spacing={1.75} p={1.75}>
        {/* Product Image Thumbnail */}
        <Box sx={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
          <Box
            component="img"
            src={imgSrc}
            alt={p.title}
            onError={() => setImgSrc(defaultImg)}
            sx={{
              width: 92,
              height: 92,
              borderRadius: '14px',
              objectFit: 'cover',
              bgcolor: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          />
          {discountPercent > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                bgcolor: '#dc2626',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 900,
                px: 0.75,
                py: 0.2,
                borderRadius: '6px',
                lineHeight: 1.2,
              }}
            >
              {discountPercent}% OFF
            </Box>
          )}
        </Box>

        {/* Product Details */}
        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.35 }}>
              <Chip
                label={p.category || "General"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  textTransform: 'uppercase',
                }}
              />
              <Chip
                label={p.is_active !== false ? "Active" : "Draft"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: p.is_active !== false ? '#dcfce7' : '#f1f5f9',
                  color: p.is_active !== false ? '#15803d' : '#64748b',
                }}
              />
            </Stack>

            <Typography
              sx={{
                fontWeight: 850,
                fontSize: '0.92rem',
                color: '#0f172a',
                lineHeight: 1.25,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {p.title}
            </Typography>
          </div>

          <Box sx={{ mt: 0.75 }}>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#1B4D3E' }}>
                ₹{price.toFixed(2)}
              </Typography>
              {mrp > price && (
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                  ₹{mrp.toFixed(2)}
                </Typography>
              )}
            </Stack>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: stockBadgeBg,
                color: stockBadgeColor,
                fontSize: '0.68rem',
                fontWeight: 800,
                mt: 0.5,
              }}
            >
              {stockLabel}
            </Box>
          </Box>
        </Box>
      </Stack>

      {/* Quick Action Footer */}
      <Box
        sx={{
          borderTop: '1px solid #f1f5f9',
          px: 1.75,
          py: 1,
          bgcolor: '#fbfcfd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          SKU #{p.id}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={() => onEdit(p)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.72rem',
              py: 0.4,
              px: 1.5,
              borderColor: '#cbd5e1',
              color: '#334155',
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
            onClick={() => onDelete(p.id)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.72rem',
              py: 0.4,
              px: 1.25,
              borderColor: 'rgba(239, 68, 68, 0.4)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)' },
            }}
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}

export default function InventoryPage() {
  const navigate = useNavigate();
  
  // State
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(PRODUCT_CATEGORIES);
  
  const [loading, setLoading] = useState(true);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // UI State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [primeModalOpen, setPrimeModalOpen] = useState(false);
  
  // Add Form State
  const [formData, setFormData] = useState({
    productName: "", category: "", price: "", discountPercent: "0", quantity: "", description: "", image: null,
  });
  const [addStep, setAddStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  // Edit Form State
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filterStatus === "All") return true;
    if (filterStatus === "Active") return p.is_active;
    if (filterStatus === "Out of Stock") return (p.stock_qty || p.stockQty || 0) === 0;
    if (filterStatus === "Low Stock") {
       const qty = p.stock_qty || p.stockQty || 0;
       return qty > 0 && qty <= 10;
    }
    if (filterStatus === "Draft") return !p.is_active;
    return true;
  });

  const fetchInventory = useCallback(async (shopId) => {
    try {
      const data = await listMyShopProducts(shopId);
      setProducts(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to fetch shop products:", err);
    }
  }, []);

  const initInventory = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const p = await getMerchantProfile().catch(() => null);
      setProfile(p);
      const serviceMode = String(p?.service_mode || localStorage.getItem('service_mode_business') || 'OFFLINE').toUpperCase();

      let shopsList = await listMyShops().catch(() => []);
      
      // Filter shops based on service mode if needed, or if ONLINE auto-create one.
      if (serviceMode === 'ONLINE') {
        let activeShop = shopsList.find((s) => String(s.serviceMode || s.service_mode || "").toUpperCase() === "ONLINE");
        if (!activeShop && shopsList.length > 0) {
          activeShop = shopsList[shopsList.length - 1]; // Use oldest shop as the default one to avoid picking up freshly created empty duplicates
        }
        if (!activeShop) {
          const cats = await getMerchantCategories().catch(() => []);
          const catId = cats[0]?.id || 1;
          await createShop({
            shop_name: "Default Online Store",
            service_mode: "ONLINE",
            address: p?.address || "Online Store Address",
            city: p?.city || "Online",
            state: "Online",
            pincode: p?.pincode || "100000",
            contact_number: p?.phone || p?.mobileNumber || "0000000000",
            email: p?.email || "online-store@trikonekt.com",
            category: catId,
            home_delivery_enabled: true,
            delivery_radius_km: 25,
            min_order_value: 0,
            base_delivery_fee: 0,
          });
          shopsList = await listMyShops().catch(() => []);
          activeShop = shopsList.find((s) => String(s.serviceMode || s.service_mode || "").toUpperCase() === "ONLINE") || shopsList[0];
        }
        if (activeShop) {
          setShops([activeShop]);
          setSelectedShop(activeShop);
          await fetchInventory(activeShop.id);
        } else {
          setErrorMessage("Failed to create or retrieve online store.");
        }
      } else {
        // OFFLINE or TRIZONE
        if (shopsList.length > 0) {
          setShops(shopsList);
          setSelectedShop(shopsList[0]);
          await fetchInventory(shopsList[0].id);
        } else {
          setErrorMessage("No physical shops found. Please register a shop in 'Manage Shops' first.");
        }
      }

      // Fetch dynamic categories if available
      try {
        const captainApiUrl = process.env.REACT_APP_CAPTAIN_API_URL || "https://api-captain.trikonektbusiness.com/api";
        const response = await fetch(`${captainApiUrl}/captain/shops/online/categories`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) setCategories(data);
        }
      } catch (err) {}

    } catch (err) {
      console.error("Initialization error:", err);
      setErrorMessage("Failed to load inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchInventory]);

  useEffect(() => {
    initInventory();
  }, [initInventory]);

  const handleShopChange = (e) => {
    const shopId = e.target.value;
    const shop = shops.find(s => s.id === shopId);
    setSelectedShop(shop);
    if (shop) fetchInventory(shop.id);
  };

  // ----- Multi-Step Wizard Logic -----
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleNextStep = () => {
    const newErrors = {};
    if (addStep === 0) {
      if (!formData.productName.trim()) newErrors.productName = "Product name is required";
      if (!formData.category) newErrors.category = "Please select a category";
    } else if (addStep === 1) {
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Valid MRP is required";
      if (!formData.quantity || Number(formData.quantity) < 0) newErrors.quantity = "Valid stock quantity is required";
    }
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setAddStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setAddStep(prev => Math.max(prev - 1, 0));
  };

  const handleAddSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = "Required";
    if (!formData.category) newErrors.category = "Required";
    if (!formData.price) newErrors.price = "Required";
    if (!formData.quantity) newErrors.quantity = "Required";
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmittingProduct(true);
    setErrorMessage("");

    if (!selectedShop || !selectedShop.id) {
      setErrorMessage("No active shop found. Please check your shop registration or refresh.");
      setSubmittingProduct(false);
      return;
    }

    try {
      const isOnline = String(profile?.service_mode || localStorage.getItem('service_mode_business') || "").toUpperCase() === 'ONLINE';
      const mrpVal = Number(formData.price);
      const discountPct = Number(formData.discountPercent || 0);
      const sellingPrice = mrpVal - (mrpVal * discountPct / 100);

      const payload = {
        title: formData.productName,
        description: formData.description,
        mrp: mrpVal,
        price: sellingPrice,
        discount_percent: discountPct,
        online_delivery: isOnline,
        offline_delivery: !isOnline,
        stock_qty: Number(formData.quantity),
        image: formData.image,
        category: formData.category,
      };

      await createMyShopProduct(selectedShop.id, payload);
      setSuccessMessage(`Product added successfully!`);
      setFormData({ productName: "", category: "", price: "", discountPercent: "0", quantity: "", description: "", image: null });
      setAddStep(0);
      setIsAddFormOpen(false);
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to add product.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // ----- Edit Product Logic -----
  const handleEditClick = (product) => {
    if (editingProductId === product.id) {
      setEditingProductId(null); // toggle off
    } else {
      setEditingProductId(product.id);
      setEditFormData({
        title: product.title || "",
        mrp: product.mrp || product.price || "",
        discount_percent: product.discount_percent || 0,
        price: product.price || "",
        stock_qty: product.stock_qty || product.stockQty || 0,
        image: null // only populated if user uploads a new one
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (productId) => {
    setIsUpdating(true);
    try {
      const mrpVal = Number(editFormData.mrp || editFormData.price);
      const discountPct = Number(editFormData.discount_percent || 0);
      const sellingPrice = mrpVal - (mrpVal * discountPct / 100);

      const patch = {
        title: editFormData.title,
        mrp: mrpVal,
        price: sellingPrice,
        discount_percent: discountPct,
        stock_qty: Number(editFormData.stock_qty),
      };
      if (editFormData.image) {
        patch.image = editFormData.image;
      }
      
      await updateMyShopProduct(productId, patch);
      setSuccessMessage("Product updated successfully!");
      setEditingProductId(null);
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage("Failed to update product.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteMyShopProduct(productId);
      setSuccessMessage("Product deleted.");
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage("Failed to delete product.");
    }
  };

  const currentServiceMode = String(profile?.service_mode || localStorage.getItem('service_mode_business') || 'OFFLINE').toUpperCase();
  const serviceModeDisplay = currentServiceMode === 'ONLINE' ? 'Online' : (currentServiceMode === 'TRIZONE' ? 'TriZone' : 'Offline / Nearby');

  return (
    <AppShell activeTab="/business/inventory" title="Inventory Management">
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
        {/* Top Header Bar */}
        <Box sx={{ mb: 3.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
              {serviceModeDisplay} Inventory & Catalog
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
              Manage products, pricing, stock levels, and catalog visibility across your sales channels.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
            {shops.length > 1 && (
              <TextField
                select
                size="small"
                value={selectedShop?.id || ""}
                onChange={handleShopChange}
                sx={{ bgcolor: '#fff', borderRadius: '12px', minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                {shops.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.shop_name || `Shop #${s.id}`}</MenuItem>
                ))}
              </TextField>
            )}
            <Button
              variant={isAddFormOpen ? "outlined" : "contained"}
              startIcon={isAddFormOpen ? <CloseIcon /> : <AddIcon />}
              onClick={() => {
                if (!isAddFormOpen && !isMerchantPrime()) {
                  setPrimeModalOpen(true);
                  return;
                }
                setIsAddFormOpen(!isAddFormOpen);
              }}
              color={isAddFormOpen ? "error" : "success"}
              sx={{ 
                fontWeight: 800, 
                textTransform: "none", 
                borderRadius: '12px', 
                px: 2.5,
                py: 1.1,
                bgcolor: isAddFormOpen ? "transparent" : "#1B4D3E",
                borderColor: isAddFormOpen ? "#ef4444" : "transparent",
                color: isAddFormOpen ? "#ef4444" : "#fff",
                boxShadow: isAddFormOpen ? 'none' : '0 4px 14px rgba(27, 77, 62, 0.25)',
                "&:hover": {
                  bgcolor: isAddFormOpen ? "rgba(239,68,68,0.05)" : "#143d31"
                }
              }}
            >
              {isAddFormOpen ? "Close Form" : "Add Product"}
            </Button>
          </Stack>
        </Box>

        {/* Top KPI Metrics Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Items
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', mt: 0.5, lineHeight: 1 }}>
                  {products.length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75 }}>
                  Catalog SKUs
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  In Stock
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', mt: 0.5, lineHeight: 1 }}>
                  {products.filter(p => (p.stock_qty || p.stockQty || 0) > 10).length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75 }}>
                  Healthy inventory
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Low Stock
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', mt: 0.5, lineHeight: 1 }}>
                  {products.filter(p => { const q = p.stock_qty || p.stockQty || 0; return q > 0 && q <= 10; }).length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75 }}>
                  Need replenishment
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Out of Stock
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', mt: 0.5, lineHeight: 1 }}>
                  {products.filter(p => (p.stock_qty || p.stockQty || 0) === 0).length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75 }}>
                  Unavailable for purchase
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      {/* ALERTS */}
      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>{errorMessage}</Alert>}

      {/* ADD PRODUCT MULTI-STEP WIZARD */}
      <Collapse in={isAddFormOpen}>
        <Card sx={{ mb: 4, borderRadius: '20px', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Wizard Header Banner */}
          <Box sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(5, 150, 105, 0.12)', display: 'grid', placeItems: 'center', color: '#059669' }}>
                  <ShoppingBagIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                    Add Product Wizard
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Step {addStep + 1} of 4: {['Product Basics & Category', 'Pricing & Inventory Stock', 'Media & Details', 'Review & Publish'][addStep]}
                  </Typography>
                </Box>
              </Stack>
              <Button
                size="small"
                onClick={() => { setIsAddFormOpen(false); setAddStep(0); }}
                startIcon={<CloseIcon />}
                sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
              >
                Close
              </Button>
            </Stack>

            {/* Stepper Tabs Bar */}
            <Grid container spacing={1}>
              {[
                { step: 0, label: '1. Basics', icon: '📝' },
                { step: 1, label: '2. Pricing & Stock', icon: '💰' },
                { step: 2, label: '3. Media & Details', icon: '🖼️' },
                { step: 3, label: '4. Review & Publish', icon: '🚀' }
              ].map((s) => {
                const isDone = addStep > s.step;
                const isCurrent = addStep === s.step;
                return (
                  <Grid item xs={6} sm={3} key={s.step}>
                    <Box
                      onClick={() => { if (s.step < addStep) setAddStep(s.step); }}
                      sx={{
                        p: 1.25,
                        borderRadius: '12px',
                        bgcolor: isCurrent ? '#ffffff' : isDone ? '#f0fdf4' : 'rgba(255,255,255,0.6)',
                        border: `1.5px solid ${isCurrent ? '#059669' : isDone ? '#10b981' : '#e2e8f0'}`,
                        cursor: s.step < addStep ? 'pointer' : 'default',
                        boxShadow: isCurrent ? '0 2px 8px rgba(5, 150, 105, 0.15)' : 'none',
                        transition: 'all 0.15s ease',
                        textAlign: 'center'
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75}>
                        <Typography sx={{ fontSize: '1rem' }}>{s.icon}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: isCurrent ? 900 : 700, color: isCurrent ? '#059669' : isDone ? '#16a34a' : '#64748b' }} noWrap>
                          {s.label}
                        </Typography>
                        {isDone && <CheckIcon sx={{ fontSize: 16, color: '#16a34a' }} />}
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* ── STEP 0: Product Basics & Category ── */}
            {addStep === 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  Step 1: Enter Product Identity & Category
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      label="Product Full Name *"
                      name="productName"
                      placeholder="e.g., Fortune Sunlite Refined Sunflower Oil 1L"
                      value={formData.productName}
                      onChange={handleAddChange}
                      error={!!formErrors.productName}
                      helperText={formErrors.productName || "Include brand, item title, and packaging size"}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700 } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      select
                      label="Category *"
                      name="category"
                      value={formData.category}
                      onChange={handleAddChange}
                      error={!!formErrors.category}
                      helperText={formErrors.category || "Select the department for this item"}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700 } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    >
                      {categories.map((cat) => {
                        const name = typeof cat === "string" ? cat : cat.name || cat;
                        return <MenuItem key={name} value={name}>{name}</MenuItem>;
                      })}
                    </TextField>
                  </Grid>

                  {/* Visual Quick Category Selection Chips */}
                  <Grid item xs={12}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', mb: 1 }}>
                      Quick Category Selection:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          clickable
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: cat }));
                            if (formErrors.category) setFormErrors(prev => ({ ...prev, category: "" }));
                          }}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '12px',
                            bgcolor: formData.category === cat ? '#059669' : '#f1f5f9',
                            color: formData.category === cat ? '#ffffff' : '#334155',
                            '&:hover': { bgcolor: formData.category === cat ? '#047857' : '#e2e8f0' }
                          }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ── STEP 1: Pricing & Stock ── */}
            {addStep === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  Step 2: Set Pricing, Discounts & Inventory Stock
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="MRP (Retail Price ₹) *"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleAddChange}
                      error={!!formErrors.price}
                      helperText={formErrors.price || "Official maximum retail price"}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700 } }}
                      inputProps={{ min: "0", step: "any" }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Discount Percentage (%)"
                      name="discountPercent"
                      placeholder="0"
                      value={formData.discountPercent}
                      onChange={handleAddChange}
                      error={!!formErrors.discountPercent}
                      helperText={formErrors.discountPercent || "Discount offered to buyers"}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700 } }}
                      inputProps={{ min: "0", max: "100", step: "any" }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Initial Stock Quantity *"
                      name="quantity"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={handleAddChange}
                      error={!!formErrors.quantity}
                      helperText={formErrors.quantity || "Units currently on hand"}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700 } }}
                      inputProps={{ min: "0" }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>

                  {/* Live Calculated Selling Price Card */}
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ p: 2.5, bgcolor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                            Effective Selling / Wholesale Price
                          </Typography>
                          <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                            ₹{((Number(formData.price || 0)) - ((Number(formData.price || 0)) * (Number(formData.discountPercent || 0)) / 100)).toFixed(2)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Buyers & customers will purchase this item at this calculated price.
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Chip
                            label={Number(formData.discountPercent || 0) > 0 ? `${formData.discountPercent}% Discount Applied` : 'Standard MRP'}
                            sx={{ bgcolor: '#059669', color: '#fff', fontWeight: 800, fontSize: '0.8rem', px: 1 }}
                          />
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ── STEP 2: Media & Description ── */}
            {addStep === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  Step 3: Product Image & Detailed Description
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        border: '2px dashed #94a3b8',
                        borderRadius: '14px',
                        p: 3,
                        textAlign: 'center',
                        bgcolor: '#f8fafc',
                        transition: 'border-color 0.2s',
                        '&:hover': { borderColor: '#059669' }
                      }}
                    >
                      {formData.image ? (
                        <Box>
                          <Box
                            component="img"
                            src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                            alt="Upload preview"
                            sx={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: '10px', mb: 2 }}
                          />
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                            {formData.image.name || "Product Image"}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                          >
                            Remove / Change Image
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#ecfdf5', display: 'grid', placeItems: 'center', mx: 'auto', mb: 1.5, color: '#059669' }}>
                            <CloudUploadIcon sx={{ fontSize: 30 }} />
                          </Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', mb: 0.5 }}>
                            Upload Product Photo
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 2 }}>
                            High-quality JPG or PNG images increase catalog sales by 4x
                          </Typography>
                          <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="wizard-image-input"
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file);
                                setFormData(prev => ({ ...prev, image: compressed }));
                              }
                            }}
                          />
                          <label htmlFor="wizard-image-input">
                            <Button
                              component="span"
                              variant="contained"
                              sx={{
                                bgcolor: '#059669',
                                borderRadius: '10px',
                                px: 3,
                                py: 0.8,
                                fontWeight: 800,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#047857' }
                              }}
                            >
                              Browse Files
                            </Button>
                          </label>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Description"
                      name="description"
                      multiline
                      rows={7}
                      placeholder="Describe ingredients, key features, packaging specifications, or manufacturer guarantees..."
                      value={formData.description}
                      onChange={handleAddChange}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700 } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ── STEP 3: Review & Publish ── */}
            {addStep === 3 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  Step 4: Review Product Card & Publish to Catalog
                </Typography>
                <Grid container spacing={3} alignItems="center">
                  {/* Live Preview Card */}
                  <Grid item xs={12} sm={6} md={5}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mb: 1 }}>
                      Live Customer View Preview:
                    </Typography>
                    <Card elevation={0} sx={{ border: '1.5px solid #10b981', borderRadius: '16px', overflow: 'hidden', bgcolor: '#ffffff', boxShadow: '0 8px 24px rgba(16,185,129,0.12)' }}>
                      <Box sx={{ height: 160, bgcolor: '#f8fafc', display: 'grid', placeItems: 'center', p: 2, position: 'relative' }}>
                        {formData.image ? (
                          <Box component="img" src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} alt="Preview" sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        ) : (
                          <ShoppingBagIcon sx={{ fontSize: 50, color: '#cbd5e1' }} />
                        )}
                        <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(255,255,255,0.95)', px: 0.8, py: 0.25, borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <Typography sx={{ fontSize: '9px', fontWeight: 900, color: '#059669' }}>⚡ 15-30 MINS</Typography>
                        </Box>
                        {Number(formData.discountPercent || 0) > 0 && (
                          <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: '#10b981', color: '#fff', fontSize: '10px', fontWeight: 900, px: 0.8, py: 0.2, borderRadius: '4px' }}>
                            {formData.discountPercent}% OFF
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                          {formData.category || 'General'}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', mb: 1, minHeight: '2.4em' }}>
                          {formData.productName || 'Product Title'}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                              ₹{((Number(formData.price || 0)) - ((Number(formData.price || 0)) * (Number(formData.discountPercent || 0)) / 100)).toFixed(2)}
                            </Typography>
                            {Number(formData.discountPercent || 0) > 0 && (
                              <Typography sx={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                                ₹{Number(formData.price).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                          <Chip label={`Stock: ${formData.quantity || 0}`} size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 800 }} />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Summary Breakdown */}
                  <Grid item xs={12} sm={6} md={7}>
                    <Card elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '16px', bgcolor: '#f8fafc' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', mb: 2 }}>
                        Catalog Publication Summary
                      </Typography>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>Store Outlet:</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{selectedShop?.shop_name || 'Active Store'}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>Category:</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{formData.category}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>Opening Stock:</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#059669', fontSize: '0.88rem' }}>{formData.quantity} Units</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>Total Stock Value:</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                            ₹{(((Number(formData.price || 0)) - ((Number(formData.price || 0)) * (Number(formData.discountPercent || 0)) / 100)) * Number(formData.quantity || 0)).toFixed(2)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Bottom Stepper Controls */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 4, pt: 2.5, borderTop: '1px solid #e2e8f0' }}>
              <Button
                disabled={addStep === 0}
                onClick={handlePrevStep}
                startIcon={<ArrowBackIcon />}
                sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
              >
                Previous Step
              </Button>

              {addStep < 3 ? (
                <Button
                  variant="contained"
                  onClick={handleNextStep}
                  sx={{
                    bgcolor: '#059669',
                    color: '#ffffff',
                    borderRadius: '10px',
                    px: 3.5,
                    py: 1,
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                    '&:hover': { bgcolor: '#047857' }
                  }}
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleAddSubmit}
                  disabled={submittingProduct}
                  startIcon={submittingProduct ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
                  sx={{
                    bgcolor: '#059669',
                    color: '#ffffff',
                    borderRadius: '10px',
                    px: 4,
                    py: 1.1,
                    fontWeight: 900,
                    textTransform: 'none',
                    boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
                    '&:hover': { bgcolor: '#047857' }
                  }}
                >
                  {submittingProduct ? 'Publishing...' : '🚀 Publish Product to Catalog'}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

      {/* DATA GRID & MOBILE CARDS */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress color="success" /></Box>
      ) : (
        <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography fontWeight={800} fontSize="1.1rem" color="#0f172a">All Products ({filteredProducts.length})</Typography>
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                }}
                sx={{ minWidth: { xs: '100%', sm: 250 }, bgcolor: '#f8fafc', borderRadius: 1 }}
              />
            </Box>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {["All", "Active", "Low Stock", "Out of Stock", "Draft"].map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() => setFilterStatus(status)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: filterStatus === status ? '#228B22' : '#f1f5f9',
                    color: filterStatus === status ? '#fff' : '#475569',
                    '&:hover': { bgcolor: filterStatus === status ? '#1a701a' : '#e2e8f0' }
                  }}
                />
              ))}
            </Stack>
          </Box>
          
          {filteredProducts.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, bgcolor: 'rgba(34, 139, 34, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3 }}>
                <ShoppingBagIcon sx={{ fontSize: 40, color: '#228B22' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a" mb={1}>No products found</Typography>
              <Typography color="text.secondary" fontWeight={500}>Try adjusting your search or filters.</Typography>
            </Box>
          ) : isMobile ? (
            <Stack spacing={1.5} p={1.5}>
              {filteredProducts.map((p) => (
                <MobileInventoryProductCard
                  key={p.id}
                  p={p}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          ) : (
            <Box sx={{ width: '100%', height: 600 }}>
              <DataGrid
                rows={filteredProducts}
                columns={[
                  {
                    field: 'image', headerName: 'Image', width: 80, sortable: false,
                    renderCell: (params) => (
                      <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: params.row.image ? `url(${params.row.image}) center/cover no-repeat` : "#f1f5f9", display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                        {!params.row.image && <ShoppingBagIcon sx={{ color: "#94a3b8", fontSize: 20 }} />}
                      </Box>
                    ),
                  },
                  {
                    field: 'title', headerName: 'Product Details', flex: 1, minWidth: 200,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Typography fontWeight={700} color="#0f172a" noWrap>{params.row.title}</Typography>
                        <Typography fontSize="0.8rem" color="text.secondary" noWrap>{params.row.description || "No description"}</Typography>
                      </Box>
                    )
                  },
                  {
                    field: 'category', headerName: 'Category', width: 150,
                    renderCell: (params) => <Chip label={params.row.category || "General"} size="small" sx={{ fontWeight: 600, bgcolor: '#e2e8f0' }} />
                  },
                  {
                    field: 'price', headerName: 'Price', width: 120,
                    renderCell: (params) => <Typography fontWeight={800} color="#228B22">₹{Number(params.row.price).toFixed(2)}</Typography>
                  },
                  {
                    field: 'stock_qty', headerName: 'Stock', width: 120,
                    renderCell: (params) => {
                      const qty = params.row.stock_qty || params.row.stockQty || 0;
                      let statusColor = "success";
                      let statusLabel = "In Stock";
                      if (qty === 0) { statusColor = "error"; statusLabel = "Out of Stock"; }
                      else if (qty <= 10) { statusColor = "warning"; statusLabel = "Low Stock"; }
                      if (!params.row.is_active) { statusColor = "default"; statusLabel = "Draft"; }
                      return (
                        <Stack direction="row" alignItems="center" spacing={1} height="100%">
                          <Typography fontWeight={700} color={qty > 10 ? "#0f172a" : "#ef4444"}>{qty}</Typography>
                          <Chip label={statusLabel} color={statusColor} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        </Stack>
                      );
                    }
                  },
                  {
                    field: 'actions', headerName: 'Actions', width: 120, sortable: false,
                    renderCell: (params) => (
                      <Stack direction="row" spacing={1} alignItems="center" height="100%">
                        <IconButton onClick={() => handleEditClick(params.row)} color="primary" size="small">
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    )
                  }
                ]}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 800 },
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' },
                }}
              />
            </Box>
          )}
        </Card>
      )}

      {/* EDIT PRODUCT DIALOG */}
      <Dialog open={!!editingProductId} onClose={() => setEditingProductId(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Edit Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title" value={editFormData.title || ""} onChange={handleEditChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="MRP (₹)" name="mrp" type="number" value={editFormData.mrp || ""} onChange={handleEditChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Discount (%)" name="discount_percent" type="number" value={editFormData.discount_percent || ""} onChange={handleEditChange} inputProps={{ min: "0", max: "100", step: "any" }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Stock Quantity" name="stock_qty" type="number" value={editFormData.stock_qty || ""} onChange={handleEditChange} />
            </Grid>
            <Grid item xs={12}>
              <input accept="image/*" style={{ display: "none" }} id={`edit-img-dialog`} type="file" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const compressed = await compressImage(file);
                  setEditFormData(prev => ({ ...prev, image: compressed }));
                }
              }} />
              <label htmlFor={`edit-img-dialog`}>
                <Button component="span" fullWidth variant="outlined" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569', py: 1.5 }}>
                  {editFormData.image ? editFormData.image.name : "Replace Image"}
                </Button>
              </label>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setEditingProductId(null)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={() => handleEditSave(editingProductId)} variant="contained" disabled={isUpdating} startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />} sx={{ bgcolor: '#228B22', fontWeight: 700 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <PrimeMembershipModal
        open={primeModalOpen}
        onClose={() => setPrimeModalOpen(false)}
        featureName="add and list new products"
      />
      </Container>
    </AppShell>
  );
}
