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
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TextoTematizado, Espacador } from '../commons';
import { Botao, Entrada } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/ContextoAutenticacao';
import { getTheme } from '../../config/theme';
import toastHelper from '../../utils/toastHelper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AvaliacaoModal({ visible, onClose, local, onSubmit }) {
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const { getUsuarioId, isAuthenticated } = useAuth();
  const theme = getTheme(isHighContrast);
  const insets = useSafeAreaInsets();
  const escalaZoom = Math.max(1, Number(fontSizeMultiplier) || 1);

  const [notaVisual, setNotaVisual] = useState(0);
  const [notaMotora, setNotaMotora] = useState(0);
  const [notaAuditiva, setNotaAuditiva] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [hoverVisual, setHoverVisual] = useState(0);
  const [hoverMotora, setHoverMotora] = useState(0);
  const [hoverAuditiva, setHoverAuditiva] = useState(0);

  const isMobile = SCREEN_WIDTH < 768;
  const tamanhoEstrela = Math.round(isMobile ? 24 : 26 * Math.min(escalaZoom, 1.1));
  const escalaErro = Math.min(escalaZoom, 1.6);
  const tamanhoIconeErro = Math.round((isMobile ? 14 : 16) * escalaErro);
  const corEstrelaAtiva = isHighContrast ? theme.colors.primary : theme.colors.warning;
  const corEstrelaInativa = isHighContrast ? theme.colors.textSecondary : theme.colors.textTertiary;

  const estilosDinamicos = {
    criterioContainer: {
      backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : '#F9F9F9',
      borderWidth: isHighContrast ? 2 : 0,
      borderColor: theme.colors.border,
      paddingVertical: isMobile ? 10 : 12,
      paddingHorizontal: isMobile ? 10 : 14,
    },
    mediaContainer: {
      backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : `${theme.colors.primary}10`,
      borderWidth: isHighContrast ? 2 : 0,
      borderColor: theme.colors.border,
      paddingVertical: isMobile ? 8 : 10,
    },
    erroContainer: {
      backgroundColor: isHighContrast ? theme.colors.background : `${theme.colors.error}20`,
      borderWidth: isHighContrast ? 2 : 1,
      borderColor: isHighContrast ? theme.colors.error : `${theme.colors.error}50`,
      borderRadius: Math.round(8 * Math.min(escalaErro, 1.4)),
      paddingVertical: Math.round((isMobile ? 8 : 10) * escalaErro),
      paddingHorizontal: Math.round((isMobile ? 10 : 12) * escalaErro),
    },
  };

  const estilosZoom = {
    titulo: {
      fontSize: Math.round(isMobile ? 18 : 20 * escalaZoom),
      lineHeight: Math.round(isMobile ? 24 : 26 * escalaZoom),
    },
    subtitulo: {
      fontSize: Math.round(isMobile ? 13 : 14 * escalaZoom),
      lineHeight: Math.round(isMobile ? 18 : 20 * escalaZoom),
    },
    comentarioLabel: {
      fontSize: Math.round(isMobile ? 13 : 14 * escalaZoom),
      lineHeight: Math.round(isMobile ? 18 : 20 * escalaZoom),
    },
    comentarioHint: {
      fontSize: Math.round(isMobile ? 12 : 13 * escalaZoom),
      lineHeight: Math.round(isMobile ? 16 : 18 * escalaZoom),
    },
    comentarioInput: {
      minHeight: Math.round(isMobile ? 60 : 70 * escalaZoom),
      fontSize: Math.round(isMobile ? 13 : 14 * escalaZoom),
      lineHeight: Math.round(isMobile ? 18 : 20 * escalaZoom),
    },
    erroTexto: {
      fontSize: Math.round((isMobile ? 12 : 13) * escalaErro),
      lineHeight: Math.round((isMobile ? 18 : 20) * escalaErro),
    },
  };

  const renderStars = (nota, setNota, hover, setHover, label, disabled = false) => {
    const stars = [];
    const displayNota = Number(hover || nota || 0);

    const getStarIconName = (indiceEstrela, valorNota) => {
      if (valorNota >= indiceEstrela) return 'star';
      if (valorNota >= indiceEstrela - 0.5) return 'star-half';
      return 'star-outline';
    };
    
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
            name={getStarIconName(i, displayNota)}
            size={tamanhoEstrela}
            color={displayNota >= i - 0.5 ? corEstrelaAtiva : corEstrelaInativa}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getNotaDescricao = (nota) => {
    if (nota === 0) return 'Selecione uma nota';
    if (nota === 1) return 'Muito ruim';
    if (nota === 2) return 'Ruim';
    if (nota === 3) return 'Regular';
    if (nota === 4) return 'Bom';
    if (nota === 5) return 'Excelente';
    return '';
  };

  const handleEnviar = async () => {
    if (!isAuthenticated) {
      toastHelper.showError('Faça login para avaliar um local.', 'Login necessário');
      onClose();
      return;
    }

    const userId = getUsuarioId();
    if (!userId) {
      toastHelper.showError('Usuário não identificado. Faça login novamente.', 'Sessão inválida');
      return;
    }

    if (notaVisual === 0 || notaMotora === 0 || notaAuditiva === 0) {
      setErro('Avalie todos os critérios');
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
      
      const resultado = await onSubmit(avaliacaoData);

      if (!resultado?.success) {
        setErro(resultado?.message || 'Não foi possível enviar sua avaliação');
        return;
      }

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

  const modalWidth = isMobile ? '92%' : 480;
  const modalMaxHeight = isMobile ? '85%' : '80%';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardWrapper}
            >
              <View style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.colors.surface,
                  width: modalWidth,
                  maxHeight: modalMaxHeight,
                  padding: isMobile ? 16 : 24,
                  marginHorizontal: isMobile ? 0 : 'auto',
                }
              ]}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <View style={styles.Cabecalho}>
                    <TextoTematizado variant="h2" weight="bold" style={[styles.titulo, estilosZoom.titulo]}>
                      Avaliar Local
                    </TextoTematizado>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={loading}>
                      <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Espacador size="xs" />

                  <View style={styles.localInfo}>
                    <TextoTematizado variant="h3" weight="semibold" numberOfLines={1} style={styles.localNome}>
                      {local?.nome}
                    </TextoTematizado>
                    <TextoTematizado color="textSecondary" variant="caption" style={styles.localCategoria}>
                      {local?.categoria}
                    </TextoTematizado>
                  </View>

                  <Espacador size="sm" />

                  <TextoTematizado color="textSecondary" style={[styles.subtitulo, estilosZoom.subtitulo]}>
                    Avalie a acessibilidade
                  </TextoTematizado>

                  <Espacador size="sm" />

                  <View style={[styles.criterioContainer, estilosDinamicos.criterioContainer]}>
                    <View style={styles.criterioHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="eye-outline" size={isMobile ? 18 : 20} color={theme.colors.primary} />
                      </View>
                      <TextoTematizado weight="bold" style={styles.criterioTitulo}>
                        Visual
                      </TextoTematizado>
                    </View>
                    
                    <View style={styles.starsContainer}>
                      {renderStars(notaVisual, setNotaVisual, hoverVisual, setHoverVisual, 'Visual', loading)}
                    </View>
                    
                    <TextoTematizado variant="caption" color="textSecondary" style={styles.notaDescricao}>
                      {getNotaDescricao(notaVisual)}
                    </TextoTematizado>
                  </View>

                  <Espacador size="sm" />

                  <View style={[styles.criterioContainer, estilosDinamicos.criterioContainer]}>
                    <View style={styles.criterioHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="body-outline" size={isMobile ? 18 : 20} color={theme.colors.primary} />
                      </View>
                      <TextoTematizado weight="bold" style={styles.criterioTitulo}>
                        Motora
                      </TextoTematizado>
                    </View>
                    
                    <View style={styles.starsContainer}>
                      {renderStars(notaMotora, setNotaMotora, hoverMotora, setHoverMotora, 'Motora', loading)}
                    </View>
                    
                    <TextoTematizado variant="caption" color="textSecondary" style={styles.notaDescricao}>
                      {getNotaDescricao(notaMotora)}
                    </TextoTematizado>
                  </View>

                  <Espacador size="sm" />

                  <View style={[styles.criterioContainer, estilosDinamicos.criterioContainer]}>
                    <View style={styles.criterioHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="ear-outline" size={isMobile ? 18 : 20} color={theme.colors.primary} />
                      </View>
                      <TextoTematizado weight="bold" style={styles.criterioTitulo}>
                        Auditiva
                      </TextoTematizado>
                    </View>
                    
                    <View style={styles.starsContainer}>
                      {renderStars(notaAuditiva, setNotaAuditiva, hoverAuditiva, setHoverAuditiva, 'Auditiva', loading)}
                    </View>
                    
                    <TextoTematizado variant="caption" color="textSecondary" style={styles.notaDescricao}>
                      {getNotaDescricao(notaAuditiva)}
                    </TextoTematizado>
                  </View>

                  <Espacador size="sm" />

                  {todasNotasSelecionadas && (
                    <View style={[styles.mediaContainer, estilosDinamicos.mediaContainer]}>
                      <TextoTematizado weight="bold" style={styles.mediaTexto}>Média:</TextoTematizado>
                      <View style={styles.mediaStars}>
                        {renderStars(parseFloat(calcularMedia()), null, null, null, 'Média', true)}
                      </View>
                      <TextoTematizado weight="bold" style={styles.mediaValor}>
                        {calcularMedia()}
                      </TextoTematizado>
                    </View>
                  )}

                  <Espacador size="sm" />

                  <View>
                    <TextoTematizado weight="bold" style={[styles.comentarioLabel, estilosZoom.comentarioLabel]}>
                      Comentário
                    </TextoTematizado>
                    <TextoTematizado color="textSecondary" variant="caption" style={[styles.comentarioHint, estilosZoom.comentarioHint]}>
                      Opcional
                    </TextoTematizado>
                    
                    <Espacador size="xs" />

                    <Entrada
                      multiline
                      numberOfLines={3}
                      value={comentario}
                      onChangeText={setComentario}
                      placeholder="Compartilhe sua experiência..."
                      altoContraste={isHighContrast}
                      style={[styles.comentarioInput, estilosZoom.comentarioInput]}
                      editable={!loading}
                    />
                  </View>

                  <Espacador size="sm" />

                  {erro ? (
                    <>
                      <View
                        style={[styles.erroContainer, estilosDinamicos.erroContainer]}
                        accessibilityRole="alert"
                        accessibilityLiveRegion="polite"
                      >
                        <Ionicons name="alert-circle" size={tamanhoIconeErro} color={theme.colors.error} />
                        <TextoTematizado color="error" style={[styles.erroTexto, estilosZoom.erroTexto]}>
                          {erro}
                        </TextoTematizado>
                      </View>
                      <Espacador size="sm" />
                    </>
                  ) : null}

                  <View style={styles.botoesContainer}>
                    <Botao
                      variant="outline"
                      onPress={handleClose}
                      style={styles.botaoCancelar}
                      altoContraste={isHighContrast}
                      disabled={loading}
                      size="small"
                    >
                      Cancelar
                    </Botao>
                    <Botao
                      variant="primary"
                      onPress={handleEnviar}
                      style={styles.botaoEnviar}
                      altoContraste={isHighContrast}
                      loading={loading}
                      disabled={loading || !todasNotasSelecionadas}
                      size="small"
                    >
                      {loading ? 'Enviando...' : 'Enviar'}
                    </Botao>
                  </View>

                  <Espacador size="xs" />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
  },
  keyboardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    borderRadius: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
  },
  modalScrollContent: {
    paddingBottom: 2,
  },
  Cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  localInfo: {
    alignItems: 'center',
    marginBottom: 2,
  },
  localNome: {
    fontSize: 16,
    textAlign: 'center',
  },
  localCategoria: {
    fontSize: 12,
  },
  subtitulo: {
    textAlign: 'center',
    marginBottom: 4,
  },
  criterioContainer: {
    borderRadius: 10,
  },
  criterioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterioTitulo: {
    fontSize: 14,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 2,
  },
  starButton: {
    padding: 2,
  },
  notaDescricao: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    flexWrap: 'wrap',
  },
  mediaStars: {
    flexDirection: 'row',
    gap: 2,
  },
  mediaTexto: {
    fontSize: 13,
  },
  mediaValor: {
    fontSize: 14,
  },
  comentarioLabel: {
    marginBottom: 1,
  },
  comentarioHint: {
    marginBottom: 4,
  },
  comentarioInput: {
    textAlignVertical: 'top',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  erroContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 6,
  },
  erroTexto: {
    fontSize: 12,
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoCancelar: {
    flex: 1,
  },
  botaoEnviar: {
    flex: 1,
  },
});
