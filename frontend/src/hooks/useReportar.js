import { useState, useCallback } from 'react';
import ServicoReportar from '../services/ServicoReportar';
import toastHelper from '../utils/toastHelper';

const useReportar = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  const createReport = useCallback(async (data) => {
    let ocultarToastProcessamento;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      ocultarToastProcessamento = toastHelper.showLoading('Enviando sua denúncia para análise...', 'Enviando denúncia');
      // Chamada real para a API
      const response = await ServicoReportar.create(data);
      
      if (response.success) {
        ocultarToastProcessamento?.();
        setSuccess(true);
        toastHelper.showSuccess(response.message || 'Denúncia enviada com sucesso!');
        return true;
      } else {
        ocultarToastProcessamento?.();
        setError(response.message);
        toastHelper.showError(response.message || 'Erro ao enviar denúncia');
        return false;
      }
    } catch (err) {
      ocultarToastProcessamento?.();
      const message = err.message || 'Erro ao enviar denúncia';
      setError(message);
      toastHelper.showError(message);
      return false;
    } finally {
      ocultarToastProcessamento?.();
      setLoading(false);
    }
  }, []);

  const hasUserReported = useCallback(async (tipo, targetId) => {
    try {
      return await ServicoReportar.hasUserReported(tipo, targetId);
    } catch (err) {
      console.error('Erro ao verificar denúncia:', err);
      return false;
    }
  }, []);

  return {
    loading,
    success,
    error,
    reset,
    createReport,
    hasUserReported,
  };
};

export default useReportar;