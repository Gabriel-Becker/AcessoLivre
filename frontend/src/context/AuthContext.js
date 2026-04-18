import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import AuthService from '../services/AuthService';
import { setLogoutHandler } from '../utils/SessionManager';
import useTokenMonitor from '../hooks/useTokenMonitor';

const AuthContext = createContext({});

const obterMensagemLoginAmigavel = (erro) => {
  const mensagemBackend = erro?.response?.data?.mensagem || erro?.response?.data?.message;
  const mensagemErro = erro?.message;
  const mensagem = mensagemBackend || mensagemErro || '';
  const mensagemNormalizada = String(mensagem).toLowerCase();

  if (!mensagem) {
    return 'Não foi possível entrar agora. Tente novamente em instantes.';
  }

  if (
    mensagemNormalizada.includes('referenceerror') ||
    mensagemNormalizada.includes('is not defined') ||
    mensagemNormalizada.includes('undefined')
  ) {
    return 'Não foi possível concluir o login agora. Tente novamente.';
  }

  if (mensagemNormalizada.includes('network') || mensagemNormalizada.includes('timeout')) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }

  return mensagem;
};

const detectarRequisicaoTwoFactorNoErro = (erro) => {
  const status = erro?.response?.status;
  const data = erro?.response?.data;

  if (status !== 401) return false;

  if (data && typeof data === 'object') {
    if (data.twoFactorRequired === true || data.requiresTwoFactor === true) {
      return true;
    }
  }

  const textoErro = String(
    data?.mensagem || data?.message || data?.erro || data?.error || erro?.message || ''
  ).toLowerCase();

  return (
    textoErro.includes('2fa') ||
    textoErro.includes('dois fatores') ||
    textoErro.includes('autenticação obrigatório') ||
    textoErro.includes('autenticação obrigatória') ||
    textoErro.includes('codigo de autenticacao') ||
    textoErro.includes('código de autenticação')
  );
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleTokenInvalid = useCallback(async () => {
    setIsAuthenticated(false);
    setUsuario(null);
    setToken(null);
    try {
      await AuthService.logout();
      Toast.show({
        type: 'warning',
        text1: 'Sessão expirada',
        text2: 'Faça login novamente',
      });
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout após token inválido:', error);
    }
  }, []);

  const handleTokenExpiring = useCallback(async () => {
    if (!usuario?.idUsuario) return;
    
    try {
      const newToken = await AuthService.reautenticar(usuario.idUsuario);
      setToken(newToken);
      Toast.show({
        type: 'info',
        text1: 'Sessão renovada',
        text2: 'Sua sessão foi atualizada automaticamente',
      });
    } catch (error) {
      console.error('[AuthContext] Erro ao renovar token:', error);
      await handleTokenInvalid();
    }
  }, [usuario, handleTokenInvalid]);

  useTokenMonitor(isAuthenticated, handleTokenInvalid, handleTokenExpiring);

  useEffect(() => {
    carregarSessao();
    setLogoutHandler(logout);

    return () => {
      setLogoutHandler(null);
    };
  }, []);

  const carregarSessao = async () => {
    try {
      setLoading(true);
      const tokenSalvo = await AuthService.getToken();
      
      if (!tokenSalvo) {
        setIsAuthenticated(false);
        setUsuario(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const { autenticado, usuario: usuarioData } = await AuthService.carregarSessao();
      
      if (autenticado && usuarioData) {
        setToken(tokenSalvo);
        setUsuario(usuarioData);
        setIsAuthenticated(true);
      } else {
        await AuthService.removeToken();
        await AuthService.setUserData(null);
        setIsAuthenticated(false);
        setUsuario(null);
        setToken(null);
      }
    } catch (erro) {
      console.error('[AuthContext] Erro ao carregar sessão:', erro);
      await AuthService.removeToken();
      await AuthService.setUserData(null);
      setIsAuthenticated(false);
      setUsuario(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, senha, rememberMe = false, twoFactorCode }) => {
    try {
      setLoading(true);
      const result = await AuthService.login({ email, senha, rememberMe, twoFactorCode });
      const requerTwoFactor = Boolean(result?.requiresTwoFactor || result?.twoFactorRequired);
      
      if (!result.success && requerTwoFactor) {
        return {
          sucesso: false,
          requiresTwoFactor: true,
          twoFactorRequired: true,
          emailDestino: result.emailDestino,
          message: result.message,
        };
      }
      
      if (!result.success) {
        return {
          sucesso: false,
          erro: result.message || 'Erro no login'
        };
      }
      
      const { token: novoToken, usuario: usuarioData } = result;
      const tokenVerificado = await AuthService.getToken();
      if (!tokenVerificado) {
        return { 
          sucesso: false, 
          erro: 'Falha ao armazenar token. Por favor, tente novamente.'
        };
      }
      
      if (novoToken && usuarioData) {
        setToken(novoToken);
        setUsuario(usuarioData);
        setIsAuthenticated(true);
        
        Toast.show({
          type: 'success',
          text1: 'Login realizado!',
          text2: `Bem-vindo, ${usuarioData.nome}!`,
        });
        
        return { 
          sucesso: true,
          mensagem: result.message || 'Login realizado com sucesso'
        };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (erro) {
      if (detectarRequisicaoTwoFactorNoErro(erro)) {
        return {
          sucesso: false,
          requiresTwoFactor: true,
          twoFactorRequired: true,
          emailDestino: erro?.response?.data?.emailDestino || email,
          message:
            erro?.response?.data?.mensagem ||
            erro?.response?.data?.message ||
            'Digite o código de verificação para continuar o login.',
        };
      }

      const mensagem = obterMensagemLoginAmigavel(erro);
      
      Toast.show({
        type: 'error',
        text1: 'Erro no login',
        text2: mensagem,
      });
      
      return { sucesso: false, erro: mensagem };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ nome, email, senha }) => {
    try {
      const result = await AuthService.register({ nome, email, senha });
      return result?.success
        ? { sucesso: true, mensagem: result.message }
        : { sucesso: false, erro: result?.message || 'Erro ao realizar cadastro' };
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.message || 'Erro ao realizar cadastro';
      
      Toast.show({
        type: 'error',
        text1: 'Erro no cadastro',
        text2: mensagem,
      });
      
      return { sucesso: false, erro: mensagem };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
      
      Toast.show({
        type: 'info',
        text1: 'Logout realizado',
        text2: 'Até breve!',
      });
    } catch (erro) {
      console.error('[AuthContext] Erro ao fazer logout:', erro);
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        carregarSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;
