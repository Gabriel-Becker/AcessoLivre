import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import theme, { getTheme } from '../../config/theme';

export default function Container({
  children,
  style,
  scroll = false,
  center = false,
  background = 'background',
  altoContraste = false,
  contentStyle,
  ...props
}) {
  const t = altoContraste ? getTheme(true) : theme;

  const baseStyle = [
    styles.container,
    { backgroundColor: t.colors[background] || t.colors.background },
    center && styles.center,
    style,
  ];

  if (scroll) {
    return (
      <ScrollView
        style={baseStyle}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={baseStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
