/**
 * Opções padrão de filtro para Perfil de usuários
 */
export const opcoesRoleUsuarios = [
  { label: 'Todas as roles', value: 'todos' },
  { label: 'Administrador', value: 'ROLE_ADMIN' },
  { label: 'Usuário', value: 'ROLE_USER' },
];

/**
 * Opções padrão de filtro para Status de usuários
 */
export const opcoesStatusUsuarios = [
  { label: 'Todos os status', value: 'todos' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Inativos', value: 'inativo' },
];

/**
 * Configuração dos filtros para usuários
 * Recebe callbacks de setter para estado
 */
export const filtrosUsuarios = (filtroRole, setFiltroRole, filtroStatus, setFiltroStatus) => [
  {
    chave: 'role',
    label: 'Perfil',
    valor: filtroRole,
    opcoes: opcoesRoleUsuarios,
    onSelect: setFiltroRole,
  },
  {
    chave: 'status',
    label: 'Status',
    valor: filtroStatus,
    opcoes: opcoesStatusUsuarios,
    onSelect: setFiltroStatus,
  },
];

/**
 * Gera opções de filtro de Categoria dinamicamente a partir dos locais
 */
export const gerarOpcoesCategoriaLocais = (locais) => {
  const categorias = Array.from(
    new Set(locais.map((item) => item?.categoria?.nome).filter(Boolean))
  );

  return [
    { label: 'Todas as categorias', value: 'todos' },
    ...categorias.map((categoria) => ({ label: categoria, value: categoria })),
  ];
};

/**
 * Configuração dos filtros para locais
 * Recebe callback de setter e lista de locais para gerar opções
 */
export const filtrosLocais = (filtroCategoria, setFiltroCategoria, locais) => [
  {
    chave: 'categoria',
    label: 'Categoria',
    valor: filtroCategoria,
    opcoes: gerarOpcoesCategoriaLocais(locais),
    onSelect: setFiltroCategoria,
  },
];
