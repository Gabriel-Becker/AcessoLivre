import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Container, DesktopLayout } from '../components/layout';
import { ThemedText, Spacer } from '../components/commons';
import { Login, Register, ForgotPassword } from '../screens/auth';
import Home from '../screens/home/Home';
import Buscar from '../screens/buscar/Buscar';
import AdicionarLocal from '../screens/locais/AdicionarLocal';
import Sobre from '../screens/sobre/Sobre';
import Perfil from '../screens/perfil/Perfil';
import theme from '../config/theme';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <Container center background="backgroundSecondary">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Spacer size="md" />
      <ThemedText color="textSecondary">Carregando...</ThemedText>
    </Container>
  );
}

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('Inicio');

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Inicio':
        return <Home />;
      case 'Buscar':
        return <Buscar />;
      case 'Adicionar':
        return <AdicionarLocal onNavigate={handleNavigate} />;
      case 'Sobre':
        return <Sobre />;
      case 'Perfil':
        return <Perfil />;
      default:
        return <Home />;
    }
  };

  return (
    <DesktopLayout current={currentScreen} onNavigate={handleNavigate}>
      {renderScreen()}
    </DesktopLayout>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainApp} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}
