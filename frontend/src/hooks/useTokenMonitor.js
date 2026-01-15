/**
 * Hook useTokenMonitor
 * Monitora mudanças no token JWT, detecta remoções/modificações não autorizadas
 * e renova automaticamente tokens próximos de expirar
 */
import { useEffect, useRef } from 'react';
import AuthService from '../services/AuthService';

const useTokenMonitor = (isAuthenticated, onTokenInvalid, onTokenExpiring) => {
  const lastTokenRef = useRef(null);
  const intervalRef = useRef(null);

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
            console.log('[TokenMonitor] Mudança no token detectada, verificando validade');
            
            const isValid = await AuthService.isAuthenticated();
            if (!isValid) {
              console.log('[TokenMonitor] Token modificado é inválido, fazendo logout');
              onTokenInvalid();
              return;
            }
            
            lastTokenRef.current = currentToken;
          }

          if (onTokenExpiring) {
            const tokenData = AuthService.parseJwt(currentToken);
            if (tokenData?.exp) {
              const expirationTime = tokenData.exp * 1000;
              const currentTime = Date.now();
              const timeUntilExpiration = expirationTime - currentTime;
              const tokenLifetime = expirationTime - (tokenData.iat * 1000);
              const renewalThreshold = tokenLifetime * 0.1;

              if (timeUntilExpiration > 0 && timeUntilExpiration <= renewalThreshold) {
                console.log('[TokenMonitor] Token próximo de expirar, iniciando renovação');
                onTokenExpiring();
              }
            }
          }
        }
      } catch (error) {
        console.error('[TokenMonitor] Erro ao monitorar token:', error);
        onTokenInvalid();
      }
    };

    checkTokenChanges();
    intervalRef.current = setInterval(checkTokenChanges, 2000);

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
