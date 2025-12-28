import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import '../api/interceptors'; // garante que os interceptors estejam registrados

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';

const AuthService = {
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token || null;
    } catch (e) {
      return null;
    }
  },

  async setToken(token) {
    if (!token) return;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async removeToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async getUserData() {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async setUserData(usuario) {
    if (!usuario) {
      await AsyncStorage.removeItem(USER_KEY);
      return;
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  async login({ email, senha }) {
    // O backend passa a receber { email, senha }
    const response = await api.post('/auth/login', { email, senha });
    const { token, usuario } = response.data || {};

    if (token) {
      await this.setToken(token);
    }
    if (usuario) {
      await this.setUserData(usuario);
    }

    return { token, usuario };
  },

  async register({ nome, email, senha }) {
    const response = await api.post('/auth/register', { nome, email, senha });
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
    }
    await this.removeToken();
    await this.setUserData(null);
  },

  async carregarSessao() {
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
