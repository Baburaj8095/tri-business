import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  Divider,
  Container,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Badge,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  ChatBubbleOutline as ChatIcon,
  InfoOutlined as InfoIcon,
  Directions as DirectionsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Verified as VerifiedIcon,
  ShoppingBag as BagIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getPublicB2bMerchants, listShopProductsPublic } from '../../api/api';
import AppShell from '../../components/layout/AppShell';

const CART_KEY = 'tri_business_b2b_cart';

function readB2BCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeB2BCart(cart) {
  try {
    if (!cart || !cart.items || cart.items.length === 0) {
      localStorage.removeItem(CART_KEY);
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    window.dispatchEvent(new Event('tri_business_cart_updated'));
  } catch (e) {
    console.error('Failed to write cart:', e);
  }
}

const SAMPLE_STORE_PRODUCTS = [
  {
    id: 101,
    title: 'Amul Taaza Toned Fresh Milk',
    packSize: '500 ml Pouch',
    price: 27,
    mrp: 30,
    category: 'Dairy, Bread & Eggs',
    deliveryMins: '10-15 mins',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 102,
    title: 'Amul Malai Fresh Paneer',
    packSize: '200 g Block',
    price: 88,
    mrp: 96,
    category: 'Dairy, Bread & Eggs',
    deliveryMins: '10-15 mins',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 103,
    title: 'Aashirvaad Shudh Chakki Atta',
    packSize: '5 kg Bag',
    price: 245,
    mrp: 290,
    category: 'Atta, Rice & Dal',
    deliveryMins: '15-20 mins',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 104,
    title: 'Fortune Sunlite Refined Sunflower Oil',
    packSize: '1 Litre Pouch',
    price: 135,
    mrp: 165,
    category: 'Atta, Rice & Dal',
    deliveryMins: '15-20 mins',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 105,
    title: 'Fresh Farm Red Onions',
    packSize: '1 kg',
    price: 38,
    mrp: 50,
    category: 'Vegetables & Fruits',
    deliveryMins: '10-15 mins',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 106,
    title: 'Fresh Hydroponic Tomatoes',
    packSize: '1 kg',
    price: 32,
    mrp: 45,
    category: 'Vegetables & Fruits',
    deliveryMins: '10-15 mins',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 107,
    title: 'Tata Tea Gold Leaf Tea',
    packSize: '500 g Pack',
    price: 275,
    mrp: 320,
    category: 'Snacks & Drinks',
    deliveryMins: '15-20 mins',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 108,
    title: 'Britannia Good Day Butter Cookies',
    packSize: '600 g Family Pack',
    price: 110,
    mrp: 140,
    category: 'Snacks & Drinks',
    deliveryMins: '10-15 mins',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
  },
];

const STORE_PHOTOS = [
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=400&q=80',
];

export default function ShopDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState({});
  const [b2bCart, setB2bCart] = useState(() => readB2BCart());

  useEffect(() => {
    setLoading(true);
    getPublicB2bMerchants()
      .then((res) => {
        const found = res?.find((s) => s.id.toString() === id);
        if (found) {
          setShop(found);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingProducts(true);
    listShopProductsPublic(id)
      .then((data) => {
        const arr = Array.isArray(data) ? data : data?.results || [];
        if (arr.length > 0) {
          const mapped = arr.map((p) => ({
            id: p.id,
            title: p.title || p.product_name || 'Wholesale Product',
            packSize: p.pack_size || p.unit || '1 unit',
            price: Number(p.price || 50),
            mrp: Number(p.mrp || p.price || 60),
            category: p.category_name || 'Retail Products',
            deliveryMins: '15-20 mins',
            image: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          }));
          setProducts(mapped);
        } else {
          setProducts(SAMPLE_STORE_PRODUCTS);
        }
      })
      .catch(() => setProducts(SAMPLE_STORE_PRODUCTS))
      .finally(() => setLoadingProducts(false));
  }, [id]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const getProductQtyInCart = (productId) => {
    if (!b2bCart?.items?.length) return 0;
    const item = b2bCart.items.find((i) => Number(i.productId) === Number(productId));
    return item ? Number(item.quantity || 0) : 0;
  };

  const handleAddToCart = (product) => {
    const existing = readB2BCart();
    let nextCart = existing;

    if (!nextCart) {
      nextCart = {
        shopId: Number(shop?.id || 1),
        sellerId: Number(shop?.sellerId || shop?.id || 1),
        shopName: shop?.shop_name || shop?.business_name || 'Trikonekt Store',
        items: [],
      };
    }

    const productId = Number(product.id);
    const existingItem = nextCart.items.find((item) => Number(item.productId) === productId);

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 0) + 1;
    } else {
      nextCart.items.push({
        productId,
        title: product.title,
        price: Number(product.price),
        mrp: Number(product.mrp || product.price),
        quantity: 1,
        packSize: product.packSize || '1 unit',
        image: product.image,
      });
    }

    writeB2BCart(nextCart);
    setB2bCart({ ...nextCart });
  };

  const handleDecrementCart = (productId) => {
    const existing = readB2BCart();
    if (!existing?.items?.length) return;

    const idNum = Number(productId);
    const item = existing.items.find((i) => Number(i.productId) === idNum);
    if (!item) return;

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      existing.items = existing.items.filter((i) => Number(i.productId) !== idNum);
    }

    writeB2BCart(existing);
    setB2bCart({ ...existing });
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const totalCartCount = (b2bCart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalCartSubtotal = (b2bCart?.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const lastAddedItem = b2bCart?.items?.length ? b2bCart.items[b2bCart.items.length - 1] : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (!shop) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', minHeight: '100vh', pt: 12 }}>
        <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '1.2rem' }}>Store not found</Typography>
        <Button onClick={() => navigate('/business/nearby-stores')} variant="contained" sx={{ bgcolor: '#047857', '&:hover': { bgcolor: '#065f46' } }}>
          Back to Nearby Stores
        </Button>
      </Box>
    );
  }

  const shopName = shop.shop_name || shop.business_name || shop.full_name || 'Store';
  const address = shop.address || shop.city || 'Local Area';
  const heroImage = shop.shop_image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80';

  return (
    <AppShell activeTab="/business/nearby-stores" title={shopName} hideHeader={true}>
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100%', pb: 12 }}>
        {/* 1. TOP HERO IMAGE WITH FLOATING BACK & SHARE BUTTONS (Matching Screen 13) */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: 210, sm: 270 }, overflow: 'hidden' }}>
          <Box
            component="img"
            src={heroImage}
            alt={shopName}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)',
            }}
          />

          {/* Floating Actions on Hero */}
          <Box
            sx={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(6px)',
                color: '#0f172a',
                p: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#ffffff' },
              }}
            >
              <BackIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <IconButton
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(6px)',
                color: '#0f172a',
                p: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#ffffff' },
              }}
            >
              <ShareIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 2. STORE MAIN OVERVIEW CARD (Overlaps Hero with Curved Top) */}
        <Container maxWidth="md" disableGutters sx={{ px: { xs: 2, sm: 3 }, mt: -3, position: 'relative', zIndex: 10 }}>
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '24px',
              p: { xs: 2.25, sm: 3 },
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
              mb: 2,
            }}
          >
            {/* Store Title */}
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', sm: '1.45rem' }, color: '#0f172a', lineHeight: 1.2, mb: 1 }}>
              {shopName}
            </Typography>

            {/* Badges Row: Rating • 5% Cashback • Verified */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
              <Box
                sx={{
                  bgcolor: '#047857',
                  color: '#ffffff',
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                }}
              >
                ★ 4.1
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                293 Ratings
              </Typography>
              <Chip
                label="5% Cashback"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                }}
              />
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#0891b2' }} />}
                label="Verified"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: '#ecfeff',
                  color: '#0891b2',
                  border: '1px solid #a5f3fc',
                }}
              />
            </Stack>

            {/* Subtitle / Category & Service */}
            <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, mb: 0.5 }}>
              {shop.category || 'Retail Store'} • 25 Years of Service
            </Typography>

            {/* Address & Distance */}
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 2 }}>
              {address} • 26 mins • 8.4 km
            </Typography>

            {/* Action Circles (Call, WhatsApp, AskAnything, Enquiry, Direction) */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                pt: 1.5,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              {[
                { icon: <PhoneIcon sx={{ fontSize: 20 }} />, label: 'Call', color: '#3b82f6' },
                { icon: <WhatsAppIcon sx={{ fontSize: 20 }} />, label: 'WhatsApp', color: '#22c55e' },
                { icon: <ChatIcon sx={{ fontSize: 20 }} />, label: 'AskAnything', color: '#8b5cf6' },
                { icon: <InfoIcon sx={{ fontSize: 20 }} />, label: 'Enquiry', color: '#f59e0b' },
                { icon: <DirectionsIcon sx={{ fontSize: 20 }} />, label: 'Direction', color: '#0284c7' },
              ].map((action, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.6,
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.15s ease',
                  }}
                  onClick={() => alert(`${action.label} clicked`)}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: `1.5px solid ${action.color}`,
                      color: action.color,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: `${action.color}10`,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569' }}>
                    {action.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* 3. STORE PHOTO THUMBNAILS CAROUSEL */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              overflowX: 'auto',
              pb: 1,
              mb: 2,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {STORE_PHOTOS.map((src, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 140,
                  minWidth: 140,
                  height: 95,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt={`Store photo ${idx + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Stack>

          {/* 4. BUSINESS SUMMARY BOX */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '20px',
              p: { xs: 2, sm: 2.5 },
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a', mb: 0.75 }}>
              Business Summary
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55 }}>
              Premium local merchant offering dynamic selections, fresh dairy & groceries, cashback rewards, and prompt wholesale fulfillment for local businesses and families.
            </Typography>
          </Box>

          {/* 5. CATEGORIES HORIZONTAL FILTER CHIPS */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              mb: 2,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  onClick={() => setActiveCategory(cat)}
                  sx={{
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.74rem',
                    bgcolor: isSelected ? '#047857' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1.5px solid #047857' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: isSelected ? '#065f46' : '#f8fafc',
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* 6. PRODUCTS SECTION — CLEANLY 2 PRODUCTS PER ROW */}
          <Box id="store-products-section" sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', mb: 1.5 }}>
              Store Products ({filteredProducts.length})
            </Typography>

            {loadingProducts ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress color="success" size={32} />
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                  No products found in this category
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                  gap: { xs: 1.25, sm: 2 },
                  width: '100%',
                }}
              >
                {filteredProducts.map((p) => {
                  const qtyInCart = getProductQtyInCart(p.id);
                  const isWish = wishlist[p.id];
                  const discountPct = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

                  return (
                    <Card
                      key={p.id}
                      elevation={0}
                      sx={{
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        bgcolor: '#ffffff',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                        '&:hover': {
                          borderColor: '#10b981',
                          boxShadow: '0 6px 18px rgba(16, 185, 129, 0.1)',
                        },
                      }}
                    >
                      {/* Wishlist Heart Icon */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.85)',
                          backdropFilter: 'blur(4px)',
                          zIndex: 2,
                          p: 0.5,
                          color: isWish ? '#ef4444' : '#94a3b8',
                          '&:hover': { bgcolor: '#ffffff' },
                        }}
                      >
                        {isWish ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                      </IconButton>

                      {/* Product Image Container (1:1 Ratio) */}
                      <Box
                        sx={{
                          height: { xs: 125, sm: 145 },
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f8fafc',
                          p: 1.25,
                          position: 'relative',
                        }}
                      >
                        <Box
                          component="img"
                          src={p.image}
                          alt={p.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                          }}
                          sx={{
                            maxHeight: { xs: 110, sm: 125 },
                            maxWidth: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </Box>

                      {/* Product Details */}
                      <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          {/* Pack Size Pill */}
                          <Box
                            sx={{
                              display: 'inline-block',
                              bgcolor: '#f1f5f9',
                              color: '#475569',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              px: 0.8,
                              py: 0.25,
                              borderRadius: '6px',
                              mb: 0.5,
                            }}
                          >
                            {p.packSize}
                          </Box>

                          {/* Title (2-Line Clamp) */}
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              lineHeight: 1.25,
                              height: '2.5em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 0.5,
                            }}
                          >
                            {p.title}
                          </Typography>

                          {/* Delivery ETA */}
                          <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                            ⏱ {p.deliveryMins}
                          </Typography>
                        </Box>

                        {/* Price & ADD / Quantity Stepper */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 0.5 }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                              ₹{p.price}
                            </Typography>
                            {p.mrp > p.price && (
                              <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                                ₹{p.mrp}
                              </Typography>
                            )}
                          </Box>

                          {/* Quick Commerce ADD / Stepper Button */}
                          {qtyInCart === 0 ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAddToCart(p)}
                              sx={{
                                borderRadius: '10px',
                                borderColor: '#10b981',
                                color: '#059669',
                                fontWeight: 900,
                                fontSize: '0.78rem',
                                px: 2,
                                py: 0.4,
                                minWidth: 64,
                                textTransform: 'uppercase',
                                bgcolor: '#ffffff',
                                boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
                                '&:hover': {
                                  bgcolor: '#ecfdf5',
                                  borderColor: '#059669',
                                },
                              }}
                            >
                              ADD
                            </Button>
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: '#10b981',
                                color: '#ffffff',
                                borderRadius: '10px',
                                px: 0.5,
                                py: 0.2,
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleDecrementCart(p.id)}
                                sx={{ color: '#ffffff', p: 0.25 }}
                              >
                                <RemoveIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, px: 0.75 }}>
                                {qtyInCart}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleAddToCart(p)}
                                sx={{ color: '#ffffff', p: 0.25 }}
                              >
                                <AddIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Container>

        {/* 7. FLOATING BOTTOM CART PILL OR SHOP FROM THIS STORE CTA */}
        {totalCartCount > 0 ? (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 74, sm: 80 },
              left: 0,
              right: 0,
              zIndex: 40,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              onClick={() => navigate('/business/online-marketplace/cart')}
              sx={{
                bgcolor: '#15803d',
                color: '#ffffff',
                borderRadius: '999px',
                px: 2,
                py: 1.15,
                boxShadow: '0 8px 24px rgba(21, 128, 61, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                cursor: 'pointer',
                maxWidth: 420,
                width: '100%',
                transition: 'transform 0.15s, background-color 0.15s',
                '&:hover': { bgcolor: '#166534', transform: 'scale(1.02)' },
              }}
            >
              {lastAddedItem?.image && (
                <Box
                  component="img"
                  src={lastAddedItem.image}
                  alt="Cart Preview"
                  sx={{ width: 34, height: 34, borderRadius: '8px', objectFit: 'cover', bgcolor: '#fff' }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, lineHeight: 1.1 }}>
                  View cart
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#bbf7d0', fontWeight: 700 }}>
                  {totalCartCount} items • ₹{totalCartSubtotal.toFixed(2)}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 74, sm: 80 },
              left: 0,
              right: 0,
              zIndex: 40,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                const el = document.getElementById('store-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                bgcolor: '#16a34a',
                color: '#ffffff',
                borderRadius: '999px',
                px: 3,
                py: 1.25,
                maxWidth: 420,
                width: '100%',
                fontWeight: 900,
                fontSize: '0.92rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
                '&:hover': { bgcolor: '#15803d' },
              }}
            >
              Shop from this Store
            </Button>
          </Box>
        )}
      </Box>
    </AppShell>
  );
}
