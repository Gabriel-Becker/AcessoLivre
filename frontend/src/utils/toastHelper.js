/**
 * Toast Helper - Centraliza exibição de mensagens Toast
 * Baseado no padrão do Inkspiration
 */
import Toast from 'react-native-toast-message';

/**
 * Exibe toast genérico
 * @param {string} type - Tipo do toast (success, error, info, warning)
 * @param {string} title - Título do toast
 * @param {string} message - Mensagem do toast
 * @param {object} options - Opções adicionais
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
 * @param {string} title - Título (opcional)
 */
const showSuccess = (message, title = 'Sucesso') => {
  showToast('success', title, message);
};

/**
 * Exibe toast de erro
 * @param {string} message - Mensagem de erro
 * @param {string} title - Título (opcional)
 */
const showError = (message, title = 'Erro') => {
  showToast('error', title, message);
};

/**
 * Exibe toast de informação
 * @param {string} message - Mensagem informativa
 * @param {string} title - Título (opcional)
 */
const showInfo = (message, title = 'Informação') => {
  showToast('info', title, message);
};

/**
 * Exibe toast de atenção/warning
 * @param {string} message - Mensagem de atenção
 * @param {string} title - Título (opcional)
 */
const showWarning = (message, title = 'Atenção') => {
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
