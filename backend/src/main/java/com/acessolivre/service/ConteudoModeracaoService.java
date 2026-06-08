package com.acessolivre.service;

import com.acessolivre.enums.TipoDenuncia;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConteudoModeracaoService {

    private final LocalService localService;
    private final AvaliacaoService avaliacaoService;

    @Transactional
    public String removerConteudoDenunciado(TipoDenuncia tipo, Long targetId) {
        log.info("🔨 [MODERAÇÃO] Removendo conteúdo denunciado (soft delete) - Tipo: {}, TargetId: {}", tipo, targetId);

        try {
            if (tipo == TipoDenuncia.LOCAL) {
                localService.removerLocal(targetId);
                return String.format(" Local ID %d foi desativado (exclusão lógica)", targetId);
                
            } else if (tipo == TipoDenuncia.AVALIACAO) {
                avaliacaoService.removerAvaliacao(targetId);
                return String.format("Avaliação ID %d foi ocultada (exclusão lógica)", targetId);
                
            } else {
                log.warn("[MODERAÇÃO] Tipo de denúncia não suportado para remoção automática: {}", tipo);
                return "Nenhum conteúdo foi removido (tipo de denúncia não suportado)";
            }
            
        } catch (Exception e) {
            log.error("[MODERAÇÃO] Erro ao remover conteúdo - Tipo: {}, TargetId: {}, Erro: {}", 
                     tipo, targetId, e.getMessage(), e);
            throw new RuntimeException("Falha ao remover conteúdo: " + e.getMessage(), e);
        }
    }
}