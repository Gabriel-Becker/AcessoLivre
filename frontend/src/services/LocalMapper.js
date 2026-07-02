import { normalizarUrlImagem } from '../utils/urlImagem';

class LocalMapper {
  static _resolverIdLocalPrincipal(local) {
    return (
      local.idLocalPrincipal ||
      local.localPrincipal?.idLocal ||
      local.localPrincipal?.id ||
      null
    );
  }

  static _resolverNomeLocalPrincipal(local) {
    return (
      local.nomeLocalPrincipal ||
      local.localPrincipal?.nome ||
      null
    );
  }

 
  static fromApi(local) {
    if (!local) return null;

    return {
      // ===== IDENTIFICAÇÃO =====
      id: local.idLocal || local.id,
      idLocal: local.idLocal || local.id,
      nome: local.nome || 'Sem nome',
      descricao: local.descricao || '',
      categoria: local.categoria || 'Sem categoria',
      status: local.status || 'ATIVO',

      // ===== HIERARQUIA =====
      nomeLocalPrincipal: this._resolverNomeLocalPrincipal(local),
      idLocalPrincipal: this._resolverIdLocalPrincipal(local),
      subLocais: local.subLocais || [],
      nivelHierarquia: local.nivelHierarquia || 0,
      isRaiz: local.isRaiz || false,
      isFolha: local.isFolha || false,

      // ===== AVALIAÇÕES =====
      avaliacaoMedia: local.avaliacaoMedia || 0,
      totalAvaliacoes: local.totalAvaliacoes || 0,

      // ===== DATAS =====
      dataCriacao: local.dataCriacao || null,
      dataAtualizacao: local.dataAtualizacao || null,

      // ===== IMAGENS =====
      imagens: local.imagens || [],
      totalImagens: local.totalImagens || (local.imagens?.length || 0),
      
      imagemUrl: this._getFirstImageUrl(local),
      
      imagensUrls: this._getAllImageUrls(local),

      // ===== ENDEREáO =====
      endereco: local.endereco ? {
        logradouro: local.endereco.logradouro,
        numero: local.endereco.numero,
        complemento: local.endereco.complemento,
        bairro: local.endereco.bairro,
        cidade: local.endereco.cidade,
        estado: local.endereco.estado,
        cep: local.endereco.cep,
        latitude: local.endereco.latitude,
        longitude: local.endereco.longitude
      } : null,

      // ===== ACESSIBILIDADE =====
      tiposAcessibilidade: local.tiposAcessibilidade || [],

      // ===== USUáRIO =====
      idUsuario: local.idUsuario || local.usuario?.idUsuario || null,
      nomeUsuario: local.nomeUsuario || local.usuario?.nome || null,

      // ===== CONTATO =====
      telefone: local.telefone || null,
      site: local.site || null,
      horarioFuncionamento: local.horarioFuncionamento || null,

      // ===== FLAGS PARA UI =====
      isMaisRecente: false, // Será setado posteriormente pelo serviáo
    };
  }


  static _getFirstImageUrl(local) {
    if (!local) return null;


    if (local.imagens && Array.isArray(local.imagens) && local.imagens.length > 0) {
      const primeiraImagem = local.imagens[0];
      return normalizarUrlImagem(primeiraImagem.urlCompleta || primeiraImagem.url || primeiraImagem.caminhoRelativo || null);
    }

    if (local.imagemUrl) return normalizarUrlImagem(local.imagemUrl);
    if (local.imagemPrincipal) return normalizarUrlImagem(local.imagemPrincipal);
    if (local.imagem) return normalizarUrlImagem(local.imagem);

    return null;
  }

  static _getAllImageUrls(local) {
    if (!local) return [];

    if (local.imagens && Array.isArray(local.imagens) && local.imagens.length > 0) {
      return local.imagens
        .map(img => normalizarUrlImagem(img.urlCompleta || img.url || img.caminhoRelativo))
        .filter(Boolean);
    }

    const urlUnica = this._getFirstImageUrl(local);
    return urlUnica ? [urlUnica] : [];
  }

  static fromApiList(locais) {
    if (!locais || !Array.isArray(locais)) return [];
    return locais.map(local => this.fromApi(local)).filter(Boolean);
  }

  static markNewest(locais) {
    if (!locais || locais.length === 0) return locais;

    const comData = locais.filter(l => l.dataCriacao);
    
    if (comData.length === 0) return locais;

    const ordenados = [...comData].sort((a, b) => 
      new Date(b.dataCriacao) - new Date(a.dataCriacao)
    );

    const idMaisRecente = ordenados[0]?.id;

    return locais.map(local => ({
      ...local,
      isMaisRecente: local.id === idMaisRecente
    }));
  }

  static calcularEstatisticas(locais) {
    if (!locais || locais.length === 0) {
      return { totalLocais: 0, totalAvaliacoes: 0, mediaGeral: 0 };
    }

    const totalLocais = locais.length;
    const totalAvaliacoes = locais.reduce((sum, local) => sum + (local.totalAvaliacoes || 0), 0);
    const somaNotas = locais.reduce((sum, local) => sum + (local.avaliacaoMedia || 0), 0);
    const mediaGeral = totalLocais > 0 ? Number((somaNotas / totalLocais).toFixed(1)) : 0;

    return { totalLocais, totalAvaliacoes, mediaGeral };
  }
}

export default LocalMapper;