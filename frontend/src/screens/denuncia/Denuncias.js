// src/screens/denuncia/Denuncias.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BarraFiltroAdmin, TabelaPlanilhaAdmin } from '../../components/admin';
import { Spacer, ThemedText } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import DenunciaService from '../../services/DenunciaService';
import toastHelper from '../../utils/toastHelper';
import { 
  colunasDenuncias, 
  filtrosDenuncias,
  ModalStatusDenuncia,
  ModalExcluirDenuncia 
} from '../../components/denuncia';

export default function Denuncias() {
  const { isHighContrast, theme: t } = useThemeContext();

  // Estados
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [buscaDenuncias, setBuscaDenuncias] = useState('');
  const [filtroStatusDenuncias, setFiltroStatusDenuncias] = useState('todos');
  const [filtroTipoDenuncias, setFiltroTipoDenuncias] = useState('todos');
  const [estatisticas, setEstatisticas] = useState({ total: 0, pendentes: 0 });

  // Estados para modais
  const [modalStatusVisivel, setModalStatusVisivel] = useState(false);
  const [denunciaSelecionada, setDenunciaSelecionada] = useState(null);
  const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);
  const [denunciaParaExcluir, setDenunciaParaExcluir] = useState(null);

  const normalizarTexto = (texto) =>
    String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

  // Carregar estatísticas
  const carregarEstatisticas = useCallback(async () => {
    try {
      const result = await DenunciaService.getEstatisticas();
      if (result.success && result.data) {
        setEstatisticas({
          total: result.data.TOTAL || 0,
          pendentes: result.data.PENDING || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  // Carregar denúncias
  const carregarDenuncias = useCallback(async () => {
    setCarregando(true);
    try {
      const filters = {};
      if (filtroStatusDenuncias !== 'todos') filters.status = filtroStatusDenuncias;
      if (filtroTipoDenuncias !== 'todos') filters.tipo = filtroTipoDenuncias;
      if (buscaDenuncias) filters.search = buscaDenuncias;

      const result = await DenunciaService.getAll(filters);
      
      if (result.success) {
        setDenuncias(result.data || []);
      } else {
        toastHelper.showError(result.message || 'Erro ao carregar denúncias');
      }
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
      toastHelper.showError('Erro ao carregar denúncias');
    } finally {
      setCarregando(false);
    }
  }, [filtroStatusDenuncias, filtroTipoDenuncias, buscaDenuncias]);

  // Carregar dados iniciais - apenas uma vez
  useEffect(() => {
    carregarDenuncias();
    carregarEstatisticas();
  }, [carregarDenuncias, carregarEstatisticas]);

  // Filtro local dos dados (já que o backend já filtra, isso é redundante mas mantido para segurança)
  const denunciasFiltradas = useMemo(() => {
    const termo = normalizarTexto(buscaDenuncias);
    if (!termo) return denuncias;
    return denuncias.filter((item) => {
      const motivo = normalizarTexto(item?.motivoLabel || item?.motivo || '');
      const targetName = normalizarTexto(item?.targetName || '');
      return motivo.includes(termo) || targetName.includes(termo);
    });
  }, [denuncias, buscaDenuncias]);

  // Handlers
  const handleAtualizarStatus = (denuncia) => {
    setDenunciaSelecionada(denuncia);
    setModalStatusVisivel(true);
  };

  const handleConfirmarStatus = async (novoStatus, isResolveAction = false) => {
    setCarregandoAcao(true);
    try {
      const result = await DenunciaService.updateStatus(denunciaSelecionada.id, novoStatus);
      if (result.success) {
        toastHelper.showSuccess('Status da denúncia atualizado com sucesso');
        await carregarDenuncias();
        await carregarEstatisticas();
        setModalStatusVisivel(false);
      } else {
        toastHelper.showError(result.message || 'Erro ao atualizar status');
      }
    } catch (error) {
      toastHelper.showError('Erro ao atualizar status');
    } finally {
      setCarregandoAcao(false);
      setDenunciaSelecionada(null);
    }
  };

  const handleResolverDenuncia = async (denuncia) => {
    setCarregandoAcao(true);
    try {
      const result = await DenunciaService.resolver(denuncia.id);
      if (result.success) {
        toastHelper.showSuccess(result.message || 'Denúncia resolvida com sucesso');
        await carregarDenuncias();
        await carregarEstatisticas();
        setModalStatusVisivel(false);
      } else {
        toastHelper.showError(result.message || 'Erro ao resolver denúncia');
      }
    } catch (error) {
      toastHelper.showError('Erro ao resolver denúncia');
    } finally {
      setCarregandoAcao(false);
      setDenunciaSelecionada(null);
    }
  };

  const handleExcluirDenuncia = (denuncia) => {
    setDenunciaParaExcluir(denuncia);
    setModalExcluirVisivel(true);
  };

  const handleConfirmarExcluir = async () => {
    setCarregandoAcao(true);
    try {
      // Nota: Este método apenas exclui a denúncia, não o conteúdo
      const result = await DenunciaService.delete(denunciaParaExcluir.id);
      if (result.success) {
        toastHelper.showSuccess('Denúncia excluída com sucesso');
        await carregarDenuncias();
        await carregarEstatisticas();
        setModalExcluirVisivel(false);
      } else {
        toastHelper.showError(result.message || 'Erro ao excluir denúncia');
      }
    } catch (error) {
      toastHelper.showError('Erro ao excluir denúncia');
    } finally {
      setCarregandoAcao(false);
      setDenunciaParaExcluir(null);
    }
  };

  // Handlers para a tabela
  const tableHandlers = {
    onAtualizarStatus: handleAtualizarStatus,
    onExcluir: handleExcluirDenuncia,
    carregandoAcao,
  };

  const colunas = colunasDenuncias(tableHandlers, isHighContrast, t);
  const filtros = filtrosDenuncias(
    filtroStatusDenuncias, setFiltroStatusDenuncias,
    filtroTipoDenuncias, setFiltroTipoDenuncias
  );

  return (
    <>
      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={[styles.statCard, { backgroundColor: t.colors.primary + '10' }]}>
          <ThemedText variant="h2" weight="bold" style={{ color: t.colors.primary }}>
            {estatisticas.total}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary">Total de denúncias</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.colors.warning + '10' }]}>
          <ThemedText variant="h2" weight="bold" style={{ color: t.colors.warning }}>
            {estatisticas.pendentes}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary">Pendentes</ThemedText>
        </View>
      </View>

      <Spacer size="md" />

      {/* Barra de Filtros */}
      <BarraFiltroAdmin
        titulo="Planilha de denúncias"
        pesquisa={buscaDenuncias}
        onChangePesquisa={setBuscaDenuncias}
        pesquisaPlaceholder="Pesquisar por motivo ou alvo"
        filtros={filtros}
        altoContraste={isHighContrast}
      />

      <Spacer size="sm" />

      {/* Tabela */}
      <TabelaPlanilhaAdmin
        colunas={colunas}
        dados={denunciasFiltradas}
        chaveExtractor={(item) => String(item.id)}
        renderVazio={<ThemedText size="sm" color="textSecondary">Nenhuma denúncia encontrada.</ThemedText>}
        carregando={carregando}
        larguraMinima={1300}
        altoContraste={isHighContrast}
      />

      {/* Modais */}
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
});