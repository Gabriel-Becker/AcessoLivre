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
  const [mostrarIndicadorOrdenacaoUsuarios, setMostrarIndicadorOrdenacaoUsuarios] = useState(false);

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
    SINALIZACAO_BRAILLE: 'Sinalização em Braille',
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

    const texto = String(valor).trim();
    const matchIsoSemTimezone = texto.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?$/
    );

    let data;
    if (matchIsoSemTimezone) {
      const [, ano, mes, dia, hora, minuto, segundo = '00'] = matchIsoSemTimezone;
      data = new Date(Date.UTC(
        Number(ano),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
      ));
    } else {
      data = new Date(texto);
    }

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
    if (!inicio && !fim) return 'Período completo (sem filtro)';
    if (inicio && fim) return `${inicio} até ${fim}`;
    if (inicio) return `A partir de ${inicio}`;
    return `Até ${fim}`;
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
      const dados = await ServicoAdmin.listarUsuarios({
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
      const dados = await ServicoAdmin.listarLocais({ page: paginaLocais, size: 8, sort: 'nome' });
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
        ServicoAdmin.obterEstatisticasGerais(),
        ServicoAdmin.obterRelatorioUsuarios({
          dataInicio: dataInicioApi || undefined,
          dataFim: dataFimApi || undefined,
        }),
        ServicoAdmin.obterRelatorioLocais({
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
  }, [abaAtiva, paginaUsuarios, paginaLocais, sortField, sortDirection, filtroDataInicioAplicado, filtroDataFimAplicado, filtroStatusUsuarios]);

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
        resposta = await ServicoAdmin.exportarRelatorioUsuariosCsv(params);
      } else if (tipoRelatorioExportacao === 'usuarios' && formato === 'pdf') {
        resposta = await ServicoAdmin.exportarRelatorioUsuariosPdf(params);
      } else if (tipoRelatorioExportacao === 'locais' && formato === 'csv') {
        resposta = await ServicoAdmin.exportarRelatorioLocaisCsv(params);
      } else {
        resposta = await ServicoAdmin.exportarRelatorioLocaisPdf(params);
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
    setMostrarIndicadorOrdenacaoUsuarios(true);

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
      await ServicoAdmin.deletarUsuario(usuarioItem.idUsuario);
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

  const reativarUsuario = async (usuarioItem) => {
    setCarregandoAcao(true);
    setErro('');
    try {
      await ServicoAdmin.reativarUsuario(usuarioItem.idUsuario);
      toastHelper.showSuccess('Usuário reativado com sucesso.', 'Reativação concluída');

      if (usuarios.length === 1 && paginaUsuarios > 0) {
        setPaginaUsuarios((p) => Math.max(0, p - 1));
      } else {
        await carregarUsuarios();
      }
    } catch (e) {
      const mensagemErro = e?.response?.data?.mensagem || e?.response?.data?.message || 'Não foi possível reativar o usuário.';
      setErro(mensagemErro);
      toastHelper.showError(mensagemErro, 'Falha ao reativar usuário');
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
      await ServicoLocal.removerLocal(localItem.idLocal);
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
      <Botao
        variant="outline"
        size="small"
        onPress={onAnterior}
        disabled={carregando || paginaAtual <= 0}
        altoContraste={isHighContrast}
        textStyle={{ color: isHighContrast ? t.colors.textOnPrimary : undefined }}
      >
        Anterior
      </Botao>
      <TextoTematizado color={corSecundaria} altoContraste={isHighContrast}>
        Página {paginaAtual + 1} de {totalPaginas}
      </TextoTematizado>
      <Botao
        variant="outline"
        size="small"
        onPress={onProxima}
        disabled={carregando || paginaAtual + 1 >= totalPaginas}
        altoContraste={isHighContrast}
        textStyle={{ color: isHighContrast ? t.colors.textOnPrimary : undefined }}
      >
        Próxima
      </Botao>
    </View>
  );

  const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);

  const cardRelatorioVariant = isHighContrast ? 'outlined' : 'default';
  const corFundoDestaque = isHighContrast ? t.colors.backgroundTertiary : t.colors.surfaceSecondary;

  const renderLinhaMetrica = (label, valor) => (
    <View key={label} style={styles.itemMetricaLinha}>
      <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>{label}</TextoTematizado>
      <View style={[styles.badgeValorMetrica, { backgroundColor: corFundoDestaque, borderColor: t.colors.border }]}>
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>{valor}</TextoTematizado>
      </View>
    </View>
  );

  const renderKpi = (titulo, valor) => (
    <View key={titulo} style={[styles.kpiCard, { backgroundColor: corFundoDestaque, borderColor: t.colors.border }]}> 
      <TextoTematizado size="xs" altoContraste={isHighContrast} color={corSecundaria}>{titulo}</TextoTematizado>
      <Espacador size="xs" />
      <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>{valor}</TextoTematizado>
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
          titulo="Planilha de usuários"
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
              Nenhum usuário encontrado com os filtros atuais.
            </TextoTematizado>
          }
          carregando={carregando}
          larguraMinima={1120}
          sortField={sortField}
          sortDirection={sortDirection}
          onChangeSort={handleSortChange}
          mostrarIndicadorOrdenacao={mostrarIndicadorOrdenacaoUsuarios}
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
            </TextoTematizado>
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
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Filtros do relatório</TextoTematizado>
        <Espacador size="sm" />
        <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>Use o formato MM/AAAA. Se deixar vazio, o relatório busca todos os dados.</TextoTematizado>
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
          <Botao variant="primary" size="small" onPress={aplicarFiltrosRelatorio} disabled={!isPeriodoRelatorioValido} altoContraste={isHighContrast}>Aplicar filtros</Botao>
          <Botao variant="outline" size="small" onPress={limparFiltrosRelatorio} altoContraste={isHighContrast}>Limpar</Botao>
        </View>

        <Espacador size="sm" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Exportar relatório (um por vez)</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.filtrosDataAcoes}>
          <Botao
            variant={tipoRelatorioExportacao === 'usuarios' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setTipoRelatorioExportacao('usuarios')}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            Usuários
          </Botao>
          <Botao
            variant={tipoRelatorioExportacao === 'locais' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setTipoRelatorioExportacao('locais')}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            Locais
          </Botao>
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
          </Botao>
          <Botao
            variant="primary"
            size="small"
            onPress={() => exportarRelatorio('pdf')}
            loading={exportandoRelatorio}
            disabled={exportandoRelatorio || !isPeriodoRelatorioValido}
            altoContraste={isHighContrast}
          >
            Exportar PDF
          </Botao>
        </View>

        <Espacador size="sm" />
        <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
          Período aplicado: {formatarPeriodoAplicado()}
        </TextoTematizado>
        <Espacador size="xs" />
        <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
          Última atualização: {formatarDataHoraRelatorio(retornoPeriodoBackend.geradoEm)}
        </TextoTematizado>
      </Card>

      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Resumo Geral</TextoTematizado>
        <Espacador size="md" />
        <View style={styles.gridKpis}>
          {renderKpi('Total de usuários', formatarNumero(estatisticas?.totalUsuarios))}
          {renderKpi('Usuários ativos', formatarNumero(relatorioUsuarios?.totalAtivos))}
          {renderKpi('Usuários inativos', formatarNumero(relatorioUsuarios?.totalInativos))}
          {renderKpi('Total de locais', formatarNumero(estatisticas?.totalLocais))}
          {renderKpi('Total de avaliações', formatarNumero(estatisticas?.totalAvaliacoes))}
          {renderKpi('Avaliações pendentes', formatarNumero(estatisticas?.avaliacoesPendentes))}
        </View>
      </Card>

      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Relatório de Usuários</TextoTematizado>
        <Espacador size="md" />
        <View style={styles.listaMetricasContainer}>
          {renderLinhaMetrica('Usuários ativos', formatarNumero(relatorioUsuarios?.totalAtivos))}
          {renderLinhaMetrica('Usuários inativos', formatarNumero(relatorioUsuarios?.totalInativos))}
          {renderLinhaMetrica('Administradores', formatarNumero(relatorioUsuarios?.totalAdmins))}
          {renderLinhaMetrica('Usuários comuns', formatarNumero(relatorioUsuarios?.totalUsuariosComuns))}
          {renderLinhaMetrica('Cadastros nos últimos 30 dias', formatarNumero(relatorioUsuarios?.cadastrosUltimos30Dias))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Distribuição por perfil</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioUsuarios?.distribuicaoPorPerfil || {}).map(([perfil, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(perfil, 'perfil'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Cadastros (últimos 6 meses)</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioUsuarios?.cadastrosUltimosSeisMeses || {}).map(([mes, total]) => (
            renderLinhaMetrica(mes, formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Últimos usuários cadastrados</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {(relatorioUsuarios?.ultimosUsuarios || []).map((item) => (
            <View key={String(item?.idUsuario)} style={styles.itemListaTexto}>
              <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
                {item?.nome || 'Sem nome'}
              </TextoTematizado>
              <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>
                {item?.email || 'Sem e-mail'}
              </TextoTematizado>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.cardUsuario} variant={cardRelatorioVariant} altoContraste={isHighContrast}>
        <TextoTematizado variant="h3" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Relatório de Locais</TextoTematizado>
        <Espacador size="md" />
        <View style={styles.listaMetricasContainer}>
          {renderLinhaMetrica('Total de locais', formatarNumero(relatorioLocais?.totalLocais))}
          {renderLinhaMetrica('Locais com avaliação', formatarNumero(relatorioLocais?.locaisComAvaliacao))}
          {renderLinhaMetrica('Locais sem avaliação', formatarNumero(relatorioLocais?.locaisSemAvaliacao))}
          {renderLinhaMetrica('Média geral', Number(relatorioLocais?.mediaAvaliacaoGeral || 0).toFixed(2))}
          {renderLinhaMetrica('Total de avaliações registradas', formatarNumero(relatorioLocais?.totalAvaliacoes))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Status dos locais</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorStatus || {}).map(([status, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(status, 'status'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Distribuição por categoria</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorCategoria || {}).map(([categoria, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(categoria, 'categoria'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Distribuição por estado</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorEstado || {}).map(([estado, total]) => (
            renderLinhaMetrica(estado, formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Recursos de acessibilidade mais usados</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {Object.entries(relatorioLocais?.distribuicaoPorTipoAcessibilidade || {}).map(([tipo, total]) => (
            renderLinhaMetrica(formatarLabelRelatorio(tipo, 'acessibilidade'), formatarNumero(total))
          ))}
        </View>

        <Espacador size="md" />
        <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>Locais mais bem avaliados</TextoTematizado>
        <Espacador size="xs" />
        <View style={styles.listaMetricasContainer}>
          {(relatorioLocais?.locaisMaisBemAvaliados || []).map((item) => (
            <View key={String(item?.idLocal)} style={styles.itemListaTexto}>
              <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>
                {item?.nome || 'Sem nome'} ({item?.cidade || '-'} / {item?.estado || '-'})
              </TextoTematizado>
              <TextoTematizado size="sm" weight="bold" altoContraste={isHighContrast} color={corPrincipal}>
                Nota {Number(item?.avaliacaoMedia || 0).toFixed(2)}
              </TextoTematizado>
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
          </TextoTematizado>
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
            </Botao>
          ))}
        </View>

        <Espacador size="md" />

        {carregando && abaAtiva !== 'denuncias' ? (
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <TextoTematizado size="sm" altoContraste={isHighContrast} color={corSecundaria}>Carregando dados...</TextoTematizado>
          </Card>
        ) : null}

        {erro && abaAtiva !== 'denuncias' ? (
          <Card style={[styles.cardUsuario, { padding: ehMobile ? theme.spacing.sm : theme.spacing.md }]}>
            <TextoTematizado color="error" size="sm" altoContraste={isHighContrast}>{erro}</TextoTematizado>
            <Espacador size="sm" />
            <Botao
              variant="outline"
              size="small"
              onPress={tentarNovamente}
              disabled={carregando}
            >
              Tentar novamente
            </Botao>
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
        altoContraste={isHighContrast}
        onSucesso={() => {
          setUsuarioSelecionado(null);
          carregarUsuarios();
        }}
      />

      <EditarLocalModal
        visible={modalEditarLocalVisivel}
        onClose={() => setModalEditarLocalVisivel(false)}
        local={localSelecionado}
        altoContraste={isHighContrast}
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
              {usuarioParaDeletar?.ativo === false ? 'Reativar usuário' : 'Apagar usuário'}
            </TextoTematizado>

            <Espacador size="lg" />

            <View style={styles.modalMessage}>
              <TextoTematizado color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja {usuarioParaDeletar?.ativo === false ? 'reativar' : 'apagar'}{' '}
                <TextoTematizado weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
                  {usuarioParaDeletar?.nome || ''}
                </TextoTematizado>
                ? {usuarioParaDeletar?.ativo === false ? 'O usuário poderá voltar a acessar a plataforma.' : 'Esta ação não pode ser desfeita.'}
              </TextoTematizado>
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
              </Botao>

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
              </Botao>
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
            </TextoTematizado>

            <Espacador size="lg" />

            <View style={styles.modalMessage}>
              <TextoTematizado color={corSecundaria} align="center" size="sm" altoContraste={isHighContrast}>
                Tem certeza que deseja apagar{' '}
                <TextoTematizado weight="bold" color={corSecundaria} altoContraste={isHighContrast}>
                  {localParaDeletar?.nome || ''}
                </TextoTematizado>
                ? Esta ação não pode ser desfeita.
              </TextoTematizado>
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
              </Botao>

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
              </Botao>
            </View>
          </View>
        </View>
      </Modal>
    </Recipiente>
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
