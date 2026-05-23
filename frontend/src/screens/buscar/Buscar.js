import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  CabecalhoPagina,
  Button
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { Container } from '../../components/layout';
import LocalCard from '../../components/ui/LocalCard';

import { useThemeContext } from '../../context/ThemeContext';
import BuscarService from '../../services/BuscarService';
import { breakpoints, getTheme } from '../../config/theme';
import { CATEGORIAS } from '../../constants/enums';
import toastHelper from '../../utils/toastHelper';

const CATEGORIAS_LABELS = {
  COMERCIAL: 'Comercial',
  PUBLICO: 'Público',
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  LAZER: 'Lazer',
  TRANSPORTE: 'Transporte',
  ALIMENTACAO: 'Alimentação',
  HOSPEDAGEM: 'Hospedagem',
  SERVICOS: 'Serviços',
};

const RECURSOS_ACESSIBILIDADE = [
  { id: 'RAMPA', label: 'Rampa', icon: 'logo-usd' },
  { id: 'ELEVADOR', label: 'Elevador', icon: 'arrow-up-outline' },
  { id: 'BANHEIRO_ADAPTADO', label: 'Banheiro adaptado', icon: 'body-outline' },
  { id: 'ESTACIONAMENTO', label: 'Estacionamento', icon: 'car-outline' },
  { id: 'PISO_TATIL', label: 'Piso tátil', icon: 'eye-outline' },
  { id: 'ATENDIMENTO_ESPECIALIZADO', label: 'Atendimento especializado', icon: 'hand-left-outline' },
  { id: 'RECURSOS_AUDIOVISUAIS', label: 'Recursos audiovisuais', icon: 'mic-outline' },
  { id: 'SINALIZACAO_BRAILLE', label: 'Sinalização em Braile', icon: 'braille-outline' },
  { id: 'ESPACO_AMPLO', label: 'Espaço amplo', icon: 'resize-outline' },
  { id: 'MOBILIARIO_ADAPTADO', label: 'Mobiliário adaptado', icon: 'grid-outline' },
];

const FiltroCategoria = ({ categoriasSelecionadas, onToggleCategoria, theme, estilos }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={estilos.filtroGrupo}>
      <TouchableOpacity 
        style={estilos.filtroHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="grid-outline" size={20} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={estilos.filtroTitulo}>Categoria</ThemedText>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={estilos.filtroContent}>
          {CATEGORIAS.map(categoria => (
            <TouchableOpacity
              key={categoria}
              style={estilos.filtroItem}
              onPress={() => onToggleCategoria(categoria)}
              activeOpacity={0.7}
            >
              <View style={[
                estilos.checkbox,
                { 
                  borderColor: theme.colors.primary,
                  backgroundColor: categoriasSelecionadas.includes(categoria) 
                    ? theme.colors.primary 
                    : 'transparent'
                }
              ]}>
                {categoriasSelecionadas.includes(categoria) && (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                )}
              </View>
              <ThemedText style={estilos.filtroItemLabel}>
                {CATEGORIAS_LABELS[categoria] || categoria}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const FiltroAcessibilidade = ({ recursosSelecionados, onToggleRecurso, theme, estilos }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={estilos.filtroGrupo}>
      <TouchableOpacity 
        style={estilos.filtroHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="accessibility-outline" size={20} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={estilos.filtroTitulo}>Acessibilidade</ThemedText>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={estilos.filtroContent}>
          {RECURSOS_ACESSIBILIDADE.map(recurso => (
            <TouchableOpacity
              key={recurso.id}
              style={estilos.filtroItem}
              onPress={() => onToggleRecurso(recurso.id)}
              activeOpacity={0.7}
            >
              <View style={[
                estilos.checkbox,
                { 
                  borderColor: theme.colors.primary,
                  backgroundColor: recursosSelecionados.includes(recurso.id) 
                    ? theme.colors.primary 
                    : 'transparent'
                }
              ]}>
                {recursosSelecionados.includes(recurso.id) && (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                )}
              </View>
              <Ionicons name={recurso.icon} size={16} color={theme.colors.primary} style={estilos.filtroIcon} />
              <ThemedText style={estilos.filtroItemLabel}>{recurso.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const FiltroNota = ({ notaMinima, onNotaChange, theme, estilos }) => {
  const renderStars = (nota) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= nota ? 'star' : 'star-outline'}
          size={20}
          color={i <= nota ? theme.colors.warning : theme.colors.textTertiary}
        />
      );
    }
    return stars;
  };

  return (
    <View style={estilos.filtroGrupo}>
      <View style={estilos.filtroHeader}>
        <Ionicons name="star-outline" size={20} color={theme.colors.warning} />
        <ThemedText weight="semibold" style={estilos.filtroTitulo}>Nota Mínima</ThemedText>
      </View>
      
      <View style={estilos.filtroContent}>
        <View style={estilos.notaContainer}>
          <View style={estilos.notaStars}>
            {renderStars(notaMinima)}
          </View>
          <ThemedText weight="bold" style={estilos.notaValor}>
            {notaMinima === 0 ? 'Qualquer nota' : `${notaMinima}+ estrelas`}
          </ThemedText>
        </View>
        
        <View style={estilos.notaSliderContainer}>
          {[0, 1, 2, 3, 4, 4.5].map(nota => (
            <TouchableOpacity
              key={nota}
              style={[
                estilos.notaBotao,
                notaMinima === nota && estilos.notaBotaoAtivo,
                { borderColor: theme.colors.primary }
              ]}
              onPress={() => onNotaChange(nota)}
            >
              <ThemedText 
                style={[
                  estilos.notaBotaoTexto,
                  notaMinima === nota && { color: theme.colors.primary, fontWeight: 'bold' }
                ]}
              >
                {nota === 0 ? 'Qualquer' : `${nota}+`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function Buscar({ onNavigate }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { width } = useWindowDimensions();
  const theme = t;
  const estilos = criarEstilos(theme);

  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;

  const [searchText, setSearchText] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [recursosSelecionados, setRecursosSelecionados] = useState([]);
  const [notaMinima, setNotaMinima] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalResultados, setTotalResultados] = useState(0);

  const numColumns = useMemo(() => {
    if (isDesktop) return 2;
    if (isTablet) return 2;
    return 1;
  }, [isDesktop, isTablet]);

  const temFiltrosAtivos = useMemo(() => {
    return searchText !== '' || 
           categoriasSelecionadas.length > 0 || 
           recursosSelecionados.length > 0 || 
           notaMinima > 0;
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  const toggleCategoria = useCallback((categoria) => {
    setCategoriasSelecionadas(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  }, []);

  const toggleRecurso = useCallback((recurso) => {
    setRecursosSelecionados(prev =>
      prev.includes(recurso)
        ? prev.filter(r => r !== recurso)
        : [...prev, recurso]
    );
  }, []);

  const limparFiltros = useCallback(() => {
    setSearchText('');
    setCategoriasSelecionadas([]);
    setRecursosSelecionados([]);
    setNotaMinima(0);
  }, []);

  const realizarBusca = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const filtros = {
        searchText: searchText || null,
        categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : null,
        recursos: recursosSelecionados.length > 0 ? recursosSelecionados : null,
        notaMinima: notaMinima > 0 ? notaMinima : null
      };

      const response = await BuscarService.buscarLocais(filtros);
      
      if (response.success) {
        const locaisSanitizados = BuscarService.sanitizarLocais(response.data);
        setResultados(locaisSanitizados);
        setTotalResultados(locaisSanitizados.length);
      } else {
        setResultados([]);
        setTotalResultados(0);
      }
      
    } catch (error) {
      console.error('Erro na busca:', error);
      toastHelper.showError('Erro ao buscar locais');
      setResultados([]);
      setTotalResultados(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      realizarBusca();
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima, realizarBusca]);

  const handleLocalPress = useCallback((local) => {
    const localId = BuscarService.getLocalId(local);
    if (localId) {
      onNavigate?.('LocalDetalhes', { id: localId });
    } else {
      toastHelper.showError('Erro ao abrir local');
    }
  }, [onNavigate]);

  const handleVoltar = useCallback(() => {
    onNavigate?.('Inicio');
  }, [onNavigate]);

  const renderEmptyState = () => (
    <View style={estilos.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={theme.colors.textTertiary} />
      <ThemedText variant="h3" weight="bold" align="center">
        {temFiltrosAtivos ? 'Nenhum local encontrado' : 'Nenhum local cadastrado ainda'}
      </ThemedText>
      <Spacer size="sm" />
      <ThemedText color="textSecondary" align="center">
        {temFiltrosAtivos 
          ? 'Tente ajustar os filtros ou buscar por outro termo'
          : 'Seja o primeiro da comunidade a cadastrar um local acessível!'}
      </ThemedText>
    </View>
  );

  const renderItem = useCallback(({ item }) => (
    <View style={estilos.cardWrapper}>
      <LocalCard
        local={item}
        onPress={() => handleLocalPress(item)}
        altoContraste={isHighContrast}
      />
    </View>
  ), [handleLocalPress, isHighContrast]);

  if (loading && resultados.length === 0) {
    return (
      <View style={estilos.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary">Buscando locais...</ThemedText>
      </View>
    );
  }

  return (
    <Container
      scroll
      background={isHighContrast ? 'background' : 'backgroundSecondary'}
      altoContraste={isHighContrast}
    >
      <CabecalhoPagina
        titulo="Buscar Locais"
        subtitulo="Encontre e avalie locais acessíveis"
        onVoltar={handleVoltar}
        textoVoltar="Voltar"
        altoContraste={isHighContrast}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
        refreshControl={
          <RefreshControl
              refreshing={refreshing}
              onRefresh={() => realizarBusca(true)}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
        }
      >
        <View style={estilos.conteudo}>
          <View style={[
            estilos.colunaFiltros,
            isDesktop && estilos.colunaFiltrosDesktop
          ]}>
            <View style={[estilos.filtrosCard, { backgroundColor: theme.colors.surface }]}>
              <View style={estilos.filtrosHeader}>
                <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
                <ThemedText variant="h3" weight="bold" style={estilos.filtrosTitulo}>
                  Filtros
                </ThemedText>
                {temFiltrosAtivos && (
                  <TouchableOpacity onPress={limparFiltros} style={estilos.limparButton}>
                    <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                    <ThemedText color="error" variant="caption">Limpar</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <Spacer size="md" />

              <View style={estilos.searchContainer}>
                <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[estilos.searchInput, { color: theme.colors.textPrimary }]}
                  placeholder="Buscar por nome..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText !== '' && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <Spacer size="md" />

              <FiltroCategoria
                categoriasSelecionadas={categoriasSelecionadas}
                onToggleCategoria={toggleCategoria}
                theme={theme}
                estilos={estilos}
              />

              <Spacer size="md" />

              <FiltroAcessibilidade
                recursosSelecionados={recursosSelecionados}
                onToggleRecurso={toggleRecurso}
                theme={theme}
                estilos={estilos}
              />

              <Spacer size="md" />

              <FiltroNota
                notaMinima={notaMinima}
                onNotaChange={setNotaMinima}
                theme={theme}
                estilos={estilos}
              />

              <Spacer size="md" />

              {!isDesktop && (
                <Button
                  variant="primary"
                  onPress={() => realizarBusca()}
                  fullWidth
                  altoContraste={isHighContrast}
                >
                  Aplicar Filtros
                </Button>
              )}
            </View>
          </View>

          <View style={estilos.colunaResultados}>
            <View style={estilos.resultadosHeader}>
              <ThemedText variant="h3" weight="bold">
                {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
              </ThemedText>
            </View>

            <Spacer size="md" />

            {resultados.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={resultados}
                key={numColumns}
                numColumns={numColumns}
                keyExtractor={(item) => String(BuscarService.getLocalId(item))}
                renderItem={renderItem}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={estilos.resultadosGrid}
              />
            )}
          </View>
        </View>

            <Spacer size="xl" />
      </ScrollView>
    </Container>
  );
}

const criarEstilos = (t) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  conteudo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  colunaFiltros: {
    flex: 1,
    minWidth: 280,
  },
  colunaFiltrosDesktop: {
    maxWidth: 320,
  },
  colunaResultados: {
    flex: 3,
    minWidth: 280,
  },
  filtrosCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: t.shadows.sm.shadowColor,
    shadowOffset: t.shadows.sm.shadowOffset,
    shadowOpacity: t.shadows.sm.shadowOpacity,
    shadowRadius: t.shadows.sm.shadowRadius,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  filtrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtrosTitulo: {
    flex: 1,
    fontSize: 18,
  },
  limparButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filtroGrupo: {
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    paddingTop: 12,
  },
  filtroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  filtroTitulo: {
    flex: 1,
    fontSize: 15,
  },
  filtroContent: {
    paddingLeft: 30,
    paddingTop: 8,
    gap: 8,
  },
  filtroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  filtroIcon: {
    marginLeft: 4,
  },
  filtroItemLabel: {
    fontSize: 14,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notaContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notaStars: {
    flexDirection: 'row',
    gap: 6,
  },
  notaValor: {
    fontSize: 14,
  },
  notaSliderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  notaBotao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderColor: t.colors.border,
  },
  notaBotaoAtivo: {
    backgroundColor: t.colors.surfaceSecondary,
  },
  notaBotaoTexto: {
    fontSize: 12,
  },
  resultadosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultadosGrid: {
    paddingBottom: 16,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
});