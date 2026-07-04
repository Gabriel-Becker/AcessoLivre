import * as Speech from 'expo-speech';
import Constants from 'expo-constants';

let moduloReconhecimentoCache;

function obterModuloReconhecimento() {
  if (moduloReconhecimentoCache !== undefined) {
    return moduloReconhecimentoCache;
  }

  try {
    const modulo = require('expo-speech-recognition');
    moduloReconhecimentoCache = modulo?.ExpoSpeechRecognitionModule ?? null;
  } catch (error) {
    console.warn('Reconhecimento de voz indisponível neste runtime:', error?.message ?? error);
    moduloReconhecimentoCache = null;
  }

  return moduloReconhecimentoCache;
}

function reconhecimentoDisponivel() {
  const ambienteExecucao = Constants.executionEnvironment || Constants.appOwnership;

  if (ambienteExecucao === 'storeClient' || ambienteExecucao === 'expo') {
    return false;
  }

  return !!obterModuloReconhecimento();
}

class ServicoVoz {
  static isListening = false;
  static recognitionSubscription = null;
  static currentTimeout = null;

  // Inicialização (expo-speech não precisa de configuração global).
  static init() {
    // O expo-speech não tem setDefaultLanguage.
    // O idioma é definido em cada chamada de speak().
    if (!reconhecimentoDisponivel()) {
      console.warn('Reconhecimento de voz requer development build ou app nativo compilado.');
    }
  }

  static canRecognizeSpeech() {
    return reconhecimentoDisponivel();
  }

  // Texto para fala (app fala)
  static speak(text, options = {}) {
    // Para qualquer fala anterior.
    Speech.stop();
    
    // Limpa timeout anterior se existir.
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    const defaultOptions = {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.9, // Velocidade da fala (0.5 a 2.0)
    };

    // Fala o texto.
    Speech.speak(text, { ...defaultOptions, ...options });
  }

  // Fala o texto e aguarda a conclusão antes de continuar.
  static async speakAsync(text, options = {}) {
    Speech.stop();

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    const defaultOptions = {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.9,
    };

    return new Promise((resolve) => {
      Speech.speak(text, {
        ...defaultOptions,
        ...options,
        onDone: resolve,
        onStopped: resolve,
        onError: resolve,
      });
    });
  }

  // Fala para texto (escuta o usuário).
  static async listen(onResult, onError) {
    try {
      if (!reconhecimentoDisponivel()) {
        const erro = {
          message: 'Reconhecimento de voz indisponível neste runtime. Use um development build ou app nativo compilado.',
        };
        console.warn(erro.message);
        if (onError) onError(erro);
        return;
      }

      const moduloReconhecimento = obterModuloReconhecimento();

      if (!moduloReconhecimento) {
        const erro = {
          message: 'Reconhecimento de voz indisponível neste app. Gere um development build para usar este recurso.',
        };
        console.warn(erro.message);
        if (onError) onError(erro);
        return;
      }

      // Verifica permissões primeiro.
      const permission = await moduloReconhecimento.requestPermissionsAsync();
      
      if (!permission.granted) {
        this.speak('Preciso de permissão para usar o microfone');
        if (onError) onError({ message: 'Permissão negada' });
        return;
      }

      // Limpa listener anterior se existir.
      if (this.recognitionSubscription) {
        this.recognitionSubscription.remove();
      }

      // Registra evento de resultado.
      this.recognitionSubscription = moduloReconhecimento.addListener('result', (event) => {
        const text = event.results[0]?.transcript?.toLowerCase();
        if (text && this.isListening) {
          this.stop(); // Para de escutar após receber comando.
          onResult(text);
        }
      });

      // Registra evento de erro.
      const errorSubscription = moduloReconhecimento.addListener('error', (event) => {
        console.error('Erro no reconhecimento:', event);
        this.stop();
        if (onError) onError(event);
      });

      // Registra fim da escuta.
      const endSubscription = moduloReconhecimento.addListener('end', () => {
        this.isListening = false;
      });

      // Inicia escuta.
      this.isListening = true;
      await moduloReconhecimento.start({
        lang: 'pt-BR',
        interimResults: true,  // Resultados parciais (enquanto fala).
        continuous: false,     // Para após uma pausa.
        maxAlternatives: 1,
      });

      // Armazena subscriptions para limpeza.
      this.errorSubscription = errorSubscription;
      this.endSubscription = endSubscription;
      
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      this.isListening = false;
      if (onError) onError(error);
    }
  }

  // Para de escutar.
  static stop() {
    if (this.isListening) {
      try {
        const moduloReconhecimento = obterModuloReconhecimento();

        if (moduloReconhecimento) {
          moduloReconhecimento.stop();
        }
      } catch (error) {
        console.error('Erro ao parar reconhecimento:', error);
      }
      this.isListening = false;
    }
    
    // Remove todos os listeners.
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

  // Verifica se está ouvindo.
  static getIsListening() {
    return this.isListening;
  }

  // Verifica se o TTS está falando.
  static async isSpeaking() {
    return await Speech.isSpeakingAsync();
  }

  // Para de falar imediatamente.
  static stopSpeaking() {
    Speech.stop();
  }
}

export default ServicoVoz;