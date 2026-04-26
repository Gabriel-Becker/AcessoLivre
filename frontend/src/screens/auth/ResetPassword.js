import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, DesktopLayout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import { useThemeContext } from '../../context/ThemeContext';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';
import AuthService from '../../services/AuthService';

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(6, authMessages.resetPasswordErrors.invalidCode)
      .max(6, authMessages.resetPasswordErrors.invalidCode)
      .regex(/^\d{6}$/, authMessages.resetPasswordErrors.invalidCode),
    novaSenha: z
      .string()
      .min(8, authMessages.validation.passwordTooShort),
    confirmarSenha: z
      .string()
      .min(8, authMessages.validation.passwordTooShort),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: authMessages.validation.passwordMismatch,
  });

export default function ResetPassword({ navigation, route }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const [submitting, setSubmitting] = useState(false);
  const [senhaAtualizada, setSenhaAtualizada] = useState(false);
  const email = route?.params?.email || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: t.spacing.lg,
        },
        card: {
          width: '100%',
          maxWidth: 440,
          padding: t.spacing.xl,
          backgroundColor: t.colors.surface,
          borderColor: t.colors.borderLight,
          borderWidth: isHighContrast ? 2 : 1,
          borderRadius: t.borderRadius.lg,
          ...(isHighContrast ? t.shadows.none : t.shadows.md),
        },
      }),
    [isHighContrast, t]
  );

  const onSubmit = async (values) => {
    if (!email) {
      toastHelper.showError('Email não informado para redefinição de senha');
      return;
    }

    try {
      setSubmitting(true);
      await AuthService.resetPassword({
        email,
        code: values.code,
        novaSenha: values.novaSenha,
      });

      setSenhaAtualizada(true);
      toastHelper.showSuccess(authMessages.success.resetPasswordSuccess);
    } catch (erro) {
      toastHelper.showError(erro?.message || 'Erro ao redefinir senha');
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
    <DesktopLayout current="ResetPassword" onNavigate={handleNavigate} altoContraste={isHighContrast}>
      <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.wrapper}>
          <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            {senhaAtualizada ? (
              <>
                <AuthHeader
                  title="Senha redefinida"
                  subtitle="Acessibilidade para todos"
                  altoContraste={isHighContrast}
                />
                <Spacer size="sm" />
                <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
                  Sua senha foi atualizada com sucesso. Faça login com sua nova senha.
                </ThemedText>
                <Spacer size="lg" />
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={() => navigation?.navigate?.('Login')}
                  altoContraste={isHighContrast}
                >
                  Ir para Login
                </Button>
              </>
            ) : (
              <>
                <AuthHeader
                  title="Redefinir senha"
                  subtitle="Acessibilidade para todos"
                  altoContraste={isHighContrast}
                />

                <Spacer size="sm" />

                <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
                  Informe o código enviado para {email} e defina sua nova senha.
                </ThemedText>

                <Spacer size="lg" />

                <Controller
                  control={control}
                  name="code"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Código de recuperação"
                      placeholder="000000"
                      value={value}
                      onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
                      leftIcon="key-outline"
                      error={errors.code?.message}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      altoContraste={isHighContrast}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="novaSenha"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nova senha"
                      placeholder="Sua nova senha"
                      value={value}
                      onChangeText={onChange}
                      leftIcon="lock-closed-outline"
                      secureTextEntry
                      error={errors.novaSenha?.message}
                      altoContraste={isHighContrast}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmarSenha"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Confirmar nova senha"
                      placeholder="Confirme a nova senha"
                      value={value}
                      onChangeText={onChange}
                      leftIcon="lock-closed-outline"
                      secureTextEntry
                      error={errors.confirmarSenha?.message}
                      altoContraste={isHighContrast}
                    />
                  )}
                />

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
                  Confirmar redefinição
                </Button>

                <AuthActions
                  text="Lembrou a senha?"
                  actionLabel="Voltar ao login"
                  onPress={() => navigation?.navigate?.('Login')}
                />
              </>
            )}
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Container>
    </DesktopLayout>
  );
}