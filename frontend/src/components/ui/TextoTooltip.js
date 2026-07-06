import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { createPortal } from 'react-dom';
import { TextoTematizado } from '../commons';
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
  const hoverTimer = useRef(null);

  const texto = text || '';

  const resumido = useMemo(() => {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  }, [texto, maxLength]);

  const precisaTooltip = texto.length > maxLength;

  const handleHoverIn = useCallback(() => {
    if (!precisaTooltip) return;
    if (showTooltip) return;

    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }

    hoverTimer.current = setTimeout(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
        });
        setShowTooltip(true);
      }
      hoverTimer.current = null;
    }, 150);
  }, [precisaTooltip, showTooltip]);

  const handleHoverOut = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setShowTooltip(false);
  }, []);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web' && precisaTooltip) {
      setShowTooltip(true);
    }
  }, [precisaTooltip]);

  return (
    <>
      <Pressable
        ref={ref}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onPress={handlePress}
        style={styles.Recipiente}
      >
        <TextoTematizado
          variant="caption"
          color="textSecondary"
          numberOfLines={numberOfLines}
          altoContraste={contraste}
          permitirEscalaFonte={permitirEscalaFonte}
        >
          {resumido}
        </TextoTematizado>
      </Pressable>

      {Platform.OS === 'web' &&
        showTooltip &&
        precisaTooltip &&
        createPortal(
          <View
            pointerEvents="none"
            style={[
              styles.tooltip,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                top: position.top,
                left: position.left,
                transform: [{ translateX: -position.left > 0 ? -position.left : -190 }],
              },
            ]}
          >
            <TextoTematizado
              color="textPrimary"
              altoContraste={contraste}
            >
              {texto}
            </TextoTematizado>
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
                Descricao
              </TextoTematizado>

              <TextoTematizado
                altoContraste={contraste}
                color="textPrimary"
              >
                {texto}
              </TextoTematizado>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    position: 'relative',
    width: '100%',
  },

  tooltip: {
    position: 'fixed',

    pointerEvents: 'none',

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
