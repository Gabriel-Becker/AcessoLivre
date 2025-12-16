export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:8080/api'
    : 'https://api.acessolivre.com/api',
  TIMEOUT: 30000,
};
