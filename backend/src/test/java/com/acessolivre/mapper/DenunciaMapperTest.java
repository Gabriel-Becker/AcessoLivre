package com.acessolivre.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.model.Denuncia;
import com.acessolivre.model.Usuario;

@SuppressWarnings("null")
class DenunciaMapperTest {

    private final DenunciaMapper denunciaMapper = new DenunciaMapper();

    @Test
    void toEntity_DeveMapearCamposQuandoUsuarioExiste() {
        DenunciaRequestDTO request = DenunciaRequestDTO.builder()
            .tipo(TipoDenuncia.LOCAL)
            .targetId(12L)
            .targetName("Parque")
            .motivo("SPAM")
            .motivoLabel("Spam")
            .descricao("Descrição")
            .build();

        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .nome("Gabriel")
            .email("gabriel@email.com")
            .build();

        Denuncia entity = denunciaMapper.toEntity(request, usuario);

        assertEquals(TipoDenuncia.LOCAL, entity.getTipo());
        assertEquals(12L, entity.getTargetId());
        assertEquals("Parque", entity.getTargetName());
        assertEquals("SPAM", entity.getMotivo());
        assertEquals("Spam", entity.getMotivoLabel());
        assertEquals("Descrição", entity.getDescricao());
        assertEquals(usuario, entity.getUsuario());
        assertEquals("Gabriel", entity.getUsuarioNome());
    }

    @Test
    void toEntity_DeveSetarUsuarioNomeNuloQuandoUsuarioNulo() {
        DenunciaRequestDTO request = DenunciaRequestDTO.builder()
            .tipo(TipoDenuncia.AVALIACAO)
            .targetId(20L)
            .motivo("ABUSO")
            .build();

        Denuncia entity = denunciaMapper.toEntity(request, null);

        assertNull(entity.getUsuario());
        assertNull(entity.getUsuarioNome());
    }

    @Test
    void toResponseDTO_DeveMapearComUsuarioResumoQuandoUsuarioExiste() {
        LocalDateTime agora = LocalDateTime.now();
        Usuario usuario = Usuario.builder()
            .idUsuario(7L)
            .nome("Maria")
            .email("maria@email.com")
            .build();

        Denuncia entity = Denuncia.builder()
            .id(99L)
            .tipo(TipoDenuncia.USUARIO)
            .targetId(55L)
            .targetName("Usuário X")
            .motivo("FAKE")
            .motivoLabel("Fake")
            .descricao("Conta fake")
            .status(StatusDenuncia.REVIEWED)
            .usuario(usuario)
            .usuarioNome("Maria")
            .dataCriacao(agora)
            .dataAtualizacao(agora)
            .dataResolucao(agora)
            .resolvidoPor("mod@email.com")
            .observacoes("ok")
            .build();

        DenunciaResponseDTO dto = denunciaMapper.toResponseDTO(entity);

        assertEquals(99L, dto.getId());
        assertEquals(TipoDenuncia.USUARIO, dto.getTipo());
        assertEquals(StatusDenuncia.REVIEWED, dto.getStatus());
        assertNotNull(dto.getUsuario());
        assertEquals(7L, dto.getUsuario().getId());
        assertEquals("Maria", dto.getUsuario().getNome());
        assertEquals("maria@email.com", dto.getUsuario().getEmail());
        assertEquals("mod@email.com", dto.getResolvidoPor());
        assertEquals("ok", dto.getObservacoes());
    }

    @Test
    void toResponseDTO_DeveMapearSemUsuarioResumoQuandoUsuarioNulo() {
        Denuncia entity = Denuncia.builder()
            .id(100L)
            .tipo(TipoDenuncia.LOCAL)
            .targetId(44L)
            .motivo("SPAM")
            .status(StatusDenuncia.PENDING)
            .usuario(null)
            .build();

        DenunciaResponseDTO dto = denunciaMapper.toResponseDTO(entity);

        assertEquals(100L, dto.getId());
        assertNull(dto.getUsuario());
    }
}
