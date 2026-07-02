import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextoTematizado } from '../commons';
import theme from '../../config/theme';

export default function BannerEstatisticas({ totalLocais = 0, totalAvaliacoes = 0 }) {
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <View style={styles.Recipiente}>
      <TextoTematizado variant="h1" color="textOnPrimary" weight="bold" align="center">
        Descubra Locais Acessíveis
      </TextoTematizado>
      <TextoTematizado color="textOnPrimary" align="center" style={styles.subtitle}>
        Juntos construindo um mundo mais inclusivo para todos
      </TextoTematizado>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <TextoTematizado variant="h1" color="textOnPrimary" weight="bold">
            {formatNumber(totalLocais)}
          </TextoTematizado>
          <TextoTematizado color="textOnPrimary" weight="medium">
            Locais Cadastrados
          </TextoTematizado>
        </View>

        <View style={styles.statCard}>
          <TextoTematizado variant="h1" color="textOnPrimary" weight="bold">
            {formatNumber(totalAvaliacoes)}
          </TextoTematizado>
          <TextoTematizado color="textOnPrimary" weight="medium">
            Avaliações
          </TextoTematizado>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius?.lg || 16,
    padding: theme.spacing?.xl || 24,
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 10,
    marginBottom: 16,
  },
  subtitle: {
    marginTop: theme.spacing?.sm || 8,
    marginBottom: theme.spacing?.xl || 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing?.lg || 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
});