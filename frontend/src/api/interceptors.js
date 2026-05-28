import api from './axios';
import AuthService from '../services/AuthService';
import { triggerLogout } from '../utils/SessionManager';
import { resetToAuth } from '../navigation/navigationRef';

const normalizarCaminho = (url = '') => String(url).split('?')[0];

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

api.interceptors.request.use(
  async (config) => {
    try {
      if (ehRotaPublicaDeLeitura(config)) {
        return config;
      }

      const tokenEmMemoria = AuthService.getTokenEmMemoria();
      const token = tokenEmMemoria || await AuthService.getToken();
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
    } catch (error) {
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
        await AuthService.setToken(newToken);
      }
    } catch (error) {
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const requestConfig = error.config || {};
    const isLoginEndpoint = String(requestUrl).includes('/auth/login');
    const isPublicReadEndpoint = ehRotaPublicaDeLeitura(requestConfig);

    if (status === 401 && isLoginEndpoint) {
      return Promise.reject(error);
    }

    if (status === 401 && isPublicReadEndpoint) {
      try {
        await AuthService.removeToken();
      } catch {
      }
      return Promise.reject(error);
    }

    // Retry-once mitigation: try silent reauth before forcing logout.
    if (status === 401 && !isLoginEndpoint) {
      try {
        const originalRequest = requestConfig;

        // avoid infinite retry loops
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const currentToken = await AuthService.getToken();
            const tokenData = AuthService.parseJwt(currentToken);
            const userId = tokenData?.userId || tokenData?.user_id || tokenData?.sub || null;

            if (userId) {
              // attempt to reauthenticate once
              const newToken = await AuthService.reautenticar(userId);
              if (newToken) {
                await AuthService.setToken(newToken);
                // update header and retry original request
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
            }
          } catch (reauthErr) {
            // fallthrough to logout below
          }
        }

        // if reauth not possible or failed, proceed to logout
        await AuthService.removeToken();
        await AuthService.setUserData(null);
        await triggerLogout();
        resetToAuth();
      } catch (asyncError) {
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
