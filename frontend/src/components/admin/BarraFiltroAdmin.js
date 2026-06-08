import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Select } from '../ui';
import { ThemedText, Spacer } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function BarraFiltroAdmin({
  titulo,
  subtitulo,
  pesquisa,
  onChangePesquisa,
  pesquisaPlaceholder = 'Pesquisar',
  filtros = [],
  onLimparFiltros,
  altoContraste = false,
}) {
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = getTheme(contrasteAtivo);
  const corPrincipal = contrasteAtivo ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = contrasteAtivo ? 'textOnPrimary' : 'textSecondary';

  return (
    <View style={styles.container}>
      <View>
        <ThemedText variant="h3" weight="bold" altoContraste={contrasteAtivo} color={corPrincipal}>
          {titulo}
        </ThemedText>
        {subtitulo ? (
          <>
            <Spacer size="xs" />
            <ThemedText color={corSecundaria} size="sm" altoContraste={contrasteAtivo}>
              {subtitulo}
            </ThemedText>
          </>
        ) : null}
      </View>

      <Spacer size="md" />

      <View style={styles.linhaPrincipal}>
        <Input
          placeholder={pesquisaPlaceholder}
          value={pesquisa}
          onChangeText={onChangePesquisa}
          leftIcon="search-outline"
          containerStyle={styles.campoPesquisa}
          style={styles.campoInput}
          altoContraste={contrasteAtivo}
        />

        <View style={styles.filtrosContainer}>
          {filtros.map((filtro) => (
            <Select
              key={filtro.chave}
              label={filtro.label}
              placeholder={filtro.placeholder || 'Todos'}
              value={filtro.valor}
              options={filtro.opcoes}
              onSelect={filtro.onSelect}
              containerStyle={styles.campoFiltro}
              style={styles.campoFiltroInterno}
              altoContraste={contrasteAtivo}
            />
          ))}
        </View>
      </View>

      {onLimparFiltros ? (
        <>
          <Spacer size="sm" />
          <ThemedText
            color={corSecundaria}
            size="sm"
            style={[styles.limparFiltros, { color: t.colors.primary }]}
            onPress={onLimparFiltros}
            altoContraste={contrasteAtivo}
          >
            Limpar filtros
          </ThemedText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  linhaPrincipal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-end',
  },
  campoPesquisa: {
    flex: 1,
    minWidth: 240,
    marginBottom: 0,
  },
  campoInput: {
    minHeight: 52,
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  campoFiltro: {
    minWidth: 190,
    marginBottom: 0,
  },
  campoFiltroInterno: {
    minHeight: 52,
  },
  limparFiltros: {
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
});