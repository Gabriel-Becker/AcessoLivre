// src/api/axios.js
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 60000, // Aumentado para 60 segundos (upload de imagens)
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Interceptor para adicionar token de autenticação (se houver)
api.interceptors.request.use(
  (config) => {
    // Se você usa token JWT
    // const token = localStorage.getItem('@AccessLivrare:token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição');
    }
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      // navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default api;
