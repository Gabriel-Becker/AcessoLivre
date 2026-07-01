package com.acessolivre.mapper;

import com.acessolivre.dto.request.CodigoRecuperacaoSenhaRequestDTO;
import com.acessolivre.dto.response.CodigoRecuperacaoSenhaResponseDTO;
import com.acessolivre.model.CodigoRecuperacaoSenha;
import com.acessolivre.model.Usuario;

import java.util.List;
import java.util.stream.Collectors;

public class CodigoRecuperacaoSenhaMapper {

    /**
     * Converte PasswordResetCodeRequestDTO para entidade PasswordResetCode
     * @param dto DTO de requisição
     * @param usuario Usuário associado ao código
     * @return Entidade PasswordResetCode
     */
    public static CodigoRecuperacaoSenha toEntity(CodigoRecuperacaoSenhaRequestDTO dto, Usuario usuario) {
        if (dto == null) {
            return null;
        }
        
        return CodigoRecuperacaoSenha.builder()
                .code(dto.getCode().trim())
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
    public static CodigoRecuperacaoSenhaResponseDTO toResponse(CodigoRecuperacaoSenha entity) {
        if (entity == null) {
            return null;
        }
        
        return CodigoRecuperacaoSenhaResponseDTO.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .createdAt(entity.getCreatedAt())
                .expiresAt(entity.getExpiresAt())
                .used(entity.getUsed())
                .usuarioId(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .build();
    }

    /**
     * Converte lista de entidades PasswordResetCode para lista de ResponseDTOs
     * @param entities Lista de entidades
     * @return Lista de DTOs de resposta
     */
    public static List<CodigoRecuperacaoSenhaResponseDTO> fromEntityList(List<CodigoRecuperacaoSenha> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(CodigoRecuperacaoSenhaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza uma entidade PasswordResetCode existente com dados do PasswordResetCodeRequestDTO
     * @param entity Entidade PasswordResetCode a ser atualizada
     * @param dto DTO com os novos dados
     * @param usuario Usuário associado ao código
     * @return Entidade PasswordResetCode atualizada
     */
    public static CodigoRecuperacaoSenha updateEntity(CodigoRecuperacaoSenha entity, CodigoRecuperacaoSenhaRequestDTO dto, Usuario usuario) {
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
