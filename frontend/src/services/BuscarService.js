import api from '../api/axios';
import LocalService from './LocalService';

class BuscarService {
  static cache = null;

  /**
   * Carrega TODOS os locais uma única vez (com cache)
   * @returns {Promise<Array>}
   */
  static async carregarTodosLocais() {
    try {
      if (this.cache && this.cache.length > 0) {
        console.log('📦 Usando cache de locais:', this.cache.length);
        return this.cache;
      }

      console.log('🌐 Buscando todos os locais do backend...');
      const response = await api.get('/locais/todos', {
        params: { page: 0, size: 100, sort: 'nome', direction: 'asc' }
      });
      
      const locais = response.data?.content || response.data || [];
      this.cache = this.sanitizarLocais(locais);
      console.log('✅ Cache atualizado com', this.cache.length, 'locais');

      return this.cache;
      
    } catch (error) {
      console.error('❌ Erro ao carregar locais:', error);
      return [];
    }
  }

  /**
   * Invalida o cache de locais para forçar recarga
   */
  static invalidateCache() {
    console.log('🔄 Invalidando cache de locais');
    this.cache = null;
  }

  /**
   * Recarrega todos os locais do backend (força atualização)
   * @returns {Promise<Array>}
   */
  static async recarregarTodosLocais() {
    console.log('🌐 Recarregando todos os locais do backend...');
    this.cache = null; // Limpa cache primeiro
    return this.carregarTodosLocais();
  }

  /**
   * Busca inteligente com múltiplos filtros (100% frontend)
   * @param {Object} filtros - Filtros de busca
   * @returns {Promise<Object>}
   */
  static async buscarLocais(filtros) {
    try {
      // Carregar todos os locais (com cache)
      let locais = await this.carregarTodosLocais();
      
      if (!locais || locais.length === 0) {
        return { success: true, data: [], total: 0 };
      }
      
      let resultados = [...locais];
      
      if (filtros.searchText && filtros.searchText.trim()) {
        const searchLower = filtros.searchText.toLowerCase().trim();
        resultados = resultados.filter(local => 
          local.nome?.toLowerCase().includes(searchLower) ||
          local.endereco?.logradouro?.toLowerCase().includes(searchLower) ||
          local.endereco?.cidade?.toLowerCase().includes(searchLower) ||
          local.endereco?.bairro?.toLowerCase().includes(searchLower) ||
          local.categoria?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filtros.categorias && filtros.categorias.length > 0) {
        resultados = resultados.filter(local => 
          filtros.categorias.includes(local.categoria)
        );
      }
      
      if (filtros.recursos && filtros.recursos.length > 0) {
        resultados = resultados.filter(local => {
          if (!local.tiposAcessibilidade || local.tiposAcessibilidade.length === 0) return false;
          return filtros.recursos.some(recurso => 
            local.tiposAcessibilidade.includes(recurso)
          );
        });
      }

      if (filtros.notaMinima && filtros.notaMinima > 0) {
        resultados = resultados.filter(local => 
          (local.avaliacaoMedia || 0) >= filtros.notaMinima
        );
      }
      
      resultados.sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0));
      
      return {
        success: true,
        data: resultados,
        total: resultados.length
      };
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return { success: false, data: [], total: 0, message: error.message };
    }
  }

  /**
   * Busca locais em destaque para a home
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Array>}
   */
  static async obterLocaisEmDestaque(limit = 8) {
    try {
      const locais = await this.carregarTodosLocais();
      const destaques = [...locais]
        .sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0))
        .slice(0, limit);
      return destaques;
    } catch (error) {
      console.error('Erro ao buscar destaques:', error);
      return [];
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
        imagemUrl:
          LocalService.getImagemUrl(local.imagemUrl) ||
          LocalService.getImagemUrl(local.imagemPrincipal) ||
          LocalService.getImagemUrl(local.imagem) ||
          LocalService.getImagemUrl(local.imagens?.[0]?.urlCompleta) ||
          LocalService.getImagemUrl(local.imagens?.[0]?.url) ||
          LocalService.getImagemUrl(local.imagens?.[0]?.caminhoRelativo) ||
          null,
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

  /**
   * Obtém estatísticas para a home
   * @returns {Promise<Object>}
   */
  static async obterEstatisticas() {
    try {
      const locais = await this.carregarTodosLocais();
      
      const totalLocais = locais.length;
      const totalAvaliacoes = locais.reduce((sum, local) => sum + (local.totalAvaliacoes || 0), 0);
      const somaNotas = locais.reduce((sum, local) => sum + (local.avaliacaoMedia || 0), 0);
      const mediaGeral = totalLocais > 0 ? (somaNotas / totalLocais).toFixed(1) : 0;
      
      console.log('📊 Estatísticas:', { totalLocais, totalAvaliacoes, mediaGeral });
      
      return { totalLocais, totalAvaliacoes, mediaGeral };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { totalLocais: 0, totalAvaliacoes: 0, mediaGeral: 0 };
    }
  }
}

export default BuscarService;