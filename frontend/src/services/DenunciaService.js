import api from '../api/axios';

class DenunciaService {
  static baseURL = '/denuncias';

  static async getAll(filters = {}) {
    try {
      const params = {};
      if (filters.status && filters.status !== 'todos') params.status = filters.status;
      if (filters.tipo && filters.tipo !== 'todos') params.tipo = filters.tipo;
      if (filters.search) params.search = filters.search;

      const response = await api.get(this.baseURL, { params });

      let denuncias = [];
      if (response.data?.content) {
        denuncias = response.data.content;
      } else if (Array.isArray(response.data)) {
        denuncias = response.data;
      }

      return { success: true, data: denuncias };
    } catch (error) {
      console.error('Erro ao listar denúncias:', error);
      return { success: false, data: [], message: error.response?.data?.message };
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