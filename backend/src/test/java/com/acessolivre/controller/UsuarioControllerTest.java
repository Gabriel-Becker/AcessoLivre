package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.UsuarioRequestDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class UsuarioControllerTest {

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private UsuarioController usuarioController;

    @Test
    void listarTodos_DeveRetornarOkQuandoSucesso() {
        when(usuarioService.listarTodos()).thenReturn(List.of(criarUsuario(1L, "Ana", "ana@teste.com")));

        ResponseEntity<List<UsuarioResponseDTO>> response = usuarioController.listarTodos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("ana@teste.com", response.getBody().get(0).getEmail());
    }

    @Test
    void listarTodos_DeveRetornar500QuandoOcorrerErro() {
        when(usuarioService.listarTodos()).thenThrow(new RuntimeException("erro"));

        ResponseEntity<List<UsuarioResponseDTO>> response = usuarioController.listarTodos();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void buscarPorId_DeveRetornarOkQuandoEncontrado() {
        when(usuarioService.buscarPorId(2L)).thenReturn(Optional.of(criarUsuario(2L, "Bruno", "bruno@teste.com")));

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.buscarPorId(2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Bruno", response.getBody().getNome());
    }

    @Test
    void buscarPorId_DeveRetornarNotFoundQuandoNaoEncontrado() {
        when(usuarioService.buscarPorId(99L)).thenReturn(Optional.empty());

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.buscarPorId(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void salvar_DeveRetornarCreatedQuandoSucesso() {
        UsuarioRequestDTO request = UsuarioRequestDTO.builder()
            .nome("Carla")
            .email("carla@teste.com")
            .role("ROLE_USER")
            .imagemPerfil("http://imagem")
            .build();

        when(usuarioService.salvar(any(Usuario.class))).thenReturn(criarUsuario(10L, "Carla", "carla@teste.com"));

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.salvar(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(10L, response.getBody().getIdUsuario());
    }

    @Test
    void salvar_DeveRetornarBadRequestQuandoErroValidacao() {
        UsuarioRequestDTO request = UsuarioRequestDTO.builder()
            .nome("Carla")
            .email("carla@teste.com")
            .role("ROLE_USER")
            .build();

        when(usuarioService.salvar(any(Usuario.class))).thenThrow(new IllegalArgumentException("email duplicado"));

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.salvar(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void atualizar_DeveRetornarNotFoundQuandoUsuarioNaoExiste() {
        UsuarioRequestDTO request = UsuarioRequestDTO.builder()
            .nome("Novo")
            .email("novo@teste.com")
            .build();

        when(usuarioService.buscarPorId(50L)).thenReturn(Optional.empty());

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.atualizar(50L, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void atualizar_DeveRetornarOkQuandoSucesso() {
        Usuario existente = criarUsuario(5L, "Diego", "diego@teste.com");
        Usuario atualizado = criarUsuario(5L, "Diego Atualizado", "diego@teste.com");

        UsuarioRequestDTO request = UsuarioRequestDTO.builder()
            .nome("Diego Atualizado")
            .email("diego@teste.com")
            .role("ROLE_ADMIN")
            .imagemPerfil("http://foto")
            .build();

        when(usuarioService.buscarPorId(5L)).thenReturn(Optional.of(existente));
        when(usuarioService.atualizar(any(Usuario.class))).thenReturn(atualizado);

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.atualizar(5L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Diego Atualizado", response.getBody().getNome());
    }

    @Test
    void atualizar_DeveRetornarBadRequestQuandoErroValidacao() {
        UsuarioRequestDTO request = UsuarioRequestDTO.builder()
            .nome("Eli")
            .email("eli@teste.com")
            .build();

        when(usuarioService.buscarPorId(3L)).thenReturn(Optional.of(criarUsuario(3L, "Eli", "eli@teste.com")));
        when(usuarioService.atualizar(any(Usuario.class))).thenThrow(new IllegalArgumentException("erro de validação"));

        ResponseEntity<UsuarioResponseDTO> response = usuarioController.atualizar(3L, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarNotFoundQuandoUsuarioNaoExiste() {
        when(usuarioService.buscarPorId(77L)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = usuarioController.deletar(77L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarNoContentQuandoSucesso() {
        when(usuarioService.buscarPorId(9L)).thenReturn(Optional.of(criarUsuario(9L, "Fabi", "fabi@teste.com")));

        ResponseEntity<Void> response = usuarioController.deletar(9L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(usuarioService).deletar(9L);
    }

    @Test
    void deletar_DeveRetornar500QuandoOcorrerErro() {
        when(usuarioService.buscarPorId(8L)).thenReturn(Optional.of(criarUsuario(8L, "Gui", "gui@teste.com")));
        doThrow(new RuntimeException("erro interno")).when(usuarioService).deletar(8L);

        ResponseEntity<Void> response = usuarioController.deletar(8L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    private Usuario criarUsuario(Long id, String nome, String email) {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setRole(Role.ROLE_USER);
        usuario.setAtivo(true);
        return usuario;
    }
}
