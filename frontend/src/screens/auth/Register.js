import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useAuth } from '../../context/AuthContext';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import { useThemeContext } from '../../context/ThemeContext';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';

const schema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, authMessages.validation.nameTooShort)
      .max(120, authMessages.validation.maxLength),
    email: z.string().trim().email(authMessages.validation.invalidEmail),
    password: z.string().min(8, authMessages.validation.passwordTooShort),
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
  const { register: registerUser } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const terms = watch('terms');

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

      if (!resultado?.sucesso) {
        toastHelper.showError(resultado?.erro || authMessages.registerErrors.serverError);
        return;
      }

      toastHelper.showSuccess(authMessages.success.registerSuccess);
      navigation?.navigate?.('Login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
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
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome completo"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="person-outline"
                  error={errors.nome?.message}
                  autoCapitalize="words"
                  altoContraste={isHighContrast}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="mail-outline"
                  error={errors.email?.message}
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
                  error={errors.password?.message}
                  altoContraste={isHighContrast}
                />
              )}
            />

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
                  error={errors.confirmPassword?.message}
                  altoContraste={isHighContrast}
                />
              )}
            />

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
  );
}
