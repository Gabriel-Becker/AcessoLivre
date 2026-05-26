import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import theme from '../../config/theme';

export default function StatsBanner({ estatisticas = {}, totalLocais = 0, totalAvaliacoes = 0 }) {
  const { theme: t, isHighContrast } = useThemeContext();

  const locais = estatisticas?.totalLocais ?? totalLocais;
  const avaliacoes = estatisticas?.totalAvaliacoes ?? totalAvaliacoes;
  const estiloTextoAltoContraste = isHighContrast ? styles.textoAltoContraste : null;

  return (
    <View style={[styles.container, { backgroundColor: t.colors.primary }]}>
      <ThemedText variant="h1" color="textOnPrimary" weight="bold" align="center" style={estiloTextoAltoContraste}>
        Descubra Locais Acessíveis
      </ThemedText>
      <ThemedText color="textOnPrimary" align="center" style={[styles.subtitle, estiloTextoAltoContraste]}>
        Juntos construindo um mundo mais inclusivo para todos
      </ThemedText>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <ThemedText variant="h1" color="textOnPrimary" weight="bold" style={estiloTextoAltoContraste}>
            {formatNumber(locais)}
          </ThemedText>
          <ThemedText color="textOnPrimary" weight="medium" style={estiloTextoAltoContraste}>
            Locais Cadastrados
          </ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText variant="h1" color="textOnPrimary" weight="bold" style={estiloTextoAltoContraste}>
            {formatNumber(avaliacoes)}
          </ThemedText>
          <ThemedText color="textOnPrimary" weight="medium" style={estiloTextoAltoContraste}>
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
  textoAltoContraste: {
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1.5,
  },
});
