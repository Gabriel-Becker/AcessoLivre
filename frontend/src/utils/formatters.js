/**
 * Utilitï¿½rios de Formataï¿½ï¿½o e Validaï¿½ï¿½o
 * Adaptado do projeto Inkspiration para AcessoLivre
 */

/**
 * Formata CEP com hï¿½fen
 * @param {string} value - CEP sem formataï¿½ï¿½o
 * @returns {string} CEP formatado (00000-000)
 */
export const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Formata telefone com DDD e mï¿½scara
 * @param {string} value - Telefone sem formataï¿½ï¿½o
 * @returns {string} Telefone formatado ((00) 00000-0000)
 */
export const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Formata data de nascimento
 * @param {string} value - Data sem formataï¿½ï¿½o
 * @returns {string} Data formatada (DD/MM/AAAA)
 */
export const formatBirthDate = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) {
    const day = numbers.slice(0, 2);
    const month = numbers.slice(2);
    if (parseInt(day) > 31) return `31/${month}`;
    return `${day}/${month}`;
  }
  
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  
  const validDay = Math.min(parseInt(day), 31);
  const validMonth = Math.min(parseInt(month), 12);
  
  return `${validDay.toString().padStart(2, '0')}/${validMonth.toString().padStart(2, '0')}/${year}`;
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True se vï¿½lido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone (celular ou fixo)
 * @param {string} phone - Telefone formatado ou nï¿½o
 * @returns {boolean} True se vï¿½lido
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') return false;
  
  const phoneRegex = /^\(?[1-9]{2}\)?\s?(?:[2-8]|9[1-9])[0-9]{3}\s?\-?[0-9]{4}$/;
  const cleanPhone = phone.trim();
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Retorna mensagem de erro de validaï¿½ï¿½o de telefone
 * @param {string} phone - Telefone a validar
 * @returns {string|null} Mensagem de erro ou null
 */
export const getPhoneValidationMessage = (phone) => {
  if (!phone || phone.trim() === '') return null;
  
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length < 10) {
    return 'Telefone incompleto';
  }
  
  if (numbers.length === 10) {
    // Fixo: primeiro dï¿½gito deve ser 2-5
    if (!/^[1-9][2-5]/.test(numbers)) {
      return 'Nï¿½mero de telefone fixo invï¿½lido';
    }
  } else if (numbers.length === 11) {
    // Celular: terceiro dï¿½gito deve ser 9
    if (numbers.charAt(2) !== '9') {
      return 'Nï¿½mero de celular deve comeï¿½ar com 9';
    }
  } else {
    return 'Telefone com nï¿½mero incorreto de dï¿½gitos';
  }
  
  if (!validatePhone(phone)) {
    return 'Telefone invï¿½lido';
  }
  
  return null;
};

/**
 * Valida data de nascimento (formato e data vï¿½lida)
 * @param {string} birthDate - Data no formato DD/MM/AAAA
 * @returns {boolean} True se formato e data vï¿½lidos
 */
export const validateBirthDate = (birthDate) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
    return false;
  }
  
  const [day, month, year] = birthDate.split('/').map(Number);
  
  const birthDateObj = new Date(year, month - 1, day);
  
  // Verifica se a data ï¿½ vï¿½lida
  if (
    birthDateObj.getFullYear() !== year ||
    birthDateObj.getMonth() !== month - 1 ||
    birthDateObj.getDate() !== day
  ) {
    return false;
  }
  
  // Verifica se nï¿½o ï¿½ data futura
  const today = new Date();
  if (birthDateObj > today) {
    return false;
  }
  
  return true;
};

/**
 * Valida nome (mï¿½nimo 2 caracteres, sem espaï¿½os extras)
 * @param {string} firstName - Nome a validar
 * @returns {boolean} True se vï¿½lido
 */
export const validateFirstName = (firstName) => {
  if (!firstName) return false;
  
  const trimmedName = firstName.trim();
  
  if (trimmedName.length < 2) return false;
  if (firstName !== trimmedName) return false;
  if (firstName.includes('  ')) return false;
  
  const spaceCount = (firstName.match(/ /g) || []).length;
  if (spaceCount > 1) return false;
  
  if (!/^[a-zA-Zï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ]+$/.test(firstName)) return false;
  
  if (spaceCount === 1) {
    const parts = firstName.split(' ');
    if (parts.length !== 2) return false;
    if (parts[0].length < 2 || parts[1].length < 2) return false;
  }
  
  return true;
};

/**
 * Valida sobrenome (mï¿½nimo 2 caracteres)
 * @param {string} surname - Sobrenome a validar
 * @returns {boolean} True se vï¿½lido
 */
export const validateSurname = (surname) => {
  if (!surname) return false;
  return surname.trim().length >= 2;
};

/**
 * Valida comprimento total de nome + sobrenome
 * @param {string} firstName - Nome
 * @param {string} surname - Sobrenome
 * @returns {boolean} True se <= 255 caracteres
 */
export const validateFullNameLength = (firstName, surname) => {
  const fullName = `${firstName} ${surname}`.trim();
  return fullName.length <= 255;
};

/**
 * Valida senha (mï¿½nimo 8 caracteres, maiï¿½scula, nï¿½mero e especial)
 * @param {string} password - Senha a validar
 * @returns {boolean} True se vï¿½lido
 */
export const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};

/**
 * Retorna mensagem de requisitos de senha
 * @returns {string} Mensagem de requisitos
 */
export const getPasswordRequirements = () => {
  return 'A senha deve ter no mï¿½nimo 8 caracteres, uma letra maiï¿½scula, um nï¿½mero e um caractere especial';
};

/**
 * Valida CEP (formato e comprimento)
 * @param {string} cep - CEP formatado ou nï¿½o
 * @returns {boolean} True se vï¿½lido
 */
export const validateCEP = (cep) => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
};

/**
 * Remove formataï¿½ï¿½o de string (deixa apenas nï¿½meros)
 * @param {string} value - String a limpar
 * @returns {string} Apenas nï¿½meros
 */
export const removeFormatting = (value) => {
  return value.replace(/\D/g, '');
};
