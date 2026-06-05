import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Card,
  Button
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { Container } from '../../components/layout';

import LocalAccessibility from '../../components/local/LocalAccessibility';
import AvaliacaoModal from '../../components/local/AvaliacaoModal';
import LocalGallery from '../../components/local/LocalGallery';
import ModalCompartilhar from '../../components/local/ModalCompartilhar';
import ReportarModal from '../../components/reportar/ReportarModal';
import ComentarioMenu from '../../components/reportar/ComentarioMenu';

import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import HomeService from '../../services/HomeService';
import AvaliacaoService from '../../services/AvaliacaoService';
import toastHelper from '../../utils/toastHelper';
import { breakpoints } from '../../config/theme';

const useCurrentTime = () => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return now;
};

const formatarDataRelativa = (dataOriginal, agoraTimestamp) => {
  if (!dataOriginal) return 'Data não informada';
  
  try {
    let data;
    
    if (typeof dataOriginal === 'string') {
      data = new Date(dataOriginal);
    } else if (typeof dataOriginal === 'number') {
      data = new Date(dataOriginal);
    } else if (dataOriginal instanceof Date) {
      data = dataOriginal;
    } else {
      return 'Data inválida';
    }
    
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    const agora = new Date(agoraTimestamp);
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins === 1) return 'Há 1 minuto';
    if (diffMins < 60) return `Há ${diffMins} minutos`;
    if (diffHours === 1) return 'Há 1 hora';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) === 1 ? '' : 's'}`;
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) === 1 ? '' : 'es'}`;
    return `Há ${Math.floor(diffDays / 365)} ano${Math.floor(diffDays / 365) === 1 ? '' : 's'}`;
    
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

// Componente de Avaliação com Menu de Reportar
const AvaliacaoItem = ({ avaliacao, theme, estilosDinamicos, now }) => {
  const renderStars = (nota = 0) => {
    const stars = [];
    const fullStars = Math.floor(nota);
    const hasHalfStar = nota % 1 >= 0.5;
    
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

  const nomeUsuario = avaliacao.usuario?.nome || 
                      avaliacao.usuarioNome || 
                      avaliacao.nomeUsuario || 
                      'Usuário';
  
  const primeiraLetra = nomeUsuario.charAt(0).toUpperCase();
  
  const notaVisual = avaliacao.notaAcessibilidadeVisual || 0;
  const notaMotora = avaliacao.notaAcessibilidadeMotora || 0;
  const notaAuditiva = avaliacao.notaAcessibilidadeAuditiva || 0;
  
  const mediaGeral = avaliacao.notaGeral || 
                     avaliacao.nota || 
                     (notaVisual + notaMotora + notaAuditiva) / 3 || 0;
  
  const comentarioReal = avaliacao.comentario || '';
  const dataOriginal = avaliacao.dataAvaliacao || avaliacao.data;
  const dataFormatada = formatarDataRelativa(dataOriginal, now);

  return (
    <View style={[styles.avaliacaoItem, estilosDinamicos.avaliacaoItem]}>
      <View style={styles.avaliacaoHeader}>
        <View style={styles.usuarioInfo}>
          <View style={[styles.avatar, estilosDinamicos.avatar, { backgroundColor: theme.colors.primary }]}>
            <ThemedText color="textOnPrimary" weight="bold" style={[styles.avatarTexto, estilosDinamicos.avatarTexto]}>
              {primeiraLetra}
            </ThemedText>
          </View>
          
          <View style={styles.usuarioDetails}>
            <ThemedText weight="semibold" style={[styles.usuarioNome, estilosDinamicos.usuarioNome]} numberOfLines={1}>
              {nomeUsuario}
            </ThemedText>
            <View style={styles.estrelasRow}>
              <View style={styles.starsContainer}>
                {renderStars(mediaGeral)}
              </View>
              <View style={styles.dataContainer}>
                <ThemedText variant="caption" color="textTertiary" style={[styles.dataAvaliacao, estilosDinamicos.dataAvaliacao]}>
                  {dataFormatada}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Menu de três pontos para reportar comentário */}
        <ComentarioMenu 
          comentario={avaliacao}
          autorNome={nomeUsuario}
          showReportar={true}
        />
      </View>
      
      {comentarioReal ? (
        <ThemedText color="textSecondary" style={[styles.comentario, estilosDinamicos.comentario]} numberOfLines={3}>
          {comentarioReal}
        </ThemedText>
      ) : null}
    </View>
  );
};

export default function LocalDetalhes({ onNavigate, route }) {
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const { id, previousScreen } = route?.params || {};
  const now = useCurrentTime();

  const isDesktop = width >= breakpoints.desktop;
  const zoomAtivo = fontSizeMultiplier >= 1.5;
  const layoutEmpilhado = width < 1280 || fontSizeMultiplier >= 1.5;
  const corFundoPagina = isHighContrast ? t.colors.background : t.colors.backgroundSecondary;
  
  // Estados existentes
  const [modalAvaliacaoVisible, setModalAvaliacaoVisible] = useState(false);
  const [modalCompartilharVisible, setModalCompartilharVisible] = useState(false);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);
  const [mostrarTodasAvaliacoes, setMostrarTodasAvaliacoes] = useState(false);
  
  // NOVO: Estado para modal de reportar local
  const [showReportarLocalModal, setShowReportarLocalModal] = useState(false);
  
  const estilosZoom = useMemo(
    () =>
      criarEstilosDinamicos({
        t,
        width,
        layoutEmpilhado,
        fontSizeMultiplier,
        zoomAtivo,
        corFundoPagina,
      }),
    [corFundoPagina, fontSizeMultiplier, layoutEmpilhado, t, width, zoomAtivo]
  );

  const estilosDinamicos = {
    centerContainer: {
      backgroundColor: t.colors.background,
    },
    categoriaBadge: {
      backgroundColor: isHighContrast ? t.colors.surfaceSecondary : '#E8F0FF',
      borderWidth: isHighContrast ? 1 : 0,
      borderColor: t.colors.border,
    },
    descricaoContainer: {
      backgroundColor: isHighContrast ? t.colors.surfaceSecondary : '#F8F9FA',
      borderWidth: 1,
      borderColor: t.colors.borderLight,
    },
    botaoAvaliar: {
      backgroundColor: t.colors.primary,
      borderWidth: isHighContrast ? 1 : 0,
      borderColor: isHighContrast ? t.colors.borderDark : 'transparent',
    },
  };

  const carregar = useCallback(async (refresh = false) => {
    if (!id) {
      setError('ID do local não informado');
      setLoading(false);
      return;
    }

    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const dados = await HomeService.buscarLocalPorId(id);
      
      if (!dados) {
        throw new Error('Local não encontrado');
      }
      
      const imagensList = HomeService.extrairTodasImagens(dados);
      
      let avaliacoes = [];
      try {
        const result = await AvaliacaoService.buscarAvaliacoesPorLocal(id);
        
        if (result.success && result.data && Array.isArray(result.data)) {
          avaliacoes = result.data;
        } else if (dados.avaliacoes) {
          avaliacoes = dados.avaliacoes;
        }
      } catch (err) {
        if (dados.avaliacoes) avaliacoes = dados.avaliacoes;
      }
      
      const avaliacoesOrdenadas = [...avaliacoes].sort((a, b) => {
        const dataA = a.dataAvaliacao ? new Date(a.dataAvaliacao) : 0;
        const dataB = b.dataAvaliacao ? new Date(b.dataAvaliacao) : 0;
        return dataB - dataA;
      });

      setLocal({
        ...dados,
        imagens: imagensList,
        avaliacoes: avaliacoesOrdenadas,
        tiposAcessibilidade: dados.tiposAcessibilidade || [],
        avaliacaoMedia: dados.avaliacaoMedia || 0,
        totalAvaliacoes: dados.totalAvaliacoes || avaliacoesOrdenadas.length,
        descricao: dados.descricao || '',
      });
      
      setMostrarTodasAvaliacoes(false);
    } catch (err) {
      console.error('Erro ao carregar local:', err);
      setError('Não foi possível carregar os detalhes do local');
      toastHelper.showError('Erro ao carregar detalhes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleRefresh = () => carregar(true);

  const handleVoltar = useCallback(() => {
    onNavigate?.(previousScreen || 'Inicio');
  }, [onNavigate, previousScreen]);

  const handleAvaliar = () => {
    if (!isAuthenticated) {
      toastHelper.showInfo('Faça login para avaliar este local');
      onNavigate?.('Login', { redirect: `LocalDetalhes?id=${id}` });
      return;
    }
    setModalAvaliacaoVisible(true);
  };

  const handleCompartilhar = () => {
    setModalCompartilharVisible(true);
  };

  // NOVO: Handler para reportar o local
  const handleReportarLocal = () => {
    if (!isAuthenticated) {
      toastHelper.showInfo('Faça login para reportar este local');
      onNavigate?.('Login', { redirect: `LocalDetalhes?id=${id}` });
      return;
    }
    setShowReportarLocalModal(true);
  };

  const handleVerTodasAvaliacoes = () => {
    onNavigate?.('TodasAvaliacoes', { localId: id, localNome: local?.nome });
  };

  const handleEnviarAvaliacao = async (avaliacaoData) => {
    try {
      const result = await AvaliacaoService.criarAvaliacao(avaliacaoData);
      
      if (result.success) {
        toastHelper.showSuccess('Avaliação enviada com sucesso!');
        setModalAvaliacaoVisible(false);
        await carregar(true);
      } else {
        toastHelper.showError(result.message || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toastHelper.showError('Erro ao enviar avaliação');
    }
  };

  const renderMediaStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color={t.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color={t.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color={t.colors.textSecondary} />);
      }
    }
    return stars;
  };

  const formatEnderecoCompleto = (end) => {
    if (!end) return 'Endereço não informado';
    const partes = [];
    if (end.logradouro) partes.push(end.logradouro);
    if (end.numero) partes.push(end.numero);
    if (end.bairro) partes.push(end.bairro);
    if (end.cidade) partes.push(end.cidade);
    if (end.estado) partes.push(end.estado);
    return partes.join(', ');
  };

  const renderDescricaoLocal = () => {
    const descricao = local?.descricao || '';
    if (!descricao) return null;
    
    const shouldTruncate = descricao.length > 120;
    const descricaoExibida = descricaoExpandida ? descricao : descricao.substring(0, 120);
    
    return (
      <View style={[styles.descricaoContainer, estilosDinamicos.descricaoContainer]}>
        <View style={styles.descricaoHeader}>
          <Ionicons name="document-text-outline" size={estilosZoom.descricaoIcone} color={t.colors.primary} />
          <ThemedText weight="bold" style={[styles.descricaoTitulo, estilosZoom.descricaoTitulo]}>
            Sobre o local
          </ThemedText>
        </View>
        <Spacer size="sm" />
        <ThemedText color="textSecondary" style={[styles.descricaoTexto, estilosZoom.descricaoTexto]}>
          {descricaoExibida}
          {shouldTruncate && !descricaoExpandida && '...'}
        </ThemedText>
        {shouldTruncate && (
          <TouchableOpacity 
            onPress={() => setDescricaoExpandida(!descricaoExpandida)} 
            style={styles.verMaisButtonDescricao}
          >
            <ThemedText color="primary" weight="semibold" variant="caption">
              {descricaoExpandida ? 'Ver menos ▲' : 'Ver mais ▼'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAvaliacoes = () => {
    if (!local.avaliacoes || local.avaliacoes.length === 0) {
      return (
        <View style={styles.semAvaliacoes}>
          <Ionicons name="chatbubble-outline" size={48} color={t.colors.textTertiary} />
          <ThemedText color="textSecondary" align="center">Nenhuma avaliação ainda.</ThemedText>
          <ThemedText variant="caption" color="textTertiary" align="center">
            Seja o primeiro a avaliar este local!
          </ThemedText>
        </View>
      );
    }

    const avaliacoesVisiveis = mostrarTodasAvaliacoes
      ? local.avaliacoes.slice(0, 6)
      : local.avaliacoes.slice(0, 3);
    
    const temMaisAvaliacoes = local.avaliacoes.length > 3;
    const precisaScroll = local.avaliacoes.length > 6 && mostrarTodasAvaliacoes;

    const conteudoAvaliacoes = (
      <>
        {avaliacoesVisiveis.map((item, index) => (
          <React.Fragment key={item.id || index}>
            <AvaliacaoItem 
              avaliacao={item} 
              theme={t} 
              estilosDinamicos={estilosZoom} 
              now={now}
            />
            {index < avaliacoesVisiveis.length - 1 && (
              <View style={[styles.divisor, { backgroundColor: t.colors.borderLight || '#E0E0E0' }]} />
            )}
          </React.Fragment>
        ))}
      </>
    );

    return (
      <>
        <View style={[styles.headerAvaliacoes, estilosZoom.headerAvaliacoes]}>
          <View style={styles.headerAvaliacoesLeft}>
            <Ionicons name="chatbubbles-outline" size={22} color={t.colors.primary} />
            <ThemedText variant="h3" weight="bold" style={[styles.tituloAvaliacoes, estilosZoom.tituloAvaliacoes]}>
              Avaliações Recentes
            </ThemedText>
            <View style={styles.totalBadge}>
              <ThemedText variant="caption" weight="bold" style={styles.totalBadgeTexto}>
                {local.avaliacoes.length}
              </ThemedText>
            </View>
          </View>
        </View>

        <Spacer size="sm" />

        {precisaScroll ? (
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            style={styles.avaliacoesContainerScroll}
          >
            {conteudoAvaliacoes}
          </ScrollView>
        ) : (
          <View style={styles.avaliacoesContainer}>
            {conteudoAvaliacoes}
          </View>
        )}

        {temMaisAvaliacoes && !mostrarTodasAvaliacoes && (
          <TouchableOpacity
            style={styles.verMaisComentarios}
            onPress={() => setMostrarTodasAvaliacoes(true)}
          >
            <ThemedText color="primary" weight="semibold">
              Ver mais comentários
            </ThemedText>
          </TouchableOpacity>
        )}

        {mostrarTodasAvaliacoes && local.avaliacoes.length > 3 && (
          <TouchableOpacity
            style={styles.verMaisComentarios}
            onPress={() => setMostrarTodasAvaliacoes(false)}
          >
            <ThemedText color="primary" weight="semibold">
              Mostrar menos
            </ThemedText>
          </TouchableOpacity>
        )}

        {local.avaliacoes.length > 6 && mostrarTodasAvaliacoes && (
          <TouchableOpacity
            style={styles.verTodasPagina}
            onPress={handleVerTodasAvaliacoes}
          >
            <ThemedText color="textSecondary" variant="caption">
              Ver todas em nova página →
            </ThemedText>
          </TouchableOpacity>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, estilosDinamicos.centerContainer]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary">Carregando detalhes...</ThemedText>
      </View>
    );
  }

  if (error || !local) {
    return (
      <View style={[styles.centerContainer, estilosDinamicos.centerContainer]}>
        <ThemedText color="error" align="center">{error || 'Local não encontrado'}</ThemedText>
        <Spacer size="md" />
        <Button variant="primary" onPress={handleRefresh} iconLeft="refresh-outline">
          Tentar novamente
        </Button>
        <Spacer size="sm" />
        <Button variant="outline" onPress={handleVoltar}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={estilosZoom.container}>
      <View style={estilosZoom.cabecalho}>
        <TouchableOpacity
          onPress={handleVoltar}
          style={[styles.botaoVoltarTopo, { borderColor: t.colors.borderLight, backgroundColor: t.colors.surface }]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={t.colors.textPrimary} />
          <ThemedText weight="medium" style={[styles.textoVoltarTopo, estilosZoom.textoVoltarTopo]}>Voltar</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={estilosZoom.scrollArea}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, estilosZoom.scrollContent]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[t.colors.primary]}
            tintColor={t.colors.primary}
          />
        }
      >
        <Card style={[styles.cardPrincipal, estilosZoom.cardPrincipal]} altoContraste={isHighContrast}>
          <View style={[styles.headerLocal, estilosZoom.headerLocal]}>
            <View style={styles.infoLocal}>
              <ThemedText variant="h2" weight="bold" style={[styles.nomeLocal, estilosZoom.nomeLocal]}>
                {local.nome}
              </ThemedText>
              <View style={[styles.categoriaBadge, estilosDinamicos.categoriaBadge]}>
                <ThemedText variant="caption" weight="semibold" style={{ color: t.colors.primary }}>
                  {local.categoria}
                </ThemedText>
              </View>
              <View style={[styles.enderecoRow, estilosZoom.enderecoRow]}>
                <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
                <ThemedText color="textSecondary" style={[styles.endereco, estilosZoom.endereco]}>
                  {formatEnderecoCompleto(local.endereco)}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.ratingBox, estilosZoom.ratingBox]}>
              <View style={styles.starsRow}>{renderMediaStars(local.avaliacaoMedia)}</View>
              <ThemedText variant="h2" weight="bold" style={[styles.notaMedia, estilosZoom.notaMedia]}>
                {(local.avaliacaoMedia || 0).toFixed(1)}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary">
                {local.totalAvaliacoes || 0} avaliações
              </ThemedText>
            </View>
          </View>

          <Spacer size="lg" />
          <LocalAccessibility tiposAcessibilidade={local.tiposAcessibilidade} altoContraste={isHighContrast} />
          
          {renderDescricaoLocal()}
          
          <Spacer size="xl" />

          <View style={[styles.botoesContainer, estilosZoom.botoesContainer]}>
            <Button variant="primary" size="large" iconLeft="star-outline" onPress={handleAvaliar} style={[styles.botaoAvaliar, estilosZoom.botao, estilosDinamicos.botaoAvaliar]}>
              Avaliar
            </Button>
            <Button variant="outline" size="medium" iconLeft="share-social-outline" onPress={handleCompartilhar} style={[styles.botaoAcao, estilosZoom.botao]}>
              Compartilhar
            </Button>
            {/* NOVO: Botão Reportar Local */}
            <Button variant="outline" size="medium" iconLeft="flag-outline" onPress={handleReportarLocal} style={[styles.botaoAcao, estilosZoom.botao]}>
              Reportar
            </Button>
          </View>
        </Card>

        <Spacer size="lg" />

        <Card style={[styles.cardFotos, estilosZoom.cardFotos]} altoContraste={isHighContrast}>
          <View style={[styles.headerFotos, estilosZoom.headerFotos]}>
            <Ionicons name="images-outline" size={22} color={t.colors.primary} />
            <ThemedText variant="h3" weight="bold" style={[styles.tituloFotos, estilosZoom.tituloFotos]}>Fotos do Local</ThemedText>
            {local.imagens?.length > 0 && (
              <ThemedText variant="caption" color="textSecondary">
                ({local.imagens.length} {local.imagens.length === 1 ? 'foto' : 'fotos'})
              </ThemedText>
            )}
          </View>
          <Spacer size="sm" />
          <LocalGallery imagens={local.imagens || []} />
        </Card>

        <Spacer size="lg" />

        <Card style={[styles.cardAvaliacoes, estilosZoom.cardAvaliacoes]} altoContraste={isHighContrast}>
          {renderAvaliacoes()}
        </Card>

        <Spacer size="xl" />
      </ScrollView>

      {/* Modal de Avaliação */}
      <AvaliacaoModal
        visible={modalAvaliacaoVisible}
        onClose={() => setModalAvaliacaoVisible(false)}
        local={local}
        onSubmit={handleEnviarAvaliacao}
      />

      {/* Modal de Compartilhamento */}
      <ModalCompartilhar
        visible={modalCompartilharVisible}
        onClose={() => setModalCompartilharVisible(false)}
        local={local}
      />

      {/* NOVO: Modal de Reportar Local */}
      <ReportarModal
        visible={showReportarLocalModal}
        onClose={() => setShowReportarLocalModal(false)}
        tipo="LOCAL"
        targetId={local.id}
        targetName={local.nome}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cardPrincipal: {
    padding: 20,
  },
  cardFotos: {
    padding: 20,
  },
  cardAvaliacoes: {
    padding: 20,
  },
  headerLocal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoLocal: {
    flex: 1,
    gap: 8,
  },
  nomeLocal: {
    fontSize: 20,
  },
  categoriaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  enderecoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endereco: {
    fontSize: 12,
    flex: 1,
  },
  ratingBox: {
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  notaMedia: {
    fontSize: 22,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  botaoAvaliar: {
    flex: 1,
  },
  botaoAcao: {
    flex: 1,
  },
  headerFotos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  tituloFotos: {
    fontSize: 18,
  },
  headerAvaliacoes: {
    marginBottom: 8,
  },
  headerAvaliacoesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tituloAvaliacoes: {
    fontSize: 18,
  },
  totalBadge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  totalBadgeTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  descricaoContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  descricaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  descricaoTitulo: {
    fontSize: 15,
  },
  descricaoTexto: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'justify',
  },
  verMaisButtonDescricao: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  avaliacaoItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  avaliacaoHeader: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  usuarioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontSize: 14,
    lineHeight: 18,
  },
  usuarioDetails: {
    flex: 1,
  },
  usuarioNome: {
    fontSize: 14,
    fontWeight: '600',
  },
  estrelasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dataContainer: {
    marginLeft: 12,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    justifyContent: 'center',
  },
  dataAvaliacao: {
    fontSize: 11,
    fontWeight: '500',
  },
  comentario: {
    marginLeft: 50,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },
  divisor: {
    height: 1,
    marginVertical: 8,
  },
  semAvaliacoes: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  botaoVoltarTopo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textoVoltarTopo: {
    lineHeight: 22,
  },
  avaliacoesContainer: {
    width: '100%',
  },
  avaliacoesContainerScroll: {
    maxHeight: 520,
    width: '100%',
  },
  verMaisComentarios: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  verTodasPagina: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
});

function criarEstilosDinamicos({ t, width, layoutEmpilhado, fontSizeMultiplier, zoomAtivo, corFundoPagina }) {
  const fonteGrande = fontSizeMultiplier >= 1.5;
  const acaoEmpilhada = width < 760 || fonteGrande;

  return {
    container: {
      padding: 0,
    },
    cabecalho: {
      width: '100%',
      maxWidth: 1320,
      alignSelf: 'center',
      paddingHorizontal: width >= 1280 ? t.spacing.xl : t.spacing.md,
      paddingTop: t.spacing.md,
      marginBottom: zoomAtivo ? t.spacing.xl : t.spacing.lg,
      backgroundColor: corFundoPagina,
      zIndex: 2,
    },
    scrollArea: {
      backgroundColor: 'transparent',
    },
    tituloPagina: {
      fontSize: t.typography.fontSize.xxxl,
      lineHeight: Math.round(t.typography.fontSize.xxxl * 1.2),
    },
    subtituloPagina: {
      fontSize: t.typography.fontSize.lg,
      lineHeight: Math.round(t.typography.fontSize.lg * 1.35),
    },
    textoVoltarTopo: {
      fontSize: t.typography.fontSize.lg,
      lineHeight: Math.round(t.typography.fontSize.lg * 1.2),
    },
    scrollContent: {
      width: '100%',
      maxWidth: 1320,
      alignSelf: 'center',
      paddingHorizontal: width >= 1280 ? t.spacing.xl : t.spacing.md,
      paddingTop: zoomAtivo ? t.spacing.sm : 0,
    },
    cardPrincipal: {
      padding: fonteGrande ? 24 : 20,
    },
    cardFotos: {
      padding: fonteGrande ? 24 : 20,
    },
    cardAvaliacoes: {
      padding: fonteGrande ? 24 : 20,
    },
    headerLocal: {
      flexDirection: layoutEmpilhado ? 'column' : 'row',
      gap: fonteGrande ? 20 : 16,
    },
    nomeLocal: {
      fontSize: t.typography.fontSize.xxl,
      lineHeight: Math.round(t.typography.fontSize.xxl * 1.2),
    },
    enderecoRow: {
      alignItems: 'flex-start',
    },
    endereco: {
      fontSize: t.typography.fontSize.md,
      lineHeight: Math.round(t.typography.fontSize.md * 1.45),
    },
    ratingBox: {
      alignSelf: layoutEmpilhado ? 'flex-start' : 'center',
      alignItems: layoutEmpilhado ? 'flex-start' : 'center',
    },
    notaMedia: {
      fontSize: t.typography.fontSize.xxl,
    },
    botoesContainer: {
      flexWrap: 'wrap',
      flexDirection: acaoEmpilhada ? 'column' : 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      marginTop: fonteGrande ? t.spacing.xl : t.spacing.lg,
    },
    botao: {
      flex: acaoEmpilhada ? 0 : 1,
      minWidth: acaoEmpilhada ? 0 : 180,
      width: acaoEmpilhada ? '100%' : 'auto',
    },
    headerFotos: {
      flexWrap: 'wrap',
      rowGap: t.spacing.xs,
    },
    tituloFotos: {
      fontSize: t.typography.fontSize.xl,
      lineHeight: Math.round(t.typography.fontSize.xl * 1.2),
    },
    headerAvaliacoes: {
      flexWrap: 'wrap',
      rowGap: t.spacing.xs,
    },
    tituloAvaliacoes: {
      fontSize: t.typography.fontSize.xl,
      lineHeight: Math.round(t.typography.fontSize.xl * 1.2),
    },
    descricaoTitulo: {
      fontSize: t.typography.fontSize.lg,
      lineHeight: Math.round(t.typography.fontSize.lg * 1.3),
    },
    descricaoIcone: fonteGrande ? 26 : 22,
    descricaoTexto: {
      fontSize: t.typography.fontSize.md,
      lineHeight: Math.round(t.typography.fontSize.md * 1.45),
    },
    avaliacaoItem: {
      paddingVertical: fonteGrande ? 16 : 14,
      paddingHorizontal: fonteGrande ? 16 : 12,
      borderRadius: fonteGrande ? 16 : 14,
    },
    avatar: {
      width: fonteGrande ? 44 : 40,
      height: fonteGrande ? 44 : 40,
      borderRadius: fonteGrande ? 22 : 20,
    },
    avatarTexto: {
      fontSize: t.typography.fontSize.md,
      lineHeight: Math.round(t.typography.fontSize.md * 1.3),
    },
    usuarioNome: {
      fontSize: t.typography.fontSize.md,
      lineHeight: Math.round(t.typography.fontSize.md * 1.3),
    },
    dataAvaliacao: {
      fontSize: t.typography.fontSize.sm,
    },
    comentario: {
      marginLeft: fonteGrande ? 56 : 50,
      marginTop: fonteGrande ? 10 : 8,
      fontSize: t.typography.fontSize.md,
      lineHeight: Math.round(t.typography.fontSize.md * 1.4),
    },
  };
}