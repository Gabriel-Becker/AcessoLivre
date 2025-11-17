package com.acessolivre.controller;

import com.acessolivre.dto.request.AuthRequestDTO;
import com.acessolivre.dto.request.RegisterRequestDTO;
import com.acessolivre.dto.response.AuthResponseDTO;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.security.AuthenticationService;
import com.acessolivre.security.JwtService;
import com.acessolivre.service.UsuarioAutenticarService;
import com.acessolivre.service.UsuarioService;
import com.acessolivre.mapper.UsuarioMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

/**
 * Controller responsável por autenticação (login) e emissão de tokens JWT.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final UsuarioAutenticarService usuarioAutenticarService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registro de novo usuário com criação do registro de autenticação (senha hash).
     * Aberto ao público.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        try {
            log.info("Registro de novo usuário (email={} cpf={})", request.getEmail(), request.getCpf());

            // Salva usuário básico
            Usuario usuario = UsuarioMapper.toEntity(
                    com.acessolivre.dto.request.UsuarioRequestDTO.builder()
                            .nome(request.getNome())
                            .email(request.getEmail())
                            .cpf(request.getCpf())
                            .role(null) // usa padrão "usuario"
                            .imagemPerfil(null)
                            .build()
            );
            Usuario salvo = usuarioService.salvar(usuario);

            // Cria registro de autenticação com senha codificada (BCrypt)
            UsuarioAutenticar ua = UsuarioAutenticar.builder()
                    .usuario(salvo)
                    .senhaHash(passwordEncoder.encode(request.getSenha()))
                    .dataExpiracao(java.time.LocalDateTime.now().plusYears(1))
                    .build();
            usuarioAutenticarService.salvar(ua);

            return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioMapper.toResponse(salvo));
        } catch (IllegalArgumentException e) {
            log.warn("Falha no registro: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao registrar usuário: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDTO request) {
        try {
            String token = authenticationService.login(request.getCpf(), request.getSenha(), request.getRememberMe());
            Optional<Usuario> u = usuarioRepository.findByCpf(request.getCpf());
            Long userId = u.map(Usuario::getIdUsuario).orElse(null);
            log.info("Usuário autenticado (CPF={}): id={}", request.getCpf(), userId);
            return ResponseEntity.ok(new AuthResponseDTO(token, request.getCpf(), userId));
        } catch (Exception e) {
            log.warn("Falha no login para CPF={}: {}", request.getCpf(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.badRequest().build();
        String token = auth.substring(7);
        Long userId = jwtService.obterIdUsuarioDoToken(token);
        authenticationService.logout(token, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String token = auth.substring(7);
        if (authenticationService.isTokenRevoked(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long userId = jwtService.obterIdUsuarioDoToken(token);
        return usuarioRepository.findById(userId)
                .map(u -> ResponseEntity.ok(u))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
