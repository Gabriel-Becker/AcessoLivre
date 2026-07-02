import React, { useEffect, useState } from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/ContextoAutenticacao';
import { Recipiente, LayoutDesktop, LayoutMobile } from '../components/layout';
import { TextoTematizado, Espacador } from '../components/commons';
import { Entrar, Cadastro, EsqueciSenha, RedefinirSenha } from '../screens/auth';
import Home from '../screens/home/Home';
import Buscar from '../screens/buscar/Buscar';
import AdicionarLocal from '../screens/locais/AdicionarLocal';
import LocalDetalhes from '../screens/locais/LocalDetalhes';
import Sobre from '../screens/sobre/Sobre';
import Perfil from '../screens/perfil/Perfil';
import Admin from '../screens/admin/Admin';
import Configuracoes from '../screens/config/Configuracoes';
import theme, { breakpoints } from '../config/theme';
import { useThemeContext } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <Recipiente center background="backgroundSecondary">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Espacador size="md" />
      <TextoTematizado color="textSecondary">Carregando...</TextoTematizado>
    </Recipiente>
  );
}

function MainApp({ navigation, route }) {
  const { usuario, isAuthenticated } = useAuth();
  const { fontSizeMultiplier } = useThemeContext();
  const { width } = useWindowDimensions();
  const screenInicial = route?.params?.screen || 'Inicio';
  const [currentScreen, setCurrentScreen] = useState(screenInicial);
  const [screenAnterior, setScreenAnterior] = useState('Inicio');
  const isDesktop = width >= breakpoints.desktop;
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

  const navegarInternamente = (screen, params = {}) => {
    const telasPublicas = ['Inicio', 'Buscar', 'Sobre', 'SobreNos', 'SobreNosScreen'];

    if (telasPublicas.includes(screen)) {
      navigation?.setParams({
        ...route?.params,
        screen: screen === 'SobreNos' || screen === 'SobreNosScreen' ? 'Sobre' : screen,
        ...params,
      });

      setCurrentScreen(screen === 'SobreNos' || screen === 'SobreNosScreen' ? 'Sobre' : screen);
      return;
    }

    if (screen === 'Entrar' || screen === 'Cadastro' || screen === 'EsqueciSenha' || screen === 'RedefinirSenha') {
      navigation?.navigate?.(screen, params);
      return;
    }

    if ((screen === 'Adicionar' || screen === 'Perfil') && !isAuthenticated) {
      navigation?.navigate?.('Entrar');
      return;
    }

    if (screen === 'Admin' && (!isAdmin || !isDesktop)) {
      setCurrentScreen('Inicio');
      return;
    }

    if (screen === 'MenuLateral') {
      setScreenAnterior(currentScreen);
    }

    const paramsFinais = { ...params };

    if (screen === 'LocalDetalhes' && !paramsFinais.previousScreen) {
      paramsFinais.previousScreen = currentScreen;
    }

    navigation?.setParams({
      ...route?.params,
      screen,
      ...paramsFinais,
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

  useEffect(() => {
    if (currentScreen === 'MenuLateral' && fontSizeMultiplier < 1.5) {
      setCurrentScreen(screenAnterior || 'Inicio');
    }
  }, [currentScreen, fontSizeMultiplier, screenAnterior]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Inicio':
        return <Home onNavigate={handleNavigate} routeParams={route?.params} />;
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
      case 'MenuLateral':
        return <View />;
      case 'Admin':
        return isAdmin ? <Admin onNavigate={handleNavigate} /> : <Home onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  if (isDesktop) {
    return (
      <LayoutDesktop current={currentScreen} onNavigate={handleNavigate} screenAnterior={screenAnterior}>
        {renderScreen()}
      </LayoutDesktop>
    );
  }

  return (
    <LayoutMobile current={currentScreen} onNavigate={handleNavigate}>
      {renderScreen()}
    </LayoutMobile>
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
    return <CarregamentoScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainApp} />
      <Stack.Screen name="Entrar" component={Entrar} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} />
      <Stack.Screen name="RedefinirSenha" component={RedefinirSenha} />
    </Stack.Navigator>
  );
}