<<<<<<< Updated upstream:frontend/src/components/ui/TooltipText.js
import React, { useMemo, useState, useRef } from 'react';
=======
﻿import React, { useMemo, useState } from 'react';
>>>>>>> Stashed changes:frontend/src/components/ui/TextoTooltip.js
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { createPortal } from 'react-dom';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function TextoTooltip({
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const texto = text || 'ï¿½';

  const resumido = useMemo(() => {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  }, [texto, maxLength]);

  const precisaTooltip = texto.length > maxLength;

  const handleHoverIn = () => {
    if (Platform.OS === 'web' && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 12,
        left: rect.left,
      });
      setShowTooltip(true);
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      setShowTooltip(false);
    }
  };

  return (
    <>
      <Pressable
        ref={ref}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onPress={() => {
          if (Platform.OS !== 'web' && precisaTooltip) {
            setShowTooltip(true);
          }
        }}
        style={styles.container}
      >
        <TextoTematizado
          variant="caption"
          color="textSecondary"
          numberOfLines={numberOfLines}
          altoContraste={contraste}
          permitirEscalaFonte={permitirEscalaFonte}
        >
          {resumido}
        </ThemedText>
<<<<<<< Updated upstream:frontend/src/components/ui/TooltipText.js
=======

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
              <TextoTematizado
                color="textPrimary"
                altoContraste={contraste}
              >
                {texto}
              </ThemedText>
            </View>
          )}
>>>>>>> Stashed changes:frontend/src/components/ui/TextoTooltip.js
      </Pressable>

      {Platform.OS === 'web' &&
        showTooltip &&
        precisaTooltip &&
        createPortal(
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                top: position.top,
                left: position.left,
              },
            ]}
          >
            <ThemedText
              color="textPrimary"
              altoContraste={contraste}
            >
              {texto}
            </ThemedText>
          </View>,
          document.body
        )}

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
              <TextoTematizado
                weight="bold"
                style={styles.titulo}
                altoContraste={contraste}
              >
                Descriï¿½ï¿½o
              </ThemedText>

              <TextoTematizado
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
    position: 'fixed',

    padding: 12,

    borderRadius: 10,
    borderWidth: 1,

    minWidth: 240,
    maxWidth: 380,

    zIndex: 999999999,
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