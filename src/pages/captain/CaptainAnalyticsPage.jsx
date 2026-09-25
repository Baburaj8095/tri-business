import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Chip, IconButton, Badge,
} from '@mui/material';
import {
  Notifications as BellIcon,
  ShoppingCart as CartIcon,
  QrCodeScanner as QrIcon,
  LocalShipping as DeliveryIcon,
  TrendingUp as TrendUpIcon,
} from '@mui/icons-material';

export default function CaptainAnalyticsPage() {
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState('30D');
  const [activeMetricTab, setActiveMetricTab] = useState('Orders');

  return (
    <Box sx={{ pb: 3 }}>

      {/* ── Top Header Bar (Matches Mockup Screen 3) ── */}
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
                Analytics & Growth
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                Track performance and grow faster
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

        {/* ── Time Period & Date Range Filter (Matches Mockup Screen 3) ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', p: 0.4,
            display: 'flex', gap: 0.3,
          }}>
            {['7D', '30D', '3M', '6M', '1Y'].map(t => (
              <Box
                key={t}
                onClick={() => setTimeRange(t)}
                sx={{
                  px: 1.1, py: 0.4, borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: timeRange === t ? 800 : 600,
                  bgcolor: timeRange === t ? '#047857' : 'transparent',
                  color: timeRange === t ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {t}
              </Box>
            ))}
          </Box>

          <Box sx={{
            bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
            px: 1.4, py: 0.6, fontSize: '0.72rem', fontWeight: 700, color: '#0f172a',
            cursor: 'pointer',
          }}>
            01 Aug - 31 Aug ⌵
          </Box>
        </Box>

        {/* ── Top 2 Metric Summary Cards ── */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <Box sx={{
              bgcolor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', p: 1.8,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: '8px', bgcolor: '#f0fdf4',
                  display: 'grid', placeItems: 'center', color: '#16a34a', fontWeight: 900,
                }}>
                  ₹
                </Box>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Total Revenue
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.1, mb: 0.4 }}>
                ₹75,000
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <TrendUpIcon sx={{ fontSize: 13, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a' }}>
                  ↑ 22% vs last month
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{
              bgcolor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', p: 1.8,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: '8px', bgcolor: '#fff7ed',
                  display: 'grid', placeItems: 'center', color: '#ea580c',
                }}>
                  <CartIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Total Orders
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.1, mb: 0.4 }}>
                680
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <TrendUpIcon sx={{ fontSize: 13, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a' }}>
                  ↑ 18% vs last month
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* ── Performance Trends Chart Container (Matches Mockup Screen 3) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a', mb: 1.5 }}>
            Performance Trends
          </Typography>

          {/* Metric switcher tabs */}
          <Box sx={{ display: 'flex', gap: 0.8, mb: 2, overflowX: 'auto', pb: 0.5 }}>
            {['Orders', 'Revenue', 'QR Scans', 'Merchants'].map(tab => (
              <Chip
                key={tab}
                label={tab}
                onClick={() => setActiveMetricTab(tab)}
                sx={{
                  bgcolor: activeMetricTab === tab ? '#047857' : '#f8fafc',
                  color: activeMetricTab === tab ? '#ffffff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  height: 28,
                  cursor: 'pointer',
                  border: activeMetricTab === tab ? 'none' : '1px solid #e2e8f0',
                  '&:hover': { bgcolor: activeMetricTab === tab ? '#064e3b' : '#f1f5f9' },
                }}
              />
            ))}
          </Box>

          {/* Precision SVG Curved Performance Chart */}
          <Box sx={{ width: '100%', height: 160, position: 'relative' }}>
            <svg viewBox="0 0 320 130" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="10" y1="20" x2="310" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="10" y1="55" x2="310" y2="55" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="10" y1="90" x2="310" y2="90" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area fill */}
              <path
                d="M 15 95 C 40 85, 70 80, 95 65 C 130 55, 160 70, 190 35 C 220 50, 260 40, 305 25 L 305 120 L 15 120 Z"
                fill="url(#chartGrad)"
              />

              {/* Trend line */}
              <path
                d="M 15 95 C 40 85, 70 80, 95 65 C 130 55, 160 70, 190 35 C 220 50, 260 40, 305 25"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {[
                { cx: 15, cy: 95 },
                { cx: 55, cy: 82 },
                { cx: 95, cy: 65 },
                { cx: 145, cy: 62 },
                { cx: 190, cy: 35 },
                { cx: 235, cy: 45 },
                { cx: 275, cy: 32 },
                { cx: 305, cy: 25 },
              ].map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.cx}
                  cy={p.cy}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#047857"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Hover Tooltip Mockup (Exact Match: 68 orders Aug 18) */}
            <Box sx={{
              position: 'absolute', top: 12, left: '54%', transform: 'translateX(-50%)',
              bgcolor: '#0f172a', color: '#ffffff', px: 1.2, py: 0.4, borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none',
            }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800 }}>
                68 orders
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                Aug 18
              </Typography>
            </Box>
          </Box>

          {/* X-Axis Dates */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mt: 0.5 }}>
            {['1 Aug', '8 Aug', '15 Aug', '22 Aug', '31 Aug'].map(d => (
              <Typography key={d} sx={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>
                {d}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* ── Merchant Growth Multi-Bar Chart (Matches Mockup Screen 3) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          mb: 2.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
                Merchant Growth
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
                  250
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Total Merchants
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a' }}>
                  ↑ 12%
                </Typography>
              </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: '#047857' }} />
                <Typography sx={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: '#86efac' }} />
                <Typography sx={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>New</Typography>
              </Box>
            </Box>
          </Box>

          {/* Bar Chart Graphics */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 100, pt: 1, pb: 0.5 }}>
            {[
              { label: 'Aug 1', active: 55, newM: 20 },
              { label: 'Aug 8', active: 68, newM: 28 },
              { label: 'Aug 15', active: 80, newM: 35 },
              { label: 'Aug 22', active: 90, newM: 40 },
              { label: 'Aug 31', active: 98, newM: 45 },
            ].map(col => (
              <Box key={col.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.4, height: 75 }}>
                  <Box sx={{ width: 14, height: `${col.active}%`, bgcolor: '#047857', borderRadius: '4px 4px 0 0' }} />
                  <Box sx={{ width: 14, height: `${col.newM}%`, bgcolor: '#86efac', borderRadius: '4px 4px 0 0' }} />
                </Box>
                <Typography sx={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 600 }}>
                  {col.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── 2 Stat Cards: QR Scans & Delivery Performance ── */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <Box sx={{
              bgcolor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', p: 1.8,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                <QrIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  QR Scan Activity
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>
                1,250
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5 }}>
                Total Scans
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a' }}>
                ↑ 15%
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{
              bgcolor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', p: 1.8,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                <DeliveryIcon sx={{ fontSize: 18, color: '#059669' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Delivery Performance
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>
                96%
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5 }}>
                On-Time Delivery
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a' }}>
                ↑ 8%
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ── Top Performing Merchants Leaderboard (Exact Match to Mockup Screen 3) ── */}
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          p: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#0f172a' }}>
              Top Performing Merchants
            </Typography>
            <Typography
              onClick={() => navigate('/captain/merchants')}
              sx={{ fontSize: '0.76rem', color: '#047857', fontWeight: 800, cursor: 'pointer' }}
            >
              See All
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              {
                rank: 1,
                name: 'Fresh Basket',
                area: 'HSR Layout',
                revenue: '₹12,500',
                orders: '120 Orders',
                rankColor: '#16a34a',
                img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&auto=format&fit=crop&q=60',
              },
              {
                rank: 2,
                name: 'ABC Store',
                area: 'Koramangala',
                revenue: '₹8,400',
                orders: '85 Orders',
                rankColor: '#f59e0b',
                img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&auto=format&fit=crop&q=60',
              },
              {
                rank: 3,
                name: 'Daily Needs Mart',
                area: 'Indiranagar',
                revenue: '₹7,250',
                orders: '72 Orders',
                rankColor: '#ea580c',
                img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60',
              },
            ].map(item => (
              <Box
                key={item.rank}
                onClick={() => navigate(`/captain/merchant/${item.rank}`)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1, borderRadius: '12px', cursor: 'pointer',
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                <Box sx={{
                  width: 22, height: 22, borderRadius: '50%', bgcolor: item.rankColor,
                  color: '#ffffff', fontSize: '0.72rem', fontWeight: 900,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  {item.rank}
                </Box>

                <Box
                  component="img"
                  src={item.img}
                  alt={item.name}
                  sx={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover' }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {item.area}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a' }}>
                    {item.revenue}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    {item.orders}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
