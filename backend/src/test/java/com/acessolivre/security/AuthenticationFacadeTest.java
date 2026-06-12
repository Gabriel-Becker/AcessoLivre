package com.acessolivre.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.jwt.Jwt;

import com.acessolivre.enums.Role;
import com.acessolivre.exception.AuthenticationException;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AuthenticationFacadeTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthenticationFacade authenticationFacade;

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAuthenticatedUser_DeveLancarQuandoNaoHaAutenticacao() {
        SecurityContextHolder.clearContext();

        AuthenticationException ex = assertThrows(AuthenticationException.class,
            () -> authenticationFacade.getAuthenticatedUser());

        assertEquals("Usuário não autenticado", ex.getMessage());
    }

    @Test
    void getAuthenticatedUser_DeveExtrairEmailDeUserDetails() {
        User principal = new User("user@email.com", "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        Authentication authentication = new TestingAuthenticationToken(principal, null, "ROLE_USER");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = Usuario.builder()
            .idUsuario(10L)
            .nome("User")
            .email("user@email.com")
            .role(Role.ROLE_USER)
            .build();
        when(usuarioRepository.findByEmail("user@email.com")).thenReturn(Optional.of(usuario));

        Usuario autenticado = authenticationFacade.getAuthenticatedUser();

        assertEquals(10L, autenticado.getIdUsuario());
        assertEquals("user@email.com", autenticado.getEmail());
    }

    @Test
    void getAuthenticatedUser_DeveExtrairEmailDeJwt() {
        Jwt jwt = Jwt.withTokenValue("token")
            .header("alg", "none")
            .claim("sub", "jwt@email.com")
            .build();
        Authentication authentication = new TestingAuthenticationToken(jwt, null, "ROLE_USER");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = Usuario.builder()
            .idUsuario(11L)
            .nome("Jwt")
            .email("jwt@email.com")
            .role(Role.ROLE_USER)
            .build();
        when(usuarioRepository.findByEmail("jwt@email.com")).thenReturn(Optional.of(usuario));

        Usuario autenticado = authenticationFacade.getAuthenticatedUser();

        assertEquals("jwt@email.com", autenticado.getEmail());
    }

    @Test
    void getAuthenticatedUser_DeveExtrairEmailDeString() {
        Authentication authentication = new TestingAuthenticationToken("texto@email.com", null, "ROLE_USER");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = Usuario.builder()
            .idUsuario(12L)
            .nome("Texto")
            .email("texto@email.com")
            .role(Role.ROLE_USER)
            .build();
        when(usuarioRepository.findByEmail("texto@email.com")).thenReturn(Optional.of(usuario));

        Usuario autenticado = authenticationFacade.getAuthenticatedUser();

        assertEquals("texto@email.com", autenticado.getEmail());
    }

    @Test
    void getAuthenticatedUserEmail_DeveExtrairViaGetNameQuandoPrincipalDesconhecido() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(new Object());
        when(authentication.getName()).thenReturn("fallback@email.com");
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String email = authenticationFacade.getAuthenticatedUserEmail();

        assertEquals("fallback@email.com", email);
    }

    @Test
    void getAuthenticatedUser_DeveLancarQuandoUsuarioNaoEncontradoNoBanco() {
        Authentication authentication = new TestingAuthenticationToken("naoexiste@email.com", null, "ROLE_USER");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(usuarioRepository.findByEmail("naoexiste@email.com")).thenReturn(Optional.empty());

        AuthenticationException ex = assertThrows(AuthenticationException.class,
            () -> authenticationFacade.getAuthenticatedUser());

        assertEquals("Usuário não encontrado: naoexiste@email.com", ex.getMessage());
    }

    @Test
    void getAuthenticatedUserId_DeveRetornarId() {
        Authentication authentication = new TestingAuthenticationToken("id@email.com", null, "ROLE_USER");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = Usuario.builder()
            .idUsuario(77L)
            .nome("ID")
            .email("id@email.com")
            .role(Role.ROLE_USER)
            .build();
        when(usuarioRepository.findByEmail("id@email.com")).thenReturn(Optional.of(usuario));

        Long id = authenticationFacade.getAuthenticatedUserId();

        assertEquals(77L, id);
    }

    @Test
    void hasPermission_DeveRetornarTrueQuandoRolePresente() {
        Authentication authentication = new TestingAuthenticationToken("ok@email.com", null, "ROLE_ADMIN");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        assertTrue(authenticationFacade.hasPermission("ROLE_ADMIN"));
    }

    @Test
    void getAuthenticatedUserEmail_DeveLancarQuandoPrincipalInvalidoESemNomeValido() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(new Object());
        when(authentication.getName()).thenReturn("anonymousUser");
        SecurityContextHolder.getContext().setAuthentication(authentication);

        assertThrows(AuthenticationException.class, () -> authenticationFacade.getAuthenticatedUserEmail());
    }

    @Test
    void getAuthenticatedUserEmail_DeveRetornarComPrincipalJwtUsandoEmailQuandoSubNulo() {
        Jwt jwt = Jwt.withTokenValue("token")
            .header("alg", "none")
            .claim("email", "jwt2@email.com")
            .build();
        Authentication authentication = new TestingAuthenticationToken(jwt, null, "ROLE_USER");
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String email = authenticationFacade.getAuthenticatedUserEmail();

        assertNotNull(email);
        assertEquals("jwt2@email.com", email);
    }
}
