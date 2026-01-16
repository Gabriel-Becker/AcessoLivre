import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Container } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { setup2FA, enable2FA, disable2FA, get2FAStatus } from '../../services/AuthService';
import toastHelper from '../../utils/toastHelper';

export default function TwoFactorSetup({ navigation }) {
  const { theme: t, isHighContrast } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [processingEnable, setProcessingEnable] = useState(false);
  const [processingDisable, setProcessingDisable] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const status = await get2FAStatus();
      setIsEnabled(status);
    } catch (error) {
      toastHelper.showError('Erro ao verificar status do 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const result = await setup2FA();
      if (result.sucesso) {
        setQrData(result.dados);
        toastHelper.showSuccess('QR Code gerado! Escaneie com seu app autenticador');
      } else {
        toastHelper.showError(result.mensagem);
      }
    } catch (error) {
      toastHelper.showError('Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toastHelper.showError('Digite o código de 6 dígitos');
      return;
    }

    setProcessingEnable(true);
    try {
      const result = await enable2FA(parseInt(verificationCode, 10));
      if (result.sucesso) {
        toastHelper.showSuccess('2FA habilitado com sucesso!');
        setIsEnabled(true);
        setQrData(null);
        setVerificationCode('');
      } else {
        toastHelper.showError(result.mensagem);
      }
    } catch (error) {
      toastHelper.showError('Erro ao habilitar 2FA');
    } finally {
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
            if (!verificationCode || verificationCode.length !== 6) {
              toastHelper.showError('Digite o código de 6 dígitos para confirmar');
              return;
            }

            setProcessingDisable(true);
            try {
              const result = await disable2FA(parseInt(verificationCode, 10));
              if (result.sucesso) {
                toastHelper.showSuccess('2FA desabilitado');
                setIsEnabled(false);
                setQrData(null);
                setVerificationCode('');
              } else {
                toastHelper.showError(result.mensagem);
              }
            } catch (error) {
              toastHelper.showError('Erro ao desabilitar 2FA');
            } finally {
              setProcessingDisable(false);
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    toastHelper.showSuccess('Copiado para área de transferência');
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
      <Container>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={t.colors.primary} />
          <Spacer size="md" />
          <ThemedText>Carregando...</ThemedText>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={48} color={t.colors.primary} />
          <Spacer size="sm" />
          <ThemedText size="xxl" weight="bold" align="center">
            Autenticação de Dois Fatores
          </ThemedText>
          <Spacer size="xs" />
          <ThemedText color="textSecondary" align="center">
            Adicione uma camada extra de segurança à sua conta
          </ThemedText>
        </View>

        <Spacer size="xl" />

        {!isEnabled && !qrData && (
          <Card style={styles.card}>
            <ThemedText weight="semibold" size="lg">
              O que é 2FA?
            </ThemedText>
            <Spacer size="sm" />
            <ThemedText color="textSecondary">
              A autenticação de dois fatores adiciona uma camada extra de segurança, exigindo um código temporário
              gerado pelo seu app autenticador (como Google Authenticator ou Authy) além da sua senha.
            </ThemedText>
            <Spacer size="lg" />
            <Button variant="primary" onPress={handleSetup}>
              Configurar 2FA
            </Button>
          </Card>
        )}

        {!isEnabled && qrData && (
          <>
            <Card style={styles.card}>
              <ThemedText weight="semibold" size="lg" align="center">
                1. Escaneie o QR Code
              </ThemedText>
              <Spacer size="md" />
              
              {qrData.qrCode && (
                <View style={styles.qrContainer}>
                  <img 
                    src={qrData.qrCode} 
                    alt="QR Code 2FA" 
                    style={{ width: 200, height: 200 }}
                  />
                </View>
              )}

              <Spacer size="md" />
              <ThemedText color="textSecondary" align="center" size="sm">
                Ou copie o código manualmente:
              </ThemedText>
              <Spacer size="xs" />
              
              <TouchableOpacity 
                style={styles.secretContainer}
                onPress={() => copyToClipboard(qrData.secretKey)}
              >
                <ThemedText weight="mono" size="sm">{qrData.secretKey}</ThemedText>
                <Ionicons name="copy-outline" size={20} color={t.colors.primary} />
              </TouchableOpacity>
            </Card>

            <Spacer size="md" />

            <Card style={styles.card}>
              <ThemedText weight="semibold" size="lg" align="center">
                2. Códigos de Recuperação
              </ThemedText>
              <Spacer size="sm" />
              <ThemedText color="textSecondary" align="center" size="sm">
                Guarde esses códigos em local seguro. Use-os caso perca acesso ao app autenticador.
              </ThemedText>
              <Spacer size="md" />

              <View style={styles.codesGrid}>
                {qrData.recoveryCodes?.map((code, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.codeItem}
                    onPress={() => copyToClipboard(code)}
                  >
                    <ThemedText weight="mono" size="sm">{code}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <Spacer size="md" />
              <Button variant="outline" onPress={shareRecoveryCodes} size="small">
                <Ionicons name="share-outline" size={16} /> Compartilhar Códigos
              </Button>
            </Card>

            <Spacer size="md" />

            <Card style={styles.card}>
              <ThemedText weight="semibold" size="lg" align="center">
                3. Digite o Código de Verificação
              </ThemedText>
              <Spacer size="md" />

              <View style={styles.inputContainer}>
                <Text style={styles.input}>
                  <input
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

              <Spacer size="lg" />
              <Button 
                variant="primary" 
                onPress={handleEnable}
                loading={processingEnable}
                disabled={processingEnable || verificationCode.length !== 6}
              >
                Habilitar 2FA
              </Button>
            </Card>
          </>
        )}

        {isEnabled && (
          <Card style={styles.card}>
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={64} color={t.colors.success} />
              <Spacer size="md" />
              <ThemedText weight="bold" size="xl" align="center">
                2FA Ativado
              </ThemedText>
              <Spacer size="xs" />
              <ThemedText color="textSecondary" align="center">
                Sua conta está protegida com autenticação de dois fatores
              </ThemedText>
            </View>

            <Spacer size="xl" />

            <ThemedText weight="semibold" size="md">
              Para desabilitar o 2FA:
            </ThemedText>
            <Spacer size="sm" />
            <ThemedText color="textSecondary" size="sm">
              Digite o código atual do seu app autenticador
            </ThemedText>
            <Spacer size="md" />

            <View style={styles.inputContainer}>
              <Text style={styles.input}>
                <input
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

            <Spacer size="lg" />
            <Button 
              variant="danger" 
              onPress={handleDisable}
              loading={processingDisable}
              disabled={processingDisable || verificationCode.length !== 6}
            >
              Desabilitar 2FA
            </Button>
          </Card>
        )}

        <Spacer size="xl" />
      </ScrollView>
    </Container>
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
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  card: {
    padding: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
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
  input: {
    width: '100%',
  },
  statusContainer: {
    alignItems: 'center',
  },
});
