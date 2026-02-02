import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function VerifyEmailModal({ visible, email, onClose, onSuccess, onConfirm, onResend }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerificar = async () => {
    if (!codigo || codigo.length !== 6) {
      Alert.alert('Erro', 'Digite o código de 6 dígitos');
      return;
    }

    if (!onConfirm) {
      Alert.alert('Erro', 'Confirmação indisponível no momento.');
      return;
    }

    setLoading(true);
    try {
      const resultado = await onConfirm(codigo);

      if (resultado?.sucesso) {
        setCodigo('');
        setLoading(false);
        Alert.alert('Sucesso', 'Email verificado com sucesso!', [
          { 
            text: 'OK', 
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            }
          }
        ]);
      } else {
        setLoading(false);
        Alert.alert('Erro', resultado?.mensagem || 'Código inválido ou expirado');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Erro ao verificar código. Tente novamente.');
    }
  };

  const handleReenviar = async () => {
    if (!onResend) {
      Alert.alert('Aviso', 'Reenvio indisponível no momento.');
      return;
    }

    setResending(true);
    try {
      const resultado = await onResend();

      if (resultado?.sucesso) {
        Alert.alert('Sucesso', 'Código reenviado para seu email');
      } else {
        Alert.alert('Erro', resultado?.mensagem || 'Erro ao reenviar código');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao reenviar código. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.titulo}>Verificar Email</Text>
          
          <Text style={styles.descricao}>
            Enviamos um código de 6 dígitos para:
          </Text>
          <Text style={styles.email}>{email}</Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#999"
            value={codigo}
            onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.botaoVerificar, loading && styles.botaoDisabled]}
            onPress={handleVerificar}
            disabled={loading || codigo.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.textoBotaoVerificar}>Verificar</Text>
            )}
          </TouchableOpacity>

          {onResend ? (
            <TouchableOpacity
              style={styles.botaoReenviar}
              onPress={handleReenviar}
              disabled={resending}
            >
              <Text style={styles.textoBotaoReenviar}>
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.botaoFechar} onPress={onClose}>
            <Text style={styles.textoBotaoFechar}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  botaoVerificar: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoDisabled: {
    backgroundColor: '#CCC',
  },
  textoBotaoVerificar: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoReenviar: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoBotaoReenviar: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  botaoFechar: {
    padding: 12,
    alignItems: 'center',
  },
  textoBotaoFechar: {
    color: '#999',
    fontSize: 14,
  },
});
