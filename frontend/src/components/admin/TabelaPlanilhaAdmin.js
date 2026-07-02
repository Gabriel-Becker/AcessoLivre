import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Card } from '../ui';
import { TextoTematizado } from '../commons';
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
            {colunas.map((coluna, colIndex) => {
              const isSortable = Boolean(coluna.sortKey);
              const isActive = isSortable && sortField && (coluna.sortKey === sortField || coluna.chave === sortField);
              const indicator = isActive ? (String(sortDirection).toUpperCase() === 'ASC' ? 'â–²' : 'â–¼') : '';
              const isCenter = coluna.alinhamento === 'center';
              const paddingHorizontal = isCenter ? 0 : 6;
              const isLast = colIndex === colunas.length - 1;

              return (
                <View
                  key={coluna.chave}
                  style={[
                    styles.celula,
                    {
                      flex: coluna.flex ?? 1,
                      minWidth: coluna.minWidth ?? 120,
                      maxWidth: coluna.maxWidth,
                      alignItems: isCenter ? 'center' : (coluna.alinhamento === 'right' ? 'flex-end' : 'flex-start'),
                      paddingLeft: paddingHorizontal,
                      paddingRight: isLast ? 0 : paddingHorizontal,
                    },
                  ]}
                >
                  {isSortable ? (
                    <TouchableOpacity onPress={() => onChangeSort && onChangeSort(coluna.sortKey || coluna.chave)}>
                      <TextoTematizado
                        size="xs"
                        weight="bold"
                        color={corTexto}
                        align={isCenter ? 'center' : (coluna.alinhamento === 'right' ? 'right' : 'left')}
                        style={styles.tituloColuna}
                        altoContraste={contrasteAtivo}
                      >
                        {coluna.titulo} {indicator}
                      </TextoTematizado>
                    </TouchableOpacity>
                  ) : (
                    <TextoTematizado
                      size="xs"
                      weight="bold"
                      color={corTexto}
                      align={isCenter ? 'center' : 'left'}
                      style={styles.tituloColuna}
                      altoContraste={contrasteAtivo}
                    >
                      {coluna.titulo}
                    </TextoTematizado>
                  )}
                </View>
              );
            })}
          </View>

          <View>
            {carregando ? (
              <View style={styles.estadoVazio}>
                <TextoTematizado size="sm" color={corTexto} altoContraste={contrasteAtivo}>
                  Carregando dados...
                </TextoTematizado>
              </View>
            ) : dados.length === 0 ? (
              <View style={styles.estadoVazio}>
                {renderVazio || (
                  <TextoTematizado size="sm" color={corTexto} altoContraste={contrasteAtivo}>
                    Nenhum registro encontrado.
                  </TextoTematizado>
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
                    {colunas.map((coluna, colIndex) => (
                      <View
                        key={`${coluna.chave}-${chave}`}
                        style={[
                          styles.celula,
                          {
                            flex: coluna.flex ?? 1,
                            minWidth: coluna.minWidth ?? 120,
                            maxWidth: coluna.maxWidth,
                            alignItems: coluna.alinhamento === 'center' ? 'center' : (coluna.alinhamento === 'right' ? 'flex-end' : 'flex-start'),
                            paddingRight: coluna.alinhamento === 'right' ? 0 : (colIndex === colunas.length - 1 ? 0 : styles.celula.paddingRight),
                            paddingLeft: coluna.alinhamento === 'center' ? 0 : (coluna.chave === 'nome' ? 12 : 6),
                          },
                        ]}
                      >
                        {coluna.render(item, indice, contrasteAtivo)}
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
    paddingHorizontal: 0,
  },
  cabecalho: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  linhaDados: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  celula: {
    justifyContent: 'center',
    paddingRight: 6,
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