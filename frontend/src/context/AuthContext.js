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

  // Callback para quando o token for inválido
  const handleTokenInvalid = useCallback(async () => {
    console.log('[AuthContext] Token inválido detectado, fazendo logout');
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

  // Usar o hook de monitoramento de token
  useTokenMonitor(isAuthenticated, handleTokenInvalid);

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

      // Valida token com backend
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
      
      // TODO: Tratamento de 2FA quando implementado
      // if (!result.success && result.requiresTwoFactor) {
      //   return {
      //     sucesso: false,
      //     requiresTwoFactor: true,
      //     mensagem: result.message
      //   };
      // }
      
      // Se não foi sucesso por outro motivo
      if (!result.success) {
        return {
          sucesso: false,
          erro: result.message || 'Erro no login'
        };
      }
      
      const { token: novoToken, usuario: usuarioData } = result;
      
      // Verificar se o token está realmente disponível
      const tokenVerificado = await AuthService.getToken();
      if (!tokenVerificado) {
        console.error('[AuthContext] Token não foi armazenado corretamente após login');
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

  const register = async ({ nome, email, senha }) => {
    try {
      await AuthService.register({ nome, email, senha });
      
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado!',
        text2: 'Faça login para continuar.',
      });
      
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
      // Mesmo com erro, limpar estado local
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário (útil após edição de perfil)
   */
  const updateUserData = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const { autenticado, usuario: usuarioAtualizado } = await AuthService.carregarSessao();
        
        if (autenticado && usuarioAtualizado) {
          setUsuario(usuarioAtualizado);
        } else {
          // Se não conseguiu carregar, fazer logout
          await logout();
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao atualizar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
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
        updateUserData,
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
