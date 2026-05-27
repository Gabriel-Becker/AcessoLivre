import api from '../api/axios';
import HomeService from './HomeService';

const BuscarService = {
  normalizarTexto(valor) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  },

  obterCategoriaLocal(local) {
    const categoria = local?.categoria;

    if (!categoria) return '';

    if (typeof categoria === 'string') {
      return categoria;
    }

    if (typeof categoria === 'object') {
      return categoria?.nome || categoria?.descricao || categoria?.value || '';
    }

    return String(categoria);
  },

  async buscarLocais(filtros = {}) {
    try {
      const { searchText, categorias, recursos, notaMinima } = filtros;
      
      const temFiltros = searchText || 
                        (categorias && categorias.length > 0) || 
                        (recursos && recursos.length > 0) || 
                        (notaMinima && notaMinima > 0);
      
      if (!temFiltros) {
        const locaisDestaque = await HomeService.obterLocaisEmDestaque(50);
        return {
          success: true,
          data: locaisDestaque,
          total: locaisDestaque.length,
          hasFilters: false
        };
      }
      
      console.log('🔍 BuscarService: Buscando todos os locais para aplicar filtros');
      
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: 100, sort: 'nome,asc' }
      });
      
      let locais = response.data?.content || response.data || [];
      locais = this.sanitizarLocais(locais);
      
      if (searchText) {
        const searchLower = this.normalizarTexto(searchText);
        locais = locais.filter(local => 
          this.normalizarTexto(local.nome).includes(searchLower) ||
          this.normalizarTexto(local.endereco?.cidade).includes(searchLower)
        );
      }
      
      if (categorias && categorias.length > 0) {
        locais = locais.filter(local => 
          categorias.some(categoria =>
            this.normalizarTexto(categoria) === this.normalizarTexto(this.obterCategoriaLocal(local))
          )
        );
      }
      
      if (recursos && recursos.length > 0) {
        locais = locais.filter(local => {
          if (!local.tiposAcessibilidade || local.tiposAcessibilidade.length === 0) {
            return false;
          }
          const tiposNormalizados = local.tiposAcessibilidade.map(tipo => this.normalizarTexto(tipo));
          return recursos.some(recurso => tiposNormalizados.includes(this.normalizarTexto(recurso)));
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
      
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: 20, sort: 'nome,asc' }
      });
      
      let locais = response.data?.content || response.data || [];
      locais = this.sanitizarLocais(locais);
      const searchLower = this.normalizarTexto(nome);
      
      locais = locais.filter(local => 
        this.normalizarTexto(local.nome).includes(searchLower) ||
        this.normalizarTexto(local.endereco?.cidade).includes(searchLower)
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
      const temId = local?.id || local?.localId || local?.idLocal;
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