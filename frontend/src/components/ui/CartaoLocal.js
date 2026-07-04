import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextoTematizado } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';
import { normalizarUrlImagem } from '../../utils/urlImagem';

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1200,
  DESKTOP: 1400,
};

const staticStyles = StyleSheet.create({
  nomeCategoriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  imageContainer: {
    width: '100%',
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
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  enderecoTextos: {
    flex: 1,
  },
});

export default function CartaoLocal({ local, onPress, altoContraste = false, compact = false }) {
  const [imageError, setImageError] = useState(false);
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const { width } = useWindowDimensions();
  
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo, fontSizeMultiplier);

  const isTablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;
  const isDesktop = width >= BREAKPOINTS.TABLET;

  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria || 'Sem categoria';
  const endereco = local?.endereco;
  const avaliacaoMedia = Number(local?.avaliacaoMedia || 0);
  const totalAvaliacoes = local?.totalAvaliacoes || 0;
  const tiposAcessibilidade = local?.tiposAcessibilidade || [];
  const nomeLocalPrincipal = local?.nomeLocalPrincipal || null;
  const temLocalPrincipal = !!(nomeLocalPrincipal && nomeLocalPrincipal.trim());
  const totalImagens = local?.totalImagens ?? 0;
  const isNew = local?.isMaisRecente === true;

  const imagemUrl = normalizarUrlImagem(local?.imagemUrl || local?.imagens?.[0]?.urlCompleta || local?.imagens?.[0]?.url || null);

  const imageHeight = useMemo(() => {
    return compact
      ? (isDesktop ? 120 : isTablet ? 140 : 160)
      : (isDesktop ? 150 : isTablet ? 180 : 200);
  }, [isDesktop, isTablet, compact]);

  const fontSize = useMemo(() => ({
    nome: isDesktop ? 15 : 16,
    categoria: isDesktop ? 10 : 11,
    badgeNovo: isDesktop ? 10 : 11,
    badgeImagem: isDesktop ? 10 : 12,
    endereco: isDesktop ? 10 : 12,
    rating: isDesktop ? 13 : 14,
    recursosNumero: isDesktop ? 12 : 13,
    recursos: isDesktop ? 11 : 12,
  }), [isDesktop]);

  const spacing = useMemo(() => ({
    padding: isDesktop ? 10 : 14,
    gap: isDesktop ? 4 : 6,
    marginBottom: isDesktop ? 6 : 8,
    borderRadius: isDesktop ? 16 : 20,
  }), [isDesktop]);

  const imagemParaExibir = useMemo(() => {
    if (imageError) return null;
    return imagemUrl;
  }, [imageError, imagemUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starSize = isDesktop ? 12 : 16;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={starSize} color={t.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={starSize} color={t.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={starSize} color={t.colors.textTertiary} />);
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

  const estilos = useMemo(() => criarEstilos(t, contrasteAtivo, imageHeight, fontSize, spacing, isDesktop), 
    [t, contrasteAtivo, imageHeight, fontSize, spacing, isDesktop]);

  return (
    <TouchableOpacity
      style={estilos.Recipiente}
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
        
        {isNew && (
          <View style={estilos.newBadge}>
            <Ionicons name="sparkles" size={isDesktop ? 10 : 12} color="#FFF" />
            <TextoTematizado weight="bold" style={estilos.newBadgeText}>Novo</TextoTematizado>
          </View>
        )}

        {totalImagens > 0 && !compact && (
          <View style={estilos.imagemBadge}>
            <TextoTematizado weight="bold" style={estilos.imagemBadgeTexto}>
              1/{totalImagens}
            </TextoTematizado>
          </View>
        )}
      </View>

      <View style={estilos.contentContainer}>
        <View style={staticStyles.nomeCategoriaRow}>
          <View style={estilos.nomeContainer}>
            <TextoTematizado weight="bold" style={estilos.nomeLocal} numberOfLines={1}>
              {nome}
            </TextoTematizado>

            <View style={estilos.subtituloContainer}>
              {temLocalPrincipal ? (
                <TextoTematizado numberOfLines={1} style={estilos.nomeLocalPrincipal}>
                  Dentro de {nomeLocalPrincipal}
                </TextoTematizado>
              ) : null}
            </View>
          </View>

          <View style={estilos.categoriaBadge}>
            <TextoTematizado style={estilos.categoriaTexto}>{categoriaLabel}</TextoTematizado>
          </View>
        </View>

        <View style={estilos.ratingContainer}>
          <View style={staticStyles.starsContainer}>{renderStars(avaliacaoMedia)}</View>
          <TextoTematizado weight="bold" style={estilos.ratingNumber}>
            {avaliacaoMedia.toFixed(1)}
          </TextoTematizado>
          {totalAvaliacoes > 0 ? (
            <TextoTematizado style={estilos.ratingCount}>
              ({totalAvaliacoes})
            </TextoTematizado>
          ) : null}
        </View>

        {endereco && (enderecoLinha1 || enderecoLinha2) && (
          <View style={estilos.enderecoContainer}>
            <Ionicons name="location-outline" size={isDesktop ? 12 : 14} color={t.colors.textSecondary} style={estilos.enderecoIcon} />
            <View style={staticStyles.enderecoTextos}>
              {enderecoLinha1 ? (
                <TextoTematizado style={estilos.enderecoLinha1} numberOfLines={1}>
                  {enderecoLinha1}
                </TextoTematizado>
              ) : null}
              {enderecoLinha2 ? (
                <TextoTematizado style={estilos.enderecoLinha2} numberOfLines={1}>
                  {enderecoLinha2}
                </TextoTematizado>
              ) : null}
            </View>
          </View>
        )}

        <View style={estilos.recomendadoRecursosRow}>
          {isRecomendado && !compact && (
            <View style={estilos.recomendadoContainer}>
              <Ionicons name="checkmark-circle" size={isDesktop ? 14 : 16} color="#4CAF50" />
              <TextoTematizado weight="semibold" style={estilos.recomendadoTexto}>
                Recomendado
              </TextoTematizado>
            </View>
          )}

          <View style={estilos.recursosContainer}>
            <Ionicons name="accessibility-outline" size={isDesktop ? 12 : 14} color={t.colors.primary} />
            <View style={estilos.recursosBadge}>
              <TextoTematizado weight="bold" style={estilos.recursosNumero}>
                +{totalRecursos}
              </TextoTematizado>
              <TextoTematizado style={estilos.recursosLabel}>
                recursos
              </TextoTematizado>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function criarEstilos(t, contrasteAtivo, imageHeight, fontSize, spacing, isDesktop) {
  return StyleSheet.create({
    Recipiente: {
      backgroundColor: t.colors.surface,
      borderRadius: spacing.borderRadius,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: contrasteAtivo ? 2 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: contrasteAtivo ? 0 : 0.08,
      shadowRadius: 12,
      elevation: contrasteAtivo ? 0 : 4,
    },
    imageContainer: {
      height: imageHeight,
      position: 'relative',
      backgroundColor: t.colors.surfaceSecondary,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.colors.surfaceSecondary,
    },
    newBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: t.colors.primary,
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
      color: contrasteAtivo ? (t.colors.textOnAccent || '#000000') : '#FFFFFF',
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    imagemBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: contrasteAtivo ? t.colors.surface : 'rgba(0,0,0,0.7)',
      paddingHorizontal: isDesktop ? 8 : 10,
      paddingVertical: isDesktop ? 4 : 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: contrasteAtivo ? t.colors.border : 'rgba(255,255,255,0.3)',
      zIndex: 10,
    },
    imagemBadgeTexto: {
      fontSize: fontSize.badgeImagem,
      color: contrasteAtivo ? t.colors.textPrimary : '#FFFFFF',
      fontWeight: 'bold',
    },
    contentContainer: {
      padding: spacing.padding,
    },
    nomeLocal: {
      fontSize: fontSize.nome,
      fontWeight: 'bold',
      color: t.colors.textPrimary,
      marginBottom: 0,
      lineHeight: isDesktop ? 20 : 22,
    },
    nomeContainer: {
      flex: 1,
      height: isDesktop ? 34 : 38,
      justifyContent: 'flex-start',
    },
    subtituloContainer: {
      height: isDesktop ? 12 : 14,
      justifyContent: 'flex-start',
    },
    nomeLocalPrincipal: {
      fontSize: fontSize.endereco,
      color: t.colors.textSecondary,
      lineHeight: isDesktop ? 12 : 14,
      marginTop: 0,
    },
    categoriaBadge: {
      backgroundColor: contrasteAtivo ? t.colors.surfaceSecondary : '#EAF3FF',
      paddingHorizontal: isDesktop ? 8 : 12,
      paddingVertical: isDesktop ? 3 : 4,
      borderRadius: 16,
      alignSelf: 'flex-start',
      borderWidth: contrasteAtivo ? 1 : 0,
    },
    categoriaTexto: {
      fontSize: fontSize.categoria,
      color: t.colors.primary,
      fontWeight: '600',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.gap,
      marginTop: 2,
      marginBottom: spacing.marginBottom,
    },
    ratingNumber: {
      fontSize: fontSize.rating,
      fontWeight: 'bold',
      color: t.colors.textPrimary,
    },
    ratingCount: {
      fontSize: fontSize.endereco,
      color: t.colors.textSecondary,
    },
    enderecoContainer: {
      flexDirection: 'row',
      marginBottom: spacing.marginBottom,
      gap: spacing.gap,
    },
    enderecoIcon: {
      marginTop: 2,
    },
    enderecoLinha1: {
      fontSize: fontSize.endereco,
      color: t.colors.textSecondary,
      lineHeight: 16,
    },
    enderecoLinha2: {
      fontSize: fontSize.endereco,
      color: t.colors.textSecondary,
      lineHeight: 16,
    },
    recomendadoRecursosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      paddingTop: spacing.padding - 4,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: t.colors.borderLight,
    },
    recomendadoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.gap,
    },
    recomendadoTexto: {
      fontSize: fontSize.endereco,
      fontWeight: '600',
      color: t.colors.textPrimary,
    },
    recursosContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: contrasteAtivo ? t.colors.surfaceSecondary : '#EAF3FF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: contrasteAtivo ? 1 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
    },
    recursosNumero: {
      fontSize: fontSize.recursosNumero,
      fontWeight: 'bold',
      color: t.colors.primary,
    },
    recursosLabel: {
      fontSize: fontSize.recursos,
      color: contrasteAtivo ? t.colors.textPrimary : t.colors.textSecondary,
    },
  });
}