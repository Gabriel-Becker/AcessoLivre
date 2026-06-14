import api from '../api/axios';
import LocalMapper from './LocalMapper';

class BuscarService {
  static cache = null;
  static cacheTimestamp = null;
  static CACHE_DURATION = 5 * 60 * 1000; 

  static preencherNomeLocalPrincipal(locais) {
    if (!Array.isArray(locais) || locais.length === 0) {
      return [];
    }

    const nomePorId = new Map(
      locais
        .filter(local => local?.idLocal && local?.nome)
        .map(local => [String(local.idLocal), local.nome])
    );

    return locais.map(local => {
      if (!local) return local;

      const jaTemNomePai = !!local.nomeLocalPrincipal?.trim?.();
      if (jaTemNomePai || !local.idLocalPrincipal) {
        return local;
      }

      const nomePai = nomePorId.get(String(local.idLocalPrincipal));
      if (!nomePai) {
        return local;
      }

      return {
        ...local,
        nomeLocalPrincipal: nomePai,
      };
    });
  }

  static async carregarTodosLocais(forceRefresh = false) {
    try {
      const agora = Date.now();
      const cacheValido = !forceRefresh && 
                          this.cache && 
                          this.cache.length > 0 && 
                          (agora - this.cacheTimestamp) < this.CACHE_DURATION;

      if (cacheValido) {
        return this.cache;
      }

      const response = await api.get('/locais/todos', {
        params: { page: 0, size: 1000, sort: 'nome', direction: 'asc' }
      });
      
      const rawLocais = response.data?.content || response.data || [];
      
      const locaisMapeados = LocalMapper.fromApiList(rawLocais);
      const locais = this.preencherNomeLocalPrincipal(locaisMapeados);
      
      this.cache = locais;
      this.cacheTimestamp = agora;

      return this.cache;
      
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      return [];
    }
  }

  static invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  static async recarregarTodosLocais() {
    return this.carregarTodosLocais(true);
  }

  static async buscarLocais(filtros) {
    try {
    
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
      console.error(' Erro na busca:', error);
      return { success: false, data: [], total: 0, message: error.message };
    }
  }

  static async obterLocaisEmDestaque(limit = 8) {
    try {
      const locais = await this.carregarTodosLocais();

      const destaques = [...locais]
        .sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0))
        .slice(0, limit);
      
      return LocalMapper.markNewest(destaques);
    } catch (error) {
      console.error('Erro ao buscar destaques:', error);
      return [];
    }
  }

  static async obterEstatisticas() {
    try {
      const locais = await this.carregarTodosLocais();
      return LocalMapper.calcularEstatisticas(locais);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { totalLocais: 0, totalAvaliacoes: 0, mediaGeral: 0 };
    }
  }
}

export default BuscarService;