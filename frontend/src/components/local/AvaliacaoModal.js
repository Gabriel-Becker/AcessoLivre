import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Alert,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../commons';
import { Button, Input } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getTheme, breakpoints } from '../../config/theme';

// Opções rápidas para notas (1 a 5)
const OPCOES_RAPIDAS = [
  { valor: 1, label: 'Muito Ruim', cor: '#FF6B6B', descricao: 'Precisa melhorar muito' },
  { valor: 2, label: 'Ruim', cor: '#FFB347', descricao: 'Vários problemas' },
  { valor: 3, label: 'Regular', cor: '#FFD93D', descricao: 'Atende parcialmente' },
  { valor: 4, label: 'Bom', cor: '#6BCB77', descricao: 'Boa acessibilidade' },
  { valor: 5, label: 'Excelente', cor: '#4D96FF', descricao: 'Totalmente acessível' }
];

// Componente de botão de resposta rápida
const OpcaoRapida = ({ nota, selecionada, onPress, label, descricao, cor, isHighContrast }) => {
  return (
    <TouchableOpacity
      style={[
        styles.opcaoRapida,
        selecionada && { borderColor: cor, backgroundColor: cor + '15' },
        isHighContrast && styles.opcaoRapidaHighContrast
      ]}
      onPress={() => onPress(nota)}
      activeOpacity={0.7}
    >
      <View style={styles.opcaoHeader}>
        <View style={[styles.opcaoNota, { backgroundColor: cor }, isHighContrast && styles.opcaoNotaHighContrast]}>
          <ThemedText weight="bold" style={[styles.opcaoNotaTexto, isHighContrast && styles.opcaoNotaTextoHighContrast]}>
            {nota}
          </ThemedText>
        </View>
        <View style={styles.opcaoTextos}>
          <ThemedText weight="semibold" style={[styles.opcaoLabel, isHighContrast && styles.opcaoLabelHighContrast]}>
            {label}
          </ThemedText>
          <ThemedText variant="caption" color="textTertiary" style={[styles.opcaoDescricao, isHighContrast && styles.opcaoDescricaoHighContrast]}>
            {descricao}
          </ThemedText>
        </View>
        {selecionada && (
          <Ionicons name="checkmark-circle" size={22} color={cor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function AvaliacaoModal({ visible, onClose, local, onSubmit }) {
  const { isHighContrast } = useThemeContext();
  const { getUsuarioId, isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const theme = getTheme(isHighContrast);

  // Responsividade - definir largura baseada no dispositivo
  const isMobile = width < breakpoints?.tablet || width < 768;
  const modalWidth = useMemo(() => {
    if (Platform.OS === 'web') {
      if (width >= 1200) return '45%';
      if (width >= 768) return '55%';
      return '92%';
    }
    return '92%';
  }, [width]);

  // Estados para as 3 notas obrigatórias
  const [notaVisual, setNotaVisual] = useState(0);
  const [notaMotora, setNotaMotora] = useState(0);
  const [notaAuditiva, setNotaAuditiva] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const getNotaInfo = (nota) => {
    return OPCOES_RAPIDAS.find(o => o.valor === nota) || OPCOES_RAPIDAS[0];
  };

  const handleSelectNota = (setter, valor) => {
    setter(valor);
    if (erro) setErro('');
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
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const calcularMedia = () => {
    const soma = notaVisual + notaMotora + notaAuditiva;
    if (notaVisual === 0 || notaMotora === 0 || notaAuditiva === 0) return 0;
    return (soma / 3).toFixed(1);
  };

  const todasNotasSelecionadas = notaVisual > 0 && notaMotora > 0 && notaAuditiva > 0;

  // Componente de critério com respostas rápidas e alto contraste
  const renderCriterio = (titulo, icone, nota, setNota, corIcone) => (
    <View style={[styles.criterioContainer, isHighContrast && styles.criterioContainerHighContrast]}>
      <View style={styles.criterioHeader}>
        <View style={[styles.iconCircle, { backgroundColor: corIcone + '20' }, isHighContrast && styles.iconCircleHighContrast]}>
          <Ionicons name={icone} size={24} color={corIcone} />
        </View>
        <ThemedText weight="bold" style={[styles.criterioTitulo, isHighContrast && styles.criterioTituloHighContrast]}>
          {titulo}
        </ThemedText>
      </View>

      {/* Respostas rápidas - opções em linha com tamanhos aumentados */}
      <View style={styles.opcoesContainer}>
        {OPCOES_RAPIDAS.map(opcao => (
          <TouchableOpacity
            key={opcao.valor}
            style={[
              styles.opcaoBotao,
              nota === opcao.valor && { backgroundColor: opcao.cor, borderColor: opcao.cor },
              isHighContrast && styles.opcaoBotaoHighContrast
            ]}
            onPress={() => handleSelectNota(setNota, opcao.valor)}
            activeOpacity={0.7}
          >
            <ThemedText
              weight={nota === opcao.valor ? "bold" : "medium"}
              style={[
                styles.opcaoBotaoValor,
                nota === opcao.valor && { color: '#FFF' },
                isHighContrast && styles.opcaoBotaoValorHighContrast
              ]}
            >
              {opcao.valor}
            </ThemedText>
            <ThemedText
              variant="caption"
              style={[
                styles.opcaoBotaoLabel,
                nota === opcao.valor && { color: '#FFF' },
                isHighContrast && styles.opcaoBotaoLabelHighContrast
              ]}
            >
              {opcao.label.split(' ')[0]}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Descrição da nota selecionada */}
      {nota > 0 && (
        <View style={[styles.notaSelecionadaContainer, { backgroundColor: getNotaInfo(nota).cor + '20' }, isHighContrast && styles.notaSelecionadaContainerHighContrast]}>
          <Ionicons name="information-circle-outline" size={16} color={getNotaInfo(nota).cor} />
          <ThemedText variant="caption" style={[styles.notaDescricaoTexto, { color: getNotaInfo(nota).cor }, isHighContrast && styles.notaDescricaoTextoHighContrast]}>
            {getNotaInfo(nota).descricao}
          </ThemedText>
        </View>
      )}
    </View>
  );

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
            <View style={[
              styles.modalContainer,
              { 
                backgroundColor: theme.colors.surface,
                width: modalWidth,
                maxWidth: isMobile ? 500 : 700
              }
            ]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                  <ThemedText variant="h2" weight="bold" style={[styles.titulo, isHighContrast && styles.tituloHighContrast]}>
                    Avaliar Local
                  </ThemedText>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={loading}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Spacer size="sm" />

                {/* Informações do local */}
                <View style={styles.localInfo}>
                  <ThemedText variant="h3" weight="semibold" numberOfLines={2} style={[styles.localNome, isHighContrast && styles.localNomeHighContrast]}>
                    {local?.nome}
                  </ThemedText>
                  <View style={[styles.categoriaPill, isHighContrast && styles.categoriaPillHighContrast]}>
                    <ThemedText variant="caption" style={[styles.categoriaPillTexto, isHighContrast && styles.categoriaPillTextoHighContrast]}>
                      {local?.categoria?.replace('_', ' ')}
                    </ThemedText>
                  </View>
                </View>

                <Spacer size="md" />

                <ThemedText color="textSecondary" style={[styles.subtitulo, isHighContrast && styles.subtituloHighContrast]}>
                  Como você avalia a acessibilidade deste local?
                </ThemedText>

                <Spacer size="lg" />

                {/* Critério 1: Acessibilidade Visual */}
                {renderCriterio('Acessibilidade Visual', 'eye-outline', notaVisual, setNotaVisual, theme.colors.primary)}

                <Spacer size="md" />

                {/* Critério 2: Acessibilidade Motora */}
                {renderCriterio('Acessibilidade Motora', 'body-outline', notaMotora, setNotaMotora, '#4CAF50')}

                <Spacer size="md" />

                {/* Critério 3: Acessibilidade Auditiva */}
                {renderCriterio('Acessibilidade Auditiva', 'ear-outline', notaAuditiva, setNotaAuditiva, '#FF9800')}

                {/* Média atual */}
                {todasNotasSelecionadas && (
                  <>
                    <Spacer size="lg" />
                    <View style={[styles.mediaContainer, { backgroundColor: theme.colors.primary + '10' }, isHighContrast && styles.mediaContainerHighContrast]}>
                      <ThemedText weight="bold" style={[styles.mediaLabel, isHighContrast && styles.mediaLabelHighContrast]}>
                        Média Geral:
                      </ThemedText>
                      <View style={styles.mediaEstrelas}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Ionicons
                            key={star}
                            name={star <= parseFloat(calcularMedia()) ? 'star' : 'star-outline'}
                            size={18}
                            color={theme.colors.warning}
                          />
                        ))}
                      </View>
                      <ThemedText weight="bold" style={[styles.mediaValor, isHighContrast && styles.mediaValorHighContrast]}>
                        {calcularMedia()}
                      </ThemedText>
                    </View>
                  </>
                )}

                <Spacer size="lg" />

                {/* Comentário - MANTIDO COMO ESTAVA ORIGINALMENTE */}
                <View>
                  <ThemedText weight="bold" style={styles.comentarioLabel}>
                    Comentário (Opcional)
                  </ThemedText>
                  <ThemedText color="textSecondary" variant="caption" style={styles.comentarioHint}>
                    Compartilhe sua experiência sobre a acessibilidade deste local...
                  </ThemedText>
                  
                  <Spacer size="sm" />

                  <Input
                    multiline
                    numberOfLines={4}
                    value={comentario}
                    onChangeText={setComentario}
                    placeholder="Ex: O local possui rampas bem sinalizadas e funcionários treinados..."
                    altoContraste={isHighContrast}
                    style={styles.comentarioInput}
                    editable={!loading}
                  />
                </View>

                <Spacer size="md" />

                {/* Mensagem de erro */}
                {erro ? (
                  <>
                    <View style={[styles.erroContainer, { backgroundColor: theme.colors.error + '20' }]}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                      <ThemedText color="error" style={[styles.erroTexto, isHighContrast && styles.erroTextoHighContrast]}>
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
  },
  modalContainer: {
    maxHeight: '90%',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
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
  scrollContent: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  tituloHighContrast: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  localInfo: {
    alignItems: 'center',
    gap: 8,
  },
  localNome: {
    fontSize: 18,
    textAlign: 'center',
  },
  localNomeHighContrast: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriaPill: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoriaPillHighContrast: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  categoriaPillTexto: {
    color: '#007AFF',
    fontSize: 11,
  },
  categoriaPillTextoHighContrast: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  subtituloHighContrast: {
    fontSize: 16,
    lineHeight: 24,
  },
  criterioContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 14,
  },
  criterioContainerHighContrast: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  criterioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleHighContrast: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  criterioTitulo: {
    fontSize: 15,
    lineHeight: 20,
  },
  criterioTituloHighContrast: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  opcaoBotao: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  opcaoBotaoHighContrast: {
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#666',
  },
  opcaoBotaoValor: {
    fontSize: 16,
    lineHeight: 20,
  },
  opcaoBotaoValorHighContrast: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  opcaoBotaoLabel: {
    fontSize: 9,
    marginTop: 2,
  },
  opcaoBotaoLabelHighContrast: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  notaSelecionadaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  notaSelecionadaContainerHighContrast: {
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  notaDescricaoTexto: {
    fontSize: 11,
  },
  notaDescricaoTextoHighContrast: {
    fontSize: 13,
    fontWeight: '500',
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: 12,
    flexWrap: 'wrap',
  },
  mediaContainerHighContrast: {
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#000',
  },
  mediaLabel: {
    fontSize: 14,
  },
  mediaLabelHighContrast: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaEstrelas: {
    flexDirection: 'row',
    gap: 4,
  },
  mediaValor: {
    fontSize: 16,
  },
  mediaValorHighContrast: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // ============================================
  // CAMPO DE COMENTÁRIO - ESTILO ORIGINAL (sem alterações)
  // ============================================
  comentarioLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  comentarioHint: {
    marginBottom: 8,
  },
  comentarioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // ============================================
  erroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  erroTexto: {
    fontSize: 12,
  },
  erroTextoHighContrast: {
    fontSize: 14,
    fontWeight: 'bold',
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
  opcaoRapida: {
    marginBottom: 8,
    borderRadius: 12,
    padding: 10,
  },
  opcaoRapidaHighContrast: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  opcaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  opcaoNota: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoNotaHighContrast: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  opcaoNotaTexto: {
    fontSize: 18,
    color: '#FFF',
  },
  opcaoNotaTextoHighContrast: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  opcaoTextos: {
    flex: 1,
  },
  opcaoLabel: {
    fontSize: 14,
  },
  opcaoLabelHighContrast: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  opcaoDescricao: {
    fontSize: 11,
  },
  opcaoDescricaoHighContrast: {
    fontSize: 13,
  },
});