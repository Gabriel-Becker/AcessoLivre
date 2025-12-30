import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import theme from '../../config/theme';

export default function LocalCard({ local, onPress, showNewBadge = false }) {
  const {
    nome,
    categoria,
    endereco,
    avaliacaoMedia,
    totalAvaliacoes,
    imagemUrl,
  } = local || {};

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color={theme.colors.warning} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color={theme.colors.warning} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color={theme.colors.textSecondary} />
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
    };
    return colors[cat] || theme.colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {showNewBadge && (
        <View style={styles.newBadge}>
          <ThemedText color="textOnSecondary" weight="semibold" style={styles.newBadgeText}>
            Novo
          </ThemedText>
        </View>
      )}

      <View style={styles.imagePlaceholder}>
        {imagemUrl ? (
          <Image source={{ uri: imagemUrl }} style={styles.image} />
        ) : (
          <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="h3" weight="bold" numberOfLines={1} style={styles.title}>
            {nome || 'Local sem nome'}
          </ThemedText>
          {categoria && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(categoria) }]}>
              <ThemedText color="textOnPrimary" style={styles.categoryText}>
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
            {totalAvaliacoes || 0} avaliações
          </ThemedText>
        </View>

        {endereco && (
          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.primary}
            />
            <ThemedText color="textSecondary" numberOfLines={2} style={styles.address}>
              {`${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}`}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: theme.typography.fontSize.xs,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
  },
  categoryBadge: {
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNumber: {
    marginLeft: theme.spacing.xs,
  },
  reviewCount: {
    fontSize: theme.typography.fontSize.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
  },
});
