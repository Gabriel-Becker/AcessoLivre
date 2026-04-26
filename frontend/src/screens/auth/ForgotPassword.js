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
import { formatarErroEsqueciSenha } from '../../utils/authToastFormatter';

const schema = z.object({
  email: z.string().email(authMessages.validation.invalidEmail),
});

export default function ForgotPassword({ navigation }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
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
    try {
      setSubmitting(true);
      const emailNormalizado = values.email.trim().toLowerCase();
      await AuthService.forgotPassword(emailNormalizado);

      toastHelper.showSuccess(
        `Enviamos um código para ${emailNormalizado}. Verifique sua caixa de entrada e spam.`,
        'Código enviado'
      );
      navigation?.navigate?.('ResetPassword', { email: emailNormalizado });
    } catch (erro) {
      toastHelper.showError(
        formatarErroEsqueciSenha(erro?.message || 'Erro ao enviar e-mail de recuperação'),
        'Não foi possível enviar o código'
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
    <DesktopLayout current="ForgotPassword" onNavigate={handleNavigate} altoContraste={isHighContrast}>
      <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.wrapper}>
          <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            <>
              <AuthHeader 
                title="Esqueceu a senha?" 
                subtitle="Acessibilidade para todos" 
                altoContraste={isHighContrast} 
              />
              <Spacer size="sm" />
              <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
                Digite seu e-mail e enviaremos um código para redefinir sua senha
              </ThemedText>

              <Spacer size="xl" />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={value}
                    onChangeText={(text) => onChange(text.trimStart())}
                    leftIcon="mail-outline"
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    altoContraste={isHighContrast}
                  />
                )}
              />

              <Spacer size="lg" />

              <Button
                variant="primary"
                size="large"
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={submitting}
                disabled={submitting}
                altoContraste={isHighContrast}
              >
                Enviar código de recuperação
              </Button>

              <Spacer size="md" />

              <AuthActions
                text="Lembrou a senha?"
                actionLabel="Voltar ao login"
                onPress={() => navigation?.navigate?.('Login')}
              />
            </>
          </Card>
        </View>
      </KeyboardAvoidingView>
      </Container>
    </DesktopLayout>
  );
}
