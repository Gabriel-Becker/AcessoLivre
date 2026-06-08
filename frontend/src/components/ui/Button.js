// Button - Componente de botão reutilizável com suporte a temas
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

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
  altoContraste,
  permitirEscalaFonte = true,
  ...props
}) {
  const { theme: temaContexto, isHighContrast, fontSizeMultiplier } = useThemeContext();
  const isDisabled = disabled || loading;
  const t = typeof altoContraste === 'boolean'
    ? getTheme(altoContraste, fontSizeMultiplier)
    : (temaContexto || getTheme(isHighContrast, fontSizeMultiplier));
  const minTouchHeight = t.layout?.mobile?.touchTargetMinHeight ?? 44;

  // Estilos baseados na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? t.colors.textTertiary : t.colors.primary,
            borderWidth: 0,
          },
          text: { color: t.colors.textOnPrimary },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? t.colors.textTertiary : t.colors.secondary,
            borderWidth: 0,
          },
          text: { color: t.colors.textOnSecondary },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled ? t.colors.borderLight : t.colors.primary,
          },
          text: { color: isDisabled ? t.colors.textTertiary : t.colors.primary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? t.colors.textTertiary : t.colors.error,
            borderWidth: 0,
          },
          text: { color: t.colors.textOnPrimary },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: { color: isDisabled ? t.colors.textTertiary : t.colors.primary },
        };
      default:
        return {
          container: { backgroundColor: t.colors.primary, borderWidth: 0 },
          text: { color: t.colors.textOnPrimary },
        };
    }
  };

  // Estilos baseados no tamanho
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { minHeight: minTouchHeight, paddingVertical: t.spacing.xs, paddingHorizontal: t.spacing.md },
          text: { fontSize: t.typography.fontSize.sm },
        };
      case 'large':
        return {
          container: { minHeight: minTouchHeight + 10, paddingVertical: t.spacing.md, paddingHorizontal: t.spacing.lg },
          text: { fontSize: t.typography.fontSize.lg },
        };
      case 'medium':
      default:
        return {
          container: { minHeight: minTouchHeight, paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.md },
          text: { fontSize: t.typography.fontSize.md },
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
          <Text
            allowFontScaling={permitirEscalaFonte}
            style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}
          >
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
    borderRadius: theme.borderRadius.lg,
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
