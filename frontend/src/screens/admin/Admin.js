import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Container } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import EditarUsuarioModal from '../../components/feedback/EditarUsuarioModal';
import { useAuth } from '../../context/AuthContext';
import AdminService from '../../services/AdminService';
import theme from '../../config/theme';
import toastHelper from '../../utils/toastHelper';

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
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erro, setErro] = useState('');

  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

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

  const confirmarEdicaoUsuario = (usuarioItem) => {
    setUsuarioSelecionado(usuarioItem);
    setModalEditarVisivel(true);
  };

  const apagarUsuario = async (usuarioItem) => {
    setCarregandoAcao(true);
    setErro('');
    try {
      await AdminService.deletarUsuario(usuarioItem.idUsuario);
      toastHelper.showSuccess('Usuário removido com sucesso.', 'Exclusão concluída');

      if (usuarios.length === 1 && paginaUsuarios > 0) {
        setPaginaUsuarios((p) => Math.max(0, p - 1));
      } else {
        await carregarUsuarios();
      }
    } catch (e) {
      const mensagemErro = e?.response?.data?.mensagem || e?.response?.data?.message || 'Não foi possível apagar o usuário.';
      setErro(mensagemErro);
      toastHelper.showError(mensagemErro, 'Falha ao excluir usuário');
    } finally {
      setCarregandoAcao(false);
    }
  };

  const confirmarApagarUsuario = (usuarioItem) => {
    Alert.alert(
      'Apagar usuário',
      `Tem certeza que deseja apagar ${usuarioItem?.nome || 'este usuário'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => apagarUsuario(usuarioItem) },
      ]
    );
  };

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
        <Card style={styles.cardUsuario}>
          <ThemedText>Nenhum usuário encontrado.</ThemedText>
        </Card>
      ) : (
        usuarios.map((item) => (
          <Card key={item.idUsuario} style={styles.cardUsuario}>
            <View style={styles.containerUsuario}>
              <View style={styles.infoUsuario}>
                <ThemedText weight="bold" size="sm">{item.nome || 'Usuário sem nome'}</ThemedText>
                <Spacer size="xs" />
                <ThemedText color="textSecondary" size="sm">{item.email || 'Email não informado'}</ThemedText>
                <Spacer size="xs" />
                <ThemedText color="textSecondary" size="sm">Role: {item.role || 'ROLE_USER'}</ThemedText>
              </View>

              {usuario?.idUsuario !== item.idUsuario ? (
                <View style={styles.botoesMiniatura}>
                  <Button
                    variant="outline"
                    size="small"
                    iconLeft="create-outline"
                    loading={carregandoAcao}
                    disabled={carregandoAcao}
                    onPress={() => confirmarEdicaoUsuario(item)}
                    style={styles.botaoIcon}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="danger"
                    size="small"
                    iconLeft="trash-outline"
                    loading={carregandoAcao}
                    disabled={carregandoAcao}
                    onPress={() => confirmarApagarUsuario(item)}
                    style={styles.botaoIcon}
                  >
                    Deletar
                  </Button>
                </View>
              ) : null}
            </View>
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
        <Card style={styles.cardUsuario}>
          <ThemedText>Nenhum local encontrado.</ThemedText>
        </Card>
      ) : (
        locais.map((item) => (
          <Card key={item.idLocal} style={styles.cardUsuario}>
            <ThemedText weight="bold" size="sm">{item.nome || 'Local sem nome'}</ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" size="sm">
              Categoria: {item?.categoria?.nome || 'Não informada'}
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" size="sm">
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
    <Card style={styles.cardUsuario}>
      <ThemedText variant="h3" weight="bold">Resumo Geral</ThemedText>
      <Spacer size="md" />
      <ThemedText size="sm">Total de usuários: {Number(estatisticas?.totalUsuarios) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText size="sm">Total de locais: {Number(estatisticas?.totalLocais) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText size="sm">Total de avaliações: {Number(estatisticas?.totalAvaliacoes) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText size="sm">Avaliações pendentes: {Number(estatisticas?.avaliacoesPendentes) || 0}</ThemedText>
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
        <Card style={styles.cardUsuario}>
          <ThemedText size="sm">Carregando dados...</ThemedText>
        </Card>
      ) : null}

      {erro ? (
        <Card style={styles.cardUsuario}>
          <ThemedText color="error" size="sm">{erro}</ThemedText>
        </Card>
      ) : null}

      {!carregando && !erro && abaAtiva === 'usuarios' ? renderUsuarios() : null}
      {!carregando && !erro && abaAtiva === 'locais' ? renderLocais() : null}
      {!carregando && !erro && abaAtiva === 'relatorios' ? renderRelatorios() : null}

      <EditarUsuarioModal
        visible={modalEditarVisivel}
        onClose={() => setModalEditarVisivel(false)}
        usuario={usuarioSelecionado}
        onSucesso={() => {
          setUsuarioSelecionado(null);
          carregarUsuarios();
        }}
      />
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
  containerUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoUsuario: {
    flex: 1,
  },
  cardUsuario: {
    padding: theme.spacing.md,
  },
  botoesMiniatura: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  botaoIcon: {
    flex: 1,
  },
});
