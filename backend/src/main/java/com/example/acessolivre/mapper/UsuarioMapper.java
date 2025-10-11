package com.example.acessolivre.mapper;

import com.example.acessolivre.dto.request.UsuarioRequestDTO;
import com.example.acessolivre.dto.response.UsuarioResponseDTO;
import com.example.acessolivre.model.Usuario;

public class UsuarioMapper {

    /**
     * Converte UsuarioRequestDTO para entidade Usuario
     * @param dto DTO de requisição
     * @return Entidade Usuario
     */
    public static Usuario toEntity(UsuarioRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .cpf(dto.getCpf())
                .role(dto.getRole())
                .imagemPerfil(dto.getImagemPerfil())
                .build();
    }

    /**
     * Converte entidade Usuario para UsuarioResponseDTO
     * @param entity Entidade Usuario
     * @return DTO de resposta
     */
    public static UsuarioResponseDTO toResponse(Usuario entity) {
        if (entity == null) {
            return null;
        }
        
        return new UsuarioResponseDTO(
                entity.getIdUsuario(),
                entity.getNome(),
                entity.getEmail(),
                entity.getCpf(),
                entity.getRole(),
                entity.getDataCadastro(),
                entity.getImagemPerfil()
        );
    }

    /**
     * Atualiza uma entidade Usuario existente com dados do UsuarioRequestDTO
     * @param entity Entidade Usuario a ser atualizada
     * @param dto DTO com os novos dados
     * @return Entidade Usuario atualizada
     */
    public static Usuario updateEntity(Usuario entity, UsuarioRequestDTO dto) {
        if (entity == null || dto == null) {
            return entity;
        }
        
        entity.setNome(dto.getNome());
        entity.setEmail(dto.getEmail());
        entity.setCpf(dto.getCpf());
        entity.setRole(dto.getRole());
        entity.setImagemPerfil(dto.getImagemPerfil());
        
        return entity;
    }
}
