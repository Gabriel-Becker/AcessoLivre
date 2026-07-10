import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../../config/theme';
import { Espacador, Divisor } from '../../commons';
import { Botao } from '../../ui';
import { useAuth } from '../../../context/ContextoAutenticacao';
import { useThemeContext } from '../../../context/ThemeContext';
import { resetToHome } from '../../../navigation/navigationRef';
import toastHelper from '../../../utils/toastHelper';
import ItemBarra from './ItemBarra';

export default function PainelUsuarioBarra({ current = 'Inicio', onNavigate, altoContraste }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const { isAuthenticated, usuario, logout } = useAuth();
  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';
  const corTextoSecundario = contrasteAtivo ? t.colors.textOnPrimary : t.colors.textSecondary;
  const [carregandoLogout, setCarregandoLogout] = useState(false);

  const handleLogout = async () => {
    let ocultarToastProcessamento;

    try {
      setCarregandoLogout(true);
      ocultarToastProcessamento = toastHelper.showLoading('Encerrando sua sessão com segurança...', 'Saindo');
      await logout();
      ocultarToastProcessamento?.();
      toastHelper.showSuccess('Sessão encerrada com sucesso.', 'Logout realizado');
      resetToHome();
    } catch {
      ocultarToastProcessamento?.();
      toastHelper.showError('Não foi possível encerrar sua sessão.', 'Falha ao sair');
    } finally {
      ocultarToastProcessamento?.();
      setCarregandoLogout(false);
    }
  };

  return (
    <View style={styles.Recipiente}>
      <Divisor />
      <Espacador size="sm" />
      {!isAuthenticated ? (
        <>
          <Botao
            variant="primary"
            size="large"
            fullWidth
            onPress={() => onNavigate && onNavigate('Entrar')}
            align="center"
            iconLeft="log-in-outline"
            altoContraste={contrasteAtivo}
            style={{
              borderRadius: t.borderRadius.lg,
              shadowColor: t.shadows.md.shadowColor,
              shadowOffset: t.shadows.md.shadowOffset,
              shadowOpacity: t.shadows.md.shadowOpacity,
              shadowRadius: t.shadows.md.shadowRadius,
              elevation: t.shadows.md.elevation,
            }}
          >
            Fazer Login
          </Botao>
          <Espacador size="sm" />
          <Botao
            variant={contrasteAtivo ? 'outline' : 'ghost'}
            size="large"
            fullWidth
            onPress={() => onNavigate && onNavigate('Cadastro')}
            align="center"
            iconLeft="person-add-outline"
            altoContraste={contrasteAtivo}
            textStyle={{ color: contrasteAtivo ? t.colors.primary : corTextoSecundario }}
            iconColor={contrasteAtivo ? t.colors.primary : corTextoSecundario}
            style={contrasteAtivo ? {
              backgroundColor: 'transparent',
              borderColor: t.colors.primary,
              borderWidth: 2,
            } : { backgroundColor: 'transparent' }}
          >
            Criar Conta
          </Botao>
        </>
      ) : (
        <>
          {isAdmin ? (
            <>
              <ItemBarra
                icon="shield-checkmark-outline"
                label="Admin"
                active={current === 'Admin'}
                onPress={() => onNavigate && onNavigate('Admin')}
                altoContraste={contrasteAtivo}
              />
              <Espacador size="xs" />
            </>
          ) : null}
          <ItemBarra
            icon="person-circle-outline"
            label="Meu Perfil"
            active={current === 'Perfil'}
            onPress={() => onNavigate && onNavigate('Perfil')}
            altoContraste={contrasteAtivo}
          />
          <Espacador size="xs" />
          <Botao variant="danger" size="large" fullWidth onPress={handleLogout} align="left" iconLeft="exit-outline" altoContraste={contrasteAtivo} loading={carregandoLogout} disabled={carregandoLogout}>
            Sair
          </Botao>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.lg,
  },
});


