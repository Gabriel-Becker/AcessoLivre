import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast, { BaseToast } from 'react-native-toast-message';
import './src/api/interceptors';
import { AuthProvider } from './src/context/ContextoAutenticacao';
import { ThemeProvider } from './src/context/ThemeContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import AssistenteVoz from './src/services/acessibilidade/AssistenteVoz';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import BotaoVoz from './src/components/acessibilidade/BotaoVoz';

const linking = {
  prefixes: ['http://localhost:8081', 'frontend://'],
  config: {
    screens: {
      Entrar: 'entrar',
      Cadastro: 'cadastro',
      AcessoLivre: 'inicio',
    },
  },
};

const toastConfig = {
  loading: (props) => (
    <View style={styles.loadingToastContainer}>
      <ActivityIndicator size="small" color="#2563EB" style={styles.loadingIndicator} />
      <BaseToast
        {...props}
        style={styles.loadingToast}
        contentContainerStyle={styles.toastContent}
        text1Style={styles.toastTitle}
        text2Style={styles.toastMessage}
      />
    </View>
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#F59E0B' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600' }}
      text2Style={{ fontSize: 13 }}
    />
  ),
};

const styles = StyleSheet.create({
  loadingToastContainer: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingLeft: 14,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingToast: {
    flex: 1,
    minHeight: 64,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  toastContent: {
    paddingHorizontal: 15,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  toastMessage: {
    fontSize: 13,
  },
});

export default function App() {
  const handleStateChange = () => {
    const rotaAtual = navigationRef.getCurrentRoute();

    if (!rotaAtual?.name || rotaAtual.name === 'AcessoLivre') {
      return;
    }

    AssistenteVoz.updateContext({ screen: rotaAtual.name });
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <NavigationContainer 
              ref={navigationRef}
              linking={linking} 
              fallback={null}
              onStateChange={handleStateChange}
            >
              <AppNavigator />
            </NavigationContainer>
            <Toast config={toastConfig} />
            <BotaoVoz />
          </AccessibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}