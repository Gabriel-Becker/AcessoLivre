import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextoTematizado } from '../../../components/commons';
import theme, { getTheme } from '../../../config/theme';

export default function AuthActions({ text, actionLabel, onPress, altoContraste = false }) {
  const t = getTheme(altoContraste);
  const corTexto = altoContraste ? 'textPrimary' : 'textSecondary';
  const corAcao = altoContraste ? 'textPrimary' : 'primary';

  return (
    <View style={styles.Recipiente}>
      <TextoTematizado color={corTexto} altoContraste={altoContraste}>{text}</TextoTematizado>
      <TouchableOpacity onPress={onPress}>
        <TextoTematizado color={corAcao} weight="semibold" altoContraste={altoContraste}>
          {` ${actionLabel}`}
        </TextoTematizado>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
});
