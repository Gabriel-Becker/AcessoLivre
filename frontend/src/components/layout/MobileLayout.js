import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../config/theme';
import { ThemedText } from '../commons';
import SafeArea from './SafeArea';
import { useAuth } from '../../context/AuthContext';

export default function MobileLayout({
  children,
  current,
  onNavigate,
  altoContraste = false,
  style,
}) {
  const t = altoContraste ? getTheme(true) : theme;
  const { isAuthenticated } = useAuth();

  const navegar = useCallback(
    (screen) => {
      if (onNavigate) {
        onNavigate(screen);
      }
    },
    [onNavigate],
  );

  const tabs = [
    { key: 'Inicio', label: 'Início', icon: 'home-outline', iconAtivo: 'home' },
    { key: 'Buscar', label: 'Buscar', icon: 'search-outline', iconAtivo: 'search' },
    { key: 'Adicionar', label: 'Adicionar', icon: 'add-outline', iconAtivo: 'add' },
    { key: 'Sobre', label: 'Sobre', icon: 'information-circle-outline', iconAtivo: 'information-circle' },
    {
      key: isAuthenticated ? 'Perfil' : 'Login',
      baseKey: 'Perfil',
      label: isAuthenticated ? 'Perfil' : 'Entrar',
      icon: isAuthenticated ? 'person-outline' : 'log-in-outline',
      iconAtivo: isAuthenticated ? 'person' : 'log-in',
    },
  ];

  return (
    <SafeArea background="background" style={[styles.container, { backgroundColor: t.colors.background }, style]}>
      <View style={[styles.header, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.borderLight }]}>
        <View style={styles.headerAction} />

        <View style={styles.brandContainer}>
          <View style={[styles.logoCircle, { borderColor: t.colors.primary }]}> 
            <Ionicons name="accessibility-outline" size={18} color={t.colors.primary} />
          </View>
          <ThemedText variant="h3" weight="bold">
            AcessoLivre
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navegar('Buscar')}
          accessibilityRole="button"
          accessibilityLabel="Ir para busca"
        >
          <Ionicons name="search-outline" size={22} color={t.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={[styles.tabBar, { backgroundColor: t.colors.surface, borderTopColor: t.colors.borderLight }]}>
        {tabs.map((tab) => {
          const activeKey = tab.baseKey || tab.key;
          const ativo = current === activeKey;
          const cor = ativo ? t.colors.primary : t.colors.textSecondary;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => navegar(tab.key)}
              accessibilityRole="button"
              accessibilityLabel={`Ir para ${tab.label}`}
            >
              <Ionicons name={ativo ? tab.iconAtivo : tab.icon} size={22} color={cor} />
              <ThemedText
                style={[styles.tabLabel, { color: cor }]}
                weight={ativo ? 'semibold' : 'regular'}
                numberOfLines={1}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 84,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 72,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 48,
  },
  tabLabel: {
    fontSize: 12,
  },
});