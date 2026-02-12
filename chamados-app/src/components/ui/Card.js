import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../../themes/colors';
import { spacing, radius, shadows } from '../../themes/spacing';

export default function Card({
  children,
  elevation = 'md',
  padding = spacing.lg,
  style,
  noPadding = false,
}) {
  const shadow = shadows[elevation] || shadows.md;

  return (
    <View
      style={[
        styles.card,
        shadow,
        {
          padding: noPadding ? 0 : padding,
        },
        Platform.OS === 'web' && styles.webHover,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 4,
  },
  webHover: {
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
});
