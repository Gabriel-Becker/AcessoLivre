// src/services/ServicoNavegacao.js
import { navigationRef, navigate, goBack, canGoBack, getCurrentRouteName, resetToScreen } from '../../navigation/navigationRef';

class ServicoNavegacao {
  
  // Navega para uma tela.
  static navigate(screen, params) {
    navigate(screen, params);
  }

  // Volta para a tela anterior.
  static goBack() {
    goBack();
  }

  // Verifica se é possível voltar.
  static canGoBack() {
    return canGoBack();
  }

  // Retorna o nome da tela atual.
  static getCurrentRoute() {
    return getCurrentRouteName();
  }

  // Reseta navegação para uma tela (útil para comandos como "vai para home").
  static resetTo(screen, params = {}) {
    resetToScreen(screen, params);
  }

  // Mantido por compatibilidade com chamadas antigas.
  static setNavigator(ref) {
    void ref;
  }
}

export default ServicoNavegacao;