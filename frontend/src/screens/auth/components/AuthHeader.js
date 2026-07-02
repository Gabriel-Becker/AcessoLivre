import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Espacador, TextoTematizado } from '../../../components/commons';
import theme, { getTheme } from '../../../config/theme';

export default function AuthHeader({ title, subtitle, altoContraste = false }) {
  const t = getTheme(altoContraste);
  const corPrincipal = altoContraste ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = altoContraste ? 'textOnPrimary' : 'textSecondary';

  return (
    <View style={styles.wrapper}>
      <Ionicons name="accessibility-outline" size={48} color={theme.colors.primary} />
      <Espacador size="sm" />
      <TextoTematizado variant="h2" align="center" weight="bold" altoContraste={altoContraste} color={corPrincipal} style={styles.tituloPrincipal}>
        AcessoLivre
      </TextoTematizado>
      <TextoTematizado color={corSecundaria} align="center" altoContraste={altoContraste} style={styles.subtitulo}>
        {subtitle || 'Acessibilidade para todos'}
      </TextoTematizado>
      {title ? (
        <>
          <Espacador size="lg" />
          <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={altoContraste} color={corPrincipal} style={styles.tituloPagina}>
            {title}
          </TextoTematizado>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  tituloPrincipal: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 760,
  },
  tituloPagina: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    maxWidth: 760,
  },
});
