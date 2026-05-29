import React, { useEffect, useState } from 'react';
import { ActivityIndicator, useWindowDimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Container, DesktopLayout, MobileLayout } from '../components/layout';
import { ThemedText, Spacer } from '../components/commons';
import { Login, Register, ForgotPassword, ResetPassword } from '../screens/auth';
import Home from '../screens/home/Home';
import Buscar from '../screens/buscar/Buscar';
import AdicionarLocal from '../screens/locais/AdicionarLocal';
import LocalDetalhes from '../screens/locais/LocalDetalhes';
import Sobre from '../screens/sobre/Sobre';
import Perfil from '../screens/perfil/Perfil';
import Admin from '../screens/admin/Admin';
import Configuracoes from '../screens/config/Configuracoes';
import theme, { breakpoints } from '../config/theme';

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

function MainApp({ navigation, route }) {
  const { usuario, isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const screenInicial = route?.params?.screen || 'Inicio';
  const [currentScreen, setCurrentScreen] = useState(screenInicial);
  const isDesktop = width >= breakpoints.desktop;
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

  const navegarInternamente = (screen, params = {}) => {
    if (screen === 'Login' || screen === 'Register' || screen === 'ForgotPassword' || screen === 'ResetPassword') {
      navigation?.navigate?.(screen, params);
      return;
    }

    if ((screen === 'Adicionar' || screen === 'Perfil') && !isAuthenticated) {
      navigation?.navigate?.('Login');
      return;
    }

    if (screen === 'Admin' && (!isAdmin || !isDesktop)) {
      setCurrentScreen('Inicio');
      return;
    }

    navigation?.setParams({
      ...route?.params,
      screen,
      ...params,
    });
    
    setCurrentScreen(screen);
  };

  useEffect(() => {
    if (route?.params?.screen) {
      navegarInternamente(route.params.screen, route.params);
    }
  }, [route?.params?.screen, isAuthenticated, isAdmin]);

  const handleNavigate = (screen, params = {}) => {
    navegarInternamente(screen, params);
  };

  useEffect(() => {
    if (!isAuthenticated && ['Perfil', 'Adicionar', 'Admin'].includes(currentScreen)) {
      setCurrentScreen('Inicio');
    }
  }, [isAuthenticated, currentScreen]);

  useEffect(() => {
    if ((!isAdmin || !isDesktop) && currentScreen === 'Admin') {
      setCurrentScreen('Inicio');
    }
  }, [isAdmin, isDesktop, currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Inicio':
        return <Home onNavigate={handleNavigate} />;
      case 'Buscar':
        return <Buscar onNavigate={handleNavigate} />;
      case 'Adicionar':
        return <AdicionarLocal onNavigate={handleNavigate} routeParams={route?.params} />;
      case 'LocalDetalhes':
        return <LocalDetalhes onNavigate={handleNavigate} route={route} />;
      case 'Sobre':
        return <Sobre onNavigate={handleNavigate} />;
      case 'Perfil':
        return isAuthenticated ? <Perfil /> : <Home />;
      case 'Configuracoes':
        return <Configuracoes onNavigate={handleNavigate} />;
      case 'Admin':
        return isAdmin ? <Admin onNavigate={handleNavigate} /> : <Home onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  if (isDesktop) {
    return (
      <DesktopLayout current={currentScreen} onNavigate={handleNavigate}>
        {renderScreen()}
      </DesktopLayout>
    );
  }

  return (
    <MobileLayout current={currentScreen} onNavigate={handleNavigate}>
      {renderScreen()}
    </MobileLayout>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();
  const [sessaoInicializada, setSessaoInicializada] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSessaoInicializada(true);
    }
  }, [loading]);

  if (!sessaoInicializada && loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainApp} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
}