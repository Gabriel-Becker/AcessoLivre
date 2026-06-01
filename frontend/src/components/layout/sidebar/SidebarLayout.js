import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../../config/theme';
import { useThemeContext } from '../../../context/ThemeContext';
import SafeArea from '../SafeArea';
import { Spacer, ThemedText } from '../../commons';
import Toggle from '../../ui/Toggle';
import { Button } from '../../ui';
import SidebarUserPanel from './SidebarUserPanel';
import SidebarItem from './SidebarItem';
import { useAuth } from '../../../context/AuthContext';

const OPCOES_FONTE = [
  { valor: 1, rotulo: 'Padrão', subtitulo: '100%' },
  { valor: 1.5, rotulo: 'Maior', subtitulo: '150%' },
  { valor: 2, rotulo: 'Máxima', subtitulo: '200%' },
];

export default function SidebarLayout({ current = 'Inicio', onNavigate, altoContraste = false, largura = 240 }) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const { isHighContrast, toggleTheme, theme: ctxTheme, fontSizeMultiplier, alterarTamanhoFonte } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = contrasteAtivo ? getTheme(true) : (ctxTheme || getTheme(isHighContrast));
  const styles = criarEstilos(t);
  const { isAuthenticated } = useAuth();
  const corTextoSecundario = contrasteAtivo ? 'textOnPrimary' : 'textSecondary';
  const nivelAtual = OPCOES_FONTE.find((opcao) => opcao.valor === fontSizeMultiplier) || OPCOES_FONTE[0];

  const corBordaOpcao = contrasteAtivo ? t.colors.border : t.colors.borderLight;
  const corFundoOpcao = contrasteAtivo ? t.colors.surfaceSecondary : t.colors.backgroundSecondary;
  const corBordaOpcaoSelecionada = contrasteAtivo ? t.colors.primary : '#4A90E2';
  const corFundoOpcaoSelecionada = contrasteAtivo ? 'rgba(0, 247, 239, 0.12)' : 'rgba(74, 144, 226, 0.10)';

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
        style={[
          styles.sidebar,
          { borderRightColor: t.colors.borderLight, width: largura, maxWidth: largura, backgroundColor: t.colors.background },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: t.colors.primary }]}> 
            <Ionicons name="accessibility-outline" size={18} color={t.colors.textOnPrimary} />
          </View>
          <ThemedText
            variant="h3"
            weight="bold"
            altoContraste={contrasteAtivo}
            color={contrasteAtivo ? 'textOnPrimary' : 'textPrimary'}
            style={{ marginTop: 2 }}
          >
            AcessoLivre
          </ThemedText>
          <ThemedText color={corTextoSecundario} size="sm" style={{ marginTop: 2 }}>Acessibilidade para todos</ThemedText>
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
              altoContraste={contrasteAtivo}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <SidebarUserPanel current={current} onNavigate={onNavigate} altoContraste={contrasteAtivo} />
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
            <ThemedText color={corTextoSecundario} align="center" altoContraste={altoContraste}>
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
                  <ThemedText color={corTextoSecundario} size="sm" altoContraste={altoContraste}>
                    Ativa contraste máximo para facilitar a leitura.
                  </ThemedText>
                </View>

                <View style={styles.switchContainer}>
                  <Toggle value={isHighContrast} onValueChange={toggleTheme} altoContraste={altoContraste} />
                </View>
              </View>
            </View>

            <Spacer size="sm" />

            <View style={[styles.settingCard, { backgroundColor: t.colors.backgroundSecondary, borderColor: t.colors.borderLight }]}> 
              <View style={styles.settingHeader}>
                <View style={[styles.settingTextBlock, { flex: 1 }]}> 
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="text-outline" size={18} color={t.colors.primary} />
                    <ThemedText variant="h4" weight="bold" altoContraste={altoContraste}>
                      Tamanho da fonte
                    </ThemedText>
                  </View>
                  <Spacer size="xs" />
                  <ThemedText color={corTextoSecundario} size="sm" altoContraste={altoContraste}>
                    Escolha o nível que será aplicado em todas as telas.
                  </ThemedText>
                </View>

                <View style={[styles.badgeNivelAtual, { backgroundColor: t.colors.primary }]}> 
                  <ThemedText weight="bold" color="textOnPrimary" align="center" altoContraste={altoContraste}>
                    {nivelAtual.subtitulo}
                  </ThemedText>
                </View>
              </View>

              <Spacer size="sm" />

              <View style={styles.grupoFontes}>
                {OPCOES_FONTE.map((opcao) => {
                  const selecionado = fontSizeMultiplier === opcao.valor;

                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[
                        styles.opcaoFonte,
                        {
                          borderColor: corBordaOpcao,
                          backgroundColor: corFundoOpcao,
                        },
                        selecionado
                          ? {
                              borderColor: corBordaOpcaoSelecionada,
                              backgroundColor: corFundoOpcaoSelecionada,
                            }
                          : null,
                      ]}
                      onPress={() => alterarTamanhoFonte(opcao.valor)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selecionado }}
                    >
                      <View style={styles.opcaoTopo}>
                        <ThemedText weight="bold" altoContraste={altoContraste}>
                          {opcao.subtitulo}
                        </ThemedText>
                        <Ionicons
                          name={selecionado ? 'checkmark-circle' : 'ellipse-outline'}
                          size={18}
                          color={selecionado ? corBordaOpcaoSelecionada : corBordaOpcao}
                        />
                      </View>

                      <ThemedText
                        weight="bold"
                        align="center"
                        altoContraste={altoContraste}
                        style={{ fontSize: 15 * opcao.valor, lineHeight: 17 * opcao.valor }}
                      >
                        Aa
                      </ThemedText>

                      <ThemedText weight="semibold" align="center" altoContraste={altoContraste}>
                        {opcao.rotulo}
                      </ThemedText>
                      <ThemedText color={corTextoSecundario} align="center" size="sm" altoContraste={altoContraste}>
                        Texto de exemplo
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
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

const criarEstilos = (t) => StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    paddingHorizontal: t.spacing.md,
    paddingTop: t.spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    gap: 6,
  },
  logoContainer: {
    marginBottom: t.spacing.xs,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.xs,
  },
  menu: {
    gap: 6,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: t.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    borderRadius: t.borderRadius.xl,
    borderWidth: 1,
    padding: t.spacing.xl,
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
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.md,
  },
  settingTextBlock: {
    minWidth: 0,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  badgeNivelAtual: {
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grupoFontes: {
    flexDirection: 'row',
    gap: 10,
  },
  opcaoFonte: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 8,
    minHeight: 132,
  },
  opcaoTopo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
