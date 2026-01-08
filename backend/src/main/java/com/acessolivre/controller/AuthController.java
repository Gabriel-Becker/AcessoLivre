package com.acessolivre.controller;

import com.acessolivre.dto.request.AuthRequestDTO;
import com.acessolivre.dto.request.RegisterRequestDTO;
import com.acessolivre.dto.response.AuthResponseDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.mapper.UsuarioMapper;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.security.AuthenticationService;
import com.acessolivre.security.JwtService;
import com.acessolivre.service.RegistroUsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Optional;

/**
 * Controller responsável por autenticação (login, registro) e emissão de tokens JWT.
 * 
 * TODO: Implementar autenticação de dois fatores (2FA)
 * - Adicionar endpoint para habilitar/desabilitar 2FA
 * - Adicionar endpoint para validar código 2FA no login
 * - Implementar geração de QR code para Google Authenticator
 * - Adicionar códigos de recuperação
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RegistroUsuarioService registroUsuarioService;

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
            String token = authenticationService.login(request.getEmail(), request.getSenha(), request.getRememberMe());
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
                .build();
            
            log.info("Usuário autenticado (email={}): id={}", request.getEmail(), usuario.getIdUsuario());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Falha no login para email={}: {}", request.getEmail(), e.getMessage());
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
}
