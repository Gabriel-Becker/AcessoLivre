export const REPORTAR_TIPOS = {
  LOCAL: 'LOCAL',
  COMENTARIO: 'COMENTARIO',
  AVALIACAO: 'AVALIACAO',
  USUARIO: 'USUARIO',
};

export const REPORTAR_MOTIVOS = {
  LOCAL: [
    { id: 'INFORMACAO_INCORRETA', label: 'Informação incorreta', description: 'Algum dado do local está errado' },
    { id: 'RECURSO_INEXISTENTE', label: 'Recurso de acessibilidade não existe', description: 'Um recurso informado não está disponível' },
    { id: 'RECURSO_QUEBRADO', label: 'Recurso de acessibilidade não funciona', description: 'Um recurso existe, mas não está funcionando' },
    { id: 'LOCAL_FECHADO', label: 'Local fechado', description: 'O local está fechado permanentemente' },
    { id: 'OUTRO', label: 'Outro problema', description: 'Descreva o problema que você encontrou' },
  ],
  COMENTARIO: [
    { id: 'PRECONCEITO', label: 'Preconceito', description: 'Comentário com conteúdo preconceituoso' },
    { id: 'DISCURSO_ODIO', label: 'Discurso de ódio', description: 'Incitamento ao ódio ou violência' },
    { id: 'CONTEUDO_OFENSIVO', label: 'Conteúdo ofensivo', description: 'Linguagem ofensiva ou agressiva' },
    { id: 'ASSEDIO', label: 'Assédio', description: 'Comportamento de assédio' },
    { id: 'SPAM', label: 'Spam', description: 'Conteúdo promocional ou repetitivo' },
    { id: 'INFORMACAO_FALSA', label: 'Informação falsa', description: 'Informação incorreta ou enganosa' },
    { id: 'OUTRO', label: 'Outro', description: 'Outro tipo de problema' },
  ],
  AVALIACAO: [
    { id: 'PRECONCEITO', label: 'Preconceito', description: 'Avaliação com conteúdo preconceituoso' },
    { id: 'CONTEUDO_OFENSIVO', label: 'Conteúdo ofensivo', description: 'Linguagem ofensiva ou agressiva' },
    { id: 'ASSEDIO', label: 'Assédio', description: 'Comportamento de assédio' },
    { id: 'SPAM', label: 'Spam', description: 'Avaliação falsa ou repetitiva' },
    { id: 'INFORMACAO_FALSA', label: 'Informação falsa', description: 'Informação incorreta sobre o local' },
    { id: 'OUTRO', label: 'Outro', description: 'Outro tipo de problema' },
  ],
};

export const REPORTAR_MOTIVOS_LIST = [
  { id: 'PRECONCEITO', label: 'Preconceito', icon: 'hand-left-outline' },
  { id: 'DISCURSO_ODIO', label: 'Discurso de ódio', icon: 'megaphone-outline' },
  { id: 'CONTEUDO_OFENSIVO', label: 'Conteúdo ofensivo', icon: 'alert-circle-outline' },
  { id: 'ASSEDIO', label: 'Assédio', icon: 'warning-outline' },
  { id: 'SPAM', label: 'Spam', icon: 'mail-outline' },
  { id: 'INFORMACAO_FALSA', label: 'Informação falsa', icon: 'information-circle-outline' },
  { id: 'OUTRO', label: 'Outro', icon: 'ellipsis-horizontal-outline' },
];

export const getMotivosByTipo = (tipo) => {
  switch (tipo) {
    case REPORTAR_TIPOS.LOCAL:
      return REPORTAR_MOTIVOS.LOCAL;
    case REPORTAR_TIPOS.COMENTARIO:
      return REPORTAR_MOTIVOS.COMENTARIO;
    case REPORTAR_TIPOS.AVALIACAO:
      return REPORTAR_MOTIVOS.AVALIACAO;
    default:
      return REPORTAR_MOTIVOS_LIST;
  }
};