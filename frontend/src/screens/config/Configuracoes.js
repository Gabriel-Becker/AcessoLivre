import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout';
import { CabecalhoPagina, CardSecao } from '../../components/ui';
import { ThemedText } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { breakpoints } from '../../config/theme';

const OPCOES_FONTE = [
  { valor: 1, rotulo: 'Padrão', subtitulo: '100%' },
  { valor: 1.5, rotulo: 'Maior', subtitulo: '150%' },
  { valor: 2, rotulo: 'Máxima', subtitulo: '200%' },
];

export default function Configuracoes({ onNavigate }) {
  const { isHighContrast, toggleTheme, fontSizeMultiplier, alterarTamanhoFonte, theme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isMobile = width < (breakpoints.tablet || 768);
  const isWeb = Platform.OS === 'web';
  const exibirControleFonte = isWeb && !isMobile;
  const corBordaOpcao = isHighContrast ? theme.colors.border : theme.colors.borderLight;
  const corFundoOpcao = isHighContrast ? theme.colors.surfaceSecondary : theme.colors.surface;
  const corFundoOpcaoSelecionada = isHighContrast ? 'rgba(0, 247, 239, 0.12)' : 'rgba(74, 144, 226, 0.10)';
  const corBordaOpcaoSelecionada = isHighContrast ? theme.colors.primary : '#4A90E2';
  const nivelAtual = OPCOES_FONTE.find((opcao) => opcao.valor === fontSizeMultiplier) || OPCOES_FONTE[0];

  const selecionarFonte = (valor) => {
    alterarTamanhoFonte(valor);
  };

  return (
    <Container scroll background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <CabecalhoPagina
        {...(!isMobile ? { titulo: 'Configurações' } : {})}
        altoContraste={isHighContrast}
      />

      <View style={styles.conteudo}>
        <CardSecao titulo="Acessibilidade" icone="accessibility-outline" altoContraste={isHighContrast}>
          <View style={styles.linha}>
            <ThemedText weight="medium">Alto contraste</ThemedText>
            <Switch value={isHighContrast} onValueChange={toggleTheme} />
          </View>

          {exibirControleFonte ? (
            <View style={styles.blocoFonte}>
              <View style={styles.cabecalhoFonte}>
                <View style={styles.tituloFonte}>
                  <Ionicons name="text-outline" size={18} color={theme.colors.primary} />
                  <ThemedText weight="semibold">Tamanho da fonte</ThemedText>
                </View>
                <View style={styles.badgeAtual}>
                  <ThemedText weight="semibold" color="textOnPrimary" align="center">
                    {nivelAtual.subtitulo}
                  </ThemedText>
                </View>
              </View>

              <ThemedText color="textSecondary">
                Escolha um dos três níveis para aplicar em todas as telas.
              </ThemedText>

              <View style={styles.grupoOpcoes}>
                {OPCOES_FONTE.map((opcao) => {
                  const selecionado = fontSizeMultiplier === opcao.valor;

                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[
                        styles.opcao,
                        { borderColor: corBordaOpcao, backgroundColor: corFundoOpcao },
                        selecionado
                          ? {
                              borderColor: corBordaOpcaoSelecionada,
                              backgroundColor: corFundoOpcaoSelecionada,
                            }
                          : null,
                      ]}
                      onPress={() => selecionarFonte(opcao.valor)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selecionado }}
                    >
                      <View style={styles.opcaoTopo}>
                        <ThemedText weight="bold" align="center">
                          {opcao.subtitulo}
                        </ThemedText>
                        {selecionado ? (
                          <Ionicons name="checkmark-circle" size={18} color={corBordaOpcaoSelecionada} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={18} color={corBordaOpcao} />
                        )}
                      </View>

                      <ThemedText
                        weight="bold"
                        align="center"
                        style={{ fontSize: 16 * opcao.valor, lineHeight: 18 * opcao.valor }}
                      >
                        Aa
                      </ThemedText>

                      <ThemedText weight="semibold" align="center">
                        {opcao.rotulo}
                      </ThemedText>
                      <ThemedText color="textSecondary" align="center">
                        Texto de exemplo
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </CardSecao>

      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  blocoFonte: {
    marginTop: 8,
  },
  cabecalhoFonte: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  tituloFonte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  badgeAtual: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#4A90E2',
  },
  grupoOpcoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  opcao: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
