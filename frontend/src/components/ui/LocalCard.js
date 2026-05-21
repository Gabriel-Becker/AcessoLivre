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
    return [end.logradouro, end.numero, end.cidade, end.estado]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        altoContraste && styles.containerHighContrast,
        !altoContraste && styles.containerModern
      ]}
      onPress={onPress}
      activeOpacity={0.8}
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
            <ThemedText color="textOnSecondary" weight="bold" style={{ fontSize: 10 }}>
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
          <ThemedText weight="bold" style={styles.ratingNumber}>{avaliacaoMedia.toFixed(1)}</ThemedText>
          <ThemedText color="textSecondary" style={styles.reviewCount}>({totalAvaliacoes})</ThemedText>
        </View>

        {endereco && (
          <ThemedText color="textSecondary" numberOfLines={2} style={styles.address}>
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
    borderRadius: 20, // Borda mais arredondada para um visual moderno
    overflow: 'hidden',
    marginBottom: 16,
  },
  
  // Estilo moderno com borda azul fina e sombra flutuante
  containerModern: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '40', // Azul com 25% de opacidade (mais suave)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6, // Sombra no Android (efeito flutuante)
  },
  
  containerHighContrast: {
    borderWidth: 2,
    borderColor: '#000',
  },
  
  imageContainer: {
    width: '100%',
    height: 180, // Altura ligeiramente maior para melhor proporção
    position: 'relative',
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  content: {
    padding: 14,
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  
  ratingNumber: {
    fontSize: 14,
    marginLeft: 2,
  },
  
  reviewCount: {
    fontSize: 12,
  },
  
  address: {
    fontSize: 12,
    lineHeight: 16,
  },
});