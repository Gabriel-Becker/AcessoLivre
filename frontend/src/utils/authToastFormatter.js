const normalizarTexto = (valor) => String(valor || '').toLowerCase();

const mensagemBase = (erro) => {
  if (!erro) return '';

  if (typeof erro === 'string') return erro;

  return (
    erro?.response?.data?.mensagem ||
    erro?.response?.data?.message ||
    erro?.response?.data?.erro ||
    erro?.response?.data?.error ||
    erro?.message ||
    ''
  );
};

const ehErroDeConexao = (texto) => {
  const valor = normalizarTexto(texto);
  return (
    valor.includes('network') ||
    valor.includes('timeout') ||
    valor.includes('conex') ||
    valor.includes('internet') ||
    valor.includes('econnaborted')
  );
};

const contem = (texto, termos) => {
  const valor = normalizarTexto(texto);
  return termos.some((termo) => valor.includes(normalizarTexto(termo)));
};

export const formatarErroLogin = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Não foi possível entrar agora. Tente novamente em alguns instantes.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['credenciais inválidas', 'usuário ou senha inválidos', 'senha incorreta', 'unauthorized', '401'])) {
    return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  }

  if (contem(texto, ['bloquead', 'tentativas'])) {
    return 'Sua conta está temporariamente bloqueada por tentativas inválidas. Aguarde e tente novamente.';
  }

  return texto;
};

export const formatarErroCadastro = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Não foi possível concluir seu cadastro agora. Tente novamente.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['email já', 'e-mail já', 'já cadastrado', 'duplicate', 'duplicado', 'already exists'])) {
    return 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.';
  }

  if (contem(texto, ['senha', 'password'])) {
    return 'A senha informada não atende aos requisitos. Revise os critérios e tente novamente.';
  }

  return texto;
};

export const formatarErroEsqueciSenha = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Não conseguimos enviar o código agora. Tente novamente em instantes.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['usuário não encontrado', 'user not found', 'não encontrado'])) {
    return 'Não encontramos uma conta com este e-mail. Verifique o endereço digitado.';
  }

  return texto;
};

export const formatarErroRedefinirSenha = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Não foi possível redefinir sua senha agora. Tente novamente.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['código inválido', 'código expirado', 'invalid code', 'expired'])) {
    return 'O código informado é inválido ou expirou. Solicite um novo código e tente novamente.';
  }

  if (contem(texto, ['senha', 'password'])) {
    return 'A nova senha não atende aos requisitos. Revise os critérios e tente novamente.';
  }

  return texto;
};

export const formatarErroTrocarSenha = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Não foi possível trocar sua senha agora. Tente novamente em instantes.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['senha atual incorreta'])) {
    return 'A senha atual informada está incorreta.';
  }

  if (contem(texto, ['token inválido', 'sessão expirou', 'sessao expirou', 'unauthorized', '401'])) {
    return 'Sua sessão expirou. Faça login novamente para trocar a senha.';
  }

  if (contem(texto, ['senha', 'password'])) {
    return 'A nova senha não atende aos requisitos. Revise os critérios e tente novamente.';
  }

  return texto;
};
