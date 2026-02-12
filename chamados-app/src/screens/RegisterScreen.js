import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing } from '../themes/spacing';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { isDesktop } = useResponsive();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirmation.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join('\n')
        : error.response?.data?.message || 'Erro ao registrar.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.contentDesktop,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formWrapper, isDesktop && styles.formWrapperDesktop]}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para se registrar</Text>

          <Card elevation="lg" padding={spacing.lg + 8}>
            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              required
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              required
            />
            <Input
              label="Confirmar Senha"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="Repita a senha"
              secureTextEntry
              required
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleRegister}
              style={{ marginTop: spacing.sm }}
            >
              Cadastrar
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => navigation.goBack()}
              style={{ marginTop: spacing.sm }}
            >
              Já tem conta? Fazer login
            </Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  contentDesktop: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  formWrapper: {
    width: '100%',
  },
  formWrapperDesktop: {
    maxWidth: 480,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
