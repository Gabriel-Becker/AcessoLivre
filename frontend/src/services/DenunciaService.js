import api from '../api/axios';

class DenunciaService {
  static baseURL = '/denuncias';

  /**
   * Lista todas as denúncias com paginação e filtros (Admin)
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Object>}
   */
  static async getAll(filters = {}) {
    try {
      const params = {};
      if (filters.status && filters.status !== 'todos') params.status = filters.status;
      if (filters.tipo && filters.tipo !== 'todos') params.tipo = filters.tipo;
      if (filters.search) params.search = filters.search;
      
      console.log('📤 GET /denuncias', params);
      
      const response = await api.get(this.baseURL, { params });
      
      let denuncias = [];
      if (response.data?.content) {
        denuncias = response.data.content;
      } else if (Array.isArray(response.data)) {
        denuncias = response.data;
      }
      
      console.log(`✅ ${denuncias.length} denúncias carregadas`);
      
      return { success: true, data: denuncias };
    } catch (error) {
      console.error('❌ Erro ao listar denúncias:', error);
      return { success: false, data: [], message: error.response?.data?.message };
    }
  }

  /**
   * Obtém estatísticas de denúncias
   * @returns {Promise<Object>}
   */
  static async getEstatisticas() {
    try {
      const response = await api.get(`${this.baseURL}/estatisticas`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { success: false, data: { TOTAL: 0, PENDING: 0 } };
    }
  }

  /**
   * Atualiza status da denúncia (Admin)
   * @param {number|string} id
   * @param {string} status
   * @returns {Promise<Object>}
   */
  static async updateStatus(id, status) {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return { success: false, message: error.response?.data?.message };
    }
  }

  /**
   * Remove uma denúncia (Admin) - DEPRECATED: Use resolver() instead
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async delete(id) {
    try {
      await api.delete(`${this.baseURL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar denúncia:', error);
      return { success: false, message: error.response?.data?.message };
    }
  }

  /**
   * Resolve uma denúncia e remove o conteúdo denunciado (Admin)
   * O backend decide o que fazer baseado no tipo do alvo (LOCAL ou AVALIACAO)
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async resolver(id) {
    try {
      const response = await api.post(`${this.baseURL}/${id}/resolver`);
      return { success: true, data: response.data, message: 'Denúncia resolvida e conteúdo removido com sucesso' };
    } catch (error) {
      console.error('❌ Erro ao resolver denúncia:', error);
      return { success: false, message: error.response?.data?.message || 'Erro ao resolver denúncia' };
    }
  }
}

export default DenunciaService;