// frontend/src/screens/Home.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';

import { StatsBanner, LocalCard } from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import BuscarService from '../../services/BuscarService';
import toastHelper from '../../utils/toastHelper';

// Breakpoints para grid responsivo
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1200,
  DESKTOP: 1400,
};

export default function Home({ onNavigate, routeParams }) {
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { width } = useWindowDimensions();

  const refreshKey = routeParams?.refreshKey;
  const forceRefresh = routeParams?.forceRefresh;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0,
    mediaGeral: 0
  });
  const [locaisDestaque, setLocaisDestaque] = useState([]);

  // ============================================
  // CONFIGURAÇÃO DO GRID RESPONSIVO
  // ============================================
  const gridConfig = useMemo(() => {
    // Para fontes muito grandes, manter 1 coluna
    if (fontSizeMultiplier >= 1.5) {
      return {
        numColumns: 1,
        contentContainerStyle: styles.listContentCentralizado,
        columnWrapperStyle: null,
        cardMarginHorizontal: 0,
      };
    }

    // Desktop: 3 colunas
    if (width >= BREAKPOINTS.DESKTOP) {
      return {
        numColumns: 3,
        contentContainerStyle: styles.listContent,
        columnWrapperStyle: styles.columnWrapperDesktop,
        cardMarginHorizontal: 8,
      };
    }

    // Tablet: 2 colunas
    if (width >= BREAKPOINTS.TABLET) {
      return {
        numColumns: 2,
        contentContainerStyle: styles.listContent,
        columnWrapperStyle: styles.columnWrapperTablet,
        cardMarginHorizontal: 6,
      };
    }

    // Mobile: 1 coluna
    return {
      numColumns: 1,
      contentContainerStyle: styles.listContentCentralizado,
      columnWrapperStyle: null,
      cardMarginHorizontal: 0,
    };
  }, [width, fontSizeMultiplier]);

  // ============================================
  // LAYOUT DO CARD
  // ============================================
  const cardLayout = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) {
      return { compact: true };
    }
    return { compact: false };
  }, [width]);

  const carregarDados = useCallback(async (isRefresh = false, forcarRecarga = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (forcarRecarga && typeof BuscarService.invalidateCache === 'function') {
        BuscarService.invalidateCache();
        console.log('🔄 Cache invalidado por força');
      }
      
      const stats = await BuscarService.obterEstatisticas();
      setEstatisticas({
        totalLocais: stats.totalLocais || 0,
        totalAvaliacoes: stats.totalAvaliacoes || 0,
        mediaGeral: stats.mediaGeral || 0
      });

      const locais = await BuscarService.obterLocaisEmDestaque(12); // Aumentar para 12 no desktop
      setLocaisDestaque(locais);
      
      console.log('📊 Home carregada:', {
        locais: stats.totalLocais,
        avaliacoes: stats.totalAvaliacoes,
        destaques: locais.length,
        forcarRecarga,
        gridColumns: gridConfig.numColumns
      });
      
    } catch (e) {
      console.error('Erro ao carregar Home:', e);
      toastHelper.showError('Erro ao carregar dados da home');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [gridConfig.numColumns]);

  useEffect(() => {
    carregarDados(false, false);
  }, [carregarDados]);

  useEffect(() => {
    if (refreshKey || forceRefresh) {
      console.log('🔄 Recarregando Home devido a parâmetros:', { refreshKey, forceRefresh });
      carregarDados(false, forceRefresh === true);
    }
  }, [refreshKey, forceRefresh, carregarDados]);

  const handleRefresh = () => {
    carregarDados(true, true);
  };

  const handleLocalPress = (local) => {
    onNavigate?.('LocalDetalhes', { id: local.id });
  };

  const renderItem = ({ item, index }) => {
    // Adicionar margem lateral nos cards do desktop/tablet
    const marginLeft = (gridConfig.cardMarginHorizontal && index % gridConfig.numColumns === 0) 
      ? { marginLeft: 0 } 
      : {};
    const marginRight = (gridConfig.cardMarginHorizontal && (index + 1) % gridConfig.numColumns === 0)
      ? { marginRight: 0 }
      : {};

    return (
      <View style={[
        styles.cardWrapper,
        marginLeft,
        marginRight,
        gridConfig.cardMarginHorizontal ? { marginHorizontal: gridConfig.cardMarginHorizontal / 2 } : {}
      ]}>
        <LocalCard
          local={item}
          onPress={() => handleLocalPress(item)}
          altoContraste={isHighContrast}
          compact={cardLayout.compact}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: t.colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Spacer size="md" />
        <ThemedText>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.colors.backgroundSecondary }]}>
      <FlatList
        data={locaisDestaque}
        key={gridConfig.numColumns}
        numColumns={gridConfig.numColumns}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        columnWrapperStyle={gridConfig.columnWrapperStyle}
        contentContainerStyle={gridConfig.contentContainerStyle}
        ListHeaderComponent={
          <>
            <StatsBanner 
              totalLocais={estatisticas.totalLocais}
              totalAvaliacoes={estatisticas.totalAvaliacoes}
            />

            <View style={styles.sectionHeader}>
              <ThemedText variant="h2" weight="bold">
                Locais em Destaque
              </ThemedText>

              <TouchableOpacity onPress={() => onNavigate?.('Buscar')}>
                <ThemedText color="primary" weight="semibold">
                  Ver todos →
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[t.colors.primary]}
            tintColor={t.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText color="textSecondary" align="center">
              Nenhum local em destaque no momento.
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listContentCentralizado: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  columnWrapperDesktop: {
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  columnWrapperTablet: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardWrapper: {
    flex: 1,
    marginBottom: 12,
    minWidth: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});