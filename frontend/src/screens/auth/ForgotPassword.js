import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import { useThemeContext } from '../../context/ThemeContext';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';

const schema = z.object({
  email: z.string().email(authMessages.validation.invalidEmail),
});

export default function ForgotPassword({ navigation }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const [submitting, setSubmitting] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

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
        successIcon: {
          alignSelf: 'center',
          marginBottom: t.spacing.md,
        },
      }),
    [isHighContrast, t]
  );

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // TODO: Integrar com a API quando o backend estiver pronto
      // const response = await AuthService.forgotPassword(values.email);
      
      // Simulação de envio bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailEnviado(true);
      toastHelper.showSuccess('E-mail de recuperação enviado com sucesso!');
    } catch (erro) {
      toastHelper.showError(erro?.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.wrapper}>
          <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            {emailEnviado ? (
              <>
                <View style={styles.successIcon}>
                  <ThemedText size="xxxl" altoContraste={isHighContrast}>✉️</ThemedText>
                </View>
                <AuthHeader 
                  title="E-mail enviado!" 
                  subtitle="Acessibilidade para todos" 
                  altoContraste={isHighContrast} 
                />
                <Spacer size="md" />
                <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
                  Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.
                </ThemedText>
                <Spacer size="xl" />
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={() => navigation?.navigate?.('Login')}
                  altoContraste={isHighContrast}
                >
                  Voltar ao Login
                </Button>
              </>
            ) : (
              <>
                <AuthHeader 
                  title="Esqueceu a senha?" 
                  subtitle="Acessibilidade para todos" 
                  altoContraste={isHighContrast} 
                />
                <Spacer size="sm" />
                <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
                  Digite seu e-mail e enviaremos um link para redefinir sua senha
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
                  Enviar link de recuperação
                </Button>

                <Spacer size="md" />

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
  );
}
