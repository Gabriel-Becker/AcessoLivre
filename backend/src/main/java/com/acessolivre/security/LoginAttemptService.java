package com.acessolivre.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço para rastrear tentativas de login e implementar rate limiting
 * Protege contra ataques de força bruta bloqueando temporariamente após múltiplas falhas
 */
@Service
@Slf4j
public class LoginAttemptService {

    private static final int MAX_TENTATIVAS = 5;
    private static final int MINUTOS_BLOQUEIO = 15;

    private final Map<String, TentativaLogin> tentativasPorEmail = new ConcurrentHashMap<>();

    /**
     * Registra uma tentativa de login com sucesso e limpa o histórico de falhas
     */
    public void loginSucesso(String email) {
        tentativasPorEmail.remove(email);
        log.info("Login bem-sucedido para {}, contador resetado", email);
    }

    /**
     * Registra uma tentativa de login falha
     */
    public void loginFalhou(String email) {
        TentativaLogin tentativa = tentativasPorEmail.computeIfAbsent(
            email, 
            k -> new TentativaLogin()
        );
        
        tentativa.incrementar();
        log.warn("Login falhou para {}. Tentativas: {}/{}", email, tentativa.getContador(), MAX_TENTATIVAS);
        
        if (tentativa.getContador() >= MAX_TENTATIVAS) {
            tentativa.bloquear();
            log.error("Usuário {} bloqueado temporariamente por {} minutos após {} tentativas falhas", 
                email, MINUTOS_BLOQUEIO, MAX_TENTATIVAS);
        }
    }

    /**
     * Verifica se o email está bloqueado
     */
    public boolean estaBloqueado(String email) {
        TentativaLogin tentativa = tentativasPorEmail.get(email);
        
        if (tentativa == null) {
            return false;
        }
        
        // Se passou o tempo de bloqueio, limpa o registro
        if (tentativa.isBloqueado() && tentativa.getBloqueioExpiraEm().isBefore(LocalDateTime.now())) {
            tentativasPorEmail.remove(email);
            log.info("Bloqueio expirado para {}, liberado para nova tentativa", email);
            return false;
        }
        
        return tentativa.isBloqueado();
    }

    /**
     * Retorna quantas tentativas restam antes do bloqueio
     */
    public int tentativasRestantes(String email) {
        TentativaLogin tentativa = tentativasPorEmail.get(email);
        if (tentativa == null) {
            return MAX_TENTATIVAS;
        }
        return Math.max(0, MAX_TENTATIVAS - tentativa.getContador());
    }

    /**
     * Retorna quando o bloqueio expira (se bloqueado)
     */
    public LocalDateTime getBloqueioExpiraEm(String email) {
        TentativaLogin tentativa = tentativasPorEmail.get(email);
        return tentativa != null ? tentativa.getBloqueioExpiraEm() : null;
    }

    /**
     * Classe interna para rastrear tentativas de um email específico
     */
    private static class TentativaLogin {
        private int contador = 0;
        private boolean bloqueado = false;
        private LocalDateTime bloqueioExpiraEm;

        public void incrementar() {
            contador++;
        }

        public void bloquear() {
            bloqueado = true;
            bloqueioExpiraEm = LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEIO);
        }

        public int getContador() {
            return contador;
        }

        public boolean isBloqueado() {
            return bloqueado;
        }

        public LocalDateTime getBloqueioExpiraEm() {
            return bloqueioExpiraEm;
        }
    }
}
