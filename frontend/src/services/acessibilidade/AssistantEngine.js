import VoiceService from './VoiceService';
import NavigationService from './NavigationService';

class AssistantEngine {
  static isProcessing = false;

  static async handle(command, context = {}) {
    if (this.isProcessing) {
      VoiceService.speak("Aguarde, estou processando...");
      return;
    }

    this.isProcessing = true;
    const text = command.toLowerCase();

    // Comandos principais
    if (text.includes("home") || text.includes("início") || text.includes("inicio")) {
      VoiceService.speak("Indo para a página inicial");
      NavigationService.resetTo('Main', { screen: 'Inicio' });
    }
    else if (text.includes("perfil") || text.includes("meu perfil")) {
      VoiceService.speak("Abrindo seu perfil");
      NavigationService.navigate('Main', { screen: 'Perfil' });
    }
    else if (text.includes("denunciar") || text.includes("reportar")) {
      VoiceService.speak("Abrindo formulário de denúncia");
      NavigationService.navigate('Main', { screen: 'Denuncia' });
    }
    else if (text.includes("voltar") || text.includes("retornar")) {
      if (NavigationService.canGoBack()) {
        VoiceService.speak("Voltando");
        NavigationService.goBack();
      } else {
        VoiceService.speak("Não é possível voltar, você está na tela inicial");
      }
    }
    else if (text.includes("sair") || text.includes("logout")) {
      VoiceService.speak("Saindo do aplicativo");
      NavigationService.resetTo('Login');
    }
    else if (text.includes("ajuda") || text.includes("comandos")) {
      VoiceService.speak("Comandos disponíveis: home, perfil, denunciar, voltar, sair. O que você deseja?");
    }
    else {
      const currentScreen = NavigationService.getCurrentRoute();
      VoiceService.speak(`Comando não reconhecido. Você está na tela ${currentScreen}. Diga ajuda para ver os comandos disponíveis.`);
    }

    this.isProcessing = false;
  }
}

export default AssistantEngine;