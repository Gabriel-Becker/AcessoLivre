/**
 * Mensagens centralizadas para autenticacao
 * Mantem consistencia em todas as mensagens do sistema
 */

export const authMessages = {
  success: {
    loginSuccess: 'Login realizado com sucesso',
    registerSuccess: 'Cadastro realizado com sucesso',
    logoutSuccess: 'Ate breve!',
    forgotPasswordSuccess: 'Email enviado com sucesso. Verifique sua caixa de entrada.',
    resetPasswordSuccess: 'Senha alterada com sucesso',
    verificationEmailSent: 'Email de verificacao enviado',
    emailVerified: 'Email verificado com sucesso',
  },

  loginErrors: {
    requiredFields: 'Email e senha sao obrigatorios',
    invalidEmail: 'Email invalido',
    loginFailed: 'Credenciais invalidas',
    twoFactorRequired: 'Codigo de autenticacao obrigatorio',
    twoFactorPrompt: 'Digite o codigo do Google Authenticator',
    invalidTwoFactor: 'Codigo de autenticacao invalido',
    networkError: 'Falha na conexao. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  registerErrors: {
    requiredFields: 'Todos os campos obrigatorios devem ser preenchidos',
    invalidName: 'Nome invalido',
    invalidEmail: 'Email invalido',
    invalidPhone: 'Telefone invalido',
    invalidBirthDate: 'Data de nascimento invalida',
    invalidPassword: 'Senha nao atende aos requisitos',
    passwordMismatch: 'As senhas nao coincidem',
    invalidCep: 'CEP invalido',
    emailAlreadyExists: 'Email ja cadastrado',
    termsNotAccepted: 'Voce deve aceitar os termos de uso',
    networkError: 'Falha na conexao. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  forgotPasswordErrors: {
    requiredEmail: 'Email e obrigatorio',
    invalidEmail: 'Email invalido',
    userNotFound: 'Usuario nao encontrado',
    networkError: 'Falha na conexao. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  resetPasswordErrors: {
    requiredFields: 'Todos os campos sao obrigatorios',
    invalidCode: 'Codigo invalido ou expirado',
    invalidPassword: 'Senha nao atende aos requisitos',
    passwordMismatch: 'As senhas nao coincidem',
    networkError: 'Falha na conexao. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  validation: {
    required: 'Campo obrigatorio',
    invalidEmail: 'Email invalido',
    invalidPhone: 'Telefone invalido',
    invalidCep: 'CEP invalido',
    passwordTooShort: 'Senha deve ter no minimo 8 caracteres',
    passwordRequirements: 'A senha deve ter no minimo 8 caracteres, uma letra maiuscula, um numero e um caractere especial',
    passwordMismatch: 'As senhas nao coincidem',
    invalidDate: 'Data invalida ou futura',
    nameTooShort: 'Nome deve ter pelo menos 2 caracteres',
    invalidCharacters: 'Caracteres invalidos',
    maxLength: 'Numero maximo de caracteres excedido',
  },

  general: {
    loading: 'Carregando...',
    saving: 'Salvando...',
    processing: 'Processando...',
    sending: 'Enviando...',
    unknownError: 'Erro desconhecido. Tente novamente.',
    sessionExpired: 'Sessao expirada. Faca login novamente.',
    unauthorized: 'Acesso nao autorizado',
    forbidden: 'Voce nao tem permissao para esta acao',
  },
};

export default authMessages;
