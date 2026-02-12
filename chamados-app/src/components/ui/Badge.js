import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../../themes/typography';
import { radius } from '../../themes/spacing';

const VARIANTS = {
  info: { bg: '#DBEAFE', text: '#2563EB', border: '#3B82F6' },
  success: { bg: '#D1FAE5', text: '#059669', border: '#10B981' },
  warning: { bg: '#FEF3C7', text: '#D97706', border: '#F59E0B' },
  error: { bg: '#FEE2E2', text: '#DC2626', border: '#EF4444' },
  neutral: { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  primary: { bg: '#EEF2FF', text: '#4F46E5', border: '#6366F1' },
};

const SIZES = {
  sm: { paddingH: 6, paddingV: 2, fontSize: 10, dotSize: 5 },
  md: { paddingH: 10, paddingV: 4, fontSize: 12, dotSize: 6 },
  lg: { paddingH: 14, paddingV: 6, fontSize: 14, dotSize: 8 },
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  showDot = false,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const s = SIZES[size] || SIZES.md;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: v.border,
              width: s.dotSize,
              height: s.dotSize,
              borderRadius: s.dotSize / 2,
            },
          ]}
        />
      )}
      <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 6,
  },
  text: {
    ...typography.captionMedium,
  },
});
