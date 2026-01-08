package com.acessolivre.scheduler;

import com.acessolivre.repository.PasswordResetCodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
public class CodigosResetScheduler {

    private final PasswordResetCodeRepository passwordResetCodeRepository;

    public CodigosResetScheduler(PasswordResetCodeRepository passwordResetCodeRepository) {
        this.passwordResetCodeRepository = passwordResetCodeRepository;
    }

    // TODO: Descomentar após correção do deleteByExpiresAtBefore
    // @Scheduled(fixedRate = 3600000)
    @Transactional
    public void limparCodigosExpirados() {
        try {
            log.debug("Verificando códigos de reset expirados");
            
            LocalDateTime agora = LocalDateTime.now();
            int deletados = passwordResetCodeRepository.deleteByExpiresAtBefore(agora);
            
            if (deletados > 0) {
                log.info("Removidos {} códigos de reset expirados", deletados);
            }
        } catch (Exception e) {
            log.error("Erro ao limpar códigos de reset: {}", e.getMessage());
        }
    }
}
