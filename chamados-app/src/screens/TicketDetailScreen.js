import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PrioridadeBadge from '../components/PrioridadeBadge';
import { STATUS_OPTIONS } from '../utils/constants';

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params;
  const { user } = useAuth();
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
      'Tem certeza que deseja excluir este chamado?',
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

  const canDelete = ticket && (user?.role === 'admin' || user?.id === ticket.solicitante?.id);
  const statusOptions = STATUS_OPTIONS.filter(s => s.value && s.value !== ticket?.status);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!ticket) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
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
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Descrição</Text>
        <Text style={styles.descricao}>{ticket.descricao}</Text>
      </View>

      {/* People */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Pessoas</Text>
        <View style={styles.personRow}>
          <Text style={styles.personLabel}>Solicitante:</Text>
          <Text style={styles.personName}>{ticket.solicitante?.name || 'N/A'}</Text>
        </View>
        <View style={styles.personRow}>
          <Text style={styles.personLabel}>Responsável:</Text>
          <Text style={styles.personName}>{ticket.responsavel?.name || 'Não atribuído'}</Text>
        </View>
        {ticket.resolved_at && (
          <View style={styles.personRow}>
            <Text style={styles.personLabel}>Resolvido em:</Text>
            <Text style={styles.personName}>
              {new Date(ticket.resolved_at).toLocaleString('pt-BR')}
            </Text>
          </View>
        )}
      </View>

      {/* Logs */}
      {ticket.logs && ticket.logs.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Histórico de Status</Text>
          {ticket.logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logDot} />
              <View style={styles.logContent}>
                <Text style={styles.logTransition}>
                  {log.de || '—'} → {log.para}
                </Text>
                <Text style={styles.logMeta}>
                  por {log.user?.name || `User #${log.user_id}`} •{' '}
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => setStatusModalVisible(true)}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>🔄 Alterar Status</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('TicketCreate', { ticket })}
        >
          <Text style={styles.actionButtonText}>✏️ Editar</Text>
        </TouchableOpacity>

        {canDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>🗑️ Excluir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Modal */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => handleStatusChange(option.value)}
              >
                <StatusBadge status={option.value} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  ticketId: { fontSize: 14, fontWeight: '700', color: '#6366F1' },
  date: { fontSize: 13, color: '#9CA3AF' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  descricao: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  personRow: { flexDirection: 'row', marginBottom: 8 },
  personLabel: { fontSize: 14, color: '#6B7280', width: 110 },
  personName: { fontSize: 14, color: '#1F2937', fontWeight: '500', flex: 1 },
  logItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  logDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1',
    marginTop: 5, marginRight: 12,
  },
  logContent: { flex: 1 },
  logTransition: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  logMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  actions: { marginTop: 8, gap: 10 },
  actionButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  statusButton: { backgroundColor: '#6366F1' },
  editButton: { backgroundColor: '#F59E0B' },
  deleteButton: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  actionButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%', maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16, textAlign: 'center',
  },
  modalOption: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, marginBottom: 4 },
  modalCancel: {
    marginTop: 12, paddingVertical: 12, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  modalCancelText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
});
