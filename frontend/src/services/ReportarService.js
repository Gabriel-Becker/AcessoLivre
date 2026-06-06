// src/services/ReportarService.js

import api from '../api/axios';

class ReportarService {
  static baseURL = '/denuncias';

  /**
   * Cria uma nova denúncia
   * @param {Object} data - Dados da denúncia
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      const response = await api.post(this.baseURL, data);
      return { 
        success: true, 
        data: response.data,
        message: 'Denúncia enviada com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao criar denúncia:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao enviar denúncia' 
      };
    }
  }

  /**
   * Lista todas as denúncias (Admin)
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Object>}
   */
  static async getAll(filters = {}) {
    try {
      const params = {};
      
      if (filters.status && filters.status !== 'todos') {
        params.status = filters.status;
      }
      if (filters.tipo && filters.tipo !== 'todos') {
        params.tipo = filters.tipo;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await api.get(this.baseURL, { params });
      
      // A resposta pode vir em diferentes formatos
      let denuncias = [];
      if (response.data?.content) {
        denuncias = response.data.content;
      } else if (Array.isArray(response.data)) {
        denuncias = response.data;
      } else if (response.data?.data) {
        denuncias = response.data.data;
      }
      
      return { success: true, data: denuncias };
    } catch (error) {
      console.error('Erro ao listar denúncias:', error);
      return { 
        success: false, 
        data: [], 
        message: error.response?.data?.message || 'Erro ao carregar denúncias' 
      };
    }
  }

  /**
   * Busca denúncia por ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar denúncia:', error);
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || 'Denúncia não encontrada' 
      };
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
      console.error('Erro ao atualizar status:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao atualizar status' 
      };
    }
  }

  /**
   * Remove uma denúncia (Admin)
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async delete(id) {
    try {
      await api.delete(`${this.baseURL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar denúncia:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao excluir denúncia' 
      };
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
      console.error('Erro ao buscar estatísticas:', error);
      // Fallback: calcular estatísticas a partir da lista
      try {
        const result = await this.getAll();
        if (result.success && result.data) {
          const denuncias = result.data;
          const total = denuncias.length;
          const pendentes = denuncias.filter(d => d.status === 'PENDING').length;
          return { 
            success: true, 
            data: { TOTAL: total, PENDING: pendentes } 
          };
        }
      } catch (e) {
        // Ignora
      }
      return { success: false, data: { TOTAL: 0, PENDING: 0 } };
    }
  }

  /**
   * Verifica se usuário já denunciou um alvo
   * @param {string} tipo
   * @param {number|string} targetId
   * @returns {Promise<boolean>}
   */
  static async hasUserReported(tipo, targetId) {
    try {
      const response = await api.get(`${this.baseURL}/check`, { 
        params: { tipo, targetId } 
      });
      return response.data?.reported === true;
    } catch (error) {
      console.error('Erro ao verificar denúncia:', error);
      return false;
    }
  }

  /**
   * Busca denúncias por target
   * @param {string} tipo
   * @param {number|string} targetId
   * @returns {Promise<Object>}
   */
  static async getByTarget(tipo, targetId) {
    try {
      const response = await api.get(`${this.baseURL}/target`, { 
        params: { tipo, targetId } 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar denúncias por target:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Atualiza status em massa
   * @param {Array<number>} ids
   * @param {string} status
   * @returns {Promise<Object>}
   */
  static async updateStatusMass(ids, status) {
    try {
      const response = await api.patch(`${this.baseURL}/status/massa`, { ids, status });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar status em massa:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao atualizar status' 
      };
    }
  }

  /**
   * Exclui denúncias em massa
   * @param {Array<number>} ids
   * @returns {Promise<Object>}
   */
  static async deleteMass(ids) {
    try {
      await api.delete(`${this.baseURL}/massa`, { data: { ids } });
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir denúncias em massa:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao excluir denúncias' 
      };
    }
  }
}

export default ReportarService;