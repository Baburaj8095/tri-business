import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import {
  Close,
  WorkspacePremium,
  CheckCircle,
  Bolt,
  ArrowForward,
  Lock,
} from '@mui/icons-material';

const PRIMARY = '#228B22';
const PRIMARY_DARK = '#1B4D3E';
const ACCENT = '#f97316';

export default function PrimeMembershipModal({ open, onClose, featureName = "this feature" }) {
  const navigate = useNavigate();

  const handleGoToPackages = () => {
    if (onClose) onClose();
    navigate('/business/packages');
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          maxWidth: 480,
          mx: 'auto',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 -10px 40px rgba(15, 23, 42, 0.15)',
        },
      }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)',
          p: 3,
          pt: 1.5,
          color: '#ffffff',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.4)', mx: 'auto', mb: 1.5 }} />
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
          }}
          size="small"
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>

        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            border: '2px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <WorkspacePremium sx={{ fontSize: 34, color: '#fef08a' }} />
        </Box>

        <Chip
          label="Merchant Membership Required"
          size="small"
          sx={{
            bgcolor: 'rgba(254, 240, 138, 0.25)',
            color: '#fef08a',
            fontWeight: 800,
            fontSize: '0.7rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 1,
            border: '1px solid rgba(254, 240, 138, 0.4)',
          }}
        />

        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.25 }}>
          Become a Member • ₹999 / Year
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', mt: 0.5 }}>
          Free plan merchants need an active Member Plan to {featureName}.
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.75, bgcolor: '#ffffff' }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>
          VIP Member Benefits:
        </Typography>

        <Stack spacing={1.25} sx={{ mb: 3 }}>
          {[
            'Add & Manage Unlimited Merchant Shops',
            'List Products & Inventory with Live Online Sync',
            'Verified Seller Member Badge (like OLX VIP)',
            'Full Access to Online B2B Marketplace & Ordering',
            'Priority Visibility & Direct Customer Inquiries',
          ].map((benefit, i) => (
            <Stack key={i} direction="row" spacing={1.25} alignItems="center">
              <CheckCircle sx={{ fontSize: 18, color: PRIMARY, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                {benefit}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Pricing Options Preview */}
        <Box sx={{ bgcolor: '#f8fafc', p: 1.75, borderRadius: '16px', border: '1px solid #e2e8f0', mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} justifyContent="space-between">
            {/* 999/yr option */}
            <Box
              sx={{
                flex: 1.2,
                bgcolor: '#fffbeb',
                p: 1.5,
                borderRadius: '12px',
                border: '2px solid #f59e0b',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 8,
                  bgcolor: ACCENT,
                  color: '#fff',
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  px: 0.75,
                  py: 0.15,
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                BEST VALUE
              </Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                Yearly Member
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', mt: 0.25 }}>
                ₹999<Typography component="span" sx={{ fontSize: '0.72rem', color: '#64748b' }}>/yr</Typography>
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, mt: 0.25 }}>
                Full 365 Days Access
              </Typography>
            </Box>

            {/* 99/mo option */}
            <Box
              sx={{
                flex: 0.8,
                bgcolor: '#ffffff',
                p: 1.5,
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                Monthly
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', mt: 0.25 }}>
                ₹99<Typography component="span" sx={{ fontSize: '0.7rem', color: '#64748b' }}>/mo</Typography>
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                30 Days Starter
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Buttons */}
        <Stack spacing={1.25}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleGoToPackages}
            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            sx={{
              py: 1.4,
              borderRadius: '14px',
              bgcolor: ACCENT,
              fontWeight: 900,
              fontSize: '0.9rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
              '&:hover': { bgcolor: '#ea580c' },
            }}
          >
            Become a Member (₹999 / Year)
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={onClose}
            sx={{
              py: 0.75,
              color: '#64748b',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
            }}
          >
            Maybe Later
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
