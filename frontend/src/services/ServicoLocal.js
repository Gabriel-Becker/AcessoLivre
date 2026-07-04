import api from '../api/axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { normalizarUrlImagem } from '../utils/urlImagem';

const ServicoLocal = {
  /**
   * Cadastra um novo local
   */
  async cadastrarLocal(dados) {
    const response = await api.post('/locais', dados);
    return response.data;
  },

  /**
   * Converte imagem para o formato correto do FormData no React Native
   */
  async prepararImagemParaUpload(imagem) {
    try {
      let uri = imagem.uri;
      let filename = imagem.name || `image_${Date.now()}.jpg`;
      let type = imagem.type || 'image/jpeg';

      // Para React Native, verificamos se o arquivo existe
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error(`Arquivo não encontrado: ${uri}`);
        }

        return {
          uri,
          name: filename,
          type,
          size: fileInfo.size,
        };
      }

      // Para web
      if (imagem.file) {
        return imagem.file;
      }

      return {
        uri,
        name: filename,
        type,
      };
    } catch (error) {
      console.error('Erro ao preparar imagem:', error);
      throw error;
    }
  },

  /**
   * Envia uma imagem para um local via Multipart FormData
   */
  async enviarImagem(idLocal, imagem, onProgress) {
    const formData = new FormData();
    formData.append('idLocal', String(idLocal));

    try {
      // Preparar a imagem para upload
      const imagemPreparada = await this.prepararImagemParaUpload(imagem);

      // Criar o objeto para o FormData no formato correto para React Native
      let arquivoParaEnviar;
      
      if (Platform.OS !== 'web') {
        // React Native: formato esperado pelo backend
        arquivoParaEnviar = {
          uri: imagemPreparada.uri,
          name: imagemPreparada.name,
          type: imagemPreparada.type,
        };
      } else if (Platform.OS === 'web' && imagem.file) {
        // Web: usar o File diretamente
        arquivoParaEnviar = imagem.file;
      } else {
        // Fallback
        arquivoParaEnviar = {
          uri: imagemPreparada.uri,
          name: imagemPreparada.name,
          type: imagemPreparada.type,
        };
      }

      formData.append('arquivo', arquivoParaEnviar);

      const response = await api.post('/imagens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress
          ? (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Erro detalhado no upload:', error);
      throw new Error(`Falha ao enviar imagem: ${error.message}`);
    }
  },

  /**
   * Envia máltiplas imagens com controle de progresso
   */
  async enviarMultiplasImagens(idLocal, imagens, onProgress) {
    const resultados = [];
    let imagensEnviadas = 0;
    let imagensComErro = 0;

    for (let i = 0; i < imagens.length; i++) {
      if (onProgress) {
        onProgress(i + 1, imagens.length);
      }

      try {
        const resultado = await this.enviarImagem(idLocal, imagens[i]);
        resultados.push(resultado);
        imagensEnviadas++;
      } catch (erro) {
        console.error(`? Erro na imagem ${i + 1}:`, erro);
        imagensComErro++;
        // Continua com as práximas imagens
      }
    }

    return {
      resultados,
      total: imagens.length,
      enviadas: imagensEnviadas,
      erros: imagensComErro,
    };
  },

  /**
   * Busca todas as imagens de um local
   */
  async buscarImagensDoLocal(idLocal) {
    const response = await api.get(`/imagens/local/${idLocal}`);
    return response.data;
  },

  /**
   * Remove uma imagem
   */
  async removerImagem(idImagem) {
    await api.delete(`/imagens/${idImagem}`);
    return true;
  },

  /**
   * Obtám URL completa da imagem
   */
  getImagemUrl(url) {
    return normalizarUrlImagem(url);
  },

  /**
   * Lista locais com paginação
   */
  async listarLocais(params = {}) {
    const { page = 0, size = 20, sort = 'nome' } = params;
    const response = await api.get('/locais', { params: { page, size, sort } });
    return response.data;
  },

  async obterMeusLocais(idUsuario) {
    if (!idUsuario) return [];
    const response = await api.get(`/locais/usuario/${idUsuario}`);
    return response.data || [];
  },

  /**
   * Busca locais em destaque
   */
  async obterLocaisEmDestaque(limite = 4) {
    const response = await api.get('/locais', {
      params: { page: 0, size: limite, sort: 'dataCriacao,desc' }
    });
    return response.data?.content || [];
  },

  /**
   * Busca estatásticas gerais
   */
  async obterEstatisticas() {
    try {
      const response = await api.get('/locais/estatisticas');
      const data = response?.data || {};

      return {
        totalLocais: this.normalizarNumero(data?.totalLocais),
        totalAvaliacoes: this.normalizarNumero(data?.totalAvaliacoes),
        totalUsuarios: this.normalizarNumero(data?.totalUsuarios),
      };
    } catch (erro) {
      console.warn('Falha ao buscar /locais/estatisticas. Aplicando fallback local.', erro?.message || erro);

      const [totalLocaisResult, totalAvaliacoesResult, totalUsuariosResult] = await Promise.allSettled([
        this.obterTotalLocaisComSublocais(),
        this.obterTotalAvaliacoes(),
        this.obterTotalUsuariosAtivosComBaseNosLocais(),
      ]);

      return {
        totalLocais: totalLocaisResult.status === 'fulfilled' ? this.normalizarNumero(totalLocaisResult.value) : 0,
        totalAvaliacoes: totalAvaliacoesResult.status === 'fulfilled' ? this.normalizarNumero(totalAvaliacoesResult.value) : 0,
        totalUsuarios: totalUsuariosResult.status === 'fulfilled' ? this.normalizarNumero(totalUsuariosResult.value) : 0,
      };
    }
  },

  async obterTotalAvaliacoes() {
    const response = await api.get('/avaliacoes', {
      params: { page: 0, size: 1 },
    });

    return this.normalizarNumero(response?.data?.totalElements);
  },

  async obterTotalUsuariosAtivosComBaseNosLocais() {
    const tamanhoPagina = 100;
    const usuariosUnicos = new Set();

    const primeiraResposta = await api.get('/locais/todos', {
      params: { page: 0, size: tamanhoPagina, sort: 'dataCriacao', direction: 'desc' },
    });

    this.acumularUsuariosDaPagina(usuariosUnicos, primeiraResposta.data?.content);

    const totalPages = Number(primeiraResposta.data?.totalPages) || 1;
    if (totalPages > 1) {
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
    }

    return usuariosUnicos.size;
  },

  async obterTotalLocaisComSublocais() {
    const tamanhoPagina = 100;
    const locaisContados = new Set();
    let locaisSemId = 0;

    const primeiraResposta = await api.get('/locais/todos', {
      params: { page: 0, size: tamanhoPagina, sort: 'dataCriacao', direction: 'desc' },
    });

    locaisSemId += this.acumularLocaisDaPagina(locaisContados, primeiraResposta.data?.content);

    const totalPages = Number(primeiraResposta.data?.totalPages) || 1;
    if (totalPages > 1) {
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
          locaisSemId += this.acumularLocaisDaPagina(locaisContados, resultado.value?.data?.content);
        }
      });
    }

    return locaisContados.size + locaisSemId;
  },

  acumularLocaisDaPagina(locaisContados, locais = []) {
    if (!Array.isArray(locais)) {
      return 0;
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

      const subLocais = Array.isArray(local?.subLocais) ? local.subLocais : [];
      if (subLocais.length > 0) {
        pilha.push(...subLocais);
      }
    }

    return locaisSemId;
  },

  acumularUsuariosDaPagina(usuariosUnicos, locais = []) {
    if (!Array.isArray(locais)) {
      return;
    }

    const pilha = [...locais];

    while (pilha.length > 0) {
      const local = pilha.pop();
      if (!local || typeof local !== 'object') {
        continue;
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
  },

  normalizarNumero(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  },

  /**
   * Busca um local por ID
   */
  async obterLocal(id) {
    const response = await api.get(`/locais/${id}`);
    return response.data;
  },

  /**
   * Atualiza um local
   */
  async atualizarLocal(id, dados) {
    const response = await api.put(`/locais/${id}`, dados);
    return response.data;
  },

  /**
   * Remove um local
   */
  async removerLocal(id) {
    const response = await api.delete(`/locais/${id}`);
    return response.data;
  },

  /**
   * Busca locais por categoria
   */
  async buscarPorCategoria(categoria) {
    const response = await api.get(`/locais/categoria/${categoria}`);
    return response.data || [];
  },

  /**
   * Busca locais por tipo de acessibilidade
   */
  async buscarPorTipoAcessibilidade(tipo) {
    const response = await api.get(`/locais/tipo-acessibilidade/${tipo}`);
    return response.data || [];
  }
};

export default ServicoLocal;