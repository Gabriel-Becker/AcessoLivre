export const filtrosDenuncias = (filtroStatus, setFiltroStatus, filtroTipo, setFiltroTipo) => [
  {
    chave: 'status',
    label: 'Status',
    opcoes: [
      { valor: 'todos', label: 'Todos' },
      { valor: 'PENDING', label: 'Pendentes' },
      { valor: 'REVIEWED', label: 'Em análise' },
      { valor: 'RESOLVED', label: 'Resolvidos' },
      { valor: 'REJECTED', label: 'Rejeitados' },
    ],
    valor: filtroStatus,
    onSelect: setFiltroStatus,
  },
  {
    chave: 'tipo',
    label: 'Tipo',
    opcoes: [
      { valor: 'todos', label: 'Todos' },
      { valor: 'LOCAL', label: 'Locais' },
      { valor: 'COMENTARIO', label: 'Comentários' },
      { valor: 'AVALIACAO', label: 'Avaliações' },
    ],
    valor: filtroTipo,
    onSelect: setFiltroTipo,
  },
];

export const statusOptions = [
  { value: 'PENDING', label: 'Pendente', color: '#FFA500' },
  { value: 'REVIEWED', label: 'Em análise', color: '#3498DB' },
  { value: 'RESOLVED', label: 'Resolvido', color: '#27AE60' },
  { value: 'REJECTED', label: 'Rejeitado', color: '#E74C3C' },
];