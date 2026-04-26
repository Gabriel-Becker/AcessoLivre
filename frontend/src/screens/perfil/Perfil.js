import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { TrocarSenhaModal, TwoFactorModal } from '../../components/feedback';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import AuthService from '../../services/AuthService';
import toastHelper from '../../utils/toastHelper';

export default function Perfil() {
  const { usuario } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorAtivo, setTwoFactorAtivo] = useState(false);
  const [carregandoTwoFactor, setCarregandoTwoFactor] = useState(true);

  const carregarStatusTwoFactor = async () => {
    try {
      setCarregandoTwoFactor(true);
      const status = await AuthService.get2FAStatus();
      setTwoFactorAtivo(Boolean(status?.enabled ?? status?.ativo ?? status));
    } catch (erro) {
      toastHelper.showError('Não foi possível carregar o status da autenticação em dois fatores.', 'Falha ao carregar segurança');
    } finally {
      setCarregandoTwoFactor(false);
    }
  };

  useEffect(() => {
    carregarStatusTwoFactor();
  }, []);

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={24} color={t.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText color="textSecondary" size="sm">{label}</ThemedText>
        <ThemedText weight="semibold">{value || 'Não informado'}</ThemedText>
      </View>
    </View>
  );

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText variant="h1" weight="bold">Meu Perfil</ThemedText>
        <Spacer size="md" />

        <Card altoContraste={isHighContrast} style={{ padding: t.spacing.xl }}>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: t.colors.primary }]}>
              <ThemedText variant="h1" color="textOnPrimary" weight="bold">
                {usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <Spacer size="md" />
            <ThemedText variant="h2" weight="bold" align="center">
              {usuario?.nome}
            </ThemedText>
          </View>

          <Spacer size="xl" />

          <InfoItem icon="person-outline" label="Nome" value={usuario?.nome} />
          <InfoItem icon="mail-outline" label="E-mail" value={usuario?.email} />

          <Spacer size="xl" />

          <View style={styles.segurancaBox}>
            <View style={styles.segurancaHeader}>
              <View style={styles.segurancaIcone}>
                <Ionicons name="shield-checkmark-outline" size={22} color={t.colors.primary} />
              </View>
              <View style={styles.segurancaTexto}>
                <ThemedText weight="semibold">Autenticação em dois fatores</ThemedText>
                <ThemedText color="textSecondary" size="sm">
                  {twoFactorAtivo ? 'Ativada para sua conta' : 'Desativada no momento'}
                </ThemedText>
              </View>
            </View>

            <Spacer size="sm" />

            <Button
              variant={twoFactorAtivo ? 'outline' : 'primary'}
              size="large"
              fullWidth
              onPress={() => setShowTwoFactorModal(true)}
              iconLeft={twoFactorAtivo ? 'key-outline' : 'shield-checkmark-outline'}
              loading={carregandoTwoFactor}
              disabled={carregandoTwoFactor}
              altoContraste={isHighContrast}
            >
              {twoFactorAtivo ? 'Gerenciar 2FA' : 'Ativar 2FA'}
            </Button>
          </View>

          <Spacer size="xl" />

          <Button 
            variant="outline" 
            size="large" 
            fullWidth 
            onPress={() => setShowChangePassword(true)}
            iconLeft="key-outline"
            altoContraste={isHighContrast}
          >
            Trocar Senha
          </Button>
        </Card>

        <Spacer size="lg" />
      </ScrollView>

      <TrocarSenhaModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        altoContraste={isHighContrast}
      />

      <TwoFactorModal
        visible={showTwoFactorModal}
        enabled={twoFactorAtivo}
        onClose={() => setShowTwoFactorModal(false)}
        onSuccess={carregarStatusTwoFactor}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  segurancaBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#fafafa',
  },
  segurancaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segurancaIcone: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segurancaTexto: {
    flex: 1,
    marginLeft: 12,
  },
});
