import React, { createContext, useState, useContext, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import AuthService from '../services/AuthService';
import { setLogoutHandler } from '../utils/SessionManager';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
      console.error('Erro ao carregar sessão:', erro);
      await AuthService.removeToken();
      await AuthService.setUserData(null);
      setIsAuthenticated(false);
      setUsuario(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, senha }) => {
    try {
      const { token: novoToken, usuario: usuarioData } = await AuthService.login({ email, senha });
      
      if (novoToken && usuarioData) {
        setToken(novoToken);
        setUsuario(usuarioData);
        setIsAuthenticated(true);
        
        Toast.show({
          type: 'success',
          text1: 'Login realizado!',
          text2: `Bem-vindo, ${usuarioData.nome}!`,
        });
        
        return { sucesso: true };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.message || 'Erro ao fazer login';
      
      Toast.show({
        type: 'error',
        text1: 'Erro no login',
        text2: mensagem,
      });
      
      return { sucesso: false, erro: mensagem };
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
      console.error('Erro ao fazer logout:', erro);
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
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
