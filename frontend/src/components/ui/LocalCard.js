import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import theme, { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste }) {
  const [imageError, setImageError] = useState(false);
  const { isHighContrast, theme: ctxTheme } = useThemeContext();
  const contraste = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = typeof altoContraste === 'boolean' ? getTheme(altoContraste) : ctxTheme || theme;
  const baseTheme = ctxTheme || t || theme;

  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria;
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
        stars.push(<Ionicons key={i} name="star" size={14} color={t.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color={t.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color={t.colors.textSecondary} />);
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: t.colors.surface,
          borderColor: contraste ? t.colors.border : t.colors.borderLight,
          borderWidth: contraste ? 2 : 1,
          shadowColor: contraste ? 'transparent' : theme.colors.shadow,
          shadowOffset: contraste ? { width: 0, height: 0 } : { width: 0, height: 2 },
          shadowOpacity: contraste ? 0 : 0.12,
          shadowRadius: contraste ? 0 : 4,
          elevation: contraste ? 0 : 3,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imagemParaExibir ? (
          <Image
            source={{ uri: imagemParaExibir }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: baseTheme.colors.surfaceSecondary }]}>
            <Ionicons name="image-outline" size={40} color={baseTheme.colors.textTertiary} />
            <ThemedText color="textTertiary" altoContraste={contraste}>Sem imagem</ThemedText>
          </View>
        )}

        {showNewBadge && (
          <View style={[styles.newBadge, { backgroundColor: baseTheme.colors.secondary, borderColor: contraste ? baseTheme.colors.border : 'transparent' }]}>
            <ThemedText color="textOnSecondary" weight="bold" altoContraste={contraste}>
              NOVO
            </ThemedText>
          </View>
        )}
      </View>

      <View style={[styles.content, { backgroundColor: t.colors.surface }]}>
        <ThemedText variant="h3" weight="bold" numberOfLines={1} altoContraste={contraste} color={contraste ? 'textPrimary' : 'textPrimary'}>
          {nome}
        </ThemedText>

        <View style={styles.ratingRow}>
          {renderStars(avaliacaoMedia)}
          <ThemedText weight="bold" altoContraste={contraste} color={'textPrimary'}>{avaliacaoMedia.toFixed(1)}</ThemedText>
          <ThemedText color="textSecondary" altoContraste={contraste}>({totalAvaliacoes})</ThemedText>
        </View>

        {endereco && (
          <ThemedText color="textSecondary" numberOfLines={2} altoContraste={contraste}>
            {formatEnderecoCompleto(endereco)}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderStyle: 'solid',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  containerHighContrast: {
    borderWidth: 2,
    borderColor: '#000',
  },
  imageContainer: {
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 1,
    padding: 6,
    borderRadius: 20,
  },
  content: {
    padding: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 6,
  },
});