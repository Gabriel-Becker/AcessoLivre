import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout';
import { ThemedText, Spacer } from '../components/commons';

const Stack = createNativeStackNavigator();

function AuthGate() {
  return (
    <Container center>
      <ThemedText variant="h2">AcessoLivre</ThemedText>
      <Spacer size="md" />
      <ThemedText color="textSecondary">Autenticação pendente</ThemedText>
    </Container>
  );
}

function MainGate() {
  return (
    <Container center>
      <ThemedText variant="h2">Bem-vindo</ThemedText>
      <Spacer size="md" />
      <ThemedText color="textSecondary">Navegação pronta</ThemedText>
    </Container>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthGate} />
      ) : (
        <Stack.Screen name="Main" component={MainGate} />
      )}
    </Stack.Navigator>
  );
}
