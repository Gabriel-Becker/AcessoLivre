import React from 'react';
import theme, { getTheme } from '../../../config/theme';
import { Button } from '../../ui';

export default function SidebarItem({ icon, label, active, onPress, altoContraste = false }) {
  const t = altoContraste ? getTheme(true) : theme;

  return (
    <Button
      variant="ghost"
      size="large"
      fullWidth
      align="left"
      iconLeft={icon}
      iconColor={active ? t.colors.primary : t.colors.textSecondary}
      textStyle={{ color: active ? t.colors.primary : t.colors.textSecondary }}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: t.borderRadius.md,
        marginBottom: 4,
        backgroundColor: active ? t.colors.backgroundSecondary : 'transparent',
      }}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}
