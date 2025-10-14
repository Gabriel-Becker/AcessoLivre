package com.acessolivre.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class TokenRevogadoFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private static final String ERRO_TOKEN_REVOGADO = "Sua sessão expirou ou foi encerrada. Por favor, faça login novamente.";

    public TokenRevogadoFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtService.isTokenRevogado(token)) {
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"mensagem\": \"" + ERRO_TOKEN_REVOGADO + "\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
