import * as Speech from 'expo-speech';

class AccessibilitySpeaker {
  static queueItems = [];
  static isSpeaking = false;
  static currentTimeout = null;

  static speak(text, options = {}) {
    if (!text) return;

    const defaultOptions = {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.9,
    };

    const finalOptions = { ...defaultOptions, ...options };

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    Speech.stop();

    Speech.speak(text, {
      ...finalOptions,
      onDone: () => {
        this.isSpeaking = false;
        this.processQueue();
      },
      onError: () => {
        this.isSpeaking = false;
        this.processQueue();
      }
    });

    this.isSpeaking = true;
  }

  static addToQueue(text, options = {}) {
    this.queueItems.push({ text, options });
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  static processQueue() {
    if (this.queueItems.length === 0) {
      this.isSpeaking = false;
      return;
    }

    const next = this.queueItems.shift();
    this.speak(next.text, next.options);
  }

  static stop() {
    Speech.stop();
    this.queueItems = [];
    this.isSpeaking = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  static async isSpeakingAsync() {
    return await Speech.isSpeakingAsync();
  }

  static clearQueue() {
    this.queueItems = [];
  }
}

export default AccessibilitySpeaker;