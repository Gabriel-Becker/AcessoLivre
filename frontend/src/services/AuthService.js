// AuthService baseado no Inkspiration e compatível com o backend AcessoLivre
// Responsável por autenticação, persistência de token e dados do usuário

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import '../api/interceptors'; // garante que os interceptors estejam registrados

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';

/**
 * Estrutura esperada do backend (AcessoLivre):
 * - POST /api/auth/login { cpf, senha } -> { token, usuario }
 * - POST /api/auth/register { nome, email, cpf, senha } -> { id, ... }
 * - POST /api/auth/logout -> 204 (revoga token atual)
 * - GET  /api/auth/me -> { usuario }
 */

const AuthService = {
  // Retorna o token salvo
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token || null;
    } catch (e) {
      return null;
    }
  },

  // Salva o token
  async setToken(token) {
    if (!token) return;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  // Remove o token
  async removeToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  // Retorna os dados do usuário salvos
  async getUserData() {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Salva os dados do usuário
  async setUserData(usuario) {
    if (!usuario) {
      await AsyncStorage.removeItem(USER_KEY);
      return;
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  // Verifica se há token válido (existência local). Validação real ocorre via backend nas chamadas.
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  // Login com CPF e senha
  async login({ cpf, senha }) {
    // O backend espera { cpf, senha }
    const response = await api.post('/auth/login', { cpf, senha });
    const { token, usuario } = response.data || {};

    if (token) {
      await this.setToken(token);
    }
    if (usuario) {
      await this.setUserData(usuario);
    }

    return { token, usuario };
  },

  // Registro de usuário
  async register({ nome, email, cpf, senha }) {
    const response = await api.post('/auth/register', { nome, email, cpf, senha });
    return response.data;
  },

  // Logout: chama backend para revogar e limpa storage
  async logout() {
    try {
      // Backend revoga o token atual via Authorization header (interceptor adiciona o token)
      await api.post('/auth/logout');
    } catch (e) {
      // Mesmo se falhar, seguimos limpando o storage
    }
    await this.removeToken();
    await this.setUserData(null);
  },

  // Carrega sessão atual consultando o backend
  async carregarSessao() {
    // Tenta obter dados do usuário atual via backend, se token existir
    const token = await this.getToken();
    if (!token) {
      await this.setUserData(null);
      return { autenticado: false, usuario: null };
    }
    try {
      const response = await api.get('/auth/me');
      const usuario = response.data?.usuario || response.data || null;
      await this.setUserData(usuario);
      return { autenticado: !!usuario, usuario };
    } catch (e) {
      // Se 401 ou erro, limpa sessão
      await this.removeToken();
      await this.setUserData(null);
      return { autenticado: false, usuario: null };
    }
  },
};

export default AuthService;
