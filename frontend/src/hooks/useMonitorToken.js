import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import ServicoAutenticacao from '../services/ServicoAutenticacao';

const INTERVALO_MONITORAMENTO_MS = 5000;
const JANELA_RENOVACAO_MS = 5 * 60 * 1000;
const COOLDOWN_RENOVACAO_MS = 60 * 1000;
const MAX_FAILS_BEFORE_INVALIDATE = 3;

const useMonitorToken = (isAuthenticated, onTokenInvalid, onTokenExpiring) => {
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
        const currentToken = await ServicoAutenticacao.getToken();
        const tokenPersistido = await ServicoAutenticacao.getPersistedToken();
        const devePersistir = ServicoAutenticacao.shouldPersistToken();

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
            const tokenData = ServicoAutenticacao.parseJwt(currentToken);
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
      if (typeof document !== 'undefined' && typeof document.visibilityState !== 'undefined' && document.visibilityState === 'visible') {
        checkTokenChanges();
      }
    };

    // For React Native (non-web), use AppState to detect when app becomes active
    const handleAppStateChange = (nextAppState) => {
      try {
        if (nextAppState === 'active') {
          checkTokenChanges();
        }
      } catch (e) {
        console.error('[TokenMonitor] Erro no handleAppStateChange:', e);
      }
    };

    checkTokenChanges();
    intervalRef.current = setInterval(checkTokenChanges, INTERVALO_MONITORAMENTO_MS);

    // Only attach browser listeners when they are actually available
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('focus', handleWindowFocus);
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Attach AppState listener for native platforms (iOS/Android)
    let appStateSubscription = null;
    if (Platform.OS !== 'web') {
      try {
        if (typeof AppState.addEventListener === 'function') {
          appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
        } else if (typeof AppState.addEventListener === 'undefined' && typeof AppState.removeEventListener === 'function') {
          // older RN versions
          AppState.addEventListener('change', handleAppStateChange);
          appStateSubscription = { legacy: true };
        }
      } catch (e) {
        console.error('[TokenMonitor] Erro ao registrar AppState listener:', e);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        try { window.removeEventListener('focus', handleWindowFocus); } catch (e) {}
      }

      if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
        try { document.removeEventListener('visibilitychange', handleVisibilityChange); } catch (e) {}
      }

      if (appStateSubscription) {
        try {
          if (typeof appStateSubscription.remove === 'function') {
            appStateSubscription.remove();
          } else if (appStateSubscription.legacy) {
            AppState.removeEventListener('change', handleAppStateChange);
          }
        } catch (e) {
          console.error('[TokenMonitor] Erro ao remover AppState listener:', e);
        }
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

export default useMonitorToken;
