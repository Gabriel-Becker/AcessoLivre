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
import HomeService from '../../services/HomeService';
import toastHelper from '../../utils/toastHelper';
import theme, { breakpoints } from '../../config/theme';

const BREAKPOINT_DESKTOP_GRANDE = 1360;

export default function Home({ onNavigate }) {
  const { isHighContrast, theme: t } = useThemeContext(); // ✅ Corrigido!
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({});
  const [locaisDestaque, setLocaisDestaque] = useState([]);

  const numColumns = useMemo(() => {
    if (width >= BREAKPOINT_DESKTOP_GRANDE) return 4;
    if (width >= breakpoints.desktop) return 3;
    if (width >= breakpoints.tablet) return 2;
    return 1;
  }, [width]);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [stats, locais] = await Promise.all([
        HomeService.obterEstatisticas(),
        HomeService.obterLocaisEmDestaque(8),
      ]);

      setEstatisticas(stats);
      setLocaisDestaque(locais.filter(l => l?.id));
    } catch (e) {
      toastHelper.showError('Erro ao carregar Home');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <LocalCard
        local={item}
        onPress={() => onNavigate?.('LocalDetalhes', { id: item.id })}
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
      <View style={styles.fixedContainer}>
        <StatsBanner
          estatisticas={estatisticas}
          altoContraste={isHighContrast}
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
      </View>

      <FlatList
        data={locaisDestaque}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarDados(true)}
            colors={[t.colors.primary]}
            tintColor={t.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  fixedContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },

  sectionHeader: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },

  cardWrapper: {
    flex: 1,
    padding: theme.spacing.sm,
    minWidth: 260,
    maxWidth: 400,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});