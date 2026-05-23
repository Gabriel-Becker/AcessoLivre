import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import theme, { getTheme } from '../../config/theme';

export default function Toggle({ value = false, onValueChange = () => {}, altoContraste = false }) {
  const t = altoContraste ? getTheme(true) : theme;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: !!value }}
      style={[styles.container]}
    >
      <View style={[styles.track, { backgroundColor: value ? t.colors.primary : t.colors.backgroundTertiary, borderColor: t.colors.borderLight }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: value ? t.colors.textOnPrimary : t.colors.surface,
              transform: [{ translateX: value ? 18 : 0 }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
  },
  track: {
    width: 56,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
