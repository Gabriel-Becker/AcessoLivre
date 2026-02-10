package com.acessolivre.security;

import java.io.IOException;

import com.acessolivre.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
public class TokenResponseFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (!jwtService.isTokenRevogado(token)) {
                    Long userId = jwtService.obterIdUsuarioDoToken(token);
                    if (userId != null) {
                        usuarioRepository.findById(userId).ifPresent(usuario -> {
                            String tokenAtual = usuario.getTokenAtual();
                            if (tokenAtual != null && !tokenAtual.equals(token)) {
                                response.setHeader("New-Auth-Token", tokenAtual);
                                response.setHeader("Access-Control-Expose-Headers", "New-Auth-Token");
                            }
                        });
                    }
                }
            } catch (Exception e) {
                // Evita quebrar a requisicao caso a validacao falhe
            }
        }

        filterChain.doFilter(request, response);
    }
}
