import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../config/theme';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function getCookie(name) {
  try {
    if (!isBrowser) return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  } catch (e) {
    return null;
  }
}

function setCookie(name, value, days = 365) {
  try {
    if (!isBrowser) return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  } catch (e) {
    // ignore
  }
}

const THEME_PREF_KEY = 'preferenciaTemaAltoContraste';
const FONT_SIZE_PREF_KEY = 'preferenciaTamanhoFonte';

function normalizarEscalaFonte(valor) {
  const escala = Number.parseFloat(String(valor));
  if (escala === 1 || escala === 1.5 || escala === 2) {
    return escala;
  }

  return 1;
}

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(true);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  useEffect(() => {
    carregarPreferencia();
    carregarPreferenciaFonte();
  }, []);

  const carregarPreferencia = async () => {
    try {
      // Prioriza localStorage (web), depois cookie, depois AsyncStorage (native)
      if (isBrowser) {
        const ls = window.localStorage.getItem(THEME_PREF_KEY);
        if (ls !== null) {
          setIsHighContrast(ls === 'true');
          return;
        }
        const c = getCookie(THEME_PREF_KEY);
        if (c !== null) {
          setIsHighContrast(c === 'true');
          return;
        }
      }

      const valor = await AsyncStorage.getItem(THEME_PREF_KEY);
      if (valor !== null) {
        setIsHighContrast(valor === 'true');
      }
    } catch (e) {
      console.error('Erro ao carregar preferÃªncia de tema:', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const novoValor = !isHighContrast;
      setIsHighContrast(novoValor);
      // Persiste em AsyncStorage e localStorage (se disponÃ­vel) e cookie para web
      await AsyncStorage.setItem(THEME_PREF_KEY, novoValor ? 'true' : 'false');
      try {
        if (isBrowser) {
          window.localStorage.setItem(THEME_PREF_KEY, novoValor ? 'true' : 'false');
          setCookie(THEME_PREF_KEY, novoValor ? 'true' : 'false');
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Erro ao salvar preferÃªncia de tema:', e);
    }
  };

  const carregarPreferenciaFonte = async () => {
    try {
      if (isBrowser) {
        const ls = window.localStorage.getItem(FONT_SIZE_PREF_KEY);
        if (ls !== null) {
          setFontSizeMultiplier(normalizarEscalaFonte(ls));
          return;
        }

        const c = getCookie(FONT_SIZE_PREF_KEY);
        if (c !== null) {
          setFontSizeMultiplier(normalizarEscalaFonte(c));
          return;
        }
      }

      const valor = await AsyncStorage.getItem(FONT_SIZE_PREF_KEY);
      if (valor !== null) {
        setFontSizeMultiplier(normalizarEscalaFonte(valor));
      }
    } catch (e) {
      console.error('Erro ao carregar preferÃªncia de tamanho de fonte:', e);
    }
  };

  const alterarTamanhoFonte = async (novoValor) => {
    try {
      const valorNormalizado = normalizarEscalaFonte(novoValor);
      setFontSizeMultiplier(valorNormalizado);
      await AsyncStorage.setItem(FONT_SIZE_PREF_KEY, String(valorNormalizado));

      try {
        if (isBrowser) {
          const valorTexto = String(valorNormalizado);
          window.localStorage.setItem(FONT_SIZE_PREF_KEY, valorTexto);
          setCookie(FONT_SIZE_PREF_KEY, valorTexto);
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Erro ao salvar preferÃªncia de tamanho de fonte:', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isHighContrast,
        fontSizeMultiplier,
        theme: getTheme(isHighContrast, fontSizeMultiplier),
        toggleTheme,
        alterarTamanhoFonte,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext deve ser usado dentro de ThemeProvider');
  return ctx;
};

export default ThemeContext;
