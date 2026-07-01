import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { TrocarSenhaModal, TwoFactorModal } from '../../components/feedback';
import { useAuth } from '../../context/ContextoAutenticacao';
import { useThemeContext } from '../../context/ThemeContext';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import MotoAssistente from '../../services/acessibilidade/MotoAssistente';
import ServicoVoz from '../../services/acessibilidade/ServicoVoz';
import ServicoAutenticacao from '../../services/ServicoAutenticacao';
import { resetToHome, navigate } from '../../navigation/navigationRef';
import toastHelper from '../../utils/toastHelper';
import LocalService from '../../services/LocalService';

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const { enabled: voiceEnabled } = useContext(AccessibilityContext);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;
  const paddingInferiorScroll = isMobile ? 28 + Math.max(insets.bottom, 8) : 24;
  const corPrincipal = isHighContrast ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = isHighContrast ? 'textOnPrimary' : 'textSecondary';
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorAtivo, setTwoFactorAtivo] = useState(false);
  const [carregandoTwoFactor, setCarregandoTwoFactor] = useState(true);
  const [carregandoLogout, setCarregandoLogout] = useState(false);
  const [meusLocais, setMeusLocais] = useState([]);
  const [carregandoMeusLocais, setCarregandoMeusLocais] = useState(false);
  const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);
  const [localParaExcluir, setLocalParaExcluir] = useState(null);
  const [carregandoExclusao, setCarregandoExclusao] = useState(false);
  const [voiceFeedbackGiven, setVoiceFeedbackGiven] = useState(false);

  const roleUsuario = String(usuario?.role || '').toUpperCase();
  const isAdmin = roleUsuario === 'ROLE_ADMIN' || roleUsuario === 'ADMIN';
  
  const anunciarPerfil = useCallback(() => {
    if (!voiceEnabled) return;
    
    const nome = usuario?.nome || 'usuÃ¡rio';
    const email = usuario?.email || '';
    const locaisCount = meusLocais.length;
    
    ServicoVoz.speak(
      `Bem-vindo ao seu perfil, ${nome}. ${email ? `Seu e-mail Ã© ${email}. ` : ''}` +
      `VocÃª tem ${locaisCount} ${locaisCount === 1 ? 'local cadastrado' : 'locais cadastrados'}. ` +
      `Aqui vocÃª pode trocar sua senha, gerenciar autenticaÃ§Ã£o de dois fatores, ver seus locais e sair da conta.`
    );
  }, [voiceEnabled, usuario, meusLocais.length]);

  const anunciarInformacoesPerfil = useCallback(() => {
    if (!voiceEnabled) return;
    
    ServicoVoz.speak(
      `Nome: ${usuario?.nome || 'nÃ£o informado'}. ` +
      `E-mail: ${usuario?.email || 'nÃ£o informado'}. ` +
      `AutenticaÃ§Ã£o em dois fatores estÃ¡ ${twoFactorAtivo ? 'ativada' : 'desativada'}.`
    );
  }, [voiceEnabled, usuario, twoFactorAtivo]);

  const anunciarMeusLocais = useCallback(() => {
    if (!voiceEnabled) return;
    
    if (meusLocais.length === 0) {
      ServicoVoz.speak('VocÃª ainda nÃ£o cadastrou nenhum local. Toque no botÃ£o Adicionar Local para comeÃ§ar.');
    } else {
      const nomesLocais = meusLocais.map(local => local.nome).join(', ');
      ServicoVoz.speak(
        `VocÃª tem ${meusLocais.length} ${meusLocais.length === 1 ? 'local cadastrado' : 'locais cadastrados'}. ` +
        `SÃ£o eles: ${nomesLocais}. Para editar ou excluir um local, toque sobre ele.`
      );
    }
  }, [voiceEnabled, meusLocais]);

  const buscarLocalPorNome = useCallback((nomeLocal) => {
    if (!nomeLocal || meusLocais.length === 0) {
      ServicoVoz.speak('VocÃª ainda nÃ£o tem locais cadastrados.');
      return false;
    }
    
    const localEncontrado = meusLocais.find(local => 
      local.nome?.toLowerCase().includes(nomeLocal.toLowerCase())
    );
    
    if (localEncontrado) {
      ServicoVoz.speak(`Encontrei ${localEncontrado.nome}. Abrindo detalhes.`);
      handleAbrirDetalhesLocal(localEncontrado.idLocal);
      return true;
    }
    
    ServicoVoz.speak(`NÃ£o encontrei nenhum local chamado ${nomeLocal} na sua lista.`);
    return false;
  }, [meusLocais]);

  useEffect(() => {
    if (voiceEnabled) {
      MotoAssistente.updateContext({
        screen: 'Perfil',
        usuario: {
          nome: usuario?.nome,
          email: usuario?.email,
          role: usuario?.role
        },
        twoFactorAtivo: twoFactorAtivo,
        meusLocaisCount: meusLocais.length,
        meusLocais: meusLocais,
        buscarLocalPorNome: buscarLocalPorNome,
        onAdicionarLocal: () => {
          ServicoVoz.speak('Abrindo formulÃ¡rio para adicionar novo local');
          navigate('Main', { screen: 'Adicionar' });
        },
        onTrocarSenha: () => {
          ServicoVoz.speak('Abrindo formulÃ¡rio para trocar senha');
          setShowChangePassword(true);
        },
        onGerenciar2FA: () => {
          ServicoVoz.speak(twoFactorAtivo ? 'Abrindo gerenciamento de autenticaÃ§Ã£o' : 'Abrindo ativaÃ§Ã£o de autenticaÃ§Ã£o em dois fatores');
          setShowTwoFactorModal(true);
        },
        onSair: () => {
          ServicoVoz.speak('Confirmando saÃ­da da conta');
          executarLogout();
        }
      });
    }
  }, [voiceEnabled, usuario, twoFactorAtivo, meusLocais, buscarLocalPorNome]);

  // Anunciar quando os dados carregarem
  useEffect(() => {
    if (!carregandoMeusLocais && voiceEnabled && !voiceFeedbackGiven) {
      anunciarPerfil();
      setVoiceFeedbackGiven(true);
    }
  }, [carregandoMeusLocais, voiceEnabled, anunciarPerfil, voiceFeedbackGiven]);

  // Resetar feedback quando o voice for reativado
  useEffect(() => {
    if (!voiceEnabled) {
      setVoiceFeedbackGiven(false);
    }
  }, [voiceEnabled]);
  
  const carregarStatusTwoFactor = async () => {
    try {
      setCarregandoTwoFactor(true);
      const status = await ServicoAutenticacao.get2FAStatus();
      setTwoFactorAtivo(Boolean(status?.enabled ?? status?.ativo ?? status));
      if (voiceEnabled) {
        ServicoVoz.speak(`AutenticaÃ§Ã£o em dois fatores ${status?.enabled ? 'ativada' : 'desativada'}`);
      }
    } catch (erro) {
      toastHelper.showError('NÃ£o foi possÃ­vel carregar o status da autenticaÃ§Ã£o em dois fatores.', 'Falha ao carregar seguranÃ§a');
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
      if (voiceEnabled && locais.length > 0) {
        ServicoVoz.speak(`${locais.length} locais carregados`);
      }
    } catch (erro) {
      console.error('Erro ao carregar meus locais:', erro);
      toastHelper.showError('NÃ£o foi possÃ­vel carregar seus locais.');
    } finally {
      setCarregandoMeusLocais(false);
    }
  };

  const confirmarExcluirLocal = (local) => {
    if (!local?.idLocal) return;

    setLocalParaExcluir(local);
    setModalExcluirVisivel(true);

    if (voiceEnabled) {
      ServicoVoz.speak(`Confirme se deseja excluir o local ${local.nome}`);
    }
  };

  const handleExcluirLocal = async (idLocal) => {
    try {
      await LocalService.removerLocal(idLocal);
      toastHelper.showSuccess('Local excluÃ­do com sucesso.');
      if (voiceEnabled) ServicoVoz.speak('Local excluÃ­do com sucesso');
      carregarMeusLocais();
      return true;
    } catch (erro) {
      console.error('Erro ao excluir local:', erro);
      const msg = erro?.response?.data?.message || erro?.message || 'Erro ao excluir local.';
      toastHelper.showError(msg);
      if (voiceEnabled) ServicoVoz.speak('Erro ao excluir o local');
      return false;
    }
  };

  const handleConfirmarExcluirLocal = async () => {
    if (!localParaExcluir?.idLocal) return;

    try {
      setCarregandoExclusao(true);

      if (voiceEnabled) {
        ServicoVoz.speak(`Excluindo ${localParaExcluir.nome}`);
      }

      const sucesso = await handleExcluirLocal(localParaExcluir.idLocal);
      if (sucesso) {
        setModalExcluirVisivel(false);
        setLocalParaExcluir(null);
      }
    } finally {
      setCarregandoExclusao(false);
    }
  };

  const handleCancelarExcluirLocal = () => {
    setModalExcluirVisivel(false);
    setLocalParaExcluir(null);

    if (voiceEnabled) {
      ServicoVoz.speak('ExclusÃ£o cancelada');
    }
  };

  const handleEditarLocal = (idLocal) => {
    if (voiceEnabled) {
      const local = meusLocais.find(l => l.idLocal === idLocal);
      ServicoVoz.speak(`Abrindo ediÃ§Ã£o de ${local?.nome || 'local'}`);
    }
    navigate('Main', { screen: 'Adicionar', localId: idLocal });
  };

  const handleAbrirDetalhesLocal = (idLocal) => {
    const local = meusLocais.find(l => l.idLocal === idLocal);
    if (voiceEnabled && local) {
      ServicoVoz.speak(`Abrindo detalhes de ${local.nome}`);
    }
    navigate('Main', { screen: 'LocalDetalhes', id: idLocal });
  };

  const executarLogout = async () => {
    try {
      setCarregandoLogout(true);
      if (voiceEnabled) ServicoVoz.speak('Saindo da sua conta');
      await logout();
      resetToHome();
    } finally {
      setCarregandoLogout(false);
    }
  };
  
  const InfoItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity 
      style={[styles.infoItem, isHighContrast && { borderBottomColor: t.colors.primary }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={24} color={t.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <TextoTematizado color={corSecundaria} size="sm" altoContraste={isHighContrast}>{label}</ThemedText>
        <TextoTematizado weight="semibold" altoContraste={isHighContrast} color={corPrincipal}>{value || 'NÃ£o informado'}</ThemedText>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={t.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Recipiente background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: paddingInferiorScroll }}>
        <TextoTematizado variant="h1" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Meu Perfil</ThemedText>
        <Espacador size="md" />

        <Card altoContraste={isHighContrast} variant={isHighContrast ? 'outlined' : 'default'} style={{ padding: t.spacing.xl }}>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: t.colors.primary }]}>
              <TextoTematizado variant="h1" color="textOnPrimary" weight="bold" altoContraste={isHighContrast}>
                {usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <Espacador size="md" />
            <TouchableOpacity 
              onPress={() => voiceEnabled && anunciarInformacoesPerfil()}
              accessibilityLabel="Toque para ouvir informaÃ§Ãµes do perfil"
            >
              <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
                {usuario?.nome}
                {voiceEnabled && <Ionicons name="volume-medium-outline" size={18} color={t.colors.primary} style={{ marginLeft: 8 }} />}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <Espacador size="xl" />

          <InfoItem icon="person-outline" label="Nome" value={usuario?.nome} />
          <InfoItem icon="mail-outline" label="E-mail" value={usuario?.email} />

          <Espacador size="xl" />

          <View style={[styles.segurancaBox, isHighContrast && { borderColor: t.colors.primary, backgroundColor: t.colors.surface }]}>
            <TouchableOpacity 
              style={styles.segurancaHeader}
              onPress={() => voiceEnabled && anunciarInformacoesPerfil()}
              disabled={!voiceEnabled}
            >
              <View style={styles.segurancaIcone}>
                <Ionicons name="shield-checkmark-outline" size={22} color={t.colors.primary} />
              </View>
              <View style={styles.segurancaTexto}>
                <TextoTematizado weight="semibold" altoContraste={isHighContrast} color={corPrincipal}>AutenticaÃ§Ã£o em dois fatores</ThemedText>
                <TextoTematizado color={corSecundaria} size="sm" altoContraste={isHighContrast}>
                  {twoFactorAtivo ? 'Ativada para sua conta' : 'Desativada no momento'}
                </ThemedText>
              </View>
            </TouchableOpacity>

            <Espacador size="sm" />

            <Botao
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

          <Espacador size="xl" />

          <Botao 
            variant="outline" 
            size="large" 
            fullWidth 
            onPress={() => {
              if (voiceEnabled) ServicoVoz.speak('Abrindo troca de senha');
              setShowChangePassword(true);
            }}
            iconLeft="key-outline"
            altoContraste={isHighContrast}
          >
            Trocar Senha
          </Button>

          {isMobile ? (
            <>
              <Espacador size="md" />
              <Botao
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

        <Espacador size="lg" />
        
        <Card altoContraste={isHighContrast} variant={isHighContrast ? 'outlined' : 'default'} style={{ padding: t.spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextoTematizado variant="h2" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Meus Locais</ThemedText>
            {voiceEnabled && (
              <TouchableOpacity onPress={anunciarMeusLocais}>
                <Ionicons name="volume-medium-outline" size={20} color={t.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Espacador size="sm" />
          
          {carregandoMeusLocais ? (
            <TextoTematizado color={corSecundaria}>Carregando seus locais...</ThemedText>
          ) : meusLocais.length === 0 ? (
            <>
              <TextoTematizado color={corSecundaria}>VocÃª ainda nÃ£o cadastrou nenhum local.</ThemedText>
              <Espacador size="sm" />
              <Botao 
                variant="primary" 
                onPress={() => {
                  if (voiceEnabled) ServicoVoz.speak('Abrindo formulÃ¡rio para adicionar local');
                  navigate('Main', { screen: 'Adicionar' });
                }} 
                altoContraste={isHighContrast}
              >
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
                  accessibilityLabel={`Local ${local.nome}, categoria ${local.categoria}`}
                  accessibilityRole="button"
                >
                  <View style={{ flex: 1 }}>
                    <TextoTematizado weight="semibold" altoContraste={isHighContrast}>{local.nome}</ThemedText>
                    <TextoTematizado color="textSecondary" size="sm">{local.categoria}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.colors.textSecondary} />
                </TouchableOpacity>

                {(isAdmin || (usuario && usuario.idUsuario === local.idUsuario)) && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <Botao 
                      variant="outline" 
                      size="small" 
                      onPress={() => handleEditarLocal(local.idLocal)} 
                      altoContraste={isHighContrast}
                    >
                      Editar
                    </Button>
                    <Botao 
                      variant="danger" 
                      size="small" 
                      onPress={() => confirmarExcluirLocal(local)} 
                      altoContraste={isHighContrast}
                    >
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

      <Modal
        visible={modalExcluirVisivel}
        transparent
        animationType="fade"
        onRequestClose={handleCancelarExcluirLocal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: t.colors.surface,
                width: width < 768 ? '88%' : width < 1024 ? '52%' : '35%',
              },
            ]}
          >
            <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
              Excluir local
            </ThemedText>

            <Espacador size="lg" />

            <View style={styles.modalMessage}>
              <TextoTematizado color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja inativar o local{' '}
                <TextoTematizado weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
                  {localParaExcluir?.nome || ''}
                </ThemedText>
                ?
              </ThemedText>
            </View>

            <Espacador size="xl" />

            <View style={styles.modalBotoes}>
              <Botao
                variant="danger"
                size="medium"
                fullWidth
                onPress={handleConfirmarExcluirLocal}
                loading={carregandoExclusao}
                disabled={carregandoExclusao}
                altoContraste={isHighContrast}
              >
                Confirmar exclusÃ£o
              </Button>

              <Espacador size="xs" />

              <Botao
                variant="outline"
                size="medium"
                fullWidth
                onPress={handleCancelarExcluirLocal}
                disabled={carregandoExclusao}
                altoContraste={isHighContrast}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <ModalDoisFatores
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
  },
  modalMessage: {
    alignItems: 'center',
  },
  modalBotoes: {
    width: '100%',
  },
});
