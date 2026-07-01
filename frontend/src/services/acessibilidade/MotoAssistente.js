import ServicoVoz from './ServicoVoz';
import ServicoNavegacao from './ServicoNavegacao';

class MotoAssistente {
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

  // MÃ©todo para atualizar o contexto da tela atual
  static updateContext(context) {
    this.currentContext = { ...this.currentContext, ...context };
    console.log('ðŸ“¢ Contexto do assistente atualizado:', this.currentContext);
  }

  // MÃ©todo para obter o contexto atual
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

    if (text.includes('home') || text.includes('inÃ­cio') || text.includes('inicio') || text.includes('principal')) {
      ServicoVoz.speak('Indo para a pÃ¡gina inicial');
      ServicoNavegacao.resetTo('Main', { screen: 'Inicio' });
    }
    
    else if (text.includes('perfil') || text.includes('meu perfil') || text.includes('minha conta')) {
      ServicoVoz.speak('Abrindo seu perfil');
      ServicoNavegacao.navigate('Main', { screen: 'Perfil' });
    }
    
    else if (text.includes('denunciar') || text.includes('reportar') || text.includes('fazer denÃºncia')) {
      ServicoVoz.speak('Abrindo formulÃ¡rio de denÃºncia');
      ServicoNavegacao.navigate('Main', { screen: 'Denuncia' });
    }
    
    else if (text.includes('configuraÃ§Ãµes') || text.includes('configuracoes') || text.includes('ajustes')) {
      ServicoVoz.speak('Abrindo configuraÃ§Ãµes');
      ServicoNavegacao.navigate('Main', { screen: 'Configuracoes' });
    }
    
    else if (text.includes('voltar') || text.includes('retornar') || text.includes('volta')) {
      if (ServicoNavegacao.canGoBack()) {
        ServicoVoz.speak('Voltando');
        ServicoNavegacao.goBack();
      } else {
        ServicoVoz.speak('NÃ£o Ã© possÃ­vel voltar, vocÃª jÃ¡ estÃ¡ na tela inicial');
      }
    }
    
    else if (text.includes('sair') || text.includes('logout') || text.includes('deslogar')) {
      ServicoVoz.speak('Saindo do aplicativo');
      ServicoNavegacao.resetTo('Entrar');
    }
    
    else if (text.includes('estatÃ­sticas') || text.includes('estatisticas') || 
             text.includes('quantos locais') || text.includes('total de locais') ||
             text.includes('quantas avaliaÃ§Ãµes') || text.includes('total de avaliaÃ§Ãµes')) {
      
      const totalLocais = fullContext.totalLocais || 0;
      const totalAvaliacoes = fullContext.totalAvaliacoes || 0;
      
      if (totalLocais > 0) {
        ServicoVoz.speak(`Total de ${totalLocais} locais cadastrados e ${totalAvaliacoes} avaliaÃ§Ãµes registradas.`);
      } else {
        ServicoVoz.speak('Carregando estatÃ­sticas. Tente novamente em alguns instantes.');
      }
    }
    
    else if (text.includes('destaques') || text.includes('locais em destaque') || 
             text.includes('quantos destaques') || text.includes('em destaque')) {
      
      const count = fullContext.locaisDestaqueCount || 0;
      
      if (count > 0) {
        ServicoVoz.speak(`Mostrando ${count} locais em destaque na pÃ¡gina inicial.`);
      } else {
        ServicoVoz.speak('Nenhum local em destaque no momento.');
      }
    }
    
    else if (text.includes('ver todos') || text.includes('todos os locais') || 
             text.includes('lista completa') || text.includes('mais locais')) {
      ServicoVoz.speak('Abrindo pÃ¡gina de busca com todos os locais cadastrados');
      ServicoNavegacao.navigate('Main', { screen: 'Buscar' });
    }
    
    else if (text.includes('atualizar') || text.includes('recarregar') || 
             text.includes('refresh') || text.includes('atualizar pÃ¡gina')) {
      ServicoVoz.speak('Atualizando a pÃ¡gina inicial');
      // Disparar evento de refresh (serÃ¡ capturado pela Home)
      if (fullContext.onRefresh) {
        fullContext.onRefresh();
      } else {
        ServicoVoz.speak('NÃ£o foi possÃ­vel atualizar automaticamente. Tente puxar a tela para baixo.');
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
        ServicoVoz.speak(`Procurando por ${nomeLocal}`);
        fullContext.buscarLocalPorNome(nomeLocal);
      } else if (nomeLocal && fullContext.locaisDestaque?.length > 0) {
        // Busca local nos destaques
        const localEncontrado = fullContext.locaisDestaque.find(local => 
          local.nome?.toLowerCase().includes(nomeLocal.toLowerCase())
        );
        
        if (localEncontrado) {
          ServicoVoz.speak(`Encontrei ${localEncontrado.nome}. Abrindo detalhes.`);
          ServicoNavegacao.navigate('LocalDetalhes', { id: localEncontrado.id });
        } else {
          ServicoVoz.speak(`NÃ£o encontrei nenhum local chamado ${nomeLocal} nos destaques.`);
        }
      } else {
        ServicoVoz.speak('Diga o nome do local que deseja buscar. Por exemplo: buscar restaurante central');
      }
    }
    
    else if (text.includes('detalhes') || text.includes('mais informaÃ§Ãµes') || 
             text.includes('sobre') || text.includes('informaÃ§Ãµes do local')) {
      
      ServicoVoz.speak('Toque em qualquer card de local para ver os detalhes completos');
    }
    
    else if (text.includes('ajuda') || text.includes('comandos') || 
             text.includes('o que posso dizer') || text.includes('como usar')) {
      
      const screen = fullContext.screen || 'Home';
      
      if (screen === 'Home') {
        ServicoVoz.speak(
          'Comandos disponÃ­veis na pÃ¡gina inicial: home, perfil, denunciar, configuraÃ§Ãµes, voltar, sair, ' +
          'estatÃ­sticas, destaques, ver todos os locais, atualizar pÃ¡gina, ' +
          'buscar seguido do nome do local, e ajuda. O que vocÃª deseja?'
        );
      } else {
        ServicoVoz.speak(
          'Comandos gerais: home para pÃ¡gina inicial, perfil para seus dados, ' +
          'denunciar para fazer uma denÃºncia, configuraÃ§Ãµes para ajustes, ' +
          'voltar para tela anterior, sair para encerrar sessÃ£o, e ajuda para ouvir os comandos novamente.'
        );
      }
    }
    
    else if (text.includes('obrigado') || text.includes('valeu') || text.includes('obrigada')) {
      ServicoVoz.speak('Por nada! Estou aqui para ajudar.');
    }
    
    else if (text.includes('tudo bem') || text.includes('como vocÃª estÃ¡') || text.includes('como vai')) {
      ServicoVoz.speak('Estou funcionando perfeitamente! Como posso ajudar vocÃª hoje?');
    }
    
    else {
      const currentScreen = ServicoNavegacao.getCurrentRoute() || fullContext.screen || 'pÃ¡gina atual';
      ServicoVoz.speak(
        `Comando nÃ£o reconhecido. VocÃª estÃ¡ na tela ${currentScreen}. ` +
        'Diga ajuda para ver os comandos disponÃ­veis ou tente novamente.'
      );
    }

    this.isProcessing = false;
  }
}

export default MotoAssistente;
