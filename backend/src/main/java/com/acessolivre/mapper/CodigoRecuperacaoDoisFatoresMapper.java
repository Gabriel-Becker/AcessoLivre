package com.acessolivre.mapper;

import com.acessolivre.dto.request.CodigoRecuperacaoDoisFatoresRequestDTO;
import com.acessolivre.dto.response.CodigoRecuperacaoDoisFatoresResponseDTO;
import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;

import java.util.List;
import java.util.stream.Collectors;

public class CodigoRecuperacaoDoisFatoresMapper {

    /**
     * Converte TwoFactorRecoveryCodeRequestDTO para entidade TwoFactorRecoveryCode
     * @param dto DTO de requisição
     * @param usuario Usuário associado ao código
     * @return Entidade TwoFactorRecoveryCode
     */
    public static CodigoRecuperacaoDoisFatores toEntity(CodigoRecuperacaoDoisFatoresRequestDTO dto, Usuario usuario) {
        if (dto == null) {
            return null;
        }
        
        return CodigoRecuperacaoDoisFatores.builder()
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
    public static CodigoRecuperacaoDoisFatoresResponseDTO toResponse(CodigoRecuperacaoDoisFatores entity) {
        if (entity == null) {
            return null;
        }
        
        return CodigoRecuperacaoDoisFatoresResponseDTO.builder()
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
    public static List<CodigoRecuperacaoDoisFatoresResponseDTO> fromEntityList(List<CodigoRecuperacaoDoisFatores> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(CodigoRecuperacaoDoisFatoresMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza uma entidade TwoFactorRecoveryCode existente com dados do TwoFactorRecoveryCodeRequestDTO
     * @param entity Entidade TwoFactorRecoveryCode a ser atualizada
     * @param dto DTO com os novos dados
     * @param usuario Usuário associado ao código
     * @return Entidade TwoFactorRecoveryCode atualizada
     */
    public static CodigoRecuperacaoDoisFatores updateEntity(CodigoRecuperacaoDoisFatores entity, CodigoRecuperacaoDoisFatoresRequestDTO dto, Usuario usuario) {
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
