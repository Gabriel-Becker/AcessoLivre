package com.acessolivre.security;

import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioAutenticarRepository repository;

    public CustomUserDetailsService(UsuarioAutenticarRepository repository) {
        this.repository = repository;
    }

    /**
     * Carrega dados do usuário para autenticação usando email como username.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UsuarioAutenticar ua = repository.findByUsuario_Email(email)
                .orElseThrow(() -> new UsernameNotFoundException("Não encontramos nenhum usuário com o e-mail informado: " + email));

        // Usamos a senha já armazenada (hash) e a role do usuário
        String role = "USER";
        if (ua.getUsuario() != null && ua.getUsuario().getRole() != null) {
            role = ua.getUsuario().getRole().name().replace("ROLE_", "");
        }

        return User.builder()
                .username(ua.getUsuario().getEmail())
                .password(ua.getSenhaHash())
                .roles(role)
                .build();
    }
}
