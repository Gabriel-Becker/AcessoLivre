package com.acessolivre.mapper;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.dto.response.AvaliacaoResponseDTO;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AvaliacaoMapper {

    public static Avaliacao toEntity(AvaliacaoRequestDTO dto, Usuario usuario, Local local, Double notaGeral, boolean moderado) {
        return Avaliacao.builder()
                .notaAcessibilidadeVisual(dto.getNotaAcessibilidadeVisual())
                .notaAcessibilidadeMotora(dto.getNotaAcessibilidadeMotora())
                .notaAcessibilidadeAuditiva(dto.getNotaAcessibilidadeAuditiva())
                .notaGeral(notaGeral)
                .comentario(dto.getComentario())
                .moderado(moderado)
                .usuario(usuario)
                .local(local)
                .build();
    }

    public static AvaliacaoResponseDTO toResponse(Avaliacao entity) {
        if (entity == null) return null;

        return AvaliacaoResponseDTO.builder()
                .idAvaliacao(entity.getIdAvaliacao())
                .notaAcessibilidadeVisual(entity.getNotaAcessibilidadeVisual())
                .notaAcessibilidadeMotora(entity.getNotaAcessibilidadeMotora())
                .notaAcessibilidadeAuditiva(entity.getNotaAcessibilidadeAuditiva())
                .notaGeral(entity.getNotaGeral())
                .comentario(entity.getComentario())
                .moderado(entity.getModerado())
                .dataAvaliacao(entity.getDataAvaliacao())
                .idUsuario(entity.getUsuario().getIdUsuario())
                .idLocal(entity.getLocal().getIdLocal())
                .build();
    }
}
