import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TicketListScreen from '../screens/TicketListScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import TicketCreateScreen from '../screens/TicketCreateScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { signed, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) return null;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.error,
    },
  };

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      fontWeight: '600',
      color: colors.textPrimary,
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    contentStyle: {
      backgroundColor: colors.background,
    },
    animation: 'fade_from_bottom',
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {!signed ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Criar Conta' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="TicketList"
              component={TicketListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TicketDetail"
              component={TicketDetailScreen}
              options={{ title: 'Detalhes do Chamado' }}
            />
            <Stack.Screen
              name="TicketCreate"
              component={TicketCreateScreen}
              options={{ title: 'Novo Chamado' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
