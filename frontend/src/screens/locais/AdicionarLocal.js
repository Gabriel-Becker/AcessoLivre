import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  useWindowDimensions, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { formatCEP } from '../../utils/formatters';
import toastHelper from '../../utils/toastHelper';
import { CATEGORIAS } from '../../constants/enums';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';


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


const ImageUploadArea = ({ images, onAddImages, onRemoveImage, isHighContrast, theme }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);

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
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const newImages = await Promise.all(
        imageFiles.map(async (file) => ({
          uri: URL.createObjectURL(file),
          file,
          name: file.name,
          size: file.size,
        }))
      );
      onAddImages(newImages);
    }
  };

  const handleSelectFiles = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
      }));
      onAddImages(newImages);
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        toastHelper.showError('Permissão de câmera negada');
        return;
      }
    }

    if (!mediaPermission?.granted) {
      const result = await requestMediaPermission();
      if (!result.granted) {
        toastHelper.showError('Permissão de galeria negada');
        return;
      }
    }

    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      const newImage = {
        uri: photo.uri,
        base64: photo.base64,
        name: `photo_${Date.now()}.jpg`,
        size: photo.fileSize || 0,
      };
      
      onAddImages([newImage]);
      setShowCamera(false);
    }
  };

  const renderPreview = () => {
    if (images.length === 0) return null;

    return (
      <View style={localStyles.previewContainer}>
        {images.map((image, index) => (
          <View key={index} style={localStyles.previewItem}>
            <Image source={{ uri: image.uri }} style={localStyles.previewImage} />
            <TouchableOpacity
              style={localStyles.removeButton}
              onPress={() => onRemoveImage(index)}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (showCamera) {
    return (
      <View style={{ flex: 1, height: 400 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
        />
        <View style={{ flexDirection: 'row', gap: 16, padding: 16 }}>
          <Button variant="danger" onPress={() => setShowCamera(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onPress={handleCapture}>
            Tirar Foto
          </Button>
        </View>
      </View>
    );
  }

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
          <Ionicons name="cloud-upload-outline" size={48} color={theme.colors.textSecondary} />
          <ThemedText align="center">
            {isDragging ? 'Solte as imagens aqui' : 'Arraste e solte imagens ou clique para selecionar'}
          </ThemedText>
          <ThemedText color="textTertiary" variant="caption" align="center">
            PNG, JPG até 10MB cada
          </ThemedText>
        </div>
        
        {renderPreview()}
        
        <View style={localStyles.actionButtons}>
          <Button variant="outline" size="small" onPress={handleSelectFiles} iconLeft="images-outline">
            Selecionar
          </Button>
          <Button variant="outline" size="small" onPress={handleTakePhoto} iconLeft="camera-outline">
            Câmera
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity style={localStyles.dropArea} onPress={handleSelectFiles}>
        <Ionicons name="cloud-upload-outline" size={48} color={theme.colors.textSecondary} />
        <ThemedText align="center">Clique para selecionar imagens</ThemedText>
        <ThemedText color="textTertiary" variant="caption" align="center">
          PNG, JPG até 10MB cada
        </ThemedText>
      </TouchableOpacity>

      {renderPreview()}

      <View style={localStyles.actionButtons}>
        <Button variant="outline" size="small" onPress={handleSelectFiles} iconLeft="images-outline">
          Galeria
        </Button>
        <Button variant="outline" size="small" onPress={handleTakePhoto} iconLeft="camera-outline">
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
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  const [recursosSelecionados, setRecursosSelecionados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [imagens, setImagens] = useState([]);
  const [estatisticas] = useState({
    totalLocais: 0,
    totalAvaliacoes: 0,
    totalUsuarios: 0,
  });

  const opcoesCategoria = useMemo(() => {
    return CATEGORIAS.map(categoria => ({
      value: categoria,
      label: CATEGORIAS_LABELS[categoria] || categoria,
    }));
  }, []);

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

  const adicionarImagens = (novasImagens) => {
    const MAX_IMAGES = 10;
    const MAX_SIZE = 10 * 1024 * 1024; 
    
    const validImages = novasImagens.filter(img => {
      if (img.size > MAX_SIZE) {
        toastHelper.showError(`Imagem ${img.name} excede 10MB`);
        return false;
      }
      return true;
    });

    if (imagens.length + validImages.length > MAX_IMAGES) {
      toastHelper.showError(`Máximo de ${MAX_IMAGES} imagens por local`);
      return;
    }

    setImagens(prev => [...prev, ...validImages]);
  };

  const removerImagem = (index) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

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
      } else {
        toastHelper.showError('CEP não encontrado');
      }
    } catch {
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
    const selecionados = Object.keys(recursosSelecionados).filter(id => recursosSelecionados[id]);
    if (!selecionados.length) return [];
    
    const tipos = selecionados.map(id => {
      const recurso = RECURSOS_ACESSIBILIDADE.find(r => r.id === id);
      return recurso?.enumValue;
    }).filter(Boolean);
    
    return tipos;
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

    const tiposAcessibilidade = obterTiposAcessibilidadeArray();
    if (tiposAcessibilidade.length === 0) {
      toastHelper.showError('Selecione pelo menos um recurso de acessibilidade.');
      return false;
    }

    return true;
  };

  const uploadImagem = async (imagem) => {
    try {
      const formData = new FormData();
      
      if (imagem.base64) {
        const blob = await fetch(`data:image/jpeg;base64,${imagem.base64}`).then(res => res.blob());
        formData.append('file', blob, imagem.name);
      } else if (imagem.file) {
        formData.append('file', imagem.file);
      } else {
        const response = await fetch(imagem.uri);
        const blob = await response.blob();
        formData.append('file', blob, imagem.name);
      }
      
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return uploadResponse.data.url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const handleSalvarLocal = async () => {
    if (enviando) return;
    if (!validarFormulario()) return;

    const tiposAcessibilidade = obterTiposAcessibilidadeArray();
    if (tiposAcessibilidade.length === 0) return;

    setEnviando(true);

    try {
      const cepLimpo = formulario.cep.replace(/\D/g, '');
      
      let imagensUrls = [];
      if (imagens.length > 0) {
        toastHelper.showInfo(`Enviando ${imagens.length} imagem(ns)...`);
        const uploadPromises = imagens.map(img => uploadImagem(img));
        const results = await Promise.all(uploadPromises);
        imagensUrls = results.filter(url => url !== null);
      }

      const payloadLocal = {
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim(),
        imagem: imagensUrls[0] || null,
        imagens: imagensUrls,
        categoria: formulario.categoria,
        tiposAcessibilidade: tiposAcessibilidade, 
        idUsuario: usuario.idUsuario,
        idEndereco: null,
        idLocalPrincipal: null,
        status: null,
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

      console.log('Payload enviado:', JSON.stringify(payloadLocal, null, 2)); // Debug

      await LocalService.cadastrarLocal(payloadLocal);
      toastHelper.showSuccess('Local adicionado com sucesso!');

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
      
      if (onNavigate) {
        onNavigate('Inicio');
        navigation?.setParams({ refresh: Date.now() });
      } else if (navigation) {
        navigation.navigate('Main');
      }
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || 
                      erro.response?.data?.message || 
                      'Erro ao cadastrar local. Tente novamente.';
      toastHelper.showError(mensagem);
      console.error('Erro detalhado:', erro.response?.data);
    } finally {
      setEnviando(false);
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
            }
          }
        ]
      );
    } else {
      if (onNavigate) onNavigate('Inicio');
      else if (navigation) navigation.goBack();
    }
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
        style={estilos.header}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
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
                  />
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

            {/* RECURSOS DE ACESSIBILIDADE */}
            <CardSecao
              titulo="Recursos de Acessibilidade"
              descricao="Marque TODOS os recursos de acessibilidade disponíveis no local (pode marcar vários)"
              icone="accessibility-outline"
              corIcone={t.colors.secondary}
              altoContraste={isHighContrast}
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
                  />
                ))}
              </View>
              
              <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.colors.borderLight }}>
                <ThemedText color="textSecondary" variant="caption">
                  {Object.values(recursosSelecionados).filter(Boolean).length} recurso(s) selecionado(s)
                </ThemedText>
              </View>
            </CardSecao>

            <CardSecao
              titulo="Fotos do Local"
              descricao="Adicione fotos que mostrem os recursos de acessibilidade do local"
              icone="camera-outline"
              corIcone={t.colors.primary}
              altoContraste={isHighContrast}
            >
              <ImageUploadArea
                images={imagens}
                onAddImages={adicionarImagens}
                onRemoveImage={removerImagem}
                isHighContrast={isHighContrast}
                theme={t}
              />
            </CardSecao>

            <View style={estilos.botaoContainer}>
              <Button
                variant="primary"
                size="large"
                onPress={handleSalvarLocal}
                iconLeft="add"
                loading={enviando}
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
      </ScrollView>
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