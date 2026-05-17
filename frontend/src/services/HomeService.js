import api from '../api/axios';
const HomeService = {
  /**
   * Busca estatísticas gerais do sistema
   */
  async obterEstatisticas() {
    try {
      const response = await api.get('/locais', {
        params: { page: 0, size: 1 }
      });
      
      const totalLocais = response.data?.totalElements || 0;
      
      // TODO: Quando tiver endpoint de avaliações, substituir
      const totalAvaliacoes = 0;
      const totalUsuarios = 0;
      
      return { totalLocais, totalAvaliacoes, totalUsuarios };
    } catch (erro) {
      console.error('Erro ao buscar estatísticas:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },
  /**
   * Busca locais em destaque (os mais recentes)
   * @param {number} limite - Quantidade de locais a buscar
   */
  async obterLocaisEmDestaque(limite = 4) {
    try {
      const response = await api.get('/locais', {
        params: { 
          page: 0, 
          size: limite,
          sort: 'dataCriacao,desc' 
        }
      });
      
      const locais = response.data?.content || [];
      return locais.map(local => this.formatarLocal(local));
    } catch (erro) {
      console.error('Erro ao buscar locais em destaque:', erro);
      return [];
    }
  },
  /**
   * Busca todos os locais (para a página de buscar)
   * @param {number} page - Número da página
   * @param {number} size - Itens por página
   */
  async listarTodosLocais(page = 0, size = 10) {
    try {
      const response = await api.get('/locais', {
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
   * Formata os dados do local para o padrão do frontend
   * @param {Object} local - Local vindo do backend
   */
  formatarLocal(local) {
    if (!local) return null;
    
    return {
      id: local.idLocal,
      nome: local.nome,
      descricao: local.descricao,
      categoria: local.categoria,
      tipoAcessibilidade: local.tipoAcessibilidade,
      status: local.status,
      avaliacaoMedia: local.avaliacaoMedia || 0,
      totalAvaliacoes: 0,
      imagemUrl: local.imagem || null,
      dataCriacao: local.dataCriacao,
      endereco: local.endereco ? {
        logradouro: local.endereco.logradouro,
        numero: local.endereco.numero,
        complemento: local.endereco.complemento,
        bairro: local.endereco.bairro,
        cidade: local.endereco.cidade,
        estado: local.endereco.estado,
        cep: local.endereco.cep
      } : null
    };
  },
};
export default HomeService;