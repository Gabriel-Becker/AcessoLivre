import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText, Spacer } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function CartaoMetricas({
  titulo,
  metricas = [],
  corFundo,
  corTexto = 'textOnPrimary',
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const estilos = useMemo(() => criarEstilos(t), [t]);

  return (
    <View style={[estilos.container, { backgroundColor: corFundo || t.colors.primary }, style]}>
      <ThemedText color={corTexto} weight="semibold" align="center">
        {titulo}
      </ThemedText>

      <Spacer size="md" />

      {metricas.map((metrica) => (
        <View key={metrica.legenda} style={estilos.item}>
          <ThemedText variant="h1" color={corTexto} weight="bold" align="center">
            {metrica.valor}
          </ThemedText>
          <ThemedText color={corTexto} align="center">
            {metrica.legenda}
          </ThemedText>
          <Spacer size="md" />
        </View>
      ))}
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    container: {
      borderRadius: t.borderRadius.lg,
      padding: t.spacing.lg,
      alignItems: 'center',
      ...(t.shadows.md || {}),
    },
    item: {
      alignItems: 'center',
    },
  });
}
