import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isDesktop } = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  const brandingPanel = (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['2xl'],
      backgroundColor: colors.backgroundAlt,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    }}>
      <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🎫</Text>
      <Text style={{ ...typography.display, color: colors.textPrimary, marginBottom: spacing.sm }}>
        Chamados
      </Text>
      <Text style={{ ...typography.body, color: colors.textTertiary, textAlign: 'center', maxWidth: 280 }}>
        Sistema de gestão de chamados moderno, rápido e intuitivo.
      </Text>
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {['✦ Acompanhe tickets em tempo real', '✦ Filtros avançados e busca', '✦ Histórico completo de ações'].map((t, i) => (
          <Text key={i} style={{ ...typography.small, color: colors.textSecondary }}>{t}</Text>
        ))}
      </View>
    </View>
  );

  const formPanel = (
    <View style={{
      flex: isDesktop ? 1 : undefined,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    }}>
      <View style={{ width: '100%', maxWidth: 380 }}>
        {!isDesktop && (
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <Text style={{ fontSize: 36, marginBottom: spacing.sm }}>🎫</Text>
            <Text style={{ ...typography.h1, color: colors.textPrimary }}>Chamados</Text>
          </View>
        )}

        <Card style={{ padding: spacing.lg + 8 }}>
          <Text style={{ ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs }}>
            Entrar
          </Text>
          <Text style={{ ...typography.small, color: colors.textTertiary, marginBottom: spacing.lg }}>
            Faça login para continuar
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

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <Button variant="primary" size="lg" fullWidth loading={loading} onPress={handleLogin}>
            Entrar
          </Button>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs }}>
          <Text style={{ ...typography.small, color: colors.textTertiary }}>
            Não tem conta?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ ...typography.small, color: colors.primary, fontWeight: '600' }}>
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{ alignSelf: 'center', marginTop: spacing.lg, padding: spacing.sm }}
        >
          <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {isDesktop ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {brandingPanel}
          {formPanel}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled">
          {formPanel}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
