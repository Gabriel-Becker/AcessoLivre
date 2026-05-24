import React from 'react';
import { getTheme } from '../../../config/theme';
import { useThemeContext } from '../../../context/ThemeContext';
import { Button } from '../../ui';

export default function SidebarItem({ icon, label, active, onPress, disabled = false, altoContraste }) {
  const { isHighContrast } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = contrasteAtivo ? getTheme(true) : getTheme(isHighContrast);
  const isDisabled = disabled;
  const corTextoSecundario = contrasteAtivo ? t.colors.textOnPrimary : t.colors.textSecondary;

  const inactiveStyle = {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: t.borderRadius.xl,
    marginBottom: 10,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.borderLight,
    justifyContent: 'flex-start',
  };

  const activeStyle = {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: t.borderRadius.xl,
    marginBottom: 10,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.borderLight,
    borderRightWidth: 4,
    borderRightColor: t.colors.primary,
    justifyContent: 'flex-start',
    shadowColor: 'transparent',
    elevation: 0,
  };

  return (
    <Button
      variant="ghost"
      size="large"
      fullWidth
      align="left"
      iconLeft={icon}
      iconColor={isDisabled ? corTextoSecundario : active ? t.colors.primary : corTextoSecundario}
      textStyle={{ color: isDisabled ? corTextoSecundario : active ? t.colors.primary : contrasteAtivo ? t.colors.textOnPrimary : t.colors.textPrimary }}
      style={active ? activeStyle : inactiveStyle}
      onPress={onPress}
      disabled={isDisabled}
    >
      {label}
    </Button>
  );
}
