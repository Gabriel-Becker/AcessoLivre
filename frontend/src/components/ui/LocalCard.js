import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import theme from '../../config/theme';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste = false }) {
  // ===== EXTRAI OS DADOS DO LOCAL =====
  const {
    nome,
    categoria,
    endereco,
    avaliacaoMedia,
    totalAvaliacoes,
    imagemPrincipal,  // ← CAMPO QUE O BACKEND ENVIA COM A PRIMEIRA IMAGEM
    imagens,          // ← LISTA COMPLETA DE IMAGENS
    tiposAcessibilidade = [],
  } = local || {};

  // ===== PEGA A IMAGEM PARA EXIBIR =====
  const imagemParaExibir = useMemo(() => {
    // Prioridade 1: imagemPrincipal (enviada pelo backend)
    if (imagemPrincipal) {
      return imagemPrincipal;
    }
    
    // Prioridade 2: primeira imagem da lista 'imagens'
    if (imagens && Array.isArray(imagens) && imagens.length > 0) {
      const primeira = imagens[0];
      if (primeira?.imagemBase64) {
        return primeira.imagemBase64;
      }
      if (primeira?.url) {
        return primeira.url;
      }
      if (typeof primeira === 'string') {
        return primeira;
      }
    }
    
    // Prioridade 3: campo 'imagem' (singular) legado
    if (local?.imagem) {
      return local.imagem;
    }
    
    return null;
  }, [imagemPrincipal, imagens, local]);

  // ===== RENDERIZA AS ESTRELAS =====
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color={theme.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color={theme.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color={theme.colors.textSecondary} />);
      }
    }
    return stars;
  };

  // ===== COR DA CATEGORIA =====
  const getCategoryColor = (cat) => {
    const colors = {
      COMERCIAL: theme.colors.primary,
      PUBLICO: theme.colors.success,
      SAUDE: theme.colors.secondary,
      EDUCACAO: theme.colors.info,
      LAZER: theme.colors.warning,
      TRANSPORTE: theme.colors.primary,
      ALIMENTACAO: theme.colors.success,
      HOSPEDAGEM: theme.colors.info,
      SERVICOS: theme.colors.secondary,
    };
    const normalizedCat = cat?.toUpperCase();
    return colors[normalizedCat] || theme.colors.textSecondary;
  };

  // ===== FORMATA ENDEREÇO =====
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

  // ===== ÍCONES DE ACESSIBILIDADE =====
  const getAccessibilityIcon = (tipo) => {
    const icons = {
      RAMPA: 'logo-usd',
      ELEVADOR: 'arrow-up-outline',
      BANHEIRO_ADAPTADO: 'body-outline',
      ESTACIONAMENTO: 'car-outline',
      PISO_TATIL: 'eye-outline',
      ATENDIMENTO_ESPECIALIZADO: 'hand-left-outline',
      RECURSOS_AUDIOVISUAIS: 'mic-outline',
      SINALIZACAO_BRAILLE: 'braille-outline',
      ESPACO_AMPLO: 'resize-outline',
      MOBILIARIO_ADAPTADO: 'grid-outline',
    };
    return icons[tipo] || 'construct-outline';
  };

  const getAccessibilityLabel = (tipo) => {
    const labels = {
      RAMPA: 'Rampa',
      ELEVADOR: 'Elevador',
      BANHEIRO_ADAPTADO: 'Sanitário',
      ESTACIONAMENTO: 'Estacionamento',
      PISO_TATIL: 'Piso tátil',
      ATENDIMENTO_ESPECIALIZADO: 'Atendimento',
      RECURSOS_AUDIOVISUAIS: 'Áudio-visual',
      SINALIZACAO_BRAILLE: 'Braile',
      ESPACO_AMPLO: 'Espaço amplo',
      MOBILIARIO_ADAPTADO: 'Mobiliário',
    };
    return labels[tipo] || tipo;
  };

  // ===== RENDER =====
  return (
    <TouchableOpacity
      style={[styles.container, altoContraste && styles.containerHighContrast]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${nome || 'Local'}, ${categoria || ''}, avaliação ${(avaliacaoMedia || 0).toFixed(1)} estrelas`}
    >
      {/* IMAGEM */}
      <View style={styles.imageContainer}>
        {imagemParaExibir ? (
          <Image 
            source={{ uri: imagemParaExibir }} 
            style={styles.image}
            onError={(e) => console.log('Erro imagem:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={theme.colors.textTertiary} />
            <ThemedText color="textTertiary" style={styles.placeholderText}>
              Sem imagem
            </ThemedText>
          </View>
        )}
        
        {showNewBadge && (
          <View style={styles.newBadge}>
            <ThemedText color="textOnSecondary" weight="bold" style={styles.newBadgeText}>
              NOVO
            </ThemedText>
          </View>
        )}
      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>
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

        <View style={styles.ratingRow}>
          <View style={styles.stars}>{renderStars(avaliacaoMedia)}</View>
          <ThemedText weight="bold" style={styles.ratingNumber}>
            {(avaliacaoMedia || 0).toFixed(1)}
          </ThemedText>
          <ThemedText color="textSecondary" style={styles.reviewCount}>
            ({totalAvaliacoes || 0})
          </ThemedText>
        </View>

        {endereco && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
            <ThemedText color="textSecondary" numberOfLines={2} style={styles.address}>
              {formatEnderecoCompleto(endereco)}
            </ThemedText>
          </View>
        )}

        {tiposAcessibilidade && tiposAcessibilidade.length > 0 && (
          <View style={styles.accessibilityRow}>
            {tiposAcessibilidade.slice(0, 4).map((tipo, index) => (
              <View key={index} style={styles.accessibilityIconWrapper}>
                <Ionicons name={getAccessibilityIcon(tipo)} size={14} color={theme.colors.primary} />
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
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  address: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
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