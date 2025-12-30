import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../../config/theme';
import SafeArea from '../SafeArea';
import { Spacer, ThemedText } from '../../commons';
import { Button } from '../../ui';
import SidebarUserPanel from './SidebarUserPanel';
import SidebarItem from './SidebarItem';

export default function SidebarLayout({ current = 'Inicio', onNavigate, altoContraste = false }) {
  const t = altoContraste ? getTheme(true) : theme;

  const items = [
    { key: 'Inicio', label: 'Início', icon: 'home-outline' },
    { key: 'Buscar', label: 'Buscar', icon: 'search-outline' },
    { key: 'Adicionar', label: 'Adicionar Local', icon: 'add-outline' },
    { key: 'Sobre', label: 'Sobre Nós', icon: 'information-circle-outline' },
  ];

  return (
    <SafeArea background="surface" style={[styles.sidebar, { borderRightColor: t.colors.borderLight }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="accessibility-outline" size={32} color={t.colors.primary} />
        </View>
        <ThemedText variant="h3" weight="bold">AcessoLivre</ThemedText>
        <ThemedText color="textSecondary">Acessibilidade para todos</ThemedText>
      </View>

      <Spacer size="lg" />

      <View style={styles.menu}>
        {items.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={current === item.key}
            onPress={() => onNavigate && onNavigate(item.key)}
            altoContraste={altoContraste}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <SidebarUserPanel onNavigate={onNavigate} altoContraste={altoContraste} />
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    gap: 4,
  },
  logoContainer: {
    marginBottom: theme.spacing.xs,
  },
  menu: {
    gap: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.lg,
  },
});
