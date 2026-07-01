import api from '../api/axios';

const eh401EmLeituraPublicaDeAvaliacoes = (error) => {
  const status = error?.response?.status;
  const metodo = String(error?.config?.method || 'get').toLowerCase();
  const caminho = String(error?.config?.url || '').split('?')[0];

  return status === 401 && metodo === 'get' && caminho.startsWith('/avaliacoes/local/');
};

class AvaliacaoService {
  static async buscarAvaliacoesPorLocal(idLocal) {
    try {
      const response = await api.get(`/avaliacoes/local/${idLocal}`);

      if (response.data && Array.isArray(response.data)) {
        const avaliacoesFormatadas = response.data.map(avaliacao => {
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
            usuarioNome: usuario.nome || avaliacao.nomeUsuario || 'Usuï¿½rio',
            usuarioId: usuario.idUsuario || avaliacao.idUsuario,
            usuarioEmail: usuario.email || '',
            dataAvaliacao: avaliacao.dataAvaliacao,
            data: avaliacao.dataAvaliacao,
            moderado: avaliacao.moderado !== false
          };
        });

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
      if (!eh401EmLeituraPublicaDeAvaliacoes(error)) {
        console.error('Erro ao buscar avaliaï¿½ï¿½es:', error);
      }
      
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Erro ao buscar avaliaï¿½ï¿½es'
      };
    }
  }

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
      console.error('Erro ao buscar avaliaï¿½ï¿½es do usuï¿½rio:', error);
      return { success: false, data: [], total: 0, message: error.message };
    }
  }

  static async getTotalAvaliacoes(localId) {
    try {
      const response = await api.get(`/avaliacoes/local/${localId}/count`);
      return response.data?.count || 0;
    } catch (error) {
      console.error('Erro ao buscar total de avaliaï¿½ï¿½es:', error);
      return 0;
    }
  }

  static async criarAvaliacao(dados) {
    try {
      if (!dados.idLocal || !dados.idUsuario) {
        throw new Error('ID do local e usuï¿½rio sï¿½o obrigatï¿½rios');
      }

      const payload = {
        notaAcessibilidadeVisual: Number(dados.notaAcessibilidadeVisual),
        notaAcessibilidadeMotora: Number(dados.notaAcessibilidadeMotora),
        notaAcessibilidadeAuditiva: Number(dados.notaAcessibilidadeAuditiva),
        comentario: dados.comentario?.trim() || null,
        idUsuario: Number(dados.idUsuario),
        idLocal: Number(dados.idLocal)
      };

      const response = await api.post('/avaliacoes', payload);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Avaliaï¿½ï¿½o enviada com sucesso!'
        };
      }
      
      return { success: false, message: 'Resposta invï¿½lida do servidor' };

    } catch (error) {
      console.error('Erro ao criar avaliaï¿½ï¿½o:', error);
      
      let errorMessage = 'Erro ao enviar avaliaï¿½ï¿½o';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dados invï¿½lidos';
          if (errorMessage.includes('jï¿½ avaliou')) {
            errorMessage = 'Vocï¿½ jï¿½ avaliou este local anteriormente';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Vocï¿½ precisa estar logado para avaliar';
        } else if (error.response.status === 404) {
          errorMessage = 'Local ou usuï¿½rio nï¿½o encontrado';
        }
      } else if (error.request) {
        errorMessage = 'Servidor nï¿½o estï¿½ respondendo';
      }
      
      return { success: false, message: errorMessage };
    }
  }

  static async deletarAvaliacao(id) {
    try {
      await api.delete(`/avaliacoes/${id}`);
      return { success: true, message: 'Avaliaï¿½ï¿½o excluï¿½da com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar avaliaï¿½ï¿½o:', error);
      return { success: false, message: error.response?.data?.message || 'Erro ao excluir avaliaï¿½ï¿½o' };
    }
  }

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
      usuarioNome: usuario.nome || 'Usuï¿½rio',
      usuarioId: usuario.idUsuario,
      usuarioEmail: usuario.email,
      dataAvaliacao: avaliacao.dataAvaliacao,
      data: avaliacao.dataAvaliacao,
      moderado: avaliacao.moderado !== false
    };
  }

  static formatarAvaliacoes(avaliacoes) {
    if (!avaliacoes || !Array.isArray(avaliacoes)) return [];
    return avaliacoes.map(a => this.formatarAvaliacao(a)).filter(a => a);
  }

  static getLocalId(local) {
    return local?.id || local?.idLocal || null;
  }
}

export default AvaliacaoService;