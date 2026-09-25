import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export default function ProgressIndicator({ step, totalSteps }) {
  const safeTotal = Math.max(1, totalSteps || 6);
  const currentStep = Math.min(step, safeTotal);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Step {currentStep} of {safeTotal}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
          {Math.round((currentStep / safeTotal) * 100)}% Completed
        </Typography>
      </Stack>

      {/* Dynamic Dots / Segments */}
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: '100%' }}>
        {Array.from({ length: safeTotal }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <Box
              key={stepNumber}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                bgcolor: isCompleted
                  ? '#059669'
                  : isCurrent
                  ? '#10b981'
                  : '#e2e8f0',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
