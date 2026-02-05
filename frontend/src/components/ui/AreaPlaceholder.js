import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function AreaPlaceholder({
  icone,
  titulo,
  subtitulo,
  alturaMinima,
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const estilos = useMemo(() => criarEstilos(t), [t]);

  return (
    <View style={[estilos.container, alturaMinima ? { minHeight: alturaMinima } : null, style]}>
      <Ionicons name={icone} size={32} color={t.colors.textTertiary} />
      <Spacer size="xs" />
      <ThemedText weight="semibold" align="center">
        {titulo}
      </ThemedText>
      {subtitulo ? (
        <ThemedText color="textTertiary" variant="caption" align="center">
          {subtitulo}
        </ThemedText>
      ) : null}
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor: t.colors.borderLight,
      borderStyle: 'dashed',
      borderRadius: t.borderRadius.lg,
      paddingVertical: t.spacing.xl,
      paddingHorizontal: t.spacing.lg,
      alignItems: 'center',
      backgroundColor: t.colors.surfaceSecondary,
    },
  });
}
