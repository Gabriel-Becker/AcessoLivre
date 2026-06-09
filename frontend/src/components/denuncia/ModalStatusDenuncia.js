import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { statusOptions } from '../../components/denuncia/filtrosDenuncias';

export default function ModalStatusDenuncia({ 
  visible, 
  onClose, 
  denuncia, 
  onConfirm, 
  onResolve, 
  carregando, 
  isHighContrast, 
  theme 
}) {
  const [selectedStatus, setSelectedStatus] = useState(denuncia?.status || 'PENDING');

  useEffect(() => {
    if (denuncia) setSelectedStatus(denuncia.status || 'PENDING');
  }, [denuncia]);

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || '#95A5A6';
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'LOCAL':
        return 'Local';
      case 'AVALIACAO':
        return 'Avaliação';
      default:
        return tipo || 'Desconhecido';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'LOCAL':
        return 'business-outline';
      case 'AVALIACAO':
        return 'star-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const handleResolver = () => {
    if (!denuncia) return;
    if (onResolve) {
      onResolve(denuncia);
    }
  };

  const handleStatusUpdate = () => {
    if (!denuncia) return;
    if (onConfirm) {
      onConfirm(selectedStatus);
    }
  };

  const statusOptionsSemResolvido = statusOptions.filter(opt => opt.value !== 'RESOLVED');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast}>
            Gerenciar Denúncia
          </ThemedText>

          <Spacer size="md" />

          <View style={[styles.infoCard, { backgroundColor: theme.colors.background + '80' }]}>
            <View style={styles.infoHeader}>
              <Ionicons 
                name={getTipoIcon(denuncia?.tipo)} 
                size={24} 
                color={theme.colors.primary} 
              />
              <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast}>
                {getTipoLabel(denuncia?.tipo)}
              </ThemedText>
            </View>
            
            <Spacer size="xs" />
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" color="textSecondary">Denúncia</ThemedText>
              <ThemedText weight="medium">#{denuncia?.id}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" color="textSecondary">Alvo</ThemedText>
              <ThemedText weight="medium" numberOfLines={2}>{denuncia?.targetName || 'Não informado'}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" color="textSecondary">Motivo</ThemedText>
              <ThemedText weight="medium">{denuncia?.motivoLabel || denuncia?.motivo}</ThemedText>
            </View>
            
            {denuncia?.descricao && (
              <View style={styles.infoRow}>
                <ThemedText variant="caption" color="textSecondary">Descrição</ThemedText>
                <ThemedText size="sm" numberOfLines={3}>{denuncia.descricao}</ThemedText>
              </View>
            )}
          </View>

          <Spacer size="lg" />

          <ThemedText weight="bold" altoContraste={isHighContrast}>
            Alterar status manualmente
          </ThemedText>

          <Spacer size="sm" />

          <View style={styles.statusOptionsContainer}>
            {statusOptionsSemResolvido.map((option) => (
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
              variant="danger"
              size="medium"
              fullWidth
              onPress={handleResolver}
              loading={carregando}
              disabled={carregando || !denuncia}
            >
              Resolver e Remover Conteúdo
            </Button>

            <Spacer size="xs" />

            <Button
              variant="outline"
              size="medium"
              fullWidth
              onPress={handleStatusUpdate}
              loading={carregando}
              disabled={carregando || !denuncia}
            >
              Atualizar Status
            </Button>

            <Spacer size="xs" />

            <Button
              variant="ghost"
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
    maxHeight: '90%',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
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