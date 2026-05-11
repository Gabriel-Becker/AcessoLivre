// src/services/LocalService.js
import api from '../api/axios';

const LocalService = {
  /**
   * Cadastra um novo local
   */
  async cadastrarLocal(dados) {
    const response = await api.post('/locais', dados);
    return response.data;
  },

  /**
   * Envia uma imagem para um local via Multipart FormData
   */
  async enviarImagem(idLocal, imagem) {
    const formData = new FormData();
    formData.append('idLocal', idLocal.toString());
    
    const filename = imagem.name || imagem.uri?.split('/').pop() || `photo_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = imagem.type || (match ? `image/${match[1]}` : 'image/jpeg');
    
    // Para React Native / Expo - sem type assertion
    formData.append('arquivo', {
      uri: imagem.uri,
      name: filename,
      type: type,
    });
    
    const response = await api.post('/imagens', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },

  /**
   * Envia múltiplas imagens
   */
  async enviarMultiplasImagens(idLocal, imagens, onProgress) {
    const resultados = [];
    
    for (let i = 0; i < imagens.length; i++) {
      if (onProgress) {
        onProgress(i + 1, imagens.length);
      }
      const resultado = await this.enviarImagem(idLocal, imagens[i]);
      resultados.push(resultado);
    }
    
    return resultados;
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