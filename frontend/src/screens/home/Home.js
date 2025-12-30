import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatsBanner, LocalCard } from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import LocalService from '../../services/LocalService';
import theme from '../../config/theme';

export default function Home({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({ totalLocais: 0, totalAvaliacoes: 0 });
  const [locaisDestaque, setLocaisDestaque] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [stats, locais] = await Promise.all([
        LocalService.obterEstatisticas(),
        LocalService.obterLocaisEmDestaque(4),
      ]);

      setEstatisticas(stats);
      setLocaisDestaque(locais);
    } catch (erro) {
      console.error('Erro ao carregar dados da home:', erro);
    } finally {
      setLoading(false);
    }
  };

  const handleVerTodos = () => {
    navigation?.navigate?.('Buscar');
  };

  const handleLocalPress = (local) => {
    navigation?.navigate?.('LocalDetalhes', { id: local.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary">Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <StatsBanner
        totalLocais={estatisticas.totalLocais}
        totalAvaliacoes={estatisticas.totalAvaliacoes}
      />

      <View style={styles.sectionHeader}>
        <View>
          <ThemedText variant="h2" weight="bold">
            Locais em Destaque
          </ThemedText>
          <ThemedText color="textSecondary">
            Avaliados recentemente pela comunidade
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleVerTodos}>
          <ThemedText color="primary" weight="semibold">
            Ver Todos
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.locaisGrid}>
        {locaisDestaque.length > 0 ? (
          locaisDestaque.map((local, index) => (
            <LocalCard
              key={local.id}
              local={local}
              onPress={() => handleLocalPress(local)}
              showNewBadge={index === 1}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <ThemedText color="textSecondary" align="center">
              Nenhum local cadastrado ainda.
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  locaisGrid: {
    gap: theme.spacing.md,
  },
  emptyState: {
    paddingVertical: theme.spacing.xl,
  },
});
