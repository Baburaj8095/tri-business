import React from 'react';
import { Box, Typography, IconButton, Button, Stack } from '@mui/material';
import { ArrowBackRounded as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function OnboardingHeader({ onBack, canGoBack, step, totalSteps }) {
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        px: { xs: 2, sm: 3 },
        py: 1.25,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box sx={{ width: 40, display: 'flex', alignItems: 'center' }}>
          {canGoBack ? (
            <IconButton
              size="small"
              onClick={onBack}
              sx={{
                bgcolor: '#f8fafc',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              <BackIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#ecfdf5',
                color: '#059669',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
              }}
            >
              T
            </Box>
          )}
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
          Trikonekt Business Setup
        </Typography>

        <Box sx={{ width: 60, display: 'flex', justifyContent: 'flex-end' }}>
          {step === 1 ? (
            <Button
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: '#059669',
                px: 1,
                minWidth: 0,
              }}
            >
              Login
            </Button>
          ) : (
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
              {step}/{totalSteps}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
