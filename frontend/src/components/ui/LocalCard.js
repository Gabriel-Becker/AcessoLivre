import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1200,
  DESKTOP: 1400,
};

export default function LocalCard({ local, onPress, altoContraste = false, compact = false }) {
  const [imageError, setImageError] = useState(false);
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const { width } = useWindowDimensions();
  const escalaZoom = Math.max(1, Number(fontSizeMultiplier) || 1);
  
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo, fontSizeMultiplier);

  const isMobile = width < BREAKPOINTS.MOBILE;
  const isTablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;
  const isDesktop = width >= BREAKPOINTS.TABLET;

  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria || 'Sem categoria';
  const endereco = local?.endereco;
  const avaliacaoMedia = local?.avaliacaoMedia || 0;
  const totalAvaliacoes = local?.totalAvaliacoes || 0;
  const tiposAcessibilidade = local?.tiposAcessibilidade || [];
  const nomeLocalPrincipal = local?.nomeLocalPrincipal || null;
  const totalImagens = local?.totalImagens ?? 0;
  const isNew = local?.isMaisRecente === true;

  const imagemUrl = local?.imagemUrl || local?.imagens?.[0]?.urlCompleta || local?.imagens?.[0]?.url || null;

  const imageHeight = useMemo(() => {
    const alturaBase = compact
      ? (isDesktop ? 120 : isTablet ? 140 : 160)
      : (isDesktop ? 150 : isTablet ? 180 : 200);

    return Math.round(alturaBase * escalaZoom);
  }, [isDesktop, isTablet, compact, escalaZoom]);

  const imageHeightBadge = useMemo(() => {
    if (compact) return 80;
    return imageHeight;
  }, [imageHeight, compact]);

  const fontSize = useMemo(() => ({
    nome: (isDesktop ? 15 : 16) * escalaZoom,
    categoria: (isDesktop ? 10 : 11) * escalaZoom,
    badgeNovo: (isDesktop ? 10 : 11) * escalaZoom,
    badgeImagem: (isDesktop ? 10 : 12) * escalaZoom,
    endereco: (isDesktop ? 10 : 12) * escalaZoom,
    rating: (isDesktop ? 13 : 14) * escalaZoom,
    recursos: (isDesktop ? 11 : 12) * escalaZoom,
    recursosNumero: (isDesktop ? 12 : 13) * escalaZoom,
    recomendado: (isDesktop ? 11 : 12) * escalaZoom,
  }), [isDesktop, escalaZoom]);

  const spacing = useMemo(() => ({
    padding: (isDesktop ? 10 : 14) * escalaZoom,
    gap: (isDesktop ? 4 : 6) * escalaZoom,
    marginBottom: (isDesktop ? 6 : 8) * escalaZoom,
    borderRadius: isDesktop ? 16 : 20,
  }), [isDesktop, escalaZoom]);

  const imagemParaExibir = useMemo(() => {
    if (imageError) return null;
    return imagemUrl;
  }, [imageError, imagemUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    const starSize = Math.round((isDesktop ? 12 : 16) * escalaZoom);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={starSize} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={starSize} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={starSize} color="#CCCCCC" />);
      }
    }
    return stars;
  };

  const enderecoLinha1 = [
    endereco?.logradouro,
    endereco?.numero
  ].filter(Boolean).join(', ');

  const enderecoLinha2 = [
    endereco?.cidade,
    endereco?.estado
  ].filter(Boolean).join(' - ');

  const getCategoriaLabel = (cat) => {
    const labels = {
      COMERCIAL: 'Comercial',
      PUBLICO: 'Público',
      SAUDE: 'Saúde',
      EDUCACAO: 'Educação',
      LAZER: 'Lazer',
      TRANSPORTE: 'Transporte',
      ALIMENTACAO: 'Alimentação',
      HOSPEDAGEM: 'Hospedagem',
      SERVICOS: 'Serviços'
    };
    return labels[cat] || cat;
  };

  const categoriaLabel = getCategoriaLabel(categoria);
  const totalRecursos = tiposAcessibilidade.length;
  const isRecomendado = avaliacaoMedia > 4;

  const estilos = useMemo(() => criarEstilos(t, contrasteAtivo, imageHeight, fontSize, spacing, isDesktop, isTablet, isMobile, compact), 
    [t, contrasteAtivo, imageHeight, fontSize, spacing, isDesktop, isTablet, isMobile, compact]);

  return (
    <TouchableOpacity
      style={estilos.container}
      onPress={onPress}
      activeOpacity={0.9}
    >

      <View style={estilos.imageContainer}>
        {imagemParaExibir ? (
          <Image
            source={{ uri: imagemParaExibir }}
            style={estilos.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={estilos.imagePlaceholder}>
            <Ionicons name="image-outline" size={isDesktop ? 40 : 50} color={t.colors.textTertiary} />
          </View>
        )}
        
        {isNew && !compact && (
          <View style={estilos.newBadge}>
            <Ionicons name="sparkles" size={isDesktop ? 10 : 12} color="#FFF" />
            <ThemedText weight="bold" style={estilos.newBadgeText}>Novo</ThemedText>
          </View>
        )}

        {totalImagens > 0 && !compact && (
          <View style={estilos.imagemBadge}>
            <ThemedText weight="bold" style={estilos.imagemBadgeTexto}>
              1/{totalImagens}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={estilos.contentContainer}>
        {/* Área do nome + vínculo e categoria */}
        <View style={styles.nomeCategoriaRow}>
          <View style={{ flex: 1 }}>
            <ThemedText weight="bold" style={estilos.nomeLocal} numberOfLines={1}>
              {nome}
            </ThemedText>
        
            {nomeLocalPrincipal && nomeLocalPrincipal.trim() && !compact && (
              <ThemedText numberOfLines={1} style={estilos.nomeLocalPrincipal}>
                Dentro de {nomeLocalPrincipal}
              </ThemedText>
            )}
          </View>

          <View style={estilos.categoriaBadge}>
            <ThemedText style={estilos.categoriaTexto}>{categoriaLabel}</ThemedText>
          </View>
        </View>

        <View style={estilos.ratingContainer}>
          <View style={estilos.starsContainer}>{renderStars(avaliacaoMedia)}</View>
          <ThemedText weight="bold" style={estilos.ratingNumber}>
            {avaliacaoMedia.toFixed(1)}
          </ThemedText>
          <ThemedText style={estilos.ratingCount}>
            ({totalAvaliacoes})
          </ThemedText>
        </View>

        {endereco && (enderecoLinha1 || enderecoLinha2) && !compact && (
          <View style={estilos.enderecoContainer}>
            <Ionicons name="location-outline" size={isDesktop ? 12 : 14} color="#888888" style={estilos.enderecoIcon} />
            <View style={estilos.enderecoTextos}>
              {enderecoLinha1 ? (
                <ThemedText style={estilos.enderecoLinha1} numberOfLines={1}>
                  {enderecoLinha1}
                </ThemedText>
              ) : null}
              {enderecoLinha2 ? (
                <ThemedText style={estilos.enderecoLinha2} numberOfLines={1}>
                  {enderecoLinha2}
                </ThemedText>
              ) : null}
            </View>
          </View>
        )}

        <View style={estilos.recomendadoRecursosRow}>
          {isRecomendado && !compact && (
            <View style={estilos.recomendadoContainer}>
              <Ionicons name="checkmark-circle" size={isDesktop ? 14 : 16} color="#4CAF50" />
              <ThemedText weight="semibold" style={estilos.recomendadoTexto}>
                Recomendado
              </ThemedText>
            </View>
          )}

          <View style={estilos.recursosContainer}>
            <Ionicons name="accessibility-outline" size={isDesktop ? 12 : 14} color={t.colors.primary} />
            <View style={estilos.recursosBadge}>
              <ThemedText weight="bold" style={estilos.recursosNumero}>
                +{totalRecursos}
              </ThemedText>
              <ThemedText style={estilos.recursosLabel}>
                recursos
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nomeCategoriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
});

function criarEstilos(t, contrasteAtivo, imageHeight, fontSize, spacing, isDesktop, isTablet, isMobile, compact) {
  return StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: spacing.borderRadius,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: contrasteAtivo ? 2 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    imageContainer: {
      width: '100%',
      height: imageHeight,
      position: 'relative',
      backgroundColor: '#F5F5F5',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
    },
    newBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#2563EB',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: isDesktop ? 8 : 10,
      paddingVertical: isDesktop ? 4 : 5,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 10,
    },
    newBadgeText: {
      fontSize: fontSize.badgeNovo,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    imagemBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: isDesktop ? 8 : 10,
      paddingVertical: isDesktop ? 4 : 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      zIndex: 10,
      elevation: 5,
    },
    imagemBadgeTexto: {
      fontSize: fontSize.badgeImagem,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    contentContainer: {
      padding: spacing.padding,
    },
    nomeLocal: {
      fontSize: fontSize.nome,
      fontWeight: 'bold',
      color: '#1A1A1A',
      marginBottom: 2,
    },
    nomeLocalPrincipal: {
      fontSize: fontSize.endereco,
      color: '#888888',
      marginTop: 2,
    },
    categoriaBadge: {
      backgroundColor: '#EAF3FF',
      paddingHorizontal: isDesktop ? 8 : 12,
      paddingVertical: isDesktop ? 3 : 4,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    categoriaTexto: {
      fontSize: fontSize.categoria,
      color: '#2563EB',
      fontWeight: '600',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.gap,
      marginBottom: spacing.marginBottom,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 2,
    },
    ratingNumber: {
      fontSize: fontSize.rating,
      fontWeight: 'bold',
      color: '#1A1A1A',
    },
    ratingCount: {
      fontSize: fontSize.endereco,
      color: '#666666',
    },
    enderecoContainer: {
      flexDirection: 'row',
      marginBottom: spacing.marginBottom,
      gap: spacing.gap,
    },
    enderecoIcon: {
      marginTop: 2,
    },
    enderecoTextos: {
      flex: 1,
    },
    enderecoLinha1: {
      fontSize: fontSize.endereco,
      color: '#666666',
      lineHeight: 16,
    },
    enderecoLinha2: {
      fontSize: fontSize.endereco,
      color: '#666666',
      lineHeight: 16,
    },
    recomendadoRecursosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingTop: spacing.padding - 4,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    recomendadoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.gap,
    },
    recomendadoTexto: {
      fontSize: fontSize.recomendado,
      fontWeight: '600',
      color: '#1A1A1A',
    },
    recursosContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.gap,
    },
    recursosBadge: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    recursosNumero: {
      fontSize: fontSize.recursosNumero,
      fontWeight: 'bold',
      color: '#2563EB',
    },
    recursosLabel: {
      fontSize: fontSize.recursos,
      color: '#666666',
    },
  });
}