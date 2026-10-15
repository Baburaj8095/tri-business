/**
 * Trikonekt Business Design Tokens
 * Centralized design system for premium modern B2B/B2C merchant platform.
 */

export const T = {
  // Brand Palette (User Specified: #0B8063 primary brand, #FF6B00 highlight CTA)
  primary: '#0B8063',        // Primary business brand emerald
  primaryDark: '#086951',    // Deep emerald
  primaryHover: '#086951',
  primaryLight: '#E6F5F0',   // Soft brand surface
  primaryAccent: '#FF6B00',  // Trikonekt Orange for key highlights & CTAs
  primaryGradient: 'linear-gradient(135deg, #0B8063 0%, #086951 100%)',
  primaryGradientSubtle: 'linear-gradient(135deg, rgba(11,128,99,0.06) 0%, rgba(8,105,81,0.02) 100%)',

  // Highlight Orange (used sparingly for promo badges and prime CTAs)
  orange: '#FF6B00',
  orangeDark: '#E55F00',
  orangeHover: '#E55F00',
  orangeLight: '#FFF3E8',

  // Neutrals Canvas (Clean Premium Light Theme)
  bg: '#F7F9FC',             // Clean light page background
  surface: '#FFFFFF',        // Card background
  surfaceAlt: '#F8FAFC',     // Secondary surface
  surfaceHover: '#F1F5F9',
  border: '#E2E8F0',         // Clean subtle border
  borderHover: '#CBD5E1',
  borderFocus: '#0B8063',

  // Typography
  text: '#172B4D',           // Primary dark text
  textSecondary: '#64748B',  // Secondary text
  textMuted: '#94A3B8',      // Muted slate captions
  textInverse: '#FFFFFF',

  // Semantic Status Colors (only genuine status)
  success: '#159A65',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#065F46',

  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#92400E',

  error: '#EF4444',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#991B1B',

  blue: '#3B82F6',
  blueBg: '#EFF6FF',
  purple: '#8B5CF6',
  purpleBg: '#F5F3FF',

  // Channel Tags
  b2b: '#0B8063',
  b2bBg: '#E6F5F0',
  b2c: '#3B82F6',
  b2cBg: '#EFF6FF',
  both: '#159A65',
  bothBg: '#ECFDF5',

  // Radius Scale (16px standard card radius)
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusCard: '16px',
  radiusXl: '20px',
  radiusFull: '9999px',

  // Elevation Shadows (Restrained, subtle, no heavy glow)
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.05)',
  shadowCard: '0 1px 3px rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 8px 24px rgba(0, 0, 0, 0.08)',
  shadowModal: '0 20px 48px rgba(15, 23, 42, 0.16)',

  // Spacing & Layout
  sidebarWidth: 256,
  topBarHeight: 68,
  mobileNavHeight: 64,
  maxContentWidth: 1400,

  // Assets
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
  bgcolor: '#FFFFFF',
  borderRadius: '16px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.15s ease-in-out',
  overflow: 'hidden',
};

export const cardHoverSx = {
  ...cardSx,
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    borderColor: '#CBD5E1',
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
