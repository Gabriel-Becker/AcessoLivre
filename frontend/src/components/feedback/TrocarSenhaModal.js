import React, { useState } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../ui';
import { Spacer, ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import AuthService from '../../services/AuthService';
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
  const { theme: t } = useThemeContext();
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

  const handleTrocarSenha = async (values) => {
    try {
      setSubmitting(true);
      setTentouTrocarSenha(true);
      setErroSenhaAtual('');
      const resultado = await AuthService.trocarSenha({
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });

      if (resultado?.sucesso) {
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
        setErroSenhaAtual('A senha atual informada está incorreta.');
        return;
      }

      toastHelper.showError(mensagemErro, 'Não foi possível trocar a senha');
    } catch (erro) {
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
          <ThemedText variant="h2" weight="bold" align="center">
            Trocar Senha
          </ThemedText>
          <Spacer size="md" />

          <Controller
            control={control}
            name="senhaAtual"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Senha Atual"
                placeholder="Digite sua senha atual"
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
            <ThemedText color="error" variant="caption" style={styles.inlineError}>
              {erroSenhaAtual}
            </ThemedText>
          ) : null}

          <Controller
            control={control}
            name="novaSenha"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nova Senha"
                placeholder="Digite a nova senha"
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
                  <Ionicons name="close-circle" size={16} color={t.colors.error} />
                  <ThemedText
                    variant="caption"
                    color="error"
                    style={styles.passwordHintText}
                    altoContraste={altoContraste}
                  >
                    {requisito.texto}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          <Controller
            control={control}
            name="confirmarSenha"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmar Nova Senha"
                placeholder="Confirme a nova senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                leftIcon="key-outline"
                error={undefined}
                altoContraste={altoContraste}
              />
            )}
          />

          {touchedFields.confirmarSenha && confirmouSenha && senhaFoiDigitada ? (
            <View style={styles.passwordHintContainer}>
              <View style={styles.passwordHintRow}>
                <Ionicons
                  name={senhasCoincidem ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={senhasCoincidem ? t.colors.success : t.colors.error}
                />
                <ThemedText
                  variant="caption"
                  color={senhasCoincidem ? 'success' : 'error'}
                  style={styles.passwordHintText}
                  altoContraste={altoContraste}
                >
                  {senhasCoincidem ? 'As senhas coincidem' : 'As senhas não coincidem'}
                </ThemedText>
              </View>
            </View>
          ) : null}

          <Spacer size="md" />

          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSubmit(handleTrocarSenha)}
            loading={submitting}
            disabled={submitting}
            altoContraste={altoContraste}
          >
            Salvar
          </Button>

          <Spacer size="sm" />

          <Button
            variant="ghost"
            size="large"
            fullWidth
            onPress={handleClose}
            disabled={submitting}
            altoContraste={altoContraste}
          >
            Cancelar
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 16,
    padding: 24,
  },
  passwordHintContainer: {
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  passwordHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  passwordHintText: {
    marginLeft: 6,
    flexShrink: 1,
  },
  inlineError: {
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 8,
  },
});
