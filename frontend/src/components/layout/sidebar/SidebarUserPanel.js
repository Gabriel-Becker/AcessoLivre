import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../../config/theme';
import { Spacer, Divider } from '../../commons';
import { Button } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { resetToHome } from '../../../navigation/navigationRef';
import SidebarItem from './SidebarItem';

export default function SidebarUserPanel({ current = 'Inicio', onNavigate, altoContraste = false }) {
  const { isAuthenticated, usuario, logout } = useAuth();
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

  const handleLogout = async () => {
    await logout();
    resetToHome();
  };

  return (
    <View style={styles.container}>
      <Divider />
      <Spacer size="sm" />
      {!isAuthenticated ? (
        <>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={() => onNavigate && onNavigate('Login')}
            align="center"
            iconLeft="log-in-outline"
            style={{
              borderRadius: theme.borderRadius.lg,
              shadowColor: t.shadows.md.shadowColor,
              shadowOffset: t.shadows.md.shadowOffset,
              shadowOpacity: t.shadows.md.shadowOpacity,
              shadowRadius: t.shadows.md.shadowRadius,
              elevation: t.shadows.md.elevation,
            }}
          >
            Fazer Login
          </Button>
          <Spacer size="sm" />
          <Button
            variant="ghost"
            size="large"
            fullWidth
            onPress={() => onNavigate && onNavigate('Register')}
            align="center"
            iconLeft="person-add-outline"
            textStyle={{ color: t.colors.textSecondary }}
            style={{ backgroundColor: 'transparent' }}
          >
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
                active={current === 'Admin'}
                onPress={() => onNavigate && onNavigate('Admin')}
                altoContraste={altoContraste}
              />
              <Spacer size="xs" />
            </>
          ) : null}
          <SidebarItem
            icon="person-circle-outline"
            label="Meu Perfil"
            active={current === 'Perfil'}
            onPress={() => onNavigate && onNavigate('Perfil')}
            altoContraste={altoContraste}
          />
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
