import api from '../api/axios';

const AdminService = {
  async listarUsuarios({ page = 0, size = 8, sort = 'dataCadastro', direction = 'DESC', ativo = true } = {}) {
    const response = await api.get('/admin/usuarios', {
      params: { page, size, sort, direction, ativo },
    });
    return response.data;
  },

  async listarLocais({ page = 0, size = 8, sort = 'nome' } = {}) {
    const response = await api.get('/locais/todos', {
      params: { page, size, sort },
    });
    return response.data;
  },

  async obterEstatisticasGerais() {
    const response = await api.get('/admin/relatorios/estatisticas-gerais');
    return response.data;
  },

  async obterRelatorioUsuarios({ dataInicio, dataFim } = {}) {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    const response = await api.get('/admin/relatorios/usuarios', { params });
    return response.data;
  },

  async obterRelatorioLocais({ dataInicio, dataFim } = {}) {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    const response = await api.get('/admin/relatorios/locais', { params });
    return response.data;
  },

  async exportarRelatorioUsuariosCsv({ dataInicio, dataFim } = {}) {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    return api.get('/admin/relatorios/exportar/usuarios/csv', {
      params,
      responseType: 'blob',
    });
  },

  async exportarRelatorioUsuariosPdf({ dataInicio, dataFim } = {}) {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    return api.get('/admin/relatorios/exportar/usuarios/pdf', {
      params,
      responseType: 'blob',
    });
  },

  async exportarRelatorioLocaisCsv({ dataInicio, dataFim } = {}) {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    return api.get('/admin/relatorios/exportar/locais/csv', {
      params,
      responseType: 'blob',
    });
  },

  async exportarRelatorioLocaisPdf({ dataInicio, dataFim } = {}) {
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    return api.get('/admin/relatorios/exportar/locais/pdf', {
      params,
      responseType: 'blob',
    });
  },

  async alterarRoleUsuario(idUsuario, novaRole) {
    const response = await api.put(`/admin/usuarios/${idUsuario}/role`, {
      novaRole,
    });
    return response.data;
  },

  async alterarSenhaUsuario(idUsuario, novaSenha) {
    const response = await api.put(`/admin/usuarios/${idUsuario}/senha`, {
      novaSenha,
    });
    return response.data;
  },

  async deletarUsuario(idUsuario) {
    const response = await api.delete(`/admin/usuarios/${idUsuario}`);
    return response.data;
  },

  async reativarUsuario(idUsuario) {
    const response = await api.put(`/admin/usuarios/${idUsuario}/reativar`);
    return response.data;
  },

  async buscarUsuario(idUsuario) {
    const response = await api.get(`/usuarios/${idUsuario}`);
    return response.data;
  },

  async atualizarUsuarioBasico(idUsuario, dados) {
    const response = await api.put(`/usuarios/${idUsuario}`, dados);
    return response.data;
  },
};

export default AdminService;
