// src/services/LocalService.js
import api from '../api/axios';

const LocalService = {
  /**
   * Cadastra um novo local (requer autenticação)
   */
  async cadastrarLocal(dados) {
    try {
      console.log('📤 Cadastrando local:', JSON.stringify(dados, null, 2));
      
      const response = await api.post('/locais', dados);
      console.log('✅ Local cadastrado com sucesso:', response.data);
      return response.data;
    } catch (erro) {
      console.error('❌ Erro ao cadastrar local:', erro);
      
      if (erro.response) {
        console.error('❌ Status:', erro.response.status);
        console.error('❌ Dados do erro:', erro.response.data);
      }
      
      throw erro;
    }
  },

  /**
   * Envia uma imagem para um local específico
   * @param {number} idLocal - ID do local
   * @param {string} imagemBase64 - Imagem em base64
   */
  async enviarImagem(idLocal, imagemBase64) {
    try {
      const response = await api.post('/imagens', {
        imagemBase64: imagemBase64,
        idLocal: idLocal
      });
      console.log(`✅ Imagem enviada para local ${idLocal}:`, response.data);
      return response.data;
    } catch (erro) {
      console.error(`❌ Erro ao enviar imagem para local ${idLocal}:`, erro);
      throw erro;
    }
  },

  /**
   * Envia múltiplas imagens para um local (uma por uma)
   * @param {number} idLocal - ID do local
   * @param {Array} imagens - Array de objetos com base64
   * @param {Function} onProgress - Callback de progresso (opcional)
   */
  async enviarMultiplasImagens(idLocal, imagens, onProgress = null) {
    const resultados = [];
    const erros = [];

    for (let i = 0; i < imagens.length; i++) {
      try {
        if (onProgress) {
          onProgress(i + 1, imagens.length);
        }
        
        const resultado = await this.enviarImagem(idLocal, imagens[i]);
        resultados.push(resultado);
      } catch (erro) {
        erros.push({ index: i, erro });
      }
    }

    return { resultados, erros };
  },

  /**
   * Busca todas as imagens de um local
   * @param {number} idLocal - ID do local
   */
  async buscarImagensDoLocal(idLocal) {
    try {
      const response = await api.get(`/imagens/local/${idLocal}`);
      return response.data;
    } catch (erro) {
      console.error(`❌ Erro ao buscar imagens do local ${idLocal}:`, erro);
      return [];
    }
  },

  /**
   * Remove uma imagem pelo ID
   * @param {number} idImagem - ID da imagem
   */
  async removerImagem(idImagem) {
    try {
      await api.delete(`/imagens/${idImagem}`);
      console.log(`✅ Imagem ${idImagem} removida`);
      return true;
    } catch (erro) {
      console.error(`❌ Erro ao remover imagem ${idImagem}:`, erro);
      return false;
    }
  },

  /**
   * Busca todos os locais com paginação
   */
  async listarLocais({ page = 0, size = 20, sort = 'nome' } = {}) {
    try {
      const response = await api.get('/locais', {
        params: { page, size, sort }
      });
      return response.data;
    } catch (erro) {
      console.error('Erro ao listar locais:', erro);
      throw erro;
    }
  },

  /**
   * Busca locais em destaque (os mais recentes)
   */
  async obterLocaisEmDestaque(limite = 4) {
    try {
      const response = await api.get('/locais', {
        params: { 
          page: 0, 
          size: limite,
          sort: 'dataCriacao,desc'
        }
      });
      
      const locais = response.data?.content || [];
      return locais;
    } catch (erro) {
      console.error('Erro ao buscar locais em destaque:', erro);
      return [];
    }
  },

  /**
   * Busca estatísticas gerais do sistema
   */
  async obterEstatisticas() {
    try {
      const response = await api.get('/locais', {
        params: { page: 0, size: 1 }
      });
      
      const totalLocais = response.data?.totalElements || 0;
      
      // TODO: Quando tiver endpoint de avaliações, substituir
      const totalAvaliacoes = 0;
      const totalUsuarios = 0;
      
      return { 
        totalLocais, 
        totalAvaliacoes, 
        totalUsuarios 
      };
    } catch (erro) {
      console.error('Erro ao buscar estatísticas:', erro);
      return { totalLocais: 0, totalAvaliacoes: 0, totalUsuarios: 0 };
    }
  },

  /**
   * Busca detalhes de um local específico
   */
  async obterLocal(id) {
    try {
      const response = await api.get(`/locais/${id}`);
      return response.data;
    } catch (erro) {
      console.error(`Erro ao obter local ID ${id}:`, erro);
      throw erro;
    }
  },

  /**
   * Atualiza um local existente
   */
  async atualizarLocal(id, dados) {
    try {
      const response = await api.put(`/locais/${id}`, dados);
      return response.data;
    } catch (erro) {
      console.error(`Erro ao atualizar local ID ${id}:`, erro);
      throw erro;
    }
  },

  /**
   * Remove um local
   */
  async removerLocal(id) {
    try {
      const response = await api.delete(`/locais/${id}`);
      return response.data;
    } catch (erro) {
      console.error(`Erro ao remover local ID ${id}:`, erro);
      throw erro;
    }
  },

  /**
   * Busca locais por categoria
   */
  async buscarPorCategoria(categoria) {
    try {
      const response = await api.get(`/locais/categoria/${categoria}`);
      return response.data || [];
    } catch (erro) {
      console.error(`Erro ao buscar locais por categoria ${categoria}:`, erro);
      return [];
    }
  },

  /**
   * Busca locais por tipo de acessibilidade
   */
  async buscarPorTipoAcessibilidade(tipo) {
    try {
      const response = await api.get(`/locais/tipo-acessibilidade/${tipo}`);
      return response.data || [];
    } catch (erro) {
      console.error(`Erro ao buscar locais por tipo ${tipo}:`, erro);
      return [];
    }
  },

  /**
   * Formata os dados do local para o padrão do frontend
   */
  formatarLocal(local) {
    if (!local) return null;
    
    return {
      id: local.idLocal,
      nome: local.nome,
      descricao: local.descricao,
      categoria: local.categoria,
      tipoAcessibilidade: local.tipoAcessibilidade,
      status: local.status,
      avaliacaoMedia: local.avaliacaoMedia || 0,
      totalAvaliacoes: 0,
      imagemUrl: local.imagem || null,
      dataCriacao: local.dataCriacao,
      endereco: local.endereco ? {
        logradouro: local.endereco.logradouro,
        numero: local.endereco.numero,
        complemento: local.endereco.complemento,
        bairro: local.endereco.bairro,
        cidade: local.endereco.cidade,
        estado: local.endereco.estado,
        cep: local.endereco.cep
      } : null
    };
  },

  /**
   * Formata uma lista de locais
   */
  formatarLocais(locais) {
    if (!Array.isArray(locais)) return [];
    return locais.map(local => this.formatarLocal(local));
  }
};

export default LocalService;