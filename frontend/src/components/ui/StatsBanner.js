import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../commons';
import theme from '../../config/theme';

export default function StatsBanner({ totalLocais = 0, totalAvaliacoes = 0 }) {
  return (
    <View style={styles.container}>
      <ThemedText variant="h1" color="textOnPrimary" weight="bold" align="center">
        Descubra Locais Acessíveis
      </ThemedText>
      <ThemedText color="textOnPrimary" align="center" style={styles.subtitle}>
        Juntos construindo um mundo mais inclusivo para todos
      </ThemedText>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <ThemedText variant="h1" color="textOnPrimary" weight="bold">
            {formatNumber(totalLocais)}
          </ThemedText>
          <ThemedText color="textOnPrimary" weight="medium">
            Locais Cadastrados
          </ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText variant="h1" color="textOnPrimary" weight="bold">
            {formatNumber(totalAvaliacoes)}
          </ThemedText>
          <ThemedText color="textOnPrimary" weight="medium">
            Avaliações
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
});
