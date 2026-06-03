import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function LocalCard({ local, onPress, showNewBadge = false, altoContraste = false }) {
  const [imageError, setImageError] = useState(false);
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo, fontSizeMultiplier);

  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria || 'Sem categoria';
  const endereco = local?.endereco;
  const avaliacaoMedia = local?.avaliacaoMedia || 0;
  const totalAvaliacoes = local?.totalAvaliacoes || 0;
  const tiposAcessibilidade = local?.tiposAcessibilidade || [];

  const imagemParaExibir = useMemo(() => {
    if (imageError) return null;
    return (
      local?.imagemUrl ||
      local?.imagemPrincipal ||
      local?.imagem ||
      local?.primeiraImagem?.urlCompleta ||
      local?.primeiraImagem?.url ||
      local?.imagensCompletas?.[0]?.url ||
      local?.imagensCompletas?.[0]?.urlCompleta ||
      local?.imagens?.[0]?.url ||
      local?.imagens?.[0]?.urlCompleta ||
      null
    );
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
        stars.push(<Ionicons key={i} name="star" size={18} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={18} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={18} color="#CCCCCC" />);
      }
    }
    return stars;
  };

  // Endereço em duas linhas
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

  // Verificar se é novo (últimos 7 dias)
  const isNew = useMemo(() => {
    if (!local?.dataCriacao) return false;
    const dataCriacao = new Date(local.dataCriacao);
    const agora = new Date();
    const diffDias = (agora - dataCriacao) / (1000 * 60 * 60 * 24);
    return diffDias <= 7;
  }, [local?.dataCriacao]);

  const categoriaLabel = getCategoriaLabel(categoria);
  const totalRecursos = tiposAcessibilidade.length;

  // Calcular total de imagens
  const totalImagens = local?.imagens?.length || local?.imagensCompletas?.length || 0;
  const imagemAtual = 1;

  const estilos = useMemo(() => criarEstilos(t, contrasteAtivo, fontSizeMultiplier), [t, contrasteAtivo, fontSizeMultiplier]);

  return (
    <TouchableOpacity
      style={estilos.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Container da Imagem */}
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
            <Ionicons name="image-outline" size={50} color={t.colors.textTertiary} />
          </View>
        )}
        
        {/* Badge NOVO - Azul moderno no canto superior esquerdo */}
        {(showNewBadge || isNew) && (
          <View style={estilos.newBadge}>
            <Ionicons name="sparkles" size={12} color="#FFF" />
            <ThemedText weight="bold" style={estilos.newBadgeText}>Novo</ThemedText>
          </View>
        )}

        {/* Badge de imagem (ex: 1/5) */}
        {totalImagens > 0 && (
          <View style={estilos.imagemBadge}>
            <ThemedText weight="bold" style={estilos.imagemBadgeTexto}>
              {imagemAtual}/{totalImagens}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Conteúdo do Card */}
      <View style={estilos.contentContainer}>
        {/* Nome do local e Categoria na mesma linha */}
        <View style={styles.nomeCategoriaRow}>
          <ThemedText weight="bold" style={estilos.nomeLocal} numberOfLines={1}>
            {nome}
          </ThemedText>
          <View style={estilos.categoriaBadge}>
            <ThemedText style={estilos.categoriaTexto}>{categoriaLabel}</ThemedText>
          </View>
        </View>

        {/* Avaliação com estrelas */}
        <View style={estilos.ratingContainer}>
          <View style={estilos.starsContainer}>{renderStars(avaliacaoMedia)}</View>
          <ThemedText weight="bold" style={estilos.ratingNumber}>
            {avaliacaoMedia.toFixed(1)}
          </ThemedText>
        </View>

        {/* Texto "Baseado em X avaliações" */}
        <ThemedText style={estilos.baseadoTexto}>
          Baseado em {totalAvaliacoes} {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
        </ThemedText>

        {/* Endereço em duas linhas */}
        {endereco && (enderecoLinha1 || enderecoLinha2) && (
          <View style={estilos.enderecoContainer}>
            <Ionicons name="location" size={16} color={t.colors.primary} style={estilos.enderecoIcon} />
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

        {/* Recomendado + Recursos na mesma linha */}
        <View style={estilos.recomendadoRecursosRow}>
          <View style={estilos.recomendadoContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText weight="semibold" style={estilos.recomendadoTexto}>
              Recomendado
            </ThemedText>
          </View>

          {/* Recursos (apenas número) */}
          {totalRecursos > 0 && (
            <View style={estilos.recursosContainer}>
              <Ionicons name="accessibility" size={16} color={t.colors.primary} />
              <View style={estilos.recursosBadge}>
                <ThemedText weight="bold" style={estilos.recursosNumero}>
                  +{totalRecursos}
                </ThemedText>
                <ThemedText style={estilos.recursosLabel}>
                  recursos
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nomeCategoriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
});

function criarEstilos(t, contrasteAtivo, fontSizeMultiplier) {
  const fonteBase = fontSizeMultiplier || 1;
  
  return StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: contrasteAtivo ? 2 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    imageContainer: {
      width: '100%',
      height: 220,
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
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    newBadgeText: {
      fontSize: 11,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    imagemBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    imagemBadgeTexto: {
      fontSize: 11,
      color: '#FFFFFF',
    },
    contentContainer: {
      padding: 16,
    },
    nomeLocal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1A1A1A',
      flex: 1,
    },
    categoriaBadge: {
      backgroundColor: '#EAF3FF',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
    },
    categoriaTexto: {
      fontSize: 12,
      color: '#2563EB',
      fontWeight: '700',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 2,
    },
    ratingNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1A1A1A',
    },
    baseadoTexto: {
      fontSize: 12,
      color: '#4CAF50',
      fontWeight: '500',
      marginBottom: 12,
    },
    enderecoContainer: {
      flexDirection: 'row',
      marginBottom: 12,
      gap: 8,
    },
    enderecoIcon: {
      marginTop: 2,
    },
    enderecoTextos: {
      flex: 1,
    },
    enderecoLinha1: {
      fontSize: 13,
      color: '#666666',
      lineHeight: 18,
    },
    enderecoLinha2: {
      fontSize: 13,
      color: '#666666',
      lineHeight: 18,
    },
    recomendadoRecursosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    recomendadoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recomendadoTexto: {
      fontSize: 13,
      fontWeight: '600',
      color: '#1A1A1A',
    },
    recursosContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recursosBadge: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    recursosNumero: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2563EB',
    },
    recursosLabel: {
      fontSize: 12,
      color: '#666666',
    },
  });
}