import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Botao } from '../../components/ui';
import { Espacador, TextoTematizado } from '../../components/commons';
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
          <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={isHighContrast}>
            Gerenciar Denúncia
          </TextoTematizado>

          <Espacador size="md" />

          <View style={[styles.infoCard, { backgroundColor: theme.colors.background + '80' }]}>
            <View style={styles.infoHeader}>
              <Ionicons 
                name={getTipoIcon(denuncia?.tipo)} 
                size={24} 
                color={theme.colors.primary} 
              />
              <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast}>
                {getTipoLabel(denuncia?.tipo)}
              </TextoTematizado>
            </View>
            
            <Espacador size="xs" />
            
            <View style={styles.infoRow}>
              <TextoTematizado variant="caption" color="textSecondary">Denúncia</TextoTematizado>
              <TextoTematizado weight="medium">#{denuncia?.id}</TextoTematizado>
            </View>
            
            <View style={styles.infoRow}>
              <TextoTematizado variant="caption" color="textSecondary">Alvo</TextoTematizado>
              <TextoTematizado weight="medium" numberOfLines={2}>{denuncia?.targetName || 'Não informado'}</TextoTematizado>
            </View>
            
            <View style={styles.infoRow}>
              <TextoTematizado variant="caption" color="textSecondary">Motivo</TextoTematizado>
              <TextoTematizado weight="medium">{denuncia?.motivoLabel || denuncia?.motivo}</TextoTematizado>
            </View>
            
            {denuncia?.descricao && (
              <View style={styles.infoRow}>
                <TextoTematizado variant="caption" color="textSecondary">Descrição</TextoTematizado>
                <TextoTematizado size="sm" numberOfLines={3}>{denuncia.descricao}</TextoTematizado>
              </View>
            )}
          </View>

          <Espacador size="lg" />

          <TextoTematizado weight="bold" altoContraste={isHighContrast}>
            Alterar status manualmente
          </TextoTematizado>

          <Espacador size="sm" />

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
                <TextoTematizado weight={selectedStatus === option.value ? 'bold' : 'regular'} altoContraste={isHighContrast}>
                  {option.label}
                </TextoTematizado>
                {selectedStatus === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color={option.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Espacador size="xl" />

          <View style={styles.modalBotoes}>
            <Botao
              variant="danger"
              size="medium"
              fullWidth
              onPress={handleResolver}
              loading={carregando}
              disabled={carregando || !denuncia}
            >
              Resolver e Remover Conteúdo
            </Botao>

            <Espacador size="xs" />

            <Botao
              variant="outline"
              size="medium"
              fullWidth
              onPress={handleStatusUpdate}
              loading={carregando}
              disabled={carregando || !denuncia}
            >
              Atualizar Status
            </Botao>

            <Espacador size="xs" />

            <Botao
              variant="ghost"
              size="medium"
              fullWidth
              onPress={onClose}
              disabled={carregando}
            >
              Cancelar
            </Botao>
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