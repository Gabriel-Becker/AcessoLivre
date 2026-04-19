import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import axios from 'axios';
import { Container } from '../../components/layout';
import {
  AreaPlaceholder,
  Button,
  CabecalhoPagina,
  CardInfoIcone,
  CardSecao,
  CartaoMetricas,
  CartaoSelecao,
  Input,
  ListaMarcadores,
  Select,
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { breakpoints } from '../../config/theme';
import LocalService from '../../services/LocalService';
import api from '../../api/axios';
import { formatCEP } from '../../utils/formatters';
import toastHelper from '../../utils/toastHelper';
import { CATEGORIAS } from '../../constants/enums/Categoria';
import { TIPOS_ACESSIBILIDADE } from '../../constants/enums/Tipo_Acessibilidade';
// Mapeamento dos recursos de acessibilidade para exibição na UI
const RECURSOS_ACESSIBILIDADE = [
  {
    id: 'rampa',
    titulo: 'Rampa de acesso',
    descricao: 'Rampa para cadeira de rodas na entrada',
    icon: 'walk-outline',
    cor: 'rampa',
    enumValue: 'RAMPA_DE_ACESSO',
  },
  {
    id: 'banheiro',
    titulo: 'Banheiro adaptado',
    descricao: 'Banheiro com acessibilidade para PcD',
    icon: 'man-outline',
    cor: 'banheiro',
    enumValue: 'BANHEIRO_ADAPTADO',
  },
  {
    id: 'elevador',
    titulo: 'Elevador acessível',
    descricao: 'Elevador funcionando com botões em braille',
    icon: 'business-outline',
    cor: 'elevador',
    enumValue: 'ELEVADOR_ACESSIVEL',
  },
  {
    id: 'piso',
    titulo: 'Piso tátil',
    descricao: 'Piso com textura para orientação',
    icon: 'trail-sign-outline',
    cor: 'audiovisual',
    enumValue: 'PISO_TATIL',
  },
  {
    id: 'braille',
    titulo: 'Sinalização em braille',
    descricao: 'Placas e informações em braille',
    icon: 'eye-outline',
    cor: 'braile',
    enumValue: 'SINALIZACAO_EM_BRAILLE',
  },
  {
    id: 'estacionamento',
    titulo: 'Estacionamento acessível',
    descricao: 'Vagas reservadas para PcD',
    icon: 'car-outline',
    cor: 'estacionamento',
    enumValue: 'ESTACIONAMENTO_ACESSIVEL',
  },
  {
    id: 'espaco',
    titulo: 'Espaço amplo',
    descricao: 'Corredores largos para circulação',
    icon: 'resize-outline',
    cor: 'secondary',
    enumValue: 'ESPACO_AMPLO',
  },
  {
    id: 'audiovisual',
    titulo: 'Recursos audiovisuais',
    descricao: 'Sistemas de som e sinalização visual',
    icon: 'volume-high-outline',
    cor: 'audiovisual',
    enumValue: 'RECURSOS_AUDIOVISUAIS',
  },
  {
    id: 'atendimento',
    titulo: 'Atendimento especializado',
    descricao: 'Staff treinado para atender PcD',
    icon: 'heart-outline',
    cor: 'secondary',
    enumValue: 'ATENDIMENTO_ESPECIALIZADO',
  },
  {
    id: 'mobiliario',
    titulo: 'Mobiliário adaptado',
    descricao: 'Mesas, balcões e assentos adaptados',
    icon: 'grid-outline',
    cor: 'primary',
    enumValue: 'MOBILIARIO_ADAPTADO',
  },
];

// Converter enums de categorias para o formato do Select
const CATEGORIAS_OPTIONS = CATEGORIAS.map((categoria) => ({
  idCategoria: categoria,
  nome: categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase(),
  enumValue: categoria,
}));

// Converter enums de tipos de acessibilidade para o formato de busca
const TIPOS_ACESSIBILIDADE_OPTIONS = TIPOS_ACESSIBILIDADE.map((tipo) => ({
  idTipoAcessibilidade: tipo,
  nome: tipo.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
  enumValue: tipo,
}));

export default function AdicionarLocal({ onNavigate, navigation }) {
  const { isHighContrast, theme: t } = useThemeContext();
  const { usuario, isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet;

  const [formulario, setFormulario] = useState({
    nome: '',
    categoria: null,
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    descricao: '',
  });
  const [cepBuscado, setCepBuscado] = useState('');
  const [categorias, setCategorias] = useState(CATEGORIAS_OPTIONS);
  const [tiposAcessibilidade, setTiposAcessibilidade] = useState(TIPOS_ACESSIBILIDADE_OPTIONS);
  const [carregandoListas, setCarregandoListas] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [recursosSelecionados, setRecursosSelecionados] = useState({});
  const [estatisticas, setEstatisticas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0,
    totalUsuarios: 0,
  });

  const estilos = useMemo(() => criarEstilos(t, isHighContrast, isDesktop, isTablet), [
    isDesktop,
    isHighContrast,
    isTablet,
    t,
  ]);
  
  const fundos = useMemo(
    () => ({
      fundoDica: isHighContrast ? t.colors.surface : '#FFF5E1',
      fundoComunidade: isHighContrast ? t.colors.surface : '#EAF8F0',
    }),
    [isHighContrast, t]
  );

  const atualizarCampo = (campo) => (valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const buscarCep = async (cepLimpo) => {
    if (!cepLimpo || cepLimpo.length !== 8) return;
    if (cepLimpo === cepBuscado) return;

    setCepBuscado(cepLimpo);

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (response.data && !response.data.erro) {
        const endereco = response.data;

        setFormulario((anterior) => ({
          ...anterior,
          logradouro: endereco.logradouro || '',
          bairro: endereco.bairro || '',
          cidade: endereco.localidade || '',
          estado: endereco.uf || '',
        }));
        return;
      }

      toastHelper.showError('CEP não encontrado');
    } catch (erro) {
      toastHelper.showError('Erro ao consultar CEP. Verifique sua conexão.');
    }
  };

  const handleCepChange = (valor) => {
    const cepFormatado = formatCEP(valor);
    atualizarCampo('cep')(cepFormatado);

    const cepLimpo = cepFormatado.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(cepLimpo);
    }
  };

  useEffect(() => {
    setEstatisticas({ totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 });
  }, [isAuthenticated]);

  // Carregar listas da API (fallback para enums se falhar)
  useEffect(() => {
    const carregarListas = async () => {
      setCarregandoListas(true);
      try {
        const [categoriasResponse, tiposResponse] = await Promise.all([
          api.get('/categorias'),
          api.get('/tipos-acessibilidade'),
        ]);

        // Se a API retornar dados, usa eles, senão usa os enums
        if (Array.isArray(categoriasResponse.data) && categoriasResponse.data.length > 0) {
          setCategorias(categoriasResponse.data);
        } else {
          setCategorias(CATEGORIAS_OPTIONS);
        }

        if (Array.isArray(tiposResponse.data) && tiposResponse.data.length > 0) {
          setTiposAcessibilidade(tiposResponse.data);
        } else {
          setTiposAcessibilidade(TIPOS_ACESSIBILIDADE_OPTIONS);
        }
      } catch (erro) {
        console.error('Erro ao carregar listas da API, usando enums:', erro);
        setCategorias(CATEGORIAS_OPTIONS);
        setTiposAcessibilidade(TIPOS_ACESSIBILIDADE_OPTIONS);
      } finally {
        setCarregandoListas(false);
      }
    };

    carregarListas();
  }, []);

  const alternarRecurso = (id) => {
    setRecursosSelecionados((anterior) => ({
      ...anterior,
      [id]: !anterior[id],
    }));
  };

  const obterCorRecurso = (chave) => {
    if (t.colors.accessibility?.[chave]) {
      return t.colors.accessibility[chave];
    }
    if (t.colors[chave]) {
      return t.colors[chave];
    }
    return t.colors.primary;
  };

  const normalizarTexto = (texto) =>
    texto
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const obterTipoAcessibilidade = () => {
    const selecionados = Object.keys(recursosSelecionados).filter(
      (id) => recursosSelecionados[id]
    );

    if (!selecionados.length) {
      return null;
    }

    const recursosSelecionadosInfo = RECURSOS_ACESSIBILIDADE.filter((recurso) =>
      selecionados.includes(recurso.id)
    );

    for (const recurso of recursosSelecionadosInfo) {
      const recursoEnum = recurso.enumValue;
      const tipo = tiposAcessibilidade.find((item) => {
        if (item.enumValue === recursoEnum) return true;
        const tipoNormalizado = normalizarTexto(item.nome);
        const recursoNormalizado = normalizarTexto(recurso.titulo);
        return (
          tipoNormalizado?.includes(recursoNormalizado) ||
          recursoNormalizado?.includes(tipoNormalizado)
        );
      });

      if (tipo?.enumValue) {
        return tipo.enumValue;
      }
    }

    return recursosSelecionadosInfo[0]?.enumValue || null;
  };

  const validarFormulario = () => {
    if (!usuario?.idUsuario) {
      toastHelper.showError('Faça login para adicionar um local.');
      return false;
    }

    if (!formulario.nome?.trim()) {
      toastHelper.showError('Nome do local é obrigatório.');
      return false;
    }

    if (!formulario.categoria) {
      toastHelper.showError('Categoria é obrigatória.');
      return false;
    }

    if (!formulario.descricao?.trim()) {
      toastHelper.showError('Descrição é obrigatória.');
      return false;
    }

    if (!formulario.cep || formulario.cep.replace(/\D/g, '').length !== 8) {
      toastHelper.showError('CEP válido é obrigatório.');
      return false;
    }

    if (!formulario.logradouro?.trim()) {
      toastHelper.showError('Logradouro é obrigatório.');
      return false;
    }

    if (!formulario.numero?.trim()) {
      toastHelper.showError('Número é obrigatório.');
      return false;
    }

    if (!formulario.bairro?.trim()) {
      toastHelper.showError('Bairro é obrigatório.');
      return false;
    }

    if (!formulario.cidade?.trim()) {
      toastHelper.showError('Cidade é obrigatória.');
      return false;
    }

    if (!formulario.estado?.trim()) {
      toastHelper.showError('Estado é obrigatório.');
      return false;
    }

    const tipoAcessibilidade = obterTipoAcessibilidade();
    if (!tipoAcessibilidade) {
      toastHelper.showError('Selecione um recurso de acessibilidade válido.');
      return false;
    }

    return true;
  };

  const handleSalvarLocal = async () => {
    if (enviando) return;

    if (!validarFormulario()) {
      return;
    }

    const tipoAcessibilidade = obterTipoAcessibilidade();
    if (!tipoAcessibilidade) {
      return;
    }

    setEnviando(true);

    try {
      const payloadLocal = {
        nome: formulario.nome,
        descricao: formulario.descricao,
        categoria: formulario.categoria,
        tipoAcessibilidade,
        idUsuario: usuario.idUsuario,
        endereco: {
          idUsuario: usuario.idUsuario,
          cep: formulario.cep,
          logradouro: formulario.logradouro,
          numero: formulario.numero,
          complemento: formulario.complemento || '',
          bairro: formulario.bairro,
          cidade: formulario.cidade,
          estado: formulario.estado,
        },
      };

      await LocalService.cadastrarLocal(payloadLocal);
      toastHelper.showSuccess('Local adicionado com sucesso.');
      
      // Navegar de volta após sucesso
      if (onNavigate) {
        onNavigate('Inicio');
      } else if (navigation) {
        navigation.navigate('Main');
      }
    } catch (erro) {
      const mensagem =
        erro?.response?.data?.mensagem ||
        erro?.response?.data ||
        erro?.message ||
        'Erro ao cadastrar local.';
      toastHelper.showError(mensagem);
    } finally {
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    if (onNavigate) {
      onNavigate('Inicio');
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const opcoesCategoria = useMemo(
    () =>
      categorias.map((categoria, index) => {
        if (typeof categoria === 'string') {
          return {
            label: categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase(),
            value: categoria,
          };
        }

        return {
          label: categoria.nome || categoria.enumValue || `Categoria ${index + 1}`,
          value: categoria.enumValue || categoria.idCategoria || categoria.value,
        };
      }),
    [categorias]
  );

  return (
    <Container
      scroll
      background={isHighContrast ? 'background' : 'backgroundSecondary'}
      altoContraste={isHighContrast}
      contentStyle={estilos.scroll}
    >
      <CabecalhoPagina
        titulo="Adicionar Local"
        subtitulo="Cadastre um novo local acessível para a comunidade"
        onVoltar={handleVoltar}
        textoVoltar="Voltar"
        altoContraste={isHighContrast}
        style={estilos.header}
      />

      <View style={estilos.conteudo}>
        <View style={estilos.colunaPrincipal}>
          <CardSecao
            titulo="Informações Básicas"
            icone="document-text-outline"
            corIcone={t.colors.primary}
            altoContraste={isHighContrast}
          >
            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="Nome do Local *"
                  placeholder="Ex: Shopping Center Norte"
                  value={formulario.nome}
                  onChangeText={atualizarCampo('nome')}
                  altoContraste={isHighContrast}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Select
                  label="Categoria *"
                  placeholder="Selecione uma categoria"
                  value={formulario.categoria}
                  options={opcoesCategoria}
                  onSelect={(valor) => atualizarCampo('categoria')(valor)}
                  altoContraste={isHighContrast}
                  disabled={carregandoListas || !opcoesCategoria.length}
                />
                {!carregandoListas && !opcoesCategoria.length ? (
                  <ThemedText variant="tiny" color="textTertiary">
                    Não foi possível carregar categorias.
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="CEP *"
                  placeholder="88015-200"
                  value={formulario.cep}
                  onChangeText={handleCepChange}
                  keyboardType="numeric"
                  maxLength={9}
                  altoContraste={isHighContrast}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Input
                  label="Estado *"
                  placeholder="UF"
                  value={formulario.estado}
                  onChangeText={atualizarCampo('estado')}
                  autoCapitalize="characters"
                  maxLength={2}
                  altoContraste={isHighContrast}
                />
              </View>
            </View>

            <Input
              label="Logradouro *"
              placeholder="Ex: Av. Beira-Mar Norte"
              value={formulario.logradouro}
              onChangeText={atualizarCampo('logradouro')}
              altoContraste={isHighContrast}
            />

            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="Número *"
                  placeholder="Ex: 1230"
                  value={formulario.numero}
                  onChangeText={atualizarCampo('numero')}
                  keyboardType="numeric"
                  altoContraste={isHighContrast}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Input
                  label="Complemento"
                  placeholder="Ex: Apto 402"
                  value={formulario.complemento}
                  onChangeText={atualizarCampo('complemento')}
                  altoContraste={isHighContrast}
                />
              </View>
            </View>

            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="Bairro *"
                  placeholder="Ex: Centro"
                  value={formulario.bairro}
                  onChangeText={atualizarCampo('bairro')}
                  altoContraste={isHighContrast}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Input
                  label="Cidade *"
                  placeholder="Ex: Florianópolis"
                  value={formulario.cidade}
                  onChangeText={atualizarCampo('cidade')}
                  altoContraste={isHighContrast}
                />
              </View>
            </View>

            <Input
              label="Descrição *"
              placeholder="Descreva brevemente o local, suas características principais e informações úteis..."
              value={formulario.descricao}
              onChangeText={atualizarCampo('descricao')}
              multiline
              numberOfLines={4}
              altoContraste={isHighContrast}
            />
          </CardSecao>

          <CardSecao
            titulo="Recursos de Acessibilidade"
            descricao="Marque todos os recursos de acessibilidade disponíveis no local"
            icone="accessibility-outline"
            corIcone={t.colors.secondary}
            altoContraste={isHighContrast}
          >
            <View style={estilos.recursosGrid}>
              {RECURSOS_ACESSIBILIDADE.map((recurso) => {
                const selecionado = !!recursosSelecionados[recurso.id];
                const corRecurso = obterCorRecurso(recurso.cor);

                return (
                  <CartaoSelecao
                    key={recurso.id}
                    titulo={recurso.titulo}
                    descricao={recurso.descricao}
                    icone={recurso.icon}
                    corDestaque={corRecurso}
                    selecionado={selecionado}
                    onPress={() => alternarRecurso(recurso.id)}
                    altoContraste={isHighContrast}
                    style={estilos.recursoItem}
                  />
                );
              })}
            </View>
          </CardSecao>

          <CardSecao
            titulo="Fotos do Local"
            descricao="Adicione fotos que mostrem os recursos de acessibilidade do local"
            icone="camera-outline"
            corIcone={t.colors.primary}
            altoContraste={isHighContrast}
          >
            <AreaPlaceholder
              icone="cloud-upload-outline"
              titulo="Clique ou arraste para adicionar fotos"
              subtitulo="PNG, JPG até 10MB cada"
              altoContraste={isHighContrast}
            />
          </CardSecao>

          <View style={estilos.botaoContainer}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSalvarLocal}
              iconLeft="add"
              loading={enviando}
              disabled={carregandoListas}
              fullWidth={!isDesktop}
              style={estilos.botaoPrincipal}
              altoContraste={isHighContrast}
            >
              Adicionar Local
            </Button>
          </View>
        </View>

        <View style={estilos.colunaLateral}>
          <CardInfoIcone
            titulo="Próximos passos:"
            icone="navigate-outline"
            corIcone={t.colors.primary}
            corFundoIcone={isHighContrast ? t.colors.surfaceSecondary : '#E8F0FF'}
            altoContraste={isHighContrast}
          >
            <ListaMarcadores
              itens={[
                'Após adicionar, você poderá avaliar o local',
                'Adicione fotos dos recursos de acessibilidade',
                'Compartilhe com a comunidade',
              ]}
              corMarcador={t.colors.primary}
              altoContraste={isHighContrast}
            />
          </CardInfoIcone>

          <CardInfoIcone
            titulo="Dica importante:"
            icone="bulb-outline"
            corIcone={t.colors.warning}
            corFundoIcone={isHighContrast ? t.colors.surfaceSecondary : '#FFF1CC'}
            fundo={fundos.fundoDica}
            altoContraste={isHighContrast}
          >
            <ThemedText color="textSecondary">
              Seja específico ao marcar os recursos de acessibilidade. Isso ajuda pessoas com
              diferentes necessidades a encontrar locais adequados para elas.
            </ThemedText>
          </CardInfoIcone>

          <CardInfoIcone
            titulo="Contribua com a Comunidade"
            icone="heart"
            corIcone={t.colors.secondary}
            corFundoIcone={isHighContrast ? t.colors.surfaceSecondary : '#DFF6EA'}
            fundo={fundos.fundoComunidade}
            layout="coluna"
            centralizado
            altoContraste={isHighContrast}
          >
            <ThemedText color="textSecondary" align="center">
              Cada local adicionado com informações precisas de acessibilidade ajuda a tornar o
              mundo mais inclusivo para todos.
            </ThemedText>
          </CardInfoIcone>

          <CartaoMetricas
            titulo="Impacto da Comunidade"
            metricas={[
              { valor: formatarNumero(estatisticas.totalLocais), legenda: 'Locais Cadastrados' },
              { valor: formatarNumero(estatisticas.totalAvaliacoes), legenda: 'Avaliações' },
              { valor: formatarNumero(estatisticas.totalUsuarios), legenda: 'Usuários Ativos' },
            ]}
            altoContraste={isHighContrast}
          />
        </View>
      </View>
    </Container>
  );
}

function formatarNumero(valor) {
  const numero = Number(valor) || 0;
  if (numero >= 1000) {
    return `${(numero / 1000).toFixed(1)}k+`;
  }
  return String(numero);
}

function criarEstilos(t, isHighContrast, isDesktop, isTablet) {
  return StyleSheet.create({
    scroll: {
      paddingBottom: t.spacing.xxxl,
    },
    header: {
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'center' : 'flex-start',
    },
    conteudo: {
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: 'flex-start',
      gap: t.spacing.xl,
    },
    colunaPrincipal: {
      flex: 1,
      minWidth: 0,
    },
    colunaLateral: {
      width: isDesktop ? 320 : '100%',
      gap: t.spacing.lg,
    },
    linhaCampos: {
      flexDirection: isTablet ? 'row' : 'column',
      gap: t.spacing.md,
    },
    colunaCampo: {
      flex: 1,
      flexBasis: 0,
      minWidth: isTablet ? 260 : '100%',
    },
    recursosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.md,
    },
    recursoItem: {
      width: isTablet ? '48%' : '100%',
    },
    botaoContainer: {
      alignItems: isDesktop ? 'flex-start' : 'stretch',
      marginTop: t.spacing.md,
    },
    botaoPrincipal: {
      minWidth: isDesktop ? 240 : '100%',
      alignSelf: isDesktop ? 'flex-start' : 'stretch',
    },
  });
}