// services/AvaliacaoService.js
import api from '../api/axios';

class AvaliacaoService {
  /**
   * Envia uma avaliação para o backend
   * @param {Object} dados - Dados da avaliação
   * @param {number} dados.idLocal - ID do local
   * @param {number} dados.idUsuario - ID do usuário logado
   * @param {number} dados.notaAcessibilidadeVisual - Nota 1-5
   * @param {number} dados.notaAcessibilidadeMotora - Nota 1-5
   * @param {number} dados.notaAcessibilidadeAuditiva - Nota 1-5
   * @param {string} dados.comentario - Comentário opcional
   * @returns {Promise<Object>}
   */
  static async criarAvaliacao(dados) {
    try {
      // Validar dados obrigatórios
      if (!dados.idLocal || !dados.idUsuario) {
        throw new Error('ID do local e usuário são obrigatórios');
      }

      if (!dados.notaAcessibilidadeVisual || !dados.notaAcessibilidadeMotora || !dados.notaAcessibilidadeAuditiva) {
        throw new Error('Todas as notas de acessibilidade são obrigatórias');
      }

      // Validar notas (1-5)
      const notas = [dados.notaAcessibilidadeVisual, dados.notaAcessibilidadeMotora, dados.notaAcessibilidadeAuditiva];
      for (const nota of notas) {
        if (nota < 1 || nota > 5) {
          throw new Error('As notas devem ser entre 1 e 5');
        }
      }

      const payload = {
        notaAcessibilidadeVisual: Number(dados.notaAcessibilidadeVisual),
        notaAcessibilidadeMotora: Number(dados.notaAcessibilidadeMotora),
        notaAcessibilidadeAuditiva: Number(dados.notaAcessibilidadeAuditiva),
        comentario: dados.comentario?.trim() || null,
        idUsuario: Number(dados.idUsuario),
        idLocal: Number(dados.idLocal)
      };

      console.log('📤 Enviando avaliação para /api/avaliacoes:', payload);

      const response = await api.post('/avaliacoes', payload);
      
      if (response.data) {
        console.log('✅ Avaliação criada com sucesso:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'Avaliação enviada com sucesso!'
        };
      }
      
      return {
        success: false,
        message: 'Resposta inválida do servidor'
      };

    } catch (error) {
      console.error('❌ Erro ao criar avaliação:', error);
      
      let errorMessage = 'Erro ao enviar avaliação';
      
      if (error.response) {
        // Erro do backend
        console.error('Resposta do servidor:', error.response.data);
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes("já avaliou")) {
            errorMessage = 'Você já avaliou este local anteriormente';
          } else {
            errorMessage = 'Dados inválidos. Verifique as notas (1-5)';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Você precisa estar logado para avaliar';
        } else if (error.response.status === 403) {
          errorMessage = 'Você não tem permissão para avaliar';
        } else if (error.response.status === 404) {
          errorMessage = 'Local ou usuário não encontrado';
        }
      } else if (error.request) {
        errorMessage = 'Servidor não está respondendo. Tente novamente.';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  }

  /**
   * Busca avaliações de um local
   * @param {number} idLocal - ID do local
   * @returns {Promise<Object>}
   */
  static async buscarAvaliacoesPorLocal(idLocal) {
    try {
      const response = await api.get(`/avaliacoes/local/${idLocal}`);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          total: response.data.length
        };
      }
      
      return {
        success: false,
        data: [],
        total: 0
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Erro ao buscar avaliações'
      };
    }
  }

  /**
   * Busca uma avaliação específica
   * @param {number} idAvaliacao - ID da avaliação
   * @returns {Promise<Object>}
   */
  static async buscarAvaliacaoPorId(idAvaliacao) {
    try {
      const response = await api.get(`/avaliacoes/${idAvaliacao}`);
      
      if (response.data) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Avaliação não encontrada'
      };
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar avaliação'
      };
    }
  }

  /**
   * Busca avaliações de um usuário
   * @param {number} idUsuario - ID do usuário
   * @returns {Promise<Object>}
   */
  static async buscarAvaliacoesPorUsuario(idUsuario) {
    try {
      const response = await api.get(`/avaliacoes/usuario/${idUsuario}`);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          total: response.data.length
        };
      }
      
      return {
        success: false,
        data: [],
        total: 0
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Erro ao buscar avaliações'
      };
    }
  }

  /**
   * Verifica se usuário já avaliou um local
   * @param {number} idLocal - ID do local
   * @param {number} idUsuario - ID do usuário
   * @returns {Promise<boolean>}
   */
  static async usuarioJaAvaliou(idLocal, idUsuario) {
    try {
      const result = await this.buscarAvaliacoesPorLocal(idLocal);
      if (result.success && result.data) {
        return result.data.some(avaliacao => {
          const avaliacaoUsuarioId = avaliacao.usuario?.idUsuario || avaliacao.idUsuario;
          return Number(avaliacaoUsuarioId) === Number(idUsuario);
        });
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar avaliação existente:', error);
      return false;
    }
  }

  /**
   * Calcula a média de avaliações de um local
   * @param {Array} avaliacoes - Lista de avaliações
   * @returns {number} Média calculada
   */
  static calcularMediaLocal(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) return 0;
    
    let soma = 0;
    let count = 0;
    
    for (const avaliacao of avaliacoes) {
      const notas = [
        avaliacao.notaAcessibilidadeVisual,
        avaliacao.notaAcessibilidadeMotora,
        avaliacao.notaAcessibilidadeAuditiva
      ];
      
      const mediaAvaliacao = notas.filter(n => n).reduce((a, b) => a + b, 0) / 3;
      soma += mediaAvaliacao;
      count++;
    }
    
    return count > 0 ? Number((soma / count).toFixed(1)) : 0;
  }

  /**
   * Formata uma avaliação para exibição
   * @param {Object} avaliacao - Avaliação do backend
   * @returns {Object} Avaliação formatada
   */
  static formatarAvaliacao(avaliacao) {
    if (!avaliacao) return null;
    
    const mediaGeral = (
      (avaliacao.notaAcessibilidadeVisual || 0) +
      (avaliacao.notaAcessibilidadeMotora || 0) +
      (avaliacao.notaAcessibilidadeAuditiva || 0)
    ) / 3;
    
    return {
      id: avaliacao.idAvaliacao || avaliacao.id,
      nota: mediaGeral,
      notaVisual: avaliacao.notaAcessibilidadeVisual || 0,
      notaMotora: avaliacao.notaAcessibilidadeMotora || 0,
      notaAuditiva: avaliacao.notaAcessibilidadeAuditiva || 0,
      comentario: avaliacao.comentario,
      dataCriacao: avaliacao.dataAvaliacao || avaliacao.dataCriacao,
      data: avaliacao.dataAvaliacao || avaliacao.dataCriacao,
      usuarioNome: avaliacao.usuario?.nome || avaliacao.nomeUsuario || 'Usuário',
      usuarioId: avaliacao.usuario?.idUsuario || avaliacao.idUsuario,
      moderado: avaliacao.moderado || false
    };
  }

  /**
   * Formata lista de avaliações
   * @param {Array} avaliacoes - Lista de avaliações do backend
   * @returns {Array} Lista formatada
   */
  static formatarAvaliacoes(avaliacoes) {
    if (!avaliacoes || !Array.isArray(avaliacoes)) return [];
    return avaliacoes.map(a => this.formatarAvaliacao(a)).filter(a => a);
  }
}

export default AvaliacaoService;