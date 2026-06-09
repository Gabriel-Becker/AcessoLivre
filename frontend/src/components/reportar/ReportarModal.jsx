import React, { useState } from 'react';
import { Modal, StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui';
import { Spacer, ThemedText } from '../commons';
import ReportarService from '../../services/ReportarService';
import toastHelper from '../../utils/toastHelper';

const MOTIVOS = [
  { value: 'CONTEUDO_IMPROPRIO', label: 'Conteúdo impróprio' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OFENSIVO', label: 'Conteúdo ofensivo' },
  { value: 'FAKE_NEWS', label: 'Informação falsa' },
  { value: 'DADOS_PESSOAIS', label: 'Dados pessoais expostos' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function ReportarModal({ visible, onClose, tipo, targetId, targetName }) {
  const [selectedMotivo, setSelectedMotivo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const getMotivoLabel = (value) => {
    const motivo = MOTIVOS.find(m => m.value === value);
    return motivo?.label || value;
  };

  const getTipoLabel = () => {
    if (tipo === 'LOCAL') return 'local';
    if (tipo === 'AVALIACAO' || tipo === 'COMENTARIO') return 'avaliação';
    return 'conteúdo';
  };

  const handleSubmit = async () => {
    if (!selectedMotivo) {
      toastHelper.showError('Selecione um motivo para a denúncia');
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        tipo: tipo === 'COMENTARIO' ? 'AVALIACAO' : tipo,
        targetId: targetId,
        targetName: targetName,
        motivo: selectedMotivo,
        motivoLabel: getMotivoLabel(selectedMotivo),
        descricao: descricao.trim() || null,
      };

      const result = await ReportarService.create(payload);
      
      if (result.success) {
        toastHelper.showSuccess('Denúncia enviada com sucesso');
        onClose();
        setSelectedMotivo(null);
        setDescricao('');
      } else {
        toastHelper.showError(result.message || 'Erro ao enviar denúncia');
      }
    } catch (error) {
      console.error('Erro ao denunciar:', error);
      toastHelper.showError('Erro ao enviar denúncia');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <ThemedText variant="h2" weight="bold">Denunciar {getTipoLabel()}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Spacer size="md" />

          <ThemedText weight="semibold">Motivo da denúncia</ThemedText>
          <Spacer size="xs" />
          
          <ScrollView style={styles.motivosContainer} nestedScrollEnabled>
            {MOTIVOS.map((motivo) => (
              <TouchableOpacity
                key={motivo.value}
                style={[
                  styles.motivoOption,
                  selectedMotivo === motivo.value && styles.motivoOptionSelected
                ]}
                onPress={() => setSelectedMotivo(motivo.value)}
              >
                <View style={styles.motivoRadio}>
                  {selectedMotivo === motivo.value && <View style={styles.motivoRadioSelected} />}
                </View>
                <ThemedText>{motivo.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Spacer size="md" />

          <ThemedText weight="semibold">Descrição (opcional)</ThemedText>
          <Spacer size="xs" />
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Descreva detalhadamente o problema..."
            value={descricao}
            onChangeText={setDescricao}
            textAlignVertical="top"
          />

          <Spacer size="xl" />

          <View style={styles.botoes}>
            <Button
              variant="outline"
              size="medium"
              onPress={onClose}
              disabled={carregando}
              style={styles.botaoCancelar}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="medium"
              onPress={handleSubmit}
              loading={carregando}
              disabled={carregando || !selectedMotivo}
              style={styles.botaoEnviar}
            >
              Enviar Denúncia
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  motivosContainer: {
    maxHeight: 200,
  },
  motivoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
  },
  motivoOptionSelected: {
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
  },
  motivoRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivoRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoCancelar: {
    flex: 1,
  },
  botaoEnviar: {
    flex: 1,
  },
});