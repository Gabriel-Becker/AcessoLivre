// components/local/ModalCompartilhar.js
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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ThemedText, Spacer } from '../commons';
import { Button } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';
import toastHelper from '../../utils/toastHelper';

// Configuração das plataformas de compartilhamento (apenas as solicitadas)
const PLATAFORMAS_COMPARTILHAMENTO = [
  { id: 'whatsapp', nome: 'WhatsApp', icon: 'logo-whatsapp', cor: '#25D366', scheme: 'whatsapp://send?text=', packageName: 'com.whatsapp' },
  { id: 'telegram', nome: 'Telegram', icon: 'logo-telegram', cor: '#26A5E4', scheme: 'tg://msg?text=', packageName: 'org.telegram.messenger' },
  { id: 'instagram', nome: 'Instagram', icon: 'logo-instagram', cor: '#E4405F', scheme: 'instagram://library?AssetPath=', packageName: 'com.instagram.android' },
  { id: 'facebook', nome: 'Facebook', icon: 'logo-facebook', cor: '#1877F2', scheme: 'fb://facewebmodal/f?href=', packageName: 'com.facebook.katana' }
];

export default function ModalCompartilhar({ visible, onClose, local }) {
  const { isHighContrast } = useThemeContext();
  const theme = getTheme(isHighContrast);
  const [compartilhando, setCompartilhando] = useState(false);

  if (!local) return null;

  const nomeLocal = local.nome || 'Local';
  const idLocal = local.id || local.idLocal;
  
  // Construir URL do local
  const baseUrl = Platform.OS === 'web' 
    ? (typeof window !== 'undefined' ? window.location.origin : 'https://acessolivre.app')
    : 'https://acessolivre.app';
  
  const urlLocal = `${baseUrl}/local/${idLocal}`;
  const mensagemCompartilhamento = `📍 ${nomeLocal}\n\nConfira este local acessível no Acesso Livre!\n\n${urlLocal}`;

  // Função para compartilhar via WhatsApp
  const compartilharWhatsApp = async () => {
    setCompartilhando(true);
    try {
      const textoEncoded = encodeURIComponent(mensagemCompartilhamento);
      
      // Tentar diferentes formas de abrir o WhatsApp
      const urls = [
        `whatsapp://send?text=${textoEncoded}`,
        `https://wa.me/?text=${textoEncoded}`
      ];
      
      let aberto = false;
      for (const url of urls) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            aberto = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!aberto) {
        // Fallback: usar Share nativo
        await Share.share({
          title: `Compartilhar ${nomeLocal}`,
          message: mensagemCompartilhamento,
        });
      }
      
      toastHelper.showSuccess('Abrindo WhatsApp...');
      onClose();
    } catch (error) {
      console.error('Erro ao compartilhar no WhatsApp:', error);
      // Fallback final
      await Share.share({
        title: `Compartilhar ${nomeLocal}`,
        message: mensagemCompartilhamento,
      });
    } finally {
      setCompartilhando(false);
    }
  };

  // Função para compartilhar via Telegram
  const compartilharTelegram = async () => {
    setCompartilhando(true);
    try {
      const textoEncoded = encodeURIComponent(mensagemCompartilhamento);
      const url = `tg://msg?text=${textoEncoded}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        toastHelper.showSuccess('Abrindo Telegram...');
        onClose();
      } else {
        // Fallback: usar web do Telegram
        const webUrl = `https://t.me/share/url?url=${encodeURIComponent(urlLocal)}&text=${encodeURIComponent(`📍 ${nomeLocal}`)}`;
        await Linking.openURL(webUrl);
        toastHelper.showSuccess('Abrindo Telegram Web...');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao compartilhar no Telegram:', error);
      await Share.share({
        title: `Compartilhar ${nomeLocal}`,
        message: mensagemCompartilhamento,
      });
    } finally {
      setCompartilhando(false);
    }
  };

  // Função para compartilhar via Instagram
  const compartilharInstagram = async () => {
    setCompartilhando(true);
    try {
      // Instagram não suporta texto diretamente, apenas imagens
      // Então copiamos o link e abrimos o app
      await Clipboard.setStringAsync(urlLocal);
      
      const url = `instagram://library?AssetPath=`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        toastHelper.showSuccess('Link copiado! Abra o Instagram e cole para compartilhar.');
      } else {
        await Linking.openURL('https://www.instagram.com');
        toastHelper.showSuccess('Link copiado! Abra o Instagram e cole para compartilhar.');
      }
      onClose();
    } catch (error) {
      console.error('Erro ao compartilhar no Instagram:', error);
      await Clipboard.setStringAsync(urlLocal);
      toastHelper.showSuccess('Link copiado! Compartilhe manualmente no Instagram.');
      onClose();
    } finally {
      setCompartilhando(false);
    }
  };

  // Função para compartilhar via Facebook
  const compartilharFacebook = async () => {
    setCompartilhando(true);
    try {
      const urlEncoded = encodeURIComponent(urlLocal);
      const textoEncoded = encodeURIComponent(mensagemCompartilhamento);
      
      // Tentar diferentes formas de abrir o Facebook
      const urls = [
        `fb://facewebmodal/f?href=${urlEncoded}`,
        `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}`,
        `https://m.facebook.com/sharer.php?u=${urlEncoded}`
      ];
      
      let aberto = false;
      for (const url of urls) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            aberto = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!aberto) {
        await Share.share({
          title: `Compartilhar ${nomeLocal}`,
          message: mensagemCompartilhamento,
        });
      }
      
      toastHelper.showSuccess('Abrindo Facebook...');
      onClose();
    } catch (error) {
      console.error('Erro ao compartilhar no Facebook:', error);
      await Share.share({
        title: `Compartilhar ${nomeLocal}`,
        message: mensagemCompartilhamento,
      });
    } finally {
      setCompartilhando(false);
    }
  };

  const handleCompartilhar = (plataforma) => {
    switch (plataforma.id) {
      case 'whatsapp':
        compartilharWhatsApp();
        break;
      case 'telegram':
        compartilharTelegram();
        break;
      case 'instagram':
        compartilharInstagram();
        break;
      case 'facebook':
        compartilharFacebook();
        break;
      default:
        break;
    }
  };

  const IconePlataforma = ({ plataforma }) => (
    <TouchableOpacity
      style={[
        styles.plataformaButton,
        { backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : '#F5F5F5' }
      ]}
      onPress={() => handleCompartilhar(plataforma)}
      disabled={compartilhando}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: plataforma.cor + '15' }]}>
        <Ionicons name={plataforma.icon} size={32} color={plataforma.cor} />
      </View>
      <ThemedText weight="medium" style={styles.plataformaNome}>
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
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surface }
            ]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <Ionicons name="share-social-outline" size={24} color={theme.colors.primary} />
                  </View>
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

                {/* URL do Local */}
                <View style={[styles.urlContainer, { backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : '#F5F7FA' }]}>
                  <Ionicons name="link-outline" size={20} color={theme.colors.primary} />
                  <ThemedText color="textSecondary" style={styles.urlTexto} numberOfLines={1}>
                    {urlLocal}
                  </ThemedText>
                </View>

                <Spacer size="md" />

                {/* Divisão */}
                <View style={styles.divisao}>
                  <View style={[styles.linha, { backgroundColor: theme.colors.borderLight }]} />
                  <ThemedText color="textTertiary" variant="caption" style={styles.divisaoTexto}>
                    Compartilhar via
                  </ThemedText>
                  <View style={[styles.linha, { backgroundColor: theme.colors.borderLight }]} />
                </View>

                <Spacer size="md" />

                {/* Grid de Plataformas */}
                <View style={styles.plataformasGrid}>
                  {PLATAFORMAS_COMPARTILHAMENTO.map((plataforma) => (
                    <IconePlataforma key={plataforma.id} plataforma={plataforma} />
                  ))}
                </View>

                <Spacer size="lg" />

                {/* Footer Informativo */}
                <View style={[styles.footer, { borderTopColor: theme.colors.borderLight }]}>
                  <Ionicons name="information-circle-outline" size={16} color={theme.colors.textTertiary} />
                  <ThemedText variant="caption" color="textTertiary" align="center" style={styles.footerTexto}>
                    Ao compartilhar, você ajuda a tornar as informações acessíveis para mais pessoas.
                  </ThemedText>
                </View>

                <Spacer size="md" />

                {/* Botão Fechar */}
                <Button
                  variant="outline"
                  size="medium"
                  onPress={onClose}
                  fullWidth
                  altoContraste={isHighContrast}
                  style={styles.botaoFechar}
                >
                  Fechar
                </Button>

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
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titulo: {
    flex: 1,
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
  },
  urlTexto: {
    flex: 1,
    fontSize: 13,
  },
  divisao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linha: {
    flex: 1,
    height: 1,
  },
  divisaoTexto: {
    fontSize: 12,
  },
  plataformasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  plataformaButton: {
    alignItems: 'center',
    width: 90,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plataformaNome: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerTexto: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  botaoFechar: {
    marginTop: 8,
  },
});