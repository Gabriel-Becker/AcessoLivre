import React from 'react';
import { View, StyleSheet, Switch, useWindowDimensions } from 'react-native';
import { Container } from '../../components/layout';
import { CabecalhoPagina, CardSecao } from '../../components/ui';
import { ThemedText } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { breakpoints } from '../../config/theme';

export default function Configuracoes({ onNavigate }) {
  const { isHighContrast, toggleTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isMobile = width < (breakpoints.tablet || 768);

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
        </CardSecao>

        <CardSecao titulo="Sobre" icone="information-circle-outline" altoContraste={isHighContrast}>
          <ThemedText>Versão do app: 0.0.1</ThemedText>
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
});
