import Constants from 'expo-constants';

let recognitionModuleCache = null;

function getRecognitionModule() {
  if (recognitionModuleCache !== undefined) {
    return recognitionModuleCache;
  }

  try {
    const module = require('expo-speech-recognition');
    recognitionModuleCache = module?.ExpoSpeechRecognitionModule ?? null;
  } catch (error) {
    console.warn('Reconhecimento de voz indisponível:', error?.message ?? error);
    recognitionModuleCache = null;
  }

  return recognitionModuleCache;
}

function isRecognitionAvailable() {
  const executionEnv = Constants.executionEnvironment || Constants.appOwnership;

  if (executionEnv === 'storeClient' || executionEnv === 'expo') {
    return false;
  }

  return !!getRecognitionModule();
}

class VoiceRecognitionService {
  static isListening = false;
  static recognitionSubscription = null;
  static errorSubscription = null;
  static endSubscription = null;

  static canRecognize() {
    return isRecognitionAvailable();
  }

  static async requestPermissions() {
    const module = getRecognitionModule();
    if (!module) return { granted: false };

    try {
      return await module.requestPermissionsAsync();
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return { granted: false };
    }
  }

  static async startListening(onResult, onError, onEnd) {
    try {
      if (!this.canRecognize()) {
        const error = {
          message: 'Reconhecimento de voz indisponível neste runtime'
        };
        if (onError) onError(error);
        return;
      }

      const module = getRecognitionModule();
      if (!module) {
        const error = { message: 'Módulo de reconhecimento não encontrado' };
        if (onError) onError(error);
        return;
      }

      const permission = await this.requestPermissions();
      if (!permission.granted) {
        const error = { message: 'Permissão de microfone negada' };
        if (onError) onError(error);
        return;
      }

      this.cleanup();

      this.recognitionSubscription = module.addListener('result', (event) => {
        const text = event.results[0]?.transcript?.toLowerCase().trim();
        if (text && this.isListening) {
          this.stopListening();
          if (onResult) onResult(text);
        }
      });

      this.errorSubscription = module.addListener('error', (event) => {
        console.error('Erro no reconhecimento:', event);
        this.stopListening();
        if (onError) onError(event);
      });

      this.endSubscription = module.addListener('end', () => {
        this.isListening = false;
        if (onEnd) onEnd();
      });

      this.isListening = true;
      await module.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });

    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      this.isListening = false;
      if (onError) onError(error);
    }
  }

  static stopListening() {
    try {
      const module = getRecognitionModule();
      if (module && this.isListening) {
        module.stop();
      }
    } catch (error) {
      console.error('Erro ao parar reconhecimento:', error);
    }

    this.isListening = false;
    this.cleanup();
  }

  static cleanup() {
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

  static isListeningNow() {
    return this.isListening;
  }
}

export default VoiceRecognitionService;