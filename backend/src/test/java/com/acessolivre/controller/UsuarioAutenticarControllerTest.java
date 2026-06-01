package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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

import com.acessolivre.dto.request.UsuarioAutenticarRequestDTO;
import com.acessolivre.dto.response.UsuarioAutenticarResponseDTO;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.service.UsuarioAutenticarService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class UsuarioAutenticarControllerTest {

    @Mock
    private UsuarioAutenticarService usuarioAutenticarService;

    @InjectMocks
    private UsuarioAutenticarController usuarioAutenticarController;

    @Test
    void listarTodos_DeveRetornarOkQuandoSucesso() {
        when(usuarioAutenticarService.listarTodos()).thenReturn(List.of(criarRegistro(1L, 10L)));

        ResponseEntity<List<UsuarioAutenticarResponseDTO>> response = usuarioAutenticarController.listarTodos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(10L, response.getBody().get(0).getUsuarioId());
    }

    @Test
    void listarTodos_DeveRetornar500QuandoOcorrerErro() {
        when(usuarioAutenticarService.listarTodos()).thenThrow(new RuntimeException("erro"));

        ResponseEntity<List<UsuarioAutenticarResponseDTO>> response = usuarioAutenticarController.listarTodos();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void buscarPorId_DeveRetornarOkQuandoEncontrado() {
        when(usuarioAutenticarService.buscarPorId(5L)).thenReturn(Optional.of(criarRegistro(5L, 22L)));

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.buscarPorId(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(22L, response.getBody().getUsuarioId());
    }

    @Test
    void buscarPorId_DeveRetornarNotFoundQuandoNaoEncontrado() {
        when(usuarioAutenticarService.buscarPorId(99L)).thenReturn(Optional.empty());

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.buscarPorId(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void buscarPorId_DeveRetornar500QuandoOcorrerErro() {
        when(usuarioAutenticarService.buscarPorId(9L)).thenThrow(new RuntimeException("erro"));

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.buscarPorId(9L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void salvar_DeveRetornarCreatedQuandoSucesso() {
        UsuarioAutenticarRequestDTO request = UsuarioAutenticarRequestDTO.builder()
            .usuarioId(7L)
            .senhaHash("Senha@123")
            .dataExpiracao(LocalDateTime.now().plusMonths(6))
            .build();

        when(usuarioAutenticarService.salvar(any(UsuarioAutenticar.class))).thenReturn(criarRegistro(100L, 7L));

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.salvar(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(100L, response.getBody().getIdUsuarioAutenticar());
    }

    @Test
    void salvar_DeveRetornar500QuandoOcorrerErro() {
        UsuarioAutenticarRequestDTO request = UsuarioAutenticarRequestDTO.builder()
            .usuarioId(7L)
            .senhaHash("Senha@123")
            .dataExpiracao(LocalDateTime.now().plusMonths(6))
            .build();

        when(usuarioAutenticarService.salvar(any(UsuarioAutenticar.class))).thenThrow(new RuntimeException("erro"));

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.salvar(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void atualizar_DeveRetornarNotFoundQuandoNaoEncontrarRegistro() {
        UsuarioAutenticarRequestDTO request = UsuarioAutenticarRequestDTO.builder()
            .usuarioId(3L)
            .senhaHash("Senha@123")
            .dataExpiracao(LocalDateTime.now().plusMonths(3))
            .build();

        when(usuarioAutenticarService.buscarPorId(3L)).thenReturn(Optional.empty());

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.atualizar(3L, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void atualizar_DeveRetornarOkQuandoSucesso() {
        UsuarioAutenticarRequestDTO request = UsuarioAutenticarRequestDTO.builder()
            .usuarioId(8L)
            .senhaHash("Senha@123")
            .dataExpiracao(LocalDateTime.now().plusMonths(3))
            .build();

        when(usuarioAutenticarService.buscarPorId(8L)).thenReturn(Optional.of(criarRegistro(8L, 8L)));
        when(usuarioAutenticarService.salvar(any(UsuarioAutenticar.class))).thenReturn(criarRegistro(8L, 8L));

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.atualizar(8L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(8L, response.getBody().getIdUsuarioAutenticar());
    }

    @Test
    void atualizar_DeveRetornar500QuandoOcorrerErro() {
        UsuarioAutenticarRequestDTO request = UsuarioAutenticarRequestDTO.builder()
            .usuarioId(8L)
            .senhaHash("Senha@123")
            .dataExpiracao(LocalDateTime.now().plusMonths(3))
            .build();

        when(usuarioAutenticarService.buscarPorId(8L)).thenThrow(new RuntimeException("erro"));

        ResponseEntity<UsuarioAutenticarResponseDTO> response = usuarioAutenticarController.atualizar(8L, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarNoContentQuandoSucesso() {
        when(usuarioAutenticarService.deletar(6L)).thenReturn(true);

        ResponseEntity<Void> response = usuarioAutenticarController.deletar(6L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(usuarioAutenticarService).deletar(6L);
    }

    @Test
    void deletar_DeveRetornarNotFoundQuandoNaoEncontrado() {
        when(usuarioAutenticarService.deletar(60L)).thenReturn(false);

        ResponseEntity<Void> response = usuarioAutenticarController.deletar(60L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornar500QuandoOcorrerErro() {
        when(usuarioAutenticarService.deletar(70L)).thenThrow(new RuntimeException("erro"));

        ResponseEntity<Void> response = usuarioAutenticarController.deletar(70L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    private UsuarioAutenticar criarRegistro(Long idRegistro, Long idUsuario) {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(idUsuario);

        UsuarioAutenticar registro = new UsuarioAutenticar();
        registro.setIdUsuarioAutenticar(idRegistro);
        registro.setUsuario(usuario);
        registro.setSenhaHash("hash");
        registro.setDataExpiracao(LocalDateTime.now().plusDays(90));
        return registro;
    }
}
