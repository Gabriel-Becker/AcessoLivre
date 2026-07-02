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
import { TextoTematizado } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function Selecao({
  label,
  labelStyle,
  placeholder = 'Selecione',
  value,
  options = [],
  onSelect,
  disabled = false,
  error,
  altoContraste,
  maxHeight = 280,
  style,
  containerStyle,
  permitirEscalaFonte = true,
}) {
  const { isHighContrast, fontSizeMultiplier, theme: ctxTheme } = useThemeContext();
  const contraste = altoContraste ?? isHighContrast;
  const t = typeof altoContraste === 'boolean'
    ? getTheme(contraste, fontSizeMultiplier)
    : ctxTheme || getTheme(contraste, fontSizeMultiplier);
  const [aberto, setAberto] = useState(false);
  const [ancora, setAncora] = useState(null);
  const inputRef = useRef(null);

  const estilos = useMemo(() => criarEstilos(t, contraste), [t, contraste]);

  const selecionado = options.find((opcao) => opcao.value === value);
  const hasError = Boolean(error);

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
    <View style={[estilos.Recipiente, containerStyle]}>
      {label ? (
        <TextoTematizado
          variant="caption"
          style={[estilos.label, labelStyle]}
          color="textPrimary"
          permitirEscalaFonte={permitirEscalaFonte}
        >
          {label}
        </TextoTematizado>
      ) : null}

      <Pressable
        onPress={abrirDropdown}
        style={[
          estilos.Entrada,
          hasError && estilos.inputError,
          disabled && estilos.inputDisabled,
          style,
        ]}
        accessibilityRole="Botao"
        ref={inputRef}
      >
        <View style={estilos.valorContainer}>
          {selecionado?.icon ? (
            <Ionicons name={selecionado.icon} size={16} color={t.colors.primary} style={estilos.itemIcone} />
          ) : null}
          <TextoTematizado
            color={selecionado ? 'textPrimary' : 'textTertiary'}
            style={estilos.texto}
            altoContraste={contraste}
            permitirEscalaFonte={permitirEscalaFonte}
            numberOfLines={1}
          >
            {selecionado?.label || placeholder}
          </TextoTematizado>
        </View>
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
                      <View style={estilos.itemConteudo}>
                        {item.icon ? (
                          <Ionicons name={item.icon} size={16} color={ativo ? t.colors.primary : t.colors.textSecondary} style={estilos.itemIcone} />
                        ) : null}
                        <TextoTematizado
                          color={ativo ? 'primary' : 'textPrimary'}
                          altoContraste={contraste}
                          permitirEscalaFonte={permitirEscalaFonte}
                          numberOfLines={1}
                        >
                          {item.label}
                        </TextoTematizado>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={estilos.divisor} />}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {hasError ? (
        <View style={estilos.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={t.colors.error} />
          <TextoTematizado
            color="error"
            variant="caption"
            style={estilos.errorText}
            permitirEscalaFonte={permitirEscalaFonte}
          >
            {error}
          </TextoTematizado>
        </View>
      ) : null}
    </View>
  );
}

function criarEstilos(t, contraste) {
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    Recipiente: {
      marginBottom: t.spacing.sm,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      lineHeight: t.typography.fontSize.sm * t.typography.lineHeight.tight,
      fontWeight: t.typography.fontWeight.medium,
      marginBottom: t.spacing.xs,
      marginTop: 2,
    },
    Entrada: {
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
    inputError: {
      borderColor: t.colors.error,
    },
    inputDisabled: {
      backgroundColor: t.colors.backgroundTertiary,
      opacity: 0.7,
    },
    texto: {
      flex: 1,
      marginRight: t.spacing.xs,
      fontSize: t.typography.fontSize.md,
      lineHeight: t.typography.fontSize.md * t.typography.lineHeight.normal,
    },
    valorContainer: {
      flex: 1,
      marginRight: t.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
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
    itemConteudo: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    itemIcone: {
      marginRight: t.spacing.xs,
    },
    itemAtivo: {
      backgroundColor: t.colors.backgroundSecondary,
    },
    divisor: {
      height: 1,
      backgroundColor: t.colors.borderLight,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: t.spacing.xs,
      justifyContent: 'center',
    },
    errorText: {
      marginLeft: t.spacing.xs,
      textAlign: 'center',
    },
  });
}
