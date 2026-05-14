import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { 
  CabecalhoPagina,
  Card,
  Button 
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import LocalGallery from '../../components/local/LocalGallery';
import LocalAccessibility from '../../components/local/LocalAccessibility';
import LocalActions from '../../components/local/LocalActions';
import LocalReviews from '../../components/local/LocalReviews';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import LocalService from '../../services/LocalService';
import toastHelper from '../../utils/toastHelper';

export default function LocalDetalhes({ onNavigate, route }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const { id } = route?.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [local, setLocal] = useState(null);
  const [error, setError] = useState(null);

  const carregarDetalhes = useCallback(async (isRefresh = false) => {
    if (!id) {
      setError('ID do local não informado');
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('📋 LocalDetalhes: Buscando detalhes do local ID:', id);
      // ✅ CORREÇÃO: usar obterLocal em vez de obterDetalhes
      const dados = await LocalService.obterLocal(id);
      
      // Processa os dados para garantir que os campos existem
      setLocal({
        ...dados,
        avaliacaoMedia: dados.avaliacaoMedia || 0,
        totalAvaliacoes: dados.totalAvaliacoes || 0,
        tiposAcessibilidade: dados.tiposAcessibilidade || [],
        imagens: dados.imagens || [],
        avaliacoes: dados.avaliacoes || []
      });
      setError(null);
    } catch (err) {
      console.error('❌ LocalDetalhes: Erro ao carregar detalhes:', err);
      setError('Não foi possível carregar os detalhes do local');
      toastHelper.showError('Erro ao carregar detalhes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  const handleRefresh = () => carregarDetalhes(true);

  const handleAvaliar = (action) => {
    if (action === 'login') {
      onNavigate?.('Login', { redirect: `LocalDetalhes?id=${id}` });
      return;
    }
    onNavigate?.('AvaliarLocal', { localId: id });
  };

  const handleReportar = (local) => {
    onNavigate?.('ReportarProblema', { localId: local.id, localNome: local.nome });
  };

  const handleVerTodasAvaliacoes = () => {
    onNavigate?.('TodasAvaliacoes', { localId: id, localNome: local?.nome });
  };

  const handleVoltar = () => {
    onNavigate?.('Inicio');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

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
      <View style={[styles.loadingContainer, { backgroundColor: t.colors.background }]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary" altoContraste={isHighContrast}>
          Carregando detalhes...
        </ThemedText>
      </View>
    );
  }

  if (error || !local) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: t.colors.background }]}>
        <ThemedText color="error" align="center" altoContraste={isHighContrast}>
          {error || 'Local não encontrado'}
        </ThemedText>
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
          onPress={handleVoltar}
          altoContraste={isHighContrast}
        >
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: t.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[t.colors.primary]}
          tintColor={t.colors.primary}
        />
      }
    >
      {/* Header com botão voltar */}
      <CabecalhoPagina
        titulo={local.nome || 'Local sem nome'}
        subtitulo={local.categoria}
        onVoltar={handleVoltar}
        altoContraste={isHighContrast}
      />

      {/* Galeria de imagens */}
      <LocalGallery 
        imagens={local.imagens}
        imagemPrincipal={local.imagemPrincipal}
        altoContraste={isHighContrast}
      />

      {/* Avaliação e endereço */}
      <Card altoContraste={isHighContrast} style={styles.infoCard}>
        <View style={styles.ratingSection}>
          <View style={styles.stars}>{renderStars(local.avaliacaoMedia)}</View>
          <ThemedText variant="h2" weight="bold" altoContraste={isHighContrast}>
            {(local.avaliacaoMedia || 0).toFixed(1)}
          </ThemedText>
          <ThemedText color="textSecondary" altoContraste={isHighContrast}>
            ({local.totalAvaliacoes || 0} avaliações)
          </ThemedText>
        </View>

        <Spacer size="md" />

        <View style={styles.addressSection}>
          <Ionicons name="location-outline" size={20} color={t.colors.primary} />
          <ThemedText style={styles.address} altoContraste={isHighContrast}>
            {formatEnderecoCompleto(local.endereco)}
          </ThemedText>
        </View>
      </Card>

      {/* Botões de ação */}
      <LocalActions
        local={local}
        onAvaliar={handleAvaliar}
        onReportar={handleReportar}
        isAuthenticated={isAuthenticated}
        altoContraste={isHighContrast}
      />

      {/* Recursos de acessibilidade */}
      <LocalAccessibility
        tiposAcessibilidade={local.tiposAcessibilidade}
        altoContraste={isHighContrast}
      />

      {/* Avaliações */}
      <LocalReviews
        avaliacoes={local.avaliacoes || []}
        totalAvaliacoes={local.totalAvaliacoes}
        avaliacaoMedia={local.avaliacaoMedia}
        onVerTodas={handleVerTodasAvaliacoes}
        onAdicionarAvaliacao={() => handleAvaliar('login')}
        isAuthenticated={isAuthenticated}
        altoContraste={isHighContrast}
      />

      <Spacer size="xl" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  infoCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});