import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Botao, Entrada } from '../ui';
import { Espacador, TextoTematizado } from '../commons';
import Carregamento from './Carregamento';
import { useThemeContext } from '../../context/ThemeContext';
import ServicoAutenticacao from '../../services/ServicoAutenticacao';
import toastHelper from '../../utils/toastHelper';

export default function ModalDoisFatores({ visible, enabled = false, onClose, onSuccess, altoContraste = false }) {
  const { theme: t, isHighContrast } = useThemeContext();
  const { width, height } = useWindowDimensions();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const corPrincipal = contrasteAtivo ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = contrasteAtivo ? 'textOnPrimary' : 'textSecondary';
  const isMobile = width < 600;
  const qrLado = Math.round(Math.min(isMobile ? width * 0.78 : width * 0.5, 320));
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
          paddingHorizontal: isMobile ? t.spacing.md : t.spacing.lg,
          paddingVertical: isMobile ? t.spacing.md : t.spacing.lg,
        },
        modalContainer: {
          width: '100%',
          maxWidth: isMobile ? 460 : 700,
          maxHeight: Math.min(height - t.spacing.lg * 2, isMobile ? 760 : height * 0.92),
          borderRadius: t.borderRadius.xl,
          paddingHorizontal: isMobile ? t.spacing.md : t.spacing.xl,
          paddingVertical: isMobile ? t.spacing.md : t.spacing.xl,
          backgroundColor: t.colors.surface,
          borderWidth: contrasteAtivo ? 2 : 0,
          borderColor: contrasteAtivo ? t.colors.border : 'transparent',
          ...(contrasteAtivo ? t.shadows.none : t.shadows.lg),
        },
        scrollContent: {
          flexGrow: 1,
          paddingBottom: t.spacing.md,
        },
        headerSpacing: {
          marginBottom: isMobile ? t.spacing.xs : t.spacing.sm,
        },
        titulo: {
          fontSize: isMobile ? 22 : 26,
          lineHeight: isMobile ? 28 : 32,
        },
        subtitulo: {
          fontSize: isMobile ? 15 : 16,
          lineHeight: isMobile ? 22 : 24,
        },
        qrContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? t.spacing.md : t.spacing.lg,
          backgroundColor: contrasteAtivo ? t.colors.backgroundSecondary : t.colors.surface,
          borderRadius: t.borderRadius.lg,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
        },
        qrInner: {
          padding: isMobile ? 10 : 12,
          backgroundColor: '#FFFFFF',
          borderRadius: t.borderRadius.md,
        },
        qrImage: {
          width: qrLado,
          height: qrLado,
          maxWidth: '100%',
        },
        secretBox: {
          paddingVertical: t.spacing.md,
          paddingHorizontal: t.spacing.sm,
          borderRadius: t.borderRadius.md,
          borderWidth: 1,
          borderColor: t.colors.borderLight,
          backgroundColor: contrasteAtivo ? t.colors.backgroundSecondary : t.colors.surface,
        },
        secretText: {
          flexShrink: 1,
          lineHeight: isMobile ? 20 : undefined,
        },
        copiedLink: {
          alignSelf: 'center',
        },
      }),
    [height, contrasteAtivo, isMobile, qrLado, t]
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
    let ocultarToastProcessamento;

    try {
      setCarregandoSetup(true);
      setErroModal('');
      ocultarToastProcessamento = toastHelper.showLoading('Carregando a configuração da autenticação em dois fatores...', 'Preparando 2FA');
      const resultado = await ServicoAutenticacao.setup2FA();
      if (ultimaRequisicaoSetupRef.current !== requestId) return;

      if (!resultado?.sucesso) {
        ocultarToastProcessamento?.();
        setSetupDados(null);
        setErroModal(resultado?.mensagem || 'Erro ao carregar configuração do 2FA');
        return;
      }

      ocultarToastProcessamento?.();
      setSetupDados(resultado?.dados || null);
    } catch (erro) {
      ocultarToastProcessamento?.();
      if (ultimaRequisicaoSetupRef.current !== requestId) return;
      setErroModal(erro?.message || 'Erro ao carregar configuração do 2FA');
    } finally {
      ocultarToastProcessamento?.();
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

    let ocultarToastProcessamento;

    try {
      setCarregandoAcao(true);
      setErroModal('');
      ocultarToastProcessamento = toastHelper.showLoading('Validando o código e ativando a proteção da conta...', 'Ativando 2FA');
      const resultado = await ServicoAutenticacao.enable2FA(codigo);
      if (resultado?.sucesso) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess('2FA habilitado com sucesso');
        setCodigo('');
        onSuccess?.();
        onClose?.();
        return;
      }

      ocultarToastProcessamento?.();
      setErroModal(resultado?.mensagem || 'Erro ao habilitar 2FA');
    } catch (erro) {
      ocultarToastProcessamento?.();
      setErroModal(erro?.message || 'Erro ao habilitar 2FA');
    } finally {
      ocultarToastProcessamento?.();
      setCarregandoAcao(false);
    }
  };

  const confirmarDesativacao = async () => {
    if (!codigo || codigo.length < 6) {
      setErroModal('Digite um código válido');
      return;
    }

    let ocultarToastProcessamento;

    try {
      setCarregandoAcao(true);
      setErroModal('');
      ocultarToastProcessamento = toastHelper.showLoading('Validando o código e removendo a autenticação em dois fatores...', 'Desativando 2FA');
      const resultado = await ServicoAutenticacao.disable2FA(codigo);
      if (resultado?.sucesso) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess('2FA desabilitado com sucesso');
        setCodigo('');
        onSuccess?.();
        onClose?.();
        return;
      }

      ocultarToastProcessamento?.();
      setErroModal(resultado?.mensagem || 'Erro ao desabilitar 2FA');
    } catch (erro) {
      ocultarToastProcessamento?.();
      setErroModal(erro?.message || 'Erro ao desabilitar 2FA');
    } finally {
      ocultarToastProcessamento?.();
      setCarregandoAcao(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={estilos.modalOverlay} onPress={onClose}>
        <Pressable
          style={estilos.modalContainer}
          onPress={(event) => event.stopPropagation?.()}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={estilos.scrollContent}
            scrollEnabled
            bounces={false}
            alwaysBounceVertical={false}
          >
            <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={contrasteAtivo} color={corPrincipal} style={[estilos.headerSpacing, estilos.titulo]}>
              {enabled ? 'Desativar 2FA' : 'Autenticação de Dois Fatores'}
            </TextoTematizado>
            <TextoTematizado color={corSecundaria} align="center" altoContraste={contrasteAtivo} style={estilos.subtitulo}>
              {enabled
                ? 'Digite o código de 6 dígitos do seu aplicativo autenticador para desativar.'
                : 'Escaneie o QR Code e confirme com o código de 6 dígitos.'}
            </TextoTematizado>

            {erroModal ? (
              <>
                <Espacador size="sm" />
                <TextoTematizado color="error" size="sm" align="center" altoContraste={contrasteAtivo}>
                  {erroModal}
                </TextoTematizado>
              </>
            ) : null}

            {!enabled ? (
              <>
                <Espacador size="md" />
                {carregandoSetup ? (
                  <Carregamento message="Preparando configuração..." />
                ) : setupDados ? (
                  <>
                    <View style={estilos.qrContainer}>
                      {setupDados.qrCode ? (
                        <View style={estilos.qrInner}>
                          <Image
                            source={{ uri: setupDados.qrCode }}
                            style={estilos.qrImage}
                            resizeMode="contain"
                          />
                        </View>
                      ) : null}
                    </View>

                    <Espacador size="md" />
                    <TouchableOpacity onPress={() => copiarTexto(setupDados.secretKey)} activeOpacity={0.8}>
                      <View style={estilos.secretBox}>
                        <TextoTematizado align="center" weight="semibold" altoContraste={contrasteAtivo} color={corPrincipal} style={estilos.secretText}>
                          {setupDados.secretKey}
                        </TextoTematizado>
                      </View>
                    </TouchableOpacity>
                    <Espacador size="xs" />
                    <TouchableOpacity onPress={() => copiarTexto(setupDados.secretKey)} activeOpacity={0.8}>
                        <TextoTematizado color="primary" align="center" altoContraste={contrasteAtivo} style={estilos.copiedLink}>
                        Toque para copiar a chave
                      </TextoTematizado>
                    </TouchableOpacity>

                    <Espacador size="lg" />
                    <Entrada
                      label="Código de verificação"
                      placeholder="000000"
                      value={codigo}
                      onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      leftIcon="key-outline"
                      altoContraste={isHighContrast}
                    />

                    <Espacador size="sm" />
                    <Botao
                      variant="primary"
                      size="large"
                      fullWidth
                      onPress={confirmarAtivacao}
                      loading={carregandoAcao}
                      disabled={carregandoAcao}
                      altoContraste={contrasteAtivo}
                    >
                      Ativar 2FA
                    </Botao>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Espacador size="lg" />
                <Entrada
                  label="Código de verificação"
                  placeholder="000000"
                  value={codigo}
                  onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  leftIcon="shield-checkmark-outline"
                  altoContraste={contrasteAtivo}
                />

                <Espacador size="lg" />
                <Botao
                  variant="danger"
                  size="large"
                  fullWidth
                  onPress={confirmarDesativacao}
                  loading={carregandoAcao}
                  disabled={carregandoAcao}
                  altoContraste={isHighContrast}
                >
                  Desativar 2FA
                </Botao>
              </>
            )}

            <Espacador size="md" />
            <Botao
              variant="ghost"
              size="large"
              fullWidth
              onPress={onClose}
              disabled={carregandoAcao}
              altoContraste={contrasteAtivo}
            >
              Cancelar
            </Botao>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

