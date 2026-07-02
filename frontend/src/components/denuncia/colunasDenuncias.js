import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Botao } from '../../components/ui';
import { TextoTematizado } from '../../components/commons';
import TextoTooltip from '../../components/ui/TextoTooltip';

// Estilos especificos para a tabela
const styles = StyleSheet.create({
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  acoesLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  botaoStatus: {
    minWidth: 70,
    paddingHorizontal: 8,
  },
  botaoExcluir: {
    minWidth: 70,
    paddingHorizontal: 8,
  },
});

export const getTipoLabel = (tipo) => {
  const labels = {
    LOCAL: 'Local',
    COMENTARIO: 'Comentário',
    AVALIACAO: 'Avaliação',
    USUARIO: 'Usuário',
  };
  return labels[tipo] || tipo;
};

export const getTipoColor = (tipo) => {
  switch (tipo) {
    case 'LOCAL': return '#FF6B6B';
    case 'COMENTARIO': return '#4ECDC4';
    case 'AVALIACAO': return '#45B7D1';
    default: return '#96A7AF';
  }
};

export const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pendente',
    REVIEWED: 'Em análise',
    RESOLVED: 'Resolvido',
    REJECTED: 'Rejeitado',
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return '#FFA500';
    case 'REVIEWED': return '#3498DB';
    case 'RESOLVED': return '#27AE60';
    case 'REJECTED': return '#E74C3C';
    default: return '#95A5A6';
  }
};

export const formatarData = (data) => {
  if (!data) return 'á';
  try {
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return 'á';
    return date.toLocaleDateString('pt-BR');
  } catch {
    return 'á';
  }
};

export const colunasDenuncias = (handlers, isHighContrast, theme) => {
  const { onAtualizarStatus, onExcluir, carregandoAcao } = handlers;

  return [
    {
      key: 'tipo',
      chave: 'tipo',
      titulo: 'TIPO',
      minWidth: 100,
      flex: 0.8,
      sortKey: 'tipo',
      render: (item) => (
        <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(item.tipo) + '20' }]}>
          <TextoTematizado variant="caption" weight="bold" style={{ color: getTipoColor(item.tipo) }}>
            {getTipoLabel(item.tipo)}
          </TextoTematizado>
        </View>
      ),
    },
    {
      key: 'motivo',
      chave: 'motivo',
      titulo: 'MOTIVO',
      minWidth: 150,
      flex: 1.2,
      sortKey: 'motivo',
      render: (item) => (
        <TextoTematizado variant="caption" color="textSecondary" numberOfLines={1} altoContraste={isHighContrast}>
          {item.motivoLabel || item.motivo || 'Não informado'}
        </TextoTematizado>
      ),
    },
    {
      key: 'targetName',
      chave: 'targetName',
      titulo: 'ALVO',
      minWidth: 180,
      flex: 1.5,
      sortKey: 'targetName',
      render: (item) => (
        <TextoTematizado variant="caption" color="textSecondary" numberOfLines={1} altoContraste={isHighContrast}>
          {item.targetName || `ID: ${item.targetId}`}
        </TextoTematizado>
      ),
    },
    {
      key: 'descricao',
      chave: 'descricao',
      titulo: 'DESCRIÇÃO',
      minWidth: 250,
      flex: 2,
      sortKey: false,
      render: (item) => (
        <TextoTooltip
          text={item.descricao}
          maxLength={40}
          altoContraste={isHighContrast}
          position="top"
        />
      ),
    },
    {
      key: 'status',
      chave: 'status',
      titulo: 'STATUS',
      minWidth: 100,
      flex: 0.8,
      sortKey: 'status',
      render: (item) => (
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <TextoTematizado variant="caption" weight="bold" style={{ color: getStatusColor(item.status) }}>
            {getStatusLabel(item.status)}
          </TextoTematizado>
        </View>
      ),
    },
    {
      key: 'createdAt',
      chave: 'createdAt',
      titulo: 'DATA',
      minWidth: 100,
      flex: 0.8,
      sortKey: 'createdAt',
      render: (item) => (
        <TextoTematizado variant="caption" color="textSecondary" altoContraste={isHighContrast}>
          {formatarData(item.dataCriacao || item.createdAt)}
        </TextoTematizado>
      ),
    },
    {
      key: 'acoes',
      chave: 'acoes',
      titulo: 'AÇÕES',
      minWidth: 150,
      flex: 1,
      alinhamento: 'center',
      render: (item) => (
        <View style={styles.acoesLinha}>
          <Botao
            variant="outline"
            size="small"
            onPress={() => onAtualizarStatus(item)}
            disabled={carregandoAcao}
            altoContraste={isHighContrast}
            style={styles.botaoStatus}
          >
            Status
          </Botao>
          <Botao
            variant="danger"
            size="small"
            onPress={() => onExcluir(item)}
            disabled={carregandoAcao}
            altoContraste={isHighContrast}
            style={styles.botaoExcluir}
          >
            Excluir
          </Botao>
        </View>
      ),
    },
  ];
};