import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../../config/theme';
import SafeArea from '../SafeArea';
import { Spacer, ThemedText } from '../../commons';
import { Button } from '../../ui';
import SidebarUserPanel from './SidebarUserPanel';
import SidebarItem from './SidebarItem';
import { useAuth } from '../../../context/AuthContext';

export default function SidebarLayout({ current = 'Inicio', onNavigate, altoContraste = false, largura = 240 }) {
  const t = altoContraste ? getTheme(true) : theme;
  const { isAuthenticated } = useAuth();

  const items = [
    { key: 'Inicio', label: 'Início', icon: 'home-outline' },
    { key: 'Buscar', label: 'Buscar', icon: 'search-outline' },
    {
      key: 'Adicionar',
      label: 'Adicionar Local',
      icon: 'add-outline',
      disabled: !isAuthenticated,
    },
    { key: 'Sobre', label: 'Sobre Nós', icon: 'information-circle-outline' },
  ];

  return (
    <SafeArea
      background="surface"
      style={[styles.sidebar, { borderRightColor: t.colors.borderLight, width: largura, maxWidth: largura }]}
    >
      <View style={styles.header}>
        <View style={[styles.logoCircle, { backgroundColor: t.colors.primary }]}> 
          <Ionicons name="accessibility-outline" size={18} color={t.colors.textOnPrimary} />
        </View>
        <ThemedText variant="h3" weight="bold" style={{ marginTop: 2 }}>AcessoLivre</ThemedText>
        <ThemedText color="textSecondary" size="sm" style={{ marginTop: 2 }}>Acessibilidade para todos</ThemedText>
      </View>

      <Spacer size="lg" />

      <View style={styles.menu}>
        {items.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={current === item.key}
            disabled={item.disabled}
            onPress={item.disabled ? undefined : () => onNavigate && onNavigate(item.key)}
            altoContraste={altoContraste}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <SidebarUserPanel current={current} onNavigate={onNavigate} altoContraste={altoContraste} />
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    gap: 6,
  },
  logoContainer: {
    marginBottom: theme.spacing.xs,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  menu: {
    gap: 6,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.lg,
  },
});
