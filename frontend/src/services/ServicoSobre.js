import api from '../api/axios';

class ServicoSobre {
  static async obterMetricasImpacto() {
    const [resumoLocaisResult, avaliacoesResult] = await Promise.allSettled([
      this.obterResumoLocaisPublico(),
      api.get('/avaliacoes', { params: { page: 0, size: 1 } }),
    ]);

    const resumoLocais = resumoLocaisResult.status === 'fulfilled'
      ? resumoLocaisResult.value
      : { totalLocais: 0, totalUsuariosAtivos: 0 };

    return {
      totalLocais: Number.isFinite(resumoLocais.totalLocais) ? resumoLocais.totalLocais : 0,
      totalAvaliacoes: this.extrairTotalDaResposta(avaliacoesResult, 'totalElements'),
      totalUsuariosAtivos: Number.isFinite(resumoLocais.totalUsuariosAtivos) ? resumoLocais.totalUsuariosAtivos : 0,
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