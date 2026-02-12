import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal,
} from 'react-native';
import { ticketService } from '../services/api';
import { PRIORIDADE_OPTIONS, PRIORIDADE_COLORS } from '../utils/constants';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing, radius, shadows } from '../themes/spacing';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function TicketCreateScreen({ route, navigation }) {
  const editTicket = route.params?.ticket;
  const isEditing = !!editTicket;
  const { isDesktop } = useResponsive();

  const [titulo, setTitulo] = useState(editTicket?.titulo || '');
  const [descricao, setDescricao] = useState(editTicket?.descricao || '');
  const [prioridade, setPrioridade] = useState(editTicket?.prioridade || 'MEDIA');
  const [loading, setLoading] = useState(false);
  const [prioridadeModalVisible, setPrioridadeModalVisible] = useState(false);

  const prioridadeOptions = PRIORIDADE_OPTIONS.filter(p => p.value !== '');

  async function handleSubmit() {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.formWrapper, isDesktop && styles.formWrapperDesktop]}>
        {isDesktop && (
          <Text style={styles.pageTitle}>
            {isEditing ? '✏️ Editar Chamado' : '📝 Novo Chamado'}
          </Text>
        )}

        <Card elevation="lg" padding={spacing.lg + 8}>
          <Input
            label="Título"
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Problema no sistema de login"
            maxLength={120}
            minLength={5}
            required
          />

          <Input
            label="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva o chamado com detalhes..."
            multiline
            numberOfLines={5}
            minLength={20}
            required
          />

          {/* Prioridade Picker */}
          <Text style={styles.label}>
            Prioridade <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setPrioridadeModalVisible(true)}
          >
            <View style={[
              styles.prioridadeDot,
              { backgroundColor: PRIORIDADE_COLORS[prioridade] },
            ]} />
            <Text style={styles.pickerText}>
              {selectedPrioridade?.label || prioridade}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>

          {/* Submit */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSubmit}
            style={{ marginTop: spacing.lg }}
          >
            {isEditing ? '💾 Salvar Alterações' : '📝 Criar Chamado'}
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.sm }}
          >
            Cancelar
          </Button>
        </Card>
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
                <View style={[
                  styles.prioridadeDot,
                  { backgroundColor: PRIORIDADE_COLORS[option.value] },
                ]} />
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl + 8,
  },
  contentDesktop: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  formWrapper: {
    width: '100%',
  },
  formWrapperDesktop: {
    maxWidth: 560,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.smallMedium,
    color: colors.gray700,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  prioridadeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm + 2,
  },
  pickerText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  pickerArrow: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 340,
    ...shadows.xl,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  modalOptionActive: {
    backgroundColor: colors.primaryBg,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
