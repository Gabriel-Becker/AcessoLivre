import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Card, CardInfoIcone } from '../../components/ui';
import { Recipiente } from '../../components/layout';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import ServicoSobre from '../../services/ServicoSobre';

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
      titulo: 'Inclusï¿½o',
      descricao: 'Acreditamos que todos merecem acesso igual aos espaï¿½os pï¿½blicos e privados.',
    },
    {
      icone: 'people-outline',
      titulo: 'Comunidade',
      descricao: 'Construï¿½mos uma rede colaborativa de pessoas comprometidas com a acessibilidade.',
    },
    {
      icone: 'locate-outline',
      titulo: 'Impacto',
      descricao: 'Focamos em criar mudanï¿½as reais e mensurï¿½veis na vida das pessoas.',
    },
  ];

  const colunasImpacto = [
    { valor: formatarNumero(metricas.totalLocais), legenda: 'Locais Cadastrados' },
    { valor: formatarNumero(metricas.totalAvaliacoes), legenda: 'Avaliaï¿½ï¿½es' },
    { valor: formatarNumero(metricas.totalUsuariosAtivos), legenda: 'Usuï¿½rios Ativos' },
  ];

  return (
    <Recipiente background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.blocoBranco}>
          <TextoTematizado variant="h1" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
            Nossa Missï¿½o
          </ThemedText>
          <Espacador size="sm" />
          <TextoTematizado align="center" altoContraste={isHighContrast} color={corSecundaria}>
            Criar um mundo mais acessï¿½vel atravï¿½s da tecnologia e colaboraï¿½ï¿½o comunitï¿½ria
          </ThemedText>
        </View>

        <Espacador size="lg" />

        <Card
          variant="default"
          style={styles.cardProposito}
          altoContraste={isHighContrast}
        >
          <TextoTematizado variant="h3" weight="bold" align="center" style={styles.textoPropositoTitulo}>
            Por que o AcessoLivre existe?
          </ThemedText>
          <Espacador size="md" />
          <TextoTematizado align="center" style={styles.textoPropositoDescricao}>
            Milhï¿½es de pessoas enfrentam barreiras diï¿½rias para acessar locais pï¿½blicos e privados.
            O AcessoLivre nasceu da necessidade de criar uma plataforma colaborativa onde a comunidade
            pode compartilhar informaï¿½ï¿½es sobre acessibilidade, ajudando a construir um mundo mais
            inclusivo para todos.
          </ThemedText>
        </Card>

        <Espacador size="xl" />

        <View style={styles.blocoBranco}>
          <TextoTematizado variant="h1" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
            Nossos Valores
          </ThemedText>
        </View>

        <Espacador size="lg" />

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
              <TextoTematizado align="center" color={corSecundaria}>
                {item.descricao}
              </ThemedText>
            </CardInfoIcone>
          ))}
        </View>

        <Espacador size="lg" />

        <View style={styles.bannerImpacto}>
          <TextoTematizado variant="h2" weight="bold" align="center" color="textOnPrimary" altoContraste={isHighContrast}>
            Nosso Impacto
          </ThemedText>
          <Espacador size="lg" />

          <View style={styles.gradeImpacto}>
            {colunasImpacto.map((coluna) => (
              <View key={coluna.legenda} style={styles.colunaImpacto}>
                <TextoTematizado variant="h1" weight="bold" align="center" color="textOnPrimary" altoContraste={isHighContrast}>
                  {coluna.valor}
                </ThemedText>
                <Espacador size="xs" />
                <TextoTematizado align="center" color="textOnPrimary" altoContraste={isHighContrast}>
                  {coluna.legenda}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <Espacador size="sm" />
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
