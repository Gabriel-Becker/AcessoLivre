package com.acessolivre.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.dto.response.AvaliacaoResponseDTO;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;

class AvaliacaoMapperTest {

    @Test
    void toResponse_DeveRetornarNull_QuandoAvaliacaoForNull() {
        assertNull(AvaliacaoMapper.toResponse(null));
    }

    @Test
    void toResponse_DeveMapearTodosCampos_QuandoUsuarioELocalExistirem() {
        LocalDateTime data = LocalDateTime.of(2026, 6, 11, 10, 0);

        Usuario usuario = Usuario.builder()
            .idUsuario(7L)
            .nome("Gabriel")
            .email("gabriel@acessolivre.com")
            .build();

        Local local = Local.builder()
            .idLocal(15L)
            .nome("Biblioteca Central")
            .build();

        Avaliacao avaliacao = Avaliacao.builder()
            .idAvaliacao(100L)
            .notaAcessibilidadeVisual(4)
            .notaAcessibilidadeMotora(5)
            .notaAcessibilidadeAuditiva(3)
            .notaGeral(4.0)
            .comentario("Local bem acessivel")
            .moderado(true)
            .dataAvaliacao(data)
            .usuario(usuario)
            .local(local)
            .build();

        AvaliacaoResponseDTO response = AvaliacaoMapper.toResponse(avaliacao);

        assertNotNull(response);
        assertEquals(100L, response.getIdAvaliacao());
        assertEquals(4, response.getNotaAcessibilidadeVisual());
        assertEquals(5, response.getNotaAcessibilidadeMotora());
        assertEquals(3, response.getNotaAcessibilidadeAuditiva());
        assertEquals(4.0, response.getNotaGeral());
        assertEquals("Local bem acessivel", response.getComentario());
        assertEquals(true, response.getModerado());
        assertEquals(data, response.getDataAvaliacao());

        assertNotNull(response.getUsuario());
        assertEquals(7L, response.getUsuario().getIdUsuario());
        assertEquals("Gabriel", response.getUsuario().getNome());
        assertEquals("gabriel@acessolivre.com", response.getUsuario().getEmail());

        assertEquals(15L, response.getIdLocal());
        assertEquals("Biblioteca Central", response.getNomeLocal());
    }

    @Test
    void toResponse_NaoDeveMapearUsuarioENemLocal_QuandoAusentes() {
        Avaliacao avaliacao = Avaliacao.builder()
            .idAvaliacao(101L)
            .notaAcessibilidadeVisual(1)
            .notaAcessibilidadeMotora(2)
            .notaAcessibilidadeAuditiva(3)
            .notaGeral(2.0)
            .comentario("Sem detalhes")
            .moderado(false)
            .usuario(null)
            .local(null)
            .build();

        AvaliacaoResponseDTO response = AvaliacaoMapper.toResponse(avaliacao);

        assertNotNull(response);
        assertNull(response.getUsuario());
        assertNull(response.getIdLocal());
        assertNull(response.getNomeLocal());
    }

    @Test
    void toEntity_DeveRetornarNull_QuandoDtoForNull() {
        assertNull(AvaliacaoMapper.toEntity(null, null, null, 3.0, true));
    }

    @Test
    void toEntity_DeveMapearCampos_ComModeradoInformado() {
        Usuario usuario = Usuario.builder().idUsuario(1L).build();
        Local local = Local.builder().idLocal(2L).build();

        AvaliacaoRequestDTO dto = AvaliacaoRequestDTO.builder()
            .notaAcessibilidadeVisual(5)
            .notaAcessibilidadeMotora(4)
            .notaAcessibilidadeAuditiva(3)
            .comentario("Excelente")
            .idUsuario(1L)
            .idLocal(2L)
            .build();

        Avaliacao entity = AvaliacaoMapper.toEntity(dto, usuario, local, 4.0, true);

        assertNotNull(entity);
        assertEquals(5, entity.getNotaAcessibilidadeVisual());
        assertEquals(4, entity.getNotaAcessibilidadeMotora());
        assertEquals(3, entity.getNotaAcessibilidadeAuditiva());
        assertEquals("Excelente", entity.getComentario());
        assertEquals(4.0, entity.getNotaGeral());
        assertEquals(true, entity.getModerado());
        assertEquals(usuario, entity.getUsuario());
        assertEquals(local, entity.getLocal());
    }

    @Test
    void toEntity_DeveAplicarModeradoFalse_QuandoModeradoForNull() {
        AvaliacaoRequestDTO dto = AvaliacaoRequestDTO.builder()
            .notaAcessibilidadeVisual(2)
            .notaAcessibilidadeMotora(2)
            .notaAcessibilidadeAuditiva(2)
            .comentario("Ok")
            .idUsuario(11L)
            .idLocal(22L)
            .build();

        Avaliacao entity = AvaliacaoMapper.toEntity(dto, null, null, 2.0, null);

        assertNotNull(entity);
        assertFalse(entity.getModerado());
    }
}