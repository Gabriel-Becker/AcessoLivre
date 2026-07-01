export const CATEGORIAS_LABELS = {
  COMERCIAL: 'Comercial',
  PUBLICO: 'Pï¿½blico',
  SAUDE: 'Saï¿½de',
  EDUCACAO: 'Educaï¿½ï¿½o',
  LAZER: 'Lazer',
  TRANSPORTE: 'Transporte',
  ALIMENTACAO: 'Alimentaï¿½ï¿½o',
  HOSPEDAGEM: 'Hospedagem',
  SERVICOS: 'Serviï¿½os',
};

export const STATUS_LOCAL_OPCOES = [
  { label: 'Em anï¿½lise', value: 'EM_ANALISE' },
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Inativo', value: 'INATIVO' },
  { label: 'Reportado', value: 'REPORTADO' },
];

export const RECURSOS_ACESSIBILIDADE = [
  { id: 'rampa', titulo: 'Rampa de acesso', descricao: 'Rampa para cadeira de rodas na entrada', icon: 'walk-outline', cor: 'rampa', enumValue: 'RAMPA' },
  { id: 'banheiro', titulo: 'Banheiro adaptado', descricao: 'Banheiro com acessibilidade para PcD', icon: 'man-outline', cor: 'banheiro', enumValue: 'BANHEIRO_ADAPTADO' },
  { id: 'elevador', titulo: 'Elevador acessï¿½vel', descricao: 'Elevador funcionando com botï¿½es em braille', icon: 'business-outline', cor: 'elevador', enumValue: 'ELEVADOR' },
  { id: 'piso', titulo: 'Piso tï¿½til', descricao: 'Piso com textura para orientaï¿½ï¿½o', icon: 'trail-sign-outline', cor: 'audiovisual', enumValue: 'PISO_TATIL' },
  { id: 'braille', titulo: 'Sinalizaï¿½ï¿½o em braille', descricao: 'Placas e informaï¿½ï¿½es em braille', icon: 'eye-outline', cor: 'braile', enumValue: 'SINALIZACAO_BRAILLE' },
  { id: 'estacionamento', titulo: 'Estacionamento acessï¿½vel', descricao: 'Vagas reservadas para PcD', icon: 'car-outline', cor: 'estacionamento', enumValue: 'ESTACIONAMENTO' },
  { id: 'espaco', titulo: 'Espaï¿½o amplo', descricao: 'Corredores largos para circulaï¿½ï¿½o', icon: 'resize-outline', cor: 'secondary', enumValue: 'ESPACO_AMPLO' },
  { id: 'audiovisual', titulo: 'Recursos audiovisuais', descricao: 'Sistemas de som e sinalizaï¿½ï¿½o visual', icon: 'volume-high-outline', cor: 'audiovisual', enumValue: 'RECURSOS_AUDIOVISUAIS' },
  { id: 'atendimento', titulo: 'Atendimento especializado', descricao: 'Staff treinado para atender PcD', icon: 'heart-outline', cor: 'secondary', enumValue: 'ATENDIMENTO_ESPECIALIZADO' },
  { id: 'mobiliario', titulo: 'Mobiliï¿½rio adaptado', descricao: 'Mesas, balcï¿½es e assentos adaptados', icon: 'grid-outline', cor: 'primary', enumValue: 'MOBILIARIO_ADAPTADO' },
];

export const obterCategoriaLabel = (categoria) => CATEGORIAS_LABELS[categoria] || categoria || 'Sem categoria';

export const obterStatusLabel = (status) => {
  const statusNormalizado = String(status || '').trim().toUpperCase();

  switch (statusNormalizado) {
    case 'ATIVO':
      return 'Ativo';
    case 'INATIVO':
      return 'Inativo';
    case 'REPORTADO':
      return 'Reportado';
    case 'EM_ANALISE':
    default:
      return 'Em anï¿½lise';
  }
};

export const obterTipoEtiquetaStatus = (status) => {
  const statusNormalizado = String(status || '').trim().toUpperCase();

  switch (statusNormalizado) {
    case 'ATIVO':
      return 'sucesso';
    case 'INATIVO':
      return 'neutro';
    case 'REPORTADO':
      return 'perigo';
    case 'EM_ANALISE':
    default:
      return 'aviso';
  }
};