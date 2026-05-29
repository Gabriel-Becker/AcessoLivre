import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste = false }) {
  const [imageError, setImageError] = useState(false);
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo);

  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria || 'Sem categoria';
  const endereco = local?.endereco;
  const avaliacaoMedia = local?.avaliacaoMedia || 0;
  const totalAvaliacoes = local?.totalAvaliacoes || 0;
  const tiposAcessibilidade = local?.tiposAcessibilidade || [];

  const imagemParaExibir = useMemo(() => {
    if (imageError) return null;
    return local?.imagemUrl || null;
  }, [local?.imagemUrl, imageError]);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={12} color={t.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={12} color={t.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={12} color={contrasteAtivo ? t.colors.textPrimary : t.colors.textSecondary} />);
      }
    }
    return stars;
  };

  const formatEnderecoCompleto = (end) => {
    if (!end) return '';
    return [end.logradouro, end.numero, end.cidade, end.estado]
      .filter(Boolean)
      .join(', ');
  };

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

  const isNew = useMemo(() => {
    if (!local?.dataCriacao) return false;
    const dataCriacao = new Date(local.dataCriacao);
    const agora = new Date();
    const diffDias = (agora - dataCriacao) / (1000 * 60 * 60 * 24);
    return diffDias <= 7;
  }, [local?.dataCriacao]);

  const categoriaLabel = getCategoriaLabel(categoria);
  const totalRecursos = tiposAcessibilidade.length;
  const estilos = useMemo(() => criarEstilos(t, contrasteAtivo), [t, contrasteAtivo]);

  return (
    <TouchableOpacity
      style={estilos.container}
      onPress={onPress}
      activeOpacity={0.8}
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
            <Ionicons
              name="image-outline"
              size={40}
              color={contrasteAtivo ? t.colors.textPrimary : t.colors.textTertiary}
            />
            <ThemedText
              color={contrasteAtivo ? 'textPrimary' : 'textTertiary'}
              variant="caption"
              altoContraste={contrasteAtivo}
            >
              Sem imagem
            </ThemedText>
          </View>
        )}
        
        {(showNewBadge || isNew) && (
          <View style={estilos.newBadge}>
            <ThemedText
              color={contrasteAtivo ? 'textOnPrimary' : 'textOnSecondary'}
              weight="bold"
              style={estilos.newBadgeText}
              altoContraste={contrasteAtivo}
            >
              NOVO
            </ThemedText>
          </View>
        )}
      </View>

      {/* Informações embaixo */}
      <View style={estilos.infoContainer}>
        {/* Nome do local */}
        <ThemedText
          variant="h3"
          weight="bold"
          numberOfLines={1}
          style={estilos.nomeLocal}
          altoContraste={contrasteAtivo}
          color="textPrimary"
        >
          {nome}
        </ThemedText>

        {/* Linha: Categoria + Avaliação */}
        <View style={estilos.categoriaRatingRow}>
          <View style={estilos.categoriaBadge}>
            <ThemedText
              variant="caption"
              weight="semibold"
              style={estilos.categoriaTexto}
              altoContraste={contrasteAtivo}
              color={contrasteAtivo ? 'textPrimary' : 'primary'}
            >
              {categoriaLabel}
            </ThemedText>
          </View>
          
          <View style={estilos.ratingContainer}>
            {renderStars(avaliacaoMedia)}
            <ThemedText weight="bold" style={estilos.ratingNumber} altoContraste={contrasteAtivo} color="textPrimary">
              {avaliacaoMedia.toFixed(1)}
            </ThemedText>
            <ThemedText color={contrasteAtivo ? 'textPrimary' : 'textSecondary'} style={estilos.reviewCount} altoContraste={contrasteAtivo}>
              ({totalAvaliacoes})
            </ThemedText>
          </View>
        </View>

        {/* Endereço */}
        {endereco && (
          <View style={estilos.enderecoContainer}>
            <Ionicons name="location-outline" size={12} color={contrasteAtivo ? t.colors.textPrimary : t.colors.textSecondary} />
            <ThemedText color={contrasteAtivo ? 'textPrimary' : 'textSecondary'} style={estilos.address} numberOfLines={2} altoContraste={contrasteAtivo}>
              {formatEnderecoCompleto(endereco)}
            </ThemedText>
          </View>
        )}

        {totalRecursos > 0 && (
          <View style={estilos.recursosContainer}>
            <View style={estilos.recursosBadge}>
              <ThemedText variant="caption" style={estilos.recursosTexto} altoContraste={contrasteAtivo} color={contrasteAtivo ? 'textPrimary' : 'textSecondary'}>
                {totalRecursos}{totalRecursos !== 1 }
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function criarEstilos(t, contrasteAtivo) {
  return StyleSheet.create({
    container: {
      backgroundColor: t.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: contrasteAtivo ? 2 : 1,
      borderColor: contrasteAtivo ? t.colors.border : `${t.colors.primary}30`,
      ...(contrasteAtivo ? t.shadows.none : t.shadows.md),
    },
    imageContainer: {
      width: '100%',
      height: 150,
      position: 'relative',
      backgroundColor: contrasteAtivo ? t.colors.backgroundSecondary : t.colors.background,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      backgroundColor: contrasteAtivo ? t.colors.backgroundSecondary : t.colors.background,
    },
    newBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: contrasteAtivo ? t.colors.primary : t.colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: contrasteAtivo ? 1 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
      ...(contrasteAtivo ? t.shadows.none : t.shadows.sm),
    },
    newBadgeText: {
      fontSize: 10,
    },
    infoContainer: {
      padding: 12,
    },
    nomeLocal: {
      fontSize: 15,
      marginBottom: 6,
    },
    categoriaRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      flexWrap: 'wrap',
      gap: 6,
    },
    categoriaBadge: {
      backgroundColor: contrasteAtivo ? t.colors.backgroundSecondary : '#E8F0FF',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 14,
      borderWidth: contrasteAtivo ? 1 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
    },
    categoriaTexto: {
      fontSize: 11,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    ratingNumber: {
      fontSize: 12,
    },
    reviewCount: {
      fontSize: 10,
    },
    enderecoContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
      marginBottom: 8,
    },
    address: {
      fontSize: 11,
      lineHeight: 14,
      flex: 1,
    },
    recursosContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 4,
    },
    recursosBadge: {
      backgroundColor: contrasteAtivo ? t.colors.backgroundSecondary : '#E0E0E0',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: contrasteAtivo ? 1 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
    },
    recursosTexto: {
      fontSize: 9,
      fontWeight: '500',
    },
  });
}