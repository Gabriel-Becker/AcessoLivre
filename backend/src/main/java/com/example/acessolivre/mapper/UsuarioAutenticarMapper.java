package com.example.acessolivre.mapper;

import com.example.acessolivre.dto.UsuarioAutenticarRequestDTO;
import com.example.acessolivre.dto.UsuarioAutenticarResponseDTO;
import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.model.UsuarioAutenticar;

public class UsuarioAutenticarMapper {

    /**
     * Converte UsuarioAutenticarRequestDTO para entidade UsuarioAutenticar
     * @param dto DTO de requisição
     * @return Entidade UsuarioAutenticar
     */
    public static UsuarioAutenticar toEntity(UsuarioAutenticarRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
        // Cria um objeto Usuario com apenas o ID para o relacionamento
        Usuario usuario = Usuario.builder()
                .idUsuario(dto.getUsuarioId())
                .build();
        
        return UsuarioAutenticar.builder()
                .usuario(usuario)
                .senhaHash(dto.getSenhaHash())
                .tokenJwt(dto.getTokenJwt())
                .dataExpiracao(dto.getDataExpiracao())
                .build();
    }

    /**
     * Converte entidade UsuarioAutenticar para UsuarioAutenticarResponseDTO
     * @param entity Entidade UsuarioAutenticar
     * @return DTO de resposta
     */
    public static UsuarioAutenticarResponseDTO toResponse(UsuarioAutenticar entity) {
        if (entity == null) {
            return null;
        }
        
        return UsuarioAutenticarResponseDTO.builder()
                .idUsuarioAutenticar(entity.getIdUsuarioAutenticar())
                .usuarioId(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .tokenJwt(entity.getTokenJwt())
                .dataExpiracao(entity.getDataExpiracao())
                .build();
    }
}
