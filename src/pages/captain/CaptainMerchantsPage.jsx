import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Chip, IconButton, Badge,
  Menu, MenuItem,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Search as SearchIcon,
  Tune as FilterIcon,
  Map as MapIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  QrCode2 as QrIcon,
} from '@mui/icons-material';

const MOCK_MERCHANTS = [
  {
    id: '1',
    name: 'Fresh Basket',
    status: 'ACTIVE',
    category: 'Grocery & Daily Needs',
    area: 'HSR Layout',
    distance: '2.4 km',
    rating: '4.8',
    reviews: 202,
    orders: 120,
    monthlySales: '₹12,500',
    healthScore: 92,
    kycVerified: true,
    qrActive: true,
    address: 'HSR Layout, Bengaluru - 560102',
    hours: '08:00 AM - 10:00 PM (Open Now)',
    ownerName: 'Ramesh Kumar',
    ownerPhone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    name: 'ABC Store',
    status: 'ACTIVE',
    category: 'Retail Store',
    area: 'Koramangala',
    distance: '3.1 km',
    rating: '4.5',
    reviews: 148,
    orders: 85,
    monthlySales: '₹8,400',
    healthScore: 88,
    kycVerified: false,
    qrActive: true,
    address: '80ft Road, 4th Block, Koramangala - 560034',
    hours: '09:00 AM - 09:30 PM (Open Now)',
    ownerName: 'Anil Mehta',
    ownerPhone: '+91 98765 12345',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    name: 'XYZ Mart',
    status: 'INACTIVE',
    category: 'Supermarket',
    area: 'Jayanagar',
    distance: '5.2 km',
    rating: '4.2',
    reviews: 84,
    orders: 12,
    monthlySales: '₹2,300',
    healthScore: 56,
    kycVerified: true,
    qrActive: false,
    address: '9th Main, 4th Block, Jayanagar - 560011',
    hours: '10:00 AM - 08:00 PM',
    ownerName: 'Sunil Rao',
    ownerPhone: '+91 98765 67890',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60',
  },
  {
    id: '4',
    name: 'Smart Electronics',
    status: 'NEEDS_ATTENTION',
    category: 'Electronics',
    area: 'Indiranagar',
    distance: '6.8 km',
    rating: '4.6',
    reviews: 112,
    orders: 45,
    monthlySales: '₹35,000',
    healthScore: 74,
    kycVerified: true,
    qrActive: false,
    address: '100ft Road, HAL 2nd Stage, Indiranagar - 560038',
    hours: '10:30 AM - 09:00 PM',
    ownerName: 'Praveen Shah',
    ownerPhone: '+91 98765 54321',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&auto=format&fit=crop&q=60',
  },
];

export default function CaptainMerchantsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialFilter = searchParams.get('filter');
  const getFilterId = () => {
    if (initialFilter === 'active') return 'ACTIVE';
    if (initialFilter === 'pending') return 'PENDING';
    if (initialFilter === 'attention') return 'NEEDS_ATTENTION';
    return 'ALL';
  };

  const [activeFilter, setActiveFilter] = useState(getFilterId);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAnchor, setSortAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('Last Activity');

  const filteredMerchants = useMemo(() => {
    return MOCK_MERCHANTS.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
        || m.area.toLowerCase().includes(searchQuery.toLowerCase())
        || m.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'ACTIVE') return m.status === 'ACTIVE';
      if (activeFilter === 'PENDING') return !m.kycVerified;
      if (activeFilter === 'NEEDS_ATTENTION') return m.status === 'NEEDS_ATTENTION' || m.status === 'INACTIVE';
      return true;
    });
  }, [searchQuery, activeFilter]);

  return (
    <Box sx={{ pb: 3 }}>

      {/* ── Top Header Bar (Matches Mockup Screen 2) ── */}
      <Box sx={{
        background: 'linear-gradient(145deg, #022c22 0%, #064e3b 55%, #047857 100%)',
        color: '#ffffff',
        pt: 3,
        pb: 2.8,
        px: 2.5,
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 8px 24px rgba(2, 44, 34, 0.25)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'grid', placeItems: 'center',
              fontWeight: 900, fontSize: '1.2rem', color: '#ffffff',
            }}>
              B
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                Merchant Network
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                Manage your assigned merchants
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            sx={{ color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.15)', p: 0.8 }}
          >
            <Badge color="error" variant="dot">
              <BellIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* ── Page Content Container ── */}
      <Box sx={{ px: 2, mt: 2 }}>

        {/* ── Search Input Bar (Matches Mockup Screen 2) ── */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          px: 1.5,
          py: 0.4,
          mb: 1.8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
          <TextField
            fullWidth
            variant="standard"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search merchants by name, area or category..."
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' },
            }}
          />
          <IconButton size="small" sx={{ color: '#64748b', p: 0.5 }}>
            <FilterIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Filter Pills (Exact Match to Mockup Screen 2) ── */}
        <Box sx={{
          display: 'flex',
          gap: 0.8,
          overflowX: 'auto',
          pb: 1.5,
          '::-webkit-scrollbar': { display: 'none' },
        }}>
          {[
            { id: 'ALL', label: 'All (250)' },
            { id: 'ACTIVE', label: 'Active (225)' },
            { id: 'PENDING', label: 'Pending (15)' },
            { id: 'NEEDS_ATTENTION', label: 'Needs Attention (10)' },
          ].map(tab => (
            <Chip
              key={tab.id}
              label={tab.label}
              onClick={() => setActiveFilter(tab.id)}
              sx={{
                bgcolor: activeFilter === tab.id ? '#047857' : '#ffffff',
                color: activeFilter === tab.id ? '#ffffff' : '#64748b',
                border: activeFilter === tab.id ? 'none' : '1px solid #e2e8f0',
                fontWeight: 700,
                fontSize: '0.76rem',
                height: 32,
                cursor: 'pointer',
                boxShadow: activeFilter === tab.id ? '0 2px 6px rgba(4, 120, 87, 0.25)' : 'none',
                '&:hover': { bgcolor: activeFilter === tab.id ? '#064e3b' : '#f8fafc' },
              }}
            />
          ))}
        </Box>

        {/* ── Interactive Map View / Preview Card (Matches Mockup Screen 2) ── */}
        <Box sx={{
          position: 'relative',
          borderRadius: '18px',
          height: 120,
          background: 'linear-gradient(135deg, #e0f2fe 0%, #dcfce7 100%)',
          border: '1.5px solid #cbd5e1',
          overflow: 'hidden',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          {/* Map grid lines graphic */}
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(#047857 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }} />

          {/* Map pins */}
          <Box sx={{ position: 'absolute', top: 20, left: 40, color: '#3b82f6', fontSize: 18 }}>📍</Box>
          <Box sx={{ position: 'absolute', top: 35, left: 140, color: '#047857', fontSize: 22 }}>📍</Box>
          <Box sx={{ position: 'absolute', top: 25, right: 80, color: '#f59e0b', fontSize: 20 }}>📍</Box>

          <Box />

          <Box sx={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{
              bgcolor: 'rgba(255, 255, 255, 0.92)', px: 1.2, py: 0.4,
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 0.5,
              backdropFilter: 'blur(4px)', border: '1px solid rgba(255, 255, 255, 0.8)',
            }}>
              <LocationIcon sx={{ fontSize: 14, color: '#047857' }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
                Bengaluru, Karnataka
              </Typography>
            </Box>

            <Box sx={{
              bgcolor: '#047857', color: '#ffffff', px: 1.5, py: 0.5,
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 0.6,
              fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)',
            }}>
              <MapIcon sx={{ fontSize: 14 }} />
              Map View
            </Box>
          </Box>
        </Box>

        {/* ── Merchant List Section Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.96rem', color: '#0f172a' }}>
            Merchants ({filteredMerchants.length})
          </Typography>

          <Box
            onClick={(e) => setSortAnchor(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}
          >
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
              Sort: <strong style={{ color: '#0f172a' }}>{sortBy}</strong> ⌵
            </Typography>
          </Box>

          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
          >
            {['Last Activity', 'Highest Orders', 'Rating', 'Health Score'].map(opt => (
              <MenuItem key={opt} onClick={() => { setSortBy(opt); setSortAnchor(null); }} sx={{ fontSize: '0.82rem' }}>
                {opt}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* ── List of Merchant Cards (Exact Match to Mockup Screen 2) ── */}
        <Stack spacing={1.8}>
          {filteredMerchants.map(merchant => (
            <Box
              key={merchant.id}
              onClick={() => navigate(`/captain/merchant/${merchant.id}`)}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '18px',
                border: '1.5px solid #e2e8f0',
                p: 1.8,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#cbd5e1', transform: 'translateY(-1px)' },
              }}
            >
              {/* Top row: Thumbnail, Name, Status Pill, Category, Distance, Rating */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Box
                  component="img"
                  src={merchant.image}
                  alt={merchant.name}
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1px solid #f1f5f9',
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {merchant.name}
                    </Typography>

                    <Chip
                      label={merchant.status === 'ACTIVE' ? 'Active' : merchant.status === 'INACTIVE' ? 'Inactive' : 'Needs Attention'}
                      size="small"
                      sx={{
                        bgcolor: merchant.status === 'ACTIVE' ? '#dcfce7' : merchant.status === 'INACTIVE' ? '#fee2e2' : '#fef3c7',
                        color: merchant.status === 'ACTIVE' ? '#15803d' : merchant.status === 'INACTIVE' ? '#b91c1c' : '#b45309',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 20,
                      }}
                    />
                  </Box>

                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, mb: 0.3 }}>
                    {merchant.category}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                      {merchant.area} • {merchant.distance}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#eab308' }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#0f172a' }}>
                        {merchant.rating}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 20, alignSelf: 'center' }} />
              </Box>

              {/* 3-Column Metrics (Orders | Monthly Sales | Health Score) */}
              <Box sx={{
                bgcolor: '#f8fafc',
                borderRadius: '12px',
                p: 1.2,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                textAlign: 'center',
                mb: 1.2,
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                    {merchant.orders}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    Orders
                  </Typography>
                </Box>
                <Box sx={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                    {merchant.monthlySales}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    Monthly Sales
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{
                    fontWeight: 900,
                    fontSize: '0.94rem',
                    color: merchant.healthScore >= 80 ? '#16a34a' : merchant.healthScore >= 60 ? '#f59e0b' : '#dc2626',
                  }}>
                    {merchant.healthScore}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    Health Score
                  </Typography>
                </Box>
              </Box>

              {/* Badges: KYC Verified + QR Active (Exact Match to Mockup) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  bgcolor: merchant.kycVerified ? '#dcfce7' : '#fef3c7',
                  color: merchant.kycVerified ? '#15803d' : '#b45309',
                  px: 1, py: 0.3, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {merchant.kycVerified ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : <WarningIcon sx={{ fontSize: 13 }} />}
                  {merchant.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                </Box>

                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  bgcolor: merchant.qrActive ? '#eff6ff' : '#fef2f2',
                  color: merchant.qrActive ? '#1d4ed8' : '#b91c1c',
                  px: 1, py: 0.3, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <QrIcon sx={{ fontSize: 13 }} />
                  {merchant.qrActive ? 'QR Active' : 'QR Inactive'}
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

      </Box>
    </Box>
  );
}
