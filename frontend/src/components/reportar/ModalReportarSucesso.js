import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextoTematizado, Espacador } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';

const ModalReportarSucesso = memo(({ visible, onClose }) => {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.container,
          {
            width: isDesktop ? 400 : '85%',
            maxWidth: 500,
            backgroundColor: isHighContrast ? '#1A1A1A' : '#FFFFFF',
            borderWidth: isHighContrast ? 1 : 0,
            borderColor: isHighContrast ? '#333' : 'transparent',
          },
        ]}>
          {/* Ãcone de sucesso */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: t.colors.success + '15' },
          ]}>
            <Ionicons name="checkmark-circle" size={isDesktop ? 56 : 64} color={t.colors.success} />
          </View>

          <Espacador size="md" />

          <TextoTematizado 
            variant="h3" 
            weight="bold" 
            align="center"
            style={styles.title}
          >
            DenÃºncia enviada!
          </ThemedText>

          <Espacador size="sm" />

          <TextoTematizado 
            color="textSecondary" 
            align="center"
            style={styles.message}
          >
            Obrigado por colaborar com a comunidade. Sua denÃºncia serÃ¡ analisada pela nossa equipe.
          </ThemedText>

          <Espacador size="lg" />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: t.colors.primary },
            ]}
            onPress={onClose}
          >
            <TextoTematizado 
              weight="bold" 
              style={[styles.buttonText, { color: '#FFFFFF' }]}
            >
              OK
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

ReportarSucessoModal.displayName = 'ReportarSucessoModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ReportarSucessoModal;