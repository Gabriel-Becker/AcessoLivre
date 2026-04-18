import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../ui';
import { Spacer, ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import AuthService from '../../services/AuthService';
import toastHelper from '../../utils/toastHelper';

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
    confirmarSenha: z.string().min(8, 'A confirmação deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não conferem',
  });

export default function TrocarSenhaModal({ visible, onClose, altoContraste = false }) {
  const { theme: t } = useThemeContext();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const handleTrocarSenha = async (values) => {
    try {
      setSubmitting(true);
      const resultado = await AuthService.trocarSenha({
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });

      if (resultado?.sucesso) {
        toastHelper.showSuccess(resultado?.mensagem || 'Senha alterada com sucesso');
        reset();
        onClose();
        return;
      }

      toastHelper.showError(resultado?.mensagem || 'Erro ao trocar senha');
    } catch (erro) {
      toastHelper.showError(erro?.message || 'Erro ao trocar senha');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: t.colors.surface }]}>
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
                onChangeText={onChange}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={errors.senhaAtual?.message}
                altoContraste={altoContraste}
              />
            )}
          />

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
                error={errors.novaSenha?.message}
                altoContraste={altoContraste}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmarSenha"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirmar Nova Senha"
                placeholder="Confirme a nova senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                leftIcon="key-outline"
                error={errors.confirmarSenha?.message}
                altoContraste={altoContraste}
              />
            )}
          />

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
        </View>
      </View>
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
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
  },
});
