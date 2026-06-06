import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Função auxiliar para navegar (mantendo a existente)
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToAuth() {
  if (!navigationRef.isReady()) return;

  const state = navigationRef.getRootState();
  const routeNames = state?.routeNames || [];

  if (!routeNames.includes('Login')) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
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
// NOVAS FUNÇÕES PARA O ASSISTENTE DE ACESSIBILIDADE
// ============================================

// Função para obter o nome da tela atual
export function getCurrentRouteName() {
  if (!navigationRef.isReady()) return null;
  
  const currentRoute = navigationRef.getCurrentRoute();
  return currentRoute?.name || null;
}

// Função para obter o estado completo da navegação
export function getRootState() {
  if (!navigationRef.isReady()) return null;
  return navigationRef.getRootState();
}

// Função para verificar se pode voltar
export function canGoBack() {
  if (!navigationRef.isReady()) return false;
  return navigationRef.canGoBack();
}

// Função para voltar (compatível com NavigationService)
export function goBack() {
  if (!navigationRef.isReady()) return;
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

// Função para resetar para uma tela específica (útil para comandos de voz)
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
