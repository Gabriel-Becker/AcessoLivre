package com.acessolivre.security;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TokenResponseFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private TokenResponseFilter tokenResponseFilter;

    @Test
    void doFilterInternal_DeveSeguirFluxoQuandoHeaderAusente() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);

        tokenResponseFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(jwtService, never()).obterIdUsuarioDoToken(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void doFilterInternal_DeveSeguirFluxoQuandoTokenRevogado() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer token-revogado");
        when(jwtService.isTokenRevogado("token-revogado")).thenReturn(true);

        tokenResponseFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(usuarioRepository, never()).findById(org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void doFilterInternal_DeveAdicionarHeaderQuandoUsuarioTemTokenAtualDiferente() throws ServletException, IOException {
        Usuario usuario = Usuario.builder().idUsuario(5L).tokenAtual("novo-token").build();

        when(request.getHeader("Authorization")).thenReturn("Bearer token-antigo");
        when(jwtService.isTokenRevogado("token-antigo")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-antigo")).thenReturn(5L);
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(usuario));

        tokenResponseFilter.doFilterInternal(request, response, filterChain);

        verify(response).setHeader("New-Auth-Token", "novo-token");
        verify(response).setHeader("Access-Control-Expose-Headers", "New-Auth-Token");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_NaoDeveAdicionarHeaderQuandoTokenAtualIgual() throws ServletException, IOException {
        Usuario usuario = Usuario.builder().idUsuario(6L).tokenAtual("token-igual").build();

        when(request.getHeader("Authorization")).thenReturn("Bearer token-igual");
        when(jwtService.isTokenRevogado("token-igual")).thenReturn(false);
        when(jwtService.obterIdUsuarioDoToken("token-igual")).thenReturn(6L);
        when(usuarioRepository.findById(6L)).thenReturn(Optional.of(usuario));

        tokenResponseFilter.doFilterInternal(request, response, filterChain);

        verify(response, never()).setHeader("New-Auth-Token", "token-igual");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_DeveIgnorarExcecaoInternaESeguirFiltro() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(jwtService.isTokenRevogado("token")).thenThrow(new RuntimeException("erro"));

        tokenResponseFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}
