import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import '../api/interceptors'; // garante que os interceptors estejam registrados

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';

const AuthService = {
  /**
   * Obtém token do AsyncStorage ou Cookie (web)
   */
  async getToken() {
    try {
      // Tentar obter do AsyncStorage (mobile)
      const tokenFromStorage = await AsyncStorage.getItem(TOKEN_KEY);
      if (tokenFromStorage) {
        return tokenFromStorage;
      }
      
      // Tentar obter de cookie (web)
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === TOKEN_KEY) {
            return value;
          }
        }
      }
      
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
    if (!token) return;
    
    try {
      // Salvar no AsyncStorage (para mobile)
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Salvar em cookie (para web)
      if (typeof document !== 'undefined') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // Cookie expira em 30 dias
        document.cookie = `${TOKEN_KEY}=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
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
      // Remover do AsyncStorage
      await AsyncStorage.removeItem(TOKEN_KEY);
      
      // Remover de cookie (web)
      if (typeof document !== 'undefined') {
        document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    } catch (error) {
      console.error('[AuthService] Erro ao remover token:', error);
    }
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
      // Limpar qualquer token anterior
      await this.logout();
      
      const loginData = { email, senha, rememberMe };
      // TODO: Implementar autenticação de dois fatores (2FA)
      // if (twoFactorCode) {
      //   loginData.twoFactorCode = parseInt(twoFactorCode);
      // }
      
      const response = await api.post('/auth/login', loginData);
      const responseData = response.data;

      const { token, usuario } = responseData;

      if (!token) {
        throw new Error('Servidor retornou um token vazio');
      }
      
      // Verificar se o token é válido
      const tokenData = this.parseJwt(token);
      if (!tokenData) {
        throw new Error('Token inválido retornado pelo servidor');
      }
      
      await this.setToken(token);
      
      // Verificar se token foi armazenado corretamente
      const storedToken = await this.getToken();
      if (!storedToken) {
        console.error('[AuthService] Falha ao armazenar token após login');
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
      
      // TODO: Tratamento de erro 428 para 2FA quando implementado
      // if (error.response && error.response.status === 428) {
      //   const responseData = error.response.data;
      //   return {
      //     success: false,
      //     requiresTwoFactor: true,
      //     message: responseData.message || 'Código de autenticação de dois fatores é obrigatório'
      //   };
      // }
      
      // Tratamento de erro 401 (credenciais inválidas)
      if (error.response && error.response.status === 401) {
        const responseData = error.response.data;
        throw new Error(responseData?.error || responseData?.message || 'Credenciais inválidas');
      }
      
      // Tratamento de outros erros HTTP
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        throw new Error(responseData?.error || responseData?.message || 'Erro no login');
      }
      
      // Tratamento de erro de rede
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || 
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('timeout') ||
          error.message?.toLowerCase().includes('connection')) {
        throw new Error('Falha ao realizar login. Verifique sua conexão com a internet e tente novamente.');
      }
      
      throw error;
    }
  },

  async register({ nome, email, senha }) {
    const response = await api.post('/auth/register', { nome, email, senha });
    return response.data;
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

  async verificarEmail(email, codigo) {
    try {
      const response = await api.post('/auth/verify-email', {
        email,
        codigo
      });
      
      return {
        sucesso: true,
        mensagem: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao verificar email:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao verificar email'
      };
    }
  },

  async reenviarCodigoVerificacao(email) {
    try {
      const response = await api.post(`/auth/resend-verification-code?email=${encodeURIComponent(email)}`);
      
      return {
        sucesso: true,
        mensagem: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao reenviar código:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao reenviar código'
      };
    }
  },
};

export default AuthService;

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

  async getRecoveryCodes() {
    try {
      const response = await api.get('/auth/2fa/recovery-codes');
      return {
        sucesso: true,
        codes: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao listar códigos:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao listar códigos'
      };
    }
  },

  async generateRecoveryCodes() {
    try {
      const response = await api.post('/auth/2fa/generate-recovery-codes');
      return {
        sucesso: true,
        codes: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao gerar códigos:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data || 'Erro ao gerar códigos'
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
  verificarEmail,
  reenviarCodigoVerificacao,
  setup2FA,
  enable2FA,
  disable2FA,
  get2FAStatus,
  getRecoveryCodes,
  generateRecoveryCodes
} = AuthService;