import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  CabecalhoPagina,
  Card,
  Button
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { Container } from '../../components/layout';

import LocalGallery from '../../components/local/LocalGallery';
import LocalAccessibility from '../../components/local/LocalAccessibility';
import LocalActions from '../../components/local/LocalActions';
import AvaliacaoModal from '../../components/local/AvaliacaoModal';

import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import LocalService from '../../services/LocalService';
import toastHelper from '../../utils/toastHelper';
import { breakpoints } from '../../config/theme';

// ============================================
// COMPONENTE DE AVALIAÇÃO INDIVIDUAL
// ============================================
const AvaliacaoItem = ({ avaliacao, theme }) => {
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

  const formatarData = (dataString) => {
    if (!dataString) return '';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataString;
    }
  };

  const primeiraLetra = (avaliacao.usuarioNome || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.avaliacaoItem}>
      <View style={styles.avaliacaoHeader}>
        <View style={styles.usuarioInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <ThemedText weight="bold" style={{ color: theme.colors.primary, fontSize: 16 }}>
              {primeiraLetra}
            </ThemedText>
          </View>
          <View>
            <ThemedText weight="semibold" style={styles.usuarioNome}>
              {avaliacao.usuarioNome || 'Usuário'}
            </ThemedText>
            <View style={styles.estrelasRow}>
              {renderStars(avaliacao.nota || 0)}
            </View>
          </View>
        </View>
        <ThemedText variant="caption" color="textTertiary" style={styles.dataAvaliacao}>
          {formatarData(avaliacao.dataCriacao || avaliacao.data)}
        </ThemedText>
      </View>
      
      {avaliacao.comentario ? (
        <ThemedText color="textSecondary" style={styles.comentario}>
          {avaliacao.comentario}
        </ThemedText>
      ) : null}
    </View>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function LocalDetalhes({ onNavigate, route }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const { id } = route?.params || {};

  // Breakpoints responsivos
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isMobile = width < breakpoints.tablet;

  // Estado para controle visual dos botões
  const [botaoAtivo, setBotaoAtivo] = useState(null);
  const [modalAvaliacaoVisible, setModalAvaliacaoVisible] = useState(false);

  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Reset botão ativo após 300ms (feedback tátil)
  const resetBotaoAtivo = useCallback(() => {
    setTimeout(() => setBotaoAtivo(null), 300);
  }, []);

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
      const dados = await LocalService.obterLocal(id);
      
      const avaliacoesOrdenadas = [...(dados.avaliacoes || [])].sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.data || 0);
        const dataB = new Date(b.dataCriacao || b.data || 0);
        return dataB - dataA;
      });

      setLocal({
        ...dados,
        imagens: dados.imagens || [],
        avaliacoes: avaliacoesOrdenadas,
        tiposAcessibilidade: dados.tiposAcessibilidade || [],
        avaliacaoMedia: dados.avaliacaoMedia || 0,
        totalAvaliacoes: dados.totalAvaliacoes || avaliacoesOrdenadas.length,
      });
    } catch (err) {
      console.error('❌ Erro ao carregar local:', err);
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

  // Handlers com feedback visual
  const handleAvaliar = () => {
    setBotaoAtivo('avaliar');
    resetBotaoAtivo();
    
    if (!isAuthenticated) {
      onNavigate?.('Login', { redirect: `LocalDetalhes?id=${id}` });
      return;
    }
    
    setModalAvaliacaoVisible(true);
  };

  const handleCompartilhar = () => {
    setBotaoAtivo('compartilhar');
    resetBotaoAtivo();
    
    toastHelper.showInfo('Compartilhar em breve');
  };

  const handleReportar = () => {
    setBotaoAtivo('reportar');
    resetBotaoAtivo();
    
    onNavigate?.('ReportarProblema', { localId: id, localNome: local?.nome });
  };

  const handleVerTodasAvaliacoes = () => {
    onNavigate?.('TodasAvaliacoes', { localId: id, localNome: local?.nome });
  };

  const handleEnviarAvaliacao = async (avaliacao) => {
    try {
      // TODO: Chamar API para salvar avaliação
      console.log('Avaliação enviada:', avaliacao);
      toastHelper.showSuccess('Avaliação enviada com sucesso!');
      setModalAvaliacaoVisible(false);
      carregar(true);
    } catch (error) {
      toastHelper.showError('Erro ao enviar avaliação');
    }
  };

  const renderMediaStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={18} color={t.colors.warning} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={18} color={t.colors.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={18} color={t.colors.textSecondary} />);
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary">Carregando detalhes...</ThemedText>
      </View>
    );
  }

  if (error || !local) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText color="error" align="center">{error || 'Local não encontrado'}</ThemedText>
        <Spacer size="md" />
        <Button
          variant="primary"
          onPress={handleRefresh}
          iconLeft="refresh-outline"
          altoContraste={isHighContrast}
        >
          Tentar novamente
        </Button>
        <Spacer size="sm" />
        <Button
          variant="outline"
          onPress={() => onNavigate?.('Inicio')}
          altoContraste={isHighContrast}
        >
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <Container
      scroll
      background={isHighContrast ? 'background' : 'backgroundSecondary'}
      altoContraste={isHighContrast}
    >
      <CabecalhoPagina
        titulo="Detalhes do Local"
        subtitulo="Encontre e avalie locais acessíveis"
        onVoltar={() => onNavigate?.('Inicio')}
        textoVoltar="Voltar"
        altoContraste={isHighContrast}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[t.colors.primary]}
            tintColor={t.colors.primary}
          />
        }
      >
        {/* ============================================ */}
        {/* LAYOUT RESPONSIVO */}
        {/* ============================================ */}
        
        {isDesktop ? (
          // ========== DESKTOP: Cards lado a lado ==========
          <>
            <View style={styles.linhaSuperior}>
              {/* CARD PRINCIPAL - ESQUERDA */}
              <View style={styles.cardPrincipalWrapper}>
                <Card altoContraste={isHighContrast} style={styles.cardPrincipal}>
                  {renderCardPrincipal(local, t, isHighContrast, renderMediaStars, formatEnderecoCompleto)}
                  {renderRecursosEAcoes(local, t, isHighContrast, handleAvaliar, handleCompartilhar, handleReportar, isAuthenticated, botaoAtivo)}
                </Card>
              </View>

              {/* CARD AVALIAÇÕES - DIREITA */}
              <View style={styles.cardAvaliacoesWrapper}>
                <Card altoContraste={isHighContrast} style={styles.cardAvaliacoes}>
                  {renderAvaliacoes(local, t, handleVerTodasAvaliacoes, handleAvaliar, isAuthenticated)}
                </Card>
              </View>
            </View>

            <Spacer size="lg" />

            {/* CARD DE FOTOS */}
            <Card altoContraste={isHighContrast} style={styles.cardFotos}>
              {renderFotos(local, t, isHighContrast)}
            </Card>
          </>
        ) : (
          // ========== TABLET / MOBILE: Cards empilhados ==========
          <>
            {/* CARD PRINCIPAL */}
            <Card altoContraste={isHighContrast} style={styles.cardPrincipalMobile}>
              {renderCardPrincipal(local, t, isHighContrast, renderMediaStars, formatEnderecoCompleto)}
              {renderRecursosEAcoes(local, t, isHighContrast, handleAvaliar, handleCompartilhar, handleReportar, isAuthenticated, botaoAtivo)}
            </Card>

            <Spacer size="lg" />

            {/* CARD DE FOTOS */}
            <Card altoContraste={isHighContrast} style={styles.cardFotos}>
              {renderFotos(local, t, isHighContrast)}
            </Card>

            <Spacer size="lg" />

            {/* CARD AVALIAÇÕES */}
            <Card altoContraste={isHighContrast} style={styles.cardAvaliacoesMobile}>
              {renderAvaliacoes(local, t, handleVerTodasAvaliacoes, handleAvaliar, isAuthenticated)}
            </Card>
          </>
        )}

        <Spacer size="xl" />
      </ScrollView>

      {/* Modal de Avaliação */}
      <AvaliacaoModal
        visible={modalAvaliacaoVisible}
        onClose={() => setModalAvaliacaoVisible(false)}
        local={local}
        onSubmit={handleEnviarAvaliacao}
      />
    </Container>
  );
}

// ============================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================

function renderCardPrincipal(local, t, isHighContrast, renderMediaStars, formatEnderecoCompleto) {
  return (
    <>
      <View style={styles.headerLocal}>
        <View style={styles.infoLocal}>
          <ThemedText variant="h2" weight="bold" style={styles.nomeLocal}>
            {local.nome}
          </ThemedText>
          
          <View style={styles.categoriaBadge}>
            <ThemedText variant="caption" weight="semibold" style={{ color: t.colors.primary }}>
              {local.categoria}
            </ThemedText>
          </View>
          
          <View style={styles.enderecoRow}>
            <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
            <ThemedText color="textSecondary" style={styles.endereco}>
              {formatEnderecoCompleto(local.endereco)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.ratingBox}>
          <View style={styles.starsRow}>{renderMediaStars(local.avaliacaoMedia)}</View>
          <ThemedText variant="h2" weight="bold" style={styles.notaMedia}>
            {(local.avaliacaoMedia || 0).toFixed(1)}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary">
            {local.totalAvaliacoes || 0} avaliações
          </ThemedText>
        </View>
      </View>
    </>
  );
}

function renderRecursosEAcoes(local, t, isHighContrast, handleAvaliar, handleCompartilhar, handleReportar, isAuthenticated, botaoAtivo) {
  const getButtonVariant = (botaoNome) => {
    return botaoAtivo === botaoNome ? 'primary' : 'outline';
  };

  return (
    <>
      <Spacer size="lg" />

      {/* Recursos de Acessibilidade */}
      <LocalAccessibility
        tiposAcessibilidade={local.tiposAcessibilidade}
        altoContraste={isHighContrast}
      />

      <Spacer size="lg" />

      {/* Botões de Ação com feedback visual */}
      <View style={styles.botoesContainer}>
        <Button
          variant={getButtonVariant('avaliar')}
          size="medium"
          iconLeft="star-outline"
          onPress={handleAvaliar}
          altoContraste={isHighContrast}
          style={styles.botaoAcao}
          accessibilityLabel="Avaliar este local"
          accessibilityHint="Clique para avaliar o local com nota e comentário"
        >
          Avaliar
        </Button>
        
        <Button
          variant={getButtonVariant('compartilhar')}
          size="medium"
          iconLeft="share-social-outline"
          onPress={handleCompartilhar}
          altoContraste={isHighContrast}
          style={styles.botaoAcao}
          accessibilityLabel="Compartilhar este local"
          accessibilityHint="Compartilhe este local com amigos e familiares"
        >
          Compartilhar
        </Button>
        
        <Button
          variant={getButtonVariant('reportar')}
          size="medium"
          iconLeft="flag-outline"
          onPress={handleReportar}
          altoContraste={isHighContrast}
          style={styles.botaoAcao}
          accessibilityLabel="Reportar problema"
          accessibilityHint="Reporte informações incorretas ou problemas no local"
        >
          Reportar
        </Button>
      </View>
    </>
  );
}

function renderFotos(local, t, isHighContrast) {
  return (
    <>
      <View style={styles.headerFotos}>
        <Ionicons name="images-outline" size={22} color={t.colors.primary} />
        <ThemedText variant="h3" weight="bold" style={styles.tituloFotos}>
          Fotos do Local
        </ThemedText>
      </View>
      <Spacer size="sm" />
      <LocalGallery
        imagens={local.imagens}
        imagemPrincipal={local.imagemPrincipal}
        altoContraste={isHighContrast}
      />
    </>
  );
}

function renderAvaliacoes(local, t, handleVerTodasAvaliacoes, handleAvaliar, isAuthenticated) {
  return (
    <>
      <View style={styles.headerAvaliacoes}>
        <Ionicons name="chatbubbles-outline" size={22} color={t.colors.primary} />
        <ThemedText variant="h3" weight="bold" style={styles.tituloAvaliacoes}>
          Avaliações Recentes
        </ThemedText>
      </View>

      <Spacer size="sm" />

      {local.avaliacoes && local.avaliacoes.length > 0 ? (
        <>
          {local.avaliacoes.slice(0, 3).map((avaliacao, index) => (
            <React.Fragment key={index}>
              <AvaliacaoItem avaliacao={avaliacao} theme={t} />
              {index < local.avaliacoes.slice(0, 3).length - 1 && (
                <View style={[styles.divisor, { backgroundColor: t.colors.borderLight }]} />
              )}
            </React.Fragment>
          ))}
          
          {local.avaliacoes.length > 3 && (
            <Button
              variant="ghost"
              size="small"
              onPress={handleVerTodasAvaliacoes}
              style={styles.verMaisButton}
              altoContraste={false}
            >
              Ver todas as {local.avaliacoes.length} avaliações →
            </Button>
          )}
        </>
      ) : (
        <View style={styles.semAvaliacoes}>
          <Ionicons name="chatbubble-outline" size={48} color={t.colors.textTertiary} />
          <ThemedText color="textSecondary" align="center">
            Nenhuma avaliação ainda.
          </ThemedText>
        </View>
      )}
    </>
  );
}

// ============================================
// ESTILOS RESPONSIVOS
// ============================================
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
  // Layout Desktop
  linhaSuperior: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardPrincipalWrapper: {
    flex: 2,
    minWidth: 280,
  },
  cardAvaliacoesWrapper: {
    flex: 1,
    minWidth: 260,
  },
  // Cards
  cardPrincipal: {
    padding: 20,
    height: '100%',
  },
  cardPrincipalMobile: {
    padding: 20,
  },
  cardAvaliacoes: {
    padding: 20,
    height: '100%',
  },
  cardAvaliacoesMobile: {
    padding: 20,
  },
  cardFotos: {
    padding: 20,
  },
  // Header Local
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
    backgroundColor: '#E8F0FF',
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
  // Botões
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  botaoAcao: {
    flex: 1,
  },
  // Avaliações
  headerAvaliacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  tituloAvaliacoes: {
    fontSize: 18,
  },
  headerFotos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  tituloFotos: {
    fontSize: 18,
  },
  avaliacaoItem: {
    paddingVertical: 12,
  },
  avaliacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  usuarioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usuarioNome: {
    fontSize: 14,
    marginBottom: 4,
  },
  estrelasRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dataAvaliacao: {
    fontSize: 11,
  },
  comentario: {
    marginLeft: 50,
    fontSize: 13,
    lineHeight: 18,
  },
  divisor: {
    height: 1,
    marginVertical: 8,
  },
  verMaisButton: {
    marginTop: 8,
  },
  semAvaliacoes: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
});