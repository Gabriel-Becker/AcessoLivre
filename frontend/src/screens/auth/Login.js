import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Pressable, Modal, useWindowDimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, DesktopLayout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/AuthService';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';
import { useThemeContext } from '../../context/ThemeContext';
import { formatarErroLogin } from '../../utils/authToastFormatter';
import { breakpoints } from '../../config/theme';

const schema = z
  .object({
    email: z.string().email(authMessages.loginErrors.invalidEmail),
    password: z.string().min(8, authMessages.validation.passwordTooShort),
    rememberMe: z.boolean().optional(),
    twoFactorCode: z.string().optional(),
  });

export default function Login({ navigation }) {
  const { login } = useAuth();
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const [submitting, setSubmitting] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [showAccountDisabled, setShowAccountDisabled] = useState(false);

  const redirecionarAposLogin = () => {
    if (!navigation) return;

    if (typeof navigation.replace === 'function') {
      navigation.replace('Main');
      return;
    }

    if (typeof navigation.reset === 'function') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      return;
    }

    if (typeof navigation.navigate === 'function') {
      navigation.navigate('Inicio');
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  });

  useEffect(() => {
    let ativo = true;

    const carregarPreferenciaRememberMe = async () => {
      try {
        const preferenciaSalva = await AuthService.getRememberMePreference();
        if (ativo) {
          setValue('rememberMe', preferenciaSalva);
        }
      } catch (error) {
        console.error('[Login] Erro ao carregar remember me:', error);
      }
    };

    carregarPreferenciaRememberMe();

    return () => {
      ativo = false;
    };
  }, [setValue]);

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
        forgot: {
          alignSelf: 'center',
          marginBottom: t.spacing.lg,
        },
        rememberRow: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: t.spacing.xl,
        },
        rememberLabel: {
          marginLeft: t.spacing.sm,
          fontSize: 18,
          lineHeight: 26,
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
        helperText: {
          marginTop: -t.spacing.sm,
          marginBottom: t.spacing.lg,
          fontSize: 18,
          lineHeight: 26,
        },
        twoFactorInlineBox: {
          borderWidth: isHighContrast ? 2 : 1,
          borderColor: t.colors.borderLight,
          borderRadius: t.borderRadius.md,
          padding: t.spacing.lg,
          marginBottom: t.spacing.lg,
          backgroundColor: isHighContrast ? t.colors.backgroundSecondary : t.colors.surface,
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: t.spacing.lg,
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
          fontSize: 24 * fontSizeMultiplier,
          lineHeight: 30 * fontSizeMultiplier,
        },
        modalSubtitulo: {
          fontSize: 18 * fontSizeMultiplier,
          lineHeight: 26 * fontSizeMultiplier,
        },
        modalTexto: {
          fontSize: 18 * fontSizeMultiplier,
          lineHeight: 26 * fontSizeMultiplier,
        },
      }),
    [fontSizeMultiplier, isDesktop, isHighContrast, t]
  );

  const handleSubmitLogin = async (values) => {
    try {
      setSubmitting(true);
      const credenciaisBase =
        showTwoFactor && pendingCredentials
          ? pendingCredentials
          : {
              email: values.email.trim(),
              senha: values.password,
              rememberMe: !!values.rememberMe,
            };

      const result = await login({
        email: credenciaisBase.email,
        senha: credenciaisBase.senha,
        rememberMe: !!credenciaisBase.rememberMe,
        twoFactorCode: values.twoFactorCode ? values.twoFactorCode.trim() : undefined,
      });
      const requerTwoFactor = Boolean(result?.requiresTwoFactor || result?.twoFactorRequired);

      if (!result?.sucesso) {
        // Se 2FA for requerido
        if (requerTwoFactor) {
          setValue('twoFactorCode', '');
          setShowTwoFactor(true);
          setPendingCredentials({
            email: credenciaisBase.email,
            senha: credenciaisBase.senha,
            rememberMe: !!credenciaisBase.rememberMe,
          });
          return;
        }

        const textoErro = String(result?.erro || result?.message || result?.mensagem || result?.error || '').toLowerCase();
        const erroContaInativa = textoErro.includes('inativo') || textoErro.includes('desativ');

        if (erroContaInativa) {
          setShowAccountDisabled(true);
          return;
        }
        const erroIndicaTwoFactor =
          textoErro.includes('2fa') ||
          textoErro.includes('dois fatores') ||
          textoErro.includes('autenticação obrigatório') ||
          textoErro.includes('autenticação obrigatória') ||
          textoErro.includes('codigo de autenticacao') ||
          textoErro.includes('código de autenticação');

        if (erroIndicaTwoFactor) {
          setValue('twoFactorCode', '');
          setShowTwoFactor(true);
          setPendingCredentials({
            email: credenciaisBase.email,
            senha: credenciaisBase.senha,
            rememberMe: !!credenciaisBase.rememberMe,
          });
          return;
        }

        toastHelper.showError(formatarErroLogin(result?.erro || authMessages.loginErrors.loginFailed), 'Não foi possível entrar');
        return;
      }

      clearErrors();
      setValue('twoFactorCode', '');
      setShowTwoFactor(false);
      setPendingCredentials(null);
      toastHelper.showSuccess('Você entrou na sua conta com sucesso.', 'Login realizado');
      redirecionarAposLogin();
    } catch (erro) {
      const mensagem = formatarErroLogin(erro?.message || authMessages.loginErrors.serverError);
      const mensagemNormalizada = String(mensagem || '').toLowerCase();
      if (mensagemNormalizada.includes('inativo') || mensagemNormalizada.includes('desativ')) {
        setShowAccountDisabled(true);
      } else {
        toastHelper.showError(mensagem, 'Não foi possível entrar');
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

  const conteudoLogin = (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast} style={{ padding: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 56 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            <Card style={styles.card} variant={isHighContrast ? 'outlined' : 'default'} altoContraste={isHighContrast}>
            <AuthHeader title="Bem-vindo de volta" subtitle="Acessibilidade para todos" altoContraste={isHighContrast} />
            <Spacer size="sm" />
            <ThemedText color={isHighContrast ? 'textOnPrimary' : 'textSecondary'} align="center" altoContraste={isHighContrast} style={styles.helperText}>
              Entre com seu e-mail para continuar
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

            {showTwoFactor && (
              <View style={styles.twoFactorInlineBox}>
                <ThemedText weight="semibold" altoContraste={isHighContrast}>
                  Verificação em duas etapas
                </ThemedText>
                <Spacer size="xs" />
                <ThemedText color="textSecondary" altoContraste={isHighContrast}>
                  Digite o código de 6 dígitos do aplicativo autenticador.
                </ThemedText>
                <Spacer size="sm" />
                <Controller
                  control={control}
                  name="twoFactorCode"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Código 2FA"
                      placeholder="000000"
                      value={value}
                      onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, 6))}
                      leftIcon="key-outline"
                      keyboardType="number-pad"
                      maxLength={6}
                      error={errors.twoFactorCode?.message}
                      altoContraste={isHighContrast}
                    />
                  )}
                />
              </View>
            )}

            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  style={styles.rememberRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: value }}
                >
                  <View style={[styles.checkbox, value && { backgroundColor: t.colors.primary }]}>
                    {value && <Ionicons name="checkmark" size={16} color={t.colors.textOnPrimary} />}
                  </View>
                  <ThemedText
                      color={isHighContrast ? 'textOnPrimary' : 'textSecondary'}
                    weight="medium"
                    altoContraste={isHighContrast}
                    style={styles.rememberLabel}
                  >
                    Lembrar de mim neste dispositivo
                  </ThemedText>
                </Pressable>
              )}
            />

            <TouchableOpacity style={styles.forgot} onPress={() => navigation?.navigate?.('ForgotPassword')}>
              <ThemedText color="primary" weight="semibold" altoContraste={isHighContrast}>
                Esqueceu a senha?
              </ThemedText>
            </TouchableOpacity>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSubmit(handleSubmitLogin)}
              loading={submitting}
              disabled={submitting}
              altoContraste={isHighContrast}
            >
              Entrar
            </Button>

            <Spacer size="md" />

              <AuthActions
                text="Não possui conta?"
                actionLabel="Cadastre-se"
                onPress={() => navigation?.navigate?.('Register')}
                altoContraste={isHighContrast}
              />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showTwoFactor}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowTwoFactor(false);
          setPendingCredentials(null);
          setValue('twoFactorCode', '');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText variant="h3" weight="bold" align="center" altoContraste={isHighContrast} style={styles.modalTitulo}>
              Verificação em duas etapas
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color={isHighContrast ? 'textOnPrimary' : 'textSecondary'} align="center" altoContraste={isHighContrast} style={styles.modalSubtitulo}>
              Digite o código de 6 dígitos do seu aplicativo autenticador.
            </ThemedText>

            <Spacer size="md" />
            <Controller
              control={control}
              name="twoFactorCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Código 2FA"
                  placeholder="000000"
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  leftIcon="key-outline"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.twoFactorCode?.message}
                  altoContraste={isHighContrast}
                />
              )}
            />

            <Spacer size="sm" />
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSubmit(handleSubmitLogin)}
              loading={submitting}
              disabled={submitting}
              altoContraste={isHighContrast}
            >
              Confirmar código
            </Button>

            <Spacer size="xs" />
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={() => {
                setShowTwoFactor(false);
                setPendingCredentials(null);
                setValue('twoFactorCode', '');
              }}
              disabled={submitting}
              altoContraste={isHighContrast}
            >
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
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
            <ThemedText color={isHighContrast ? 'textOnPrimary' : 'textSecondary'} align="center" altoContraste={isHighContrast} style={styles.modalTexto}>
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

  if (!isDesktop) {
    return conteudoLogin;
  }

  return (
    <DesktopLayout current="Login" onNavigate={handleNavigate} altoContraste={isHighContrast}>
      {conteudoLogin}
    </DesktopLayout>
  );
}
