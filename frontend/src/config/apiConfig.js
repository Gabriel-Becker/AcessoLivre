import { Platform } from 'react-native';
import {
  ENVIRONMENT,
  WEB_API_URL,
  ANDROID_API_URL,
  IOS_API_URL,
  PROD_API_URL
} from '@env';

function getApiUrl() {
  if (ENVIRONMENT === 'prod' && PROD_API_URL) {
    return PROD_API_URL;
  }

  if (Platform.OS === 'android' && ANDROID_API_URL) {
    return ANDROID_API_URL;
  }

  if (Platform.OS === 'ios' && IOS_API_URL) {
    return IOS_API_URL;
  }

  if (WEB_API_URL) {
    return WEB_API_URL;
  }

  return __DEV__ 
    ? 'http://localhost:8080/api'
    : 'https://api.acessolivre.com/api';
}

const resolvedUrl = getApiUrl();

export const API_CONFIG = {
  BASE_URL: resolvedUrl,
  TIMEOUT: 30000,
};

