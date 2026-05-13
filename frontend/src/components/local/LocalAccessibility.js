import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, CardSecao } from '../ui';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

// Mapeamento de ícones e labels (reaproveitado do LocalCard)
const ACCESSIBILITY_CONFIG = {
  RAMPA: { icon: 'logo-usd', label: 'Rampa' },
  ELEVADOR: { icon: 'arrow-up-outline', label: 'Elevador' },
  BANHEIRO_ADAPTADO: { icon: 'body-outline', label: 'Sanitário Adaptado' },
  ESTACIONAMENTO: { icon: 'car-outline', label: 'Estacionamento' },
  PISO_TATIL: { icon: 'eye-outline', label: 'Piso Tátil' },
  ATENDIMENTO_ESPECIALIZADO: { icon: 'hand-left-outline', label: 'Atendimento Especializado' },
  RECURSOS_AUDIOVISUAIS: { icon: 'mic-outline', label: 'Recursos Audiovisuais' },
  SINALIZACAO_BRAILLE: { icon: 'braille-outline', label: 'Sinalização em Braile' },
  ESPACO_AMPLO: { icon: 'resize-outline', label: 'Espaço Amplo' },
  MOBILIARIO_ADAPTADO: { icon: 'grid-outline', label: 'Mobiliário Adaptado' },
};

export default function LocalAccessibility({ tiposAcessibilidade = [], altoContraste }) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);

  const recursos = useMemo(() => {
    return tiposAcessibilidade.map(tipo => ({
      tipo,
      ...ACCESSIBILITY_CONFIG[tipo] || { icon: 'construct-outline', label: tipo }
    }));
  }, [tiposAcessibilidade]);

  if (recursos.length === 0) {
    return null;
  }

  return (
    <CardSecao
      titulo="Recursos de Acessibilidade"
      icone="accessibility-outline"
      altoContraste={altoContraste ?? isHighContrast}
    >
      <View style={styles.container}>
        {recursos.map((recurso, index) => (
          <View key={index} style={styles.recursoItem}>
            <View style={[styles.iconWrapper, { backgroundColor: t.colors.backgroundSecondary }]}>
              <Ionicons name={recurso.icon} size={20} color={t.colors.primary} />
            </View>
            <ThemedText>{recurso.label}</ThemedText>
          </View>
        ))}
      </View>
    </CardSecao>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recursoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});