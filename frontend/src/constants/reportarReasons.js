export const REPORTAR_TIPOS = {
  LOCAL: 'LOCAL',
  COMENTARIO: 'COMENTARIO',
  AVALIACAO: 'AVALIACAO',
  USUARIO: 'USUARIO',
};

export const REPORTAR_MOTIVOS = {
  LOCAL: [
    { id: 'INFORMACAO_INCORRETA', label: 'Informaï¿½ï¿½o incorreta', description: 'Algum dado do local estï¿½ errado' },
    { id: 'RECURSO_INEXISTENTE', label: 'Recurso de acessibilidade nï¿½o existe', description: 'Um recurso informado nï¿½o estï¿½ disponï¿½vel' },
    { id: 'RECURSO_QUEBRADO', label: 'Recurso de acessibilidade nï¿½o funciona', description: 'Um recurso existe, mas nï¿½o estï¿½ funcionando' },
    { id: 'LOCAL_FECHADO', label: 'Local fechado', description: 'O local estï¿½ fechado permanentemente' },
    { id: 'OUTRO', label: 'Outro problema', description: 'Descreva o problema que vocï¿½ encontrou' },
  ],
  COMENTARIO: [
    { id: 'PRECONCEITO', label: 'Preconceito', description: 'Comentï¿½rio com conteï¿½do preconceituoso' },
    { id: 'DISCURSO_ODIO', label: 'Discurso de ï¿½dio', description: 'Incitamento ao ï¿½dio ou violï¿½ncia' },
    { id: 'CONTEUDO_OFENSIVO', label: 'Conteï¿½do ofensivo', description: 'Linguagem ofensiva ou agressiva' },
    { id: 'ASSEDIO', label: 'Assï¿½dio', description: 'Comportamento de assï¿½dio' },
    { id: 'SPAM', label: 'Spam', description: 'Conteï¿½do promocional ou repetitivo' },
    { id: 'INFORMACAO_FALSA', label: 'Informaï¿½ï¿½o falsa', description: 'Informaï¿½ï¿½o incorreta ou enganosa' },
    { id: 'OUTRO', label: 'Outro', description: 'Outro tipo de problema' },
  ],
  AVALIACAO: [
    { id: 'PRECONCEITO', label: 'Preconceito', description: 'Avaliaï¿½ï¿½o com conteï¿½do preconceituoso' },
    { id: 'CONTEUDO_OFENSIVO', label: 'Conteï¿½do ofensivo', description: 'Linguagem ofensiva ou agressiva' },
    { id: 'ASSEDIO', label: 'Assï¿½dio', description: 'Comportamento de assï¿½dio' },
    { id: 'SPAM', label: 'Spam', description: 'Avaliaï¿½ï¿½o falsa ou repetitiva' },
    { id: 'INFORMACAO_FALSA', label: 'Informaï¿½ï¿½o falsa', description: 'Informaï¿½ï¿½o incorreta sobre o local' },
    { id: 'OUTRO', label: 'Outro', description: 'Outro tipo de problema' },
  ],
};

export const getMotivosByTipo = (tipo) => {
  switch (tipo) {
    case REPORTAR_TIPOS.LOCAL:
      return REPORTAR_MOTIVOS.LOCAL;
    case REPORTAR_TIPOS.COMENTARIO:
      return REPORTAR_MOTIVOS.COMENTARIO;
    case REPORTAR_TIPOS.AVALIACAO:
      return REPORTAR_MOTIVOS.AVALIACAO;
    default:
      return REPORTAR_MOTIVOS.LOCAL;
  }
};