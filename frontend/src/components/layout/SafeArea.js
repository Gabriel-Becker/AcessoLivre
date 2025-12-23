import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme, { getTheme } from '../../config/theme';

export default function SafeArea({ children, style, altoContraste = false, background = 'background', ...props }) {
  const t = altoContraste ? getTheme(true) : theme;
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: t.colors[background] || t.colors.background }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
}
