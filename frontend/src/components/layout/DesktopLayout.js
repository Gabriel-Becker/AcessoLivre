import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme, { getTheme } from '../../config/theme';
import Sidebar from './sidebar/SidebarLayout';

export default function DesktopLayout({
  children,
  current,
  onNavigate,
  altoContraste = false,
  style,
}) {
  const t = altoContraste ? getTheme(true) : theme;

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }, style]}>
      <Sidebar current={current} onNavigate={onNavigate} altoContraste={altoContraste} />
      <View style={[styles.content, { backgroundColor: t.colors.background }]}> 
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});
