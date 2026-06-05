import api from '../api/axios';

class ReportarService {
  static reports = [];
  static baseURL = '/reportar';

  /**
   * Cria uma nova denúncia
   * @param {Object} data - Dados da denúncia
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      // TODO: Quando o backend estiver pronto, descomentar:
      // const response = await api.post(this.baseURL, data);
      // return { success: true, data: response.data };
      
      // Mock para desenvolvimento
      console.log('📝 ReportarService.create:', data);
      
      const newReport = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
      };
      
      this.reports.unshift(newReport);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { 
        success: true, 
        data: newReport,
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
      // TODO: Quando o backend estiver pronto:
      // const response = await api.get(this.baseURL, { params: filters });
      // return { success: true, data: response.data };
      
      // Mock
      let reports = [...this.reports];
      
      if (filters.tipo) {
        reports = reports.filter(r => r.tipo === filters.tipo);
      }
      
      if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
      }
      
      return { success: true, data: reports };
    } catch (error) {
      console.error('Erro ao listar denúncias:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  /**
   * Busca denúncia por ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const report = this.reports.find(r => r.id === parseInt(id));
      return { success: true, data: report };
    } catch (error) {
      return { success: false, data: null, message: error.message };
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
      const index = this.reports.findIndex(r => r.id === parseInt(id));
      if (index !== -1) {
        this.reports[index] = { ...this.reports[index], status, updatedAt: new Date().toISOString() };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Remove uma denúncia (Admin)
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async delete(id) {
    try {
      // TODO: Quando o backend estiver pronto:
      // await api.delete(`${this.baseURL}/${id}`);
      
      this.reports = this.reports.filter(r => r.id !== parseInt(id));
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar denúncia:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Verifica se usuário já denunciou um alvo
   * @param {string} tipo
   * @param {string|number} targetId
   * @returns {Promise<boolean>}
   */
  static async hasUserReported(tipo, targetId) {
    try {
      // TODO: Implementar verificação no backend
      // const response = await api.get(`${this.baseURL}/check`, { params: { tipo, targetId } });
      // return response.data.reported;
      
      // Mock: Verificar se já existe denúncia do tipo
      const existing = this.reports.find(r => r.tipo === tipo && r.targetId === targetId);
      return !!existing;
    } catch (error) {
      return false;
    }
  }
}

export default ReportarService;