
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  CabecalhoPagina,
  Card,
  Button,
  Select,
  Input
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { Container } from '../../components/layout';
import LocalCard from '../../components/ui/LocalCard';

import { useThemeContext } from '../../context/ThemeContext';
import LocalService from '../../services/LocalService';
import { breakpoints, getTheme } from '../../config/theme';
import { CATEGORIAS } from '../../constants/enums';
import toastHelper from '../../utils/toastHelper';

// Adicione após os imports
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

// Adicione após CATEGORIAS_LABELS
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

// Adicione o componente FiltroAcessibilidade
const FiltroAcessibilidade = ({ recursosSelecionados, onToggleRecurso, theme }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity 
        style={styles.filtroHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="accessibility-outline" size={20} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={styles.filtroTitulo}>Acessibilidade</ThemedText>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={theme.colors.textSecondary} 
        />
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
              <View style={[
                styles.checkbox,
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
              <Ionicons name={recurso.icon} size={16} color={theme.colors.primary} style={styles.filtroIcon} />
              <ThemedText style={styles.filtroItemLabel}>{recurso.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Adicione o componente FiltroCategoria antes do componente principal
const FiltroCategoria = ({ categoriasSelecionadas, onToggleCategoria, theme }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity 
        style={styles.filtroHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="grid-outline" size={20} color={theme.colors.primary} />
        <ThemedText weight="semibold" style={styles.filtroTitulo}>Categoria</ThemedText>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={theme.colors.textSecondary} 
        />
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
              <View style={[
                styles.checkbox,
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
              <ThemedText style={styles.filtroItemLabel}>
                {CATEGORIAS_LABELS[categoria] || categoria}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function Buscar({ onNavigate }) {
  const { isHighContrast, theme: t } = useThemeContext();
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalResultados, setTotalResultados] = useState(0);

  const realizarBusca = useCallback(async () => {
    setLoading(true);
    try {
      // Mock para desenvolvimento
      const mockResultados = [
        {
          id: 1,
          nome: 'Shopping Center Norte',
          categoria: 'COMERCIAL',
          avaliacaoMedia: 4.5,
          totalAvaliacoes: 23,
          endereco: { logradouro: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
          tiposAcessibilidade: ['RAMPA', 'ELEVADOR', 'ESTACIONAMENTO'],
        },
        {
          id: 2,
          nome: 'Hospital das Clínicas',
          categoria: 'SAUDE',
          avaliacaoMedia: 4.8,
          totalAvaliacoes: 45,
          endereco: { logradouro: 'Rua Dr. Enéas', numero: '255', bairro: 'Cerqueira César', cidade: 'São Paulo', estado: 'SP' },
          tiposAcessibilidade: ['RAMPA', 'ELEVADOR', 'PISO_TATIL', 'ATENDIMENTO_ESPECIALIZADO'],
        },
        {
          id: 3,
          nome: 'Biblioteca Municipal',
          categoria: 'PUBLICO',
          avaliacaoMedia: 3.2,
          totalAvaliacoes: 12,
          endereco: { logradouro: 'Rua da Consolação', numero: '94', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
          tiposAcessibilidade: ['RAMPA', 'ELEVADOR', 'BANHEIRO_ADAPTADO', 'PISO_TATIL', 'ESPACO_AMPLO'],
        },
      ];
      
      let filtrados = mockResultados;
      
      if (searchText) {
        filtrados = filtrados.filter(l => 
          l.nome.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      setResultados(filtrados);
      setTotalResultados(filtrados.length);
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      toastHelper.showError('Erro ao buscar locais');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      realizarBusca();
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [searchText, realizarBusca]);

  const handleLocalPress = (local) => {
    onNavigate?.('LocalDetalhes', { id: local.id });
  };

  // Adicione o componente FiltroNota
const FiltroNota = ({ notaMinima, onNotaChange, theme }) => {
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
    <View style={styles.filtroGrupo}>
      <View style={styles.filtroHeader}>
        <Ionicons name="star-outline" size={20} color={theme.colors.warning} />
        <ThemedText weight="semibold" style={styles.filtroTitulo}>Nota Mínima</ThemedText>
      </View>
      
      <View style={styles.filtroContent}>
        <View style={styles.notaContainer}>
          <View style={styles.notaStars}>
            {renderStars(notaMinima)}
          </View>
          <ThemedText weight="bold" style={styles.notaValor}>
            {notaMinima === 0 ? 'Qualquer nota' : `${notaMinima}+ estrelas`}
          </ThemedText>
        </View>
        
        <View style={styles.notaSliderContainer}>
          {[0, 1, 2, 3, 4, 4.5].map(nota => (
            <TouchableOpacity
              key={nota}
              style={[
                styles.notaBotao,
                notaMinima === nota && styles.notaBotaoAtivo,
                { borderColor: theme.colors.primary }
              ]}
              onPress={() => onNotaChange(nota)}
            >
              <ThemedText 
                style={[
                  styles.notaBotaoTexto,
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={theme.colors.textTertiary} />
      <ThemedText variant="h3" weight="bold" align="center">
        Nenhum local encontrado
      </ThemedText>
      <Spacer size="sm" />
      <ThemedText color="textSecondary" align="center">
        Tente ajustar os filtros ou buscar por outro termo
      </ThemedText>
    </View>
  );

  if (loading && resultados.length === 0) {
    return (
      <View style={styles.loadingContainer}>
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
        altoContraste={isHighContrast}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => realizarBusca()}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.conteudo}>
          {/* Coluna de Filtros */}
          <View style={[
            styles.colunaFiltros,
            isDesktop && styles.colunaFiltrosDesktop
          ]}>
            <View style={[styles.filtrosCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.filtrosHeader}>
                <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
                <ThemedText variant="h3" weight="bold" style={styles.filtrosTitulo}>
                  Filtros
                </ThemedText>
              </View>

              <Spacer size="md" />

              {/* Campo de busca por texto */}
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.colors.textPrimary }]}
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

              <ThemedText color="textSecondary" align="center">
                Mais filtros em breve...
              </ThemedText>
            </View>
          </View>

          {/* Coluna de Resultados */}
          <View style={styles.colunaResultados}>
            <View style={styles.resultadosHeader}>
              <ThemedText variant="h3" weight="bold">
                {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
              </ThemedText>
            </View>

            <Spacer size="md" />

            {resultados.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.resultadosLista}>
                {resultados.map((item) => (
                  <LocalCard
                    key={item.id}
                    local={item}
                    onPress={() => handleLocalPress(item)}
                    altoContraste={isHighContrast}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        <Spacer size="xl" />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  resultadosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultadosLista: {
    gap: 16,
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