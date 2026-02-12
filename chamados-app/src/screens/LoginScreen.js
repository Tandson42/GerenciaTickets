import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing, radius, shadows } from '../themes/spacing';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { isDesktop, screenWidth } = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.email?.[0]
        || 'Erro ao fazer login. Verifique suas credenciais.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <View style={[styles.formWrapper, isDesktop && { maxWidth: 420 }]}>
      <Card elevation="lg" padding={spacing.lg + 8}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleLogin}
          style={{ marginTop: spacing.sm }}
        >
          Entrar
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: spacing.sm }}
        >
          Não tem conta? Cadastre-se
        </Button>
      </Card>

      <View style={styles.credentials}>
        <Text style={styles.credTitle}>Credenciais de teste:</Text>
        <Text style={styles.credText}>Admin: admin@example.com / password123</Text>
        <Text style={styles.credText}>User: user@example.com / password123</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isDesktop ? (
          <View style={styles.desktopLayout}>
            {/* Branding Side */}
            <View style={styles.brandingSide}>
              <Text style={styles.brandEmoji}>🎫</Text>
              <Text style={styles.brandTitle}>Gestão de{'\n'}Chamados</Text>
              <Text style={styles.brandSubtitle}>
                Gerencie seus tickets de forma{'\n'}simples, rápida e organizada.
              </Text>
              <View style={styles.brandFeatures}>
                <Text style={styles.brandFeature}>✅ Crie e acompanhe chamados</Text>
                <Text style={styles.brandFeature}>📊 Filtros por status e prioridade</Text>
                <Text style={styles.brandFeature}>📋 Histórico completo de alterações</Text>
              </View>
            </View>
            {/* Form Side */}
            <View style={styles.formSide}>
              {formContent}
            </View>
          </View>
        ) : (
          <View style={styles.mobileLayout}>
            <Text style={styles.emoji}>🎫</Text>
            <Text style={styles.title}>Gestão de Chamados</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
            {formContent}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Desktop
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  brandingSide: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  brandEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  brandTitle: {
    ...typography.display,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 40,
    lineHeight: 48,
  },
  brandSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  brandFeatures: {
    alignSelf: 'stretch',
    maxWidth: 300,
    alignItems: 'flex-start',
  },
  brandFeature: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm,
  },
  formSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  formWrapper: {
    width: '100%',
  },
  // Mobile
  mobileLayout: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
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
  credentials: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
  },
  credTitle: {
    ...typography.captionMedium,
    color: colors.primaryDark,
    marginBottom: spacing.xs + 2,
  },
  credText: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: 2,
  },
});
