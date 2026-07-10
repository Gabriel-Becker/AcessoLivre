import React, { useMemo, useState } from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Botao, Entrada } from '../ui';
import { Espacador, TextoTematizado } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import ServicoAutenticacao from '../../services/ServicoAutenticacao';
import toastHelper from '../../utils/toastHelper';
import { formatarErroTrocarSenha } from '../../utils/authToastFormatter';

const REQUISITOS_SENHA = [
  {
    chave: 'minimoCaracteres',
    texto: 'Pelo menos 8 caracteres',
    validar: (senha) => senha.length >= 8,
  },
  {
    chave: 'letraMaiuscula',
    texto: 'Pelo menos 1 letra maiúscula',
    validar: (senha) => /[A-Z]/.test(senha),
  },
  {
    chave: 'letraMinuscula',
    texto: 'Pelo menos 1 letra minúscula',
    validar: (senha) => /[a-z]/.test(senha),
  },
  {
    chave: 'numero',
    texto: 'Pelo menos 1 número',
    validar: (senha) => /[0-9]/.test(senha),
  },
  {
    chave: 'caractereEspecial',
    texto: 'Pelo menos 1 caractere especial',
    validar: (senha) => /[!@#$%^&*(),.?":{}|<>]/.test(senha),
  },
];

const schema = z
  .object({
    senhaAtual: z.string().min(8, 'A senha atual deve ter no mínimo 8 caracteres'),
    novaSenha: z
      .string()
      .min(8, 'A nova senha deve ter no mínimo 8 caracteres')
      .refine((pwd) => /[A-Z]/.test(pwd), 'Senha deve conter ao menos uma letra maiúscula')
      .refine((pwd) => /[a-z]/.test(pwd), 'Senha deve conter ao menos uma letra minúscula')
      .refine((pwd) => /[0-9]/.test(pwd), 'Senha deve conter ao menos um número')
      .refine((pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), 'Senha deve conter ao menos um caractere especial (!@#$%^&*(),.?":{}|<>)'),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não conferem',
  });

export default function TrocarSenhaModal({ visible, onClose, altoContraste = false }) {
  const { theme: t, fontSizeMultiplier } = useThemeContext();
  const { height } = useWindowDimensions();
  const corPrincipal = altoContraste ? 'textOnPrimary' : 'textPrimary';
  const [submitting, setSubmitting] = useState(false);
  const [tentouTrocarSenha, setTentouTrocarSenha] = useState(false);
  const [erroSenhaAtual, setErroSenhaAtual] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const novaSenha = watch('novaSenha') || '';
  const confirmarSenha = watch('confirmarSenha') || '';
  const senhaFoiDigitada = novaSenha.length > 0;
  const confirmouSenha = confirmarSenha.length > 0;
  const requisitosPendentesSenha = REQUISITOS_SENHA.filter((requisito) => !requisito.validar(novaSenha));
  const senhasCoincidem = senhaFoiDigitada && confirmouSenha && novaSenha === confirmarSenha;

  const styles = useMemo(() => criarEstilos(t, fontSizeMultiplier, height), [t, fontSizeMultiplier, height]);

  const handleTrocarSenha = async (values) => {
    let ocultarToastProcessamento;

    try {
      setSubmitting(true);
      setTentouTrocarSenha(true);
      setErroSenhaAtual('');
      ocultarToastProcessamento = toastHelper.showLoading('Atualizando sua senha...', 'Alterando senha');
      const resultado = await ServicoAutenticacao.trocarSenha({
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });

      if (resultado?.sucesso) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess(resultado?.mensagem || 'Senha alterada com sucesso');
        setTentouTrocarSenha(false);
        setErroSenhaAtual('');
        reset();
        onClose();
        return;
      }

      const mensagemErro = formatarErroTrocarSenha(resultado?.mensagem || 'Erro ao trocar senha');
      const mensagemNormalizada = mensagemErro.toLowerCase();
      const senhaAtualIncorreta =
        mensagemNormalizada.includes('senha atual') && mensagemNormalizada.includes('incorreta');

      if (senhaAtualIncorreta) {
        ocultarToastProcessamento?.();
        setErroSenhaAtual('A senha atual informada está incorreta.');
        return;
      }

      ocultarToastProcessamento?.();
      toastHelper.showError(mensagemErro, 'Não foi possível trocar a senha');
    } catch (erro) {
      ocultarToastProcessamento?.();
      const mensagemErro = formatarErroTrocarSenha(erro?.message || 'Erro ao trocar senha');
      const mensagemNormalizada = mensagemErro.toLowerCase();
      const senhaAtualIncorreta =
        mensagemNormalizada.includes('senha atual') && mensagemNormalizada.includes('incorreta');

      if (senhaAtualIncorreta) {
        setTentouTrocarSenha(true);
        setErroSenhaAtual('A senha atual informada está incorreta.');
        return;
      }

      toastHelper.showError(mensagemErro, 'Não foi possível trocar a senha');
    } finally {
      ocultarToastProcessamento?.();
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTentouTrocarSenha(false);
    setErroSenhaAtual('');
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: t.colors.surface }]}
          onPress={(event) => event.stopPropagation?.()}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={altoContraste} color={corPrincipal} style={styles.titulo}>
              Trocar Senha
            </TextoTematizado>
            <Espacador size="sm" />

            <Controller
              control={control}
              name="senhaAtual"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Senha Atual"
                  placeholder="Senha atual"
                  value={value}
                  onChangeText={(texto) => {
                    if (erroSenhaAtual) setErroSenhaAtual('');
                    onChange(texto);
                  }}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  error={errors.senhaAtual?.message}
                  altoContraste={altoContraste}
                />
              )}
            />

            {tentouTrocarSenha && erroSenhaAtual ? (
              <TextoTematizado color="error" variant="caption" style={styles.inlineError}>
                {erroSenhaAtual}
              </TextoTematizado>
            ) : null}

            <Controller
              control={control}
              name="novaSenha"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Nova Senha"
                  placeholder="Nova senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  leftIcon="key-outline"
                  error={errors.novaSenha ? 'Revise os requisitos abaixo.' : undefined}
                  altoContraste={altoContraste}
                />
              )}
            />

            {senhaFoiDigitada && requisitosPendentesSenha.length > 0 ? (
              <View style={styles.passwordHintContainer}>
                {requisitosPendentesSenha.map((requisito) => (
                  <View key={requisito.chave} style={styles.passwordHintRow}>
                    <Ionicons name="close-circle" size={18} color={t.colors.error} />
                    <TextoTematizado
                      variant="caption"
                      color="error"
                      style={styles.passwordHintText}
                      altoContraste={altoContraste}
                    >
                      {requisito.texto}
                    </TextoTematizado>
                  </View>
                ))}
              </View>
            ) : null}

            <Controller
              control={control}
              name="confirmarSenha"
              render={({ field: { onChange, onBlur, value } }) => (
                <Entrada
                  label="Confirmar Nova Senha"
                  placeholder="Confirme a senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  leftIcon="key-outline"
                  error={errors.confirmarSenha?.message}
                  altoContraste={altoContraste}
                />
              )}
            />

            {touchedFields.confirmarSenha && confirmouSenha && senhaFoiDigitada ? (
              <View style={styles.passwordHintContainer}>
                <View style={styles.passwordHintRow}>
                  <Ionicons
                    name={senhasCoincidem ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={senhasCoincidem ? t.colors.success : t.colors.error}
                  />
                  <TextoTematizado
                    variant="caption"
                    color={senhasCoincidem ? 'success' : 'error'}
                    style={styles.passwordHintText}
                    altoContraste={altoContraste}
                  >
                    {senhasCoincidem ? 'As senhas coincidem' : 'As senhas não coincidem'}
                  </TextoTematizado>
                </View>
              </View>
            ) : null}

            <Espacador size="md" />

            <Botao
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSubmit(handleTrocarSenha)}
              loading={submitting}
              disabled={submitting}
              altoContraste={altoContraste}
            >
              Salvar
            </Botao>

            <Espacador size="sm" />

            <Botao
              variant="ghost"
              size="large"
              fullWidth
              onPress={handleClose}
              disabled={submitting}
              altoContraste={altoContraste}
            >
              Cancelar
            </Botao>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function criarEstilos(t, fontSizeMultiplier, height) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.lg,
    },
    modalContainer: {
      width: '100%',
      maxWidth: fontSizeMultiplier >= 2 ? 780 : 620,
      maxHeight: Math.min(height - t.spacing.lg * 2, fontSizeMultiplier >= 2 ? 760 : height * 0.9),
      borderRadius: t.borderRadius.xl,
      padding: t.spacing.xl,
      overflow: 'hidden',
      ...(fontSizeMultiplier >= 2 ? t.shadows.none : t.shadows.md),
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: t.spacing.sm,
    },
    titulo: {
      fontSize: fontSizeMultiplier >= 2 ? 28 : 24,
      lineHeight: fontSizeMultiplier >= 2 ? 34 : 30,
    },
    passwordHintContainer: {
      marginTop: t.spacing.xs,
      marginBottom: t.spacing.sm,
      paddingHorizontal: t.spacing.xs,
    },
    passwordHintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    passwordHintText: {
      marginLeft: t.spacing.xs,
      flexShrink: 1,
      fontSize: fontSizeMultiplier >= 2 ? 16 : 14,
      lineHeight: fontSizeMultiplier >= 2 ? 22 : 20,
    },
    inlineError: {
      textAlign: 'center',
      marginTop: -4,
      marginBottom: t.spacing.xs,
      fontSize: fontSizeMultiplier >= 2 ? 16 : 14,
      lineHeight: fontSizeMultiplier >= 2 ? 22 : 20,
    },
  });
}

