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

export const CATEGORIAS_ICONES = {
  COMERCIAL: 'storefront-outline',
  PUBLICO: 'business-outline',
  SAUDE: 'medkit-outline',
  EDUCACAO: 'school-outline',
  LAZER: 'football-outline',
  TRANSPORTE: 'bus-outline',
  ALIMENTACAO: 'restaurant-outline',
  HOSPEDAGEM: 'bed-outline',
  SERVICOS: 'construct-outline',
};

const normalizarCategoria = (categoria) => {
  if (!categoria) return '';

  const categoriaBruta = typeof categoria === 'object'
    ? categoria?.nome || categoria?.categoria || ''
    : String(categoria);

  return categoriaBruta
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

export const obterCategoriaLabel = (categoria) => {
  const chave = normalizarCategoria(categoria);
  if (CATEGORIAS_LABELS[chave]) return CATEGORIAS_LABELS[chave];
  if (typeof categoria === 'object') return categoria?.nome || 'Sem categoria';
  return categoria || 'Sem categoria';
};

export const obterCategoriaIcone = (categoria) => {
  const chave = normalizarCategoria(categoria);
  return CATEGORIAS_ICONES[chave] || 'apps-outline';
};
