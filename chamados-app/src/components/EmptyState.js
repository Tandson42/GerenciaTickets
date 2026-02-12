import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../themes/typography';
import { spacing } from '../themes/spacing';

export default function EmptyState({
  title = 'Nenhum chamado encontrado',
  subtitle = 'Tente ajustar os filtros ou crie um novo chamado.',
  icon = '📭',
}) {
  const { colors } = useTheme();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing['3xl'],
      paddingHorizontal: spacing.xl,
    }}>
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{icon}</Text>
      <Text style={{
        ...typography.h3,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
      }}>
        {title}
      </Text>
      <Text style={{
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
      }}>
        {subtitle}
      </Text>
    </View>
  );
}
