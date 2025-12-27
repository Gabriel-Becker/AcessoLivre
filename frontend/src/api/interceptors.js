import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerLogout } from '../utils/SessionManager';
import { resetToAuth } from '../navigation/navigationRef';

const TOKEN_KEY = 'jwtToken';

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
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
    if (error.response?.status === 401) {
      console.log('Token inválido detectado (401), limpando AsyncStorage');
      
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        // Força logout global e volta para a tela de autenticação
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
