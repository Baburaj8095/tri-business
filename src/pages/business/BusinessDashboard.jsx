import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
  Avatar,
  Divider,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getMerchantProfile,
  listMyShops,
  listMyPromoPurchases,
} from "../../api/api";

const PRIMARY = "#228B22";
const PRIMARY_DARK = "#1B4D3E";
const BG = "#f1f5f9";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#e2e8f0";

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [hasPrime750, setHasPrime750] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token_business');
    if (token) {
      axios.get(`${process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api'}/captain/offline-payments/merchant`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setPendingPaymentsCount(res.data ? res.data.length : 0);
        })
        .catch(err => console.error('Failed to fetch offline payments count:', err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [p, s, pp] = await Promise.all([
        getMerchantProfile().catch(() => null),
        listMyShops().catch(() => []),
        listMyPromoPurchases({}).catch(() => []),
      ]);

      setProfile(p);
      setShops(Array.isArray(s) ? s : s?.results || []);

      const rows = Array.isArray(pp) ? pp : pp?.results || [];
      const prime750 = rows.some((row) => {
        const st = String(row?.status || "").toUpperCase();
        if (st !== "APPROVED") return false;
        const pkg = row?.package || {};
        return Number(pkg?.price) >= 700;
      });

      setHasPrime750(prime750);
    })();
  }, []);

  const verified = Boolean(profile?.is_verified);
  const active = shops.filter((s) => s.status === "ACTIVE").length;
  const pending = shops.filter((s) => s.status === "PENDING").length;
  const walletBalance = profile?.wallet_balance || 0;
  const rating = (profile?.rating || 4.8).toFixed(1);

  // Get initials for avatar
  const getInitials = () => {
    if (profile?.business_name) {
      return profile.business_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'BU';
  };

  return (
    <Box sx={{ bgcolor: BG, minHeight: "100vh", pb: 4 }}>
      {/* Location & Header */}
      <Box sx={{ bgcolor: SURFACE, py: 2, borderBottom: `1px solid ${BORDER}`, mb: 2 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: TEXT_MUTED }}>📍</Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT }}>Bangladesh</Typography>
          </Stack>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: TEXT }}>
            Business Dashboard
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 2, md: 0 } }}>
        {/* BUSINESS USER CARD */}
        <Card sx={{ mb: 3, borderRadius: '20px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="flex-start" spacing={2.5} sx={{ mb: 2 }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: PRIMARY, 
                color: SURFACE, 
                fontWeight: 900,
                fontSize: '1.3rem'
              }}>
                {getInitials()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: TEXT }}>
                    {profile?.business_name || 'Business User'}
                  </Typography>
                  {verified && (
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 18, height: 18, borderRadius: '50%', bgcolor: PRIMARY, color: SURFACE, fontSize: '0.7rem', fontWeight: 900 }}>
                      ✓
                    </Box>
                  )}
                </Stack>
                <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, fontWeight: 600 }}>
                  {profile?.id || 'ID'}
                </Typography>
                <Chip 
                  label={verified ? 'Verified Merchant' : 'Pending Verification'}
                  size="small"
                  color={verified ? 'success' : 'default'}
                  sx={{ mt: 0.75, fontWeight: 700 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Stats Row */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: PRIMARY }}>
                    {active}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED, fontWeight: 600, mt: 0.5 }}>
                    Active Shops
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: TEXT }}>
                    {pendingPaymentsCount}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED, fontWeight: 600, mt: 0.5 }}>
                    Pending Orders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: PRIMARY }}>
                    {rating}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED, fontWeight: 600, mt: 0.5 }}>
                    Rating
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* WALLET BALANCE CARD */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: '20px', 
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
          boxShadow: 'none',
          color: SURFACE
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.9, mb: 1 }}>
              Wallet Balance
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 900, mb: 2 }}>
              ₹ {walletBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/business/profile')}
                sx={{ 
                  flex: 1, 
                  bgcolor: SURFACE, 
                  color: PRIMARY, 
                  fontWeight: 800,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                View Wallet
              </Button>
              <Button 
                variant="outlined"
                sx={{ 
                  flex: 1, 
                  borderColor: SURFACE, 
                  color: SURFACE,
                  fontWeight: 800,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Withdraw
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* PRIME BANNER */}
        {hasPrime750 && (
          <Card sx={{ mb: 3, borderRadius: '20px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3, bgcolor: '#fef3c7' }}>
              <Typography sx={{ fontWeight: 900, color: '#92400e', textAlign: 'center' }}>
                ⭐ PRIME 750 Active — commissions & Business boosts enabled
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* PENDING PAYMENTS SECTION */}
        {pendingPaymentsCount > 0 && (
          <Card sx={{ mb: 3, borderRadius: '20px', border: `2px solid ${PRIMARY}`, bgcolor: '#f0fdf4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 900, color: PRIMARY, fontSize: '1.1rem', mb: 1 }}>
                ⚠️ Pending Customer Payments ({pendingPaymentsCount})
              </Typography>
              <Typography sx={{ fontWeight: 600, color: TEXT_SECONDARY, mb: 2, fontSize: '0.95rem' }}>
                Customers have initiated offline payments. Please review and approve them to distribute cashback.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/business/orders')}
                sx={{ 
                  width: '100%',
                  bgcolor: PRIMARY,
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '12px',
                  py: 1.2,
                  '&:hover': { bgcolor: PRIMARY_DARK }
                }}
              >
                Review Payments
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QUICK ACTIONS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Box sx={{ fontSize: '2rem', mb: 1 }}>🏪</Box>
                <Typography sx={{ fontWeight: 900, color: TEXT, mb: 0.5 }}>
                  {active} Active Shops
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: TEXT_MUTED, mb: 1.5 }}>
                  {pending > 0 ? `${pending} pending` : 'All active'}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/business/shops')}
                  sx={{
                    bgcolor: PRIMARY,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: PRIMARY_DARK }
                  }}
                >
                  Manage Shops
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Box sx={{ fontSize: '2rem', mb: 1 }}>👤</Box>
                <Typography sx={{ fontWeight: 900, color: TEXT, mb: 0.5 }}>
                  My Profile
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: TEXT_MUTED, mb: 1.5 }}>
                  {verified ? 'Verified' : 'Complete profile'}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/business/profile')}
                  sx={{
                    bgcolor: PRIMARY,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: PRIMARY_DARK }
                  }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* INVENTORY SECTION */}
        <Card sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: TEXT, mb: 2 }}>
              📋 Inventory & Billing
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: TEXT_SECONDARY, mb: 2 }}>
              Manage products and billing across all channels
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/business/inventory')}
              sx={{
                bgcolor: PRIMARY,
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '12px',
                py: 1.2,
                '&:hover': { bgcolor: PRIMARY_DARK }
              }}
            >
              Tri Inventory & Billing
            </Button>
          </CardContent>
        </Card>

        {/* GO PUBLIC SECTION */}
        {active > 0 && (
          <Card sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: TEXT, mb: 2 }}>
                🌐 Go Public
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: TEXT_SECONDARY, mb: 2 }}>
                Your {active} active shop{active > 1 ? 's are' : ' is'} visible in the marketplace
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/merchant-marketplace')}
                sx={{
                  borderColor: PRIMARY,
                  color: PRIMARY,
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '12px',
                  py: 1.2,
                  '&:hover': { bgcolor: 'rgba(34, 139, 34, 0.08)', borderColor: PRIMARY_DARK }
                }}
              >
                View Marketplace
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

