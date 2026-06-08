
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import VoiceService from '../../services/acessibilidade/VoiceService';

export default function VoiceToggleButton() {
  const { enabled, toggle, isListening, startListening, lastCommand } = useContext(AccessibilityContext);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isTesting, setIsTesting] = useState(false);


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
    await VoiceService.speak('Teste de voz funcionando perfeitamente');
    setTimeout(() => setIsTesting(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header com ícone animado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Ionicons 
              name={enabled ? 'mic-circle' : 'mic-off-circle'} 
              size={28} 
              color={enabled ? '#4A90E2' : '#999'} 
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
          onValueChange={toggle}
          trackColor={{ false: '#767577', true: '#4A90E2' }}
          thumbColor={enabled ? '#fff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
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
              <Ionicons name="volume-high-outline" size={18} color="#4A90E2" />
              <Text style={styles.testButtonText}>
                {isTesting ? 'Testando...' : 'Testar'}
              </Text>
            </TouchableOpacity>
          </View>

          {lastCommand && !isListening && (
            <View style={styles.lastCommandCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#666" />
              <Text style={styles.lastCommandText}>
                Último comando: {lastCommand}
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
            size={24} 
            color="#fff" 
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
            <Ionicons name="bulb-outline" size={16} color="#4A90E2" /> 
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
                <Ionicons name={cmd.icon} size={18} color="#4A90E2" />
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusListening: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  statusIdle: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 13,
    color: '#555',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#e8f0fe',
    borderRadius: 20,
  },
  testButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  lastCommandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  lastCommandText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonListening: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commandsCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commandsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  commandText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  commandDesc: {
    fontSize: 11,
    color: '#888',
  },
});