package com.acessolivre.security;

import com.acessolivre.exception.ExcecaoAutenticacao;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FachadaAutenticacao {
    
    private final UsuarioRepository usuarioRepository;
    
    public Usuario getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("❌ Nenhum usuário autenticado encontrado");
            throw new ExcecaoAutenticacao("Usuário não autenticado");
        }
        
        log.info("✅ Authentication encontrado - Type: {}", authentication.getClass().getSimpleName());
        log.info("   isAuthenticated: {}", authentication.isAuthenticated());
        log.info("   Principal type: {}", authentication.getPrincipal().getClass().getName());
        
        String email = extractEmailFromAuthentication(authentication);
        log.info("📧 Email extraído: {}", email);
        
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> {
                    log.error("❌ Usuário não encontrado no banco: {}", email);
                    return new ExcecaoAutenticacao("Usuário não encontrado: " + email);
                });
        
        log.info("✅ Usuário encontrado: ID={}, Nome={}, Role={}", 
                 usuario.getIdUsuario(), usuario.getNome(), usuario.getRole());
        
        return usuario;
    }
    
    private String extractEmailFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        
        // Caso 1: UserDetails (do nosso JwtAuthenticationFilter)
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            log.debug("Email extraído de UserDetails: {}", username);
            return username;
        }
        
        // Caso 2: JWT (Resource Server)
        if (principal instanceof Jwt) {
            Jwt jwt = (Jwt) principal;
            String sub = jwt.getClaim("sub");
            String email = jwt.getClaim("email");
            String username = sub != null ? sub : email;
            log.debug("Email extraído de JWT: {}", username);
            return username;
        }
        
        // Caso 3: String direta
        if (principal instanceof String) {
            String username = (String) principal;
            log.debug("Email extraído de String: {}", username);
            return username;
        }
        
        // Caso 4: Tentar via getName()
        try {
            String name = authentication.getName();
            if (name != null && !name.equals("anonymousUser")) {
                log.debug("Email extraído via getName(): {}", name);
                return name;
            }
        } catch (Exception e) {
            log.warn("Não foi possível extrair nome via getName(): {}", e.getMessage());
        }
        
        log.error("❌ Não foi possível extrair email do principal type: {}", principal.getClass().getName());
        throw new ExcecaoAutenticacao("Não foi possível extrair email do usuário autenticado");
    }
    
    public Long obterIdUsuarioAutenticado() {
        return getAuthenticatedUser().getIdUsuario();
    }
    
    public String obterEmailUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return extractEmailFromAuthentication(authentication);
    }
    
    public boolean temPermissao(String requiredRole) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.getAuthorities().stream()
                   .anyMatch(granted -> granted.getAuthority().equals(requiredRole));
    }
}