import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextoTematizado } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function BannerEstatisticas({ totalLocais = 0, totalAvaliacoes = 0 }) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(isHighContrast);
  const corTextoDestaque = isHighContrast ? 'textOnAccent' : 'textOnPrimary';
  const styles = criarEstilos(t);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <View style={styles.Recipiente}>
      <TextoTematizado variant="h1" color={corTextoDestaque} weight="bold" align="center">
        Descubra Locais Acessíveis
      </TextoTematizado>
      <TextoTematizado color={corTextoDestaque} align="center" style={styles.subtitle}>
        Juntos construindo um mundo mais inclusivo para todos
      </TextoTematizado>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <TextoTematizado variant="h1" color={corTextoDestaque} weight="bold">
            {formatNumber(totalLocais)}
          </TextoTematizado>
          <TextoTematizado color={corTextoDestaque} weight="medium">
            Locais Cadastrados
          </TextoTematizado>
        </View>

        <View style={styles.statCard}>
          <TextoTematizado variant="h1" color={corTextoDestaque} weight="bold">
            {formatNumber(totalAvaliacoes)}
          </TextoTematizado>
          <TextoTematizado color={corTextoDestaque} weight="medium">
            Avaliações
          </TextoTematizado>
        </View>
      </View>
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    Recipiente: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius?.lg || 16,
      padding: t.spacing?.xl || 24,
      width: '100%',
      alignSelf: 'stretch',
      marginTop: 10,
      marginBottom: 16,
    },
    subtitle: {
      marginTop: t.spacing?.sm || 8,
      marginBottom: t.spacing?.xl || 24,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: t.spacing?.lg || 16,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
    },
  });
}