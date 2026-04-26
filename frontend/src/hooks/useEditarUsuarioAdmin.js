import { useCallback, useState } from 'react';
import AdminService from '../services/AdminService';
import toastHelper from '../utils/toastHelper';

const normalizarRole = (role) => {
  const roleNormalizada = String(role || 'ROLE_USER').trim().toUpperCase();
  return roleNormalizada.startsWith('ROLE_') ? roleNormalizada : `ROLE_${roleNormalizada}`;
};

const resolverMensagemErro = (erro, fallback) => {
  const data = erro?.response?.data;

  if (typeof data === 'string' && data.trim()) return data;

  return (
    data?.mensagem ||
    data?.message ||
    data?.erro ||
    erro?.message ||
    fallback
  );
};

export default function useEditarUsuarioAdmin() {
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const carregarDadosUsuario = useCallback(async (usuarioBase) => {
    if (!usuarioBase?.idUsuario) {
      return null;
    }

    setCarregandoDados(true);
    try {
      const dados = await AdminService.buscarUsuario(usuarioBase.idUsuario);
      return {
        nome: dados?.nome || usuarioBase?.nome || '',
        email: dados?.email || usuarioBase?.email || '',
        role: normalizarRole(dados?.role || usuarioBase?.role),
        imagemPerfil: dados?.imagemPerfil,
      };
    } catch (erro) {
      toastHelper.showError('Não foi possível carregar todos os dados do usuário');
      return {
        nome: usuarioBase?.nome || '',
        email: usuarioBase?.email || '',
        role: normalizarRole(usuarioBase?.role),
        imagemPerfil: usuarioBase?.imagemPerfil,
      };
    } finally {
      setCarregandoDados(false);
    }
  }, []);

  const salvarEdicaoUsuario = useCallback(async ({
    usuarioId,
    values,
    roleOriginal,
    imagemPerfil,
  }) => {
    if (!usuarioId) return false;

    setSubmitting(true);
    try {
      const payload = {
        nome: values.nome,
        email: values.email,
        role: normalizarRole(roleOriginal),
      };

      if (typeof imagemPerfil !== 'undefined') {
        payload.imagemPerfil = imagemPerfil;
      }

      await AdminService.atualizarUsuarioBasico(usuarioId, payload);

      const roleOriginalNormalizada = normalizarRole(roleOriginal);
      const roleNovaNormalizada = normalizarRole(values.role || roleOriginal);

      if (roleNovaNormalizada !== roleOriginalNormalizada) {
        await AdminService.alterarRoleUsuario(usuarioId, roleNovaNormalizada);
      }

      const novaSenha = typeof values?.senha === 'string' ? values.senha.trim() : '';
      if (novaSenha) {
        await AdminService.alterarSenhaUsuario(usuarioId, novaSenha);
      }

      toastHelper.showSuccess('Usuário atualizado com sucesso');
      return true;
    } catch (erro) {
      toastHelper.showError(resolverMensagemErro(erro, 'Erro ao atualizar usuário'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    carregandoDados,
    submitting,
    carregarDadosUsuario,
    salvarEdicaoUsuario,
  };
}
