package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.acessolivre.enums.TipoDenuncia;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ConteudoModeracaoServiceTest {

    @Mock
    private LocalService localService;

    @Mock
    private AvaliacaoService avaliacaoService;

    @InjectMocks
    private ConteudoModeracaoService conteudoModeracaoService;

    @Test
    void removerConteudoDenunciado_DeveRemoverLocalQuandoTipoForLocal() {
        String mensagem = conteudoModeracaoService.removerConteudoDenunciado(TipoDenuncia.LOCAL, 12L);

        assertEquals(" Local ID 12 foi desativado (exclusão lógica)", mensagem);
        verify(localService).removerLocal(12L);
    }

    @Test
    void removerConteudoDenunciado_DeveRemoverAvaliacaoQuandoTipoForAvaliacao() {
        String mensagem = conteudoModeracaoService.removerConteudoDenunciado(TipoDenuncia.AVALIACAO, 18L);

        assertEquals("Avaliação ID 18 foi ocultada (exclusão lógica)", mensagem);
        verify(avaliacaoService).removerAvaliacao(18L);
    }

    @Test
    void removerConteudoDenunciado_DeveRetornarMensagemSemRemocaoParaTipoNaoSuportado() {
        String mensagem = conteudoModeracaoService.removerConteudoDenunciado(TipoDenuncia.COMENTARIO, 21L);

        assertEquals("Nenhum conteúdo foi removido (tipo de denúncia não suportado)", mensagem);
        verifyNoInteractions(localService, avaliacaoService);
    }

    @Test
    void removerConteudoDenunciado_DeveLancarRuntimeQuandoServicoFalhar() {
        doThrow(new IllegalStateException("erro interno")).when(localService).removerLocal(30L);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> conteudoModeracaoService.removerConteudoDenunciado(TipoDenuncia.LOCAL, 30L));

        assertEquals("Falha ao remover conteúdo: erro interno", ex.getMessage());
    }
}
