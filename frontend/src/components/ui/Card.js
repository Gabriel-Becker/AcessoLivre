// Card - Container de conteúdo com suporte a temas
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme, { getTheme } from '../../config/theme';

export default function Card({
  variant = 'default',
  pressable = false,
  onPress,
  children,
  style,
  altoContraste = false,
  ...props
}) {
  const t = altoContraste ? getTheme(true) : theme;

  // Estilos baseados na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...t.shadows.md,
          backgroundColor: t.colors.surface,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: t.colors.surface,
          borderWidth: 2,
          borderColor: t.colors.border,
          ...t.shadows.none,
        };
      case 'default':
      default:
        return {
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
          ...t.shadows.sm,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const cardContent = (
    <View style={[styles.card, variantStyles, style]} {...props}>
      {children}
    </View>
  );

  if (pressable && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
});
