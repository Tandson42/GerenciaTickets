import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import StatusBadge from './StatusBadge';
import PrioridadeBadge from './PrioridadeBadge';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing, radius, shadows } from '../themes/spacing';

export default function TicketCard({ ticket, onPress }) {
  const { isDesktop } = useResponsive();
  const createdAt = new Date(ticket.created_at).toLocaleDateString('pt-BR');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDesktop && styles.cardDesktop,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.id}>#{ticket.id}</Text>
        <Text style={styles.date}>{createdAt}</Text>
      </View>

      {/* Title */}
      <Text style={styles.titulo} numberOfLines={isDesktop ? 3 : 2}>
        {ticket.titulo}
      </Text>

      {/* Description */}
      <Text style={styles.descricao} numberOfLines={2}>
        {ticket.descricao}
      </Text>

      {/* Badges */}
      <View style={styles.badges}>
        <StatusBadge status={ticket.status} size="sm" />
        <PrioridadeBadge prioridade={ticket.prioridade} size="sm" />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.person} numberOfLines={1}>
          👤 {ticket.solicitante?.name || 'N/A'}
        </Text>
        {ticket.responsavel && (
          <Text style={styles.person} numberOfLines={1}>
            🔧 {ticket.responsavel.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs + 2,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardDesktop: {
    flex: 1,
    margin: spacing.sm,
    padding: spacing.lg,
    ...shadows.md,
    ...(Platform.OS === 'web'
      ? { cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }
      : {}),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  id: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  titulo: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  descricao: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm + 4,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm + 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm + 2,
  },
  person: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
