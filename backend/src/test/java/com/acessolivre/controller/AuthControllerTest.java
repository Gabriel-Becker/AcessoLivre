package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.acessolivre.dto.request.AutenticacaoRequestDTO;
import com.acessolivre.dto.request.AlterarSenhaRequestDTO;
import com.acessolivre.dto.request.RegistroRequestDTO;
import com.acessolivre.dto.request.HabilitarDoisFatoresRequestDTO;
import com.acessolivre.dto.request.ValidarTokenRequestDTO;
import com.acessolivre.dto.request.VerificarEmailRequestDTO;
import com.acessolivre.dto.response.AutenticacaoResponseDTO;
import com.acessolivre.dto.response.ConfiguracaoDoisFatoresResponseDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.dto.response.ValidarTokenResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.exception.UsuarioException;
import com.acessolivre.security.ServicoAutenticacao;
import com.acessolivre.security.ExcecaoEmailNaoVerificado;
import com.acessolivre.security.ExcecaoCodigoAutenticacaoInvalido;
import com.acessolivre.security.ServicoJwt;
import com.acessolivre.security.ServicoTentativasLogin;
import com.acessolivre.security.ExcecaoDoisFatoresObrigatorio;
import com.acessolivre.service.RegistroPendenteService;
import com.acessolivre.service.DoisFatoresService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"null", "unused"})
class AuthControllerTest {

    @Mock
    private ServicoAutenticacao authenticationService;

    @Mock
    private ServicoJwt jwtService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RegistroPendenteService registroPendenteService;

    @Mock
    private ServicoTentativasLogin loginAttemptService;

    @Mock
    private DoisFatoresService twoFactorService;

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    @Test
    void register_DeveRetornarCreatedQuandoSucesso() {
        RegistroRequestDTO request = RegistroRequestDTO.builder()
            .nome("Maria")
            .email("maria@teste.com")
            .senha("Senha@123")
            .build();

        UsuarioResponseDTO responseDto = UsuarioResponseDTO.builder()
            .idUsuario(100L)
            .nome("Maria")
            .email("maria@teste.com")
            .role("ROLE_USER")
            .ativo(true)
            .build();

        when(registroPendenteService.registrarUsuarioDireto("Maria", "maria@teste.com", "Senha@123")).thenReturn(responseDto);

        ResponseEntity<?> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(responseDto, response.getBody());
    }

    @Test
    void register_DeveRetornarBadRequestQuandoErroDeNegocio() {
        RegistroRequestDTO request = RegistroRequestDTO.builder()
            .nome("Maria")
            .email("maria@teste.com")
            .senha("Senha@123")
            .build();

        when(registroPendenteService.registrarUsuarioDireto(any(), any(), any()))
            .thenThrow(new IllegalArgumentException("Email já cadastrado"));

        ResponseEntity<?> response = authController.register(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertNotNull(body);
        assertEquals("Email já cadastrado", body.get("mensagem"));
    }

    @Test
    void register_DeveRetornarInternalServerErrorQuandoErroInesperado() {
        RegistroRequestDTO request = RegistroRequestDTO.builder()
            .nome("Maria")
            .email("maria@teste.com")
            .senha("Senha@123")
            .build();

        when(registroPendenteService.registrarUsuarioDireto(any(), any(), any()))
            .thenThrow(new RuntimeException("falha inesperada"));

        ResponseEntity<?> response = authController.register(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void confirmarRegistro_DeveRetornarCreatedQuandoSucesso() {
        VerificarEmailRequestDTO request = VerificarEmailRequestDTO.builder()
            .email("novo@teste.com")
            .codigo("123456")
            .build();

        UsuarioResponseDTO responseDto = UsuarioResponseDTO.builder()
            .idUsuario(200L)
            .nome("Novo")
            .email("novo@teste.com")
            .role("ROLE_USER")
            .build();

        when(registroPendenteService.concluirRegistro("novo@teste.com", "123456")).thenReturn(responseDto);

        ResponseEntity<?> response = authController.confirmarRegistro(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(responseDto, response.getBody());
    }

    @Test
    void confirmarRegistro_DeveRetornarBadRequestQuandoFalhaDeNegocio() {
        VerificarEmailRequestDTO request = VerificarEmailRequestDTO.builder()
            .email("novo@teste.com")
            .codigo("123456")
            .build();

        when(registroPendenteService.concluirRegistro(any(), any()))
            .thenThrow(new IllegalArgumentException("Código inválido"));

        ResponseEntity<?> response = authController.confirmarRegistro(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void confirmarRegistro_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        VerificarEmailRequestDTO request = VerificarEmailRequestDTO.builder()
            .email("novo@teste.com")
            .codigo("123456")
            .build();

        when(registroPendenteService.concluirRegistro(any(), any()))
            .thenThrow(new RuntimeException("falha inesperada"));

        ResponseEntity<?> response = authController.confirmarRegistro(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void reenviarCodigoRegistro_DeveRetornarOkQuandoSucesso() {
        when(registroPendenteService.reenviarCodigo("mask@teste.com")).thenReturn("ma***@teste.com");

        ResponseEntity<?> response = authController.reenviarCodigoRegistro("mask@teste.com");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Código reenviado para ma***@teste.com", response.getBody());
    }

    @Test
    void reenviarCodigoRegistro_DeveRetornarBadRequestQuandoFalhaDeNegocio() {
        when(registroPendenteService.reenviarCodigo("mask@teste.com"))
            .thenThrow(new IllegalArgumentException("Email inválido"));

        ResponseEntity<?> response = authController.reenviarCodigoRegistro("mask@teste.com");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void reenviarCodigoRegistro_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        when(registroPendenteService.reenviarCodigo("mask@teste.com"))
            .thenThrow(new RuntimeException("falha inesperada"));

        ResponseEntity<?> response = authController.reenviarCodigoRegistro("mask@teste.com");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarTokenEUsuarioQuandoSucesso() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("joao@teste.com");
        request.setSenha("Senha@123");
        request.setRememberMe(true);

        Usuario usuario = criarUsuario(10L, "João", "joao@teste.com");

        when(authenticationService.login("joao@teste.com", "Senha@123", true, null)).thenReturn("token-123");
        when(usuarioRepository.findByEmailAndAtivoTrue("joao@teste.com")).thenReturn(Optional.of(usuario));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AutenticacaoResponseDTO body = (AutenticacaoResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("token-123", body.getToken());
        assertFalse(Boolean.TRUE.equals(body.getTwoFactorRequired()));
        assertEquals(10L, body.getUsuario().getIdUsuario());
    }

    @Test
    void login_DeveRetornarUnauthorizedQuandoTwoFactorForObrigatorio() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("2fa@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login(eq("2fa@teste.com"), any(), eq(null), eq(null)))
            .thenThrow(new ExcecaoDoisFatoresObrigatorio("Código obrigatório"));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        AutenticacaoResponseDTO body = (AutenticacaoResponseDTO) response.getBody();
        assertNotNull(body);
        assertTrue(Boolean.TRUE.equals(body.getTwoFactorRequired()));
    }

    @Test
    void login_DeveRetornarForbiddenQuandoEmailNaoVerificado() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("naoverificado@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login(eq("naoverificado@teste.com"), any(), eq(null), eq(null)))
            .thenThrow(new ExcecaoEmailNaoVerificado("Email não verificado"));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertNotNull(body);
        assertEquals("Email não verificado", body.get("mensagem"));
    }

    @Test
    void login_DeveRetornarUnauthorizedQuandoUsuarioNaoForEncontradoAposAutenticacao() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("sumiu@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login("sumiu@teste.com", "Senha@123", null, null)).thenReturn("token-abc");
        when(usuarioRepository.findByEmailAndAtivoTrue("sumiu@teste.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarForbiddenQuandoUsuarioInativo() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("inativo@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login("inativo@teste.com", "Senha@123", null, null))
            .thenThrow(new UsuarioException.UsuarioInativoException());

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarUnauthorizedQuandoCodigo2FAInvalido() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("2fa@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login(eq("2fa@teste.com"), any(), eq(null), eq(null)))
            .thenThrow(new ExcecaoCodigoAutenticacaoInvalido("codigo inválido"));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarTooManyRequestsQuandoMensagemBloqueada() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("bloq@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login("bloq@teste.com", "Senha@123", null, null))
            .thenThrow(new RuntimeException("Conta bloqueada"));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarUnauthorizedComTentativasRestantesQuandoErroGenerico() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("erro@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login("erro@teste.com", "Senha@123", null, null))
            .thenThrow(new RuntimeException("credenciais inválidas"));
        when(loginAttemptService.tentativasRestantes("erro@teste.com")).thenReturn(2);

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarUnauthorizedComContaBloqueadaTemporariamenteQuandoSemTentativas() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("erro@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login("erro@teste.com", "Senha@123", null, null))
            .thenThrow(new RuntimeException("credenciais inválidas"));
        when(loginAttemptService.tentativasRestantes("erro@teste.com")).thenReturn(0);

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_DeveRetornarUnauthorizedQuandoRuntimeExceptionGenerica() {
        AutenticacaoRequestDTO request = new AutenticacaoRequestDTO();
        request.setEmail("fatal@teste.com");
        request.setSenha("Senha@123");

        when(authenticationService.login("fatal@teste.com", "Senha@123", null, null))
            .thenThrow(new NullPointerException("erro fatal"));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void logout_DeveRetornarBadRequestQuandoTokenNaoForEnviado() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<?> response = authController.logout(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void logout_DeveRetornarOkQuandoTokenForValido() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-logout");

        when(jwtService.obterIdUsuarioDoToken("token-logout")).thenReturn(99L);

        ResponseEntity<?> response = authController.logout(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authenticationService).logout("token-logout", 99L);
    }

    @Test
    void logout_DeveRetornarInternalServerErrorQuandoOcorrerErro() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-logout");

        when(jwtService.obterIdUsuarioDoToken("token-logout")).thenThrow(new RuntimeException("jwt inválido"));

        ResponseEntity<?> response = authController.logout(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void setupTwoFactor_DeveRetornarUnauthorizedSemToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<?> response = authController.setupTwoFactor(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void setupTwoFactor_DeveRetornarUnauthorizedQuandoTokenNaoTiverUserId() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-sem-id");

        when(jwtService.obterIdUsuarioDoToken("token-sem-id")).thenReturn(null);

        ResponseEntity<?> response = authController.setupTwoFactor(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void setupTwoFactor_DeveRetornarOkQuandoSucesso() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-2fa");

        Usuario usuario = criarUsuario(55L, "2FA", "2fa@teste.com");
        ConfiguracaoDoisFatoresResponseDTO setup = ConfiguracaoDoisFatoresResponseDTO.builder()
            .qrCode("data:image/png;base64,abc")
            .secretKey("SECRET")
            .build();

        when(jwtService.obterIdUsuarioDoToken("token-2fa")).thenReturn(55L);
        when(usuarioRepository.findById(55L)).thenReturn(Optional.of(usuario));
        when(twoFactorService.prepararConfiguracao(55L)).thenReturn(setup);

        ResponseEntity<?> response = authController.setupTwoFactor(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(setup, response.getBody());
    }

    @Test
    void setupTwoFactor_DeveRetornarBadRequestQuandoErroDeNegocio() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-2fa");

        Usuario usuario = criarUsuario(55L, "2FA", "2fa@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-2fa")).thenReturn(55L);
        when(usuarioRepository.findById(55L)).thenReturn(Optional.of(usuario));
        when(twoFactorService.prepararConfiguracao(55L)).thenThrow(new IllegalArgumentException("já configurado"));

        ResponseEntity<?> response = authController.setupTwoFactor(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void setupTwoFactor_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-2fa");

        when(jwtService.obterIdUsuarioDoToken("token-2fa")).thenReturn(55L);
        when(usuarioRepository.findById(55L)).thenThrow(new RuntimeException("falha"));

        ResponseEntity<?> response = authController.setupTwoFactor(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void enableTwoFactor_DeveRetornarUnauthorizedSemToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("123456");

        ResponseEntity<?> response = authController.enableTwoFactor(request, body);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void enableTwoFactor_DeveRetornarOkQuandoSucesso() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-enable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("123456");

        Usuario usuario = criarUsuario(77L, "Enable", "enable@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-enable")).thenReturn(77L);
        when(usuarioRepository.findById(77L)).thenReturn(Optional.of(usuario));

        ResponseEntity<?> response = authController.enableTwoFactor(request, body);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(twoFactorService).habilitar(77L, "123456");
    }

    @Test
    void enableTwoFactor_DeveRetornarUnauthorizedQuandoTokenSemUserId() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-enable");
        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("123456");

        when(jwtService.obterIdUsuarioDoToken("token-enable")).thenReturn(null);

        ResponseEntity<?> response = authController.enableTwoFactor(request, body);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void enableTwoFactor_DeveRetornarBadRequestQuandoErroDeNegocio() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-enable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("123456");

        Usuario usuario = criarUsuario(77L, "Enable", "enable@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-enable")).thenReturn(77L);
        when(usuarioRepository.findById(77L)).thenReturn(Optional.of(usuario));
        when(twoFactorService.habilitar(77L, "123456")).thenThrow(new IllegalArgumentException("código inválido"));

        ResponseEntity<?> response = authController.enableTwoFactor(request, body);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void enableTwoFactor_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-enable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("123456");

        Usuario usuario = criarUsuario(77L, "Enable", "enable@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-enable")).thenReturn(77L);
        when(usuarioRepository.findById(77L)).thenReturn(Optional.of(usuario));
        when(twoFactorService.habilitar(77L, "123456")).thenThrow(new RuntimeException("falha"));

        ResponseEntity<?> response = authController.enableTwoFactor(request, body);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void disableTwoFactor_DeveRetornarOkQuandoSucesso() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-disable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("654321");

        Usuario usuario = criarUsuario(78L, "Disable", "disable@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-disable")).thenReturn(78L);
        when(usuarioRepository.findById(78L)).thenReturn(Optional.of(usuario));

        ResponseEntity<?> response = authController.disableTwoFactor(request, body);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(twoFactorService).desabilitar(78L, "654321");
    }

    @Test
    void disableTwoFactor_DeveRetornarUnauthorizedQuandoTokenSemUserId() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-disable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("654321");

        when(jwtService.obterIdUsuarioDoToken("token-disable")).thenReturn(null);

        ResponseEntity<?> response = authController.disableTwoFactor(request, body);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void disableTwoFactor_DeveRetornarBadRequestQuandoErroDeNegocio() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-disable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("654321");

        Usuario usuario = criarUsuario(78L, "Disable", "disable@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-disable")).thenReturn(78L);
        when(usuarioRepository.findById(78L)).thenReturn(Optional.of(usuario));
        when(twoFactorService.desabilitar(78L, "654321")).thenThrow(new IllegalArgumentException("código inválido"));

        ResponseEntity<?> response = authController.disableTwoFactor(request, body);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void disableTwoFactor_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-disable");

        HabilitarDoisFatoresRequestDTO body = new HabilitarDoisFatoresRequestDTO();
        body.setVerificationCode("654321");

        Usuario usuario = criarUsuario(78L, "Disable", "disable@teste.com");

        when(jwtService.obterIdUsuarioDoToken("token-disable")).thenReturn(78L);
        when(usuarioRepository.findById(78L)).thenReturn(Optional.of(usuario));
        when(twoFactorService.desabilitar(78L, "654321")).thenThrow(new RuntimeException("falha"));

        ResponseEntity<?> response = authController.disableTwoFactor(request, body);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void twoFactorStatus_DeveRetornarUnauthorizedQuandoTokenInvalido() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-status");

        when(jwtService.obterIdUsuarioDoToken("token-status")).thenReturn(null);

        ResponseEntity<?> response = authController.twoFactorStatus(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void twoFactorStatus_DeveRetornarUnauthorizedSemToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<?> response = authController.twoFactorStatus(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void twoFactorStatus_DeveRetornarStatusQuandoUsuarioExiste() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-status-ok");

        Usuario usuario = criarUsuario(90L, "Status", "status@teste.com");
        usuario.setTwoFactorEnabled(true);

        when(jwtService.obterIdUsuarioDoToken("token-status-ok")).thenReturn(90L);
        when(usuarioRepository.findById(90L)).thenReturn(Optional.of(usuario));

        ResponseEntity<?> response = authController.twoFactorStatus(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(true, response.getBody());
    }

    @Test
    void twoFactorStatus_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-status-ok");

        when(jwtService.obterIdUsuarioDoToken("token-status-ok")).thenReturn(90L);
        when(usuarioRepository.findById(90L)).thenThrow(new RuntimeException("falha"));

        ResponseEntity<?> response = authController.twoFactorStatus(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void me_DeveRetornarUnauthorizedQuandoNaoEnviarAuthorization() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<UsuarioResponseDTO> response = authController.me(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void me_DeveRetornarUnauthorizedQuandoTokenEstiverRevogado() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-revogado");

        when(authenticationService.tokenEhRevogado("token-revogado")).thenReturn(true);

        ResponseEntity<UsuarioResponseDTO> response = authController.me(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void me_DeveRetornarNotFoundQuandoUsuarioNaoExistir() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(123L);
        when(usuarioRepository.findById(123L)).thenReturn(Optional.empty());

        ResponseEntity<UsuarioResponseDTO> response = authController.me(request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void me_DeveRetornarUnauthorizedQuandoTokenNaoContiverUserId() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(null);

        ResponseEntity<UsuarioResponseDTO> response = authController.me(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void me_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        when(authenticationService.tokenEhRevogado("token-ok")).thenThrow(new RuntimeException("falha"));

        ResponseEntity<UsuarioResponseDTO> response = authController.me(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void me_DeveRetornarUsuarioQuandoTokenForValido() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        Usuario usuario = criarUsuario(321L, "Lucas", "lucas@teste.com");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(321L);
        when(usuarioRepository.findById(321L)).thenReturn(Optional.of(usuario));

        ResponseEntity<UsuarioResponseDTO> response = authController.me(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        UsuarioResponseDTO body = response.getBody();
        assertNotNull(body);
        assertEquals("Lucas", body.getNome());
    }

    @Test
    void validateToken_DeveRetornarValidTrueQuandoTokenForValido() {
        ValidarTokenRequestDTO request = new ValidarTokenRequestDTO();
        request.setToken("token-valido");

        when(authenticationService.validateToken("token-valido")).thenReturn(true);

        ResponseEntity<ValidarTokenResponseDTO> response = authController.validateToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ValidarTokenResponseDTO body = response.getBody();
        assertNotNull(body);
        assertTrue(body.isValid());
        assertNull(body.getReason());
    }

    @Test
    void validateToken_DeveRetornarValidFalseQuandoTokenForInvalido() {
        ValidarTokenRequestDTO request = new ValidarTokenRequestDTO();
        request.setToken("token-invalido");

        when(authenticationService.validateToken("token-invalido")).thenReturn(false);

        ResponseEntity<ValidarTokenResponseDTO> response = authController.validateToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ValidarTokenResponseDTO body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isValid());
        assertEquals("Token inválido ou revogado", body.getReason());
    }

    @Test
    void validateToken_DeveRetornarReasonDeErroQuandoExcecaoForLancada() {
        ValidarTokenRequestDTO request = new ValidarTokenRequestDTO();
        request.setToken("token-com-erro");

        when(authenticationService.validateToken("token-com-erro")).thenThrow(new RuntimeException("falha"));

        ResponseEntity<ValidarTokenResponseDTO> response = authController.validateToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ValidarTokenResponseDTO body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isValid());
        assertEquals("Erro ao validar token", body.getReason());
    }

    @Test
    void reautenticar_DeveRetornarUnauthorizedQuandoTokenNaoForEnviado() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<?> response = authController.reautenticar(11L, false, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void reautenticar_DeveRetornarForbiddenQuandoTokenForDeOutroUsuario() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-atual");

        when(jwtService.obterIdUsuarioDoToken("token-atual")).thenReturn(99L);

        ResponseEntity<?> response = authController.reautenticar(11L, false, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void reautenticar_DeveRetornarUnauthorizedQuandoTokenEstiverRevogado() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-atual");

        when(jwtService.obterIdUsuarioDoToken("token-atual")).thenReturn(11L);
        when(authenticationService.tokenEhRevogado("token-atual")).thenReturn(true);

        ResponseEntity<?> response = authController.reautenticar(11L, false, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void reautenticar_DeveRetornarNovoTokenQuandoSucesso() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-atual");

        when(jwtService.obterIdUsuarioDoToken("token-atual")).thenReturn(11L);
        when(authenticationService.tokenEhRevogado("token-atual")).thenReturn(false);
        when(authenticationService.reautenticar(11L, true)).thenReturn("token-novo");

        ResponseEntity<?> response = authController.reautenticar(11L, true, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("token-novo", response.getBody());
    }

    @Test
    void reautenticar_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-atual");

        when(jwtService.obterIdUsuarioDoToken("token-atual")).thenReturn(11L);
        when(authenticationService.tokenEhRevogado("token-atual")).thenReturn(false);
        when(authenticationService.reautenticar(11L, true)).thenThrow(new RuntimeException("falha"));

        ResponseEntity<?> response = authController.reautenticar(11L, true, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void trocarSenha_DeveRetornarUnauthorizedSemToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void trocarSenha_DeveRetornarUnauthorizedQuandoTokenRevogado() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-revogado");

        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        when(authenticationService.tokenEhRevogado("token-revogado")).thenReturn(true);

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void trocarSenha_DeveRetornarUnauthorizedQuandoTokenNaoContiverUserId() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(null);

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void trocarSenha_DeveRetornarBadRequestQuandoCredenciaisNaoForemEncontradas() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(500L);
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(500L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void trocarSenha_DeveRetornarBadRequestQuandoSenhaAtualIncorreta() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        UsuarioAutenticar auth = new UsuarioAutenticar();
        auth.setSenhaHash("hash-atual");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(500L);
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(500L)).thenReturn(Optional.of(auth));
        when(passwordEncoder.matches("Senha@123", "hash-atual")).thenReturn(false);

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void trocarSenha_DeveRetornarOkQuandoSucesso() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        UsuarioAutenticar auth = new UsuarioAutenticar();
        auth.setSenhaHash("hash-atual");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(500L);
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(500L)).thenReturn(Optional.of(auth));
        when(passwordEncoder.matches("Senha@123", "hash-atual")).thenReturn(true);
        when(passwordEncoder.encode("Nova@123")).thenReturn("hash-novo");

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(usuarioAutenticarRepository).save(auth);
    }

    @Test
    void trocarSenha_DeveRetornarInternalServerErrorQuandoFalhaInesperada() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");

        AlterarSenhaRequestDTO body = new AlterarSenhaRequestDTO("Senha@123", "Nova@123");

        UsuarioAutenticar auth = new UsuarioAutenticar();
        auth.setSenhaHash("hash-atual");

        when(authenticationService.tokenEhRevogado("token-ok")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-ok")).thenReturn(500L);
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(500L)).thenReturn(Optional.of(auth));
        when(passwordEncoder.matches("Senha@123", "hash-atual")).thenReturn(true);
        when(passwordEncoder.encode("Nova@123")).thenThrow(new RuntimeException("falha"));

        ResponseEntity<?> response = authController.trocarSenha(body, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    private Usuario criarUsuario(Long id, String nome, String email) {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setAtivo(true);
        usuario.setRole(Role.ROLE_USER);
        return usuario;
    }
}
