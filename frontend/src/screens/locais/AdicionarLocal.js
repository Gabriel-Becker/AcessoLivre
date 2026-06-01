import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  useWindowDimensions, 
  Image, 
  TouchableOpacity, 
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

import { Container } from '../../components/layout';
import {
  Button,
  CabecalhoPagina,
  CardSecao,
  CartaoSelecao,
  Input,
  Select,
} from '../../components/ui';
import { ThemedText, Spacer } from '../../components/commons';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import LocalService from '../../services/LocalService';
import HomeService from '../../services/HomeService';
import api from '../../api/axios';
import { formatCEP } from '../../utils/formatters';
import toastHelper from '../../utils/toastHelper';
import { CATEGORIAS } from '../../constants/enums';

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

const LARGURA_MINIMA_DUAS_COLUNAS_CAMPOS = 1200;

// ============================================
// COMPONENTE DE UPLOAD DE IMAGENS
// ============================================
const ImageUploadArea = ({ images, onAddImages, onRemoveImage, isHighContrast, theme }) => {
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
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const newImages = imageFiles.map((file) => ({
        uri: URL.createObjectURL(file),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      onAddImages(newImages);
    }
  };

  const handleSelectFilesWeb = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/jpeg,image/png,image/webp';
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        const newImages = imageFiles.map((file) => ({
          uri: URL.createObjectURL(file),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
        }));
        onAddImages(newImages);
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
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'image/jpeg',
      }));
      onAddImages(newImages);
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
      const newImage = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'image/jpeg',
      };
      onAddImages([newImage]);
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
            key={index}
            style={[
              localStyles.previewItem,
              {
                borderColor: isHighContrast ? theme.colors.border : theme.colors.borderLight,
                backgroundColor: isHighContrast ? theme.colors.surfaceSecondary : theme.colors.surface,
              },
            ]}
          >
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
          <ThemedText align="center">
            {isDragging ? 'Solte as imagens aqui' : 'Arraste e solte imagens ou clique para selecionar'}
          </ThemedText>
          <ThemedText color="textTertiary" variant="caption" align="center">
            PNG, JPG até 10MB cada (máx. 5 imagens)
          </ThemedText>
        </div>

        {renderPreview()}

        <View style={localStyles.actionButtons}>
          <Button
            variant="outline"
            size="small"
            onPress={handleSelectFiles}
            iconLeft="images-outline"
            altoContraste={isHighContrast}
          >
            Galeria
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={[localStyles.dropArea, { borderColor: isHighContrast ? theme.colors.primary : '#ddd', backgroundColor: isHighContrast ? theme.colors.surface : '#f9f9f9', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg }]}
        onPress={handleSelectFiles}
      >
        <Ionicons name="cloud-upload-outline" size={48} color={isHighContrast ? theme.colors.textPrimary : theme.colors.textSecondary} />
        <ThemedText align="center">Clique para selecionar imagens</ThemedText>
        <ThemedText color="textTertiary" variant="caption" align="center">
          PNG, JPG até 10MB cada (máx. 5 imagens)
        </ThemedText>
      </TouchableOpacity>

      {renderPreview()}

      <View style={localStyles.actionButtons}>
        <Button
          variant="outline"
          size="small"
          onPress={handleSelectFiles}
          iconLeft="images-outline"
          altoContraste={isHighContrast}
        >
          Galeria
        </Button>
        <Button
          variant="outline"
          size="small"
          onPress={handleTakePhoto}
          iconLeft="camera-outline"
          altoContraste={isHighContrast}
        >
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
  const { isHighContrast, theme: t } = useThemeContext();
  const { usuario } = useAuth();
  const { width } = useWindowDimensions();

  const usarDuasColunasCampos = width >= LARGURA_MINIMA_DUAS_COLUNAS_CAMPOS;

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

  const opcoesCategoria = useMemo(() => {
    return CATEGORIAS.map(categoria => ({
      value: categoria,
      label: CATEGORIAS_LABELS[categoria] || categoria,
    }));
  }, []);

  const estilos = useMemo(() => criarEstilos(t, isHighContrast, usarDuasColunasCampos), [
    isHighContrast,
    usarDuasColunasCampos,
    t,
  ]);

  const contadorDescricao = `${formulario.descricao.length}/${LIMITES_CAMPOS_LOCAL.descricao}`;

  useEffect(() => {
    const localId = routeParams?.localId;
    if (!localId) return;

    const carregarLocalParaEdicao = async () => {
      try {
        setEnviando(true);
        const data = await LocalService.obterLocal(localId);
        if (data) {
          setFormulario((prev) => ({
            ...prev,
            nome: data.nome || '',
            categoria: data.categoria || null,
            descricao: data.descricao || '',
            cep: data.endereco?.cep || '',
            logradouro: data.endereco?.logradouro || '',
            numero: data.endereco?.numero || '',
            complemento: data.endereco?.complemento || '',
            bairro: data.endereco?.bairro || '',
            cidade: data.endereco?.cidade || '',
            estado: data.endereco?.estado || '',
          }));

          const recursosObj = {};
          const tipos = Array.isArray(data.tiposAcessibilidade) ? data.tiposAcessibilidade : (data.tiposAcessibilidade ? Object.values(data.tiposAcessibilidade) : []);
          RECURSOS_ACESSIBILIDADE.forEach((recurso) => {
            recursosObj[recurso.id] = tipos.includes(recurso.enumValue);
          });
          setRecursosSelecionados(recursosObj);

          setImagens([]);
          setEditingLocalId(localId);
        }
      } catch (erro) {
        console.error('Erro ao carregar local para edição:', erro);
        toastHelper.showError('Não foi possível carregar o local para edição.');
      } finally {
        setEnviando(false);
      }
    };

    carregarLocalParaEdicao();
  }, [routeParams]);

  const adicionarImagens = (novasImagens) => {
    const MAX_IMAGES = 5;
    const MAX_SIZE = 10 * 1024 * 1024;
    
    const validImages = novasImagens.filter(img => {
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

    setImagens(prev => [...prev, ...validImages]);
  };

  const removerImagem = (index) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarCampo = (campo, limite) => (valor) => {
    const texto = typeof valor === 'string' ? valor : '';

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: limite ? texto.slice(0, limite) : texto,
    }));
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

  // ============================================
  // MÉTODO PRINCIPAL - SALVAR LOCAL COM UPLOAD
  // ============================================
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
        tiposAcessibilidade: tiposAcessibilidade,
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

      let localId = null;
      if (editingLocalId) {
        await LocalService.atualizarLocal(editingLocalId, payloadLocal);
        localId = editingLocalId;
      } else {
        const localResponse = await LocalService.cadastrarLocal(payloadLocal);
        localId = localResponse.idLocal || localResponse.id;
      }

      if (imagens.length > 0) {
        toastHelper.showInfo(`Enviando ${imagens.length} imagem(ns)...`);
        
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
            
            const uploadResp = await api.post('/imagens', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log('[AdicionarLocal] Upload response:', uploadResp?.data);
            
            imagensEnviadas++;
            
          } catch (erroImagem) {
            console.error(`❌ Erro na imagem ${i + 1}:`, erroImagem);
            console.error('Detalhes:', erroImagem.response?.data);
            imagensComErro++;
          }
        }
        
        if (imagensComErro > 0) {
          toastHelper.showWarning(`${imagensEnviadas} imagem(ns) enviadas, ${imagensComErro} falha(s)`);
        } else if (imagensEnviadas > 0) {
          toastHelper.showSuccess(`${imagensEnviadas} imagem(ns) enviadas com sucesso!`);
        }

        // Tentativa de obter o local atualizado do backend para confirmar que as imagens foram associadas
        try {
          const localAtualizado = await HomeService.buscarLocalPorId(localId);
          if (localAtualizado && Array.isArray(localAtualizado.imagens) && localAtualizado.imagens.length > 0) {
            // Se temos imagens, navegar direto para os detalhes do local recém-criado
            if (onNavigate) {
              onNavigate('LocalDetalhes', { id: localId });
            } else if (navigation && navigation.navigate) {
              navigation.navigate('Main', { screen: 'LocalDetalhes', id: localId });
            }
            // encerra aqui para evitar navegar para inicio
            return;
          }
        } catch (e) {
          console.error('[AdicionarLocal] Erro ao buscar local atualizado:', e);
        }
      }

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
      setProgressoImagens({ atual: 0, total: 0 });
      
      if (onNavigate) {
        onNavigate('Inicio', { refreshKey: Date.now() });
      } else if (navigation && typeof navigation.goBack === 'function') {
        // If we don't have onNavigate callback, try to navigate back and attempt to trigger a reload
        try {
          navigation.goBack();
        } catch (e) {
          // fallback: navigate to Main Inicio with refresh
          try { navigation.navigate && navigation.navigate('Main', { screen: 'Inicio', refreshKey: Date.now() }); } catch (err) {}
        }
      }
      
    } catch (erro) {
      console.error('❌ Erro ao cadastrar local:', erro);
      const mensagem = erro.response?.data?.message || 
                      erro.response?.data?.error ||
                      erro.message ||
                      'Erro ao cadastrar local. Tente novamente.';
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 56 : 0}
    >
      <Container
        scroll
        background={isHighContrast ? 'background' : 'backgroundSecondary'}
        altoContraste={isHighContrast}
        contentStyle={estilos.scroll}
        style={{ paddingHorizontal: 0 }}
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
                    labelStyle={estilos.campoLabel}
                    placeholder="Ex: Shopping Center Norte"
                    value={formulario.nome}
                    onChangeText={atualizarCampo('nome', LIMITES_CAMPOS_LOCAL.nome)}
                    maxLength={LIMITES_CAMPOS_LOCAL.nome}
                    containerStyle={estilos.campoContainer}
                    style={estilos.campoTexto}
                    altoContraste={isHighContrast}
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
                  />
                </View>
              </View>

              <View style={estilos.campoDescricaoHeader}>
                <ThemedText color="textPrimary" weight="medium" style={estilos.campoLabel}>
                  Descrição *
                </ThemedText>
                <ThemedText color="textTertiary" variant="caption">
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
              />
            </CardSecao>

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
              descricao="Adicione fotos que mostrem os recursos de acessibilidade do local (máx. 5 fotos)"
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
              
              {enviando && progressoImagens.total > 0 && (
                <View style={{ marginTop: 16 }}>
                  <ThemedText variant="caption" align="center">
                    Enviando imagens: {progressoImagens.atual} de {progressoImagens.total}
                  </ThemedText>
                  <View style={{ 
                    height: 4, 
                    backgroundColor: t.colors.borderLight, 
                    borderRadius: 2, 
                    marginTop: 8,
                    overflow: 'hidden'
                  }}>
                    <View style={{ 
                      width: `${(progressoImagens.atual / progressoImagens.total) * 100}%`, 
                      height: '100%', 
                      backgroundColor: t.colors.primary 
                    }} />
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
              >
                {enviando ? 'Salvando...' : (editingLocalId ? 'Salvar Alterações' : 'Adicionar Local')}
              </Button>
            </View>
          </View>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

function criarEstilos(t, isHighContrast, usarDuasColunasCampos) {
  return StyleSheet.create({
    scroll: {
      width: '100%',
      alignSelf: 'center',
      maxWidth: '100%',
      paddingBottom: t.spacing.xxxl,
      paddingHorizontal: t.spacing.lg,
    },
    header: {
      alignItems: 'flex-start',
      marginBottom: t.spacing.xl,
    },
    conteudo: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      gap: t.spacing.xxl,
    },
    colunaPrincipal: {
      width: '100%',
      maxWidth: '100%',
    },
    linhaCampos: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.lg,
    },
    colunaCampo: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: usarDuasColunasCampos ? '49%' : '100%',
      minWidth: usarDuasColunasCampos ? 300 : '100%',
      maxWidth: '100%',
    },
    campoContainer: {
      marginBottom: t.spacing.md,
    },
    campoLabel: {
      fontSize: 20,
      lineHeight: 28,
    },
    campoTexto: {
      fontSize: 19,
      lineHeight: 26,
      paddingVertical: t.spacing.md,
    },
    campoTextoMultiline: {
      minHeight: 140,
    },
    campoSelect: {
      minHeight: 56,
      height: 56,
      paddingHorizontal: t.spacing.md,
    },
    campoDescricaoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.sm,
    },
    recursosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
      gap: t.spacing.lg,
    },
    recursoItem: {
      width: '100%',
    },
    botaoContainer: {
      alignItems: 'stretch',
      width: '100%',
      marginTop: t.spacing.lg,
    },
    botaoPrincipal: {
      minHeight: 56,
      width: '100%',
      alignSelf: 'stretch',
    },
  });
}