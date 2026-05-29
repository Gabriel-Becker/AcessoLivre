// Card - Container de conteúdo com suporte a temas
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme, { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function Card({
  variant = 'default',
  pressable = false,
  onPress,
  children,
  style,
  altoContraste = false,
  ...props
}) {
  const { isHighContrast, theme: ctxTheme } = useThemeContext();
  const t = typeof altoContraste === 'boolean' ? getTheme(altoContraste) : ctxTheme || theme;
  const cardPadding = t.layout?.mobile?.cardPadding ?? t.spacing.md;

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
  const contentStyles = {
    borderRadius: t.borderRadius.xl,
    padding: cardPadding,
  };

  const cardContent = (
    <View style={[styles.card, contentStyles, variantStyles, style]} {...props}>
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
    marginBottom: theme.spacing.md,
  },
});
