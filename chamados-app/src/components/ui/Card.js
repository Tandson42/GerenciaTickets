import React from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../themes/spacing';

export default function Card({
  children,
  elevation = 'md',
  padding = spacing.lg,
  style,
  noPadding = false,
  glow = false,
}) {
  const { colors, shadows } = useTheme();
  const shadow = glow ? shadows.glow : (shadows[elevation] || shadows.md);

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.sm + 4,
          padding: noPadding ? 0 : padding,
        },
        shadow,
        Platform.OS === 'web' && {
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
