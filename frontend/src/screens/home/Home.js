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

// Constantes para melhor manutenibilidade
const DEFAULT_NUM_COLUMNS = 1;
const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 1000,
  DESKTOP: 1400
};
const LOCAIS_POR_TELA = 8;

export default function Home({ navigation }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();

  // Estados centralizados
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ 
    totalLocais: 0, 
    totalAvaliacoes: 0,
    totalUsuarios: 0 
  });
  const [locaisDestaque, setLocaisDestaque] = useState([]);
  const [error, setError] = useState(null);

  // ✅ CORREÇÃO 1: useMemo para número de colunas
  const numColumns = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) return 4;
    if (width >= BREAKPOINTS.TABLET) return 3;
    if (width >= BREAKPOINTS.MOBILE) return 2;
    return DEFAULT_NUM_COLUMNS;
  }, [width]);

  // ✅ CORREÇÃO 2: keyExtractor robusto com fallback
  const getItemKey = useCallback((item, index) => {
    // Prioridade: id -> localId -> fallback com índice
    if (item?.id) return `local_${item.id}`;
    if (item?.localId) {
      console.warn(`⚠️ Home: Item usando 'localId' em vez de 'id': ${item.localId}`);
      return `local_${item.localId}`;
    }
    console.warn(`⚠️ Home: Item sem ID válido no índice ${index}`, item);
    return `fallback_${index}_${Date.now()}`;
  }, []);

  // Função de carregamento de dados isolada
  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🏠 Home: Buscando dados do backend...');

      const [stats, locais] = await Promise.all([
        HomeService.obterEstatisticas(),
        HomeService.obterLocaisEmDestaque(LOCAIS_POR_TELA),
      ]);

      // ✅ Sanitiza os dados antes de setar no estado
      const sanitizedLocais = locais.filter(local => local && (local.id || local.localId));
      
      if (sanitizedLocais.length !== locais.length) {
        console.warn(`⚠️ Home: ${locais.length - sanitizedLocais.length} locais foram filtrados por falta de ID`);
      }

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

  // Efeito de montagem e foco
  useEffect(() => {
    carregarDados();

    const unsubscribe = navigation?.addListener?.('focus', () => {
      carregarDados(true); // Refresh silencioso ao focar
    });

    return unsubscribe;
  }, [carregarDados, navigation]);

  // Handlers memoizados
  const handleRefresh = useCallback(() => carregarDados(true), [carregarDados]);
  
  const handleVerTodos = useCallback(() => {
    navigation?.navigate?.('Buscar');
  }, [navigation]);

  const handleLocalPress = useCallback((local) => {
    if (!local?.id && !local?.localId) {
      console.error('❌ Home: Tentativa de navegar sem ID', local);
      toastHelper.showError('Erro ao abrir local');
      return;
    }
    const localId = local.id || local.localId;
    navigation?.navigate?.('LocalDetalhes', { id: localId });
  }, [navigation]);

  // ✅ Componentes de layout (sem memoização desnecessária)
  const renderBannerFixo = () => (
    <View style={styles.bannerContainer}>
      <StatsBanner
        totalLocais={estatisticas.totalLocais}
        totalAvaliacoes={estatisticas.totalAvaliacoes}
        altoContraste={isHighContrast}
      />
    </View>
  );

  const renderCabecalhoFixoSecao = () => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <ThemedText variant="h2" weight="bold" altoContraste={isHighContrast}>
          Locais em Destaque
        </ThemedText>

        <ThemedText color="textSecondary" altoContraste={isHighContrast}>
          {locaisDestaque.length > 0
            ? `Conheça os ${locaisDestaque.length} locais mais recentes`
            : 'Seja o primeiro a cadastrar um local'}
        </ThemedText>
      </View>

      {locaisDestaque.length > 0 && (
        <TouchableOpacity onPress={handleVerTodos}>
          <ThemedText color="primary" weight="semibold" altoContraste={isHighContrast}>
            Ver Todos →
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  // ✅ renderItem memoizado para performance
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

  // ✅ Empty state memoizado
  const renderEmptyState = useCallback(() => (
    <View style={[styles.emptyState, { backgroundColor: t.colors.surface }]}>
      <ThemedText variant="h3" weight="bold" align="center" altoContraste={isHighContrast}>
        Nenhum local cadastrado ainda
      </ThemedText>

      <Spacer size="sm" />

      <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
        Seja o primeiro da comunidade a cadastrar um local acessível!
      </ThemedText>
    </View>
  ), [isHighContrast, t.colors.surface]);

  // Estados de loading e error
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

  // ✅ LAYOUT CORRIGIDO: Banner fixo + FlatList com scroll apenas nos cards
  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Parte fixa (não rola) */}
      {renderBannerFixo()}
      {renderCabecalhoFixoSecao()}

      {/* Apenas os cards têm scroll vertical */}
      <FlatList
        data={locaisDestaque}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          locaisDestaque.length === 0 && styles.emptyFlatListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[t.colors.primary]}
            tintColor={t.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={4}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </View>
  );
}

// ✅ Estilos refatorados com melhor organização
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Banner fixo
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  
  // Cabeçalho da seção fixo
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: 'wrap',
    gap: 12,
  },
  
  sectionHeaderText: {
    flex: 1,
  },
  
  // FlatList com scroll vertical
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  
  emptyFlatListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    minWidth: 260,
    maxWidth: 400,
  },
  
  // Estados visuais
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
  
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 16,
  },
});