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

function MainApp({ navigation }) {  
  const { usuario, isAuthenticated } = useAuth();  
  const [currentScreen, setCurrentScreen] = useState('Inicio');
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

  const handleNavigate = (screen) => {
    console.log('Navegando para:', screen);  
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
    console.log('Renderizando tela:', currentScreen);  
    switch (currentScreen) {
      case 'Inicio':
        return <Home navigation={navigation} />;
      case 'Buscar':
        return <Buscar navigation={navigation} />;
      case 'Adicionar':
        // Passar ambas as props
        return <AdicionarLocal onNavigate={handleNavigate} navigation={navigation} />;
      case 'Sobre':
        return <Sobre navigation={navigation} />;
      case 'Perfil':
        if (!isAuthenticated) {
          return <Login navigation={navigation} />;
        }
        return <Perfil navigation={navigation} />;
      case 'Admin':
        return isAdmin ? <Admin navigation={navigation} /> : <Home navigation={navigation} />;
      default:
        return <Home navigation={navigation} />;
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
      {/* Usar render props para passar navigation */}
      <Stack.Screen name="Main">
        {(props) => <MainApp {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}