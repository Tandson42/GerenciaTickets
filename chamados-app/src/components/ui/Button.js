import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';
import { typography } from '../../themes/typography';
import { radius } from '../../themes/spacing';

const VARIANTS = {
  primary: {
    bg: colors.primary,
    text: colors.textInverse,
    bgPressed: colors.primaryDark,
  },
  secondary: {
    bg: colors.primaryBg,
    text: colors.primary,
    bgPressed: '#DDE1FD',
  },
  success: {
    bg: colors.success,
    text: colors.textInverse,
    bgPressed: colors.successDark,
  },
  warning: {
    bg: colors.warning,
    text: colors.textInverse,
    bgPressed: colors.warningDark,
  },
  outline: {
    bg: 'transparent',
    text: colors.primary,
    bgPressed: colors.primaryBg,
  },
  danger: {
    bg: colors.errorLight,
    text: colors.error,
    bgPressed: '#FECACA',
  },
  ghost: {
    bg: 'transparent',
    text: colors.textSecondary,
    bgPressed: colors.gray100,
  },
};

const SIZES = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16 },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onPress,
  style,
  textStyle,
  fullWidth = false,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        },
        variant === 'danger' && { borderWidth: 1, borderColor: '#FECACA' },
        fullWidth && { width: '100%' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <Text style={{ marginRight: 6, fontSize: s.fontSize }}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              { color: v.text, fontSize: s.fontSize },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  text: {
    ...typography.button,
  },
  disabled: {
    opacity: 0.6,
  },
});
