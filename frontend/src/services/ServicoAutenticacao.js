import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';
const REMEMBER_ME_KEY = 'rememberMe';
let tokenEmMemoria = null;
let tokenInicializado = false;
let devePersistirToken = false;

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

const extrairMensagemErro = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.mensagem) return data.mensagem;
  if (data?.message) return data.message;
  if (data?.erro) return data.erro;
  if (data?.error) return data.error;
  if (error?.message) return error.message;
  return fallback;
};

const valorEhVerdadeiro = (valor) => {
  if (valor === true || valor === 1) return true;
  if (typeof valor === 'string') {
    const normalizado = valor.trim().toLowerCase();
    return normalizado === 'true' || normalizado === '1' || normalizado === 'sim';
  }
  return false;
};

const detectarFluxoTwoFactor = (responseData, mensagem, twoFactorCodeInformado) => {
  const payload = responseData && typeof responseData === 'object' ? responseData : {};

  const flagExplicita =
    valorEhVerdadeiro(payload?.twoFactorRequired) ||
    valorEhVerdadeiro(payload?.requiresTwoFactor) ||
    valorEhVerdadeiro(payload?.requires2FA) ||
    valorEhVerdadeiro(payload?.two_factor_required);

  const mensagemNormalizada = String(mensagem || '').toLowerCase();
  const mensagemIndicaTwoFactor =
    mensagemNormalizada.includes('dois fatores') ||
    mensagemNormalizada.includes('2fa') ||
    mensagemNormalizada.includes('autenticaÃ§Ã£o obrigatÃ³rio') ||
    mensagemNormalizada.includes('autenticacao obrigatorio') ||
    mensagemNormalizada.includes('autenticaÃ§Ã£o obrigatÃ³ria') ||
    mensagemNormalizada.includes('autenticacao obrigatoria') ||
    mensagemNormalizada.includes('cÃ³digo de autenticaÃ§Ã£o obrigatÃ³rio') ||
    mensagemNormalizada.includes('codigo de autenticacao obrigatorio');

  const possuiIndicadorEmailDestino = Boolean(payload?.emailDestino);
  const semMensagemUtil = !mensagemNormalizada;

  return (
    flagExplicita ||
    mensagemIndicaTwoFactor ||
    (!twoFactorCodeInformado && possuiIndicadorEmailDestino) ||
    (!twoFactorCodeInformado && semMensagemUtil && Object.keys(payload).length > 0)
  );
};

const mensagemIndicaCredenciaisInvalidasOuBloqueio = (mensagem) => {
  const texto = String(mensagem || '').toLowerCase();
  if (!texto) return false;

  return (
    texto.includes('credenciais invÃ¡lidas') ||
    texto.includes('credenciais invalidas') ||
    texto.includes('tentativas restantes') ||
    texto.includes('conta bloqueada') ||
    texto.includes('email nÃ£o verificado') ||
    texto.includes('email nao verificado') ||
    texto.includes('senha invÃ¡lida') ||
    texto.includes('senha invalida')
  );
};

const montarRespostaTwoFactor = async (responseData, email, mensagemPadrao) => {
  let rememberMe = false;
  try {
    const stored = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    rememberMe = stored === 'true';
  } catch (e) {
    // ignore and default to false
  }

  return {
    success: false,
    requiresTwoFactor: true,
    twoFactorRequired: true,
    emailDestino: responseData?.emailDestino || email,
    rememberMe,
    message: responseData?.mensagem || responseData?.message || mensagemPadrao,
  };
};

const aguardar = (milissegundos) => new Promise((resolve) => setTimeout(resolve, milissegundos));

const erroEhTransitorioDeConexao = (erro) => {
  const codigo = String(erro?.code || '').toUpperCase();
  const mensagem = String(erro?.message || '').toLowerCase();

  return (
    codigo === 'ECONNABORTED' ||
    codigo === 'ECONNRESET' ||
    codigo === 'ECONNREFUSED' ||
    codigo === 'ETIMEDOUT' ||
    codigo === 'ERR_NETWORK' ||
    codigo === 'ERR_EMPTY_RESPONSE' ||
    mensagem.includes('network error') ||
    mensagem.includes('empty response') ||
    mensagem.includes('socket hang up') ||
    mensagem.includes('timeout') ||
    mensagem.includes('connection')
  );
};

const ServicoAutenticacao = {
  async getToken() {
    try {
      const tokenFromStorage = await AsyncStorage.getItem(TOKEN_KEY);
      const tokenFromCookie = obterCookie(TOKEN_KEY);
      const tokenPersistido = normalizarToken(tokenFromStorage || tokenFromCookie);
      const tokenAtual = normalizarToken(tokenEmMemoria);

      if (tokenPersistido) {
        tokenEmMemoria = tokenPersistido;
        tokenInicializado = true;
        aplicarTokenNoHeader(tokenPersistido);
        return tokenPersistido;
      }

      if (tokenAtual) {
        return tokenAtual;
      }

      tokenEmMemoria = null;
      tokenInicializado = true;
      aplicarTokenNoHeader(null);

      return null;
    } catch (e) {
      console.error('[AuthService] Erro ao recuperar token:', e);
      return null;
    }
  },

  async setToken(token, { persistir = devePersistirToken } = {}) {
    const tokenNormalizado = normalizarToken(token);
    if (!tokenNormalizado) return;

    tokenEmMemoria = tokenNormalizado;
    tokenInicializado = true;
    devePersistirToken = Boolean(persistir);
    
    try {
      await this.setRememberMePreference(devePersistirToken);

      if (devePersistirToken) {
        await AsyncStorage.setItem(TOKEN_KEY, tokenNormalizado);

        if (typeof document !== 'undefined') {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);
          document.cookie = `${TOKEN_KEY}=${tokenNormalizado}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
        }
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);

        if (typeof document !== 'undefined') {
          document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
        }
      }

      aplicarTokenNoHeader(tokenNormalizado);
    } catch (error) {
      console.error('[AuthService] Erro ao armazenar token:', error);
      throw error;
    }
  },

  async removeToken() {
    try {
      tokenEmMemoria = null;
      tokenInicializado = true;
      devePersistirToken = false;

      await AsyncStorage.removeItem(TOKEN_KEY);

      if (typeof document !== 'undefined') {
        document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
      }

      aplicarTokenNoHeader(null);

    } catch (error) {
      console.error('[AuthService] Erro ao remover token:', error);
    }
  },

  getTokenEmMemoria() {
    return tokenEmMemoria;
  },

  shouldPersistToken() {
    return devePersistirToken;
  },

  async getRememberMePreference() {
    try {
      const valorArmazenado = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (valorArmazenado !== null) {
        return valorArmazenado === 'true';
      }

      const valorCookie = obterCookie(REMEMBER_ME_KEY);
      if (valorCookie !== null) {
        return valorCookie === 'true';
      }

      return false;
    } catch (error) {
      console.error('[AuthService] Erro ao recuperar preferÃªncia remember me:', error);
      return false;
    }
  },

  async setRememberMePreference(rememberMe) {
    const valorNormalizado = rememberMe ? 'true' : 'false';

    try {
      await AsyncStorage.setItem(REMEMBER_ME_KEY, valorNormalizado);

      if (typeof document !== 'undefined') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);
        document.cookie = `${REMEMBER_ME_KEY}=${valorNormalizado}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
      }
    } catch (error) {
      console.error('[AuthService] Erro ao salvar preferÃªncia remember me:', error);
      throw error;
    }
  },

  async getPersistedToken() {
    try {
      const tokenFromStorage = await AsyncStorage.getItem(TOKEN_KEY);
      if (tokenFromStorage) {
        return normalizarToken(tokenFromStorage);
      }

      const tokenFromCookie = obterCookie(TOKEN_KEY);
      if (tokenFromCookie) {
        return normalizarToken(tokenFromCookie);
      }

      return null;
    } catch (error) {
      console.error('[AuthService] Erro ao recuperar token persistido:', error);
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

  /**
   * Decodifica o token JWT usando a biblioteca profissional jwt-decode
  * Elimina toda a implementaÃ§Ã£o manual de Base64 que causava problemas
   * entre Web, Android e iOS
   */
  parseJwt(token) {
    try {
      if (!token || typeof token !== 'string') {
        console.error('[AuthService] Token invÃ¡lido: nÃ£o Ã© uma string vÃ¡lida');
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('[AuthService] Token invÃ¡lido: nÃ£o possui 3 partes separadas por ponto');
        return null;
      }
      
      // Usando a biblioteca profissional jwt-decode
      const decoded = jwtDecode(token);
      
      if (!decoded || typeof decoded !== 'object') {
        console.error('[AuthService] Token invÃ¡lido: payload nÃ£o Ã© um objeto vÃ¡lido');
        return null;
      }
      
      return decoded;
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
      return { valid: false, reason: 'Erro na validaÃ§Ã£o' };
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
        await this.logout();
        return false;
      }
      
      // Verifica se o token expirou baseado no campo 'exp' (timestamp em segundos)
      if (tokenData.exp && tokenData.exp * 1000 <= Date.now()) {
        await this.logout();
        return false;
      }
      
      // Valida o token no servidor para garantir que nÃ£o foi revogado
      const validation = await this.validateToken(token);
      if (!validation.valid) {
        await this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[AuthService] Erro ao verificar autenticaÃ§Ã£o:', error);
      await this.logout();
      return false;
    }
  },

  async login({ email, senha, rememberMe = false, twoFactorCode }) {
    let twoFactorCodeInformado = false;
    try {
      await this.setRememberMePreference(rememberMe);
      await this.removeToken();
      await this.setUserData(null);
      
      const loginData = { email, senha, rememberMe };
      twoFactorCodeInformado =
        twoFactorCode !== undefined && twoFactorCode !== null && String(twoFactorCode).trim() !== '';
      if (twoFactorCodeInformado) {
        loginData.twoFactorCode = String(twoFactorCode).trim();
      }
      const response = await api.post('/auth/login', loginData);
      const responseData = response.data;

      const { token, usuario } = responseData;

      if (!token) {
        throw new Error('Servidor retornou um token vazio');
      }
      
      const tokenData = this.parseJwt(token);
      if (!tokenData) {
        throw new Error('Token invÃ¡lido retornado pelo servidor');
      }
      
      await this.setToken(token, { persistir: rememberMe });
      const storedToken = await this.getToken();
      if (!storedToken) {
        throw new Error('Falha ao armazenar token de autenticaÃ§Ã£o');
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
      if (error.response && error.response.status === 401) {
        const responseData = error.response.data;
        const mensagem401 = String(
          responseData?.mensagem || responseData?.message || responseData?.erro || responseData?.error || ''
        );
        const ehFluxoTwoFactor = detectarFluxoTwoFactor(responseData, mensagem401, twoFactorCodeInformado);
        const ehCredencialInvalidaOuBloqueio = mensagemIndicaCredenciaisInvalidasOuBloqueio(mensagem401);

        if (!twoFactorCodeInformado && !ehFluxoTwoFactor && !ehCredencialInvalidaOuBloqueio) {
          return montarRespostaTwoFactor(
            responseData,
            email,
            'Digite o cÃ³digo de verificaÃ§Ã£o para continuar o login.'
          );
        }

        if (ehFluxoTwoFactor) {
          return montarRespostaTwoFactor(
            responseData,
            email,
            'Confirme o cÃ³digo de autenticaÃ§Ã£o de dois fatores para continuar.'
          );
        }

        throw new Error(responseData?.mensagem || responseData?.message || responseData?.erro || responseData?.error || 'Credenciais invÃ¡lidas');
      }
      
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        throw new Error(responseData?.mensagem || responseData?.message || responseData?.erro || responseData?.error || 'Erro no login');
      }
      
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || 
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('timeout') ||
          error.message?.toLowerCase().includes('connection')) {
        throw new Error('Falha ao realizar login. Verifique sua conexÃ£o com a internet e tente novamente.');
      }
      
      throw error;
    }
  },

  async register({ nome, email, senha }) {
    const dadosCadastro = { nome, email, senha };
    const tentativasMaximas = 2;

    for (let tentativa = 1; tentativa <= tentativasMaximas; tentativa += 1) {
      try {
        const response = await api.post('/auth/register', dadosCadastro);
        return {
          success: true,
          message: response.data?.message || 'Conta criada com sucesso',
          usuario: response.data,
        };
      } catch (erro) {
        const ultimaTentativa = tentativa === tentativasMaximas;

        if (!ultimaTentativa && erroEhTransitorioDeConexao(erro)) {
          await aguardar(1200);
          continue;
        }

        throw erro;
      }
    }

    throw new Error('Erro ao realizar cadastro');
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(
        extrairMensagemErro(error, 'Erro ao enviar solicitaÃ§Ã£o de recuperaÃ§Ã£o de senha')
      );
    }
  },

  async resetPassword({ email, code, novaSenha }) {
    try {
      const response = await api.post('/auth/reset-password', { email, code, novaSenha });
      return response.data;
    } catch (error) {
      throw new Error(
        extrairMensagemErro(error, 'Erro ao redefinir senha')
      );
    }
  },

  async logout() {
    try {
      const token = await this.getToken();
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          // Ignora erro no logout do backend
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
      console.error('[AuthService] Erro ao carregar sessÃ£o:', e);
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
        await this.setToken(newToken, { persistir: devePersistirToken });
        return newToken;
      }
      
      throw new Error('Token invÃ¡lido recebido');
    } catch (error) {
      console.error('[AuthService] Erro ao reautenticar:', error);
      throw error;
    }
  },

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
        mensagem: extrairMensagemErro(error, 'Erro ao configurar 2FA')
      };
    }
  },

  async enable2FA(verificationCode) {
    try {
      const response = await api.post('/auth/2fa/enable', { verificationCode: String(verificationCode) });
      return {
        sucesso: true,
        mensagem: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao habilitar 2FA:', error);
      return {
        sucesso: false,
        mensagem: extrairMensagemErro(error, 'Erro ao habilitar 2FA')
      };
    }
  },

  async disable2FA(verificationCode) {
    try {
      const response = await api.post('/auth/2fa/disable', { verificationCode: String(verificationCode) });
      return {
        sucesso: true,
        mensagem: response.data
      };
    } catch (error) {
      console.error('[AuthService] Erro ao desabilitar 2FA:', error);
      return {
        sucesso: false,
        mensagem: extrairMensagemErro(error, 'Erro ao desabilitar 2FA')
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

  async trocarSenha({ senhaAtual, novaSenha }) {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          sucesso: false,
          mensagem: 'Sua sessÃ£o expirou. FaÃ§a login novamente para trocar a senha.',
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
      const mensagemErro = extrairMensagemErro(error, 'Erro ao trocar senha. Verifique sua senha atual.');
      const mensagemNormalizada = String(mensagemErro || '').toLowerCase();

      if (mensagemNormalizada.includes('senha atual incorreta')) {
        return {
          sucesso: false,
          mensagem: 'A senha atual informada estÃ¡ incorreta.',
        };
      }

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default ServicoAutenticacao;

export const { 
  login, 
  logout, 
  register, 
  forgotPassword,
  resetPassword,
  isAuthenticated, 
  carregarSessao, 
  validateToken, 
  reautenticar,
  setup2FA,
  enable2FA,
  disable2FA,
  get2FAStatus,
  trocarSenha
} = ServicoAutenticacao;

export const {
  login: entrar,
  register: cadastrar,
  forgotPassword: esqueciSenha,
  resetPassword: redefinirSenha,
  isAuthenticated: estaAutenticado,
  validateToken: validarToken,
} = ServicoAutenticacao;