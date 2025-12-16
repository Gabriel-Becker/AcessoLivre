export const defaultTheme = {
  // Cores principais
  colors: {
    // Primária (azul institucional)
    primary: '#4A90E2',
    primaryLight: '#6BA3E8',
    primaryDark: '#3A7BC8',
    
    // Secundária (acentos)
    secondary: '#2ECC71',
    secondaryLight: '#58D68D',
    secondaryDark: '#27AE60',
    
    // Estados e feedback
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
    
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#E9ECEF',
    
    // Superfícies (cards, modais)
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    
    // Texto
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    
    // Bordas
    border: '#DEE2E6',
    borderLight: '#E9ECEF',
    borderDark: '#CED4DA',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    
    // Sombras
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
    
    // Badges de acessibilidade (cores específicas do projeto)
    accessibility: {
      rampa: '#4A90E2',
      elevador: '#9B59B6',
      banheiro: '#3498DB',
      estacionamento: '#E67E22',
      audiovisual: '#16A085',
      braile: '#8E44AD',
    },
  },
  
  // Tipografia
  typography: {
    // Tamanhos de fonte
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    
    // Pesos de fonte
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Alturas de linha
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Espaçamentos (padrão 8px)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Raios de borda
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  
  // Sombras (elevação)
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 12,
    },
  },
};

export const highContrastTheme = {
  colors: {
    // Primária (azul mais escuro e saturado)
    primary: '#0056B3',
    primaryLight: '#1E6BB8',
    primaryDark: '#003D82',
    
    // Secundária (verde mais escuro)
    secondary: '#1E7E34',
    secondaryLight: '#28A745',
    secondaryDark: '#155724',
    
    // Estados e feedback (cores mais fortes)
    success: '#155724',
    warning: '#D68910',
    error: '#C0341D',
    info: '#004085',
    
    // Backgrounds (preto com contraste extremo)
    background: '#000000',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#2D2D2D',
    
    // Superfícies
    surface: '#1A1A1A',
    surfaceSecondary: '#2D2D2D',
    
    // Texto (branco puro para máximo contraste)
    textPrimary: '#FFFFFF',
    textSecondary: '#E0E0E0',
    textTertiary: '#B0B0B0',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    
    // Bordas (contraste aumentado)
    border: '#FFFFFF',
    borderLight: '#E0E0E0',
    borderDark: '#FFFFFF',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.85)',
    overlayLight: 'rgba(0, 0, 0, 0.7)',
    
    // Sombras (desativadas em alto contraste)
    shadow: 'transparent',
    shadowDark: 'transparent',
    
    // Badges de acessibilidade (cores ajustadas para alto contraste)
    accessibility: {
      rampa: '#1E90FF',
      elevador: '#BA55D3',
      banheiro: '#00BFFF',
      estacionamento: '#FF8C00',
      audiovisual: '#20B2AA',
      braile: '#DA70D6',
    },
  },
  
  // Tipografia (mesma estrutura, pode aumentar tamanhos se necessário)
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Espaçamentos (iguais ao padrão)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Raios de borda
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  
  // Sombras desativadas em alto contraste (foca em bordas)
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    md: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    lg: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xl: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
};

export const theme = defaultTheme;

export const getTheme = (isHighContrast = false) => {
  return isHighContrast ? highContrastTheme : defaultTheme;
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

export default theme;
