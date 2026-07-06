import React, { useState } from 'react';
import { Modal, StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Botao } from '../ui';
import { Espacador, TextoTematizado } from '../commons';
import ServicoReportar from '../../services/ServicoReportar';
import toastHelper from '../../utils/toastHelper';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';

const MOTIVOS = [
  { value: 'CONTEUDO_IMPROPRIO', label: 'Conteúdo impróprio' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OFENSIVO', label: 'Conteúdo ofensivo' },
  { value: 'FAKE_NEWS', label: 'Informação falsa' },
  { value: 'DADOS_PESSOAIS', label: 'Dados pessoais expostos' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function ModalReportar({ visible, onClose, tipo, targetId, targetName }) {
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const theme = getTheme(isHighContrast);
  const escalaZoom = Math.max(1, Number(fontSizeMultiplier) || 1);

  const [selectedMotivo, setSelectedMotivo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const estilosZoom = {
    titulo: {
      fontSize: Math.round(24 * escalaZoom),
      lineHeight: Math.round(30 * escalaZoom),
    },
    texto: {
      fontSize: Math.round(16 * escalaZoom),
      lineHeight: Math.round(22 * escalaZoom),
    },
    descricaoInput: {
      fontSize: Math.round(14 * escalaZoom),
      lineHeight: Math.round(20 * escalaZoom),
    },
  };

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

      const result = await ServicoReportar.create(payload);
      
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
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[
          styles.modalContainer,
          {
            backgroundColor: theme.colors.surface,
            borderWidth: isHighContrast ? 2 : 0,
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.Cabecalho}>
            <TextoTematizado variant="h2" weight="bold" style={[styles.titulo, estilosZoom.titulo]}>
              Denunciar {getTipoLabel()}
            </TextoTematizado>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Espacador size="md" />

          <TextoTematizado weight="semibold" style={[styles.textoLabel, estilosZoom.texto]}>
            Motivo da denúncia
          </TextoTematizado>
          <Espacador size="xs" />
          
          <ScrollView style={styles.motivosContainer} nestedScrollEnabled>
            {MOTIVOS.map((motivo) => (
              <TouchableOpacity
                key={motivo.value}
                style={[
                  styles.motivoOption,
                  selectedMotivo === motivo.value && [
                    styles.motivoOptionSelected,
                    {
                      backgroundColor: isHighContrast 
                        ? theme.colors.primary + '30' 
                        : '#F0F0FF',
                      borderWidth: isHighContrast ? 2 : 0,
                      borderColor: theme.colors.primary,
                    }
                  ]
                ]}
                onPress={() => setSelectedMotivo(motivo.value)}
              >
                <View style={[
                  styles.motivoRadio,
                  {
                    borderColor: isHighContrast ? theme.colors.textPrimary : '#007AFF',
                  }
                ]}>
                  {selectedMotivo === motivo.value && (
                    <View style={[
                      styles.motivoRadioSelected,
                      { backgroundColor: theme.colors.primary }
                    ]} />
                  )}
                </View>
                <TextoTematizado style={estilosZoom.texto}>{motivo.label}</TextoTematizado>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Espacador size="md" />

          <TextoTematizado weight="semibold" style={[styles.textoLabel, estilosZoom.texto]}>
            Descrição (opcional)
          </TextoTematizado>
          <Espacador size="xs" />
          <TextInput
            style={[
              styles.textArea,
              {
                borderColor: isHighContrast ? theme.colors.border : '#E0E0E0',
                backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : '#FFFFFF',
                color: theme.colors.textPrimary,
                fontSize: estilosZoom.descricaoInput.fontSize,
                lineHeight: estilosZoom.descricaoInput.lineHeight,
              }
            ]}
            multiline
            numberOfLines={4}
            placeholder="Descreva detalhadamente o problema..."
            placeholderTextColor={theme.colors.textTertiary}
            value={descricao}
            onChangeText={setDescricao}
            textAlignVertical="top"
          />

          <Espacador size="xl" />

          <View style={styles.botoes}>
            <Botao
              variant="outline"
              size="medium"
              onPress={onClose}
              disabled={carregando}
              style={styles.botaoCancelar}
              altoContraste={isHighContrast}
            >
              Cancelar
            </Botao>
            <Botao
              variant="danger"
              size="medium"
              onPress={handleSubmit}
              loading={carregando}
              disabled={carregando || !selectedMotivo}
              style={styles.botaoEnviar}
              altoContraste={isHighContrast}
            >
              Enviar Denúncia
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  Cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  textoLabel: {
    marginBottom: 2,
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
    borderRadius: 8,
  },
  motivoRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivoRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
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