package com.acessolivre.mapper;

import com.acessolivre.dto.response.TipoAcessibilidadeResponseDTO;
import com.acessolivre.model.TipoAcessibilidade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TipoAcessibilidadeMapper {

    public static TipoAcessibilidadeResponseDTO toResponse(TipoAcessibilidade entity) {
        if (entity == null) {
            return null;
        }

        return TipoAcessibilidadeResponseDTO.builder()
                .idTipoAcessibilidade(entity.getIdTipoAcessibilidade())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .iconeUrl(entity.getIconeUrl())
                .build();
    }
}