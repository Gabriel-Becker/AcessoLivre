package com.acessolivre.mapper;

import com.acessolivre.dto.request.UsuarioRequestDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
    return Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
        .role(parseRole(dto.getRole()))
                .imagemPerfil(dto.getImagemPerfil())
                .build();
    }

    public static UsuarioResponseDTO toResponse(Usuario entity) {
        if (entity == null) {
            return null;
        }
        
    return UsuarioResponseDTO.builder()
                .idUsuario(entity.getIdUsuario())
                .nome(entity.getNome())
                .email(entity.getEmail())
        .role(entity.getRole() != null ? entity.getRole().name() : null)
                .dataCadastro(entity.getDataCadastro())
                .imagemPerfil(entity.getImagemPerfil())
                .build();
    }

    public static Usuario updateEntity(Usuario entity, UsuarioRequestDTO dto) {
        if (entity == null || dto == null) {
            return entity;
        }
        
        entity.setNome(dto.getNome());
        entity.setEmail(dto.getEmail());
        entity.setRole(parseRole(dto.getRole()));
        entity.setImagemPerfil(dto.getImagemPerfil());
        
        return entity;
    }

    private static Role parseRole(String roleStr) {
        if (roleStr == null || roleStr.isBlank()) {
            return Role.ROLE_USER;
        }
        String normalized = roleStr.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        return Role.valueOf(normalized);
    }
}
