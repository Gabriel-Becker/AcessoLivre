package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.TokenRevogadoRequestDTO;
import com.acessolivre.dto.response.TokenRevogadoResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.TokenRevogadoService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TokenRevogadoControllerTest {

    @Mock
    private TokenRevogadoService tokenRevogadoService;

    @InjectMocks
    private TokenRevogadoController tokenRevogadoController;

    @Test
    void listarTodos_DeveRetornarOkQuandoSucesso() {
        when(tokenRevogadoService.listarTodos()).thenReturn(List.of(criarToken(1L, "token-1")));

        ResponseEntity<List<TokenRevogadoResponseDTO>> response = tokenRevogadoController.listarTodos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void listarTodos_DeveRetornar500QuandoErro() {
        when(tokenRevogadoService.listarTodos()).thenThrow(new RuntimeException("erro"));

        ResponseEntity<List<TokenRevogadoResponseDTO>> response = tokenRevogadoController.listarTodos();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void buscarPorId_DeveRetornarOkQuandoEncontrado() {
        when(tokenRevogadoService.buscarPorId(10L)).thenReturn(Optional.of(criarToken(10L, "abc")));

        ResponseEntity<TokenRevogadoResponseDTO> response = tokenRevogadoController.buscarPorId(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(10L, response.getBody().getId());
    }

    @Test
    void buscarPorId_DeveRetornarNotFoundQuandoAusente() {
        when(tokenRevogadoService.buscarPorId(10L)).thenReturn(Optional.empty());

        ResponseEntity<TokenRevogadoResponseDTO> response = tokenRevogadoController.buscarPorId(10L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void salvar_DeveRetornarCreatedQuandoSucesso() {
        TokenRevogadoRequestDTO request = TokenRevogadoRequestDTO.builder()
            .dataRevogacao(LocalDateTime.now())
            .token("novo-token")
            .usuarioId(1L)
            .build();

        when(tokenRevogadoService.salvar(any(TokenRevogadoRequestDTO.class))).thenReturn(criarToken(3L, "novo-token"));

        ResponseEntity<TokenRevogadoResponseDTO> response = tokenRevogadoController.salvar(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void salvar_DeveRetornarBadRequestQuandoErroValidacao() {
        TokenRevogadoRequestDTO request = TokenRevogadoRequestDTO.builder()
            .dataRevogacao(LocalDateTime.now())
            .token("invalido")
            .usuarioId(1L)
            .build();

        when(tokenRevogadoService.salvar(any(TokenRevogadoRequestDTO.class))).thenThrow(new IllegalArgumentException("dados inválidos"));

        ResponseEntity<TokenRevogadoResponseDTO> response = tokenRevogadoController.salvar(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarNotFoundQuandoNaoExistir() {
        org.mockito.Mockito.doThrow(new IllegalArgumentException("não encontrado")).when(tokenRevogadoService).deletar(99L);

        ResponseEntity<Void> response = tokenRevogadoController.deletar(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void verificarTokenRevogado_DeveRetornarBoolean() {
        when(tokenRevogadoService.isTokenRevogado("abc")).thenReturn(true);

        ResponseEntity<Boolean> response = tokenRevogadoController.verificarTokenRevogado("abc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Boolean.TRUE, response.getBody());
    }

    @Test
    void buscarPorUsuario_DeveRetornarLista() {
        when(tokenRevogadoService.buscarPorUsuario(1L)).thenReturn(List.of(criarToken(7L, "t-7")));

        ResponseEntity<List<TokenRevogadoResponseDTO>> response = tokenRevogadoController.buscarPorUsuario(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    private TokenRevogado criarToken(Long id, String token) {
        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .nome("Admin")
            .email("admin@teste.com")
            .role(Role.ROLE_ADMIN)
            .ativo(true)
            .build();

        return TokenRevogado.builder()
            .id(id)
            .token(token)
            .dataRevogacao(LocalDateTime.now().minusMinutes(1))
            .expiracao(LocalDateTime.now().plusHours(1))
            .usuario(usuario)
            .build();
    }
}
