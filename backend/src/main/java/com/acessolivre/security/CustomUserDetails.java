package com.acessolivre.security;

import com.acessolivre.model.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String nome;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Usuario usuario) {
        this.id = usuario.getIdUsuario();
        this.email = usuario.getEmail();
        this.nome = usuario.getNome();
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority(usuario.getRole().name())
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}