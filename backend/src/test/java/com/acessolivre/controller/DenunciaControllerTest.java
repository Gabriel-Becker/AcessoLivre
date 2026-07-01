package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.request.AtualizarStatusRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.dto.response.ResolucaoDenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.security.FachadaAutenticacao;
import com.acessolivre.service.DenunciaService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class DenunciaControllerTest {

    @Mock
    private DenunciaService denunciaService;

    @Mock
    private FachadaAutenticacao authenticationFacade;

    @InjectMocks
    private DenunciaController denunciaController;

    @Test
    void criarDenuncia_DeveRetornar201() {
        DenunciaRequestDTO request = DenunciaRequestDTO.builder()
            .tipo(TipoDenuncia.LOCAL)
            .targetId(10L)
            .motivo("SPAM")
            .build();

        DenunciaResponseDTO response = DenunciaResponseDTO.builder()
            .id(1L)
            .tipo(TipoDenuncia.LOCAL)
            .targetId(10L)
            .status(StatusDenuncia.PENDING)
            .build();

        when(authenticationFacade.obterIdUsuarioAutenticado()).thenReturn(5L);
        when(denunciaService.criarDenuncia(request, 5L)).thenReturn(response);

        ResponseEntity<DenunciaResponseDTO> resultado = denunciaController.criarDenuncia(request);

        assertEquals(HttpStatus.CREATED, resultado.getStatusCode());
        assertEquals(1L, resultado.getBody().getId());
    }

    @Test
    void buscarPorId_DeveRetornar200() {
        DenunciaResponseDTO response = DenunciaResponseDTO.builder().id(20L).build();
        when(denunciaService.buscarPorId(20L)).thenReturn(response);

        ResponseEntity<DenunciaResponseDTO> resultado = denunciaController.buscarPorId(20L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(20L, resultado.getBody().getId());
    }

    @Test
    void listarDenuncias_DeveRetornarPaginaCom200() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<DenunciaResponseDTO> page = new PageImpl<>(List.of(DenunciaResponseDTO.builder().id(3L).build()), pageable, 1);
        when(denunciaService.listarDenuncias(any(), any(), any(), any(), any(), any(), eq(pageable))).thenReturn(page);

        ResponseEntity<Page<DenunciaResponseDTO>> resultado = denunciaController.listarDenuncias(
            TipoDenuncia.LOCAL,
            StatusDenuncia.PENDING,
            "busca",
            null,
            null,
            1L,
            pageable
        );

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().getTotalElements());
    }

    @Test
    void buscarPorTarget_DeveRetornar200() {
        List<DenunciaResponseDTO> lista = List.of(DenunciaResponseDTO.builder().id(11L).build());
        when(denunciaService.buscarPorTarget(TipoDenuncia.AVALIACAO, 8L)).thenReturn(lista);

        ResponseEntity<List<DenunciaResponseDTO>> resultado = denunciaController.buscarPorTarget(TipoDenuncia.AVALIACAO, 8L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().size());
    }

    @Test
    void atualizarStatus_DeveRetornar200() {
        AtualizarStatusRequestDTO request = AtualizarStatusRequestDTO.builder()
            .status(StatusDenuncia.REVIEWED)
            .observacoes("ok")
            .build();
        DenunciaResponseDTO response = DenunciaResponseDTO.builder().id(15L).status(StatusDenuncia.REVIEWED).build();

        when(authenticationFacade.obterEmailUsuarioAutenticado()).thenReturn("admin@email.com");
        when(denunciaService.atualizarStatus(15L, StatusDenuncia.REVIEWED, "admin@email.com", "ok")).thenReturn(response);

        ResponseEntity<DenunciaResponseDTO> resultado = denunciaController.atualizarStatus(15L, request, null);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(StatusDenuncia.REVIEWED, resultado.getBody().getStatus());
    }

    @Test
    void resolverDenuncia_DeveRetornar200() {
        ResolucaoDenunciaResponseDTO response = ResolucaoDenunciaResponseDTO.builder()
            .denunciaId(9L)
            .status(StatusDenuncia.RESOLVED)
            .build();

        when(authenticationFacade.obterEmailUsuarioAutenticado()).thenReturn("mod@email.com");
        when(denunciaService.resolverDenuncia(9L, "mod@email.com")).thenReturn(response);

        ResponseEntity<ResolucaoDenunciaResponseDTO> resultado = denunciaController.resolverDenuncia(9L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(9L, resultado.getBody().getDenunciaId());
    }

    @Test
    void rejeitarDenuncia_DeveRetornar200ComObservacaoDoRequest() {
        ResolucaoDenunciaResponseDTO response = ResolucaoDenunciaResponseDTO.builder()
            .denunciaId(18L)
            .status(StatusDenuncia.REJECTED)
            .build();

        when(authenticationFacade.obterEmailUsuarioAutenticado()).thenReturn("mod@email.com");
        when(denunciaService.rejeitarDenuncia(18L, "mod@email.com", "sem fundamento")).thenReturn(response);

        ResponseEntity<ResolucaoDenunciaResponseDTO> resultado = denunciaController.rejeitarDenuncia(18L, Map.of("observacoes", "sem fundamento"));

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(StatusDenuncia.REJECTED, resultado.getBody().getStatus());
    }

    @Test
    void atualizarStatusEmMassa_DeveRetornar204EChamarServiceParaCadaId() {
        when(authenticationFacade.obterEmailUsuarioAutenticado()).thenReturn("mod@email.com");

        ResponseEntity<Void> resultado = denunciaController.atualizarStatusEmMassa(Map.of(
            "ids", List.of(1L, 2L),
            "status", "REVIEWED"
        ));

        assertEquals(HttpStatus.NO_CONTENT, resultado.getStatusCode());
        verify(denunciaService).atualizarStatus(1L, StatusDenuncia.REVIEWED, "mod@email.com", null);
        verify(denunciaService).atualizarStatus(2L, StatusDenuncia.REVIEWED, "mod@email.com", null);
    }

    @Test
    void excluirEndpoints_DeveRetornar204() {
        ResponseEntity<Void> excluirUm = denunciaController.excluirDenuncia(30L);
        ResponseEntity<Void> excluirMassa = denunciaController.excluirDenunciasEmMassa(List.of(1L, 2L));

        assertEquals(HttpStatus.NO_CONTENT, excluirUm.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, excluirMassa.getStatusCode());
        verify(denunciaService).excluirDenuncia(30L);
        verify(denunciaService).excluirDenunciasEmMassa(List.of(1L, 2L));
    }

    @Test
    void verificarDenuncia_DeveRetornarMapaReported() {
        when(authenticationFacade.obterIdUsuarioAutenticado()).thenReturn(44L);
        when(denunciaService.usuarioJaDenunciou(44L, TipoDenuncia.USUARIO, 77L)).thenReturn(true);

        ResponseEntity<Map<String, Boolean>> resultado = denunciaController.verificarDenuncia(TipoDenuncia.USUARIO, 77L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertNotNull(resultado.getBody());
        assertEquals(true, resultado.getBody().get("reported"));
    }

    @Test
    void obterEstatisticas_DeveRetornarTotais() {
        when(denunciaService.contarPorStatus(StatusDenuncia.PENDING)).thenReturn(2L);
        when(denunciaService.contarPorStatus(StatusDenuncia.REVIEWED)).thenReturn(3L);
        when(denunciaService.contarPorStatus(StatusDenuncia.RESOLVED)).thenReturn(4L);
        when(denunciaService.contarPorStatus(StatusDenuncia.REJECTED)).thenReturn(1L);

        ResponseEntity<Map<String, Long>> resultado = denunciaController.obterEstatisticas();

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(10L, resultado.getBody().get("TOTAL"));
    }
}
