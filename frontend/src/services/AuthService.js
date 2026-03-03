import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';
let tokenEmMemoria = null;
let tokenInicializado = false;

const normalizarToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const limpo = token.replace(/^Bearer\s+/i, '').trim();
  return limpo || null;
};

const obterCookie = (nome) => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const cookieLimpo = cookie.trim();
    if (cookieLimpo.startsWith(`${nome}=`)) {
      const valor = cookieLimpo.substring(nome.length + 1);
      try {
        return decodeURIComponent(valor);
      } catch (e) {
        return valor;
      }
    }
  }
  return null;
};

const aplicarTokenNoHeader = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete api.defaults.headers.common.Authorization;
};

const AuthService = {
  /**
   * Obtém token do AsyncStorage ou Cookie (web)
   */
  async getToken() {
    try {
      if (tokenEmMemoria) {
        return tokenEmMemoria;
      }

      if (tokenInicializado) {
        return null;
      }

      // Tentar obter do AsyncStorage (mobile)
      const tokenFromStorage = await AsyncStorage.getItem(TOKEN_KEY);
      if (tokenFromStorage) {
        const tokenNormalizado = normalizarToken(tokenFromStorage);
        if (tokenNormalizado) {
          tokenEmMemoria = tokenNormalizado;
          tokenInicializado = true;
          aplicarTokenNoHeader(tokenNormalizado);
        }
        return tokenNormalizado;
      }

      // Tentar obter de cookie (web)
      const tokenFromCookie = obterCookie(TOKEN_KEY);
      if (tokenFromCookie) {
        const tokenNormalizado = normalizarToken(tokenFromCookie);
        if (tokenNormalizado) {
          tokenEmMemoria = tokenNormalizado;
          tokenInicializado = true;
          aplicarTokenNoHeader(tokenNormalizado);
        }
        return tokenNormalizado;
      }

      tokenInicializado = true;
      
      return null;
    } catch (e) {
      console.error('[AuthService] Erro ao recuperar token:', e);
      return null;
    }
  },

  /**
   * Armazena token no AsyncStorage e Cookie (web)
   */
  async setToken(token) {
    const tokenNormalizado = normalizarToken(token);
    if (!tokenNormalizado) return;

    tokenEmMemoria = tokenNormalizado;
    tokenInicializado = true;
    
    try {
      // Salvar no AsyncStorage (para mobile)
      await AsyncStorage.setItem(TOKEN_KEY, tokenNormalizado);
      
      // Salvar em cookie (fallback web)
      if (typeof document !== 'undefined') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // Cookie expira em 30 dias
        document.cookie = `${TOKEN_KEY}=${tokenNormalizado}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
      }

      aplicarTokenNoHeader(tokenNormalizado);

      if (typeof document !== 'undefined') {
        const tokenCookie = document.cookie.includes(`${TOKEN_KEY}=`);
        console.log('[AuthService] Token armazenado no web', {
          cookie: tokenCookie,
        });
      }
    } catch (error) {
      console.error('[AuthService] Erro ao armazenar token:', error);
      throw error;
    }
  },

  /**
   * Remove token do AsyncStorage e Cookie (web)
   */
  async removeToken() {
    try {
      tokenEmMemoria = null;
      tokenInicializado = true;

      // Remover do AsyncStorage
      await AsyncStorage.removeItem(TOKEN_KEY);
      
      // Remover de cookie (web)
      if (typeof document !== 'undefined') {
        document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      aplicarTokenNoHeader(null);

    } catch (error) {
      console.error('[AuthService] Erro ao remover token:', error);
    }
  },

  getTokenEmMemoria() {
    return tokenEmMemoria;
  },

  async setUserData(usuario) {
    if (!usuario) {
      await AsyncStorage.removeItem(USER_KEY);
      return;
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  parseJwt(token) {
    try {
      if (!token || typeof token !== 'string') {
        console.error('[AuthService] Token inválido: não é uma string válida');
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('[AuthService] Token inválido: não possui 3 partes separadas por ponto');
        return null;
      }
      
      const base64Url = parts[1];
      if (!base64Url) {
        console.error('[AuthService] Token inválido: payload vazio');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const parsedPayload = JSON.parse(jsonPayload);
      
      if (!parsedPayload || typeof parsedPayload !== 'object') {
        console.error('[AuthService] Token inválido: payload não é um objeto válido');
        return null;
      }
      
      return parsedPayload;
    } catch (error) {
      console.error('[AuthService] Erro ao decodificar token:', error);
      return null;
    }
  },

  async validateToken(token) {
    try {
      const response = await api.post('/auth/validate', { token });
      return response.data;
    } catch (error) {
      console.error('[AuthService] Erro ao validar token no servidor:', error);
      return { valid: false, reason: 'Erro na validação' };
    }
  },

  async isAuthenticated() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return false;
      }
      
      const tokenData = this.parseJwt(token);
      if (!tokenData) {
        console.log('[AuthService] Token com formato inválido detectado, fazendo logout automático');
        await this.logout();
        return false;
      }
      
      if (!tokenData.exp || tokenData.exp * 1000 <= Date.now()) {
        console.log('[AuthService] Token expirado, fazendo logout automático');
        await this.logout();
        return false;
      }
      
      const validation = await this.validateToken(token);
      if (!validation.valid) {
        console.log('[AuthService] Token inválido no servidor:', validation.reason);
        await this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[AuthService] Erro ao verificar autenticação:', error);
      await this.logout();
      return false;
    }
  },

  /**
   * Realiza login do usuário
   */
  async login({ email, senha, rememberMe = false }) {
    try {
      await this.logout();
      
      const loginData = { email, senha, rememberMe };
      const response = await api.post('/auth/login', loginData);
      const responseData = response.data;

      const { token, usuario } = responseData;

      if (!token) {
        throw new Error('Servidor retornou um token vazio');
      }
      
      const tokenData = this.parseJwt(token);
      if (!tokenData) {
        throw new Error('Token inválido retornado pelo servidor');
      }
      
      await this.setToken(token);
      const storedToken = await this.getToken();
      if (!storedToken) {
        throw new Error('Falha ao armazenar token de autenticação');
      }
      
      if (usuario) {
        await this.setUserData(usuario);
      }

      return { 
        success: true,
        token, 
        usuario,
        message: responseData.message || 'Login realizado com sucesso'
      };
    } catch (error) {
      console.error('[AuthService] Erro no login:', error);
      
      if (error.response && error.response.status === 401) {
        const responseData = error.response.data;
        if (responseData?.twoFactorRequired) {
          return {
            success: false,
            requiresTwoFactor: true,
            emailDestino: responseData.emailDestino || email
          };
        }
        throw new Error(responseData?.error || responseData?.message || 'Credenciais inválidas');
      }
      
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        throw new Error(responseData?.error || responseData?.message || 'Erro no login');
      }
      
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || 
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('timeout') ||
          error.message?.toLowerCase().includes('connection')) {
        throw new Error('Falha ao realizar login. Verifique sua conexão com a internet e tente novamente.');
      }
      
      throw error;
    }
  },

  async verifyTwoFactorCode({ email, codigo }) {
    const response = await api.post('/auth/2fa/verify-code', { email, codigo });
    const { token, usuario } = response.data;

    if (!token) {
      throw new Error('Token não retornado pelo servidor');
    }

    await this.setToken(token);
    await this.setUserData(usuario);

    return { success: true, token, usuario };
  },

  async register({ nome, email, senha }) {
    const response = await api.post('/auth/register', { nome, email, senha });
    return {
      success: false,
      requiresConfirmation: true,
      emailDestino: response.data,
    };
  },

  async confirmRegistration({ email, codigo }) {
    const response = await api.post('/auth/register/confirm', { email, codigo });
    return { success: true, usuario: response.data };
  },

  async resendRegistrationCode(email) {
    const response = await api.post(`/auth/register/resend-code?email=${encodeURIComponent(email)}`);
    return { success: true, message: response.data };
  },

  async logout() {
    try {
      const token = await this.getToken();
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          // Ignorar erro de logout no backend
          console.log('[AuthService] Erro ao fazer logout no backend:', e.message);
        }
      }
    } catch (e) {
      console.error('[AuthService] Erro durante logout:', e);
    } finally {
      await this.removeToken();
      await this.setUserData(null);
    }
  },

  async carregarSessao() {
    const token = await this.getToken();
    if (!token) {
      await this.setUserData(null);
      return { autenticado: false, usuario: null };
    }
    
    // Verificar validade do token antes de chamar o backend
    const isValid = await this.isAuthenticated();
    if (!isValid) {
      return { autenticado: false, usuario: null };
    }
    
    try {
      const response = await api.get('/auth/me');
      const usuario = response.data?.usuario || response.data || null;
      await this.setUserData(usuario);
      return { autenticado: !!usuario, usuario };
    } catch (e) {
      console.error('[AuthService] Erro ao carregar sessão:', e);
      // Se 401 ou erro, limpa sessão
      await this.removeToken();
      await this.setUserData(null);
      return { autenticado: false, usuario: null };
    }
  },

  async reautenticar(userId) {
    try {
      const response = await api.post(`/auth/reauth/${userId}`);
      const newToken = response.data;
      
      if (newToken && typeof newToken === 'string') {
        await this.setToken(newToken);
        return newToken;
      }
      
      throw new Error('Token inválido recebido');
    } catch (error) {
      console.error('[AuthService] Erro ao reautenticar:', error);
      throw error;
    }
  },

  // ============ 2FA Methods ============
  
  async setup2FA() {
    try {
      const response = await api.post('/auth/2fa/setup');
      return {
        sucesso: true,
        dados: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao configurar 2FA:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao configurar 2FA'
      };
    }
  },

  async enable2FA(verificationCode) {
    try {
      const response = await api.post('/auth/2fa/enable', { verificationCode });
      return {
        sucesso: true,
        mensagem: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao habilitar 2FA:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao habilitar 2FA'
      };
    }
  },

  async disable2FA(verificationCode) {
    try {
      const response = await api.post('/auth/2fa/disable', { verificationCode });
      return {
        sucesso: true,
        mensagem: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao desabilitar 2FA:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao desabilitar 2FA'
      };
    }
  },

  async get2FAStatus() {
    try {
      const response = await api.get('/auth/2fa/status');
      return response.data;
    } catch (error) {
      console.error('[AuthService] Erro ao consultar status 2FA:', error);
      return false;
    }
  },

  /**
   * Troca a senha do usuário autenticado
   */
  async trocarSenha({ senhaAtual, novaSenha }) {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          sucesso: false,
          mensagem: 'Sua sessão expirou. Faça login novamente para trocar a senha.',
        };
      }

      const response = await api.post(
        '/auth/change-password',
        {
          senhaAtual,
          novaSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        sucesso: true,
        mensagem: response.data || 'Senha alterada com sucesso',
      };
    } catch (error) {
      console.error('[AuthService] Erro ao trocar senha:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao trocar senha. Verifique sua senha atual.',
      };
    }
  },
};

export default AuthService;

export const { 
  login, 
  logout, 
  register, 
  isAuthenticated, 
  carregarSessao, 
  validateToken, 
  reautenticar,
  resendRegistrationCode,
  setup2FA,
  enable2FA,
  disable2FA,
  get2FAStatus,
  verifyTwoFactorCode,
  trocarSenha
} = AuthService;