import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';
import { Button, CardSecao } from '../../components/ui';
import { ThemedText } from '../../components/commons';
import SidebarItem from '../../components/layout/sidebar/SidebarItem';
import { useAuth } from '../../context/AuthContext';

const OPCOES_FONTE = [
  { valor: 1, rotulo: 'Padrão', subtitulo: '100%' },
  { valor: 1.5, rotulo: 'Maior', subtitulo: '150%' },
  { valor: 2, rotulo: 'Máxima', subtitulo: '200%' },
];

export default function MenuExpandido({ current = 'Inicio', onNavigate, onFechar, altoContraste = false }) {
  const { isHighContrast, theme: ctxTheme, fontSizeMultiplier } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = contrasteAtivo ? getTheme(true, fontSizeMultiplier) : (ctxTheme || getTheme(isHighContrast, fontSizeMultiplier));
  const styles = useMemo(() => criarEstilos(t), [t]);
  const { isAuthenticated } = useAuth();

  const menuItens = [
    { key: 'Inicio', label: 'Início', icon: 'home-outline' },
    { key: 'Buscar', label: 'Buscar', icon: 'search-outline' },
    { key: 'Adicionar', label: 'Adicionar Local', icon: 'add-outline', disabled: !isAuthenticated },
    { key: 'Sobre', label: 'Sobre Nós', icon: 'information-circle-outline' },
    { key: 'Perfil', label: 'Perfil', icon: 'person-outline', disabled: !isAuthenticated },
    { key: 'Configuracoes', label: 'Configurações', icon: 'settings-outline' },
  ];

  const totalColunas = fontSizeMultiplier >= 2 ? 1 : 2;

  const selecionarItem = (item) => {
    if (item.disabled) return;
    if (item.key === 'Configuracoes') {
      onNavigate?.('Configuracoes');
      return;
    }
    onNavigate?.(item.key);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}> 
      <View style={[styles.cabecalho, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.borderLight }]}> 
        <TouchableOpacity
          style={[styles.botaoVoltar, { borderColor: t.colors.borderLight, backgroundColor: t.colors.backgroundSecondary }]}
          onPress={onFechar}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
        >
          <Ionicons name="arrow-back-outline" size={20} color={t.colors.primary} />
          <ThemedText weight="semibold" color="primary" altoContraste={contrasteAtivo}>
            Voltar
          </ThemedText>
        </TouchableOpacity>

        <ThemedText variant="h3" weight="bold" altoContraste={contrasteAtivo}>
          Menu
        </ThemedText>

        <View style={styles.cabecalhoEspaco} />
      </View>

      <ScrollView
        style={styles.conteudo}
        contentContainerStyle={styles.conteudoInterno}
        showsVerticalScrollIndicator={false}
      >
        <CardSecao
          titulo="Navegação"
          icone="menu-outline"
          altoContraste={contrasteAtivo}
        >
          <View style={styles.menuGrid}>
            {menuItens.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.itemWrapper,
                  totalColunas === 1 ? styles.itemWrapperUmaColuna : null,
                ]}
              >
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  active={current === item.key}
                  disabled={item.disabled}
                  onPress={() => selecionarItem(item)}
                  altoContraste={contrasteAtivo}
                  modoExpandido
                  fontSizeMultiplier={fontSizeMultiplier}
                />
              </View>
            ))}
          </View>
        </CardSecao>

        {!isAuthenticated ? (
          <View style={styles.areaAuth}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={() => onNavigate?.('Login')}
              align="center"
              iconLeft="log-in-outline"
              altoContraste={contrasteAtivo}
              style={styles.botaoAuth}
            >
              Fazer Login
            </Button>

            <Button
              variant={contrasteAtivo ? 'outline' : 'ghost'}
              size="large"
              fullWidth
              onPress={() => onNavigate?.('Register')}
              align="center"
              iconLeft="person-add-outline"
              altoContraste={contrasteAtivo}
              style={[
                styles.botaoAuth,
                contrasteAtivo
                  ? {
                    backgroundColor: 'transparent',
                    borderColor: t.colors.primary,
                    borderWidth: 2,
                  }
                  : { backgroundColor: 'transparent' },
              ]}
              textStyle={{ color: contrasteAtivo ? t.colors.primary : t.colors.textSecondary }}
              iconColor={contrasteAtivo ? t.colors.primary : t.colors.textSecondary}
            >
              Criar Conta
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function criarEstilos(t) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    cabecalho: {
      minHeight: 72,
      paddingHorizontal: t.spacing.lg,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.md,
    },
    botaoVoltar: {
      minHeight: 48,
      paddingHorizontal: t.spacing.md,
      borderRadius: t.borderRadius.xl,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    cabecalhoEspaco: {
      width: 88,
    },
    conteudo: {
      flex: 1,
    },
    conteudoInterno: {
      padding: t.spacing.lg,
      maxWidth: 1280,
      width: '100%',
      alignSelf: 'center',
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.lg,
    },
    itemWrapper: {
      flexGrow: 1,
      flexBasis: '48%',
    },
    itemWrapperUmaColuna: {
      flexBasis: '100%',
    },
    areaAuth: {
      marginTop: t.spacing.lg,
      gap: t.spacing.sm,
    },
    botaoAuth: {
      borderRadius: t.borderRadius.lg,
      shadowColor: t.shadows.md.shadowColor,
      shadowOffset: t.shadows.md.shadowOffset,
      shadowOpacity: t.shadows.md.shadowOpacity,
      shadowRadius: t.shadows.md.shadowRadius,
      elevation: t.shadows.md.elevation,
    },
  });
}