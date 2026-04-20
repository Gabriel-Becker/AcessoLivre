package com.acessolivre.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acessolivre.dto.request.AuthRequestDTO;
import com.acessolivre.dto.request.ChangePasswordRequestDTO;
import com.acessolivre.dto.request.ForgotPasswordRequestDTO;
import com.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.acessolivre.dto.request.RegisterRequestDTO;
import com.acessolivre.dto.request.TwoFactorEnableRequestDTO;
import com.acessolivre.dto.request.ValidateTokenRequestDTO;
import com.acessolivre.dto.request.VerifyEmailRequestDTO;
import com.acessolivre.dto.response.AuthResponseDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.dto.response.ValidateTokenResponseDTO;
import com.acessolivre.mapper.UsuarioMapper;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.security.AuthenticationService;
import com.acessolivre.security.JwtService;
import com.acessolivre.service.EmailService;
import com.acessolivre.service.PasswordResetCodeService;
import com.acessolivre.service.RegistroPendenteService;
import com.acessolivre.service.TwoFactorService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RegistroPendenteService registroPendenteService;
    private final com.acessolivre.security.LoginAttemptService loginAttemptService;
    private final TwoFactorService twoFactorService;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetCodeService passwordResetCodeService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        try {
            log.info("Tentativa de registro para email: {}", request.getEmail());
            UsuarioResponseDTO usuario = registroPendenteService.registrarUsuarioDireto(
                request.getNome(),
                request.getEmail(),
                request.getSenha()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao registrar usuário: {}", e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao registrar usuário", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário");
        }
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<?> confirmarRegistro(@Valid @RequestBody VerifyEmailRequestDTO request) {
        try {
            UsuarioResponseDTO usuario = registroPendenteService.concluirRegistro(
                request.getEmail(),
                request.getCodigo()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            log.warn("Falha ao confirmar registro para {}: {}", request.getEmail(), e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao confirmar registro para {}", request.getEmail(), e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao confirmar registro");
        }
    }

    @PostMapping("/register/resend-code")
    public ResponseEntity<?> reenviarCodigoRegistro(@RequestParam String email) {
        try {
            log.info("Reenviando código de registro para: {}", email);
            String emailMascarado = registroPendenteService.reenviarCodigo(email);
            return ResponseEntity.ok(String.format("Código reenviado para %s", emailMascarado));
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao reenviar código para {}: {}", email, e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao reenviar código para: {}", email, e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao reenviar código");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDTO request) {
        try {
            String token = authenticationService.login(
                request.getEmail(), 
                request.getSenha(), 
                request.getRememberMe(),
                request.getTwoFactorCode()
            );
            Optional<Usuario> u = usuarioRepository.findByEmail(request.getEmail());
            
            if (u.isEmpty()) {
                log.warn("Usuário não encontrado após autenticação: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            Usuario usuario = u.get();
            UsuarioResponseDTO usuarioDTO = UsuarioMapper.toResponse(usuario);
            AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .usuario(usuarioDTO)
                .twoFactorRequired(false)
                .build();
            
            log.info("Usuário autenticado (email={}): id={}", request.getEmail(), usuario.getIdUsuario());
            return ResponseEntity.ok(response);
        } catch (com.acessolivre.security.TwoFactorRequiredException e) {
            log.info("2FA requerido para email={}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(AuthResponseDTO.builder()
                    .twoFactorRequired(true)
                    .build());
        } catch (com.acessolivre.security.InvalidTwoFactorCodeException e) {
            log.warn("Código 2FA inválido para email={}", request.getEmail());
            return erro(HttpStatus.UNAUTHORIZED, "Código de autenticação de dois fatores inválido");
        } catch (com.acessolivre.security.EmailNotVerifiedException e) {
            log.warn("Email não verificado para email={}", request.getEmail());
            return erro(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("bloqueada")) {
                log.error("Login bloqueado para email={}: {}", request.getEmail(), e.getMessage());
                return erro(HttpStatus.TOO_MANY_REQUESTS, e.getMessage());
            }

            int tentativasRestantes = loginAttemptService.tentativasRestantes(request.getEmail());
            String mensagem = tentativasRestantes > 0 
                ? String.format("Credenciais inválidas. Tentativas restantes: %d", tentativasRestantes)
                : "Conta bloqueada temporariamente";
            
            log.warn("Falha no login para email={}: {} (tentativas restantes: {})", 
                request.getEmail(), e.getMessage(), tentativasRestantes);
            return erro(HttpStatus.UNAUTHORIZED, mensagem);
        } catch (Exception e) {
            log.error("Erro inesperado no login para email={}", request.getEmail(), e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar login");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                log.warn("Tentativa de logout sem token");
                return erro(HttpStatus.BAD_REQUEST, "Token não fornecido");
            }
            
            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            authenticationService.logout(token, userId);
            
            log.info("Logout realizado com sucesso para userId={}", userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao processar logout", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar logout");
        }
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<?> setupTwoFactor(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return erro(HttpStatus.UNAUTHORIZED, "Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return erro(HttpStatus.UNAUTHORIZED, "Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            return ResponseEntity.ok(twoFactorService.prepararConfiguracao(userId));
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao configurar 2FA: {}", e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao configurar 2FA", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao configurar 2FA");
        }
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enableTwoFactor(HttpServletRequest request, @Valid @RequestBody TwoFactorEnableRequestDTO body) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return erro(HttpStatus.UNAUTHORIZED, "Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return erro(HttpStatus.UNAUTHORIZED, "Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            twoFactorService.habilitar(userId, body.getVerificationCode());
            return ResponseEntity.ok("2FA habilitado com sucesso");
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao habilitar 2FA: {}", e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao habilitar 2FA", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao habilitar 2FA");
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disableTwoFactor(HttpServletRequest request, @Valid @RequestBody TwoFactorEnableRequestDTO body) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return erro(HttpStatus.UNAUTHORIZED, "Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return erro(HttpStatus.UNAUTHORIZED, "Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            twoFactorService.desabilitar(userId, body.getVerificationCode());
            return ResponseEntity.ok("2FA desabilitado com sucesso");
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao desabilitar 2FA: {}", e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao desabilitar 2FA", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao desabilitar 2FA");
        }
    }

    @GetMapping("/2fa/status")
    public ResponseEntity<?> twoFactorStatus(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return erro(HttpStatus.UNAUTHORIZED, "Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return erro(HttpStatus.UNAUTHORIZED, "Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            boolean enabled = Boolean.TRUE.equals(usuario.getTwoFactorEnabled());
            return ResponseEntity.ok(enabled);
        } catch (Exception e) {
            log.error("Erro ao consultar status 2FA", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao consultar status 2FA");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String token = auth.substring(7);
            
            if (authenticationService.isTokenRevoked(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            return usuarioRepository.findById(userId)
                    .map(u -> ResponseEntity.ok(UsuarioMapper.toResponse(u)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            log.error("Erro ao buscar dados do usuário", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateTokenResponseDTO> validateToken(@Valid @RequestBody ValidateTokenRequestDTO request) {
        try {
            boolean isValid = authenticationService.validateToken(request.getToken());
            
            if (!isValid) {
                return ResponseEntity.ok(ValidateTokenResponseDTO.builder()
                    .valid(false)
                    .reason("Token inválido ou revogado")
                    .build());
            }
            
            return ResponseEntity.ok(ValidateTokenResponseDTO.builder()
                .valid(true)
                .build());
        } catch (Exception e) {
            log.error("Erro ao validar token", e);
            return ResponseEntity.ok(ValidateTokenResponseDTO.builder()
                .valid(false)
                .reason("Erro ao validar token")
                .build());
        }
    }

    @PostMapping("/reauth/{userId}")
    public ResponseEntity<?> reautenticar(@PathVariable Long userId, HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return erro(HttpStatus.UNAUTHORIZED, "Token não fornecido");
            }
            
            String currentToken = auth.substring(7);
            Long tokenUserId = jwtService.obterIdUsuarioDoToken(currentToken);
            
            if (!tokenUserId.equals(userId)) {
                return erro(HttpStatus.FORBIDDEN, "Usuário não autorizado");
            }
            
            if (authenticationService.isTokenRevoked(currentToken)) {
                return erro(HttpStatus.UNAUTHORIZED, "Token revogado");
            }
            
            String newToken = authenticationService.reautenticar(userId);
            
            log.info("Token renovado para userId={}", userId);
            return ResponseEntity.ok(newToken);
        } catch (Exception e) {
            log.error("Erro ao reautenticar userId={}", userId, e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao renovar token");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        try {
            log.info("Solicitação de recuperação de senha: email={}", request.getEmail());
            
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
            if (usuarioOpt.isEmpty()) {
                log.warn("Tentativa de recuperação para email inexistente: {}", request.getEmail());
                // Retorna sucesso mesmo se email não existe (segurança)
                return ResponseEntity.ok(Map.of(
                    "mensagem", "Se o email existir, você receberá um código de recuperação",
                    "email", mascararEmail(request.getEmail())
                ));
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Gerar código de 6 dígitos
            String codigo = emailService.gerarCodigoVerificacao();
            
            // Salvar código com expiração de 15 minutos
            PasswordResetCodeRequestDTO codigoDTO = PasswordResetCodeRequestDTO.builder()
                .code(codigo)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .usuarioId(usuario.getIdUsuario())
                .build();
            
            passwordResetCodeService.salvar(codigoDTO);
            
            // Enviar email
            emailService.enviarCodigoVerificacao(usuario.getEmail(), codigo);
            
            log.info("Código de recuperação enviado: email={}", usuario.getEmail());
            
            return ResponseEntity.ok(Map.of(
                "mensagem", "Código de recuperação enviado",
                "email", mascararEmail(usuario.getEmail())
            ));
        } catch (Exception e) {
            log.error("Erro ao processar recuperação de senha: {}", e.getMessage(), e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar solicitação");
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> trocarSenha(
            @Valid @RequestBody ChangePasswordRequestDTO request,
            HttpServletRequest httpRequest) {
        try {
            String auth = httpRequest.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                log.warn("Tentativa de trocar senha sem token");
                return erro(HttpStatus.UNAUTHORIZED, "Token não fornecido");
            }

            String token = auth.substring(7);
            if (authenticationService.isTokenRevoked(token)) {
                log.warn("Tentativa de trocar senha com token revogado");
                return erro(HttpStatus.UNAUTHORIZED, "Token inválido");
            }

            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                log.warn("Token JWT inválido ao trocar senha");
                return erro(HttpStatus.UNAUTHORIZED, "Token inválido");
            }

            UsuarioAutenticar usuarioAutenticar = usuarioAutenticarRepository.findByUsuario_IdUsuario(userId)
                .orElseThrow(() -> new IllegalArgumentException("Credenciais não encontradas"));

            if (!passwordEncoder.matches(request.getSenhaAtual(), usuarioAutenticar.getSenhaHash())) {
                log.warn("Senha atual incorreta para userId={}", userId);
                return erro(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
            }

            usuarioAutenticar.setSenhaHash(passwordEncoder.encode(request.getNovaSenha()));
            usuarioAutenticar.setDataExpiracao(LocalDateTime.now().plusYears(1));
            usuarioAutenticarRepository.save(usuarioAutenticar);

            log.info("Senha alterada com sucesso para userId={}", userId);
            return ResponseEntity.ok("Senha alterada com sucesso");
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao trocar senha: {}", e.getMessage());
            return erro(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao trocar senha", e);
            return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao trocar senha");
        }
    }

    private String mascararEmail(String email) {
        int indexArroba = email.indexOf('@');
        if (indexArroba <= 1) return email;
        
        String nome = email.substring(0, 1) + "*".repeat(indexArroba - 1);
        String dominio = email.substring(indexArroba);
        return nome + dominio;
    }

    private ResponseEntity<Map<String, String>> erro(HttpStatus status, String mensagem) {
        Map<String, String> body = new HashMap<>();
        body.put("erro", status.getReasonPhrase());
        body.put("mensagem", mensagem);
        return ResponseEntity.status(status).body(body);
    }
}
