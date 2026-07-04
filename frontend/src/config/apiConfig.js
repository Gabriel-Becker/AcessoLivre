import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Platform } from 'react-native';
import {
  WEB_API_URL,
  ANDROID_API_URL,
  IOS_API_URL,
  PROD_API_URL
} from '@env';

const CACHE_KEY_BASE_URL = 'acessolivre:baseUrlApi';

const normalizarBaseUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return url.trim().replace(/\/+$/, '');
};

const montarEndpointTeste = (baseUrl) => `${normalizarBaseUrl(baseUrl)}/locais/todos?page=0&size=1`;

const obterCandidatosIniciais = () => {
  const candidatos = [];

  if (WEB_API_URL) candidatos.push(normalizarBaseUrl(WEB_API_URL));

  if (Platform.OS === 'android' && ANDROID_API_URL) candidatos.push(normalizarBaseUrl(ANDROID_API_URL));
  if (Platform.OS === 'ios' && IOS_API_URL) candidatos.push(normalizarBaseUrl(IOS_API_URL));

  if (PROD_API_URL) candidatos.push(normalizarBaseUrl(PROD_API_URL));

  if (!candidatos.length) {
    candidatos.push(
      Platform.OS === 'web'
        ? 'http://localhost:8080/api'
        : 'http://18.226.60.23:8080/api'
    );
  }

  return [...new Set(candidatos.filter(Boolean))];
};

const getApiUrl = () => {
  if (Platform.OS === 'web' && WEB_API_URL) {
    return normalizarBaseUrl(WEB_API_URL);
  }

  if (Platform.OS !== 'web') {
    return normalizarBaseUrl(PROD_API_URL || ANDROID_API_URL || IOS_API_URL || 'http://18.226.60.23:8080/api');
  }

  return normalizarBaseUrl(WEB_API_URL || 'http://localhost:8080/api');
};

let baseUrlResolvidaEmMemoria = null;
let promessaResolucao = null;

const testarBaseUrl = async (baseUrl, timeoutMs = 1400) => {
  const url = montarEndpointTeste(baseUrl);
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller?.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const descobrirBaseUrlNaRedeLocal = async () => {
  if (Platform.OS === 'web') return null;

  try {
    const ipDispositivo = await Network.getIpAddressAsync();
    if (!ipDispositivo || !/^\d+\.\d+\.\d+\.\d+$/.test(ipDispositivo)) {
      return null;
    }

    const partes = ipDispositivo.split('.');
    const prefixo = `${partes[0]}.${partes[1]}.${partes[2]}.`;

    const lote = 20;
    for (let inicio = 1; inicio <= 254; inicio += lote) {
      const candidatos = [];
      for (let host = inicio; host < Math.min(inicio + lote, 255); host += 1) {
        candidatos.push(`${prefixo}${host}:8080/api`);
      }

      const resultados = await Promise.allSettled(candidatos.map((candidate) => testarBaseUrl(candidate)));
      for (let indice = 0; indice < resultados.length; indice += 1) {
        const resultado = resultados[indice];
        if (resultado.status === 'fulfilled' && resultado.value) {
          return candidatos[indice];
        }
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const limparCacheBaseUrl = async () => {
  baseUrlResolvidaEmMemoria = null;
  promessaResolucao = null;

  try {
    await AsyncStorage.removeItem(CACHE_KEY_BASE_URL);
  } catch {
    // ignore
  }
};

export const resolverBaseUrlApi = async ({ forcarAtualizacao = false } = {}) => {
  if (Platform.OS === 'web') {
    return getApiUrl();
  }

  if (!forcarAtualizacao && baseUrlResolvidaEmMemoria) {
    return baseUrlResolvidaEmMemoria;
  }

  if (promessaResolucao && !forcarAtualizacao) {
    return promessaResolucao;
  }

  promessaResolucao = (async () => {
    try {
      if (!forcarAtualizacao) {
        const baseUrlCache = normalizarBaseUrl(await AsyncStorage.getItem(CACHE_KEY_BASE_URL));
        if (baseUrlCache && (await testarBaseUrl(baseUrlCache))) {
          baseUrlResolvidaEmMemoria = baseUrlCache;
          return baseUrlCache;
        }
      }

      const candidatos = obterCandidatosIniciais();
      for (const candidato of candidatos) {
        if (await testarBaseUrl(candidato)) {
          baseUrlResolvidaEmMemoria = candidato;
          await AsyncStorage.setItem(CACHE_KEY_BASE_URL, candidato);
          return candidato;
        }
      }

      const descobertaAutomatica = await descobrirBaseUrlNaRedeLocal();
      if (descobertaAutomatica) {
        baseUrlResolvidaEmMemoria = descobertaAutomatica;
        await AsyncStorage.setItem(CACHE_KEY_BASE_URL, descobertaAutomatica);
        return descobertaAutomatica;
      }

      const fallback = getApiUrl();
      baseUrlResolvidaEmMemoria = fallback;
      await AsyncStorage.setItem(CACHE_KEY_BASE_URL, fallback);
      return fallback;
    } finally {
      promessaResolucao = null;
    }
  })();

  return promessaResolucao;
}

const resolvedUrl = getApiUrl();

export const API_CONFIG = {
  BASE_URL: resolvedUrl,
  TIMEOUT: 30000,
};

