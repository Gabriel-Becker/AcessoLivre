import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Modal, useWindowDimensions } from 'react-native';
import { Container } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import { Spacer, ThemedText } from '../../components/commons';
import EditarUsuarioModal from '../../components/feedback/EditarUsuarioModal';
import EditarLocalModal from '../../components/admin/EditarLocalModal';
import { BarraFiltroAdmin, TabelaPlanilhaAdmin } from '../../components/admin';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import AdminService from '../../services/AdminService';
import LocalService from '../../services/LocalService';
import theme from '../../config/theme';
import toastHelper from '../../utils/toastHelper';
import { colunasUsuarios, colunasLocais } from '../../config/admin/colunasConfig';
import { filtrosUsuarios, filtrosLocais } from '../../config/admin/filtrosConfig';

export default function Admin() {
  const { usuario } = useAuth();
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const ehMobile = width < 768;
  const corPrincipal = isHighContrast ? 'textOnPrimary' : 'textPrimary';
  const corSecundaria = isHighContrast ? 'textOnPrimary' : 'textSecondary';
  const [abaAtiva, setAbaAtiva] = useState('usuarios');

  const [usuarios, setUsuarios] = useState([]);
  const [paginaUsuarios, setPaginaUsuarios] = useState(0);
  const [totalPaginasUsuarios, setTotalPaginasUsuarios] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [sortField, setSortField] = useState('dataCadastro');
  const [sortDirection, setSortDirection] = useState('DESC');

  const [locais, setLocais] = useState([]);
  const [paginaLocais, setPaginaLocais] = useState(0);
  const [totalPaginasLocais, setTotalPaginasLocais] = useState(1);
  const [totalLocais, setTotalLocais] = useState(0);

  const [buscaUsuarios, setBuscaUsuarios] = useState('');
  const [filtroRoleUsuarios, setFiltroRoleUsuarios] = useState('todos');

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
  const [modalEditarLocalVisivel, setModalEditarLocalVisivel] = useState(false);
  const [localSelecionado, setLocalSelecionado] = useState(null);
  const [modalDeleteLocalVisivel, setModalDeleteLocalVisivel] = useState(false);
  const [localParaDeletar, setLocalParaDeletar] = useState(null);

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
  };

  const limparFiltrosLocais = () => {
    setBuscaLocais('');
    setFiltroCategoriaLocais('todos');
  };

  const confirmarEdicaoLocal = (localItem) => {
    setLocalSelecionado(localItem);
    setModalEditarLocalVisivel(true);
  };

  const confirmarApagarLocal = (localItem) => {
    setLocalParaDeletar(localItem);
    setModalDeleteLocalVisivel(true);
  };

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await AdminService.listarUsuarios({ page: paginaUsuarios, size: 8, sort: sortField, direction: sortDirection });
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
  }, [abaAtiva, paginaUsuarios, paginaLocais, sortField, sortDirection]);

  const handleSortChange = (novaChave) => {
    if (sortField === novaChave) {
      setSortDirection((d) => (String(d).toUpperCase() === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(novaChave);
      setSortDirection('ASC');
    }
    setPaginaUsuarios(0);
  };

  const opcoesRoleUsuarios = useMemo(
    () => filtrosUsuarios(filtroRoleUsuarios, setFiltroRoleUsuarios).find(f => f.chave === 'role')?.opcoes || [],
    []
  );

  const usuariosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaUsuarios);

    return usuarios.filter((item) => {
      const nome = normalizarTexto(item?.nome);
      const email = normalizarTexto(item?.email);
      const role = String(item?.role || 'ROLE_USER').toUpperCase();

      const atendeBusca = !termo || nome.includes(termo) || email.includes(termo);
      const atendeRole = filtroRoleUsuarios === 'todos' || role === filtroRoleUsuarios;

      return atendeBusca && atendeRole;
    });
  }, [usuarios, buscaUsuarios, filtroRoleUsuarios]);

  const locaisFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaLocais);

    return locais.filter((item) => {
      const nome = normalizarTexto(item?.nome);
      const cidade = normalizarTexto(item?.endereco?.cidade);
      const categoria = normalizarTexto(item?.categoria?.nome || item?.categoria || '');

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

  const apagarLocal = async (localItem) => {
    setCarregandoAcao(true);
    setErro('');

    try {
      await LocalService.removerLocal(localItem.idLocal);
      toastHelper.showSuccess('Local removido com sucesso.', 'Exclusão concluída');

      if (locais.length === 1 && paginaLocais > 0) {
        setPaginaLocais((p) => Math.max(0, p - 1));
      } else {
        await carregarLocais();
      }
    } catch (e) {
      const mensagemErro = e?.response?.data?.mensagem || e?.response?.data?.message || 'Não foi possível apagar o local.';
      setErro(mensagemErro);
      toastHelper.showError(mensagemErro, 'Falha ao excluir local');
    } finally {
      setCarregandoAcao(false);
    }
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
    <View style={[styles.paginacao, ehMobile && styles.paginacaoEmpilhada]}>
      <Button
        variant="outline"
        size="small"
        onPress={onAnterior}
        disabled={carregando || paginaAtual <= 0}
        altoContraste={isHighContrast}
        textStyle={{ color: isHighContrast ? t.colors.textOnPrimary : undefined }}
      >
        Anterior
      </Button>
      <ThemedText color={corSecundaria} altoContraste={isHighContrast}>
        Página {paginaAtual + 1} de {totalPaginas}
      </ThemedText>
      <Button
        variant="outline"
        size="small"
        onPress={onProxima}
        disabled={carregando || paginaAtual + 1 >= totalPaginas}
        altoContraste={isHighContrast}
        textStyle={{ color: isHighContrast ? t.colors.textOnPrimary : undefined }}
      >
        Próxima
      </Button>
    </View>
  );

  const renderUsuarios = () => {
    const colunas = colunasUsuarios(usuario, styles, carregandoAcao, formatarRoleUsuario, confirmarEdicaoUsuario, confirmarApagarUsuario, isHighContrast);
    const filtros = filtrosUsuarios(filtroRoleUsuarios, setFiltroRoleUsuarios);

    return (
      <>
        <BarraFiltroAdmin
          titulo="Planilha de usuários"
          pesquisa={buscaUsuarios}
          onChangePesquisa={setBuscaUsuarios}
          pesquisaPlaceholder="Pesquisar por nome ou e-mail"
          filtros={filtros}
          altoContraste={isHighContrast}
        />

        <Spacer size="sm" />

        <TabelaPlanilhaAdmin
          colunas={colunas}
          dados={usuariosFiltrados}
          chaveExtractor={(item) => String(item.idUsuario)}
          renderVazio={
            <ThemedText size="sm" color={corSecundaria} altoContraste={isHighContrast}>
              Nenhum usuário encontrado com os filtros atuais.
            </ThemedText>
          }
          carregando={carregando}
          larguraMinima={1120}
          sortField={sortField}
          sortDirection={sortDirection}
          onChangeSort={handleSortChange}
          altoContraste={isHighContrast}
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
    const colunas = colunasLocais(styles, carregandoAcao, confirmarEdicaoLocal, confirmarApagarLocal, isHighContrast);
    const filtros = filtrosLocais(filtroCategoriaLocais, setFiltroCategoriaLocais, locais);

    return (
      <>
        <BarraFiltroAdmin
          titulo="Planilha de locais"
          pesquisa={buscaLocais}
          onChangePesquisa={setBuscaLocais}
          pesquisaPlaceholder="Pesquisar por nome ou cidade"
          filtros={filtros}
          altoContraste={isHighContrast}
        />

        <Spacer size="sm" />

        <TabelaPlanilhaAdmin
          colunas={colunas}
          dados={locaisFiltrados}
          chaveExtractor={(item) => String(item.idLocal)}
          renderVazio={
            <ThemedText size="sm" color={corSecundaria} altoContraste={isHighContrast}>
              Nenhum local encontrado com os filtros atuais.
            </ThemedText>
          }
          carregando={carregando}
          larguraMinima={760}
          altoContraste={isHighContrast}
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
      <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Resumo Geral</ThemedText>
      <Spacer size="md" />
      <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Total de usuários: {Number(estatisticas?.totalUsuarios) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Total de locais: {Number(estatisticas?.totalLocais) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Total de avaliações: {Number(estatisticas?.totalAvaliacoes) || 0}</ThemedText>
      <Spacer size="xs" />
      <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Avaliações pendentes: {Number(estatisticas?.avaliacoesPendentes) || 0}</ThemedText>
    </Card>
  );

  return (
    <Container background={isHighContrast ? 'background' : 'backgroundSecondary'} scroll contentStyle={styles.scrollContent} altoContraste={isHighContrast}>
      <View style={[styles.pageShell, { paddingHorizontal: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
        <View style={styles.cabecalhoPagina}>
          <ThemedText variant="h1" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
            Painel Administrativo
          </ThemedText>
        </View>

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
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Carregando dados...</ThemedText>
          </Card>
        ) : null}

        {erro ? (
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <ThemedText color="error" size="sm" altoContraste={isHighContrast}>{erro}</ThemedText>
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
      </View>

      <EditarUsuarioModal
        visible={modalEditarVisivel}
        onClose={() => setModalEditarVisivel(false)}
        usuario={usuarioSelecionado}
        onSucesso={() => {
          setUsuarioSelecionado(null);
          carregarUsuarios();
        }}
      />

      <EditarLocalModal
        visible={modalEditarLocalVisivel}
        onClose={() => setModalEditarLocalVisivel(false)}
        local={localSelecionado}
        onSucesso={() => {
          setLocalSelecionado(null);
          carregarLocais();
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
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: t.colors.surface,
                width: width < 768 ? '88%' : width < 1024 ? '52%' : '35%',
              },
            ]}
          >
            <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
              Apagar usuário
            </ThemedText>

            <Spacer size="lg" />

            <View style={styles.modalMessage}>
              <ThemedText color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja apagar{' '}
                <ThemedText weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
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

      <Modal
        visible={modalDeleteLocalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalDeleteLocalVisivel(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: t.colors.surface,
                width: width < 768 ? '88%' : width < 1024 ? '52%' : '35%',
              },
            ]}
          >
            <ThemedText variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
              Apagar local
            </ThemedText>

            <Spacer size="lg" />

            <View style={styles.modalMessage}>
              <ThemedText color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja apagar{' '}
                <ThemedText weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
                  {localParaDeletar?.nome || ''}
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
                  await apagarLocal(localParaDeletar);
                  setModalDeleteLocalVisivel(false);
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
                  setModalDeleteLocalVisivel(false);
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
    paddingTop: theme.spacing.md,
  },
  pageShell: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  cabecalhoPagina: {
    width: '100%',
    alignItems: 'center',
  },
  abasContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  paginacaoEmpilhada: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cardUsuario: {
    padding: theme.spacing.md,
  },
  acoesLinha: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
