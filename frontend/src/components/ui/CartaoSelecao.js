import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function CartaoSelecao({
  titulo,
  descricao,
  icone,
  corDestaque,
  selecionado = false,
  onPress,
  altoContraste,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const estilos = useMemo(() => criarEstilos(t), [t]);
  const fundoSelecionado = (altoContraste ?? isHighContrast) ? t.colors.surface : `${corDestaque}12`;

  return (
    <Pressable
      onPress={onPress}
      style={[
        estilos.container,
        selecionado && { borderColor: corDestaque, backgroundColor: fundoSelecionado },
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selecionado }}
    >
      <View style={[estilos.checkbox, selecionado && estilos.checkboxSelecionado]}>
        {selecionado ? (
          <Ionicons name="checkmark" size={14} color={t.colors.textOnPrimary} />
        ) : null}
      </View>

      <View style={estilos.conteudo}>
        <View style={estilos.tituloLinha}>
          <Ionicons name={icone} size={18} color={corDestaque} />
          <ThemedText weight="semibold" style={estilos.titulo}>
            {titulo}
          </ThemedText>
        </View>
        <ThemedText color="textSecondary" variant="caption">
          {descricao}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: t.colors.borderLight,
      borderRadius: t.borderRadius.lg,
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
      gap: t.spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: t.borderRadius.sm,
      borderWidth: 2,
      borderColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
    },
    checkboxSelecionado: {
      backgroundColor: t.colors.primary,
      borderColor: t.colors.primary,
    },
    conteudo: {
      flex: 1,
    },
    tituloLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.xs,
      marginBottom: 2,
    },
    titulo: {
      flexShrink: 1,
    },
  });
}
