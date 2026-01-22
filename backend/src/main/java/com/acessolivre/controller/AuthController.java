package com.acessolivre.controller;

import com.acessolivre.dto.request.AuthRequestDTO;
import com.acessolivre.dto.request.RegisterRequestDTO;
import com.acessolivre.dto.request.ValidateTokenRequestDTO;
import com.acessolivre.dto.request.VerifyEmailRequestDTO;
import com.acessolivre.dto.response.AuthResponseDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.dto.response.ValidateTokenResponseDTO;
import com.acessolivre.mapper.UsuarioMapper;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.security.AuthenticationService;
import com.acessolivre.security.JwtService;
import com.acessolivre.service.EmailVerificationService;
import com.acessolivre.service.TwoFactorService;
import com.acessolivre.dto.request.TwoFactorEnableRequestDTO;
import com.acessolivre.dto.request.TwoFactorVerifyRequestDTO;
import com.acessolivre.service.RegistroUsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RegistroUsuarioService registroUsuarioService;
    private final com.acessolivre.security.LoginAttemptService loginAttemptService;
    private final EmailVerificationService emailVerificationService;
    private final TwoFactorService twoFactorService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        try {
            log.info("Tentativa de registro para email: {}", request.getEmail());
            Usuario usuario = registroUsuarioService.registrarUsuario(
                request.getNome(),
                request.getEmail(),
                request.getSenha()
            );
            log.info("Usuário registrado com sucesso. ID: {}, Email: {}", usuario.getIdUsuario(), usuario.getEmail());
            UsuarioResponseDTO responseDTO = UsuarioMapper.toResponse(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao registrar usuário: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao registrar usuário", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao registrar usuário");
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
            String emailDestino = twoFactorService.mascararEmail(request.getEmail());
            AuthResponseDTO response = AuthResponseDTO.builder()
                .twoFactorRequired(true)
                .emailDestino(emailDestino)
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (com.acessolivre.security.InvalidTwoFactorCodeException e) {
            log.warn("Código 2FA inválido para email={}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Código de autenticação de dois fatores inválido");
        } catch (com.acessolivre.security.EmailNotVerifiedException e) {
            log.warn("Email não verificado para email={}", request.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(e.getMessage());
        } catch (RuntimeException e) {
            // Verifica se é bloqueio por tentativas excessivas
            if (e.getMessage() != null && e.getMessage().contains("bloqueada")) {
                log.error("Login bloqueado para email={}: {}", request.getEmail(), e.getMessage());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(e.getMessage());
            }
            
            // Erro de credenciais inválidas
            int tentativasRestantes = loginAttemptService.tentativasRestantes(request.getEmail());
            String mensagem = tentativasRestantes > 0 
                ? String.format("Credenciais inválidas. Tentativas restantes: %d", tentativasRestantes)
                : "Conta bloqueada temporariamente";
            
            log.warn("Falha no login para email={}: {} (tentativas restantes: {})", 
                request.getEmail(), e.getMessage(), tentativasRestantes);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mensagem);
        } catch (Exception e) {
            log.error("Erro inesperado no login para email={}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro ao processar login");
        }
    }

    @PostMapping("/2fa/verify-code")
    public ResponseEntity<?> verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyRequestDTO request) {
        try {
            String token = authenticationService.completarLoginComCodigo(request.getEmail(), request.getCodigo());
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .usuario(UsuarioMapper.toResponse(usuario))
                .twoFactorRequired(false)
                .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Falha ao validar código 2FA para email={}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Código inválido ou expirado");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                log.warn("Tentativa de logout sem token");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token não fornecido");
            }
            
            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            authenticationService.logout(token, userId);
            
            log.info("Logout realizado com sucesso para userId={}", userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao processar logout", e);
            return ResponseEntity.ok().build();
        }
    }

    // ============ 2FA Endpoints ============

    @PostMapping("/2fa/setup")
    public ResponseEntity<?> setupTwoFactor(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            var desafio = twoFactorService.criarDesafioLogin(usuario.getEmail(), false);
            return ResponseEntity.ok(desafio.emailMascarado());
        } catch (Exception e) {
            log.error("Erro ao configurar 2FA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao configurar 2FA");
        }
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enableTwoFactor(HttpServletRequest request, @Valid @RequestBody TwoFactorEnableRequestDTO body) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            twoFactorService.validarCodigoLogin(usuario.getEmail(), String.valueOf(body.getVerificationCode()));
            twoFactorService.habilitar(userId);
            return ResponseEntity.ok("2FA habilitado com sucesso");
        } catch (Exception e) {
            log.error("Erro ao habilitar 2FA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao habilitar 2FA");
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disableTwoFactor(HttpServletRequest request, @Valid @RequestBody TwoFactorEnableRequestDTO body) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            twoFactorService.validarCodigoLogin(usuario.getEmail(), String.valueOf(body.getVerificationCode()));
            twoFactorService.desabilitar(userId);
            return ResponseEntity.ok("2FA desabilitado com sucesso");
        } catch (Exception e) {
            log.error("Erro ao desabilitar 2FA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao desabilitar 2FA");
        }
    }

    @GetMapping("/2fa/status")
    public ResponseEntity<?> twoFactorStatus(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token não fornecido");
            }

            String token = auth.substring(7);
            Long userId = jwtService.obterIdUsuarioDoToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido");
            }

            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            boolean enabled = Boolean.TRUE.equals(usuario.getTwoFactorEnabled());
            return ResponseEntity.ok(enabled);
        } catch (Exception e) {
            log.error("Erro ao consultar status 2FA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao consultar status 2FA");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = auth.substring(7);
        if (authenticationService.isTokenRevoked(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtService.obterIdUsuarioDoToken(token);
        return usuarioRepository.findById(userId)
                .map(u -> ResponseEntity.ok(UsuarioMapper.toResponse(u)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token não fornecido");
            }
            
            String currentToken = auth.substring(7);
            Long tokenUserId = jwtService.obterIdUsuarioDoToken(currentToken);
            
            if (!tokenUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuário não autorizado");
            }
            
            if (authenticationService.isTokenRevoked(currentToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token revogado");
            }
            
            String newToken = authenticationService.reautenticar(userId);
            
            log.info("Token renovado para userId={}", userId);
            return ResponseEntity.ok(newToken);
        } catch (Exception e) {
            log.error("Erro ao reautenticar userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro ao renovar token");
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequestDTO request) {
        try {
            log.info("Verificação de email para: {}", request.getEmail());
            boolean verificado = emailVerificationService.verificarCodigo(
                request.getEmail(), 
                request.getCodigo()
            );
            
            if (verificado) {
                log.info("Email verificado com sucesso: {}", request.getEmail());
                return ResponseEntity.ok("Email verificado com sucesso");
            } else {
                log.warn("Código de verificação inválido para: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Código inválido ou expirado");
            }
        } catch (Exception e) {
            log.error("Erro ao verificar email: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(e.getMessage());
        }
    }

    @PostMapping("/resend-verification-code")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            log.info("Reenviando código de verificação para: {}", email);
            emailVerificationService.reenviarCodigo(email);
            return ResponseEntity.ok("Código reenviado com sucesso");
        } catch (Exception e) {
            log.error("Erro ao reenviar código para: {}", email, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
        }
    }
}
