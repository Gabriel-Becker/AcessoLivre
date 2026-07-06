import api from '../api/axios';

class ServicoSobre {
  static metricasCache = null;
  static metricasCacheTimestamp = null;
  static CACHE_DURATION = 30 * 1000;

  static invalidateCacheMetricas() {
    this.metricasCache = null;
    this.metricasCacheTimestamp = null;
  }

  static async obterMetricasImpacto(forceRefresh = false) {
    const agora = Date.now();
    const cacheValido =
      !forceRefresh &&
      this.metricasCache &&
      this.metricasCacheTimestamp &&
      (agora - this.metricasCacheTimestamp) < this.CACHE_DURATION;

    if (cacheValido) {
      return this.metricasCache;
    }

    const [locaisResult, avaliacoesResult, usuariosResult] = await Promise.allSettled([
      api.get('/locais/todos', { params: { page: 0, size: 1, sort: 'dataCriacao', direction: 'desc' } }),
      api.get('/avaliacoes', { params: { page: 0, size: 1 } }),
      api.get('/usuarios', { params: { page: 0, size: 1 } }),
    ]);

    const totalLocais = this.extrairTotalDaResposta(locaisResult, 'totalElements');
    const totalAvaliacoes = this.extrairTotalDaResposta(avaliacoesResult, 'totalElements');
    const totalUsuariosAtivosApi = this.extrairTotalDaResposta(usuariosResult, 'totalElements');

    const fallbackUsuariosPorLocais = this.extrairUsuariosDaPrimeiraPagina(locaisResult);

    this.metricasCache = {
      totalLocais: Number.isFinite(totalLocais) ? totalLocais : 0,
      totalAvaliacoes: Number.isFinite(totalAvaliacoes) ? totalAvaliacoes : 0,
      totalUsuariosAtivos: Number.isFinite(totalUsuariosAtivosApi) && totalUsuariosAtivosApi > 0
        ? totalUsuariosAtivosApi
        : fallbackUsuariosPorLocais,
    };
    this.metricasCacheTimestamp = agora;

    return this.metricasCache;
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

  static extrairUsuariosDaPrimeiraPagina(result) {
    if (result?.status !== 'fulfilled') {
      return 0;
    }

    const locais = Array.isArray(result.value?.data?.content) ? result.value.data.content : [];
    if (locais.length === 0) {
      return 0;
    }

    const usuariosUnicos = new Set();

    locais.forEach((local) => {
      const idUsuario = local?.idUsuario ?? local?.usuario?.idUsuario ?? local?.usuario?.id;
      if (idUsuario !== undefined && idUsuario !== null) {
        usuariosUnicos.add(String(idUsuario));
      }
    });

    return usuariosUnicos.size;
  }

  static async obterTotalUsuariosAtivosPublico() {
    const resumo = await this.obterResumoLocaisPublico();
    return resumo.totalUsuariosAtivos;
  }

  static async obterResumoLocaisPublico() {
    const tamanhoPagina = 100;
    const locaisContados = new Set();
    let locaisSemId = 0;
    const usuariosUnicos = new Set();

    const primeiraResposta = await api.get('/locais/todos', {
      params: { page: 0, size: tamanhoPagina, sort: 'dataCriacao', direction: 'desc' },
    });

    const resumoPrimeiraPagina = this.acumularResumoDaPagina(
      locaisContados,
      usuariosUnicos,
      primeiraResposta.data?.content
    );
    locaisSemId += resumoPrimeiraPagina.locaisSemId;

    const totalPages = Number(primeiraResposta.data?.totalPages) || 1;

    const totalElements = Number(primeiraResposta.data?.totalElements);
    if (Number.isFinite(totalElements) && totalElements >= 0) {
      return {
        totalLocais: totalElements,
        totalUsuariosAtivos: usuariosUnicos.size,
      };
    }

    if (totalPages <= 1) {
      return {
        totalLocais: locaisContados.size + locaisSemId,
        totalUsuariosAtivos: usuariosUnicos.size,
      };
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
        const resumoPagina = this.acumularResumoDaPagina(
          locaisContados,
          usuariosUnicos,
          resultado.value?.data?.content
        );
        locaisSemId += resumoPagina.locaisSemId;
      }
    });

    return {
      totalLocais: locaisContados.size + locaisSemId,
      totalUsuariosAtivos: usuariosUnicos.size,
    };
  }

  static acumularResumoDaPagina(locaisContados, usuariosUnicos, locais = []) {
    if (!Array.isArray(locais)) {
      return { locaisSemId: 0 };
    }

    let locaisSemId = 0;
    const pilha = [...locais];

    while (pilha.length > 0) {
      const local = pilha.pop();
      if (!local || typeof local !== 'object') {
        continue;
      }

      const idLocal = local?.idLocal ?? local?.id;
      const chaveLocal = idLocal !== undefined && idLocal !== null ? String(idLocal) : null;

      if (chaveLocal) {
        if (locaisContados.has(chaveLocal)) {
          continue;
        }
        locaisContados.add(chaveLocal);
      } else {
        locaisSemId += 1;
      }

      const idUsuario = local?.idUsuario ?? local?.usuario?.idUsuario ?? local?.usuario?.id;
      if (idUsuario !== undefined && idUsuario !== null) {
        usuariosUnicos.add(String(idUsuario));
      }

      const subLocais = Array.isArray(local?.subLocais) ? local.subLocais : [];
      if (subLocais.length > 0) {
        pilha.push(...subLocais);
      }
    }

    return { locaisSemId };
  }
}

export default ServicoSobre;