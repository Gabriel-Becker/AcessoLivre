import api from './axios';
import ServicoAutenticacao from '../services/ServicoAutenticacao';
import { triggerLogout } from '../utils/GerenciadorSessao';
import { resetToAuth } from '../navigation/navigationRef';
import { limparCacheBaseUrl, resolverBaseUrlApi } from '../config/apiConfig';
import toastHelper from '../utils/toastHelper';

let reautenticacaoEmAndamento = null;
let avisoSessaoExpiradaAtivo = false;

const normalizarCaminho = (url = '') => {
  const bruto = String(url || '').split('?')[0];
  if (!bruto) return '';

  // Aceita URL absoluta (http://host/api/rota) e relativa (/rota).
  let caminho = bruto;
  try {
    if (bruto.startsWith('http://') || bruto.startsWith('https://')) {
      caminho = new URL(bruto).pathname;
    }
  } catch {
    caminho = bruto;
  }

  if (!caminho.startsWith('/')) {
    caminho = `/${caminho}`;
  }

  if (caminho.startsWith('/api/')) {
    return caminho.replace(/^\/api/, '');
  }

  return caminho;
};

const ehRotaPublicaDeLeitura = (config = {}) => {
  const metodo = String(config.method || 'get').toLowerCase();
  const caminho = normalizarCaminho(config.url || '');

  if (metodo !== 'get') {
    return false;
  }

  return (
    caminho === '/locais' ||
    caminho.startsWith('/locais/') ||
    caminho === '/avaliacoes' ||
    caminho.startsWith('/avaliacoes/local/') ||
    caminho.startsWith('/uploads/')
  );
};

const ehEndpointAuth = (url = '') => {
  const caminho = normalizarCaminho(url);
  return caminho.startsWith('/auth/');
};

const ehEndpointReauth = (url = '') => {
  const caminho = normalizarCaminho(url);
  return caminho.startsWith('/auth/reauth/');
};

const notificarSessaoExpirada = () => {
  if (avisoSessaoExpiradaAtivo) return;

  avisoSessaoExpiradaAtivo = true;
  toastHelper.showError('Faça login novamente para continuar.', 'Sessão expirada');
  toastHelper.runAfterToast(() => {
    resetToAuth();
    avisoSessaoExpiradaAtivo = false;
  });
};

api.interceptors.request.use(
  async (config) => {
    try {
      const baseUrlResolvida = await resolverBaseUrlApi();
      if (baseUrlResolvida) {
        config.baseURL = baseUrlResolvida;
        api.defaults.baseURL = baseUrlResolvida;
      }

      if (ehRotaPublicaDeLeitura(config)) {
        return config;
      }

      const tokenEmMemoria = ServicoAutenticacao.getTokenEmMemoria();
      const token = tokenEmMemoria || await ServicoAutenticacao.getToken();
      if (token) {
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers = {
            ...(config.headers || {}),
            Authorization: `Bearer ${token}`,
          };
        }
      }
      return config;
    } catch (_error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  async (response) => {
    try {
      const newToken = response.headers?.['new-auth-token'];
      if (newToken) {
        await ServicoAutenticacao.setToken(newToken);
      }
    } catch (_error) {
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const requestConfig = error.config || {};
    const isLoginEndpoint = String(requestUrl).includes('/auth/login');
    const isAuthEndpoint = ehEndpointAuth(requestUrl);
    const isReauthEndpoint = ehEndpointReauth(requestUrl);
    const isPublicReadEndpoint = ehRotaPublicaDeLeitura(requestConfig);

    if (status === 401 && isLoginEndpoint) {
      return Promise.reject(error);
    }

    // Nunca tentar reautenticar quando a própria reautenticação falhou.
    if (status === 401 && isReauthEndpoint) {
      try {
        await ServicoAutenticacao.removeToken();
        await ServicoAutenticacao.setUserData(null);
      } catch {
      }
      return Promise.reject(error);
    }

    // Para outros endpoints de auth (exceto /auth/me), evitar ciclo de renovação.
    if (status === 401 && isAuthEndpoint && !String(requestUrl).includes('/auth/me')) {
      return Promise.reject(error);
    }

    if (status === 401 && isPublicReadEndpoint) {
      try {
        await ServicoAutenticacao.removeToken();
      } catch {
      }
      return Promise.reject(error);
    }

    // Retry-once mitigation: try silent reauth before forcing logout.
    if (status === 401 && !isLoginEndpoint) {
      try {
        const originalRequest = requestConfig;

        const tokenAtual = await ServicoAutenticacao.getToken();
        const temTokenValido = typeof tokenAtual === 'string' && tokenAtual.trim().length > 0;

        // Visitante (sem token) não deve ser redirecionado para login.
        if (!temTokenValido) {
          return Promise.reject(error);
        }

        // avoid infinite retry loops
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokenData = ServicoAutenticacao.parseJwt(tokenAtual);
            const userId = tokenData?.userId || tokenData?.user_id || tokenData?.sub || null;

            if (!userId) {
              await ServicoAutenticacao.removeToken();
              await ServicoAutenticacao.setUserData(null);
              return Promise.reject(error);
            }

            // attempt to reauthenticate once (single-flight para evitar tempestade de requests)
            if (!reautenticacaoEmAndamento) {
              // eslint-disable-next-line import/no-named-as-default-member
              reautenticacaoEmAndamento = ServicoAutenticacao.reautenticar(userId).finally(() => {
                reautenticacaoEmAndamento = null;
              });
            }

            const newToken = await reautenticacaoEmAndamento;
            if (newToken) {
              await ServicoAutenticacao.setToken(newToken);
              // update Cabecalho and retry original request
              if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
                originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
              } else {
                originalRequest.headers = {
                  ...(originalRequest.headers || {}),
                  Authorization: `Bearer ${newToken}`,
                };
              }
              return api(originalRequest);
            }
          } catch (_reauthErr) {
            // fallthrough to logout below
          }
        }

        // if reauth not possible or failed, proceed to logout
        await ServicoAutenticacao.removeToken();
        await ServicoAutenticacao.setUserData(null);
        await triggerLogout();
        notificarSessaoExpirada();
      } catch (_asyncError) {
      }
    }

    if (!status && error.code && String(error.code).toUpperCase().includes('NETWORK')) {
      try {
        await limparCacheBaseUrl();
        const novaBaseUrl = await resolverBaseUrlApi({ forcarAtualizacao: true });
        if (novaBaseUrl && !requestConfig._retryNetwork) {
          requestConfig._retryNetwork = true;
          requestConfig.baseURL = novaBaseUrl;
          return api(requestConfig);
        }
      } catch {
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
