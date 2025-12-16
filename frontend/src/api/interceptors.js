/**
 * Interceptors do Axios - AcessoLivre
 * 
 * Responsabilidades:
 * 1. Adicionar token JWT automaticamente em todas as requisições
 * 2. Tratar erro 401 (token inválido/expirado) e forçar logout
 * 3. Logar erros de rede
 */

import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwtToken';

// ========== INTERCEPTOR DE REQUEST ==========
// Adiciona JWT automaticamente no header Authorization
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

// ========== INTERCEPTOR DE RESPONSE ==========
// Trata erro 401 (token inválido ou expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Token inválido ou expirado
    if (error.response?.status === 401) {
      console.log('Token inválido detectado (401), limpando AsyncStorage');
      
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } catch (asyncError) {
        console.error('Erro ao remover token:', asyncError);
      }
      
      // Aqui você pode disparar um evento ou usar NavigationRef
      // para forçar navegação para tela de login
      // Exemplo: EventEmitter.emit('forceLogout');
    }
    
    // Log de erros de rede
    if (error.message === 'Network Error') {
      console.error('Erro de conexão com o backend. Verifique se o servidor está rodando.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
