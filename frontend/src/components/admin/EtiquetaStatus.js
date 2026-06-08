import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function EtiquetaStatus({
  texto,
  tipo = 'neutro',
  altoContraste,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);

  const estilos = criarEstilos(t);
  const corFundo = obterCorFundo(tipo, t);
  const corTexto = obterCorTexto(tipo, t);

  return (
    <View style={[estilos.container, { backgroundColor: corFundo, borderColor: corTexto }]}>
      <ThemedText size="xs" weight="bold" align="center" style={{ color: corTexto }}>
        {texto}
      </ThemedText>
    </View>
  );
}

function obterCorFundo(tipo, t) {
  switch (tipo) {
    case 'sucesso':
      return t.colors.secondary;
    case 'perigo':
      return t.colors.error;
    case 'aviso':
      return t.colors.warning;
    case 'info':
      return t.colors.info;
    case 'neutro':
    default:
      return t.colors.backgroundTertiary;
  }
}

function obterCorTexto(tipo, t) {
  switch (tipo) {
    case 'sucesso':
    case 'perigo':
    case 'info':
      return t.colors.textOnPrimary;
    case 'aviso':
      return t.colors.textPrimary;
    case 'neutro':
    default:
      return t.colors.textPrimary;
  }
}

function criarEstilos(t) {
  return StyleSheet.create({
    container: {
      alignSelf: 'flex-start',
      borderRadius: t.borderRadius.full,
      borderWidth: 1,
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 6,
      minWidth: 92,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}