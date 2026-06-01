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

import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import HomeService from '../../services/HomeService';
import AvaliacaoService from '../../services/AvaliacaoService';
import toastHelper from '../../utils/toastHelper';
import { breakpoints } from '../../config/theme';

const formatarDataRelativa = (dataOriginal) => {
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
    
    const agora = new Date();
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

const AvaliacaoItem = ({ avaliacao, theme, estilosDinamicos }) => {
  const renderStars = (nota = 0) => {
    const stars = [];
    const fullStars = Math.floor(nota);
    const hasHalfStar = nota % 1 >= 0.5;
    
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
  const dataFormatada = formatarDataRelativa(dataOriginal);

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
              {renderStars(mediaGeral)}
              <ThemedText variant="caption" color="textTertiary" style={[styles.dataAvaliacao, estilosDinamicos.dataAvaliacao]}>
                • {dataFormatada}
              </ThemedText>
            </View>
          </View>
        </View>
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
  const { id } = route?.params || {};

  const isDesktop = width >= breakpoints.desktop;
  const zoomAtivo = fontSizeMultiplier >= 1.5;
  const layoutEmpilhado = width < 1280 || fontSizeMultiplier >= 1.5;
  const corFundoPagina = isHighContrast ? t.colors.background : t.colors.backgroundSecondary;
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

  const [modalAvaliacaoVisible, setModalAvaliacaoVisible] = useState(false);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);

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
      
      const imagensList = dados.imagensCompletas || [];
      
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

  const handleAvaliar = () => {
    if (!isAuthenticated) {
      toastHelper.showInfo('Faça login para avaliar este local');
      onNavigate?.('Login', { redirect: `LocalDetalhes?id=${id}` });
      return;
    }
    setModalAvaliacaoVisible(true);
  };

  const handleCompartilhar = () => {
    toastHelper.showInfo('Compartilhar em breve');
  };

  const handleReportar = () => {
    onNavigate?.('ReportarProblema', { localId: id, localNome: local?.nome });
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

  // Renderizar descrição do local
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
        <Button variant="outline" onPress={() => onNavigate?.('Inicio')}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={estilosZoom.container}>
      <View style={estilosZoom.cabecalho}>
        <TouchableOpacity
          onPress={() => onNavigate?.('Inicio')}
          style={[styles.botaoVoltarTopo, { borderColor: t.colors.borderLight, backgroundColor: t.colors.surface }]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={t.colors.textPrimary} />
          <ThemedText weight="medium" style={[styles.textoVoltarTopo, estilosZoom.textoVoltarTopo]}>Voltar</ThemedText>
        </TouchableOpacity>

        <Spacer size="sm" />

        <ThemedText variant="h1" weight="bold" style={estilosZoom.tituloPagina}>
          Detalhes do Local
        </ThemedText>
        <Spacer size="xs" />
        <ThemedText color="textSecondary" style={estilosZoom.subtituloPagina}>
          Encontre e avalie locais acessíveis
        </ThemedText>
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
        {isDesktop ? (
          <>
            <View style={[styles.linhaSuperior, estilosZoom.linhaSuperior]}>
              <View style={[styles.cardPrincipalWrapper, estilosZoom.cardPrincipalWrapper]}>
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
                  
                  {/* CARD DE DESCRIÇÃO - COM ESPAÇAMENTO REDUZIDO */}
                  {renderDescricaoLocal()}
                  
                  <Spacer size="xl" />

                  <View style={[styles.botoesContainer, estilosZoom.botoesContainer]}>
                    <Button variant="primary" size="large" iconLeft="star-outline" onPress={handleAvaliar} style={[styles.botaoAvaliar, estilosZoom.botao, estilosDinamicos.botaoAvaliar]}>
                      Avaliar
                    </Button>
                    <Button variant="outline" size="medium" iconLeft="share-social-outline" onPress={handleCompartilhar} style={[styles.botaoAcao, estilosZoom.botao]}>
                      Compartilhar
                    </Button>
                    <Button variant="outline" size="medium" iconLeft="flag-outline" onPress={handleReportar} style={[styles.botaoAcao, estilosZoom.botao]}>
                      Reportar
                    </Button>
                  </View>
                </Card>
              </View>
            </View>
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
              <LocalGallery imagens={local.imagens?.map(img => img.url) || []} />
            </Card>
            <Spacer size="lg" />
            <Card style={[styles.cardAvaliacoesMobile, estilosZoom.cardAvaliacoesMobile]} altoContraste={isHighContrast}>
              <View style={[styles.headerAvaliacoes, estilosZoom.headerAvaliacoes]}>
                <Ionicons name="chatbubbles-outline" size={22} color={t.colors.primary} />
                <ThemedText variant="h3" weight="bold" style={[styles.tituloAvaliacoes, estilosZoom.tituloAvaliacoes]}>
                  Avaliações Recentes
                </ThemedText>
                {local.avaliacoes?.length > 0 && (
                  <TouchableOpacity onPress={handleVerTodasAvaliacoes}>
                    <ThemedText color="primary" variant="caption" weight="semibold">Ver todas →</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <Spacer size="sm" />

              {local.avaliacoes && local.avaliacoes.length > 0 ? (
                local.avaliacoes.slice(0, 3).map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    <AvaliacaoItem avaliacao={item} theme={t} estilosDinamicos={estilosZoom} />
                    {index < 2 && <View style={[styles.divisor, { backgroundColor: t.colors.borderLight || '#E0E0E0' }]} />}
                  </React.Fragment>
                ))
              ) : (
                <View style={styles.semAvaliacoes}>
                  <Ionicons name="chatbubble-outline" size={48} color={t.colors.textTertiary} />
                  <ThemedText color="textSecondary" align="center">Nenhuma avaliação ainda.</ThemedText>
                  <ThemedText variant="caption" color="textTertiary" align="center">Seja o primeiro a avaliar este local!</ThemedText>
                </View>
              )}
            </Card>
          </>
        ) : (
          <>
            <Card style={[styles.cardPrincipalMobile, estilosZoom.cardPrincipalMobile]} altoContraste={isHighContrast}>
              <View style={[styles.headerLocal, estilosZoom.headerLocal]}>
                <View style={styles.infoLocal}>
                  <ThemedText variant="h2" weight="bold" style={[styles.nomeLocal, estilosZoom.nomeLocal]}>{local.nome}</ThemedText>
                  <View style={[styles.categoriaBadge, estilosDinamicos.categoriaBadge]}>
                    <ThemedText variant="caption" weight="semibold" style={{ color: t.colors.primary }}>{local.categoria}</ThemedText>
                  </View>
                  <View style={[styles.enderecoRow, estilosZoom.enderecoRow]}>
                    <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
                    <ThemedText color="textSecondary" style={[styles.endereco, estilosZoom.endereco]}>{formatEnderecoCompleto(local.endereco)}</ThemedText>
                  </View>
                </View>
                <View style={[styles.ratingBox, estilosZoom.ratingBox]}>
                  <View style={styles.starsRow}>{renderMediaStars(local.avaliacaoMedia)}</View>
                  <ThemedText variant="h2" weight="bold" style={[styles.notaMedia, estilosZoom.notaMedia]}>{(local.avaliacaoMedia || 0).toFixed(1)}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">{local.totalAvaliacoes || 0} avaliações</ThemedText>
                </View>
              </View>

              <Spacer size="lg" />
              <LocalAccessibility tiposAcessibilidade={local.tiposAcessibilidade} altoContraste={isHighContrast} />
              
              {renderDescricaoLocal()}
              
              <Spacer size="xl" />
              
              <View style={[styles.botoesContainer, estilosZoom.botoesContainer]}>
                <Button variant="primary" size="large" iconLeft="star-outline" onPress={handleAvaliar} style={[styles.botaoAvaliar, estilosZoom.botao, estilosDinamicos.botaoAvaliar]}>Avaliar</Button>
                <Button variant="outline" size="medium" iconLeft="share-social-outline" onPress={handleCompartilhar} style={[styles.botaoAcao, estilosZoom.botao]}>Compartilhar</Button>
                <Button variant="outline" size="medium" iconLeft="flag-outline" onPress={handleReportar} style={[styles.botaoAcao, estilosZoom.botao]}>Reportar</Button>
              </View>
            </Card>
            <Spacer size="lg" />
            <Card style={[styles.cardFotos, estilosZoom.cardFotos]} altoContraste={isHighContrast}>
              <View style={[styles.headerFotos, estilosZoom.headerFotos]}>
                <Ionicons name="images-outline" size={22} color={t.colors.primary} />
                <ThemedText variant="h3" weight="bold" style={[styles.tituloFotos, estilosZoom.tituloFotos]}>Fotos do Local</ThemedText>
                {local.imagens?.length > 0 && <ThemedText variant="caption" color="textSecondary">({local.imagens.length} {local.imagens.length === 1 ? 'foto' : 'fotos'})</ThemedText>}
              </View>
              <Spacer size="sm" />
              <LocalGallery imagens={local.imagens?.map(img => img.url) || []} />
            </Card>
            <Spacer size="lg" />
            <Card style={[styles.cardAvaliacoesMobile, estilosZoom.cardAvaliacoesMobile]} altoContraste={isHighContrast}>
              <View style={[styles.headerAvaliacoes, estilosZoom.headerAvaliacoes]}>
                <Ionicons name="chatbubbles-outline" size={22} color={t.colors.primary} />
                <ThemedText variant="h3" weight="bold" style={[styles.tituloAvaliacoes, estilosZoom.tituloAvaliacoes]}>Avaliações Recentes</ThemedText>
                {local.avaliacoes?.length > 0 && (
                  <TouchableOpacity onPress={handleVerTodasAvaliacoes}>
                    <ThemedText color="primary" variant="caption" weight="semibold">Ver todas →</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <Spacer size="sm" />
              {local.avaliacoes && local.avaliacoes.length > 0 ? (
                local.avaliacoes.slice(0, 3).map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    <AvaliacaoItem avaliacao={item} theme={t} estilosDinamicos={estilosZoom} />
                    {index < 2 && <View style={[styles.divisor, { backgroundColor: t.colors.borderLight || '#E0E0E0' }]} />}
                  </React.Fragment>
                ))
              ) : (
                <View style={styles.semAvaliacoes}>
                  <Ionicons name="chatbubble-outline" size={48} color={t.colors.textTertiary} />
                  <ThemedText color="textSecondary" align="center">Nenhuma avaliação ainda.</ThemedText>
                  <ThemedText variant="caption" color="textTertiary" align="center">Seja o primeiro a avaliar este local!</ThemedText>
                </View>
              )}
            </Card>
          </>
        )}
        <Spacer size="xl" />
      </ScrollView>

      <AvaliacaoModal
        visible={modalAvaliacaoVisible}
        onClose={() => setModalAvaliacaoVisible(false)}
        local={local}
        onSubmit={handleEnviarAvaliacao}
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
  cardPrincipal: {
    padding: 20,
  },
  cardPrincipalMobile: {
    padding: 20,
  },
  cardAvaliacoes: {
    padding: 20,
  },
  cardAvaliacoesMobile: {
    padding: 20,
  },
  cardFotos: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  tituloAvaliacoes: {
    fontSize: 18,
    flex: 1,
  },
  // Estilos para o card de descrição
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
    paddingVertical: 12,
  },
  avaliacaoHeader: {
    marginBottom: 6,
  },
  usuarioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  },
  estrelasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataAvaliacao: {
    fontSize: 10,
  },
  comentario: {
    marginLeft: 46,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
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
    linhaSuperior: {
      flexDirection: layoutEmpilhado ? 'column' : 'row',
      alignItems: 'stretch',
      marginTop: zoomAtivo ? t.spacing.sm : 0,
    },
    cardPrincipalWrapper: {
      flex: layoutEmpilhado ? 0 : 2,
      width: '100%',
      minWidth: 0,
    },
    cardAvaliacoesWrapper: {
      flex: layoutEmpilhado ? 0 : 1,
      width: '100%',
      minWidth: 0,
      marginTop: layoutEmpilhado ? 0 : t.spacing.xl * 2,
    },
    cardPrincipal: {
      padding: fonteGrande ? 24 : 20,
    },
    cardPrincipalMobile: {
      padding: fonteGrande ? 24 : 20,
    },
    cardAvaliacoes: {
      padding: fonteGrande ? 24 : 20,
    },
    cardAvaliacoesMobile: {
      padding: fonteGrande ? 24 : 20,
    },
    cardFotos: {
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
      paddingVertical: fonteGrande ? 14 : 12,
    },
    avatar: {
      width: fonteGrande ? 42 : 36,
      height: fonteGrande ? 42 : 36,
      borderRadius: fonteGrande ? 21 : 18,
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
      marginLeft: fonteGrande ? 52 : 46,
      fontSize: t.typography.fontSize.md,
      lineHeight: Math.round(t.typography.fontSize.md * 1.4),
    },
  };
}