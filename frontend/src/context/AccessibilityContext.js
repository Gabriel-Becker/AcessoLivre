import React, { createContext, useState, useEffect } from 'react';
import ServicoVoz from '../services/acessibilidade/ServicoVoz';
import AssistenteVoz from '../services/acessibilidade/AssistenteVoz';
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

  const alternarAcessibilidade = () => {
    setEnabled(!enabled);
  };

  const startListening = async () => {
    if (!enabled) {
      ServicoVoz.speak('Ative o modo de acessibilidade primeiro.');
      return;
    }

    if (!ServicoVoz.canRecognizeSpeech()) {
      setIsListening(false);
      ServicoVoz.speak('Reconhecimento de voz indisponível neste aplicativo. Use um development build para falar comandos.');
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
        AssistenteVoz.handle(text);
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
      alternarAcessibilidade,
      toggle: alternarAcessibilidade,
      isListening,
      startListening,
      lastCommand
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

