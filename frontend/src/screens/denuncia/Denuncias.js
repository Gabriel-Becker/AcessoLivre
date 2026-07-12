import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { BarraFiltroAdmin, TabelaPlanilhaAdmin } from '../../components/admin';
import { Espacador, TextoTematizado } from '../../components/commons';
import { Botao } from '../../components/ui';
import { useThemeContext } from '../../context/ThemeContext';
import ServicoDenuncia from '../../services/ServicoDenuncia';
import toastHelper from '../../utils/toastHelper';
import { 
  colunasDenuncias, 
  filtrosDenuncias,
  ModalStatusDenuncia,
  ModalExcluirDenuncia 
} from '../../components/denuncia';

export default function Denuncias() {
  const { isHighContrast, theme: t } = useThemeContext();
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [buscaDenuncias, setBuscaDenuncias] = useState('');
  const [filtroStatusDenuncias, setFiltroStatusDenuncias] = useState('todos');
  const [filtroTipoDenuncias, setFiltroTipoDenuncias] = useState('todos');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [estatisticas, setEstatisticas] = useState({ total: 0, pendentes: 0 });
  const [modalStatusVisivel, setModalStatusVisivel] = useState(false);
  const [denunciaSelecionada, setDenunciaSelecionada] = useState(null);
  const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);
  const [denunciaParaExcluir, setDenunciaParaExcluir] = useState(null);

  const carregarEstatisticas = useCallback(async () => {
    try {
      const result = await ServicoDenuncia.getEstatisticas();
      if (result.success && result.data && mountedRef.current) {
        setEstatisticas({
          total: result.data.TOTAL || 0,
          pendentes: result.data.PENDING || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  const carregarDenuncias = useCallback(async () => {
    if (!mountedRef.current) return;
    setCarregando(true);
    try {
      const filters = {};
      if (filtroStatusDenuncias !== 'todos') filters.status = filtroStatusDenuncias;
      if (filtroTipoDenuncias !== 'todos') filters.tipo = filtroTipoDenuncias;
      if (buscaDenuncias) filters.search = buscaDenuncias;
      filters.page = paginaAtual;
      filters.size = 10;
      filters.sort = 'dataCriacao,desc';

      const result = await ServicoDenuncia.getAll(filters);
      
      if (result.success && mountedRef.current) {
        setDenuncias(result.data || []);
        const paginas = Math.max(1, Number(result.pagination?.totalPages || 1));
        setTotalPaginas(paginas);
        const paginaRetornada = Number(result.pagination?.page ?? paginaAtual);
        if (paginaRetornada !== paginaAtual) {
          setPaginaAtual(Math.max(0, paginaRetornada));
        }
      } else if (!result.success && mountedRef.current) {
        toastHelper.showError(result.message || 'Erro ao carregar denúncias');
      }
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao carregar denúncias');
      }
    } finally {
      if (mountedRef.current) setCarregando(false);
    }
  }, [filtroStatusDenuncias, filtroTipoDenuncias, buscaDenuncias, paginaAtual]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarDenuncias();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [carregarDenuncias]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarEstatisticas();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [carregarEstatisticas]);

  const atualizarEstatisticasLocalmente = (statusAntigo, statusNovo) => {
    const eraPendente = statusAntigo === 'PENDING';
    const ehPendente = statusNovo === 'PENDING';
    
    if (eraPendente && !ehPendente) {
      setEstatisticas(prev => ({
        total: prev.total,
        pendentes: Math.max(0, prev.pendentes - 1)
      }));
    } else if (!eraPendente && ehPendente) {
      setEstatisticas(prev => ({
        total: prev.total,
        pendentes: prev.pendentes + 1
      }));
    }
  };

  const handleAtualizarStatus = (denuncia) => {
    setDenunciaSelecionada(denuncia);
    setModalStatusVisivel(true);
  };

  const handleConfirmarStatus = async (novoStatus) => {
    if (!denunciaSelecionada) return;
    
    let ocultarToastProcessamento;

    setCarregandoAcao(true);
    const statusAntigo = denunciaSelecionada.status;
    
    try {
      ocultarToastProcessamento = toastHelper.showLoading('Atualizando o status da denúncia...', 'Processando denúncia');
      const result = await ServicoDenuncia.updateStatus(denunciaSelecionada.id, novoStatus);
      if (result.success && mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess('Status da denúncia atualizado com sucesso');
        
        setDenuncias(prev => prev.map(item =>
          item.id === denunciaSelecionada.id
            ? { ...item, status: novoStatus }
            : item
        ));
        
        atualizarEstatisticasLocalmente(statusAntigo, novoStatus);
        setModalStatusVisivel(false);
        await carregarEstatisticas();
      } else if (mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showError(result.message || 'Erro ao atualizar status');
      }
    } catch (error) {
      ocultarToastProcessamento?.();
      console.error('Erro ao atualizar status:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao atualizar status');
      }
    } finally {
      ocultarToastProcessamento?.();
      if (mountedRef.current) setCarregandoAcao(false);
      setDenunciaSelecionada(null);
    }
  };

  const handleResolverDenuncia = async (denuncia) => {
    if (!denuncia) return;
    
    let ocultarToastProcessamento;

    setCarregandoAcao(true);
    const statusAntigo = denuncia.status;
    
    try {
      ocultarToastProcessamento = toastHelper.showLoading('Removendo o conteúdo denunciado e concluindo a análise...', 'Resolvendo denúncia');
      const result = await ServicoDenuncia.resolver(denuncia.id);
      
      if (result.success && mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess('Conteúdo removido e denúncia resolvida com sucesso');
        
        setDenuncias(prev => prev.map(item =>
          item.id === denuncia.id
            ? { ...item, status: 'RESOLVED' }
            : item
        ));
        
        atualizarEstatisticasLocalmente(statusAntigo, 'RESOLVED');
        setModalStatusVisivel(false);
        setDenunciaSelecionada(null);
        
        if (filtroStatusDenuncias === 'PENDING') {
          await carregarDenuncias();
        }
        await carregarEstatisticas();
        
      } else if (result.alreadyResolved && mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showError('Esta denúncia já foi processada anteriormente', 'Ação não permitida');
        await carregarDenuncias();
        await carregarEstatisticas();
        setModalStatusVisivel(false);
      } else if (mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showError(result.message || 'Erro ao resolver denúncia');
      }
    } catch (error) {
      ocultarToastProcessamento?.();
      console.error('Erro ao resolver denúncia:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao resolver denúncia. Tente novamente.');
      }
    } finally {
      ocultarToastProcessamento?.();
      if (mountedRef.current) {
        setCarregandoAcao(false);
        setDenunciaSelecionada(null);
      }
    }
  };

  const handleExcluirDenuncia = (denuncia) => {
    if (!denuncia) return;
    setDenunciaParaExcluir(denuncia);
    setModalExcluirVisivel(true);
  };

  const handleConfirmarExcluir = async () => {
    if (!denunciaParaExcluir) return;
    
    let ocultarToastProcessamento;

    setCarregandoAcao(true);
    try {
      ocultarToastProcessamento = toastHelper.showLoading('Excluindo a denúncia selecionada...', 'Excluindo denúncia');
      const result = await ServicoDenuncia.delete(denunciaParaExcluir.id);
      if (result.success && mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showSuccess('Denúncia excluída com sucesso');
        setDenuncias(prev => prev.filter(item => item.id !== denunciaParaExcluir.id));
        await carregarEstatisticas();
        setModalExcluirVisivel(false);
      } else if (mountedRef.current) {
        ocultarToastProcessamento?.();
        toastHelper.showError(result.message || 'Erro ao excluir denúncia');
      }
    } catch (error) {
      ocultarToastProcessamento?.();
      console.error('Erro ao excluir denúncia:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao excluir denúncia');
      }
    } finally {
      ocultarToastProcessamento?.();
      if (mountedRef.current) setCarregandoAcao(false);
      setDenunciaParaExcluir(null);
    }
  };

  const tableHandlers = {
    onAtualizarStatus: handleAtualizarStatus,
    onExcluir: handleExcluirDenuncia,
    carregandoAcao,
  };

  const colunas = colunasDenuncias(tableHandlers, isHighContrast, t);
  const filtros = filtrosDenuncias(
    filtroStatusDenuncias,
    (valor) => {
      setFiltroStatusDenuncias(valor);
      setPaginaAtual(0);
    },
    filtroTipoDenuncias,
    (valor) => {
      setFiltroTipoDenuncias(valor);
      setPaginaAtual(0);
    }
  );

  return (
    <>
      <View style={styles.BannerEstatisticas}>
        <View style={[styles.statCard, { backgroundColor: t.colors.warning + '20' }]}>
          <TextoTematizado variant="h2" weight="bold" style={{ color: t.colors.warning }}>
            {estatisticas.pendentes}
          </TextoTematizado>
          <TextoTematizado variant="caption" color="textSecondary">Pendentes</TextoTematizado>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.colors.primary + '10' }]}>
          <TextoTematizado variant="h2" weight="bold" style={{ color: t.colors.primary }}>
            {estatisticas.total}
          </TextoTematizado>
          <TextoTematizado variant="caption" color="textSecondary">Total</TextoTematizado>
        </View>
      </View>

      <Espacador size="md" />

      <BarraFiltroAdmin
        titulo="Denúncias"
        pesquisa={buscaDenuncias}
        onChangePesquisa={(valor) => {
          setBuscaDenuncias(valor);
          setPaginaAtual(0);
        }}
        pesquisaPlaceholder="Pesquisar por motivo ou alvo"
        filtros={filtros}
        altoContraste={isHighContrast}
      />

      <Espacador size="sm" />

      <TabelaPlanilhaAdmin
        colunas={colunas}
        dados={denuncias}
        chaveExtractor={(item) => String(item.id)}
        renderVazio={
          <View style={styles.emptyContainer}>
            <TextoTematizado size="sm" color="textSecondary" align="center">
              {filtroStatusDenuncias === 'PENDING' 
                ? 'Nenhuma denúncia pendente' 
                : 'Nenhuma denúncia encontrada'}
            </TextoTematizado>
          </View>
        }
        carregando={carregando}
        larguraMinima={1300}
        altoContraste={isHighContrast}
      />

      <Espacador size="sm" />

      <View style={styles.paginacao}>
        <Botao
          variant="outline"
          size="small"
          onPress={() => setPaginaAtual((p) => Math.max(0, p - 1))}
          disabled={carregando || paginaAtual <= 0}
          altoContraste={isHighContrast}
        >
          Anterior
        </Botao>
        <TextoTematizado color="textSecondary" altoContraste={isHighContrast}>
          Página {paginaAtual + 1} de {Math.max(1, totalPaginas)}
        </TextoTematizado>
        <Botao
          variant="outline"
          size="small"
          onPress={() => setPaginaAtual((p) => Math.min(Math.max(1, totalPaginas) - 1, p + 1))}
          disabled={carregando || paginaAtual + 1 >= Math.max(1, totalPaginas)}
          altoContraste={isHighContrast}
        >
          Próxima
        </Botao>
      </View>

      <ModalStatusDenuncia
        visible={modalStatusVisivel}
        onClose={() => {
          setModalStatusVisivel(false);
          setDenunciaSelecionada(null);
        }}
        denuncia={denunciaSelecionada}
        onConfirm={handleConfirmarStatus}
        onResolve={handleResolverDenuncia}
        carregando={carregandoAcao}
        isHighContrast={isHighContrast}
        theme={t}
      />

      <ModalExcluirDenuncia
        visible={modalExcluirVisivel}
        onClose={() => {
          setModalExcluirVisivel(false);
          setDenunciaParaExcluir(null);
        }}
        denuncia={denunciaParaExcluir}
        onConfirm={handleConfirmarExcluir}
        carregando={carregandoAcao}
        isHighContrast={isHighContrast}
        theme={t}
      />
    </>
  );
}

const styles = StyleSheet.create({
  BannerEstatisticas: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
});