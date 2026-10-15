import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Card,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  TuneRounded as FilterIcon,
} from '@mui/icons-material';
import {
  T,
  cardSx,
  cardHoverSx,
  primaryBtnSx,
  secondaryBtnSx,
  searchInputSx,
  chipFilterSx,
} from '../../theme/tokens';

/**
 * Standard Page Title + Optional Top Action Header
 */
export function BusinessPageHeader({ title, subtitle, actionLabel, onAction, actionIcon }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 2, px: { xs: 0.25, sm: 0 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.35rem' },
            fontWeight: 700,
            color: T.text,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
          }}
          noWrap
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.78rem', color: T.textSecondary, mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actionLabel && (
        <Button
          variant="contained"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{
            ...primaryBtnSx,
            minHeight: '38px',
            py: 0.6,
            px: 1.75,
            fontSize: '0.82rem',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

/**
 * Standardized Search Bar with Filter/Icon Addornments
 */
export function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  onFilterClick,
  hasFilter = false,
  sx = {},
}) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      sx={{
        ...searchInputSx,
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: T.textMuted, fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: onFilterClick ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onFilterClick}
              sx={{
                bgcolor: hasFilter ? T.surfaceSoftGreen : 'transparent',
                color: hasFilter ? T.forestGreen : T.textSecondary,
                p: 0.6,
              }}
            >
              <FilterIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}

/**
 * Filter Chips Row
 */
export function FilterChips({ items = [], selected, onSelect, sx = {} }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        overflowX: 'auto',
        py: 0.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        ...sx,
      }}
    >
      {items.map((item) => {
        const key = typeof item === 'object' ? item.id || item.value || item.label : item;
        const label = typeof item === 'object' ? item.label || item.name : item;
        const count = typeof item === 'object' ? item.count : null;
        const isSelected = selected === key || selected === label;

        return (
          <Box
            key={key}
            onClick={() => onSelect(key)}
            sx={{
              ...chipFilterSx(isSelected),
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span>{label}</span>
            {count !== null && count !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  opacity: isSelected ? 0.9 : 0.7,
                }}
              >
                ({count})
              </span>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Status Badge Component
 */
export function StatusBadge({ status, label, sx = {} }) {
  const norm = String(status || label || '').toUpperCase();
  let bg = T.inactiveBg;
  let color = T.inactiveText;
  let border = T.inactiveBorder;
  let dotColor = T.inactiveText;
  let displayLabel = label || norm;

  if (norm === 'ACTIVE' || norm === 'VERIFIED' || norm === 'DELIVERED' || norm === 'SUCCESS' || norm === 'APPROVED') {
    bg = T.successBg;
    color = T.successText;
    border = T.successBorder;
    dotColor = T.success;
    displayLabel = label || 'ACTIVE';
  } else if (norm === 'PENDING' || norm === 'WAITING' || norm === 'PROCESSING') {
    bg = T.warningBg;
    color = T.warningText;
    border = T.warningBorder;
    dotColor = T.warning;
    displayLabel = label || 'PENDING';
  } else if (norm === 'CANCELLED' || norm === 'REJECTED' || norm === 'FAILED') {
    bg = T.errorBg;
    color = T.errorText;
    border = T.errorBorder;
    dotColor = T.error;
    displayLabel = label || 'CANCELLED';
  } else if (norm === 'NEW' || norm === 'COMPLETED' || norm === 'INFO') {
    bg = T.infoBg;
    color = T.infoText;
    border = T.infoBorder;
    dotColor = T.info;
    displayLabel = label || norm;
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        bgcolor: bg,
        color: color,
        border: `1px solid ${border}`,
        borderRadius: '9999px',
        px: 1,
        py: 0.25,
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.3px',
        lineHeight: 1.2,
        ...sx,
      }}
    >
      <Box sx={{ width: 5.5, height: 5.5, borderRadius: '50%', bgcolor: dotColor }} />
      {displayLabel}
    </Box>
  );
}

/**
 * Empty State Container
 */
export function EmptyState({ icon, title, description, actionLabel, onAction, sx = {} }) {
  return (
    <Box
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: T.surface,
        borderRadius: '16px',
        border: `1px solid ${T.border}`,
        my: 2,
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: T.surfaceSoftGreen,
            color: T.forestGreen,
            display: 'grid',
            placeItems: 'center',
            mb: 2,
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        sx={{
          fontSize: { xs: '1.15rem', sm: '1.25rem' },
          fontWeight: 700,
          color: T.text,
          mb: 0.75,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: T.textSecondary,
            maxWidth: 380,
            lineHeight: 1.45,
            mb: actionLabel ? 2.5 : 0,
          }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            ...primaryBtnSx,
            px: 3,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

/**
 * Standard Reusable Card
 */
export function StandardCard({ children, sx = {}, hover = true, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        ...(hover ? cardHoverSx : cardSx),
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}

export {
  T,
  cardSx,
  cardHoverSx,
  primaryBtnSx,
  secondaryBtnSx,
  searchInputSx,
  chipFilterSx,
};
