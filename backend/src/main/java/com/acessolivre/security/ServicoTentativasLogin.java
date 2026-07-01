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
public class ServicoTentativasLogin {

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
        log.warn("Login falhou para {}. Tentativas: {}/{}", email, tentativa.obterContador(), MAX_TENTATIVAS);
        
        if (tentativa.obterContador() >= MAX_TENTATIVAS) {
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
        if (tentativa.estaBloqueado() && tentativa.obterExpiracaoBloqueio().isBefore(LocalDateTime.now())) {
            tentativasPorEmail.remove(email);
            log.info("Bloqueio expirado para {}, liberado para nova tentativa", email);
            return false;
        }
        
        return tentativa.estaBloqueado();
    }

    /**
     * Retorna quantas tentativas restam antes do bloqueio
     */
    public int tentativasRestantes(String email) {
        TentativaLogin tentativa = tentativasPorEmail.get(email);
        if (tentativa == null) {
            return MAX_TENTATIVAS;
        }
        return Math.max(0, MAX_TENTATIVAS - tentativa.obterContador());
    }

    /**
     * Retorna quando o bloqueio expira (se bloqueado)
     */
    public LocalDateTime obterExpiracaoBloqueio(String email) {
        TentativaLogin tentativa = tentativasPorEmail.get(email);
        return tentativa != null ? tentativa.obterExpiracaoBloqueio() : null;
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

        public int obterContador() {
            return contador;
        }

        public boolean estaBloqueado() {
            return bloqueado;
        }

        public LocalDateTime obterExpiracaoBloqueio() {
            return bloqueioExpiraEm;
        }
    }
}
