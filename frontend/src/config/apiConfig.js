/**
 * Configuração da API do AcessoLivre
 * 
 * Define a URL base e timeout para requisições HTTP
 * __DEV__ detecta automaticamente ambiente de desenvolvimento
 */

export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:8080/api'  // Desenvolvimento local
    : 'https://api.acessolivre.com/api',  // Produção (ajustar quando deploy)
  TIMEOUT: 30000, // 30 segundos
};
