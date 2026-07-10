import React, { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  CabecalhoPagina,
  Botao,
  Card
} from '../../components/ui';
import { TextoTematizado, Espacador } from '../../components/commons';
import { Recipiente } from '../../components/layout';
import CartaoLocal from '../../components/ui/CartaoLocal';
import { useThemeContext } from '../../context/ThemeContext';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import AssistenteVoz from '../../services/acessibilidade/AssistenteVoz';
import ServicoVoz from '../../services/acessibilidade/ServicoVoz';
import ServicoBusca from '../../services/ServicoBusca';
import { getTheme } from '../../config/theme';
import { CATEGORIAS } from '../../constants/enums';
import { CATEGORIAS_LABELS, obterCategoriaIcone, obterCategoriaLabel } from '../../config/categoriasConfig';
import toastHelper from '../../utils/toastHelper';

const RECURSOS_ACESSIBILIDADE = [
  { id: 'RAMPA', label: 'Rampa', icon: 'walk-outline' },
  { id: 'ELEVADOR', label: 'Elevador', icon: 'arrow-up-outline' },
  { id: 'BANHEIRO_ADAPTADO', label: 'Banheiro adaptado', icon: 'body-outline' },
  { id: 'ESTACIONAMENTO', label: 'Estacionamento', icon: 'car-outline' },
  { id: 'PISO_TATIL', label: 'Piso tátil', icon: 'eye-outline' },
  { id: 'ATENDIMENTO_ESPECIALIZADO', label: 'Atendimento especializado', icon: 'hand-left-outline' },
  { id: 'RECURSOS_AUDIOVISUAIS', label: 'Recursos audiovisuais', icon: 'mic-outline' },
  { id: 'SINALIZACAO_BRAILLE', label: 'Sinalização em Braille', icon: 'braille-outline' },
  { id: 'ESPACO_AMPLO', label: 'Espaço amplo', icon: 'resize-outline' },
  { id: 'MOBILIARIO_ADAPTADO', label: 'Mobiliário adaptado', icon: 'grid-outline' },
];

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1200,
  DESKTOP: 1400,
};

const SearchInput = React.memo(({ value = '', onSearch, theme, voiceEnabled, escalaFiltro = 1, loading = false }) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);
  const hasAnnounced = useRef(false);
  const previousValue = useRef(value);
  const tamanhoIcone = Math.round(20 * escalaFiltro);
  const tamanhoFonte = Math.round(16 * escalaFiltro);

  useEffect(() => {
    setLocalValue(value);
    previousValue.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChange = useCallback((newValue) => {
    setLocalValue(newValue);

    if (newValue === previousValue.current) return;
    previousValue.current = newValue;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(newValue);
      debounceTimer.current = null;
    }, 200);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    handleChange('');
    inputRef.current?.focus();
  }, [handleChange]);

  const handleSubmitEditing = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    onSearch(localValue);
  }, [onSearch, localValue]);

  const anunciarPlaceholder = useCallback(() => {
    if (voiceEnabled && !hasAnnounced.current) {
      ServicoVoz.speak('Campo de busca. Digite nome, endereço ou categoria do local.');
      hasAnnounced.current = true;
    }
  }, [voiceEnabled]);

  useEffect(() => {
    return () => {
      hasAnnounced.current = false;
    };
  }, []);

  const showClearButton = localValue.length > 0 && !loading;

  return (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: Math.round(12 * escalaFiltro),
          paddingHorizontal: Math.round(14 * escalaFiltro),
          paddingVertical: Math.round(12 * escalaFiltro),
          gap: Math.max(8, Math.round(8 * escalaFiltro)),
        },
      ]}
    >
      <Ionicons name="search-outline" size={tamanhoIcone} color={theme.colors.textSecondary} />
      <TextInput
        ref={inputRef}
        style={[
          styles.searchInput, 
          { 
            color: theme.colors.textPrimary, 
            fontSize: tamanhoFonte,
            outlineStyle: 'none',
            borderWidth: 0,
            borderColor: 'transparent',
          }
        ]}
        placeholder="Buscar locais por nome, endereço ou categoria"
        placeholderTextColor={theme.colors.textTertiary}
        value={localValue}
        onChangeText={handleChange}
        returnKeyType="search"
        onSubmitEditing={handleSubmitEditing}
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={false}
        accessibilityLabel="Campo de busca"
        accessibilityHint="Digite o nome, endereço ou categoria do local que deseja encontrar"
        onFocus={anunciarPlaceholder}
      />
      {loading && (
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingIcon} />
      )}
      {showClearButton && (
        <TouchableOpacity 
          onPress={handleClear}
          accessibilityLabel="Limpar busca"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={Math.round(18 * escalaFiltro)} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchInput.displayName = 'SearchInput';

const FiltroCategoria = React.memo(({ categoriasSelecionadas, onToggleCategoria, theme, isDesktop, voiceEnabled, escalaFiltro = 1 }) => {
  const [expanded, setExpanded] = useState(true);
  const [voiceFeedbackGiven, setVoiceFeedbackGiven] = useState(false);

  const toggleExpand = useCallback(() => {
    const novoEstado = !expanded;
    setExpanded(novoEstado);
    if (voiceEnabled) {
      ServicoVoz.speak(novoEstado ? 'Expandindo filtro de categoria' : 'Recolhendo filtro de categoria');
    }
  }, [expanded, voiceEnabled]);

  const anunciarCategorias = useCallback(() => {
    if (!voiceEnabled) return;
    const selecionadas = categoriasSelecionadas.map((c) => obterCategoriaLabel(c)).join(', ');
    ServicoVoz.speak(
      `Filtro de categoria. ${categoriasSelecionadas.length > 0 
        ? `Categorias selecionadas: ${selecionadas}. ` 
        : 'Nenhuma categoria selecionada. '}
      Você tem as seguintes opções: ${CATEGORIAS.map((c) => obterCategoriaLabel(c)).join(', ')}.`
    );
  }, [voiceEnabled, categoriasSelecionadas]);

  useEffect(() => {
    if (voiceEnabled && expanded && !voiceFeedbackGiven) {
      anunciarCategorias();
      setVoiceFeedbackGiven(true);
    }
  }, [voiceEnabled, expanded, anunciarCategorias, voiceFeedbackGiven]);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity 
        style={[styles.filtroHeader, { gap: Math.max(10, Math.round(10 * escalaFiltro)), paddingVertical: Math.round(8 * escalaFiltro) }]} 
        onPress={toggleExpand} 
        activeOpacity={0.7}
        accessibilityLabel="Filtro por categoria"
        accessibilityRole="button"
        accessibilityHint={expanded ? 'Recolher categorias' : 'Expandir categorias'}
      >
        <Ionicons name="grid-outline" size={Math.round(20 * escalaFiltro)} color={theme.colors.primary} />
        <TextoTematizado weight="semibold" style={[styles.filtroTitulo, { fontSize: Math.round(15 * escalaFiltro) }]}>Categoria</TextoTematizado>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={Math.round(18 * escalaFiltro)} color={theme.colors.textSecondary} />
        {voiceEnabled && (
          <TouchableOpacity onPress={anunciarCategorias} style={styles.voiceIcon}>
            <Ionicons name="volume-medium-outline" size={Math.round(16 * escalaFiltro)} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={[styles.filtroContent, { paddingLeft: Math.round(30 * escalaFiltro), paddingTop: Math.round(8 * escalaFiltro), gap: Math.max(8, Math.round(8 * escalaFiltro)) }]}>
          {CATEGORIAS.map(categoria => {
            const selecionada = categoriasSelecionadas.includes(categoria);
            return (
              <TouchableOpacity 
                key={categoria} 
                style={[styles.filtroItem, { gap: Math.max(10, Math.round(10 * escalaFiltro)), paddingVertical: Math.round(6 * escalaFiltro) }]} 
                onPress={() => onToggleCategoria(categoria)} 
                activeOpacity={0.7}
                accessibilityLabel={`${obterCategoriaLabel(categoria)} ${selecionada ? 'selecionada' : 'não selecionada'}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selecionada }}
              >
                <View style={[styles.checkbox, {
                  borderColor: theme.colors.primary,
                  backgroundColor: selecionada ? theme.colors.primary : 'transparent',
                  width: Math.round(20 * escalaFiltro),
                  height: Math.round(20 * escalaFiltro),
                  borderRadius: Math.round(6 * escalaFiltro)
                }]}>
                  {selecionada && <Ionicons name="checkmark" size={Math.round(12 * escalaFiltro)} color="#FFF" />}
                </View>
                <Ionicons
                  name={obterCategoriaIcone(categoria)}
                  size={Math.round((isDesktop ? 14 : 16) * escalaFiltro)}
                  color={theme.colors.primary}
                  style={styles.filtroIcon}
                />
                <TextoTematizado style={[styles.filtroItemLabel, { fontSize: Math.round((isDesktop ? 13 : 14) * escalaFiltro) }]}>
                  {obterCategoriaLabel(categoria)}
                </TextoTematizado>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

FiltroCategoria.displayName = 'FiltroCategoria';

const FiltroAcessibilidade = React.memo(({ recursosSelecionados, onToggleRecurso, theme, isDesktop, voiceEnabled, escalaFiltro = 1 }) => {
  const [expanded, setExpanded] = useState(true);
  const [voiceFeedbackGiven, setVoiceFeedbackGiven] = useState(false);

  const toggleExpand = useCallback(() => {
    const novoEstado = !expanded;
    setExpanded(novoEstado);
    if (voiceEnabled) {
      ServicoVoz.speak(novoEstado ? 'Expandindo filtro de acessibilidade' : 'Recolhendo filtro de acessibilidade');
    }
  }, [expanded, voiceEnabled]);

  const anunciarRecursos = useCallback(() => {
    if (!voiceEnabled) return;
    const selecionados = recursosSelecionados.map(r => {
      const recurso = RECURSOS_ACESSIBILIDADE.find(rec => rec.id === r);
      return recurso?.label || r;
    }).join(', ');
    
    ServicoVoz.speak(
      `Filtro de recursos de acessibilidade. ${recursosSelecionados.length > 0 
        ? `Recursos selecionados: ${selecionados}. ` 
        : 'Nenhum recurso selecionado. '}
      Você pode selecionar: rampa, elevador, banheiro adaptado, estacionamento, piso tátil, atendimento especializado, recursos audiovisuais, sinalização em Braille, espaço amplo ou mobiliário adaptado.`
    );
  }, [voiceEnabled, recursosSelecionados]);

  useEffect(() => {
    if (voiceEnabled && expanded && !voiceFeedbackGiven) {
      anunciarRecursos();
      setVoiceFeedbackGiven(true);
    }
  }, [voiceEnabled, expanded, anunciarRecursos, voiceFeedbackGiven]);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity 
        style={[styles.filtroHeader, { gap: Math.max(10, Math.round(10 * escalaFiltro)), paddingVertical: Math.round(8 * escalaFiltro) }]} 
        onPress={toggleExpand} 
        activeOpacity={0.7}
        accessibilityLabel="Filtro por recursos de acessibilidade"
        accessibilityRole="button"
      >
        <Ionicons name="accessibility-outline" size={Math.round(20 * escalaFiltro)} color={theme.colors.primary} />
        <TextoTematizado weight="semibold" style={[styles.filtroTitulo, { fontSize: Math.round(15 * escalaFiltro) }]}>Acessibilidade</TextoTematizado>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={Math.round(18 * escalaFiltro)} color={theme.colors.textSecondary} />
        {voiceEnabled && (
          <TouchableOpacity onPress={anunciarRecursos} style={styles.voiceIcon}>
            <Ionicons name="volume-medium-outline" size={Math.round(16 * escalaFiltro)} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={[styles.filtroContent, { paddingLeft: Math.round(30 * escalaFiltro), paddingTop: Math.round(8 * escalaFiltro), gap: Math.max(8, Math.round(8 * escalaFiltro)) }]}>
          {RECURSOS_ACESSIBILIDADE.map(recurso => {
            const selecionado = recursosSelecionados.includes(recurso.id);
            return (
              <TouchableOpacity 
                key={recurso.id} 
                style={[styles.filtroItem, { gap: Math.max(10, Math.round(10 * escalaFiltro)), paddingVertical: Math.round(6 * escalaFiltro) }]} 
                onPress={() => onToggleRecurso(recurso.id)} 
                activeOpacity={0.7}
                accessibilityLabel={`${recurso.label} ${selecionado ? 'selecionado' : 'não selecionado'}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selecionado }}
              >
                <View style={[styles.checkbox, {
                  borderColor: theme.colors.primary,
                  backgroundColor: selecionado ? theme.colors.primary : 'transparent',
                  width: Math.round(20 * escalaFiltro),
                  height: Math.round(20 * escalaFiltro),
                  borderRadius: Math.round(6 * escalaFiltro)
                }]}>
                  {selecionado && <Ionicons name="checkmark" size={Math.round(12 * escalaFiltro)} color="#FFF" />}
                </View>
                <Ionicons name={recurso.icon} size={Math.round((isDesktop ? 14 : 16) * escalaFiltro)} color={theme.colors.primary} style={styles.filtroIcon} />
                <TextoTematizado style={[styles.filtroItemLabel, { fontSize: Math.round((isDesktop ? 13 : 14) * escalaFiltro) }]}>{recurso.label}</TextoTematizado>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

FiltroAcessibilidade.displayName = 'FiltroAcessibilidade';

const FiltroNota = React.memo(({ notaMinima, onNotaChange, theme, isDesktop, voiceEnabled, escalaFiltro = 1, isHighContrast = false }) => {
  const renderStars = useCallback((nota) => {
    const stars = [];
    const starSize = Math.round((isDesktop ? 16 : 20) * escalaFiltro);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name={i <= nota ? 'star' : 'star-outline'} 
          size={starSize} 
          color={i <= nota ? theme.colors.warning : theme.colors.textTertiary} 
        />
      );
    }
    return stars;
  }, [theme.colors.warning, theme.colors.textTertiary, isDesktop, escalaFiltro]);

  const anunciarNota = useCallback(() => {
    if (!voiceEnabled) return;
    ServicoVoz.speak(
      `Filtro por nota mínima. ${notaMinima === 0 ? 'Qualquer nota' : `${notaMinima} estrelas ou mais`}. ` +
      `Opções disponíveis: qualquer, uma, duas, três, quatro, quatro e meia estrelas.`
    );
  }, [voiceEnabled, notaMinima]);

  const handleNotaChange = useCallback((nota) => {
    onNotaChange(nota);
    if (voiceEnabled) {
      ServicoVoz.speak(nota === 0 ? 'Filtrando qualquer nota' : `Filtrando ${nota} estrelas ou mais`);
    }
  }, [onNotaChange, voiceEnabled]);

  return (
    <View style={styles.filtroGrupo}>
      <TouchableOpacity 
        style={[styles.filtroHeader, { gap: Math.max(10, Math.round(10 * escalaFiltro)), paddingVertical: Math.round(8 * escalaFiltro) }]} 
        onPress={anunciarNota}
        activeOpacity={0.7}
        accessibilityLabel="Filtro por nota mínima"
        accessibilityRole="button"
      >
        <Ionicons name="star-outline" size={Math.round(20 * escalaFiltro)} color={theme.colors.warning} />
        <TextoTematizado weight="semibold" style={[styles.filtroTitulo, { fontSize: Math.round(15 * escalaFiltro) }]}>Nota Mínima</TextoTematizado>
        {voiceEnabled && (
          <Ionicons name="volume-medium-outline" size={Math.round(16 * escalaFiltro)} color={theme.colors.primary} style={styles.voiceIcon} />
        )}
      </TouchableOpacity>
      
      <View style={[styles.filtroContent, { paddingLeft: Math.round(30 * escalaFiltro), paddingTop: Math.round(8 * escalaFiltro), gap: Math.max(8, Math.round(8 * escalaFiltro)) }]}>
        <View style={[styles.notaContainer, { gap: Math.max(8, Math.round(8 * escalaFiltro)), marginBottom: Math.round(12 * escalaFiltro) }]}>
          <View style={styles.notaStars}>{renderStars(notaMinima)}</View>
          <TextoTematizado weight="bold" style={[styles.notaValor, { fontSize: Math.round((isDesktop ? 13 : 14) * escalaFiltro) }]}>
            {notaMinima === 0 ? 'Qualquer nota' : `${notaMinima}+ estrelas`}
          </TextoTematizado>
        </View>
        
        <View style={[styles.notaSliderContainer, { gap: Math.max(8, Math.round(8 * escalaFiltro)) }]}>
          {[0, 1, 2, 3, 4, 4.5].map(nota => (
            <TouchableOpacity 
              key={nota} 
              style={[
                styles.notaBotao,
                notaMinima === nota && {
                  backgroundColor: isHighContrast ? theme.colors.primary : '#E8F0FF',
                  borderColor: theme.colors.primary,
                },
                {
                  borderColor: theme.colors.primary,
                  paddingHorizontal: Math.round(12 * escalaFiltro),
                  paddingVertical: Math.round(6 * escalaFiltro),
                  borderRadius: Math.round(20 * escalaFiltro),
                }
              ]} 
              onPress={() => handleNotaChange(nota)}
              accessibilityLabel={`${nota === 0 ? 'Qualquer nota' : `${nota} estrelas ou mais`}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: notaMinima === nota }}
            >
              <TextoTematizado style={[
                styles.notaBotaoTexto,
                notaMinima === nota && {
                  color: isHighContrast ? (theme.colors.textOnPrimary || '#FFFFFF') : theme.colors.primary,
                  fontWeight: 'bold'
                },
                { fontSize: Math.round((isDesktop ? 11 : 12) * escalaFiltro) }
              ]}>
                {nota === 0 ? 'Qualquer' : `${nota}+`}
              </TextoTematizado>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

FiltroNota.displayName = 'FiltroNota';

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
  isHighContrast,
  voiceEnabled,
  fontSizeMultiplier,
  filtrosVisiveis,
  onToggleFiltros,
  ocuparLarguraTotal = false,
  searchText = '',
  loading = false
}) => {
  const escalaFiltro = Math.max(1, Number(fontSizeMultiplier) || 1);
  const tamanhoIconeHeader = Math.round(22 * escalaFiltro);
  const tamanhoFonteTitulo = Math.round(18 * escalaFiltro);
  const espacamentoBloco = Math.round(12 * escalaFiltro);

  const anunciarFiltros = useCallback(() => {
    if (!voiceEnabled) return;
    ServicoVoz.speak(
      `Painel de filtros. ${temFiltrosAtivos ? 'Você tem filtros ativos.' : 'Nenhum filtro ativo.'} ` +
      `Toque em cada seção para expandir e selecionar opções. Use o botão limpar para remover todos os filtros.`
    );
  }, [voiceEnabled, temFiltrosAtivos]);

  return (
    <Card
      variant="outlined"
      style={[
        styles.filtrosCard,
        {
          padding: Math.round(16 * escalaFiltro),
          borderRadius: Math.round(14 * escalaFiltro),
          marginTop: Math.round(8 * escalaFiltro),
          marginHorizontal: ocuparLarguraTotal ? 0 : (isDesktop ? 12 : 0),
        },
      ]}
      altoContraste={isHighContrast}
    >
      <View
        style={[styles.filtrosHeader, { gap: Math.max(10, Math.round(10 * escalaFiltro)), minHeight: Math.round(44 * escalaFiltro) }]}
      >
        <TouchableOpacity
          onPress={onToggleFiltros}
          activeOpacity={0.75}
          style={styles.filtrosHeaderToggle}
          accessibilityRole="button"
          accessibilityLabel={filtrosVisiveis ? 'Recolher painel de filtros' : 'Expandir painel de filtros'}
        >
          <Ionicons name="options-outline" size={tamanhoIconeHeader} color={theme.colors.primary} />
          <TextoTematizado variant="h3" weight="bold" style={[styles.filtrosTitulo, { fontSize: tamanhoFonteTitulo }]}>Filtros</TextoTematizado>
          <Ionicons
            name={filtrosVisiveis ? 'chevron-up' : 'chevron-down'}
            size={Math.round(20 * escalaFiltro)}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
        {voiceEnabled && (
          <TouchableOpacity
            onPress={(event) => {
              anunciarFiltros();
            }}
            style={styles.voiceIcon}
          >
            <Ionicons name="volume-medium-outline" size={Math.round(18 * escalaFiltro)} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {temFiltrosAtivos && (
          <TouchableOpacity 
            onPress={(event) => {
              onLimparFiltros();
            }} 
            style={styles.limparButton}
            accessibilityLabel="Limpar todos os filtros"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle-outline" size={Math.round(18 * escalaFiltro)} color={theme.colors.error} />
            <TextoTematizado color="error" variant="caption" style={{ fontSize: Math.round(12 * escalaFiltro) }}>Limpar</TextoTematizado>
          </TouchableOpacity>
        )}
      </View>

      {filtrosVisiveis && (
        <View style={styles.filtrosConteudo}>
          <View style={{ height: espacamentoBloco }} />

          <SearchInput 
            value={searchText}
            onSearch={onSearchChange}
            theme={theme}
            voiceEnabled={voiceEnabled}
            escalaFiltro={escalaFiltro}
            loading={loading}
          />

          <View style={{ height: espacamentoBloco }} />
          <FiltroCategoria 
            categoriasSelecionadas={categoriasSelecionadas} 
            onToggleCategoria={onToggleCategoria} 
            theme={theme} 
            isDesktop={isDesktop} 
            voiceEnabled={voiceEnabled}
            escalaFiltro={escalaFiltro}
          />
          <View style={{ height: espacamentoBloco }} />
          <FiltroAcessibilidade 
            recursosSelecionados={recursosSelecionados} 
            onToggleRecurso={onToggleRecurso} 
            theme={theme} 
            isDesktop={isDesktop} 
            voiceEnabled={voiceEnabled}
            escalaFiltro={escalaFiltro}
          />
          <View style={{ height: espacamentoBloco }} />
          <FiltroNota 
            notaMinima={notaMinima} 
            onNotaChange={onNotaChange} 
            theme={theme} 
            isDesktop={isDesktop} 
            voiceEnabled={voiceEnabled}
            escalaFiltro={escalaFiltro}
            isHighContrast={isHighContrast}
          />

          {!isDesktop && (
            <>
              <View style={{ height: espacamentoBloco }} />
              <Botao 
                variant="primary" 
                onPress={onAplicarFiltros} 
                fullWidth 
                altoContraste={isHighContrast}
                accessibilityLabel="Aplicar filtros selecionados"
                accessibilityHint="Aplica os filtros escolhidos na busca"
              >
                Aplicar Filtros
              </Botao>
            </>
          )}
        </View>
      )}
    </Card>
  );
});

FiltrosCard.displayName = 'FiltrosCard';

export default function Buscar({ onNavigate }) {
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const { enabled: voiceEnabled } = useContext(AccessibilityContext);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const escalaZoom = useMemo(() => Math.max(1, Number(fontSizeMultiplier) || 1), [fontSizeMultiplier]);

  const larguraViewport = useMemo(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return Math.round(window.visualViewport?.width || window.innerWidth || width);
    }
    return width;
  }, [width]);

  const theme = getTheme(isHighContrast, fontSizeMultiplier);
  const zoomAplicado = escalaZoom >= 1.5;
  
  const isDesktop = larguraViewport >= BREAKPOINTS.TABLET;
  const isTablet = larguraViewport >= BREAKPOINTS.MOBILE && larguraViewport < BREAKPOINTS.TABLET;
  const usarLayoutEmpilhado = isDesktop && zoomAplicado;
  const mostrarCabecalhoTexto = isDesktop;
  const paddingInferiorLista = isDesktop && !usarLayoutEmpilhado ? 32 : 28 + Math.max(insets.bottom, 8);
  const [searchText, setSearchText] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [recursosSelecionados, setRecursosSelecionados] = useState([]);
  const [notaMinima, setNotaMinima] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalResultados, setTotalResultados] = useState(0);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [voiceFeedbackGiven, setVoiceFeedbackGiven] = useState(false);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(true);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const realizarBusca = useCallback(async () => {
    try {
      const filtros = {
        searchText: searchText.trim() || null,
        categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : null,
        recursos: recursosSelecionados.length > 0 ? recursosSelecionados : null,
        notaMinima: notaMinima > 0 ? notaMinima : null
      };
      
      const response = await ServicoBusca.buscarLocais(filtros);
      
      if (response.success && response.data) {
        const locais = response.data.map(local => ({
          ...local,
          isMaisRecente: local.isMaisRecente || false
        }));
        setResultados(locais);
        setTotalResultados(response.total);
      } else {
        setResultados([]);
        setTotalResultados(0);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
      setTotalResultados(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
    setLoading(true);
  }, []);

  useEffect(() => {
    if (carregandoInicial) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      realizarBusca();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [categoriasSelecionadas, recursosSelecionados, notaMinima, searchText, carregandoInicial, realizarBusca]);

  const limparFiltros = useCallback(() => {
    setSearchText('');
    setCategoriasSelecionadas([]);
    setRecursosSelecionados([]);
    setNotaMinima(0);
    setLoading(true);
    if (voiceEnabled) ServicoVoz.speak('Todos os filtros foram limpos');
  }, [voiceEnabled]);

  const aplicarFiltros = useCallback(() => {
    setLoading(true);
    realizarBusca();
    if (voiceEnabled) ServicoVoz.speak('Aplicando filtros');
  }, [realizarBusca, voiceEnabled]);

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

  const handleLocalPress = useCallback((local) => {
    const localId = local?.id || local?.idLocal;
    if (localId) {
      if (voiceEnabled) ServicoVoz.speak(`Abrindo detalhes de ${local.nome}`);
      onNavigate?.('LocalDetalhes', { id: localId });
    } else {
      toastHelper.showError('Erro ao abrir local');
      if (voiceEnabled) ServicoVoz.speak('Erro ao abrir detalhes do local');
    }
  }, [onNavigate, voiceEnabled]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (voiceEnabled) ServicoVoz.speak('Atualizando busca');
    ServicoBusca.invalidateCache();
    ServicoBusca.carregarTodosLocais(true).finally(() => {
      realizarBusca();
    });
  }, [realizarBusca, voiceEnabled]);

  const alternarVisibilidadeFiltros = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 240,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });

    setFiltrosVisiveis((anterior) => {
      const proximo = !anterior;
      if (voiceEnabled) {
        ServicoVoz.speak(proximo ? 'Painel de filtros expandido' : 'Painel de filtros recolhido');
      }
      return proximo;
    });
  }, [voiceEnabled]);

  const carregarDadosIniciais = useCallback(async () => {
    setCarregandoInicial(true);
    try {
      await ServicoBusca.carregarTodosLocais();
      await realizarBusca();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toastHelper.showError('Erro ao carregar locais');
    } finally {
      setCarregandoInicial(false);
      setLoading(false);
    }
  }, [realizarBusca]);

  const anunciarBusca = useCallback(() => {
    if (!voiceEnabled) return;
    
    ServicoVoz.speak(
      `Tela de busca de locais. ${totalResultados > 0 
        ? `Encontramos ${totalResultados} ${totalResultados === 1 ? 'local' : 'locais'}. ` 
        : 'Nenhum local encontrado. '}
      Utilize os filtros para refinar sua busca. Diga ajuda para ouvir os comandos disponíveis.`
    );
  }, [voiceEnabled, totalResultados]);

  const anunciarResultados = useCallback(() => {
    if (!voiceEnabled) return;
    
    if (totalResultados === 0) {
      ServicoVoz.speak('Nenhum resultado encontrado para sua busca. Tente usar outros filtros.');
    } else {
      const primeirosLocais = resultados.slice(0, 3).map(l => l.nome).join(', ');
      ServicoVoz.speak(
        `Total de ${totalResultados} ${totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}. ` +
        `${resultados.length > 0 ? `Primeiros resultados: ${primeirosLocais}. ` : ''}` +
        `Toque em qualquer card para ver os detalhes do local.`
      );
    }
  }, [voiceEnabled, totalResultados, resultados]);
  
  const temFiltrosAtivos = useMemo(() => {
    return searchText.trim() !== '' || 
           categoriasSelecionadas.length > 0 || 
           recursosSelecionados.length > 0 || 
           notaMinima > 0;
  }, [searchText, categoriasSelecionadas, recursosSelecionados, notaMinima]);

  const numColumns = useMemo(() => {
    if (zoomAplicado) return 1;
    if (isDesktop) return 2;
    if (isTablet) return 2;
    return 1;
  }, [zoomAplicado, isDesktop, isTablet]);

  const cardCompact = useMemo(() => isDesktop && !zoomAplicado, [isDesktop, zoomAplicado]);

  const larguraColunaFiltros = useMemo(() => {
    const larguraBase = 320;
    const incrementoZoom = (escalaZoom - 1) * 120;
    return Math.min(460, Math.max(320, Math.round(larguraBase + incrementoZoom)));
  }, [escalaZoom]);

  useEffect(() => {
    if (voiceEnabled) {
      AssistenteVoz.updateContext({
        screen: 'Buscar',
        totalResultados: totalResultados,
        resultados: resultados,
        temFiltrosAtivos: temFiltrosAtivos,
        filtrosAtuais: {
          searchText: searchText,
          categorias: categoriasSelecionadas.map(c => CATEGORIAS_LABELS[c] || c),
          recursos: recursosSelecionados,
          notaMinima: notaMinima
        },
        onLimparFiltros: limparFiltros,
        onAplicarFiltros: aplicarFiltros,
        onBuscarPorNome: (nome) => {
          setSearchText(nome);
          setLoading(true);
        }
      });
    }
  }, [voiceEnabled, totalResultados, resultados, temFiltrosAtivos, searchText, 
      categoriasSelecionadas, recursosSelecionados, notaMinima, limparFiltros, aplicarFiltros]);

  
  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  useEffect(() => {
    if (!carregandoInicial && !loading && voiceEnabled && !voiceFeedbackGiven) {
      anunciarBusca();
      if (totalResultados > 0) {
        anunciarResultados();
      }
      setVoiceFeedbackGiven(true);
    }
  }, [carregandoInicial, loading, voiceEnabled, anunciarBusca, anunciarResultados, totalResultados, voiceFeedbackGiven]);

  useEffect(() => {
    if (!loading && voiceEnabled && totalResultados > 0) {
      setVoiceFeedbackGiven(false);
    }
  }, [totalResultados, loading, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled) {
      setVoiceFeedbackGiven(false);
    }
  }, [voiceEnabled]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={isDesktop ? 48 : 64} color={theme.colors.textTertiary} />
      <Espacador size="md" />
      <TextoTematizado variant="h3" weight="bold" align="center">
        {temFiltrosAtivos ? 'Nenhum local encontrado' : 'Digite algo para buscar'}
      </TextoTematizado>
      <Espacador size="sm" />
      <TextoTematizado color="textSecondary" align="center">
        {temFiltrosAtivos 
          ? 'Tente ajustar os filtros ou buscar por outro termo'
          : 'Busque por nome, categoria ou recursos de acessibilidade'}
      </TextoTematizado>
      {voiceEnabled && (
        <TouchableOpacity onPress={anunciarBusca} style={styles.voiceHelpButton}>
          <Ionicons name="volume-medium-outline" size={20} color={theme.colors.primary} />
          <TextoTematizado color="primary" style={styles.voiceHelpText}>Ouvir ajuda</TextoTematizado>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.cardWrapper,
        numColumns === 1 && styles.cardWrapperUmaColuna,
        numColumns === 2 && styles.cardWrapperDuasColunas,
        numColumns === 3 && styles.cardWrapperTresColunas,
      ]}
    >
      <CartaoLocal 
        local={item} 
        onPress={() => handleLocalPress(item)} 
        altoContraste={isHighContrast}
        compact={cardCompact}
      />
    </View>
  );

  if (carregandoInicial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Espacador size="md" />
        <TextoTematizado color="textSecondary">Carregando locais...</TextoTematizado>
      </View>
    );
  }

  const cabecalhoLista = mostrarCabecalhoTexto ? (
    <CabecalhoPagina
      titulo="Buscar Locais"
      subtitulo={zoomAplicado ? undefined : 'Encontre e avalie locais acessóveis'}
      altoContraste={isHighContrast}
      style={styles.cabecalhoBuscar}
    />
  ) : null;

  return (
    <Recipiente scroll={false} background={isHighContrast ? 'background' : 'backgroundSecondary'} altoContraste={isHighContrast}>
      {isDesktop && !usarLayoutEmpilhado ? (
        <View style={styles.conteudoDesktop}>
          <View style={[styles.colunaFiltrosDesktop, { width: larguraColunaFiltros }]}> 
            <ScrollView 
              style={styles.filtrosScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.filtrosScrollContent}
              scrollEnabled={true}
            >
              <FiltrosCard 
                searchText={searchText}
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
                voiceEnabled={voiceEnabled}
                fontSizeMultiplier={fontSizeMultiplier}
                filtrosVisiveis={filtrosVisiveis}
                onToggleFiltros={alternarVisibilidadeFiltros}
                loading={loading}
              />
            </ScrollView>
          </View>

          <View style={styles.colunaResultadosDesktop}>
            <FlatList
              data={resultados}
              key={numColumns}
              numColumns={numColumns}
              keyExtractor={(item, index) => String(item.id || item.idLocal || index)}
              renderItem={renderItem}
              ListHeaderComponent={
                <>
                  {cabecalhoLista}
                  <View style={styles.resultadosHeader}>
                    <TextoTematizado variant="h3" weight="bold">
                      {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
                    </TextoTematizado>
                    {(loading || refreshing) && <ActivityIndicator size="small" color={theme.colors.primary} />}
                    {voiceEnabled && !loading && totalResultados > 0 && (
                      <TouchableOpacity onPress={anunciarResultados} style={styles.voiceResultButton}>
                        <Ionicons name="volume-medium-outline" size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Espacador size="md" />
                </>
              }
              ListEmptyComponent={!loading && renderEmptyState}
              contentContainerStyle={[styles.resultadosListContent, { paddingBottom: paddingInferiorLista }]}
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
          keyExtractor={(item, index) => String(item.id || item.idLocal || index)}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              {cabecalhoLista}
              <FiltrosCard 
                searchText={searchText}
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
                voiceEnabled={voiceEnabled}
                fontSizeMultiplier={fontSizeMultiplier}
                filtrosVisiveis={filtrosVisiveis}
                onToggleFiltros={alternarVisibilidadeFiltros}
                ocuparLarguraTotal={zoomAplicado}
                loading={loading}
              />
              {!zoomAplicado && (
                <>
                  <View style={styles.resultadosHeaderMobile}>
                    <TextoTematizado variant="h3" weight="bold">
                      {totalResultados} {totalResultados === 1 ? 'local encontrado' : 'locais encontrados'}
                    </TextoTematizado>
                    {(loading || refreshing) && <ActivityIndicator size="small" color={theme.colors.primary} />}
                    {voiceEnabled && !loading && totalResultados > 0 && (
                      <TouchableOpacity onPress={anunciarResultados}>
                        <Ionicons name="volume-medium-outline" size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Espacador size="md" />
                </>
              )}
            </>
          }
          ListEmptyComponent={!loading && renderEmptyState}
          contentContainerStyle={[
            zoomAplicado ? styles.listContentZoom : styles.listContentMobile,
            { paddingBottom: paddingInferiorLista },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </Recipiente>
  );
}

const styles = StyleSheet.create({
  conteudoDesktop: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  cabecalhoBuscar: {
    marginTop: -10,
    marginBottom: 12,
    paddingHorizontal: 12,
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
  listContentMobile: {
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  listContentZoom: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  filtrosCard: {
    padding: 16,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 0,
    marginTop: 8,
  },
  filtrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtrosHeaderToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtrosConteudo: {
    overflow: 'hidden',
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    outlineStyle: 'none',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  loadingIcon: {
    marginLeft: 4,
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
  voiceIcon: {
    padding: 4,
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
  notaValor: {},
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
  notaBotaoTexto: {},
  resultadosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  resultadosHeaderMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  resultadosListContent: {
    paddingBottom: 20,
  },
  cardWrapper: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  cardWrapperUmaColuna: {
    width: '100%',
    maxWidth: '100%',
  },
  cardWrapperDuasColunas: {
    width: '50%',
    maxWidth: '50%',
  },
  cardWrapperTresColunas: {
    width: '33.33%',
    maxWidth: '33.33%',
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
  voiceHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
  },
  voiceHelpText: {
    fontWeight: '500',
  },
  voiceResultButton: {
    padding: 4,
  },
});