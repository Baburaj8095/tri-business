import React from 'react';
import { Box, Button, CircularProgress, Stack, Container } from '@mui/material';

export default function StickyBottomAction({
  onContinue,
  onBack,
  continueLabel = 'Continue',
  backLabel = 'Back',
  showBack = false,
  disabled = false,
  loading = false,
}) {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        bgcolor: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.05)',
        py: 1.75,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {showBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={loading}
              sx={{
                borderRadius: '12px',
                borderColor: '#e2e8f0',
                color: '#475569',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.9rem',
                py: 1.35,
                px: 2.5,
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
              }}
            >
              {backLabel}
            </Button>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={onContinue}
            disabled={disabled || loading}
            sx={{
              borderRadius: '12px',
              bgcolor: '#059669',
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.92rem',
              py: 1.35,
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              '&:hover': { bgcolor: '#047857' },
              '&.Mui-disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
          >
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <CircularProgress size={20} color="inherit" />
                <span>Processing...</span>
              </Stack>
            ) : (
              continueLabel
            )}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
