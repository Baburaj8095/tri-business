import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Avatar, Divider, Switch,
  FormControlLabel, Alert, CircularProgress, Snackbar,
  Grid, Tooltip, InputAdornment, InputBase
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory2 as InventoryIcon,
  ShoppingBag as ProductIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  QrCodeScanner as ScanIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';

import { T, cardHoverSx } from '../../theme/tokens';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain') || localStorage.getItem('captain_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function readApiError(res) {
  try {
    const data = await res.json();
    return data.error || data.message || data.details || `HTTP ${res.status}`;
  } catch (_) {
    return `HTTP ${res.status}`;
  }
}

function fmtCurrency(val) {
  return `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ─── Screen 2 Modern Product Card ─────────────────────────────────────────── */
function ModernProductCard({ product, onToggleOnline, onEdit, onDelete }) {
  const isOnline = !!product.online_delivery;
  const isOutOfStock = (product.stock_qty ?? 0) <= 0;

  return (
    <Card
      elevation={0}
      sx={{
        ...cardHoverSx,
        border: `1.5px solid ${T.border}`,
        borderRadius: '16px',
        bgcolor: T.surface,
        overflow: 'hidden',
        p: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* Product Thumbnail */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '12px',
            bgcolor: T.surfaceAlt,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: `1px solid ${T.border}`,
          }}
        >
          {product.image_url ? (
            <Box component="img" src={product.image_url} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ProductIcon sx={{ fontSize: 36, color: T.textMuted }} />
          )}
        </Box>

        {/* Product Details */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: T.text }} noWrap>
              {product.name}
            </Typography>
            <Chip
              label={isOutOfStock ? 'Out of Stock' : (isOnline ? 'Active' : 'Inactive')}
              size="small"
              sx={{
                bgcolor: isOutOfStock ? '#FEF2F2' : (isOnline ? '#ECFDF5' : '#FFF3E8'),
                color: isOutOfStock ? '#E5484D' : (isOnline ? '#159A65' : '#FF6508'),
                fontWeight: 800,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
          </Stack>

          <Typography sx={{ fontSize: '0.72rem', color: T.textSecondary, mt: 0.25 }} noWrap>
            {product.category || 'General'} {product.sku ? `• SKU: ${product.sku}` : ''}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: T.primary }}>
                {fmtCurrency(product.price)}
              </Typography>
              {product.mrp && Number(product.mrp) > Number(product.price) && (
                <>
                  <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, textDecoration: 'line-through' }}>
                    {fmtCurrency(product.mrp)}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)}% OFF`}
                    sx={{ bgcolor: '#ECFDF5', color: '#159A65', fontWeight: 800, fontSize: '0.65rem', height: 18 }}
                  />
                </>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Tooltip title={isOnline ? 'Online Delivery Active' : 'Offline Only'}>
                <Switch
                  size="small"
                  checked={isOnline}
                  onChange={() => onToggleOnline(product)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: T.primary },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: T.primary },
                  }}
                />
              </Tooltip>
              <Tooltip title="Edit Product">
                <IconButton size="small" onClick={() => onEdit(product)} sx={{ color: T.textSecondary }}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove Listing">
                <IconButton size="small" onClick={() => onDelete(product)} sx={{ color: '#E5484D' }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function OnlineProductsPage() {
  const navigate = useNavigate();
  const merchantId = localStorage.getItem('merchant_id_business') || localStorage.getItem('merchant_id');

  /* ── State ── */
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterTab, setFilterTab]     = useState('ALL');
  const [snackbar, setSnackbar]       = useState({ open: false, msg: '', sev: 'success' });

  /* Edit dialog */
  const [editOpen, setEditOpen]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [editForm, setEditForm]       = useState({
    name: '', category: '', price: '', stock_qty: '', description: '', online_delivery: true,
  });

  /* ── Fetch ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${CAPTAIN_API}/captain/merchant/online-products?limit=200&offset=0`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error(await readApiError(res));
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (e) {
      showSnack(`Failed to load products: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Helpers ── */
  function showSnack(msg, sev = 'success') {
    setSnackbar({ open: true, msg, sev });
  }

  /* ── Toggle online_delivery ── */
  async function handleToggleOnline(product) {
    const newVal = !product.online_delivery;
    try {
      const res = await fetch(
        `${CAPTAIN_API}/captain/products/${product.id}/online-delivery`,
        {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ online_delivery: newVal }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, online_delivery: newVal } : p));
      showSnack(newVal ? 'Product listed online ✓' : 'Product removed from online listing');
    } catch (e) {
      showSnack(`Toggle failed: ${e.message}`, 'error');
    }
  }

  /* ── Open edit ── */
  function handleEdit(product) {
    setEditProduct(product);
    setEditForm({
      name:             product.name || '',
      category:         product.category || '',
      price:            product.price ?? '',
      stock_qty:        product.stock_qty ?? '',
      description:      product.description || '',
      online_delivery:  !!product.online_delivery,
    });
    setEditOpen(true);
  }

  /* ── Save edit ── */
  async function handleSaveEdit() {
    setSaving(true);
    try {
      const res = await fetch(
        `${CAPTAIN_API}/captain/products/${editProduct.id}`,
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            name:            editForm.name,
            category:        editForm.category,
            price:           parseFloat(editForm.price) || 0,
            stock_qty:       parseInt(editForm.stock_qty, 10) || 0,
            description:     editForm.description,
            online_delivery: editForm.online_delivery,
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showSnack('Product updated ✓');
      setEditOpen(false);
      fetchProducts();
    } catch (e) {
      showSnack(`Save failed: ${e.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  /* ── Remove from online (sets online_delivery=false) ── */
  async function handleDelete(product) {
    if (!window.confirm(`Remove "${product.name}" from your online listing?`)) return;
    try {
      const res = await fetch(
        `${CAPTAIN_API}/captain/products/${product.id}/online-delivery`,
        {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ online_delivery: false }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showSnack('Removed from your online listing');
    } catch (e) {
      showSnack(`Remove failed: ${e.message}`, 'error');
    }
  }

  /* ── Derived Categories ── */
  const categoryList = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const [selectedCat, setSelectedCat] = useState('All');

  /* ── Derived ── */
  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCat !== 'All' && p.category !== selectedCat) return false;
    if (filterTab === 'ACTIVE') return !!p.online_delivery && (p.stock_qty ?? 0) > 0;
    if (filterTab === 'INACTIVE') return !p.online_delivery;
    if (filterTab === 'OUT_OF_STOCK') return (p.stock_qty ?? 0) <= 0;
    return true;
  });
  const activeCount = products.filter(p => p.online_delivery && (p.stock_qty ?? 0) > 0).length;
  const inactiveCount = products.filter(p => !p.online_delivery).length;
  const outOfStockCount = products.filter(p => (p.stock_qty ?? 0) <= 0).length;

  /* ── Render ── */
  return (
    <AppShell activeTab="/business/online-products" title="Online Products">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        
        {/* 1. HERO PROMOTIONAL BANNER (Screen 2) */}
        <Card
          sx={{
            mb: 2.5,
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #FF6508 0%, #E9570A 100%)',
            color: '#ffffff',
            p: { xs: 2.25, sm: 3 },
            boxShadow: '0 6px 20px rgba(255, 101, 8, 0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ pr: 1.5, zIndex: 1 }}>
              <Chip
                label="CATALOG VISIBILITY"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#ffffff', fontWeight: 800, fontSize: '0.62rem', height: 20, mb: 0.75 }}
              />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.25rem' }, lineHeight: 1.25, mb: 0.5 }}>
                List Your Best Products
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.9)', mb: 1.5 }}>
                Publish active catalog items to attract direct online customer orders & door deliveries.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/business/inventory')}
                endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#E9570A',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                Add / Manage Products →
              </Button>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              <ProductIcon sx={{ fontSize: 34, color: '#ffffff' }} />
            </Box>
          </Stack>
        </Card>

        {/* 2. SEARCH BAR WITH SCANNER BUTTON (Screen 2) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: T.surface,
            borderRadius: '16px',
            border: `1.5px solid ${T.border}`,
            px: 1.75,
            py: 0.5,
            mb: 2,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
          }}
        >
          <SearchIcon sx={{ color: T.textMuted, fontSize: 22, mr: 1 }} />
          <InputBase
            fullWidth
            placeholder="Search products by title, SKU, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ fontSize: '0.88rem', fontWeight: 600, color: T.text }}
          />
          <IconButton onClick={() => navigate('/scanner')} sx={{ color: T.primary, p: 0.75 }}>
            <ScanIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>

        {/* 3. HORIZONTAL CATEGORY CHIPS WITH ICONS (Screen 2) */}
        {categoryList.length > 1 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
              {categoryList.map(cat => {
                const isSelected = selectedCat === cat;
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    onClick={() => setSelectedCat(cat)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      borderRadius: '10px',
                      bgcolor: isSelected ? T.primary : T.surface,
                      color: isSelected ? '#ffffff' : T.textSecondary,
                      border: `1px solid ${isSelected ? T.primary : T.border}`,
                      '&:hover': { bgcolor: isSelected ? T.primaryDark : T.surfaceAlt },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {/* 4. STATUS FILTER TABS (Screen 2: All Products, Active, Inactive, Out of Stock) */}
        <Box sx={{ mb: 2.5 }}>
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
              { id: 'ALL', label: `All Products (${products.length})` },
              { id: 'ACTIVE', label: `Active (${activeCount})` },
              { id: 'INACTIVE', label: `Inactive (${inactiveCount})` },
              { id: 'OUT_OF_STOCK', label: `Out of Stock (${outOfStockCount})` },
            ].map(tab => {
              const active = filterTab === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => setFilterTab(tab.id)}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    borderRadius: '20px',
                    bgcolor: active ? T.primaryLight : T.surface,
                    color: active ? T.primary : T.textSecondary,
                    border: `1.5px solid ${active ? T.primary : T.border}`,
                    '&:hover': { bgcolor: active ? T.primaryLight : T.surfaceAlt },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* 5. PRODUCT LIST CARDS (Screen 2) */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: T.primary }} />
            <Typography variant="body2" color={T.textMuted} sx={{ mt: 1.5, fontWeight: 600 }}>Loading catalog listings…</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Card elevation={0} sx={{ border: `1.5px dashed ${T.border}`, borderRadius: '20px', bgcolor: T.surface, py: 7, px: 3, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: T.surfaceAlt, display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
              <ProductIcon sx={{ fontSize: 32, color: T.textMuted }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: T.text, mb: 0.5 }}>
              {search ? 'No matching products' : 'No online products listed yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: T.textSecondary, maxWidth: 440, mx: 'auto', mb: 2.5 }}>
              {search 
                ? 'Try searching with a different keyword or category.' 
                : 'Add products to your store inventory and easily toggle them for online customer delivery.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/business/inventory')}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: T.primary,
                borderRadius: '12px',
                px: 3.5,
                py: 1.1,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: T.primaryDark }
              }}
            >
              Go to Inventory Manager
            </Button>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map(p => (
              <ModernProductCard
                key={p.id}
                product={p}
                onToggleOnline={handleToggleOnline}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}

        {/* Floating/Fixed + Add Product Button */}
        <Box sx={{ position: 'fixed', bottom: { xs: 80, sm: 30 }, right: 20, zIndex: 1000 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/business/inventory')}
            startIcon={<AddIcon />}
            sx={{
              bgcolor: T.primary,
              color: '#ffffff',
              borderRadius: '24px',
              px: 2.5,
              py: 1.2,
              fontWeight: 900,
              fontSize: '0.86rem',
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(255, 101, 8, 0.4)',
              '&:hover': { bgcolor: T.primaryDark },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Edit Product</Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack gap={2}>
            <TextField label="Product Name" value={editForm.name} size="small"
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Category" value={editForm.category} size="small"
              onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} fullWidth />
            <Stack direction="row" gap={2}>
              <TextField label="Price (₹)" value={editForm.price} size="small" type="number"
                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} fullWidth />
              <TextField label="Stock Qty" value={editForm.stock_qty} size="small" type="number"
                onChange={e => setEditForm(f => ({ ...f, stock_qty: e.target.value }))} fullWidth />
            </Stack>
            <TextField label="Description" value={editForm.description} size="small" multiline rows={3}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} fullWidth />
            <FormControlLabel
              control={
                <Switch checked={editForm.online_delivery}
                  onChange={e => setEditForm(f => ({ ...f, online_delivery: e.target.checked }))}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: T.primary },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: T.primary },
                  }} />
              }
              label={<Typography variant="body2">List Online</Typography>}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: T.textMuted }}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleSaveEdit}
            sx={{ bgcolor: T.primary, '&:hover': { bgcolor: T.primaryDark }, borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 800 }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.sev} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 500 }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
