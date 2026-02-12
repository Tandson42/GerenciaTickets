import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name || !email || !password || !passwordConfirmation) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, passwordConfirmation);
    } catch (err) {
      const msgs = err.response?.data?.errors;
      if (msgs) {
        setError(Object.values(msgs).flat().join('\n'));
      } else {
        setError(err.response?.data?.message || 'Erro ao cadastrar.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 440 }}>
          <Card style={{ padding: spacing.lg + 8 }}>
            <Text style={{ ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs }}>
              Criar Conta
            </Text>
            <Text style={{ ...typography.small, color: colors.textTertiary, marginBottom: spacing.lg }}>
              Preencha os dados para se cadastrar
            </Text>

            {error ? (
              <View style={{
                backgroundColor: colors.errorLight,
                padding: spacing.sm + 4,
                borderRadius: radius.md,
                marginBottom: spacing.md,
              }}>
                <Text style={{ ...typography.small, color: colors.error }}>{error}</Text>
              </View>
            ) : null}

            <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome completo" autoCapitalize="words" />
            <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secureTextEntry />
            <Input label="Confirmar Senha" value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="Repita a senha" secureTextEntry />

            <Button variant="primary" size="lg" fullWidth loading={loading} onPress={handleRegister}>
              Cadastrar
            </Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
