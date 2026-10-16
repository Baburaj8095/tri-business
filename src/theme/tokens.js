/**
 * Trikonekt Business Design Tokens
 * Premium Unified Design System (Orange, Peach & Cream Identity)
 */

export const T = {
  // Primary Brand Colors (Orange, Peach, Cream Identity)
  primary: '#FF5A0A',           // Primary Action Orange
  primaryDark: '#D94708',       // Primary Hover/Pressed Orange
  primaryDeep: '#B83804',
  primaryLight: '#FFE0C7',      // Soft Orange Accent
  primaryAccent: '#FF5A0A',

  // Warm Accents & Pastels
  softPeach: '#FFF0E5',
  warmCream: '#FFF8EE',
  softOrange: '#FFE0C7',

  // Forest & Emerald Aliases (re-mapped for clean transition)
  forestGreen: '#16805D',       // Semantic success green
  darkForestGreen: '#0E5C42',
  deepEmerald: '#172033',       // Dark Charcoal header
  lightGreen: '#16805D',
  emeraldAccent: '#16805D',

  // Brand Orange (CTAs, Scanner, Action buttons)
  orange: '#FF5A0A',
  brandOrange: '#FF5A0A',
  orangeHover: '#D94708',
  orangeLight: '#FFF0E5',

  // Gradients
  headerGradient: 'linear-gradient(180deg, #172033 0%, #0F172A 100%)',
  bannerGradient: 'linear-gradient(135deg, #172033 0%, #0F172A 100%)',
  orangeGradient: 'linear-gradient(135deg, #FF5A0A 0%, #D94708 100%)',

  // Backgrounds & Surfaces
  bg: '#FFF9F4',                // Page Background
  surface: '#FFFFFF',           // Primary Card Surface
  surfaceSecondary: '#FFF8EE',  // Warm Cream Surface
  surfaceSoftGreen: '#EAF7EF',  // Soft Green Surface
  surfaceWarm: '#FFF8EE',       // Warm Cream Surface
  border: '#E8E3DD',            // Border
  borderStrong: '#CBD5E1',      // Strong Border
  overlay: 'rgba(23, 32, 51, 0.65)',

  // Legacy aliases
  surfaceAlt: '#FFF8EE',
  borderHover: '#CBD5E1',
  borderFocus: '#FF5A0A',

  // Typography
  text: '#172033',              // Primary Text
  textSecondary: '#647084',     // Secondary Text
  textMuted: '#94A3B8',         // Muted Text
  textInverse: '#FFFFFF',
  textOnDark: '#FFFFFF',
  textOnOrange: '#FFFFFF',
  linkText: '#FF5A0A',

  // Semantic Status Colors
  success: '#16805D',
  successBg: '#EAF7EF',
  successText: '#16805D',
  successBorder: '#B2E2CE',

  warning: '#B45309',
  warningBg: '#FFF4D9',
  warningText: '#B45309',
  warningBorder: '#FDE68A',

  error: '#C93636',
  errorBg: '#FDECEC',
  errorText: '#C93636',
  errorBorder: '#F8B4B4',

  info: '#3676D9',
  infoBg: '#EDF4FF',
  infoText: '#3676D9',
  infoBorder: '#BFDBFE',

  inactive: '#647084',
  inactiveBg: '#F1F5F9',
  inactiveText: '#647084',
  inactiveBorder: '#E8E3DD',

  // Radii
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusCard: '16px',
  radiusXl: '20px',
  radiusFull: '9999px',

  // Shadows
  shadowCard: '0 1px 3px rgba(23, 32, 51, 0.05), 0 1px 2px rgba(23, 32, 51, 0.02)',
  shadowHover: '0 4px 14px rgba(23, 32, 51, 0.08)',
  shadowElevated: '0 6px 20px rgba(23, 32, 51, 0.08)',

  // Dimensions
  topBarHeight: 68,
  sidebarWidth: 260,
  mobileNavHeight: 64,
  maxContentWidth: 1400,
};

// Reusable Shared Component Styles
export const cardSx = {
  bgcolor: T.surface,
  borderRadius: '16px',
  border: `1px solid ${T.border}`,
  boxShadow: T.shadowCard,
  p: 2,
  transition: 'all 0.15s ease-in-out',
};

export const cardHoverSx = {
  ...cardSx,
  '&:hover': {
    boxShadow: T.shadowHover,
    borderColor: T.borderStrong,
    transform: 'translateY(-1px)',
  },
};

export const primaryBtnSx = {
  bgcolor: T.orange,
  color: '#FFFFFF',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  minHeight: '44px',
  px: 2.5,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: T.orangeHover,
    boxShadow: '0 4px 12px rgba(255, 90, 10, 0.25)',
  },
  '&:active': { transform: 'scale(0.98)' },
};

export const secondaryBtnSx = {
  bgcolor: T.surface,
  color: T.primary,
  border: `1px solid ${T.primary}`,
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  minHeight: '44px',
  px: 2.2,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: T.softPeach,
    borderColor: T.primaryDark,
  },
  '&:active': { transform: 'scale(0.98)' },
};

export const searchInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: T.surface,
    minHeight: '44px',
    fontSize: '0.88rem',
    color: T.text,
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderStrong },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 1.5 },
  },
  '& .MuiInputBase-input::placeholder': {
    color: T.textMuted,
    opacity: 1,
  },
};

export const chipFilterSx = (isSelected) => ({
  height: '34px',
  px: 1.25,
  borderRadius: '9999px',
  fontWeight: isSelected ? 700 : 500,
  fontSize: '0.78rem',
  bgcolor: isSelected ? T.primary : T.surface,
  color: isSelected ? '#FFFFFF' : T.textSecondary,
  border: `1px solid ${isSelected ? T.primary : T.border}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: isSelected ? T.primaryDark : T.surfaceSecondary,
  },
});
