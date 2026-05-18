import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import theme from '../../config/theme';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste = false }) {
  const [imageError, setImageError] = useState(false);

  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria;
  const endereco = local?.endereco;
  const avaliacaoMedia = local?.avaliacaoMedia || 0;
  const totalAvaliacoes = local?.totalAvaliacoes || 0;
  const tiposAcessibilidade = local?.tiposAcessibilidade || [];

  // ✅ AGORA É SIMPLES E CORRETO
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
        stars.push(<Ionicons key={i} name="star" size={14} color={theme.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color={theme.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color={theme.colors.textSecondary} />);
      }
    }
    return stars;
  };

  const formatEnderecoCompleto = (end) => {
    if (!end) return '';
    return [end.logradouro, end.numero, end.bairro, end.cidade, end.estado]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <TouchableOpacity
      style={[styles.container, altoContraste && styles.containerHighContrast]}
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
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={theme.colors.textTertiary} />
            <ThemedText color="textTertiary">Sem imagem</ThemedText>
          </View>
        )}

        {showNewBadge && (
          <View style={styles.newBadge}>
            <ThemedText color="textOnSecondary" weight="bold">
              NOVO
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <ThemedText variant="h3" weight="bold" numberOfLines={1}>
          {nome}
        </ThemedText>

        <View style={styles.ratingRow}>
          {renderStars(avaliacaoMedia)}
          <ThemedText weight="bold">{avaliacaoMedia.toFixed(1)}</ThemedText>
          <ThemedText color="textSecondary">({totalAvaliacoes})</ThemedText>
        </View>

        {endereco && (
          <ThemedText color="textSecondary" numberOfLines={2}>
            {formatEnderecoCompleto(endereco)}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.secondary,
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