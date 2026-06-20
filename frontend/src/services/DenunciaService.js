import api from '../api/axios';

class DenunciaService {
  static baseURL = '/denuncias';

  static async getAll(filters = {}) {
    try {
      const params = {};
      if (filters.status && filters.status !== 'todos') params.status = filters.status;
      if (filters.tipo && filters.tipo !== 'todos') params.tipo = filters.tipo;
      if (filters.search) params.search = filters.search;
      if (typeof filters.page === 'number') params.page = filters.page;
      if (typeof filters.size === 'number') params.size = filters.size;
      if (filters.sort) params.sort = filters.sort;

      const response = await api.get(this.baseURL, { params });

      let denuncias = [];
      let pagination = {
        page: 0,
        size: filters.size || 10,
        totalElements: 0,
        totalPages: 1,
      };

      if (response.data?.content) {
        denuncias = response.data.content;
        pagination = {
          page: response.data.number ?? 0,
          size: response.data.size ?? (filters.size || 10),
          totalElements: response.data.totalElements ?? denuncias.length,
          totalPages: response.data.totalPages ?? 1,
        };
      } else if (Array.isArray(response.data)) {
        denuncias = response.data;
        pagination = {
          page: 0,
          size: denuncias.length || (filters.size || 10),
          totalElements: denuncias.length,
          totalPages: 1,
        };
      }

      return { success: true, data: denuncias, pagination };
    } catch (error) {
      console.error('Erro ao listar denúncias:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message,
        pagination: { page: 0, size: 10, totalElements: 0, totalPages: 1 },
      };
    }
  }

  static async getEstatisticas() {
    try {
      const response = await api.get(`${this.baseURL}/estatisticas`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, data: { TOTAL: 0, PENDING: 0 } };
    }
  }

  static async updateStatus(id, status) {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { success: false, message: error.response?.data?.message };
    }
  }

  static async delete(id) {
    try {
      await api.delete(`${this.baseURL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar denúncia:', error);
      return { success: false, message: error.response?.data?.message };
    }
  }

  static async resolver(id) {
    try {
      const response = await api.post(`${this.baseURL}/${id}/resolver`);
      return { success: true, data: response.data, message: 'Denúncia resolvida com sucesso' };
    } catch (error) {
      if (error.response?.status === 409) {
        return { 
          success: false, 
          message: 'Esta denúncia já foi processada',
          alreadyResolved: true 
        };
      }
      return { success: false, message: error.response?.data?.message || 'Erro ao resolver denúncia' };
    }
  }
}

export default DenunciaService;