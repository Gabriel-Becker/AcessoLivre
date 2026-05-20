import React from 'react';
import theme, { getTheme } from '../../../config/theme';
import { Button } from '../../ui';

export default function SidebarItem({ icon, label, active, onPress, disabled = false, altoContraste = false }) {
  const t = altoContraste ? getTheme(true) : theme;
  const isDisabled = disabled;

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
      iconColor={isDisabled ? t.colors.textTertiary : active ? t.colors.primary : t.colors.textSecondary}
      textStyle={{ color: isDisabled ? t.colors.textTertiary : active ? t.colors.primary : t.colors.textPrimary }}
      style={active ? activeStyle : inactiveStyle}
      onPress={onPress}
      disabled={isDisabled}
    >
      {label}
    </Button>
  );
}
