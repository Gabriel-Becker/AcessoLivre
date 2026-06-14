import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../commons';
import { Button, Input } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getTheme } from '../../config/theme';

export default function AvaliacaoModal({ visible, onClose, local, onSubmit }) {
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const { getUsuarioId, isAuthenticated } = useAuth();
  const theme = getTheme(isHighContrast);
  const insets = useSafeAreaInsets();
  const escalaZoom = Math.max(1, Number(fontSizeMultiplier) || 1);
  const estilosDinamicos = {
    criterioContainer: {
      backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : '#F9F9F9',
      borderWidth: isHighContrast ? 2 : 0,
      borderColor: theme.colors.border,
    },
    criterioTitulo: {
      color: theme.colors.textPrimary,
    },
    notaDescricao: {
      color: theme.colors.textSecondary,
    },
    mediaContainer: {
      backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : `${theme.colors.primary}10`,
      borderWidth: isHighContrast ? 2 : 0,
      borderColor: theme.colors.border,
    },
    mediaTexto: {
      color: theme.colors.textPrimary,
    },
  };
  const tamanhoEstrela = Math.round(32 * escalaZoom);
  const estilosZoom = {
    titulo: {
      fontSize: Math.round(26 * escalaZoom),
      lineHeight: Math.round(32 * escalaZoom),
    },
    subtitulo: {
      fontSize: Math.round(18 * escalaZoom),
      lineHeight: Math.round(27 * escalaZoom),
    },
    comentarioLabel: {
      fontSize: Math.round(16 * escalaZoom),
      lineHeight: Math.round(22 * escalaZoom),
    },
    comentarioHint: {
      fontSize: Math.round(15 * escalaZoom),
      lineHeight: Math.round(22 * escalaZoom),
    },
    comentarioInput: {
      minHeight: Math.round(100 * escalaZoom),
      fontSize: Math.round(16 * escalaZoom),
      lineHeight: Math.round(24 * escalaZoom),
    },
  };

  // Estados para as 3 notas obrigatórias
  const [notaVisual, setNotaVisual] = useState(0);
  const [notaMotora, setNotaMotora] = useState(0);
  const [notaAuditiva, setNotaAuditiva] = useState(0);
  
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Hover states para web
  const [hoverVisual, setHoverVisual] = useState(0);
  const [hoverMotora, setHoverMotora] = useState(0);
  const [hoverAuditiva, setHoverAuditiva] = useState(0);

  const renderStars = (nota, setNota, hover, setHover, label, disabled = false) => {
    const stars = [];
    const displayNota = hover || nota;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !disabled && setNota(i)}
          onMouseEnter={() => Platform.OS === 'web' && !disabled && setHover(i)}
          onMouseLeave={() => Platform.OS === 'web' && !disabled && setHover(0)}
          activeOpacity={0.7}
          style={styles.starButton}
          disabled={disabled}
          accessibilityLabel={`${label}: ${i} estrelas`}
          accessibilityHint={`Nota ${i} para ${label.toLowerCase()}`}
        >
          <Ionicons
            name={i <= displayNota ? 'star' : 'star-outline'}
            size={tamanhoEstrela}
            color={i <= displayNota ? theme.colors.warning : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getNotaDescricao = (nota) => {
    if (nota === 0) return 'Selecione uma nota';
    if (nota === 1) return 'Muito ruim - Precisa melhorar muito';
    if (nota === 2) return 'Ruim - Vários problemas';
    if (nota === 3) return 'Regular - Atende parcialmente';
    if (nota === 4) return 'Bom - Boa acessibilidade';
    if (nota === 5) return 'Excelente - Totalmente acessível';
    return '';
  };

  const handleEnviar = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login necessário', 'Faça login para avaliar um local');
      onClose();
      return;
    }

    const userId = getUsuarioId();
    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    if (notaVisual === 0 || notaMotora === 0 || notaAuditiva === 0) {
      setErro('Por favor, avalie todos os critérios de acessibilidade');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      const avaliacaoData = {
        idLocal: local?.idLocal || local?.id,
        idUsuario: userId,
        notaAcessibilidadeVisual: notaVisual,
        notaAcessibilidadeMotora: notaMotora,
        notaAcessibilidadeAuditiva: notaAuditiva,
        comentario: comentario.trim() || null
      };
      
      await onSubmit(avaliacaoData);
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setErro(error.message || 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNotaVisual(0);
    setNotaMotora(0);
    setNotaAuditiva(0);
    setComentario('');
    setErro('');
    setHoverVisual(0);
    setHoverMotora(0);
    setHoverAuditiva(0);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const calcularMedia = () => {
    const soma = notaVisual + notaMotora + notaAuditiva;
    const count = [notaVisual, notaMotora, notaAuditiva].filter(n => n > 0).length;
    if (count === 0) return 0;
    return (soma / 3).toFixed(1);
  };

  const todasNotasSelecionadas = notaVisual > 0 && notaMotora > 0 && notaAuditiva > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardWrapper}
            >
              <View style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.colors.surface,
                  marginTop: Math.max(insets.top, 12),
                  marginBottom: Math.max(insets.bottom, 12),
                }
              ]}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalScrollContent}
                >
                {/* Header */}
                <View style={styles.header}>
                  <ThemedText variant="h2" weight="bold" style={[styles.titulo, estilosZoom.titulo]}>
                    Avaliar Local
                  </ThemedText>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={loading}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Spacer size="sm" />

                <View style={styles.localInfo}>
                  <ThemedText variant="h3" weight="semibold" numberOfLines={2}>
                    {local?.nome}
                  </ThemedText>
                  <ThemedText color="textSecondary" variant="caption">
                    {local?.categoria}
                  </ThemedText>
                </View>

                <Spacer size="md" />

                <ThemedText color="textSecondary" style={[styles.subtitulo, estilosZoom.subtitulo]}>
                  Como você avalia a acessibilidade deste local?
                </ThemedText>

                <Spacer size="lg" />

                {/* Critério 1: Acessibilidade Visual */}
                <View style={[styles.criterioContainer, estilosDinamicos.criterioContainer]}>
                  <View style={styles.criterioHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Ionicons name="eye-outline" size={24} color={theme.colors.primary} />
                    </View>
                    <ThemedText weight="bold" style={[styles.criterioTitulo, estilosDinamicos.criterioTitulo]}>
                      Acessibilidade Visual
                    </ThemedText>
                  </View>
                  
                  <View style={styles.starsContainer}>
                    {renderStars(notaVisual, setNotaVisual, hoverVisual, setHoverVisual, 'Visual', loading)}
                  </View>
                  
                  <ThemedText variant="caption" color="textSecondary" style={[styles.notaDescricao, estilosDinamicos.notaDescricao]}>
                    {getNotaDescricao(notaVisual)}
                  </ThemedText>
                </View>

                <Spacer size="lg" />

                {/* Critério 2: Acessibilidade Motora */}
                <View style={[styles.criterioContainer, estilosDinamicos.criterioContainer]}>
                  <View style={styles.criterioHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Ionicons name="body-outline" size={24} color={theme.colors.primary} />
                    </View>
                    <ThemedText weight="bold" style={[styles.criterioTitulo, estilosDinamicos.criterioTitulo]}>
                      Acessibilidade Motora
                    </ThemedText>
                  </View>
                  
                  <View style={styles.starsContainer}>
                    {renderStars(notaMotora, setNotaMotora, hoverMotora, setHoverMotora, 'Motora', loading)}
                  </View>
                  
                  <ThemedText variant="caption" color="textSecondary" style={[styles.notaDescricao, estilosDinamicos.notaDescricao]}>
                    {getNotaDescricao(notaMotora)}
                  </ThemedText>
                </View>

                <Spacer size="lg" />

                {/* Critério 3: Acessibilidade Auditiva */}
                <View style={[styles.criterioContainer, estilosDinamicos.criterioContainer]}>
                  <View style={styles.criterioHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Ionicons name="ear-outline" size={24} color={theme.colors.primary} />
                    </View>
                    <ThemedText weight="bold" style={[styles.criterioTitulo, estilosDinamicos.criterioTitulo]}>
                      Acessibilidade Auditiva
                    </ThemedText>
                  </View>
                  
                  <View style={styles.starsContainer}>
                    {renderStars(notaAuditiva, setNotaAuditiva, hoverAuditiva, setHoverAuditiva, 'Auditiva', loading)}
                  </View>
                  
                  <ThemedText variant="caption" color="textSecondary" style={[styles.notaDescricao, estilosDinamicos.notaDescricao]}>
                    {getNotaDescricao(notaAuditiva)}
                  </ThemedText>
                </View>

                <Spacer size="lg" />

                {/* Média atual */}
                {todasNotasSelecionadas && (
                  <View style={[styles.mediaContainer, estilosDinamicos.mediaContainer]}>
                    <ThemedText weight="bold" style={estilosDinamicos.mediaTexto}>Média Geral:</ThemedText>
                    <View style={styles.mediaStars}>
                      {renderStars(parseFloat(calcularMedia()), null, null, null, 'Média', true)}
                    </View>
                    <ThemedText weight="bold" style={[styles.mediaValor, estilosDinamicos.mediaTexto]}>
                      {calcularMedia()}
                    </ThemedText>
                  </View>
                )}

                <Spacer size="lg" />

                {/* Comentário */}
                <View>
                  <ThemedText weight="bold" style={[styles.comentarioLabel, estilosZoom.comentarioLabel]}>
                    Comentário (Opcional)
                  </ThemedText>
                  <ThemedText color="textSecondary" variant="caption" style={[styles.comentarioHint, estilosZoom.comentarioHint]}>
                    Compartilhe sua experiência sobre a acessibilidade deste local...
                  </ThemedText>
                  
                  <Spacer size="sm" />

                  <Input
                    multiline
                    numberOfLines={4}
                    value={comentario}
                    onChangeText={setComentario}
                    placeholder="Ex: O local possui rampas bem sinalizadas, elevador funcionando e funcionários treinados para atender pessoas com deficiência..."
                    altoContraste={isHighContrast}
                    style={[styles.comentarioInput, estilosZoom.comentarioInput]}
                    editable={!loading}
                  />
                </View>

                <Spacer size="md" />

                {/* Mensagem de erro */}
                {erro ? (
                  <>
                    <View style={[styles.erroContainer, { backgroundColor: theme.colors.error + '20' }]}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                      <ThemedText color="error" style={styles.erroTexto}>
                        {erro}
                      </ThemedText>
                    </View>
                    <Spacer size="md" />
                  </>
                ) : null}

                {/* Botões de ação */}
                <View style={styles.botoesContainer}>
                  <Button
                    variant="outline"
                    onPress={handleClose}
                    style={styles.botaoCancelar}
                    altoContraste={isHighContrast}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleEnviar}
                    style={styles.botaoEnviar}
                    altoContraste={isHighContrast}
                    loading={loading}
                    disabled={loading || !todasNotasSelecionadas}
                  >
                    {loading ? 'Enviando...' : 'Enviar Avaliação'}
                  </Button>
                </View>

                <Spacer size="md" />
              </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  keyboardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 760 : '94%',
    maxHeight: '94%',
    borderRadius: 28,
    padding: 28,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
    fontSize: 26,
    lineHeight: 32,
  },
  closeButton: {
    padding: 8,
  },
  localInfo: {
    alignItems: 'center',
    gap: 4,
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  criterioContainer: {
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  criterioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterioTitulo: {
    fontSize: 18,
    lineHeight: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  notaDescricao: {
    textAlign: 'center',
    marginTop: 8,
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  mediaStars: {
    flexDirection: 'row',
    gap: 4,
  },
  mediaValor: {
    fontSize: 18,
  },
  comentarioLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  comentarioHint: {
    marginBottom: 8,
  },
  comentarioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  erroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  erroTexto: {
    fontSize: 13,
  },
  botoesContainer: {
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