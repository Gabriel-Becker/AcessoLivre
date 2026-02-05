import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { ThemedText, Spacer } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function CardSecao({
  titulo,
  descricao,
  icone,
  corIcone,
  corFundoIcone,
  children,
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const estilos = useMemo(() => criarEstilos(t, altoContraste ?? isHighContrast), [t, altoContraste, isHighContrast]);

  return (
    <Card style={[estilos.card, style]} altoContraste={altoContraste ?? isHighContrast}>
      <View style={estilos.cabecalho}>
        <View
          style={[
            estilos.icone,
            { backgroundColor: corFundoIcone || t.colors.backgroundSecondary },
          ]}
        >
          <Ionicons name={icone} size={20} color={corIcone || t.colors.primary} />
        </View>
        <ThemedText variant="h3" weight="bold">
          {titulo}
        </ThemedText>
      </View>

      {descricao ? (
        <>
          <Spacer size="xs" />
          <ThemedText color="textSecondary">{descricao}</ThemedText>
        </>
      ) : null}

      <Spacer size="md" />

      {children}
    </Card>
  );
}

function criarEstilos(t, altoContraste) {
  return StyleSheet.create({
    card: {
      padding: t.spacing.xl,
      borderColor: altoContraste ? t.colors.border : t.colors.borderLight,
      borderWidth: altoContraste ? 2 : 1,
      ...(altoContraste ? t.shadows.none : t.shadows.md),
    },
    cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    icone: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
