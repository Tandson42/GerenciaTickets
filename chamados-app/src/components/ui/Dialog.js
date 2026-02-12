import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../themes/spacing';
import { typography } from '../../themes/typography';

export default function Dialog({
  visible,
  title,
  message,
  onClose,
  actions = [],
  children,
}) {
  const { colors, shadows } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.overlay,
          padding: spacing.lg,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
              width: '100%',
              maxWidth: 400,
            },
            shadows.lg,
          ]}
        >
          {title && (
            <Text style={{
              ...typography.h3,
              color: colors.textPrimary,
              marginBottom: spacing.sm,
            }}>
              {title}
            </Text>
          )}
          {message && (
            <Text style={{
              ...typography.body,
              color: colors.textSecondary,
              marginBottom: spacing.md,
            }}>
              {message}
            </Text>
          )}
          {children}
          {actions.length > 0 && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: spacing.sm,
              marginTop: spacing.md,
            }}>
              {actions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={action.onPress}
                  style={[
                    {
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: action.variant === 'danger'
                        ? colors.errorLight
                        : action.variant === 'primary'
                        ? colors.primary
                        : 'transparent',
                    },
                    Platform.OS === 'web' && { cursor: 'pointer' },
                  ]}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: action.variant === 'primary'
                      ? colors.textInverse
                      : action.variant === 'danger'
                      ? colors.error
                      : colors.textSecondary,
                  }}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
