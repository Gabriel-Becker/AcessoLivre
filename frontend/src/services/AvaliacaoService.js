// services/AvaliacaoService.js
import api from '../api/axios';

class AvaliacaoService {
  /**
   * Busca avaliações de um local
   * @param {number} idLocal - ID do local
   * @returns {Promise<Object>}
   */
  static async buscarAvaliacoesPorLocal(idLocal) {
    try {
      console.log('📡 Buscando avaliações para o local:', idLocal);
      
      const response = await api.get(`/avaliacoes/local/${idLocal}`);
      
      console.log('📥 Resposta do backend (RAW):', JSON.stringify(response.data, null, 2));
      
      if (response.data && Array.isArray(response.data)) {
        // Mapear os dados do backend para o formato esperado pelo frontend
        const avaliacoesFormatadas = response.data.map(avaliacao => {
          // Extrair dados do usuário
          const usuario = avaliacao.usuario || {};
          
          // Log específico para a data
          console.log(`📅 Data bruta da avaliação ${avaliacao.idAvaliacao}:`, {
            dataAvaliacao: avaliacao.dataAvaliacao,
            tipo: typeof avaliacao.dataAvaliacao,
            valor: avaliacao.dataAvaliacao
          });
          
          return {
            id: avaliacao.idAvaliacao,
            idAvaliacao: avaliacao.idAvaliacao,
            notaAcessibilidadeVisual: avaliacao.notaAcessibilidadeVisual || 0,
            notaAcessibilidadeMotora: avaliacao.notaAcessibilidadeMotora || 0,
            notaAcessibilidadeAuditiva: avaliacao.notaAcessibilidadeAuditiva || 0,
            notaGeral: avaliacao.notaGeral || 0,
            nota: avaliacao.notaGeral || 0,
            comentario: avaliacao.comentario || '',
            usuarioNome: usuario.nome || avaliacao.nomeUsuario || 'Usuário',
            usuarioId: usuario.idUsuario || avaliacao.idUsuario,
            usuarioEmail: usuario.email || '',
            // PRESERVAR A DATA ORIGINAL SEM CONVERSÃO
            dataAvaliacao: avaliacao.dataAvaliacao,
            data: avaliacao.dataAvaliacao,
            moderado: avaliacao.moderado !== false
          };
        });
        
        console.log('✅ Avaliações formatadas:', avaliacoesFormatadas);
        console.log('📅 Datas após formatação:', avaliacoesFormatadas.map(a => ({ id: a.id, data: a.dataAvaliacao, tipo: typeof a.dataAvaliacao })));
        
        return {
          success: true,
          data: avaliacoesFormatadas,
          total: avaliacoesFormatadas.length
        };
      }
      
      return {
        success: true,
        data: [],
        total: 0
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações:', error);
      console.error('Detalhes:', error.response?.data);
      
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Erro ao buscar avaliações'
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
      
      if (response.data && Array.isArray(response.data)) {
        const avaliacoesFormatadas = response.data.map(avaliacao => this.formatarAvaliacao(avaliacao));
        
        return {
          success: true,
          data: avaliacoesFormatadas,
          total: avaliacoesFormatadas.length
        };
      }
      
      return { success: true, data: [], total: 0 };
      
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      return { success: false, data: [], total: 0, message: error.message };
    }
  }

  /**
   * Envia uma avaliação para o backend
   */
  static async criarAvaliacao(dados) {
    try {
      if (!dados.idLocal || !dados.idUsuario) {
        throw new Error('ID do local e usuário são obrigatórios');
      }

      const payload = {
        notaAcessibilidadeVisual: Number(dados.notaAcessibilidadeVisual),
        notaAcessibilidadeMotora: Number(dados.notaAcessibilidadeMotora),
        notaAcessibilidadeAuditiva: Number(dados.notaAcessibilidadeAuditiva),
        comentario: dados.comentario?.trim() || null,
        idUsuario: Number(dados.idUsuario),
        idLocal: Number(dados.idLocal)
      };

      console.log('📤 Enviando avaliação:', payload);

      const response = await api.post('/avaliacoes', payload);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Avaliação enviada com sucesso!'
        };
      }
      
      return { success: false, message: 'Resposta inválida do servidor' };

    } catch (error) {
      console.error('❌ Erro ao criar avaliação:', error);
      
      let errorMessage = 'Erro ao enviar avaliação';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dados inválidos';
          if (errorMessage.includes('já avaliou')) {
            errorMessage = 'Você já avaliou este local anteriormente';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Você precisa estar logado para avaliar';
        } else if (error.response.status === 404) {
          errorMessage = 'Local ou usuário não encontrado';
        }
      } else if (error.request) {
        errorMessage = 'Servidor não está respondendo';
      }
      
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Formata uma avaliação para exibição
   */
  static formatarAvaliacao(avaliacao) {
    if (!avaliacao) return null;
    
    const usuario = avaliacao.usuario || {};
    
    return {
      id: avaliacao.idAvaliacao,
      idAvaliacao: avaliacao.idAvaliacao,
      notaAcessibilidadeVisual: avaliacao.notaAcessibilidadeVisual || 0,
      notaAcessibilidadeMotora: avaliacao.notaAcessibilidadeMotora || 0,
      notaAcessibilidadeAuditiva: avaliacao.notaAcessibilidadeAuditiva || 0,
      notaGeral: avaliacao.notaGeral || 0,
      nota: avaliacao.notaGeral || 0,
      comentario: avaliacao.comentario || '',
      usuarioNome: usuario.nome || 'Usuário',
      usuarioId: usuario.idUsuario,
      usuarioEmail: usuario.email,
      dataAvaliacao: avaliacao.dataAvaliacao,
      data: avaliacao.dataAvaliacao,
      moderado: avaliacao.moderado !== false
    };
  }

  /**
   * Formata lista de avaliações
   */
  static formatarAvaliacoes(avaliacoes) {
    if (!avaliacoes || !Array.isArray(avaliacoes)) return [];
    return avaliacoes.map(a => this.formatarAvaliacao(a)).filter(a => a);
  }

  static getLocalId(local) {
    return local?.id || local?.idLocal || null;
  }
}

export default AvaliacaoService;