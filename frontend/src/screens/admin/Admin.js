import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Container } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import { useAuth } from '../../context/AuthContext';
import AdminService from '../../services/AdminService';
import theme from '../../config/theme';

export default function Admin() {
  const { usuario } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('usuarios');

  const [usuarios, setUsuarios] = useState([]);
  const [paginaUsuarios, setPaginaUsuarios] = useState(0);
  const [totalPaginasUsuarios, setTotalPaginasUsuarios] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [locais, setLocais] = useState([]);
  const [paginaLocais, setPaginaLocais] = useState(0);
  const [totalPaginasLocais, setTotalPaginasLocais] = useState(1);
  const [totalLocais, setTotalLocais] = useState(0);

  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const abas = useMemo(
    () => [
      { key: 'usuarios', label: 'Usuários' },
      { key: 'locais', label: 'Locais' },
      { key: 'relatorios', label: 'Relatórios' },
    ],
    []
  );

  const normalizarPaginacao = (dados) => ({
    content: Array.isArray(dados?.content) ? dados.content : [],
    totalPages: Number(dados?.totalPages) > 0 ? Number(dados.totalPages) : 1,
    totalElements: Number(dados?.totalElements) || 0,
  });

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await AdminService.listarUsuarios({ page: paginaUsuarios, size: 8, sort: 'dataCadastro' });
      const pagina = normalizarPaginacao(dados);
      setUsuarios(pagina.content);
      setTotalPaginasUsuarios(pagina.totalPages);
      setTotalUsuarios(pagina.totalElements);
    } catch (e) {
      setErro('Não foi possível carregar os usuários.');
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  };

  const carregarLocais = async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await AdminService.listarLocais({ page: paginaLocais, size: 8, sort: 'nome' });
      const pagina = normalizarPaginacao(dados);
      setLocais(pagina.content);
      setTotalPaginasLocais(pagina.totalPages);
      setTotalLocais(pagina.totalElements);
    } catch (e) {
      setErro('Não foi possível carregar os locais.');
      setLocais([]);
    } finally {
      setCarregando(false);
    }
  };

  const carregarRelatorios = async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await AdminService.obterEstatisticasGerais();
      setEstatisticas(dados || {});
    } catch (e) {
      setErro('Não foi possível carregar o resumo administrativo.');
      setEstatisticas(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'usuarios') {
      carregarUsuarios();
      return;
    }
    if (abaAtiva === 'locais') {
      carregarLocais();
      return;
    }
    carregarRelatorios();
  }, [abaAtiva, paginaUsuarios, paginaLocais]);

  const renderPaginacao = ({ paginaAtual, totalPaginas, onAnterior, onProxima }) => (
    <View style={styles.paginacao}>
      <Button variant="outline" size="small" onPress={onAnterior} disabled={carregando || paginaAtual <= 0}>
        Anterior
      </Button>
      <ThemedText color="textSecondary">
        Página {paginaAtual + 1} de {totalPaginas}
      </ThemedText>
      <Button
        variant="outline"
        size="small"
        onPress={onProxima}
        disabled={carregando || paginaAtual + 1 >= totalPaginas}
      >
        Próxima
      </Button>
    </View>
  );

  const renderUsuarios = () => (
    <>
      <ThemedText color="textSecondary">Total de usuários: {totalUsuarios}</ThemedText>
      <Spacer size="md" />

      {usuarios.length === 0 && !carregando ? (
        <Card>
          <ThemedText>Nenhum usuário encontrado.</ThemedText>
        </Card>
      ) : (
        usuarios.map((item) => (
          <Card key={item.idUsuario} style={styles.cardLista}>
            <ThemedText weight="bold">{item.nome || 'Usuário sem nome'}</ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary">{item.email || 'Email não informado'}</ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary">Role: {item.role || 'ROLE_USER'}</ThemedText>
          </Card>
        ))
      )}

      <Spacer size="sm" />

      {renderPaginacao({
        paginaAtual: paginaUsuarios,
        totalPaginas: totalPaginasUsuarios,
        onAnterior: () => setPaginaUsuarios((p) => Math.max(0, p - 1)),
        onProxima: () => setPaginaUsuarios((p) => Math.min(totalPaginasUsuarios - 1, p + 1)),
      })}
    </>
  );

  const renderLocais = () => (
    <>
      <ThemedText color="textSecondary">Total de locais: {totalLocais}</ThemedText>
      <Spacer size="md" />

      {locais.length === 0 && !carregando ? (
        <Card>
          <ThemedText>Nenhum local encontrado.</ThemedText>
        </Card>
      ) : (
        locais.map((item) => (
          <Card key={item.idLocal} style={styles.cardLista}>
            <ThemedText weight="bold">{item.nome || 'Local sem nome'}</ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary">
              Categoria: {item?.categoria?.nome || 'Não informada'}
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary">
              Cidade/UF: {item?.endereco?.cidade || 'N/I'} - {item?.endereco?.estado || 'N/I'}
            </ThemedText>
          </Card>
        ))
      )}

      <Spacer size="sm" />

      {renderPaginacao({
        paginaAtual: paginaLocais,
        totalPaginas: totalPaginasLocais,
        onAnterior: () => setPaginaLocais((p) => Math.max(0, p - 1)),
        onProxima: () => setPaginaLocais((p) => Math.min(totalPaginasLocais - 1, p + 1)),
      })}
    </>
  );

  const renderRelatorios = () => (
    <Card style={styles.cardLista}>
      <ThemedText variant="h3" weight="bold">Resumo Geral</ThemedText>
      <Spacer size="md" />
      <ThemedText>Total de usuários: {Number(estatisticas?.totalUsuarios) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText>Total de locais: {Number(estatisticas?.totalLocais) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText>Total de avaliações: {Number(estatisticas?.totalAvaliacoes) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText>Avaliações pendentes: {Number(estatisticas?.avaliacoesPendentes) || 0}</ThemedText>
    </Card>
  );

  return (
    <Container background="backgroundSecondary" scroll contentStyle={styles.scrollContent}>
      <ThemedText variant="h1" weight="bold">Painel Administrativo</ThemedText>
      <Spacer size="sm" />
      <ThemedText color="textSecondary">
        Área restrita para gestão geral do sistema. Bem-vindo, {usuario?.nome || 'Administrador'}.
      </ThemedText>

      <Spacer size="lg" />

      <View style={styles.abasContainer}>
        {abas.map((aba) => (
          <Button
            key={aba.key}
            variant={abaAtiva === aba.key ? 'primary' : 'outline'}
            size="small"
            onPress={() => setAbaAtiva(aba.key)}
            style={styles.botaoAba}
          >
            {aba.label}
          </Button>
        ))}
      </View>

      <Spacer size="md" />

      {carregando ? (
        <Card>
          <ThemedText>Carregando dados...</ThemedText>
        </Card>
      ) : null}

      {erro ? (
        <Card>
          <ThemedText color="error">{erro}</ThemedText>
        </Card>
      ) : null}

      {!carregando && !erro && abaAtiva === 'usuarios' ? renderUsuarios() : null}
      {!carregando && !erro && abaAtiva === 'locais' ? renderLocais() : null}
      {!carregando && !erro && abaAtiva === 'relatorios' ? renderRelatorios() : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  abasContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  botaoAba: {
    minWidth: 110,
  },
  cardLista: {
    padding: theme.spacing.lg,
  },
  paginacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
});
