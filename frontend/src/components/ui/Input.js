// Input - Campo de texto reutilizável com suporte a temas
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { getTheme } from '../../config/theme';

export default function Input({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  style,
  containerStyle,
  altoContraste = false,
  onFocus,
  onBlur,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const t = altoContraste ? getTheme(true) : theme;
  const hasError = !!error;
  const isPassword = secureTextEntry;
  
  // Se for campo de senha, ignora rightIcon passado
  const effectiveRightIcon = isPassword ? null : rightIcon;

  // Desabilita controles de senha do navegador na web
  useEffect(() => {
    if (Platform.OS === 'web' && isPassword) {
      const style = document.createElement('style');
      style.textContent = `
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none !important;
        }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-contacts-auto-fill-button {
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, [isPassword]);

  const getBorderColor = () => {
    if (hasError) return t.colors.error;
    if (isFocused) return t.colors.primary;
    return t.colors.border;
  };

  const getBackgroundColor = () => {
    if (disabled) return t.colors.backgroundTertiary;
    return t.colors.surface;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: t.colors.textPrimary }]}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          multiline && styles.inputContainerMultiline,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={t.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (effectiveRightIcon || isPassword) && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
            { color: t.colors.textPrimary },
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textTertiary}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoComplete={isPassword ? 'password' : 'off'}
          autoCorrect={false}
          textContentType={isPassword ? 'password' : 'none'}
          {...props}
        />
        
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={t.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : effectiveRightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={effectiveRightIcon}
              size={20}
              color={t.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={t.colors.error} />
          <Text style={[styles.errorText, { color: t.colors.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 48,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    paddingVertical: theme.spacing.sm,
    outlineStyle: 'none',
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.xs,
    textAlign: 'center',
  },
});
