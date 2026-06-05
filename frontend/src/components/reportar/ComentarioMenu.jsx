import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import ReportarModal from './ReportarModal';

const ComentarioMenu = ({ comentario, autorNome, showReportar = true }) => {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [showReportarModal, setShowReportarModal] = useState(false);

  const handleReportar = () => {
    setMenuVisible(false);
    setShowReportarModal(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.menuButton}
        accessibilityLabel="Mais opções"
      >
        <Ionicons name="ellipsis-vertical" size={18} color={t.colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[
            styles.menuContainer,
            {
              backgroundColor: isHighContrast ? '#1A1A1A' : '#FFFFFF',
              borderWidth: isHighContrast ? 1 : 0,
              borderColor: isHighContrast ? '#333' : 'transparent',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            },
          ]}>
            {showReportar && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleReportar}
              >
                <Ionicons name="flag-outline" size={isDesktop ? 18 : 20} color={t.colors.error} />
                <ThemedText color="error" style={styles.menuItemText}>
                  Reportar comentário
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <ReportarModal
        visible={showReportarModal}
        onClose={() => setShowReportarModal(false)}
        tipo="COMENTARIO"
        targetId={comentario.id}
        targetName={`Comentário de ${autorNome || 'usuário'}`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    minWidth: 200,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
  },
});

export default ComentarioMenu;