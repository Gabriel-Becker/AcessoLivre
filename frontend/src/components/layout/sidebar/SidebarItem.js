import React from 'react';
import theme, { getTheme } from '../../../config/theme';
import { Button } from '../../ui';

export default function SidebarItem({ icon, label, active, onPress, disabled = false, altoContraste = false }) {
  const t = altoContraste ? getTheme(true) : theme;
  const isDisabled = disabled;

  return (
    <Button
      variant="ghost"
      size="large"
      fullWidth
      align="left"
      iconLeft={icon}
      iconColor={isDisabled ? t.colors.textTertiary : active ? t.colors.primary : t.colors.textSecondary}
      textStyle={{ color: isDisabled ? t.colors.textTertiary : active ? t.colors.primary : t.colors.textSecondary }}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: t.borderRadius.md,
        marginBottom: 8,
        backgroundColor: active ? t.colors.backgroundSecondary : 'transparent',
        opacity: isDisabled ? 0.55 : 1,
      }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {label}
    </Button>
  );
}
