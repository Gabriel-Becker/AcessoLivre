package com.acessolivre.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;

@SuppressWarnings("null")
class CustomUserDetailsTest {

    @Test
    void construtor_DeveMapearCamposDoUsuario() {
        Usuario usuario = Usuario.builder()
            .idUsuario(42L)
            .nome("Gabriel")
            .email("gabriel@email.com")
            .role(Role.ROLE_ADMIN)
            .build();

        DetalhesUsuario details = new DetalhesUsuario(usuario);

        assertEquals(42L, details.getId());
        assertEquals("Gabriel", details.getNome());
        assertEquals("gabriel@email.com", details.getEmail());
        assertEquals("gabriel@email.com", details.getUsername());
        assertEquals("", details.getPassword());
        assertEquals(1, details.getAuthorities().size());
        assertEquals("ROLE_ADMIN", details.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void flagsDeConta_DeveRetornarTrue() {
        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .nome("Teste")
            .email("teste@email.com")
            .role(Role.ROLE_USER)
            .build();

        DetalhesUsuario details = new DetalhesUsuario(usuario);

        assertTrue(details.isAccountNonExpired());
        assertTrue(details.isAccountNonLocked());
        assertTrue(details.isCredentialsNonExpired());
        assertTrue(details.isEnabled());
    }
}
