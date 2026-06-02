package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.ImagemService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ImagemControllerTest {

    @Mock
    private ImagemService imagemService;

    @InjectMocks
    private ImagemController imagemController;

    @Test
    void listarTodos_DeveRetornarOk() {
        when(imagemService.listarTodos()).thenReturn(List.of(criarImagem(1L)));

        ResponseEntity<List<ImagemResponseDTO>> response = imagemController.listarTodos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void buscarPorId_DeveRetornarOkQuandoEncontrada() {
        when(imagemService.buscarPorId(10L)).thenReturn(Optional.of(criarImagem(10L)));

        ResponseEntity<ImagemResponseDTO> response = imagemController.buscarPorId(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(10L, response.getBody().getIdImagem());
    }

    @Test
    void buscarPorId_DeveRetornarNotFoundQuandoAusente() {
        when(imagemService.buscarPorId(99L)).thenReturn(Optional.empty());

        ResponseEntity<ImagemResponseDTO> response = imagemController.buscarPorId(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void buscarPorLocal_DeveRetornarOk() {
        when(imagemService.buscarPorLocal(5L)).thenReturn(List.of(criarImagem(2L)));

        ResponseEntity<List<ImagemResponseDTO>> response = imagemController.buscarPorLocal(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void salvar_DeveRetornarCreatedQuandoSucesso() {
        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.jpg", "image/jpeg", "abc".getBytes());
        when(imagemService.salvar(any())).thenReturn(criarImagem(3L));

        ResponseEntity<?> response = imagemController.salvar(arquivo, 8L, 1);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void salvar_DeveRetornarBadRequestQuandoErroValidacao() {
        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.jpg", "image/jpeg", "abc".getBytes());
        when(imagemService.salvar(any())).thenThrow(new IllegalArgumentException("arquivo inválido"));

        ResponseEntity<?> response = imagemController.salvar(arquivo, 8L, 1);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("arquivo inválido", body.get("error"));
    }

    @Test
    void salvar_DeveRetornarInternalServerErrorQuandoFalhaInterna() {
        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.jpg", "image/jpeg", "abc".getBytes());
        when(imagemService.salvar(any())).thenThrow(new RuntimeException("erro interno"));

        ResponseEntity<?> response = imagemController.salvar(arquivo, 8L, 1);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarNoContentQuandoSucesso() {
        when(imagemService.deletar(4L)).thenReturn(true);

        ResponseEntity<Void> response = imagemController.deletar(4L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarNotFoundQuandoNaoExiste() {
        when(imagemService.deletar(4L)).thenReturn(false);

        ResponseEntity<Void> response = imagemController.deletar(4L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    private Imagem criarImagem(Long id) {
        return Imagem.builder()
            .idImagem(id)
            .idLocal(8L)
            .uuid("uuid-" + id)
            .caminhoRelativo("/uploads/imagem-" + id + ".jpg")
            .nomeOriginal("imagem.jpg")
            .build();
    }
}
