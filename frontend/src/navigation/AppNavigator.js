import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout';
import { ThemedText, Spacer } from '../components/commons';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

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

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

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
