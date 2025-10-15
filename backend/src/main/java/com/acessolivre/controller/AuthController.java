package com.acessolivre.controller;

import com.acessolivre.dto.request.AuthRequestDTO;
import com.acessolivre.dto.response.AuthResponseDTO;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.security.AuthenticationService;
import com.acessolivre.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
