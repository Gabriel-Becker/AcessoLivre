import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextoTematizado, Espacador } from '../commons';
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
    <View style={[estilos.Recipiente, { backgroundColor: corFundo || t.colors.primary }, style]}>
      <TextoTematizado color={corTexto} weight="semibold" align="center">
        {titulo}
      </TextoTematizado>

      <Espacador size="md" />

      {metricas.map((metrica) => (
        <View key={metrica.legenda} style={estilos.item}>
          <TextoTematizado variant="h1" color={corTexto} weight="bold" align="center">
            {metrica.valor}
          </TextoTematizado>
          <TextoTematizado color={corTexto} align="center">
            {metrica.legenda}
          </TextoTematizado>
          <Espacador size="md" />
        </View>
      ))}
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    Recipiente: {
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
