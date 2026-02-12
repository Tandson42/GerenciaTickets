import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../themes/spacing';

function getVariantStyles(colors, variant) {
  const map = {
    primary: { bg: colors.primary, text: colors.textInverse, bgPressed: colors.primaryDark },
    secondary: { bg: colors.primaryBg, text: colors.primary, bgPressed: colors.primaryBorder },
    success: { bg: colors.success, text: colors.textInverse, bgPressed: colors.successDark },
    warning: { bg: colors.warning, text: colors.textInverse, bgPressed: colors.warningDark },
    danger: { bg: colors.error, text: colors.white, bgPressed: colors.errorDark },
    ghost: { bg: 'transparent', text: colors.textSecondary, bgPressed: colors.surfaceHover },
    outline: { bg: 'transparent', text: colors.primary, bgPressed: colors.primaryBg },
  };
  return map[variant] || map.primary;
}

const SIZES = {
  sm: { paddingV: 6, paddingH: 12, fontSize: 13, iconSize: 14 },
  md: { paddingV: 10, paddingH: 18, fontSize: 14, iconSize: 16 },
  lg: { paddingV: 14, paddingH: 24, fontSize: 16, iconSize: 18 },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  const v = getVariantStyles(colors, variant);
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  const bg = pressed && !isDisabled ? v.bgPressed : v.bg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs + 2,
          backgroundColor: bg,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          borderRadius: radius.md,
          opacity: isDisabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? colors.border : 'transparent',
        },
        fullWidth && { width: '100%' },
        Platform.OS === 'web' && {
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s ease, opacity 0.15s ease',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && (
            <Text style={{ fontSize: s.iconSize, color: v.text }}>{icon}</Text>
          )}
          {children != null && (
            <Text style={{
              fontSize: s.fontSize,
              fontWeight: '600',
              color: v.text,
              letterSpacing: -0.2,
            }}>
              {children}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
