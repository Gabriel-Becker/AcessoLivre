import api from '../api/axios';
import AuthService from './AuthService';

class ReportarService {
  static baseURL = '/denuncias';

  static async _getToken() {
    return await AuthService.getToken();
  }

  static async create(data) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { 
          success: false, 
          message: 'Você precisa estar logado para fazer uma denúncia' 
        };
      }

      const payload = {
        tipo: data.tipo,
        targetId: data.targetId,
        targetName: data.targetName,
        motivo: data.motivo,
        motivoLabel: data.motivoLabel,
        descricao: data.descricao,
      };

      const response = await api.post(this.baseURL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Denúncia enviada com sucesso!',
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Sua sessão expirou. Faça login novamente.' 
        };
      }
      
      if (error.response?.status === 403) {
        return { 
          success: false, 
          message: 'Você não tem permissão para fazer esta denúncia.' 
        };
      }
      
      if (error.response?.status === 409) {
        return { 
          success: false, 
          message: 'Você já denunciou este item anteriormente.' 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.mensagem || 'Erro ao enviar denúncia' 
      };
    }
  }

  static async getAll(filters = {}) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, data: [], message: 'Sessão expirada. Faça login novamente.' };
      }
      
      const params = {};
      if (filters.status && filters.status !== 'todos') params.status = filters.status;
      if (filters.tipo && filters.tipo !== 'todos') params.tipo = filters.tipo;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.size) params.size = filters.size;
      
      const response = await api.get(this.baseURL, { 
        params,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const denuncias = response.data?.content || (Array.isArray(response.data) ? response.data : []);
      
      return { 
        success: true, 
        data: denuncias, 
        total: response.data?.totalElements || denuncias.length 
      };
    } catch (error) {
      return this._handleError(error, 'Erro ao carregar denúncias');
    }
  }

  static async getById(id) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }
      
      const response = await api.get(`${this.baseURL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return this._handleError(error, 'Denúncia não encontrada');
    }
  }

  static async getEstatisticas() {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, data: this._getEmptyStats() };
      }
      
      const response = await api.get(`${this.baseURL}/estatisticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: this._getEmptyStats() };
    }
  }

  static async updateStatus(id, status, observacoes = null) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }
      
      const payload = { status };
      if (observacoes) payload.observacoes = observacoes;
      
      const response = await api.patch(`${this.baseURL}/${id}/status`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { 
        success: true, 
        data: response.data, 
        message: 'Status atualizado com sucesso!' 
      };
    } catch (error) {
      return this._handleError(error, 'Erro ao atualizar status');
    }
  }

  static async delete(id) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }
      
      await api.delete(`${this.baseURL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { success: true, message: 'Denúncia excluída com sucesso!' };
    } catch (error) {
      return this._handleError(error, 'Erro ao excluir denúncia');
    }
  }

  static async deleteMass(ids) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }
      
      await api.delete(`${this.baseURL}/massa`, {
        data: ids,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      return { 
        success: true, 
        message: `${ids.length} denúncia${ids.length !== 1 ? 's' : ''} excluída${ids.length !== 1 ? 's' : ''} com sucesso!` 
      };
    } catch (error) {
      return this._handleError(error, 'Erro ao excluir denúncias');
    }
  }

  static async checkUserReported(tipo, targetId) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, reported: false };
      }
      
      const response = await api.get(`${this.baseURL}/check`, {
        params: { tipo, targetId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { success: true, reported: response.data?.reported || false };
    } catch (error) {
      return { success: false, reported: false };
    }
  }

  static async resolver(id) {
    try {
      const token = await this._getToken();
      
      if (!token) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }
      
      const response = await api.post(`${this.baseURL}/${id}/resolver`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { success: true, data: response.data, message: 'Denúncia resolvida com sucesso!' };
    } catch (error) {
      if (error.response?.status === 409) {
        return { 
          success: false, 
          message: 'Esta denúncia já foi processada',
          alreadyResolved: true 
        };
      }
      return this._handleError(error, 'Erro ao resolver denúncia');
    }
  }

  static _handleError(error, defaultMessage) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.mensagem;
    
    if (status === 401) {
      return { 
        success: false, 
        message: 'Sua sessão expirou. Faça login novamente.',
        code: 'UNAUTHORIZED'
      };
    }
    
    if (status === 403) {
      return { 
        success: false, 
        message: 'Acesso negado. Você não tem permissão para esta ação.',
        code: 'FORBIDDEN'
      };
    }
    
    if (status === 404) {
      return { 
        success: false, 
        message: 'Recurso não encontrado.',
        code: 'NOT_FOUND'
      };
    }
    
    return { 
      success: false, 
      message: message || defaultMessage,
      code: status ? `HTTP_${status}` : 'UNKNOWN_ERROR'
    };
  }

  static _getEmptyStats() {
    return {
      TOTAL: 0,
      PENDING: 0,
      REVIEWED: 0,
      RESOLVED: 0,
      REJECTED: 0
    };
  }
}

export default ReportarService;