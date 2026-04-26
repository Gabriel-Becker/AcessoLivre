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

const extrairMensagemErro = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.mensagem) return data.mensagem;
  if (data?.message) return data.message;
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
    mensagemNormalizada.includes('autenticação obrigatório') ||
    mensagemNormalizada.includes('autenticacao obrigatorio') ||
    mensagemNormalizada.includes('autenticação obrigatória') ||
    mensagemNormalizada.includes('autenticacao obrigatoria') ||
    mensagemNormalizada.includes('código de autenticação obrigatório') ||
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
    texto.includes('credenciais inválidas') ||
    texto.includes('credenciais invalidas') ||
    texto.includes('tentativas restantes') ||
    texto.includes('conta bloqueada') ||
    texto.includes('email não verificado') ||
    texto.includes('email nao verificado') ||
    texto.includes('senha inválida') ||
    texto.includes('senha invalida')
  );
};

const montarRespostaTwoFactor = (responseData, email, mensagemPadrao) => ({
  success: false,
  requiresTwoFactor: true,
  twoFactorRequired: true,
  emailDestino: responseData?.emailDestino || email,
  message:
    responseData?.mensagem ||
    responseData?.message ||
    mensagemPadrao,
});

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

const AuthService = {
  async getToken() {
    try {
      if (tokenEmMemoria) {
        return tokenEmMemoria;
      }

      if (tokenInicializado) {
        return null;
      }

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

  async setToken(token) {
    const tokenNormalizado = normalizarToken(token);
    if (!tokenNormalizado) return;

    tokenEmMemoria = tokenNormalizado;
    tokenInicializado = true;
    
    try {
      await AsyncStorage.setItem(TOKEN_KEY, tokenNormalizado);

      if (typeof document !== 'undefined') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        document.cookie = `${TOKEN_KEY}=${tokenNormalizado}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
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

      await AsyncStorage.removeItem(TOKEN_KEY);

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
        await this.logout();
        return false;
      }
      
      if (!tokenData.exp || tokenData.exp * 1000 <= Date.now()) {
        await this.logout();
        return false;
      }
      
      const validation = await this.validateToken(token);
      if (!validation.valid) {
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

  async login({ email, senha, rememberMe = false, twoFactorCode }) {
    let twoFactorCodeInformado = false;
    try {
      // Antes de um novo login, limpa apenas estado local para evitar chamada remota
      // de logout que pode falhar com token antigo e interromper o fluxo de 2FA.
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
            'Digite o código de verificação para continuar o login.'
          );
        }

        if (ehFluxoTwoFactor) {
          return montarRespostaTwoFactor(
            responseData,
            email,
            'Confirme o código de autenticação de dois fatores para continuar.'
          );
        }

        throw new Error(responseData?.mensagem || responseData?.message || responseData?.erro || responseData?.error || 'Credenciais inválidas');
      }
      
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        throw new Error(responseData?.mensagem || responseData?.message || responseData?.erro || responseData?.error || 'Erro no login');
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
        extrairMensagemErro(error, 'Erro ao enviar solicitação de recuperação de senha')
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
      console.error('[AuthService] Erro ao carregar sessão:', e);
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
      const mensagemErro = extrairMensagemErro(error, 'Erro ao trocar senha. Verifique sua senha atual.');
      const mensagemNormalizada = String(mensagemErro || '').toLowerCase();

      if (mensagemNormalizada.includes('senha atual incorreta')) {
        return {
          sucesso: false,
          mensagem: 'A senha atual informada está incorreta.',
        };
      }

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default AuthService;

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
} = AuthService;