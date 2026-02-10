package com.acessolivre.security;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Filtro responsável por interceptar requisições e validar o token JWT.
 */
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            // Fallback para proxies/servidores que normalizam nomes de header.
            authHeader = request.getHeader("authorization");
        }
        if (authHeader == null) {
            // Fallback defensivo para variacoes comuns em ambiente web.
            authHeader = request.getHeader("X-Authorization");
        }
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (log.isDebugEnabled()) {
                log.debug("Authorization ausente ou invalido. path={}, hasHeader={}, hasBearerPrefix={}",
                        request.getRequestURI(), authHeader != null, authHeader != null && authHeader.startsWith("Bearer "));
            }
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        userEmail = jwtService.extrairNomeUsuario(jwt);
        if (userEmail == null) {
            log.warn("JWT invalido: nao foi possivel extrair usuario. path={}", request.getRequestURI());
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                log.warn("JWT rejeitado na validacao. path={}, usuario={}", request.getRequestURI(), userEmail);
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
