import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { CardSecao, Botao } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';

const ReviewItem = ({ review, altoContraste }) => {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name={i < rating ? 'star' : 'star-outline'} 
          size={14} 
          color={t.colors.warning} 
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={32} color={t.colors.textSecondary} />
          <View>
            <TextoTematizado weight="semibold">{review.usuarioNome || 'Usuï¿½rio'}</ThemedText>
            <View style={styles.starsRow}>{renderStars(review.nota || 0)}</View>
          </View>
        </View>
        <TextoTematizado variant="caption" color="textTertiary">
          {review.dataCriacao || review.data || ''}
        </ThemedText>
      </View>
      
      {review.comentario ? (
        <TextoTematizado color="textSecondary" style={styles.comentario}>
          {review.comentario}
        </ThemedText>
      ) : null}
    </View>
  );
};

export default function ResenhasLocal({ 
  avaliacoes = [], 
  totalAvaliacoes,
  onVerTodas,
  onAdicionarAvaliacao,
  isAuthenticated,
  altoContraste 
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);

  const primeirasAvaliacoes = avaliacoes.slice(0, 3);
  const total = totalAvaliacoes || avaliacoes.length;

  if (avaliacoes.length === 0) {
    return (
      <CardSecao
        titulo="Avaliaï¿½ï¿½es"
        icone="chatbubbles-outline"
        altoContraste={altoContraste ?? isHighContrast}
      >
        <View style={styles.emptyContainer}>
          <TextoTematizado color="textSecondary" align="center">
            Nenhuma avaliaï¿½ï¿½o ainda. Seja o primeiro a avaliar!
          </ThemedText>
          {!isAuthenticated && (
            <Botao
              variant="primary"
              size="small"
              onPress={onAdicionarAvaliacao}
              style={styles.loginButton}
              altoContraste={altoContraste ?? isHighContrast}
            >
              Fazer Login para Avaliar
            </Button>
          )}
        </View>
      </CardSecao>
    );
  }

  return (
    <CardSecao
      titulo={`Avaliaï¿½ï¿½es (${total})`}
      icone="star-outline"
      altoContraste={altoContraste ?? isHighContrast}
    >
      <FlatList
        data={primeirasAvaliacoes}
        renderItem={({ item }) => (
          <ReviewItem review={item} altoContraste={altoContraste ?? isHighContrast} />
        )}
        keyExtractor={(_, index) => `review_${index}`}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: t.colors.borderLight }]} />}
        scrollEnabled={false}
      />
      
      {avaliacoes.length > 3 && (
        <Botao
          variant="ghost"
          size="small"
          onPress={onVerTodas}
          style={styles.verMaisButton}
          altoContraste={altoContraste ?? isHighContrast}
        >
          Ver todas as {avaliacoes.length} avaliaï¿½ï¿½es ?
        </Button>
      )}
    </CardSecao>
  );
}

const styles = StyleSheet.create({
  reviewItem: {
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  comentario: {
    marginLeft: 40,
    lineHeight: 20,
  },
  separator: {
    height: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  verMaisButton: {
    marginTop: 12,
  },
});