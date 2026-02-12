import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';
import PrioridadeBadge from '../components/PrioridadeBadge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Dialog from '../components/ui/Dialog';
import { STATUS_OPTIONS } from '../utils/constants';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await ticketService.show(ticketId);
      setTicket(response.data.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o chamado.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTicket();
    }, [fetchTicket])
  );

  async function handleStatusChange(newStatus) {
    setStatusModalVisible(false);
    setUpdating(true);
    try {
      const response = await ticketService.updateStatus(ticketId, newStatus);
      setTicket(response.data.data);
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao atualizar status.';
      Alert.alert('Erro', message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ticketService.delete(ticketId);
              Alert.alert('Sucesso', 'Chamado excluído.');
              navigation.goBack();
            } catch (error) {
              const message = error.response?.status === 403
                ? 'Você não tem permissão para excluir este chamado.'
                : 'Erro ao excluir chamado.';
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  }

  const isOwnerOrAdmin = ticket && (user?.role === 'admin' || user?.id === ticket.solicitante?.id);
  const canEdit = isOwnerOrAdmin;
  const canChangeStatus = isOwnerOrAdmin;
  const canDelete = isOwnerOrAdmin;
  const statusOptions = STATUS_OPTIONS.filter(s => s.value && s.value !== ticket?.status);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ticket) return null;

  // Main content - ticket info
  const mainContent = (
    <View style={[styles.mainContent, isDesktop && styles.mainContentDesktop]}>
      {/* Header Card */}
      <Card elevation="md">
        <View style={styles.headerTop}>
          <Text style={styles.ticketId}>Chamado #{ticket.id}</Text>
          <Text style={styles.date}>
            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <Text style={styles.titulo}>{ticket.titulo}</Text>
        <View style={styles.badges}>
          <StatusBadge status={ticket.status} />
          <PrioridadeBadge prioridade={ticket.prioridade} />
        </View>
      </Card>

      {/* Description */}
      <Card elevation="sm">
        <Text style={styles.cardTitle}>📝 Descrição</Text>
        <Text style={styles.descricao}>{ticket.descricao}</Text>
      </Card>

      {/* People */}
      <Card elevation="sm">
        <Text style={styles.cardTitle}>👥 Pessoas</Text>
        <View style={styles.infoGrid}>
          <InfoRow label="Solicitante" value={ticket.solicitante?.name || 'N/A'} />
          <InfoRow label="Responsável" value={ticket.responsavel?.name || 'Não atribuído'} />
          {ticket.resolved_at && (
            <InfoRow
              label="Resolvido em"
              value={new Date(ticket.resolved_at).toLocaleString('pt-BR')}
            />
          )}
        </View>
      </Card>

      {/* Mobile-only: actions below content */}
      {!isDesktop && (canChangeStatus || canEdit || canDelete) && (
        <ActionsSection
          canChangeStatus={canChangeStatus}
          canEdit={canEdit}
          canDelete={canDelete}
          updating={updating}
          onStatusPress={() => setStatusModalVisible(true)}
          onEditPress={() => navigation.navigate('TicketCreate', { ticket })}
          onDeletePress={handleDelete}
        />
      )}
    </View>
  );

  // Sidebar content - logs + actions (desktop)
  const sidebarContent = (
    <View style={[styles.sidebar, isDesktop && styles.sidebarDesktop]}>
      {/* Desktop-only: actions in sidebar */}
      {isDesktop && (canChangeStatus || canEdit || canDelete) && (
        <Card elevation="sm">
          <Text style={styles.cardTitle}>⚡ Ações</Text>
          <View style={styles.sidebarActions}>
            {canChangeStatus && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                loading={updating}
                icon="🔄"
                onPress={() => setStatusModalVisible(true)}
              >
                Alterar Status
              </Button>
            )}
            {canEdit && (
              <Button
                variant="warning"
                size="md"
                fullWidth
                icon="✏️"
                onPress={() => navigation.navigate('TicketCreate', { ticket })}
              >
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                size="md"
                fullWidth
                icon="🗑️"
                onPress={handleDelete}
              >
                Excluir
              </Button>
            )}
          </View>
        </Card>
      )}

      {/* Logs */}
      {ticket.logs && ticket.logs.length > 0 && (
        <Card elevation="sm">
          <Text style={styles.cardTitle}>📋 Histórico</Text>
          {ticket.logs.map((log, index) => (
            <View
              key={log.id}
              style={[
                styles.logItem,
                index === ticket.logs.length - 1 && { marginBottom: 0 },
              ]}
            >
              <View style={styles.logTimeline}>
                <View style={styles.logDot} />
                {index < ticket.logs.length - 1 && <View style={styles.logLine} />}
              </View>
              <View style={styles.logContent}>
                <View style={styles.logBadges}>
                  <StatusBadge status={log.de || 'ABERTO'} size="sm" />
                  <Text style={styles.logArrow}>→</Text>
                  <StatusBadge status={log.para} size="sm" />
                </View>
                <Text style={styles.logMeta}>
                  por {log.user?.name || `User #${log.user_id}`}
                </Text>
                <Text style={styles.logDate}>
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop,
      ]}
    >
      {isDesktop ? (
        <View style={styles.splitView}>
          {mainContent}
          {sidebarContent}
        </View>
      ) : (
        <>
          {mainContent}
          {sidebarContent}
        </>
      )}

      {/* Status Change Dialog */}
      <Dialog
        visible={statusModalVisible}
        title="Alterar Status"
        onClose={() => setStatusModalVisible(false)}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.statusOption}
            onPress={() => handleStatusChange(option.value)}
          >
            <StatusBadge status={option.value} size="lg" />
          </TouchableOpacity>
        ))}
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => setStatusModalVisible(false)}
          style={{ marginTop: spacing.sm }}
        >
          Cancelar
        </Button>
      </Dialog>
    </ScrollView>
  );
}

// Sub-components

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionsSection({ canChangeStatus, canEdit, canDelete, updating, onStatusPress, onEditPress, onDeletePress }) {
  return (
    <View style={styles.actionsCard}>
      {canChangeStatus && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={updating}
          icon="🔄"
          onPress={onStatusPress}
        >
          Alterar Status
        </Button>
      )}
      {canEdit && (
        <Button
          variant="warning"
          size="lg"
          fullWidth
          icon="✏️"
          onPress={onEditPress}
          style={{ marginTop: spacing.sm + 2 }}
        >
          Editar
        </Button>
      )}
      {canDelete && (
        <Button
          variant="danger"
          size="lg"
          fullWidth
          icon="🗑️"
          onPress={onDeletePress}
          style={{ marginTop: spacing.sm + 2 }}
        >
          Excluir
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl + 8 },
  contentDesktop: {
    padding: spacing.xl,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Split view
  splitView: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  mainContent: {
    flex: 1,
  },
  mainContentDesktop: {
    flex: 3,
  },
  sidebar: {},
  sidebarDesktop: {
    flex: 2,
    position: 'sticky',
    top: spacing.lg,
    alignSelf: 'flex-start',
  },

  // Header
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
  },
  ticketId: {
    ...typography.smallMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  titulo: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm + 4,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Card title
  cardTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm + 4,
    fontWeight: '700',
  },
  descricao: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Info
  infoGrid: {},
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.small,
    color: colors.textSecondary,
    width: 110,
  },
  infoValue: {
    ...typography.smallMedium,
    color: colors.textPrimary,
    flex: 1,
  },

  // Logs
  logItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  logTimeline: {
    alignItems: 'center',
    width: 20,
    marginRight: spacing.sm + 4,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  logLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gray200,
    marginTop: 4,
  },
  logContent: {
    flex: 1,
  },
  logBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  logArrow: {
    ...typography.small,
    color: colors.textTertiary,
    fontWeight: '700',
  },
  logMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logDate: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 1,
  },

  // Actions
  actionsCard: {
    marginTop: spacing.sm,
  },
  sidebarActions: {
    gap: spacing.sm,
  },

  // Status dialog
  statusOption: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
});
