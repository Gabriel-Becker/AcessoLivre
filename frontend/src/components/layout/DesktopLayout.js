import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';
import { ThemedText } from '../commons';
import Sidebar from './sidebar/SidebarLayout';
import MenuExpandido from '../../screens/menu/MenuExpandido';

export default function DesktopLayout({
  children,
  current,
  onNavigate,
  altoContraste,
  style,
  screenAnterior,
}) {
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo, fontSizeMultiplier) || theme;
  const layoutExpandido = fontSizeMultiplier >= 1.5;

  if (layoutExpandido && current === 'MenuLateral') {
    return (
      <View style={[styles.container, styles.containerExpandido, { backgroundColor: t.colors.background }, style]}>
        <MenuExpandido
          current={screenAnterior || 'Inicio'}
          onNavigate={onNavigate}
          altoContraste={contrasteAtivo}
          onFechar={() => onNavigate?.(screenAnterior || 'Inicio')}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        layoutExpandido ? styles.containerExpandido : styles.containerPadrao,
        { backgroundColor: t.colors.background },
        style,
      ]}
    >
      {layoutExpandido ? (
        <View style={[styles.headerExpandido, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.borderLight }]}> 
          <TouchableOpacity
            style={[styles.botaoMenu, { borderColor: t.colors.borderLight, backgroundColor: t.colors.backgroundSecondary }]}
            onPress={() => onNavigate?.('MenuLateral')}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu lateral"
          >
            <Ionicons name="menu-outline" size={22} color={t.colors.primary} />
            <ThemedText weight="semibold" color="primary" altoContraste={contrasteAtivo}>
              Menu
            </ThemedText>
          </TouchableOpacity>

          <ThemedText weight="bold" color="textPrimary" altoContraste={contrasteAtivo}>
            AcessoLivre
          </ThemedText>

          <View style={styles.headerSpacer} />
        </View>
      ) : (
        <Sidebar
          current={current}
          onNavigate={onNavigate}
          altoContraste={contrasteAtivo}
          modoExpandido={layoutExpandido}
        />
      )}
      <View style={[styles.content, { backgroundColor: t.colors.background }]}> 
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerPadrao: {
    flexDirection: 'row',
  },
  containerExpandido: {
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  headerExpandido: {
    minHeight: 72,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  botaoMenu: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerSpacer: {
    width: 88,
  },
});
