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

@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class FiltroAutenticacaoJwt extends OncePerRequestFilter {

    private final ServicoJwt jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                   @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        log.info("🔍 JwtAuthenticationFilter executando para: {}", request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null) {
            authHeader = request.getHeader("authorization");
        }
        
        if (authHeader == null) {
            authHeader = request.getHeader("X-Authorization");
        }
        
        log.debug("Header Authorization: {}", authHeader != null ? "presente" : "ausente");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("⚠️ Token não encontrado ou formato inválido para: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        log.info("✅ Token JWT extraído (tamanho: {} chars)", jwt.length());
        
        final String userEmail = jwtService.extrairNomeUsuario(jwt);
        log.info("📧 Email extraído do token: {}", userEmail);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.info("🔐 Carregando UserDetails para: {}", userEmail);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.tokenEhValido(jwt, userDetails)) {
                log.info("✅ Token válido, autenticando usuário: {}", userEmail);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                log.info("✅ Autenticação configurada no SecurityContext");
            } else {
                log.error("❌ Token inválido para usuário: {}", userEmail);
            }
        } else {
            log.warn("⚠️ userEmail é null ou já existe autenticação no contexto");
        }
        
        filterChain.doFilter(request, response);
    }
}