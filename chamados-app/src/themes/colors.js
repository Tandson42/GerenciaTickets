// ========== DARK MODE ==========
const dark = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  primaryBg: 'rgba(99,102,241,0.12)',
  primaryBorder: 'rgba(99,102,241,0.25)',

  secondary: '#A78BFA',
  secondaryLight: '#C4B5FD',
  secondaryBg: 'rgba(167,139,250,0.1)',

  success: '#34D399',
  successLight: 'rgba(52,211,153,0.15)',
  successDark: '#10B981',
  successBorder: 'rgba(52,211,153,0.3)',

  warning: '#FBBF24',
  warningLight: 'rgba(251,191,36,0.15)',
  warningDark: '#F59E0B',
  warningBorder: 'rgba(251,191,36,0.3)',

  error: '#F87171',
  errorLight: 'rgba(248,113,113,0.15)',
  errorDark: '#EF4444',
  errorBorder: 'rgba(248,113,113,0.3)',

  info: '#60A5FA',
  infoLight: 'rgba(96,165,250,0.15)',
  infoDark: '#3B82F6',
  infoBorder: 'rgba(96,165,250,0.3)',

  gray50: '#1A1A2E',
  gray100: '#1E1E32',
  gray200: '#2A2A3E',
  gray300: '#3A3A4E',
  gray400: '#5A5A70',
  gray500: '#7A7A90',
  gray600: '#9A9AB0',
  gray700: '#B0B0C0',
  gray800: '#D0D0DD',
  gray900: '#EEEEF5',

  background: '#0F0F1A',
  backgroundAlt: '#13132B',
  surface: '#1A1A2E',
  surfaceElevated: '#22223A',
  surfaceHover: '#2A2A42',
  overlay: 'rgba(0,0,0,0.65)',

  gradientStart: '#0F0F1A',
  gradientMid: '#1A1040',
  gradientEnd: '#0F0F1A',

  textPrimary: '#EEEEF5',
  textSecondary: '#9A9AB0',
  textTertiary: '#6A6A80',
  textInverse: '#0F0F1A',
  textMuted: '#5A5A70',

  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  borderFocus: '#818CF8',
  borderSubtle: 'rgba(255,255,255,0.04)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ========== LIGHT MODE ==========
const light = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryBg: 'rgba(99,102,241,0.08)',
  primaryBorder: 'rgba(99,102,241,0.2)',

  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryBg: 'rgba(139,92,246,0.08)',

  success: '#10B981',
  successLight: 'rgba(16,185,129,0.1)',
  successDark: '#059669',
  successBorder: 'rgba(16,185,129,0.2)',

  warning: '#F59E0B',
  warningLight: 'rgba(245,158,11,0.1)',
  warningDark: '#D97706',
  warningBorder: 'rgba(245,158,11,0.2)',

  error: '#EF4444',
  errorLight: 'rgba(239,68,68,0.08)',
  errorDark: '#DC2626',
  errorBorder: 'rgba(239,68,68,0.2)',

  info: '#3B82F6',
  infoLight: 'rgba(59,130,246,0.08)',
  infoDark: '#2563EB',
  infoBorder: 'rgba(59,130,246,0.2)',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  background: '#F5F5FA',
  backgroundAlt: '#ECECF4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F3F4F6',
  overlay: 'rgba(0,0,0,0.4)',

  gradientStart: '#F5F5FA',
  gradientMid: '#E8E0F0',
  gradientEnd: '#F5F5FA',

  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textMuted: '#9CA3AF',

  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.05)',
  borderFocus: '#6366F1',
  borderSubtle: 'rgba(0,0,0,0.04)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Export both palettes
export const palettes = { dark, light };

// Default export for backward compatibility — will be overridden by ThemeContext
export const colors = dark;

// Status color mapping (theme-aware)
export function getStatusColors(c) {
  return {
    ABERTO: { bg: c.infoLight, text: c.info, border: c.infoBorder },
    EM_ANDAMENTO: { bg: c.warningLight, text: c.warning, border: c.warningBorder },
    RESOLVIDO: { bg: c.successLight, text: c.success, border: c.successBorder },
  };
}

export function getPrioridadeColors(c) {
  return {
    BAIXA: { bg: 'rgba(156,163,175,0.12)', text: c.gray600, border: 'rgba(156,163,175,0.25)' },
    MEDIA: { bg: c.warningLight, text: c.warning, border: c.warningBorder },
    ALTA: { bg: c.errorLight, text: c.error, border: c.errorBorder },
  };
}

// Legacy exports for backward compat
export const statusColors = getStatusColors(dark);
export const prioridadeColors = getPrioridadeColors(dark);
