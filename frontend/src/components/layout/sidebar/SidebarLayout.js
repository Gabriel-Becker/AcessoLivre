import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../../config/theme';
import { useThemeContext } from '../../../context/ThemeContext';
import SafeArea from '../SafeArea';
import { Spacer, ThemedText } from '../../commons';
import Toggle from '../../ui/Toggle';
import { Button } from '../../ui';
import SidebarUserPanel from './SidebarUserPanel';
import SidebarItem from './SidebarItem';
import { useAuth } from '../../../context/AuthContext';

export default function SidebarLayout({ current = 'Inicio', onNavigate, altoContraste = false, largura = 240 }) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const t = altoContraste ? getTheme(true) : theme;
  const { isAuthenticated } = useAuth();
  const { isHighContrast, toggleTheme } = useThemeContext();

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
    { key: 'Configuracoes', label: 'Configurações', icon: 'settings-outline' },
  ];

  return (
    <>
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
              active={item.key === 'Configuracoes' ? showConfigModal : current === item.key}
              disabled={item.disabled}
              onPress={
                item.disabled
                  ? undefined
                  : item.key === 'Configuracoes'
                    ? () => setShowConfigModal(true)
                    : () => onNavigate && onNavigate(item.key)
              }
              altoContraste={altoContraste}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <SidebarUserPanel current={current} onNavigate={onNavigate} altoContraste={altoContraste} />
        </View>
      </SafeArea>

      <Modal
        visible={showConfigModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: t.colors.surface, borderColor: t.colors.borderLight }]}> 
            <View style={[styles.modalIcon, { backgroundColor: t.colors.primary }]}> 
              <Ionicons name="settings-outline" size={22} color={t.colors.textOnPrimary} />
            </View>

            <Spacer size="sm" />
            <ThemedText variant="h3" weight="bold" align="center" altoContraste={altoContraste}>
              Configurações
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" align="center" altoContraste={altoContraste}>
              Ajuste a acessibilidade do aplicativo sem sair desta tela.
            </ThemedText>

            <Spacer size="md" />
            <View style={[styles.settingCard, { backgroundColor: t.colors.backgroundSecondary, borderColor: t.colors.borderLight }]}> 
              <View style={styles.settingHeader}>
                <View style={[styles.settingTextBlock, { flex: 1 }]}> 
                  <ThemedText variant="h4" weight="bold" altoContraste={altoContraste}>
                    Alto contraste
                  </ThemedText>
                  <Spacer size="xs" />
                  <ThemedText color="textSecondary" size="sm" altoContraste={altoContraste}>
                    Ativa contraste máximo para facilitar a leitura.
                  </ThemedText>
                </View>

                <View style={styles.switchContainer}>
                  <Toggle value={isHighContrast} onValueChange={toggleTheme} altoContraste={altoContraste} />
                </View>
              </View>
            </View>

            <Spacer size="xs" />
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={() => setShowConfigModal(false)}
              altoContraste={altoContraste}
            >
              Fechar
            </Button>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    transform: [{ translateY: 28 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  settingCard: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  settingTextBlock: {
    minWidth: 0,
  },
  switchContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
});
