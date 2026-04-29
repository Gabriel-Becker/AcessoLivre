import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import theme from '../../config/theme';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste = false }) {
  const {
    nome,
    categoria,
    endereco,
    avaliacaoMedia,
    totalAvaliacoes,
    imagemUrl,
    tiposAcessibilidade = [],
  } = local || {};

  // ===== FUNÇÕES AUXILIARES =====
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={14} color={theme.colors.warning} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color={theme.colors.warning} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color={theme.colors.textSecondary} />
        );
      }
    }
    return stars;
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Comercial: theme.colors.primary,
      Saúde: theme.colors.secondary,
      Educação: theme.colors.info,
      Público: theme.colors.success,
      Lazer: theme.colors.warning,
    };
    return colors[cat] || theme.colors.textSecondary;
  };

  // ✅ Função para formatar endereço completo
  const formatEnderecoCompleto = (end) => {
    if (!end) return '';
    
    const partes = [];
    
    if (end.logradouro) partes.push(end.logradouro);
    if (end.numero) partes.push(end.numero);
    if (end.bairro) partes.push(end.bairro);
    if (end.cidade) partes.push(end.cidade);
    if (end.estado) partes.push(end.estado);
    
    return partes.join(', ');
  };

  const getAccessibilityIcon = (tipo) => {
    const icons = {
      ACESSO_RAMPAS: 'logo-usd',
      ACESSO_ELEVADOR: 'arrow-up-outline',
      ACESSO_BANHEIRO_ADAPTADO: 'body-outline',
      ACESSO_VAGA_PCD: 'car-outline',
      ACESSO_GUIA_VISUAL: 'eye-outline',
      ACESSO_LIBRAS: 'hand-left-outline',
      ACESSO_AUDIO_DESCRICAO: 'mic-outline',
      ACESSO_BRAILE: 'braille-outline',
    };
    return icons[tipo] || 'construct-outline';
  };

  const getAccessibilityLabel = (tipo) => {
    const labels = {
      ACESSO_RAMPAS: 'Rampa',
      ACESSO_ELEVADOR: 'Elevador',
      ACESSO_BANHEIRO_ADAPTADO: 'Sanitário adaptado',
      ACESSO_VAGA_PCD: 'Estacionamento PCD',
      ACESSO_GUIA_VISUAL: 'Piso tátil',
      ACESSO_LIBRAS: 'Atendimento em Libras',
      ACESSO_AUDIO_DESCRICAO: 'Áudio-descrição',
      ACESSO_BRAILE: 'Sinalização em Braile',
    };
    return labels[tipo] || tipo;
  };

  // ===== RENDERIZAÇÃO PRINCIPAL =====
  return (
    <TouchableOpacity
      style={[styles.container, altoContraste && styles.containerHighContrast]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${nome || 'Local sem nome'}, ${categoria || ''}, avaliação ${(avaliacaoMedia || 0).toFixed(1)} estrelas`}
    >
      {/* Área da imagem com badge NOVO sobreposto */}
      <View style={styles.imageContainer}>
        {imagemUrl ? (
          <Image source={{ uri: imagemUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={theme.colors.textTertiary} />
            <ThemedText color="textTertiary" style={styles.placeholderText}>
              Sem imagem
            </ThemedText>
          </View>
        )}
        
        {/* Badge "NOVO" posicionado sobre a imagem */}
        {showNewBadge && (
          <View style={styles.newBadge}>
            <ThemedText color="textOnSecondary" weight="bold" style={styles.newBadgeText}>
              NOVO
            </ThemedText>
          </View>
        )}
      </View>

      {/* Conteúdo textual */}
      <View style={styles.content}>
        {/* Cabeçalho: título + categoria */}
        <View style={styles.header}>
          <ThemedText variant="h3" weight="bold" numberOfLines={1} style={styles.title}>
            {nome || 'Local sem nome'}
          </ThemedText>
          {categoria && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(categoria) + '20' }]}>
              <ThemedText style={[styles.categoryText, { color: getCategoryColor(categoria) }]}>
                {categoria}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Avaliação: estrelas + nota + total */}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>{renderStars(avaliacaoMedia)}</View>
          <ThemedText weight="bold" style={styles.ratingNumber}>
            {(avaliacaoMedia || 0).toFixed(1)}
          </ThemedText>
          <ThemedText color="textSecondary" style={styles.reviewCount}>
            ({totalAvaliacoes || 0})
          </ThemedText>
        </View>

        {/* ✅ Endereço COMPLETO (logradouro, número, bairro, cidade, estado) */}
        {endereco && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
            <ThemedText color="textSecondary" numberOfLines={2} style={styles.address}>
              {formatEnderecoCompleto(endereco)}
            </ThemedText>
          </View>
        )}

        {/* Ícones de acessibilidade (até 4) */}
        {tiposAcessibilidade && tiposAcessibilidade.length > 0 && (
          <View style={styles.accessibilityRow}>
            {tiposAcessibilidade.slice(0, 4).map((tipo, index) => (
              <View key={index} style={styles.accessibilityIconWrapper}>
                <Ionicons
                  name={getAccessibilityIcon(tipo)}
                  size={14}
                  color={theme.colors.primary}
                />
                <ThemedText style={styles.accessibilityLabel} numberOfLines={1}>
                  {getAccessibilityLabel(tipo)}
                </ThemedText>
              </View>
            ))}
            {tiposAcessibilidade.length > 4 && (
              <ThemedText style={styles.moreBadge}>+{tiposAcessibilidade.length - 4}</ThemedText>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  containerHighContrast: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  newBadgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 13,
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 11,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Mudado para flex-start para suportar 2 linhas
    gap: 6,
    marginBottom: 12,
  },
  address: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16, // Melhor legibilidade para endereços longos
  },
  accessibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  accessibilityIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  accessibilityLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  moreBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
});