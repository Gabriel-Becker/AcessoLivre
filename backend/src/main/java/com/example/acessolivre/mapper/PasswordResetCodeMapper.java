package com.example.acessolivre.mapper;

import com.example.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.example.acessolivre.dto.response.PasswordResetCodeResponseDTO;
import com.example.acessolivre.model.PasswordResetCode;
import com.example.acessolivre.model.Usuario;

import java.util.List;
import java.util.stream.Collectors;

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
                .code(dto.getCode().trim())
                .cpf(dto.getCpf().trim())
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
                entity.getUsuario() != null ? Long.valueOf(entity.getUsuario().getIdUsuario()) : null
        );
    }

    /**
     * Converte lista de entidades PasswordResetCode para lista de ResponseDTOs
     * @param entities Lista de entidades
     * @return Lista de DTOs de resposta
     */
    public static List<PasswordResetCodeResponseDTO> fromEntityList(List<PasswordResetCode> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(PasswordResetCodeMapper::toResponse)
                .collect(Collectors.toList());
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
        
        entity.setCode(dto.getCode().trim());
        entity.setCpf(dto.getCpf().trim());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setExpiresAt(dto.getExpiresAt());
        entity.setUsed(dto.getUsed());
        entity.setUsuario(usuario);
        
        return entity;
    }
}
