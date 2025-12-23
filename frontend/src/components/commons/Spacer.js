import React from 'react';
import { View } from 'react-native';
import theme from '../../config/theme';

export default function Spacer({ size = 'md', horizontal = false, style }) {
  const spacing = theme.spacing[size] || theme.spacing.md;

  return (
    <View
      style={[
        horizontal ? { width: spacing } : { height: spacing },
        style,
      ]}
    />
  );
}
