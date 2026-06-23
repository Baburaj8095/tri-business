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
  TextareaAutosize,
  FormHelperText,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
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
    productName: "", category: "", price: "", quantity: "", description: "", image: null,
  });
  const [formErrors, setFormErrors] = useState({});

  // Edit Form State
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

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
      const serviceMode = p?.service_mode || localStorage.getItem('service_mode_business') || 'OFFLINE';

      let shopsList = await listMyShops().catch(() => []);
      
      // Filter shops based on service mode if needed, or if ONLINE auto-create one.
      if (serviceMode === 'ONLINE') {
        let activeShop = shopsList.find((s) => s.serviceMode === "ONLINE" || s.service_mode === "ONLINE");
        if (!activeShop) {
          const cats = await getMerchantCategories().catch(() => []);
          const catId = cats[0]?.id || 1;
          await createShop({
            shop_name: "Default Online Store",
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
          activeShop = shopsList.find((s) => s.serviceMode === "ONLINE" || s.service_mode === "ONLINE");
        }
        setShops([activeShop]);
        setSelectedShop(activeShop);
        if (activeShop) await fetchInventory(activeShop.id);
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
    try {
      const isOnline = profile?.service_mode === 'ONLINE';
      const payload = {
        title: formData.productName,
        description: formData.description,
        mrp: Number(formData.price),
        price: Number(formData.price),
        discount_percent: 0,
        online_delivery: isOnline,
        offline_delivery: !isOnline,
        stock_qty: Number(formData.quantity),
        image: formData.image,
        category: formData.category,
      };

      await createMyShopProduct(selectedShop.id, payload);
      setSuccessMessage(`Product added successfully!`);
      setFormData({ productName: "", category: "", price: "", quantity: "", description: "", image: null });
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
      const patch = {
        title: editFormData.title,
        price: Number(editFormData.price),
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

  const serviceModeDisplay = profile?.service_mode === 'ONLINE' ? 'Online' : (profile?.service_mode === 'TRIZONE' ? 'TriZone' : 'Offline / Nearby');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" mb={4} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate("/business-dashboard")} sx={{ bgcolor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={900} color="#0f172a">
              {serviceModeDisplay} Inventory
            </Typography>
            <Typography color="text.secondary" fontSize="0.9rem" fontWeight={500}>
              Manage products, pricing, and stock for your {serviceModeDisplay.toLowerCase()} channel.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          {shops.length > 1 && (
            <TextField
              select
              size="small"
              value={selectedShop?.id || ""}
              onChange={handleShopChange}
              sx={{ minWidth: 200, bgcolor: '#fff', borderRadius: 1 }}
            >
              {shops.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.shop_name || `Shop #${s.id}`}</MenuItem>
              ))}
            </TextField>
          )}
          <Button
            variant="contained"
            startIcon={isAddFormOpen ? <CloseIcon /> : <AddIcon />}
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            sx={{ bgcolor: "#228B22", fontWeight: 700, textTransform: "none", borderRadius: '8px', px: 3 }}
          >
            {isAddFormOpen ? "Cancel" : "Add Product"}
          </Button>
        </Stack>
      </Stack>

      {/* ALERTS */}
      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>{errorMessage}</Alert>}

      {/* ADD PRODUCT COLLAPSE */}
      <Collapse in={isAddFormOpen}>
        <Card sx={{ mb: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={3}>Add New Product</Typography>
            <form onSubmit={handleAddSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Product Name" name="productName" value={formData.productName} onChange={handleAddChange} error={!!formErrors.productName} helperText={formErrors.productName} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth select label="Category" name="category" value={formData.category} onChange={handleAddChange} error={!!formErrors.category} helperText={formErrors.category}>
                    {categories.map((cat) => {
                      const name = typeof cat === "string" ? cat : cat.name || cat;
                      return <MenuItem key={name} value={name}>{name}</MenuItem>;
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleAddChange} error={!!formErrors.price} helperText={formErrors.price} inputProps={{ min: "0" }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Stock Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleAddChange} error={!!formErrors.quantity} helperText={formErrors.quantity} inputProps={{ min: "0" }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Description" name="description" multiline rows={3} value={formData.description} onChange={handleAddChange} error={!!formErrors.description} helperText={formErrors.description} />
                </Grid>
                <Grid item xs={12}>
                  <input accept="image/*" style={{ display: "none" }} id="add-image-input" type="file" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData(prev => ({ ...prev, image: file }));
                  }} />
                  <label htmlFor="add-image-input">
                    <Button component="span" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ py: 1.5, border: '2px dashed #cbd5e1', color: '#475569', fontWeight: 600, width: { xs: '100%', md: 'auto' } }}>
                      {formData.image ? formData.image.name : "Upload Image *"}
                    </Button>
                  </label>
                  {formErrors.image && <FormHelperText error sx={{ mt: 1 }}>{formErrors.image}</FormHelperText>}
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" disabled={submittingProduct} sx={{ bgcolor: "#228B22", py: 1.5, px: 4, fontWeight: 700 }}>
                    {submittingProduct ? <CircularProgress size={24} color="inherit" /> : "Save Product"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Collapse>

      {/* DATA GRID */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress color="success" /></Box>
      ) : (
        <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={800} fontSize="1.1rem" color="#0f172a">All Products ({products.length})</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Product Details</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="right">Price</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="right">Stock</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <ShoppingBagIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography fontWeight={600} color="text.secondary">No products found in this catalog.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <React.Fragment key={p.id}>
                      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: editingProductId === p.id ? '#f8fafc' : 'inherit' }}>
                        <TableCell>
                          <Box sx={{ width: 48, height: 48, borderRadius: '8px', background: p.image ? `url(${p.image}) center/cover no-repeat` : "#f1f5f9", display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                            {!p.image && <ShoppingBagIcon sx={{ color: "#94a3b8" }} />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700} color="#0f172a">{p.title}</Typography>
                          <Typography fontSize="0.8rem" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>{p.description || "No description"}</Typography>
                        </TableCell>
                        <TableCell><Chip label={p.category || "General"} size="small" sx={{ fontWeight: 600, bgcolor: '#e2e8f0' }} /></TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800} color="#228B22">₹{Number(p.price).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} color={p.stock_qty > 10 ? "#0f172a" : "#ef4444"}>{p.stock_qty || p.stockQty || 0}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton onClick={() => handleEditClick(p)} color={editingProductId === p.id ? "primary" : "default"} size="small">
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(p.id)} color="error" size="small">
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      
                      {/* INLINE EDIT ROW */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 0 }} colSpan={6}>
                          <Collapse in={editingProductId === p.id} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 2, p: 3, bgcolor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                              <Typography variant="subtitle2" fontWeight={800} mb={2}>Edit Product (ID: {p.id})</Typography>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                  <TextField fullWidth size="small" label="Title" name="title" value={editFormData.title} onChange={handleEditChange} />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                  <TextField fullWidth size="small" label="Price (₹)" name="price" type="number" value={editFormData.price} onChange={handleEditChange} />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                  <TextField fullWidth size="small" label="Stock" name="stock_qty" type="number" value={editFormData.stock_qty} onChange={handleEditChange} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <input accept="image/*" style={{ display: "none" }} id={`edit-img-${p.id}`} type="file" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setEditFormData(prev => ({ ...prev, image: file }));
                                  }} />
                                  <label htmlFor={`edit-img-${p.id}`}>
                                    <Button component="span" fullWidth variant="outlined" startIcon={<CloudUploadIcon />} size="small" sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}>
                                      {editFormData.image ? editFormData.image.name : "Replace Image"}
                                    </Button>
                                  </label>
                                </Grid>
                                <Grid item xs={12}>
                                  <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
                                    <Button size="small" variant="text" onClick={() => setEditingProductId(null)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
                                    <Button size="small" variant="contained" onClick={() => handleEditSave(p.id)} disabled={isUpdating} startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />} sx={{ bgcolor: '#228B22', fontWeight: 700 }}>
                                      Save Changes
                                    </Button>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
