import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import ServicoAutenticacao from '../services/ServicoAutenticacao';
import { setLogoutHandler } from '../utils/GerenciadorSessao';
import { resetToAuth } from '../navigation/navigationRef';
import useMonitorToken from '../hooks/useMonitorToken';

const ContextoAutenticacao = createContext({});

const obterMensagemLoginAmigavel = (erro) => {
  const mensagemBackend =
    erro?.response?.data?.mensagem ||
    erro?.response?.data?.message ||
    erro?.response?.data?.erro ||
    erro?.response?.data?.error;
  const mensagemErro = erro?.message;
  const mensagem = mensagemBackend || mensagemErro || '';
  const mensagemNormalizada = String(mensagem).toLowerCase();

  if (!mensagem) {
    return 'NÃ£o foi possÃ­vel entrar agora. Tente novamente em instantes.';
  }

  if (
    mensagemNormalizada.includes('referenceerror') ||
    mensagemNormalizada.includes('is not defined') ||
    mensagemNormalizada.includes('undefined')
  ) {
    return 'NÃ£o foi possÃ­vel concluir o login agora. Tente novamente.';
  }

  if (mensagemNormalizada.includes('network') || mensagemNormalizada.includes('timeout')) {
    return 'Falha de conexÃ£o. Verifique sua internet e tente novamente.';
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
    textoErro.includes('autenticaÃ§Ã£o obrigatÃ³rio') ||
    textoErro.includes('autenticaÃ§Ã£o obrigatÃ³ria') ||
    textoErro.includes('codigo de autenticacao') ||
    textoErro.includes('cÃ³digo de autenticaÃ§Ã£o')
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
      await ServicoAutenticacao.logout();
      Toast.show({
        type: 'warning',
        text1: 'SessÃ£o expirada',
        text2: 'FaÃ§a login novamente',
      });
      resetToAuth();
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout apÃ³s token invÃ¡lido:', error);
    }
  }, []);

  const handleTokenExpiring = useCallback(async () => {
    if (!usuario?.idUsuario) return;
    
    try {
      const newToken = await ServicoAutenticacao.reautenticar(usuario.idUsuario);
      setToken(newToken);
      Toast.show({
        type: 'info',
        text1: 'SessÃ£o renovada',
        text2: 'Sua sessÃ£o foi atualizada automaticamente',
      });
    } catch (error) {
      console.error('[AuthContext] Erro ao renovar token:', error);
      await handleTokenInvalid();
    }
  }, [usuario, handleTokenInvalid]);

  useMonitorToken(isAuthenticated, handleTokenInvalid, handleTokenExpiring);

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
      const tokenSalvo = await ServicoAutenticacao.getToken();
      
      if (!tokenSalvo) {
        setIsAuthenticated(false);
        setUsuario(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const { autenticado, usuario: usuarioData } = await ServicoAutenticacao.carregarSessao();
      
      if (autenticado && usuarioData) {
        setToken(tokenSalvo);
        setUsuario(usuarioData);
        setIsAuthenticated(true);
      } else {
        await ServicoAutenticacao.removeToken();
        await ServicoAutenticacao.setUserData(null);
        setIsAuthenticated(false);
        setUsuario(null);
        setToken(null);
      }
    } catch (erro) {
      console.error('[AuthContext] Erro ao carregar sessÃ£o:', erro);
      await ServicoAutenticacao.removeToken();
      await ServicoAutenticacao.setUserData(null);
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
      const result = await ServicoAutenticacao.login({ email, senha, rememberMe, twoFactorCode });
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
      const tokenVerificado = await ServicoAutenticacao.getToken();
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

        return { 
          sucesso: true,
          mensagem: result.message || 'Login realizado com sucesso'
        };
      } else {
        throw new Error('Resposta invÃ¡lida do servidor');
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
            'Digite o cÃ³digo de verificaÃ§Ã£o para continuar o login.',
        };
      }

      const mensagem = obterMensagemLoginAmigavel(erro);

      return { sucesso: false, erro: mensagem };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ nome, email, senha }) => {
    try {
      const nomeFormatado = String(nome || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)([a-zÃ -Ã¿])/g, (match, espaco, letra) => `${espaco}${letra.toUpperCase()}`);

      const result = await ServicoAutenticacao.register({ nome: nomeFormatado, email, senha });
      return result?.success
        ? { sucesso: true, mensagem: result.message }
        : { sucesso: false, erro: result?.message || 'Erro ao realizar cadastro' };
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.message || 'Erro ao realizar cadastro';

      return { sucesso: false, erro: mensagem };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await ServicoAutenticacao.logout();
      
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
      
      Toast.show({
        type: 'info',
        text1: 'Logout realizado',
        text2: 'AtÃ© breve!',
      });
      resetToAuth();
    } catch (erro) {
      console.error('[AuthContext] Erro ao fazer logout:', erro);
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPERS PARA OBTER DADOS DO USUÃRIO
  // ============================================
  
  const getUsuarioId = useCallback(() => {
    if (!usuario) return null;
    
    // Tenta diferentes propriedades que podem conter o ID
    const id = usuario.idUsuario || usuario.id || usuario.userId;
    
    // Converte para nÃºmero se for string
    return id ? Number(id) : null;
  }, [usuario]);

  const getUsuarioNome = useCallback(() => {
    if (!usuario) return 'UsuÃ¡rio';
    return usuario.nome || usuario.name || usuario.displayName || 'UsuÃ¡rio';
  }, [usuario]);

  const getUsuarioEmail = useCallback(() => {
    if (!usuario) return null;
    return usuario.email || null;
  }, [usuario]);

  const getUsuarioCompleto = useCallback(() => {
    if (!usuario) return null;
    
    return {
      id: usuario.idUsuario || usuario.id,
      idUsuario: usuario.idUsuario || usuario.id,
      nome: usuario.nome || usuario.name || usuario.displayName || 'UsuÃ¡rio',
      email: usuario.email,
      ...usuario
    };
  }, [usuario]);

  const isUsuarioAutenticado = useCallback(() => {
    return isAuthenticated && !!usuario && !!token;
  }, [isAuthenticated, usuario, token]);

  return (
    <ContextoAutenticacao.Provider
      value={{
        // Valores existentes
        usuario,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        carregarSessao,
        
        // NOVOS HELPERS
        getUsuarioId,
        getUsuarioNome,
        getUsuarioEmail,
        getUsuarioCompleto,
        isUsuarioAutenticado,
        
        // Atalhos para facilitar
        userId: getUsuarioId(),
        userName: getUsuarioNome(),
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(ContextoAutenticacao);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default ContextoAutenticacao;