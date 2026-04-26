import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [erroModal, setErroModal] = useState('');
  const ultimaRequisicaoSetupRef = useRef(0);

  const estilos = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: t.spacing.lg,
        },
        modalContainer: {
          width: '100%',
          maxWidth: 560,
          maxHeight: '92%',
          borderRadius: t.borderRadius.xl,
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.lg,
          backgroundColor: t.colors.surface,
          ...(isHighContrast ? t.shadows.none : t.shadows.lg),
        },
        scrollContent: {
          paddingBottom: t.spacing.lg,
        },
        qrContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: t.spacing.md,
          backgroundColor: '#FFFFFF',
          borderRadius: t.borderRadius.lg,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
        },
        qrImage: {
          width: 210,
          height: 210,
        },
        secretBox: {
          padding: t.spacing.md,
          borderRadius: t.borderRadius.md,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
          backgroundColor: t.colors.backgroundSecondary,
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
      setErroModal('');
      return;
    }

    if (!enabled) {
      carregarSetup();
    } else {
      setSetupDados(null);
    }
  }, [visible, enabled]);

  const carregarSetup = async () => {
    const requestId = Date.now();
    ultimaRequisicaoSetupRef.current = requestId;
    try {
      setCarregandoSetup(true);
      setErroModal('');
      const resultado = await AuthService.setup2FA();
      if (ultimaRequisicaoSetupRef.current !== requestId) return;

      if (!resultado?.sucesso) {
        setSetupDados(null);
        setErroModal(resultado?.mensagem || 'Erro ao carregar configuração do 2FA');
        return;
      }

      setSetupDados(resultado?.dados || null);
    } catch (erro) {
      if (ultimaRequisicaoSetupRef.current !== requestId) return;
      setErroModal(erro?.message || 'Erro ao carregar configuração do 2FA');
    } finally {
      if (ultimaRequisicaoSetupRef.current === requestId) {
        setCarregandoSetup(false);
      }
    }
  };

  const copiarTexto = async (texto) => {
    if (!texto) return;
    await Clipboard.setStringAsync(String(texto));
    toastHelper.showSuccess('Copiado para a área de transferência');
  };

  const confirmarAtivacao = async () => {
    if (!codigo || codigo.length !== 6) {
      setErroModal('Digite o código de 6 dígitos');
      return;
    }

    try {
      setCarregandoAcao(true);
      setErroModal('');
      const resultado = await AuthService.enable2FA(codigo);
      if (resultado?.sucesso) {
        toastHelper.showSuccess('2FA habilitado com sucesso');
        setCodigo('');
        onSuccess?.();
        onClose?.();
        return;
      }

      setErroModal(resultado?.mensagem || 'Erro ao habilitar 2FA');
    } catch (erro) {
      setErroModal(erro?.message || 'Erro ao habilitar 2FA');
    } finally {
      setCarregandoAcao(false);
    }
  };

  const confirmarDesativacao = async () => {
    if (!codigo || codigo.length < 6) {
      setErroModal('Digite um código válido');
      return;
    }

    try {
      setCarregandoAcao(true);
      setErroModal('');
      const resultado = await AuthService.disable2FA(codigo);
      if (resultado?.sucesso) {
        toastHelper.showSuccess('2FA desabilitado com sucesso');
        setCodigo('');
        onSuccess?.();
        onClose?.();
        return;
      }

      setErroModal(resultado?.mensagem || 'Erro ao desabilitar 2FA');
    } catch (erro) {
      setErroModal(erro?.message || 'Erro ao desabilitar 2FA');
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
                ? 'Digite o código de 6 dígitos do seu aplicativo autenticador para desativar.'
                : 'Escaneie o QR Code e confirme com o código de 6 dígitos.'}
            </ThemedText>

            {erroModal ? (
              <>
                <Spacer size="sm" />
                <ThemedText color="error" size="sm" align="center">
                  {erroModal}
                </ThemedText>
              </>
            ) : null}

            {!enabled ? (
              <>
                <Spacer size="md" />
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
                        Toque para copiar a chave
                      </ThemedText>
                    </TouchableOpacity>

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

                    <Spacer size="lg" />
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
                  onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  leftIcon="shield-checkmark-outline"
                  altoContraste={isHighContrast}
                />

                <Spacer size="lg" />
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

            <Spacer size="md" />
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
