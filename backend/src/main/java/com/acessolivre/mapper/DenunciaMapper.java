package com.acessolivre.mapper;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.dto.response.UsuarioResumoDTO;
import com.acessolivre.model.Denuncia;
import com.acessolivre.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class DenunciaMapper {

    public Denuncia toEntity(DenunciaRequestDTO dto, Usuario usuario) {
        return Denuncia.builder()
                .tipo(dto.getTipo())
                .targetId(dto.getTargetId())
                .targetName(dto.getTargetName())
                .motivo(dto.getMotivo())
                .motivoLabel(dto.getMotivoLabel())
                .descricao(dto.getDescricao())
                .usuario(usuario)
                .usuarioNome(usuario != null ? usuario.getNome() : null)
                .build();
    }

    public DenunciaResponseDTO toResponseDTO(Denuncia entity) {
        UsuarioResumoDTO usuarioResumo = null;
        if (entity.getUsuario() != null) {
            usuarioResumo = UsuarioResumoDTO.builder()
                    .id(entity.getUsuario().getId())
                    .nome(entity.getUsuario().getNome())
                    .email(entity.getUsuario().getEmail())
                    .build();
        }

        return DenunciaResponseDTO.builder()
                .id(entity.getId())
                .tipo(entity.getTipo())
                .targetId(entity.getTargetId())
                .targetName(entity.getTargetName())
                .motivo(entity.getMotivo())
                .motivoLabel(entity.getMotivoLabel())
                .descricao(entity.getDescricao())
                .status(entity.getStatus())
                .usuario(usuarioResumo)
                .usuarioNome(entity.getUsuarioNome())
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .dataResolucao(entity.getDataResolucao())
                .resolvidoPor(entity.getResolvidoPor())
                .observacoes(entity.getObservacoes())
                .build();
    }
}