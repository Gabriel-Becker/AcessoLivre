import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Modal, ScrollView, useWindowDimensions } from 'react-native';
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
import { breakpoints } from '../../config/theme';

const schema = z.object({
  email: z.string().email(authMessages.validation.invalidEmail),
});

export default function ForgotPassword({ navigation }) {
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const [submitting, setSubmitting] = useState(false);
  const [showAccountDisabled, setShowAccountDisabled] = useState(false);

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
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: isDesktop ? t.spacing.xl : t.spacing.lg,
          paddingVertical: t.spacing.xl,
        },
        scrollContainer: {
          flexGrow: 1,
        },
        card: {
          width: '100%',
          maxWidth: isDesktop ? 760 : 560,
          padding: isDesktop ? t.spacing.xl : t.spacing.lg,
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
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: fontSizeMultiplier >= 2 ? t.spacing.xl : t.spacing.lg,
        },
        modalCard: {
          width: '100%',
          maxWidth: fontSizeMultiplier >= 2 ? 760 : 620,
          backgroundColor: t.colors.surface,
          borderRadius: t.borderRadius.xl,
          borderWidth: isHighContrast ? 2 : 1,
          borderColor: t.colors.borderLight,
          padding: t.spacing.xl,
          ...(isHighContrast ? t.shadows.none : t.shadows.md),
        },
        modalTitulo: {
          fontSize: fontSizeMultiplier >= 2 ? 30 : 24,
          lineHeight: fontSizeMultiplier >= 2 ? 36 : 30,
        },
        modalTexto: {
          fontSize: fontSizeMultiplier >= 2 ? 22 : 18,
          lineHeight: fontSizeMultiplier >= 2 ? 30 : 26,
        },
      }),
    [fontSizeMultiplier, isDesktop, isHighContrast, t]
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
      const raw =
        erro?.response?.data?.mensagem ||
        erro?.response?.data?.message ||
        erro?.response?.data?.erro ||
        erro?.response?.data?.error ||
        erro?.message ||
        '';

      const isAccountDisabled = String(raw).toLowerCase().includes('inativo') || String(raw).toLowerCase().includes('desativ');

      if (isAccountDisabled) {
        setShowAccountDisabled(true);
      } else {
        toastHelper.showError(
          formatarErroEsqueciSenha(erro),
          'Não foi possível enviar o código'
        );
      }
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

  const conteudoTela = (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContainer, styles.wrapper]}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            <>
              <AuthHeader 
                title="Esqueceu a senha?" 
                subtitle="Acessibilidade para todos" 
                altoContraste={isHighContrast} 
              />
              <Spacer size="sm" />
              <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast} style={styles.introducao}>
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
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={showAccountDisabled}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountDisabled(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText variant="h3" weight="bold" align="center" altoContraste={isHighContrast} style={styles.modalTitulo}>
              Conta desativada
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast} style={styles.modalTexto}>
              Sua conta foi desativada, Contate um administrador para mais informações
            </ThemedText>

            <Spacer size="md" />
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={() => setShowAccountDisabled(false)}
              altoContraste={isHighContrast}
            >
              OK
            </Button>
          </View>
        </View>
      </Modal>
    </Container>
  );

  return isDesktop ? (
    <DesktopLayout current="ForgotPassword" onNavigate={handleNavigate} altoContraste={isHighContrast}>
      {conteudoTela}
    </DesktopLayout>
  ) : conteudoTela;
}


