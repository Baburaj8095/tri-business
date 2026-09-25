import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Divider,
  Button
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  Bolt,
  Store,
  LocalShipping,
  ReceiptLong,
  CalendarToday,
  CurrencyRupee,
  Refresh
} from '@mui/icons-material';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
};

export default function CaptainDailyBusinessPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH'

  const captainPincode = localStorage.getItem('pincode_captain') || '560102';
  const captainUsername = localStorage.getItem('username_captain') || 'CB_CAPTAIN';

  const metrics = {
    todayGmv: 48650,
    todayOrders: 38,
    todayEarnings: 1450,
    onlineB2b: { orders: 8, gmv: 24200, shops: 4 },
    onlineB2c: { orders: 22, gmv: 14850, shops: 12 },
    offlineB2b: { orders: 3, gmv: 6100, shops: 3 },
    offlineB2c: { orders: 5, gmv: 3500, shops: 6 },
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      {/* Top Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderBottom: `1px solid ${T.border}`,
          px: { xs: 2, md: 4 },
          py: 2.5,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Container maxWidth="lg" sx={{ px: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => navigate('/captain/home')} sx={{ bgcolor: '#f1f5f9' }}>
                <ArrowBack sx={{ fontSize: 20, color: T.text }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, lineHeight: 1.2 }}>
                  Daily Business Monitoring
                </Typography>
                <Typography variant="caption" sx={{ color: T.textSecondary }}>
                  Pincode: <b>{captainPincode}</b> • Active Monitoring
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              {['TODAY', 'WEEK', 'MONTH'].map((p) => (
                <Button
                  key={p}
                  size="small"
                  variant={period === p ? 'contained' : 'outlined'}
                  onClick={() => setPeriod(p)}
                  sx={{
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: period === p ? T.primary : 'transparent',
                    borderColor: T.border,
                    color: period === p ? '#fff' : T.textSecondary,
                    '&:hover': { bgcolor: period === p ? T.primaryDark : '#f1f5f9' }
                  }}
                >
                  {p === 'TODAY' ? 'Today' : p === 'WEEK' ? 'This Week' : 'This Month'}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Hero KPI Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #06b6d4 100%)',
            color: '#ffffff',
            p: 3,
            mb: 3.5,
            boxShadow: '0 12px 30px rgba(13,148,136,0.2)'
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: '0.5px' }}>
            PINCODE {captainPincode} OVERVIEW
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Business GMV</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                ₹{metrics.todayGmv.toLocaleString('en-IN')}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Orders Executed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                {metrics.todayOrders}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Captain Payout Earned</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: '#fef08a' }}>
                ₹{metrics.todayEarnings.toLocaleString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 4 Business Platform Breakdown */}
        <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, mb: 2 }}>
          Breakdown by Business Platform
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Card 1: Online B2B */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: '20px', border: `1.5px solid ${T.border}`, bgcolor: '#fff', p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#ecfdf5', color: '#047857', display: 'grid', placeItems: 'center' }}>
                  <Bolt sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: T.text }}>Online B2B</Typography>
                  <Typography variant="caption" sx={{ color: T.textSecondary }}>Wholesale Bulk</Typography>
                </Box>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#047857', mb: 0.5 }}>
                ₹{metrics.onlineB2b.gmv.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: T.textSecondary }}>
                <b>{metrics.onlineB2b.orders}</b> orders • <b>{metrics.onlineB2b.shops}</b> active suppliers
              </Typography>
            </Card>
          </Grid>

          {/* Card 2: Online B2C */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: '20px', border: `1.5px solid ${T.border}`, bgcolor: '#fff', p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
                  <LocalShipping sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: T.text }}>Online B2C</Typography>
                  <Typography variant="caption" sx={{ color: T.textSecondary }}>Quick Commerce</Typography>
                </Box>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d4ed8', mb: 0.5 }}>
                ₹{metrics.onlineB2c.gmv.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: T.textSecondary }}>
                <b>{metrics.onlineB2c.orders}</b> orders • <b>{metrics.onlineB2c.shops}</b> shops live
              </Typography>
            </Card>
          </Grid>

          {/* Card 3: Offline B2B */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: '20px', border: `1.5px solid ${T.border}`, bgcolor: '#fff', p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center' }}>
                  <Store sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: T.text }}>Offline B2B</Typography>
                  <Typography variant="caption" sx={{ color: T.textSecondary }}>Counter Invoices</Typography>
                </Box>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#b45309', mb: 0.5 }}>
                ₹{metrics.offlineB2b.gmv.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: T.textSecondary }}>
                <b>{metrics.offlineB2b.orders}</b> trades • <b>{metrics.offlineB2b.shops}</b> wholesale dealers
              </Typography>
            </Card>
          </Grid>

          {/* Card 4: Offline B2C */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: '20px', border: `1.5px solid ${T.border}`, bgcolor: '#fff', p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#f1f5f9', color: '#475569', display: 'grid', placeItems: 'center' }}>
                  <ReceiptLong sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: T.text }}>Offline B2C</Typography>
                  <Typography variant="caption" sx={{ color: T.textSecondary }}>Nearby Stores</Typography>
                </Box>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#475569', mb: 0.5 }}>
                ₹{metrics.offlineB2c.gmv.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: T.textSecondary }}>
                <b>{metrics.offlineB2c.orders}</b> walk-ins • <b>{metrics.offlineB2c.shops}</b> local stores
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Action button to view all shops */}
        <Box textAlign="center">
          <Button
            variant="contained"
            onClick={() => navigate('/captain/merchants')}
            sx={{
              bgcolor: T.primary,
              fontWeight: 800,
              borderRadius: '14px',
              px: 4,
              py: 1.25,
              textTransform: 'none',
              '&:hover': { bgcolor: T.primaryDark }
            }}
          >
            Manage & Verify Merchant Shops →
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
