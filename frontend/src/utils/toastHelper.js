/**
 * Toast Helper - Centraliza exibiï¿½ï¿½o de mensagens Toast
 * Baseado no padrï¿½o do Inkspiration
 */
import Toast from 'react-native-toast-message';

/**
 * Exibe toast genï¿½rico
 * @param {string} type - Tipo do toast (success, error, info, warning)
 * @param {string} title - Tï¿½tulo do toast
 * @param {string} message - Mensagem do toast
 * @param {object} options - Opï¿½ï¿½es adicionais
 */
export const showToast = (type, title, message, options = {}) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    bottomOffset: 50,
    visibilityTime: 4000,
    ...options,
  });
};

/**
 * Exibe toast de sucesso
 * @param {string} message - Mensagem de sucesso
 * @param {string} title - Tï¿½tulo (opcional)
 */
const showSuccess = (message, title = 'Sucesso') => {
  showToast('success', title, message);
};

/**
 * Exibe toast de erro
 * @param {string} message - Mensagem de erro
 * @param {string} title - Tï¿½tulo (opcional)
 */
const showError = (message, title = 'Erro') => {
  showToast('error', title, message);
};

/**
 * Exibe toast de informaï¿½ï¿½o
 * @param {string} message - Mensagem informativa
 * @param {string} title - Tï¿½tulo (opcional)
 */
const showInfo = (message, title = 'Informaï¿½ï¿½o') => {
  showToast('info', title, message);
};

/**
 * Exibe toast de atenï¿½ï¿½o/warning
 * @param {string} message - Mensagem de atenï¿½ï¿½o
 * @param {string} title - Tï¿½tulo (opcional)
 */
const showWarning = (message, title = 'Atenï¿½ï¿½o') => {
  showToast('warning', title, message);
};

const toastHelper = {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showToast,
};

export default toastHelper;
