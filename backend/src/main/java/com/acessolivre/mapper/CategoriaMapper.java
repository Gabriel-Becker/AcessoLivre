package com.acessolivre.mapper;

import com.acessolivre.dto.response.CategoriaResponseDTO;
import com.acessolivre.model.Categoria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoriaMapper {

    public static CategoriaResponseDTO toResponse(Categoria entity) {
        if (entity == null) {
            return null;
        }

        return CategoriaResponseDTO.builder()
                .idCategoria(entity.getIdCategoria())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .build();
    }
}