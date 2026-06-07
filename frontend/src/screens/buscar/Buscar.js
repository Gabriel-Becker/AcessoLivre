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
  ScrollView
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

const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 1000,
  DESKTOP: 1400
};

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


const FiltroCategoria = React.memo(({ categoriasSelecionadas, onToggleCategoria, theme, layoutEmpilhado, escalaFonteFiltro }) => {
  const [expanded, setExpanded] = useState(true);
  const tamanhoIconeSecao = Math.round(20 * escalaFonteFiltro);
  const tamanhoSeta = Math.round(18 * escalaFonteFiltro);
  const tamanhoCheck = Math.max(12, Math.round(12 * escalaFonteFiltro));
  const tamanhoTexto = Math.round(14 * escalaFonteFiltro);
  const tamanhoTitulo = Math.round(15 * escalaFonteFiltro);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity style={styles.filtroHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <Ionicons name="grid-outline" size={tamanhoIconeSecao} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={[styles.filtroTitulo, { fontSize: tamanhoTitulo }]}>Categoria</ThemedText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={tamanhoSeta} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      
      {expanded && (
        <View style={[styles.filtroContent, layoutEmpilhado && styles.filtroContentEmpilhado]}>
          {CATEGORIAS.map(categoria => (
            <TouchableOpacity key={categoria} style={[styles.filtroItem, layoutEmpilhado && styles.filtroItemEmpilhado]} onPress={() => onToggleCategoria(categoria)} activeOpacity={0.7}>
              <View style={[styles.checkbox, { width: Math.round(20 * escalaFonteFiltro), height: Math.round(20 * escalaFonteFiltro), borderColor: theme.colors.primary, backgroundColor: categoriasSelecionadas.includes(categoria) ? theme.colors.primary : 'transparent' }]}>
                {categoriasSelecionadas.includes(categoria) && <Ionicons name="checkmark" size={tamanhoCheck} color="#FFF" />}
              </View>
              <ThemedText style={[styles.filtroItemLabel, { fontSize: tamanhoTexto }]}>{CATEGORIAS_LABELS[categoria] || categoria}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

FiltroCategoria.displayName = 'FiltroCategoria';

const FiltroAcessibilidade = React.memo(({ recursosSelecionados, onToggleRecurso, theme, layoutEmpilhado, escalaFonteFiltro }) => {
  const [expanded, setExpanded] = useState(false);
  const tamanhoIconeSecao = Math.round(20 * escalaFonteFiltro);
  const tamanhoSeta = Math.round(18 * escalaFonteFiltro);
  const tamanhoCheck = Math.max(12, Math.round(12 * escalaFonteFiltro));
  const tamanhoIconeItem = Math.round(16 * escalaFonteFiltro);
  const tamanhoTexto = Math.round(14 * escalaFonteFiltro);
  const tamanhoTitulo = Math.round(15 * escalaFonteFiltro);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity style={styles.filtroHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <Ionicons name="accessibility-outline" size={tamanhoIconeSecao} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={[styles.filtroTitulo, { fontSize: tamanhoTitulo }]}>Acessibilidade</ThemedText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={tamanhoSeta} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      
      {expanded && (
        <View style={[styles.filtroContent, layoutEmpilhado && styles.filtroContentEmpilhado]}>
          {RECURSOS_ACESSIBILIDADE.map(recurso => (
            <TouchableOpacity key={recurso.id} style={[styles.filtroItem, layoutEmpilhado && styles.filtroItemEmpilhado]} onPress={() => onToggleRecurso(recurso.id)} activeOpacity={0.7}>
              <View style={[styles.checkbox, { width: Math.round(20 * escalaFonteFiltro), height: Math.round(20 * escalaFonteFiltro), borderColor: theme.colors.primary, backgroundColor: recursosSelecionados.includes(recurso.id) ? theme.colors.primary : 'transparent' }]}>
                {recursosSelecionados.includes(recurso.id) && <Ionicons name="checkmark" size={tamanhoCheck} color="#FFF" />}
              </View>
              <Ionicons name={recurso.icon} size={tamanhoIconeItem} color={theme.colors.primary} style={styles.filtroIcon} />
              <ThemedText style={[styles.filtroItemLabel, { fontSize: tamanhoTexto }]}>{recurso.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

FiltroAcessibilidade.displayName = 'FiltroAcessibilidade';

const FiltroNota = React.memo(({ notaMinima, onNotaChange, theme, layoutEmpilhado, escalaFonteFiltro }) => {
  const tamanhoIconeSecao = Math.round(20 * escalaFonteFiltro);
  const tamanhoEstrela = Math.round(20 * escalaFonteFiltro);
  const tamanhoTitulo = Math.round(15 * escalaFonteFiltro);
  const tamanhoNota = Math.round(14 * escalaFonteFiltro);
  const tamanhoBotao = Math.round(12 * escalaFonteFiltro);

  const renderStars = (nota) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Ionicons key={i} name={i <= nota ? 'star' : 'star-outline'} size={tamanhoEstrela} color={i <= nota ? theme.colors.warning : theme.colors.textTertiary} />);
    }
    return stars;
  };

  return (
    <View style={styles.filtroGrupo}>
      <View style={styles.filtroHeader}>
        <Ionicons name="star-outline" size={tamanhoIconeSecao} color={theme.colors.warning} />
        <ThemedText weight="semibold" style={[styles.filtroTitulo, { fontSize: tamanhoTitulo }]}>Nota Mínima</ThemedText>
      </View>
      
      <View style={styles.filtroContent}>
        <View style={styles.notaContainer}>
          <View style={styles.notaStars}>{renderStars(notaMinima)}</View>
          <ThemedText weight="bold" style={[styles.notaValor, { fontSize: tamanhoNota }]}>{notaMinima === 0 ? 'Qualquer nota' : `${notaMinima}+ estrelas`}</ThemedText>
        </View>
        
        <View style={[styles.notaSliderContainer, layoutEmpilhado && styles.notaSliderContainerEmpilhado]}>
          {[0, 1, 2, 3, 4, 4.5].map(nota => (
            <TouchableOpacity key={nota} style={[styles.notaBotao, { paddingHorizontal: Math.round(12 * escalaFonteFiltro), paddingVertical: Math.round(6 * escalaFonteFiltro) }, notaMinima === nota && styles.notaBotaoAtivo, { borderColor: theme.colors.primary }]} onPress={() => onNotaChange(nota)}>
              <ThemedText style={[styles.notaBotaoTexto, { fontSize: tamanhoBotao }, notaMinima === nota && { color: theme.colors.primary, fontWeight: 'bold' }]}>{nota === 0 ? 'Qualquer' : `${nota}+`}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

FiltroNota.displayName = 'FiltroNota';

export default function Buscar({ onNavigate }) {
  const { isHighContrast, theme: temaContexto, fontSizeMultiplier } = useThemeContext();
  const { width, height } = useWindowDimensions();
  const theme = temaContexto || getTheme(isHighContrast, fontSizeMultiplier);
  const debounceTimer = useRef(null);

  const isDesktop = width >= breakpoints.desktop;
  const layoutEmpilhado = width < 1280 || fontSizeMultiplier >= 1.5;
  const zoomAtivo = fontSizeMultiplier > 1;
  const escalaFonteFiltro = useMemo(() => {
    if (!zoomAtivo) return 1;
    return Math.max(1.25, Math.min(fontSizeMultiplier, 2.2));
  }, [zoomAtivo, fontSizeMultiplier]);

  const usarScrollNoPainelFiltros = isDesktop && !layoutEmpilhado && filtrosAbertos;
  const alturaMaximaPainelFiltros = useMemo(() => {
    const fatorAltura = zoomAtivo ? 0.62 : 0.54;
    return Math.max(300, Math.round(height * fatorAltura));
  }, [height, zoomAtivo]);

  const [searchText, setSearchText] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [recursosSelecionados, setRecursosSelecionados] = useState([]);
  const [notaMinima, setNotaMinima] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalResultados, setTotalResultados] = useState(0);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [filtrosAbertos, setFiltrosAbertos] = useState(zoomAtivo);

  const layoutResultados = useMemo(() => {
    if (fontSizeMultiplier >= 2) {
      return {
        numColumns: 1,
        cardMaxWidth: 980,
        cardFlexBasis: '100%',
        centralizarCards: true,
        usarWrapperCentralizado: false,
      };
    }

    if (fontSizeMultiplier >= 1.5) {
      return {
        numColumns: 2,
        cardMaxWidth: 760,
        cardFlexBasis: '49%',
        centralizarCards: true,
        usarWrapperCentralizado: true,
      };
    }

    if (width >= BREAKPOINTS.DESKTOP) {
      return {
        numColumns: 3,
        cardMaxWidth: 420,
        cardFlexBasis: '32%',
        centralizarCards: false,
        usarWrapperCentralizado: false,
      };
    }

    if (width >= BREAKPOINTS.TABLET) {
      return {
        numColumns: 2,
        cardMaxWidth: 520,
        cardFlexBasis: '48%',
        centralizarCards: false,
        usarWrapperCentralizado: false,
      };
    }

    if (width >= BREAKPOINTS.MOBILE) {
      return {
        numColumns: 2,
        cardMaxWidth: 560,
        cardFlexBasis: '48%',
        centralizarCards: false,
        usarWrapperCentralizado: false,
      };
    }

    return {
      numColumns: 1,
      cardMaxWidth: 840,
      cardFlexBasis: '100%',
      centralizarCards: true,
      usarWrapperCentralizado: false,
    };
  }, [width, fontSizeMultiplier]);

  useEffect(() => {
    // Sem zoom inicia fechado; com zoom iniciamos aberto para facilitar ajustes visuais.
    setFiltrosAbertos(zoomAtivo);
  }, [zoomAtivo]);

  const temFiltrosAtivos = useMemo(() => {
    return searchText.trim() !== '' || categoriasSelecionadas.length > 0 || recursosSelecionados.length > 0 || notaMinima > 0;
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  const realizarBusca = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    
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
        
        if (temFiltrosAtivos && response.total === 0) {
          toastHelper.showInfo('Nenhum local encontrado com os filtros selecionados');
        }
      } else {
        toastHelper.showError(response.message || 'Erro ao buscar locais');
        setResultados([]);
        setTotalResultados(0);
      }
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      toastHelper.showError('Erro ao buscar locais');
      setResultados([]);
      setTotalResultados(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima, temFiltrosAtivos]);

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
    }
  }, [realizarBusca]);

  // Debounce para busca por texto
  const handleSearchTextChange = useCallback((text) => {
    setSearchText(text);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      realizarBusca(true);
    }, 400);
  }, [realizarBusca]);

  // Buscar quando filtros mudarem
  const handleFilterChange = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      realizarBusca(true);
    }, 200);
  }, [realizarBusca]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  // Efeito para filtros que não são texto
  useEffect(() => {
    if (!carregandoInicial) {
      handleFilterChange();
    }
  }, [categoriasSelecionadas, recursosSelecionados, notaMinima, carregandoInicial, handleFilterChange]);

  // Limpar timers ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
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
    
    // Buscar todos os locais após limpar
    setTimeout(() => {
      realizarBusca(true);
    }, 50);
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
    // Recarregar cache
    BuscarService.cache = null;
    BuscarService.carregarTodosLocais().finally(() => {
      realizarBusca(false);
    });
  }, [realizarBusca]);

  const renderEmptyState = () => (
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
  );

  const renderItem = useCallback(({ item }) => (
    <View
      style={[
        styles.cardWrapper,
        {
          maxWidth: layoutResultados.cardMaxWidth,
          flexBasis: layoutResultados.cardFlexBasis,
        },
        layoutResultados.numColumns === 1 ? styles.cardWrapperCentralizado : null,
      ]}
    >
      <LocalCard local={item} onPress={() => handleLocalPress(item)} altoContraste={isHighContrast} />
    </View>
  ), [handleLocalPress, isHighContrast, layoutResultados]);

  const renderConteudoFiltros = () => (
    <>
      <View style={[styles.searchContainer, layoutEmpilhado && styles.searchContainerEmpilhado, { borderColor: theme.colors.border || '#E0E0E0', paddingHorizontal: Math.round(theme.spacing.md * escalaFonteFiltro), paddingVertical: Math.round(theme.spacing.sm * escalaFonteFiltro), borderRadius: theme.borderRadius.md }] }>
        <Ionicons name="search-outline" size={Math.round(20 * escalaFonteFiltro)} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, layoutEmpilhado && styles.searchInputEmpilhado, { color: theme.colors.textPrimary, fontSize: Math.round(16 * escalaFonteFiltro) }]}
          placeholder="Buscar por nome, endereço ou categoria..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchText}
          onChangeText={handleSearchTextChange}
          returnKeyType="search"
          onSubmitEditing={() => realizarBusca(true)}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => handleSearchTextChange('')}>
            <Ionicons name="close-circle" size={Math.round(18 * escalaFonteFiltro)} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <Spacer size="md" />
      <FiltroCategoria categoriasSelecionadas={categoriasSelecionadas} onToggleCategoria={toggleCategoria} theme={theme} layoutEmpilhado={layoutEmpilhado} escalaFonteFiltro={escalaFonteFiltro} />
      <Spacer size="md" />
      <FiltroAcessibilidade recursosSelecionados={recursosSelecionados} onToggleRecurso={toggleRecurso} theme={theme} layoutEmpilhado={layoutEmpilhado} escalaFonteFiltro={escalaFonteFiltro} />
      <Spacer size="md" />
      <FiltroNota notaMinima={notaMinima} onNotaChange={setNotaMinima} theme={theme} layoutEmpilhado={layoutEmpilhado} escalaFonteFiltro={escalaFonteFiltro} />
      <Spacer size="md" />

      {!isDesktop && (
        <Button variant="primary" onPress={() => realizarBusca(true)} fullWidth altoContraste={isHighContrast}>
          Aplicar Filtros
        </Button>
      )}
    </>
  );

  const renderFiltrosCard = () => (
    <View
      style={[
        styles.filtrosCard,
        zoomAtivo && styles.filtrosCardZoom,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={[styles.filtrosHeader, layoutEmpilhado && styles.filtrosHeaderEmpilhado]}>
        <View style={styles.filtrosTituloContainer}>
          <Ionicons name="options-outline" size={Math.round(22 * escalaFonteFiltro)} color={theme.colors.primary} />
          <ThemedText variant="h3" weight="bold" style={[styles.filtrosTitulo, { fontSize: Math.round(18 * escalaFonteFiltro) }]}>Filtros</ThemedText>
        </View>

        <View style={styles.filtrosAcoes}>
          {temFiltrosAtivos && (
            <TouchableOpacity onPress={limparFiltros} style={[styles.limparButton, layoutEmpilhado && styles.limparButtonEmpilhado]}>
              <Ionicons name="close-circle-outline" size={Math.round(18 * escalaFonteFiltro)} color={theme.colors.error} />
              <ThemedText color="error" variant="caption" style={{ fontSize: Math.round(12 * escalaFonteFiltro) }}>Limpar</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.toggleFiltrosButton, { borderColor: theme.colors.border || '#E0E0E0', paddingHorizontal: Math.round(10 * escalaFonteFiltro), paddingVertical: Math.round(6 * escalaFonteFiltro) }]}
            onPress={() => setFiltrosAbertos(prev => !prev)}
            accessibilityRole="button"
            accessibilityLabel={filtrosAbertos ? 'Fechar filtros' : 'Abrir filtros'}
          >
            <ThemedText variant="caption" weight="semibold" color="textSecondary" style={{ fontSize: Math.round(12 * escalaFonteFiltro) }}>
              {filtrosAbertos ? 'Fechar' : 'Abrir'}
            </ThemedText>
            <Ionicons
              name={filtrosAbertos ? 'chevron-up' : 'chevron-down'}
              size={Math.round(16 * escalaFonteFiltro)}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {filtrosAbertos && (
        <>
          <Spacer size="md" />

          {usarScrollNoPainelFiltros ? (
            <View style={[styles.filtrosScrollWrapper, { maxHeight: alturaMaximaPainelFiltros }] }>
              <ScrollView
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.filtrosScrollConteudo}
              >
                {renderConteudoFiltros()}
              </ScrollView>
            </View>
          ) : (
            renderConteudoFiltros()
          )}
        </>
      )}
    </View>
  );

  const renderResultadosHeader = () => (
    <View style={[styles.resultadosHeader, layoutEmpilhado && styles.resultadosHeaderEmpilhado]}>
      <ThemedText variant="h3" weight="bold">
        {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
      </ThemedText>
      {refreshing && <ActivityIndicator size="small" color={theme.colors.primary} />}
    </View>
  );

  const renderResultados = () => (
    <View style={styles.resultadosContainer}>
      {renderResultadosHeader()}
      <Spacer size="md" />

      <FlatList
        data={resultados}
        key={layoutResultados.numColumns}
        numColumns={layoutResultados.numColumns}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={renderItem}
        columnWrapperStyle={layoutResultados.usarWrapperCentralizado ? styles.columnWrapperCentralizado : undefined}
        ListEmptyComponent={!loading && renderEmptyState}
        contentContainerStyle={[styles.resultadosListContent, { paddingHorizontal: theme.layout?.mobile?.pageHorizontal ?? 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );

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
      {!zoomAtivo && (
        <CabecalhoPagina
          titulo="Buscar Locais"
          subtitulo="Encontre e avalie locais acessíveis"
          onVoltar={handleVoltar}
          textoVoltar="Voltar"
          altoContraste={isHighContrast}
        />
      )}

      {isDesktop && !layoutEmpilhado ? (
        filtrosAbertos ? (
          <View style={styles.conteudoDesktop}>
            <View style={[styles.colunaFiltros, styles.colunaFiltrosDesktop]}>
              {renderFiltrosCard()}
            </View>

            <View style={styles.colunaResultadosDesktop}>
              {renderResultados()}
            </View>
          </View>
        ) : (
          <View style={styles.colunaResultadosDesktop}>
            <View style={styles.filtrosInlineDesktop}>
              {renderFiltrosCard()}
            </View>
            {renderResultados()}
          </View>
        )
      ) : (
        <FlatList
          data={resultados}
          key={layoutResultados.numColumns}
          numColumns={layoutResultados.numColumns}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderItem}
          columnWrapperStyle={layoutResultados.usarWrapperCentralizado ? styles.columnWrapperCentralizado : undefined}
          ListHeaderComponent={
            <View style={styles.conteudoMobile}>
              {renderFiltrosCard()}

              {renderResultadosHeader()}
              <Spacer size="md" />
            </View>
          }
          ListEmptyComponent={!loading && renderEmptyState}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: theme.layout?.mobile?.pageHorizontal ?? 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  conteudoMobile: {
    marginBottom: 16,
  },
  conteudoDesktop: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  conteudoDesktopEmpilhado: {
    flexDirection: 'column',
  },
  conteudoDesktopEmpilhadoCompleto: {
    flex: 1,
    flexDirection: 'column',
  },
  colunaFiltros: {
    flex: 1,
    minWidth: 280,
  },
  colunaFiltrosDesktop: {
    maxWidth: 320,
  },
  colunaFiltrosDesktopEmpilhado: {
    maxWidth: '100%',
  },
  colunaResultadosDesktop: {
    flex: 1,
    minWidth: 0,
  },
  filtrosInlineDesktop: {
    marginBottom: 12,
  },
  resultadosContainer: {
    flex: 1,
    minWidth: 0,
  },
  resultadosListContent: {
    paddingBottom: 32,
  },
  colunaResultados: {
    flex: 3,
    minWidth: 280,
  },
  filtrosCard: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filtrosCardZoom: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1040,
  },
  filtrosScrollWrapper: {
    width: '100%',
  },
  filtrosScrollConteudo: {
    paddingBottom: 8,
  },
  filtrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filtrosHeaderEmpilhado: {
    alignItems: 'flex-start',
    gap: 10,
  },
  filtrosTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  filtrosTitulo: {
    fontSize: 18,
  },
  filtrosAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  limparButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  limparButtonEmpilhado: {
    marginLeft: 0,
  },
  toggleFiltrosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchContainerEmpilhado: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  searchInputEmpilhado: {
    minWidth: 220,
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
  filtroContentEmpilhado: {
    paddingLeft: 0,
  },
  filtroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  filtroItemEmpilhado: {
    alignItems: 'flex-start',
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
  notaSliderContainerEmpilhado: {
    justifyContent: 'flex-start',
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
  resultadosHeaderEmpilhado: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    minWidth: 0,
    width: '100%',
  },
  cardWrapperCentralizado: {
    alignSelf: 'center',
  },
  columnWrapperCentralizado: {
    justifyContent: 'center',
    gap: 12,
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