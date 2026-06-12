import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

import { Container } from '../../components/layout';
import {
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
import { ThemedText } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import LocalService from '../../services/LocalService';
import BuscarService from '../../services/BuscarService';
import api from '../../api/axios';
import { formatCEP } from '../../utils/formatters';
import toastHelper from '../../utils/toastHelper';
import { CATEGORIAS } from '../../constants/enums';
import { breakpoints, getTheme } from '../../config/theme';

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
  { id: 'rampa', titulo: 'Rampa de acesso', descricao: 'Rampa para cadeira de rodas na entrada', icon: 'walk-outline', cor: 'rampa', enumValue: 'RAMPA' },
  { id: 'banheiro', titulo: 'Banheiro adaptado', descricao: 'Banheiro com acessibilidade para PcD', icon: 'man-outline', cor: 'banheiro', enumValue: 'BANHEIRO_ADAPTADO' },
  { id: 'elevador', titulo: 'Elevador acessível', descricao: 'Elevador funcionando com botões em braille', icon: 'business-outline', cor: 'elevador', enumValue: 'ELEVADOR' },
  { id: 'piso', titulo: 'Piso tátil', descricao: 'Piso com textura para orientação', icon: 'trail-sign-outline', cor: 'audiovisual', enumValue: 'PISO_TATIL' },
  { id: 'braille', titulo: 'Sinalização em braille', descricao: 'Placas e informações em braille', icon: 'eye-outline', cor: 'braile', enumValue: 'SINALIZACAO_BRAILLE' },
  { id: 'estacionamento', titulo: 'Estacionamento acessível', descricao: 'Vagas reservadas para PcD', icon: 'car-outline', cor: 'estacionamento', enumValue: 'ESTACIONAMENTO' },
  { id: 'espaco', titulo: 'Espaço amplo', descricao: 'Corredores largos para circulação', icon: 'resize-outline', cor: 'secondary', enumValue: 'ESPACO_AMPLO' },
  { id: 'audiovisual', titulo: 'Recursos audiovisuais', descricao: 'Sistemas de som e sinalização visual', icon: 'volume-high-outline', cor: 'audiovisual', enumValue: 'RECURSOS_AUDIOVISUAIS' },
  { id: 'atendimento', titulo: 'Atendimento especializado', descricao: 'Staff treinado para atender PcD', icon: 'heart-outline', cor: 'secondary', enumValue: 'ATENDIMENTO_ESPECIALIZADO' },
  { id: 'mobiliario', titulo: 'Mobiliário adaptado', descricao: 'Mesas, balcões e assentos adaptados', icon: 'grid-outline', cor: 'primary', enumValue: 'MOBILIARIO_ADAPTADO' },
];

const LIMITES_CAMPOS_LOCAL = {
  nome: 150,
  descricao: 350,
  logradouro: 200,
  numero: 10,
  complemento: 100,
  bairro: 100,
  cidade: 100,
  estado: 2,
};

const ImageUploadArea = ({ images, onAddImages, onRemoveImage, isHighContrast, theme, permitirEscalaFonte = true }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const novasImagens = imageFiles.map((file) => ({
        uri: URL.createObjectURL(file),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      onAddImages(novasImagens);
    }
  };

  const handleSelectFilesWeb = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/jpeg,image/png,image/webp';

    input.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        const novasImagens = imageFiles.map((file) => ({
          uri: URL.createObjectURL(file),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        }));
        onAddImages(novasImagens);
      }
    };

    input.click();
  };

  const handleSelectFilesMobile = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toastHelper.showError('Permissão de galeria negada');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets) {
      const novasImagens = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'image/jpeg',
      }));
      onAddImages(novasImagens);
    }
  };

  const handleTakePhotoMobile = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      toastHelper.showError('Permissão de câmera negada');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const novaImagem = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'image/jpeg',
      };
      onAddImages([novaImagem]);
    }
  };

  const handleSelectFiles = () => {
    if (Platform.OS === 'web') {
      handleSelectFilesWeb();
    } else {
      handleSelectFilesMobile();
    }
  };

  const handleTakePhoto = () => {
    if (Platform.OS !== 'web') {
      handleTakePhotoMobile();
    } else {
      toastHelper.showInfo('Câmera disponível apenas no aplicativo mobile');
    }
  };

  const renderPreview = () => {
    if (images.length === 0) return null;

    return (
      <View style={localStyles.previewContainer}>
        {images.map((image, index) => (
          <View
            key={`${image.uri}-${index}`}
            style={[
              localStyles.previewItem,
              {
                borderColor: isHighContrast ? theme.colors.border : theme.colors.borderLight,
                backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : theme.colors.surface,
              },
            ]}
          >
            <Image source={{ uri: image.uri }} style={localStyles.previewImage} />
            <TouchableOpacity style={localStyles.removeButton} onPress={() => onRemoveImage(index)}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (Platform.OS === 'web') {
    return (
      <View>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderWidth: 2,
            borderColor: isDragging ? theme.colors.primary : theme.colors.borderLight,
            borderStyle: 'dashed',
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl,
            textAlign: 'center',
            backgroundColor: isDragging ? `${theme.colors.primary}10` : theme.colors.surfaceSecondary,
            cursor: 'pointer',
            marginBottom: theme.spacing.md,
          }}
          onClick={handleSelectFiles}
        >
          <Ionicons name="cloud-upload-outline" size={48} color={isHighContrast ? theme.colors.textPrimary : theme.colors.textSecondary} />
          <ThemedText align="center" permitirEscalaFonte={permitirEscalaFonte}>
            {isDragging ? 'Solte as imagens aqui' : 'Arraste e solte imagens ou clique para selecionar'}
          </ThemedText>
          <ThemedText color="textTertiary" variant="caption" align="center" permitirEscalaFonte={permitirEscalaFonte}>
            PNG, JPG até 10MB cada (máx. 5 imagens)
          </ThemedText>
        </div>

        {renderPreview()}

        <View style={localStyles.actionButtons}>
          <Button variant="outline" size="small" onPress={handleSelectFiles} iconLeft="images-outline" altoContraste={isHighContrast}>
            Galeria
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={[
          localStyles.dropArea,
          {
            borderColor: isHighContrast ? theme.colors.primary : '#ddd',
            backgroundColor: isHighContrast ? theme.colors.surface : '#f9f9f9',
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
          },
        ]}
        onPress={handleSelectFiles}
      >
        <Ionicons name="cloud-upload-outline" size={48} color={isHighContrast ? theme.colors.textPrimary : theme.colors.textSecondary} />
        <ThemedText align="center" permitirEscalaFonte={permitirEscalaFonte}>
          Clique para selecionar imagens
        </ThemedText>
        <ThemedText color="textTertiary" variant="caption" align="center" permitirEscalaFonte={permitirEscalaFonte}>
          PNG, JPG até 10MB cada (máx. 5 imagens)
        </ThemedText>
      </TouchableOpacity>

      {renderPreview()}

      <View style={localStyles.actionButtons}>
        <Button variant="outline" size="small" onPress={handleSelectFiles} iconLeft="images-outline" altoContraste={isHighContrast}>
          Galeria
        </Button>
        <Button variant="outline" size="small" onPress={handleTakePhoto} iconLeft="camera-outline" altoContraste={isHighContrast}>
          Câmera
        </Button>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  dropArea: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  previewItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AdicionarLocal({ onNavigate, navigation, routeParams }) {
  const permitirEscalaFonte = true;
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const t = useMemo(() => getTheme(isHighContrast, fontSizeMultiplier), [isHighContrast, fontSizeMultiplier]);
  const { usuario } = useAuth();
  const { width } = useWindowDimensions();

  const larguraVisual = Platform.OS === 'web' && typeof window !== 'undefined'
    ? (window.visualViewport?.width || window.innerWidth || width)
    : width;
  const fonteGrande = Number(fontSizeMultiplier) >= 1.5;
  const usarDuasColunas = larguraVisual >= Math.max(920, breakpoints.tablet) && !fonteGrande;
  const mostrarCardsLaterais = Platform.OS === 'web' && larguraVisual >= Math.max(1280, breakpoints.desktop) && !fonteGrande;

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
  const [recursosSelecionados, setRecursosSelecionados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [imagens, setImagens] = useState([]);
  const [progressoImagens, setProgressoImagens] = useState({ atual: 0, total: 0 });
  const [editingLocalId, setEditingLocalId] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0,
    totalUsuarios: 0,
  });

  const opcoesCategoria = useMemo(() => (
    CATEGORIAS.map((categoria) => ({
      value: categoria,
      label: CATEGORIAS_LABELS[categoria] || categoria,
    }))
  ), []);

  const estilos = useMemo(() => criarEstilos(t, usarDuasColunas, mostrarCardsLaterais, fontSizeMultiplier), [
    t,
    usarDuasColunas,
    mostrarCardsLaterais,
    fontSizeMultiplier,
  ]);

  const contadorDescricao = `${formulario.descricao.length}/${LIMITES_CAMPOS_LOCAL.descricao}`;

  useEffect(() => {
    let ativo = true;

    const carregarEstatisticas = async () => {
      try {
        const dados = await LocalService.obterEstatisticas();
        if (ativo) {
          setEstatisticas({
            totalLocais: dados?.totalLocais || 0,
            totalAvaliacoes: dados?.totalAvaliacoes || 0,
            totalUsuarios: dados?.totalUsuarios || 0,
          });
        }
      } catch (erro) {
        console.error('[AdicionarLocal] Erro ao carregar estatísticas:', erro);
      }
    };

    carregarEstatisticas();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const localId = routeParams?.localId;
    if (!localId) return;

    setEditingLocalId(localId);

    const carregarLocalParaEdicao = async () => {
      try {
        setEnviando(true);
        const data = await LocalService.obterLocal(localId);
        if (data) {
          setFormulario((prev) => ({
            ...prev,
            nome: data.nome || '',
            categoria: data.categoria || null,
            cep: formatCEP(data.endereco?.cep || data.cep || ''),
            logradouro: data.endereco?.logradouro || '',
            numero: data.endereco?.numero || '',
            complemento: data.endereco?.complemento || '',
            bairro: data.endereco?.bairro || '',
            cidade: data.endereco?.cidade || '',
            estado: data.endereco?.estado || '',
            descricao: data.descricao || '',
          }));

          if (Array.isArray(data.tiposAcessibilidade)) {
            const selecionados = {};
            RECURSOS_ACESSIBILIDADE.forEach((recurso) => {
              selecionados[recurso.id] = data.tiposAcessibilidade.includes(recurso.enumValue);
            });
            setRecursosSelecionados(selecionados);
          }
        }
      } catch (_erro) {
        console.error('[AdicionarLocal] Erro ao carregar local para edição:', _erro);
        toastHelper.showError('Não foi possível carregar o local para edição.');
      } finally {
        setEnviando(false);
      }
    };

    carregarLocalParaEdicao();
  }, [routeParams?.localId]);

  const adicionarImagens = (novasImagens) => {
    const MAX_IMAGES = 5;
    const MAX_SIZE = 10 * 1024 * 1024;

    const validImages = novasImagens.filter((img) => {
      if (img.size > MAX_SIZE) {
        toastHelper.showError(`Imagem ${img.name || 'sem nome'} excede 10MB`);
        return false;
      }
      return true;
    });

    if (imagens.length + validImages.length > MAX_IMAGES) {
      toastHelper.showError(`Máximo de ${MAX_IMAGES} imagens por local`);
      return;
    }

    setImagens((prev) => [...prev, ...validImages]);
  };

  const removerImagem = (index) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const atualizarCampo = (campo, limite) => (valor) => {
    const valorNormalizado = typeof valor === 'string' ? valor : String(valor ?? '');
    const valorFinal = limite ? valorNormalizado.slice(0, limite) : valorNormalizado;
    setFormulario((anterior) => ({ ...anterior, [campo]: valorFinal }));
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
      } else {
        toastHelper.showError('CEP não encontrado');
      }
    } catch (_erro) {
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

  const alternarRecurso = (id) => {
    setRecursosSelecionados((anterior) => ({
      ...anterior,
      [id]: !anterior[id],
    }));
  };

  const obterCorRecurso = (chave) => {
    if (t.colors.accessibility?.[chave]) return t.colors.accessibility[chave];
    if (t.colors[chave]) return t.colors[chave];
    return t.colors.primary;
  };

  const obterTiposAcessibilidadeArray = () => {
    const selecionados = Object.keys(recursosSelecionados).filter((id) => recursosSelecionados[id]);
    if (!selecionados.length) return [];

    return selecionados
      .map((id) => RECURSOS_ACESSIBILIDADE.find((recurso) => recurso.id === id)?.enumValue)
      .filter(Boolean);
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

    const cepLimpo = formulario.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      toastHelper.showError('CEP inválido. Deve conter 8 dígitos.');
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

    if (obterTiposAcessibilidadeArray().length === 0) {
      toastHelper.showError('Selecione pelo menos um recurso de acessibilidade.');
      return false;
    }

    return true;
  };

  const handleSalvarLocal = async () => {
    if (enviando) return;
    if (!validarFormulario()) return;

    const tiposAcessibilidade = obterTiposAcessibilidadeArray();
    if (tiposAcessibilidade.length === 0) return;

    setEnviando(true);
    setProgressoImagens({ atual: 0, total: imagens.length });

    try {
      const cepLimpo = formulario.cep.replace(/\D/g, '');
      const payloadLocal = {
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim(),
        categoria: formulario.categoria,
        tiposAcessibilidade,
        idUsuario: usuario.idUsuario,
        endereco: {
          cep: cepLimpo,
          logradouro: formulario.logradouro.trim(),
          numero: formulario.numero.trim(),
          complemento: formulario.complemento?.trim() || '',
          bairro: formulario.bairro.trim(),
          cidade: formulario.cidade.trim(),
          estado: formulario.estado.trim().toUpperCase(),
          idUsuario: usuario.idUsuario,
        },
      };

      const localResponse = editingLocalId
        ? await LocalService.atualizarLocal(editingLocalId, payloadLocal)
        : await LocalService.cadastrarLocal(payloadLocal);

      const localId = localResponse?.idLocal || localResponse?.id || editingLocalId;

      if (imagens.length > 0 && localId) {
        let imagensEnviadas = 0;
        let imagensComErro = 0;

        for (let i = 0; i < imagens.length; i++) {
          try {
            setProgressoImagens({ atual: i + 1, total: imagens.length });
            const imagem = imagens[i];
            const formData = new FormData();
            formData.append('idLocal', String(localId));

            let arquivoParaEnviar;
            if (Platform.OS === 'web') {
              if (imagem.file) {
                arquivoParaEnviar = imagem.file;
              } else if (imagem.uri && imagem.uri.startsWith('blob:')) {
                const response = await fetch(imagem.uri);
                const blob = await response.blob();
                const fileName = imagem.name || `image_${Date.now()}.jpg`;
                const fileType = imagem.type || 'image/jpeg';
                arquivoParaEnviar = new File([blob], fileName, { type: fileType });
              } else {
                arquivoParaEnviar = {
                  uri: imagem.uri,
                  name: imagem.name || `image_${Date.now()}.jpg`,
                  type: imagem.type || 'image/jpeg',
                };
              }
            } else {
              arquivoParaEnviar = {
                uri: imagem.uri,
                name: imagem.name || `image_${Date.now()}.jpg`,
                type: imagem.type || 'image/jpeg',
              };
            }

            formData.append('arquivo', arquivoParaEnviar);
            await api.post('/imagens', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            imagensEnviadas += 1;
          } catch (erroImagem) {
            console.error('[AdicionarLocal] Erro no upload da imagem:', erroImagem);
            imagensComErro += 1;
          }
        }

        if (imagensComErro > 0) {
          toastHelper.showWarning(`${imagensEnviadas} imagem(ns) enviadas, ${imagensComErro} falha(s)`);
        } else if (imagensEnviadas > 0) {
          toastHelper.showSuccess(`${imagensEnviadas} imagem(ns) enviadas com sucesso!`);
        }
      }

      toastHelper.showSuccess(editingLocalId ? 'Local atualizado com sucesso!' : 'Local adicionado com sucesso!');
      setFormulario({
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
      setRecursosSelecionados({});
      setImagens([]);
      setProgressoImagens({ atual: 0, total: 0 });

      if (typeof BuscarService.invalidateCache === 'function') {
        BuscarService.invalidateCache();
      }

      if (onNavigate) {
        onNavigate('Inicio', { refreshKey: Date.now(), forceRefresh: true });
      } else if (navigation && typeof navigation.goBack === 'function') {
        try {
          navigation.goBack();
        } catch (_erroNavegacao) {
          try {
            navigation.navigate?.('Main', { screen: 'Inicio', refreshKey: Date.now(), forceRefresh: true });
          } catch (_erroFallback) {
            console.error('[AdicionarLocal] Falha na navegação de retorno:', _erroFallback);
          }
        }
      }
    } catch (erro) {
      console.error('❌ Erro ao cadastrar local:', erro);
      const mensagem = erro.response?.data?.message || erro.response?.data?.error || erro.message || 'Erro ao cadastrar local. Tente novamente.';
      toastHelper.showError(typeof mensagem === 'string' ? mensagem : JSON.stringify(mensagem));
    } finally {
      setEnviando(false);
      setProgressoImagens({ atual: 0, total: 0 });
    }
  };

  const handleVoltar = () => {
    if (imagens.length > 0) {
      Alert.alert(
        'Descartar imagens?',
        'Você tem imagens não salvas. Deseja realmente voltar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Voltar',
            style: 'destructive',
            onPress: () => {
              if (onNavigate) onNavigate('Inicio');
              else if (navigation) navigation.goBack();
            },
          },
        ]
      );
      return;
    }

    if (onNavigate) onNavigate('Inicio');
    else if (navigation) navigation.goBack();
  };

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
        permitirEscalaFonte={permitirEscalaFonte}
        style={estilos.header}
      />

      <View style={estilos.conteudo}>
        <View style={estilos.colunaPrincipal}>
          <CardSecao
            titulo="Informações Básicas"
            icone="document-text-outline"
            corIcone={t.colors.primary}
            altoContraste={isHighContrast}
            permitirEscalaFonte={permitirEscalaFonte}
          >
            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="Nome do Local *"
                  labelStyle={estilos.campoLabel}
                  placeholder="Ex: Shopping Center Norte"
                  value={formulario.nome}
                  onChangeText={atualizarCampo('nome', LIMITES_CAMPOS_LOCAL.nome)}
                  maxLength={LIMITES_CAMPOS_LOCAL.nome}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Select
                  label="Categoria *"
                  labelStyle={estilos.campoLabel}
                  placeholder="Selecione uma categoria"
                  value={formulario.categoria}
                  options={opcoesCategoria}
                  onSelect={(valor) => atualizarCampo('categoria')(valor)}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoSelect}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>
            </View>

            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="CEP *"
                  labelStyle={estilos.campoLabel}
                  placeholder="88015-200"
                  value={formulario.cep}
                  onChangeText={handleCepChange}
                  keyboardType="numeric"
                  maxLength={9}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Input
                  label="Estado *"
                  labelStyle={estilos.campoLabel}
                  placeholder="UF"
                  value={formulario.estado}
                  onChangeText={(valor) => atualizarCampo('estado', LIMITES_CAMPOS_LOCAL.estado)(valor.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={LIMITES_CAMPOS_LOCAL.estado}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>
            </View>

            <Input
              label="Logradouro *"
              labelStyle={estilos.campoLabel}
              placeholder="Ex: Av. Beira-Mar Norte"
              value={formulario.logradouro}
              onChangeText={atualizarCampo('logradouro', LIMITES_CAMPOS_LOCAL.logradouro)}
              maxLength={LIMITES_CAMPOS_LOCAL.logradouro}
              containerStyle={estilos.campoContainer}
              style={estilos.campoTexto}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            />

            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="Número *"
                  labelStyle={estilos.campoLabel}
                  placeholder="Ex: 1230"
                  value={formulario.numero}
                  onChangeText={atualizarCampo('numero', LIMITES_CAMPOS_LOCAL.numero)}
                  keyboardType="numeric"
                  maxLength={LIMITES_CAMPOS_LOCAL.numero}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Input
                  label="Complemento"
                  labelStyle={estilos.campoLabel}
                  placeholder="Ex: Apto 402"
                  value={formulario.complemento}
                  onChangeText={atualizarCampo('complemento', LIMITES_CAMPOS_LOCAL.complemento)}
                  maxLength={LIMITES_CAMPOS_LOCAL.complemento}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>
            </View>

            <View style={estilos.linhaCampos}>
              <View style={estilos.colunaCampo}>
                <Input
                  label="Bairro *"
                  labelStyle={estilos.campoLabel}
                  placeholder="Ex: Centro"
                  value={formulario.bairro}
                  onChangeText={atualizarCampo('bairro', LIMITES_CAMPOS_LOCAL.bairro)}
                  maxLength={LIMITES_CAMPOS_LOCAL.bairro}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>

              <View style={estilos.colunaCampo}>
                <Input
                  label="Cidade *"
                  labelStyle={estilos.campoLabel}
                  placeholder="Ex: Florianópolis"
                  value={formulario.cidade}
                  onChangeText={atualizarCampo('cidade', LIMITES_CAMPOS_LOCAL.cidade)}
                  maxLength={LIMITES_CAMPOS_LOCAL.cidade}
                  containerStyle={estilos.campoContainer}
                  style={estilos.campoTexto}
                  altoContraste={isHighContrast}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              </View>
            </View>

            <View style={estilos.campoDescricaoHeader}>
              <ThemedText color="textPrimary" weight="medium" style={estilos.campoLabel} permitirEscalaFonte={permitirEscalaFonte}>
                Descrição *
              </ThemedText>
              <ThemedText color="textTertiary" variant="caption" permitirEscalaFonte={permitirEscalaFonte}>
                {contadorDescricao}
              </ThemedText>
            </View>

            <Input
              placeholder="Descreva brevemente o local, suas características principais e informações úteis..."
              value={formulario.descricao}
              onChangeText={atualizarCampo('descricao', LIMITES_CAMPOS_LOCAL.descricao)}
              multiline
              numberOfLines={5}
              maxLength={LIMITES_CAMPOS_LOCAL.descricao}
              containerStyle={estilos.campoContainer}
              style={[estilos.campoTexto, estilos.campoTextoMultiline]}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            />
          </CardSecao>

          <CardSecao
            titulo="Recursos de Acessibilidade"
            descricao="Marque TODOS os recursos de acessibilidade disponíveis no local (pode marcar vários)"
            icone="accessibility-outline"
            corIcone={t.colors.secondary}
            altoContraste={isHighContrast}
            permitirEscalaFonte={permitirEscalaFonte}
          >
            <View style={estilos.recursosGrid}>
              {RECURSOS_ACESSIBILIDADE.map((recurso) => (
                <CartaoSelecao
                  key={recurso.id}
                  titulo={recurso.titulo}
                  descricao={recurso.descricao}
                  icone={recurso.icon}
                  corDestaque={obterCorRecurso(recurso.cor)}
                  selecionado={!!recursosSelecionados[recurso.id]}
                  onPress={() => alternarRecurso(recurso.id)}
                  altoContraste={isHighContrast}
                  style={estilos.recursoItem}
                  permitirEscalaFonte={permitirEscalaFonte}
                />
              ))}
            </View>

            <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.colors.borderLight }}>
              <ThemedText color="textSecondary" variant="caption" permitirEscalaFonte={permitirEscalaFonte}>
                {Object.values(recursosSelecionados).filter(Boolean).length} recurso(s) selecionado(s)
              </ThemedText>
            </View>
          </CardSecao>

          <CardSecao
            titulo="Fotos do Local"
            descricao="Adicione fotos que mostrem os recursos de acessibilidade do local (máx. 5 fotos)"
            icone="camera-outline"
            corIcone={t.colors.primary}
            altoContraste={isHighContrast}
            permitirEscalaFonte={permitirEscalaFonte}
          >
            <ImageUploadArea
              images={imagens}
              onAddImages={adicionarImagens}
              onRemoveImage={removerImagem}
              isHighContrast={isHighContrast}
              theme={t}
              permitirEscalaFonte={permitirEscalaFonte}
            />

            {enviando && progressoImagens.total > 0 && (
              <View style={{ marginTop: 16 }}>
                <ThemedText variant="caption" align="center" permitirEscalaFonte={permitirEscalaFonte}>
                  Enviando imagens: {progressoImagens.atual} de {progressoImagens.total}
                </ThemedText>
                <View
                  style={{
                    height: 4,
                    backgroundColor: t.colors.borderLight,
                    borderRadius: 2,
                    marginTop: 8,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${progressoImagens.total > 0 ? (progressoImagens.atual / progressoImagens.total) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: t.colors.primary,
                    }}
                  />
                </View>
              </View>
            )}
          </CardSecao>

          <View style={estilos.botaoContainer}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSalvarLocal}
              iconLeft="add"
              loading={enviando}
              fullWidth
              style={estilos.botaoPrincipal}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            >
              {enviando ? 'Salvando...' : (editingLocalId ? 'Salvar Alterações' : 'Adicionar Local')}
            </Button>
          </View>
        </View>

        {mostrarCardsLaterais && (
          <View style={estilos.colunaLateral}>
            <CardInfoIcone
              titulo="Próximos passos"
              icone="navigate-outline"
              corIcone={t.colors.primary}
              corFundoIcone={isHighContrast ? t.colors.surfaceSecondary : '#E8F0FF'}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
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
              titulo="Dica importante"
              icone="bulb-outline"
              corIcone={t.colors.warning}
              corFundoIcone={isHighContrast ? t.colors.surfaceSecondary : '#FFF1CC'}
              fundo={isHighContrast ? t.colors.surface : '#FFF5E1'}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            >
              <ThemedText color="textSecondary" permitirEscalaFonte={permitirEscalaFonte}>
                Seja específico ao marcar os recursos de acessibilidade. Isso ajuda pessoas com diferentes necessidades a encontrar locais adequados para elas.
              </ThemedText>
            </CardInfoIcone>

            <CardInfoIcone
              titulo="Contribua com a Comunidade"
              icone="heart"
              corIcone={t.colors.secondary}
              corFundoIcone={isHighContrast ? t.colors.surfaceSecondary : '#DFF6EA'}
              fundo={isHighContrast ? t.colors.surface : '#EAF8F0'}
              layout="coluna"
              centralizado
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            >
              <ThemedText color="textSecondary" align="center" permitirEscalaFonte={permitirEscalaFonte}>
                Cada local adicionado com informações precisas de acessibilidade ajuda a tornar o mundo mais inclusivo para todos.
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
        )}
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

function criarEstilos(t, usarDuasColunas, mostrarCardsLaterais, fontSizeMultiplier = 1) {
  const fonteGrande = Number(fontSizeMultiplier) >= 1.5;
  const fonteMuitoGrande = Number(fontSizeMultiplier) >= 2;
  const alturaCampo = fonteMuitoGrande ? 72 : fonteGrande ? 64 : 56;
  const alturaCampoMultiline = fonteMuitoGrande ? 220 : fonteGrande ? 180 : 140;
  const paddingHorizontalPagina = fonteMuitoGrande ? t.spacing.md : t.spacing.lg;
  const gapConteudo = fonteMuitoGrande ? t.spacing.xl : t.spacing.xxl;

  return StyleSheet.create({
    scroll: {
      width: '100%',
      alignSelf: 'center',
      maxWidth: fonteMuitoGrande ? 1260 : 1320,
      paddingBottom: fonteGrande ? t.spacing.xxxl + t.spacing.sm : t.spacing.xxxl,
      paddingHorizontal: paddingHorizontalPagina,
    },
    header: {
      alignItems: 'flex-start',
      marginBottom: fonteGrande ? t.spacing.lg : t.spacing.xl,
    },
    conteudo: {
      flexDirection: mostrarCardsLaterais ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
      gap: gapConteudo,
    },
    colunaPrincipal: {
      width: mostrarCardsLaterais ? '68%' : '100%',
      maxWidth: mostrarCardsLaterais ? '68%' : '100%',
      minWidth: 0,
    },
    colunaLateral: {
      width: fonteMuitoGrande ? '32%' : '30%',
      maxWidth: fonteMuitoGrande ? 360 : 340,
      minWidth: fonteMuitoGrande ? 300 : 280,
      gap: fonteGrande ? t.spacing.md : t.spacing.lg,
      alignSelf: 'flex-start',
    },
    linhaCampos: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: fonteGrande ? t.spacing.md : t.spacing.lg,
    },
    colunaCampo: {
      width: usarDuasColunas ? '49%' : '100%',
      flexBasis: usarDuasColunas ? '49%' : '100%',
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: usarDuasColunas ? '49%' : '100%',
    },
    campoContainer: {
      marginBottom: fonteGrande ? t.spacing.sm : t.spacing.md,
    },
    campoLabel: {
      fontSize: fonteMuitoGrande
        ? t.typography.fontSize.lg
        : fonteGrande
          ? t.typography.fontSize.md
          : t.typography.fontSize.sm,
      lineHeight: fonteMuitoGrande ? 30 : fonteGrande ? 26 : 22,
    },
    campoTexto: {
      lineHeight: fonteMuitoGrande ? 28 : fonteGrande ? 24 : 21,
      paddingVertical: fonteGrande ? t.spacing.xs : t.spacing.sm,
    },
    campoTextoMultiline: {
      minHeight: alturaCampoMultiline,
    },
    campoSelect: {
      minHeight: alturaCampo,
      height: alturaCampo,
      paddingHorizontal: fonteGrande ? t.spacing.sm : t.spacing.md,
    },
    campoDescricaoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: fonteGrande ? t.spacing.xs : t.spacing.sm,
    },
    recursosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
      rowGap: fonteGrande ? t.spacing.md : t.spacing.lg,
    },
    recursoItem: {
      width: usarDuasColunas ? '49%' : '100%',
      flexBasis: usarDuasColunas ? '49%' : '100%',
      maxWidth: usarDuasColunas ? '49%' : '100%',
    },
    botaoContainer: {
      alignItems: 'stretch',
      width: '100%',
      marginTop: fonteGrande ? t.spacing.md : t.spacing.lg,
    },
    botaoPrincipal: {
      minHeight: alturaCampo,
      width: '100%',
      alignSelf: 'stretch',
    },
  });
}
