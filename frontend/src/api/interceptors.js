import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerLogout } from '../utils/SessionManager';
import { resetToAuth } from '../navigation/navigationRef';

const TOKEN_KEY = 'jwtToken';

api.interceptors.request.use(
  async (config) => {
    try {
      let token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === TOKEN_KEY) {
            token = value;
            break;
          }
        }
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Erro ao obter token do AsyncStorage:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      console.log(`Token inválido detectado (${status}), limpando AsyncStorage`);
      
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await triggerLogout();
        resetToAuth();
      } catch (asyncError) {
        console.error('Erro ao remover token:', asyncError);
      }
    }
    
    if (error.message === 'Network Error') {
      console.error('Erro de conexão com o backend. Verifique se o servidor está rodando.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
