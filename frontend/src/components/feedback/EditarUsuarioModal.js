import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '../ui';
import { Spacer, ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import useEditarUsuarioAdmin from '../../hooks/useEditarUsuarioAdmin';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.string(),
  senha: z
    .string()
    .optional()
    .refine((valor) => !valor || valor.length >= 8, 'A nova senha deve ter no mínimo 8 caracteres'),
});

export default function EditarUsuarioModal({ visible, onClose, usuario, onSucesso, altoContraste = false }) {
  const { theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const [imagemPerfilAtual, setImagemPerfilAtual] = useState(undefined);
  const [roleOriginal, setRoleOriginal] = useState('ROLE_USER');
  const { carregandoDados, submitting, carregarDadosUsuario, salvarEdicaoUsuario } = useEditarUsuarioAdmin();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      role: usuario?.role || 'ROLE_USER',
      senha: '',
    },
  });

  useEffect(() => {
    const carregarDetalhesUsuario = async () => {
      if (!usuario?.idUsuario || !visible) return;

      const dados = await carregarDadosUsuario(usuario);
      if (!dados) return;

      reset({
        nome: dados.nome,
        email: dados.email,
        role: dados.role,
        senha: '',
      });
      setRoleOriginal(dados.role);
      setImagemPerfilAtual(dados.imagemPerfil);
    };

    carregarDetalhesUsuario();
  }, [usuario, visible, reset, carregarDadosUsuario]);

  const handleAtualizarUsuario = async (values) => {
    const sucesso = await salvarEdicaoUsuario({
      usuarioId: usuario?.idUsuario,
      values,
      roleOriginal,
      imagemPerfil: imagemPerfilAtual,
    });

    if (sucesso) {
      reset();
      onClose();
      onSucesso?.();
    }
  };

  const handleClose = () => {
    reset();
    setRoleOriginal('ROLE_USER');
    setImagemPerfilAtual(undefined);
    onClose();
  };

  const larguraModal = width < 768 ? '92%' : '33%';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: t.colors.surface, width: larguraModal }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText variant="h2" weight="bold" align="center">
              Editar Usuário
            </ThemedText>
            <Spacer size="sm" />

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nome"
                  placeholder="Digite o nome do usuário"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="person-outline"
                  error={errors.nome?.message}
                  altoContraste={altoContraste}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="Digite o email do usuário"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="mail-outline"
                  error={errors.email?.message}
                  altoContraste={altoContraste}
                />
              )}
            />

            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Role"
                  placeholder="Selecione a role"
                  value={value}
                  onSelect={onChange}
                  options={[
                    { label: 'Administrador', value: 'ROLE_ADMIN' },
                    { label: 'Usuário', value: 'ROLE_USER' },
                  ]}
                  altoContraste={altoContraste}
                />
              )}
            />

            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nova senha (opcional)"
                  placeholder="Digite apenas se quiser trocar"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  leftIcon="key-outline"
                  error={errors.senha?.message}
                  altoContraste={altoContraste}
                />
              )}
            />

            <Spacer size="sm" />

            <Button
              variant="primary"
              size="medium"
              fullWidth
              onPress={handleSubmit(handleAtualizarUsuario)}
              loading={submitting || carregandoDados}
              disabled={submitting || carregandoDados}
              altoContraste={altoContraste}
            >
              Salvar Alterações
            </Button>

            <Spacer size="xs" />

            <Button
              variant="outline"
              size="medium"
              fullWidth
              onPress={handleClose}
              disabled={submitting || carregandoDados}
              altoContraste={altoContraste}
            >
              Cancelar
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
