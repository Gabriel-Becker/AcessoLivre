import api from '../api/axios';
import HomeService from './HomeService';

const BuscarService = {
  /**
   * Busca locais com filtros avançados
   * Se não houver filtros, retorna locais em destaque
   * Se houver filtros, busca todos e filtra no frontend
   */
  async buscarLocais(filtros = {}) {
    try {
      const { searchText, categorias, recursos, notaMinima } = filtros;
      
      const temFiltros = searchText || 
                        (categorias && categorias.length > 0) || 
                        (recursos && recursos.length > 0) || 
                        (notaMinima && notaMinima > 0);
      
      if (!temFiltros) {
        console.log('🏠 BuscarService: Sem filtros, usando locais em destaque');
        const locaisDestaque = await HomeService.obterLocaisEmDestaque(50);
        return {
          success: true,
          data: locaisDestaque,
          total: locaisDestaque.length,
          hasFilters: false
        };
      }
      
      console.log('🔍 BuscarService: Buscando todos os locais para aplicar filtros');
      
      const response = await api.get('/locais', {
        params: { page: 0, size: 100, sort: 'nome,asc' }
      });
      
      let locais = response.data?.content || response.data || [];
      
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        locais = locais.filter(local => 
          local.nome?.toLowerCase().includes(searchLower)
        );
      }
      
      if (categorias && categorias.length > 0) {
        locais = locais.filter(local => 
          categorias.includes(local.categoria)
        );
      }
      
      if (recursos && recursos.length > 0) {
        locais = locais.filter(local => {
          if (!local.tiposAcessibilidade || local.tiposAcessibilidade.length === 0) {
            return false;
          }
          return recursos.some(recurso => 
            local.tiposAcessibilidade.includes(recurso)
          );
        });
      }
      
      if (notaMinima && notaMinima > 0) {
        locais = locais.filter(local => 
          (local.avaliacaoMedia || 0) >= notaMinima
        );
      }
      
      return {
        success: true,
        data: locais,
        total: locais.length,
        hasFilters: true
      };
      
    } catch (error) {
      console.error('❌ BuscarService: Erro na busca:', error);
      
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          total: 0,
          hasFilters: true
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Busca locais por nome (autocomplete)
   */
  async buscarPorNome(nome) {
    try {
      if (!nome || nome.length < 2) {
        return { success: true, data: [], total: 0 };
      }
      
      const response = await api.get('/locais', {
        params: { page: 0, size: 20, sort: 'nome,asc' }
      });
      
      let locais = response.data?.content || response.data || [];
      const searchLower = nome.toLowerCase();
      
      locais = locais.filter(local => 
        local.nome?.toLowerCase().includes(searchLower)
      );
      
      return {
        success: true,
        data: locais,
        total: locais.length
      };
      
    } catch (error) {
      console.error('❌ BuscarService: Erro na busca por nome:', error);
      return { success: true, data: [], total: 0 };
    }
  },
  
  /**
   * Sanitiza locais (garante que têm ID)
   */
  sanitizarLocais(locais) {
    if (!locais || !Array.isArray(locais)) return [];
    
    return locais.filter(local => {
      const temId = local?.id || local?.localId;
      if (!temId) {
        console.warn('⚠️ BuscarService: Local sem ID ignorado', local?.nome);
      }
      return temId;
    });
  },
  
  /**
   * Obtém ID do local (prioriza id, fallback localId)
   */
  getLocalId(local) {
    return local?.id || local?.localId;
  }
};

export default BuscarService;