package com.acessolivre.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.acessolivre.enums.Role;
import com.acessolivre.exception.UsuarioException;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.service.TwoFactorService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AuthenticationServiceTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenRevogadoRepository tokenRevogadoRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private LoginAttemptService loginAttemptService;

    @Mock
    private TwoFactorService twoFactorService;

    @InjectMocks
    private AuthenticationService authenticationService;

    @Test
    void login_DeveRetornarTokenQuandoCredenciaisSaoValidas() {
        String email = "user@teste.com";
        Usuario usuario = criarUsuario(1L, email, true, true);
        Authentication auth = new UsernamePasswordAuthenticationToken(email, null, List.of());

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(loginAttemptService.estaBloqueado(email)).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(twoFactorService.isTwoFactorEnabledByEmail(email)).thenReturn(false);
        when(jwtService.gerarToken(eq(auth), eq(Boolean.TRUE))).thenReturn("jwt-token");

        String token = authenticationService.login(email, "Senha@123", true, null);

        assertEquals("jwt-token", token);
        assertEquals("jwt-token", usuario.getTokenAtual());
        verify(usuarioRepository).save(usuario);
        verify(loginAttemptService).loginSucesso(email);
        verify(loginAttemptService, never()).loginFalhou(email);
    }

    @Test
    void login_DeveLancarExcecaoQuandoUsuarioInativo() {
        String email = "inativo@teste.com";
        Usuario usuario = criarUsuario(2L, email, false, true);

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));

        UsuarioException.UsuarioInativoException ex = assertThrows(UsuarioException.UsuarioInativoException.class,
            () -> authenticationService.login(email, "Senha@123", false, null));

        assertNotNull(ex);

        verify(loginAttemptService).loginFalhou(email);
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_DeveLancarExcecaoQuandoContaBloqueada() {
        String email = "bloqueado@teste.com";
        Usuario usuario = criarUsuario(3L, email, true, true);

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(loginAttemptService.estaBloqueado(email)).thenReturn(true);
        when(loginAttemptService.getBloqueioExpiraEm(email)).thenReturn(LocalDateTime.now().plusMinutes(10));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authenticationService.login(email, "Senha@123", false, null));

        assertTrue(ex.getMessage().contains("Conta temporariamente bloqueada"));
        verify(loginAttemptService).loginFalhou(email);
    }

    @Test
    void login_DeveLancarExcecaoQuandoUsuarioNaoExiste() {
        String email = "naoexiste@teste.com";

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(loginAttemptService.estaBloqueado(email)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authenticationService.login(email, "Senha@123", false, null));

        assertEquals("Credenciais inválidas", ex.getMessage());
        verify(loginAttemptService).loginFalhou(email);
    }

    @Test
    void login_DeveLancarExcecaoQuandoEmailNaoVerificado() {
        String email = "naoverificado@teste.com";
        Usuario usuario = criarUsuario(4L, email, true, false);

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(loginAttemptService.estaBloqueado(email)).thenReturn(false);

        EmailNotVerifiedException ex = assertThrows(EmailNotVerifiedException.class,
            () -> authenticationService.login(email, "Senha@123", false, null));

        assertNotNull(ex);

        verify(loginAttemptService, never()).loginFalhou(email);
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_DeveLancarExcecaoQuandoTwoFactorObrigatorioESemCodigo() {
        String email = "2fa@teste.com";
        Usuario usuario = criarUsuario(5L, email, true, true);
        Authentication auth = new UsernamePasswordAuthenticationToken(email, null, List.of());

        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(loginAttemptService.estaBloqueado(email)).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(twoFactorService.isTwoFactorEnabledByEmail(email)).thenReturn(true);

        TwoFactorRequiredException ex = assertThrows(TwoFactorRequiredException.class,
            () -> authenticationService.login(email, "Senha@123", false, null));

        assertNotNull(ex);

        verify(loginAttemptService, never()).loginFalhou(email);
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void logout_DeveRetornarSemAcaoQuandoTokenVazio() {
        authenticationService.logout(" ", 1L);

        verify(tokenRevogadoRepository, never()).existsByToken(any());
        verify(tokenRevogadoRepository, never()).save(any(TokenRevogado.class));
    }

    @Test
    void logout_DeveSerIdempotenteQuandoTokenJaRevogado() {
        when(tokenRevogadoRepository.existsByToken("token-x")).thenReturn(true);

        authenticationService.logout("token-x", 1L);

        verify(tokenRevogadoRepository).existsByToken("token-x");
        verify(tokenRevogadoRepository, never()).save(any(TokenRevogado.class));
    }

    @Test
    void logout_DeveRevogarTokenQuandoUsuarioEncontradoPorId() {
        Usuario usuario = criarUsuario(10L, "logout@teste.com", true, true);
        usuario.setTokenAtual("token-velho");

        when(tokenRevogadoRepository.existsByToken("token-abc")).thenReturn(false);
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(jwtService.obterExpiracaoToken("token-abc")).thenReturn(LocalDateTime.now().plusHours(1));

        authenticationService.logout("token-abc", 10L);

        ArgumentCaptor<TokenRevogado> captor = ArgumentCaptor.forClass(TokenRevogado.class);
        verify(tokenRevogadoRepository).save(captor.capture());

        TokenRevogado salvo = captor.getValue();
        assertEquals("token-abc", salvo.getToken());
        assertEquals(usuario, salvo.getUsuario());
        assertEquals(null, usuario.getTokenAtual());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void logout_DeveBuscarUsuarioPorEmailQuandoIdNaoEncontrado() {
        Usuario usuario = criarUsuario(15L, "email@teste.com", true, true);

        when(tokenRevogadoRepository.existsByToken("token-email")).thenReturn(false);
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());
        when(jwtService.extrairNomeUsuario("token-email")).thenReturn("email@teste.com");
        when(usuarioRepository.findByEmail("email@teste.com")).thenReturn(Optional.of(usuario));
        when(jwtService.obterExpiracaoToken("token-email")).thenReturn(LocalDateTime.now().plusHours(1));

        authenticationService.logout("token-email", 999L);

        verify(tokenRevogadoRepository).save(any(TokenRevogado.class));
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void logout_DeveLancarRuntimeExceptionQuandoUsuarioDoTokenNaoForEncontrado() {
        when(tokenRevogadoRepository.existsByToken("token-sem-usuario")).thenReturn(false);
        when(usuarioRepository.findById(123L)).thenReturn(Optional.empty());
        when(jwtService.extrairNomeUsuario("token-sem-usuario")).thenReturn("sem@usuario.com");
        when(usuarioRepository.findByEmail("sem@usuario.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authenticationService.logout("token-sem-usuario", 123L));

        assertEquals("Erro ao revogar token", ex.getMessage());
    }

    @Test
    void validateToken_DeveRetornarFalseParaTokenNuloOuVazio() {
        assertFalse(authenticationService.validateToken(null));
        assertFalse(authenticationService.validateToken(""));
    }

    @Test
    void validateToken_DeveRetornarFalseQuandoTokenRevogado() {
        when(jwtService.isTokenRevogado("token-r")).thenReturn(true);

        assertFalse(authenticationService.validateToken("token-r"));
    }

    @Test
    void validateToken_DeveRetornarFalseQuandoUsernameNulo() {
        when(jwtService.isTokenRevogado("token-x")).thenReturn(false);
        when(jwtService.extrairNomeUsuario("token-x")).thenReturn(null);

        assertFalse(authenticationService.validateToken("token-x"));
    }

    @Test
    void validateToken_DeveRetornarFalseQuandoUsuarioNaoAtivo() {
        when(jwtService.isTokenRevogado("token-z")).thenReturn(false);
        when(jwtService.extrairNomeUsuario("token-z")).thenReturn("user@teste.com");
        when(usuarioRepository.findByEmailAndAtivoTrue("user@teste.com")).thenReturn(Optional.empty());

        assertFalse(authenticationService.validateToken("token-z"));
    }

    @Test
    void validateToken_DeveRetornarTrueQuandoTokenValido() {
        Usuario usuario = criarUsuario(33L, "ok@teste.com", true, true);

        when(jwtService.isTokenRevogado("token-ok")).thenReturn(false);
        when(jwtService.extrairNomeUsuario("token-ok")).thenReturn("ok@teste.com");
        when(usuarioRepository.findByEmailAndAtivoTrue("ok@teste.com")).thenReturn(Optional.of(usuario));

        assertTrue(authenticationService.validateToken("token-ok"));
    }

    @Test
    void reautenticar_DeveGerarNovoTokenQuandoUsuarioAtivo() {
        Usuario usuario = criarUsuario(50L, "re@teste.com", true, true);
        usuario.setRole(Role.ROLE_USER);

        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(usuario));
        when(jwtService.gerarToken(any(Authentication.class), anyBoolean())).thenReturn("novo-token");

        String token = authenticationService.reautenticar(50L, true);

        assertEquals("novo-token", token);
        assertEquals("novo-token", usuario.getTokenAtual());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void reautenticar_DeveLancarExcecaoQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findById(404L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authenticationService.reautenticar(404L, false));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void reautenticar_DeveLancarExcecaoQuandoUsuarioInativo() {
        Usuario usuario = criarUsuario(80L, "inativo2@teste.com", false, true);

        when(usuarioRepository.findById(80L)).thenReturn(Optional.of(usuario));

        UsuarioException.UsuarioInativoException ex = assertThrows(UsuarioException.UsuarioInativoException.class,
            () -> authenticationService.reautenticar(80L, false));

        assertNotNull(ex);

        verify(jwtService, never()).gerarToken(any(Authentication.class), anyBoolean());
    }

    private Usuario criarUsuario(Long id, String email, boolean ativo, boolean emailVerificado) {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(id);
        usuario.setNome("Usuário Teste");
        usuario.setEmail(email);
        usuario.setAtivo(ativo);
        usuario.setEmailVerified(emailVerificado);
        usuario.setRole(Role.ROLE_USER);
        return usuario;
    }
}
