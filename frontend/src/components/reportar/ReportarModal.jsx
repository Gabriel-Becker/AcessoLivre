// src/components/reportar/ReportarModal.jsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import useReportar from '../../hooks/useReportar';
import ReportarItem from './ReportarItem';
import ReportarSucessoModal from './ReportarSucessoModal';
import { getMotivosByTipo } from '../../constants/reportarReasons';

const ReportarModal = ({
  visible,
  onClose,
  tipo = 'LOCAL',
  targetId,
  targetName,
}) => {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width, height } = useWindowDimensions();
  const { loading, success, createReport, reset } = useReportar();

  const [selectedMotivo, setSelectedMotivo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isDesktop = width >= 768;
  const motivos = getMotivosByTipo(tipo);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (!visible) {
      setSelectedMotivo(null);
      setDescricao('');
      reset();
      setShowSuccess(false);
    }
  }, [visible, reset]);

  // Quando sucesso do hook, mostrar modal de sucesso
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const handleSubmit = async () => {
    // Validação: motivo é obrigatório
    if (!selectedMotivo) {
      // TODO: Mostrar toast de erro
      console.warn('Nenhum motivo selecionado');
      return;
    }

    // Validação: para motivo OUTRO, descrição é obrigatória
    if (selectedMotivo.id === 'OUTRO' && (!descricao || !descricao.trim())) {
      // TODO: Mostrar toast de erro
      console.warn('Descrição obrigatória para motivo OUTRO');
      return;
    }

    console.log('📝 Enviando denúncia:', {
      tipo,
      targetId,
      targetName,
      motivo: selectedMotivo.id,
      motivoLabel: selectedMotivo.label,
      descricao: descricao.trim() || null,
    });

    await createReport({
      tipo,                         // 'LOCAL' ou 'COMENTARIO' ou 'AVALIACAO'
      targetId,                     // ID do local, comentário ou avaliação
      targetName,                   // Nome para exibição
      motivo: selectedMotivo.id,    // Código do motivo (ex: 'INFORMACAO_INCORRETA')
      motivoLabel: selectedMotivo.label, // Label para exibição
      descricao: descricao.trim() || null,
    });
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const modalHeight = height * 0.85;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.overlay}>
              <View style={[
                styles.container,
                {
                  maxHeight: modalHeight,
                  width: isDesktop ? 520 : '90%',
                  maxWidth: 560,
                  backgroundColor: isHighContrast ? '#0A0A0A' : '#FFFFFF',
                  borderWidth: isHighContrast ? 1 : 0,
                  borderColor: isHighContrast ? '#333' : 'transparent',
                },
              ]}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <Ionicons 
                      name="flag-outline" 
                      size={22} 
                      color={t.colors.error} 
                    />
                    <ThemedText variant="h3" weight="bold" style={styles.headerTitle}>
                      Reportar {tipo === 'LOCAL' ? 'local' : tipo === 'COMENTARIO' ? 'comentário' : 'conteúdo'}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={t.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Spacer size="sm" />

                {/* Nome do alvo (se disponível) */}
                {targetName && (
                  <>
                    <View style={styles.targetContainer}>
                      <Ionicons name="location-outline" size={16} color={t.colors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
                        {targetName}
                      </ThemedText>
                    </View>
                    <Spacer size="md" />
                  </>
                )}

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {/* Título dos motivos */}
                  <ThemedText weight="semibold" style={styles.sectionTitle}>
                    Qual é o problema?
                  </ThemedText>

                  <Spacer size="sm" />

                  {/* Lista de motivos */}
                  {motivos.map((motivo) => (
                    <ReportarItem
                      key={motivo.id}
                      motivo={motivo}
                      selected={selectedMotivo?.id === motivo.id}
                      onPress={() => setSelectedMotivo(motivo)}
                      showDescription={true}
                    />
                  ))}

                  <Spacer size="md" />

                  {/* Campo de descrição */}
                  <ThemedText weight="semibold" style={styles.sectionTitle}>
                    Conte mais detalhes {selectedMotivo?.id === 'OUTRO' && '(obrigatório)'}
                  </ThemedText>

                  <Spacer size="sm" />

                  <View style={[
                    styles.textAreaContainer,
                    {
                      backgroundColor: isHighContrast ? '#1A1A1A' : '#F9FAFB',
                      borderColor: isHighContrast ? '#333' : '#E5E7EB',
                    },
                  ]}>
                    <TextInput
                      style={[
                        styles.textArea,
                        { color: t.colors.textPrimary },
                      ]}
                      placeholder="Descreva o problema com mais detalhes..."
                      placeholderTextColor={t.colors.textTertiary}
                      value={descricao}
                      onChangeText={setDescricao}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  <Spacer size="lg" />

                  {/* Botões de ação */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.cancelButton,
                        {
                          borderColor: isHighContrast ? '#444' : '#E5E7EB',
                        },
                      ]}
                      onPress={onClose}
                      disabled={loading}
                    >
                      <ThemedText color="textSecondary" style={styles.buttonText}>
                        Cancelar
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.submitButton,
                        {
                          backgroundColor: selectedMotivo 
                            ? t.colors.error 
                            : (isHighContrast ? '#333' : '#E5E7EB'),
                          opacity: selectedMotivo ? 1 : 0.6,
                        },
                      ]}
                      onPress={handleSubmit}
                      disabled={!selectedMotivo || loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <ThemedText 
                          weight="bold" 
                          style={[styles.buttonText, { color: selectedMotivo ? '#FFFFFF' : (isHighContrast ? '#666' : '#999') }]}
                        >
                          Denunciar
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Modal de sucesso */}
      <ReportarSucessoModal
        visible={showSuccess}
        onClose={handleSuccessClose}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    marginTop: 8,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  submitButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ReportarModal;