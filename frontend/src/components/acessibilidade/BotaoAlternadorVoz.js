
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useThemeContext } from '../../context/ThemeContext';
import ServicoVoz from '../../services/acessibilidade/ServicoVoz';

export default function BotaoAlternadorVoz() {
  const { enabled, alternarAcessibilidade, isListening, startListening, lastCommand } = useContext(AccessibilityContext);
  const { fontSizeMultiplier, isHighContrast, theme } = useThemeContext();
  const escala = Math.max(1, Number(fontSizeMultiplier) || 1);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isTesting, setIsTesting] = useState(false);
  const paleta = useMemo(
    () => ({
      primaria: theme.colors.primary,
      textoPrimario: theme.colors.textPrimary,
      textoSecundario: theme.colors.textSecondary,
      textoTerciario: theme.colors.textTertiary,
      textoInverso: theme.colors.textOnPrimary || '#FFFFFF',
      superficie: theme.colors.surface,
      superficieSecundaria: theme.colors.surfaceSecondary,
      borda: isHighContrast ? theme.colors.border : theme.colors.borderLight,
      bordaSuave: theme.colors.borderLight,
      erro: theme.colors.error || '#FF3B30',
      sucesso: theme.colors.success || '#34C759',
      switchOff: isHighContrast ? theme.colors.border : '#767577',
      thumbOff: isHighContrast ? theme.colors.surfaceSecondary : '#f4f3f4',
      thumbOn: theme.colors.textOnPrimary || '#FFFFFF',
      fundoIOS: isHighContrast ? theme.colors.border : '#3e3e3e',
    }),
    [theme, isHighContrast]
  );

  const styles = useMemo(() => criarEstilos(escala, paleta, isHighContrast), [escala, paleta, isHighContrast]);


  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  const testVoice = async () => {
    setIsTesting(true);
    await ServicoVoz.speak('Teste de voz funcionando perfeitamente');
    setTimeout(() => setIsTesting(false), 2000);
  };

  return (
    <View style={styles.Recipiente}>
      {/* Cabecalho com ácone animado */}
      <View style={styles.Cabecalho}>
        <View style={styles.headerLeft}>
          <Animated.View style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Ionicons 
              name={enabled ? 'mic-circle' : 'mic-off-circle'} 
              size={Math.round(28 * escala)} 
              color={enabled ? paleta.primaria : paleta.textoTerciario} 
            />
          </Animated.View>
          <View>
            <Text style={styles.title}>Assistente por Voz</Text>
            <Text style={styles.subtitle}>
              {enabled 
                ? 'Controle o app com comandos de voz' 
                : 'Ative para usar comandos de voz'}
            </Text>
          </View>
        </View>
        <Switch
          value={enabled}
          onValueChange={alternarAcessibilidade}
          trackColor={{ false: paleta.switchOff, true: paleta.primaria }}
          thumbColor={enabled ? paleta.thumbOn : paleta.thumbOff}
          ios_backgroundColor={paleta.fundoIOS}
          style={{ transform: [{ scale: escala }], marginLeft: Math.round((escala - 1) * 20) }}
        />
      </View>

      {/* Status atual */}
      {enabled && (
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                isListening ? styles.statusListening : styles.statusIdle
              ]} />
              <Text style={styles.statusText}>
                {isListening ? 'Ouvindo...' : 'Pronto para ouvir'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={testVoice}
              disabled={isTesting}
            >
              <Ionicons name="volume-high-outline" size={Math.round(18 * escala)} color={paleta.primaria} />
              <Text style={styles.testButtonText}>
                {isTesting ? 'Testando...' : 'Testar'}
              </Text>
            </TouchableOpacity>
          </View>

          {lastCommand && !isListening && (
            <View style={styles.lastCommandCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={Math.round(16 * escala)} color={paleta.textoSecundario} />
              <Text style={styles.lastCommandText}>
                último comando: {lastCommand}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Botão de ação rápida */}
      {enabled && (
        <TouchableOpacity 
          style={[styles.actionButton, isListening && styles.actionButtonListening]}
          onPress={startListening}
          disabled={isListening}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isListening ? 'ear-outline' : 'mic-outline'} 
            size={Math.round(24 * escala)} 
            color={paleta.textoInverso}
          />
          <Text style={styles.actionButtonText}>
            {isListening ? 'Escutando...' : 'Falar comando agora'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Lista de comandos disponíveis */}
      {enabled && (
        <View style={styles.commandsCard}>
          <Text style={styles.commandsTitle}>
            <Ionicons name="bulb-outline" size={Math.round(16 * escala)} color={paleta.primaria} /> 
            {' '}Comandos disponíveis
          </Text>
          <View style={styles.commandsGrid}>
            {[
              { icon: 'home-outline', command: 'home', desc: 'Página inicial' },
              { icon: 'person-outline', command: 'perfil', desc: 'Meu perfil' },
              { icon: 'alert-circle-outline', command: 'denunciar', desc: 'Fazer denúncia' },
              { icon: 'arrow-back-outline', command: 'voltar', desc: 'Voltar tela' },
              { icon: 'help-circle-outline', command: 'ajuda', desc: 'Mostrar comandos' },
              { icon: 'log-out-outline', command: 'sair', desc: 'Sair do app' },
            ].map((cmd, index) => (
              <View key={index} style={styles.commandItem}>
                <Ionicons name={cmd.icon} size={Math.round(18 * escala)} color={paleta.primaria} />
                <Text style={styles.commandText}>{cmd.command}</Text>
                <Text style={styles.commandDesc}>{cmd.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function criarEstilos(e, paleta, isHighContrast) {
  const s = (v) => Math.round(v * e);
  return StyleSheet.create({
    Recipiente: {
      marginBottom: s(20),
    },
    Cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: s(12),
      paddingHorizontal: s(16),
      backgroundColor: paleta.superficie,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: paleta.borda,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      flex: 1,
    },
    iconContainer: {
      width: s(44),
      height: s(44),
      borderRadius: s(22),
      backgroundColor: paleta.superficieSecundaria,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: s(16),
      fontWeight: '600',
      color: paleta.textoPrimario,
    },
    subtitle: {
      fontSize: s(12),
      color: paleta.textoSecundario,
      marginTop: s(2),
    },
    statusCard: {
      marginTop: s(12),
      padding: s(12),
      backgroundColor: paleta.superficieSecundaria,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: paleta.borda,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
    },
    statusDot: {
      width: s(8),
      height: s(8),
      borderRadius: s(4),
    },
    statusListening: {
      backgroundColor: paleta.erro,
      shadowColor: paleta.erro,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isHighContrast ? 0 : 0.5,
      shadowRadius: s(4),
    },
    statusIdle: {
      backgroundColor: paleta.sucesso,
    },
    statusText: {
      fontSize: s(13),
      color: paleta.textoSecundario,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      paddingVertical: s(4),
      paddingHorizontal: s(10),
      backgroundColor: paleta.superficie,
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: paleta.borda,
    },
    testButtonText: {
      fontSize: s(12),
      color: paleta.primaria,
      fontWeight: '500',
    },
    lastCommandCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginTop: s(10),
      paddingTop: s(10),
      borderTopWidth: 1,
      borderTopColor: paleta.bordaSuave,
    },
    lastCommandText: {
      fontSize: s(12),
      color: paleta.textoSecundario,
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(10),
      marginTop: s(16),
      paddingVertical: s(14),
      backgroundColor: paleta.primaria,
      borderRadius: s(12),
      shadowColor: paleta.primaria,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isHighContrast ? 0 : 0.2,
      shadowRadius: s(4),
      elevation: isHighContrast ? 0 : 3,
    },
    actionButtonListening: {
      backgroundColor: paleta.erro,
      shadowColor: paleta.erro,
    },
    actionButtonText: {
      color: paleta.textoInverso,
      fontSize: s(16),
      fontWeight: '600',
    },
    commandsCard: {
      marginTop: s(16),
      padding: s(14),
      backgroundColor: paleta.superficie,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: paleta.borda,
    },
    commandsTitle: {
      fontSize: s(14),
      fontWeight: '600',
      color: paleta.textoPrimario,
      marginBottom: s(12),
    },
    commandsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
    commandItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      backgroundColor: paleta.superficieSecundaria,
      paddingHorizontal: s(10),
      paddingVertical: s(6),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: paleta.borda,
    },
    commandText: {
      fontSize: s(12),
      fontWeight: '600',
      color: paleta.primaria,
    },
    commandDesc: {
      fontSize: s(11),
      color: paleta.textoTerciario,
    },
  });
}