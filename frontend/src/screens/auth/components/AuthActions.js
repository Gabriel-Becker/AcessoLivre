import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../../../components/commons';
import theme from '../../../config/theme';

export default function AuthActions({ text, actionLabel, onPress }) {
  return (
    <View style={styles.container}>
      <ThemedText color="textSecondary">{text}</ThemedText>
      <TouchableOpacity onPress={onPress}>
        <ThemedText color="primary" weight="semibold">
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
