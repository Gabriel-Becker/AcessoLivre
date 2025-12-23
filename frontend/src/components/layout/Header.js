import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../config/theme';

export default function Header({
  titulo,
  onBack,
  right,
  altoContraste = false,
  style,
  titleStyle,
}) {
  const t = altoContraste ? getTheme(true) : theme;

  return (
    <View style={[styles.container, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.borderLight }, style]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.center}>
        {!!titulo && (
          <Text style={[styles.title, { color: t.colors.textPrimary }, titleStyle]} numberOfLines={1}>
            {titulo}
          </Text>
        )}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
  },
  left: {
    width: 56,
    alignItems: 'flex-start',
  },
  back: {
    padding: theme.spacing.xs,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  right: {
    width: 56,
    alignItems: 'flex-end',
  },
});
