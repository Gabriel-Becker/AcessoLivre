import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Container, DesktopLayout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useAuth } from '../../context/AuthContext';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import { useThemeContext } from '../../context/ThemeContext';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';
import { formatarErroCadastro, formatarErroLogin } from '../../utils/authToastFormatter';

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

export default function Register({ navigation }) {
  const { register: registerUser, login } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: t.spacing.lg,
          paddingHorizontal: t.spacing.lg,
        },
        cardWrapper: {
          width: '100%',
          alignItems: 'center',
        },
        card: {
          width: '100%',
          maxWidth: 520,
          padding: t.spacing.xl,
          borderWidth: isHighContrast ? 2 : 1,
          borderColor: isHighContrast ? t.colors.border : t.colors.borderLight,
          borderRadius: t.borderRadius.lg,
          backgroundColor: t.colors.surface,
          ...(isHighContrast ? t.shadows.none : t.shadows.md),
        },
        checkboxRow: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: t.spacing.xs,
        },
        checkbox: {
          width: 22,
          height: 22,
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
        },
      }),
    [isHighContrast, t]
  );

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const resultado = await registerUser({
        nome: values.nome.trim(),
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
          toastHelper.showSuccess('Cadastro concluído e login realizado automaticamente.', 'Conta criada com sucesso');

          if (typeof navigation?.replace === 'function') {
            navigation.replace('Main');
            return;
          }

          navigation?.navigate?.('Main');
          return;
        } else {
          toastHelper.showInfo(
            `Cadastro concluído. Faça login com o e-mail ${values.email.trim().toLowerCase()} e sua senha.`,
            'Conta criada'
          );
          navigation?.navigate?.('Login');
        }
        return;
      }

      toastHelper.showError(formatarErroCadastro(resultado?.erro || authMessages.registerErrors.serverError), 'Não foi possível concluir o cadastro');
    } catch (erro) {
      const mensagemErro = erro?.message || authMessages.registerErrors.serverError;
      const mensagemTratada =
        mensagemErro === authMessages.loginErrors.serverError
          ? formatarErroLogin(mensagemErro)
          : formatarErroCadastro(mensagemErro);
      toastHelper.showError(mensagemTratada, 'Não foi possível concluir o cadastro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigate = (screenName) => {
    if (typeof navigation?.navigate !== 'function') return;

    if (screenName === 'Login' || screenName === 'Register' || screenName === 'ForgotPassword' || screenName === 'ResetPassword') {
      navigation.navigate(screenName);
      return;
    }

    navigation.navigate('Main', { screen: screenName });
  };

  return (
    <DesktopLayout current="Register" onNavigate={handleNavigate} altoContraste={isHighContrast}>
      <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            <AuthHeader title="Criar Conta" subtitle="Acessibilidade para todos" altoContraste={isHighContrast} />

            <Spacer size="md" />

            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
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
                <Input
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
                <Input
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
                    <ThemedText
                      variant="caption"
                      color="error"
                      style={styles.passwordHintText}
                      altoContraste={isHighContrast}
                    >
                      {requisito.texto}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
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
                  <ThemedText
                    variant="caption"
                    color={senhasCoincidem ? 'success' : 'error'}
                    style={styles.passwordHintText}
                    altoContraste={isHighContrast}
                  >
                    {senhasCoincidem ? 'As senhas coincidem' : 'As senhas não coincidem'}
                  </ThemedText>
                </View>
              </View>
            ) : null}

            <Controller
              control={control}
              name="terms"
              render={({ field: { value } }) => (
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => setValue('terms', !value, { shouldValidate: true })}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: value }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      value && styles.checkboxChecked,
                    ]}
                  >
                    {value ? <Ionicons name="checkmark" size={14} color={t.colors.textOnPrimary} /> : null}
                  </View>
                  <ThemedText
                    color="textSecondary"
                    altoContraste={isHighContrast}
                    style={styles.checkboxLabel}
                  >
                    Aceito os termos de uso e política de privacidade
                  </ThemedText>
                </Pressable>
              )}
            />
            {errors.terms?.message ? (
              <ThemedText color="error" style={styles.errorText} altoContraste={isHighContrast}>
                {errors.terms.message}
              </ThemedText>
            ) : null}

            <Spacer size="sm" />

            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              disabled={submitting}
              altoContraste={isHighContrast}
            >
              Cadastrar
            </Button>

            <AuthActions
              text="Já possui conta?"
              actionLabel="Entrar"
              onPress={() => navigation?.navigate?.('Login')}
            />
          </Card>
        </View>
      </ScrollView>

      </Container>
    </DesktopLayout>
  );
}
