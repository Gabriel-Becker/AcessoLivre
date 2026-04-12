import React, { useEffect, useState } from 'react';
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
import Admin from '../screens/admin/Admin';
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
  const { usuario } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Inicio');
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

  const handleNavigate = (screen) => {
    if (screen === 'Admin' && !isAdmin) {
      setCurrentScreen('Inicio');
      return;
    }
    setCurrentScreen(screen);
  };

  useEffect(() => {
    if (!isAdmin && currentScreen === 'Admin') {
      setCurrentScreen('Inicio');
    }
  }, [isAdmin, currentScreen]);

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
      case 'Admin':
        return isAdmin ? <Admin /> : <Home />;
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
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainApp} />
      )}
    </Stack.Navigator>
  );
}
