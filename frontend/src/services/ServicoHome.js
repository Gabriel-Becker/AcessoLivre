import api from '../api/axios';
import LocalMapper from './LocalMapper';
import { normalizarUrlImagem } from '../utils/urlImagem';

const HomeService = {

  async obterEstatisticas() {
    try {
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: 1 }
      });

      const totalLocais = response.data?.totalElements || 0;
      return { totalLocais, totalAvaliacoes: 0, totalUsuarios: 0 };
    } catch (erro) {
      console.error('Erro ao buscar estatï¿½sticas:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },

  async obterEstatisticasReais() {
    try {

      let totalLocais = 0;
      try {
        const locaisResponse = await api.get('/locais/todos', {
          params: { page: 0, size: 1 }
        });
        totalLocais = locaisResponse.data?.totalElements || 0;
      } catch (e) {
      }

      let totalUsuarios = 0;
      try {
        const usuariosResponse = await api.get('/usuarios', {
          params: { page: 0, size: 1 }
        });
        totalUsuarios = usuariosResponse.data?.totalElements || 0;
      } catch (e) {
        totalUsuarios = 1;
      }

      let totalAvaliacoes = 0;
      try {
        const avaliacoesResponse = await api.get('/avaliacoes', {
          params: { page: 0, size: 1 }
        });
        totalAvaliacoes = avaliacoesResponse.data?.totalElements || 0;
      } catch (e) {
      }

      return { totalLocais, totalAvaliacoes, totalUsuarios };
    } catch (erro) {
      console.error('Erro ao buscar estatï¿½sticas reais:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },

  async obterLocaisEmDestaque(limite = 4) {
    try {
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: limite, sort: 'dataCriacao,desc' }
      });

      const rawLocais = response.data?.content || [];
      
      const locais = LocalMapper.fromApiList(rawLocais);
      
      return LocalMapper.markNewest(locais);
    } catch (erro) {
      console.error('Erro ao buscar locais em destaque:', erro);
      return [];
    }
  },

  async listarTodosLocais(page = 0, size = 10) {
    try {
      const response = await api.get('/locais/todos', {
        params: { page, size, sort: 'dataCriacao,desc' }
      });

      const rawLocais = response.data?.content || [];
      const locais = LocalMapper.fromApiList(rawLocais);

      return {
        locais,
        totalPages: response.data?.totalPages || 0,
        totalElements: response.data?.totalElements || 0,
        currentPage: page
      };
    } catch (erro) {
      console.error('Erro ao listar locais:', erro);
      return { locais: [], totalPages: 0, totalElements: 0, currentPage: page };
    }
  },

  construirUrlImagem(caminhoRelativo) {
    return normalizarUrlImagem(caminhoRelativo);
  },

  extrairTodasImagens(local) {
    if (!local || !Array.isArray(local.imagens) || local.imagens.length === 0) return [];

    const mapImagens = new Map();
    
    local.imagens.forEach(img => {
      const caminho = img?.caminhoRelativo || img?.urlCompleta || img?.url || img?.imagemUrl;
      const urlNormalizada = normalizarUrlImagem(caminho);

      if (urlNormalizada && !mapImagens.has(urlNormalizada)) {
        mapImagens.set(urlNormalizada, {
          url: urlNormalizada,
          urlCompleta: urlNormalizada,
          caminhoRelativo: img?.caminhoRelativo || caminho,
          idImagem: img?.idImagem,
          ordem: img?.ordem || 0
        });
      }
    });
    
    return Array.from(mapImagens.values())
      .sort((a, b) => a.ordem - b.ordem);
  },

  extrairUrlsImagens(local) {
    const imagens = this.extrairTodasImagens(local);
    return imagens.map(img => img.url);
  },

  extrairPrimeiraImagem(local) {
    const imagens = this.extrairTodasImagens(local);
    return imagens.length > 0 ? imagens[0].url : null;
  },

  async buscarLocalPorId(id) {
    if (!id) {
      console.error('ID nï¿½o informado para buscarLocalPorId');
      return null;
    }
    
    try {
      const response = await api.get(`/locais/${id}`);
      return LocalMapper.fromApi(response.data);
    } catch (erro) {
      console.error(`Erro ao buscar local ${id}:`, erro);
      return null;
    }
  },

  async buscarPorCategoria(categoria, page = 0, size = 10) {
    try {
      const response = await api.get(`/locais/categoria/${categoria}`, {
        params: { page, size }
      });
      
      const rawLocais = response.data?.content || response.data || [];
      const locais = LocalMapper.fromApiList(rawLocais);
      
      return {
        locais,
        totalElements: response.data?.totalElements || locais.length,
        totalPages: response.data?.totalPages || 1,
        currentPage: page
      };
    } catch (erro) {
      console.error(`Erro ao buscar locais por categoria ${categoria}:`, erro);
      return { locais: [], totalElements: 0, totalPages: 0, currentPage: page };
    }
  },

  async buscarPorTipoAcessibilidade(tipo, page = 0, size = 10) {
    try {
      const response = await api.get(`/locais/tipo-acessibilidade/${tipo}`, {
        params: { page, size }
      });
      
      const rawLocais = response.data?.content || response.data || [];
      const locais = LocalMapper.fromApiList(rawLocais);
      
      return {
        locais,
        totalElements: response.data?.totalElements || locais.length,
        totalPages: response.data?.totalPages || 1,
        currentPage: page
      };
    } catch (erro) {
      console.error(`Erro ao buscar locais por tipo ${tipo}:`, erro);
      return { locais: [], totalElements: 0, totalPages: 0, currentPage: page };
    }
  },


  async buscarPorNome(nome, page = 0, size = 10) {
    try {
      const response = await api.get('/locais/buscar', {
        params: { nome, page, size }
      });
      
      const rawLocais = response.data?.content || response.data || [];
      const locais = LocalMapper.fromApiList(rawLocais);
      
      return {
        locais,
        totalElements: response.data?.totalElements || locais.length,
        totalPages: response.data?.totalPages || 1,
        currentPage: page
      };
    } catch (erro) {
      console.error(`Erro ao buscar locais por nome ${nome}:`, erro);
      return { locais: [], totalElements: 0, totalPages: 0, currentPage: page };
    }
  }
};

export default HomeService;