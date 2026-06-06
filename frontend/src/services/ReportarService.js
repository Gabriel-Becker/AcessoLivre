// src/services/ReportarService.js

import api from '../api/axios';
import { Platform } from 'react-native';

class ReportarService {
  static baseURL = '/denuncias';

  /**
   * Obtém o token do storage
   */
  static async getToken() {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.getItem('token');
      }
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  }

  /**
   * Cria uma nova denúncia - Usa o endpoint POST real
   * @param {Object} data - Dados da denúncia
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      console.log('📝 [ReportarService] Criando denúncia...');
      console.log('📦 Dados recebidos:', data);
      
      // 🔍 DEBUG: Verificar token antes de enviar
      const token = await this.getToken();
      console.log('🔑 TOKEN encontrado:', token ? '✅ SIM' : '❌ NÃO');
      console.log('📝 TOKEN:', token);
      
      // 🔍 DEBUG: Verificar headers padrão do axios
      console.log('📋 Headers padrão do axios:', api.defaults.headers.common);
      
      // Payload no formato esperado pelo backend
      const payload = {
        tipo: data.tipo,
        targetId: data.targetId,
        targetName: data.targetName,
        motivo: data.motivo,
        motivoLabel: data.motivoLabel,
        descricao: data.descricao,
      };
      
      console.log('📤 Payload:', payload);
      
      // ✅ CORREÇÃO: Enviar token explicitamente no header
      const response = await api.post(
        this.baseURL, 
        payload,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('✅ Denúncia criada com sucesso:', response.data);
      
      return { 
        success: true, 
        data: response.data,
        message: 'Denúncia enviada com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro ao criar denúncia:', error);
      console.error('📊 Status:', error.response?.status);
      console.error('📝 Detalhes:', error.response?.data);
      console.error('🔍 Request headers:', error.config?.headers);
      
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Sua sessão expirou. Faça login novamente.' 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.mensagem || 'Erro ao enviar denúncia' 
      };
    }
  }

  /**
   * Lista todas as denúncias com paginação e filtros (Admin)
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Object>}
   */
  static async getAll(filters = {}) {
    try {
      const token = await this.getToken();
      console.log('🔑 [GET] Token presente:', token ? '✅ SIM' : '❌ NÃO');
      
      const params = {};
      if (filters.status && filters.status !== 'todos') params.status = filters.status;
      if (filters.tipo && filters.tipo !== 'todos') params.tipo = filters.tipo;
      if (filters.search) params.search = filters.search;
      
      console.log('📤 GET /denuncias', params);
      
      const response = await api.get(this.baseURL, { 
        params,
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
        }
      });
      
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
      const token = await this.getToken();
      
      const response = await api.get(`${this.baseURL}/estatisticas`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
        }
      });
      
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
      const token = await this.getToken();
      
      const response = await api.patch(`${this.baseURL}/${id}/status`, 
        { status },
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return { success: false, message: error.response?.data?.message };
    }
  }

  /**
   * Remove uma denúncia (Admin)
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async delete(id) {
    try {
      const token = await this.getToken();
      
      await api.delete(`${this.baseURL}/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar denúncia:', error);
      return { success: false, message: error.response?.data?.message };
    }
  }
  
}

export default ReportarService;