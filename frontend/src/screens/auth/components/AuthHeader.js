import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacer, ThemedText } from '../../../components/commons';
import theme, { getTheme } from '../../../config/theme';

export default function AuthHeader({ title, subtitle, altoContraste = false }) {
  const t = getTheme(altoContraste);
  const corPrincipal = altoContraste ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = altoContraste ? 'textOnPrimary' : 'textSecondary';

  return (
    <View style={styles.wrapper}>
      <Ionicons name="accessibility-outline" size={48} color={theme.colors.primary} />
      <Spacer size="sm" />
      <ThemedText variant="h2" align="center" weight="bold" altoContraste={altoContraste} color={corPrincipal}>
        AcessoLivre
      </ThemedText>
      <ThemedText color={corSecundaria} align="center" altoContraste={altoContraste}>
        {subtitle || 'Acessibilidade para todos'}
      </ThemedText>
      {title ? (
        <>
          <Spacer size="lg" />
          <ThemedText variant="h2" weight="bold" align="center" altoContraste={altoContraste} color={corPrincipal}>
            {title}
          </ThemedText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
});
