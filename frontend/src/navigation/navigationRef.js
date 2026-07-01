import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// FunÃ§Ã£o auxiliar para navegar (mantendo a existente)
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToAuth() {
  if (!navigationRef.isReady()) return;

  const state = navigationRef.getRootState();
  const routeNames = state?.routeNames || [];

  if (!routeNames.includes('Entrar')) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Entrar' }],
    })
  );
}

export function resetToHome() {
  if (!navigationRef.isReady()) return;

  const state = navigationRef.getRootState();
  const routeNames = state?.routeNames || [];

  if (!routeNames.includes('Main')) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Inicio' } }],
    })
  );
}

// ============================================
// NOVAS FUNÃ‡Ã•ES PARA O ASSISTENTE DE ACESSIBILIDADE
// ============================================

// FunÃ§Ã£o para obter o nome da tela atual
export function getCurrentRouteName() {
  if (!navigationRef.isReady()) return null;

  const currentRoute = navigationRef.getCurrentRoute();
  return currentRoute?.name || null;
}

// FunÃ§Ã£o para obter o estado completo da navegaÃ§Ã£o
export function getRootState() {
  if (!navigationRef.isReady()) return null;
  return navigationRef.getRootState();
}

// FunÃ§Ã£o para verificar se pode voltar
export function canGoBack() {
  if (!navigationRef.isReady()) return false;
  return navigationRef.canGoBack();
}

// FunÃ§Ã£o para voltar (compatÃ­vel com ServicoNavegacao)
export function goBack() {
  if (!navigationRef.isReady()) return;
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

// FunÃ§Ã£o para resetar para uma tela especÃ­fica (Ãºtil para comandos de voz)
export function resetToScreen(screenName, params = {}) {
  if (!navigationRef.isReady()) return;

  const state = navigationRef.getRootState();
  const routeNames = state?.routeNames || [];

  if (!routeNames.includes(screenName)) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screenName, params }],
    })
  );
}

export default navigationRef;

