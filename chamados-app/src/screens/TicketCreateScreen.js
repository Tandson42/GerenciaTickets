import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { ticketService } from '../services/api';
import { PRIORIDADE_OPTIONS, PRIORIDADE_COLORS } from '../utils/constants';

export default function TicketCreateScreen({ route, navigation }) {
  const editTicket = route.params?.ticket;
  const isEditing = !!editTicket;

  const [titulo, setTitulo] = useState(editTicket?.titulo || '');
  const [descricao, setDescricao] = useState(editTicket?.descricao || '');
  const [prioridade, setPrioridade] = useState(editTicket?.prioridade || 'MEDIA');
  const [loading, setLoading] = useState(false);
  const [prioridadeModalVisible, setPrioridadeModalVisible] = useState(false);

  const prioridadeOptions = PRIORIDADE_OPTIONS.filter(p => p.value !== '');

  async function handleSubmit() {
    // Client-side validation
    if (titulo.trim().length < 5) {
      Alert.alert('Erro', 'O título deve ter no mínimo 5 caracteres.');
      return;
    }
    if (titulo.trim().length > 120) {
      Alert.alert('Erro', 'O título deve ter no máximo 120 caracteres.');
      return;
    }
    if (descricao.trim().length < 20) {
      Alert.alert('Erro', 'A descrição deve ter no mínimo 20 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
      };

      if (isEditing) {
        await ticketService.update(editTicket.id, data);
        Alert.alert('Sucesso', 'Chamado atualizado com sucesso!');
      } else {
        await ticketService.create(data);
        Alert.alert('Sucesso', 'Chamado criado com sucesso!');
      }
      navigation.goBack();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join('\n')
        : error.response?.data?.message || 'Erro ao salvar chamado.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  const selectedPrioridade = prioridadeOptions.find(p => p.value === prioridade);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {/* Título */}
        <Text style={styles.label}>
          Título <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Problema no sistema de login"
          placeholderTextColor="#9CA3AF"
          value={titulo}
          onChangeText={setTitulo}
          maxLength={120}
        />
        <Text style={styles.charCount}>{titulo.length}/120 (mín. 5)</Text>

        {/* Descrição */}
        <Text style={styles.label}>
          Descrição <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o chamado com detalhes..."
          placeholderTextColor="#9CA3AF"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{descricao.length} caracteres (mín. 20)</Text>

        {/* Prioridade */}
        <Text style={styles.label}>
          Prioridade <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setPrioridadeModalVisible(true)}
        >
          <View style={[styles.prioridadeDot, { backgroundColor: PRIORIDADE_COLORS[prioridade] }]} />
          <Text style={styles.pickerText}>{selectedPrioridade?.label || prioridade}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? '💾 Salvar Alterações' : '📝 Criar Chamado'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Prioridade Modal */}
      <Modal visible={prioridadeModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPrioridadeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Prioridade</Text>
            {prioridadeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  prioridade === option.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setPrioridade(option.value);
                  setPrioridadeModalVisible(false);
                }}
              >
                <View style={[styles.prioridadeDot, { backgroundColor: PRIORIDADE_COLORS[option.value] }]} />
                <Text style={[
                  styles.modalOptionText,
                  prioridade === option.value && styles.modalOptionTextActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  required: { color: '#EF4444' },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1F2937',
  },
  textArea: { minHeight: 120 },
  charCount: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  prioridadeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  pickerText: { flex: 1, fontSize: 15, color: '#1F2937' },
  pickerArrow: { fontSize: 10, color: '#9CA3AF' },
  submitButton: {
    backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  cancelButtonText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
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
  modalOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 4,
  },
  modalOptionActive: { backgroundColor: '#EEF2FF' },
  modalOptionText: { fontSize: 15, color: '#4B5563' },
  modalOptionTextActive: { color: '#6366F1', fontWeight: '600' },
});
