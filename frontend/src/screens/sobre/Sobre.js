import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';

export default function Sobre() {
  const { theme: t } = useThemeContext();
  const styles = StyleSheet.create({
    scroll: {
      flexGrow: 1,
    },
    card: {
      padding: t.spacing.xl,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ThemedText variant="h1" weight="bold">
        Sobre Nós
      </ThemedText>
      <Spacer size="sm" />
      <ThemedText color="textSecondary">
        Nossa missão
      </ThemedText>

      <Spacer size="xl" />

      <Card variant="default" style={styles.card}>
        <ThemedText variant="h3" weight="bold">
          AcessoLivre
        </ThemedText>
        <Spacer size="md" />
        <ThemedText>
          O AcessoLivre é uma plataforma dedicada a mapear, avaliar e registrar locais
          acessíveis em cidades, promovendo inclusão e acessibilidade urbana.
        </ThemedText>
        <Spacer size="md" />
        <ThemedText>
          Juntos construindo um mundo mais inclusivo para todos.
        </ThemedText>
      </Card>
    </ScrollView>
  );
}
