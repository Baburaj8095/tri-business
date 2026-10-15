/**
 * Trikonekt Business Design Tokens
 * Premium Unified Design System (Matching Visual Reference Specifications)
 */

export const T = {
  // Primary Brand Colors
  forestGreen: '#064E3B',       // Primary Forest Green
  darkForestGreen: '#043C2E',   // Dark Forest Green (App header gradient start)
  deepEmerald: '#022C22',       // Deep Emerald (Banner gradient start)
  lightGreen: '#0F7A5B',        // Primary Light Green (Link text & accents)
  emeraldAccent: '#10B981',     // Emerald Accent

  // Primary aliases for compatibility
  primary: '#064E3B',
  primaryDark: '#043C2E',
  primaryDeep: '#022C22',
  primaryLight: '#0F7A5B',
  primaryAccent: '#10B981',

  // Brand Orange (CTAs, Scanner, Action buttons)
  orange: '#FF6B00',
  brandOrange: '#FF6B00',
  orangeHover: '#E85D04',
  orangeLight: '#FFF0E5',

  // Gradients
  headerGradient: 'linear-gradient(180deg, #043C2E 0%, #064E3B 100%)',
  bannerGradient: 'linear-gradient(135deg, #022C22 0%, #064E3B 100%)',
  orangeGradient: 'linear-gradient(135deg, #FF6B00 0%, #E85D04 100%)',

  // Backgrounds & Surfaces
  bg: '#F4F7F6',                // Main App Background
  surface: '#FFFFFF',           // Primary Surface
  surfaceSecondary: '#F8FAF9',  // Secondary Surface
  surfaceSoftGreen: '#EAF5F0',  // Soft Green Surface
  surfaceWarm: '#FFF8ED',       // Warm Surface (Wallet balance card)
  border: '#E2E8E5',            // Border
  borderStrong: '#CBD5D0',      // Strong Border
  overlay: 'rgba(2, 44, 34, 0.55)',

  // Legacy aliases
  surfaceAlt: '#F8FAF9',
  borderHover: '#CBD5D0',
  borderFocus: '#0F7A5B',

  // Typography
  text: '#14231D',              // Primary Text
  textSecondary: '#64746C',     // Secondary Text
  textMuted: '#87938D',         // Muted Text
  textInverse: '#FFFFFF',
  textOnDark: '#FFFFFF',
  textOnOrange: '#FFFFFF',
  linkText: '#0F7A5B',

  // Semantic Status Colors
  success: '#15803D',
  successBg: '#DCFCE7',
  successText: '#15803D',
  successBorder: '#BBF7D0',

  warning: '#B45309',
  warningBg: '#FEF3C7',
  warningText: '#B45309',
  warningBorder: '#FDE68A',

  error: '#DC2626',
  errorBg: '#FEE2E2',
  errorText: '#DC2626',
  errorBorder: '#FECACA',

  info: '#2563EB',
  infoBg: '#DBEAFE',
  infoText: '#2563EB',
  infoBorder: '#BFDBFE',

  inactive: '#64746C',
  inactiveBg: '#F1F5F3',
  inactiveText: '#64746C',
  inactiveBorder: '#E2E8E5',

  // Radii
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusCard: '16px',
  radiusXl: '20px',
  radiusFull: '9999px',

  // Shadows
  shadowCard: '0 2px 10px rgba(20, 35, 29, 0.04)',
  shadowHover: '0 4px 14px rgba(20, 35, 29, 0.08)',
  shadowElevated: '0 4px 18px rgba(0, 0, 0, 0.08)',

  // Dimensions
  topBarHeight: 68,
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
    boxShadow: '0 4px 12px rgba(255, 107, 0, 0.25)',
  },
  '&:active': { transform: 'scale(0.98)' },
};

export const secondaryBtnSx = {
  bgcolor: T.surface,
  color: T.forestGreen,
  border: `1px solid ${T.forestGreen}`,
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  minHeight: '44px',
  px: 2.2,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: T.surfaceSoftGreen,
    borderColor: T.darkForestGreen,
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
    '&.Mui-focused fieldset': { borderColor: T.lightGreen, borderWidth: 1.5 },
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
  bgcolor: isSelected ? T.forestGreen : T.surface,
  color: isSelected ? '#FFFFFF' : T.textSecondary,
  border: `1px solid ${isSelected ? T.forestGreen : T.border}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: isSelected ? T.darkForestGreen : T.surfaceSecondary,
  },
});
