import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function CabecalhoPagina({
  titulo,
  subtitulo,
  onVoltar,
  textoVoltar = 'Voltar',
  acaoDireita,
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);

  const estilos = useMemo(() => criarEstilos(t), [t]);

  return (
    <View style={[estilos.container, style]}>
      {onVoltar ? (
        <Pressable
          onPress={onVoltar}
          style={estilos.botaoVoltar}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color={t.colors.textPrimary} />
          <ThemedText style={estilos.textoVoltar} weight="medium">
            {textoVoltar}
          </ThemedText>
        </Pressable>
      ) : (
        <View style={estilos.espacoVoltar} />
      )}

      <View style={estilos.textos}>
        <ThemedText variant="h1" weight="bold">
          {titulo}
        </ThemedText>
        {subtitulo ? (
          <>
            <Spacer size="xs" />
            <ThemedText color="textSecondary">{subtitulo}</ThemedText>
          </>
        ) : null}
      </View>

      <View style={estilos.acaoDireita}>{acaoDireita}</View>
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      marginBottom: t.spacing.xl,
    },
    botaoVoltar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.xs,
      paddingHorizontal: t.spacing.sm,
      paddingVertical: t.spacing.xs,
      borderRadius: t.borderRadius.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderLight,
    },
    textoVoltar: {
      marginLeft: t.spacing.xs,
    },
    espacoVoltar: {
      width: 96,
    },
    textos: {
      flex: 1,
    },
    acaoDireita: {
      minWidth: 40,
      alignItems: 'flex-end',
    },
  });
}
