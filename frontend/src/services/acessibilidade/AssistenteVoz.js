import ServicoVoz from './ServicoVoz';
import ServicoNavegacao from './ServicoNavegacao';

class AssistenteVoz {
  static isProcessing = false;
  
  // Armazena contexto da tela atual.
  static currentContext = {
    screen: 'Home',
    totalLocais: 0,
    totalAvaliacoes: 0,
    locaisDestaqueCount: 0,
    buscarLocalPorNome: null,
    locaisDestaque: []
  };

  // Atualiza o contexto da tela atual.
  static updateContext(context) {
    this.currentContext = { ...this.currentContext, ...context };
  }

  // Retorna o contexto atual.
  static getContext() {
    return this.currentContext;
  }

  static async handle(command, context = {}) {
    if (this.isProcessing) {
      ServicoVoz.speak('Aguarde, estou processando...');
      return;
    }

    this.isProcessing = true;
    const text = command.toLowerCase();
 
    const fullContext = { ...this.currentContext, ...context };

    if (text.includes('home') || text.includes('inicio') || text.includes('principal')) {
      ServicoVoz.speak('Indo para a página inicial');
      ServicoNavegacao.resetTo('Main', { screen: 'Inicio' });
    }
    
    else if (text.includes('perfil') || text.includes('meu perfil') || text.includes('minha conta')) {
      ServicoVoz.speak('Abrindo seu perfil');
      ServicoNavegacao.navigate('Main', { screen: 'Perfil' });
    }
    
    else if (text.includes('denunciar') || text.includes('reportar') || text.includes('fazer denuncia')) {
      ServicoVoz.speak('Abrindo formulário de denúncia');
      ServicoNavegacao.navigate('Main', { screen: 'Denuncia' });
    }
    
    else if (text.includes('configuracoes') || text.includes('ajustes')) {
      ServicoVoz.speak('Abrindo configurações');
      ServicoNavegacao.navigate('Main', { screen: 'Configuracoes' });
    }
    
    else if (text.includes('voltar') || text.includes('retornar') || text.includes('volta')) {
      if (ServicoNavegacao.canGoBack()) {
        ServicoVoz.speak('Voltando');
        ServicoNavegacao.goBack();
      } else {
        ServicoVoz.speak('Não é possível voltar, você já está na tela inicial');
      }
    }
    
    else if (text.includes('sair') || text.includes('logout') || text.includes('deslogar')) {
      ServicoVoz.speak('Saindo do aplicativo');
      ServicoNavegacao.resetTo('Entrar');
    }
    
    else if (text.includes('estatisticas') || 
             text.includes('quantos locais') || text.includes('total de locais') ||
         text.includes('quantas avaliacoes') || text.includes('total de avaliacoes')) {
      
      const totalLocais = fullContext.totalLocais || 0;
      const totalAvaliacoes = fullContext.totalAvaliacoes || 0;
      
      if (totalLocais > 0) {
        ServicoVoz.speak(`Total de ${totalLocais} locais cadastrados e ${totalAvaliacoes} avaliações registradas.`);
      } else {
        ServicoVoz.speak('Carregando estatísticas. Tente novamente em alguns instantes.');
      }
    }
    
    else if (text.includes('destaques') || text.includes('locais em destaque') || 
             text.includes('quantos destaques') || text.includes('em destaque')) {
      
      const count = fullContext.locaisDestaqueCount || 0;
      
      if (count > 0) {
        ServicoVoz.speak(`Mostrando ${count} locais em destaque na página inicial.`);
      } else {
        ServicoVoz.speak('Nenhum local em destaque no momento.');
      }
    }
    
    else if (text.includes('ver todos') || text.includes('todos os locais') || 
             text.includes('lista completa') || text.includes('mais locais')) {
      ServicoVoz.speak('Abrindo página de busca com todos os locais cadastrados');
      ServicoNavegacao.navigate('Main', { screen: 'Buscar' });
    }
    
    else if (text.includes('atualizar') || text.includes('recarregar') || 
             text.includes('refresh') || text.includes('atualizar pagina')) {
      ServicoVoz.speak('Atualizando a página inicial');
      // Dispara evento de refresh (capturado pela Home).
      if (fullContext.onRefresh) {
        fullContext.onRefresh();
      } else {
        ServicoVoz.speak('Não foi possível atualizar automaticamente. Tente puxar a tela para baixo.');
      }
    }
    
    else if (text.includes('buscar') || text.includes('procure') || 
             text.includes('encontre') || text.includes('onde fica') ||
             text.match(/^buscar\s+\w+/i) || text.match(/^procure\s+\w+/i)) {
      
                // Extrai nome do local removendo palavras de comando.
      let nomeLocal = text
        .replace(/buscar|procure|encontre|onde fica|o local|local|chamado|chamada/g, '')
        .trim();
      
      if (nomeLocal && fullContext.buscarLocalPorNome) {
        ServicoVoz.speak(`Procurando por ${nomeLocal}`);
        fullContext.buscarLocalPorNome(nomeLocal);
      } else if (nomeLocal && fullContext.locaisDestaque?.length > 0) {
        // Busca local na lista de destaques.
        const localEncontrado = fullContext.locaisDestaque.find(local => 
          local.nome?.toLowerCase().includes(nomeLocal.toLowerCase())
        );
        
        if (localEncontrado) {
          ServicoVoz.speak(`Encontrei ${localEncontrado.nome}. Abrindo detalhes.`);
          ServicoNavegacao.navigate('LocalDetalhes', { id: localEncontrado.id });
        } else {
          ServicoVoz.speak(`Não encontrei nenhum local chamado ${nomeLocal} nos destaques.`);
        }
      } else {
        ServicoVoz.speak('Diga o nome do local que deseja buscar. Por exemplo: buscar restaurante central');
      }
    }
    
        else if (text.includes('detalhes') || text.includes('mais informacoes') || 
          text.includes('sobre') || text.includes('informacoes do local')) {
      
      ServicoVoz.speak('Toque em qualquer card de local para ver os detalhes completos');
    }
    
    else if (text.includes('ajuda') || text.includes('comandos') || 
             text.includes('o que posso dizer') || text.includes('como usar')) {
      
      const screen = fullContext.screen || 'Home';
      
      if (screen === 'Home') {
        ServicoVoz.speak(
          'Comandos disponíveis na página inicial: home, perfil, denunciar, configurações, voltar, sair, ' +
          'estatísticas, destaques, ver todos os locais, atualizar página, ' +
          'buscar seguido do nome do local e ajuda. O que você deseja?'
        );
      } else {
        ServicoVoz.speak(
          'Comandos gerais: home para página inicial, perfil para seus dados, ' +
          'denunciar para fazer uma denúncia, configurações para ajustes, ' +
          'voltar para a tela anterior, sair para encerrar sessão e ajuda para ouvir os comandos novamente.'
        );
      }
    }
    
    else if (text.includes('obrigado') || text.includes('valeu') || text.includes('obrigada')) {
      ServicoVoz.speak('Por nada! Estou aqui para ajudar.');
    }
    
    else if (text.includes('tudo bem') || text.includes('como voce esta') || text.includes('como vai')) {
      ServicoVoz.speak('Estou funcionando perfeitamente! Como posso ajudar você hoje?');
    }
    
    else {
      const currentScreen = ServicoNavegacao.getCurrentRoute() || fullContext.screen || 'página atual';
      ServicoVoz.speak(
        `Comando não reconhecido. Você está na tela ${currentScreen}. ` +
        'Diga ajuda para ver os comandos disponíveis ou tente novamente.'
      );
    }

    this.isProcessing = false;
  }
}

export default AssistenteVoz;
