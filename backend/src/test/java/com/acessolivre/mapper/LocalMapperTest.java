package com.acessolivre.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.dto.response.LocalResumoResponseDTO;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;

@SuppressWarnings("null")
class LocalMapperTest {

    @Test
    void toEntity_DeveAplicarDefaultDeStatusEAvaliacao() {
        LocalRequestDTO dto = LocalRequestDTO.builder()
            .nome("Biblioteca")
            .descricao("Descrição")
            .categoria(Categoria.PUBLICO)
            .idUsuario(1L)
            .tiposAcessibilidade(Set.of(TipoAcessibilidade.RAMPA))
            .build();

        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Fulano").build();

        Local entity = LocalMapper.toEntity(dto, usuario, null);

        assertNotNull(entity);
        assertEquals("Biblioteca", entity.getNome());
        assertEquals(StatusLocal.EM_ANALISE, entity.getStatus());
        assertEquals(0.0, entity.getAvaliacaoMedia());
        assertTrue(entity.getTiposAcessibilidade().contains(TipoAcessibilidade.RAMPA));
    }

    @Test
    void toEntity_DeveUsarStatusInformado() {
        LocalRequestDTO dto = LocalRequestDTO.builder()
            .nome("Museu")
            .descricao("Descrição")
            .categoria(Categoria.PUBLICO)
            .idUsuario(1L)
            .status(StatusLocal.ATIVO)
            .tiposAcessibilidade(Set.of(TipoAcessibilidade.ELEVADOR))
            .build();

        Local entity = LocalMapper.toEntity(dto, Usuario.builder().idUsuario(1L).build(), null);

        assertEquals(StatusLocal.ATIVO, entity.getStatus());
    }

    @Test
    void toResponse_DeveRetornarNullQuandoEntidadeNula() {
        assertNull(LocalMapper.toResponse(null));
    }

    @Test
    void toResponse_DeveMapearCamposBasicosEHierarquia() {
        Local principal = Local.builder().idLocal(100L).nome("Principal").build();
        Local filho = Local.builder().idLocal(200L).nome("Filho").status(StatusLocal.ATIVO).build();

        Local local = criarLocalCompleto(1L, "Local A");
        local.setLocalPrincipal(principal);
        local.setSubLocais(List.of(filho));

        LocalResponseDTO response = LocalMapper.toResponse(local);

        assertNotNull(response);
        assertEquals(1L, response.getIdLocal());
        assertEquals("Local A", response.getNome());
        assertEquals(100L, response.getIdLocalPrincipal());
        assertEquals("Principal", response.getNomeLocalPrincipal());
        assertEquals(1, response.getSubLocais().size());
        assertEquals(1, response.getTotalImagens());
    }

    @Test
    void toResumoResponse_DeveRetornarNullQuandoEntidadeNula() {
        assertNull(LocalMapper.toResumoResponse(null));
    }

    @Test
    void toResumoResponse_DeveMapearCamposResumo() {
        Local local = criarLocalCompleto(2L, "Local B");

        LocalResumoResponseDTO resumo = LocalMapper.toResumoResponse(local);

        assertNotNull(resumo);
        assertEquals(2L, resumo.getIdLocal());
        assertEquals("Local B", resumo.getNome());
        assertEquals(StatusLocal.ATIVO, resumo.getStatus());
    }

    @Test
    void toResponseList_DeveRetornarListaVaziaQuandoEntradaNula() {
        List<LocalResponseDTO> lista = LocalMapper.toResponseList(null);
        assertNotNull(lista);
        assertTrue(lista.isEmpty());
    }

    @Test
    void toResponseList_DeveConverterLista() {
        List<LocalResponseDTO> lista = LocalMapper.toResponseList(List.of(criarLocalCompleto(3L, "Local C")));

        assertEquals(1, lista.size());
        assertEquals(3L, lista.get(0).getIdLocal());
    }

    @Test
    void updateEntity_DeveAtualizarCamposEManterStatusQuandoDtoSemStatus() {
        Local entity = criarLocalCompleto(4L, "Antigo");
        entity.setStatus(StatusLocal.EM_ANALISE);

        LocalRequestDTO dto = LocalRequestDTO.builder()
            .nome("Novo Nome")
            .descricao("Nova descrição")
            .categoria(Categoria.SAUDE)
            .idUsuario(1L)
            .tiposAcessibilidade(Set.of(TipoAcessibilidade.ELEVADOR))
            .build();

        Usuario usuario = Usuario.builder().idUsuario(9L).nome("Novo Usuário").build();

        LocalMapper.updateEntity(entity, dto, usuario, null);

        assertEquals("Novo Nome", entity.getNome());
        assertEquals(Categoria.SAUDE, entity.getCategoria());
        assertEquals(StatusLocal.EM_ANALISE, entity.getStatus());
        assertTrue(entity.getTiposAcessibilidade().contains(TipoAcessibilidade.ELEVADOR));
        assertEquals(9L, entity.getUsuario().getIdUsuario());
    }

    private Local criarLocalCompleto(Long id, String nome) {
        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .nome("Usuário")
            .build();

        Imagem imagem = Imagem.builder()
            .idImagem(10L)
            .idLocal(id)
            .caminhoRelativo("locais/foto.jpg")
            .nomeOriginal("foto.jpg")
            .ordem(1)
            .build();

        return Local.builder()
            .idLocal(id)
            .nome(nome)
            .descricao("Descrição")
            .categoria(Categoria.PUBLICO)
            .status(StatusLocal.ATIVO)
            .avaliacaoMedia(4.8)
            .usuario(usuario)
            .tiposAcessibilidade(new HashSet<>(Set.of(TipoAcessibilidade.RAMPA)))
            .imagens(new ArrayList<>(List.of(imagem)))
            .subLocais(new ArrayList<>())
            .build();
    }
}
