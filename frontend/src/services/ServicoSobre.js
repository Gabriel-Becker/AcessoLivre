import api from '../api/axios';

class SobreService {
  static async obterMetricasImpacto() {
    const [locaisResult, avaliacoesResult, usuariosAtivosResult] = await Promise.allSettled([
      api.get('/locais', { params: { page: 0, size: 1 } }),
      api.get('/avaliacoes', { params: { page: 0, size: 1 } }),
      this.obterTotalUsuariosAtivosPublico(),
    ]);

    return {
      totalLocais: this.extrairTotalDaResposta(locaisResult, 'totalElements'),
      totalAvaliacoes: this.extrairTotalDaResposta(avaliacoesResult, 'totalElements'),
      totalUsuariosAtivos: this.extrairTotalDireto(usuariosAtivosResult),
    };
  }

  static extrairTotalDaResposta(result, campoTotal) {
    if (result?.status !== 'fulfilled') {
      return 0;
    }

    const data = result.value?.data;
    const total = data?.[campoTotal];
    return Number.isFinite(total) ? total : 0;
  }

  static extrairTotalDireto(result) {
    if (result?.status !== 'fulfilled') {
      return 0;
    }

    return Number.isFinite(result.value) ? result.value : 0;
  }

  static async obterTotalUsuariosAtivosPublico() {
    const tamanhoPagina = 100;
    const usuariosUnicos = new Set();

    const primeiraResposta = await api.get('/locais/todos', {
      params: { page: 0, size: tamanhoPagina, sort: 'dataCriacao', direction: 'desc' },
    });

    this.acumularUsuariosDaPagina(usuariosUnicos, primeiraResposta.data?.content);

    const totalPages = Number(primeiraResposta.data?.totalPages) || 1;

    if (totalPages <= 1) {
      return usuariosUnicos.size;
    }

    const paginasRestantes = Array.from({ length: totalPages - 1 }, (_, index) => index + 1);
    const respostasRestantes = await Promise.allSettled(
      paginasRestantes.map((page) =>
        api.get('/locais/todos', {
          params: { page, size: tamanhoPagina, sort: 'dataCriacao', direction: 'desc' },
        })
      )
    );

    respostasRestantes.forEach((resultado) => {
      if (resultado.status === 'fulfilled') {
        this.acumularUsuariosDaPagina(usuariosUnicos, resultado.value?.data?.content);
      }
    });

    return usuariosUnicos.size;
  }

  static acumularUsuariosDaPagina(usuariosUnicos, locais = []) {
    if (!Array.isArray(locais)) {
      return;
    }

    locais.forEach((local) => {
      const idUsuario = local?.idUsuario;
      if (idUsuario !== undefined && idUsuario !== null) {
        usuariosUnicos.add(String(idUsuario));
      }
    });
  }
}

export default SobreService;