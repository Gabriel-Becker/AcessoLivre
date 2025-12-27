import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../config/theme';

const THEME_PREF_KEY = 'preferenciaTemaAltoContraste';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    carregarPreferencia();
  }, []);

  const carregarPreferencia = async () => {
    try {
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
      await AsyncStorage.setItem(THEME_PREF_KEY, novoValor ? 'true' : 'false');
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
