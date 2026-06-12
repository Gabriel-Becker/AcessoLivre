package com.acessolivre.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class RegistroPendenteServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RegistroPendenteService registroPendenteService;

    @Test
    void registrarUsuarioDireto_DeveLancarExcecaoQuandoEmailJaExiste() {
        when(usuarioRepository.findByEmail("ana@teste.com")).thenReturn(Optional.of(new Usuario()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> registroPendenteService.registrarUsuarioDireto("Ana", "ana@teste.com", "Senha@123"));

        assertEquals("Email já cadastrado", ex.getMessage());
        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(usuarioAutenticarRepository, never()).save(any(UsuarioAutenticar.class));
    }

    @Test
    void registrarUsuarioDireto_DeveCriarPrimeiroUsuarioComoAdmin() {
        when(usuarioRepository.findByEmail("admin@teste.com")).thenReturn(Optional.empty());
        when(usuarioRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode("Senha@123")).thenReturn("hash-admin");

        Usuario usuarioPersistido = new Usuario();
        usuarioPersistido.setIdUsuario(1L);
        usuarioPersistido.setNome("Admin");
        usuarioPersistido.setEmail("admin@teste.com");
        usuarioPersistido.setRole(Role.ROLE_ADMIN);
        usuarioPersistido.setAtivo(true);

        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioPersistido);

        UsuarioResponseDTO resposta = registroPendenteService.registrarUsuarioDireto("Admin", "admin@teste.com", "Senha@123");

        assertNotNull(resposta);
        assertEquals(1L, resposta.getIdUsuario());
        assertEquals("ROLE_ADMIN", resposta.getRole());

        ArgumentCaptor<UsuarioAutenticar> authCaptor = ArgumentCaptor.forClass(UsuarioAutenticar.class);
        verify(usuarioAutenticarRepository).save(authCaptor.capture());

        UsuarioAutenticar authSalvo = authCaptor.getValue();
        assertEquals("hash-admin", authSalvo.getSenhaHash());
        assertNotNull(authSalvo.getDataExpiracao());
        assertTrue(authSalvo.getDataExpiracao().isAfter(LocalDateTime.now().plusMonths(11)));
    }

    @Test
    void registrarUsuarioDireto_DeveCriarUsuarioComRoleUserQuandoNaoForPrimeiro() {
        when(usuarioRepository.findByEmail("joao@teste.com")).thenReturn(Optional.empty());
        when(usuarioRepository.count()).thenReturn(5L);
        when(passwordEncoder.encode("Senha@123")).thenReturn("hash-user");

        Usuario usuarioPersistido = new Usuario();
        usuarioPersistido.setIdUsuario(15L);
        usuarioPersistido.setNome("João");
        usuarioPersistido.setEmail("joao@teste.com");
        usuarioPersistido.setRole(Role.ROLE_USER);
        usuarioPersistido.setAtivo(true);

        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioPersistido);

        UsuarioResponseDTO resposta = registroPendenteService.registrarUsuarioDireto("  joão   da   silva  ", "joao@teste.com", "Senha@123");

        assertEquals(15L, resposta.getIdUsuario());
        assertEquals("ROLE_USER", resposta.getRole());

        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());

        Usuario usuarioSalvo = usuarioCaptor.getValue();
        assertEquals("João Da Silva", usuarioSalvo.getNome());
        assertEquals(Role.ROLE_USER, usuarioSalvo.getRole());
        assertTrue(Boolean.TRUE.equals(usuarioSalvo.getEmailVerified()));
        assertTrue(Boolean.FALSE.equals(usuarioSalvo.getTwoFactorEnabled()));

        verify(usuarioAutenticarRepository).save(any(UsuarioAutenticar.class));
    }
}
