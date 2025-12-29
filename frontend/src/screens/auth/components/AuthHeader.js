import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacer, ThemedText } from '../../../components/commons';
import theme from '../../../config/theme';

export default function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="accessibility-outline" size={48} color={theme.colors.primary} />
      <Spacer size="sm" />
      <ThemedText variant="h2" align="center" weight="bold">
        AcessoLivre
      </ThemedText>
      <ThemedText color="textSecondary" align="center">
        {subtitle || 'Acessibilidade para todos'}
      </ThemedText>
      {title ? (
        <>
          <Spacer size="lg" />
          <ThemedText variant="h2" weight="bold" align="center">
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
