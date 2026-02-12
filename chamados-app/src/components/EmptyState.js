import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing } from '../themes/spacing';
import { useResponsive } from '../hooks/useResponsive';

export default function EmptyState({
  message = 'Nenhum chamado encontrado.',
  emoji = '📋',
  subtitle = 'Tente ajustar os filtros ou crie um novo chamado.',
}) {
  const { isDesktop } = useResponsive();

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  containerDesktop: {
    paddingVertical: 120,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
