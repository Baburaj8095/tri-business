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
  LinearProgress,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getMerchantProfile,
  listMyShops,
  listMyPromoPurchases,
} from "../../api/api";

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [shops, setShops] = useState([]);
  const [hasPrime750, setHasPrime750] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('captain_access_token');
    if (token) {
      axios.get(`${process.env.REACT_APP_CAPTAIN_API_URL || 'http://localhost:8081/api'}/captain/offline-payments/merchant`, {
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
  const completion = verified ? 100 : 20;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Box mb={2}>
        <Typography fontSize={24} fontWeight={900}>
          Merchant Dashboard
        </Typography>
        <Typography color="text.secondary">
          Manage your merchant profile and shops
        </Typography>
      </Box>

      {/* PRIME BANNER */}
      {hasPrime750 && (
        <Card
          sx={{
            mb: 2,
            borderRadius: 3,
            background:
              "linear-gradient(90deg,#ef4444,#f59e0b,#10b981)",
            color: "#fff",
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Typography fontWeight={800} textAlign="center">
              PRIME 750 Active — commissions & Business boosts enabled
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {/* PENDING CUSTOMER OFF-LINE PAYMENTS */}
        {pendingPaymentsCount > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1.5px solid #228B22', bgcolor: '#f0fdf4' }}>
              <CardContent>
                <Typography fontWeight={850} color="#228B22">
                  ⚠️ Pending Customer Payments ({pendingPaymentsCount})
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Customers have initiated offline payments. Please verify and approve them to distribute cashback.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800, borderRadius: '8px', bgcolor: '#228B22', '&:hover': { bgcolor: '#1b4d3e' } }}
                  onClick={() => navigate('/business/orders')}
                >
                  Review Payments
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* PROFILE */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={800}>
                Business Details
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                mt={2}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate("/business/profile")
                  }
                >
                  Update Business Details
                </Button>

               
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SHOPS */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={800}>
                My Shops
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                mt={1}
              >
                <Chip
                  label={`Active ${active}`}
                  color="success"
                />
                <Chip
                  label={`Pending ${pending}`}
                  color="warning"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              {shops.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Typography>
                    {s.shop_name} • {s.city}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={s.status === "ACTIVE" ? "Active" : "Pending"}
                      color={s.status === "ACTIVE" ? "success" : "warning"}
                    />
                    {s.status === "ACTIVE" ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/business/shops/${encodeURIComponent(s.id)}/products`)}
                      >
                        Manage Products
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              ))}

              <Stack
                direction="row"
                spacing={2}
                mt={2}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate("/business/shops")
                  }
                >
                  Manage Shops
                </Button>

                <Button
                  variant="outlined"
                  onClick={() =>
                    navigate("/business/shops")
                  }
                >
                  Create Shop
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* INVENTORY */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={800}>
                Inventory
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={1}
              >
                Manage products and billing across channels
              </Typography>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() =>
                  navigate("/business/inventory")
                }
              >
                Tri Inventory & Billing
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* GO PUBLIC */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={800}>
                Go Public
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={1}
              >
                Active shops visible in marketplace
              </Typography>

              <Typography mt={2}>
                Active Shops: <b>{active}</b>
              </Typography>

              <Button
                variant="outlined"
                disabled={!active}
                sx={{ mt: 2 }}
                onClick={() =>
                  navigate("/merchant-marketplace")
                }
              >
                View Marketplace
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
