import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Stack,
  FormControlLabel,
  Checkbox,
  alpha,
  CircularProgress
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import {
  listMyShopProducts,
  createMyShopProduct,
  updateMyShopProduct,
  deleteMyShopProduct,
  getShopDetail,
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
  fontSize: '0.8rem',
  fontWeight: 800,
  color: T.text,
  mb: 0.5,
  display: 'block',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#fff',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderHover },
    '&.Mui-focused fieldset': { borderColor: T.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: T.primary,
  }
};

function ProductCard({ p, onEdit, onToggleActive, onDelete }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '16px',
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: T.cardShadow,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          borderColor: alpha(T.primary, 0.3)
        }
      }}
    >
      <Box sx={{ height: 130, borderRadius: '12px', overflow: "hidden", bgcolor: "#f8fafc", mb: 1.5, position: 'relative' }}>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 12 }}>
            No image
          </Box>
        )}
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 800, color: T.text }} noWrap title={p.title}>
        {p.title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 800, color: T.primary }}>
          ₹{Number(p.price).toFixed(2)}
        </Typography>
        {Number(p.discount_percent) > 0 ? (
          <Typography variant="caption" sx={{ textDecoration: "line-through", color: T.textMuted }}>
            ₹{Number(p.mrp).toFixed(2)}
          </Typography>
        ) : null}
        {Number(p.discount_percent) > 0 ? (
          <Chip
            size="small"
            label={`${Number(p.discount_percent).toFixed(0)}% OFF`}
            sx={{
              height: 16,
              fontSize: '0.62rem',
              fontWeight: 800,
              bgcolor: '#fef2f2',
              color: '#dc2626',
              '& .MuiChip-label': { px: 0.5 }
            }}
          />
        ) : null}
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
        {p.online_delivery ? (
          <Chip
            size="small"
            label="Online"
            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#eff6ff', color: '#2563eb' }}
          />
        ) : null}
        {p.offline_delivery ? (
          <Chip
            size="small"
            label="Offline"
            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#f5f3ff', color: '#7c3aed' }}
          />
        ) : null}
        <Chip
          size="small"
          label={p.stock_qty > 0 ? `Stock: ${p.stock_qty}` : "Out of stock"}
          sx={{
            height: 18,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: p.stock_qty > 0 ? T.primaryLight : '#fffbeb',
            color: p.stock_qty > 0 ? T.primary : '#d97706'
          }}
        />
        <Chip
          size="small"
          label={p.is_active ? "Active" : "Hidden"}
          sx={{
            height: 18,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: p.is_active ? T.primaryLight : '#f1f5f9',
            color: p.is_active ? T.primary : T.textSecondary
          }}
        />
      </Box>

      <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", pt: 1.5 }}>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => onEdit(p)}
            sx={{
              bgcolor: alpha(T.primary, 0.05),
              color: T.primary,
              borderRadius: '8px',
              width: 32,
              height: 32,
              "&:hover": { bgcolor: alpha(T.primary, 0.15) }
            }}
          >
            <EditOutlinedIcon fontSize="small" sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={p.is_active ? "Disable (hide from public)" : "Enable (show publicly)"}>
          <IconButton
            size="small"
            onClick={() => onToggleActive(p)}
            sx={{
              bgcolor: p.is_active ? alpha(T.success, 0.08) : alpha(T.textMuted, 0.08),
              color: p.is_active ? T.success : T.textSecondary,
              borderRadius: '8px',
              width: 32,
              height: 32,
              "&:hover": { bgcolor: p.is_active ? alpha(T.success, 0.18) : alpha(T.textMuted, 0.18) }
            }}
          >
            {p.is_active ? (
              <CheckCircleIcon fontSize="small" sx={{ fontSize: 16 }} />
            ) : (
              <BlockIcon fontSize="small" sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(p)}
            sx={{
              bgcolor: alpha(T.error, 0.05),
              color: T.error,
              borderRadius: '8px',
              width: 32,
              height: 32,
              "&:hover": { bgcolor: alpha(T.error, 0.15) }
            }}
          >
            <DeleteOutlineIcon fontSize="small" sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

function ProductDialog({ open, onClose, onSubmit, initial = null, shop = null }) {
  const isEdit = !!(initial && initial.id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [discount, setDiscount] = useState(0);
  const [price, setPrice] = useState("");
  const [online, setOnline] = useState(false);
  const [offline, setOffline] = useState(true);
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState(null);
  const [imgUrl, setImgUrl] = useState("");

  const hasHomeDelivery = useMemo(() => {
    return shop ? !!(shop.homeDeliveryEnabled || shop.home_delivery_enabled) : false;
  }, [shop]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setDescription(initial?.description || "");
      setMrp(initial?.mrp ?? "");
      setDiscount(initial?.discount_percent ?? 0);
      setPrice(initial?.price ?? "");
      
      // If editing, use the configured delivery mode.
      // If adding a new product, default online to false unless shop supports home delivery.
      setOnline(initial ? !!initial.online_delivery : false);
      setOffline(initial ? !!initial.offline_delivery : true);
      
      setStock(initial?.stock_qty ?? 0);
      setIsActive(initial?.is_active ?? true);
      setImage(null);
      setImgUrl(initial?.image_url || "");
    }
  }, [open, initial, shop]);

  useEffect(() => {
    const m = Number(mrp);
    const d = Number(discount);
    if (!Number.isNaN(m) && !Number.isNaN(d)) {
      try {
        const p = (m * (1 - d / 100));
        if (!Number.isNaN(p)) {
          setPrice((Math.round(p * 100) / 100).toFixed(2));
        }
      } catch (_) {}
    }
  }, [mrp, discount]);

  const handlePickImage = (e) => {
    const f = e?.target?.files?.[0] || null;
    setImage(f);
    setImgUrl(f ? URL.createObjectURL(f) : "");
  };

  const handleSubmit = async () => {
    const payload = {
      title,
      description,
      mrp,
      discount_percent: discount,
      price,
      online_delivery: online,
      offline_delivery: offline,
      stock_qty: stock,
      is_active: isActive,
      image,
    };
    await onSubmit(payload, initial?.id || null);
  };

  const disabled = !String(title || "").trim() || mrp === "" || Number.isNaN(Number(mrp));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, color: T.text, fontSize: '1.25rem', pb: 1 }}>
        {isEdit ? "Edit Product Details" : "Add New Product"}
      </DialogTitle>
      <DialogContent sx={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, py: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography sx={labelSx}>Product Title *</Typography>
            <TextField
              placeholder="e.g. Fresh Tomatoes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Description</Typography>
            <TextField
              placeholder="Provide key details about the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={inputSx}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography sx={labelSx}>MRP (₹) *</Typography>
              <TextField
                placeholder="0.00"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                type="number"
                fullWidth
                required
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={labelSx}>Discount (%)</Typography>
              <TextField
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                type="number"
                fullWidth
                sx={inputSx}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography sx={labelSx}>Selling Price (₹)</Typography>
            <TextField
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              fullWidth
              sx={inputSx}
              helperText="Auto-calculated from MRP and Discount. You can manually override if needed."
              FormHelperTextProps={{ sx: { fontStyle: 'italic', color: T.textSecondary } }}
            />
          </Box>

          <Box sx={{ bgcolor: T.bg, p: 2, borderRadius: '12px', border: `1px solid ${T.border}` }}>
            <Typography sx={{ ...labelSx, mb: 1 }}>Fulfillment & Delivery Modes</Typography>
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={online} 
                    onChange={(e) => setOnline(e.target.checked)} 
                    disabled={!hasHomeDelivery && !online}
                    sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: (!hasHomeDelivery && !online) ? T.textMuted : T.textSecondary }}>
                      Online delivery
                    </Typography>
                    {!hasHomeDelivery && (
                      <Typography variant="caption" sx={{ color: T.accent, display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>
                        (Requires home delivery enabled in Shop details)
                      </Typography>
                    )}
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={offline} 
                    onChange={(e) => setOffline(e.target.checked)} 
                    sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: T.textSecondary }}>Offline delivery</Typography>}
              />
            </Stack>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Typography sx={labelSx}>Stock Quantity</Typography>
              <TextField
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                type="number"
                fullWidth
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={6} sx={{ pt: '24px !important' }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                    sx={{ color: T.border, '&.Mui-checked': { color: T.primary } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: T.text }}>Active (visible to consumers)</Typography>}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography sx={labelSx}>Product Image</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
                sx={{
                  borderColor: T.primary,
                  color: T.primary,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  "&:hover": { bgcolor: alpha(T.primary, 0.05), borderColor: T.primaryDark }
                }}
              >
                {image ? "Change Image" : "Upload Image"}
                <input hidden type="file" accept="image/*" onChange={handlePickImage} />
              </Button>
              {imgUrl && (
                <Box sx={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
                  <img src={imgUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: T.textSecondary,
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '10px',
            px: 2
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          disabled={disabled} 
          onClick={handleSubmit}
          sx={{
            background: T.btnGradient,
            '&:hover': { background: T.primaryDark },
            color: '#fff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 800,
            px: 3,
            boxShadow: 'none'
          }}
        >
          {isEdit ? "Save Changes" : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function BusinessShopProducts() {
  const { id: shopId } = useParams(); // Fixed parameter extraction to bind to route :id
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [productsRes, shopRes] = await Promise.all([
        listMyShopProducts(shopId),
        getShopDetail(shopId).catch(() => null)
      ]);
      const arr = Array.isArray(productsRes) ? productsRes : productsRes?.results || [];
      setRows(arr);
      if (shopRes) setShop(shopRes);
    } catch (_) {
      setErr("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (shopId) load();
  }, [shopId]);

  const handleAdd = () => {
    setEditItem(null);
    setDlgOpen(true);
  };

  const handleEdit = (p) => {
    setEditItem(p);
    setDlgOpen(true);
  };

  const handleClose = () => {
    if (!saving) setDlgOpen(false);
  };

  const handleSubmit = async (payload, id = null) => {
    try {
      setSaving(true);
      setErr("");
      setSuccess("");
      if (id) {
        await updateMyShopProduct(id, payload);
        setSuccess("Product updated successfully.");
      } else {
        await createMyShopProduct(shopId, payload);
        setSuccess("Product added successfully.");
      }
      setDlgOpen(false);
      setEditItem(null);
      await load();
    } catch (e) {
      setErr(
        (e?.response?.data && (e.response.data.detail || e.response.data.message || JSON.stringify(e.response.data))) ||
        "Save failed. Please verify fields."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await updateMyShopProduct(p.id, { is_active: !p.is_active });
      await load();
    } catch (_) {
      setErr("Failed to toggle visibility.");
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await deleteMyShopProduct(p.id);
      await load();
    } catch (_) {
      setErr("Delete failed.");
    }
  };

  return (
    <Box sx={{ px: 1.5, pb: 4 }}>
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          alignItems: { xs: "flex-start", sm: "center" }, 
          justifyContent: "space-between", 
          gap: 1.5, 
          mb: 2.5 
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: T.text }}>
            {shop ? `Shop Products: ${shop.shop_name}` : "Shop Products"}
          </Typography>
          {shop && (
            <Typography variant="body2" sx={{ color: T.textSecondary, fontWeight: 600 }}>
              {shop.category || 'Retail Store'} • {shop.city}
            </Typography>
          )}
        </Box>
        <Stack 
          direction="row" 
          spacing={1.5} 
          sx={{ 
            width: { xs: "100%", sm: "auto" }, 
            justifyContent: { xs: "space-between", sm: "flex-end" } 
          }}
        >
          <Button 
            variant="outlined" 
            onClick={() => navigate("/business/shops")}
            sx={{
              flex: { xs: 1, sm: "initial" },
              borderColor: T.primary,
              color: T.primary,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: alpha(T.primary, 0.05), borderColor: T.primaryDark }
            }}
          >
            Back to Shops
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Inventory2Icon />} 
            onClick={handleAdd}
            sx={{
              flex: { xs: 1, sm: "initial" },
              background: T.btnGradient,
              '&:hover': { background: T.primaryDark },
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(34, 139, 34, 0.15)'
            }}
          >
            Add Product
          </Button>
        </Stack>
      </Box>

      {err ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {err}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
          {success}
        </Alert>
      ) : null}

      {/* GRID */}
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
                <Paper sx={{ p: 2, borderRadius: '16px', border: `1px solid ${T.border}` }}>
                  <Skeleton variant="rectangular" height={130} sx={{ borderRadius: '12px', mb: 2 }} />
                  <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Paper>
              </Grid>
            ))
          : (rows || []).map((p) => (
              <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard
                  p={p}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
        
        {!loading && (rows || []).length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: `1px solid ${T.border}`, bgcolor: T.surface, boxShadow: T.cardShadow }}>
              <StoreIcon sx={{ fontSize: 48, color: T.textMuted, mb: 1 }} />
              <Typography variant="subtitle1" sx={{ color: T.text, fontWeight: 800, mb: 1 }}>
                No Products Found
              </Typography>
              <Typography variant="body2" sx={{ color: T.textSecondary }}>
                Click "Add Product" above to create your first storefront catalog item.
              </Typography>
            </Paper>
          </Grid>
        ) : null}
      </Grid>

      <ProductDialog
        open={dlgOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initial={editItem}
        shop={shop}
      />
    </Box>
  );
}
