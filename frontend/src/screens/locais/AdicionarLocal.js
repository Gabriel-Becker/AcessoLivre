import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText, Spacer } from '../../components/commons';
import theme from '../../config/theme';

export default function AdicionarLocal() {
  return (
    <View style={styles.container}>
      <ThemedText variant="h2" weight="bold">
        Adicionar Local
      </ThemedText>
      <Spacer size="sm" />
      <ThemedText color="textSecondary" align="center">
        Em desenvolvimento
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
