import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIORIDADE_COLORS, PRIORIDADE_LABELS } from '../utils/constants';

export default function PrioridadeBadge({ prioridade }) {
  const color = PRIORIDADE_COLORS[prioridade] || '#6B7280';
  const label = PRIORIDADE_LABELS[prioridade] || prioridade;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
