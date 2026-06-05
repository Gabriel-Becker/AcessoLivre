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

const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 1000,
  DESKTOP: 1400
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

  const layoutDestaques = useMemo(() => {
    if (fontSizeMultiplier >= 2) {
      return {
        numColumns: 1,
        cardMaxWidth: 980,
        cardFlexBasis: '100%',
        centralizarCards: true,
        usarWrapperCentralizado: false,
      };
    }

    if (fontSizeMultiplier >= 1.5) {
      return {
        numColumns: 2,
        cardMaxWidth: 760,
        cardFlexBasis: '49%',
        centralizarCards: true,
        usarWrapperCentralizado: true,
      };
    }

    if (width >= BREAKPOINTS.DESKTOP) {
      return {
        numColumns: 4,
        cardMaxWidth: 400,
        cardFlexBasis: '24%',
        centralizarCards: false,
        usarWrapperCentralizado: false,
      };
    }

    if (width >= BREAKPOINTS.TABLET) {
      return {
        numColumns: 3,
        cardMaxWidth: 460,
        cardFlexBasis: '32%',
        centralizarCards: false,
        usarWrapperCentralizado: false,
      };
    }

    if (width >= BREAKPOINTS.MOBILE) {
      return {
        numColumns: 2,
        cardMaxWidth: 560,
        cardFlexBasis: '48%',
        centralizarCards: false,
        usarWrapperCentralizado: false,
      };
    }

    return {
      numColumns: 1,
      cardMaxWidth: 840,
      cardFlexBasis: '100%',
      centralizarCards: true,
      usarWrapperCentralizado: false,
    };
  }, [width, fontSizeMultiplier]);

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

      // O BuscarService.obterLocaisEmDestaque já retorna com isMaisRecente
      const locais = await BuscarService.obterLocaisEmDestaque(8);
      setLocaisDestaque(locais);
      
      console.log('📊 Home carregada:', {
        locais: stats.totalLocais,
        avaliacoes: stats.totalAvaliacoes,
        destaques: locais.length,
        forcarRecarga
      });
      
    } catch (e) {
      console.error('Erro ao carregar Home:', e);
      toastHelper.showError('Erro ao carregar dados da home');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.cardWrapper,
        {
          maxWidth: layoutDestaques.cardMaxWidth,
          flexBasis: layoutDestaques.cardFlexBasis,
        },
        layoutDestaques.numColumns === 1 ? styles.cardWrapperCentralizado : null,
      ]}
    >
      <LocalCard
        local={item}
        onPress={() => handleLocalPress(item)}
        altoContraste={isHighContrast}
      />
    </View>
  );

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
        key={layoutDestaques.numColumns}
        numColumns={layoutDestaques.numColumns}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        columnWrapperStyle={layoutDestaques.usarWrapperCentralizado ? styles.columnWrapperCentralizado : undefined}
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
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: t.layout?.mobile?.pageHorizontal ?? 10, paddingBottom: t.layout?.mobile?.pageVertical ?? 20 },
        ]}
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
    paddingBottom: 20,
  },
  columnWrapperCentralizado: {
    justifyContent: 'center',
    gap: 12,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardWrapper: {
    flex: 1,
    padding: 6,
    minWidth: 0,
    width: '100%',
  },
  cardWrapperCentralizado: {
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});