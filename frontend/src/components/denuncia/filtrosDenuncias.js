export const filtrosDenuncias = (
  filtroStatus,
  setFiltroStatus,
  filtroTipo,
  setFiltroTipo
) => [
  {
    chave: 'status',
    label: 'Status',
    valor: filtroStatus,
    onSelect: setFiltroStatus,
    opcoes: [
      { value: 'todos', label: 'Todos' },
      { value: 'PENDING', label: 'Pendentes' },
      { value: 'REVIEWED', label: 'Em anÃ¡lise' },
      { value: 'RESOLVED', label: 'Resolvidos' },
      { value: 'REJECTED', label: 'Rejeitados' },
    ],
  },
  {
    chave: 'tipo',
    label: 'Tipo',
    valor: filtroTipo,
    onSelect: setFiltroTipo,
    opcoes: [
      { value: 'todos', label: 'Todos' },
      { value: 'LOCAL', label: 'Locais' },
      { value: 'COMENTARIO', label: 'ComentÃ¡rios' },
      { value: 'AVALIACAO', label: 'AvaliaÃ§Ãµes' },
    ],
  },
];

export const statusOptions = [
  { value: 'PENDING', label: 'Pendente', color: '#FFA500' },
  { value: 'REVIEWED', label: 'Em anÃ¡lise', color: '#3498DB' },
  { value: 'RESOLVED', label: 'Resolvido', color: '#27AE60' },
  { value: 'REJECTED', label: 'Rejeitado', color: '#E74C3C' },
];