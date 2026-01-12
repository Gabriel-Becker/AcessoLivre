package com.acessolivre.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro para adicionar headers de segurança HTTP
 * Protege contra XSS, clickjacking, MIME sniffing e outras vulnerabilidades
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Content Security Policy - previne XSS
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none'");

        // Previne clickjacking
        response.setHeader("X-Frame-Options", "DENY");

        // Previne MIME sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Habilita proteção XSS do navegador
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Controla informações de referrer
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions Policy (antiga Feature Policy)
        response.setHeader("Permissions-Policy",
                "geolocation=(), " +
                "microphone=(), " +
                "camera=(), " +
                "payment=(), " +
                "usb=()");

        // HSTS (HTTP Strict Transport Security) - apenas em produção
        if ("prod".equalsIgnoreCase(activeProfile)) {
            // max-age=31536000 = 1 ano
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
            log.debug("HSTS habilitado para produção");
        }

        filterChain.doFilter(request, response);
    }
}
