import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../commons';
import { Button, Input } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';

const CRITERIOS_ACESSIBILIDADE = [
  { id: 'rampa', label: 'Possui rampa de acesso?', icon: 'logo-usd' },
  { id: 'elevador', label: 'Tem elevador funcionando?', icon: 'arrow-up-outline' },
  { id: 'banheiro', label: 'Banheiro adaptado disponível?', icon: 'body-outline' },
  { id: 'sinalizacao', label: 'Possui sinalização tátil?', icon: 'eye-outline' },
  { id: 'espaco', label: 'Espaço adequado para cadeira de rodas?', icon: 'resize-outline' },
];

export default function AvaliacaoModal({ visible, onClose, local, onSubmit }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const theme = getTheme(isHighContrast);

  const [nota, setNota] = useState(0);
  const [notaHover, setNotaHover] = useState(0);
  const [criterios, setCriterios] = useState({});
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');

  const handleToggleCriterio = (id) => {
    setCriterios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnviar = () => {
    if (nota === 0) {
      setErro('Por favor, selecione uma avaliação com estrelas antes de enviar.');
      return;
    }
    setErro('');
    
    const avaliacao = {
      nota,
      criterios: Object.keys(criterios).filter(key => criterios[key]),
      comentario: comentario.trim() || null,
      data: new Date().toISOString(),
      localId: local?.id,
      localNome: local?.nome,
    };
    
    onSubmit?.(avaliacao);
    resetForm();
  };

  const resetForm = () => {
    setNota(0);
    setNotaHover(0);
    setCriterios({});
    setComentario('');
    setErro('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    const displayNota = notaHover || nota;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setNota(i)}
          onMouseEnter={() => Platform.OS === 'web' && setNotaHover(i)}
          onMouseLeave={() => Platform.OS === 'web' && setNotaHover(0)}
          activeOpacity={0.7}
          style={styles.starButton}
          accessibilityLabel={`${i} estrelas`}
          accessibilityHint={`Avaliar com ${i} estrelas`}
        >
          <Ionicons
            name={i <= displayNota ? 'star' : 'star-outline'}
            size={40}
            color={i <= displayNota ? theme.colors.warning : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

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
            <View style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surface }
            ]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                  <ThemedText variant="h2" weight="bold" style={styles.titulo}>
                    Avaliar: {local?.nome}
                  </ThemedText>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Spacer size="md" />

                {/* Subtítulo */}
                <ThemedText color="textSecondary" style={styles.subtitulo}>
                  Como você avalia a acessibilidade deste local?
                </ThemedText>

                <Spacer size="md" />

                {/* Estrelas de avaliação */}
                <View style={styles.starsContainer}>
                  <ThemedText weight="semibold" style={styles.labelEstrelas}>
                    Clique nas estrelas para avaliar
                  </ThemedText>
                  <View style={styles.starsRow}>
                    {renderStars()}
                  </View>
                </View>

                <Spacer size="lg" />

                {/* Critérios de Acessibilidade */}
                <View style={styles.criteriosContainer}>
                  <ThemedText weight="bold" style={styles.criteriosTitulo}>
                    Critérios de Acessibilidade
                  </ThemedText>
                  
                  <Spacer size="sm" />

                  {CRITERIOS_ACESSIBILIDADE.map(criterio => (
                    <TouchableOpacity
                      key={criterio.id}
                      onPress={() => handleToggleCriterio(criterio.id)}
                      style={styles.criterioItem}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        { 
                          borderColor: theme.colors.primary,
                          backgroundColor: criterios[criterio.id] 
                            ? theme.colors.primary 
                            : 'transparent'
                        }
                      ]}>
                        {criterios[criterio.id] && (
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                        )}
                      </View>
                      <Ionicons 
                        name={criterio.icon} 
                        size={20} 
                        color={theme.colors.primary} 
                        style={styles.criterioIcon}
                      />
                      <ThemedText style={styles.criterioLabel}>
                        {criterio.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <Spacer size="lg" />

                {/* Comentário */}
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
                  />
                </View>

                <Spacer size="md" />

                {/* Mensagem de erro */}
                {erro ? (
                  <>
                    <View style={styles.erroContainer}>
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
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleEnviar}
                    style={styles.botaoEnviar}
                    altoContraste={isHighContrast}
                  >
                    Enviar Avaliação
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
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 600 : '90%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 24,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  subtitulo: {
    textAlign: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  labelEstrelas: {
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  criteriosContainer: {
    paddingVertical: 8,
  },
  criteriosTitulo: {
    fontSize: 16,
    marginBottom: 8,
  },
  criterioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  criterioIcon: {
    marginRight: 12,
  },
  criterioLabel: {
    flex: 1,
    fontSize: 14,
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
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
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