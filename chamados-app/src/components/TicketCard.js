import React from 'react';
import { TouchableOpacity, View, Text, Platform } from 'react-native';
import StatusBadge from './StatusBadge';
import PrioridadeBadge from './PrioridadeBadge';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';

export default function TicketCard({ ticket, onPress }) {
  const { colors, shadows } = useTheme();
  const { isDesktop } = useResponsive();

  const formattedDate = ticket.created_at
    ? new Date(ticket.created_at).toLocaleDateString('pt-BR')
    : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md + 4,
          marginHorizontal: spacing.md,
          marginVertical: spacing.xs + 2,
        },
        shadows.md,
        isDesktop && {
          flex: 1,
          margin: spacing.sm,
          padding: spacing.lg,
          maxWidth: '33%',
        },
        Platform.OS === 'web' && {
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
      ]}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={{ ...typography.caption, color: colors.textTertiary }}>
          #{ticket.id}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textTertiary }}>
          {formattedDate}
        </Text>
      </View>

      {/* Title */}
      <Text
        numberOfLines={2}
        style={{
          ...typography.bodyMedium,
          color: colors.textPrimary,
          marginBottom: spacing.sm + 4,
        }}
      >
        {ticket.titulo}
      </Text>

      {/* Badges */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        <StatusBadge status={ticket.status} size="sm" />
        <PrioridadeBadge prioridade={ticket.prioridade} size="sm" />
      </View>

      {/* Solicitante */}
      <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm + 2 }}>
        {ticket.solicitante?.name || 'Sem solicitante'}
      </Text>
    </TouchableOpacity>
  );
}
