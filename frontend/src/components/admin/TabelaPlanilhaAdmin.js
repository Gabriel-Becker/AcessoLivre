import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card } from '../ui';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function TabelaPlanilhaAdmin({
  colunas = [],
  dados = [],
  chaveExtractor,
  renderVazio,
  carregando = false,
  larguraMinima = 920,
}) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(isHighContrast);

  return (
    <Card variant="outlined" style={styles.card} altoContraste={isHighContrast}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={[styles.tabela, { minWidth: larguraMinima }]}>
          <View style={[styles.linha, styles.cabecalho, { borderBottomColor: t.colors.border }]}>
            {colunas.map((coluna) => (
              <View
                key={coluna.chave}
                style={[
                  styles.celula,
                  {
                    flex: coluna.flex ?? 1,
                    minWidth: coluna.minWidth ?? 120,
                    maxWidth: coluna.maxWidth,
                    alignItems: coluna.alinhamento === 'center' ? 'center' : 'flex-start',
                  },
                ]}
              >
                <ThemedText size="xs" weight="bold" color="textSecondary" style={styles.tituloColuna}>
                  {coluna.titulo}
                </ThemedText>
              </View>
            ))}
          </View>

          <View>
            {carregando ? (
              <View style={styles.estadoVazio}>
                <ThemedText size="sm" color="textSecondary">
                  Carregando dados...
                </ThemedText>
              </View>
            ) : dados.length === 0 ? (
              <View style={styles.estadoVazio}>
                {renderVazio || (
                  <ThemedText size="sm" color="textSecondary">
                    Nenhum registro encontrado.
                  </ThemedText>
                )}
              </View>
            ) : (
              dados.map((item, indice) => {
                const chave = chaveExtractor ? chaveExtractor(item, indice) : String(indice);

                return (
                  <View
                    key={chave}
                    style={[
                      styles.linha,
                      styles.linhaDados,
                      { borderBottomColor: t.colors.borderLight },
                    ]}
                  >
                    {colunas.map((coluna) => (
                      <View
                        key={`${coluna.chave}-${chave}`}
                        style={[
                          styles.celula,
                          {
                            flex: coluna.flex ?? 1,
                            minWidth: coluna.minWidth ?? 120,
                            maxWidth: coluna.maxWidth,
                            alignItems: coluna.alinhamento === 'center' ? 'center' : 'flex-start',
                          },
                        ]}
                      >
                        {coluna.render(item, indice)}
                      </View>
                    ))}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  tabela: {
    width: '100%',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 16,
  },
  cabecalho: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  linhaDados: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  celula: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  tituloColuna: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  estadoVazio: {
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
});