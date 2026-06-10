import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Modal, TextInput, useWindowDimensions, Platform } from 'react-native';
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
import Denuncias from '../denuncia/Denuncias';

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
  const [filtroDataInicioInput, setFiltroDataInicioInput] = useState('');
  const [filtroDataFimInput, setFiltroDataFimInput] = useState('');
  const [filtroDataInicioAplicado, setFiltroDataInicioAplicado] = useState('');
  const [filtroDataFimAplicado, setFiltroDataFimAplicado] = useState('');
  const [tipoRelatorioExportacao, setTipoRelatorioExportacao] = useState('usuarios');
  const [exportandoRelatorio, setExportandoRelatorio] = useState(false);

  const [estatisticas, setEstatisticas] = useState(null);
  const [relatorioUsuarios, setRelatorioUsuarios] = useState(null);
  const [relatorioLocais, setRelatorioLocais] = useState(null);
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
      { key: 'denuncias', label: 'Denúncias' },  
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

  const mapaCategorias = {
    COMERCIAL: 'Comercial',
    PUBLICO: 'Público',
    SAUDE: 'Saúde',
    EDUCACAO: 'Educação',
    LAZER: 'Lazer',
    TRANSPORTE: 'Transporte',
    ALIMENTACAO: 'Alimentação',
    HOSPEDAGEM: 'Hospedagem',
    SERVICOS: 'Serviços',
    SEM_CATEGORIA: 'Não informado',
  };

  const mapaStatusLocal = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    EM_ANALISE: 'Em análise',
    REPORTADO: 'Reportado',
    SEM_STATUS: 'Não informado',
  };

  const mapaTiposAcessibilidade = {
    RAMPA: 'Rampa de acesso',
    ELEVADOR: 'Elevador acessível',
    BANHEIRO_ADAPTADO: 'Banheiro adaptado',
    PISO_TATIL: 'Piso tátil',
    SINALIZACAO_BRAILLE: 'Sinalização em braille',
    ESTACIONAMENTO: 'Estacionamento acessível',
    ESPACO_AMPLO: 'Espaço amplo',
    RECURSOS_AUDIOVISUAIS: 'Recursos audiovisuais',
    ATENDIMENTO_ESPECIALIZADO: 'Atendimento especializado',
    MOBILIARIO_ADAPTADO: 'Mobiliário adaptado',
    SEM_TIPO: 'Não informado',
  };

  const mapaPerfis = {
    ADMIN: 'Administrador',
    USUARIO: 'Usuário',
    USUÁRIO: 'Usuário',
    ROLE_ADMIN: 'Administrador',
    ROLE_USER: 'Usuário',
  };

  const formatarLabelPadrao = (valor) => String(valor || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());

  const formatarLabelRelatorio = (valor, tipo) => {
    const chave = String(valor || '').trim();
    const chaveUpper = chave.toUpperCase();

    if (tipo === 'categoria') return mapaCategorias[chaveUpper] || formatarLabelPadrao(chave);
    if (tipo === 'status') return mapaStatusLocal[chaveUpper] || formatarLabelPadrao(chave);
    if (tipo === 'acessibilidade') return mapaTiposAcessibilidade[chaveUpper] || formatarLabelPadrao(chave);
    if (tipo === 'perfil') return mapaPerfis[chaveUpper] || formatarLabelPadrao(chave);

    return formatarLabelPadrao(chave);
  };

  const formatarDataHoraRelatorio = (valor) => {
    if (!valor) return 'Não disponível';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return String(valor);
    return data.toLocaleString('pt-BR');
  };

  const formatarPeriodoAplicado = () => {
    const inicio = retornoPeriodoBackend?.dataInicio;
    const fim = retornoPeriodoBackend?.dataFim;
    if (!inicio && !fim) return 'Período completo (sem filtro)';
    if (inicio && fim) return `${inicio} até ${fim}`;
    if (inicio) return `A partir de ${inicio}`;
    return `Até ${fim}`;
  };

  const isMesAnoValido = (valor) => /^(0[1-9]|1[0-2])\/\d{4}$/.test(String(valor || '').trim());

  const converterMesAnoParaDataApi = (valor, tipo) => {
    const limpo = String(valor || '').trim();
    if (!limpo || !isMesAnoValido(limpo)) return '';

    const [mes, ano] = limpo.split('/');

    if (tipo === 'fim') {
      const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate();
      return `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
    }

    return `${ano}-${mes}-01`;
  };

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
      const dataInicioApi = converterMesAnoParaDataApi(filtroDataInicioAplicado, 'inicio');
      const dataFimApi = converterMesAnoParaDataApi(filtroDataFimAplicado, 'fim');

      const [dadosGerais, dadosUsuarios, dadosLocais] = await Promise.all([
        AdminService.obterEstatisticasGerais(),
        AdminService.obterRelatorioUsuarios({
          dataInicio: dataInicioApi || undefined,
          dataFim: dataFimApi || undefined,
        }),
        AdminService.obterRelatorioLocais({
          dataInicio: dataInicioApi || undefined,
          dataFim: dataFimApi || undefined,
        }),
      ]);

      setEstatisticas(dadosGerais || {});
      setRelatorioUsuarios(dadosUsuarios || {});
      setRelatorioLocais(dadosLocais || {});
    } catch (e) {
      setErro('Não foi possível carregar o resumo administrativo.');
      setEstatisticas(null);
      setRelatorioUsuarios(null);
      setRelatorioLocais(null);
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
    if (abaAtiva === 'denuncias') {
      
      return;
    }
    carregarRelatorios();
  }, [abaAtiva, paginaUsuarios, paginaLocais, sortField, sortDirection, filtroDataInicioAplicado, filtroDataFimAplicado]);

  const aplicarFiltrosRelatorio = () => {
    const inicio = String(filtroDataInicioInput || '').trim();
    const fim = String(filtroDataFimInput || '').trim();

    if (inicio && !isMesAnoValido(inicio)) {
      toastHelper.showError('Data inicial inválida. Use o formato MM/AAAA.', 'Filtro inválido');
      return;
    }

    if (fim && !isMesAnoValido(fim)) {
      toastHelper.showError('Data final inválida. Use o formato MM/AAAA.', 'Filtro inválido');
      return;
    }

    const [mesInicio, anoInicio] = inicio ? inicio.split('/') : [];
    const [mesFim, anoFim] = fim ? fim.split('/') : [];
    const chaveInicio = inicio ? Number(`${anoInicio}${mesInicio}`) : null;
    const chaveFim = fim ? Number(`${anoFim}${mesFim}`) : null;

    if (chaveInicio && chaveFim && chaveInicio > chaveFim) {
      toastHelper.showError('A data inicial deve ser menor ou igual à data final.', 'Filtro inválido');
      return;
    }

    setFiltroDataInicioAplicado(inicio);
    setFiltroDataFimAplicado(fim);
  };

  const limparFiltrosRelatorio = () => {
    setFiltroDataInicioInput('');
    setFiltroDataFimInput('');
    setFiltroDataInicioAplicado('');
    setFiltroDataFimAplicado('');
  };

  const payloadRelatorio = useMemo(() => ({
    dataInicio: converterMesAnoParaDataApi(filtroDataInicioAplicado, 'inicio') || null,
    dataFim: converterMesAnoParaDataApi(filtroDataFimAplicado, 'fim') || null,
  }), [filtroDataInicioAplicado, filtroDataFimAplicado]);

  const retornoPeriodoBackend = useMemo(() => ({
    dataInicio: relatorioUsuarios?.filtroDataInicio || relatorioLocais?.filtroDataInicio || null,
    dataFim: relatorioUsuarios?.filtroDataFim || relatorioLocais?.filtroDataFim || null,
    geradoEm: relatorioUsuarios?.geradoEm || relatorioLocais?.geradoEm || null,
  }), [relatorioUsuarios, relatorioLocais]);

  const baixarArquivoRelatorio = async (blob, nomeArquivo) => {
    if (Platform.OS !== 'web') {
      toastHelper.showInfo('No momento, o download de relatório está disponível no painel web.', 'Download indisponível no app');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const extrairNomeArquivo = (headers, fallback) => {
    const contentDisposition = headers?.['content-disposition'] || headers?.['Content-Disposition'] || '';
    const match = String(contentDisposition).match(/filename=([^;]+)/i);
    if (!match?.[1]) return fallback;
    return match[1].replace(/"/g, '').trim() || fallback;
  };

  const exportarRelatorio = async (formato) => {
    setExportandoRelatorio(true);
    try {
      const params = {
        dataInicio: payloadRelatorio.dataInicio || undefined,
        dataFim: payloadRelatorio.dataFim || undefined,
      };

      let resposta;
      if (tipoRelatorioExportacao === 'usuarios' && formato === 'csv') {
        resposta = await AdminService.exportarRelatorioUsuariosCsv(params);
      } else if (tipoRelatorioExportacao === 'usuarios' && formato === 'pdf') {
        resposta = await AdminService.exportarRelatorioUsuariosPdf(params);
      } else if (tipoRelatorioExportacao === 'locais' && formato === 'csv') {
        resposta = await AdminService.exportarRelatorioLocaisCsv(params);
      } else {
        resposta = await AdminService.exportarRelatorioLocaisPdf(params);
      }

      const fallback = `relatorio-${tipoRelatorioExportacao}.${formato}`;
      const nomeArquivo = extrairNomeArquivo(resposta?.headers, fallback);
      await baixarArquivoRelatorio(resposta?.data, nomeArquivo);
      toastHelper.showSuccess(`Download iniciado: ${nomeArquivo}`, 'Relatório exportado');
    } catch (e) {
      toastHelper.showError('Não foi possível exportar o relatório.', 'Erro na exportação');
    } finally {
      setExportandoRelatorio(false);
    }
  };

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

    if (abaAtiva === 'denuncias') {
  
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

  const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);

  const renderLinhaMetrica = (label, valor) => (
    <View key={label} style={styles.itemMetricaLinha}>
      <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>{label}</ThemedText>
      <View style={[styles.badgeValorMetrica, { backgroundColor: t.colors.surfaceSecondary, borderColor: t.colors.border }]}>
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>{valor}</ThemedText>
      </View>
    </View>
  );

  const renderKpi = (titulo, valor) => (
    <View key={titulo} style={[styles.kpiCard, { backgroundColor: t.colors.surfaceSecondary, borderColor: t.colors.border }]}> 
      <ThemedText size="xs" altoContraste={isHighContrast} color={corSecundaria}>{titulo}</ThemedText>
      <Spacer size="xs" />
      <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>{valor}</ThemedText>
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
          larguraMinima={1120}
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
    <View style={styles.relatoriosContainer}>
      <Card style={styles.cardUsuario}>
        <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Filtros do relatório</ThemedText>
        <Spacer size="sm" />
        <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Use o formato MM/AAAA. Se deixar vazio, o relatório busca todos os dados.</ThemedText>
        <Spacer size="sm" />
        <View style={styles.filtrosDataContainer}>
          <TextInput
            style={[styles.inputData, { color: t.colors.textPrimary, borderColor: t.colors.border, backgroundColor: t.colors.surfaceSecondary }]}
            placeholder="Data inicial (MM/AAAA)"
            placeholderTextColor={t.colors.textSecondary}
            value={filtroDataInicioInput}
            onChangeText={setFiltroDataInicioInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.inputData, { color: t.colors.textPrimary, borderColor: t.colors.border, backgroundColor: t.colors.surfaceSecondary }]}
            placeholder="Data final (MM/AAAA)"
            placeholderTextColor={t.colors.textSecondary}
            value={filtroDataFimInput}
            onChangeText={setFiltroDataFimInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <Spacer size="sm" />
        <View style={styles.filtrosDataAcoes}>
          <Button variant="primary" size="small" onPress={aplicarFiltrosRelatorio}>Aplicar filtros</Button>
          <Button variant="outline" size="small" onPress={limparFiltrosRelatorio}>Limpar</Button>
        </View>

        <Spacer size="sm" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Exportar relatório (um por vez)</ThemedText>
        <Spacer size="xs" />
        <View style={styles.filtrosDataAcoes}>
          <Button
            variant={tipoRelatorioExportacao === 'usuarios' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setTipoRelatorioExportacao('usuarios')}
            disabled={exportandoRelatorio}
          >
            Usuários
          </Button>
          <Button
            variant={tipoRelatorioExportacao === 'locais' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setTipoRelatorioExportacao('locais')}
            disabled={exportandoRelatorio}
          >
            Locais
          </Button>
        </View>
        <Spacer size="xs" />
        <View style={styles.filtrosDataAcoes}>
          <Button
            variant="outline"
            size="small"
            onPress={() => exportarRelatorio('csv')}
            loading={exportandoRelatorio}
            disabled={exportandoRelatorio}
          >
            Exportar CSV
          </Button>
          <Button
            variant="primary"
            size="small"
            onPress={() => exportarRelatorio('pdf')}
            loading={exportandoRelatorio}
            disabled={exportandoRelatorio}
          >
            Exportar PDF
          </Button>
        </View>

        <Spacer size="sm" />
        <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>
          Período aplicado: {formatarPeriodoAplicado()}
        </ThemedText>
        <Spacer size="xs" />
        <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>
          Última atualização: {formatarDataHoraRelatorio(retornoPeriodoBackend.geradoEm)}
        </ThemedText>
      </Card>

      <Card style={styles.cardUsuario}>
        <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Resumo Geral</ThemedText>
        <Spacer size="md" />
        <View style={styles.gridKpis}>
          {renderKpi('Total de usuários', formatarNumero(estatisticas?.totalUsuarios))}
          {renderKpi('Usuários ativos', formatarNumero(relatorioUsuarios?.totalAtivos))}
          {renderKpi('Usuários inativos', formatarNumero(relatorioUsuarios?.totalInativos))}
          {renderKpi('Total de locais', formatarNumero(estatisticas?.totalLocais))}
          {renderKpi('Total de avaliações', formatarNumero(estatisticas?.totalAvaliacoes))}
          {renderKpi('Avaliações pendentes', formatarNumero(estatisticas?.avaliacoesPendentes))}
        </View>
      </Card>

      <Card style={styles.cardUsuario}>
        <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Relatório de Usuários</ThemedText>
        <Spacer size="md" />
        <View style={styles.listaMetricasContainer}>
          {renderLinhaMetrica('Usuários ativos', formatarNumero(relatorioUsuarios?.totalAtivos))}
          {renderLinhaMetrica('Usuários inativos', formatarNumero(relatorioUsuarios?.totalInativos))}
          {renderLinhaMetrica('Administradores', formatarNumero(relatorioUsuarios?.totalAdmins))}
          {renderLinhaMetrica('Usuários comuns', formatarNumero(relatorioUsuarios?.totalUsuariosComuns))}
          {renderLinhaMetrica('Cadastros nos últimos 30 dias', formatarNumero(relatorioUsuarios?.cadastrosUltimos30Dias))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Distribuição por perfil</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioUsuarios?.distribuicaoPorPerfil || {}).map(([perfil, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(perfil, 'perfil'), formatarNumero(total))
          ))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Cadastros (últimos 6 meses)</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioUsuarios?.cadastrosUltimosSeisMeses || {}).map(([mes, total]) => (
            renderLinhaMetrica(mes, formatarNumero(total))
          ))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Últimos usuários cadastrados</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {(relatorioUsuarios?.ultimosUsuarios || []).map((item) => (
            <View key={String(item?.idUsuario)} style={styles.itemListaTexto}>
              <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>
                {item?.nome || 'Sem nome'}
              </ThemedText>
              <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>
                {item?.email || 'Sem e-mail'}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.cardUsuario}>
        <ThemedText variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Relatório de Locais</ThemedText>
        <Spacer size="md" />
        <View style={styles.listaMetricasContainer}>
          {renderLinhaMetrica('Total de locais', formatarNumero(relatorioLocais?.totalLocais))}
          {renderLinhaMetrica('Locais com avaliação', formatarNumero(relatorioLocais?.locaisComAvaliacao))}
          {renderLinhaMetrica('Locais sem avaliação', formatarNumero(relatorioLocais?.locaisSemAvaliacao))}
          {renderLinhaMetrica('Média geral', Number(relatorioLocais?.mediaAvaliacaoGeral || 0).toFixed(2))}
          {renderLinhaMetrica('Total de avaliações registradas', formatarNumero(relatorioLocais?.totalAvaliacoes))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Status dos locais</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorStatus || {}).map(([status, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(status, 'status'), formatarNumero(total))
          ))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Distribuição por categoria</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorCategoria || {}).map(([categoria, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(categoria, 'categoria'), formatarNumero(total))
          ))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Distribuição por estado</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorEstado || {}).map(([estado, total]) => (
            renderLinhaMetrica(estado, formatarNumero(total))
          ))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Recursos de acessibilidade mais usados</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorTipoAcessibilidade || {}).map(([tipo, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(tipo, 'acessibilidade'), formatarNumero(total))
          ))}
        </View>

        <Spacer size="md" />
        <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Locais mais bem avaliados</ThemedText>
        <Spacer size="xs" />
        <View style={styles.listaMetricasContainer}>
          {(relatorioLocais?.locaisMaisBemAvaliados || []).map((item) => (
            <View key={String(item?.idLocal)} style={styles.itemListaTexto}>
              <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>
                {item?.nome || 'Sem nome'} ({item?.cidade || '-'} / {item?.estado || '-'})
              </ThemedText>
              <ThemedText size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>
                Nota {Number(item?.avaliacaoMedia || 0).toFixed(2)}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>
    </View>
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

        {carregando && abaAtiva !== 'denuncias' ? (
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <ThemedText size="sm" altoContraste={isHighContrast} color={corSecundaria}>Carregando dados...</ThemedText>
          </Card>
        ) : null}

        {erro && abaAtiva !== 'denuncias' ? (
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

        {!carregando && !erro && abaAtiva === 'usuarios' && renderUsuarios()}
        {!carregando && !erro && abaAtiva === 'locais' && renderLocais()}
        {!carregando && !erro && abaAtiva === 'denuncias' && <Denuncias />}
        {!carregando && !erro && abaAtiva === 'relatorios' && renderRelatorios()}
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
  relatoriosContainer: {
    gap: theme.spacing.md,
  },
  gridKpis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  kpiCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: theme.spacing.sm,
    minWidth: 180,
    flexGrow: 1,
  },
  linhaRelatorios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  listaMetricasContainer: {
    gap: theme.spacing.xs,
  },
  itemMetricaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  badgeValorMetrica: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    minWidth: 72,
    alignItems: 'center',
  },
  itemListaTexto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  filtrosDataContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  inputData: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    minWidth: 220,
    flexGrow: 1,
  },
  filtrosDataAcoes: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  acoesLinha: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    width: '100%',
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