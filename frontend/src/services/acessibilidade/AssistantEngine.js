class AssistantEngine {
  static context = {
    screen: 'Home',
    metadata: {}
  };

  static updateContext(context) {
    this.context = { ...this.context, ...context };
  }

  static getContext() {
    return this.context;
  }

  static parseCommand(command) {
    const text = command.toLowerCase().trim();

    if (this.matchAny(text, ['home', 'início', 'inicio', 'principal', 'página inicial'])) {
      return {
        action: 'NAVIGATE',
        screen: 'Main',
        params: { screen: 'Inicio' },
        speech: 'Voltando para página inicial'
      };
    }

    if (this.matchAny(text, ['perfil', 'meu perfil', 'minha conta', 'dados pessoais'])) {
      return {
        action: 'NAVIGATE',
        screen: 'Main',
        params: { screen: 'Perfil' },
        speech: 'Abrindo seu perfil'
      };
    }

    if (this.matchAny(text, ['denunciar', 'reportar', 'fazer denúncia', 'nova denúncia'])) {
      return {
        action: 'NAVIGATE',
        screen: 'Main',
        params: { screen: 'Denuncia' },
        speech: 'Abrindo formulário de denúncia'
      };
    }

    if (this.matchAny(text, ['configurações', 'configuracoes', 'ajustes', 'preferências'])) {
      return {
        action: 'NAVIGATE',
        screen: 'Main',
        params: { screen: 'Configuracoes' },
        speech: 'Abrindo configurações'
      };
    }

    if (this.matchAny(text, ['buscar', 'pesquisar', 'procurar', 'encontrar'])) {
     
      const termo = this.extractSearchTerm(text);
      if (termo) {
        return {
          action: 'SEARCH',
          term: termo,
          speech: `Buscando por ${termo}`
        };
      }
      return {
        action: 'NAVIGATE',
        screen: 'Main',
        params: { screen: 'Buscar' },
        speech: 'Abrindo página de busca'
      };
    }

    if (this.matchAny(text, ['voltar', 'retornar', 'volta'])) {
      return {
        action: 'GO_BACK',
        speech: 'Voltando'
      };
    }

    if (this.matchAny(text, ['sair', 'logout', 'deslogar', 'encerrar sessão'])) {
      return {
        action: 'LOGOUT',
        speech: 'Encerrando sessão'
      };
    }

    if (this.matchAny(text, ['ajuda', 'comandos', 'o que posso dizer', 'como usar', 'instruções'])) {
      return this.buildHelpResponse();
    }

    if (this.matchAny(text, ['estatísticas', 'estatisticas', 'quantos locais', 'total de locais', 'total de avaliações'])) {
      return this.buildStatisticsResponse();
    }

    if (this.matchAny(text, ['obrigado', 'valeu', 'obrigada', 'obrigado'])) {
      return {
        action: 'SPEAK_ONLY',
        speech: 'Por nada! Estou aqui para ajudar.'
      };
    }

    if (this.matchAny(text, ['tudo bem', 'como você está', 'como vai', 'como está'])) {
      return {
        action: 'SPEAK_ONLY',
        speech: 'Estou funcionando perfeitamente! Como posso ajudar você hoje?'
      };
    }

    return {
      action: 'UNKNOWN',
      speech: `Comando não reconhecido. Você está na tela ${this.context.screen}. Diga "ajuda" para ver os comandos disponíveis.`
    };
  }

  static matchAny(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  static extractSearchTerm(text) {
    const patterns = ['buscar', 'pesquisar', 'procurar', 'encontrar', 'procure', 'busque'];
    let term = text;
    for (const pattern of patterns) {
      term = term.replace(new RegExp(pattern, 'gi'), '');
    }
    term = term.trim();
    return term || null;
  }

  static buildHelpResponse() {
    const screen = this.context.screen;
    const commands = this.getCommandsForScreen(screen);

    return {
      action: 'SPEAK_ONLY',
      speech: `Comandos disponíveis: ${commands.join(', ')}. O que você deseja fazer?`
    };
  }

  static getCommandsForScreen(screen) {
    const baseCommands = ['home', 'perfil', 'denunciar', 'configurações', 'voltar', 'sair', 'ajuda'];
    const screenCommands = {
      Home: ['estatísticas', 'buscar', 'ver todos os locais'],
      Buscar: ['buscar [nome do local]', 'filtrar por categoria', 'limpar filtros'],
      LocalDetalhes: ['avaliar', 'voltar', 'compartilhar'],
      Denuncia: ['enviar', 'cancelar'],
    };

    return [...baseCommands, ...(screenCommands[screen] || [])];
  }

  static buildStatisticsResponse() {
    const { totalLocais = 0, totalAvaliacoes = 0 } = this.context.metadata;

    if (totalLocais > 0) {
      return {
        action: 'SPEAK_ONLY',
        speech: `Total de ${totalLocais} locais cadastrados e ${totalAvaliacoes} avaliações registradas.`
      };
    }

    return {
      action: 'SPEAK_ONLY',
      speech: 'Carregando estatísticas. Tente novamente em alguns instantes.'
    };
  }
}

export default AssistantEngine;