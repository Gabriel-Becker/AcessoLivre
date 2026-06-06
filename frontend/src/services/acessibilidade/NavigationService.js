// src/services/NavigationService.js
import { navigationRef, navigate, goBack, canGoBack, getCurrentRouteName, resetToScreen } from '../../navigation/navigationRef';

class NavigationService {
  
  // Método para navegar para uma tela
  static navigate(screen, params) {
    navigate(screen, params);
  }

  // Método para voltar
  static goBack() {
    goBack();
  }

  // Método para verificar se pode voltar
  static canGoBack() {
    return canGoBack();
  }

  // Método para obter a tela atual
  static getCurrentRoute() {
    return getCurrentRouteName();
  }

  // Método para resetar para uma tela (útil para comandos como "vai para home")
  static resetTo(screen, params = {}) {
    resetToScreen(screen, params);
  }

  // Método para compatibilidade (se algum código antigo chamar setNavigator)
  static setNavigator(ref) {
    // Não precisa fazer nada, pois já usamos o navigationRef diretamente
    console.log('NavigationService: Usando navigationRef global');
  }
}

export default NavigationService;