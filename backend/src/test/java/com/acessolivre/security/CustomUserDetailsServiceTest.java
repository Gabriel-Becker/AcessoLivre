package com.acessolivre.security;

import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CustomUserDetailsServiceTest {

    @InjectMocks
    private ServicoDetalhesUsuario customUserDetailsService;

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loadUserByUsername_deveRetornarUserDetails_quandoUsuarioEncontrado() {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        usuario.setEmail("test@example.com");
        usuario.setAtivo(true);
        usuario.setRole(Role.ROLE_USER);

        UsuarioAutenticar usuarioAutenticar = new UsuarioAutenticar();
        usuarioAutenticar.setIdUsuarioAutenticar(1L);
        usuarioAutenticar.setUsuario(usuario);
        usuarioAutenticar.setSenhaHash("password-hash");
        usuarioAutenticar.setDataExpiracao(LocalDateTime.now().plusDays(90));

        when(usuarioAutenticarRepository.findByUsuario_Email("test@example.com"))
            .thenReturn(Optional.of(usuarioAutenticar));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(userDetails);
        assertEquals("test@example.com", userDetails.getUsername());
    }

    @Test
    void loadUserByUsername_deveLancarUsernameNotFoundException_quandoUsuarioNaoEncontrado() {
        when(usuarioAutenticarRepository.findByUsuario_Email("nonexistent@example.com"))
            .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("nonexistent@example.com");
        });
    }
}
