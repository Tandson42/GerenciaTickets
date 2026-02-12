import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { ticketService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';
import { PRIORIDADE_OPTIONS } from '../utils/constants';

export default function TicketCreateScreen({ navigation }) {
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit() {
    setErrors({});
    setLoading(true);
    try {
      await ticketService.create({ titulo, descricao, prioridade });
      navigation.goBack();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        Alert.alert('Erro', err.response?.data?.message || 'Erro ao criar chamado.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: spacing.md,
        alignItems: isDesktop ? 'center' : undefined,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: isDesktop ? 560 : undefined }}>
        {isDesktop && (
          <Text style={{ ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg }}>
            Novo Chamado
          </Text>
        )}

        <Card style={{ padding: spacing.lg + 8 }}>
          <Input
            label="Título"
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Resumo breve do problema"
            error={errors.titulo?.[0]}
            maxLength={120}
          />

          <Input
            label="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva o problema em detalhes..."
            error={errors.descricao?.[0]}
            multiline
            numberOfLines={6}
            maxLength={2000}
          />

          <Text style={{ ...typography.captionMedium, color: colors.textSecondary, marginBottom: spacing.xs + 2 }}>
            PRIORIDADE
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
            {PRIORIDADE_OPTIONS.filter(o => o.value).map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setPrioridade(option.value)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm + 2,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: prioridade === option.value ? colors.primaryBg : colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: prioridade === option.value ? colors.primaryBorder : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  ...typography.small,
                  fontWeight: prioridade === option.value ? '600' : '400',
                  color: prioridade === option.value ? colors.primary : colors.textSecondary,
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button variant="primary" size="lg" fullWidth loading={loading} onPress={handleSubmit}>
            Criar Chamado
          </Button>
        </Card>
      </View>
    </ScrollView>
  );
}
