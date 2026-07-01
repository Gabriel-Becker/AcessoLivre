import AccessibilitySpeaker from './AccessibilitySpeaker';

class AccessibilityAnnouncer {
  static announcements = {
    Home: {
      onEnter: (context) => {
        const { totalLocais = 0, notificacoes = 0, locaisDestaque = 0 } = context;
        return `Página inicial. ${totalLocais > 0 ? `Existem ${totalLocais} locais cadastrados. ` : ''}${notificacoes > 0 ? `Você tem ${notificacoes} notificações. ` : ''}${locaisDestaque > 0 ? `Há ${locaisDestaque} locais em destaque. ` : ''}Use o botão de voz para emitir comandos.`;
      }
    },
    Buscar: {
      onEnter: (context) => {
        const { totalResultados = 0 } = context;
        return `Página de busca. ${totalResultados > 0 ? `Encontramos ${totalResultados} resultados. ` : ''}Digite ou fale o nome do local que deseja encontrar.`;
      }
    },
    Perfil: {
      onEnter: () => 'Página de perfil. Aqui você pode visualizar e editar seus dados.'
    },
    Denuncia: {
      onEnter: () => 'Página de denúncia. Preencha todos os campos obrigatórios para enviar sua denúncia.'
    },
    Configuracoes: {
      onEnter: () => 'Página de configurações. Ajuste as preferências do aplicativo.'
    },
    LocalDetalhes: {
      onEnter: (context) => {
        const { nomeLocal = 'local' } = context;
        return `Detalhes de ${nomeLocal}. Você pode avaliar, compartilhar ou voltar para a lista.`;
      }
    }
  };

  static announce(screen, context = {}) {
    const announcement = this.announcements[screen];
    if (!announcement) {
      AccessibilitySpeaker.speak(`Tela ${screen} aberta.`);
      return;
    }

    const text = announcement.onEnter(context);
    AccessibilitySpeaker.speak(text);
  }

  static announceSearchResults(total, query = '') {
    if (total === 0) {
      AccessibilitySpeaker.speak('Nenhum resultado encontrado para sua busca.');
    } else {
      AccessibilitySpeaker.speak(`Encontrados ${total} ${total === 1 ? 'resultado' : 'resultados'}${query ? ` para ${query}` : ''}.`);
    }
  }

  static announceLoading(message = 'Carregando') {
    AccessibilitySpeaker.speak(message);
  }

  static announceError(message = 'Ocorreu um erro. Tente novamente.') {
    AccessibilitySpeaker.speak(message);
  }

  static announceSuccess(message = 'Operação realizada com sucesso.') {
    AccessibilitySpeaker.speak(message);
  }
}

export default AccessibilityAnnouncer;