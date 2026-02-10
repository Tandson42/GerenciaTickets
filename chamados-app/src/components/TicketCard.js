import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';
import PrioridadeBadge from './PrioridadeBadge';

export default function TicketCard({ ticket, onPress }) {
  const createdAt = new Date(ticket.created_at).toLocaleDateString('pt-BR');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.id}>#{ticket.id}</Text>
        <Text style={styles.date}>{createdAt}</Text>
      </View>

      <Text style={styles.titulo} numberOfLines={2}>
        {ticket.titulo}
      </Text>

      <Text style={styles.descricao} numberOfLines={2}>
        {ticket.descricao}
      </Text>

      <View style={styles.badges}>
        <StatusBadge status={ticket.status} />
        <PrioridadeBadge prioridade={ticket.prioridade} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.solicitante}>
          👤 {ticket.solicitante?.name || 'N/A'}
        </Text>
        {ticket.responsavel && (
          <Text style={styles.responsavel}>
            🔧 {ticket.responsavel.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  id: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  descricao: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  solicitante: {
    fontSize: 12,
    color: '#6B7280',
  },
  responsavel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
