import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../themes/spacing';

function getVariantColors(colors, variant) {
  const map = {
    success: { bg: colors.successLight, text: colors.success, dot: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning, dot: colors.warning },
    error: { bg: colors.errorLight, text: colors.error, dot: colors.error },
    info: { bg: colors.infoLight, text: colors.info, dot: colors.info },
    neutral: { bg: colors.surfaceHover, text: colors.textSecondary, dot: colors.textTertiary },
    primary: { bg: colors.primaryBg, text: colors.primary, dot: colors.primary },
  };
  return map[variant] || map.neutral;
}

const SIZES = {
  sm: { paddingV: 2, paddingH: 6, fontSize: 10, dotSize: 5 },
  md: { paddingV: 3, paddingH: 10, fontSize: 11, dotSize: 6 },
  lg: { paddingV: 5, paddingH: 14, fontSize: 13, dotSize: 7 },
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  showDot = false,
}) {
  const { colors } = useTheme();
  const v = getVariantColors(colors, variant);
  const s = SIZES[size] || SIZES.md;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: v.bg,
      paddingVertical: s.paddingV,
      paddingHorizontal: s.paddingH,
      borderRadius: radius.full,
      gap: spacing.xs,
    }}>
      {showDot && (
        <View style={{
          width: s.dotSize,
          height: s.dotSize,
          borderRadius: s.dotSize / 2,
          backgroundColor: v.dot,
        }} />
      )}
      <Text style={{
        fontSize: s.fontSize,
        fontWeight: '600',
        color: v.text,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
      }}>
        {children}
      </Text>
    </View>
  );
}
