import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Stack, Button, Divider, Container, CircularProgress, Grid, Chip, Skeleton } from '@mui/material';
import { 
  LuChevronLeft, LuPhone, LuMessageCircle, 
  LuMessageSquare, LuInfo, LuMapPin, LuStar, LuShare2 
} from 'react-icons/lu';
import { getPublicB2bMerchants, listShopProductsPublic } from '../../api/api';

export default function ShopDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublicB2bMerchants()
      .then(res => {
        const found = res?.find(s => s.id.toString() === id);
        if (found) {
          setShop(found);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingProducts(true);
    listShopProductsPublic(id)
      .then(data => {
        const arr = Array.isArray(data) ? data : data?.results || [];
        setProducts(arr);
      })
      .catch(err => console.error("Failed to load products:", err))
      .finally(() => setLoadingProducts(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (!shop) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, color: '#475569', mb: 2 }}>Store not found</Typography>
        <Button onClick={() => navigate('/business/nearby-stores')} variant="contained" color="success">Back to stores</Button>
      </Box>
    );
  }

  const shopName = shop.shop_name || shop.business_name || shop.full_name || 'Store';
  const address = shop.address || shop.city || 'Local Area';

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      {/* Header Bar */}
      <Box sx={{ bgcolor: '#fff', py: 1.5, borderBottom: '1px solid #e2e8f0', sticky: 'top', zIndex: 10 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#f1f5f9', color: '#0f172a' }}>
                <LuChevronLeft size={20} />
              </IconButton>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>{shopName}</Typography>
            </Stack>
            <IconButton sx={{ bgcolor: '#f1f5f9', color: '#0f172a' }}><LuShare2 size={18} /></IconButton>
          </Stack>
        </Container>
      </Box>

      {/* Main Info */}
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', mb: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', mb: 0.75 }}>{shopName}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ bgcolor: '#10b981', color: '#fff', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              4.1 <LuStar size={12} fill="#fff" />
            </Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>293 Ratings</Typography>
          </Stack>

          <Typography sx={{ fontSize: '0.88rem', color: '#475569', mb: 0.5 }}>{address} • 26 min • 8.4 km</Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#64748b', mb: 3 }}>{shop.category || 'Retail Store'} • 25 Years of Service</Typography>

          {/* Action Circles */}
          <Stack direction="row" justifyContent="space-around" sx={{ mb: 3, pt: 1 }}>
            {[
              { icon: <LuPhone />, label: 'Call', color: '#3b82f6' },
              { icon: <LuMessageCircle />, label: 'WhatsApp', color: '#22c55e' },
              { icon: <LuMessageSquare />, label: 'Ask Anything', color: '#8b5cf6' },
              { icon: <LuInfo />, label: 'Enquiry', color: '#f59e0b' },
              { icon: <LuMapPin />, label: 'Direction', color: '#64748b' },
            ].map((action, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, cursor: 'pointer' }} onClick={() => alert(`${action.label} clicked`)}>
                <Box sx={{ width: 46, height: 46, borderRadius: '50%', border: `1.5px solid ${action.color}`, color: action.color, display: 'grid', placeItems: 'center', fontSize: '1.25rem', transition: 'all 0.2s', '&:hover': { bgcolor: `${action.color}15` } }}>
                  {action.icon}
                </Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>{action.label}</Typography>
              </Box>
            ))}
          </Stack>

          {/* Photos Horizontal Scroll */}
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {[1, 2, 3].map(i => (
              <Box key={i} sx={{ width: 150, minWidth: 150, height: 110, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={shop.shop_image || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=280&q=80`} alt="Shop Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Summary Box */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', mb: 3 }}>
          <Typography sx={{ fontWeight: 850, fontSize: '1.05rem', color: '#0f172a', mb: 1.5 }}>Business Summary</Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, mb: 2 }}>
            Premium local merchant offering dynamic selections, cashback rewards, and prompt customer services for Indiranagar residents.
            <Typography component="span" sx={{ color: '#228B22', fontWeight: 700, ml: 1, cursor: 'pointer' }}>more</Typography>
          </Typography>

          <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <LuMapPin size={18} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography sx={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                {address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <LuPhone size={18} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography sx={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                {shop.contact_number || '080 4040 4040'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Products Section */}
        <Box sx={{ mt: 3, bgcolor: '#fff', borderRadius: '16px', p: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <Typography sx={{ fontWeight: 850, fontSize: '1.05rem', color: '#0f172a', mb: 2.5 }}>Products Catalog</Typography>
          
          <Grid container spacing={2}>
            {loadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Grid item key={i} xs={6} sm={4}>
                  <Skeleton variant="rectangular" height={130} sx={{ borderRadius: '12px', mb: 1 }} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Grid>
              ))
            ) : products.length === 0 ? (
              <Grid item xs={12}>
                <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>No products available in this store.</Typography>
              </Grid>
            ) : (
              products.map((p) => (
                <Grid item key={p.id} xs={6} sm={4}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s', '&:hover': { borderColor: '#228B22', boxShadow: '0 4px 12px rgba(34, 139, 34, 0.05)' } }}>
                    {/* Image */}
                    <Box sx={{ height: 120, borderRadius: '8px', overflow: 'hidden', bgcolor: '#f8fafc', mb: 1.5, border: '1px solid #f1f5f9' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
                          No Image
                        </Box>
                      )}
                    </Box>
                    
                    {/* Details */}
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title}>
                      {p.title}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#228B22' }}>
                        ₹{Number(p.price).toFixed(2)}
                      </Typography>
                      {Number(p.discount_percent) > 0 && (
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                          ₹{Number(p.mrp).toFixed(2)}
                        </Typography>
                      )}
                      {Number(p.discount_percent) > 0 && (
                        <Typography sx={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 800 }}>
                          {Number(p.discount_percent).toFixed(0)}% OFF
                        </Typography>
                      )}
                    </Stack>
                    
                    <Stack direction="row" spacing={0.5} sx={{ mt: 'auto', flexWrap: 'wrap', gap: '4px' }}>
                      {p.online_delivery && (
                        <Chip label="Online" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe' }} />
                      )}
                      {p.offline_delivery && (
                        <Chip label="Offline" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' }} />
                      )}
                      <Chip 
                        label={p.stock_qty > 0 ? "In Stock" : "Out of Stock"} 
                        size="small" 
                        sx={{ 
                          height: 18, 
                          fontSize: '0.65rem', 
                          fontWeight: 800, 
                          bgcolor: p.stock_qty > 0 ? '#f1f5f9' : '#fffbeb', 
                          color: p.stock_qty > 0 ? '#475569' : '#d97706',
                          border: p.stock_qty > 0 ? '1px solid #e2e8f0' : '1px solid #fef3c7'
                        }} 
                      />
                    </Stack>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>

      {/* Sticky Bottom Actions */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#fff', p: 2, borderTop: '1px solid #e2e8f0', zIndex: 100 }}>
        <Container maxWidth="md">
          <Stack direction="row" spacing={2.5}>
            <Button variant="contained" sx={{ flex: 1, py: 1.25, bgcolor: '#228B22', textTransform: 'none', fontWeight: 800, borderRadius: '12px', boxShadow: 'none', '&:hover': { bgcolor: '#1B4D3E' } }} onClick={() => alert('Initiating Call')}>Call Now</Button>
            <Button variant="contained" sx={{ flex: 1, py: 1.25, bgcolor: '#0ea5e9', textTransform: 'none', fontWeight: 800, borderRadius: '12px', boxShadow: 'none', '&:hover': { bgcolor: '#0284c7' } }} onClick={() => alert('Initiating Enquiry')}>Enquire Now</Button>
            <Button variant="contained" sx={{ flex: 1, py: 1.25, bgcolor: '#22c55e', textTransform: 'none', fontWeight: 800, borderRadius: '12px', boxShadow: 'none', '&:hover': { bgcolor: '#16a34a' } }} onClick={() => alert('Opening WhatsApp chat')}>WhatsApp</Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
