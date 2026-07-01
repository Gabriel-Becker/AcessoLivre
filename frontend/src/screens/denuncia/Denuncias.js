import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { BarraFiltroAdmin, TabelaPlanilhaAdmin } from '../../components/admin';
import { Spacer, ThemedText } from '../../components/commons';
import { Button } from '../../components/ui';
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
      const result = await DenunciaService.getEstatisticas();
      if (result.success && result.data && mountedRef.current) {
        setEstatisticas({
          total: result.data.TOTAL || 0,
          pendentes: result.data.PENDING || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatÃ­sticas:', error);
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

      const result = await DenunciaService.getAll(filters);
      
      if (result.success && mountedRef.current) {
        setDenuncias(result.data || []);
        const paginas = Math.max(1, Number(result.pagination?.totalPages || 1));
        setTotalPaginas(paginas);
        const paginaRetornada = Number(result.pagination?.page ?? paginaAtual);
        if (paginaRetornada !== paginaAtual) {
          setPaginaAtual(Math.max(0, paginaRetornada));
        }
      } else if (!result.success && mountedRef.current) {
        toastHelper.showError(result.message || 'Erro ao carregar denÃºncias');
      }
    } catch (error) {
      console.error('Erro ao carregar denÃºncias:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao carregar denÃºncias');
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
    
    setCarregandoAcao(true);
    const statusAntigo = denunciaSelecionada.status;
    
    try {
      const result = await DenunciaService.updateStatus(denunciaSelecionada.id, novoStatus);
      if (result.success && mountedRef.current) {
        toastHelper.showSuccess('Status da denÃºncia atualizado com sucesso');
        
        setDenuncias(prev => prev.map(item =>
          item.id === denunciaSelecionada.id
            ? { ...item, status: novoStatus }
            : item
        ));
        
        atualizarEstatisticasLocalmente(statusAntigo, novoStatus);
        setModalStatusVisivel(false);
        await carregarEstatisticas();
      } else if (mountedRef.current) {
        toastHelper.showError(result.message || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao atualizar status');
      }
    } finally {
      if (mountedRef.current) setCarregandoAcao(false);
      setDenunciaSelecionada(null);
    }
  };

  const handleResolverDenuncia = async (denuncia) => {
    if (!denuncia) return;
    
    setCarregandoAcao(true);
    const statusAntigo = denuncia.status;
    
    try {
      const result = await DenunciaService.resolver(denuncia.id);
      
      if (result.success && mountedRef.current) {
        toastHelper.showSuccess('ConteÃºdo removido e denÃºncia resolvida com sucesso');
        
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
        toastHelper.showInfo('Esta denÃºncia jÃ¡ foi processada anteriormente');
        await carregarDenuncias();
        await carregarEstatisticas();
        setModalStatusVisivel(false);
      } else if (mountedRef.current) {
        toastHelper.showError(result.message || 'Erro ao resolver denÃºncia');
      }
    } catch (error) {
      console.error('Erro ao resolver denÃºncia:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao resolver denÃºncia. Tente novamente.');
      }
    } finally {
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
    
    setCarregandoAcao(true);
    try {
      const result = await DenunciaService.delete(denunciaParaExcluir.id);
      if (result.success && mountedRef.current) {
        toastHelper.showSuccess('DenÃºncia excluÃ­da com sucesso');
        setDenuncias(prev => prev.filter(item => item.id !== denunciaParaExcluir.id));
        await carregarEstatisticas();
        setModalExcluirVisivel(false);
      } else if (mountedRef.current) {
        toastHelper.showError(result.message || 'Erro ao excluir denÃºncia');
      }
    } catch (error) {
      console.error('Erro ao excluir denÃºncia:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao excluir denÃºncia');
      }
    } finally {
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
      <View style={styles.statsBanner}>
        <View style={[styles.statCard, { backgroundColor: t.colors.warning + '20' }]}>
          <TextoTematizado variant="h2" weight="bold" style={{ color: t.colors.warning }}>
            {estatisticas.pendentes}
          </ThemedText>
          <TextoTematizado variant="caption" color="textSecondary">Pendentes</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.colors.primary + '10' }]}>
          <TextoTematizado variant="h2" weight="bold" style={{ color: t.colors.primary }}>
            {estatisticas.total}
          </ThemedText>
          <TextoTematizado variant="caption" color="textSecondary">Total</ThemedText>
        </View>
      </View>

      <Espacador size="md" />

      <BarraFiltroAdmin
        titulo="DenÃºncias"
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
                ? 'Nenhuma denÃºncia pendente' 
                : 'Nenhuma denÃºncia encontrada'}
            </ThemedText>
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
        </Button>
        <TextoTematizado color="textSecondary" altoContraste={isHighContrast}>
          PÃ¡gina {paginaAtual + 1} de {Math.max(1, totalPaginas)}
        </ThemedText>
        <Botao
          variant="outline"
          size="small"
          onPress={() => setPaginaAtual((p) => Math.min(Math.max(1, totalPaginas) - 1, p + 1))}
          disabled={carregando || paginaAtual + 1 >= Math.max(1, totalPaginas)}
          altoContraste={isHighContrast}
        >
          PrÃ³xima
        </Button>
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
  statsBanner: {
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