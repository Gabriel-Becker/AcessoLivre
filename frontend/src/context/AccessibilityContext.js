import React, { createContext, useState, useEffect } from 'react';
import VoiceService from '../services/acessibilidade/VoiceService';
import AssistantEngine from '../services/acessibilidade/AssistantEngine';
export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);

  useEffect(() => {
    if (enabled) {
      VoiceService.init();
      VoiceService.speak("Modo acessibilidade ativado");
    } else {
      VoiceService.stop();
    }
  }, [enabled]);

  const toggle = () => {
    setEnabled(!enabled);
  };

  const startListening = async () => {
    if (!enabled) {
      VoiceService.speak("Ative o modo acessibilidade primeiro");
      return;
    }

    if (!VoiceService.canRecognizeSpeech()) {
      setIsListening(false);
      VoiceService.speak("Reconhecimento de voz indisponível neste aplicativo. Use um development build para falar comandos.");
      return;
    }

    if (isListening) {
      VoiceService.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    VoiceService.speak("Pode falar");

    await VoiceService.listen(
      (text) => {
        setLastCommand(text);
        setIsListening(false);
        AssistantEngine.handle(text);
      },
      (error) => {
        console.error("Erro:", error);
        setIsListening(false);
        VoiceService.speak("Erro no reconhecimento. Tente novamente.");
      }
    );
  };

  return (
    <AccessibilityContext.Provider value={{
      enabled,
      toggle,
      isListening,
      startListening,
      lastCommand
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

