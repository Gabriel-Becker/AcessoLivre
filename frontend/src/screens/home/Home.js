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

export default function Home({ onNavigate }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0,
    mediaGeral: 0
  });
  const [locaisDestaque, setLocaisDestaque] = useState([]);

  const numColumns = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) return 4;
    if (width >= BREAKPOINTS.TABLET) return 3;
    if (width >= BREAKPOINTS.MOBILE) return 2;
    return 1;
  }, [width]);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Carregar estatísticas (locais e avaliações)
      const stats = await BuscarService.obterEstatisticas();
      setEstatisticas({
        totalLocais: stats.totalLocais || 0,
        totalAvaliacoes: stats.totalAvaliacoes || 0,
        mediaGeral: stats.mediaGeral || 0
      });

      // Carregar locais em destaque
      const locais = await BuscarService.obterLocaisEmDestaque(8);
      setLocaisDestaque(locais.filter(l => l?.id));
      
    } catch (e) {
      console.error('Erro ao carregar Home:', e);
      toastHelper.showError('Erro ao carregar dados da home');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleRefresh = () => {
    carregarDados(true);
  };

  const handleLocalPress = (local) => {
    onNavigate?.('LocalDetalhes', { id: local.id });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <LocalCard
        local={item}
        onPress={() => handleLocalPress(item)}
        altoContraste={isHighContrast}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Spacer size="md" />
        <ThemedText>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
      <FlatList
        data={locaisDestaque}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
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
        contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 10,
    paddingBottom: 20,
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
    minWidth: 260,
    maxWidth: 400,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});