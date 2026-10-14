/**
 * Trikonekt Business Design Tokens
 * Centralized design system for premium modern B2B/B2C merchant platform.
 */

export const T = {
  // Brand Scale (TriShopping Orange & Slate Palette)
  primaryDark: '#C2410C',    // Deep orange (orange-700)
  primary: '#EA580C',        // TriShopping signature orange (orange-600)
  primaryHover: '#9A3412',   // Rich burnt orange (orange-800)
  primaryLight: '#FFF7ED',   // Soft warm tint for active states (orange-50)
  primaryAccent: '#F59E0B',  // Amber highlight
  primaryGradient: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
  primaryGradientSubtle: 'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(249,115,22,0.03) 100%)',

  // Neutrals Canvas
  bg: '#F8FAFC',             // Slate 50 background
  surface: '#FFFFFF',        // Pure white card surfaces
  surfaceAlt: '#F1F5F9',     // Slate 100 for secondary containers
  surfaceHover: '#F8FAFC',
  border: '#E2E8F0',         // 1px subtle card/table border
  borderHover: '#CBD5E1',
  borderFocus: '#EA580C',

  // Typography
  text: '#0F172A',           // Slate 900 primary high contrast
  textSecondary: '#475569',  // Slate 600 secondary body & descriptions
  textMuted: '#94A3B8',      // Slate 400 captions & metadata
  textInverse: '#FFFFFF',

  // Semantic Status Colors
  success: '#10B981',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#065F46',

  // Channel Tags (Online vs Offline, B2B vs B2C)
  b2b: '#EA580C',
  b2bBg: '#FFF7ED',
  b2c: '#2563EB',
  b2cBg: '#EFF6FF',
  both: '#059669',
  bothBg: '#ECFDF5',

  // Radius Scale
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusXl: '20px',
  radiusFull: '9999px',

  // Elevation Shadows (TriShopping Clean SaaS Style)
  shadowSm: '0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowMd: '0 4px 16px rgba(15, 23, 42, 0.06)',
  shadowLg: '0 10px 28px rgba(15, 23, 42, 0.08)',
  shadowModal: '0 20px 48px rgba(15, 23, 42, 0.16)',

  // Spacing & Layout
  sidebarWidth: 256,
  topBarHeight: 68,
  mobileNavHeight: 64,
  maxContentWidth: 1400,
};

// Reusable standard styles
export const cardSx = {
  bgcolor: T.surface,
  borderRadius: T.radiusLg,
  border: `1px solid ${T.border}`,
  boxShadow: T.shadowSm,
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
};

export const cardHoverSx = {
  ...cardSx,
  '&:hover': {
    boxShadow: T.shadowMd,
    borderColor: T.borderHover,
    transform: 'translateY(-1px)',
  },
};

export const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: T.radiusSm,
    bgcolor: T.surface,
    fontSize: '0.9rem',
    color: T.text,
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderHover },
    '&.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { color: T.textSecondary, '&.Mui-focused': { color: T.primary } },
};

export const primaryBtnSx = {
  bgcolor: T.primary,
  color: '#FFFFFF',
  borderRadius: T.radiusSm,
  textTransform: 'none',
  fontWeight: 700,
  px: 2.5,
  py: 1.1,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: T.primaryHover,
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
  },
};

export const secondaryBtnSx = {
  bgcolor: T.surface,
  color: T.text,
  border: `1px solid ${T.border}`,
  borderRadius: T.radiusSm,
  textTransform: 'none',
  fontWeight: 600,
  px: 2.2,
  py: 1,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: T.surfaceAlt,
    borderColor: T.borderHover,
  },
};

export const pillBadgeSx = (bg, color, borderColor) => ({
  bgcolor: bg || T.surfaceAlt,
  color: color || T.textSecondary,
  border: borderColor ? `1px solid ${borderColor}` : 'none',
  borderRadius: T.radiusFull,
  fontWeight: 700,
  fontSize: '0.75rem',
  px: 1.25,
  py: 0.4,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
});
