package com.example.acessolivre.mapper;

import com.example.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.example.acessolivre.dto.response.PasswordResetCodeResponseDTO;
import com.example.acessolivre.model.PasswordResetCode;
import com.example.acessolivre.model.Usuario;

public class PasswordResetCodeMapper {

    /**
     * Converte PasswordResetCodeRequestDTO para entidade PasswordResetCode
     * @param dto DTO de requisição
     * @param usuario Usuário associado ao código
     * @return Entidade PasswordResetCode
     */
    public static PasswordResetCode toEntity(PasswordResetCodeRequestDTO dto, Usuario usuario) {
        if (dto == null) {
            return null;
        }
        
        return PasswordResetCode.builder()
                .code(dto.getCode())
                .cpf(dto.getCpf())
                .createdAt(dto.getCreatedAt())
                .expiresAt(dto.getExpiresAt())
                .used(dto.getUsed())
                .usuario(usuario)
                .build();
    }

    /**
     * Converte entidade PasswordResetCode para PasswordResetCodeResponseDTO
     * @param entity Entidade PasswordResetCode
     * @return DTO de resposta
     */
    public static PasswordResetCodeResponseDTO toResponse(PasswordResetCode entity) {
        if (entity == null) {
            return null;
        }
        
        return new PasswordResetCodeResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getCpf(),
                entity.getCreatedAt(),
                entity.getExpiresAt(),
                entity.getUsed(),
                entity.getUsuario() != null ? entity.getUsuario().getIdUsuario().longValue() : null
        );
    }

    /**
     * Atualiza uma entidade PasswordResetCode existente com dados do PasswordResetCodeRequestDTO
     * @param entity Entidade PasswordResetCode a ser atualizada
     * @param dto DTO com os novos dados
     * @param usuario Usuário associado ao código
     * @return Entidade PasswordResetCode atualizada
     */
    public static PasswordResetCode updateEntity(PasswordResetCode entity, PasswordResetCodeRequestDTO dto, Usuario usuario) {
        if (entity == null || dto == null) {
            return entity;
        }
        
        entity.setCode(dto.getCode());
        entity.setCpf(dto.getCpf());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setExpiresAt(dto.getExpiresAt());
        entity.setUsed(dto.getUsed());
        entity.setUsuario(usuario);
        
        return entity;
    }
}
