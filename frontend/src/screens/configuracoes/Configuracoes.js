// Tela de configurações do aplicativo
import { useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function Configuracoes() {
  const { enabled, alternarAcessibilidade } = useContext(AccessibilityContext);

  return (
    <View style={styles.Recipiente}>
      <View style={styles.itemConfiguracao}>
        <Text style={styles.textoConfiguracao}>Modo Acessibilidade</Text>
        <Switch
          value={enabled}
          onValueChange={alternarAcessibilidade}
          trackColor={{ false: '#767577', true: '#007AFF' }}
        />
      </View>
      {enabled && (
        <Text style={styles.dica}>
          Toque no botão de voz para usar comandos de voz
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemConfiguracao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  textoConfiguracao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dica: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
