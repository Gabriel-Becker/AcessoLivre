/**
 * Mensagens centralizadas para autenticação
 * Mantém consistência em todas as mensagens do sistema
 */

export const authMessages = {
  success: {
    loginSuccess: 'Login realizado com sucesso',
    registerSuccess: 'Cadastro realizado com sucesso',
    logoutSuccess: 'Até breve!',
    forgotPasswordSuccess: 'Email enviado com sucesso. Verifique sua caixa de entrada.',
    resetPasswordSuccess: 'Senha alterada com sucesso',
    verificationEmailSent: 'Email de verificação enviado',
    emailVerified: 'Email verificado com sucesso',
  },

  loginErrors: {
    requiredFields: 'Email e senha são obrigatórios',
    invalidEmail: 'Email inválido',
    loginFailed: 'Credenciais inválidas',
    twoFactorRequired: 'Código de autenticação obrigatório',
    twoFactorPrompt: 'Digite o código do Google Authenticator',
    invalidTwoFactor: 'Código de autenticação inválido',
    networkError: 'Falha na conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  registerErrors: {
    requiredFields: 'Todos os campos obrigatórios devem ser preenchidos',
    invalidName: 'Nome inválido',
    invalidEmail: 'Email inválido',
    invalidPhone: 'Telefone inválido',
    invalidBirthDate: 'Data de nascimento inválida',
    invalidPassword: 'Senha não atende aos requisitos',
    passwordMismatch: 'As senhas não coincidem',
    invalidCep: 'CEP inválido',
    emailAlreadyExists: 'Email já cadastrado',
    termsNotAccepted: 'Você deve aceitar os termos de uso',
    networkError: 'Falha na conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  forgotPasswordErrors: {
    requiredEmail: 'Email é obrigatório',
    invalidEmail: 'Email inválido',
    userNotFound: 'Usuário não encontrado',
    networkError: 'Falha na conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  resetPasswordErrors: {
    requiredFields: 'Todos os campos são obrigatórios',
    invalidCode: 'Código inválido ou expirado',
    invalidPassword: 'Senha não atende aos requisitos',
    passwordMismatch: 'As senhas não coincidem',
    networkError: 'Falha na conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  validation: {
    required: 'Campo obrigatório',
    invalidEmail: 'Email inválido',
    invalidPhone: 'Telefone inválido',
    invalidCep: 'CEP inválido',
    passwordTooShort: 'Senha deve ter no mínimo 8 caracteres',
    passwordRequirements: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial',
    passwordMismatch: 'As senhas não coincidem',
    invalidDate: 'Data inválida ou futura',
    nameTooShort: 'Nome deve ter pelo menos 2 caracteres',
    invalidCharacters: 'Caracteres inválidos',
    maxLength: 'Número máximo de caracteres excedido',
  },

  general: {
    loading: 'Carregando...',
    saving: 'Salvando...',
    processing: 'Processando...',
    sending: 'Enviando...',
    unknownError: 'Erro desconhecido. Tente novamente.',
    sessionExpired: 'Sessão expirada. Faça login novamente.',
    unauthorized: 'Acesso não autorizado',
    forbidden: 'Você não tem permissão para esta ação',
  },
};

export default authMessages;
