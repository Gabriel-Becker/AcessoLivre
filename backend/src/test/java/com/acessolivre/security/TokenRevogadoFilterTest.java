package com.acessolivre.security;

import com.acessolivre.repository.TokenRevogadoRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.mockito.Mockito.*;

class TokenRevogadoFilterTest {

    @InjectMocks
    private TokenRevogadoFilter tokenRevogadoFilter;

    @Mock
    private TokenRevogadoRepository tokenRevogadoRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_deveLimparContexto_quandoTokenRevogado() throws ServletException, IOException {
        String jwt = "revoked-token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(tokenRevogadoRepository.existsByToken(jwt)).thenReturn(true);

        Authentication auth = mock(Authentication.class);
        SecurityContextHolder.getContext().setAuthentication(auth);

        tokenRevogadoFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_naoDeveFazerNada_quandoTokenNaoRevogado() throws ServletException, IOException {
        String jwt = "valid-token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(tokenRevogadoRepository.existsByToken(jwt)).thenReturn(false);

        Authentication auth = mock(Authentication.class);
        SecurityContextHolder.getContext().setAuthentication(auth);

        tokenRevogadoFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_naoDeveFazerNada_quandoHeaderAusente() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);

        tokenRevogadoFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(tokenRevogadoRepository, never()).existsByToken(anyString());
    }
}
