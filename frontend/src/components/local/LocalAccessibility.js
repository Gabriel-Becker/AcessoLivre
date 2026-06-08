import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { CardSecao } from '../ui';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../config/theme';

// Mapeamento de ícones e labels
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
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const estilos = useMemo(() => criarEstilos(t, fontSizeMultiplier), [t, fontSizeMultiplier]);

  const recursos = useMemo(() => {
    if (!tiposAcessibilidade || tiposAcessibilidade.length === 0) return [];
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
      style={{ elevation: 0, shadowOpacity: 0, shadowRadius: 0 }} // ✅ Remove todas as sombras
    >
      <View style={styles.container}>
        {recursos.map((recurso, index) => (
          <View key={index} style={estilos.recursoItem}>
            <View style={[estilos.iconWrapper, { backgroundColor: t.colors.backgroundSecondary }]}>
              <Ionicons name={recurso.icon} size={estilos.tamanhoIcone} color={t.colors.primary} />
            </View>
            <ThemedText style={estilos.recursoLabel}>{recurso.label}</ThemedText>
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
});

function criarEstilos(t, fontSizeMultiplier) {
  const fonteGrande = fontSizeMultiplier >= 1.5;
  const tamanhoIcone = fonteGrande ? 26 : 22;
  const tamanhoBase = fonteGrande ? 46 : 40;

  return {
    recursoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: '46%',
    },
    iconWrapper: {
      width: tamanhoBase,
      height: tamanhoBase,
      borderRadius: Math.round(tamanhoBase / 2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    tamanhoIcone,
    recursoLabel: {
      fontSize: fonteGrande ? t.typography.fontSize.lg : t.typography.fontSize.md,
      lineHeight: Math.round((fonteGrande ? t.typography.fontSize.lg : t.typography.fontSize.md) * 1.3),
    },
  };
}