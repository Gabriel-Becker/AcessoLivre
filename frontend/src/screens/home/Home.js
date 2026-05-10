import React, { useState, useEffect, useCallback } from 'react';
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

export default function Home({ navigation }) {
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

  // ✅ Corrigido: agora sempre retorna valor
  const getNumColumns = useCallback(() => {
    if (width >= 1400) return 4;
    if (width >= 1000) return 3;
    if (width >= 600) return 2;
    return 1;
  }, [width]);

  const numColumns = getNumColumns();

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      console.log('🏠 Home: Buscando dados do backend...');

      const [stats, locais] = await Promise.all([
        HomeService.obterEstatisticas(),
        HomeService.obterLocaisEmDestaque(8),
      ]);

      setEstatisticas(stats);
      setLocaisDestaque(locais);
    } catch (erro) {
      console.error('❌ Home: Erro ao carregar dados:', erro);
      setError('Não foi possível carregar os dados.');
      toastHelper.showError('Erro ao carregar página inicial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();

    const unsubscribe = navigation?.addListener?.('focus', () => {
      carregarDados();
    });

    return unsubscribe;
  }, [carregarDados, navigation]);

  const handleRefresh = () => carregarDados(true);

  const handleVerTodos = () => {
    navigation?.navigate?.('Buscar');
  };

  const handleLocalPress = (local) => {
    navigation?.navigate?.('LocalDetalhes', { id: local.id });
  };

  // ✅ Header
  const renderHeader = () => (
    <>
      <StatsBanner
        totalLocais={estatisticas.totalLocais}
        totalAvaliacoes={estatisticas.totalAvaliacoes}
        altoContraste={isHighContrast}
      />

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
    </>
  );

  // ✅ Footer
  const renderFooter = () => (
    <>
      {estatisticas.totalLocais > 0 && (
        <View style={styles.footerInfo}>
          <ThemedText
            color="textTertiary"
            variant="caption"
            align="center"
            altoContraste={isHighContrast}
          >
            Total de {estatisticas.totalLocais} local(is)
          </ThemedText>
        </View>
      )}
      <Spacer size="xl" />
    </>
  );

  // ✅ Empty State (a causa do crash)
  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: t.colors.surface }]}>
      <ThemedText variant="h3" weight="bold" align="center" altoContraste={isHighContrast}>
        Nenhum local cadastrado ainda
      </ThemedText>

      <Spacer size="sm" />

      <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
        Seja o primeiro da comunidade a cadastrar um local acessível!
      </ThemedText>

      {isAuthenticated && (
        <>
          <Spacer size="md" />
          <Button
            variant="primary"
            onPress={() => navigation?.navigate?.('CadastrarLocal')}
            iconLeft="add-outline"
            altoContraste={isHighContrast}
          >
            Cadastrar local
          </Button>
        </>
      )}
    </View>
  );

  // Loading
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

  // Erro
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
    <FlatList
      data={locaisDestaque}
      key={numColumns}
      numColumns={numColumns}
      keyExtractor={(item) => item.id?.toString() || item.localId?.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scroll,
        { backgroundColor: t.colors.background },
        locaisDestaque.length === 0 && styles.emptyContainer
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[t.colors.primary]}
          tintColor={t.colors.primary}
        />
      }
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyState}
      renderItem={({ item, index }) => (
        <View style={styles.cardWrapper}>
          <LocalCard
            local={item}
            onPress={() => handleLocalPress(item)}
            showNewBadge={index === 0 && numColumns === 1}
            altoContraste={isHighContrast}
          />
        </View>
      )}
      initialNumToRender={4}
      maxToRenderPerBatch={8}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    minWidth: 260,
    maxWidth: 400,
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  footerInfo: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
  },
});