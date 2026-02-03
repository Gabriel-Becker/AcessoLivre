package com.acessolivre.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        return isPublicPath(path);
    }

    private boolean isPublicPath(String path) {
        return path.equals("/api/auth/register")
                || path.equals("/api/auth/register/confirm")
                || path.equals("/api/auth/register/resend-code")
                || path.equals("/api/auth/me")
                || path.equals("/api/auth/login")
            || path.equals("/api/auth/validate")
            || path.equals("/api/auth/logout")
                || path.equals("/api/auth/change-password")
                || path.startsWith("/api/auth/2fa/")
                || path.startsWith("/api/auth/reset-password/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs/")
                || path.equals("/api/admin/bootstrap");
    }
}
