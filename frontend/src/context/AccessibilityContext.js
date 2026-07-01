import React, { createContext, useState, useEffect } from 'react';
import ServicoVoz from '../services/acessibilidade/ServicoVoz';
import MotoAssistente from '../services/acessibilidade/MotoAssistente';
export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);

  useEffect(() => {
    if (enabled) {
      ServicoVoz.init();
      ServicoVoz.speak("Modo acessibilidade ativado");
    } else {
      ServicoVoz.stop();
    }
  }, [enabled]);

  const toggle = () => {
    setEnabled(!enabled);
  };

  const startListening = async () => {
    if (!enabled) {
      ServicoVoz.speak("Ative o modo acessibilidade primeiro");
      return;
    }

    if (!ServicoVoz.canRecognizeSpeech()) {
      setIsListening(false);
      ServicoVoz.speak("Reconhecimento de voz indisponÃ­vel neste aplicativo. Use um development build para falar comandos.");
      return;
    }

    if (isListening) {
      ServicoVoz.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    ServicoVoz.speak("Pode falar");

    await ServicoVoz.listen(
      (text) => {
        setLastCommand(text);
        setIsListening(false);
        MotoAssistente.handle(text);
      },
      (error) => {
        console.error("Erro:", error);
        setIsListening(false);
        ServicoVoz.speak("Erro no reconhecimento. Tente novamente.");
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

