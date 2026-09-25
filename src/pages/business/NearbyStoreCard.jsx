import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button } from '@mui/material';
import { LuMapPin, LuStar } from 'react-icons/lu';

export default function NearbyStoreCard({ store }) {
  const navigate = useNavigate();

  return (
    <Box 
      onClick={() => navigate(`/business/shop/${store.id}`)}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        p: 2,
        mb: 2.5,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#228B22',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
        }
      }}
    >
      {/* Left: Image */}
      <Box sx={{
        width: { xs: '100%', sm: 120 },
        height: { xs: 140, sm: 120 },
        borderRadius: '12px',
        overflow: 'hidden',
        mr: { xs: 0, sm: 2.5 },
        mb: { xs: 1.5, sm: 0 },
        flexShrink: 0,
        bgcolor: '#f1f5f9'
      }}>
        <img 
          src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
          alt={store.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </Box>

      {/* Right: Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Name & Category */}
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.25, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {store.name}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, mb: 0.75 }}>
          {store.category}
        </Typography>

        {/* Location */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.2, color: '#64748b' }}>
          <LuMapPin size={14} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {store.location}
          </Typography>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: '6px' }}>
          <Box sx={{ bgcolor: 'rgba(5, 150, 105, 0.1)', color: '#059669', px: 1, py: 0.25, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
            5% Cashback
          </Box>
          <Box sx={{ border: '1px solid #e2e8f0', px: 1, py: 0.25, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LuMapPin size={12} /> {store.distance || '1.2 Km'}
          </Box>
          <Box sx={{ border: '1px solid #e2e8f0', px: 1, py: 0.25, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {store.rating} <LuStar size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> (202)
          </Box>
        </Stack>

        {/* Single Primary Action Button */}
        <Box sx={{ mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/business/shop/${store.id}`);
            }}
            sx={{
              py: 0.85,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              bgcolor: '#059669',
              color: '#ffffff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#047857', boxShadow: 'none' },
            }}
          >
            View Store
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
