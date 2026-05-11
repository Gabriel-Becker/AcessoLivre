import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Modal, useWindowDimensions } from 'react-native';
import { Container } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import EditarUsuarioModal from '../../components/feedback/EditarUsuarioModal';
import { BarraFiltroAdmin, EtiquetaStatus, TabelaPlanilhaAdmin } from '../../components/admin';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import AdminService from '../../services/AdminService';
import theme from '../../config/theme';
import toastHelper from '../../utils/toastHelper';

export default function Admin() {
  const { usuario } = useAuth();
  const { theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const [abaAtiva, setAbaAtiva] = useState('usuarios');

  const [usuarios, setUsuarios] = useState([]);
  const [paginaUsuarios, setPaginaUsuarios] = useState(0);
  const [totalPaginasUsuarios, setTotalPaginasUsuarios] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [locais, setLocais] = useState([]);
  const [paginaLocais, setPaginaLocais] = useState(0);
  const [totalPaginasLocais, setTotalPaginasLocais] = useState(1);
  const [totalLocais, setTotalLocais] = useState(0);

  const [buscaUsuarios, setBuscaUsuarios] = useState('');
  const [filtroRoleUsuarios, setFiltroRoleUsuarios] = useState('todos');
  const [filtroStatusUsuarios, setFiltroStatusUsuarios] = useState('todos');

  const [buscaLocais, setBuscaLocais] = useState('');
  const [filtroCategoriaLocais, setFiltroCategoriaLocais] = useState('todos');

  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erro, setErro] = useState('');

  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [modalDeleteVisivel, setModalDeleteVisivel] = useState(false);
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState(null);

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

  const formatarRoleUsuario = (role) => {
    const roleNormalizada = String(role || 'ROLE_USER').trim().toUpperCase();
    if (roleNormalizada === 'ROLE_ADMIN') return 'Administrador';
    return 'Usuário';
  };

  const normalizarTexto = (texto) =>
    String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const limparFiltrosUsuarios = () => {
    setBuscaUsuarios('');
    setFiltroRoleUsuarios('todos');
    setFiltroStatusUsuarios('todos');
  };

  const limparFiltrosLocais = () => {
    setBuscaLocais('');
    setFiltroCategoriaLocais('todos');
  };

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

  const opcoesRoleUsuarios = useMemo(
    () => [
      { label: 'Todas as roles', value: 'todos' },
      { label: 'Administrador', value: 'ROLE_ADMIN' },
      { label: 'Usuário', value: 'ROLE_USER' },
    ],
    []
  );

  const opcoesStatusUsuarios = useMemo(
    () => [
      { label: 'Todos os status', value: 'todos' },
      { label: 'Ativos', value: 'ativo' },
      { label: 'Inativos', value: 'inativo' },
    ],
    []
  );

  const opcoesCategoriaLocais = useMemo(() => {
    const categorias = Array.from(
      new Set(locais.map((item) => item?.categoria?.nome).filter(Boolean))
    );

    return [
      { label: 'Todas as categorias', value: 'todos' },
      ...categorias.map((categoria) => ({ label: categoria, value: categoria })),
    ];
  }, [locais]);

  const usuariosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaUsuarios);

    return usuarios.filter((item) => {
      const nome = normalizarTexto(item?.nome);
      const email = normalizarTexto(item?.email);
      const role = String(item?.role || 'ROLE_USER').toUpperCase();
      const status = item?.ativo ? 'ativo' : 'inativo';

      const atendeBusca = !termo || nome.includes(termo) || email.includes(termo);
      const atendeRole = filtroRoleUsuarios === 'todos' || role === filtroRoleUsuarios;
      const atendeStatus = filtroStatusUsuarios === 'todos' || status === filtroStatusUsuarios;

      return atendeBusca && atendeRole && atendeStatus;
    });
  }, [usuarios, buscaUsuarios, filtroRoleUsuarios, filtroStatusUsuarios]);

  const locaisFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaLocais);

    return locais.filter((item) => {
      const nome = normalizarTexto(item?.nome);
      const cidade = normalizarTexto(item?.endereco?.cidade);
      const categoria = item?.categoria?.nome || '';

      const atendeBusca = !termo || nome.includes(termo) || cidade.includes(termo);
      const atendeCategoria = filtroCategoriaLocais === 'todos' || categoria === filtroCategoriaLocais;

      return atendeBusca && atendeCategoria;
    });
  }, [locais, buscaLocais, filtroCategoriaLocais]);

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
    setUsuarioParaDeletar(usuarioItem);
    setModalDeleteVisivel(true);
  };

  const tentarNovamente = () => {
    if (abaAtiva === 'usuarios') {
      carregarUsuarios();
      return;
    }

    if (abaAtiva === 'locais') {
      carregarLocais();
      return;
    }

    carregarRelatorios();
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

  const renderUsuarios = () => {
    const colunas = [
      {
        chave: 'nome',
        titulo: 'Nome',
        flex: 1.4,
        minWidth: 180,
        render: (item) => (
          <View>
            <ThemedText weight="bold" size="sm">
              {item.nome || 'Usuário sem nome'}
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" size="xs">
              ID #{item.idUsuario}
            </ThemedText>
          </View>
        ),
      },
      {
        chave: 'email',
        titulo: 'E-mail',
        flex: 1.8,
        minWidth: 240,
        render: (item) => (
          <ThemedText color="textSecondary" size="sm">
            {item.email || 'E-mail não informado'}
          </ThemedText>
        ),
      },
      {
        chave: 'role',
        titulo: 'Perfil',
        flex: 0.9,
        minWidth: 130,
        render: (item) => (
          <EtiquetaStatus
            texto={formatarRoleUsuario(item.role)}
            tipo={String(item?.role || 'ROLE_USER').toUpperCase() === 'ROLE_ADMIN' ? 'info' : 'neutro'}
          />
        ),
      },
      {
        chave: 'status',
        titulo: 'Status',
        flex: 0.8,
        minWidth: 110,
        render: (item) => (
          <EtiquetaStatus texto={item?.ativo ? 'Ativo' : 'Inativo'} tipo={item?.ativo ? 'sucesso' : 'perigo'} />
        ),
      },
      {
        chave: 'cadastro',
        titulo: 'Cadastro',
        flex: 1.1,
        minWidth: 150,
        render: (item) => (
          <ThemedText color="textSecondary" size="sm">
            {item?.dataCadastro || 'Sem data'}
          </ThemedText>
        ),
      },
      {
        chave: 'acoes',
        titulo: 'Ações',
        flex: 1.2,
        minWidth: 190,
        alinhamento: 'center',
        render: (item) =>
          usuario?.idUsuario !== item.idUsuario ? (
            <View style={styles.acoesLinha}>
              <Button
                variant="outline"
                size="small"
                iconLeft="create-outline"
                loading={carregandoAcao}
                disabled={carregandoAcao}
                onPress={() => confirmarEdicaoUsuario(item)}
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
              >
                Excluir
              </Button>
            </View>
          ) : (
            <ThemedText color="textSecondary" size="sm" align="center">
              Conta atual
            </ThemedText>
          ),
      },
    ];

    return (
      <>
        <BarraFiltroAdmin
          titulo="Planilha de usuários"
          subtitulo="Pesquisa e filtros aplicados aos usuários carregados na página atual."
          pesquisa={buscaUsuarios}
          onChangePesquisa={setBuscaUsuarios}
          pesquisaPlaceholder="Pesquisar por nome ou e-mail"
          filtros={[
            {
              chave: 'role',
              label: 'Perfil',
              valor: filtroRoleUsuarios,
              opcoes: opcoesRoleUsuarios,
              onSelect: setFiltroRoleUsuarios,
            },
            {
              chave: 'status',
              label: 'Status',
              valor: filtroStatusUsuarios,
              opcoes: opcoesStatusUsuarios,
              onSelect: setFiltroStatusUsuarios,
            },
          ]}
          onLimparFiltros={limparFiltrosUsuarios}
        />

        <Spacer size="sm" />

        <ThemedText color="textSecondary" size="sm">
          Exibindo {usuariosFiltrados.length} de {usuarios.length} registros nesta página.
        </ThemedText>

        <Spacer size="sm" />

        <TabelaPlanilhaAdmin
          colunas={colunas}
          dados={usuariosFiltrados}
          chaveExtractor={(item) => String(item.idUsuario)}
          renderVazio={
            <ThemedText size="sm" color="textSecondary">
              Nenhum usuário encontrado com os filtros atuais.
            </ThemedText>
          }
          carregando={carregando}
          larguraMinima={1120}
        />

        <Spacer size="sm" />

        {renderPaginacao({
          paginaAtual: paginaUsuarios,
          totalPaginas: totalPaginasUsuarios,
          onAnterior: () => setPaginaUsuarios((p) => Math.max(0, p - 1)),
          onProxima: () => setPaginaUsuarios((p) => Math.min(totalPaginasUsuarios - 1, p + 1)),
        })}
      </>
    );
  };

  const renderLocais = () => {
    const colunas = [
      {
        chave: 'nome',
        titulo: 'Local',
        flex: 1.7,
        minWidth: 220,
        render: (item) => (
          <View>
            <ThemedText weight="bold" size="sm">
              {item.nome || 'Local sem nome'}
            </ThemedText>
            <Spacer size="xs" />
            <ThemedText color="textSecondary" size="xs">
              ID #{item.idLocal}
            </ThemedText>
          </View>
        ),
      },
      {
        chave: 'categoria',
        titulo: 'Categoria',
        flex: 1,
        minWidth: 160,
        render: (item) => (
          <EtiquetaStatus texto={item?.categoria?.nome || 'Não informada'} tipo="neutro" />
        ),
      },
      {
        chave: 'cidade',
        titulo: 'Cidade / UF',
        flex: 1.1,
        minWidth: 180,
        render: (item) => (
          <ThemedText color="textSecondary" size="sm">
            {item?.endereco?.cidade || 'N/I'} - {item?.endereco?.estado || 'N/I'}
          </ThemedText>
        ),
      },
    ];

    return (
      <>
        <BarraFiltroAdmin
          titulo="Planilha de locais"
          subtitulo="Busca por nome ou cidade e filtro por categoria nos registros carregados na página atual."
          pesquisa={buscaLocais}
          onChangePesquisa={setBuscaLocais}
          pesquisaPlaceholder="Pesquisar por nome ou cidade"
          filtros={[
            {
              chave: 'categoria',
              label: 'Categoria',
              valor: filtroCategoriaLocais,
              opcoes: opcoesCategoriaLocais,
              onSelect: setFiltroCategoriaLocais,
            },
          ]}
          onLimparFiltros={limparFiltrosLocais}
        />

        <Spacer size="sm" />

        <ThemedText color="textSecondary" size="sm">
          Exibindo {locaisFiltrados.length} de {locais.length} registros nesta página.
        </ThemedText>

        <Spacer size="sm" />

        <TabelaPlanilhaAdmin
          colunas={colunas}
          dados={locaisFiltrados}
          chaveExtractor={(item) => String(item.idLocal)}
          renderVazio={
            <ThemedText size="sm" color="textSecondary">
              Nenhum local encontrado com os filtros atuais.
            </ThemedText>
          }
          carregando={carregando}
          larguraMinima={760}
        />

        <Spacer size="sm" />

        {renderPaginacao({
          paginaAtual: paginaLocais,
          totalPaginas: totalPaginasLocais,
          onAnterior: () => setPaginaLocais((p) => Math.max(0, p - 1)),
          onProxima: () => setPaginaLocais((p) => Math.min(totalPaginasLocais - 1, p + 1)),
        })}
      </>
    );
  };

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
          <Spacer size="sm" />
          <Button
            variant="outline"
            size="small"
            onPress={tentarNovamente}
            disabled={carregando}
          >
            Tentar novamente
          </Button>
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

      <Modal
        visible={modalDeleteVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalDeleteVisivel(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: t.colors.surface, width: width < 768 ? '88%' : '35%' }]}>
            <ThemedText variant="h2" weight="bold" align="center" color="text">
              Apagar usuário
            </ThemedText>

            <Spacer size="lg" />

            <View style={styles.modalMessage}>
              <ThemedText color="textSecondary" align="center" size="sm">
                Tem certeza que deseja apagar{' '}
                <ThemedText weight="bold" color="textSecondary">
                  {usuarioParaDeletar?.nome || ''}
                </ThemedText>
                ? Esta ação não pode ser desfeita.
              </ThemedText>
            </View>

            <Spacer size="xl" />

            <View style={styles.modalBotoes}>
              <Button
                variant="danger"
                size="medium"
                fullWidth
                onPress={async () => {
                  await apagarUsuario(usuarioParaDeletar);
                  setModalDeleteVisivel(false);
                }}
                loading={carregandoAcao}
                disabled={carregandoAcao}
              >
                Deletar
              </Button>

              <Spacer size="xs" />

              <Button
                variant="outline"
                size="medium"
                fullWidth
                onPress={() => {
                  setModalDeleteVisivel(false);
                }}
                disabled={carregandoAcao}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalMessage: {
    marginHorizontal: 4,
  },
  modalBotoes: {
    flexDirection: 'column',
    gap: 8,
  },
});
