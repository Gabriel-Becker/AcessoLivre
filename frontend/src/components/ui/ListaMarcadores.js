import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextoTematizado } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function ListaMarcadores({
  itens = [],
  corMarcador,
  corTexto = 'textSecondary',
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const estilos = useMemo(() => criarEstilos(t), [t]);

  return (
    <View style={[estilos.Recipiente, style]}>
      {itens.map((texto) => (
        <View key={texto} style={estilos.item}>
          <View style={estilos.marcadorWrapper}>
            <View style={[estilos.marcador, { backgroundColor: corMarcador || t.colors.primary }]} />
          </View>
          <TextoTematizado color={corTexto} style={estilos.texto}>
            {texto}
          </TextoTematizado>
        </View>
      ))}
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    Recipiente: {
      gap: t.spacing.sm,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    marcadorWrapper: {
      width: 16,
      alignItems: 'center',
      marginTop: 6,
    },
    marcador: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    texto: {
      flex: 1,
    },
  });
}
