import api from '../api/axios';

class ReportarService {
  static baseURL = '/denuncias';

  /**
   * Cria uma nova denúncia - Usa o endpoint POST real
   * @param {Object} data - Dados da denúncia
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      console.log('📝 [ReportarService] Criando denúncia...');
      console.log('📦 Dados recebidos:', data);
      
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
      
      // O token já está configurado no axios pelo AuthService
      const response = await api.post(this.baseURL, payload);
      
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
}

export default ReportarService;