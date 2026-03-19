import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../../config/theme';
import { Spacer, Divider } from '../../commons';
import { Button } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import SidebarItem from './SidebarItem';

export default function SidebarUserPanel({ onNavigate, altoContraste = false }) {
  const { isAuthenticated, usuario, logout } = useAuth();
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

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
          {isAdmin ? (
            <>
              <SidebarItem
                icon="shield-checkmark-outline"
                label="Admin"
                active={false}
                onPress={() => onNavigate && onNavigate('Admin')}
                altoContraste={altoContraste}
              />
              <Spacer size="xs" />
            </>
          ) : null}
          <SidebarItem
            icon="person-circle-outline"
            label="Meu Perfil"
            active={false}
            onPress={() => onNavigate && onNavigate('Perfil')}
            altoContraste={altoContraste}
          />
          <Spacer size="xs" />
          <Button variant="danger" size="large" fullWidth onPress={logout} align="left" iconLeft="exit-outline">
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
