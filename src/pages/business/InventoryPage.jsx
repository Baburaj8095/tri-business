import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  MenuItem,
  TextareaAutosize,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  getMerchantProfile,
  listMyShops,
  createShop,
  getMerchantCategories,
  createMyShopProduct,
  listMyShopProducts,
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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AddProductForm({ tabType, onSubmit, submitting, categories = [] }) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a valid positive number";
    }
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      newErrors.quantity = "Quantity must be a valid number";
    }
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.image) newErrors.image = "Product image is mandatory";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData, () => {
        // Reset form callback
        setFormData({
          productName: "",
          category: "",
          price: "",
          quantity: "",
          description: "",
          image: null,
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Product Name"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          error={!!errors.productName}
          helperText={errors.productName}
          placeholder="Enter product name"
          variant="outlined"
        />

        <TextField
          fullWidth
          select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          error={!!errors.category}
          helperText={errors.category}
          variant="outlined"
        >
          {(categories.length > 0 ? categories : PRODUCT_CATEGORIES).map((cat) => {
            const name = typeof cat === "string" ? cat : cat.name || cat;
            return (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            );
          })}
        </TextField>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="Price (₹)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={!!errors.price}
            helperText={errors.price}
            placeholder="0.00"
            inputProps={{ step: "0.01", min: "0" }}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Stock Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            error={!!errors.quantity}
            helperText={errors.quantity}
            placeholder="0"
            inputProps={{ min: "0" }}
            variant="outlined"
          />
        </Stack>

        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Description
          </Typography>
          <TextareaAutosize
            minRows={4}
            placeholder="Enter product description"
            value={formData.description}
            onChange={(e) => {
              handleChange(e);
              e.target.name = "description";
            }}
            name="description"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: errors.description ? "2px solid #d32f2f" : "1px solid #ccc",
              fontFamily: "inherit",
              fontSize: "14px",
            }}
          />
          {errors.description && (
            <FormHelperText error>{errors.description}</FormHelperText>
          )}
        </Box>

        <Box>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="image-input"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-input" style={{ width: "100%" }}>
            <Button
              component="span"
              fullWidth
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                py: 2,
                border: errors.image ? "2px dashed #d32f2f" : "2px dashed #ccc",
                "&:hover": {
                  borderColor: "#228B22",
                  bgcolor: "rgba(34, 139, 34, 0.04)",
                },
              }}
            >
              {formData.image ? formData.image.name : "Upload Product Image *"}
            </Button>
          </label>
          {errors.image && (
            <FormHelperText error sx={{ mt: 0.5 }}>{errors.image}</FormHelperText>
          )}
          <FormHelperText sx={{ mt: 0.5 }}>
            Supported formats: JPG, PNG, WebP. Recommended: Square image (1:1 aspect ratio).
          </FormHelperText>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          fullWidth
          sx={{ py: 1.5, fontWeight: 800, bgcolor: "#228B22", "&:hover": { bgcolor: "#1B4D3E" } }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : `Add Product (${tabType})`}
        </Button>
      </Stack>
    </form>
  );
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState(null);
  const [onlineShop, setOnlineShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [onlineCategories, setOnlineCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

      const shopsList = await listMyShops().catch(() => []);
      // Search for an existing ONLINE shop
      let activeShop = shopsList.find((s) => s.serviceMode === "ONLINE" || s.service_mode === "ONLINE");

      if (!activeShop && p) {
        // Fetch categories to set a valid category reference
        const categories = await getMerchantCategories().catch(() => []);
        const catId = categories[0]?.id || 1;

        // Auto-create a default online shop under-the-hood
        await createShop({
          shop_name: "Default Online Store",
          address: p.address || "Online Store Address",
          city: p.city || "Online",
          state: "Online",
          pincode: p.pincode || "100000",
          contact_number: p.phone || p.mobileNumber || "0000000000",
          category: catId,
          home_delivery_enabled: true,
          delivery_radius_km: 25,
          min_order_value: 0,
          base_delivery_fee: 0,
        });

        // Refetch shops to obtain the created shop's ID
        const updatedShops = await listMyShops().catch(() => []);
        activeShop = updatedShops.find((s) => s.serviceMode === "ONLINE" || s.service_mode === "ONLINE");
      }

      // Fetch online categories
      try {
        const captainApiUrl =
          process.env.REACT_APP_CAPTAIN_API_URL || "https://api-captain.trikonektbusiness.com/api";
        const response = await fetch(`${captainApiUrl}/captain/shops/online/categories`);
        if (response.ok) {
          const data = await response.json();
          setOnlineCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load online categories:", err);
      }

      if (activeShop) {
        setOnlineShop(activeShop);
        await fetchInventory(activeShop.id);
      } else {
        setErrorMessage("Unable to find or auto-create your default online store.");
      }
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProductSubmit = async (formData, resetCallback) => {
    if (!onlineShop) {
      setErrorMessage("No active online store is registered to link this product.");
      return;
    }
    setSubmittingProduct(true);
    setErrorMessage("");
    try {
      const payload = {
        title: formData.productName,
        description: formData.description,
        mrp: Number(formData.price),
        price: Number(formData.price),
        discount_percent: 0,
        online_delivery: true,
        offline_delivery: false,
        stock_qty: Number(formData.quantity),
        image: formData.image,
        category: formData.category,
      };

      await createMyShopProduct(onlineShop.id, payload);
      setSuccessMessage(`Product "${formData.productName}" added successfully to your online store catalog!`);
      resetCallback();
      // Reload inventory list
      await fetchInventory(onlineShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to add product:", err);
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to add product to catalog.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const tabTypes = ["Online", "Offline", "Trizone"];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton
          onClick={() => navigate("/business-dashboard")}
          sx={{
            bgcolor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            color: "#228B22",
            "&:hover": { bgcolor: "rgba(34, 139, 34, 0.08)" }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography fontSize={24} fontWeight={900}>
            Inventory & Billing
          </Typography>
          <Typography color="text.secondary" fontSize="0.95rem">
            Manage online products, stock counts, and view catalogs
          </Typography>
        </Box>
      </Stack>

      {/* ERROR/SUCCESS MESSAGES */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "12px", fontWeight: 700 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", fontWeight: 700 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Left: Product Creation Form */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography fontWeight={800} mb={2} variant="h6">
                  Add New Product
                </Typography>

                {/* TABS */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="product type tabs"
                    sx={{
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "14px",
                      },
                      "& .MuiTab-root.Mui-selected": {
                        color: "#228B22",
                      },
                      "& .MuiTabs-indicator": {
                        bgcolor: "#228B22",
                      }
                    }}
                  >
                    <Tab label="Online" id="tab-Online" aria-controls="tabpanel-Online" />
                    <Tab label="Offline" id="tab-Offline" aria-controls="tabpanel-Offline" disabled />
                    <Tab label="TriZone (Coming Soon)" id="tab-Trizone" aria-controls="tabpanel-Trizone" disabled />
                  </Tabs>
                </Box>

                {/* TAB CONTENT */}
                <TabPanel value={tabValue} index={0}>
                  <AddProductForm
                    tabType="Online"
                    onSubmit={handleProductSubmit}
                    submitting={submittingProduct}
                    categories={onlineCategories}
                  />
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Products Catalog Listing */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography fontWeight={900} variant="h6" mb={2.5}>
                  📦 Active Product Catalog ({products.length})
                </Typography>

                {products.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary" fontWeight={600}>
                      No products in your catalog yet.
                    </Typography>
                    <Typography fontSize="0.82rem" color="text.secondary" mt={0.5}>
                      Add products on the left to register them to your default online shop.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#f8fafc" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Image</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Product Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="right">Price (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="right">Stock Qty</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell sx={{ py: 1 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "8px",
                                  background: p.image ? `url(${p.image}) center/cover no-repeat` : "#f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid #e2e8f0"
                                }}
                              >
                                {!p.image && <ShoppingBagIcon sx={{ color: "#94a3b8", fontSize: 20 }} />}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{p.title}</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 600 }}>{p.category || "General"}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: "#228B22" }}>
                              ₹{Number(p.price).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{p.stock_qty || p.stockQty || 0}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={p.is_active || p.is_active === undefined ? "Active" : "Inactive"}
                                size="small"
                                color="success"
                                sx={{ fontWeight: 800, fontSize: "0.68rem" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
