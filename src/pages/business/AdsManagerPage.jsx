import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Drawer,
  TextField, MenuItem, IconButton, Avatar, Divider, Switch,
  FormControlLabel, Alert, CircularProgress, Snackbar,
  Grid, Tooltip, InputAdornment
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  Image as ImageIcon,
  Storefront as StoreIcon,
  ShoppingBag as ProductIcon,
  Public as B2CIcon,
  Business as B2BIcon,
  LocalOffer as OfferIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Visibility as PreviewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMerchantProfile } from '../../api/api';
import AppShell from '../../components/layout/AppShell';

/* ─── Design tokens (match BusinessDashboard) ─────────────────────────────── */
const P  = '#228B22';
const PD = '#1B4D3E';
const BG = '#f1f5f9';
const SUR = '#ffffff';
const TXT = '#0f172a';
const MUT = '#94a3b8';
const BOR = '#e2e8f0';
const ERR = '#ef4444';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

/* ─── Constants ───────────────────────────────────────────────────────────── */
const AD_TYPES = [
  { value: 'BANNER',           label: 'Banner Ad',         icon: <ImageIcon fontSize="small" />,   desc: 'Full-width image banner at top of page' },
  { value: 'SPONSORED_SHOP',   label: 'Sponsored Shop',    icon: <StoreIcon fontSize="small" />,   desc: 'Highlight your shop in the sponsored carousel' },
  { value: 'FEATURED_PRODUCT', label: 'Featured Product',  icon: <ProductIcon fontSize="small" />, desc: 'Showcase a product in the featured grid' },
];

const DISPLAY_TARGETS = [
  {
    value: 'CONSUMER_ONLINE_B2C',
    label: 'Consumer App — Online Store',
    badge: 'B2C Online',
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: <B2CIcon fontSize="small" />,
    desc: 'Shown in the consumer Online Shop page (banners, featured products)',
  },
  {
    value: 'CONSUMER_NEARBY_B2C',
    label: 'Consumer App — Nearby Stores',
    badge: 'B2C Nearby',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: <StoreIcon fontSize="small" />,
    desc: 'Shown as sponsored shops in the consumer Nearby Stores section',
  },
  {
    value: 'CONSUMER_TRIZONE_B2C',
    label: 'Consumer App — TriZone',
    badge: 'TriZone B2C',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: <OfferIcon fontSize="small" />,
    desc: 'Shown inside the TriZone consumer section',
  },
  {
    value: 'BUSINESS_ONLINE_B2B',
    label: 'Business Platform — Online B2B',
    badge: 'B2B Online',
    color: '#f97316',
    bg: '#fff7ed',
    icon: <B2BIcon fontSize="small" />,
    desc: 'Shown on the Business Dashboard Online B2B ads section (visible to other merchants)',
  },
  {
    value: 'BUSINESS_OFFLINE_B2B',
    label: 'Business Platform — Offline B2B',
    badge: 'B2B Offline',
    color: '#eab308',
    bg: '#fef9c3',
    icon: <B2BIcon fontSize="small" />,
    desc: 'Shown on the Business Dashboard Offline B2B ads section (visible to other merchants)',
  },
];

const BLANK_FORM = {
  ad_type:        'BANNER',
  title:          '',
  description:    '',
  image_url:      '',
  target_url:     '',
  display_target: 'CONSUMER_ONLINE_B2C',
  priority:       10,
  shop_id:        '',
  product_id:     '',
  valid_from:     '',
  valid_to:       '',
  is_active:      true,
};

/* ─── Helper ──────────────────────────────────────────────────────────────── */
function targetInfo(val) {
  return DISPLAY_TARGETS.find(t => t.value === val) || DISPLAY_TARGETS[0];
}
function typeInfo(val) {
  return AD_TYPES.find(t => t.value === val) || AD_TYPES[0];
}

/* ─── Ad Preview Card ─────────────────────────────────────────────────────── */
function AdCard({ ad, onEdit, onDelete, onToggle }) {
  const t = targetInfo(ad.display_target);
  const ty = typeInfo(ad.ad_type);
  return (
    <Card 
      sx={{ 
        borderRadius: '18px', 
        border: `1px solid ${BOR}`, 
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        bgcolor: SUR,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          transform: 'translateY(-2px)',
          borderColor: '#cbd5e1'
        }
      }}
    >
      {/* Image strip */}
      <Box
        sx={{
          height: 140,
          background: ad.image_url 
            ? `url(${ad.image_url}) center/cover no-repeat` 
            : 'linear-gradient(135deg, #1B4D3E 0%, #143d31 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!ad.image_url && (
          <CampaignIcon sx={{ fontSize: 44, color: 'rgba(255,255,255,0.25)' }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))' }} />
        <Chip
          size="small"
          label={ad.is_active ? 'LIVE' : 'PAUSED'}
          sx={{
            position: 'absolute', top: 12, right: 12,
            fontWeight: 800, fontSize: '0.68rem', letterSpacing: 0.5,
            bgcolor: ad.is_active ? '#10b981' : '#64748b', color: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        />
      </Box>
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: TXT, mb: 0.5 }}>
              {ad.title}
            </Typography>
            {ad.description && (
              <Typography sx={{ fontSize: '0.82rem', color: MUT, mb: 1, lineHeight: 1.4 }}>
                {ad.description}
              </Typography>
            )}
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={ty.label}
                icon={ty.icon}
                sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#f8fafc', color: TXT }}
              />
              <Chip
                size="small"
                label={t.badge}
                sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: t.bg, color: t.color }}
              />
              <Chip
                size="small"
                label={`Priority: ${ad.priority}`}
                sx={{ fontWeight: 600, fontSize: '0.7rem', color: MUT, bgcolor: '#f8fafc' }}
              />
            </Stack>
          </Box>
          <Stack spacing={0.5} alignItems="flex-end">
            <Tooltip title={ad.is_active ? 'Pause ad' : 'Activate ad'}>
              <IconButton
                size="small"
                onClick={() => onToggle(ad.id, !ad.is_active)}
                sx={{ color: ad.is_active ? P : MUT }}
              >
                {ad.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(ad)} sx={{ color: '#3b82f6' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(ad.id)} sx={{ color: ERR }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        {(ad.valid_from || ad.valid_to) && (
          <Typography sx={{ fontSize: '0.73rem', color: MUT, mt: 1 }}>
            {ad.valid_from ? `From: ${ad.valid_from?.slice(0, 10)}` : ''}
            {ad.valid_from && ad.valid_to ? ' · ' : ''}
            {ad.valid_to ? `Until: ${ad.valid_to?.slice(0, 10)}` : ''}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Image Preview ───────────────────────────────────────────────────────── */
function ImagePreview({ url }) {
  if (!url) return null;
  return (
    <Box
      sx={{
        mt: 1, height: 100, borderRadius: '12px',
        background: `url(${url}) center/cover no-repeat`,
        border: `1.5px solid ${BOR}`,
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export default function AdsManagerPage() {
  const navigate = useNavigate();

  const [ads, setAds]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId]         = useState(null); // null = create, number = edit
  const [form, setForm]             = useState(BLANK_FORM);
  const [toast, setToast]           = useState({ open: false, msg: '', type: 'success' });
  const [deleteId, setDeleteId]     = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  const [profile, setProfile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [expiryDays, setExpiryDays] = useState('');

  const token = localStorage.getItem('token_business');

  const getSelectableTargets = useCallback(() => {
    if (!profile) return DISPLAY_TARGETS;
    const isB2B = profile.category === 'merchant' || profile.category === 'merchant_business';
    const serviceMode = profile.service_mode || 'OFFLINE';
    
    const targets = [];
    if (isB2B) {
      if (serviceMode === 'ONLINE' || serviceMode === 'BOTH') {
        targets.push(DISPLAY_TARGETS.find(t => t.value === 'BUSINESS_ONLINE_B2B'));
      }
      if (serviceMode === 'OFFLINE' || serviceMode === 'BOTH') {
        targets.push(DISPLAY_TARGETS.find(t => t.value === 'BUSINESS_OFFLINE_B2B'));
      }
    } else {
      if (serviceMode === 'ONLINE' || serviceMode === 'BOTH') {
        targets.push(DISPLAY_TARGETS.find(t => t.value === 'CONSUMER_ONLINE_B2C'));
        targets.push(DISPLAY_TARGETS.find(t => t.value === 'CONSUMER_TRIZONE_B2C'));
      }
      if (serviceMode === 'OFFLINE' || serviceMode === 'BOTH') {
        targets.push(DISPLAY_TARGETS.find(t => t.value === 'CONSUMER_NEARBY_B2C'));
      }
    }
    return targets.filter(Boolean);
  }, [profile]);

  /* ── Fetch my ads ─────────────────────────────────────────────────────── */
  const loadAds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/merchant/ads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      } else {
        showToast('Failed to load ads', 'error');
      }
    } catch {
      showToast('Network error loading ads', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadAds();
    getMerchantProfile()
      .then(p => {
        setProfile(p);
        // Set default display target based on service mode and category
        const isB2B = p.category === 'merchant' || p.category === 'merchant_business';
        const serviceMode = p.service_mode || 'OFFLINE';
        if (isB2B) {
          setForm(f => ({ ...f, display_target: serviceMode === 'ONLINE' ? 'BUSINESS_ONLINE_B2B' : 'BUSINESS_OFFLINE_B2B' }));
        } else {
          setForm(f => ({ ...f, display_target: serviceMode === 'ONLINE' ? 'CONSUMER_ONLINE_B2C' : 'CONSUMER_NEARBY_B2C' }));
        }
      })
      .catch(err => {
        console.error('Error fetching profile in AdsManagerPage:', err);
      });
  }, [loadAds, navigate, token]);

  /* ── Dialog helpers ───────────────────────────────────────────────────── */
  const openCreate = () => {
    setEditId(null);
    setImageFile(null);
    setExpiryDays('');
    // Pick default based on profile
    let defaultTarget = 'CONSUMER_ONLINE_B2C';
    if (profile) {
      const isB2B = profile.category === 'merchant' || profile.category === 'merchant_business';
      const serviceMode = profile.service_mode || 'OFFLINE';
      if (isB2B) {
        defaultTarget = serviceMode === 'ONLINE' ? 'BUSINESS_ONLINE_B2B' : 'BUSINESS_OFFLINE_B2B';
      } else {
        defaultTarget = serviceMode === 'ONLINE' ? 'CONSUMER_ONLINE_B2C' : 'CONSUMER_NEARBY_B2C';
      }
    }
    setForm({
      ...BLANK_FORM,
      display_target: defaultTarget
    });
    setExpiryDays('1'); // Default to 1 day duration
    setDialogOpen(true);
  };

  const openEdit = (ad) => {
    setEditId(ad.id);
    setForm({
      ad_type:        ad.ad_type || 'BANNER',
      title:          ad.title || '',
      description:    ad.description || '',
      image_url:      ad.image_url || '',
      target_url:     ad.target_url || '',
      display_target: ad.display_target || 'CONSUMER_ONLINE_B2C',
      priority:       ad.priority ?? 10,
      shop_id:        ad.shop_id || '',
      product_id:     ad.product_id || '',
      valid_from:     ad.valid_from?.slice(0, 16) || '',
      valid_to:       ad.valid_to?.slice(0, 16) || '',
      is_active:      ad.is_active !== false,
    });
    setImageFile(null);
    
    // Calculate matched duration
    const diffMs = new Date(ad.valid_to).getTime() - new Date(ad.valid_from || new Date()).getTime();
    const diffDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
    const validDurations = ['1', '2', '3', '4', '5', '7', '9', '12', '15'];
    const matchedDuration = validDurations.includes(String(diffDays)) ? String(diffDays) : '1';
    setExpiryDays(matchedDuration);
    setDialogOpen(true);
  };

  const calculateValidTo = (fromStr, days) => {
    if (!days) return null;
    const baseDate = fromStr ? new Date(fromStr) : new Date();
    const expiryDate = new Date(baseDate.getTime() + Number(days) * 24 * 60 * 60 * 1000);
    // Format to YYYY-MM-DDTHH:MM
    const tzoffset = expiryDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(expiryDate.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  /* ── Save (create / update) ───────────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Post Name / Title is required', 'error'); return; }
    if (!editId && !imageFile) { showToast('Ad image file is required', 'error'); return; }
    setSaving(true);
    try {
      const url = editId
        ? `${CAPTAIN_API}/captain/merchant/ads/${editId}`
        : `${CAPTAIN_API}/captain/merchant/ads`;
      const method = editId ? 'PUT' : 'POST';

      // Compute dates: valid_from defaults to now if creating or missing
      let finalValidFrom = form.valid_from;
      if (!editId || !finalValidFrom) {
        const baseDate = new Date();
        const tzoffset = baseDate.getTimezoneOffset() * 60000;
        finalValidFrom = (new Date(baseDate.getTime() - tzoffset)).toISOString().slice(0, 16);
      }
      const finalValidTo = calculateValidTo(finalValidFrom, expiryDays || '1');

      const fd = new FormData();
      fd.append('ad_type', form.ad_type);
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      fd.append('target_url', form.target_url || '');
      fd.append('display_target', form.display_target);
      fd.append('priority', String(Number(form.priority) || 10));
      if (form.shop_id) fd.append('shop_id', String(form.shop_id));
      if (form.product_id) fd.append('product_id', String(form.product_id));
      fd.append('valid_from', finalValidFrom);
      fd.append('valid_to', finalValidTo);
      fd.append('is_active', String(form.is_active));

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (form.image_url) {
        fd.append('image_url', form.image_url);
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editId ? 'Ad updated!' : 'Ad created!', 'success');
        setDialogOpen(false);
        loadAds();
      } else {
        showToast(data.error || 'Failed to save ad', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ──────────────────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/merchant/ads/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Ad deleted', 'success');
        setAds(prev => prev.filter(a => a.id !== deleteId));
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  /* ── Toggle active ────────────────────────────────────────────────────── */
  const handleToggle = async (id, active) => {
    try {
      const res = await fetch(`${CAPTAIN_API}/captain/merchant/ads/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: active }),
      });
      if (res.ok) {
        setAds(prev => prev.map(a => a.id === id ? { ...a, is_active: active } : a));
        showToast(active ? 'Ad activated' : 'Ad paused', 'success');
      }
    } catch {
      showToast('Failed to toggle ad', 'error');
    }
  };

  const showToast = (msg, type = 'success') => setToast({ open: true, msg, type });

  /* ── Filter ──────────────────────────────────────────────────────────── */
  const filtered = activeFilter === 'ALL'
    ? ads
    : ads.filter(a => a.display_target === activeFilter);

  const counts = {};
  ads.forEach(a => { counts[a.display_target] = (counts[a.display_target] || 0) + 1; });

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <AppShell activeTab="/business/ads" title="Ads Manager">
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
        {/* Header Bar */}
        <Box sx={{ mb: 3.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: TXT, letterSpacing: '-0.02em', mb: 0.5 }}>
              Campaigns & Ads Manager
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: MUT, fontWeight: 500 }}>
              Promote your business across B2C Online, Nearby Stores, TriZone, and B2B wholesale channels.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              bgcolor: P,
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 14px rgba(34, 139, 34, 0.25)',
              '&:hover': { bgcolor: PD },
            }}
          >
            Create New Campaign
          </Button>
        </Box>

        {/* Top KPI Metrics Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BOR}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Campaigns
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: TXT, mt: 0.5, lineHeight: 1 }}>
                  {ads.length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: MUT, mt: 0.75 }}>
                  Across all channels
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BOR}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Live Ads
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', mt: 0.5, lineHeight: 1 }}>
                  {ads.filter(a => a.is_active).length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: MUT, mt: 0.75 }}>
                  Currently reaching buyers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BOR}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Paused Ads
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', mt: 0.5, lineHeight: 1 }}>
                  {ads.filter(a => !a.is_active).length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: MUT, mt: 0.75 }}>
                  Temporarily inactive
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BOR}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Targets
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6', mt: 0.5, lineHeight: 1 }}>
                  {new Set(ads.map(a => a.display_target)).size}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: MUT, mt: 0.75 }}>
                  Target audiences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Channel quick filter pills */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          <Chip
            label={`All Ads (${ads.length})`}
            onClick={() => setActiveFilter('ALL')}
            variant={activeFilter === 'ALL' ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 750,
              bgcolor: activeFilter === 'ALL' ? P : '#ffffff',
              color: activeFilter === 'ALL' ? '#ffffff' : TXT,
              borderColor: activeFilter === 'ALL' ? P : BOR,
              '&:hover': { bgcolor: activeFilter === 'ALL' ? PD : '#f1f5f9' },
            }}
          />
          {getSelectableTargets().map(dt => (
            <Chip
              key={dt.value}
              icon={dt.icon}
              label={`${dt.badge} (${counts[dt.value] || 0})`}
              onClick={() => setActiveFilter(activeFilter === dt.value ? 'ALL' : dt.value)}
              sx={{
                fontWeight: 700,
                bgcolor: activeFilter === dt.value ? dt.bg : '#ffffff',
                color: activeFilter === dt.value ? dt.color : TXT,
                border: `1.5px solid ${activeFilter === dt.value ? dt.color : BOR}`,
                '&:hover': { borderColor: dt.color },
              }}
            />
          ))}
        </Stack>

        {/* Ads Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: P }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Card sx={{ borderRadius: '20px', border: `1px dashed ${BOR}`, boxShadow: 'none', py: 8, textAlign: 'center', bgcolor: SUR }}>
            <CardContent>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(34, 139, 34, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <CampaignIcon sx={{ fontSize: 32, color: P }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: TXT, mb: 0.5 }}>
                {activeFilter === 'ALL' ? 'No promotional campaigns yet' : `No ${targetInfo(activeFilter).badge} campaigns`}
              </Typography>
              <Typography sx={{ color: MUT, fontSize: '0.9rem', maxWidth: 440, mx: 'auto', mb: 3 }}>
                Launch a campaign now to feature your shops and products across the Trikonekt consumer and merchant apps.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ bgcolor: P, fontWeight: 800, textTransform: 'none', borderRadius: '12px', px: 3, py: 1.2, '&:hover': { bgcolor: PD } }}
              >
                Create First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(ad => (
              <Grid item xs={12} sm={6} lg={4} key={ad.id}>
                <AdCard
                  ad={ad}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onToggle={handleToggle}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ── Create / Edit Ad Bottom Drawer ── */}
      <Drawer
        anchor="bottom"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '92vh',
            bgcolor: SUR,
            p: { xs: 2.5, sm: 3.5 },
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: TXT }}>
              {editId ? '✏️ Edit Ad Campaign' : '📢 Create New Ad'}
            </Typography>
            <Typography variant="caption" sx={{ color: MUT, fontWeight: 500 }}>
              Launch targeted marketing banners across B2C & B2B channels
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)} sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ px: { xs: 0, sm: 1 }, py: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>

            {/* Ad Type */}
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: MUT, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ad Format
              </Typography>
              <Grid container spacing={1}>
                {AD_TYPES.map(ty => (
                  <Grid item xs={4} key={ty.value}>
                    <Box
                      onClick={() => setForm(f => ({ ...f, ad_type: ty.value }))}
                      sx={{
                        p: 1.5, borderRadius: '12px', border: '1.5px solid',
                        borderColor: form.ad_type === ty.value ? P : BOR,
                        bgcolor: form.ad_type === ty.value ? 'rgba(34,139,34,0.06)' : SUR,
                        cursor: 'pointer', textAlign: 'center',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: P },
                      }}
                    >
                      <Box sx={{ color: form.ad_type === ty.value ? P : MUT, mb: 0.25 }}>{ty.icon}</Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: form.ad_type === ty.value ? P : TXT, lineHeight: 1.2 }}>
                        {ty.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Display Target */}
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: MUT, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Display Target — Where will this ad appear?
              </Typography>
              <Stack spacing={1}>
                {getSelectableTargets().map(dt => (
                  <Box
                    key={dt.value}
                    onClick={() => setForm(f => ({ ...f, display_target: dt.value }))}
                    sx={{
                      p: 1.5, borderRadius: '12px', border: '1.5px solid',
                      borderColor: form.display_target === dt.value ? dt.color : BOR,
                      bgcolor: form.display_target === dt.value ? dt.bg : SUR,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: dt.color },
                    }}
                  >
                    <Box sx={{ color: dt.color, display: 'flex', alignItems: 'center' }}>{dt.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: TXT, lineHeight: 1.2 }}>
                        {dt.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: MUT, lineHeight: 1.3 }}>
                        {dt.desc}
                      </Typography>
                    </Box>
                    {form.display_target === dt.value && (
                      <Chip size="small" label="Selected" sx={{ bgcolor: dt.color, color: '#fff', fontWeight: 800, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Core fields */}
            <TextField
              label="Post Name / Title *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              fullWidth
              size="small"
              inputProps={{ maxLength: 120 }}
              sx={inputSx}
            />

            <TextField
              label="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              size="small"
              inputProps={{ maxLength: 400 }}
              sx={inputSx}
            />

            {/* Media Upload */}
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: MUT, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Upload Post Media (Photo / Motion Graphic)
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={<ImageIcon />}
                  sx={{ textTransform: 'none', color: P, borderColor: P, '&:hover': { borderColor: PD, bgcolor: 'rgba(34,139,34,0.04)' } }}
                >
                  Choose File
                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                        setForm(f => ({ ...f, image_url: '' }));
                      }
                    }}
                  />
                </Button>
                <Typography sx={{ fontSize: '0.85rem', color: imageFile ? TXT : MUT, flex: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {imageFile ? imageFile.name : 'No file chosen'}
                </Typography>
                {imageFile && (
                  <IconButton size="small" onClick={() => setImageFile(null)} sx={{ color: ERR }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
              {imageFile && (
                <Box
                  sx={{
                    mt: 1.5, height: 100, borderRadius: '12px',
                    background: `url(${URL.createObjectURL(imageFile)}) center/cover no-repeat`,
                    border: `1.5px solid ${BOR}`,
                  }}
                />
              )}
            </Box>

            {form.image_url && <ImagePreview url={form.image_url} />}

            <TextField
              label="Click-through URL (optional)"
              value={form.target_url}
              onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))}
              fullWidth
              size="small"
              placeholder="https://..."
              sx={inputSx}
            />

            {/* Priority */}
            <TextField
              label="Priority (lower = shown first)"
              type="number"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              fullWidth
              size="small"
              inputProps={{ min: 1, max: 100 }}
              sx={inputSx}
            />

            {/* Optional IDs */}
            {(form.ad_type === 'SPONSORED_SHOP' || form.ad_type === 'BANNER') && (
              <TextField
                label="Linked Shop ID (optional)"
                value={form.shop_id}
                onChange={e => setForm(f => ({ ...f, shop_id: e.target.value }))}
                fullWidth
                size="small"
                type="number"
                sx={inputSx}
              />
            )}
            {form.ad_type === 'FEATURED_PRODUCT' && (
              <TextField
                label="Linked Product ID (optional)"
                value={form.product_id}
                onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                fullWidth
                size="small"
                type="number"
                sx={inputSx}
              />
            )}

            {/* Ad Duration */}
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: MUT, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ad Duration
              </Typography>
              <TextField
                select
                label="Select Duration"
                value={expiryDays}
                onChange={e => setExpiryDays(e.target.value)}
                fullWidth
                size="small"
                sx={inputSx}
              >
                <MenuItem value="1">1 Day (24 hours)</MenuItem>
                <MenuItem value="2">2 Days</MenuItem>
                <MenuItem value="3">3 Days</MenuItem>
                <MenuItem value="4">4 Days</MenuItem>
                <MenuItem value="5">5 Days</MenuItem>
                <MenuItem value="7">7 Days</MenuItem>
                <MenuItem value="9">9 Days</MenuItem>
                <MenuItem value="12">12 Days</MenuItem>
                <MenuItem value="15">15 Days</MenuItem>
              </TextField>
            </Box>

            {/* Active toggle (only in edit mode) */}
            {editId && (
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    sx={{ '& .MuiSwitch-thumb': { bgcolor: P }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: P } }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: TXT }}>
                    {form.is_active ? 'Ad is Live' : 'Ad is Paused'}
                  </Typography>
                }
              />
            )}
          </Stack>

          {/* Bottom Actions Sticky / Bar */}
          <Stack direction="row" spacing={2} sx={{ pt: 3, pb: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setDialogOpen(false)}
              sx={{
                flex: 1,
                fontWeight: 700,
                textTransform: 'none',
                color: MUT,
                borderColor: BOR,
                borderRadius: '12px',
                py: 1.3
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                flex: 2,
                bgcolor: P,
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: '12px',
                py: 1.3,
                boxShadow: '0 4px 14px rgba(34, 139, 34, 0.25)',
                '&:hover': { bgcolor: PD },
              }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : (editId ? 'Update Ad' : 'Create Ad')}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: '16px', m: 2, maxWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pt: 2.5, pb: 0 }}>Delete Ad?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: MUT, fontSize: '0.9rem', mt: 1 }}>
            This will permanently remove the ad and stop it from showing to users.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ fontWeight: 700, textTransform: 'none', color: MUT }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            sx={{ bgcolor: ERR, fontWeight: 800, textTransform: 'none', borderRadius: '10px', '&:hover': { bgcolor: '#dc2626' } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.type}
          onClose={() => setToast(t => ({ ...t, open: false }))}
          sx={{ fontWeight: 700, borderRadius: '12px' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}

/* ── Input style ─────────────────────────────────────────────────────────── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': { borderColor: BOR },
    '&:hover fieldset': { borderColor: P },
    '&.Mui-focused fieldset': { borderColor: P, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { '&.Mui-focused': { color: P } },
};
