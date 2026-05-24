package com.acessolivre.mapper;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.dto.response.AvaliacaoResponseDTO;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;

public class AvaliacaoMapper {

    private AvaliacaoMapper() {
        // Construtor privado para evitar instanciação
    }

    public static AvaliacaoResponseDTO toResponse(Avaliacao avaliacao) {
        if (avaliacao == null) {
            return null;
        }

        AvaliacaoResponseDTO.AvaliacaoResponseDTOBuilder builder = AvaliacaoResponseDTO.builder()
                .idAvaliacao(avaliacao.getIdAvaliacao())
                .notaAcessibilidadeVisual(avaliacao.getNotaAcessibilidadeVisual())
                .notaAcessibilidadeMotora(avaliacao.getNotaAcessibilidadeMotora())
                .notaAcessibilidadeAuditiva(avaliacao.getNotaAcessibilidadeAuditiva())
                .notaGeral(avaliacao.getNotaGeral())
                .comentario(avaliacao.getComentario())
                .moderado(avaliacao.getModerado())
                .dataAvaliacao(avaliacao.getDataAvaliacao());

        // Adicionar dados do usuário
        if (avaliacao.getUsuario() != null) {
            Usuario usuario = avaliacao.getUsuario();
            AvaliacaoResponseDTO.UsuarioResumoDTO usuarioDTO = AvaliacaoResponseDTO.UsuarioResumoDTO.builder()
                    .idUsuario(usuario.getIdUsuario())
                    .nome(usuario.getNome())
                    .email(usuario.getEmail())
                    .build();
            builder.usuario(usuarioDTO);
        }

        // Adicionar dados do local
        if (avaliacao.getLocal() != null) {
            Local local = avaliacao.getLocal();
            builder.idLocal(local.getIdLocal())
                   .nomeLocal(local.getNome());
        }

        return builder.build();
    }

    public static Avaliacao toEntity(AvaliacaoRequestDTO dto, Usuario usuario, Local local, Double notaGeral, Boolean moderado) {
        if (dto == null) {
            return null;
        }

        return Avaliacao.builder()
                .notaAcessibilidadeVisual(dto.getNotaAcessibilidadeVisual())
                .notaAcessibilidadeMotora(dto.getNotaAcessibilidadeMotora())
                .notaAcessibilidadeAuditiva(dto.getNotaAcessibilidadeAuditiva())
                .notaGeral(notaGeral)
                .comentario(dto.getComentario())
                .moderado(moderado != null ? moderado : false)
                .usuario(usuario)
                .local(local)
                .build();
    }
}