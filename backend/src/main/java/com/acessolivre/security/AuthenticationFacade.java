package com.acessolivre.security;

import com.acessolivre.exception.DenunciaException;
import com.acessolivre.exception.AuthenticationException;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFacade {
    
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Obtém o usuário autenticado atual
     */
    public Usuario getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("Nenhum usuário autenticado encontrado no contexto de segurança");
            throw new DenunciaException("Usuário não autenticado");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            log.debug("Buscando usuário autenticado: {}", username);
            
            return usuarioRepository.findByEmail(username)
                    .orElseThrow(() -> new DenunciaException("Usuário autenticado não encontrado no banco de dados: " + username));
        }
        
        log.error("Principal não é uma instância de UserDetails: {}", principal.getClass());
        throw new DenunciaException("Usuário autenticado inválido");
    }
    
    /**
     * Obtém o ID do usuário autenticado
     */
    public Long getAuthenticatedUserId() {
        return getAuthenticatedUser().getIdUsuario();
    }
    
    /**
     * Obtém o email do usuário autenticado
     */
    public String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new DenunciaException("Usuário não autenticado");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        
        return principal.toString();
    }
    
    /**
     * Verifica se o usuário atual tem permissão para acessar um recurso
     */
    public boolean hasPermission(String requiredRole) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.getAuthorities().stream()
                   .anyMatch(granted -> granted.getAuthority().equals(requiredRole));
    }
}