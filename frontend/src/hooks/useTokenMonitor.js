/**
 * Hook useTokenMonitor
 * Monitora mudanças no token JWT, detecta remoções/modificações não autorizadas
 * e renova automaticamente tokens próximos de expirar
 */
import { useEffect, useRef } from 'react';
import AuthService from '../services/AuthService';

const INTERVALO_MONITORAMENTO_MS = 30000;
const JANELA_RENOVACAO_MS = 5 * 60 * 1000;
const COOLDOWN_RENOVACAO_MS = 60 * 1000;

const useTokenMonitor = (isAuthenticated, onTokenInvalid, onTokenExpiring) => {
  const lastTokenRef = useRef(null);
  const intervalRef = useRef(null);
  const proximaRenovacaoPermitidaRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTokenRef.current = null;
      return;
    }

    const checkTokenChanges = async () => {
      try {
        const currentToken = await AuthService.getToken();
        
        if (!currentToken && lastTokenRef.current) {
          console.log('[TokenMonitor] Token removido detectado, fazendo logout');
          onTokenInvalid();
          return;
        }

        if (currentToken) {
          if (lastTokenRef.current === null) {
            lastTokenRef.current = currentToken;
            return;
          }

          if (lastTokenRef.current !== currentToken) {
            console.log('[TokenMonitor] Mudança no token detectada');
            lastTokenRef.current = currentToken;
            proximaRenovacaoPermitidaRef.current = 0;
          }

          if (onTokenExpiring) {
            const tokenData = AuthService.parseJwt(currentToken);
            if (tokenData?.exp) {
              const expirationTime = tokenData.exp * 1000;
              const currentTime = Date.now();
              const timeUntilExpiration = expirationTime - currentTime;

              if (
                timeUntilExpiration > 0 &&
                timeUntilExpiration <= JANELA_RENOVACAO_MS &&
                currentTime >= proximaRenovacaoPermitidaRef.current
              ) {
                console.log('[TokenMonitor] Token próximo de expirar, iniciando renovação');
                proximaRenovacaoPermitidaRef.current = currentTime + COOLDOWN_RENOVACAO_MS;
                await onTokenExpiring();
              }
            }
          }
        }
      } catch (error) {
        console.error('[TokenMonitor] Erro ao monitorar token:', error);
        await onTokenInvalid();
      }
    };

    checkTokenChanges();
    intervalRef.current = setInterval(checkTokenChanges, INTERVALO_MONITORAMENTO_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, onTokenInvalid, onTokenExpiring]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

export default useTokenMonitor;
