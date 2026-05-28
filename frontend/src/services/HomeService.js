import api from '../api/axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const HomeService = {

  /**
   * Busca estatísticas básicas (apenas locais)
   */
  async obterEstatisticas() {
    try {
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: 1 }
      });

      const totalLocais = response.data?.totalElements || 0;
      return { totalLocais, totalAvaliacoes: 0, totalUsuarios: 0 };
    } catch (erro) {
      console.error('Erro ao buscar estatísticas:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },

  /**
   * Busca estatísticas reais e completas do sistema
   */
  async obterEstatisticasReais() {
    try {
      // Buscar total de locais
      let totalLocais = 0;
      try {
        const locaisResponse = await api.get('/locais/todos', {
          params: { page: 0, size: 1 }
        });
        totalLocais = locaisResponse.data?.totalElements || 0;
      } catch (e) {
      }

      // Buscar total de usuários (endpoint pode não existir ainda)
      let totalUsuarios = 0;
      try {
        const usuariosResponse = await api.get('/usuarios', {
          params: { page: 0, size: 1 }
        });
        totalUsuarios = usuariosResponse.data?.totalElements || 0;
      } catch (e) {
        // Fallback: tentar buscar do token ou estimativa
        totalUsuarios = 1; // pelo menos o usuário atual
      }

      // Buscar total de avaliações
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
      console.error('Erro ao buscar estatísticas reais:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },

  /**
   * Busca locais em destaque (os mais recentes)
   */
  async obterLocaisEmDestaque(limite = 4) {
    try {
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: limite, sort: 'dataCriacao,desc' }
      });

      const locais = response.data?.content || [];
      return locais.map(local => this.formatarLocal(local));
    } catch (erro) {
      console.error('Erro ao buscar locais em destaque:', erro);
      return [];
    }
  },

  /**
   * Lista todos os locais com paginação
   */
  async listarTodosLocais(page = 0, size = 10) {
    try {
      const response = await api.get('/locais/todos', {
        params: { page, size, sort: 'dataCriacao,desc' }
      });

      const locais = response.data?.content || [];

      return {
        locais: locais.map(local => this.formatarLocal(local)),
        totalPages: response.data?.totalPages || 0,
        totalElements: response.data?.totalElements || 0,
        currentPage: page
      };
    } catch (erro) {
      console.error('Erro ao listar locais:', erro);
      return { locais: [], totalPages: 0, totalElements: 0, currentPage: page };
    }
  },

  /**
   * Constrói URL completa da imagem a partir do caminho relativo
   */
  construirUrlImagem(caminhoRelativo) {
    if (!caminhoRelativo) return null;
    if (caminhoRelativo.startsWith('http')) return caminhoRelativo;
    
    // Garantir que não haja barra duplicada
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const path = caminhoRelativo.startsWith('/') ? caminhoRelativo : `/${caminhoRelativo}`;
    
    return `${baseUrl}${path}`;
  },

  /**
   * Extrai todas as imagens do local com URLs completas
   */
  extrairTodasImagens(local) {
    if (!local || !Array.isArray(local.imagens)) return [];
    if (local.imagens.length === 0) return [];

    // Usar Set para remover duplicatas por caminhoRelativo
    const mapImagens = new Map();
    
    local.imagens.forEach(img => {
      if (img.caminhoRelativo && !mapImagens.has(img.caminhoRelativo)) {
        mapImagens.set(img.caminhoRelativo, {
          url: this.construirUrlImagem(img.caminhoRelativo),
          caminhoRelativo: img.caminhoRelativo,
          idImagem: img.idImagem,
          ordem: img.ordem || 0
        });
      }
    });
    
    // Ordenar por ordem
    const imagensOrdenadas = Array.from(mapImagens.values())
      .sort((a, b) => a.ordem - b.ordem);
    
    return imagensOrdenadas;
  },

  /**
   * Extrai apenas as URLs das imagens (array de strings)
   */
  extrairUrlsImagens(local) {
    const imagens = this.extrairTodasImagens(local);
    return imagens.map(img => img.url);
  },

  /**
   * Extrai a primeira imagem do local (thumbnail)
   */
  extrairPrimeiraImagem(local) {
    const imagens = this.extrairTodasImagens(local);
    return imagens.length > 0 ? imagens[0].url : null;
  },

  /**
   * Extrai a primeira imagem do local (objeto completo)
   */
  extrairPrimeiraImagemObjeto(local) {
    const imagens = this.extrairTodasImagens(local);
    return imagens.length > 0 ? imagens[0] : null;
  },

  /**
   * Formata os dados do local para o padrão do frontend
   */
  formatarLocal(local) {
    if (!local) return null;
    
    const imagensCompletas = this.extrairTodasImagens(local);
    const imagensUrls = imagensCompletas.map(img => img.url);
    const primeiraImagemUrl = this.extrairPrimeiraImagem(local);
    const primeiraImagemObj = this.extrairPrimeiraImagemObjeto(local);

    return {
      // Identificação
      id: local.idLocal,
      idLocal: local.idLocal,
      nome: local.nome,
      descricao: local.descricao,
      categoria: local.categoria,
      status: local.status,
      
      // Avaliações
      avaliacaoMedia: local.avaliacaoMedia || 0,
      totalAvaliacoes: local.totalAvaliacoes || 0,
      
      // Imagens (URLs completas)
      imagemUrl: primeiraImagemUrl,
      imagens: imagensUrls,
      imagensCompletas: imagensCompletas, // Objetos completos com metadados
      imagemPrincipal: primeiraImagemUrl,
      primeiraImagem: primeiraImagemObj,
      
      // Tipos de acessibilidade
      tiposAcessibilidade: local.tiposAcessibilidade || [],
      idUsuario: local.idUsuario,
      
      // Datas
      dataCriacao: local.dataCriacao,
      dataAtualizacao: local.dataAtualizacao,
      
      // Endereço
      endereco: local.endereco ? {
        logradouro: local.endereco.logradouro,
        numero: local.endereco.numero,
        complemento: local.endereco.complemento,
        bairro: local.endereco.bairro,
        cidade: local.endereco.cidade,
        estado: local.endereco.estado,
        cep: local.endereco.cep
      } : null,
      
      // Hierarquia
      localPrincipal: local.localPrincipal,
      subLocais: local.subLocais || [],
      nivelHierarquia: local.nivelHierarquia,
      isRaiz: local.isRaiz,
      isFolha: local.isFolha,
      
      // Imagem legada (fallback)
      imagem: local.imagem
    };
  },

  /**
   * Busca um local específico por ID
   */
  async buscarLocalPorId(id) {
    if (!id) {
      console.error('ID não informado para buscarLocalPorId');
      return null;
    }
    
    try {
      const response = await api.get(`/locais/${id}`);
      return this.formatarLocal(response.data);
    } catch (erro) {
      console.error(`Erro ao buscar local ${id}:`, erro);
      return null;
    }
  },

  /**
   * Busca locais por categoria
   */
  async buscarPorCategoria(categoria, page = 0, size = 10) {
    try {
      const response = await api.get(`/locais/categoria/${categoria}`, {
        params: { page, size }
      });
      
      const locais = response.data?.content || response.data || [];
      const isArray = Array.isArray(locais);
      
      return {
        locais: (isArray ? locais : []).map(local => this.formatarLocal(local)),
        totalElements: isArray ? locais.length : (response.data?.totalElements || 0),
        totalPages: response.data?.totalPages || 1,
        currentPage: page
      };
    } catch (erro) {
      console.error(`Erro ao buscar locais por categoria ${categoria}:`, erro);
      return { locais: [], totalElements: 0, totalPages: 0, currentPage: page };
    }
  },

  /**
   * Busca locais por tipo de acessibilidade
   */
  async buscarPorTipoAcessibilidade(tipo, page = 0, size = 10) {
    try {
      const response = await api.get(`/locais/tipo-acessibilidade/${tipo}`, {
        params: { page, size }
      });
      
      const locais = response.data?.content || response.data || [];
      const isArray = Array.isArray(locais);
      
      return {
        locais: (isArray ? locais : []).map(local => this.formatarLocal(local)),
        totalElements: isArray ? locais.length : (response.data?.totalElements || 0),
        totalPages: response.data?.totalPages || 1,
        currentPage: page
      };
    } catch (erro) {
      console.error(`Erro ao buscar locais por tipo ${tipo}:`, erro);
      return { locais: [], totalElements: 0, totalPages: 0, currentPage: page };
    }
  },

  /**
   * Busca locais por nome (busca textual)
   */
  async buscarPorNome(nome, page = 0, size = 10) {
    try {
      const response = await api.get('/locais/buscar', {
        params: { nome, page, size }
      });
      
      const locais = response.data?.content || response.data || [];
      const isArray = Array.isArray(locais);
      
      return {
        locais: (isArray ? locais : []).map(local => this.formatarLocal(local)),
        totalElements: isArray ? locais.length : (response.data?.totalElements || 0),
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