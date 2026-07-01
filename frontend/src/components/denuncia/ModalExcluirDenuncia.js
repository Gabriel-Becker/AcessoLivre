import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Botao } from '../../components/ui';
import { Espacador, TextoTematizado } from '../../components/commons';

export default function ModalExcluirDenuncia({ visible, onClose, denuncia, onConfirm, carregando, isHighContrast, theme }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={isHighContrast}>
            Excluir denï¿½ncia
          </ThemedText>

          <Espacador size="lg" />

          <TextoTematizado color="textSecondary" align="center" altoContraste={isHighContrast}>
            Tem certeza que deseja excluir estï¿½ denï¿½ncia #{denuncia?.id} da tabela?
            Esta aï¿½ï¿½o nï¿½o pode ser desfeita.
          </ThemedText>

          <Espacador size="xl" />

          <View style={styles.modalBotoes}>
            <Botao
              variant="danger"
              size="medium"
              fullWidth
              onPress={onConfirm}
              loading={carregando}
              disabled={carregando}
            >
              Excluir
            </Button>

            <Espacador size="xs" />

            <Botao
              variant="outline"
              size="medium"
              fullWidth
              onPress={onClose}
              disabled={carregando}
            >
              Cancelar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalBotoes: {
    flexDirection: 'column',
    gap: 8,
  },
});