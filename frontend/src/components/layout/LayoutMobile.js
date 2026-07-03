import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme, { getTheme } from '../../config/theme';
import { TextoTematizado } from '../commons';
import AreaSegura from './AreaSegura';
import { useAuth } from '../../context/ContextoAutenticacao';
import { useThemeContext } from '../../context/ThemeContext';

export default function LayoutMobile({
  children,
  current,
  onNavigate,
  altoContraste = false,
  style,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(isHighContrast || altoContraste);
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 72;
  const tabBarPaddingBottom = Platform.OS === 'ios'
    ? Math.max(insets.bottom, theme.spacing.md)
    : Math.max(insets.bottom, theme.spacing.sm);
  const tabBarAlturaTotal = TAB_BAR_HEIGHT + tabBarPaddingBottom + theme.spacing.md;

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
      key: isAuthenticated ? 'Perfil' : 'Entrar',
      baseKey: 'Perfil',
      label: isAuthenticated ? 'Perfil' : 'Entrar',
      icon: isAuthenticated ? 'person-outline' : 'log-in-outline',
      iconAtivo: isAuthenticated ? 'person' : 'log-in',
    },
  ];

  return (
    <AreaSegura
      background="background"
      edges={['top', 'left', 'right']}
      style={[styles.Recipiente, { backgroundColor: t.colors.background }, style]}
    >
      <View style={[styles.Cabecalho, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.borderLight }]}>
        <View style={styles.headerAction} />

        <View style={styles.brandContainer}>
          <View style={[styles.logoCircle, { backgroundColor: t.colors.primary }]}> 
            <Ionicons name="accessibility-outline" size={18} color={t.colors.textOnPrimary} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navegar('Configuracoes')}
          accessibilityRole="button"
          accessibilityLabel="Ir para configurações"
        >
          <Ionicons name="settings-outline" size={22} color={t.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <View style={[styles.content, { paddingBottom: tabBarAlturaTotal }]}>{children}</View>

        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: t.colors.surface,
              borderTopColor: t.colors.borderLight,
              bottom: 0,
              paddingBottom: tabBarPaddingBottom,
              minHeight: TAB_BAR_HEIGHT + insets.bottom,
            },
          ]}
        >
          {tabs.map((tab) => {
            const activeKey = tab.baseKey || tab.key;
            const ativo = current === activeKey;

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => navegar(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={`Ir para ${tab.label}`}
              >
                <View style={[styles.tabInner, ativo && [styles.tabInnerAtivo, { backgroundColor: t.colors.backgroundSecondary }]]}>
                  <Ionicons name={ativo ? tab.iconAtivo : tab.icon} size={20} color={ativo ? t.colors.primary : t.colors.textSecondary} />
                  <TextoTematizado style={[styles.tabLabel, { color: ativo ? t.colors.primary : t.colors.textSecondary }]} weight={ativo ? 'semibold' : 'regular'}>
                    {tab.label}
                  </TextoTematizado>
                  {ativo ? <View style={[styles.tabIndicator, { backgroundColor: t.colors.primary }]} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </AreaSegura>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    flex: 1,
  },
  Cabecalho: {
    height: 56,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: 72,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 48,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
  },
  tabInnerAtivo: {
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 12,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 999,
  },
});

