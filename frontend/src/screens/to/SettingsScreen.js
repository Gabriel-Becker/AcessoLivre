import { useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function SettingsScreen() {
  const { enabled, alternarAcessibilidade } = useContext(AccessibilityContext);

  return (
    <View style={styles.Recipiente}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Modo Acessibilidade</Text>
        <Switch
          value={enabled}
          onValueChange={alternarAcessibilidade}
          trackColor={{ false: '#767577', true: '#007AFF' }}
        />
      </View>
      {enabled && (
        <Text style={styles.hint}>
          Toque no botão para usar comandos de voz
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingText: {
    fontSize: 16,
  },
  hint: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});