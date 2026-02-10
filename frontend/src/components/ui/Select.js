import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
  UIManager,
  findNodeHandle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function Select({
  label,
  placeholder = 'Selecione',
  value,
  options = [],
  onSelect,
  disabled = false,
  altoContraste,
  maxHeight = 280,
  style,
  containerStyle,
}) {
  const { isHighContrast } = useThemeContext();
  const contraste = altoContraste ?? isHighContrast;
  const t = getTheme(contraste);
  const [aberto, setAberto] = useState(false);
  const [ancora, setAncora] = useState(null);
  const inputRef = useRef(null);

  const estilos = useMemo(() => criarEstilos(t, contraste), [t, contraste]);

  const selecionado = options.find((opcao) => opcao.value === value);

  const handleSelect = (opcao) => {
    setAberto(false);
    onSelect?.(opcao.value, opcao);
  };

  const abrirDropdown = () => {
    if (disabled) return;
    const elemento = inputRef.current;

    if (Platform.OS === 'web' && elemento?.getBoundingClientRect) {
      const rect = elemento.getBoundingClientRect();
      setAncora({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
      setAberto(true);
      return;
    }

    const node = findNodeHandle(elemento);
    if (!node) {
      setAberto(true);
      return;
    }

    UIManager.measureInWindow(node, (x, y, width, height) => {
      setAncora({ x, y, width, height });
      setAberto(true);
    });
  };

  return (
    <View style={[estilos.container, containerStyle]}>
      {label ? (
        <ThemedText variant="caption" style={estilos.label} color="textPrimary">
          {label}
        </ThemedText>
      ) : null}

      <Pressable
        onPress={abrirDropdown}
        style={[
          estilos.input,
          disabled && estilos.inputDisabled,
          style,
        ]}
        accessibilityRole="button"
        ref={inputRef}
      >
        <ThemedText
          color={selecionado ? 'textPrimary' : 'textTertiary'}
          style={estilos.texto}
        >
          {selecionado?.label || placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={18} color={t.colors.textSecondary} />
      </Pressable>

      {aberto ? (
        <Modal
          visible={aberto}
          transparent
          animationType="fade"
          onRequestClose={() => setAberto(false)}
        >
          <Pressable style={estilos.overlay} onPress={() => setAberto(false)}>
            <Pressable
              style={[
                estilos.dropdownModal,
                { maxHeight },
                ancora
                  ? {
                      top: ancora.y + ancora.height + t.spacing.xs,
                      left: ancora.x,
                      width: ancora.width,
                    }
                  : null,
              ]}
              onPress={() => null}
            >
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => {
                  const ativo = item.value === value;
                  return (
                    <TouchableOpacity
                      style={[estilos.item, ativo && estilos.itemAtivo]}
                      onPress={() => handleSelect(item)}
                    >
                      <ThemedText color={ativo ? 'primary' : 'textPrimary'}>
                        {item.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={estilos.divisor} />}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

function criarEstilos(t, contraste) {
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    container: {
      marginBottom: t.spacing.sm,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      lineHeight: t.typography.fontSize.sm * t.typography.lineHeight.tight,
      fontWeight: t.typography.fontWeight.medium,
      marginBottom: t.spacing.xs,
      marginTop: 2,
    },
    input: {
      minHeight: 48,
      height: 48,
      borderWidth: 2,
      borderColor: t.colors.border,
      borderRadius: t.borderRadius.md,
      paddingHorizontal: t.spacing.sm,
      backgroundColor: t.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputDisabled: {
      backgroundColor: t.colors.backgroundTertiary,
      opacity: 0.7,
    },
    texto: {
      flex: 1,
      marginRight: t.spacing.sm,
      fontSize: t.typography.fontSize.md,
      lineHeight: t.typography.fontSize.md * t.typography.lineHeight.normal,
    },
    overlay: {
      position: isWeb ? 'fixed' : 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'transparent',
      zIndex: 9998,
    },
    dropdownModal: {
      position: isWeb ? 'fixed' : 'absolute',
      marginTop: 0,
      backgroundColor: t.colors.surface,
      borderRadius: t.borderRadius.md,
      borderWidth: contraste ? 2 : 1,
      borderColor: contraste ? t.colors.border : t.colors.borderLight,
      overflow: 'hidden',
      zIndex: 9999,
      elevation: 9999,
      ...(contraste ? t.shadows.none : t.shadows.lg),
    },
    dropdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.borderLight,
    },
    item: {
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
    },
    itemAtivo: {
      backgroundColor: t.colors.backgroundSecondary,
    },
    divisor: {
      height: 1,
      backgroundColor: t.colors.borderLight,
    },
  });
}
