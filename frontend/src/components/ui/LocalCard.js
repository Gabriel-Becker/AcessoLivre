import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import theme from '../../config/theme';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste = false }) {
  const [imageError, setImageError] = useState(false);

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
        stars.push(<Ionicons key={i} name="star" size={12} color={theme.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={12} color={theme.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={12} color={theme.colors.textSecondary} />);
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
            <ThemedText color="textTertiary" variant="caption">Sem imagem</ThemedText>
          </View>
        )}
        
        {(showNewBadge || isNew) && (
          <View style={styles.newBadge}>
            <ThemedText color="textOnSecondary" weight="bold" style={{ fontSize: 10 }}>
              NOVO
            </ThemedText>
          </View>
        )}
      </View>

      {/* Informações embaixo */}
      <View style={styles.infoContainer}>
        {/* Nome do local */}
        <ThemedText variant="h3" weight="bold" numberOfLines={1} style={styles.nomeLocal}>
          {nome}
        </ThemedText>

        {/* Linha: Categoria + Avaliação */}
        <View style={styles.categoriaRatingRow}>
          <View style={styles.categoriaBadge}>
            <ThemedText variant="caption" weight="semibold" style={styles.categoriaTexto}>
              {categoriaLabel}
            </ThemedText>
          </View>
          
          <View style={styles.ratingContainer}>
            {renderStars(avaliacaoMedia)}
            <ThemedText weight="bold" style={styles.ratingNumber}>
              {avaliacaoMedia.toFixed(1)}
            </ThemedText>
            <ThemedText color="textSecondary" style={styles.reviewCount}>
              ({totalAvaliacoes})
            </ThemedText>
          </View>
        </View>

        {/* Endereço */}
        {endereco && (
          <View style={styles.enderecoContainer}>
            <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
            <ThemedText color="textSecondary" style={styles.address} numberOfLines={2}>
              {formatEnderecoCompleto(endereco)}
            </ThemedText>
          </View>
        )}

        {totalRecursos > 0 && (
          <View style={styles.recursosContainer}>
            <View style={styles.recursosBadge}>
              <ThemedText variant="caption" style={styles.recursosTexto}>
                {totalRecursos}{totalRecursos !== 1 }
              </ThemedText>
            </View>
          </View>
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
  
  containerModern: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  
  containerHighContrast: {
    borderWidth: 2,
    borderColor: '#000',
  },
  
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: theme.colors.background,
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
    top: 10,
    right: 10,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
  },
  
  categoriaTexto: {
    fontSize: 11,
    color: theme.colors.primary,
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
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  
  recursosTexto: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '500',
  },
});