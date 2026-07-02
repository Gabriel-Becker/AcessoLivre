import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextoTematizado } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';

const ReportarItem = memo(({
  motivo,
  selected,
  onPress,
  showDescription = false,
}) => {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <TouchableOpacity
      style={[
        styles.Recipiente,
        {
          backgroundColor: selected 
            ? isHighContrast ? '#1A1A1A' : '#E8F0FF'
            : 'transparent',
          borderColor: selected 
            ? t.colors.primary 
            : isHighContrast ? '#333' : '#E5E7EB',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.radioContainer}>
          <View style={[
            styles.radioOuter,
            {
              borderColor: selected ? t.colors.primary : (isHighContrast ? '#666' : '#D1D5DB'),
            },
          ]}>
            {selected && (
              <View style={[
                styles.radioInner,
                { backgroundColor: t.colors.primary },
              ]} />
            )}
          </View>
        </View>

        <View style={styles.textContainer}>
          <TextoTematizado 
            weight={selected ? 'bold' : 'regular'}
            style={[
              styles.title,
              { 
                color: selected ? t.colors.primary : t.colors.textPrimary,
                fontSize: isDesktop ? 14 : 15,
              }
            ]}
          >
            {motivo.label}
          </TextoTematizado>
          
          {showDescription && motivo.description && (
            <TextoTematizado 
              variant="caption" 
              color="textSecondary"
              style={[styles.description, { fontSize: isDesktop ? 11 : 12 }]}
            >
              {motivo.description}
            </TextoTematizado>
          )}
        </View>

        {motivo.icon && (
          <Ionicons 
            name={motivo.icon} 
            size={isDesktop ? 18 : 20} 
            color={selected ? t.colors.primary : t.colors.textSecondary} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
});

ReportarItem.displayName = 'ReportarItem';

const styles = StyleSheet.create({
  Recipiente: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    lineHeight: 20,
  },
  description: {
    lineHeight: 16,
  },
});

export default ReportarItem;