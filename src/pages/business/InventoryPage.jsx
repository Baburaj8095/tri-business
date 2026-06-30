import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button, Stack, MenuItem,
  TextareaAutosize, FormHelperText, CircularProgress, Alert, Paper, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Collapse,
  Grid, InputLabel, CardMedia, InputAdornment, useMediaQuery, useTheme
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

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
  
  // Add Form State
  const [formData, setFormData] = useState({
    productName: "", category: "", price: "", discountPercent: "0", quantity: "", description: "", image: null,
  });
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

  // ----- Add Product Logic -----
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = "Required";
    if (!formData.category) newErrors.category = "Required";
    if (!formData.price) newErrors.price = "Required";
    if (!formData.quantity) newErrors.quantity = "Required";
    if (!formData.description.trim()) newErrors.description = "Required";
    if (!formData.image) newErrors.image = "Image required";
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
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 6, maxWidth: '430px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
      {/* HEADER */}
      <Box sx={{ bgcolor: '#1B4D3E', background: 'linear-gradient(135deg, #1B4D3E 0%, #143d31 100%)', color: '#ffffff', py: 2, px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton 
              onClick={() => navigate("/business-dashboard")} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.12)', 
                border: '1px solid rgba(255,255,255,0.25)', 
                color: '#ffffff', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                width: 38,
                height: 38
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#ffffff', lineHeight: 1.2 }}>
                {serviceModeDisplay} Inventory
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 500 }}>
                Manage products, pricing, and stock
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* CONTROLS */}
      <Box sx={{ px: 2, mt: 3, mb: 3 }}>
        <Stack spacing={1.5}>
          {shops.length > 1 && (
            <TextField
              select
              size="small"
              fullWidth
              value={selectedShop?.id || ""}
              onChange={handleShopChange}
              sx={{ bgcolor: '#fff', borderRadius: 1.5 }}
            >
              {shops.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.shop_name || `Shop #${s.id}`}</MenuItem>
              ))}
            </TextField>
          )}
          <Button
            fullWidth
            variant={isAddFormOpen ? "outlined" : "contained"}
            startIcon={isAddFormOpen ? <CloseIcon /> : <AddIcon />}
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            color={isAddFormOpen ? "error" : "success"}
            sx={{ 
              fontWeight: 850, 
              textTransform: "none", 
              borderRadius: '12px', 
              py: 1.2,
              bgcolor: isAddFormOpen ? "transparent" : "#1B4D3E",
              borderColor: isAddFormOpen ? "#ef4444" : "transparent",
              color: isAddFormOpen ? "#ef4444" : "#fff",
              "&:hover": {
                bgcolor: isAddFormOpen ? "rgba(239,68,68,0.05)" : "#143d31"
              }
            }}
          >
            {isAddFormOpen ? "Cancel" : "Add Product"}
          </Button>
        </Stack>
      </Box>

      {/* ALERTS */}
      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>{errorMessage}</Alert>}

      {/* ADD PRODUCT COLLAPSE */}
      <Collapse in={isAddFormOpen}>
        <Card sx={{ mb: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <Box sx={{ bgcolor: 'rgba(34, 139, 34, 0.1)', p: 1.5, borderRadius: '12px' }}>
                <ShoppingBagIcon sx={{ color: '#228B22' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">Add New Product</Typography>
            </Stack>

            <form onSubmit={handleAddSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#475569' } }} label="Product Name" name="productName" value={formData.productName} onChange={handleAddChange} error={!!formErrors.productName} helperText={formErrors.productName} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" select InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#475569' } }} label="Category" name="category" value={formData.category} onChange={handleAddChange} error={!!formErrors.category} helperText={formErrors.category}>
                    {categories.map((cat) => {
                      const name = typeof cat === "string" ? cat : cat.name || cat;
                      return <MenuItem key={name} value={name}>{name}</MenuItem>;
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#475569' } }} label="MRP (₹)" name="price" type="number" value={formData.price} onChange={handleAddChange} error={!!formErrors.price} helperText={formErrors.price} inputProps={{ min: "0" }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#475569' } }} label="Discount (%)" name="discountPercent" type="number" value={formData.discountPercent} onChange={handleAddChange} error={!!formErrors.discountPercent} helperText={formErrors.discountPercent} inputProps={{ min: "0", max: "100" }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#475569' } }} label="Stock Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleAddChange} error={!!formErrors.quantity} helperText={formErrors.quantity} inputProps={{ min: "0" }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#475569' } }} label="Description" name="description" multiline rows={4} value={formData.description} onChange={handleAddChange} error={!!formErrors.description} helperText={formErrors.description} />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    border: '2px dashed #94a3b8', 
                    borderRadius: '8px', 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    bgcolor: '#f8fafc'
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ bgcolor: 'rgba(34, 139, 34, 0.1)', p: 1.5, borderRadius: '8px' }}>
                        <CloudUploadIcon sx={{ color: '#228B22' }} />
                      </Box>
                      <Box>
                        <Typography fontWeight={700} fontSize="0.95rem" color="#0f172a">
                          {formData.image ? formData.image.name.toUpperCase() : "CLICK TO UPLOAD IMAGE"}
                        </Typography>
                        {!formData.image && <Typography fontSize="0.8rem" color="text.secondary">Click to change or drag and drop</Typography>}
                      </Box>
                    </Stack>
                    
                    {formData.image ? (
                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => setFormData(prev => ({ ...prev, image: null }))}>
                        Remove
                      </Button>
                    ) : (
                      <Box>
                        <input accept="image/*" style={{ display: "none" }} id="add-image-input" type="file" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const compressed = await compressImage(file);
                            setFormData(prev => ({ ...prev, image: compressed }));
                          }
                        }} />
                        <label htmlFor="add-image-input">
                          <Button component="span" size="small" variant="outlined" sx={{ color: '#475569', borderColor: '#cbd5e1', fontWeight: 600, textTransform: 'none' }}>
                            Browse
                          </Button>
                        </label>
                      </Box>
                    )}
                  </Box>
                  {formErrors.image && <FormHelperText error sx={{ mt: 1 }}>{formErrors.image}</FormHelperText>}
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth disabled={submittingProduct} startIcon={!submittingProduct && <CheckIcon />} sx={{ bgcolor: "#228B22", py: 1.5, fontWeight: 800, borderRadius: '8px', fontSize: '1rem', '&:hover': { bgcolor: '#1a701a' } }}>
                    {submittingProduct ? <CircularProgress size={24} color="inherit" /> : "Save Product"}
                  </Button>
                </Grid>
              </Grid>
            </form>
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
            <Stack spacing={2} p={2}>
              {filteredProducts.map((p) => {
                const qty = p.stock_qty || p.stockQty || 0;
                let statusColor = "success";
                let statusLabel = "In Stock";
                if (qty === 0) { statusColor = "error"; statusLabel = "Out of Stock"; }
                else if (qty <= 10) { statusColor = "warning"; statusLabel = "Low Stock"; }
                if (!p.is_active) { statusColor = "default"; statusLabel = "Draft"; }

                return (
                  <Card key={p.id} variant="outlined" sx={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Stack direction="row" spacing={2} p={2}>
                      <Box sx={{ width: 80, height: 80, borderRadius: '8px', flexShrink: 0, background: p.image ? `url(${p.image}) center/cover no-repeat` : "#f1f5f9", display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                        {!p.image && <ShoppingBagIcon sx={{ color: "#94a3b8" }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} color="#0f172a" noWrap>{p.title}</Typography>
                        <Typography fontSize="0.8rem" color="text.secondary" noWrap mb={1}>{p.category || "General"}</Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography fontWeight={800} color="#228B22">₹{Number(p.price).toFixed(2)}</Typography>
                          <Chip label={statusLabel} color={statusColor} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                        </Stack>
                      </Box>
                    </Stack>
                    <Box sx={{ borderTop: '1px solid #e2e8f0', p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => handleEditClick(p)} sx={{ textTransform: 'none', fontWeight: 600 }}>Edit</Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => handleDelete(p.id)} sx={{ textTransform: 'none', fontWeight: 600 }}>Delete</Button>
                    </Box>
                  </Card>
                );
              })}
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
              <TextField fullWidth label="Discount (%)" name="discount_percent" type="number" value={editFormData.discount_percent || ""} onChange={handleEditChange} />
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
    </Box>
  );
}
