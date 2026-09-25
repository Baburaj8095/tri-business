import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { CheckCircleRounded, ChevronRightRounded } from '@mui/icons-material';

export default function SelectableOptionCard({
  icon,
  title,
  subtitle,
  description,
  selected = false,
  disabled = false,
  badgeText,
  onClick,
}) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        width: '100%',
        p: { xs: 2, sm: 2.25 },
        borderRadius: '16px',
        border: '1.5px solid',
        borderColor: disabled
          ? '#e2e8f0'
          : selected
          ? '#059669'
          : '#e2e8f0',
        bgcolor: disabled
          ? '#f8fafc'
          : selected
          ? '#ecfdf5'
          : '#ffffff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.18s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: selected ? '0 4px 14px rgba(5, 150, 105, 0.1)' : '0 1px 3px rgba(15, 23, 42, 0.02)',
        '&:hover': {
          borderColor: disabled ? '#e2e8f0' : selected ? '#059669' : '#94a3b8',
          transform: disabled ? 'none' : 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0, flex: 1, pr: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: disabled
              ? '#f1f5f9'
              : selected
              ? '#059669'
              : '#f1f5f9',
            color: disabled
              ? '#94a3b8'
              : selected
              ? '#ffffff'
              : '#059669',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            transition: 'all 0.18s ease',
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.25 }}>
              {title}
            </Typography>
            {badgeText && (
              <Chip
                label={badgeText}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: disabled ? '#f1f5f9' : '#fef3c7',
                  color: disabled ? '#64748b' : '#92400e',
                  border: `1px solid ${disabled ? '#e2e8f0' : '#fde68a'}`,
                }}
              />
            )}
          </Stack>
          {(subtitle || description) && (
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, mt: 0.35, lineHeight: 1.3 }}>
              {subtitle || description}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {selected ? (
          <CheckCircleRounded sx={{ fontSize: 24, color: '#059669' }} />
        ) : (
          <ChevronRightRounded sx={{ fontSize: 24, color: disabled ? '#cbd5e1' : '#94a3b8' }} />
        )}
      </Box>
    </Box>
  );
}
