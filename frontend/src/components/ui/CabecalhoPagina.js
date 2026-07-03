import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextoTematizado, Espacador } from '../commons';
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
  permitirEscalaFonte = true,
}) {
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = altoContraste ?? isHighContrast;
  const t = getTheme(contrasteAtivo);
  const corPrincipal = contrasteAtivo ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = contrasteAtivo ? 'textOnPrimary' : 'textSecondary';

  const estilos = useMemo(() => criarEstilos(t), [t]);

  const showBack = Boolean(onVoltar);
  const hasRight = Boolean(acaoDireita);

  return (
    <View style={[estilos.Recipiente, style]}>
      {onVoltar ? (
        <Pressable
          onPress={onVoltar}
          style={estilos.botaoVoltar}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color={t.colors.textPrimary} />
          <TextoTematizado
            style={estilos.textoVoltar}
            weight="medium"
            altoContraste={contrasteAtivo}
            color={corPrincipal}
            permitirEscalaFonte={permitirEscalaFonte}
          >
            {textoVoltar}
          </TextoTematizado>
        </Pressable>
      ) : (
        <View style={estilos.espacoVoltar} />
      )}

      <View style={[estilos.textos, !showBack && !hasRight ? estilos.textosCenter : null]}>
        <TextoTematizado
          variant="h1"
          weight="bold"
          altoContraste={contrasteAtivo}
          color={corPrincipal}
          numberOfLines={1}
          ellipsizeMode="tail"
          adjustsFontSizeToFit={permitirEscalaFonte}
          minimumFontScale={permitirEscalaFonte ? 0.85 : undefined}
          permitirEscalaFonte={permitirEscalaFonte}
          style={estilos.titulo}
        >
          {titulo}
        </TextoTematizado>
        {subtitulo ? (
          <>
            <Espacador size="xs" />
            <TextoTematizado
              altoContraste={contrasteAtivo}
              color={corSecundaria}
              permitirEscalaFonte={permitirEscalaFonte}
            >
              {subtitulo}
            </TextoTematizado>
          </>
        ) : null}
      </View>

      <View style={estilos.acaoDireita}>{acaoDireita}</View>
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    Recipiente: {
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
      minWidth: 0,
    },
    titulo: {
      flexShrink: 1,
    },
    acaoDireita: {
      minWidth: 40,
      alignItems: 'flex-end',
    },
    textosCenter: {
      alignItems: 'center',
    },
  });
}
