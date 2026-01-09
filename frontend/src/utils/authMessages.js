/**
 * Mensagens centralizadas para autenticação
 * Mantém consistência em todas as mensagens do sistema
 */

export const authMessages = {
  // Mensagens de sucesso
  success: {
    loginSuccess: 'Login realizado com sucesso',
    registerSuccess: 'Cadastro realizado com sucesso',
    logoutSuccess: 'Até breve!',
    forgotPasswordSuccess: 'Email enviado com sucesso. Verifique sua caixa de entrada.',
    resetPasswordSuccess: 'Senha alterada com sucesso',
    verificationEmailSent: 'Email de verificação enviado',
    emailVerified: 'Email verificado com sucesso',
  },

  // Erros de login
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

  // Erros de cadastro
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

  // Erros de recuperação de senha
  forgotPasswordErrors: {
    requiredEmail: 'Email é obrigatório',
    invalidEmail: 'Email inválido',
    userNotFound: 'Usuário não encontrado',
    networkError: 'Falha na conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Erros de reset de senha
  resetPasswordErrors: {
    requiredFields: 'Todos os campos são obrigatórios',
    invalidCode: 'Código inválido ou expirado',
    invalidPassword: 'Senha não atende aos requisitos',
    passwordMismatch: 'As senhas não coincidem',
    networkError: 'Falha na conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Mensagens de validação
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

  // Mensagens gerais
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
