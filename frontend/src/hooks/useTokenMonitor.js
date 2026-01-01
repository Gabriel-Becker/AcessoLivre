/**
 * Hook useTokenMonitor
 * Monitora mudanças no token JWT e detecta remoções/modificações não autorizadas
 * Baseado no padrão do Inkspiration
 */
import { useEffect, useRef } from 'react';
import AuthService from '../services/AuthService';

/**
 * Hook para monitorar mudanças no token
 * @param {boolean} isAuthenticated - Se o usuário está autenticado
 * @param {function} onTokenInvalid - Callback quando token se torna inválido
 */
const useTokenMonitor = (isAuthenticated, onTokenInvalid) => {
  const lastTokenRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Limpar monitoramento se não estiver autenticado
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTokenRef.current = null;
      return;
    }

    // Função para verificar mudanças no token
    const checkTokenChanges = async () => {
      try {
        const currentToken = await AuthService.getToken();
        
        // Se não há token atual mas deveria haver (usuário estava autenticado)
        if (!currentToken && lastTokenRef.current) {
          console.log('[TokenMonitor] Token removido detectado, fazendo logout');
          onTokenInvalid();
          return;
        }

        // Se há token atual
        if (currentToken) {
          // Se é a primeira verificação, apenas armazenar o token
          if (lastTokenRef.current === null) {
            lastTokenRef.current = currentToken;
            return;
          }

          // Se o token mudou
          if (lastTokenRef.current !== currentToken) {
            console.log('[TokenMonitor] Mudança no token detectada, verificando validade');
            
            // Verificar se o novo token é válido
            const isValid = await AuthService.isAuthenticated();
            if (!isValid) {
              console.log('[TokenMonitor] Token modificado é inválido, fazendo logout');
              onTokenInvalid();
              return;
            }
            
            // Atualizar referência do token
            lastTokenRef.current = currentToken;
          }
        }
      } catch (error) {
        console.error('[TokenMonitor] Erro ao monitorar token:', error);
        // Em caso de erro crítico, fazer logout por segurança
        onTokenInvalid();
      }
    };

    // Verificação inicial
    checkTokenChanges();

    // Configurar verificação periódica (a cada 2 segundos para detectar mudanças rapidamente)
    intervalRef.current = setInterval(checkTokenChanges, 2000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, onTokenInvalid]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

export default useTokenMonitor;
