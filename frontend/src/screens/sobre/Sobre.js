import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Card, CardInfoIcone } from '../../components/ui';
import { Container } from '../../components/layout';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import SobreService from '../../services/SobreService';

export default function Sobre() {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const corPrincipal = isHighContrast ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = isHighContrast ? 'textOnPrimary' : 'textSecondary';

  const [metricas, setMetricas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0,
    totalUsuariosAtivos: 0,
  });

  const cardsPorLinha = width >= 960 ? 3 : width >= 680 ? 2 : 1;
  const larguraCardValor = cardsPorLinha === 3 ? '31.5%' : cardsPorLinha === 2 ? '48.5%' : '100%';
  const styles = useMemo(() => criarEstilos(t, isHighContrast), [t, isHighContrast]);

  useEffect(() => {
    let ativo = true;

    const carregarMetricas = async () => {
      const dados = await SobreService.obterMetricasImpacto();
      if (ativo) {
        setMetricas({
          totalLocais: dados.totalLocais || 0,
          totalAvaliacoes: dados.totalAvaliacoes || 0,
          totalUsuariosAtivos: dados.totalUsuariosAtivos || 0,
        });
      }
    };

    carregarMetricas();

    return () => {
      ativo = false;
    };
  }, []);

  const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);

  const valores = [
    {
      icone: 'heart-outline',
      titulo: 'Inclusão',
      descricao: 'Acreditamos que todos merecem acesso igual aos espaços públicos e privados.',
    },
    {
      icone: 'people-outline',
      titulo: 'Comunidade',
      descricao: 'Construímos uma rede colaborativa de pessoas comprometidas com a acessibilidade.',
    },
    {
      icone: 'locate-outline',
      titulo: 'Impacto',
      descricao: 'Focamos em criar mudanças reais e mensuráveis na vida das pessoas.',
    },
  ];

  const colunasImpacto = [
    { valor: formatarNumero(metricas.totalLocais), legenda: 'Locais Cadastrados' },
    { valor: formatarNumero(metricas.totalAvaliacoes), legenda: 'Avaliações' },
    { valor: formatarNumero(metricas.totalUsuariosAtivos), legenda: 'Usuários Ativos' },
  ];

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.blocoBranco}>
          <ThemedText variant="h1" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
            Nossa Missão
          </ThemedText>
          <Spacer size="sm" />
          <ThemedText align="center" altoContraste={isHighContrast} color={corSecundaria}>
            Criar um mundo mais acessível através da tecnologia e colaboração comunitária
          </ThemedText>
        </View>

        <Spacer size="lg" />

        <Card
          variant="default"
          style={styles.cardProposito}
          altoContraste={isHighContrast}
        >
          <ThemedText variant="h3" weight="bold" align="center" style={styles.textoPropositoTitulo}>
            Por que o AcessoLivre existe?
          </ThemedText>
          <Spacer size="md" />
          <ThemedText align="center" style={styles.textoPropositoDescricao}>
            Milhões de pessoas enfrentam barreiras diárias para acessar locais públicos e privados.
            O AcessoLivre nasceu da necessidade de criar uma plataforma colaborativa onde a comunidade
            pode compartilhar informações sobre acessibilidade, ajudando a construir um mundo mais
            inclusivo para todos.
          </ThemedText>
        </Card>

        <Spacer size="xl" />

        <View style={styles.blocoBranco}>
          <ThemedText variant="h1" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
            Nossos Valores
          </ThemedText>
        </View>

        <Spacer size="lg" />

        <View style={styles.gradeValores}>
          {valores.map((item) => (
            <CardInfoIcone
              key={item.titulo}
              titulo={item.titulo}
              icone={item.icone}
              corIcone={t.colors.primary}
              corFundoIcone={isHighContrast ? t.colors.surface : '#DDEFFF'}
              tamanhoIcone={22}
              tamanhoBadge={46}
              layout="coluna"
              centralizado
              altoContraste={isHighContrast}
              style={[styles.cardValor, { width: larguraCardValor }]}
            >
              <ThemedText align="center" color={corSecundaria}>
                {item.descricao}
              </ThemedText>
            </CardInfoIcone>
          ))}
        </View>

        <Spacer size="lg" />

        <View style={styles.bannerImpacto}>
          <ThemedText variant="h2" weight="bold" align="center" color="textOnPrimary" altoContraste={isHighContrast}>
            Nosso Impacto
          </ThemedText>
          <Spacer size="lg" />

          <View style={styles.gradeImpacto}>
            {colunasImpacto.map((coluna) => (
              <View key={coluna.legenda} style={styles.colunaImpacto}>
                <ThemedText variant="h1" weight="bold" align="center" color="textOnPrimary" altoContraste={isHighContrast}>
                  {coluna.valor}
                </ThemedText>
                <Spacer size="xs" />
                <ThemedText align="center" color="textOnPrimary" altoContraste={isHighContrast}>
                  {coluna.legenda}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <Spacer size="sm" />
      </ScrollView>
    </Container>
  );
}

function criarEstilos(t, isHighContrast) {
  return StyleSheet.create({
    scroll: {
      flexGrow: 1,
      paddingBottom: t.spacing.lg,
    },
    blocoBranco: {
      backgroundColor: isHighContrast ? t.colors.surface : t.colors.surface,
      borderRadius: t.borderRadius.xl,
      paddingVertical: t.spacing.xl,
      paddingHorizontal: t.spacing.lg,
      borderWidth: isHighContrast ? 1 : 0,
      borderColor: isHighContrast ? t.colors.border : 'transparent',
    },
    cardProposito: {
      backgroundColor: isHighContrast ? t.colors.surface : '#EEF6FF',
      borderColor: isHighContrast ? t.colors.border : '#B9D6FF',
      borderWidth: isHighContrast ? 2 : 1,
      borderRadius: t.borderRadius.xl,
      padding: t.spacing.xl,
      marginBottom: 0,
      ...(isHighContrast ? t.shadows.none : t.shadows.sm),
    },
    textoPropositoTitulo: {
      color: isHighContrast ? t.colors.textPrimary : '#1F4E8C',
    },
    textoPropositoDescricao: {
      color: isHighContrast ? t.colors.textPrimary : '#1F4E8C',
    },
    gradeValores: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: t.spacing.sm,
    },
    cardValor: {
      backgroundColor: t.colors.surface,
      borderRadius: t.borderRadius.xl,
      marginBottom: 0,
      minWidth: 210,
    },
    bannerImpacto: {
      backgroundColor: isHighContrast ? t.colors.primaryDark : '#18B66A',
      borderRadius: t.borderRadius.xl,
      paddingVertical: t.spacing.xl,
      paddingHorizontal: t.spacing.lg,
      ...(isHighContrast ? t.shadows.none : t.shadows.md),
    },
    gradeImpacto: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: t.spacing.md,
      columnGap: t.spacing.sm,
    },
    colunaImpacto: {
      flex: 1,
      minWidth: 95,
      alignItems: 'center',
    },
  });
}
