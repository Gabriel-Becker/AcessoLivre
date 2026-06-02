import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Share,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ThemedText, Spacer } from '../commons';
import { Button } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';
import toastHelper from '../../utils/toastHelper';

const PLATAFORMAS_COMPARTILHAMENTO = [
  { id: 'whatsapp', nome: 'WhatsApp', icon: 'logo-whatsapp', cor: '#25D366' },
  { id: 'facebook', nome: 'Facebook', icon: 'logo-facebook', cor: '#1877F2' },
  { id: 'instagram', nome: 'Instagram', icon: 'logo-instagram', cor: '#E4405F' },
  { id: 'telegram', nome: 'Telegram', icon: 'paper-plane-outline', cor: '#26A5E4' },
  { id: 'mais', nome: 'Mais', icon: 'ellipsis-horizontal-circle-outline', cor: '#6C757D' }
];

export default function ModalCompartilhar({ visible, onClose, local }) {
  const { isHighContrast } = useThemeContext();
  const theme = getTheme(isHighContrast);
  const [compartilhando, setCompartilhando] = useState(false);

  if (!local) return null;

  const nomeLocal = local.nome || 'Local';
  const idLocal = local.id || local.idLocal;
  
  const baseUrl = Platform.OS === 'web' 
    ? (typeof window !== 'undefined' ? window.location.origin : 'https://acessolivre.app')
    : 'https://acessolivre.app';
  
  const urlLocal = `${baseUrl}/local/${idLocal}`;
  const mensagemCompartilhamento = `📍 ${nomeLocal}\n\nConfira este local acessível no Acesso Livre!\n\n${urlLocal}`;

  const copiarLink = async () => {
    try {
      await Clipboard.setStringAsync(urlLocal);
      toastHelper.showSuccess('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toastHelper.showError('Erro ao copiar link');
    }
  };

  const compartilharNativo = async () => {
    setCompartilhando(true);
    
    try {
      const result = await Share.share({
        title: `Compartilhar ${nomeLocal}`,
        message: mensagemCompartilhamento,
        url: Platform.OS === 'ios' ? urlLocal : undefined,
      });
      
      if (result.action === Share.sharedAction) {
        toastHelper.showSuccess('Compartilhado com sucesso!');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      await copiarLink();
      Alert.alert(
        'Não foi possível compartilhar',
        'O link foi copiado para você compartilhar manualmente.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setCompartilhando(false);
    }
  };

  // WhatsApp - suporta web e mobile
  const compartilharWhatsApp = async () => {
    setCompartilhando(true);
    try {
      const textoEncoded = encodeURIComponent(mensagemCompartilhamento);
      
      // Web: usar URL web, Mobile: tentar deep link primeiro
      if (Platform.OS === 'web') {
        const webUrl = `https://wa.me/?text=${textoEncoded}`;
        window.open(webUrl, '_blank');
        onClose();
      } else {
        const deepLink = `whatsapp://send?text=${textoEncoded}`;
        const canOpen = await Linking.canOpenURL(deepLink);
        
        if (canOpen) {
          await Linking.openURL(deepLink);
          onClose();
        } else {
          const webUrl = `https://wa.me/?text=${textoEncoded}`;
          await Linking.openURL(webUrl);
          onClose();
        }
      }
    } catch (error) {
      console.error('Erro no WhatsApp:', error);
      await compartilharNativo();
    } finally {
      setCompartilhando(false);
    }
  };

  // Facebook - suporta web e mobile
  const compartilharFacebook = async () => {
    setCompartilhando(true);
    try {
      const urlEncoded = encodeURIComponent(urlLocal);
      
      if (Platform.OS === 'web') {
        const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}`;
        window.open(webUrl, '_blank');
        onClose();
      } else {
        // Tentar deep link primeiro
        const deepLink = `fb://facewebmodal/f?href=${urlEncoded}`;
        const canOpen = await Linking.canOpenURL(deepLink);
        
        if (canOpen) {
          await Linking.openURL(deepLink);
          onClose();
        } else {
          const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}`;
          await Linking.openURL(webUrl);
          onClose();
        }
      }
    } catch (error) {
      console.error('Erro no Facebook:', error);
      await compartilharNativo();
    } finally {
      setCompartilhando(false);
    }
  };

  // Instagram - apenas copia link (não suporta compartilhamento direto)
  const compartilharInstagram = async () => {
    setCompartilhando(true);
    try {
      await Clipboard.setStringAsync(urlLocal);
      
      if (Platform.OS === 'web') {
        window.open('https://www.instagram.com', '_blank');
        toastHelper.showSuccess('Link copiado! Abra o Instagram e cole para compartilhar.');
      } else {
        const deepLink = `instagram://library?AssetPath=`;
        const canOpen = await Linking.canOpenURL(deepLink);
        
        if (canOpen) {
          await Linking.openURL(deepLink);
          toastHelper.showSuccess('Link copiado! Abra o Instagram e cole para compartilhar.');
        } else {
          await Linking.openURL('https://www.instagram.com');
          toastHelper.showSuccess('Link copiado! Abra o Instagram e cole para compartilhar.');
        }
      }
      onClose();
    } catch (error) {
      console.error('Erro no Instagram:', error);
      await Clipboard.setStringAsync(urlLocal);
      toastHelper.showSuccess('Link copiado! Compartilhe manualmente no Instagram.');
      onClose();
    } finally {
      setCompartilhando(false);
    }
  };

  // Telegram - suporta web e mobile
  const compartilharTelegram = async () => {
    setCompartilhando(true);
    try {
      const textoEncoded = encodeURIComponent(mensagemCompartilhamento);
      const urlEncoded = encodeURIComponent(urlLocal);
      
      if (Platform.OS === 'web') {
        const webUrl = `https://t.me/share/url?url=${urlEncoded}&text=${encodeURIComponent(`📍 ${nomeLocal}`)}`;
        window.open(webUrl, '_blank');
        onClose();
      } else {
        const deepLink = `tg://msg?text=${textoEncoded}`;
        const canOpen = await Linking.canOpenURL(deepLink);
        
        if (canOpen) {
          await Linking.openURL(deepLink);
          onClose();
        } else {
          const webUrl = `https://t.me/share/url?url=${urlEncoded}&text=${encodeURIComponent(`📍 ${nomeLocal}`)}`;
          await Linking.openURL(webUrl);
          onClose();
        }
      }
    } catch (error) {
      console.error('Erro no Telegram:', error);
      await compartilharNativo();
    } finally {
      setCompartilhando(false);
    }
  };

  const handleCompartilhar = (plataforma) => {
    switch (plataforma.id) {
      case 'whatsapp':
        compartilharWhatsApp();
        break;
      case 'facebook':
        compartilharFacebook();
        break;
      case 'instagram':
        compartilharInstagram();
        break;
      case 'telegram':
        compartilharTelegram();
        break;
      case 'mais':
        compartilharNativo();
        break;
      default:
        break;
    }
  };

  const IconePlataforma = ({ plataforma }) => (
    <TouchableOpacity
      style={styles.plataformaButton}
      onPress={() => handleCompartilhar(plataforma)}
      disabled={compartilhando}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: plataforma.cor + '15' }]}>
        <Ionicons name={plataforma.icon} size={30} color={plataforma.cor} />
      </View>
      <ThemedText variant="caption" style={styles.plataformaNome}>
        {plataforma.nome}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surface }
            ]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                  <ThemedText variant="h2" weight="bold" style={styles.titulo}>
                    Compartilhar este local
                  </ThemedText>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Spacer size="sm" />

                <ThemedText color="textSecondary" align="center" style={styles.subtitulo}>
                  Ajuda outras pessoas compartilhando este local acessível.
                </ThemedText>

                <Spacer size="lg" />

                <View style={[styles.urlContainer, { backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : '#F5F5F5' }]}>
                  <Ionicons name="link-outline" size={20} color={theme.colors.primary} />
                  <ThemedText color="textSecondary" style={styles.urlTexto} numberOfLines={1}>
                    {urlLocal}
                  </ThemedText>
                  <TouchableOpacity onPress={copiarLink} style={styles.copiarIcon}>
                    <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                <Spacer size="md" />

                <ThemedText weight="semibold" style={styles.compartilharViaLabel}>
                  Compartilhar via
                </ThemedText>

                <Spacer size="sm" />

                <View style={styles.plataformasGrid}>
                  {PLATAFORMAS_COMPARTILHAMENTO.map((plataforma) => (
                    <IconePlataforma key={plataforma.id} plataforma={plataforma} />
                  ))}
                </View>

                <Spacer size="lg" />

                <View style={[styles.footer, { borderTopColor: theme.colors.borderLight }]}>
                  <Ionicons name="information-circle-outline" size={14} color={theme.colors.textTertiary} />
                  <ThemedText variant="caption" color="textTertiary" align="center" style={styles.footerTexto}>
                    Ao compartilhar, você ajuda a tornar as informações acessíveis para mais pessoas.
                  </ThemedText>
                </View>

                <Spacer size="md" />

                <TouchableOpacity style={styles.botaoFechar} onPress={onClose}>
                  <ThemedText color="primary" weight="semibold" align="center">
                    Fechar
                  </ThemedText>
                </TouchableOpacity>

                <Spacer size="sm" />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 480 : '92%',
    maxWidth: 520,
    maxHeight: '75%',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 20,
    lineHeight: 26,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  urlTexto: {
    flex: 1,
    fontSize: 13,
  },
  copiarIcon: {
    padding: 4,
  },
  compartilharViaLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  plataformasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  plataformaButton: {
    alignItems: 'center',
    width: 70,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plataformaNome: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  footerTexto: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  botaoFechar: {
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
});