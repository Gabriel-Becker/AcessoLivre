package com.acessolivre.service;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.dto.response.ResolucaoDenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface DenunciaService {
    DenunciaResponseDTO criarDenuncia(DenunciaRequestDTO request, Long usuarioId);
    DenunciaResponseDTO buscarPorId(Long id);
    Page<DenunciaResponseDTO> listarDenuncias(
        TipoDenuncia tipo,
        StatusDenuncia status,
        String search,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        Long usuarioId,
        Pageable pageable
    );
    DenunciaResponseDTO atualizarStatus(Long id, StatusDenuncia novoStatus, String resolvidoPor, String observacoes);
    
    /**
     * Resolve uma denúncia e remove o conteúdo denunciado
     * @param id ID da denúncia
     * @param resolvidoPor Email do moderador que resolveu
     * @return DTO com informações da resolução
     */
    ResolucaoDenunciaResponseDTO resolverDenuncia(Long id, String resolvidoPor);
    
    /**
     * Rejeita uma denúncia (marca como rejeitada sem remover conteúdo)
     * @param id ID da denúncia
     * @param resolvidoPor Email do moderador que rejeitou
     * @param observacoes Motivo da rejeição
     * @return DTO com informações da rejeição
     */
    ResolucaoDenunciaResponseDTO rejeitarDenuncia(Long id, String resolvidoPor, String observacoes);
    
    void excluirDenuncia(Long id);
    void excluirDenunciasEmMassa(List<Long> ids);
    boolean usuarioJaDenunciou(Long usuarioId, TipoDenuncia tipo, Long targetId);
    long contarPorStatus(StatusDenuncia status);
    List<DenunciaResponseDTO> buscarPorTarget(TipoDenuncia tipo, Long targetId);
}