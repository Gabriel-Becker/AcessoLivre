import React, { useMemo } from 'react';
import { Modal, View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { TextoTematizado } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { TERMOS_DE_USO, POLITICA_PRIVACIDADE } from '../../config/legalTexts';
import { Ionicons } from '@expo/vector-icons';

// type: 'terms' | 'privacy'
export default function ModalTermos({ visible, onClose, type = 'terms', altoContraste = false }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const corPrincipal = contrasteAtivo ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = contrasteAtivo ? 'textOnPrimary' : 'textSecondary';

  const styles = useMemo(
    () => {
      return StyleSheet.create({
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
        modalContainer: {
          width: width < 768 ? '94%' : '86%',
          maxWidth: 620,
          backgroundColor: t.colors.surface,
          borderRadius: 16,
          overflow: 'hidden',
          maxHeight: '88%',
        },
        Cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, padding: 20, borderBottomWidth: 1, borderBottomColor: t.colors.borderLight, backgroundColor: t.colors.surface },
        title: { fontSize: 24, lineHeight: 30 },
        closeButton: { padding: 8 },
        content: { padding: 20 },
        texto: { fontSize: 18, lineHeight: 28 },
      });
    },
    [contrasteAtivo, t, width]
  );

  const texto = type === 'privacy' ? POLITICA_PRIVACIDADE : TERMOS_DE_USO;
  const titulo = type === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.Cabecalho}>
            <TextoTematizado weight="bold" altoContraste={contrasteAtivo} color={corPrincipal} style={styles.title}>
              {titulo}
            </TextoTematizado>
            <Pressable onPress={onClose} accessibilityRole="Botao" style={styles.closeButton}>
              <Ionicons name="close" size={24} color={contrasteAtivo ? t.colors.textOnPrimary : t.colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
            <TextoTematizado altoContraste={contrasteAtivo} color={corPrincipal} style={styles.texto}>
              {texto}
            </TextoTematizado>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
