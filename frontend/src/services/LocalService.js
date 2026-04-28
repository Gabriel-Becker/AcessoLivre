// src/services/LocalService.js
import api from '../api/axios';

const LocalService = {
  /**
   * Cadastra um novo local (requer autenticação)
   */
  async cadastrarLocal(dados) {
    try {
      console.log('📤 Cadastrando local:', dados);
      
      // Remove o campo 'imagens' se existir (backend pode não aceitar)
      const { imagens, ...payload } = dados;
      
      const response = await api.post('/locais', payload);
      console.log('✅ Local cadastrado com sucesso:', response.data);
      return response.data;
    } catch (erro) {
      console.error('❌ Erro ao cadastrar local:', erro);
      
      // Log detalhado do erro
      if (erro.response) {
        console.error('❌ Status:', erro.response.status);
        console.error('❌ Dados do erro:', erro.response.data);
      }
      
      throw erro;
    }
  },

  /**
   * Busca todos os locais com paginação
   * @param {Object} params - Parâmetros de paginação
   * @param {number} params.page - Número da página (padrão: 0)
   * @param {number} params.size - Itens por página (padrão: 20)
   * @param {string} params.sort - Campo para ordenação (padrão: nome)
   */
  async listarLocais({ page = 0, size = 20, sort = 'nome' } = {}) {
    try {
      const response = await api.get('/locais', {
        params: { page, size, sort }
      });
      return response.data;
    } catch (erro) {
      console.error('Erro ao listar locais:', erro);
      throw erro;
    }
  },

  /**
   * Busca locais em destaque (os mais recentes)
   * @param {number} limite - Quantidade de locais a buscar (padrão: 4)
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
      return locais;
    } catch (erro) {
      console.error('Erro ao buscar locais em destaque:', erro);
      return [];
    }
  },

  /**
   * Busca estatísticas gerais do sistema
   */
  async obterEstatisticas() {
    try {
      // Busca a primeira página para contar o total de elementos
      const response = await api.get('/locais', {
        params: { page: 0, size: 1 }
      });
      
      const totalLocais = response.data?.totalElements || 0;
      
      // TODO: Quando tiver endpoint de avaliações, substituir
      const totalAvaliacoes = 0;
      const totalUsuarios = 0;
      
      return { 
        totalLocais, 
        totalAvaliacoes, 
        totalUsuarios 
      };
    } catch (erro) {
      console.error('Erro ao buscar estatísticas:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },

  /**
   * Busca detalhes de um local específico
   * @param {number} id - ID do local
   */
  async obterLocal(id) {
    try {
      const response = await api.get(`/locais/${id}`);
      return response.data;
    } catch (erro) {
      console.error(`Erro ao obter local ID ${id}:`, erro);
      throw erro;
    }
  },

  /**
   * Atualiza um local existente (requer autenticação)
   * @param {number} id - ID do local
   * @param {Object} dados - Dados atualizados
   */
  async atualizarLocal(id, dados) {
    try {
      const response = await api.put(`/locais/${id}`, dados);
      return response.data;
    } catch (erro) {
      console.error(`Erro ao atualizar local ID ${id}:`, erro);
      throw erro;
    }
  },

  /**
   * Remove um local (requer autenticação de admin)
   * @param {number} id - ID do local
   */
  async removerLocal(id) {
    try {
      const response = await api.delete(`/locais/${id}`);
      return response.data;
    } catch (erro) {
      console.error(`Erro ao remover local ID ${id}:`, erro);
      throw erro;
    }
  },

  /**
   * Busca locais por categoria
   * @param {string} categoria - Categoria do local (COMERCIAL, LAZER, etc.)
   */
  async buscarPorCategoria(categoria) {
    try {
      const response = await api.get(`/locais/categoria/${categoria}`);
      return response.data || [];
    } catch (erro) {
      console.error(`Erro ao buscar locais por categoria ${categoria}:`, erro);
      return [];
    }
  },

  /**
   * Busca locais por tipo de acessibilidade
   * @param {string} tipo - Tipo de acessibilidade (RAMPA, ELEVADOR, etc.)
   */
  async buscarPorTipoAcessibilidade(tipo) {
    try {
      const response = await api.get(`/locais/tipo-acessibilidade/${tipo}`);
      return response.data || [];
    } catch (erro) {
      console.error(`Erro ao buscar locais por tipo ${tipo}:`, erro);
      return [];
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

  /**
   * Formata uma lista de locais
   * @param {Array} locais - Lista de locais do backend
   */
  formatarLocais(locais) {
    if (!Array.isArray(locais)) return [];
    return locais.map(local => this.formatarLocal(local));
  }
};

export default LocalService;