// src/services/NavigationService.js
import { navigationRef, navigate, goBack, canGoBack, getCurrentRouteName, resetToScreen } from '../../navigation/navigationRef';

class NavigationService {
  
  static navigate(screen, params) {
    navigate(screen, params);
  }

  static goBack() {
    goBack();
  }

  static canGoBack() {
    return canGoBack();
  }

  static getCurrentRoute() {
    return getCurrentRouteName();
  }


  static resetTo(screen, params = {}) {
    resetToScreen(screen, params);
  }

  static setNavigator(ref) {
    console.log('NavigationService: Usando navigationRef global');
  }
}

export default NavigationService;