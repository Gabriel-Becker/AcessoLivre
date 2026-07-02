// src/screens/Configuracoes.js (atualizado)
import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipiente } from '../../components/layout';
import { CabecalhoPagina, CardSecao } from '../../components/ui';
import { TextoTematizado } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { breakpoints } from '../../config/theme';
import BotaoAlternadorVoz from '../../components/acessibilidade/BotaoAlternadorVoz'; 

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
  const escala = Math.max(1, Number(fontSizeMultiplier) || 1);
  const corBordaOpcao = isHighContrast ? theme.colors.border : theme.colors.borderLight;
  const corFundoOpcao = isHighContrast ? theme.colors.surfaceSecondary : theme.colors.surface;
  const corFundoOpcaoSelecionada = isHighContrast ? 'rgba(0, 247, 239, 0.12)' : 'rgba(74, 144, 226, 0.10)';
  const corBordaOpcaoSelecionada = isHighContrast ? theme.colors.primary : '#4A90E2';
  const nivelAtual = OPCOES_FONTE.find((opcao) => opcao.valor === fontSizeMultiplier) || OPCOES_FONTE[0];

  const selecionarFonte = (valor) => {
    alterarTamanhoFonte(valor);
  };

  return (
    <Recipiente scroll background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <CabecalhoPagina
        {...(!isMobile ? { titulo: 'Configurações' } : {})}
        altoContraste={isHighContrast}
      />

      <View style={styles.conteudo}>
        {/* NOVO: Seção do Assistente por Voz */}
        <CardSecao titulo="Assistente por Voz" icone="mic-outline" altoContraste={isHighContrast}>
          <BotaoAlternadorVoz />
        </CardSecao>

        <CardSecao titulo="Acessibilidade" icone="accessibility-outline" altoContraste={isHighContrast}>
          <View style={[styles.linha, { paddingVertical: Math.round(8 * escala) }]}>
            <TextoTematizado weight="medium" style={{ fontSize: Math.round(14 * escala) }}>Alto contraste</TextoTematizado>
            <Switch
              value={isHighContrast}
              onValueChange={toggleTheme}
              style={{ transform: [{ scale: escala }], marginRight: Math.round((escala - 1) * 20) }}
            />
          </View>

          {exibirControleFonte ? (
            <View style={[styles.separador, { borderTopColor: theme.colors.borderLight }]} />
          ) : null}

          {exibirControleFonte ? (
            <View style={styles.blocoFonte}>
              <View style={styles.cabecalhoFonte}>
                <View style={styles.tituloFonte}>
                  <Ionicons name="text-outline" size={18} color={theme.colors.primary} />
                  <TextoTematizado weight="semibold">Tamanho da fonte</TextoTematizado>
                </View>
                <View style={styles.badgeAtual}>
                  <TextoTematizado weight="semibold" color="textOnPrimary" align="center">
                    {nivelAtual.subtitulo}
                  </TextoTematizado>
                </View>
              </View>

              <TextoTematizado color="textSecondary">
                Escolha um dos três náveis para aplicar em todas as telas.
              </TextoTematizado>

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
                      accessibilityRole="Botao"
                      accessibilityState={{ selected: selecionado }}
                    >
                      <View style={styles.opcaoTopo}>
                        <TextoTematizado weight="bold" align="center">
                          {opcao.subtitulo}
                        </TextoTematizado>
                        {selecionado ? (
                          <Ionicons name="checkmark-circle" size={18} color={corBordaOpcaoSelecionada} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={18} color={corBordaOpcao} />
                        )}
                      </View>

                      <TextoTematizado
                        weight="bold"
                        align="center"
                        style={{ fontSize: 16 * opcao.valor, lineHeight: 18 * opcao.valor }}
                      >
                        Aa
                      </TextoTematizado>

                      <TextoTematizado weight="semibold" align="center">
                        {opcao.rotulo}
                      </TextoTematizado>
                      <TextoTematizado color="textSecondary" align="center">
                        Texto de exemplo
                      </TextoTematizado>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </CardSecao>
      </View>
    </Recipiente>
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
  separador: {
    borderTopWidth: 1,
    marginVertical: 8,
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