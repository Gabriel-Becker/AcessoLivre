import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Spacer } from '../../components/commons';
import { Recipiente } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/ContextoAutenticacao';
import ServicoReportar from '../../services/ServicoReportar';
import toastHelper from '../../utils/toastHelper';
import { breakpoints } from '../../config/theme';

const ReportItem = ({ report, onDelete, onRefresh, theme, isDesktop, isHighContrast }) => {
  const [deleting, setDeleting] = useState(false);

  const getTipoLabel = (tipo) => {
    const labels = {
      LOCAL: 'Local',
      COMENTARIO: 'ComentÃ¡rio',
      AVALIACAO: 'AvaliaÃ§Ã£o',
      USUARIO: 'UsuÃ¡rio',
    };
    return labels[tipo] || tipo;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return theme.colors.warning;
      case 'REVIEWED':
        return theme.colors.info;
      case 'RESOLVED':
        return theme.colors.success;
      case 'REJECTED':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'REVIEWED':
        return 'Em anÃ¡lise';
      case 'RESOLVED':
        return 'Resolvido';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const formatarData = (data) => {
    if (!data) return 'Data nÃ£o informada';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data invÃ¡lida';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir denÃºncia',
      'Tem certeza que deseja excluir esta denÃºncia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const result = await ReportarService.delete(report.id);
              if (result.success) {
                toastHelper.showSuccess('DenÃºncia excluÃ­da com sucesso');
                onRefresh();
              } else {
                toastHelper.showError(result.message || 'Erro ao excluir denÃºncia');
              }
            } catch (error) {
              console.error('Erro ao excluir:', error);
              toastHelper.showError('Erro ao excluir denÃºncia');
            } finally {
              setDeleting(false);
              onDelete?.();
            }
          },
        },
      ]
    );
  };

  return (
    <Card style={[styles.reportCard, { marginBottom: isDesktop ? 12 : 16 }]} altoContraste={isHighContrast}>
      <View style={styles.reportHeader}>
        <View style={styles.reportHeaderLeft}>
          <View style={[styles.tipoBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <TextoTematizado variant="caption" weight="bold" style={{ color: theme.colors.primary }}>
              {getTipoLabel(report.tipo)}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
            <TextoTematizado variant="caption" weight="bold" style={{ color: getStatusColor(report.status) }}>
              {getStatusLabel(report.status)}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={handleDelete} disabled={deleting} style={styles.deleteButton}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          )}
        </TouchableOpacity>
      </View>

      <Espacador size="sm" />

      <View style={styles.reportContent}>
        <View style={styles.reportRow}>
          <Ionicons name="flag-outline" size={16} color={theme.colors.textSecondary} />
          <TextoTematizado weight="semibold" style={styles.reportLabel}>Motivo:</ThemedText>
          <TextoTematizado color="textSecondary" style={styles.reportValue}>{report.motivoLabel || report.motivo}</ThemedText>
        </View>

        {report.targetName && (
          <View style={styles.reportRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <TextoTematizado weight="semibold" style={styles.reportLabel}>Alvo:</ThemedText>
            <TextoTematizado color="textSecondary" style={styles.reportValue} numberOfLines={1}>{report.targetName}</ThemedText>
          </View>
        )}

        {report.descricao && (
          <View style={styles.reportRow}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSecondary} />
            <TextoTematizado weight="semibold" style={styles.reportLabel}>DescriÃ§Ã£o:</ThemedText>
            <TextoTematizado color="textSecondary" style={styles.reportValue} numberOfLines={2}>{report.descricao}</ThemedText>
          </View>
        )}

        <View style={styles.reportRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <TextoTematizado weight="semibold" style={styles.reportLabel}>Data:</ThemedText>
          <TextoTematizado color="textSecondary" style={styles.reportValue}>{formatarData(report.createdAt)}</ThemedText>
        </View>

        {report.id && (
          <View style={styles.reportRow}>
            <Ionicons name="hash-outline" size={16} color={theme.colors.textSecondary} />
            <TextoTematizado weight="semibold" style={styles.reportLabel}>ID:</ThemedText>
            <TextoTematizado color="textSecondary" style={styles.reportValue}>#{report.id}</ThemedText>
          </View>
        )}
      </View>

      <Espacador size="sm" />
      
      <View style={styles.reportFooter}>
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: theme.colors.borderLight }]}
          onPress={() => onRefresh?.()}
        >
          <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
          <TextoTematizado variant="caption" color="primary">Atualizar status</ThemedText>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const ReportFilters = ({ filters, onFilterChange, theme, isDesktop, isHighContrast }) => {
  const tipos = [
    { id: 'ALL', label: 'Todos' },
    { id: 'LOCAL', label: 'Locais' },
    { id: 'COMENTARIO', label: 'ComentÃ¡rios' },
    { id: 'AVALIACAO', label: 'AvaliaÃ§Ãµes' },
  ];

  const statusList = [
    { id: 'ALL', label: 'Todos' },
    { id: 'PENDING', label: 'Pendentes' },
    { id: 'REVIEWED', label: 'Em anÃ¡lise' },
    { id: 'RESOLVED', label: 'Resolvidos' },
    { id: 'REJECTED', label: 'Rejeitados' },
  ];

  return (
    <Card style={styles.filtersCard} altoContraste={isHighContrast}>
      <View style={styles.filtersHeader}>
        <Ionicons name="filter-outline" size={20} color={theme.colors.primary} />
        <TextoTematizado weight="bold" style={styles.filtersTitle}>Filtros</ThemedText>
      </View>

      <Espacador size="sm" />

      <TextoTematizado variant="caption" weight="semibold" style={styles.filterLabel}>Tipo</ThemedText>
      <View style={styles.filterButtons}>
        {tipos.map(tipo => (
          <TouchableOpacity
            key={tipo.id}
            style={[
              styles.filterButton,
              filters.tipo === tipo.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={() => onFilterChange('tipo', tipo.id === 'ALL' ? null : tipo.id)}
          >
            <TextoTematizado
              variant="caption"
              weight={filters.tipo === tipo.id ? 'bold' : 'regular'}
              style={{ color: filters.tipo === tipo.id ? '#FFF' : theme.colors.textSecondary }}
            >
              {tipo.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <Espacador size="sm" />

      <TextoTematizado variant="caption" weight="semibold" style={styles.filterLabel}>Status</ThemedText>
      <View style={styles.filterButtons}>
        {statusList.map(status => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.filterButton,
              filters.status === status.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={() => onFilterChange('status', status.id === 'ALL' ? null : status.id)}
          >
            <TextoTematizado
              variant="caption"
              weight={filters.status === status.id ? 'bold' : 'regular'}
              style={{ color: filters.status === status.id ? '#FFF' : theme.colors.textSecondary }}
            >
              {status.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

export default function Reportar({ onNavigate }) {
  const { isHighContrast, theme: t, fontSizeMultiplier } = useThemeContext();
  const { isAuthenticated, user } = useAuth();
  const { width } = useWindowDimensions();

  const isDesktop = width >= breakpoints.desktop;
  const zoomAtivo = fontSizeMultiplier >= 1.5;
 
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ tipo: null, status: null });

  const isAdmin = user?.role === 'ADMIN' || user?.admin === true;

  const carregarDenuncias = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await ReportarService.getAll(filters);
      if (result.success && mountedRef.current) {
        setReports(result.data || []);
      } else if (!result.success && mountedRef.current) {
        toastHelper.showError(result.message || 'Erro ao carregar denÃºncias');
      }
    } catch (error) {
      console.error('Erro ao carregar denÃºncias:', error);
      if (mountedRef.current) {
        toastHelper.showError('Erro ao carregar denÃºncias');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    if (!isAuthenticated) {
      toastHelper.showInfo('FaÃ§a login para acessar esta pÃ¡gina');
      onNavigate?.('Entrar');
      return;
    }

    if (!isAdmin) {
      toastHelper.showError('Acesso negado. Ãrea restrita para administradores');
      onNavigate?.('Inicio');
      return;
    }

    carregarDenuncias();
  }, [isAuthenticated, isAdmin, carregarDenuncias, onNavigate]);

  const handleRefresh = useCallback(() => {
    carregarDenuncias(true);
  }, [carregarDenuncias]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'PENDING').length;

  const renderItem = useCallback(({ item }) => (
    <ReportItem
      report={item}
      onDelete={() => carregarDenuncias()}
      onRefresh={() => carregarDenuncias(true)}
      theme={t}
      isDesktop={isDesktop}
      isHighContrast={isHighContrast}
    />
  ), [t, isDesktop, isHighContrast, carregarDenuncias]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flag-outline" size={64} color={t.colors.textTertiary} />
      <Espacador size="md" />
      <TextoTematizado variant="h3" weight="bold" align="center">
        Nenhuma denÃºncia encontrada
      </ThemedText>
      <Espacador size="sm" />
      <TextoTematizado color="textSecondary" align="center">
        {filters.tipo || filters.status
          ? 'Tente remover os filtros para ver mais resultados'
          : 'Quando houver denÃºncias, elas aparecerÃ£o aqui'}
      </ThemedText>
    </View>
  ), [t.colors.textTertiary, t.colors.textSecondary, filters]);

  if (loading && !refreshing) {
    return (
      <Recipiente background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={t.colors.primary} />
          <Espacador size="md" />
          <TextoTematizado color="textSecondary">Carregando denÃºncias...</ThemedText>
        </View>
      </Container>
    );
  }

  return (
    <Recipiente background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate?.('Inicio')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={t.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <TextoTematizado variant="h1" weight="bold" style={styles.headerTitle}>
            DenÃºncias
          </ThemedText>
          <TextoTematizado color="textSecondary" style={styles.headerSubtitle}>
            Gerencie as denÃºncias da comunidade
          </ThemedText>
        </View>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={[styles.statCard, { backgroundColor: t.colors.primary + '10' }]}>
          <TextoTematizado variant="h2" weight="bold" style={{ color: t.colors.primary }}>
            {totalReports}
          </ThemedText>
          <TextoTematizado variant="caption" color="textSecondary">Total de denÃºncias</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.colors.warning + '10' }]}>
          <TextoTematizado variant="h2" weight="bold" style={{ color: t.colors.warning }}>
            {pendingCount}
          </ThemedText>
          <TextoTematizado variant="caption" color="textSecondary">Pendentes</ThemedText>
        </View>
      </View>

      <Espacador size="md" />

      {isDesktop ? (
        <View style={styles.desktopLayout}>
          {/* Coluna de Filtros */}
          <View style={styles.filtersColumn}>
            <ReportFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              theme={t}
              isDesktop={isDesktop}
              isHighContrast={isHighContrast}
            />
          </View>

          {/* Coluna de Resultados */}
          <View style={styles.resultsColumn}>
            <FlatList
              data={reports}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              ListHeaderComponent={
                <View style={styles.resultsHeader}>
                  <TextoTematizado weight="semibold">
                    Mostrando {reports.length} {reports.length === 1 ? 'denÃºncia' : 'denÃºncias'}
                  </ThemedText>
                </View>
              }
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[t.colors.primary]}
                  tintColor={t.colors.primary}
                />
              }
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              <ReportFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                theme={t}
                isDesktop={isDesktop}
                isHighContrast={isHighContrast}
              />
              <Espacador size="md" />
              <View style={styles.resultsHeaderMobile}>
                <TextoTematizado weight="semibold">
                  {reports.length} {reports.length === 1 ? 'denÃºncia' : 'denÃºncias'}
                </ThemedText>
              </View>
              <Espacador size="sm" />
            </>
          }
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[t.colors.primary]}
              tintColor={t.colors.primary}
            />
          }
          contentContainerStyle={styles.mobileListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsBanner: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
  },
  filtersColumn: {
    width: 280,
    flexShrink: 0,
  },
  resultsColumn: {
    flex: 1,
    minWidth: 0,
  },
  filtersCard: {
    padding: 16,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
  },
  filterLabel: {
    marginBottom: 6,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsHeaderMobile: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsList: {
    paddingBottom: 20,
  },
  mobileListContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  reportCard: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
  reportContent: {
    gap: 8,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  reportLabel: {
    fontSize: 13,
    minWidth: 70,
  },
  reportValue: {
    fontSize: 13,
    flex: 1,
  },
  reportFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
});

