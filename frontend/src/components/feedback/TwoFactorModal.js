import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button, Input } from '../ui';
import { Spacer, ThemedText } from '../commons';
import Loading from './Loading';
import { useThemeContext } from '../../context/ThemeContext';
import AuthService from '../../services/AuthService';
import toastHelper from '../../utils/toastHelper';

export default function TwoFactorModal({ visible, enabled = false, onClose, onSuccess }) {
  const { theme: t, isHighContrast } = useThemeContext();
  const [carregandoSetup, setCarregandoSetup] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [setupDados, setSetupDados] = useState(null);
  const [codigo, setCodigo] = useState('');

  const estilos = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: t.spacing.md,
        },
        modalContainer: {
          width: '100%',
          maxWidth: 520,
          maxHeight: '88%',
          borderRadius: t.borderRadius.xl,
          padding: t.spacing.lg,
          backgroundColor: t.colors.surface,
          ...(isHighContrast ? t.shadows.none : t.shadows.lg),
        },
        scrollContent: {
          paddingBottom: t.spacing.md,
        },
        qrContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: t.spacing.md,
          backgroundColor: t.colors.backgroundSecondary,
          borderRadius: t.borderRadius.lg,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
        },
        qrImage: {
          width: 220,
          height: 220,
          borderRadius: t.borderRadius.md,
        },
        secretBox: {
          padding: t.spacing.md,
          borderRadius: t.borderRadius.md,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
          backgroundColor: t.colors.backgroundSecondary,
        },
        recoveryGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: t.spacing.sm,
        },
        recoveryItem: {
          minWidth: '48%',
          paddingVertical: t.spacing.sm,
          paddingHorizontal: t.spacing.md,
          borderRadius: t.borderRadius.md,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
          backgroundColor: t.colors.surfaceSecondary,
        },
        recoveryText: {
          textAlign: 'center',
          fontWeight: '600',
        },
        copiedLink: {
          alignSelf: 'center',
        },
      }),
    [isHighContrast, t]
  );

  useEffect(() => {
    if (!visible) {
      setCodigo('');
      setSetupDados(null);
      return;
    }

    if (!enabled) {
      carregarSetup();
    } else {
      setSetupDados(null);
    }
  }, [visible, enabled]);

  const carregarSetup = async () => {
    try {
      setCarregandoSetup(true);
      const resultado = await AuthService.setup2FA();
      setSetupDados(resultado?.dados || null);
    } catch (erro) {
      toastHelper.showError(erro?.message || 'Erro ao carregar configuração do 2FA');
    } finally {
      setCarregandoSetup(false);
    }
  };

  const copiarTexto = async (texto) => {
    if (!texto) return;
    await Clipboard.setStringAsync(String(texto));
    toastHelper.showSuccess('Copiado para a área de transferência');
  };

  const confirmarAtivacao = async () => {
    if (!codigo || codigo.length !== 6) {
      toastHelper.showError('Digite o código de 6 dígitos');
      return;
    }

    try {
      setCarregandoAcao(true);
      const resultado = await AuthService.enable2FA(codigo);
      if (resultado?.sucesso) {
        toastHelper.showSuccess('2FA habilitado com sucesso');
        setCodigo('');
        onSuccess?.();
        onClose?.();
        return;
      }

      toastHelper.showError(resultado?.mensagem || 'Erro ao habilitar 2FA');
    } catch (erro) {
      toastHelper.showError(erro?.message || 'Erro ao habilitar 2FA');
    } finally {
      setCarregandoAcao(false);
    }
  };

  const confirmarDesativacao = async () => {
    if (!codigo || codigo.length < 6) {
      toastHelper.showError('Digite um código válido');
      return;
    }

    try {
      setCarregandoAcao(true);
      const resultado = await AuthService.disable2FA(codigo);
      if (resultado?.sucesso) {
        toastHelper.showSuccess('2FA desabilitado com sucesso');
        setCodigo('');
        onSuccess?.();
        onClose?.();
        return;
      }

      toastHelper.showError(resultado?.mensagem || 'Erro ao desabilitar 2FA');
    } catch (erro) {
      toastHelper.showError(erro?.message || 'Erro ao desabilitar 2FA');
    } finally {
      setCarregandoAcao(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={estilos.modalOverlay}>
        <View style={estilos.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.scrollContent}>
            <ThemedText variant="h2" weight="bold" align="center">
              {enabled ? 'Desativar 2FA' : 'Autenticação de Dois Fatores'}
            </ThemedText>
            <Spacer size="sm" />
            <ThemedText color="textSecondary" align="center">
              {enabled
                ? 'Digite o código do seu aplicativo autenticador ou um código de recuperação para desativar.'
                : 'Escaneie o QR Code com seu aplicativo autenticador e depois confirme com o código de 6 dígitos.'}
            </ThemedText>

            {!enabled ? (
              <>
                <Spacer size="lg" />
                {carregandoSetup ? (
                  <Loading message="Preparando configuração..." />
                ) : setupDados ? (
                  <>
                    <View style={estilos.qrContainer}>
                      {setupDados.qrCode ? (
                        <Image
                          source={{ uri: setupDados.qrCode }}
                          style={estilos.qrImage}
                          resizeMode="contain"
                        />
                      ) : null}
                    </View>

                    <Spacer size="md" />
                    <ThemedText weight="semibold">Chave manual</ThemedText>
                    <Spacer size="xs" />
                    <TouchableOpacity onPress={() => copiarTexto(setupDados.secretKey)} activeOpacity={0.8}>
                      <View style={estilos.secretBox}>
                        <ThemedText align="center" weight="semibold">
                          {setupDados.secretKey}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                    <Spacer size="xs" />
                    <TouchableOpacity onPress={() => copiarTexto(setupDados.secretKey)} activeOpacity={0.8}>
                      <ThemedText color="primary" align="center" style={estilos.copiedLink}>
                        Tocar para copiar a chave
                      </ThemedText>
                    </TouchableOpacity>

                    <Spacer size="lg" />
                    <ThemedText weight="semibold">Códigos de recuperação</ThemedText>
                    <Spacer size="xs" />
                    <ThemedText color="textSecondary" size="sm">
                      Guarde estes códigos em local seguro. Cada um pode ser usado uma vez para desativar a autenticação.
                    </ThemedText>
                    <Spacer size="sm" />
                    <View style={estilos.recoveryGrid}>
                      {setupDados.recoveryCodes?.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={estilos.recoveryItem}
                          onPress={() => copiarTexto(item)}
                          activeOpacity={0.8}
                        >
                          <ThemedText style={estilos.recoveryText}>{item}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Spacer size="lg" />
                    <Input
                      label="Código de verificação"
                      placeholder="000000"
                      value={codigo}
                      onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      leftIcon="key-outline"
                      altoContraste={isHighContrast}
                    />

                    <Spacer size="md" />
                    <Button
                      variant="primary"
                      size="large"
                      fullWidth
                      onPress={confirmarAtivacao}
                      loading={carregandoAcao}
                      disabled={carregandoAcao}
                      altoContraste={isHighContrast}
                    >
                      Ativar 2FA
                    </Button>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Spacer size="lg" />
                <Input
                  label="Código de verificação"
                  placeholder="000000"
                  value={codigo}
                  onChangeText={(text) => setCodigo(text.replace(/[^0-9A-Z]/gi, '').slice(0, 20))}
                  keyboardType="default"
                  autoCapitalize="characters"
                  leftIcon="shield-checkmark-outline"
                  altoContraste={isHighContrast}
                />

                <Spacer size="sm" />
                <ThemedText color="textSecondary" size="sm" align="center">
                  Se não tiver acesso ao aplicativo autenticador, use um código de recuperação.
                </ThemedText>

                <Spacer size="md" />
                <Button
                  variant="danger"
                  size="large"
                  fullWidth
                  onPress={confirmarDesativacao}
                  loading={carregandoAcao}
                  disabled={carregandoAcao}
                  altoContraste={isHighContrast}
                >
                  Desativar 2FA
                </Button>
              </>
            )}

            <Spacer size="sm" />
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={onClose}
              disabled={carregandoAcao}
              altoContraste={isHighContrast}
            >
              Cancelar
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
