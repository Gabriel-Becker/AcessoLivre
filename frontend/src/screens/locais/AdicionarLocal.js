import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Recipiente } from '../../components/layout';
import {
  Botao,
  CabecalhoPagina,
  CardInfoIcone,
  CardSecao,
  CartaoMetricas,
  CartaoSelecao,
  Entrada,
  ListaMarcadores,
  Selecao,
} from '../../components/ui';
import { TextoTematizado, Espacador } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/ContextoAutenticacao';
import ServicoLocal from '../../services/ServicoLocal';
import ServicoBusca from '../../services/ServicoBusca';
import api from '../../api/axios';
import { formatCEP } from '../../utils/formatters';
import toastHelper from '../../utils/toastHelper';
import { CATEGORIAS } from '../../constants/enums';
import { obterCategoriaIcone, obterCategoriaLabel } from '../../config/categoriasConfig';
import { breakpoints, getTheme } from '../../config/theme';

const RECURSOS_ACESSIBILIDADE = [
  { id: 'rampa', titulo: 'Rampa de acesso', descricao: 'Rampa para cadeira de rodas na entrada', icon: 'walk-outline', cor: 'rampa', enumValue: 'RAMPA' },
  { id: 'banheiro', titulo: 'Banheiro adaptado', descricao: 'Banheiro com acessibilidade para pessoa com deficiência', icon: 'man-outline', cor: 'banheiro', enumValue: 'BANHEIRO_ADAPTADO' },
  { id: 'elevador', titulo: 'Elevador acessível', descricao: 'Elevador funcionando com botões em Braille', icon: 'business-outline', cor: 'elevador', enumValue: 'ELEVADOR' },
  { id: 'piso', titulo: 'Piso tátil', descricao: 'Piso com textura para orientação', icon: 'trail-sign-outline', cor: 'audiovisual', enumValue: 'PISO_TATIL' },
  { id: 'braille', titulo: 'Sinalização em Braille', descricao: 'Placas e informações em Braille', icon: 'eye-outline', cor: 'braile', enumValue: 'SINALIZACAO_BRAILLE' },
  { id: 'estacionamento', titulo: 'Estacionamento acessível', descricao: 'Vagas reservadas para pessoa com deficiência', icon: 'car-outline', cor: 'estacionamento', enumValue: 'ESTACIONAMENTO' },
  { id: 'espaco', titulo: 'Espaço amplo', descricao: 'Corredores largos para circulação', icon: 'resize-outline', cor: 'secondary', enumValue: 'ESPACO_AMPLO' },
  { id: 'audiovisual', titulo: 'Recursos audiovisuais', descricao: 'Sistemas de som e sinalização visual', icon: 'volume-high-outline', cor: 'audiovisual', enumValue: 'RECURSOS_AUDIOVISUAIS' },
  { id: 'atendimento', titulo: 'Atendimento especializado', descricao: 'Equipe treinada para atender pessoa com deficiência', icon: 'heart-outline', cor: 'secondary', enumValue: 'ATENDIMENTO_ESPECIALIZADO' },
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
    const inputArquivo = document.createElement('input');
    inputArquivo.type = 'file';
    inputArquivo.multiple = true;
    inputArquivo.accept = 'image/jpeg,image/png,image/webp';

    inputArquivo.onchange = (e) => {
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

    inputArquivo.click();
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
          <TextoTematizado align="center" permitirEscalaFonte={permitirEscalaFonte}>
            {isDragging ? 'Solte as imagens aqui' : 'Arraste e solte imagens ou clique para selecionar'}
          </TextoTematizado>
          <TextoTematizado color="textTertiary" variant="caption" align="center" permitirEscalaFonte={permitirEscalaFonte}>
            PNG, JPG até 10MB cada (máx. 5 imagens)
          </TextoTematizado>
        </div>
        {renderPreview()}
        <View style={localStyles.actionButtons}>
          <Botao variant="outline" size="small" onPress={handleSelectFiles} iconLeft="images-outline" altoContraste={isHighContrast}>
            Galeria
          </Botao>
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
        <TextoTematizado align="center" permitirEscalaFonte={permitirEscalaFonte}>
          Clique para selecionar imagens
        </TextoTematizado>
        <TextoTematizado color="textTertiary" variant="caption" align="center" permitirEscalaFonte={permitirEscalaFonte}>
          PNG, JPG até 10MB cada (máx. 5 imagens)
        </TextoTematizado>
      </TouchableOpacity>
      {renderPreview()}
      <View style={localStyles.actionButtons}>
        <Botao variant="outline" size="small" onPress={handleSelectFiles} iconLeft="images-outline" altoContraste={isHighContrast}>
          Galeria
        </Botao>
        <Botao variant="outline" size="small" onPress={handleTakePhoto} iconLeft="camera-outline" altoContraste={isHighContrast}>
          Câmera
        </Botao>
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

const ModalVinculoLocal = ({ visible, onClose, onSelect, onCriarLocalPrincipal, isHighContrast, theme, permitirEscalaFonte = true, usuario, localIdAtual, buscaAtual }) => {
  const [busca, setBusca] = useState(buscaAtual || '');
  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const timeoutRef = useRef(null);

  const buscarLocais = async (termo) => {
    if (!termo || termo.length < 2) {
      setLocais([]);
      return;
    }

    setCarregando(true);
    try {
      const response = await api.get('/locais/buscar', { 
        params: { 
          searchText: termo,
          size: 20 
        } 
      });
      let lista = response.data?.content || response.data || [];
      if (localIdAtual) {
        lista = lista.filter(local => local.idLocal !== localIdAtual);
      }
      setLocais(lista);
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
      setLocais([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (visible && busca.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        buscarLocais(busca);
      }, 300);
    } else if (busca.length < 2) {
      setLocais([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [busca, visible]);

  useEffect(() => {
    if (!visible) {
      setBusca('');
      setSelecionado(null);
      setLocais([]);
    } else if (buscaAtual) {
      setBusca(buscaAtual);
    }
  }, [visible, buscaAtual]);

  const handleConfirmar = () => {
    if (selecionado) {
      onSelect(selecionado);
      onClose();
    }
  };

  const handlePular = () => {
    onSelect(null);
    onClose();
  };

  const handleCriarLocalPrincipal = () => {
    onClose();
    if (onCriarLocalPrincipal) {
      onCriarLocalPrincipal(busca);
    }
  };

  const mostrarResultados = locais.length > 0;
  const nenhumResultado = busca.length >= 2 && !carregando && locais.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={[
          modalStyles.modalContainer,
          { 
            backgroundColor: theme.colors.surface,
            maxWidth: Platform.OS === 'web' ? 560 : '96%',
            width: Platform.OS === 'web' ? '100%' : '96%',
          }
        ]}>
          <View style={modalStyles.modalHeader}>
            <TextoTematizado variant="h3" weight="bold" permitirEscalaFonte={permitirEscalaFonte}>
              Vincular a um local principal?
            </TextoTematizado>
            <TouchableOpacity onPress={onClose} style={modalStyles.modalClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Espacador size="sm" />
          <TextoTematizado color="textSecondary" permitirEscalaFonte={permitirEscalaFonte}>
            Este local faz parte de um local maior? Ex: loja dentro de um shopping
          </TextoTematizado>
          <Espacador size="md" />
          <Entrada
            placeholder="Buscar local principal..."
            value={busca}
            onChangeText={setBusca}
            containerStyle={modalStyles.modalInput}
            altoContraste={isHighContrast}
            permitirEscalaFonte={permitirEscalaFonte}
            iconLeft="search-outline"
          />
          <Espacador size="sm" />
          {carregando ? (
            <View style={modalStyles.modalLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <TextoTematizado variant="caption" permitirEscalaFonte={permitirEscalaFonte}>Buscando locais...</TextoTematizado>
            </View>
          ) : (
            <ScrollView style={modalStyles.modalLista} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {mostrarResultados && locais.map((local) => (
                <TouchableOpacity
                  key={local.idLocal}
                  style={[
                    modalStyles.modalItem,
                    {
                      backgroundColor: selecionado?.idLocal === local.idLocal 
                        ? theme.colors.primary + '20' 
                        : 'transparent',
                      borderBottomColor: theme.colors.borderLight,
                      borderWidth: selecionado?.idLocal === local.idLocal ? 2 : 0,
                      borderColor: selecionado?.idLocal === local.idLocal ? theme.colors.primary : 'transparent',
                    }
                  ]}
                  onPress={() => setSelecionado(local)}
                >
                  <View style={modalStyles.modalItemContent}>
                    <View style={modalStyles.modalItemRadio}>
                      {selecionado?.idLocal === local.idLocal && (
                        <View style={[modalStyles.modalItemRadioSelected, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </View>
                    <View style={modalStyles.modalItemInfo}>
                      <TextoTematizado weight="medium" permitirEscalaFonte={permitirEscalaFonte}>
                        {local.nome}
                      </TextoTematizado>
                      <TextoTematizado variant="caption" color="textTertiary" permitirEscalaFonte={permitirEscalaFonte}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.textTertiary} /> {local.endereco?.cidade || 'Cidade não informada'}, {local.endereco?.estado || 'Estado não informado'}
                      </TextoTematizado>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {nenhumResultado && (
                <View style={modalStyles.modalEmpty}>
                  <Ionicons name="search-outline" size={48} color={theme.colors.textTertiary} />
                  <TextoTematizado color="textSecondary" align="center" permitirEscalaFonte={permitirEscalaFonte}>
                    Nenhum local principal encontrado
                  </TextoTematizado>
                  <TouchableOpacity
                    style={modalStyles.modalCriarButton}
                    onPress={handleCriarLocalPrincipal}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                    <TextoTematizado color="primary" weight="semibold" permitirEscalaFonte={permitirEscalaFonte}>
                      Criar Local Principal
                    </TextoTematizado>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
          <Espacador size="lg" />
          <View style={modalStyles.modalBotoes}>
            <Botao
              variant="outline"
              size="medium"
              onPress={handlePular}
              style={modalStyles.modalBotao}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            >
              Pular (sem vínculo)
            </Botao>
            <Botao
              variant="primary"
              size="medium"
              onPress={handleConfirmar}
              disabled={!selecionado}
              style={modalStyles.modalBotao}
              altoContraste={isHighContrast}
              permitirEscalaFonte={permitirEscalaFonte}
            >
              Vincular
            </Botao>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 16 : 8,
  },
  modalContainer: {
    borderRadius: 20,
    padding: Platform.OS === 'web' ? 24 : 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalClose: {
    padding: 4,
  },
  modalInput: {
    marginBottom: 0,
  },
  modalLoading: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  modalLista: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0,
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 16,
  },
  modalCriarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF30',
    borderRadius: 12,
    backgroundColor: '#007AFF10',
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBotao: {
    flex: 1,
  },
});

export default function AdicionarLocal({ onNavigate, navigation, routeParams }) {
  const permitirEscalaFonte = true;
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const t = useMemo(() => getTheme(isHighContrast, fontSizeMultiplier), [isHighContrast, fontSizeMultiplier]);
  const { usuario } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const larguraVisual = Platform.OS === 'web' && typeof window !== 'undefined'
    ? (window.visualViewport?.width || window.innerWidth || width)
    : width;
  const fonteGrande = Number(fontSizeMultiplier) >= 1.5;
  const usarDuasColunas = larguraVisual >= Math.max(920, breakpoints.tablet) && !fonteGrande;
  const mostrarCardsLaterais = Platform.OS === 'web' && larguraVisual >= Math.max(1280, breakpoints.desktop) && !fonteGrande;
  const paddingInferiorBase = fonteGrande ? t.spacing.xxxl + t.spacing.sm : t.spacing.xxxl;
  const paddingInferiorMobile = Platform.OS === 'web' ? 0 : 28 + Math.max(insets.bottom, t.spacing.sm);

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
  const [modalVinculoVisible, setModalVinculoVisible] = useState(false);
  const [localPrincipalSelecionado, setLocalPrincipalSelecionado] = useState(null);
  const [buscaModal, setBuscaModal] = useState('');

  const limparFormularioCompleto = () => {
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
    setLocalPrincipalSelecionado(null);
    setProgressoImagens({ atual: 0, total: 0 });
    setEditingLocalId(null);
    setCepBuscado('');
  };

  const opcoesCategoria = useMemo(() => (
    CATEGORIAS.map((categoria) => ({
      value: categoria,
      label: obterCategoriaLabel(categoria),
      icon: obterCategoriaIcone(categoria),
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
        const dados = await ServicoLocal.obterEstatisticas();
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
        const data = await ServicoLocal.obterLocal(localId);
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

  const handleSalvarComVinculo = async (localPrincipalParaVinculo = localPrincipalSelecionado) => {
    if (enviando) return;
    
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
        nomeLocalPrincipal: localPrincipalParaVinculo?.nome || null,
        idLocalPrincipal: localPrincipalParaVinculo?.idLocal || null,
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
        ? await ServicoLocal.atualizarLocal(editingLocalId, payloadLocal)
        : await ServicoLocal.cadastrarLocal(payloadLocal);

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
      limparFormularioCompleto();

      if (typeof ServicoBusca.invalidateCache === 'function') {
        ServicoBusca.invalidateCache();
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
      console.error('Erro ao cadastrar local:', erro);
      const mensagem = erro.response?.data?.message || erro.response?.data?.error || erro.message || 'Erro ao cadastrar local. Tente novamente.';
      toastHelper.showError(typeof mensagem === 'string' ? mensagem : JSON.stringify(mensagem));
    } finally {
      setEnviando(false);
      setProgressoImagens({ atual: 0, total: 0 });
    }
  };

  const handleSalvarLocal = () => {
    if (enviando) return;
    if (!validarFormulario()) return;
    setBuscaModal('');
    setModalVinculoVisible(true);
  };

  const handleLocalPrincipalSelecionado = (local) => {
    if (local) {
      setLocalPrincipalSelecionado(local);
    }
    setModalVinculoVisible(false);
    handleSalvarComVinculo(local || null);
  };

  const handleCriarLocalPrincipal = (nomeSugerido) => {
    limparFormularioCompleto();
    setFormulario(prev => ({ ...prev, nome: nomeSugerido }));
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

  const handleNavigate = (screen, params) => {
    if (onNavigate) {
      onNavigate(screen, params);
    } else if (navigation) {
      navigation.navigate(screen, params);
    }
  };

  return (
    <Recipiente
      scroll
      background={isHighContrast ? 'background' : 'backgroundSecondary'}
      altoContraste={isHighContrast}
      contentStyle={[estilos.scroll, { paddingBottom: paddingInferiorBase + paddingInferiorMobile }]}
    >
      <CabecalhoPagina
        titulo="Adicionar Local"
        subtitulo="Cadastre um novo local acessível para a comunidade"
        onVoltar={handleVoltar}
        textoVoltar="Voltar"
        altoContraste={isHighContrast}
        permitirEscalaFonte={permitirEscalaFonte}
        style={estilos.Cabecalho}
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
                <Entrada
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
                <Selecao
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
                <Entrada
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
                <Entrada
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
            <Entrada
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
                <Entrada
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
                <Entrada
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
                <Entrada
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
                <Entrada
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
              <TextoTematizado color="textPrimary" weight="medium" style={estilos.campoLabel} permitirEscalaFonte={permitirEscalaFonte}>
                Descrição *
              </TextoTematizado>
              <TextoTematizado color="textTertiary" variant="caption" permitirEscalaFonte={permitirEscalaFonte}>
                {contadorDescricao}
              </TextoTematizado>
            </View>
            <Entrada
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
              <TextoTematizado color="textSecondary" variant="caption" permitirEscalaFonte={permitirEscalaFonte}>
                {Object.values(recursosSelecionados).filter(Boolean).length} recurso(s) selecionado(s)
              </TextoTematizado>
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
                <TextoTematizado variant="caption" align="center" permitirEscalaFonte={permitirEscalaFonte}>
                  Enviando imagens: {progressoImagens.atual} de {progressoImagens.total}
                </TextoTematizado>
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
            <Botao
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
            </Botao>
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
              <TextoTematizado color="textSecondary" permitirEscalaFonte={permitirEscalaFonte}>
                Seja específico ao marcar os recursos de acessibilidade. Isso ajuda pessoas com diferentes necessidades a encontrar locais adequados para elas.
              </TextoTematizado>
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
              <TextoTematizado color="textSecondary" align="center" permitirEscalaFonte={permitirEscalaFonte}>
                Cada local adicionado com informações precisas de acessibilidade ajuda a tornar o mundo mais inclusivo para todos.
              </TextoTematizado>
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
      <ModalVinculoLocal
        visible={modalVinculoVisible}
        onClose={() => setModalVinculoVisible(false)}
        onSelect={handleLocalPrincipalSelecionado}
        onCriarLocalPrincipal={handleCriarLocalPrincipal}
        isHighContrast={isHighContrast}
        theme={t}
        permitirEscalaFonte={permitirEscalaFonte}
        usuario={usuario}
        localIdAtual={editingLocalId}
        buscaAtual={buscaModal}
      />
    </Recipiente>
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
    Cabecalho: {
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
      fontSize: fonteMuitoGrande ? t.typography.fontSize.lg : fonteGrande ? t.typography.fontSize.md : t.typography.fontSize.sm,
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
