import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Botao, Entrada, Selecao } from '../ui';
import { Espacador, TextoTematizado } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import useEditarUsuarioAdmin from '../../hooks/useEditarUsuarioAdmin';

const REQUISITOS_SENHA = [
  {
    chave: 'minimoCaracteres',
    texto: 'Pelo menos 8 caracteres',
    validar: (senha) => senha.length >= 8,
  },
  {
    chave: 'letraMaiuscula',
    texto: 'Pelo menos 1 letra maiï¿½scula',
    validar: (senha) => /[A-Z]/.test(senha),
  },
  {
    chave: 'letraMinuscula',
    texto: 'Pelo menos 1 letra minï¿½scula',
    validar: (senha) => /[a-z]/.test(senha),
  },
  {
    chave: 'numero',
    texto: 'Pelo menos 1 nï¿½mero',
    validar: (senha) => /[0-9]/.test(senha),
  },
  {
    chave: 'caractereEspecial',
    texto: 'Pelo menos 1 caractere especial',
    validar: (senha) => /[!@#$%^&*(),.?":{}|<>]/.test(senha),
  },
];

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mï¿½nimo 3 caracteres'),
  email: z.string().email('Email invï¿½lido'),
  role: z.enum(['ROLE_ADMIN', 'ROLE_USER'], {
    errorMap: () => ({ message: 'Selecione uma role vï¿½lida' }),
  }),
  senha: z
    .string()
    .optional()
    .refine((valor) => !valor || valor.length >= 8, 'A nova senha deve ter no mï¿½nimo 8 caracteres')
    .refine((valor) => !valor || /[A-Z]/.test(valor), 'A nova senha deve conter ao menos uma letra maiï¿½scula')
    .refine((valor) => !valor || /[a-z]/.test(valor), 'A nova senha deve conter ao menos uma letra minï¿½scula')
    .refine((valor) => !valor || /[0-9]/.test(valor), 'A nova senha deve conter ao menos um nï¿½mero')
    .refine((valor) => !valor || /[!@#$%^&*(),.?":{}|<>]/.test(valor), 'A nova senha deve conter ao menos um caractere especial'),
});

export default function EditarUsuarioModal({ visible, onClose, usuario, onSucesso, altoContraste = false }) {
  const { theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const [imagemPerfilAtual, setImagemPerfilAtual] = useState(undefined);
  const [roleOriginal, setRoleOriginal] = useState('ROLE_USER');
  const [dadosOriginais, setDadosOriginais] = useState({
    nome: '',
    email: '',
    role: 'ROLE_USER',
  });
  const { carregandoDados, submitting, carregarDadosUsuario, salvarEdicaoUsuario } = useEditarUsuarioAdmin();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      role: usuario?.role || 'ROLE_USER',
      senha: '',
    },
  });

  const senha = watch('senha') || '';
  const nomeAtual = (watch('nome') || '').trim();
  const emailAtual = (watch('email') || '').trim().toLowerCase();
  const roleAtual = String(watch('role') || 'ROLE_USER').trim().toUpperCase();
  const senhaFoiDigitada = senha.length > 0;
  const requisitosPendentesSenha = REQUISITOS_SENHA.filter((requisito) => !requisito.validar(senha));
  const houveMudancaBasica =
    nomeAtual !== dadosOriginais.nome ||
    emailAtual !== dadosOriginais.email ||
    roleAtual !== dadosOriginais.role;
  const houveMudancaSenha = String(senha || '').trim().length > 0;
  const podeSalvar = (houveMudancaBasica || houveMudancaSenha) && !(submitting || carregandoDados);

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
      setDadosOriginais({
        nome: String(dados.nome || '').trim(),
        email: String(dados.email || '').trim().toLowerCase(),
        role: String(dados.role || 'ROLE_USER').trim().toUpperCase(),
      });
      setRoleOriginal(dados.role);
      setImagemPerfilAtual(dados.imagemPerfil);
    };

    carregarDetalhesUsuario();
  }, [usuario, visible, reset, carregarDadosUsuario]);

  const handleAtualizarUsuario = async (values) => {
    clearErrors('root');
    if (!podeSalvar) {
      setError('root', {
        type: 'manual',
        message: 'Nenhuma alteraï¿½ï¿½o detectada. Edite algum campo para salvar.',
      });
      return;
    }

    clearErrors('email');
    const resultado = await salvarEdicaoUsuario({
      usuarioId: usuario?.idUsuario,
      values,
      roleOriginal,
      imagemPerfil: imagemPerfilAtual,
    });

    if (resultado?.sucesso) {
      reset();
      onClose();
      onSucesso?.();
      return;
    }

    const mensagemErro = String(resultado?.mensagem || '').toLowerCase();
    const erroEmailDuplicado =
      mensagemErro.includes('email jï¿½') ||
      mensagemErro.includes('e-mail jï¿½') ||
      mensagemErro.includes('already exists') ||
      mensagemErro.includes('duplicado');

    if (erroEmailDuplicado) {
      setError('email', {
        type: 'server',
        message: 'Este e-mail jï¿½ estï¿½ em uso. Informe outro e-mail.',
      });
    } else {
      const mensagem = resultado?.mensagem || 'Nï¿½o foi possï¿½vel atualizar o usuï¿½rio.';
      setError('root', {
        type: 'server',
        message: mensagem,
      });
    }
  };

  const handleClose = () => {
    reset();
    clearErrors();
    setDadosOriginais({
      nome: '',
      email: '',
      role: 'ROLE_USER',
    });
    setRoleOriginal('ROLE_USER');
    setImagemPerfilAtual(undefined);
    onClose();
  };

  const larguraModal = width < 768 ? '96%' : width < 1200 ? '44%' : '38%';

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
            <TextoTematizado variant="h2" weight="bold" align="center" style={styles.titulo}>
              Editar Usuï¿½rio
            </ThemedText>
            <Espacador size="sm" />

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <Entrada
                  label="Nome"
                  placeholder="Digite o nome do usuï¿½rio"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon="person-outline"
                  error={touchedFields.nome ? errors.nome?.message : undefined}
                  altoContraste={altoContraste}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Entrada
                  label="Email"
                  placeholder="Digite o email do usuï¿½rio"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
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
                <Selecao
                  label="Role"
                  placeholder="Selecione a role"
                  value={value}
                  onSelect={onChange}
                  error={errors.role?.message}
                  options={[
                    { label: 'Administrador', value: 'ROLE_ADMIN' },
                    { label: 'Usuï¿½rio', value: 'ROLE_USER' },
                  ]}
                  altoContraste={altoContraste}
                />
              )}
            />

            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Nova senha (opcional)"
                  placeholder="Digite apenas se quiser trocar"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  leftIcon="key-outline"
                  error={errors.senha ? 'Revise os requisitos abaixo.' : undefined}
                  altoContraste={altoContraste}
                />
              )}
            />

            {senhaFoiDigitada && requisitosPendentesSenha.length > 0 ? (
              <View style={styles.passwordHintContainer}>
                {requisitosPendentesSenha.map((requisito) => (
                  <View key={requisito.chave} style={styles.passwordHintRow}>
                    <Ionicons name="close-circle" size={16} color={t.colors.error} />
                    <TextoTematizado
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

            {errors.root?.message ? (
              <TextoTematizado color="error" variant="caption" align="center" style={styles.formError}>
                {errors.root.message}
              </ThemedText>
            ) : null}

            <Espacador size="sm" />

            <Botao
              variant="primary"
              size="medium"
              fullWidth
              onPress={handleSubmit(handleAtualizarUsuario)}
              loading={submitting || carregandoDados}
              disabled={!podeSalvar}
              altoContraste={altoContraste}
            >
              Salvar Alteraï¿½ï¿½es
            </Button>

            {!podeSalvar ? (
              <>
                <Espacador size="xs" />
                <TextoTematizado color="textSecondary" variant="caption" align="center">
                  Faï¿½a uma alteraï¿½ï¿½o para habilitar o salvamento.
                </ThemedText>
              </>
            ) : null}

            <Espacador size="xs" />

            <Botao
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
    maxHeight: '86%',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  formError: {
    marginTop: 2,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    lineHeight: 30,
  },
});
