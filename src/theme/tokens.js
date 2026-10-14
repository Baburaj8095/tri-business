/**
 * Trikonekt Business Design Tokens
 * Centralized design system for premium modern B2B/B2C merchant platform.
 */

export const T = {
  // Brand Palette (Exact Specifications)
  primary: '#FF6508',        // Primary orange
  primaryDark: '#E9570A',    // Deep orange
  primaryHover: '#E9570A',
  primaryLight: '#FFF3E8',   // Soft orange surface
  primaryAccent: '#F2A900',  // Warning amber highlight
  primaryGradient: 'linear-gradient(135deg, #FF6508 0%, #E9570A 100%)',
  primaryGradientSubtle: 'linear-gradient(135deg, rgba(255,101,8,0.08) 0%, rgba(233,87,10,0.03) 100%)',

  // Neutrals Canvas
  bg: '#F4F7FB',             // Main background
  surface: '#FFFFFF',        // Card background
  surfaceAlt: '#F1F5F9',     // Secondary surface
  surfaceHover: '#F8FAFC',
  border: '#E4EAF2',         // Subtle card/table border
  borderHover: '#CBD5E1',
  borderFocus: '#FF6508',

  // Typography
  text: '#17233D',           // Dark navy primary text
  textSecondary: '#64748B',  // Secondary text
  textMuted: '#94A3B8',      // Muted slate captions
  textInverse: '#FFFFFF',

  // Semantic Status Colors
  success: '#159A65',        // Success green
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#065F46',

  warning: '#F2A900',        // Warning amber
  warningBg: '#FEFCE8',
  warningBorder: '#FEF08A',
  warningText: '#854D0E',

  error: '#E5484D',          // Error red
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#991B1B',

  blue: '#3678E5',           // Supporting blue
  blueBg: '#EFF6FF',
  purple: '#8758E8',         // Supporting purple
  purpleBg: '#F5F3FF',

  // Channel Tags (Online vs Offline, B2B vs B2C)
  b2b: '#FF6508',
  b2bBg: '#FFF3E8',
  b2c: '#3678E5',
  b2cBg: '#EFF6FF',
  both: '#159A65',
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

  // Supplied Premium Vector Assets (from trikonekt_merchant_ui_assets)
  assets: {
    bgWarmIvory: '/assets/backgrounds/merchant-home-warm-ivory.svg',
    bgSoftGradient: '/assets/backgrounds/merchant-home-soft-gradient.svg',
    patternCommerce: '/assets/patterns/commerce-line-pattern.svg',
    bannerPrime: '/assets/banners/prime-promotion-background.svg',
    bannerDeals: '/assets/banners/special-deals-background.svg',
    bannerAds: '/assets/banners/ads-campaign-background.svg',
  },
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
