import React from 'react';
import { Text, StyleSheet } from 'react-native';
import theme, { getTheme } from '../../config/theme';

export default function ThemedText({
  children,
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  weight = 'regular',
  altoContraste = false,
  style,
  ...props
}) {
  const t = altoContraste ? getTheme(true) : theme;

  const variantStyles = {
    display: {
      fontSize: t.typography.fontSize.display,
      lineHeight: t.typography.fontSize.display * t.typography.lineHeight.tight,
    },
    h1: {
      fontSize: t.typography.fontSize.xxxl,
      lineHeight: t.typography.fontSize.xxxl * t.typography.lineHeight.tight,
    },
    h2: {
      fontSize: t.typography.fontSize.xxl,
      lineHeight: t.typography.fontSize.xxl * t.typography.lineHeight.tight,
    },
    h3: {
      fontSize: t.typography.fontSize.xl,
      lineHeight: t.typography.fontSize.xl * t.typography.lineHeight.normal,
    },
    body: {
      fontSize: t.typography.fontSize.md,
      lineHeight: t.typography.fontSize.md * t.typography.lineHeight.normal,
    },
    caption: {
      fontSize: t.typography.fontSize.sm,
      lineHeight: t.typography.fontSize.sm * t.typography.lineHeight.normal,
    },
    tiny: {
      fontSize: t.typography.fontSize.xs,
      lineHeight: t.typography.fontSize.xs * t.typography.lineHeight.normal,
    },
  };

  return (
    <Text
      style={[
        styles.base,
        variantStyles[variant],
        {
          color: t.colors[color] || t.colors.textPrimary,
          textAlign: align,
          fontWeight: t.typography.fontWeight[weight] || t.typography.fontWeight.regular,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});
