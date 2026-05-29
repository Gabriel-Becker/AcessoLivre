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

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(true);

  useEffect(() => {
    carregarPreferencia();
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
      console.error('Erro ao carregar preferência de tema:', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const novoValor = !isHighContrast;
      setIsHighContrast(novoValor);
      // Persiste em AsyncStorage e localStorage (se disponível) e cookie para web
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
      console.error('Erro ao salvar preferência de tema:', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isHighContrast,
        theme: getTheme(isHighContrast),
        toggleTheme,
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
