import React, { useMemo } from 'react';
import { Modal, View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { ThemedText } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { TERMOS_DE_USO, POLITICA_PRIVACIDADE } from '../../config/legalTexts';
import { Ionicons } from '@expo/vector-icons';

// type: 'terms' | 'privacy'
export default function TermsModal({ visible, onClose, type = 'terms' }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();

  const styles = useMemo(
    () => {
      const isSmall = width < 768;
      return StyleSheet.create({
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
        modalContainer: {
          width: '90%',
          maxWidth: 400,
          backgroundColor: t.colors.surface,
          borderRadius: 12,
          overflow: 'hidden',
          maxHeight: '80%',
        },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, padding: 16, borderBottomWidth: 1, borderBottomColor: t.colors.borderLight, backgroundColor: t.colors.surface },
        title: { fontSize: 16, lineHeight: 20 },
        closeButton: { padding: 6 },
        content: { padding: 16 },
      });
    },
    [isHighContrast, t, width]
  );

  const texto = type === 'privacy' ? POLITICA_PRIVACIDADE : TERMOS_DE_USO;
  const titulo = type === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <ThemedText weight="bold" style={styles.title}>
              {titulo}
            </ThemedText>
            <Pressable onPress={onClose} accessibilityRole="button" style={styles.closeButton}>
              <Ionicons name="close" size={20} color={t.colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
            <ThemedText>{texto}</ThemedText>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
