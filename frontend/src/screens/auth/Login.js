import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useAuth } from '../../context/AuthContext';
import theme from '../../config/theme';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export default function Login({ navigation }) {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await login({ email: values.email, senha: values.password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container background="backgroundSecondary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Ionicons name="accessibility-outline" size={48} color={theme.colors.primary} />
            <Spacer size="sm" />
            <ThemedText variant="h2" align="center" weight="bold">
              AcessoLivre
            </ThemedText>
            <ThemedText color="textSecondary" align="center">
              Acessibilidade para todos
            </ThemedText>
          </View>

          <Card style={styles.card} variant="default">
            <ThemedText variant="h2" weight="bold" align="center">
              Bem-vindo de volta
            </ThemedText>
            <Spacer size="sm" />
            <ThemedText color="textSecondary" align="center">
              Entre na sua conta para continuar
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
                  onChangeText={onChange}
                  leftIcon="mail-outline"
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                />
              )}
            />

            <TouchableOpacity style={styles.forgot} onPress={() => {}}>
              <ThemedText color="primary" weight="semibold">
                Esqueceu a senha?
              </ThemedText>
            </TouchableOpacity>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
            >
              Entrar
            </Button>

            <Spacer size="lg" />

            <View style={styles.footerText}>
              <ThemedText color="textSecondary">Não possui conta?</ThemedText>
              <TouchableOpacity onPress={() => navigation?.navigate?.('Register')}>
                <ThemedText color="primary" weight="semibold">
                  {' '}Cadastre-se
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  footerText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
