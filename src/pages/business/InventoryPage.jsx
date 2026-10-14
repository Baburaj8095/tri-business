import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Card,
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
  Switch,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";

// Icons
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveIcon from "@mui/icons-material/Remove";
import HistoryIcon from "@mui/icons-material/History";
import SwapVertIcon from "@mui/icons-material/SwapVert";

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
  adjustProductStock,
  getProductStockMovements,
  findProductByBarcode,
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

  // Main State
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

  // Barcode Scanner Modal State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [scannerError, setScannerError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stock Adjustment Drawer State
  const [adjustDrawerOpen, setAdjustDrawerOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjustType, setAdjustType] = useState("ADD"); // 'ADD' | 'REDUCE' | 'CORRECTION'
  const [adjustQty, setAdjustQty] = useState("5");
  const [adjustReason, setAdjustReason] = useState("Received supplier shipment");
  const [adjustRef, setAdjustRef] = useState("");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [movementsTabOpen, setMovementsTabOpen] = useState(false);
  const [movementsList, setMovementsList] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Active"); // 'Active' | 'Inactive'
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState(""); // Selling price
  const [formCost, setFormCost] = useState(""); // Cost per item / MRP
  const [formQuantity, setFormQuantity] = useState("10");
  const [formSku, setFormSku] = useState("");
  const [formBarcode, setFormBarcode] = useState("");
  const [formLowStockThreshold, setFormLowStockThreshold] = useState("5");
  const [formWholesalePrice, setFormWholesalePrice] = useState("");
  const [formMoq, setFormMoq] = useState("1");
  const [formOnlineDelivery, setFormOnlineDelivery] = useState(true);
  const [formOfflineDelivery, setFormOfflineDelivery] = useState(true);
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterChannel, setFilterChannel] = useState("All"); // 'All' | 'Online' | 'Offline'

  // Dropdown Anchors
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [channelMenuAnchor, setChannelMenuAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuProduct, setActionMenuProduct] = useState(null);

  // Calculated Pricing Stats
  const priceNum = parseFloat(formPrice) || 0;
  const costNum = parseFloat(formCost) || 0;
  const calculatedProfit = priceNum > costNum ? (priceNum - costNum) : 0;
  const calculatedMargin = priceNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : 0;

  // Authoritative Stock Metrics Counts
  const totalCount = products.length;
  const activeCount = products.filter(p => p.is_active !== false).length;
  const inStockCount = products.filter(p => {
    const q = p.stock_qty ?? p.stockQty ?? 0;
    const t = p.low_stock_threshold ?? p.lowStockThreshold ?? 5;
    return q > t;
  }).length;
  const lowStockCount = products.filter(p => {
    const q = p.stock_qty ?? p.stockQty ?? 0;
    const t = p.low_stock_threshold ?? p.lowStockThreshold ?? 5;
    return q > 0 && q <= t;
  }).length;
  const outOfStockCount = products.filter(p => (p.stock_qty ?? p.stockQty ?? 0) <= 0).length;

  // Filter products by search, status, category, and sales channel
  const filteredProducts = products.filter(p => {
    const pCategory = typeof p.category === 'string' ? p.category : (p.category?.name || "");
    const qLower = searchQuery.toLowerCase().trim();
    const titleMatch = (p.title || "").toLowerCase().includes(qLower) ||
                       pCategory.toLowerCase().includes(qLower) ||
                       (p.sku || "").toLowerCase().includes(qLower) ||
                       (p.barcode || "").toLowerCase().includes(qLower);
    if (!titleMatch) return false;

    const stock = Number(p.stock_qty ?? p.stockQty ?? 0);
    const threshold = Number(p.low_stock_threshold ?? p.lowStockThreshold ?? 5);

    if (filterStatus === "Active" && p.is_active === false) return false;
    if (filterStatus === "Inactive" && p.is_active !== false) return false;
    if (filterStatus === "In Stock" && stock <= threshold) return false;
    if (filterStatus === "Low Stock" && (stock <= 0 || stock > threshold)) return false;
    if (filterStatus === "Out of Stock" && stock > 0) return false;

    if (filterCategory !== "All" && pCategory.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }

    if (filterChannel === "Online" && !(p.online_delivery ?? p.onlineDelivery ?? true)) return false;
    if (filterChannel === "Offline" && !(p.offline_delivery ?? p.offlineDelivery ?? true)) return false;

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
          if (Array.isArray(data) && data.length > 0) {
            const parsedCategories = data.map((item) =>
              typeof item === "string" ? item : (item?.name || item?.title || item?.category || "")
            ).filter(Boolean);
            if (parsedCategories.length > 0) {
              setCategories(parsedCategories);
            }
          }
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
    // Primary store product ingestion is unlocked; Prime gates multi-branch enterprise scale
    if (products.length > 50 && !isMerchantPrime()) {
      setPrimeModalOpen(true);
      return;
    }
    setCreateMenuOpen(true);
  };

  const handleOpenNewProductDrawer = (prefillBarcode = "") => {
    setCreateMenuOpen(false);
    setEditingProduct(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("Active");
    const defaultCat = categories.length > 0
      ? (typeof categories[0] === 'string' ? categories[0] : (categories[0]?.name || "General"))
      : "General";
    setFormCategory(defaultCat);
    setFormPrice("");
    setFormCost("");
    setFormQuantity("10");
    setFormSku(prefillBarcode ? `SKU-${prefillBarcode}` : "");
    setFormBarcode(prefillBarcode || "");
    setFormLowStockThreshold("5");
    setFormWholesalePrice("");
    setFormMoq("1");
    setFormOnlineDelivery(true);
    setFormOfflineDelivery(true);
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
    const prodCategory = typeof prod.category === 'string'
      ? prod.category
      : (prod.category?.name || "General");
    setFormCategory(prodCategory);
    setFormPrice(String(prod.price || ""));
    setFormCost(String(prod.mrp || prod.price || ""));
    setFormQuantity(String(prod.stock_qty ?? prod.stockQty ?? "0"));
    setFormSku(prod.sku || "");
    setFormBarcode(prod.barcode || "");
    setFormLowStockThreshold(String(prod.low_stock_threshold ?? prod.lowStockThreshold ?? "5"));
    setFormWholesalePrice(prod.wholesale_price || prod.wholesalePrice ? String(prod.wholesale_price || prod.wholesalePrice) : "");
    setFormMoq(String(prod.moq || "1"));
    setFormOnlineDelivery(prod.online_delivery !== false && prod.onlineDelivery !== false);
    setFormOfflineDelivery(prod.offline_delivery !== false && prod.offlineDelivery !== false);
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
    if (parseFloat(formCost) > 0 && parseFloat(formPrice) > parseFloat(formCost)) {
      alert("Selling price cannot exceed MRP / Cost.");
      return;
    }

    if (!selectedShop?.id) {
      setErrorMessage("No active shop found. Please check your shop registration or refresh.");
      return;
    }

    setSubmittingProduct(true);
    setErrorMessage("");

    try {
      const sellingPrice = parseFloat(formPrice) || 0;
      const mrpVal = parseFloat(formCost) || sellingPrice;
      const discountPct = mrpVal > sellingPrice ? Math.round(((mrpVal - sellingPrice) / mrpVal) * 100) : 0;

      if (editingProduct) {
        // Update product details (separates details update from stock adjustment)
        const patch = {
          title: formTitle.trim(),
          description: formDescription.trim(),
          mrp: mrpVal,
          price: sellingPrice,
          discount_percent: discountPct,
          is_active: formStatus === "Active",
          category: formCategory || "General",
          sku: formSku.trim() || "",
          barcode: formBarcode.trim() || "",
          low_stock_threshold: parseInt(formLowStockThreshold, 10) || 5,
          wholesale_price: formWholesalePrice ? parseFloat(formWholesalePrice) : null,
          moq: parseInt(formMoq, 10) || 1,
          online_delivery: formOnlineDelivery,
          offline_delivery: formOfflineDelivery,
        };
        if (formImage) {
          patch.image = formImage;
        }
        await updateMyShopProduct(editingProduct.id, patch);
        setSuccessMessage("Product details updated successfully!");
      } else {
        // Create new product with initial inventory
        const payload = {
          title: formTitle.trim(),
          description: formDescription.trim(),
          mrp: mrpVal,
          price: sellingPrice,
          discount_percent: discountPct,
          online_delivery: formOnlineDelivery,
          offline_delivery: formOfflineDelivery,
          stock_qty: parseInt(formQuantity, 10) || 0,
          image: formImage,
          category: formCategory || "General",
          is_active: formStatus === "Active",
          sku: formSku.trim() || "",
          barcode: formBarcode.trim() || "",
          low_stock_threshold: parseInt(formLowStockThreshold, 10) || 5,
          wholesale_price: formWholesalePrice ? parseFloat(formWholesalePrice) : undefined,
          moq: parseInt(formMoq, 10) || 1,
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

  // ─── Stock Adjustment Flow ────────────────────────────────────────────────
  const openStockAdjustment = (prod) => {
    setActionMenuAnchor(null);
    setAdjustProduct(prod);
    setAdjustType("ADD");
    setAdjustQty("5");
    setAdjustReason("Received supplier delivery");
    setAdjustRef("");
    setMovementsTabOpen(false);
    setMovementsList([]);
    setAdjustDrawerOpen(true);
  };

  const handleSaveStockAdjustment = async () => {
    if (!adjustProduct?.id) return;
    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }
    const current = Number(adjustProduct.stock_qty ?? adjustProduct.stockQty ?? 0);
    if (adjustType === "REDUCE" && qty > current) {
      alert(`Cannot reduce by ${qty}. Current stock is only ${current}.`);
      return;
    }

    setAdjustSubmitting(true);
    try {
      await adjustProductStock(adjustProduct.id, {
        movement_type: adjustType,
        quantity: qty,
        reason: adjustReason.trim(),
        reference_id: adjustRef.trim() || undefined,
      });
      setSuccessMessage(`Stock updated for "${adjustProduct.title}".`);
      setAdjustDrawerOpen(false);
      await fetchInventory(selectedShop.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to adjust stock.");
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const loadMovementsAudit = async () => {
    if (!adjustProduct?.id) return;
    setMovementsLoading(true);
    try {
      const data = await getProductStockMovements(adjustProduct.id, 20);
      setMovementsList(Array.isArray(data) ? data : []);
      setMovementsTabOpen(true);
    } catch (err) {
      console.error("Failed to load movements:", err);
    } finally {
      setMovementsLoading(false);
    }
  };

  // ─── Barcode Camera Scanner Management ────────────────────────────────────
  useEffect(() => {
    if (!scannerOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let active = true;
    setScannerError("");

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Use modern BarcodeDetector if supported
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] });
          const scanInterval = setInterval(async () => {
            if (!active || !videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                clearInterval(scanInterval);
                handleBarcodeDetected(barcodes[0].rawValue);
              }
            } catch (_) {}
          }, 400);
        }
      })
      .catch(() => {
        setScannerError("Camera permission denied or camera unavailable. Please enter barcode manually below.");
      });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [scannerOpen]);

  const handleBarcodeDetected = async (code) => {
    if (!code) return;
    const cleanCode = String(code).trim();
    setScannerOpen(false);

    // 1. Search in currently loaded products
    const existing = products.find(p => (p.barcode || "").toLowerCase() === cleanCode.toLowerCase() ||
                                         (p.sku || "").toLowerCase() === cleanCode.toLowerCase());
    if (existing) {
      setSuccessMessage(`Product found: "${existing.title}". Ready for stock adjustment.`);
      openStockAdjustment(existing);
      return;
    }

    // 2. Query backend for barcode in shop
    if (selectedShop?.id) {
      try {
        const found = await findProductByBarcode(selectedShop.id, cleanCode);
        if (found && found.id) {
          setSuccessMessage(`Product found: "${found.title}".`);
          openStockAdjustment(found);
          return;
        }
      } catch (_) {}
    }

    // 3. New barcode — open Create Product drawer with prefilled barcode
    setSuccessMessage(`New barcode scanned (${cleanCode}). Enter product details to save.`);
    handleOpenNewProductDrawer(cleanCode);
  };

  const defaultImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";

  return (
    <AppShell activeTab="/business/inventory" title="Products & Inventory">
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 12 }}>
        
        {/* Sticky Header matching Dribbble 'Products' header */}
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
                  Products & Inventory
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.1 }}>
                  {selectedShop?.shop_name || "Active Store"} • {products.length} Items Listed
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
                  aria-label="Barcode Scanner"
                  onClick={() => setScannerOpen(true)}
                >
                  <QrCodeScannerIcon sx={{ fontSize: 20, color: '#f97316' }} />
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

          {/* Metric Summary Cards */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {[
              { label: "Total", count: totalCount, filter: "All", color: "#0f172a", bg: "#f8fafc" },
              { label: "In Stock", count: inStockCount, filter: "In Stock", color: "#16a34a", bg: "#f0fdf4" },
              { label: "Low Stock", count: lowStockCount, filter: "Low Stock", color: "#d97706", bg: "#fffbeb" },
              { label: "Out of Stock", count: outOfStockCount, filter: "Out of Stock", color: "#dc2626", bg: "#fef2f2" },
            ].map((m) => (
              <Grid item xs={6} sm={3} key={m.label}>
                <Card
                  onClick={() => setFilterStatus(m.filter)}
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    border: filterStatus === m.filter ? `2px solid ${m.color}` : '1.5px solid #e2e8f0',
                    bgcolor: m.bg,
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    {m.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: m.color, mt: 0.2 }}>
                    {m.count}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Search Bar matching Dribbble mockup with scanner trigger */}
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
              placeholder="Search by title, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' },
              }}
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton size="small" onClick={() => setScannerOpen(true)} sx={{ color: '#f97316' }} title="Scan Barcode">
                <QrCodeScannerIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Quick Category Scroll Strip (Screen 3 Mockup) */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
            <Chip
              label="All Categories"
              onClick={() => setFilterCategory("All")}
              sx={{
                fontWeight: 800,
                fontSize: '0.78rem',
                height: 32,
                borderRadius: '20px',
                cursor: 'pointer',
                bgcolor: filterCategory === "All" ? '#FF6508' : '#ffffff',
                color: filterCategory === "All" ? '#ffffff' : '#475569',
                border: `1.5px solid ${filterCategory === "All" ? '#FF6508' : '#e2e8f0'}`,
                boxShadow: filterCategory === "All" ? '0 2px 8px rgba(255, 101, 8, 0.25)' : 'none',
              }}
            />
            {categories.slice(0, 10).map((c) => {
              const cName = typeof c === 'string' ? c : (c?.name || String(c));
              const isSel = filterCategory === cName;
              return (
                <Chip
                  key={cName}
                  label={cName}
                  onClick={() => setFilterCategory(cName)}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    height: 32,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    bgcolor: isSel ? '#FF6508' : '#ffffff',
                    color: isSel ? '#ffffff' : '#475569',
                    border: `1.5px solid ${isSel ? '#FF6508' : '#e2e8f0'}`,
                    boxShadow: isSel ? '0 2px 8px rgba(255, 101, 8, 0.25)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                />
              );
            })}
          </Stack>

          {/* Filter Dropdown Chips */}
          <Stack direction="row" spacing={1.25} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
            {/* Status Filter */}
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

            {/* Category Filter */}
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
              {categories.map((c) => {
                const cName = typeof c === 'string' ? c : (c?.name || String(c));
                return (
                  <MenuItem
                    key={cName}
                    selected={filterCategory === cName}
                    onClick={() => { setFilterCategory(cName); setCategoryMenuAnchor(null); }}
                    sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px' }}
                  >
                    {cName}
                  </MenuItem>
                );
              })}
            </Menu>

            {/* Channel Filter */}
            <Chip
              label={`Channel: ${filterChannel}`}
              deleteIcon={<KeyboardArrowDownIcon />}
              onDelete={(e) => setChannelMenuAnchor(e.currentTarget)}
              onClick={(e) => setChannelMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: filterChannel !== "All" ? '#0f172a' : '#ffffff',
                color: filterChannel !== "All" ? '#ffffff' : '#334155',
                border: '1.5px solid #e2e8f0',
                fontWeight: 800,
                fontSize: '0.78rem',
                height: 36,
                px: 0.5,
                '& .MuiChip-deleteIcon': {
                  color: filterChannel !== "All" ? '#ffffff' : '#64748b',
                },
              }}
            />
            <Menu
              anchorEl={channelMenuAnchor}
              open={Boolean(channelMenuAnchor)}
              onClose={() => setChannelMenuAnchor(null)}
              PaperProps={{ sx: { borderRadius: '14px', minWidth: 160, p: 0.5 } }}
            >
              {["All", "Online", "Offline"].map((ch) => (
                <MenuItem
                  key={ch}
                  selected={filterChannel === ch}
                  onClick={() => { setFilterChannel(ch); setChannelMenuAnchor(null); }}
                  sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  {ch === "All" ? "All Channels" : `${ch} Only`}
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          {/* Product Items List matching Dribbble mockup */}
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
                const stockQty = Number(p.stock_qty ?? p.stockQty ?? 0);
                const threshold = Number(p.low_stock_threshold ?? p.lowStockThreshold ?? 5);
                const isActive = p.is_active !== false;
                const isLow = stockQty > 0 && stockQty <= threshold;
                const isOut = stockQty <= 0;

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

                      {/* Details row */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {/* Status Dots & Badges */}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.3 }}>
                          <Stack direction="row" spacing={0.6} alignItems="center">
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

                          {isOut ? (
                            <Chip label="Out of Stock" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#fef2f2', color: '#dc2626' }} />
                          ) : isLow ? (
                            <Chip label="Low Stock" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#fffbeb', color: '#d97706' }} />
                          ) : null}

                          {p.sku && (
                            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>
                              SKU: {p.sku}
                            </Typography>
                          )}
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
                          ₹{price.toFixed(2)} • {p.category || 'General'} • <strong>{stockQty} in stock</strong>
                        </Typography>
                      </Box>

                      {/* Quick Adjust Button & Three-dots Menu */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Button
                          size="small"
                          onClick={() => openStockAdjustment(p)}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            bgcolor: '#f1f5f9',
                            color: '#0f172a',
                            textTransform: 'none',
                            px: 1.2,
                            py: 0.6,
                            '&:hover': { bgcolor: '#e2e8f0' },
                          }}
                        >
                          Adjust
                        </Button>
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
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>

        {/* Product Action Menu */}
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
            Edit Details
          </MenuItem>
          <MenuItem
            onClick={() => openStockAdjustment(actionMenuProduct)}
            sx={{ fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', py: 1 }}
          >
            <SwapVertIcon sx={{ fontSize: 17, mr: 1.25, color: '#f59e0b' }} />
            Adjust Stock
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

        {/* Floating Action Button (FAB) */}
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
            1. CREATE MENU BOTTOM DRAWER
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
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
              Create In Store
            </Typography>
            <IconButton size="small" onClick={() => setCreateMenuOpen(false)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Stack spacing={1.5}>
            <Box
              onClick={() => handleOpenNewProductDrawer()}
              sx={{
                p: 2,
                borderRadius: '18px',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#fff7ed', borderColor: '#fdba74' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    New Product
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Enter details, pricing, and initial stock
                  </Typography>
                </Box>
              </Stack>
              <ChevronRightIcon sx={{ color: '#94a3b8' }} />
            </Box>

            <Box
              onClick={() => { setCreateMenuOpen(false); setScannerOpen(true); }}
              sx={{
                p: 2,
                borderRadius: '18px',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#eff6ff', borderColor: '#93c5fd' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCodeScannerIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Scan Barcode
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Point camera at packaging or enter code
                  </Typography>
                </Box>
              </Stack>
              <ChevronRightIcon sx={{ color: '#94a3b8' }} />
            </Box>
          </Stack>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            2. CREATE / EDIT PRODUCT BOTTOM DRAWER
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
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mt: 1.5, mb: 0.5 }} />

          <Box sx={{ px: 3, py: 1.75, borderBottom: '1px solid #f1f5f9' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <IconButton size="small" onClick={() => setCreateProductDrawerOpen(false)} sx={{ color: '#0f172a', bgcolor: '#f8fafc' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                {editingProduct ? 'Edit Product Details' : 'Create Product'}
              </Typography>
              <Box sx={{ width: 34 }} />
            </Stack>
          </Box>

          <Box sx={{ px: 3, py: 2.5, overflowY: 'auto', flexGrow: 1 }}>
            {/* Media */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Product Image
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
                  <Box component="img" src={formImagePreview} alt="Preview" sx={{ width: 56, height: 56, borderRadius: '12px', objectFit: 'cover' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                      {formImage?.name || "Product Image"}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                      Image ready
                    </Typography>
                  </Box>
                </Stack>
                <label htmlFor="product-drawer-img-input">
                  <Button component="span" size="small" variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '0.72rem' }}>
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
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageOutlinedIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        Upload Photo
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        PNG or JPG (under 2MB)
                      </Typography>
                    </Box>
                  </Stack>
                  <ChevronRightIcon sx={{ color: '#94a3b8' }} />
                </Box>
              </label>
            )}

            {/* Product Title */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Product Title *
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. Aashirvaad Atta 5kg"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 600 } }}
            />

            {/* SKU and Barcode Fields */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  SKU (Stock Keeping Unit)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. ATT-5KG-01"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontSize: '0.85rem', fontWeight: 600 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Barcode (UPC/EAN)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. 8901030352545"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton size="small" onClick={() => setScannerOpen(true)} sx={{ color: '#f97316' }}>
                        <QrCodeScannerIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontSize: '0.85rem', fontWeight: 600 } }}
                />
              </Grid>
            </Grid>

            {/* Status Segmented Radio */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Catalog Status
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
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: formStatus === "Active" ? '5px solid #0f172a' : '2px solid #cbd5e1', bgcolor: '#ffffff' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: formStatus === "Active" ? 900 : 700, color: '#0f172a' }}>
                    Active (Public)
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
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: formStatus === "Inactive" ? '5px solid #0f172a' : '2px solid #cbd5e1', bgcolor: '#ffffff' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: formStatus === "Inactive" ? 900 : 700, color: '#0f172a' }}>
                    Inactive (Draft)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Sales Channels Available */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Sales Channel Availability
            </Typography>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '14px', border: '1.5px solid #e2e8f0', bgcolor: '#f8fafc', mb: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                    Online Delivery
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Visible in Online Shopping App & Marketplace
                  </Typography>
                </Box>
                <Switch
                  checked={formOnlineDelivery}
                  onChange={(e) => setFormOnlineDelivery(e.target.checked)}
                  color="success"
                />
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                    Physical In-Store / Nearby
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Available for in-person POS counter sales
                  </Typography>
                </Box>
                <Switch
                  checked={formOfflineDelivery}
                  onChange={(e) => setFormOfflineDelivery(e.target.checked)}
                  color="success"
                />
              </Stack>
            </Paper>

            {/* Description */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Product features, pack size, manufacturer..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontSize: '0.88rem' } }}
            />

            {/* Sub-drawers trigger cards */}
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
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CategoryOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      Category
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: formCategory ? '#10b981' : '#64748b', fontWeight: 700 }}>
                      {typeof formCategory === 'string' ? formCategory : (formCategory?.name || "Add Category")}
                    </Typography>
                  </Box>
                </Stack>
                <Button size="small" onClick={() => setCategoryPickerOpen(true)} sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.78rem', textTransform: 'none', bgcolor: '#f1f5f9', borderRadius: '10px', px: 1.5 }}>
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
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalOfferOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      Price & MRP
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: formPrice ? '#10b981' : '#64748b', fontWeight: 700 }}>
                      {formPrice ? `Selling ₹${formPrice} • MRP ₹${formCost || formPrice}` : "Set Price"}
                    </Typography>
                  </Box>
                </Stack>
                <Button size="small" onClick={() => setPricingDrawerOpen(true)} sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.78rem', textTransform: 'none', bgcolor: '#f1f5f9', borderRadius: '10px', px: 1.5 }}>
                  {formPrice ? "Edit" : "+ Set"}
                </Button>
              </Box>

              {/* Inventory Stock Threshold Card */}
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
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      {editingProduct ? 'Low Stock Threshold' : 'Initial Inventory'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                      {editingProduct
                        ? `Alert when stock ≤ ${formLowStockThreshold}`
                        : `${formQuantity} in stock (Alert at ≤ ${formLowStockThreshold})`}
                    </Typography>
                  </Box>
                </Stack>
                <Button size="small" onClick={() => setStockDrawerOpen(true)} sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.78rem', textTransform: 'none', bgcolor: '#f1f5f9', borderRadius: '10px', px: 1.5 }}>
                  Configure
                </Button>
              </Box>
            </Stack>
          </Box>

          {/* Sticky Bottom Actions Bar */}
          <Box sx={{ p: 2.25, borderTop: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
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
            3. PRICING SUB-DRAWER
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
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Pricing & Bulk Tiers
            </Typography>
            <IconButton size="small" onClick={() => setPricingDrawerOpen(false)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            {/* Selling Price */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                Selling Price (Retail ₹) *
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontSize: '1rem', fontWeight: 800 } }}
              />
            </Box>

            {/* MRP */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                MRP (Printed Maximum Retail Price ₹) *
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontSize: '1rem', fontWeight: 800 } }}
              />
            </Box>

            {/* Wholesale Price (B2B) & MOQ */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Wholesale Price (B2B ₹)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="e.g. 85.00"
                  value={formWholesalePrice}
                  onChange={(e) => setFormWholesalePrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" sx={{ fontWeight: 800 }}>₹</InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontWeight: 700 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Min Order Qty (MOQ)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="1"
                  value={formMoq}
                  onChange={(e) => setFormMoq(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontWeight: 700 } }}
                />
              </Grid>
            </Grid>

            {/* Calculated Margin & Profit */}
            <Stack direction="row" spacing={1.5} sx={{ py: 0.5 }}>
              <Box sx={{ flex: 1, p: 1.5, borderRadius: '14px', bgcolor: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  Customer Discount
                </Typography>
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d', mt: 0.2 }}>
                  {costNum > priceNum && costNum > 0 ? `${Math.round(((costNum - priceNum) / costNum) * 100)}% OFF` : '0%'}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, p: 1.5, borderRadius: '14px', bgcolor: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Savings Amount
                </Typography>
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', mt: 0.2 }}>
                  ₹{Math.max(0, costNum - priceNum).toFixed(2)}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setPricingDrawerOpen(false)}
              sx={{ py: 1.4, borderRadius: '14px', bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, textTransform: 'none' }}
            >
              Confirm Pricing
            </Button>
          </Stack>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            4. INVENTORY STOCK SUB-DRAWER (For Product Creation)
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
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Inventory & Thresholds
            </Typography>
            <IconButton size="small" onClick={() => setStockDrawerOpen(false)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Stack spacing={2.5}>
            {!editingProduct && (
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                  Initial Stock Quantity
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <IconButton onClick={() => setFormQuantity(String(Math.max(0, (parseInt(formQuantity, 10) || 0) - 1)))} sx={{ bgcolor: '#f1f5f9', width: 48, height: 48, borderRadius: '14px' }}>
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontSize: '1.2rem', fontWeight: 900 }, '& input': { textAlign: 'center' } }}
                  />
                  <IconButton onClick={() => setFormQuantity(String((parseInt(formQuantity, 10) || 0) + 1))} sx={{ bgcolor: '#f1f5f9', width: 48, height: 48, borderRadius: '14px' }}>
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Box>
            )}

            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Low Stock Alert Threshold
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="5"
                value={formLowStockThreshold}
                onChange={(e) => setFormLowStockThreshold(e.target.value)}
                helperText="Triggers an amber alert badge when available units fall to or below this count."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 800 } }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setStockDrawerOpen(false)}
              sx={{ py: 1.4, borderRadius: '14px', bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, textTransform: 'none' }}
            >
              Save Configuration
            </Button>
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
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Select Category
            </Typography>
            <IconButton size="small" onClick={() => setCategoryPickerOpen(false)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Box sx={{ overflowY: 'auto', maxHeight: '50vh', py: 1 }}>
            <Grid container spacing={1.25}>
              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : (cat?.name || String(cat));
                const currentCatName = typeof formCategory === 'string' ? formCategory : (formCategory?.name || "");
                const isSelected = currentCatName === catName;
                return (
                  <Grid item xs={6} key={catName}>
                    <Box
                      onClick={() => {
                        setFormCategory(catName);
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
                        '&:hover': { borderColor: '#94a3b8' },
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: isSelected ? 900 : 700, color: '#0f172a' }}>
                        {catName}
                      </Typography>
                      {isSelected && <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            6. DEDICATED ATOMIC STOCK ADJUSTMENT DRAWER
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={adjustDrawerOpen}
          onClose={() => setAdjustDrawerOpen(false)}
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
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                Stock Adjustment
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {adjustProduct?.title}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setAdjustDrawerOpen(false)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Current Stock Banner */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1.5px solid #e2e8f0', mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Current On-Hand Stock
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
                  {Number(adjustProduct?.stock_qty ?? adjustProduct?.stockQty ?? 0)} units
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={loadMovementsAudit}
                startIcon={<HistoryIcon />}
                sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', borderRadius: '10px' }}
              >
                Audit Log
              </Button>
            </Stack>
          </Paper>

          {movementsTabOpen ? (
            /* Audit Log View */
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 900 }}>Recent Stock Movements</Typography>
                <Button size="small" onClick={() => setMovementsTabOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Back to Adjust
                </Button>
              </Stack>
              {movementsLoading ? (
                <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
              ) : movementsList.length === 0 ? (
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', py: 2, textAlign: 'center' }}>No stock movements recorded yet</Typography>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 240, overflowY: 'auto' }}>
                  {movementsList.map((m) => (
                    <Box key={m.id} sx={{ p: 1.25, borderRadius: '10px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <strong>{m.movement_type} ({m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change})</strong>
                        <span>Result: {m.resulting_stock}</span>
                      </Stack>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.2 }}>
                        {m.reason || 'No reason'} • {m.actor_role} • {m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          ) : (
            /* Adjustment Form */
            <Stack spacing={2}>
              {/* Operation Segmented Controls */}
              <Grid container spacing={1}>
                {[
                  { id: "ADD", label: "+ Add Stock" },
                  { id: "REDUCE", label: "- Reduce Stock" },
                  { id: "CORRECTION", label: "= Set Count" },
                ].map((op) => (
                  <Grid item xs={4} key={op.id}>
                    <Button
                      fullWidth
                      variant={adjustType === op.id ? "contained" : "outlined"}
                      onClick={() => setAdjustType(op.id)}
                      sx={{
                        py: 1,
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        bgcolor: adjustType === op.id ? '#0f172a' : '#ffffff',
                        borderColor: '#cbd5e1',
                        color: adjustType === op.id ? '#ffffff' : '#334155',
                      }}
                    >
                      {op.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Quantity */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Quantity
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontSize: '1.2rem', fontWeight: 900 } }}
                />
              </Box>

              {/* Calculated Resulting Stock */}
              {(() => {
                const cur = Number(adjustProduct?.stock_qty ?? adjustProduct?.stockQty ?? 0);
                const val = parseInt(adjustQty, 10) || 0;
                let res = cur;
                if (adjustType === "ADD") res = cur + val;
                else if (adjustType === "REDUCE") res = Math.max(0, cur - val);
                else if (adjustType === "CORRECTION") res = val;
                return (
                  <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>
                      Resulting Stock: {res} units ({res > cur ? `+${res - cur}` : `${res - cur}`})
                    </Typography>
                  </Box>
                );
              })()}

              {/* Reason */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Reason / Notes *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Received shipment, Damaged item, Physical count audit..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontSize: '0.85rem' } }}
                />
              </Box>

              {/* Reference ID */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
                  Reference ID (Optional PO # / Invoice #)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. PO-89214"
                  value={adjustRef}
                  onChange={(e) => setAdjustRef(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc', fontSize: '0.85rem' } }}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSaveStockAdjustment}
                disabled={adjustSubmitting}
                startIcon={adjustSubmitting && <CircularProgress size={16} color="inherit" />}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  bgcolor: '#f97316',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#ea580c' },
                }}
              >
                {adjustSubmitting ? "Updating Ledger..." : "Confirm Stock Adjustment"}
              </Button>
            </Stack>
          )}
        </Drawer>

        {/* ════════════════════════════════════════════════════════════════════════════════
            7. CAMERA & BARCODE SCANNER MODAL
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Dialog
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              maxWidth: 420,
              width: '94%',
              p: 2,
              textAlign: 'center',
            },
          }}
        >
          <DialogTitle sx={{ p: 1, fontWeight: 900, fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Scan Product Barcode</span>
            <IconButton size="small" onClick={() => setScannerOpen(false)}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 1 }}>
            {/* Live Camera Viewport */}
            <Box
              sx={{
                width: '100%',
                height: 220,
                borderRadius: '16px',
                bgcolor: '#0f172a',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Viewport scan targeting overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '75%',
                  height: '60%',
                  border: '2px solid #f97316',
                  borderRadius: '12px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                  pointerEvents: 'none',
                }}
              />
            </Box>

            {scannerError && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.75rem' }}>
                {scannerError}
              </Alert>
            )}

            {/* Manual Barcode Input Fallback */}
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', mb: 1, textAlign: 'left' }}>
              Or enter barcode / SKU manually:
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 8901030352545"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button
                variant="contained"
                onClick={() => handleBarcodeDetected(manualBarcode)}
                disabled={!manualBarcode.trim()}
                sx={{ borderRadius: '12px', fontWeight: 800, bgcolor: '#0f172a', textTransform: 'none', px: 2 }}
              >
                Look Up
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

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
