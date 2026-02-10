import api from '../api/axios';

const LocalService = {
  /**
   * Busca estatísticas gerais do sistema
   */
  async obterEstatisticas() {
    return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
  },

  /**
   * Busca locais em destaque (avaliados recentemente)
   */
  async obterLocaisEmDestaque(limite = 4) {
    return [];
  },

  /**
   * Busca todos os locais com paginação
   */
  async listarLocais({ page = 0, size = 20, sort = 'nome' } = {}) {
    try {
      const response = await api.get('/locais', {
        params: {
          page,
          size,
          sort,
        },
      });
      return response.data;
    } catch (erro) {
      console.error('Erro ao listar locais:', erro);
      throw erro;
    }
  },

  /**
   * Busca detalhes de um local específico
   */
  async obterLocal(id) {
    try {
      const response = await api.get(`/locais/${id}`);
      return response.data;
    } catch (erro) {
      console.error('Erro ao obter local:', erro);
      throw erro;
    }
  },

  /**
   * Cadastra um novo local (requer autenticação)
   */
  async cadastrarLocal(dados) {
    try {
      const response = await api.post('/locais', dados);
      return response.data;
    } catch (erro) {
      console.error('Erro ao cadastrar local:', erro);
      throw erro;
    }
  },

  /**
   * Atualiza um local existente (requer autenticação)
   */
  async atualizarLocal(id, dados) {
    try {
      const response = await api.put(`/locais/${id}`, dados);
      return response.data;
    } catch (erro) {
      console.error('Erro ao atualizar local:', erro);
      throw erro;
    }
  },

  /**
   * Remove um local (requer autenticação de admin)
   */
  async removerLocal(id) {
    try {
      const response = await api.delete(`/locais/${id}`);
      return response.data;
    } catch (erro) {
      console.error('Erro ao remover local:', erro);
      throw erro;
    }
  },
};

export default LocalService;
