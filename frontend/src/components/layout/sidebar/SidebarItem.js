import React, { useMemo } from 'react';
import { getTheme } from '../../../config/theme';
import { useThemeContext } from '../../../context/ThemeContext';
import { Button } from '../../ui';

export default function SidebarItem({ icon, label, active, onPress, disabled = false, altoContraste, modoExpandido = false, fontSizeMultiplier = 1 }) {
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = contrasteAtivo ? getTheme(true) : getTheme(isHighContrast);
  const isDisabled = disabled;
  const corTextoSecundario = contrasteAtivo ? t.colors.textOnPrimary : t.colors.textSecondary;
  const buttonStyles = useMemo(() => {
    const tamanhoExpandido = fontSizeMultiplier >= 2 ? 24 : 20;
    const paddingHorizontalExpandido = fontSizeMultiplier >= 2 ? 22 : 18;
    const paddingVerticalExpandido = fontSizeMultiplier >= 2 ? 22 : 18;

    const base = {
      paddingVertical: modoExpandido ? paddingVerticalExpandido : 12,
      paddingHorizontal: modoExpandido ? paddingHorizontalExpandido : 12,
      borderRadius: t.borderRadius.xl,
      marginBottom: modoExpandido ? 0 : 10,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderLight,
      minHeight: modoExpandido ? (fontSizeMultiplier >= 2 ? 76 : 68) : undefined,
      justifyContent: 'flex-start',
    };

    const ativo = {
      ...base,
      borderRightWidth: modoExpandido ? 1 : 4,
      borderRightColor: modoExpandido ? t.colors.primary : t.colors.primary,
      shadowColor: 'transparent',
      elevation: 0,
    };

    return {
      inactive: base,
      active: ativo,
    };
  }, [modoExpandido, t]);

  return (
    <Button
      variant="ghost"
      size={modoExpandido ? 'large' : 'large'}
      fullWidth
      align="left"
      iconLeft={icon}
      iconSize={modoExpandido ? (fontSizeMultiplier >= 2 ? 28 : 24) : 20}
      iconColor={isDisabled ? corTextoSecundario : active ? t.colors.primary : corTextoSecundario}
      textStyle={{
        color: isDisabled ? corTextoSecundario : active ? t.colors.primary : contrasteAtivo ? t.colors.textOnPrimary : t.colors.textPrimary,
        fontSize: modoExpandido ? (fontSizeMultiplier >= 2 ? 22 : 20) : undefined,
        lineHeight: modoExpandido ? (fontSizeMultiplier >= 2 ? 26 : 24) : undefined,
      }}
      style={active ? buttonStyles.active : buttonStyles.inactive}
      onPress={onPress}
      disabled={isDisabled}
    >
      {label}
    </Button>
  );
}
