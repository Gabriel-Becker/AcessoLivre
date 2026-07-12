import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Recipiente, LayoutDesktop } from '../../components/layout';
import { Card, Botao, Entrada } from '../../components/ui';
import { Espacador, TextoTematizado } from '../../components/commons';
import ModalTermos from '../../components/feedback/ModalTermos';
import { useAuth } from '../../context/ContextoAutenticacao';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import { useThemeContext } from '../../context/ThemeContext';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';
import { formatarErroCadastro, formatarErroLogin } from '../../utils/authToastFormatter';
import { breakpoints } from '../../config/theme';

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
    nome: z
      .string()
      .trim()
      .min(2, authMessages.validation.nameTooShort)
      .max(120, authMessages.validation.maxLength),
    email: z.string().trim().email(authMessages.validation.invalidEmail),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .refine((pwd) => /[A-Z]/.test(pwd), 'Senha deve conter ao menos uma letra maiúscula')
      .refine((pwd) => /[a-z]/.test(pwd), 'Senha deve conter ao menos uma letra minúscula')
      .refine((pwd) => /[0-9]/.test(pwd), 'Senha deve conter ao menos um número')
      .refine((pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), 'Senha deve conter ao menos um caractere especial (!@#$%^&*(),.?":{}|<>)'),
    confirmPassword: z.string().min(8, authMessages.validation.passwordTooShort),
    terms: z.boolean().refine((val) => val === true, {
      message: authMessages.registerErrors.termsNotAccepted,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: authMessages.validation.passwordMismatch,
  });

export default function Cadastro({ navigation }) {
  const { register: registerUser, login } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const terms = watch('terms');
  const senha = watch('password') || '';
  const confirmarSenha = watch('confirmPassword') || '';
  const senhaFoiDigitada = senha.length > 0;
  const confirmouSenha = confirmarSenha.length > 0;

  const requisitosPendentesSenha = REQUISITOS_SENHA.filter((requisito) => !requisito.validar(senha));

  const senhasCoincidem = senhaFoiDigitada && confirmouSenha && senha === confirmarSenha;
  const confirmarSenhaInvalida = senhaFoiDigitada && confirmouSenha && !senhasCoincidem;
  const erroConfirmacaoCampo =
    errors.confirmPassword?.message === authMessages.validation.passwordMismatch
      ? undefined
      : errors.confirmPassword?.message;

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalType, setModalType] = useState('terms');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: t.spacing.xl,
          paddingHorizontal: isDesktop ? t.spacing.xl : t.spacing.lg,
          paddingBottom: t.spacing.xl,
        },
        cardWrapper: {
          width: '100%',
          alignItems: 'center',
        },
        card: {
          width: '100%',
          maxWidth: isDesktop ? 760 : 560,
          padding: isDesktop ? t.spacing.xl : t.spacing.lg,
          borderWidth: isHighContrast ? 2 : 1,
          borderColor: isHighContrast ? t.colors.border : t.colors.borderLight,
          borderRadius: t.borderRadius.lg,
          backgroundColor: t.colors.surface,
          ...(isHighContrast ? t.shadows.none : t.shadows.md),
        },
        checkboxRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          alignSelf: 'center',
          marginTop: t.spacing.xs,
        },
        checkbox: {
          width: 28,
          height: 28,
          borderRadius: t.borderRadius.sm,
          borderWidth: 2,
          borderColor: t.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isHighContrast ? t.colors.backgroundSecondary : t.colors.surface,
        },
        checkboxChecked: {
          backgroundColor: t.colors.primary,
          borderColor: t.colors.primary,
        },
        checkboxLabel: {
          marginLeft: t.spacing.sm,
          lineHeight: 28,
          fontSize: 18,
        },
        checkboxTexto: {
          fontSize: 18,
          lineHeight: 28,
        },
        checkboxLink: {
          fontSize: 18,
          lineHeight: 28,
          fontWeight: '600',
        },
        errorText: {
          marginTop: t.spacing.xs,
          textAlign: 'center',
          alignSelf: 'center',
          width: '100%',
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
          lineHeight: 22,
          fontSize: 16,
        },
      }),
    [isDesktop, isHighContrast, t]
  );

  const onSubmit = async (values) => {
    let ocultarToastProcessamento;

    try {
      setSubmitting(true);
      ocultarToastProcessamento = toastHelper.showLoading('Criando sua conta e validando os dados informados...', 'Cadastrando');
      const nomeFormatado = String(values.nome || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)([a-zà-ÿ])/g, (match, espaco, letra) => `${espaco}${letra.toUpperCase()}`);

      const resultado = await registerUser({
        nome: nomeFormatado,
        email: values.email.trim().toLowerCase(),
        senha: values.password,
      });

      if (resultado?.sucesso) {
        const loginResult = await login({
          email: values.email.trim().toLowerCase(),
          senha: values.password,
          rememberMe: false,
        });
        
        if (loginResult?.sucesso) {
          ocultarToastProcessamento?.();
          toastHelper.showSuccess('Cadastro concluído e login realizado automaticamente.', 'Conta criada com sucesso');

          toastHelper.runAfterToast(() => {
            if (typeof navigation?.replace === 'function') {
              navigation.replace('AcessoLivre');
              return;
            }

            navigation?.navigate?.('AcessoLivre');
          });
          return;
        } else {
          ocultarToastProcessamento?.();
          toastHelper.showSuccess(
            `Cadastro concluído. Faça login com o e-mail ${values.email.trim().toLowerCase()} e sua senha.`,
            'Conta criada'
          );
          toastHelper.runAfterToast(() => {
            navigation?.navigate?.('Entrar');
          });
        }
        return;
      }

      ocultarToastProcessamento?.();
      toastHelper.showError(formatarErroCadastro(resultado?.erro || authMessages.registerErrors.serverError), 'Não foi possível concluir o cadastro');
    } catch (erro) {
      ocultarToastProcessamento?.();
      const mensagemErro = erro?.message || authMessages.registerErrors.serverError;
      const mensagemTratada =
        mensagemErro === authMessages.loginErrors.serverError
          ? formatarErroLogin(mensagemErro)
          : formatarErroCadastro(mensagemErro);
      toastHelper.showError(mensagemTratada, 'Não foi possível concluir o cadastro');
    } finally {
      ocultarToastProcessamento?.();
      setSubmitting(false);
    }
  };

  const handleNavigate = (screenName) => {
    if (typeof navigation?.navigate !== 'function') return;

    if (screenName === 'Entrar' || screenName === 'Cadastro' || screenName === 'EsqueciSenha' || screenName === 'RedefinirSenha') {
      navigation.navigate(screenName);
      return;
    }

    navigation.navigate('AcessoLivre', { screen: screenName });
  };

  const conteudoCadastro = (
    <Recipiente background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 56 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrapper}>
            <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            <AuthHeader title="Criar Conta" subtitle="Acessibilidade para todos" altoContraste={isHighContrast} />

            <Espacador size="md" />

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <Entrada
                  label="Nome Completo"
                  placeholder="Seu nome completo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon="person-outline"
                  error={touchedFields.nome ? errors.nome?.message : undefined}
                  autoCapitalize="words"
                  altoContraste={isHighContrast}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Entrada
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon="mail-outline"
                  error={touchedFields.email ? errors.email?.message : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  altoContraste={isHighContrast}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Senha"
                  placeholder="Sua senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  error={errors.password ? 'Revise os requisitos abaixo.' : undefined}
                  altoContraste={isHighContrast}
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
                      altoContraste={isHighContrast}
                    >
                      {requisito.texto}
                    </TextoTematizado>
                  </View>
                ))}
              </View>
            ) : null}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Confirmar Senha"
                  placeholder="Confirme sua senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  error={erroConfirmacaoCampo}
                  altoContraste={isHighContrast}
                />
              )}
            />

            {confirmouSenha && senhaFoiDigitada ? (
              <View style={styles.passwordHintContainer}>
                <View style={styles.passwordHintRow}>
                  <Ionicons
                    name={senhasCoincidem ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={senhasCoincidem ? t.colors.success : t.colors.error}
                  />
                  <TextoTematizado
                    variant="caption"
                    color={senhasCoincidem ? 'success' : 'error'}
                    style={styles.passwordHintText}
                    altoContraste={isHighContrast}
                  >
                    {senhasCoincidem ? 'As senhas coincidem' : 'As senhas não coincidem'}
                  </TextoTematizado>
                </View>
              </View>
            ) : null}

            <Controller
              control={control}
              name="terms"
              render={({ field: { value } }) => (
                <View style={styles.checkboxRow}>
                  <Pressable
                    onPress={() => setValue('terms', !value, { shouldValidate: true })}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: value }}
                    style={[styles.checkbox, value && styles.checkboxChecked]}
                  >
                    {value ? <Ionicons name="checkmark" size={14} color={t.colors.textOnPrimary} /> : null}
                  </Pressable>

                  <TextoTematizado color="textSecondary" altoContraste={isHighContrast} style={[styles.checkboxLabel, styles.checkboxTexto, { flexShrink: 1 }]}> 
                    Aceito os {' '}
                    <Pressable onPress={() => { setModalType('terms'); setShowTermsModal(true); }} accessibilityRole="link">
                      <TextoTematizado color="primary" weight="semibold" style={styles.checkboxLink}>termos de uso</TextoTematizado>
                    </Pressable>
                    {' '}e{' '}
                    <Pressable onPress={() => { setModalType('privacy'); setShowTermsModal(true); }} accessibilityRole="link">
                      <TextoTematizado color="primary" weight="semibold" style={styles.checkboxLink}>política de privacidade</TextoTematizado>
                    </Pressable>
                  </TextoTematizado>
                </View>
              )}
            />
            {errors.terms?.message ? (
              <TextoTematizado color="error" style={styles.errorText} altoContraste={isHighContrast}>
                {errors.terms.message}
              </TextoTematizado>
            ) : null}

            <Espacador size="sm" />

            <Botao
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              disabled={submitting}
              altoContraste={isHighContrast}
            >
              Cadastrar
            </Botao>

            <AuthActions
              text="Já possui conta?"
              actionLabel="Entrar"
              onPress={() => navigation?.navigate?.('Entrar')}
              altoContraste={isHighContrast}
            />
              <ModalTermos visible={showTermsModal} type={modalType} onClose={() => setShowTermsModal(false)} altoContraste={isHighContrast} />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      </Recipiente>
  );

  if (!isDesktop) {
    return conteudoCadastro;
  }

  return (
    <LayoutDesktop current="Cadastro" onNavigate={handleNavigate} altoContraste={isHighContrast}>
      {conteudoCadastro}
    </LayoutDesktop>
  );
}

