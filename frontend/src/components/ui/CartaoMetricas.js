import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextoTematizado, Espacador } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function CartaoMetricas({
  titulo,
  metricas = [],
  corFundo,
  corTexto,
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = altoContraste ?? isHighContrast;
  const t = getTheme(contrasteAtivo);
  const estilos = useMemo(() => criarEstilos(t), [t]);
  const corTextoEfetiva = corTexto || (contrasteAtivo ? 'textOnAccent' : 'textOnPrimary');

  return (
    <View style={[estilos.Recipiente, { backgroundColor: corFundo || t.colors.primary }, style]}>
      <TextoTematizado color={corTextoEfetiva} weight="semibold" align="center">
        {titulo}
      </TextoTematizado>

      <Espacador size="md" />

      {metricas.map((metrica) => (
        <View key={metrica.legenda} style={estilos.item}>
          <TextoTematizado variant="h1" color={corTextoEfetiva} weight="bold" align="center">
            {metrica.valor}
          </TextoTematizado>
          <TextoTematizado color={corTextoEfetiva} align="center">
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
