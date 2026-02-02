// Input - Campo de texto reutilizável com suporte a temas
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const t = altoContraste ? getTheme(true) : theme;
  const hasError = !!error;
  const isPassword = secureTextEntry;

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
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
            { color: t.colors.textPrimary },
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textTertiary}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoComplete="off"
          autoCorrect={false}
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
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
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
