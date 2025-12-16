// Card - Container de conteúdo com suporte a temas
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../config/theme';

export default function Card({
  variant = 'default',
  pressable = false,
  onPress,
  children,
  style,
  ...props
}) {
  // Estilos baseados na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...theme.shadows.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 2,
          borderColor: theme.colors.border,
          ...theme.shadows.none,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
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
