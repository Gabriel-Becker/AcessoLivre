import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../../config/theme';
import { Spacer, Divider } from '../../commons';
import { Button } from '../../ui';
import { useAuth } from '../../../context/AuthContext';

export default function SidebarUserPanel({ onNavigate, altoContraste = false }) {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Divider />
      <Spacer size="sm" />
      {!isAuthenticated ? (
        <>
          <Button variant="primary" size="large" fullWidth onPress={() => onNavigate && onNavigate('Login')} align="left" iconLeft="log-in-outline">
            Fazer Login
          </Button>
          <Spacer size="sm" />
          <Button variant="outline" size="large" fullWidth onPress={() => onNavigate && onNavigate('Register')} align="left" iconLeft="person-add-outline">
            Criar Conta
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="large" 
            fullWidth 
            onPress={() => onNavigate && onNavigate('Perfil')} 
            align="left" 
            iconLeft="person-circle-outline"
          >
            Meu Perfil
          </Button>
          <Spacer size="xs" />
          <Button variant="danger" size="large" fullWidth onPress={handleLogout} align="left" iconLeft="exit-outline">
            Sair
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.lg,
  },
});
