import React from 'react';
import { Box, Typography, Button, Stack, Card, CardContent, Divider, Chip } from '@mui/material';
import {
  CheckCircleRounded as SuccessIcon,
  StorefrontRounded as StoreIcon,
  ShieldOutlined as ShieldIcon,
  Inventory2Rounded as InventoryIcon,
  ArrowForwardRounded as ArrowRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function CompletionView({ form, username, serviceMode, category }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 2, sm: 4 }, textAlign: 'center' }}>
      {/* Animated Success Badge */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: '#ecfdf5',
          border: '3px solid #a7f3d0',
          color: '#059669',
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 2.5,
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.15)',
        }}
      >
        <SuccessIcon sx={{ fontSize: 48, color: '#059669' }} />
      </Box>

      <Typography sx={{ fontSize: { xs: '1.4rem', sm: '1.65rem' }, fontWeight: 900, color: '#0f172a', mb: 0.75 }}>
        You&apos;re All Set!
      </Typography>
      <Typography sx={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 360, mx: 'auto', mb: 3, lineHeight: 1.5 }}>
        Your Trikonekt Business account has been created. Start setting up your digital store outlet.
      </Typography>

      {/* Account Overview Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          textAlign: 'left',
          mb: 3,
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account Identity
            </Typography>
            <Chip
              label="Pending Verification"
              size="small"
              sx={{
                bgcolor: '#fffbeb',
                color: '#b45309',
                fontWeight: 800,
                fontSize: '0.68rem',
                border: '1px solid #fde68a',
              }}
            />
          </Stack>

          <Stack spacing={1.25}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Business Name
              </Typography>
              <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {form.businessName || 'Trikonekt Store'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Registered Owner
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {form.fullName} (+91 {form.mobile})
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Store Location
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {form.city} - {form.pincode}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Next Steps Checklist */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          textAlign: 'left',
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
            Next Steps for Full Activation
          </Typography>

          <Stack spacing={1.75}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                <StoreIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  1. Setup Store Outlets
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Add operating address, store logo, and delivery radius
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                <InventoryIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  2. Add Store Catalog & Products
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Add retail or wholesale items, prices, and stock
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#faf5ff', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
                <ShieldIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  3. Complete Business KYC
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Upload PAN / GSTIN to activate instant bank settlements
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Button
        fullWidth
        variant="contained"
        onClick={() => navigate('/business-dashboard')}
        endIcon={<ArrowRightIcon />}
        sx={{
          borderRadius: '14px',
          bgcolor: '#059669',
          color: '#ffffff',
          fontWeight: 800,
          textTransform: 'none',
          fontSize: '0.95rem',
          py: 1.5,
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)',
          '&:hover': { bgcolor: '#047857' },
        }}
      >
        Go to Business Dashboard
      </Button>
    </Box>
  );
}
