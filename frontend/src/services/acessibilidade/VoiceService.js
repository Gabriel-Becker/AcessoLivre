import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

class VoiceService {
  static isListening = false;
  static recognitionSubscription = null;
  static currentTimeout = null;

  // Inicialização (expo-speech não precisa de configuração global)
  static init() {
    // O expo-speech não tem setDefaultLanguage
    // O idioma é definido em cada chamada de speak()
    console.log('VoiceService inicializado');
  }

  // 🔊 Texto para Fala (app fala)
  static speak(text, options = {}) {
    // Para qualquer fala anterior
    Speech.stop();
    
    // Limpar timeout anterior se existir
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    const defaultOptions = {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.9, // Velocidade da fala (0.5 a 2.0)
    };

    // Falar o texto
    Speech.speak(text, { ...defaultOptions, ...options });
  }

  // 🎤 Fala para Texto (escuta o usuário)
  static async listen(onResult, onError) {
    try {
      // Verificar permissões primeiro
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!permission.granted) {
        this.speak("Preciso de permissão para usar o microfone");
        if (onError) onError({ message: "Permissão negada" });
        return;
      }

      // Limpar listener anterior se existir
      if (this.recognitionSubscription) {
        this.recognitionSubscription.remove();
      }

      // Registrar evento de resultado
      this.recognitionSubscription = ExpoSpeechRecognitionModule.addListener('result', (event) => {
        const text = event.results[0]?.transcript?.toLowerCase();
        if (text && this.isListening) {
          this.stop(); // Para de escutar após receber comando
          onResult(text);
        }
      });

      // Registrar evento de erro
      const errorSubscription = ExpoSpeechRecognitionModule.addListener('error', (event) => {
        console.error('Erro no reconhecimento:', event);
        this.stop();
        if (onError) onError(event);
      });

      // Registrar fim da escuta
      const endSubscription = ExpoSpeechRecognitionModule.addListener('end', () => {
        console.log('Reconhecimento finalizado');
        this.isListening = false;
      });

      // Iniciar escuta
      this.isListening = true;
      await ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,  // Resultados parciais (enquanto fala)
        continuous: false,     // Para após uma pausa
        maxAlternatives: 1,
      });

      // Armazenar subscriptions para limpeza
      this.errorSubscription = errorSubscription;
      this.endSubscription = endSubscription;
      
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      this.isListening = false;
      if (onError) onError(error);
    }
  }

  // Parar de escutar
  static stop() {
    if (this.isListening) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (error) {
        console.error('Erro ao parar reconhecimento:', error);
      }
      this.isListening = false;
    }
    
    // Remover todos os listeners
    if (this.recognitionSubscription) {
      this.recognitionSubscription.remove();
      this.recognitionSubscription = null;
    }
    
    if (this.errorSubscription) {
      this.errorSubscription.remove();
      this.errorSubscription = null;
    }
    
    if (this.endSubscription) {
      this.endSubscription.remove();
      this.endSubscription = null;
    }
  }

  // Verificar se está ouvindo
  static getIsListening() {
    return this.isListening;
  }

  // Verificar se o TTS está falando
  static async isSpeaking() {
    return await Speech.isSpeakingAsync();
  }

  // Parar de falar imediatamente
  static stopSpeaking() {
    Speech.stop();
  }
}

export default VoiceService;