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
    return 'Nï¿½o foi possï¿½vel entrar agora. Tente novamente em alguns instantes.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexï¿½o com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['credenciais invï¿½lidas', 'usuï¿½rio ou senha invï¿½lidos', 'senha incorreta', 'unauthorized', '401'])) {
    return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  }

  if (contem(texto, ['bloquead', 'tentativas'])) {
    return 'Sua conta estï¿½ temporariamente bloqueada por tentativas invï¿½lidas. Aguarde e tente novamente.';
  }

  return texto;
};

export const formatarErroCadastro = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Nï¿½o foi possï¿½vel concluir seu cadastro agora. Tente novamente.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexï¿½o com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['email jï¿½', 'e-mail jï¿½', 'jï¿½ cadastrado', 'duplicate', 'duplicado', 'already exists'])) {
    return 'Este e-mail jï¿½ estï¿½ cadastrado. Faï¿½a login ou use outro e-mail.';
  }

  if (contem(texto, ['senha', 'password'])) {
    return 'A senha informada nï¿½o atende aos requisitos. Revise os critï¿½rios e tente novamente.';
  }

  return texto;
};

export const formatarErroEsqueciSenha = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Nï¿½o conseguimos enviar o cï¿½digo agora. Tente novamente em instantes.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexï¿½o com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['usuï¿½rio nï¿½o encontrado', 'user not found', 'nï¿½o encontrado'])) {
    return 'Nï¿½o encontramos uma conta com este e-mail. Verifique o endereï¿½o digitado.';
  }

  return texto;
};

export const formatarErroRedefinirSenha = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Nï¿½o foi possï¿½vel redefinir sua senha agora. Tente novamente.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexï¿½o com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['cï¿½digo invï¿½lido', 'cï¿½digo expirado', 'invalid code', 'expired'])) {
    return 'O cï¿½digo informado ï¿½ invï¿½lido ou expirou. Solicite um novo cï¿½digo e tente novamente.';
  }

  if (contem(texto, ['senha', 'password'])) {
    return 'A nova senha nï¿½o atende aos requisitos. Revise os critï¿½rios e tente novamente.';
  }

  return texto;
};

export const formatarErroTrocarSenha = (erro) => {
  const texto = mensagemBase(erro);

  if (!texto) {
    return 'Nï¿½o foi possï¿½vel trocar sua senha agora. Tente novamente em instantes.';
  }

  if (ehErroDeConexao(texto)) {
    return 'Sem conexï¿½o com a internet. Verifique sua rede e tente novamente.';
  }

  if (contem(texto, ['senha atual incorreta'])) {
    return 'A senha atual informada estï¿½ incorreta.';
  }

  if (contem(texto, ['token invï¿½lido', 'sessï¿½o expirou', 'sessao expirou', 'unauthorized', '401'])) {
    return 'Sua sessï¿½o expirou. Faï¿½a login novamente para trocar a senha.';
  }

  if (contem(texto, ['senha', 'password'])) {
    return 'A nova senha nï¿½o atende aos requisitos. Revise os critï¿½rios e tente novamente.';
  }

  return texto;
};
