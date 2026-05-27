import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { TrocarSenhaModal, TwoFactorModal } from '../../components/feedback';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import AuthService from '../../services/AuthService';
import { resetToHome } from '../../navigation/navigationRef';
import toastHelper from '../../utils/toastHelper';
import LocalService from '../../services/LocalService';
import { navigate } from '../../navigation/navigationRef';
import { Alert } from 'react-native';

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const corPrincipal = isHighContrast ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = isHighContrast ? 'textOnPrimary' : 'textSecondary';
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorAtivo, setTwoFactorAtivo] = useState(false);
  const [carregandoTwoFactor, setCarregandoTwoFactor] = useState(true);
  const [carregandoLogout, setCarregandoLogout] = useState(false);
  const [meusLocais, setMeusLocais] = useState([]);
  const [carregandoMeusLocais, setCarregandoMeusLocais] = useState(false);

  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';

  const carregarStatusTwoFactor = async () => {
    try {
      setCarregandoTwoFactor(true);
      const status = await AuthService.get2FAStatus();
      setTwoFactorAtivo(Boolean(status?.enabled ?? status?.ativo ?? status));
    } catch (erro) {
      toastHelper.showError('Não foi possível carregar o status da autenticação em dois fatores.', 'Falha ao carregar segurança');
    } finally {
      setCarregandoTwoFactor(false);
    }
  };

  useEffect(() => {
    carregarStatusTwoFactor();
  }, []);

  useEffect(() => {
    carregarMeusLocais();
  }, [usuario]);

  const carregarMeusLocais = async () => {
    if (!usuario?.idUsuario) return;
    try {
      setCarregandoMeusLocais(true);
      const locais = await LocalService.obterMeusLocais(usuario.idUsuario);
      setMeusLocais(Array.isArray(locais) ? locais : []);
    } catch (erro) {
      console.error('Erro ao carregar meus locais:', erro);
      toastHelper.showError('Não foi possível carregar seus locais.');
    } finally {
      setCarregandoMeusLocais(false);
    }
  };

  const confirmarExcluirLocal = (idLocal, nomeLocal) => {
    Alert.alert(
      'Excluir local',
      `Tem certeza que deseja excluir o local "${nomeLocal}"? Esta ação é definitiva (exclusão lógica).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => handleExcluirLocal(idLocal) }
      ]
    );
  };

  const handleExcluirLocal = async (idLocal) => {
    try {
      await LocalService.removerLocal(idLocal);
      toastHelper.showSuccess('Local excluído com sucesso.');
      carregarMeusLocais();
    } catch (erro) {
      console.error('Erro ao excluir local:', erro);
      const msg = erro?.response?.data?.message || erro?.message || 'Erro ao excluir local.';
      toastHelper.showError(msg);
    }
  };

  const handleEditarLocal = (idLocal) => {
    navigate('Main', { screen: 'Adicionar', localId: idLocal });
  };

  const handleAbrirDetalhesLocal = (idLocal) => {
    navigate('Main', { screen: 'LocalDetalhes', id: idLocal });
  };

  const executarLogout = async () => {
    try {
      setCarregandoLogout(true);
      await logout();
      resetToHome();
    } finally {
      setCarregandoLogout(false);
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <View style={[styles.infoItem, isHighContrast && { borderBottomColor: t.colors.primary }]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={24} color={t.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText color={corSecundaria} size="sm" altoContraste={isHighContrast}>{label}</ThemedText>
        <ThemedText weight="semibold" altoContraste={isHighContrast} color={corPrincipal}>{value || 'Não informado'}</ThemedText>
      </View>
    </View>
  );

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText variant="h1" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Meu Perfil</ThemedText>
        <Spacer size="md" />

        <Card altoContraste={isHighContrast} variant={isHighContrast ? 'outlined' : 'default'} style={{ padding: t.spacing.xl }}>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: t.colors.primary }]}>
              <ThemedText variant="h1" color="textOnPrimary" weight="bold" altoContraste={isHighContrast}>
                {usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <Spacer size="md" />
            <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
              {usuario?.nome}
            </ThemedText>
          </View>

          <Spacer size="xl" />

          <InfoItem icon="person-outline" label="Nome" value={usuario?.nome} />
          <InfoItem icon="mail-outline" label="E-mail" value={usuario?.email} />

          <Spacer size="xl" />

          <View style={[styles.segurancaBox, isHighContrast && { borderColor: t.colors.primary, backgroundColor: t.colors.surface }] }>
            <View style={styles.segurancaHeader}>
              <View style={styles.segurancaIcone}>
                <Ionicons name="shield-checkmark-outline" size={22} color={t.colors.primary} />
              </View>
              <View style={styles.segurancaTexto}>
                <ThemedText weight="semibold" altoContraste={isHighContrast} color={corPrincipal}>Autenticação em dois fatores</ThemedText>
                <ThemedText color={corSecundaria} size="sm" altoContraste={isHighContrast}>
                  {twoFactorAtivo ? 'Ativada para sua conta' : 'Desativada no momento'}
                </ThemedText>
              </View>
            </View>

            <Spacer size="sm" />

            <Button
              variant={twoFactorAtivo ? 'outline' : 'primary'}
              size="large"
              fullWidth
              onPress={() => setShowTwoFactorModal(true)}
              iconLeft={twoFactorAtivo ? 'key-outline' : 'shield-checkmark-outline'}
              loading={carregandoTwoFactor}
              disabled={carregandoTwoFactor}
              altoContraste={isHighContrast}
            >
              {twoFactorAtivo ? 'Gerenciar 2FA' : 'Ativar 2FA'}
            </Button>
          </View>

          <Spacer size="xl" />

          <Button 
            variant="outline" 
            size="large" 
            fullWidth 
            onPress={() => setShowChangePassword(true)}
            iconLeft="key-outline"
            altoContraste={isHighContrast}
          >
            Trocar Senha
          </Button>

          {isMobile ? (
            <>
              <Spacer size="md" />
              <Button
                variant="danger"
                size="large"
                fullWidth
                onPress={executarLogout}
                iconLeft="log-out-outline"
                loading={carregandoLogout}
                disabled={carregandoLogout}
                altoContraste={isHighContrast}
              >
                Sair da conta
              </Button>
            </>
          ) : null}
        </Card>

        <Spacer size="lg" />
        <Card altoContraste={isHighContrast} variant={isHighContrast ? 'outlined' : 'default'} style={{ padding: t.spacing.xl }}>
          <ThemedText variant="h2" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Meus Locais</ThemedText>
          <Spacer size="sm" />
          {carregandoMeusLocais ? (
            <ThemedText color={corSecundaria}>Carregando seus locais...</ThemedText>
          ) : meusLocais.length === 0 ? (
            <>
              <ThemedText color={corSecundaria}>Você ainda não cadastrou nenhum local.</ThemedText>
              <Spacer size="sm" />
              <Button variant="primary" onPress={() => navigate('Main', { screen: 'Adicionar' })} altoContraste={isHighContrast}>
                Adicionar Local
              </Button>
            </>
          ) : (
            meusLocais.map((local) => (
              <View
                key={local.idLocal}
                style={{
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isHighContrast ? t.colors.primary : t.colors.borderLight,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => handleAbrirDetalhesLocal(local.idLocal)}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText weight="semibold" altoContraste={isHighContrast}>{local.nome}</ThemedText>
                    <ThemedText color="textSecondary" size="sm">{local.categoria}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.colors.textSecondary} />
                </TouchableOpacity>

                {(isAdmin || (usuario && usuario.idUsuario === local.idUsuario)) && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <Button variant="outline" size="small" onPress={() => handleEditarLocal(local.idLocal)} altoContraste={isHighContrast}>
                      Editar
                    </Button>
                    <Button variant="danger" size="small" onPress={() => confirmarExcluirLocal(local.idLocal, local.nome)} altoContraste={isHighContrast}>
                      Excluir
                    </Button>
                  </View>
                )}
                </View>
            ))
          )}
        </Card>
      </ScrollView>

      <TrocarSenhaModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        altoContraste={isHighContrast}
      />

      <TwoFactorModal
        visible={showTwoFactorModal}
        enabled={twoFactorAtivo}
        onClose={() => setShowTwoFactorModal(false)}
        onSuccess={carregarStatusTwoFactor}
        altoContraste={isHighContrast}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  segurancaBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segurancaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segurancaIcone: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segurancaTexto: {
    flex: 1,
    marginLeft: 12,
  },
});
