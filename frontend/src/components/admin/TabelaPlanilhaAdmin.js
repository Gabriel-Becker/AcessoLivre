import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
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
  sortField,
  sortDirection,
  onChangeSort,
  altoContraste = false,
}) {
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo);
  const corTexto = contrasteAtivo ? 'textOnPrimary' : 'textSecondary';

  return (
    <Card variant="outlined" style={styles.card} altoContraste={contrasteAtivo}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        style={[styles.scrollArea, contrasteAtivo && styles.scrollAreaContrast]}
      >
        <View style={[styles.tabela, { minWidth: larguraMinima }]}>
          <View style={[styles.linha, styles.cabecalho, { borderBottomColor: t.colors.border }]}>
            {colunas.map((coluna) => {
              const isSortable = Boolean(coluna.sortKey);
              const isActive = isSortable && sortField && (coluna.sortKey === sortField || coluna.chave === sortField);
              const indicator = isActive ? (String(sortDirection).toUpperCase() === 'ASC' ? '▲' : '▼') : '';

              return (
                <View
                  key={coluna.chave}
                  style={[
                    styles.celula,
                    {
                      flex: coluna.flex ?? 1,
                      minWidth: coluna.minWidth ?? 120,
                      maxWidth: coluna.maxWidth,
                      alignItems: coluna.alinhamento === 'center' ? 'center' : (coluna.alinhamento === 'right' ? 'flex-end' : 'flex-start'),
                    },
                  ]}
                >
                  {isSortable ? (
                    <TouchableOpacity onPress={() => onChangeSort && onChangeSort(coluna.sortKey || coluna.chave)}>
                      <ThemedText
                        size="xs"
                        weight="bold"
                        color={corTexto}
                        align={coluna.alinhamento === 'center' ? 'center' : (coluna.alinhamento === 'right' ? 'right' : 'left')}
                        style={styles.tituloColuna}
                        altoContraste={contrasteAtivo}
                      >
                        {coluna.titulo} {indicator}
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <ThemedText
                      size="xs"
                      weight="bold"
                      color={corTexto}
                      align={coluna.alinhamento === 'center' ? 'center' : 'left'}
                      style={styles.tituloColuna}
                      altoContraste={contrasteAtivo}
                    >
                      {coluna.titulo}
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </View>

          <View>
            {carregando ? (
              <View style={styles.estadoVazio}>
                <ThemedText size="sm" color={corTexto} altoContraste={contrasteAtivo}>
                  Carregando dados...
                </ThemedText>
              </View>
            ) : dados.length === 0 ? (
              <View style={styles.estadoVazio}>
                {renderVazio || (
                  <ThemedText size="sm" color={corTexto} altoContraste={contrasteAtivo}>
                    Nenhum registro encontrado.
                  </ThemedText>
                )}
              </View>
            ) : (
              dados.map((item, indice) => {
                const chave = chaveExtractor ? chaveExtractor(item, indice) : String(indice);
                const fundoLinha = indice % 2 === 0 ? t.colors.surface : t.colors.surfaceSecondary;

                return (
                  <View
                    key={chave}
                    style={[
                      styles.linha,
                      styles.linhaDados,
                      { borderBottomColor: t.colors.borderLight, backgroundColor: fundoLinha },
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
                              alignItems: coluna.alinhamento === 'center' ? 'center' : (coluna.alinhamento === 'right' ? 'flex-end' : 'flex-start'),
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
    borderRadius: 14,
  },
  scrollArea: {
    width: '100%',
  },
  scrollAreaContrast: Platform.OS === 'web'
    ? {
        scrollbarWidth: 'thin',
        scrollbarColor: '#00F7EF #0A0A0A',
      }
    : {},
  tabela: {
    width: '100%',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 14,
  },
  cabecalho: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  linhaDados: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  celula: {
    justifyContent: 'center',
    paddingRight: 10,
  },
  tituloColuna: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  estadoVazio: {
    paddingVertical: 24,
    paddingHorizontal: 14,
  },
});