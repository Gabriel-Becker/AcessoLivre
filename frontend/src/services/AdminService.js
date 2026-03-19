import api from '../api/axios';

const AdminService = {
  async listarUsuarios({ page = 0, size = 8, sort = 'dataCadastro' } = {}) {
    const response = await api.get('/admin/usuarios', {
      params: { page, size, sort },
    });
    return response.data;
  },

  async listarLocais({ page = 0, size = 8, sort = 'nome' } = {}) {
    const response = await api.get('/locais', {
      params: { page, size, sort },
    });
    return response.data;
  },

  async obterEstatisticasGerais() {
    const response = await api.get('/admin/relatorios/estatisticas-gerais');
    return response.data;
  },
};

export default AdminService;
