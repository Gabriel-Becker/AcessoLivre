import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { ThemedText, Spacer } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function CardInfoIcone({
  titulo,
  icone,
  corIcone,
  corFundoIcone,
  tamanhoIcone = 18,
  tamanhoBadge = 32,
  fundo,
  layout = 'linha',
  centralizado = false,
  children,
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const contraste = altoContraste ?? isHighContrast;
  const t = getTheme(contraste);
  const estilos = useMemo(() => criarEstilos(t, contraste, layout, centralizado), [t, contraste, layout, centralizado]);

  return (
    <Card style={[estilos.card, fundo ? { backgroundColor: fundo } : null, style]} altoContraste={contraste}>
      <View style={estilos.cabecalho}>
        <View
          style={[
            estilos.badge,
            {
              backgroundColor: corFundoIcone || t.colors.backgroundSecondary,
              width: tamanhoBadge,
              height: tamanhoBadge,
              borderRadius: tamanhoBadge / 2,
            },
          ]}
        >
          <Ionicons name={icone} size={tamanhoIcone} color={corIcone || t.colors.primary} />
        </View>
        <ThemedText weight="semibold" align={centralizado ? 'center' : 'left'}>
          {titulo}
        </ThemedText>
      </View>

      <Spacer size="sm" />

      {children}
    </Card>
  );
}

function criarEstilos(t, contraste, layout, centralizado) {
  const emColuna = layout === 'coluna';

  return StyleSheet.create({
    card: {
      padding: t.spacing.lg,
      borderColor: contraste ? t.colors.border : t.colors.borderLight,
      borderWidth: contraste ? 2 : 1,
      ...(contraste ? t.shadows.none : t.shadows.md),
    },
    cabecalho: {
      flexDirection: emColuna ? 'column' : 'row',
      alignItems: emColuna || centralizado ? 'center' : 'flex-start',
      gap: t.spacing.sm,
    },
    badge: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
