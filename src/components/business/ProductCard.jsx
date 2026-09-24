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
  const price = product.price || product.mrp || 0;
  const image = product.image_url || product.image || product.shop_image || '';
  const category = product.category_name || product.category || 'General';
  const stock = product.stock_quantity ?? product.stock ?? product.stock_qty ?? 50;
  const seller = product.shop_name || product.business_name || product.merchant_name || 'Verified Merchant';
  const serviceMode = (product.service_mode || 'BOTH').toUpperCase();

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const formattedPrice = `₹${Number(price).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        ...cardHoverSx,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        borderRadius: T.radiusMd,
      }}
    >
      {/* ── Product Image Container ── */}
      <Box
        sx={{
          height: variant === 'compact' ? 140 : 170,
          bgcolor: '#F1F5F9',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {image ? (
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.04)' }
            }}
          />
        ) : (
          <PlaceholderIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
        )}

        {/* Channel / B2B Mode Badge (Top-Left) */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
          <Chip
            size="small"
            label={serviceMode === 'BOTH' ? 'BOTH' : serviceMode === 'ONLINE' ? 'ONLINE' : 'NEARBY'}
            sx={{
              bgcolor: serviceMode === 'BOTH' ? T.bothBg : serviceMode === 'ONLINE' ? T.b2cBg : T.b2bBg,
              color: serviceMode === 'BOTH' ? T.both : serviceMode === 'ONLINE' ? T.b2c : T.b2b,
              fontWeight: 800,
              fontSize: '0.68rem',
              borderRadius: '6px',
              height: 22,
              border: `1px solid ${serviceMode === 'BOTH' ? T.both + '33' : serviceMode === 'ONLINE' ? T.b2c + '33' : T.b2b + '33'}`
            }}
          />
        </Box>

        {/* Wishlist Heart (Top-Right) */}
        <IconButton
          size="small"
          onClick={handleLike}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            p: 0.6,
            color: liked ? T.error : T.textMuted,
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.1)' },
            transition: 'all 0.15s ease'
          }}
        >
          {liked ? <HeartFilledIcon fontSize="small" /> : <HeartOutlineIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* ── Product Metadata ── */}
      <CardContent
        sx={{
          p: 1.75,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:last-child': { pb: 1.75 }
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.92rem',
              color: T.text,
              lineHeight: 1.25,
              mb: 0.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>

          <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500, mb: 1 }} noWrap>
            {category}
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          {/* Price & Stock Row */}
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: T.primary }}>
              {formattedPrice}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: stock > 0 ? T.textSecondary : T.error }}>
              {stock > 0 ? `Stock: ${stock}` : 'Out of Stock'}
            </Typography>
          </Stack>

          {/* Seller / Store Tag */}
          {showSeller && (
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: T.textSecondary,
                fontWeight: 600,
                mb: 1.5,
                bgcolor: T.surfaceAlt,
                px: 1,
                py: 0.4,
                borderRadius: '6px',
              }}
              noWrap
            >
              🏪 {seller}
            </Typography>
          )}

          {/* Action Button */}
          <Button
            fullWidth
            onClick={handleAdd}
            disabled={stock <= 0}
            startIcon={added ? <AddedIcon /> : <CartIcon />}
            sx={{
              ...primaryBtnSx,
              py: 0.85,
              fontSize: '0.82rem',
              bgcolor: added ? T.primaryDark : T.primary,
              '&:hover': { bgcolor: T.primaryDark }
            }}
          >
            {added ? 'Added to Cart' : 'Add to Cart'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
