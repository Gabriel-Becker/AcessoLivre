export const CATEGORIAS_LABELS = {
  COMERCIAL: 'Comercial',
  PUBLICO: 'Público',
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  LAZER: 'Lazer',
  TRANSPORTE: 'Transporte',
  ALIMENTACAO: 'Alimentação',
  HOSPEDAGEM: 'Hospedagem',
  SERVICOS: 'Serviços',
};

export const STATUS_LOCAL_OPCOES = [
  { label: 'Em análise', value: 'EM_ANALISE' },
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Inativo', value: 'INATIVO' },
  { label: 'Reportado', value: 'REPORTADO' },
];

export const RECURSOS_ACESSIBILIDADE = [
  { id: 'rampa', titulo: 'Rampa de acesso', descricao: 'Rampa para cadeira de rodas na entrada', icon: 'walk-outline', cor: 'rampa', enumValue: 'RAMPA' },
  { id: 'banheiro', titulo: 'Banheiro adaptado', descricao: 'Banheiro com acessibilidade para pessoa com deficiência', icon: 'man-outline', cor: 'banheiro', enumValue: 'BANHEIRO_ADAPTADO' },
  { id: 'elevador', titulo: 'Elevador acessível', descricao: 'Elevador funcionando com botões em Braille', icon: 'business-outline', cor: 'elevador', enumValue: 'ELEVADOR' },
  { id: 'piso', titulo: 'Piso tátil', descricao: 'Piso com textura para orientação', icon: 'trail-sign-outline', cor: 'audiovisual', enumValue: 'PISO_TATIL' },
  { id: 'braille', titulo: 'Sinalização em Braille', descricao: 'Placas e informações em Braille', icon: 'eye-outline', cor: 'braile', enumValue: 'SINALIZACAO_BRAILLE' },
  { id: 'estacionamento', titulo: 'Estacionamento acessível', descricao: 'Vagas reservadas para pessoa com deficiência', icon: 'car-outline', cor: 'estacionamento', enumValue: 'ESTACIONAMENTO' },
  { id: 'espaco', titulo: 'Espaço amplo', descricao: 'Corredores largos para circulação', icon: 'resize-outline', cor: 'secondary', enumValue: 'ESPACO_AMPLO' },
  { id: 'audiovisual', titulo: 'Recursos audiovisuais', descricao: 'Sistemas de som e sinalização visual', icon: 'volume-high-outline', cor: 'audiovisual', enumValue: 'RECURSOS_AUDIOVISUAIS' },
  { id: 'atendimento', titulo: 'Atendimento especializado', descricao: 'Equipe treinada para atender pessoa com deficiência', icon: 'heart-outline', cor: 'secondary', enumValue: 'ATENDIMENTO_ESPECIALIZADO' },
  { id: 'mobiliario', titulo: 'Mobiliário adaptado', descricao: 'Mesas, balcões e assentos adaptados', icon: 'grid-outline', cor: 'primary', enumValue: 'MOBILIARIO_ADAPTADO' },
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
      return 'Em análise';
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