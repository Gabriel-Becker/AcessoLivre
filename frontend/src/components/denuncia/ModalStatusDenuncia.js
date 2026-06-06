 import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { statusOptions } from '../../components/denuncia/filtrosDenuncias';

export default function ModalStatusDenuncia({ visible, onClose, denuncia, onConfirm, carregando, isHighContrast, theme }) {
  const [selectedStatus, setSelectedStatus] = useState(denuncia?.status || 'PENDING');

  useEffect(() => {
    if (denuncia) setSelectedStatus(denuncia.status || 'PENDING');
  }, [denuncia]);

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || '#95A5A6';
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast}>
            Atualizar Status
          </ThemedText>

          <Spacer size="md" />

          <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
            Denúncia #{denuncia?.id} - {denuncia?.motivoLabel || denuncia?.motivo}
          </ThemedText>

          <Spacer size="lg" />

          <View style={styles.statusOptionsContainer}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  {
                    borderColor: option.color,
                    backgroundColor: selectedStatus === option.value ? option.color + '20' : 'transparent',
                  },
                ]}
                onPress={() => setSelectedStatus(option.value)}
              >
                <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                <ThemedText weight={selectedStatus === option.value ? 'bold' : 'regular'} altoContraste={isHighContrast}>
                  {option.label}
                </ThemedText>
                {selectedStatus === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color={option.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Spacer size="xl" />

          <View style={styles.modalBotoes}>
            <Button
              variant="primary"
              size="medium"
              fullWidth
              onPress={() => onConfirm(selectedStatus)}
              loading={carregando}
              disabled={carregando}
            >
              Confirmar
            </Button>

            <Spacer size="xs" />

            <Button
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
  statusOptionsContainer: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalBotoes: {
    flexDirection: 'column',
    gap: 8,
  },
});