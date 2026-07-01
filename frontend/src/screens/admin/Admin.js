import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Modal, TextInput, useWindowDimensions, Platform } from 'react-native';
import { Recipiente } from '../../components/layout';
import { Botao, Card } from '../../components/ui';
import { Espacador, TextoTematizado } from '../../components/commons';
import EditarUsuarioModal from '../../components/feedback/EditarUsuarioModal';
import EditarLocalModal from '../../components/admin/EditarLocalModal';
import { BarraFiltroAdmin, TabelaPlanilhaAdmin } from '../../components/admin';
import { useAuth } from '../../context/ContextoAutenticacao';
import { useThemeContext } from '../../context/ThemeContext';
import ServicoAdmin from '../../services/ServicoAdmin';
import ServicoLocal from '../../services/ServicoLocal';
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
  const [filtroStatusUsuarios, setFiltroStatusUsuarios] = useState('ativos');

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
      { key: 'usuarios', label: 'UsuÃ¡rios' },
      { key: 'locais', label: 'Locais' },
      { key: 'denuncias', label: 'DenÃºncias' },  
      { key: 'relatorios', label: 'RelatÃ³rios' },
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
    return 'UsuÃ¡rio';
  };

  const normalizarTexto = (texto) =>
    String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const mapaCategorias = {
    COMERCIAL: 'Comercial',
    PUBLICO: 'PÃºblico',
    SAUDE: 'SaÃºde',
    EDUCACAO: 'EducaÃ§Ã£o',
    LAZER: 'Lazer',
    TRANSPORTE: 'Transporte',
    ALIMENTACAO: 'AlimentaÃ§Ã£o',
    HOSPEDAGEM: 'Hospedagem',
    SERVICOS: 'ServiÃ§os',
    SEM_CATEGORIA: 'NÃ£o informado',
  };

  const mapaStatusLocal = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    EM_ANALISE: 'Em anÃ¡lise',
    REPORTADO: 'Reportado',
    SEM_STATUS: 'NÃ£o informado',
  };

  const mapaTiposAcessibilidade = {
    RAMPA: 'Rampa de acesso',
    ELEVADOR: 'Elevador acessÃ­vel',
    BANHEIRO_ADAPTADO: 'Banheiro adaptado',
    PISO_TATIL: 'Piso tÃ¡til',
    SINALIZACAO_BRAILLE: 'SinalizaÃ§Ã£o em braille',
    ESTACIONAMENTO: 'Estacionamento acessÃ­vel',
    ESPACO_AMPLO: 'EspaÃ§o amplo',
    RECURSOS_AUDIOVISUAIS: 'Recursos audiovisuais',
    ATENDIMENTO_ESPECIALIZADO: 'Atendimento especializado',
    MOBILIARIO_ADAPTADO: 'MobiliÃ¡rio adaptado',
    SEM_TIPO: 'NÃ£o informado',
  };

  const mapaPerfis = {
    ADMIN: 'Administrador',
    USUARIO: 'UsuÃ¡rio',
    USUÃRIO: 'UsuÃ¡rio',
    ROLE_ADMIN: 'Administrador',
    ROLE_USER: 'UsuÃ¡rio',
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
    if (!valor) return 'NÃ£o disponÃ­vel';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return String(valor);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium',
      hour12: false,
    }).format(data);
  };

  const formatarMesAnoMascara = (valor) => {
    const digitos = String(valor || '').replace(/\D/g, '').slice(0, 6);
    if (!digitos) return '';
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  };

  const formatarPeriodoAplicado = () => {
    const inicio = retornoPeriodoBackend?.dataInicio;
    const fim = retornoPeriodoBackend?.dataFim;
    if (!inicio && !fim) return 'PerÃ­odo completo (sem filtro)';
    if (inicio && fim) return `${inicio} atÃ© ${fim}`;
    if (inicio) return `A partir de ${inicio}`;
    return `AtÃ© ${fim}`;
  };

  const isMesAnoValido = (valor) => /^(0[1-9]|1[0-2])\/\d{4}$/.test(String(valor || '').trim());

  const isPeriodoRelatorioValido = useMemo(() => {
    const inicio = String(filtroDataInicioInput || '').trim();
    const fim = String(filtroDataFimInput || '').trim();

    if (inicio && !isMesAnoValido(inicio)) return false;
    if (fim && !isMesAnoValido(fim)) return false;

    if (inicio && fim) {
      const [mesInicio, anoInicio] = inicio.split('/');
      const [mesFim, anoFim] = fim.split('/');
      return Number(`${anoInicio}${mesInicio}`) <= Number(`${anoFim}${mesFim}`);
    }

    return true;
  }, [filtroDataInicioInput, filtroDataFimInput]);

  const atualizarFiltroRelatorio = (valor, tipo) => {
    const formatado = formatarMesAnoMascara(valor);
    if (tipo === 'inicio') {
      setFiltroDataInicioInput(formatado);
      return;
    }
    setFiltroDataFimInput(formatado);
  };

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
    setFiltroStatusUsuarios('ativos');
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
      const dados = await AdminService.listarUsuarios({
        page: paginaUsuarios,
        size: 8,
        sort: sortField,
        direction: sortDirection,
        ativo: filtroStatusUsuarios !== 'inativos',
      });
      const pagina = normalizarPaginacao(dados);
      setUsuarios(pagina.content);
      setTotalPaginasUsuarios(pagina.totalPages);
      setTotalUsuarios(pagina.totalElements);
    } catch (e) {
      setErro('NÃ£o foi possÃ­vel carregar os usuÃ¡rios.');
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
      setErro('NÃ£o foi possÃ­vel carregar os locais.');
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
      setErro('NÃ£o foi possÃ­vel carregar o resumo administrativo.');
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
  }, [abaAtiva, paginaUsuarios, paginaLocais, sortField, sortDirection, filtroDataInicioAplicado, filtroDataFimAplicado, filtroStatusUsuarios]);

  const aplicarFiltrosRelatorio = () => {
    const inicio = String(filtroDataInicioInput || '').trim();
    const fim = String(filtroDataFimInput || '').trim();

    if (inicio && !isMesAnoValido(inicio)) {
      toastHelper.showError('Data inicial invÃ¡lida. Use o formato MM/AAAA.', 'Filtro invÃ¡lido');
      return;
    }

    if (fim && !isMesAnoValido(fim)) {
      toastHelper.showError('Data final invÃ¡lida. Use o formato MM/AAAA.', 'Filtro invÃ¡lido');
      return;
    }

    const [mesInicio, anoInicio] = inicio ? inicio.split('/') : [];
    const [mesFim, anoFim] = fim ? fim.split('/') : [];
    const chaveInicio = inicio ? Number(`${anoInicio}${mesInicio}`) : null;
    const chaveFim = fim ? Number(`${anoFim}${mesFim}`) : null;

    if (chaveInicio && chaveFim && chaveInicio > chaveFim) {
      toastHelper.showError('A data inicial deve ser menor ou igual Ã  data final.', 'Filtro invÃ¡lido');
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
      toastHelper.showInfo('No momento, o download de relatÃ³rio estÃ¡ disponÃ­vel no painel web.', 'Download indisponÃ­vel no app');
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
      toastHelper.showSuccess(`Download iniciado: ${nomeArquivo}`, 'RelatÃ³rio exportado');
    } catch (e) {
      toastHelper.showError('NÃ£o foi possÃ­vel exportar o relatÃ³rio.', 'Erro na exportaÃ§Ã£o');
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

  const usuariosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaUsuarios);

    return usuarios.filter((item) => {
      const nome = normalizarTexto(item?.nome);
      const email = normalizarTexto(item?.email);
      const role = String(item?.role || 'ROLE_USER').toUpperCase();
      const ativo = Boolean(item?.ativo);

      const atendeBusca = !termo || nome.includes(termo) || email.includes(termo);
      const atendeRole = filtroRoleUsuarios === 'todos' || role === filtroRoleUsuarios;
      const atendeStatus = filtroStatusUsuarios === 'inativos' ? !ativo : ativo;

      return atendeBusca && atendeRole && atendeStatus;
    });
  }, [usuarios, buscaUsuarios, filtroRoleUsuarios, filtroStatusUsuarios]);

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
      toastHelper.showSuccess('UsuÃ¡rio removido com sucesso.', 'ExclusÃ£o concluÃ­da');

      if (usuarios.length === 1 && paginaUsuarios > 0) {
        setPaginaUsuarios((p) => Math.max(0, p - 1));
      } else {
        await carregarUsuarios();
      }
    } catch (e) {
      const mensagemErro = e?.response?.data?.mensagem || e?.response?.data?.message || 'NÃ£o foi possÃ­vel apagar o usuÃ¡rio.';
      setErro(mensagemErro);
      toastHelper.showError(mensagemErro, 'Falha ao excluir usuÃ¡rio');
    } finally {
      setCarregandoAcao(false);
    }
  };

  const reativarUsuario = async (usuarioItem) => {
    setCarregandoAcao(true);
    setErro('');
    try {
      await AdminService.reativarUsuario(usuarioItem.idUsuario);
      toastHelper.showSuccess('UsuÃ¡rio reativado com sucesso.', 'ReativaÃ§Ã£o concluÃ­da');

      if (usuarios.length === 1 && paginaUsuarios > 0) {
        setPaginaUsuarios((p) => Math.max(0, p - 1));
      } else {
        await carregarUsuarios();
      }
    } catch (e) {
      const mensagemErro = e?.response?.data?.mensagem || e?.response?.data?.message || 'NÃ£o foi possÃ­vel reativar o usuÃ¡rio.';
      setErro(mensagemErro);
      toastHelper.showError(mensagemErro, 'Falha ao reativar usuÃ¡rio');
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
      toastHelper.showSuccess('Local removido com sucesso.', 'ExclusÃ£o concluÃ­da');

      if (locais.length === 1 && paginaLocais > 0) {
        setPaginaLocais((p) => Math.max(0, p - 1));
      } else {
        await carregarLocais();
      }
    } catch (e) {
      const mensagemErro = e?.response?.data?.mensagem || e?.response?.data?.message || 'NÃ£o foi possÃ­vel apagar o local.';
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
      <Botao
        variant="outline"
        size="small"
        onPress={onAnterior}
        disabled={carregando || paginaAtual <= 0}
        altoContraste={isHighContrast}
        textStyle={{ color: isHighContrast ? t.colors.textOnPrimary : undefined }}
      >
        Anterior
      </Button>
      <TextoTematizado color={corSecundaria} altoContraste={isHighContrast}>
        PÃ¡gina {paginaAtual + 1} de {totalPaginas}
      </ThemedText>
      <Botao
        variant="outline"
        size="small"
        onPress={onProxima}
        disabled={carregando || paginaAtual + 1 >= totalPaginas}
        altoContraste={isHighContrast}
        textStyle={{ color: isHighContrast ? t.colors.textOnPrimary : undefined }}
      >
        PrÃ³xima
      </Button>
    </View>
  );

  const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);

  const cardRelatorioVariant = isHighContrast ? 'outlined' : 'default';
  const corFundoDestaque = isHighContrast ? t.colors.backgroundTertiary : t.colors.surfaceSecondary;

  const renderLinhaMetrica = (label, valor) => (
    <View key={label} style={styles.itemMetricaLinha}>
      <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>{label}</ThemedText>
      <View style={[styles.badgeValorMetrica, { backgroundColor: corFundoDestaque, borderColor: t.colors.border }]}>
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>{valor}</ThemedText>
      </View>
    </View>
  );

  const renderKpi = (titulo, valor) => (
    <View key={titulo} style={[styles.kpiCard, { backgroundColor: corFundoDestaque, borderColor: t.colors.border }]}> 
      <TextoTematizado size="xs" altoContraste={isHighContrast} color={corSecundaria}>{titulo}</ThemedText>
      <Espacador size="xs" />
      <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>{valor}</ThemedText>
    </View>
  );

  const renderUsuarios = () => {
    const colunas = colunasUsuarios(
      usuario,
      styles,
      carregandoAcao,
      formatarRoleUsuario,
      confirmarEdicaoUsuario,
      confirmarApagarUsuario,
      confirmarApagarUsuario,
      isHighContrast
    );
    const filtros = filtrosUsuarios(
      filtroRoleUsuarios,
      setFiltroRoleUsuarios,
      filtroStatusUsuarios,
      (valor) => {
        setFiltroStatusUsuarios(valor);
        setPaginaUsuarios(0);
      }
    );

    return (
      <>
        <BarraFiltroAdmin
          titulo="Planilha de usuÃ¡rios"
          pesquisa={buscaUsuarios}
          onChangePesquisa={setBuscaUsuarios}
          pesquisaPlaceholder="Pesquisar por nome ou e-mail"
          filtros={filtros}
          altoContraste={isHighContrast}
        />

        <Espacador size="sm" />

        <TabelaPlanilhaAdmin
          colunas={colunas}
          dados={usuariosFiltrados}
          chaveExtractor={(item) => String(item.idUsuario)}
          renderVazio={
            <TextoTematizado size="sm" color={corSecundaria} altoContraste={isHighContrast}>
              Nenhum usuÃ¡rio encontrado com os filtros atuais.
            </ThemedText>
          }
          carregando={carregando}
          larguraMinima={1120}
          sortField={sortField}
          sortDirection={sortDirection}
          onChangeSort={handleSortChange}
          altoContraste={isHighContrast}
        />

        <Espacador size="sm" />

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

        <Espacador size="sm" />

        <TabelaPlanilhaAdmin
          colunas={colunas}
          dados={locaisFiltrados}
          chaveExtractor={(item) => String(item.idLocal)}
          renderVazio={
            <TextoTematizado size="sm" color={corSecundaria} altoContraste={isHighContrast}>
              Nenhum local encontrado com os filtros atuais.
            </ThemedText>
          }
          carregando={carregando}
          larguraMinima={1120}
          altoContraste={isHighContrast}
        />

        <Espacador size="sm" />

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
      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Filtros do relatÃ³rio</ThemedText>
        <Espacador size="sm" />
        <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>Use o formato MM/AAAA. Se deixar vazio, o relatÃ³rio busca todos os dados.</ThemedText>
        <Espacador size="sm" />
        <View style={styles.filtrosDataContainer}>
          <TextInput
            style={[styles.inputData, { color: t.colors.textPrimary, borderColor: t.colors.border, backgroundColor: corFundoDestaque }]}
            placeholder="MM/AAAA"
            placeholderTextColor={t.colors.textSecondary}
            value={filtroDataInicioInput}
            onChangeText={(valor) => atualizarFiltroRelatorio(valor, 'inicio')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numeric"
            inputMode="numeric"
          />
          <TextInput
            style={[styles.inputData, { color: t.colors.textPrimary, borderColor: t.colors.border, backgroundColor: corFundoDestaque }]}
            placeholder="MM/AAAA"
            placeholderTextColor={t.colors.textSecondary}
            value={filtroDataFimInput}
            onChangeText={(valor) => atualizarFiltroRelatorio(valor, 'fim')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numeric"
            inputMode="numeric"
          />
        </View>
        <Espacador size="sm" />
        <View style={styles.filtrosDataAcoes}>
          <Botao variant="primary" size="small" onPress={aplicarFiltrosRelatorio} disabled={!isPeriodoRelatorioValido} altoContraste={isHighContrast}>Aplicar filtros</Button>
          <Botao variant="outline" size="small" onPress={limparFiltrosRelatorio} altoContraste={isHighContrast}>Limpar</Button>
        </View>

        <Espacador size="sm" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Exportar relatÃ³rio (um por vez)</ThemedText>
        <Espacador size="xs" />
        <View style={styles.filtrosDataAcoes}>
          <Botao
            variant={tipoRelatorioExportacao === 'usuarios' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setTipoRelatorioExportacao('usuarios')}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            UsuÃ¡rios
          </Button>
          <Botao
            variant={tipoRelatorioExportacao === 'locais' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setTipoRelatorioExportacao('locais')}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            Locais
          </Button>
        </View>
        <Espacador size="xs" />
        <View style={styles.filtrosDataAcoes}>
          <Botao
            variant="outline"
            size="small"
            onPress={() => exportarRelatorio('csv')}
            loading={exportandoRelatorio}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            Exportar CSV
          </Button>
          <Botao
            variant="primary"
            size="small"
            onPress={() => exportarRelatorio('pdf')}
            loading={exportandoRelatorio}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            Exportar PDF
          </Button>
        </View>

        <Espacador size="sm" />
        <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
          PerÃ­odo aplicado: {formatarPeriodoAplicado()}
        </ThemedText>
        <Espacador size="xs" />
        <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
          Ãšltima atualizaÃ§Ã£o: {formatarDataHoraRelatorio(retornoPeriodoBackend.geradoEm)}
        </ThemedText>
      </Card>

      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Resumo Geral</ThemedText>
        <Espacador size="md" />
        <View style={styles.gridKpis}>
          {renderKpi('Total de usuÃ¡rios', formatarNumero(estatisticas?.totalUsuarios))}
          {renderKpi('UsuÃ¡rios ativos', formatarNumero(relatorioUsuarios?.totalAtivos))}
          {renderKpi('UsuÃ¡rios inativos', formatarNumero(relatorioUsuarios?.totalInativos))}
          {renderKpi('Total de locais', formatarNumero(estatisticas?.totalLocais))}
          {renderKpi('Total de avaliaÃ§Ãµes', formatarNumero(estatisticas?.totalAvaliacoes))}
          {renderKpi('AvaliaÃ§Ãµes pendentes', formatarNumero(estatisticas?.avaliacoesPendentes))}
        </View>
      </Card>

      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>RelatÃ³rio de UsuÃ¡rios</ThemedText>
        <Espacador size="md" />
        <View style={styles.listaMetricasContainer}>
          {renderLinhaMetrica('UsuÃ¡rios ativos', formatarNumero(relatorioUsuarios?.totalAtivos))}
          {renderLinhaMetrica('UsuÃ¡rios inativos', formatarNumero(relatorioUsuarios?.totalInativos))}
          {renderLinhaMetrica('Administradores', formatarNumero(relatorioUsuarios?.totalAdmins))}
          {renderLinhaMetrica('UsuÃ¡rios comuns', formatarNumero(relatorioUsuarios?.totalUsuariosComuns))}
          {renderLinhaMetrica('Cadastros nos Ãºltimos 30 dias', formatarNumero(relatorioUsuarios?.cadastrosUltimos30Dias))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>DistribuiÃ§Ã£o por perfil</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioUsuarios?.distribuicaoPorPerfil || {}).map(([perfil, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(perfil, 'perfil'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Cadastros (Ãºltimos 6 meses)</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioUsuarios?.cadastrosUltimosSeisMeses || {}).map(([mes, total]) => (
            renderLinhaMetrica(mes, formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Ãšltimos usuÃ¡rios cadastrados</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {(relatorioUsuarios?.ultimosUsuarios || []).map((item) => (
            <View key={String(item?.idUsuario)} style={styles.itemListaTexto}>
              <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
                {item?.nome || 'Sem nome'}
              </ThemedText>
              <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>
                {item?.email || 'Sem e-mail'}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>RelatÃ³rio de Locais</ThemedText>
        <Espacador size="md" />
        <View style={styles.listaMetricasContainer}>
          {renderLinhaMetrica('Total de locais', formatarNumero(relatorioLocais?.totalLocais))}
          {renderLinhaMetrica('Locais com avaliaÃ§Ã£o', formatarNumero(relatorioLocais?.locaisComAvaliacao))}
          {renderLinhaMetrica('Locais sem avaliaÃ§Ã£o', formatarNumero(relatorioLocais?.locaisSemAvaliacao))}
          {renderLinhaMetrica('MÃ©dia geral', Number(relatorioLocais?.mediaAvaliacaoGeral || 0).toFixed(2))}
          {renderLinhaMetrica('Total de avaliaÃ§Ãµes registradas', formatarNumero(relatorioLocais?.totalAvaliacoes))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Status dos locais</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorStatus || {}).map(([status, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(status, 'status'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>DistribuiÃ§Ã£o por categoria</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorCategoria || {}).map(([categoria, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(categoria, 'categoria'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>DistribuiÃ§Ã£o por estado</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorEstado || {}).map(([estado, total]) => (
            renderLinhaMetrica(estado, formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Recursos de acessibilidade mais usados</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorTipoAcessibilidade || {}).map(([tipo, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(tipo, 'acessibilidade'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Locais mais bem avaliados</ThemedText>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {(relatorioLocais?.locaisMaisBemAvaliados || []).map((item) => (
            <View key={String(item?.idLocal)} style={styles.itemListaTexto}>
              <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
                {item?.nome || 'Sem nome'} ({item?.cidade || '-'} / {item?.estado || '-'})
              </ThemedText>
              <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>
                Nota {Number(item?.avaliacaoMedia || 0).toFixed(2)}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  return (
    <Recipiente background={isHighContrast ? 'background' : 'backgroundSecondary'} scroll contentStyle={styles.scrollContent} altoContraste={isHighContrast}>
      <View style={[styles.pageShell, { paddingHorizontal: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
        <View style={styles.cabecalhoPagina}>
          <TextoTematizado variant="h1" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
            Painel Administrativo
          </ThemedText>
        </View>

        <Espacador size="lg" />

        <View style={styles.abasContainer}>
          {abas.map((aba) => (
            <Botao
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

        <Espacador size="md" />

        {carregando && abaAtiva !== 'denuncias' ? (
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>Carregando dados...</ThemedText>
          </Card>
        ) : null}

        {erro && abaAtiva !== 'denuncias' ? (
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <TextoTematizado color="error" size="sm" altoContraste={isHighContrast}>{erro}</ThemedText>
            <Espacador size="sm" />
            <Botao
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
            <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
              {usuarioParaDeletar?.ativo === false ? 'Reativar usuÃ¡rio' : 'Apagar usuÃ¡rio'}
            </ThemedText>

            <Espacador size="lg" />

            <View style={styles.modalMessage}>
              <TextoTematizado color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja {usuarioParaDeletar?.ativo === false ? 'reativar' : 'apagar'}{' '}
                <TextoTematizado weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
                  {usuarioParaDeletar?.nome || ''}
                </ThemedText>
                ? {usuarioParaDeletar?.ativo === false ? 'O usuÃ¡rio poderÃ¡ voltar a acessar a plataforma.' : 'Esta aÃ§Ã£o nÃ£o pode ser desfeita.'}
              </ThemedText>
            </View>

            <Espacador size="xl" />

            <View style={styles.modalBotoes}>
              <Botao
                variant={usuarioParaDeletar?.ativo === false ? 'primary' : 'danger'}
                size="medium"
                fullWidth
                onPress={async () => {
                  if (usuarioParaDeletar?.ativo === false) {
                    await reativarUsuario(usuarioParaDeletar);
                  } else {
                    await apagarUsuario(usuarioParaDeletar);
                  }
                  setModalDeleteVisivel(false);
                }}
                loading={carregandoAcao}
                disabled={carregandoAcao}
              >
                {usuarioParaDeletar?.ativo === false ? 'Reativar' : 'Deletar'}
              </Button>

              <Espacador size="xs" />

              <Botao
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
            <TextoTematizado variant="h2" weight="bold" align="center" altoContraste={isHighContrast} color={corPrincipal}>
              Apagar local
            </ThemedText>

            <Espacador size="lg" />

            <View style={styles.modalMessage}>
              <TextoTematizado color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja apagar{' '}
                <TextoTematizado weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
                  {localParaDeletar?.nome || ''}
                </ThemedText>
                ? Esta aÃ§Ã£o nÃ£o pode ser desfeita.
              </ThemedText>
            </View>

            <Espacador size="xl" />

            <View style={styles.modalBotoes}>
              <Botao
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

              <Espacador size="xs" />

              <Botao
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
    flexWrap: 'nowrap',
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
