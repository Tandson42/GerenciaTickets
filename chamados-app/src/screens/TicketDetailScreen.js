import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';
import PrioridadeBadge from '../components/PrioridadeBadge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Dialog from '../components/ui/Dialog';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';
import { STATUS_OPTIONS, PRIORIDADE_OPTIONS } from '../utils/constants';

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const { colors, shadows } = useTheme();
  const { isDesktop } = useResponsive();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const isOwnerOrAdmin = ticket && (user?.role === 'admin' || user?.id === ticket.solicitante?.id);
  const canEdit = isOwnerOrAdmin;
  const canChangeStatus = isOwnerOrAdmin;
  const canDelete = isOwnerOrAdmin;
  const statusOptions = STATUS_OPTIONS.filter(s => s.value && s.value !== ticket?.status);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await ticketService.show(ticketId);
      setTicket(response.data.data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o chamado.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(useCallback(() => { fetchTicket(); }, [fetchTicket]));

  async function handleStatusChange(newStatus) {
    setStatusLoading(true);
    setShowStatusModal(false);
    try {
      await ticketService.updateStatus(ticketId, newStatus);
      await fetchTicket();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao atualizar status.');
    } finally {
      setStatusLoading(false);
    }
  }

  function startEditing() {
    setEditData({ titulo: ticket.titulo, descricao: ticket.descricao, prioridade: ticket.prioridade });
    setEditing(true);
  }

  async function handleSaveEdit() {
    setEditLoading(true);
    try {
      await ticketService.update(ticketId, editData);
      setEditing(false);
      await fetchTicket();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert('Confirmar Exclusão', 'Deseja realmente excluir este chamado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await ticketService.delete(ticketId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Erro', err.response?.data?.message || 'Erro ao excluir.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ticket) return null;

  const formattedDate = (d) => d ? new Date(d).toLocaleString('pt-BR') : '—';

  // ---- CONTENT SECTIONS ----
  const ticketContent = (
    <View style={{ flex: isDesktop ? 3 : undefined }}>
      {/* Title + badges */}
      <Card>
        {editing ? (
          <>
            <Input label="Título" value={editData.titulo} onChangeText={v => setEditData({ ...editData, titulo: v })} maxLength={120} />
            <Input label="Descrição" value={editData.descricao} onChangeText={v => setEditData({ ...editData, descricao: v })} multiline numberOfLines={5} maxLength={2000} />
            <Text style={{ ...typography.captionMedium, color: colors.textSecondary, marginBottom: spacing.xs + 2 }}>PRIORIDADE</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              {PRIORIDADE_OPTIONS.filter(o => o.value).map(o => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => setEditData({ ...editData, prioridade: o.value })}
                  style={{
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.sm + 4,
                    borderRadius: radius.md,
                    backgroundColor: editData.prioridade === o.value ? colors.primaryBg : colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: editData.prioridade === o.value ? colors.primaryBorder : colors.border,
                  }}
                >
                  <Text style={{
                    ...typography.small,
                    color: editData.prioridade === o.value ? colors.primary : colors.textSecondary,
                    fontWeight: editData.prioridade === o.value ? '600' : '400',
                  }}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button variant="primary" loading={editLoading} onPress={handleSaveEdit}>Salvar</Button>
              <Button variant="ghost" onPress={() => setEditing(false)}>Cancelar</Button>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
              <Text style={{ ...typography.caption, color: colors.textTertiary }}>#{ticket.id}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <StatusBadge status={ticket.status} />
                <PrioridadeBadge prioridade={ticket.prioridade} />
              </View>
            </View>
            <Text style={{ ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm + 4 }}>
              {ticket.titulo}
            </Text>
            <Text style={{ ...typography.body, color: colors.textSecondary, lineHeight: 24 }}>
              {ticket.descricao}
            </Text>
          </>
        )}
      </Card>

      {/* Metadata */}
      <Card>
        <Text style={{ ...typography.captionMedium, color: colors.textTertiary, marginBottom: spacing.sm + 4 }}>
          INFORMAÇÕES
        </Text>
        {[
          ['Solicitante', ticket.solicitante?.name || '—'],
          ['Criado em', formattedDate(ticket.created_at)],
          ['Atualizado em', formattedDate(ticket.updated_at)],
          ['Resolvido em', ticket.resolved_at ? formattedDate(ticket.resolved_at) : '—'],
        ].map(([label, value], i) => (
          <View key={i} style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: spacing.xs + 2,
            borderBottomWidth: i < 3 ? 1 : 0,
            borderBottomColor: colors.borderSubtle,
          }}>
            <Text style={{ ...typography.small, color: colors.textTertiary }}>{label}</Text>
            <Text style={{ ...typography.small, color: colors.textPrimary, fontWeight: '500' }}>{value}</Text>
          </View>
        ))}
      </Card>
    </View>
  );

  const sidebar = (
    <View style={{ flex: isDesktop ? 1 : undefined }}>
      {/* Actions */}
      {(canChangeStatus || canEdit || canDelete) && (
        <Card>
          <Text style={{ ...typography.captionMedium, color: colors.textTertiary, marginBottom: spacing.sm + 4 }}>
            AÇÕES
          </Text>
          <View style={{ gap: spacing.sm }}>
            {canChangeStatus && (
              <Button variant="outline" fullWidth loading={statusLoading} onPress={() => setShowStatusModal(true)}>
                🔄 Alterar Status
              </Button>
            )}
            {canEdit && !editing && (
              <Button variant="secondary" fullWidth onPress={startEditing}>
                ✏️ Editar
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" fullWidth onPress={handleDelete}>
                🗑️ Excluir
              </Button>
            )}
          </View>
        </Card>
      )}

      {/* Logs / Timeline */}
      <Card>
        <Text style={{ ...typography.captionMedium, color: colors.textTertiary, marginBottom: spacing.sm + 4 }}>
          HISTÓRICO
        </Text>
        {ticket.logs && ticket.logs.length > 0 ? (
          ticket.logs.map((log, i) => (
            <View key={log.id || i} style={{
              flexDirection: 'row',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              borderBottomWidth: i < ticket.logs.length - 1 ? 1 : 0,
              borderBottomColor: colors.borderSubtle,
            }}>
              <View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: colors.primary,
                marginTop: 6,
              }} />
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.small, color: colors.textPrimary }}>
                  {log.descricao}
                </Text>
                <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: 2 }}>
                  {log.user?.name || 'Sistema'} · {formattedDate(log.created_at)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ ...typography.small, color: colors.textTertiary }}>
            Nenhum registro no histórico.
          </Text>
        )}
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[
        { padding: spacing.md },
        isDesktop && {
          flexDirection: 'row',
          gap: spacing.lg,
          maxWidth: 1200,
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.lg,
        },
      ]}>
        {ticketContent}
        {sidebar}
      </ScrollView>

      {/* Status change modal */}
      <Dialog
        visible={showStatusModal}
        title="Alterar Status"
        onClose={() => setShowStatusModal(false)}
      >
        <View style={{ gap: spacing.sm }}>
          {statusOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleStatusChange(option.value)}
              style={[
                {
                  paddingVertical: spacing.sm + 4,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.surfaceHover,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
                Platform.OS === 'web' && { cursor: 'pointer' },
              ]}
            >
              <Text style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Dialog>
    </View>
  );
}
