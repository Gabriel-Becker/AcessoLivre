/**
 * Utilitarios de formatacao e validacao
 * Utilitarios de validacao e formatacao do AcessoLivre
 */

/**
 * Formata CEP com hifen
 * @param {string} value
 * @returns {string}
 */
export const formatCEP = (value) => {
  const numbers = String(value || '').replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Formata telefone com DDD e mascara
 * @param {string} value
 * @returns {string}
 */
export const formatPhone = (value) => {
  const numbers = String(value || '').replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Formata data de nascimento
 * @param {string} value
 * @returns {string}
 */
export const formatBirthDate = (value) => {
  const numbers = String(value || '').replace(/\D/g, '');

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) {
    const day = numbers.slice(0, 2);
    const month = numbers.slice(2);
    if (parseInt(day, 10) > 31) return `31/${month}`;
    return `${day}/${month}`;
  }

  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);

  const validDay = Math.min(parseInt(day || '0', 10), 31);
  const validMonth = Math.min(parseInt(month || '0', 10), 12);

  return `${validDay.toString().padStart(2, '0')}/${validMonth.toString().padStart(2, '0')}/${year}`;
};

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email || ''));
};

/**
 * Valida telefone (celular ou fixo)
 */
export const validatePhone = (phone) => {
  if (!phone || String(phone).trim() === '') return false;
  const phoneRegex = /^\(?[1-9]{2}\)?\s?(?:[2-8]|9[1-9])[0-9]{3}\s?\-?[0-9]{4}$/;
  const cleanPhone = String(phone).trim();
  return phoneRegex.test(cleanPhone);
};

/**
 * Retorna mensagem de erro de validacao de telefone
 */
export const getPhoneValidationMessage = (phone) => {
  if (!phone || String(phone).trim() === '') return null;

  const numbers = String(phone).replace(/\D/g, '');

  if (numbers.length < 10) return 'Telefone incompleto';

  if (numbers.length === 10) {
    if (!/^[1-9][2-5]/.test(numbers)) {
      return 'Numero de telefone fixo invalido';
    }
  } else if (numbers.length === 11) {
    if (numbers.charAt(2) !== '9') {
      return 'Numero de celular deve comecar com 9';
    }
  } else {
    return 'Telefone com numero incorreto de digitos';
  }

  if (!validatePhone(phone)) return 'Telefone invalido';
  return null;
};

/**
 * Valida data de nascimento (formato e data valida)
 */
export const validateBirthDate = (birthDate) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(birthDate || ''))) return false;

  const [day, month, year] = String(birthDate).split('/').map(Number);
  const birthDateObj = new Date(year, month - 1, day);

  if (
    birthDateObj.getFullYear() !== year ||
    birthDateObj.getMonth() !== month - 1 ||
    birthDateObj.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  return birthDateObj <= today;
};

/**
 * Valida nome (minimo 2 caracteres, sem espacos extras)
 */
export const validateFirstName = (firstName) => {
  if (!firstName) return false;

  const nome = String(firstName);
  const trimmedName = nome.trim();

  if (trimmedName.length < 2) return false;
  if (nome !== trimmedName) return false;
  if (nome.includes('  ')) return false;

  const spaceCount = (nome.match(/ /g) || []).length;
  if (spaceCount > 1) return false;

  if (!/^[\p{L} ]+$/u.test(nome)) return false;

  if (spaceCount === 1) {
    const parts = nome.split(' ');
    if (parts.length !== 2) return false;
    if (parts[0].length < 2 || parts[1].length < 2) return false;
  }

  return true;
};

/**
 * Valida sobrenome (minimo 2 caracteres)
 */
export const validateSurname = (surname) => {
  if (!surname) return false;
  return String(surname).trim().length >= 2;
};

/**
 * Valida comprimento total de nome + sobrenome
 */
export const validateFullNameLength = (firstName, surname) => {
  const fullName = `${firstName || ''} ${surname || ''}`.trim();
  return fullName.length <= 255;
};

/**
 * Valida senha (minimo 8 caracteres, maiuscula, numero e especial)
 */
export const validatePassword = (password) => {
  const senha = String(password || '');
  if (senha.length < 8) return false;
  if (!/[A-Z]/.test(senha)) return false;
  if (!/[0-9]/.test(senha)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(senha)) return false;
  return true;
};

export const getPasswordRequirements = () =>
  'A senha deve ter no minimo 8 caracteres, uma letra maiuscula, um numero e um caractere especial';

/**
 * Valida CEP (formato e comprimento)
 */
export const validateCEP = (cep) => {
  const numbers = String(cep || '').replace(/\D/g, '');
  return numbers.length === 8;
};

/**
 * Remove formatacao de string (deixa apenas numeros)
 */
export const removeFormatting = (value) => String(value || '').replace(/\D/g, '');
