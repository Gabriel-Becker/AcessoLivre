import api from '../api/axios';

const eh401EmLeituraPublicaDeAvaliacoes = (error) => {
  const status = error?.response?.status;
  const metodo = String(error?.config?.method || 'get').toLowerCase();
  const caminho = String(error?.config?.url || '').split('?')[0];

  return status === 401 && metodo === 'get' && caminho.startsWith('/avaliacoes/local/');
};

const extrairMensagemErro = (error) => {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  const candidatos = [
    data?.message,
    data?.mensagem,
    data?.error,
    data?.erro,
    data?.detail,
    data?.details,
  ];

  for (const valor of candidatos) {
    if (typeof valor === 'string' && valor.trim()) {
      return valor.trim();
    }
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const primeira = data.errors[0];
    if (typeof primeira === 'string' && primeira.trim()) {
      return primeira.trim();
    }
    if (typeof primeira?.message === 'string' && primeira.message.trim()) {
      return primeira.message.trim();
    }
  }

  return '';
};

const ehAvaliacaoDuplicada = (error) => {
  const status = Number(error?.response?.status);
  if (![400, 409, 422].includes(status)) {
    return false;
  }

  const mensagem = extrairMensagemErro(error)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!mensagem) {
    return false;
  }

  const sinaisDuplicidade = [
    'ja avaliou',
    'ja avaliada',
    'avaliacao ja existe',
    'avaliacao duplicada',
    'duplicate',
    'constraint',
    'unique',
  ];

  return sinaisDuplicidade.some((sinal) => mensagem.includes(sinal));
};

class ServicoAvaliacao {
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
            usuarioNome: usuario.nome || avaliacao.nomeUsuario || 'Usuário',
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
        console.error('Erro ao buscar avaliações:', error);
      }
      
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Erro ao buscar avaliações'
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
      console.error('Erro ao buscar avaliações do usuário:', error);
      return { success: false, data: [], total: 0, message: error.message };
    }
  }

  static async getTotalAvaliacoes(localId) {
    try {
      const response = await api.get(`/avaliacoes/local/${localId}/count`);
      return response.data?.count || 0;
    } catch (error) {
      console.error('Erro ao buscar total de avaliações:', error);
      return 0;
    }
  }

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
      console.error('Erro ao criar avaliação:', error);

      if (ehAvaliacaoDuplicada(error)) {
        return {
          success: false,
          code: 'AVALIACAO_DUPLICADA',
          message: 'Você já avaliou este local. Cada usuário pode enviar apenas uma avaliação por local.'
        };
      }
      
      let errorMessage = 'Erro ao enviar avaliação';
      let errorCode = 'ERRO_AVALIACAO';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = extrairMensagemErro(error) || 'Dados inválidos';
          errorCode = 'DADOS_INVALIDOS';
        } else if (error.response.status === 401) {
          errorMessage = 'Você precisa estar logado para avaliar';
          errorCode = 'NAO_AUTENTICADO';
        } else if (error.response.status === 404) {
          errorMessage = 'Local ou usuário não encontrado';
          errorCode = 'NAO_ENCONTRADO';
        }
      } else if (error.request) {
        errorMessage = 'Servidor não está respondendo';
        errorCode = 'SERVIDOR_INDISPONIVEL';
      }
      
      return { success: false, code: errorCode, message: errorMessage };
    }
  }

  static async deletarAvaliacao(id) {
    try {
      await api.delete(`/avaliacoes/${id}`);
      return { success: true, message: 'Avaliação excluída com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      return { success: false, message: error.response?.data?.message || 'Erro ao excluir avaliação' };
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
      usuarioNome: usuario.nome || 'Usuário',
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

export default ServicoAvaliacao;