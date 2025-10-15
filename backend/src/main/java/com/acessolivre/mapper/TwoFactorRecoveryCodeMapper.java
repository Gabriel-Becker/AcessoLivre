package com.acessolivre.mapper;

import com.acessolivre.dto.request.TwoFactorRecoveryCodeRequestDTO;
import com.acessolivre.dto.response.TwoFactorRecoveryCodeResponseDTO;
import com.acessolivre.model.TwoFactorRecoveryCode;
import com.acessolivre.model.Usuario;

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
                .codigo(dto.getCodigo().trim())
                .dataCriacao(dto.getDataCriacao())
                .dataExpiracao(dto.getDataExpiracao())
                .utilizado(dto.getUtilizado())
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
        
        return TwoFactorRecoveryCodeResponseDTO.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .dataCriacao(entity.getDataCriacao())
                .dataExpiracao(entity.getDataExpiracao())
                .utilizado(entity.getUtilizado())
                .usuarioId(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .build();
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
        
        entity.setCodigo(dto.getCodigo().trim());
        entity.setDataCriacao(dto.getDataCriacao());
        entity.setDataExpiracao(dto.getDataExpiracao());
        entity.setUtilizado(dto.getUtilizado());
        entity.setUsuario(usuario);
        
        return entity;
    }
}
