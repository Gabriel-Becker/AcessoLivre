import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, DesktopLayout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import AuthActions from './components/AuthActions';
import { useThemeContext } from '../../context/ThemeContext';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';
import AuthService from '../../services/AuthService';
import { formatarErroRedefinirSenha } from '../../utils/authToastFormatter';

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
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { height } = useWindowDimensions();
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
          paddingHorizontal: fontSizeMultiplier >= 2 ? t.spacing.xl : t.spacing.lg,
          paddingVertical: t.spacing.xl,
        },
        card: {
          width: '100%',
          maxWidth: fontSizeMultiplier >= 2 ? 920 : 760,
          maxHeight: height - 32,
          padding: fontSizeMultiplier >= 2 ? t.spacing.xl : t.spacing.lg,
          backgroundColor: t.colors.surface,
          borderColor: t.colors.borderLight,
          borderWidth: isHighContrast ? 2 : 1,
          borderRadius: t.borderRadius.lg,
          ...(isHighContrast ? t.shadows.none : t.shadows.md),
        },
        introducao: {
          fontSize: fontSizeMultiplier >= 2 ? 22 : 18,
          lineHeight: fontSizeMultiplier >= 2 ? 30 : 26,
          maxWidth: 760,
        },
        headerTexto: {
          alignItems: 'center',
        },
        centralizado: {
          textAlign: 'center',
          alignSelf: 'center',
        },
        conteudoScroll: {
          flexGrow: 1,
          justifyContent: 'center',
          width: '100%',
          paddingBottom: t.spacing.md,
        },
        formulario: {
          width: '100%',
        },
      }),
    [fontSizeMultiplier, height, isHighContrast, t]
  );

  const onSubmit = async (values) => {
    if (!email) {
      toastHelper.showError('Não encontramos o e-mail desta solicitação. Volte e informe seu e-mail novamente.', 'Solicitação incompleta');
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
      toastHelper.showSuccess('Sua senha foi atualizada. Agora você já pode entrar com a nova senha.', 'Senha redefinida com sucesso');
    } catch (erro) {
      toastHelper.showError(
        formatarErroRedefinirSenha(erro?.message || 'Erro ao redefinir senha'),
        'Não foi possível redefinir a senha'
      );
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
            <ScrollView contentContainerStyle={styles.conteudoScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formulario}>
              {senhaAtualizada ? (
                <>
                  <View style={styles.headerTexto}>
                    <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast} style={styles.centralizado}>
                      Senha redefinida
                    </ThemedText>
                    <Spacer size="sm" />
                    <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast} style={[styles.introducao, styles.centralizado]}>
                      Sua senha foi atualizada com sucesso. Faça login com sua nova senha.
                    </ThemedText>
                  </View>

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
                  <View style={styles.headerTexto}>
                    <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast} style={styles.centralizado}>
                      Redefinir senha
                    </ThemedText>

                    <Spacer size="sm" />

                    <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast} style={[styles.introducao, styles.centralizado]}>
                      Informe o código enviado para {email} e defina sua nova senha.
                    </ThemedText>
                  </View>

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
              </View>
            </ScrollView>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Container>
    </DesktopLayout>
  );
}