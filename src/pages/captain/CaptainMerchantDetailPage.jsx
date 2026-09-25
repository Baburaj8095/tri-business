import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Chip, IconButton, Button,
  Divider, Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Share as ShareIcon,
  Star as StarIcon,
  QrCode2 as QrIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Payment as PayoutIcon,
  ChevronRight as ChevronRightIcon,
  Description as DocIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

export default function CaptainMerchantDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('Overview');

  const merchant = {
    id: id || '1',
    name: 'Fresh Basket',
    status: 'Active',
    category: 'Grocery & Daily Needs',
    area: 'HSR Layout',
    rating: '4.8',
    reviews: 202,
    healthScore: 92,
    totalOrders: 120,
    monthlySales: '₹12,500',
    qrScans: 1250,
    onTime: '96%',
    address: 'HSR Layout, Bengaluru - 560102',
    distance: '2.4 km • 10-15 mins',
    hours: '08:00 AM - 10:00 PM (Open Now)',
    ownerName: 'Ramesh Kumar',
    ownerPhone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=60',
  };

  const handleCall = () => {
    window.location.href = `tel:${merchant.ownerPhone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${merchant.ownerPhone.replace(/\D/g, '')}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: merchant.name, text: `Check out ${merchant.name} on Trikonekt`, url: window.location.href });
    }
  };

  return (
    <Box sx={{ pb: 10 }}>

      {/* ── Top Header Navigation Bar (Matches Mockup Screen 4) ── */}
      <Box sx={{
        px: 2,
        pt: 2.5,
        pb: 1.5,
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <IconButton onClick={() => navigate('/captain/merchants')} size="small" sx={{ color: '#0f172a' }}>
          <BackIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleCall} size="small" sx={{ color: '#047857', bgcolor: '#f0fdf4', p: 0.8 }}>
            <PhoneIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={handleWhatsApp} size="small" sx={{ color: '#16a34a', bgcolor: '#f0fdf4', p: 0.8 }}>
            <WhatsAppIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={handleShare} size="small" sx={{ color: '#64748b', bgcolor: '#f8fafc', p: 0.8 }}>
            <ShareIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Merchant Store Header Profile (Matches Mockup Screen 4) ── */}
      <Box sx={{ p: 2, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
          <Box
            component="img"
            src={merchant.image}
            alt={merchant.name}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              objectFit: 'cover',
              border: '1.5px solid #e2e8f0',
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                {merchant.name}
              </Typography>
              <Chip
                label={merchant.status}
                size="small"
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
              <Box sx={{
                width: 22, height: 22, borderRadius: '6px', bgcolor: '#f0fdf4',
                display: 'grid', placeItems: 'center', color: '#047857',
              }}>
                <QrIcon sx={{ fontSize: 15 }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <StarIcon sx={{ fontSize: 15, color: '#eab308' }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
                  {merchant.rating}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  ({merchant.reviews} reviews)
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              {merchant.category}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Tab Navigation (Matches Mockup Screen 4) ── */}
      <Box sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        px: 1,
      }}>
        {['Overview', 'Orders', 'KYC & Docs', 'Activity'].map(tab => (
          <Box
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              py: 1.3,
              cursor: 'pointer',
              position: 'relative',
              color: activeTab === tab ? '#047857' : '#64748b',
              fontWeight: activeTab === tab ? 800 : 600,
              fontSize: '0.84rem',
            }}
          >
            {tab}
            {activeTab === tab && (
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: '#047857',
                borderRadius: '3px 3px 0 0',
              }} />
            )}
          </Box>
        ))}
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ p: 2 }}>

        {/* ── Merchant Health Score Card (Circular Gauge + 4 Signals) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2.2,
          mb: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', mb: 1.8 }}>
            Merchant Health Score
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Circular Gauge Ring (Exact Match to Mockup Screen 4) */}
            <Box sx={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" width="100%" height="100%">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="3.5"
                  strokeDasharray="92, 100"
                  strokeLinecap="round"
                />
              </svg>
              <Box sx={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1 }}>
                  92%
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: '#16a34a', fontWeight: 800, mt: 0.2 }}>
                  Excellent
                </Typography>
              </Box>
            </Box>

            {/* 4 Health Signals with Green Checkmarks */}
            <Stack spacing={0.6}>
              {[
                'High order volume',
                'Active QR usage',
                'Good customer ratings',
                'Low issue rate',
              ].map((sig, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{
                    width: 16, height: 16, borderRadius: '50%', bgcolor: '#dcfce7',
                    display: 'grid', placeItems: 'center', color: '#16a34a',
                  }}>
                    <CheckIcon sx={{ fontSize: 11, strokeWidth: 2 }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: '#334155', fontWeight: 600 }}>
                    {sig}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* ── 4 Quick Metrics Grid ── */}
        <Grid container spacing={1.2} sx={{ mb: 2 }}>
          {[
            { val: merchant.totalOrders, lbl: 'Total Orders' },
            { val: merchant.monthlySales, lbl: 'Monthly Sales' },
            { val: merchant.qrScans, lbl: 'QR Scans' },
            { val: merchant.onTime, lbl: 'On-Time' },
          ].map((m, i) => (
            <Grid item xs={3} key={i}>
              <Box sx={{
                bgcolor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', p: 1.2,
                textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                  {m.val}
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600, mt: 0.2 }}>
                  {m.lbl}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ── KYC & Documents Section (Exact Match to Mockup Screen 4) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          mb: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
                KYC & Documents
              </Typography>
              <Chip
                label="Verified"
                size="small"
                icon={<CheckIcon sx={{ fontSize: 13 }} />}
                sx={{
                  bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem', height: 20,
                  '& .MuiChip-icon': { color: '#15803d' },
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '0.74rem', color: '#047857', fontWeight: 800, cursor: 'pointer' }}>
              View All
            </Typography>
          </Box>

          {/* 4 Document Verification Tiles */}
          <Grid container spacing={1.2}>
            {[
              { title: 'Business', verified: true, icon: '🏢' },
              { title: 'GST', verified: true, icon: '📄' },
              { title: 'PAN', verified: true, icon: '🪪' },
              { title: 'Shop Photo', verified: true, icon: '📸' },
            ].map(doc => (
              <Grid item xs={3} key={doc.title}>
                <Box sx={{
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  p: 1.2,
                  textAlign: 'center',
                }}>
                  <Typography sx={{ fontSize: 20, mb: 0.3 }}>{doc.icon}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f172a' }}>
                    {doc.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.62rem', color: '#16a34a', fontWeight: 700 }}>
                    Verified
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Store Information Card (Exact Match to Mockup Screen 4) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          mb: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
              Store Information
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748b', cursor: 'pointer' }}>
              <EditIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700 }}>
                Edit
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1.4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 18, color: '#047857', mt: 0.2 }} />
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  {merchant.address}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {merchant.distance}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon sx={{ fontSize: 18, color: '#047857' }} />
              <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>
                {merchant.hours}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 18, color: '#047857' }} />
              <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>
                {merchant.ownerName} • <Box component="span" sx={{ color: '#047857' }}>{merchant.ownerPhone}</Box>
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ── Recent Activity Feed (Exact Match to Mockup Screen 4) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
              Recent Activity
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#047857', fontWeight: 800, cursor: 'pointer' }}>
              See All
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {[
              {
                icon: <CartIcon sx={{ fontSize: 17, color: '#ea580c' }} />,
                iconBg: '#fff7ed',
                title: 'New order received',
                sub: '#TRK10293 • 2 mins ago',
              },
              {
                icon: <QrIcon sx={{ fontSize: 17, color: '#2563eb' }} />,
                iconBg: '#eff6ff',
                title: 'QR scan • 5 products',
                sub: '2 hrs ago',
              },
              {
                icon: <PayoutIcon sx={{ fontSize: 17, color: '#16a34a' }} />,
                iconBg: '#f0fdf4',
                title: 'Payout settled',
                sub: '₹2,480 • 12 Aug 2024',
              },
            ].map((act, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '10px', bgcolor: act.iconBg,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  {act.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                    {act.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {act.sub}
                  </Typography>
                </Box>
                <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
              </Box>
            ))}
          </Stack>
        </Box>

      </Box>

      {/* ── Fixed Bottom Action Bar (Follow Up & View Orders) ── */}
      <Box sx={{
        position: 'fixed',
        bottom: 64, // above the 5-tab bottom navigation
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        p: 1.5,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
      }}>
        <Box sx={{ maxWidth: '520px', mx: 'auto', display: 'flex', gap: 1.5 }}>
          <Button
            onClick={handleCall}
            startIcon={<PhoneIcon sx={{ fontSize: 18 }} />}
            sx={{
              flex: 1,
              border: '1.5px solid #047857',
              color: '#047857',
              borderRadius: '12px',
              py: 1.2,
              fontWeight: 800,
              fontSize: '0.86rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f0fdf4' },
            }}
          >
            Follow Up
          </Button>

          <Button
            onClick={() => navigate('/captain/merchants')}
            startIcon={<CartIcon sx={{ fontSize: 18 }} />}
            sx={{
              flex: 1.4,
              bgcolor: '#047857',
              color: '#ffffff',
              borderRadius: '12px',
              py: 1.2,
              fontWeight: 800,
              fontSize: '0.86rem',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
              '&:hover': { bgcolor: '#064e3b' },
            }}
          >
            View Orders
          </Button>
        </Box>
      </Box>

    </Box>
  );
}
