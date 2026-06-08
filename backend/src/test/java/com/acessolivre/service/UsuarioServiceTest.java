package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void listarTodos_DeveRetornarApenasUsuariosAtivos() {
        List<Usuario> usuarios = List.of(criarUsuario(1L, "Ana", "ana@teste.com"));
        when(usuarioRepository.findAllByAtivoTrue()).thenReturn(usuarios);

        List<Usuario> resultado = usuarioService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals("ana@teste.com", resultado.get(0).getEmail());
        verify(usuarioRepository).findAllByAtivoTrue();
    }

    @Test
    void buscarPorId_DeveRetornarUsuarioQuandoExistir() {
        Usuario usuario = criarUsuario(2L, "Bruno", "bruno@teste.com");
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(2L)).thenReturn(Optional.of(usuario));

        Optional<Usuario> resultado = usuarioService.buscarPorId(2L);

        assertTrue(resultado.isPresent());
        assertEquals("Bruno", resultado.get().getNome());
        verify(usuarioRepository).findByIdUsuarioAndAtivoTrue(2L);
    }

    @Test
    void salvar_DeveLancarExcecaoQuandoEmailJaExiste() {
        Usuario usuario = criarUsuario(null, "Carlos", "carlos@teste.com");
        when(usuarioRepository.findByEmail("carlos@teste.com")).thenReturn(Optional.of(criarUsuario(99L, "Outro", "carlos@teste.com")));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> usuarioService.salvar(usuario));

        assertTrue(ex.getMessage().contains("Email já cadastrado"));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void salvar_DevePersistirQuandoEmailNaoExiste() {
        Usuario usuario = criarUsuario(null, "Diana", "diana@teste.com");
        Usuario usuarioSalvo = criarUsuario(10L, "Diana", "diana@teste.com");

        when(usuarioRepository.findByEmail("diana@teste.com")).thenReturn(Optional.empty());
        when(usuarioRepository.save(usuario)).thenReturn(usuarioSalvo);

        Usuario resultado = usuarioService.salvar(usuario);

        assertNotNull(resultado.getIdUsuario());
        assertEquals(10L, resultado.getIdUsuario());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void atualizar_DeveLancarExcecaoQuandoUsuarioNaoExiste() {
        Usuario usuario = criarUsuario(40L, "Eva", "eva@teste.com");
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(40L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> usuarioService.atualizar(usuario));

        assertTrue(ex.getMessage().contains("Usuário não encontrado"));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void atualizar_DevePersistirQuandoUsuarioExiste() {
        Usuario usuario = criarUsuario(5L, "Fábio", "fabio@teste.com");
        usuario.setNome("Fábio Atualizado");

        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(5L)).thenReturn(Optional.of(criarUsuario(5L, "Fábio", "fabio@teste.com")));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        Usuario resultado = usuarioService.atualizar(usuario);

        assertEquals("Fábio Atualizado", resultado.getNome());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void deletar_DeveLancarExcecaoQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(77L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> usuarioService.deletar(77L));

        assertTrue(ex.getMessage().contains("Usuário não encontrado"));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void deletar_DeveFazerSoftDeleteELimparToken() {
        Usuario usuario = criarUsuario(8L, "Gi", "gi@teste.com");
        usuario.setAtivo(true);
        usuario.setTokenAtual("token-antigo");

        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(8L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        usuarioService.deletar(8L);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());

        Usuario salvo = captor.getValue();
        assertFalse(Boolean.TRUE.equals(salvo.getAtivo()));
        assertEquals(null, salvo.getTokenAtual());
    }

    private Usuario criarUsuario(Long id, String nome, String email) {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setAtivo(true);
        return usuario;
    }
}
