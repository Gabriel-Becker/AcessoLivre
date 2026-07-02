import api from '../api/axios';

const BASE_URL_PADRAO = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

function obterBaseApi() {
  return (api.defaults.baseURL?.replace(/\/api\/?$/, '') || BASE_URL_PADRAO.replace(/\/api\/?$/, '') || 'http://localhost:8080').replace(/\/$/, '');
}

export function normalizarUrlImagem(url) {
  if (!url || typeof url !== 'string') return null;

  const bruto = url.trim();
  if (!bruto) return null;

  if (bruto.startsWith('data:')) return bruto;

  const baseApi = obterBaseApi();

  if (bruto.startsWith('http://') || bruto.startsWith('https://')) {
    try {
      const parsed = new URL(bruto);
      if (['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
        return `${baseApi}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return bruto;
    }

    return bruto;
  }

  const caminho = bruto.startsWith('/') ? bruto : `/${bruto}`;
  return `${baseApi}${caminho}`;
}
