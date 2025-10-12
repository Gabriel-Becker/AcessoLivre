package com.acessolivre.mapper;

import com.acessolivre.dto.request.TokenRevogadoRequestDTO;
import com.acessolivre.dto.response.TokenRevogadoResponseDTO;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;

public class TokenRevogadoMapper {

    /**
     * Converte TokenRevogadoRequestDTO para entidade TokenRevogado
     * @param dto DTO de requisição
     * @param usuario Usuário associado ao token
     * @return Entidade TokenRevogado
     */
    public static TokenRevogado toEntity(TokenRevogadoRequestDTO dto, Usuario usuario) {
        if (dto == null) {
            return null;
        }
        
        return TokenRevogado.builder()
                .dataRevogacao(dto.getDataRevogacao())
                .token(dto.getToken().trim())
                .usuario(usuario)
                .build();
    }

    /**
     * Converte entidade TokenRevogado para TokenRevogadoResponseDTO
     * @param entity Entidade TokenRevogado
     * @return DTO de resposta
     */
    public static TokenRevogadoResponseDTO toResponse(TokenRevogado entity) {
        if (entity == null) {
            return null;
        }
        
        return TokenRevogadoResponseDTO.builder()
                .id(entity.getId())
                .dataRevogacao(entity.getDataRevogacao())
                .token(entity.getToken())
                .usuarioId(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .build();
    }

    /**
     * Atualiza uma entidade TokenRevogado existente com dados do TokenRevogadoRequestDTO
     * @param entity Entidade TokenRevogado a ser atualizada
     * @param dto DTO com os novos dados
     * @param usuario Usuário associado ao token
     * @return Entidade TokenRevogado atualizada
     */
    public static TokenRevogado updateEntity(TokenRevogado entity, TokenRevogadoRequestDTO dto, Usuario usuario) {
        if (entity == null || dto == null) {
            return entity;
        }
        
        entity.setDataRevogacao(dto.getDataRevogacao());
        entity.setToken(dto.getToken().trim());
        entity.setUsuario(usuario);
        
        return entity;
    }
}
