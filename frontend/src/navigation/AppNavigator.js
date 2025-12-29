import React from 'react';
import { ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout';
import { ThemedText, Spacer } from '../components/commons';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import theme from '../config/theme';

const Stack = createNativeStackNavigator();

function MainGate() {
  return (
    <Container center>
      <ThemedText variant="h2">Bem-vindo</ThemedText>
      <Spacer size="md" />
      <ThemedText color="textSecondary">Navegação pronta</ThemedText>
    </Container>
  );
}

function LoadingScreen() {
  return (
    <Container center background="backgroundSecondary">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Spacer size="md" />
      <ThemedText color="textSecondary">Carregando...</ThemedText>
    </Container>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainGate} />
      )}
    </Stack.Navigator>
  );
}
