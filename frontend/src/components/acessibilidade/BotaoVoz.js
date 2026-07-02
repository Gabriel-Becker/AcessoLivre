
import React, { useContext } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function BotaoVoz() {
  const { enabled, isListening, startListening, lastCommand } = useContext(AccessibilityContext);

  if (!enabled) return null;

  return (
    <TouchableOpacity 
      onPress={startListening}
      style={[styles.Botao, isListening && styles.buttonListening]}
      disabled={isListening}
    >
      {isListening ? (
        <>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.text}>Ouvindo...</Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>🎤</Text>
          <Text style={styles.text}>Assistente</Text>
        </>
      )}
      
      {lastCommand && !isListening && (
        <View style={styles.lastCommand}>
          <Text style={styles.commandText}>
            Último: {lastCommand}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  Botao: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonListening: {
    backgroundColor: '#FF3B30',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lastCommand: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 8,
  },
  commandText: {
    color: '#fff',
    fontSize: 12,
  },
});