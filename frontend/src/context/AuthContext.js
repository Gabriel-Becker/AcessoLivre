import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import AuthService from '../services/AuthService';
import { setLogoutHandler } from '../utils/SessionManager';
import useTokenMonitor from '../hooks/useTokenMonitor';

const AuthContext = createContext({});

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
    setLogoutHandler(() => logout);
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

  const login = async ({ email, senha, rememberMe = false }) => {
    try {
      setLoading(true);
      const result = await AuthService.login({ email, senha, rememberMe });
      
      if (!result.success && result.requiresTwoFactor) {
        return {
          sucesso: false,
          requiresTwoFactor: true,
          emailDestino: result.emailDestino
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
      console.error('[AuthContext] Erro ao fazer login:', erro);
      const mensagem = erro.response?.data?.mensagem || erro.message || 'Erro ao fazer login';
      
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

  const validarCodigo2FA = async ({ email, codigo }) => {
    try {
      setLoading(true);
      const result = await AuthService.verifyTwoFactorCode({ email, codigo });
      const { token: novoToken, usuario: usuarioData } = result;

      setToken(novoToken);
      setUsuario(usuarioData);
      setIsAuthenticated(true);

      Toast.show({
        type: 'success',
        text1: 'Login confirmado!',
        text2: `Bem-vindo, ${usuarioData.nome}!`,
      });

      return { sucesso: true };
    } catch (erro) {
      const mensagem = erro.response?.data || erro.message || 'Código inválido ou expirado';
      Toast.show({
        type: 'error',
        text1: 'Código inválido',
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

      if (result.requiresConfirmation) {
        Toast.show({
          type: 'info',
          text1: 'Confirme seu e-mail',
          text2: `Enviamos um código para ${result.emailDestino}`,
        });
        return { sucesso: false, requiresConfirmation: true, emailDestino: result.emailDestino, email };
      }

      return { sucesso: true };
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

  const confirmarCadastro = async ({ email, codigo }) => {
    try {
      const result = await AuthService.confirmRegistration({ email, codigo });

      Toast.show({
        type: 'success',
        text1: 'Cadastro confirmado!',
        text2: 'Agora você pode fazer login.',
      });

      return { sucesso: true, usuario: result.usuario };
    } catch (erro) {
      const mensagem = erro.response?.data || erro.message || 'Código inválido ou expirado';
      Toast.show({
        type: 'error',
        text1: 'Erro na confirmação',
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
        validarCodigo2FA,
        register,
        confirmarCadastro,
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
