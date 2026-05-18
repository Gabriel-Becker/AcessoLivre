import api from '../api/axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const HomeService = {

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

  construirUrlImagem(caminhoRelativo) {
    if (!caminhoRelativo) return null;

    if (caminhoRelativo.startsWith('http')) return caminhoRelativo;

    return `${API_BASE_URL}${caminhoRelativo.startsWith('/') ? '' : '/'}${caminhoRelativo}`;
  },

  extrairTodasImagens(local) {
    if (!Array.isArray(local.imagens)) return [];

    // remove duplicadas
    const caminhosUnicos = [
      ...new Set(local.imagens.map(img => img.caminhoRelativo))
    ];

    return caminhosUnicos.map(caminho =>
      this.construirUrlImagem(caminho)
    );
  },

  extrairPrimeiraImagem(local) {
    const imagens = this.extrairTodasImagens(local);
    return imagens.length > 0 ? imagens[0] : null;
  },

  formatarLocal(local) {
    const imagensUrls = this.extrairTodasImagens(local);
    const primeiraImagemUrl = this.extrairPrimeiraImagem(local);

    return {
      id: local.idLocal,
      nome: local.nome,
      descricao: local.descricao,
      categoria: local.categoria,
      status: local.status,
      avaliacaoMedia: local.avaliacaoMedia || 0,
      totalAvaliacoes: local.totalAvaliacoes || 0,

      imagemUrl: primeiraImagemUrl,
      imagens: imagensUrls,

      tiposAcessibilidade: local.tiposAcessibilidade || [],
      dataCriacao: local.dataCriacao,
      dataAtualizacao: local.dataAtualizacao,
      endereco: local.endereco || null,

      localPrincipal: local.localPrincipal,
      subLocais: local.subLocais || [],
      nivelHierarquia: local.nivelHierarquia,
      isRaiz: local.isRaiz,
      isFolha: local.isFolha
    };
  },

  async buscarLocalPorId(id) {
    try {
      const response = await api.get(`/locais/${id}`);
      return this.formatarLocal(response.data);
    } catch (erro) {
      console.error(`Erro ao buscar local ${id}:`, erro);
      return null;
    }
  }
};

export default HomeService;