import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function TooltipText({
  text,
  maxLength = 35,
  numberOfLines = 1,
  altoContraste,
  permitirEscalaFonte = true,
}) {
  const {
    isHighContrast,
    fontSizeMultiplier,
    theme: ctxTheme,
  } = useThemeContext();

  const contraste = altoContraste ?? isHighContrast;

  const theme =
    ctxTheme || getTheme(contraste, fontSizeMultiplier);

  const [showTooltip, setShowTooltip] = useState(false);

  const texto = text || '—';

  const resumido = useMemo(() => {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  }, [texto, maxLength]);

  const precisaTooltip = texto.length > maxLength;

  return (
    <>
      <Pressable
        onHoverIn={() =>
          Platform.OS === 'web' && setShowTooltip(true)
        }
        onHoverOut={() =>
          Platform.OS === 'web' && setShowTooltip(false)
        }
        onPress={() => {
          if (Platform.OS !== 'web' && precisaTooltip) {
            setShowTooltip(true);
          }
        }}
        style={styles.container}
      >
        <ThemedText
          variant="caption"
          color="textSecondary"
          numberOfLines={numberOfLines}
          altoContraste={contraste}
          permitirEscalaFonte={permitirEscalaFonte}
        >
          {resumido}
        </ThemedText>

        {Platform.OS === 'web' &&
          showTooltip &&
          precisaTooltip && (
            <View
              style={[
                styles.tooltip,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ThemedText
                color="textPrimary"
                altoContraste={contraste}
              >
                {texto}
              </ThemedText>
            </View>
          )}
      </Pressable>

      {Platform.OS !== 'web' && (
        <Modal
          visible={showTooltip}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTooltip(false)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setShowTooltip(false)}
          >
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <ThemedText
                weight="bold"
                style={styles.titulo}
                altoContraste={contraste}
              >
                Descrição
              </ThemedText>

              <ThemedText
                altoContraste={contraste}
                color="textPrimary"
              >
                {texto}
              </ThemedText>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },

  tooltip: {
    position: 'absolute',

    // Agora aparece acima do texto
    bottom: '100%',
    left: 0,

    marginBottom: 8,

    padding: 12,

    borderRadius: 10,
    borderWidth: 1,

    minWidth: 240,
    maxWidth: 380,

    zIndex: 999999,
    elevation: 999,

    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
  },

  titulo: {
    marginBottom: 12,
  },
});