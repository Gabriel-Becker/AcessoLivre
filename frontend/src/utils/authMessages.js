/**
 * Mensagens centralizadas para autenticaï¿½ï¿½o
 * Mantï¿½m consistï¿½ncia em todas as mensagens do sistema
 */

export const authMessages = {
  // Mensagens de sucesso
  success: {
    loginSuccess: 'Login realizado com sucesso',
    registerSuccess: 'Cadastro realizado com sucesso',
    logoutSuccess: 'Atï¿½ breve!',
    forgotPasswordSuccess: 'Email enviado com sucesso. Verifique sua caixa de entrada.',
    resetPasswordSuccess: 'Senha alterada com sucesso',
    verificationEmailSent: 'Email de verificaï¿½ï¿½o enviado',
    emailVerified: 'Email verificado com sucesso',
  },

  // Erros de login
  loginErrors: {
    requiredFields: 'Email e senha sï¿½o obrigatï¿½rios',
    invalidEmail: 'Email invï¿½lido',
    loginFailed: 'Credenciais invï¿½lidas',
    twoFactorRequired: 'Cï¿½digo de autenticaï¿½ï¿½o obrigatï¿½rio',
    twoFactorPrompt: 'Digite o cï¿½digo do Google Authenticator',
    invalidTwoFactor: 'Cï¿½digo de autenticaï¿½ï¿½o invï¿½lido',
    networkError: 'Falha na conexï¿½o. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Erros de cadastro
  registerErrors: {
    requiredFields: 'Todos os campos obrigatï¿½rios devem ser preenchidos',
    invalidName: 'Nome invï¿½lido',
    invalidEmail: 'Email invï¿½lido',
    invalidPhone: 'Telefone invï¿½lido',
    invalidBirthDate: 'Data de nascimento invï¿½lida',
    invalidPassword: 'Senha nï¿½o atende aos requisitos',
    passwordMismatch: 'As senhas nï¿½o coincidem',
    invalidCep: 'CEP invï¿½lido',
    emailAlreadyExists: 'Email jï¿½ cadastrado',
    termsNotAccepted: 'Vocï¿½ deve aceitar os termos de uso',
    networkError: 'Falha na conexï¿½o. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Erros de recuperaï¿½ï¿½o de senha
  forgotPasswordErrors: {
    requiredEmail: 'Email ï¿½ obrigatï¿½rio',
    invalidEmail: 'Email invï¿½lido',
    userNotFound: 'Usuï¿½rio nï¿½o encontrado',
    networkError: 'Falha na conexï¿½o. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Erros de reset de senha
  resetPasswordErrors: {
    requiredFields: 'Todos os campos sï¿½o obrigatï¿½rios',
    invalidCode: 'Cï¿½digo invï¿½lido ou expirado',
    invalidPassword: 'Senha nï¿½o atende aos requisitos',
    passwordMismatch: 'As senhas nï¿½o coincidem',
    networkError: 'Falha na conexï¿½o. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Mensagens de validaï¿½ï¿½o
  validation: {
    required: 'Campo obrigatï¿½rio',
    invalidEmail: 'Email invï¿½lido',
    invalidPhone: 'Telefone invï¿½lido',
    invalidCep: 'CEP invï¿½lido',
    passwordTooShort: 'Senha deve ter no mï¿½nimo 8 caracteres',
    passwordRequirements: 'A senha deve ter no mï¿½nimo 8 caracteres, uma letra maiï¿½scula, um nï¿½mero e um caractere especial',
    passwordMismatch: 'As senhas nï¿½o coincidem',
    invalidDate: 'Data invï¿½lida ou futura',
    nameTooShort: 'Nome deve ter pelo menos 2 caracteres',
    invalidCharacters: 'Caracteres invï¿½lidos',
    maxLength: 'Nï¿½mero mï¿½ximo de caracteres excedido',
  },

  // Mensagens gerais
  general: {
    loading: 'Carregando...',
    saving: 'Salvando...',
    processing: 'Processando...',
    sending: 'Enviando...',
    unknownError: 'Erro desconhecido. Tente novamente.',
    sessionExpired: 'Sessï¿½o expirada. Faï¿½a login novamente.',
    unauthorized: 'Acesso nï¿½o autorizado',
    forbidden: 'Vocï¿½ nï¿½o tem permissï¿½o para esta aï¿½ï¿½o',
  },
};

export default authMessages;
