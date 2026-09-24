import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Avatar, Divider, Switch,
  FormControlLabel, Alert, CircularProgress, Snackbar,
  Grid, Tooltip, InputAdornment
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const P   = '#228B22';
const PD  = '#1B4D3E';
const BG  = '#f1f5f9';
const SUR = '#ffffff';
const TXT = '#0f172a';
const MUT = '#94a3b8';
const BOR = '#e2e8f0';
const ERR = '#ef4444';

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

/* ─── Sub-components ────────────────────────────────────────────────────────── */
function SectionShell({ title, subtitle, actions, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color={TXT}>{title}</Typography>
          {subtitle && <Typography variant="caption" color={MUT}>{subtitle}</Typography>}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Stack>
      {children}
    </Box>
  );
}

function StatCard({ icon, label, value, color = P, active = false, onClick }) {
  return (
    <Card 
      elevation={0} 
      onClick={onClick}
      sx={{ 
        border: `1.5px solid ${active ? color : BOR}`, 
        borderRadius: '16px', 
        bgcolor: active ? `${color}0c` : '#ffffff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': onClick ? { borderColor: color, transform: 'translateY(-2px)' } : {},
        height: '100%',
        boxShadow: active ? `0 4px 12px ${color}20` : '0 2px 8px rgba(15,23,42,0.02)'
      }}
    >
      <CardContent sx={{ p: { xs: 1.25, sm: 2 }, '&:last-child': { pb: { xs: 1.25, sm: 2 } }, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: `${color}18`, color, width: { xs: 32, sm: 38 }, height: { xs: 32, sm: 38 }, borderRadius: '10px', mx: 'auto', mb: 0.75 }}>
          {React.cloneElement(icon, { sx: { fontSize: { xs: 18, sm: 22 } } })}
        </Avatar>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: TXT, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.78rem' }, color: '#64748b', fontWeight: 700, mt: 0.5 }} noWrap>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ProductCard({ product, onToggleOnline, onEdit, onDelete }) {
  return (
    <Card elevation={0} sx={{ border: `1px solid ${BOR}`, borderRadius: 2, overflow: 'hidden', transition: 'box-shadow .15s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,.08)' } }}>
      {/* Image */}
      <Box sx={{ position: 'relative', bgcolor: '#f8fafc', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {product.image_url ? (
          <Box component="img" src={product.image_url} alt={product.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ProductIcon sx={{ fontSize: 48, color: BOR }} />
        )}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip
            label={product.online_delivery ? 'Online' : 'Offline only'}
            size="small"
            icon={product.online_delivery ? <ActiveIcon /> : <InactiveIcon />}
            sx={{
              bgcolor: product.online_delivery ? '#ecfdf5' : '#fff7ed',
              color:   product.online_delivery ? '#059669' : '#ea580c',
              fontWeight: 600, fontSize: '0.7rem',
              '& .MuiChip-icon': { fontSize: '0.85rem' }
            }}
          />
        </Box>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} color={TXT} noWrap>{product.name}</Typography>
        <Typography variant="caption" color={MUT} sx={{ display: 'block', mb: 1 }} noWrap>
          {product.category || '—'}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="body2" fontWeight={700} color={P}>{fmtCurrency(product.price)}</Typography>
          <Chip label={`Stock: ${product.stock_qty ?? 0}`} size="small"
            sx={{ bgcolor: '#f1f5f9', color: TXT, fontSize: '0.7rem', fontWeight: 600 }} />
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={
              <Switch size="small" checked={!!product.online_delivery}
                onChange={() => onToggleOnline(product)}
                sx={{ '& .MuiSwitch-track': { bgcolor: product.online_delivery ? P : MUT } }} />
            }
            label={<Typography variant="caption" color={MUT}>List Online</Typography>}
            sx={{ m: 0 }}
          />
          <Stack direction="row" gap={0.5}>
            <Tooltip title="Edit product">
              <IconButton size="small" onClick={() => onEdit(product)} sx={{ color: P }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove from online">
              <IconButton size="small" onClick={() => onDelete(product)} sx={{ color: ERR }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
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

  /* ── Derived ── */
  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'ONLINE') return !!p.online_delivery;
    if (filterTab === 'OFFLINE') return !p.online_delivery;
    return true;
  });
  const onlineCount  = products.filter(p => p.online_delivery).length;
  const offlineCount = products.filter(p => !p.online_delivery).length;

  /* ── Render ── */
  return (
    <AppShell activeTab="/business/inventory" title="Manage Online Products">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Page Action Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: TXT, lineHeight: 1.2 }}>
              Online Catalog Products
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Toggle products available for customer online delivery and instant ordering
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={fetchProducts}
              startIcon={<RefreshIcon />}
              sx={{ 
                color: PD, 
                borderColor: BOR, 
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                flex: { xs: 1, sm: 'none' },
                '&:hover': { borderColor: P, bgcolor: '#f0fdf4' }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/business/inventory')}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: P,
                color: '#fff',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                boxShadow: 'none',
                flex: { xs: 1, sm: 'none' },
                '&:hover': { bgcolor: PD }
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Stack>

        {/* Compact 3-Column Stats Grid */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={4}>
            <StatCard 
              icon={<InventoryIcon />} 
              label="Total" 
              value={products.length} 
              color="#2563eb"
              active={filterTab === 'ALL'}
              onClick={() => setFilterTab('ALL')}
            />
          </Grid>
          <Grid item xs={4}>
            <StatCard 
              icon={<ActiveIcon />} 
              label="Online" 
              value={onlineCount} 
              color="#059669"
              active={filterTab === 'ONLINE'}
              onClick={() => setFilterTab('ONLINE')}
            />
          </Grid>
          <Grid item xs={4}>
            <StatCard 
              icon={<InactiveIcon />} 
              label="Offline" 
              value={offlineCount} 
              color="#ea580c"
              active={filterTab === 'OFFLINE'}
              onClick={() => setFilterTab('OFFLINE')}
            />
          </Grid>
        </Grid>

        {/* Search Bar & Filter Chips */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
            fullWidth 
            size="small" 
            placeholder="Search by product name or category…"
            value={search} 
            onChange={e => setSearch(e.target.value)}
            InputProps={{ 
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: MUT }} /></InputAdornment> 
            }}
            sx={{ 
              mb: 1.5, 
              bgcolor: SUR, 
              borderRadius: '12px',
              '& .MuiOutlinedInput-root': { borderRadius: '12px' }
            }}
          />

          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            <Chip
              label={`All (${products.length})`}
              size="small"
              clickable
              onClick={() => setFilterTab('ALL')}
              sx={{
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: filterTab === 'ALL' ? P : '#f1f5f9',
                color: filterTab === 'ALL' ? '#ffffff' : '#475569',
                '&:hover': { bgcolor: filterTab === 'ALL' ? PD : '#e2e8f0' }
              }}
            />
            <Chip
              label={`Listed Online (${onlineCount})`}
              size="small"
              clickable
              onClick={() => setFilterTab('ONLINE')}
              sx={{
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: filterTab === 'ONLINE' ? '#059669' : '#f1f5f9',
                color: filterTab === 'ONLINE' ? '#ffffff' : '#475569',
                '&:hover': { bgcolor: filterTab === 'ONLINE' ? '#047857' : '#e2e8f0' }
              }}
            />
            <Chip
              label={`Offline Only (${offlineCount})`}
              size="small"
              clickable
              onClick={() => setFilterTab('OFFLINE')}
              sx={{
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: filterTab === 'OFFLINE' ? '#ea580c' : '#f1f5f9',
                color: filterTab === 'OFFLINE' ? '#ffffff' : '#475569',
                '&:hover': { bgcolor: filterTab === 'OFFLINE' ? '#c2410c' : '#e2e8f0' }
              }}
            />
          </Stack>
        </Box>

        {/* Product Cards or Empty State */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: P }} />
            <Typography variant="body2" color={MUT} sx={{ mt: 1.5, fontWeight: 600 }}>Loading catalog products…</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Card elevation={0} sx={{ border: `1.5px dashed ${BOR}`, borderRadius: '20px', bgcolor: '#ffffff', py: 7, px: 3, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
              <ProductIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: TXT, mb: 0.5 }}>
              {search ? 'No matching products' : 'No products found'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 440, mx: 'auto', mb: 2.5 }}>
              {search 
                ? 'Try a different search keyword or switch the filter.' 
                : 'Add products to your store inventory and easily toggle them for online ordering & customer delivery.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/business/inventory')}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: P,
                borderRadius: '12px',
                px: 3.5,
                py: 1.1,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: PD }
              }}
            >
              Go to Inventory Manager
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {filtered.map(p => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                <ProductCard
                  product={p}
                  onToggleOnline={handleToggleOnline}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Info banner */}
        <Alert severity="info" sx={{ mt: 3, borderRadius: '12px', border: '1px solid #bae6fd', bgcolor: '#f0f9ff' }}>
          <Typography variant="body2" sx={{ color: '#0369a1' }}>
            <strong>How it works:</strong> Toggle <strong>List Online</strong> on any product to publish or unpublish it from customer online delivery. Products must have positive stock quantity to be purchased by online customers.
          </Typography>
        </Alert>
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
                  sx={{ '& .MuiSwitch-track': { bgcolor: editForm.online_delivery ? P : MUT } }} />
              }
              label={<Typography variant="body2">List Online</Typography>}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: MUT }}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleSaveEdit}
            sx={{ bgcolor: P, '&:hover': { bgcolor: PD }, borderRadius: 2, px: 3 }}>
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
