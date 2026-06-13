import React, { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';

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
import { AccessibilityContext } from '../../context/AccessibilityContext';
import VoiceService from '../../services/acessibilidade/VoiceService';
import BuscarService from '../../services/BuscarService';
import SobreService from '../../services/SobreService';
import toastHelper from '../../utils/toastHelper';

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1200,
  DESKTOP: 1400,
};

export default function Home({ onNavigate, routeParams }) {
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { enabled: voiceEnabled } = useContext(AccessibilityContext);
  const { width } = useWindowDimensions();
  const mountedRef = useRef(true);
  const processedRefreshKey = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshKey = routeParams?.refreshKey;
  const forceRefresh = routeParams?.forceRefresh;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0
  });
  const [locaisDestaque, setLocaisDestaque] = useState([]);
  const [voiceFeedbackGiven, setVoiceFeedbackGiven] = useState(false);

  const gridConfig = useMemo(() => {
    if (fontSizeMultiplier >= 1.5) {
      if (width >= BREAKPOINTS.DESKTOP) {
        return {
          numColumns: 2,
          contentContainerStyle: styles.listContent,
          columnWrapperStyle: styles.columnWrapper,
          cardWrapperStyle: styles.cardWrapperTablet,
        };
      }

      return {
        numColumns: 1,
        contentContainerStyle: styles.listContentSingleColumn,
        columnWrapperStyle: null,
        cardWrapperStyle: styles.cardWrapperSingle,
      };
    }

    if (width >= BREAKPOINTS.DESKTOP) {
      return {
        numColumns: 3,
        contentContainerStyle: styles.listContent,
        columnWrapperStyle: styles.columnWrapper,
        cardWrapperStyle: styles.cardWrapperDesktop,
      };
    }

    if (width >= BREAKPOINTS.TABLET) {
      return {
        numColumns: 2,
        contentContainerStyle: styles.listContent,
        columnWrapperStyle: styles.columnWrapper,
        cardWrapperStyle: styles.cardWrapperTablet,
      };
    }

    return {
      numColumns: 1,
      contentContainerStyle: styles.listContentSingleColumn,
      columnWrapperStyle: null,
      cardWrapperStyle: styles.cardWrapperSingle,
    };
  }, [width, fontSizeMultiplier]);

  const cardLayout = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) {
      return { compact: fontSizeMultiplier <= 1 };
    }
    return { compact: false };
  }, [width, fontSizeMultiplier]);

  const anunciarHome = useCallback(() => {
    if (!voiceEnabled) return;

    const totalLocaisMsg = estatisticas.totalLocais > 0 
      ? `Temos ${estatisticas.totalLocais} locais cadastrados.` 
      : '';
    
    const destaqueMsg = locaisDestaque.length > 0
      ? `Mostrando ${locaisDestaque.length} locais em destaque.`
      : 'Nenhum local em destaque no momento.';

    VoiceService.speak(`Bem-vindo à página inicial. ${totalLocaisMsg} ${destaqueMsg} Você pode pedir ajuda a qualquer momento.`);
  }, [voiceEnabled, estatisticas.totalLocais, locaisDestaque.length]);

  const anunciarEstatisticas = useCallback(() => {
    if (!voiceEnabled) return;
    VoiceService.speak(`Total de ${estatisticas.totalLocais} locais cadastrados e ${estatisticas.totalAvaliacoes} avaliações.`);
  }, [voiceEnabled, estatisticas.totalLocais, estatisticas.totalAvaliacoes]);

  const buscarLocalPorNome = useCallback((nomeLocal) => {
    if (!nomeLocal) return false;
    
    const localEncontrado = locaisDestaque.find(local => 
      local.nome?.toLowerCase().includes(nomeLocal.toLowerCase())
    );
    
    if (localEncontrado) {
      VoiceService.speak(`Encontrei ${localEncontrado.nome}. Abrindo detalhes.`);
      onNavigate?.('LocalDetalhes', { id: localEncontrado.id });
      return true;
    }
    
    VoiceService.speak(`Não encontrei nenhum local chamado ${nomeLocal} nos destaques.`);
    return false;
  }, [locaisDestaque, onNavigate]);

  const carregarEstatisticas = useCallback(async () => {
    try {
      const metricas = await SobreService.obterMetricasImpacto();
      if (mountedRef.current) {
        setEstatisticas({
          totalLocais: metricas.totalLocais || 0,
          totalAvaliacoes: metricas.totalAvaliacoes || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      if (mountedRef.current) {
        setEstatisticas({ totalLocais: 0, totalAvaliacoes: 0 });
      }
    }
  }, []);

  const carregarDados = useCallback(async (isRefresh = false, forcarRecarga = false) => {
    if (!mountedRef.current) return;
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (forcarRecarga && typeof BuscarService.invalidateCache === 'function') {
        BuscarService.invalidateCache();
      }
      
      await carregarEstatisticas();

      const locais = await BuscarService.obterLocaisEmDestaque(12);

      if (mountedRef.current) {
        setLocaisDestaque(locais);
      }
      
    } catch (e) {
      if (mountedRef.current) {
        toastHelper.showError('Erro ao carregar dados da home');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }

  }, 
  [carregarEstatisticas]);
  useEffect(() => {
    const precisaForcar = forceRefresh === true;
    
    if (refreshKey && processedRefreshKey.current === refreshKey) {
      return;

    }
    
    processedRefreshKey.current = refreshKey || null;
    
    carregarDados(false, precisaForcar);
  }, [refreshKey, forceRefresh, carregarDados]);

  useEffect(() => {
    if (!loading && voiceEnabled && !voiceFeedbackGiven && locaisDestaque.length > 0) {
      anunciarHome();
      setVoiceFeedbackGiven(true);
    }
  }, [loading, voiceEnabled, locaisDestaque.length, anunciarHome, voiceFeedbackGiven]);

  
  useEffect(() => {
    if (!voiceEnabled) {
      setVoiceFeedbackGiven(false);
    }
  }, [voiceEnabled]);

  const handleRefresh = () => {
    if (voiceEnabled) {
      VoiceService.speak('Atualizando a página inicial');
    }
    carregarDados(true, true);
  };

  const handleLocalPress = (local) => {
    if (voiceEnabled) {
      VoiceService.speak(`Abrindo detalhes de ${local.nome}`);
    }
    onNavigate?.('LocalDetalhes', { id: local.id });
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.cardWrapper, gridConfig.cardWrapperStyle]}>
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
              onPressStats={voiceEnabled ? anunciarEstatisticas : undefined}
            />

            <View style={styles.sectionHeader}>
              <ThemedText variant="h2" weight="bold">
                Locais em Destaque
              </ThemedText>

              <TouchableOpacity 
                onPress={() => onNavigate?.('Buscar')}
                accessibilityLabel="Ver todos os locais"
                accessibilityRole="button"
              >
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
  listContentSingleColumn: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
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
    marginBottom: 12,
    minWidth: 0,
  },
  cardWrapperDesktop: {
    width: '32%',
  },
  cardWrapperTablet: {
    width: '48.5%',
  },
  cardWrapperSingle: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});