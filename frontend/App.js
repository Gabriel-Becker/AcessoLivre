import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import navigationRef from './src/navigation/navigationRef';

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

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef} linking={linking} fallback={null}>
            <AppNavigator />
          </NavigationContainer>
          <Toast />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
