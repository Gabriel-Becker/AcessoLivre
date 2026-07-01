// src/services/ServicoNavegacao.js
import { navigationRef, navigate, goBack, canGoBack, getCurrentRouteName, resetToScreen } from '../../navigation/navigationRef';

class ServicoNavegacao {
  
  // Mï¿½todo para navegar para uma tela
  static navigate(screen, params) {
    navigate(screen, params);
  }

  // Mï¿½todo para voltar
  static goBack() {
    goBack();
  }

  // Mï¿½todo para verificar se pode voltar
  static canGoBack() {
    return canGoBack();
  }

  // Mï¿½todo para obter a tela atual
  static getCurrentRoute() {
    return getCurrentRouteName();
  }

  // Mï¿½todo para resetar para uma tela (ï¿½til para comandos como "vai para home")
  static resetTo(screen, params = {}) {
    resetToScreen(screen, params);
  }

  // Mï¿½todo para compatibilidade (se algum cï¿½digo antigo chamar setNavigator)
  static setNavigator(ref) {
    // Nï¿½o precisa fazer nada, pois jï¿½ usamos o navigationRef diretamente
    console.log('ServicoNavegacao: Usando navigationRef global');
  }
}

export default ServicoNavegacao;