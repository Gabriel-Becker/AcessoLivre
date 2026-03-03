import api from './axios';
import AuthService from '../services/AuthService';
import { triggerLogout } from '../utils/SessionManager';
import { resetToAuth } from '../navigation/navigationRef';

api.interceptors.request.use(
  async (config) => {
    try {
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
    if (status === 401) {
      try {
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
