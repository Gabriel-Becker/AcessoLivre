package com.acessolivre.scheduler;

import com.acessolivre.repository.TokenRevogadoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
public class TokenLimpezaScheduler {

    private final TokenRevogadoRepository tokenRevogadoRepository;

    public TokenLimpezaScheduler(TokenRevogadoRepository tokenRevogadoRepository) {
        this.tokenRevogadoRepository = tokenRevogadoRepository;
    }

    // TODO: Descomentar após correção do deleteByExpiracaoBefore
    // @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void limparTokensExpirados() {
        try {
            log.info("Iniciando limpeza automática de tokens expirados");
            
            LocalDateTime agora = LocalDateTime.now();
            int deletados = tokenRevogadoRepository.deleteByExpiracaoBefore(agora);
            
            log.info("Limpeza concluída: {} tokens expirados removidos", deletados);
        } catch (Exception e) {
            log.error("Erro ao executar limpeza de tokens: {}", e.getMessage());
        }
    }
}
