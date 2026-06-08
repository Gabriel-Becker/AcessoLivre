import VoiceService from './VoiceService';
import NavigationService from './NavigationService';

class AssistantEngine {
  static isProcessing = false;
  
  // Armazenar contexto da tela atual
  static currentContext = {
    screen: 'Home',
    totalLocais: 0,
    totalAvaliacoes: 0,
    locaisDestaqueCount: 0,
    buscarLocalPorNome: null,
    locaisDestaque: []
  };

  // Método para atualizar o contexto da tela atual
  static updateContext(context) {
    this.currentContext = { ...this.currentContext, ...context };
    console.log('📢 Contexto do assistente atualizado:', this.currentContext);
  }

  // Método para obter o contexto atual
  static getContext() {
    return this.currentContext;
  }

  static async handle(command, context = {}) {
    if (this.isProcessing) {
      VoiceService.speak('Aguarde, estou processando...');
      return;
    }

    this.isProcessing = true;
    const text = command.toLowerCase();
 
    const fullContext = { ...this.currentContext, ...context };

    if (text.includes('home') || text.includes('início') || text.includes('inicio') || text.includes('principal')) {
      VoiceService.speak('Indo para a página inicial');
      NavigationService.resetTo('Main', { screen: 'Inicio' });
    }
    
    else if (text.includes('perfil') || text.includes('meu perfil') || text.includes('minha conta')) {
      VoiceService.speak('Abrindo seu perfil');
      NavigationService.navigate('Main', { screen: 'Perfil' });
    }
    
    else if (text.includes('denunciar') || text.includes('reportar') || text.includes('fazer denúncia')) {
      VoiceService.speak('Abrindo formulário de denúncia');
      NavigationService.navigate('Main', { screen: 'Denuncia' });
    }
    
    else if (text.includes('configurações') || text.includes('configuracoes') || text.includes('ajustes')) {
      VoiceService.speak('Abrindo configurações');
      NavigationService.navigate('Main', { screen: 'Configuracoes' });
    }
    
    else if (text.includes('voltar') || text.includes('retornar') || text.includes('volta')) {
      if (NavigationService.canGoBack()) {
        VoiceService.speak('Voltando');
        NavigationService.goBack();
      } else {
        VoiceService.speak('Não é possível voltar, você já está na tela inicial');
      }
    }
    
    else if (text.includes('sair') || text.includes('logout') || text.includes('deslogar')) {
      VoiceService.speak('Saindo do aplicativo');
      NavigationService.resetTo('Login');
    }
    
    else if (text.includes('estatísticas') || text.includes('estatisticas') || 
             text.includes('quantos locais') || text.includes('total de locais') ||
             text.includes('quantas avaliações') || text.includes('total de avaliações')) {
      
      const totalLocais = fullContext.totalLocais || 0;
      const totalAvaliacoes = fullContext.totalAvaliacoes || 0;
      
      if (totalLocais > 0) {
        VoiceService.speak(`Total de ${totalLocais} locais cadastrados e ${totalAvaliacoes} avaliações registradas.`);
      } else {
        VoiceService.speak('Carregando estatísticas. Tente novamente em alguns instantes.');
      }
    }
    
    else if (text.includes('destaques') || text.includes('locais em destaque') || 
             text.includes('quantos destaques') || text.includes('em destaque')) {
      
      const count = fullContext.locaisDestaqueCount || 0;
      
      if (count > 0) {
        VoiceService.speak(`Mostrando ${count} locais em destaque na página inicial.`);
      } else {
        VoiceService.speak('Nenhum local em destaque no momento.');
      }
    }
    
    else if (text.includes('ver todos') || text.includes('todos os locais') || 
             text.includes('lista completa') || text.includes('mais locais')) {
      VoiceService.speak('Abrindo página de busca com todos os locais cadastrados');
      NavigationService.navigate('Main', { screen: 'Buscar' });
    }
    
    else if (text.includes('atualizar') || text.includes('recarregar') || 
             text.includes('refresh') || text.includes('atualizar página')) {
      VoiceService.speak('Atualizando a página inicial');
      // Disparar evento de refresh (será capturado pela Home)
      if (fullContext.onRefresh) {
        fullContext.onRefresh();
      } else {
        VoiceService.speak('Não foi possível atualizar automaticamente. Tente puxar a tela para baixo.');
      }
    }
    
    else if (text.includes('buscar') || text.includes('procure') || 
             text.includes('encontre') || text.includes('onde fica') ||
             text.match(/^buscar\s+\w+/i) || text.match(/^procure\s+\w+/i)) {
      
      // Extrair nome do local (remove palavras de comando)
      let nomeLocal = text
        .replace(/buscar|procure|encontre|onde fica|o local|local|chamado|chamada/g, '')
        .trim();
      
      if (nomeLocal && fullContext.buscarLocalPorNome) {
        VoiceService.speak(`Procurando por ${nomeLocal}`);
        fullContext.buscarLocalPorNome(nomeLocal);
      } else if (nomeLocal && fullContext.locaisDestaque?.length > 0) {
        // Busca local nos destaques
        const localEncontrado = fullContext.locaisDestaque.find(local => 
          local.nome?.toLowerCase().includes(nomeLocal.toLowerCase())
        );
        
        if (localEncontrado) {
          VoiceService.speak(`Encontrei ${localEncontrado.nome}. Abrindo detalhes.`);
          NavigationService.navigate('LocalDetalhes', { id: localEncontrado.id });
        } else {
          VoiceService.speak(`Não encontrei nenhum local chamado ${nomeLocal} nos destaques.`);
        }
      } else {
        VoiceService.speak('Diga o nome do local que deseja buscar. Por exemplo: buscar restaurante central');
      }
    }
    
    else if (text.includes('detalhes') || text.includes('mais informações') || 
             text.includes('sobre') || text.includes('informações do local')) {
      
      VoiceService.speak('Toque em qualquer card de local para ver os detalhes completos');
    }
    
    else if (text.includes('ajuda') || text.includes('comandos') || 
             text.includes('o que posso dizer') || text.includes('como usar')) {
      
      const screen = fullContext.screen || 'Home';
      
      if (screen === 'Home') {
        VoiceService.speak(
          'Comandos disponíveis na página inicial: home, perfil, denunciar, configurações, voltar, sair, ' +
          'estatísticas, destaques, ver todos os locais, atualizar página, ' +
          'buscar seguido do nome do local, e ajuda. O que você deseja?'
        );
      } else {
        VoiceService.speak(
          'Comandos gerais: home para página inicial, perfil para seus dados, ' +
          'denunciar para fazer uma denúncia, configurações para ajustes, ' +
          'voltar para tela anterior, sair para encerrar sessão, e ajuda para ouvir os comandos novamente.'
        );
      }
    }
    
    else if (text.includes('obrigado') || text.includes('valeu') || text.includes('obrigada')) {
      VoiceService.speak('Por nada! Estou aqui para ajudar.');
    }
    
    else if (text.includes('tudo bem') || text.includes('como você está') || text.includes('como vai')) {
      VoiceService.speak('Estou funcionando perfeitamente! Como posso ajudar você hoje?');
    }
    
    else {
      const currentScreen = NavigationService.getCurrentRoute() || fullContext.screen || 'página atual';
      VoiceService.speak(
        `Comando não reconhecido. Você está na tela ${currentScreen}. ` +
        'Diga ajuda para ver os comandos disponíveis ou tente novamente.'
      );
    }

    this.isProcessing = false;
  }
}

export default AssistantEngine;