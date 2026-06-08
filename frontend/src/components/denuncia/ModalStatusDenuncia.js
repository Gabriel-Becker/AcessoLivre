// components/denuncia/ModalStatusDenuncia.js
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { statusOptions } from '../../components/denuncia/filtrosDenuncias';
import DenunciaService from '../../services/DenunciaService';

export default function ModalStatusDenuncia({ visible, onClose, denuncia, onConfirm, onResolve, carregando, isHighContrast, theme }) {
  const [selectedStatus, setSelectedStatus] = useState(denuncia?.status || 'PENDING');
  const [resolvendo, setResolvendo] = useState(false);

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

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'LOCAL':
        return '🏢 Local';
      case 'AVALIACAO':
        return '⭐ Avaliação';
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

  const handleResolver = async () => {
    setResolvendo(true);
    try {
      const result = await DenunciaService.resolver(denuncia?.id);
      if (result.success) {
        if (onResolve) {
          onResolve(denuncia);
        }
        onClose();
      } else {
        // Toast error será mostrado pelo componente pai
        if (onConfirm) {
          onConfirm('RESOLVED', true);
        }
      }
    } catch (error) {
      console.error('Erro ao resolver denúncia:', error);
    } finally {
      setResolvendo(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast}>
            Atualizar Status
          </ThemedText>

          <Spacer size="md" />

          {/* Informações da Denúncia */}
          <View style={styles.infoCard}>
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
              <ThemedText variant="caption" color="textSecondary">Denúncia #</ThemedText>
              <ThemedText weight="medium">{denuncia?.id}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" color="textSecondary">Alvo:</ThemedText>
              <ThemedText weight="medium">{denuncia?.targetName || 'Não informado'}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" color="textSecondary">Motivo:</ThemedText>
              <ThemedText weight="medium">{denuncia?.motivoLabel || denuncia?.motivo}</ThemedText>
            </View>
            
            {denuncia?.descricao && (
              <View style={styles.infoRow}>
                <ThemedText variant="caption" color="textSecondary">Descrição:</ThemedText>
                <ThemedText size="sm">{denuncia.descricao}</ThemedText>
              </View>
            )}
          </View>

          <Spacer size="lg" />

          <ThemedText weight="bold" altoContraste={isHighContrast}>
            Alterar status manualmente:
          </ThemedText>

          <Spacer size="sm" />

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
            {/* Botão Resolver e remover conteúdo */}
            <Button
              variant="danger"
              size="medium"
              fullWidth
              onPress={handleResolver}
              loading={resolvendo || carregando}
              disabled={resolvendo || carregando}
            >
              🗑️ Resolver e remover conteúdo
            </Button>

            <Spacer size="xs" />

            <Button
              variant="primary"
              size="medium"
              fullWidth
              onPress={() => onConfirm(selectedStatus)}
              loading={carregando && !resolvendo}
              disabled={carregando || resolvendo}
            >
              Atualizar Status
            </Button>

            <Spacer size="xs" />

            <Button
              variant="outline"
              size="medium"
              fullWidth
              onPress={onClose}
              disabled={carregando || resolvendo}
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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