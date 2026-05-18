import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  FlatList,
  useWindowDimensions
} from 'react-native';

import { StatsBanner, LocalCard, Button } from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import HomeService from '../../services/HomeService';
import toastHelper from '../../utils/toastHelper';

const DEFAULT_NUM_COLUMNS = 1;
const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 1000,
  DESKTOP: 1400
};
const LOCAIS_POR_TELA = 8;

export default function Home({ onNavigate }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ 
    totalLocais: 0, 
    totalAvaliacoes: 0,
    totalUsuarios: 0 
  });
  const [locaisDestaque, setLocaisDestaque] = useState([]);
  const [error, setError] = useState(null);

  const numColumns = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) return 4;
    if (width >= BREAKPOINTS.TABLET) return 3;
    if (width >= BREAKPOINTS.MOBILE) return 2;
    return DEFAULT_NUM_COLUMNS;
  }, [width]);

  const getItemKey = useCallback((item, index) => {
    if (item?.id) return `local_${item.id}`;
    console.warn(`⚠️ Home: Item sem ID válido no índice ${index}`, item);
    return `fallback_${index}_${Date.now()}`;
  }, []);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      console.log('🏠 Home: Buscando dados do backend...');

      const [stats, locais] = await Promise.all([
        HomeService.obterEstatisticas(),
        HomeService.obterLocaisEmDestaque(LOCAIS_POR_TELA),
      ]);

      console.log('📦 Locais recebidos:', locais?.length || 0);

      if (locais && locais.length > 0) {
        console.log('📦 Primeiro local:', JSON.stringify(locais[0], null, 2));
        console.log('📦 Imagens do primeiro local:', locais[0]?.imagens?.length || 0);
        console.log('📦 URL da primeira imagem (imagemUrl):', locais[0]?.imagemUrl);
        console.log('📦 Lista de imagens:', locais[0]?.imagens);
      }

      const sanitizedLocais = locais.filter(local => local && local.id);

      setEstatisticas(stats);
      setLocaisDestaque(sanitizedLocais);

    } catch (erro) {
      console.error('❌ Home: Erro ao carregar dados:', erro);
      setError('Não foi possível carregar os dados. Verifique sua conexão.');
      toastHelper.showError('Erro ao carregar página inicial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleRefresh = useCallback(() => carregarDados(true), [carregarDados]);
  
  const handleVerTodos = useCallback(() => {
    onNavigate?.('Buscar');
  }, [onNavigate]);

  const handleLocalPress = useCallback((local) => {
    if (!local?.id) {
      toastHelper.showError('Erro ao abrir local');
      return;
    }
    onNavigate?.('LocalDetalhes', { id: local.id });
  }, [onNavigate]);

  const renderItem = useCallback(({ item, index }) => (
    <View style={styles.cardWrapper}>
      <LocalCard
        local={item}
        onPress={() => handleLocalPress(item)}
        showNewBadge={index === 0 && numColumns === DEFAULT_NUM_COLUMNS}
        altoContraste={isHighContrast}
      />
    </View>
  ), [handleLocalPress, isHighContrast, numColumns]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t.colors.background }]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary" altoContraste={isHighContrast}>
          Carregando locais...
        </ThemedText>
      </View>
    );
  }

  if (error && locaisDestaque.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: t.colors.background }]}>
        <ThemedText color="error" align="center" altoContraste={isHighContrast}>
          {error}
        </ThemedText>
        <Spacer size="md" />
        <Button
          variant="primary"
          onPress={() => carregarDados()}
          iconLeft="refresh-outline"
          altoContraste={isHighContrast}
        >
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <FlatList
        data={locaisDestaque}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[t.colors.primary]}
            tintColor={t.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    minWidth: 260,
    maxWidth: 400,
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
});