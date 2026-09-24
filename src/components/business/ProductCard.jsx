import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import {
  FavoriteBorder as HeartOutlineIcon,
  Favorite as HeartFilledIcon,
  AddShoppingCart as CartIcon,
  ShoppingBag as PlaceholderIcon,
  Check as AddedIcon
} from '@mui/icons-material';
import { T, cardHoverSx, primaryBtnSx, pillBadgeSx } from '../../theme/tokens';

export default function ProductCard({
  product,
  onAddToCart,
  onClick,
  showSeller = true,
  variant = 'standard' // 'standard', 'compact', 'deals'
}) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const title = product.title || product.name || 'Product Item';
  const price = Number(product.price || product.mrp || 0);
  const mrp = Number(product.mrp || (price * 1.25));
  const discountPercent = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const image = product.image_url || product.image || product.shop_image || '';
  const category = product.category_name || product.category || 'General';
  const stock = product.stock_quantity ?? product.stock ?? product.stock_qty ?? 50;
  const seller = product.shop_name || product.business_name || product.merchant_name || 'Verified Merchant';
  const unit = product.unit || product.pack_size || (price > 500 ? '1 Pack' : '1 unit');

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const formattedPrice = `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
  const formattedMrp = mrp > price ? `₹${mrp.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          borderColor: '#10b981',
        }
      }}
    >
      {/* ── Product Image Container (Blinkit Style) ── */}
      <Box
        sx={{
          height: variant === 'compact' ? 130 : 155,
          bgcolor: '#f8fafc',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          p: 1.5,
        }}
      >
        {image ? (
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.06)' }
            }}
          />
        ) : (
          <PlaceholderIcon sx={{ fontSize: 44, color: '#cbd5e1' }} />
        )}

        {/* ⚡ Quick Dispatch / Wholesale Badge (Top-Left) */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              px: 0.8,
              py: 0.25,
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <Typography sx={{ fontSize: '9.5px', fontWeight: 800, color: '#059669', letterSpacing: '0.2px' }}>
              ⚡ 15-30 MINS
            </Typography>
          </Box>
        </Box>

        {/* Wishlist Heart (Top-Right) */}
        <IconButton
          size="small"
          onClick={handleLike}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            p: 0.5,
            color: liked ? '#ef4444' : '#94a3b8',
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.15)', color: '#ef4444' },
            transition: 'all 0.15s ease'
          }}
        >
          {liked ? <HeartFilledIcon sx={{ fontSize: 18 }} /> : <HeartOutlineIcon sx={{ fontSize: 18 }} />}
        </IconButton>

        {/* Discount Tag (Bottom-Left of Image) */}
        {discountPercent > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              bgcolor: '#10b981',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 900,
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
              letterSpacing: '0.2px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
            }}
          >
            {discountPercent}% OFF
          </Box>
        )}
      </Box>

      {/* ── Product Metadata ── */}
      <CardContent
        sx={{
          p: 1.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:last-child': { pb: 1.5 }
        }}
      >
        <Box>
          {/* Unit / Pack Size Tag */}
          <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: 700, mb: 0.3 }}>
            {unit}
          </Typography>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#0f172a',
              lineHeight: 1.3,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.4em',
            }}
          >
            {title}
          </Typography>

          {/* Seller / Store Tag */}
          {showSeller && (
            <Typography
              sx={{
                fontSize: '10.5px',
                color: '#64748b',
                fontWeight: 600,
                mb: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
              }}
              noWrap
            >
              <Box component="span" sx={{ color: '#059669' }}>✓</Box> {seller}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          {/* Price & Blinkit ADD Button Row */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {/* Price Column */}
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                {formattedPrice}
              </Typography>
              {formattedMrp && (
                <Typography sx={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600, mt: 0.2 }}>
                  {formattedMrp}
                </Typography>
              )}
            </Box>

            {/* Blinkit Style ADD / ADDED Stepper Button */}
            {stock <= 0 ? (
              <Box sx={{ px: 1.2, py: 0.6, bgcolor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#ef4444' }}>
                  Out of Stock
                </Typography>
              </Box>
            ) : (
              <Button
                size="small"
                onClick={handleAdd}
                sx={{
                  bgcolor: added ? '#059669' : '#f0fdf4',
                  color: added ? '#ffffff' : '#059669',
                  border: `1.5px solid ${added ? '#059669' : '#10b981'}`,
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  px: added ? 1.5 : 2,
                  py: 0.5,
                  minWidth: '68px',
                  height: '34px',
                  boxShadow: added ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#059669',
                    color: '#ffffff',
                    borderColor: '#059669',
                    transform: 'scale(1.03)',
                  }
                }}
              >
                {added ? 'ADDED ✓' : 'ADD +'}
              </Button>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
