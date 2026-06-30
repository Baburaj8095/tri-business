import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, InputBase, IconButton, Stack, Container, CircularProgress } from '@mui/material';
import { 
  LuChevronLeft, 
  LuSearch, 
  LuStore, 
  LuShoppingCart, 
  LuSmartphone, 
  LuHotel, 
  LuZap 
} from 'react-icons/lu';
import NearbyStoreCard from './NearbyStoreCard.jsx';
import { getPublicB2bMerchants, getMerchantCategories } from '../../api/api';

const getCategoryIcon = (name) => {
  const value = String(name || '').toLowerCase();
  if (value.includes('grocery') || value.includes('kirana') || value.includes('food')) return <LuShoppingCart size={22} />;
  if (value.includes('mobile') || value.includes('phone')) return <LuSmartphone size={22} />;
  if (value.includes('hotel') || value.includes('restaurant') || value.includes('eat')) return <LuHotel size={22} />;
  if (value.includes('electronics') || value.includes('appliance')) return <LuZap size={22} />;
  return <LuStore size={22} />;
};

const resolveCategoryName = (shop) => {
  const raw = shop?.category;
  if (raw && typeof raw === 'object') {
    return raw.name || raw.title || raw.label || 'Retail Store';
  }
  return shop?.category_name || shop?.business_category || shop?.business_type || shop?.subcategory_name || (raw ? String(raw) : 'Retail Store');
};

export default function NearbyStoresPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([{ name: 'All Stores', icon: <LuStore size={22} /> }]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPublicB2bMerchants(),
      getMerchantCategories()
    ])
      .then(([merchantsRes, categoriesRes]) => {
        const data = merchantsRes || [];
        const mapped = data.map(shop => ({
          id: shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'B2B Merchant',
          category: resolveCategoryName(shop),
          rating: '4.5',
          location: shop.city || shop.address || 'Local Area',
          distance: 'Nearby',
          status: 'Open now',
          image: shop.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
        }));
        setStores(mapped);
        setFilteredStores(mapped);

        const cats = categoriesRes || [];
        setCategories([
          { name: 'All Stores', icon: <LuStore size={22} /> },
          ...cats.map(cat => ({ name: cat.name, icon: getCategoryIcon(cat.name) }))
        ]);
      })
      .catch(err => console.error('Failed to load B2B merchants & categories:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = stores;

    // Filter by Category
    if (activeCat !== 'All Stores') {
      result = result.filter(s => {
        const catName = s.category.toLowerCase();
        const activeName = activeCat.toLowerCase();
        if (activeName === 'grocery') return catName.includes('grocery') || catName.includes('basket') || catName.includes('needs');
        if (activeName === 'mobile') return catName.includes('mobile') || catName.includes('phone');
        if (activeName === 'hotel') return catName.includes('hotel') || catName.includes('restaurant') || catName.includes('eat');
        if (activeName === 'electronics') return catName.includes('electronics') || catName.includes('appliance');
        return catName.includes(activeName);
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.location.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q)
      );
    }

    setFilteredStores(result);
  }, [activeCat, searchQuery, stores]);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 6 }}>
      {/* Top sticky header */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', sticky: 'top', zIndex: 10, py: 1.5 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton 
                onClick={() => navigate('/business-dashboard')} 
                sx={{ bgcolor: '#f1f5f9', color: '#0f172a', '&:hover': { bgcolor: '#cbd5e1' } }}
              >
                <LuChevronLeft size={20} />
              </IconButton>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.2 }}>
                  Near Store
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Explore B2B stores nearby
                </Typography>
              </Box>
            </Stack>
            <LuStore size={22} color="#228B22" />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: 3 }}>
        {/* Search Bar */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', p: 1.5, mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', borderRadius: '12px', px: 2, py: 1.25 }}>
            <LuSearch color="#64748b" size={18} />
            <InputBase 
              placeholder="Search nearby stores..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ ml: 1.5, flex: 1, fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }} 
            />
          </Box>
        </Box>

        {/* Categories Horizontal Scroll */}
        <Box sx={{ bgcolor: '#fff', py: 2, px: 1, borderRadius: '16px', border: '1px solid #e2e8f0', mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <Stack direction="row" spacing={2.5} sx={{ overflowX: 'auto', px: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {categories.map(cat => (
              <Box 
                key={cat.name} 
                onClick={() => setActiveCat(cat.name)}
                sx={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, 
                  width: '90px', flexShrink: 0, cursor: 'pointer',
                  color: activeCat === cat.name ? '#228B22' : '#64748b'
                }}
              >
                <Box sx={{ 
                  width: 48, height: 48, borderRadius: '12px', border: '1px solid',
                  borderColor: activeCat === cat.name ? '#228B22' : '#e2e8f0',
                  display: 'grid', placeItems: 'center',
                  bgcolor: activeCat === cat.name ? 'rgba(34, 139, 34, 0.08)' : '#f8fafc',
                  transition: 'all 0.2s',
                  boxShadow: activeCat === cat.name ? '0 4px 10px rgba(34,139,34,0.1)' : 'none'
                }}>
                  {cat.icon}
                </Box>
                <Typography 
                  align="center"
                  sx={{ 
                    fontSize: '0.72rem', 
                    fontWeight: activeCat === cat.name ? 800 : 600, 
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '2.4em',
                    mt: 0.25
                  }}
                >
                  {cat.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Store List */}
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 2, color: '#0f172a' }}>
            Stores near you <Typography component="span" sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>({filteredStores.length} found)</Typography>
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="success" />
            </Box>
          ) : filteredStores.length === 0 ? (
            <Box sx={{ p: 4, bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography sx={{ color: '#64748b', fontWeight: 700 }}>No matching stores found.</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>Try broadening your search query or selecting a different category.</Typography>
            </Box>
          ) : (
            filteredStores.map((store) => (
              <NearbyStoreCard key={store.id} store={store} />
            ))
          )}
        </Box>
      </Container>
    </Box>
  );
}
