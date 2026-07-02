import React from 'react';
import { View, StyleSheet, Share, Alert } from 'react-native';
import { Botao } from '../ui';
import toastHelper from '../../utils/toastHelper';

export default function AcoesLocal({ 
  local, 
  onAvaliar, 
  onReportar,
  isAuthenticated,
  altoContraste 
}) {
  
  const handleCompartilhar = async () => {
    try {
      await Share.share({
        message: `Confira o local ${local.nome} - um lugar acessível!`,
        title: `Compartilhar ${local.nome}`,
      });
    } catch (error) {
      toastHelper.showError('Erro ao compartilhar');
    }
  };

  const handleReportar = () => {
    Alert.alert(
      'Reportar problema',
      'Você quer reportar um problema com este local?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reportar', 
          onPress: () => onReportar?.(local),
          style: 'destructive'
        }
      ]
    );
  };

  const handleAvaliar = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login necessário',
        'Você precisa estar logado para avaliar um local.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer Login', onPress: () => onAvaliar?.('Entrar') }
        ]
      );
      return;
    }
    onAvaliar?.(local);
  };

  return (
    <View style={styles.Recipiente}>
      <Botao
        variant="outline"
        size="small"
        iconLeft="star-outline"
        onPress={handleAvaliar}
        altoContraste={altoContraste}
        style={styles.Botao}
      >
        Avaliar
      </Botao>
      
      <Botao
        variant="outline"
        size="small"
        iconLeft="share-social-outline"
        onPress={handleCompartilhar}
        altoContraste={altoContraste}
        style={styles.Botao}
      >
        Compartilhar
      </Botao>
      
      <Botao
        variant="outline"
        size="small"
        iconLeft="flag-outline"
        onPress={handleReportar}
        altoContraste={altoContraste}
        style={styles.Botao}
      >
        Reportar
      </Botao>
    </View>
  );
}

const styles = StyleSheet.create({
  Recipiente: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  Botao: {
    flex: 1,
  },
});
