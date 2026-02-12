export const colors = {
  // Brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryBg: '#EEF2FF',

  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryBg: '#F5F3FF',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Gray scale
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

  // Backgrounds
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceHover: '#F3F4F6',
  overlay: 'rgba(0,0,0,0.5)',

  // Text
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderFocus: '#6366F1',
};

// Status-specific color mapping
export const statusColors = {
  ABERTO: { bg: colors.infoLight, text: colors.info, border: colors.info },
  EM_ANDAMENTO: { bg: colors.warningLight, text: colors.warningDark, border: colors.warning },
  RESOLVIDO: { bg: colors.successLight, text: colors.successDark, border: colors.success },
};

// Prioridade-specific color mapping
export const prioridadeColors = {
  BAIXA: { bg: '#F3F4F6', text: colors.gray600, border: colors.gray400 },
  MEDIA: { bg: colors.warningLight, text: colors.warningDark, border: colors.warning },
  ALTA: { bg: colors.errorLight, text: colors.errorDark, border: colors.error },
};
