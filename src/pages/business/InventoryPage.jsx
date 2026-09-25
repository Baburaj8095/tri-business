import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Container,
  Drawer,
  Avatar,
  Menu,
  Fab,
  Divider,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import TuneIcon from "@mui/icons-material/Tune";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveIcon from "@mui/icons-material/Remove";

import PrimeMembershipModal from "../../components/business/PrimeMembershipModal";
import { isMerchantPrime } from "../../utils/membershipHelper";

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

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Beauty & Personal Care",
  "General",
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

export default function InventoryPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Drawers & Modals State
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createProductDrawerOpen, setCreateProductDrawerOpen] = useState(false);
  const [pricingDrawerOpen, setPricingDrawerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [stockDrawerOpen, setStockDrawerOpen] = useState(false);
  const [primeModalOpen, setPrimeModalOpen] = useState(false);

  // Form State
  const [editingProduct, setEditingProduct] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Active"); // 'Active' | 'Inactive'
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState(""); // Selling price
  const [formCost, setFormCost] = useState(""); // Cost per item / MRP
  const [formQuantity, setFormQuantity] = useState("10");
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  // Dropdown Anchors
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuProduct, setActionMenuProduct] = useState(null);

  // Calculated Pricing Stats
  const priceNum = parseFloat(formPrice) || 0;
  const costNum = parseFloat(formCost) || 0;
  const calculatedProfit = priceNum > costNum ? (priceNum - costNum) : 0;
  const calculatedMargin = priceNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : 0;

  // Filter products
  const filteredProducts = products.filter(p => {
    const titleMatch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;

    if (filterStatus === "Active" && p.is_active === false) return false;
    if (filterStatus === "Inactive" && p.is_active !== false) return false;
    if (filterStatus === "In Stock" && (p.stock_qty || p.stockQty || 0) <= 0) return false;
    if (filterStatus === "Low Stock") {
      const q = p.stock_qty || p.stockQty || 0;
      if (q <= 0 || q > 10) return false;
    }
    if (filterStatus === "Out of Stock" && (p.stock_qty || p.stockQty || 0) > 0) return false;

    if (filterCategory !== "All" && (p.category || "").toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }

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

      if (serviceMode === 'ONLINE') {
        let activeShop = shopsList.find((s) => String(s.serviceMode || s.service_mode || "").toUpperCase() === "ONLINE");
        if (!activeShop && shopsList.length > 0) {
          activeShop = shopsList[shopsList.length - 1];
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
        if (shopsList.length > 0) {
          setShops(shopsList);
          setSelectedShop(shopsList[0]);
          await fetchInventory(shopsList[0].id);
        } else {
          setErrorMessage("No physical shops found. Please register a shop in 'Manage Shops' first.");
        }
      }

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

  const openCreateFlow = () => {
    if (!isMerchantPrime()) {
      setPrimeModalOpen(true);
      return;
    }
    setCreateMenuOpen(true);
  };

  const handleOpenNewProductDrawer = () => {
    setCreateMenuOpen(false);
    setEditingProduct(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("Active");
    setFormCategory(categories[0] || "General");
    setFormPrice("");
    setFormCost("");
    setFormQuantity("10");
    setFormImage(null);
    setFormImagePreview(null);
    setCreateProductDrawerOpen(true);
  };

  const handleOpenEditProductDrawer = (prod) => {
    setActionMenuAnchor(null);
    setEditingProduct(prod);
    setFormTitle(prod.title || "");
    setFormDescription(prod.description || "");
    setFormStatus(prod.is_active !== false ? "Active" : "Inactive");
    setFormCategory(prod.category || "General");
    setFormPrice(String(prod.price || ""));
    setFormCost(String(prod.mrp || prod.price || ""));
    setFormQuantity(String(prod.stock_qty || prod.stockQty || "0"));
    setFormImage(null);
    const existingImg = prod.image || prod.image_url || prod.product_image;
    setFormImagePreview(existingImg ? resolveImageUrl(existingImg) : null);
    setCreateProductDrawerOpen(true);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setFormImage(compressed);
      setFormImagePreview(URL.createObjectURL(compressed));
    }
  };

  const handleSaveProduct = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a product title.");
      return;
    }
    if (!formPrice || parseFloat(formPrice) <= 0) {
      alert("Please enter a valid price in the Price section.");
      setPricingDrawerOpen(true);
      return;
    }

    if (!selectedShop?.id) {
      setErrorMessage("No active shop found. Please check your shop registration or refresh.");
      return;
    }

    setSubmittingProduct(true);
    setErrorMessage("");

    try {
      const isOnline = String(profile?.service_mode || localStorage.getItem('service_mode_business') || "").toUpperCase() === 'ONLINE';
      const sellingPrice = parseFloat(formPrice) || 0;
      const mrpVal = parseFloat(formCost) || sellingPrice;
      const discountPct = mrpVal > sellingPrice ? Math.round(((mrpVal - sellingPrice) / mrpVal) * 100) : 0;

      if (editingProduct) {
        // Update product
        const patch = {
          title: formTitle.trim(),
          description: formDescription.trim(),
          mrp: mrpVal,
          price: sellingPrice,
          discount_percent: discountPct,
          stock_qty: parseInt(formQuantity, 10) || 0,
          is_active: formStatus === "Active",
          category: formCategory || "General",
        };
        if (formImage) {
          patch.image = formImage;
        }
        await updateMyShopProduct(editingProduct.id, patch);
        setSuccessMessage("Product updated successfully!");
      } else {
        // Create new product
        const payload = {
          title: formTitle.trim(),
          description: formDescription.trim(),
          mrp: mrpVal,
          price: sellingPrice,
          discount_percent: discountPct,
          online_delivery: isOnline,
          offline_delivery: !isOnline,
          stock_qty: parseInt(formQuantity, 10) || 0,
          image: formImage,
          category: formCategory || "General",
          is_active: formStatus === "Active",
        };
        await createMyShopProduct(selectedShop.id, payload);
        setSuccessMessage("Product created successfully!");
      }

      setCreateProductDrawerOpen(false);
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Save product error:", err);
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to save product.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleToggleProductStatus = async (prod) => {
    setActionMenuAnchor(null);
    try {
      const newStatus = prod.is_active === false;
      await updateMyShopProduct(prod.id, { is_active: newStatus });
      setSuccessMessage(`Product marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage("Failed to update status.");
    }
  };

  const handleDeleteProduct = async (prodId) => {
    setActionMenuAnchor(null);
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteMyShopProduct(prodId);
      setSuccessMessage("Product deleted.");
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage("Failed to delete product.");
    }
  };

  const defaultImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";

  return (
    <AppShell activeTab="/business/inventory" title="Products & Inventory">
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 12 }}>
        
        {/* Top Header matching Dribbble 'Products' header */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            px: { xs: 2, sm: 3 },
            py: 1.75,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          }}
        >
          <Container maxWidth="md" disableGutters>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' }, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Products
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.1 }}>
                  {selectedShop?.shop_name || "Active Store"} • {products.length} Items
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.25} alignItems="center">
                {shops.length > 1 && (
                  <TextField
                    select
                    size="small"
                    value={selectedShop?.id || ""}
                    onChange={handleShopChange}
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      bgcolor: '#f1f5f9',
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { py: 0.8, fontSize: '0.78rem', fontWeight: 700 },
                    }}
                  >
                    {shops.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.shop_name || `Shop #${s.id}`}</MenuItem>
                    ))}
                  </TextField>
                )}

                <IconButton
                  sx={{
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    width: 40,
                    height: 40,
                    color: '#334155',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                  aria-label="Notifications"
                >
                  <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Avatar
                  src={profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                  alt={profile?.business_name || "Merchant"}
                  sx={{ width: 40, height: 40, border: '2px solid #e2e8f0' }}
                />
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Main Content Area */}
        <Container maxWidth="md" sx={{ mt: 2.5, px: { xs: 2, sm: 3 } }}>
          {/* Notifications / Alerts */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}>
              {errorMessage}
            </Alert>
          )}

          {/* Search Bar matching Dribbble screenshot */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              px: 1.75,
              py: 0.6,
              mb: 2,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            }}
          >
            <SearchIcon sx={{ color: '#94a3b8', fontSize: 22, mr: 1 }} />
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' },
              }}
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton size="small" sx={{ color: '#64748b' }}>
                <TuneIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#64748b' }}>
                <QrCodeScannerIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Filter Dropdown Chips */}
          <Stack direction="row" spacing={1.25} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
            {/* Status Filter Chip */}
            <Chip
              label={`Status: ${filterStatus}`}
              deleteIcon={<KeyboardArrowDownIcon />}
              onDelete={(e) => setStatusMenuAnchor(e.currentTarget)}
              onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: filterStatus !== "All" ? '#0f172a' : '#ffffff',
                color: filterStatus !== "All" ? '#ffffff' : '#334155',
                border: '1.5px solid #e2e8f0',
                fontWeight: 800,
                fontSize: '0.78rem',
                height: 36,
                px: 0.5,
                '& .MuiChip-deleteIcon': {
                  color: filterStatus !== "All" ? '#ffffff' : '#64748b',
                },
              }}
            />
            <Menu
              anchorEl={statusMenuAnchor}
              open={Boolean(statusMenuAnchor)}
              onClose={() => setStatusMenuAnchor(null)}
              PaperProps={{ sx: { borderRadius: '14px', minWidth: 160, p: 0.5 } }}
            >
              {["All", "Active", "Inactive", "In Stock", "Low Stock", "Out of Stock"].map((s) => (
                <MenuItem
                  key={s}
                  selected={filterStatus === s}
                  onClick={() => { setFilterStatus(s); setStatusMenuAnchor(null); }}
                  sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  {s}
                </MenuItem>
              ))}
            </Menu>

            {/* Category Filter Chip */}
            <Chip
              label={`Category: ${filterCategory}`}
              deleteIcon={<KeyboardArrowDownIcon />}
              onDelete={(e) => setCategoryMenuAnchor(e.currentTarget)}
              onClick={(e) => setCategoryMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: filterCategory !== "All" ? '#0f172a' : '#ffffff',
                color: filterCategory !== "All" ? '#ffffff' : '#334155',
                border: '1.5px solid #e2e8f0',
                fontWeight: 800,
                fontSize: '0.78rem',
                height: 36,
                px: 0.5,
                '& .MuiChip-deleteIcon': {
                  color: filterCategory !== "All" ? '#ffffff' : '#64748b',
                },
              }}
            />
            <Menu
              anchorEl={categoryMenuAnchor}
              open={Boolean(categoryMenuAnchor)}
              onClose={() => setCategoryMenuAnchor(null)}
              PaperProps={{ sx: { borderRadius: '14px', minWidth: 180, p: 0.5, maxHeight: 300 } }}
            >
              <MenuItem
                selected={filterCategory === "All"}
                onClick={() => { setFilterCategory("All"); setCategoryMenuAnchor(null); }}
                sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px' }}
              >
                All Categories
              </MenuItem>
              {categories.map((c) => (
                <MenuItem
                  key={c}
                  selected={filterCategory === c}
                  onClick={() => { setFilterCategory(c); setCategoryMenuAnchor(null); }}
                  sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  {c}
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          {/* Product Items List matching Dribbble screenshot */}
          {loading ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <CircularProgress size={36} sx={{ color: '#228B22' }} />
              <Typography sx={{ mt: 2, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Loading products...
              </Typography>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '24px',
                border: '1.5px dashed #cbd5e1',
                p: 6,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  bgcolor: '#f1f5f9',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <ShoppingBagIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                No Products Found
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.5, maxWidth: 320, mx: 'auto' }}>
                {searchQuery || filterStatus !== 'All' || filterCategory !== 'All'
                  ? 'Try clearing your search or filters to see all products.'
                  : 'Add your first product to display it live in your digital store.'}
              </Typography>
              <Button
                variant="contained"
                onClick={openCreateFlow}
                startIcon={<AddIcon />}
                sx={{
                  mt: 3,
                  bgcolor: '#f97316',
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 3,
                  py: 1.2,
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                  '&:hover': { bgcolor: '#ea580c' },
                }}
              >
                Create Product Now
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredProducts.map((p) => {
                const rawImg = p.image || p.image_url || p.product_image;
                const imgSrc = rawImg ? resolveImageUrl(rawImg) : defaultImg;
                const price = Number(p.price || 0);
                const stockQty = Number(p.stock_qty || p.stockQty || 0);
                const isActive = p.is_active !== false;

                return (
                  <Card
                    key={p.id}
                    elevation={0}
                    sx={{
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      p: 1.75,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.07)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Product Thumbnail */}
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={p.title}
                        onError={(e) => { e.target.src = defaultImg; }}
                        sx={{
                          width: 68,
                          height: 68,
                          borderRadius: '16px',
                          objectFit: 'cover',
                          bgcolor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          flexShrink: 0,
                        }}
                      />

                      {/* Details matching Dribbble item row */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {/* Status Dot + Label */}
                        <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.3 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isActive ? '#10b981' : '#94a3b8',
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: isActive ? '#10b981' : '#64748b',
                              textTransform: 'capitalize',
                            }}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Stack>

                        {/* Title */}
                        <Typography
                          sx={{
                            fontSize: '0.95rem',
                            fontWeight: 900,
                            color: '#0f172a',
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.title}
                        </Typography>

                        {/* Price • Category • Stock */}
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.3 }}>
                          ₹{price.toFixed(2)} • {p.category || 'General'} • {stockQty} in stock
                        </Typography>
                      </Box>

                      {/* Three-dots Action Button */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setActionMenuAnchor(e.currentTarget);
                          setActionMenuProduct(p);
                        }}
                        sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}
                      >
                        <MoreVertIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>

        {/* Product Row Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => setActionMenuAnchor(null)}
          PaperProps={{ sx: { borderRadius: '16px', minWidth: 170, p: 0.5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } }}
        >
          <MenuItem
            onClick={() => handleOpenEditProductDrawer(actionMenuProduct)}
            sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', py: 1 }}
          >
            <EditOutlinedIcon sx={{ fontSize: 17, mr: 1.25, color: '#0284c7' }} />
            Edit Product
          </MenuItem>
          <MenuItem
            onClick={() => handleToggleProductStatus(actionMenuProduct)}
            sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', py: 1 }}
          >
            <CheckCircleIcon sx={{ fontSize: 17, mr: 1.25, color: '#10b981' }} />
            {actionMenuProduct?.is_active === false ? 'Set to Active' : 'Set to Inactive'}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => handleDeleteProduct(actionMenuProduct?.id)}
            sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', borderRadius: '8px', py: 1 }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 17, mr: 1.25, color: '#ef4444' }} />
            Delete Product
          </MenuItem>
        </Menu>

        {/* Floating Action Button (FAB) triggering the Dribbble Create Bottom Drawer */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 74,
            right: { xs: 20, sm: 32 },
            zIndex: 40,
          }}
        >
          <Fab
            onClick={openCreateFlow}
            sx={{
              bgcolor: '#0f172a',
              color: '#ffffff',
              width: 58,
              height: 58,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.3)',
              '&:hover': { bgcolor: '#1e293b' },
            }}
            aria-label="Create Menu"
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Box>

        {/* ════════════════════════════════════════════════════════════════════════════════
            1. CREATE MENU BOTTOM DRAWER (Matching media_1790311807969.png)
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={createMenuOpen}
          onClose={() => setCreateMenuOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              p: 2.5,
              pb: 4,
              maxWidth: 540,
              mx: 'auto',
            },
          }}
        >
          {/* Top Grab Handle */}
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />

          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
              Create
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCreateMenuOpen(false)}
              sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* List Options */}
          <Stack spacing={1}>
            {/* Create Product Option */}
            <Box
              onClick={handleOpenNewProductDrawer}
              sx={{
                p: 2,
                borderRadius: '18px',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.15s, border-color 0.15s',
                '&:hover': { bgcolor: '#fff7ed', borderColor: '#fdba74' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    bgcolor: '#fff7ed',
                    color: '#f97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Inventory2OutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Product
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Create product now
                  </Typography>
                </Box>
              </Stack>
              <ChevronRightIcon sx={{ color: '#94a3b8' }} />
            </Box>

            {/* Create Order Option */}
            <Box
              onClick={() => {
                setCreateMenuOpen(false);
                navigate('/business/products');
              }}
              sx={{
                p: 2,
                borderRadius: '18px',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBagIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Order
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Create your wholesale order now
                  </Typography>
                </Box>
              </Stack>
              <ChevronRightIcon sx={{ color: '#94a3b8' }} />
            </Box>

            {/* Register Shop Option */}
            <Box
              onClick={() => {
                setCreateMenuOpen(false);
                navigate('/business/add-shop');
              }}
              sx={{
                p: 2,
                borderRadius: '18px',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    bgcolor: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StorefrontOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Shop Outlet
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Register a new merchant branch
                  </Typography>
                </Box>
              </Stack>
              <ChevronRightIcon sx={{ color: '#94a3b8' }} />
            </Box>

            {/* Promotion Option */}
            <Box
              onClick={() => {
                setCreateMenuOpen(false);
                alert("Promotion campaign builder is available for active Member accounts.");
              }}
              sx={{
                p: 2,
                borderRadius: '18px',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    bgcolor: '#faf5ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CampaignOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Promotion
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Create promotion banner now
                  </Typography>
                </Box>
              </Stack>
              <ChevronRightIcon sx={{ color: '#94a3b8' }} />
            </Box>
          </Stack>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            2. CREATE / EDIT PRODUCT BOTTOM DRAWER (Matching media_1790311878896.png)
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={createProductDrawerOpen}
          onClose={() => setCreateProductDrawerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              maxHeight: '94vh',
              maxWidth: 580,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {/* Top Grab Bar */}
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mt: 1.5, mb: 0.5 }} />

          {/* Header */}
          <Box sx={{ px: 3, py: 1.75, borderBottom: '1px solid #f1f5f9' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <IconButton
                size="small"
                onClick={() => setCreateProductDrawerOpen(false)}
                sx={{ color: '#0f172a', bgcolor: '#f8fafc' }}
              >
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </Typography>
              <Box sx={{ width: 34 }} />
            </Stack>
          </Box>

          {/* Scrollable Form Body */}
          <Box sx={{ px: 3, py: 2.5, overflowY: 'auto', flexGrow: 1 }}>
            {/* Section: Media */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Media
            </Typography>

            <input
              type="file"
              accept="image/*"
              id="product-drawer-img-input"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />

            {formImagePreview ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#f8fafc',
                  mb: 2.5,
                }}
              >
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    component="img"
                    src={formImagePreview}
                    alt="Preview"
                    sx={{ width: 56, height: 56, borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                      {formImage?.name || "Product Image"}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                      Ready for upload
                    </Typography>
                  </Box>
                </Stack>
                <label htmlFor="product-drawer-img-input">
                  <Button
                    component="span"
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '0.72rem' }}
                  >
                    Change
                  </Button>
                </label>
              </Box>
            ) : (
              <label htmlFor="product-drawer-img-input">
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    border: '1.5px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: '#f8fafc',
                    mb: 2.5,
                    '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                  }}
                >
                  <Stack direction="row" spacing={1.75} alignItems="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ImageOutlinedIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        Add Media
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        Add media for this product
                      </Typography>
                    </Box>
                  </Stack>
                  <ChevronRightIcon sx={{ color: '#94a3b8' }} />
                </Box>
              </label>
            )}

            {/* Section: Product Title */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Product Title
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter product title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  '& fieldset': { borderColor: '#e2e8f0' },
                },
              }}
            />

            {/* Section: Status Segmented Radio Pills (Matching media_1790311878896.png) */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Status
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={6}>
                <Box
                  onClick={() => setFormStatus("Active")}
                  sx={{
                    py: 1.25,
                    px: 2,
                    borderRadius: '14px',
                    border: formStatus === "Active" ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                    bgcolor: formStatus === "Active" ? '#ffffff' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: formStatus === "Active" ? '5px solid #0f172a' : '2px solid #cbd5e1',
                      bgcolor: '#ffffff',
                    }}
                  />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: formStatus === "Active" ? 900 : 700, color: '#0f172a' }}>
                    Active
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box
                  onClick={() => setFormStatus("Inactive")}
                  sx={{
                    py: 1.25,
                    px: 2,
                    borderRadius: '14px',
                    border: formStatus === "Inactive" ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                    bgcolor: formStatus === "Inactive" ? '#ffffff' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: formStatus === "Inactive" ? '5px solid #0f172a' : '2px solid #cbd5e1',
                      bgcolor: '#ffffff',
                    }}
                  />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: formStatus === "Inactive" ? 900 : 700, color: '#0f172a' }}>
                    Inactive
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Section: Descriptions */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Descriptions
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Product description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#f8fafc',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  '& fieldset': { borderColor: '#e2e8f0' },
                },
              }}
            />

            {/* Section Cards: Category, Price, Inventory */}
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {/* Category Card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#ffffff',
                }}
              >
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CategoryOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      Category
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: formCategory ? '#10b981' : '#64748b', fontWeight: 700 }}>
                      {formCategory || "Add Category"}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  onClick={() => setCategoryPickerOpen(true)}
                  sx={{
                    color: '#0f172a',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    bgcolor: '#f1f5f9',
                    borderRadius: '10px',
                    px: 1.5,
                  }}
                >
                  {formCategory ? "Edit" : "+ Add"}
                </Button>
              </Box>

              {/* Price Card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#ffffff',
                }}
              >
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocalOfferOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      Price
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: formPrice ? '#10b981' : '#64748b', fontWeight: 700 }}>
                      {formPrice ? `Selling ₹${formPrice} • Cost ₹${formCost || formPrice}` : "Add Price"}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  onClick={() => setPricingDrawerOpen(true)}
                  sx={{
                    color: '#0f172a',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    bgcolor: '#f1f5f9',
                    borderRadius: '10px',
                    px: 1.5,
                  }}
                >
                  {formPrice ? "Edit" : "+ Add"}
                </Button>
              </Box>

              {/* Inventory Card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#ffffff',
                }}
              >
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      Inventory
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: formQuantity ? '#0284c7' : '#64748b', fontWeight: 700 }}>
                      {formQuantity ? `${formQuantity} in stock` : "Add Inventory"}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  onClick={() => setStockDrawerOpen(true)}
                  sx={{
                    color: '#0f172a',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    bgcolor: '#f1f5f9',
                    borderRadius: '10px',
                    px: 1.5,
                  }}
                >
                  {formQuantity ? "Edit" : "+ Add"}
                </Button>
              </Box>
            </Stack>
          </Box>

          {/* Sticky Bottom Actions Bar matching Dribbble screenshot */}
          <Box
            sx={{
              p: 2.25,
              borderTop: '1px solid #f1f5f9',
              bgcolor: '#ffffff',
            }}
          >
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCreateProductDrawerOpen(false)}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSaveProduct}
                disabled={submittingProduct}
                startIcon={submittingProduct && <CircularProgress size={16} color="inherit" />}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  bgcolor: '#f97316',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                  '&:hover': { bgcolor: '#ea580c' },
                }}
              >
                {submittingProduct
                  ? (editingProduct ? 'Saving...' : 'Adding Product...')
                  : (editingProduct ? 'Save Changes' : 'Add Product')}
              </Button>
            </Stack>
          </Box>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            3. PRICING SUB-DRAWER (Matching media_1790311772460.png)
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={pricingDrawerOpen}
          onClose={() => setPricingDrawerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              p: 2.5,
              pb: 3,
              maxWidth: 540,
              mx: 'auto',
            },
          }}
        >
          {/* Top Grab Bar */}
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />

          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Pricing
            </Typography>
            <IconButton
              size="small"
              onClick={() => setPricingDrawerOpen(false)}
              sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Form Fields */}
          <Stack spacing={2.5}>
            {/* Price (Selling Price) */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                Price (Selling Price)
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ fontWeight: 800, color: '#0f172a' }}>₹</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: '#f8fafc',
                    fontSize: '1rem',
                    fontWeight: 800,
                  },
                }}
              />
            </Box>

            {/* Cost per item */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                Cost per item
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ fontWeight: 800, color: '#0f172a' }}>₹</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: '#f8fafc',
                    fontSize: '1rem',
                    fontWeight: 800,
                  },
                }}
              />
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, mt: 0.5 }}>
                Customers won't see this
              </Typography>
            </Box>

            {/* Calculated Chips: Margin & Profit */}
            <Stack direction="row" spacing={1.5} sx={{ py: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  Margin
                </Typography>
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d', mt: 0.2 }}>
                  {calculatedMargin}%
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Profit
                </Typography>
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', mt: 0.2 }}>
                  ₹{calculatedProfit.toFixed(2)}
                </Typography>
              </Box>
            </Stack>

            {/* Footer Buttons */}
            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setPricingDrawerOpen(false)}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setPricingDrawerOpen(false)}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            4. INVENTORY STOCK SUB-DRAWER
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={stockDrawerOpen}
          onClose={() => setStockDrawerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              p: 2.5,
              pb: 3,
              maxWidth: 540,
              mx: 'auto',
            },
          }}
        >
          {/* Top Grab Bar */}
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />

          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Inventory Stock
            </Typography>
            <IconButton
              size="small"
              onClick={() => setStockDrawerOpen(false)}
              sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Stepper Input */}
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Available Quantity
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconButton
                  onClick={() => setFormQuantity(String(Math.max(0, (parseInt(formQuantity, 10) || 0) - 1)))}
                  sx={{ bgcolor: '#f1f5f9', width: 48, height: 48, borderRadius: '14px' }}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  fullWidth
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                    },
                    '& input': { textAlign: 'center' },
                  }}
                />
                <IconButton
                  onClick={() => setFormQuantity(String((parseInt(formQuantity, 10) || 0) + 1))}
                  sx={{ bgcolor: '#f1f5f9', width: 48, height: 48, borderRadius: '14px' }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Quick Presets */}
            <Stack direction="row" spacing={1}>
              {["+10", "+50", "+100"].map((preset) => (
                <Chip
                  key={preset}
                  label={preset}
                  onClick={() => {
                    const add = parseInt(preset, 10);
                    setFormQuantity(String((parseInt(formQuantity, 10) || 0) + add));
                  }}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    bgcolor: '#f1f5f9',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#e2e8f0' },
                  }}
                />
              ))}
            </Stack>

            {/* Footer Buttons */}
            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setStockDrawerOpen(false)}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setStockDrawerOpen(false)}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            5. CATEGORY PICKER SUB-DRAWER
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={categoryPickerOpen}
          onClose={() => setCategoryPickerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              p: 2.5,
              pb: 3,
              maxHeight: '75vh',
              maxWidth: 540,
              mx: 'auto',
            },
          }}
        >
          {/* Top Grab Bar */}
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />

          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Select Category
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCategoryPickerOpen(false)}
              sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Categories Grid */}
          <Box sx={{ overflowY: 'auto', maxHeight: '50vh', py: 1 }}>
            <Grid container spacing={1.25}>
              {categories.map((cat) => {
                const isSelected = formCategory === cat;
                return (
                  <Grid item xs={6} key={cat}>
                    <Box
                      onClick={() => {
                        setFormCategory(cat);
                        setCategoryPickerOpen(false);
                      }}
                      sx={{
                        p: 1.75,
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                        bgcolor: isSelected ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'border-color 0.15s, background-color 0.15s',
                        '&:hover': { borderColor: '#94a3b8' },
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: isSelected ? 900 : 700, color: '#0f172a' }}>
                        {cat}
                      </Typography>
                      {isSelected && <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Drawer>

        {/* Prime Membership Modal */}
        <PrimeMembershipModal
          open={primeModalOpen}
          onClose={() => setPrimeModalOpen(false)}
          featureName="create and manage catalog products"
        />
      </Box>
    </AppShell>
  );
}
