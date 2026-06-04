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

  // ============================================
  // DADOS DO LOCAL - COM LOGS PARA DEBUG
  // ============================================
  const nome = local?.nome || 'Local sem nome';
  const categoria = local?.categoria || 'Sem categoria';
  const endereco = local?.endereco;
  const avaliacaoMedia = local?.avaliacaoMedia || 0;
  const totalAvaliacoes = local?.totalAvaliacoes || 0;
  const tiposAcessibilidade = local?.tiposAcessibilidade || [];
  
  // DEBUG: Nome do local principal
  const nomeLocalPrincipal = local?.nomeLocalPrincipal || local?.nome_local_principal || null;
  console.log(`🔍 [LocalCard] ${nome} - nomeLocalPrincipal:`, nomeLocalPrincipal);

  // DEBUG: Data de criação
  const dataCriacaoRaw = local?.dataCriacao;
  console.log(`🔍 [LocalCard] ${nome} - dataCriacao raw:`, dataCriacaoRaw);

  // Extrair valores para dependências do useMemo
  const imagemUrl = local?.imagemUrl;
  const imagemPrincipal = local?.imagemPrincipal;
  const imagem = local?.imagem;
  const primeiraImagemUrl = local?.primeiraImagem?.url;
  const primeiraImagemUrlCompleta = local?.primeiraImagem?.urlCompleta;
  const imagensCompletasUrl = local?.imagensCompletas?.[0]?.url;
  const imagensCompletasUrlCompleta = local?.imagensCompletas?.[0]?.urlCompleta;
  const imagensUrl = local?.imagens?.[0]?.url;
  const imagensUrlCompleta = local?.imagens?.[0]?.urlCompleta;

  const imagemParaExibir = useMemo(() => {
    if (imageError) return null;
    return (
      imagemUrl ||
      imagemPrincipal ||
      imagem ||
      primeiraImagemUrlCompleta ||
      primeiraImagemUrl ||
      imagensCompletasUrlCompleta ||
      imagensCompletasUrl ||
      imagensUrlCompleta ||
      imagensUrl ||
      null
    );
  }, [
    imageError,
    imagemUrl,
    imagemPrincipal,
    imagem,
    primeiraImagemUrl,
    primeiraImagemUrlCompleta,
    imagensCompletasUrl,
    imagensCompletasUrlCompleta,
    imagensUrl,
    imagensUrlCompleta
  ]);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#CCCCCC" />);
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

  // ============================================
  // BADGE NOVO - VERSÃO CORRIGIDA (suporta microssegundos)
  // ============================================
  const isNew = useMemo(() => {
    if (!dataCriacaoRaw) {
      console.log(`🔍 [LocalCard] ${nome} - Sem dataCriacao`);
      return false;
    }
    
    try {
      // Limpar a string de data para remover microssegundos
      let dataLimpa = dataCriacaoRaw;
      
      // Remover microssegundos (ex: "2026-06-04T04:29:43.833847" -> "2026-06-04T04:29:43.833")
      if (typeof dataLimpa === 'string' && dataLimpa.includes('.')) {
        const partes = dataLimpa.split('.');
        if (partes.length > 1) {
          // Manter apenas os primeiros 3 dígitos dos milissegundos
          dataLimpa = `${partes[0]}.${partes[1].substring(0, 3)}`;
        }
      }
      
      const dataCriacaoDate = new Date(dataLimpa);
      const agora = new Date();
      
      // Verificar se a data é válida
      if (isNaN(dataCriacaoDate.getTime())) {
        console.log(`🔍 [LocalCard] ${nome} - Data inválida:`, dataCriacaoRaw);
        return false;
      }
      
      const diffMs = agora - dataCriacaoDate;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      const isNewResult = diffDias <= 7;
      
      console.log(`🔍 [LocalCard] ${nome} - data: ${dataCriacaoDate.toISOString()}, diffDias: ${diffDias.toFixed(2)}, isNew: ${isNewResult}`);
      
      return isNewResult;
    } catch (error) {
      console.error(`🔍 [LocalCard] ${nome} - Erro ao processar data:`, error);
      return false;
    }
  }, [dataCriacaoRaw, nome]);

  const categoriaLabel = getCategoriaLabel(categoria);
  const totalRecursos = tiposAcessibilidade.length;

  // ============================================
  // TOTAL DE IMAGENS - USANDO CAMPO DIRETO DO BACKEND
  // ============================================
  const totalImagens = local?.totalImagens || 0;
  const imagemAtual = 1;
  
  console.log(`🔍 [LocalCard] ${nome} - totalImagens:`, totalImagens);

  // Verificar se é recomendado (nota superior a 4)
  const isRecomendado = avaliacaoMedia > 4;

  const estilos = useMemo(() => criarEstilos(t, contrasteAtivo), [t, contrasteAtivo]);

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

        {/* Badge de imagem (ex: 1/5) - com zIndex para garantir visibilidade */}
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
        {/* Área do nome + vínculo e categoria */}
        <View style={styles.nomeCategoriaRow}>
          <View style={{ flex: 1 }}>
            <ThemedText weight="bold" style={estilos.nomeLocal} numberOfLines={1}>
              {nome}
            </ThemedText>
            
            {/* Vínculo com local principal (dentro da área do nome) */}
            {nomeLocalPrincipal && nomeLocalPrincipal.trim() && (
              <ThemedText numberOfLines={1} style={estilos.nomeLocalPrincipal}>
                Dentro de {nomeLocalPrincipal}
              </ThemedText>
            )}
          </View>

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
          <ThemedText style={estilos.ratingCount}>
            ({totalAvaliacoes})
          </ThemedText>
        </View>

        {/* Endereço em duas linhas */}
        {endereco && (enderecoLinha1 || enderecoLinha2) && (
          <View style={estilos.enderecoContainer}>
            <Ionicons name="location-outline" size={14} color="#888888" style={estilos.enderecoIcon} />
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

        {/* Recomendado + Recursos na mesma linha - RECURSOS SEMPRE NO CANTO DIREITO */}
        <View style={estilos.recomendadoRecursosRow}>
          {isRecomendado && (
            <View style={estilos.recomendadoContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <ThemedText weight="semibold" style={estilos.recomendadoTexto}>
                Recomendado
              </ThemedText>
            </View>
          )}

          {/* Recursos - SEMPRE no canto direito, mesmo sem Recomendado */}
          <View style={estilos.recursosContainer}>
            <Ionicons name="accessibility-outline" size={14} color={t.colors.primary} />
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

function criarEstilos(t, contrasteAtivo) {
  return StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: contrasteAtivo ? 2 : 0,
      borderColor: contrasteAtivo ? t.colors.border : 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    imageContainer: {
      width: '100%',
      height: 200,
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
      zIndex: 10,
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
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      zIndex: 10,
      elevation: 5,
    },
    imagemBadgeTexto: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    contentContainer: {
      padding: 14,
    },
    nomeLocal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1A1A1A',
      marginBottom: 2,
    },
    nomeLocalPrincipal: {
      fontSize: 11,
      color: '#888888',
      marginTop: 2,
    },
    categoriaBadge: {
      backgroundColor: '#EAF3FF',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    categoriaTexto: {
      fontSize: 11,
      color: '#2563EB',
      fontWeight: '600',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 2,
    },
    ratingNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1A1A1A',
    },
    ratingCount: {
      fontSize: 12,
      color: '#666666',
    },
    enderecoContainer: {
      flexDirection: 'row',
      marginBottom: 10,
      gap: 6,
    },
    enderecoIcon: {
      marginTop: 2,
    },
    enderecoTextos: {
      flex: 1,
    },
    enderecoLinha1: {
      fontSize: 12,
      color: '#666666',
      lineHeight: 16,
    },
    enderecoLinha2: {
      fontSize: 12,
      color: '#666666',
      lineHeight: 16,
    },
    recomendadoRecursosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    recomendadoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recomendadoTexto: {
      fontSize: 12,
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
      fontSize: 13,
      fontWeight: 'bold',
      color: '#2563EB',
    },
    recursosLabel: {
      fontSize: 11,
      color: '#666666',
    },
  });
}