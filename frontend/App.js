import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast, { BaseToast } from 'react-native-toast-message';
import './src/api/interceptors';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import NavigationService from './src/services/acessibilidade/NavigationService';
import VoiceButton from './src/components/acessibilidade/VoiceButton';

const linking = {
  prefixes: ['http://localhost:8081', 'frontend://'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      Main: 'home',
    },
  },
};

const toastConfig = {
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

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <NavigationContainer 
              ref={navigationRef}
              linking={linking} 
              fallback={null}
            >
              <AppNavigator />
            </NavigationContainer>
            <Toast config={toastConfig} />
            <VoiceButton />
          </AccessibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}