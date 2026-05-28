import api from '../api/axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const LocalService = {
  /**
   * Cadastra um novo local
   */
  async cadastrarLocal(dados) {
    const response = await api.post('/locais', dados);
    return response.data;
  },

  /**
   * Converte imagem para o formato correto do FormData no React Native
   */
  async prepararImagemParaUpload(imagem) {
    try {
      let uri = imagem.uri;
      let filename = imagem.name || `image_${Date.now()}.jpg`;
      let type = imagem.type || 'image/jpeg';

      // Para React Native, verificamos se o arquivo existe
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error(`Arquivo não encontrado: ${uri}`);
        }

        return {
          uri,
          name: filename,
          type,
          size: fileInfo.size,
        };
      }

      // Para web
      if (imagem.file) {
        return imagem.file;
      }

      return {
        uri,
        name: filename,
        type,
      };
    } catch (error) {
      console.error('Erro ao preparar imagem:', error);
      throw error;
    }
  },

  /**
   * Envia uma imagem para um local via Multipart FormData
   */
  async enviarImagem(idLocal, imagem, onProgress) {
    const formData = new FormData();
    formData.append('idLocal', String(idLocal));

    try {
      // Preparar a imagem para upload
      const imagemPreparada = await this.prepararImagemParaUpload(imagem);

      // Criar o objeto para o FormData no formato correto para React Native
      let arquivoParaEnviar;
      
      if (Platform.OS !== 'web') {
        // React Native: formato esperado pelo backend
        arquivoParaEnviar = {
          uri: imagemPreparada.uri,
          name: imagemPreparada.name,
          type: imagemPreparada.type,
        };
      } else if (Platform.OS === 'web' && imagem.file) {
        // Web: usar o File diretamente
        arquivoParaEnviar = imagem.file;
      } else {
        // Fallback
        arquivoParaEnviar = {
          uri: imagemPreparada.uri,
          name: imagemPreparada.name,
          type: imagemPreparada.type,
        };
      }

      formData.append('arquivo', arquivoParaEnviar);

      const response = await api.post('/imagens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress
          ? (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Erro detalhado no upload:', error);
      throw new Error(`Falha ao enviar imagem: ${error.message}`);
    }
  },

  /**
   * Envia múltiplas imagens com controle de progresso
   */
  async enviarMultiplasImagens(idLocal, imagens, onProgress) {
    const resultados = [];
    let imagensEnviadas = 0;
    let imagensComErro = 0;

    for (let i = 0; i < imagens.length; i++) {
      if (onProgress) {
        onProgress(i + 1, imagens.length);
      }

      try {
        const resultado = await this.enviarImagem(idLocal, imagens[i]);
        resultados.push(resultado);
        imagensEnviadas++;
      } catch (erro) {
        console.error(`❌ Erro na imagem ${i + 1}:`, erro);
        imagensComErro++;
        // Continua com as próximas imagens
      }
    }

    return {
      resultados,
      total: imagens.length,
      enviadas: imagensEnviadas,
      erros: imagensComErro,
    };
  },

  /**
   * Busca todas as imagens de um local
   */
  async buscarImagensDoLocal(idLocal) {
    const response = await api.get(`/imagens/local/${idLocal}`);
    return response.data;
  },

  /**
   * Remove uma imagem
   */
  async removerImagem(idImagem) {
    await api.delete(`/imagens/${idImagem}`);
    return true;
  },

  /**
   * Obtém URL completa da imagem
   */
  getImagemUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseURL = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8080';
    return `${baseURL}${url}`;
  },

  /**
   * Lista locais com paginação
   */
  async listarLocais(params = {}) {
    const { page = 0, size = 20, sort = 'nome' } = params;
    const response = await api.get('/locais', { params: { page, size, sort } });
    return response.data;
  },

  async obterMeusLocais(idUsuario) {
    if (!idUsuario) return [];
    const response = await api.get(`/locais/usuario/${idUsuario}`);
    return response.data || [];
  },

  /**
   * Busca locais em destaque
   */
  async obterLocaisEmDestaque(limite = 4) {
    const response = await api.get('/locais', {
      params: { page: 0, size: limite, sort: 'dataCriacao,desc' }
    });
    return response.data?.content || [];
  },

  /**
   * Busca estatísticas gerais
   */
  async obterEstatisticas() {
    const response = await api.get('/locais', { params: { page: 0, size: 1 } });
    return { 
      totalLocais: response.data?.totalElements || 0, 
      totalAvaliacoes: 0, 
      totalUsuarios: 0 
    };
  },

  /**
   * Busca um local por ID
   */
  async obterLocal(id) {
    const response = await api.get(`/locais/${id}`);
    return response.data;
  },

  /**
   * Atualiza um local
   */
  async atualizarLocal(id, dados) {
    const response = await api.put(`/locais/${id}`, dados);
    return response.data;
  },

  /**
   * Remove um local
   */
  async removerLocal(id) {
    const response = await api.delete(`/locais/${id}`);
    return response.data;
  },

  /**
   * Busca locais por categoria
   */
  async buscarPorCategoria(categoria) {
    const response = await api.get(`/locais/categoria/${categoria}`);
    return response.data || [];
  },

  /**
   * Busca locais por tipo de acessibilidade
   */
  async buscarPorTipoAcessibilidade(tipo) {
    const response = await api.get(`/locais/tipo-acessibilidade/${tipo}`);
    return response.data || [];
  }
};

export default LocalService;