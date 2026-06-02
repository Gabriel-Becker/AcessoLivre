import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  FlatList,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  CabecalhoPagina,
  Button,
  Card
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

// Componente de input de busca - ESTILO PADRONIZADO
const SearchInput = React.memo(({ onSearch, theme }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  const handleChange = useCallback((value) => {
    setText(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, 400);
  }, [onSearch]);

  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
      <TextInput
        ref={inputRef}
        style={[styles.searchInput, { color: theme.colors.textPrimary }]}
        placeholder="Buscar por nome, endereço ou categoria..."
        placeholderTextColor={theme.colors.textTertiary}
        value={text}
        onChangeText={handleChange}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={false}
      />
      {text !== '' && (
        <TouchableOpacity onPress={() => handleChange('')}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchInput.displayName = 'SearchInput';

// Componente de filtro de categoria - ESTILO PADRONIZADO
const FiltroCategoria = React.memo(({ categoriasSelecionadas, onToggleCategoria, theme }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity style={styles.filtroHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <Ionicons name="grid-outline" size={20} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={styles.filtroTitulo}>Categoria</ThemedText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.filtroContent}>
          {CATEGORIAS.map(categoria => (
            <TouchableOpacity 
              key={categoria} 
              style={styles.filtroItem} 
              onPress={() => onToggleCategoria(categoria)} 
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: categoriasSelecionadas.includes(categoria) ? theme.colors.primary : 'transparent' }]}>
                {categoriasSelecionadas.includes(categoria) && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <ThemedText style={styles.filtroItemLabel}>{CATEGORIAS_LABELS[categoria] || categoria}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

FiltroCategoria.displayName = 'FiltroCategoria';

// Componente de filtro de acessibilidade - ESTILO PADRONIZADO
const FiltroAcessibilidade = React.memo(({ recursosSelecionados, onToggleRecurso, theme }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity style={styles.filtroHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <Ionicons name="accessibility-outline" size={20} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={styles.filtroTitulo}>Acessibilidade</ThemedText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.filtroContent}>
          {RECURSOS_ACESSIBILIDADE.map(recurso => (
            <TouchableOpacity 
              key={recurso.id} 
              style={styles.filtroItem} 
              onPress={() => onToggleRecurso(recurso.id)} 
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: recursosSelecionados.includes(recurso.id) ? theme.colors.primary : 'transparent' }]}>
                {recursosSelecionados.includes(recurso.id) && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Ionicons name={recurso.icon} size={16} color={theme.colors.primary} style={styles.filtroIcon} />
              <ThemedText style={styles.filtroItemLabel}>{recurso.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

FiltroAcessibilidade.displayName = 'FiltroAcessibilidade';

// Componente de filtro de nota - ESTILO PADRONIZADO
const FiltroNota = React.memo(({ notaMinima, onNotaChange, theme }) => {
  const renderStars = useCallback((nota) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Ionicons key={i} name={i <= nota ? 'star' : 'star-outline'} size={20} color={i <= nota ? theme.colors.warning : theme.colors.textTertiary} />);
    }
    return stars;
  }, [theme.colors.warning, theme.colors.textTertiary]);

  return (
    <View style={styles.filtroGrupo}>
      <View style={styles.filtroHeader}>
        <Ionicons name="star-outline" size={20} color={theme.colors.warning} />
        <ThemedText weight="semibold" style={styles.filtroTitulo}>Nota Mínima</ThemedText>
      </View>
      
      <View style={styles.filtroContent}>
        <View style={styles.notaContainer}>
          <View style={styles.notaStars}>{renderStars(notaMinima)}</View>
          <ThemedText weight="bold" style={styles.notaValor}>{notaMinima === 0 ? 'Qualquer nota' : `${notaMinima}+ estrelas`}</ThemedText>
        </View>
        
        <View style={styles.notaSliderContainer}>
          {[0, 1, 2, 3, 4, 4.5].map(nota => (
            <TouchableOpacity 
              key={nota} 
              style={[styles.notaBotao, notaMinima === nota && styles.notaBotaoAtivo, { borderColor: theme.colors.primary }]} 
              onPress={() => onNotaChange(nota)}
            >
              <ThemedText style={[styles.notaBotaoTexto, notaMinima === nota && { color: theme.colors.primary, fontWeight: 'bold' }]}>{nota === 0 ? 'Qualquer' : `${nota}+`}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

FiltroNota.displayName = 'FiltroNota';

// Componente de Filtros Card - ESTÁVEL, sem recriação
const FiltrosCard = React.memo(({ 
  onSearchChange,
  categoriasSelecionadas,
  onToggleCategoria,
  recursosSelecionados,
  onToggleRecurso,
  notaMinima,
  onNotaChange,
  onLimparFiltros,
  temFiltrosAtivos,
  onAplicarFiltros,
  isDesktop,
  theme,
  isHighContrast
}) => {
  return (
    <Card variant="outlined" style={styles.filtrosCard} altoContraste={isHighContrast}>
      <View style={styles.filtrosHeader}>
        <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
        <ThemedText variant="h3" weight="bold" style={styles.filtrosTitulo}>Filtros</ThemedText>
        {temFiltrosAtivos && (
          <TouchableOpacity onPress={onLimparFiltros} style={styles.limparButton}>
            <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
            <ThemedText color="error" variant="caption">Limpar</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <Spacer size="md" />

      <SearchInput 
        onSearch={onSearchChange}
        theme={theme}
      />

      <Spacer size="md" />
      <FiltroCategoria categoriasSelecionadas={categoriasSelecionadas} onToggleCategoria={onToggleCategoria} theme={theme} />
      <Spacer size="md" />
      <FiltroAcessibilidade recursosSelecionados={recursosSelecionados} onToggleRecurso={onToggleRecurso} theme={theme} />
      <Spacer size="md" />
      <FiltroNota notaMinima={notaMinima} onNotaChange={onNotaChange} theme={theme} />

      {!isDesktop && (
        <>
          <Spacer size="md" />
          <Button variant="primary" onPress={onAplicarFiltros} fullWidth altoContraste={isHighContrast}>
            Aplicar Filtros
          </Button>
        </>
      )}
    </Card>
  );
});

FiltrosCard.displayName = 'FiltrosCard';

export default function Buscar({ onNavigate }) {
  const { isHighContrast } = useThemeContext();
  const { width } = useWindowDimensions();
  const theme = getTheme(isHighContrast);
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;

  // Estados
  const [searchText, setSearchText] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [recursosSelecionados, setRecursosSelecionados] = useState([]);
  const [notaMinima, setNotaMinima] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalResultados, setTotalResultados] = useState(0);
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  // Desktop: exatamente 3 cards por linha com tamanho fixo
  const numColumns = useMemo(() => {
    if (isDesktop) return 3;
    if (isTablet) return 2;
    return 1;
  }, [isDesktop, isTablet]);

  const temFiltrosAtivos = useMemo(() => {
    return searchText.trim() !== '' || categoriasSelecionadas.length > 0 || recursosSelecionados.length > 0 || notaMinima > 0;
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  // Função de busca
  const realizarBusca = useCallback(async () => {
    try {
      const filtros = {
        searchText: searchText.trim() || null,
        categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : null,
        recursos: recursosSelecionados.length > 0 ? recursosSelecionados : null,
        notaMinima: notaMinima > 0 ? notaMinima : null
      };
      
      const response = await BuscarService.buscarLocais(filtros);
      
      if (response.success) {
        setResultados(response.data);
        setTotalResultados(response.total);
      } else {
        setResultados([]);
        setTotalResultados(0);
      }
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      setResultados([]);
      setTotalResultados(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  // Carregar dados iniciais
  const carregarDadosIniciais = useCallback(async () => {
    setCarregandoInicial(true);
    try {
      await BuscarService.carregarTodosLocais();
      await realizarBusca();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toastHelper.showError('Erro ao carregar locais');
    } finally {
      setCarregandoInicial(false);
      setLoading(false);
    }
  }, [realizarBusca]);

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  // Efeito para filtros - SEM scroll automático
  useEffect(() => {
    if (!carregandoInicial) {
      realizarBusca();
    }
  }, [categoriasSelecionadas, recursosSelecionados, notaMinima, carregandoInicial, realizarBusca]);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
    setLoading(true);
  }, []);

  const toggleCategoria = useCallback((categoria) => {
    setCategoriasSelecionadas(prev =>
      prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]
    );
  }, []);

  const toggleRecurso = useCallback((recurso) => {
    setRecursosSelecionados(prev =>
      prev.includes(recurso) ? prev.filter(r => r !== recurso) : [...prev, recurso]
    );
  }, []);

  const limparFiltros = useCallback(() => {
    setSearchText('');
    setCategoriasSelecionadas([]);
    setRecursosSelecionados([]);
    setNotaMinima(0);
    setLoading(true);
    setTimeout(() => realizarBusca(), 50);
  }, [realizarBusca]);

  const aplicarFiltros = useCallback(() => {
    setLoading(true);
    realizarBusca();
  }, [realizarBusca]);

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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    BuscarService.cache = null;
    BuscarService.carregarTodosLocais().finally(() => {
      realizarBusca();
    });
  }, [realizarBusca]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={theme.colors.textTertiary} />
      <ThemedText variant="h3" weight="bold" align="center">
        {temFiltrosAtivos ? 'Nenhum local encontrado' : 'Digite algo para buscar'}
      </ThemedText>
      <Spacer size="sm" />
      <ThemedText color="textSecondary" align="center">
        {temFiltrosAtivos 
          ? 'Tente ajustar os filtros ou buscar por outro termo'
          : 'Busque por nome, categoria ou recursos de acessibilidade'}
      </ThemedText>
    </View>
  ), [temFiltrosAtivos, theme.colors.textTertiary, theme.colors.textSecondary]);

  const renderItem = useCallback(({ item }) => (
    <View style={styles.cardWrapper}>
      <LocalCard local={item} onPress={() => handleLocalPress(item)} altoContraste={isHighContrast} />
    </View>
  ), [handleLocalPress, isHighContrast]);

  // Loading inicial
  if (carregandoInicial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Spacer size="md" />
        <ThemedText color="textSecondary">Carregando locais...</ThemedText>
      </View>
    );
  }

  return (
    <Container scroll={false} background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      <CabecalhoPagina
        titulo="Buscar Locais"
        subtitulo="Encontre e avalie locais acessíveis"
        onVoltar={handleVoltar}
        textoVoltar="Voltar"
        altoContraste={isHighContrast}
      />

      {isDesktop ? (
        <View style={styles.conteudoDesktop}>
          {/* Coluna de Filtros */}
          <View style={styles.colunaFiltrosDesktop}>
            <ScrollView 
              style={styles.filtrosScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.filtrosScrollContent}
              scrollEnabled={true}
            >
              <FiltrosCard 
                onSearchChange={handleSearchChange}
                categoriasSelecionadas={categoriasSelecionadas}
                onToggleCategoria={toggleCategoria}
                recursosSelecionados={recursosSelecionados}
                onToggleRecurso={toggleRecurso}
                notaMinima={notaMinima}
                onNotaChange={setNotaMinima}
                onLimparFiltros={limparFiltros}
                temFiltrosAtivos={temFiltrosAtivos}
                onAplicarFiltros={aplicarFiltros}
                isDesktop={isDesktop}
                theme={theme}
                isHighContrast={isHighContrast}
              />
            </ScrollView>
          </View>

          {/* Coluna de Resultados - 3 cards por linha com tamanho fixo */}
          <View style={styles.colunaResultadosDesktop}>
            <View style={styles.resultadosHeader}>
              <ThemedText variant="h3" weight="bold">
                {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
              </ThemedText>
              {(loading || refreshing) && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </View>
            <Spacer size="md" />
            
            <FlatList
              data={resultados}
              key={numColumns}
              numColumns={numColumns}
              keyExtractor={(item, index) => String(item.id || index)}
              renderItem={renderItem}
              ListEmptyComponent={!loading && renderEmptyState}
              contentContainerStyle={styles.resultadosListContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
              }
              initialNumToRender={6}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={resultados}
          key={numColumns}
          numColumns={numColumns}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              <FiltrosCard 
                onSearchChange={handleSearchChange}
                categoriasSelecionadas={categoriasSelecionadas}
                onToggleCategoria={toggleCategoria}
                recursosSelecionados={recursosSelecionados}
                onToggleRecurso={toggleRecurso}
                notaMinima={notaMinima}
                onNotaChange={setNotaMinima}
                onLimparFiltros={limparFiltros}
                temFiltrosAtivos={temFiltrosAtivos}
                onAplicarFiltros={aplicarFiltros}
                isDesktop={isDesktop}
                theme={theme}
                isHighContrast={isHighContrast}
              />
              <View style={styles.resultadosHeaderMobile}>
                <ThemedText variant="h3" weight="bold">
                  {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
                </ThemedText>
                {(loading || refreshing) && <ActivityIndicator size="small" color={theme.colors.primary} />}
              </View>
              <Spacer size="md" />
            </>
          }
          ListEmptyComponent={!loading && renderEmptyState}
          contentContainerStyle={styles.listContentMobile}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  // Layout Desktop
  conteudoDesktop: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  colunaFiltrosDesktop: {
    width: 320,
    flexShrink: 0,
  },
  filtrosScrollView: {
    flex: 1,
  },
  filtrosScrollContent: {
    paddingBottom: 20,
  },
  colunaResultadosDesktop: {
    flex: 1,
    minWidth: 0,
  },
  
  // Layout Mobile
  listContentMobile: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  
  // Cards - Padronizado com TabelaPlanilhaAdmin
  filtrosCard: {
    padding: 16,
    borderRadius: 14,
    overflow: 'hidden',
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
  
  // Search Container - ESTILO PADRONIZADO com o card
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  
  filtroGrupo: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
  },
  notaBotaoAtivo: {
    backgroundColor: '#E8F0FF',
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
  resultadosHeaderMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  resultadosListContent: {
    paddingBottom: 20,
  },
  
  cardWrapper: {
    flexBasis: '33.333%',
    maxWidth: '33.333%',
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