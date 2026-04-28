import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
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
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ 
    totalLocais: 0, 
    totalAvaliacoes: 0,
    totalUsuarios: 0 
  });
  const [locaisDestaque, setLocaisDestaque] = useState([]);
  const [error, setError] = useState(null);


  const carregarDados = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log(' Home: Buscando dados do backend...');
      
      const [stats, locais] = await Promise.all([
        HomeService.obterEstatisticas(),
        HomeService.obterLocaisEmDestaque(4),
      ]);

      console.log(`📊 Home: ${stats.totalLocais} locais cadastrados`);
      console.log(`📋 Home: ${locais.length} locais em destaque`);

      setEstatisticas(stats);
      setLocaisDestaque(locais);
    } catch (erro) {
      console.error('❌ Home: Erro ao carregar dados:', erro);
      setError('Não foi possível carregar os dados. Tente novamente.');
      toastHelper.showError('Erro ao carregar página inicial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  
  useEffect(() => {
    carregarDados();
    
    const unsubscribe = navigation?.addListener?.('focus', () => {
      console.log(' Home: Tela em foco, recarregando dados...');
      carregarDados();
    });
    
    return unsubscribe;
  }, [carregarDados, navigation]);

  // Pull-to-refresh
  const handleRefresh = () => {
    carregarDados(true);
  };

  // Navegar para tela de busca
  const handleVerTodos = () => {
    navigation?.navigate?.('Buscar');
  };

  // Navegar para detalhes do local
  const handleLocalPress = (local) => {
    navigation?.navigate?.('LocalDetalhes', { id: local.id });
  };

  // Navegar para cadastro de local
  const handleAdicionarLocal = () => {
    if (navigation?.navigate) {
      navigation.navigate('Adicionar');
    }
  };

  // Tela de loading
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

  // Tela de erro
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
    <ScrollView
      contentContainerStyle={[styles.scroll, { backgroundColor: t.colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[t.colors.primary]}
          tintColor={t.colors.primary}
        />
      }
    >
      {/* Banner com estatísticas */}
      <StatsBanner
        totalLocais={estatisticas.totalLocais}
        totalAvaliacoes={estatisticas.totalAvaliacoes}
        altoContraste={isHighContrast}
      />

      {/* Seção de Locais em Destaque */}
      <View style={styles.sectionHeader}>
        <View>
          <ThemedText variant="h2" weight="bold" altoContraste={isHighContrast}>
            Locais em Destaque
          </ThemedText>
          <ThemedText color="textSecondary" altoContraste={isHighContrast}>
            {locaisDestaque.length > 0 
              ? 'Conheça os locais mais recentes da comunidade' 
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

      {/* Grid de Cards com Locais */}
      <View style={styles.locaisGrid}>
        {locaisDestaque.length > 0 ? (
          locaisDestaque.map((local, index) => (
            <LocalCard
              key={local.id}
              local={local}
              onPress={() => handleLocalPress(local)}
              showNewBadge={index === 0} // Mostra "Novo" no primeiro item
              altoContraste={isHighContrast}
            />
          ))
        ) : (
          // Estado vazio - incentiva o usuário a cadastrar
          <View style={[styles.emptyState, { backgroundColor: t.colors.surfaceSecondary }]}>
            <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
              Nenhum local cadastrado ainda.
            </ThemedText>
            <Spacer size="md" />
            <Button 
              variant="primary" 
              onPress={handleAdicionarLocal}
              iconLeft="add-outline"
              altoContraste={isHighContrast}
            >
              Cadastrar primeiro local
            </Button>
          </View>
        )}
      </View>

      {/* Rodapé com total de locais */}
      {estatisticas.totalLocais > 0 && (
        <View style={styles.footerInfo}>
          <ThemedText color="textTertiary" variant="caption" align="center" altoContraste={isHighContrast}>
            Total de {estatisticas.totalLocais} local(is) cadastrado(s)
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  },
  locaisGrid: {
    gap: 16,
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerInfo: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
  },
});