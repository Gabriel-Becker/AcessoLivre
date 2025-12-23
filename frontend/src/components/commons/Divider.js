import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme, { getTheme } from '../../config/theme';

export default function Divider({ style, altoContraste = false, color, height = 1 }) {
  const t = altoContraste ? getTheme(true) : theme;
  const dividerColor = color || t.colors.border;

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: dividerColor, height },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    marginVertical: theme.spacing.sm,
  },
});
