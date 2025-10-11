package com.example.acessolivre.mapper;

import com.example.acessolivre.dto.request.TwoFactorRecoveryCodeRequestDTO;
import com.example.acessolivre.dto.response.TwoFactorRecoveryCodeResponseDTO;
import com.example.acessolivre.model.TwoFactorRecoveryCode;
import com.example.acessolivre.model.Usuario;

import java.util.List;
import java.util.stream.Collectors;

public class TwoFactorRecoveryCodeMapper {

    /**
     * Converte TwoFactorRecoveryCodeRequestDTO para entidade TwoFactorRecoveryCode
     * @param dto DTO de requisição
     * @param usuario Usuário associado ao código
     * @return Entidade TwoFactorRecoveryCode
     */
    public static TwoFactorRecoveryCode toEntity(TwoFactorRecoveryCodeRequestDTO dto, Usuario usuario) {
        if (dto == null) {
            return null;
        }
        
        return TwoFactorRecoveryCode.builder()
                .code(dto.getCode().trim())
                .createdAt(dto.getCreatedAt())
                .expiresAt(dto.getExpiresAt())
                .used(dto.getUsed())
                .usuario(usuario)
                .build();
    }

    /**
     * Converte entidade TwoFactorRecoveryCode para TwoFactorRecoveryCodeResponseDTO
     * @param entity Entidade TwoFactorRecoveryCode
     * @return DTO de resposta
     */
    public static TwoFactorRecoveryCodeResponseDTO toResponse(TwoFactorRecoveryCode entity) {
        if (entity == null) {
            return null;
        }
        
        return new TwoFactorRecoveryCodeResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getCreatedAt(),
                entity.getExpiresAt(),
                entity.getUsed(),
                entity.getUsuario() != null ? Long.valueOf(entity.getUsuario().getIdUsuario()) : null
        );
    }

    /**
     * Converte lista de entidades TwoFactorRecoveryCode para lista de ResponseDTOs
     * @param entities Lista de entidades
     * @return Lista de DTOs de resposta
     */
    public static List<TwoFactorRecoveryCodeResponseDTO> fromEntityList(List<TwoFactorRecoveryCode> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(TwoFactorRecoveryCodeMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza uma entidade TwoFactorRecoveryCode existente com dados do TwoFactorRecoveryCodeRequestDTO
     * @param entity Entidade TwoFactorRecoveryCode a ser atualizada
     * @param dto DTO com os novos dados
     * @param usuario Usuário associado ao código
     * @return Entidade TwoFactorRecoveryCode atualizada
     */
    public static TwoFactorRecoveryCode updateEntity(TwoFactorRecoveryCode entity, TwoFactorRecoveryCodeRequestDTO dto, Usuario usuario) {
        if (entity == null || dto == null) {
            return entity;
        }
        
        entity.setCode(dto.getCode().trim());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setExpiresAt(dto.getExpiresAt());
        entity.setUsed(dto.getUsed());
        entity.setUsuario(usuario);
        
        return entity;
    }
}
