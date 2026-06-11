package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

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

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.dto.response.AvaliacaoResponseDTO;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.AvaliacaoService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AvaliacaoControllerTest {

    @Mock
    private AvaliacaoService avaliacaoService;

    @InjectMocks
    private AvaliacaoController avaliacaoController;

    @Test
    void listarPublicas_DeveRetornarPaginaDTOsComStatus200() {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Gabriel").email("g@test.com").build();
        Local local = Local.builder().idLocal(1L).nome("Local").build();
        Avaliacao avaliacao = Avaliacao.builder()
            .idAvaliacao(1L)
            .notaAcessibilidadeVisual(4)
            .notaAcessibilidadeMotora(5)
            .notaAcessibilidadeAuditiva(3)
            .notaGeral(4.0)
            .usuario(usuario)
            .local(local)
            .moderado(true)
            .build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<Avaliacao> page = new PageImpl<>(List.of(avaliacao));
        when(avaliacaoService.listarTodos(any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<AvaliacaoResponseDTO>> resultado = avaliacaoController.listarPublicas(0, 20, "dataAvaliacao");

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().getTotalElements());
    }

    @Test
    void buscarPorId_DeveRetornarDTOComStatus200QuandoExistir() {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Gabriel").build();
        Local local = Local.builder().idLocal(1L).nome("Local").build();
        Avaliacao avaliacao = Avaliacao.builder()
            .idAvaliacao(1L)
            .notaAcessibilidadeVisual(4)
            .notaAcessibilidadeMotora(5)
            .notaAcessibilidadeAuditiva(3)
            .notaGeral(4.0)
            .usuario(usuario)
            .local(local)
            .build();

        when(avaliacaoService.buscarPorId(1L)).thenReturn(Optional.of(avaliacao));

        ResponseEntity<AvaliacaoResponseDTO> resultado = avaliacaoController.buscarPorId(1L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1L, resultado.getBody().getIdAvaliacao());
    }

    @Test
    void buscarPorId_DeveRetornar404QuandoNaoExistir() {
        when(avaliacaoService.buscarPorId(999L)).thenReturn(Optional.empty());

        ResponseEntity<AvaliacaoResponseDTO> resultado = avaliacaoController.buscarPorId(999L);

        assertEquals(HttpStatus.NOT_FOUND, resultado.getStatusCode());
    }

    @Test
    void listarPorLocal_DeveRetornarListaDTOsComStatus200() {
        Usuario usuario = Usuario.builder().idUsuario(1L).build();
        Local local = Local.builder().idLocal(1L).nome("Local").build();
        Avaliacao avaliacao = Avaliacao.builder()
            .idAvaliacao(1L)
            .notaGeral(4.0)
            .usuario(usuario)
            .local(local)
            .build();

        when(avaliacaoService.buscarPublicasPorLocal(1L)).thenReturn(List.of(avaliacao));

        ResponseEntity<List<AvaliacaoResponseDTO>> resultado = avaliacaoController.listarPorLocal(1L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().size());
    }

    @Test
    void listarPorUsuario_DeveRetornarListaDTOsComStatus200() {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Gabriel").build();
        Local local = Local.builder().idLocal(1L).build();
        Avaliacao avaliacao = Avaliacao.builder()
            .idAvaliacao(1L)
            .usuario(usuario)
            .local(local)
            .build();

        when(avaliacaoService.buscarPorUsuario(1L)).thenReturn(List.of(avaliacao));

        ResponseEntity<List<AvaliacaoResponseDTO>> resultado = avaliacaoController.listarPorUsuario(1L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().size());
    }

    @Test
    void criar_DeveRetornarDTOComStatus201() {
        AvaliacaoRequestDTO request = AvaliacaoRequestDTO.builder()
            .notaAcessibilidadeVisual(4)
            .notaAcessibilidadeMotora(5)
            .notaAcessibilidadeAuditiva(3)
            .idUsuario(1L)
            .idLocal(1L)
            .build();

        Usuario usuario = Usuario.builder().idUsuario(1L).build();
        Local local = Local.builder().idLocal(1L).build();
        Avaliacao criada = Avaliacao.builder()
            .idAvaliacao(100L)
            .notaGeral(4.0)
            .usuario(usuario)
            .local(local)
            .build();

        when(avaliacaoService.salvar(any(AvaliacaoRequestDTO.class))).thenReturn(criada);

        ResponseEntity<AvaliacaoResponseDTO> resultado = avaliacaoController.criar(request);

        assertEquals(HttpStatus.CREATED, resultado.getStatusCode());
        assertEquals(100L, resultado.getBody().getIdAvaliacao());
    }

    @Test
    void deletar_DeveRetornar204QuandoDeletada() {
        when(avaliacaoService.deletar(1L)).thenReturn(true);

        ResponseEntity<Void> resultado = avaliacaoController.deletar(1L);

        assertEquals(HttpStatus.NO_CONTENT, resultado.getStatusCode());
    }

    @Test
    void deletar_DeveRetornar404QuandoNaoExistir() {
        when(avaliacaoService.deletar(999L)).thenReturn(false);

        ResponseEntity<Void> resultado = avaliacaoController.deletar(999L);

        assertEquals(HttpStatus.NOT_FOUND, resultado.getStatusCode());
    }
}
