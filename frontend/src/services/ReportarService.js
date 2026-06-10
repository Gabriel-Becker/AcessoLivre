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

      console.log('STATUS:', response.status);
      console.log('DENUNCIAS:', response.data);

      let denuncias = [];
      if (response.data?.content) {
        denuncias = response.data.content;
      } else if (Array.isArray(response.data)) {
        denuncias = response.data;
      }

      return { success: true, data: denuncias };
    } catch (error) {
      console.log('ERRO DENUNCIAS:', error.response?.status, error.response?.data);
      return { success: false, data: [] };
    }
  }

  static async getEstatisticas() {
    try {
      const response = await api.get(`${this.baseURL}/estatisticas`);
      
      console.log('STATUS ESTATISTICAS:', response.status);
      console.log('ESTATISTICAS:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.log('ERRO ESTATISTICAS:', error.response?.status, error.response?.data);
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