// services/BuscarService.js
import api from '../api/axios';

class BuscarService {
  /**
   * Busca inteligente com múltiplos filtros
   * @param {Object} filtros - Filtros de busca
   * @returns {Promise<Object>}
   */
  static async buscarLocais(filtros) {
    try {
      console.log('🔍 Buscando locais com filtros:', filtros);
      
      // Preparar payload - remover campos vazios
      const payload = {};
      
      if (filtros.searchText && filtros.searchText.trim()) {
        payload.searchText = filtros.searchText.trim();
      }
      
      if (filtros.categorias && filtros.categorias.length > 0) {
        payload.categorias = filtros.categorias;
      }
      
      if (filtros.recursos && filtros.recursos.length > 0) {
        payload.recursos = filtros.recursos;
      }
      
      if (filtros.notaMinima && filtros.notaMinima > 0) {
        payload.notaMinima = filtros.notaMinima;
      }
      
      // Se não há filtros, buscar todos com paginação
      const isEmpty = Object.keys(payload).length === 0;
      
      let response;
      if (isEmpty) {
        response = await api.get('/locais/todos', {
          params: { page: 0, size: 50, sort: 'avaliacaoMedia', direction: 'desc' }
        });
      } else {
        response = await api.post('/locais/buscar', payload, {
          params: { page: 0, size: 50, sort: 'avaliacaoMedia', direction: 'desc' }
        });
      }
      
      // Processar resposta
      if (response.data) {
        const locais = response.data.content || response.data;
        const total = response.data.totalElements || locais.length;
        
        console.log(`✅ Encontrados ${total} locais`);
        
        return {
          success: true,
          data: Array.isArray(locais) ? locais : [],
          total: total,
          hasMore: response.data.hasNext || false
        };
      }
      
      return { success: true, data: [], total: 0 };
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      
      let errorMessage = 'Erro ao buscar locais';
      if (error.response?.status === 400) {
        errorMessage = 'Filtros inválidos. Tente novamente.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro no servidor. Tente mais tarde.';
      }
      
      return {
        success: false,
        data: [],
        total: 0,
        message: errorMessage
      };
    }
  }

  /**
   * Busca locais em destaque para a home
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Array>}
   */
  static async obterLocaisEmDestaque(limit = 8) {
    try {
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: limit, sort: 'avaliacaoMedia', direction: 'desc' }
      });
      
      const locais = response.data?.content || response.data || [];
      return this.sanitizarLocais(locais);
      
    } catch (error) {
      console.error('Erro ao buscar destaques:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas para a home
   * @returns {Promise<Object>}
   */
  static async obterEstatisticas() {
    try {
      const response = await api.get('/estatisticas');
      return response.data || { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  }

  /**
   * Sanitiza lista de locais para o formato do frontend
   * @param {Array} locais - Lista de locais do backend
   * @returns {Array}
   */
  static sanitizarLocais(locais) {
    if (!locais || !Array.isArray(locais)) return [];
    
    return locais
      .filter(local => local && (local.idLocal || local.id))
      .map(local => ({
        id: local.idLocal || local.id,
        nome: local.nome || 'Sem nome',
        categoria: local.categoria,
        descricao: local.descricao,
        endereco: local.endereco,
        avaliacaoMedia: local.avaliacaoMedia || 0,
        totalAvaliacoes: local.totalAvaliacoes || 0,
        tiposAcessibilidade: local.tiposAcessibilidade || [],
        imagemUrl: local.imagens?.[0]?.url || local.imagemUrl || null,
        horarioFuncionamento: local.horarioFuncionamento,
        telefone: local.telefone,
        site: local.site
      }));
  }

  /**
   * Extrai ID do local de forma segura
   * @param {Object} local - Objeto local
   * @returns {number|null}
   */
  static getLocalId(local) {
    return local?.id || local?.idLocal || null;
  }
}

export default BuscarService;