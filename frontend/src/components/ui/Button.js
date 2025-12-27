// Button - Componente de botão reutilizável com suporte a temas
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../config/theme';

export default function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  children,
  style,
  textStyle,
  iconLeft,
  iconRight,
  iconSize = 20,
  iconColor,
  align = 'center',
  ...props
}) {
  const isDisabled = disabled || loading;

  // Estilos baseados na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.textTertiary : theme.colors.primary,
            borderWidth: 0,
          },
          text: { color: theme.colors.textOnPrimary },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.textTertiary : theme.colors.secondary,
            borderWidth: 0,
          },
          text: { color: theme.colors.textOnSecondary },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled ? theme.colors.borderLight : theme.colors.primary,
          },
          text: { color: isDisabled ? theme.colors.textTertiary : theme.colors.primary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.textTertiary : theme.colors.error,
            borderWidth: 0,
          },
          text: { color: theme.colors.textOnPrimary },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: { color: isDisabled ? theme.colors.textTertiary : theme.colors.primary },
        };
      default:
        return {
          container: { backgroundColor: theme.colors.primary, borderWidth: 0 },
          text: { color: theme.colors.textOnPrimary },
        };
    }
  };

  // Estilos baseados no tamanho
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.md },
          text: { fontSize: theme.typography.fontSize.sm },
        };
      case 'large':
        return {
          container: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
          text: { fontSize: theme.typography.fontSize.lg },
        };
      case 'medium':
      default:
        return {
          container: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
          text: { fontSize: theme.typography.fontSize.md },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const contentAlign = align === 'left' ? styles.alignLeft : styles.alignCenter;
  const effectiveIconColor = iconColor || variantStyles.text.color;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        contentAlign,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <>
          {iconLeft && (
            <Ionicons
              name={iconLeft}
              size={iconSize}
              color={effectiveIconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {children}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={iconSize}
              color={effectiveIconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignCenter: {
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});
