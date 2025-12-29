import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import theme from '../../config/theme';

const schema = z
  .object({
    nome: z.string().min(3, 'Informe seu nome completo'),
    email: z.string().email('Informe um e-mail válido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Você precisa aceitar os termos para continuar',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  });

export default function Register({ navigation }) {
  const { register: registerUser } = useAuth();
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

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const resultado = await registerUser({
        nome: values.nome,
        email: values.email,
        senha: values.password,
      });

      if (resultado?.sucesso) {
        navigation?.navigate?.('Login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container background="backgroundSecondary">
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          <Card style={styles.card} variant="default">
            <AuthHeader title="Criar Conta" subtitle="Acessibilidade para todos" />

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
                />
              )}
            />

            <Controller
              control={control}
              name="terms"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setValue('terms', !value, { shouldValidate: true })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                    {value ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  </View>
                  <ThemedText color="textSecondary">
                    Aceito os termos de uso e política de privacidade
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
            {errors.terms?.message ? (
              <ThemedText color="error" style={styles.errorText}>
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

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  errorText: {
    marginTop: theme.spacing.xs,
  },
});
