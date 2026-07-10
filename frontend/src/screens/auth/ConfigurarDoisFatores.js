import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Recipiente } from '../../components/layout';
import { Card, Botao, Entrada } from '../../components/ui';
import { Espacador, TextoTematizado } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { setup2FA, enable2FA, disable2FA, get2FAStatus } from '../../services/ServicoAutenticacao';
import toastHelper from '../../utils/toastHelper';

export default function ConfigurarDoisFatores({ navigation }) {
  const { theme: t, isHighContrast } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [processingEnable, setProcessingEnable] = useState(false);
  const [processingDisable, setProcessingDisable] = useState(false);

  async function checkStatus() {
    setLoading(true);
    try {
      const status = await get2FAStatus();
      setIsEnabled(status);
    } catch (error) {
      toastHelper.showError('Erro ao verificar status do 2FA');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void checkStatus();
  }, []);

  const handleSetup = async () => {
    let ocultarToastProcessamento;

    setLoading(true);
    try {
      ocultarToastProcessamento = toastHelper.showLoading('Gerando o QR Code e os códigos de recuperação...', 'Preparando 2FA');
      const result = await setup2FA();
      if (result.sucesso) {
        ocultarToastProcessamento?.();
        setQrData(result.dados);
        toastHelper.showSuccess('QR Code gerado! Escaneie com seu app autenticador');
      } else {
        ocultarToastProcessamento?.();
        toastHelper.showError(result.mensagem);
      }
    } catch (error) {
      ocultarToastProcessamento?.();
      toastHelper.showError('Erro ao gerar QR Code');
    } finally {
      ocultarToastProcessamento?.();
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toastHelper.showError('Digite o código de 6 dígitos');
      return;
    }

    let ocultarToastProcessamento;

    setProcessingEnable(true);
    try {
      ocultarToastProcessamento = toastHelper.showLoading('Validando o código e ativando a autenticação em dois fatores...', 'Ativando 2FA');
      const result = await enable2FA(parseInt(verificationCode, 10));
      if (result.sucesso) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess('2FA habilitado com sucesso!');
        setIsEnabled(true);
        setQrData(null);
        setVerificationCode('');
      } else {
        ocultarToastProcessamento?.();
        toastHelper.showError(result.mensagem);
      }
    } catch (error) {
      ocultarToastProcessamento?.();
      toastHelper.showError('Erro ao habilitar 2FA');
    } finally {
      ocultarToastProcessamento?.();
      setProcessingEnable(false);
    }
  };

  const handleDisable = async () => {
    Alert.alert(
      'Desabilitar 2FA',
      'Tem certeza que deseja desabilitar a autenticação de dois fatores? Isso reduzirá a segurança da sua conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desabilitar',
          style: 'destructive',
          onPress: async () => {
            let ocultarToastProcessamento;

            if (!verificationCode || verificationCode.length !== 6) {
              toastHelper.showError('Digite o código de 6 dígitos para confirmar');
              return;
            }

            setProcessingDisable(true);
            try {
              ocultarToastProcessamento = toastHelper.showLoading('Validando o código e desativando a autenticação em dois fatores...', 'Desativando 2FA');
              const result = await disable2FA(parseInt(verificationCode, 10));
              if (result.sucesso) {
                ocultarToastProcessamento?.();
                toastHelper.showSuccess('2FA desabilitado');
                setIsEnabled(false);
                setQrData(null);
                setVerificationCode('');
              } else {
                ocultarToastProcessamento?.();
                toastHelper.showError(result.mensagem);
              }
            } catch (error) {
              ocultarToastProcessamento?.();
              toastHelper.showError('Erro ao desabilitar 2FA');
            } finally {
              ocultarToastProcessamento?.();
              setProcessingDisable(false);
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    toastHelper.showSuccess('Copiado para a área de transferência');
  };

  const shareRecoveryCodes = async () => {
    if (qrData?.recoveryCodes) {
      const text = `Códigos de Recuperação 2FA - AcessoLivre\n\n${qrData.recoveryCodes.join('\n')}`;
      try {
        await Share.share({ message: text });
      } catch (error) {
        toastHelper.showError('Erro ao compartilhar códigos');
      }
    }
  };

  if (loading) {
    return (
      <Recipiente>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={t.colors.primary} />
          <Espacador size="md" />
          <TextoTematizado>Carregando...</TextoTematizado>
        </View>
      </Recipiente>
    );
  }

  return (
    <Recipiente>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.Cabecalho}>
          <Ionicons name="shield-checkmark" size={48} color={t.colors.primary} />
          <Espacador size="sm" />
          <TextoTematizado size="xxl" weight="bold" align="center">
            Autenticação de Dois Fatores
          </TextoTematizado>
          <Espacador size="xs" />
          <TextoTematizado color="textSecondary" align="center">
            Adicione uma camada extra de segurança à sua conta
          </TextoTematizado>
        </View>

        <Espacador size="xl" />

        {!isEnabled && !qrData && (
          <Card style={styles.card}>
            <TextoTematizado weight="semibold" size="lg">
              O que é 2FA?
            </TextoTematizado>
            <Espacador size="sm" />
            <TextoTematizado color="textSecondary">
              A autenticação de dois fatores adiciona uma camada extra de segurança, exigindo um código temporário
              gerado pelo seu app autenticador (como Google Authenticator ou Authy) além da sua senha.
            </TextoTematizado>
            <Espacador size="lg" />
            <Botao variant="primary" onPress={handleSetup}>
              Configurar 2FA
            </Botao>
          </Card>
        )}

        {!isEnabled && qrData && (
          <>
            <Card style={styles.card}>
              <TextoTematizado weight="semibold" size="lg" align="center">
                1. Escaneie o QR Code
              </TextoTematizado>
              <Espacador size="md" />
              
              {qrData.qrCode && (
                <View style={styles.qrContainer}>
                  <img 
                    src={qrData.qrCode} 
                    alt="QR Code 2FA" 
                    style={{ width: 320, height: 320, maxWidth: '100%', imageRendering: 'pixelated' }}
                  />
                </View>
              )}

              <Espacador size="md" />
              <TextoTematizado color="textSecondary" align="center" size="sm">
                Ou copie o código manualmente:
              </TextoTematizado>
              <Espacador size="xs" />
              
              <TouchableOpacity 
                style={styles.secretContainer}
                onPress={() => copyToClipboard(qrData.secretKey)}
              >
                <TextoTematizado weight="mono" size="sm">{qrData.secretKey}</TextoTematizado>
                <Ionicons name="copy-outline" size={20} color={t.colors.primary} />
              </TouchableOpacity>
            </Card>

            <Espacador size="md" />

            <Card style={styles.card}>
              <TextoTematizado weight="semibold" size="lg" align="center">
                2. Códigos de Recuperação
              </TextoTematizado>
              <Espacador size="sm" />
              <TextoTematizado color="textSecondary" align="center" size="sm">
                Guarde esses códigos em local seguro. Use-os caso perca acesso ao app autenticador.
              </TextoTematizado>
              <Espacador size="md" />

              <View style={styles.codesGrid}>
                {qrData.recoveryCodes?.map((code, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.codeItem}
                    onPress={() => copyToClipboard(code)}
                  >
                    <TextoTematizado weight="mono" size="sm">{code}</TextoTematizado>
                  </TouchableOpacity>
                ))}
              </View>

              <Espacador size="md" />
              <Botao variant="outline" onPress={shareRecoveryCodes} size="small">
                <Ionicons name="share-outline" size={16} /> Compartilhar Códigos
              </Botao>
            </Card>

            <Espacador size="md" />

            <Card style={styles.card}>
              <TextoTematizado weight="semibold" size="lg" align="center">
                3. Digite o Código de Verificação
              </TextoTematizado>
              <Espacador size="md" />

              <View style={styles.inputContainer}>
                <Text style={styles.Entrada}>
                  <Entrada
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{ 
                      fontSize: 24, 
                      textAlign: 'center', 
                      letterSpacing: 8,
                      border: '1px solid #ccc',
                      borderRadius: 8,
                      padding: 16,
                      width: '100%'
                    }}
                  />
                </Text>
              </View>

              <Espacador size="lg" />
              <Botao 
                variant="primary" 
                onPress={handleEnable}
                loading={processingEnable}
                disabled={processingEnable || verificationCode.length !== 6}
              >
                Habilitar 2FA
              </Botao>
            </Card>
          </>
        )}

        {isEnabled && (
          <Card style={styles.card}>
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={64} color={t.colors.success} />
              <Espacador size="md" />
              <TextoTematizado weight="bold" size="xl" align="center">
                2FA Ativado
              </TextoTematizado>
              <Espacador size="xs" />
              <TextoTematizado color="textSecondary" align="center">
                Sua conta está protegida com autenticação de dois fatores
              </TextoTematizado>
            </View>

            <Espacador size="xl" />

            <TextoTematizado weight="semibold" size="md">
              Para desabilitar o 2FA:
            </TextoTematizado>
            <Espacador size="sm" />
            <TextoTematizado color="textSecondary" size="sm">
              Digite o código atual do seu app autenticador
            </TextoTematizado>
            <Espacador size="md" />

            <View style={styles.inputContainer}>
              <Text style={styles.Entrada}>
                <Entrada
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ 
                    fontSize: 24, 
                    textAlign: 'center', 
                    letterSpacing: 8,
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    padding: 16,
                    width: '100%'
                  }}
                />
              </Text>
            </View>

            <Espacador size="lg" />
            <Botao 
              variant="danger" 
              onPress={handleDisable}
              loading={processingDisable}
              disabled={processingDisable || verificationCode.length !== 6}
            >
              Desabilitar 2FA
            </Botao>
          </Card>
        )}

        <Espacador size="xl" />
      </ScrollView>
    </Recipiente>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Cabecalho: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  card: {
    padding: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  codeItem: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  Entrada: {
    width: '100%',
  },
  statusContainer: {
    alignItems: 'center',
  },
});
