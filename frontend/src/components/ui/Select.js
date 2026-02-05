import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
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

  const estilos = useMemo(() => criarEstilos(t, contraste), [t, contraste]);

  const selecionado = options.find((opcao) => opcao.value === value);

  const handleSelect = (opcao) => {
    setAberto(false);
    onSelect?.(opcao.value, opcao);
  };

  return (
    <View style={[estilos.container, containerStyle]}>
      {label ? (
        <ThemedText style={estilos.label} color="textPrimary">
          {label}
        </ThemedText>
      ) : null}

      <Pressable
        onPress={() => !disabled && setAberto(true)}
        style={[
          estilos.input,
          disabled && estilos.inputDisabled,
          style,
        ]}
        accessibilityRole="button"
      >
        <ThemedText
          color={selecionado ? 'textPrimary' : 'textTertiary'}
          style={estilos.texto}
        >
          {selecionado?.label || placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={18} color={t.colors.textSecondary} />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={estilos.overlay} onPress={() => setAberto(false)}>
          <Pressable style={estilos.modalContainer} onPress={() => null}>
            <View style={[estilos.modal, { maxHeight }]}>
              <View style={estilos.modalHeader}>
                <ThemedText weight="semibold">{label || 'Selecione'}</ThemedText>
                <TouchableOpacity onPress={() => setAberto(false)}>
                  <Ionicons name="close" size={20} color={t.colors.textSecondary} />
                </TouchableOpacity>
              </View>

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
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function criarEstilos(t, contraste) {
  return StyleSheet.create({
    container: {
      marginBottom: t.spacing.sm,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      fontWeight: t.typography.fontWeight.medium,
      marginBottom: t.spacing.xs,
    },
    input: {
      minHeight: 48,
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
    },
    overlay: {
      flex: 1,
      backgroundColor: t.colors.overlayLight,
      justifyContent: 'center',
      padding: t.spacing.lg,
    },
    modalContainer: {
      width: '100%',
    },
    modal: {
      backgroundColor: t.colors.surface,
      borderRadius: t.borderRadius.lg,
      borderWidth: contraste ? 2 : 1,
      borderColor: contraste ? t.colors.border : t.colors.borderLight,
      overflow: 'hidden',
      ...(contraste ? t.shadows.none : t.shadows.lg),
    },
    modalHeader: {
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
