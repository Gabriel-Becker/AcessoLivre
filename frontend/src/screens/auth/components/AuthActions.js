import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../../../components/commons';
import theme, { getTheme } from '../../../config/theme';

export default function AuthActions({ text, actionLabel, onPress, altoContraste = false }) {
  const t = getTheme(altoContraste);
  const corTexto = altoContraste ? 'textOnPrimary' : 'textSecondary';

  return (
    <View style={styles.container}>
      <ThemedText color={corTexto} altoContraste={altoContraste}>{text}</ThemedText>
      <TouchableOpacity onPress={onPress}>
        <ThemedText color="primary" weight="semibold" altoContraste={altoContraste}>
          {` ${actionLabel}`}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
});
