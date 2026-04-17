import React, { useEffect, useMemo, useState } from 'react';
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
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Inicio');
  const navigation = { navigate: setCurrentScreen };

  const telasAutenticacao = useMemo(() => ['Login', 'Register', 'ForgotPassword'], []);
  const telasPrivadas = useMemo(() => ['Perfil', 'Adicionar'], []);

  useEffect(() => {
    const estaEmTelaAuth = telasAutenticacao.includes(currentScreen);
    if (isAuthenticated && estaEmTelaAuth) {
      setCurrentScreen('Inicio');
      return;
    }

    const estaEmTelaPrivada = telasPrivadas.includes(currentScreen);
    if (!isAuthenticated && estaEmTelaPrivada) {
      setCurrentScreen('Login');
    }
  }, [currentScreen, isAuthenticated, telasAutenticacao, telasPrivadas]);

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
        if (!isAuthenticated) {
          return <Login navigation={navigation} />;
        }
        return <AdicionarLocal onNavigate={handleNavigate} />;
      case 'Sobre':
        return <Sobre />;
      case 'Perfil':
        if (!isAuthenticated) {
          return <Login navigation={navigation} />;
        }
        return <Perfil />;
      case 'Login':
        if (isAuthenticated) {
          return <Home />;
        }
        return <Login navigation={navigation} />;
      case 'Register':
        if (isAuthenticated) {
          return <Home />;
        }
        return <Register navigation={navigation} />;
      case 'ForgotPassword':
        if (isAuthenticated) {
          return <Home />;
        }
        return <ForgotPassword navigation={navigation} />;
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
    </Stack.Navigator>
  );
}
