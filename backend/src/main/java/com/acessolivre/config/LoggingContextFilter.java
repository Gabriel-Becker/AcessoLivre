package com.acessolivre.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtro para adicionar contexto aos logs usando MDC (Mapped Diagnostic Context)
 * Permite rastrear requisições e associar logs a usuários e endpoints
 */
@Component
@Order(1)
@Slf4j
public class LoggingContextFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID = "requestId";
    private static final String USER_EMAIL = "userEmail";
    private static final String ENDPOINT = "endpoint";
    private static final String HTTP_METHOD = "httpMethod";
    private static final String CLIENT_IP = "clientIp";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Gera ID único para rastrear a requisição
            String requestId = UUID.randomUUID().toString();
            MDC.put(REQUEST_ID, requestId);

            // Adiciona método HTTP e endpoint
            MDC.put(HTTP_METHOD, request.getMethod());
            MDC.put(ENDPOINT, request.getRequestURI());

            // Adiciona IP do cliente
            String clientIp = getClientIp(request);
            MDC.put(CLIENT_IP, clientIp);

            // Adiciona email do usuário se autenticado (será preenchido pelo JwtAuthenticationFilter)
            // Por enquanto deixa vazio, será atualizado se tiver autenticação
            MDC.put(USER_EMAIL, "anonymous");

            // Adiciona header de rastreamento na resposta
            response.setHeader("X-Request-ID", requestId);

            log.info("Requisição iniciada");

            filterChain.doFilter(request, response);

            log.info("Requisição finalizada - Status: {}", response.getStatus());

        } finally {
            // Limpa o contexto após a requisição para evitar vazamento de memória
            MDC.clear();
        }
    }

    /**
     * Obtém o IP real do cliente considerando proxies
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Se tiver múltiplos IPs (proxy chain), pega o primeiro
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
