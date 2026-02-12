import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../../themes/colors';
import { typography } from '../../themes/typography';
import { spacing, radius, shadows } from '../../themes/spacing';

export default function Dialog({
  visible,
  title,
  children,
  actions = [],
  onClose,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.content, Platform.OS === 'web' && styles.contentWeb]}
          onPress={(e) => e.stopPropagation()}
        >
          {title && <Text style={styles.title}>{title}</Text>}
          <View style={styles.body}>{children}</View>
          {actions.length > 0 && (
            <View style={styles.actions}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    action.variant === 'primary' && styles.actionPrimary,
                    action.variant === 'danger' && styles.actionDanger,
                  ]}
                  onPress={action.onPress}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.variant === 'primary' && styles.actionTextPrimary,
                      action.variant === 'danger' && styles.actionTextDanger,
                    ]}
                  >
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    ...shadows.xl,
  },
  contentWeb: {
    transition: 'transform 0.2s ease',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionDanger: {
    backgroundColor: colors.errorLight,
  },
  actionText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
  },
  actionTextPrimary: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  actionTextDanger: {
    color: colors.error,
    fontWeight: '700',
  },
});
