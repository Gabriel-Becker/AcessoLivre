import { useEffect, useRef } from 'react';
import AuthService from '../services/AuthService';

const INTERVALO_MONITORAMENTO_MS = 5000;
const JANELA_RENOVACAO_MS = 5 * 60 * 1000;
const COOLDOWN_RENOVACAO_MS = 60 * 1000;
const MAX_FAILS_BEFORE_INVALIDATE = 3;

const useTokenMonitor = (isAuthenticated, onTokenInvalid, onTokenExpiring) => {
  const lastTokenRef = useRef(null);
  const intervalRef = useRef(null);
  const proximaRenovacaoPermitidaRef = useRef(0);
  const consecutiveFailsRef = useRef(0);

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
        const tokenPersistido = await AuthService.getPersistedToken();
        const devePersistir = AuthService.shouldPersistToken();

        // If this session should be persistent, any removal or edit outside the app invalidates it.
        if (devePersistir && lastTokenRef.current) {
          if (!tokenPersistido || currentToken !== lastTokenRef.current || tokenPersistido !== lastTokenRef.current) {
            consecutiveFailsRef.current = MAX_FAILS_BEFORE_INVALIDATE;
            onTokenInvalid();
            return;
          }
        }

        if (currentToken) {
          // reset consecutive failures on success
          consecutiveFailsRef.current = 0;

          if (lastTokenRef.current === null) {
            lastTokenRef.current = currentToken;
            return;
          }

          if (lastTokenRef.current !== currentToken) {
            lastTokenRef.current = currentToken;
            proximaRenovacaoPermitidaRef.current = 0;
          }

          if (onTokenExpiring) {
            const tokenData = AuthService.parseJwt(currentToken);
            if (tokenData?.exp) {
              const expirationTime = tokenData.exp * 1000;
              const currentTime = Date.now();
              const timeUntilExpiration = expirationTime - currentTime;

              // If token is already expired, invalidate immediately
              if (timeUntilExpiration <= 0) {
                onTokenInvalid();
                return;
              }

              if (
                timeUntilExpiration > 0 &&
                timeUntilExpiration <= JANELA_RENOVACAO_MS &&
                currentTime >= proximaRenovacaoPermitidaRef.current
              ) {
                proximaRenovacaoPermitidaRef.current = currentTime + COOLDOWN_RENOVACAO_MS;
                await onTokenExpiring();
              }
            }
          }
        }
      } catch (error) {
        console.error('[TokenMonitor] Erro ao monitorar token:', error);
        // do not immediately invalidate on transient errors; allow a few retries
        consecutiveFailsRef.current = (consecutiveFailsRef.current || 0) + 1;
        if (consecutiveFailsRef.current >= MAX_FAILS_BEFORE_INVALIDATE) {
          try {
            await onTokenInvalid();
          } catch (e) {
            console.error('[TokenMonitor] Erro ao chamar onTokenInvalid:', e);
          }
        }
      }
    };

    const handleWindowFocus = () => {
      checkTokenChanges();
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkTokenChanges();
      }
    };

    checkTokenChanges();
    intervalRef.current = setInterval(checkTokenChanges, INTERVALO_MONITORAMENTO_MS);

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }

      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
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
