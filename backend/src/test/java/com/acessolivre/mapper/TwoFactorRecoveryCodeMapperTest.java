package com.acessolivre.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.acessolivre.dto.request.CodigoRecuperacaoDoisFatoresRequestDTO;
import com.acessolivre.dto.response.CodigoRecuperacaoDoisFatoresResponseDTO;
import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;

class TwoFactorRecoveryCodeMapperTest {

    @Test
    void toEntity_DeveRetornarNull_QuandoDtoForNull() {
        assertNull(CodigoRecuperacaoDoisFatoresMapper.toEntity(null, Usuario.builder().idUsuario(1L).build()));
    }

    @Test
    void toEntity_DeveMapearCamposEAplicarTrimNoCodigo() {
        LocalDateTime criacao = LocalDateTime.of(2026, 6, 11, 8, 0);
        LocalDateTime expiracao = LocalDateTime.of(2026, 6, 18, 8, 0);

        CodigoRecuperacaoDoisFatoresRequestDTO dto = CodigoRecuperacaoDoisFatoresRequestDTO.builder()
            .codigo("  CODIGO-123  ")
            .dataCriacao(criacao)
            .dataExpiracao(expiracao)
            .utilizado(false)
            .usuarioId(9L)
            .build();

        Usuario usuario = Usuario.builder().idUsuario(9L).build();

        CodigoRecuperacaoDoisFatores entity = CodigoRecuperacaoDoisFatoresMapper.toEntity(dto, usuario);

        assertNotNull(entity);
        assertEquals("CODIGO-123", entity.getCodigo());
        assertEquals(criacao, entity.getDataCriacao());
        assertEquals(expiracao, entity.getDataExpiracao());
        assertEquals(false, entity.getUtilizado());
        assertEquals(usuario, entity.getUsuario());
    }

    @Test
    void toResponse_DeveRetornarNull_QuandoEntidadeForNull() {
        assertNull(CodigoRecuperacaoDoisFatoresMapper.toResponse(null));
    }

    @Test
    void toResponse_DeveMapearCampos_ComUsuario() {
        Usuario usuario = Usuario.builder().idUsuario(77L).build();

        CodigoRecuperacaoDoisFatores entity = CodigoRecuperacaoDoisFatores.builder()
            .id(5L)
            .codigo("XYZ-999")
            .dataCriacao(LocalDateTime.of(2026, 6, 10, 10, 0))
            .dataExpiracao(LocalDateTime.of(2026, 6, 12, 10, 0))
            .utilizado(true)
            .usuario(usuario)
            .build();

        CodigoRecuperacaoDoisFatoresResponseDTO response = CodigoRecuperacaoDoisFatoresMapper.toResponse(entity);

        assertNotNull(response);
        assertEquals(5L, response.getId());
        assertEquals("XYZ-999", response.getCodigo());
        assertEquals(true, response.getUtilizado());
        assertEquals(77L, response.getUsuarioId());
    }

    @Test
    void toResponse_DeveMapearUsuarioIdNull_QuandoUsuarioAusente() {
        CodigoRecuperacaoDoisFatores entity = CodigoRecuperacaoDoisFatores.builder()
            .id(6L)
            .codigo("SEM-USUARIO")
            .dataCriacao(LocalDateTime.of(2026, 6, 10, 11, 0))
            .dataExpiracao(LocalDateTime.of(2026, 6, 12, 11, 0))
            .utilizado(false)
            .usuario(null)
            .build();

        CodigoRecuperacaoDoisFatoresResponseDTO response = CodigoRecuperacaoDoisFatoresMapper.toResponse(entity);

        assertNotNull(response);
        assertNull(response.getUsuarioId());
    }

    @Test
    void fromEntityList_DeveRetornarNull_QuandoListaForNull() {
        assertNull(CodigoRecuperacaoDoisFatoresMapper.fromEntityList(null));
    }

    @Test
    void fromEntityList_DeveConverterLista() {
        CodigoRecuperacaoDoisFatores item1 = CodigoRecuperacaoDoisFatores.builder()
            .id(1L)
            .codigo("A")
            .dataCriacao(LocalDateTime.now())
            .dataExpiracao(LocalDateTime.now().plusDays(1))
            .utilizado(false)
            .build();

        CodigoRecuperacaoDoisFatores item2 = CodigoRecuperacaoDoisFatores.builder()
            .id(2L)
            .codigo("B")
            .dataCriacao(LocalDateTime.now())
            .dataExpiracao(LocalDateTime.now().plusDays(1))
            .utilizado(true)
            .build();

        List<CodigoRecuperacaoDoisFatoresResponseDTO> response =
            CodigoRecuperacaoDoisFatoresMapper.fromEntityList(List.of(item1, item2));

        assertNotNull(response);
        assertEquals(2, response.size());
        assertEquals(1L, response.get(0).getId());
        assertEquals(2L, response.get(1).getId());
    }

    @Test
    void updateEntity_DeveRetornarMesmaEntidade_QuandoDtoForNull() {
        CodigoRecuperacaoDoisFatores entity = CodigoRecuperacaoDoisFatores.builder().id(30L).codigo("ORIGINAL").build();

        CodigoRecuperacaoDoisFatores atualizado = CodigoRecuperacaoDoisFatoresMapper.updateEntity(entity, null, null);

        assertSame(entity, atualizado);
        assertEquals("ORIGINAL", atualizado.getCodigo());
    }

    @Test
    void updateEntity_DeveRetornarNull_QuandoEntidadeForNull() {
        CodigoRecuperacaoDoisFatoresRequestDTO dto = CodigoRecuperacaoDoisFatoresRequestDTO.builder()
            .codigo("NOVO")
            .dataCriacao(LocalDateTime.now())
            .dataExpiracao(LocalDateTime.now().plusDays(1))
            .utilizado(false)
            .usuarioId(1L)
            .build();

        assertNull(CodigoRecuperacaoDoisFatoresMapper.updateEntity(null, dto, null));
    }

    @Test
    void updateEntity_DeveAtualizarCamposEAplicarTrim() {
        LocalDateTime criacao = LocalDateTime.of(2026, 6, 11, 9, 30);
        LocalDateTime expiracao = LocalDateTime.of(2026, 6, 20, 9, 30);

        CodigoRecuperacaoDoisFatores entity = CodigoRecuperacaoDoisFatores.builder()
            .id(40L)
            .codigo("ANTIGO")
            .build();

        CodigoRecuperacaoDoisFatoresRequestDTO dto = CodigoRecuperacaoDoisFatoresRequestDTO.builder()
            .codigo("  NOVO-CODIGO  ")
            .dataCriacao(criacao)
            .dataExpiracao(expiracao)
            .utilizado(true)
            .usuarioId(55L)
            .build();

        Usuario usuario = Usuario.builder().idUsuario(55L).build();

        CodigoRecuperacaoDoisFatores atualizado = CodigoRecuperacaoDoisFatoresMapper.updateEntity(entity, dto, usuario);

        assertSame(entity, atualizado);
        assertEquals("NOVO-CODIGO", atualizado.getCodigo());
        assertEquals(criacao, atualizado.getDataCriacao());
        assertEquals(expiracao, atualizado.getDataExpiracao());
        assertEquals(true, atualizado.getUtilizado());
        assertEquals(usuario, atualizado.getUsuario());
    }
}