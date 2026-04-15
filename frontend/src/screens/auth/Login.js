import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useAuth } from '../../context/AuthContext';
import AuthHeader from './components/AuthHeader';
import AuthActions from './components/AuthActions';
import authMessages from '../../utils/authMessages';
import toastHelper from '../../utils/toastHelper';
import { useThemeContext } from '../../context/ThemeContext';

const schema = z
  .object({
    email: z.string().email(authMessages.loginErrors.invalidEmail),
    password: z.string().min(8, authMessages.validation.passwordTooShort),
    rememberMe: z.boolean().optional(),
    twoFactorCode: z.string().optional(),
  });

export default function Login({ navigation }) {
  const { login } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const [submitting, setSubmitting] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

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
        forgot: {
          alignSelf: 'center',
          marginBottom: t.spacing.md,
        },
        rememberRow: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: t.spacing.lg,
        },
        rememberLabel: {
          marginLeft: t.spacing.sm,
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
        helperText: {
          marginTop: -t.spacing.sm,
          marginBottom: t.spacing.md,
        },
        twoFactorInlineBox: {
          borderWidth: isHighContrast ? 2 : 1,
          borderColor: t.colors.borderLight,
          borderRadius: t.borderRadius.md,
          padding: t.spacing.md,
          marginBottom: t.spacing.md,
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
          maxWidth: 420,
          backgroundColor: t.colors.surface,
          borderRadius: t.borderRadius.lg,
          borderWidth: isHighContrast ? 2 : 1,
          borderColor: t.colors.borderLight,
          padding: t.spacing.lg,
          ...(isHighContrast ? t.shadows.none : t.shadows.md),
        },
      }),
    [isHighContrast, t]
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

        const textoErro = String(result?.erro || '').toLowerCase();
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

        toastHelper.showError(result?.erro || authMessages.loginErrors.loginFailed);
        return;
      }

      clearErrors();
      setValue('twoFactorCode', '');
      setShowTwoFactor(false);
      setPendingCredentials(null);
      toastHelper.showSuccess(result?.mensagem || authMessages.success.loginSuccess);
    } catch (erro) {
      toastHelper.showError(erro?.message || authMessages.loginErrors.serverError);
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
            <AuthHeader title="Bem-vindo de volta" subtitle="Acessibilidade para todos" altoContraste={isHighContrast} />
            <Spacer size="sm" />
            <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
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
                    color="textSecondary"
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
            />
          </Card>
        </View>
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
            <ThemedText variant="h3" weight="bold" align="center" altoContraste={isHighContrast}>
              Verificação em duas etapas
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" align="center" altoContraste={isHighContrast}>
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
    </Container>
  );
}
