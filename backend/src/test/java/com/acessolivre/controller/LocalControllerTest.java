package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.BuscaFiltrosRequestDTO;
import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.Role;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.LocalService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class LocalControllerTest {

    @Mock
    private LocalService localService;

    @InjectMocks
    private LocalController localController;

    @Test
    void listarTodos_DeveAplicarPadroesDePaginacaoOrdenacaoEMapearResposta() {
        Local local = criarLocal(1L, "Biblioteca", StatusLocal.ATIVO);
        Page<Local> pagina = new PageImpl<>(List.of(local));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        when(localService.listarLocaisRaizComImagens(any(Pageable.class))).thenReturn(pagina);

        ResponseEntity<Page<LocalResponseDTO>> response = localController.listarTodos(0, -1, "DROP TABLE", "xyz");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());

        verify(localService).listarLocaisRaizComImagens(pageableCaptor.capture());
        Pageable pageableUsado = pageableCaptor.getValue();
        assertEquals(20, pageableUsado.getPageSize());
        assertEquals("dataCriacao", pageableUsado.getSort().stream().findFirst().orElseThrow().getProperty());
    }

    @Test
    void listarTodosLocais_DeveRespeitarTamanhoMaximo() {
        when(localService.listarTodosComImagens(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(criarLocal(2L, "Museu", StatusLocal.ATIVO))));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        ResponseEntity<Page<LocalResponseDTO>> response = localController.listarTodosLocais(0, 999, "nome", "asc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(localService).listarTodosComImagens(pageableCaptor.capture());
        assertEquals(100, pageableCaptor.getValue().getPageSize());
    }

    @Test
    void buscarPorId_DeveRetornarOkQuandoEncontrado() {
        when(localService.buscarPorIdComImagens(10L)).thenReturn(Optional.of(criarLocal(10L, "Teatro", StatusLocal.ATIVO)));

        ResponseEntity<LocalResponseDTO> response = localController.buscarPorId(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(10L, response.getBody().getIdLocal());
    }

    @Test
    void buscarPorId_DeveRetornarNotFoundQuandoNaoEncontrado() {
        when(localService.buscarPorIdComImagens(99L)).thenReturn(Optional.empty());

        ResponseEntity<LocalResponseDTO> response = localController.buscarPorId(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void buscarPorUsuario_DeveRetornarForbiddenQuandoNaoAutenticado() {
        when(localService.obterIdUsuarioAutenticadoPublic()).thenReturn(null);

        ResponseEntity<List<LocalResponseDTO>> response = localController.buscarPorUsuario(5L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void buscarPorUsuario_DeveRetornarForbiddenQuandoNaoForAdminENaoForDono() {
        when(localService.obterIdUsuarioAutenticadoPublic()).thenReturn(9L);
        when(localService.isUsuarioAdminAutenticadoPublic()).thenReturn(false);

        ResponseEntity<List<LocalResponseDTO>> response = localController.buscarPorUsuario(5L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void buscarPorUsuario_DeveFiltrarLocaisInativos() {
        when(localService.obterIdUsuarioAutenticadoPublic()).thenReturn(5L);
        when(localService.isUsuarioAdminAutenticadoPublic()).thenReturn(false);
        when(localService.buscarPorUsuario(5L)).thenReturn(List.of(
            criarLocal(1L, "Ativo", StatusLocal.ATIVO),
            criarLocal(2L, "Inativo", StatusLocal.INATIVO)));

        ResponseEntity<List<LocalResponseDTO>> response = localController.buscarPorUsuario(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Ativo", response.getBody().get(0).getNome());
    }

    @Test
    void buscarPorQualquerTipoAcessibilidadePaginado_DeveRetornarPaginaVaziaQuandoTiposVazios() {
        ResponseEntity<Page<LocalResponseDTO>> response = localController.buscarPorQualquerTipoAcessibilidadePaginado(Set.of(), 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(localService, never()).buscarPorQualquerTipoAcessibilidadePaginado(any(), any());
    }

    @Test
    void buscarPorTodosTiposAcessibilidade_DeveRetornarListaVaziaQuandoTiposNulos() {
        ResponseEntity<List<LocalResponseDTO>> response = localController.buscarPorTodosTiposAcessibilidade(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(localService, never()).buscarPorTodosTiposAcessibilidade(any());
    }

    @Test
    void atualizarTiposAcessibilidade_DeveRetornarBadRequestQuandoTiposVazios() {
        ResponseEntity<LocalResponseDTO> response = localController.atualizarTiposAcessibilidade(3L, Set.of());

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void atualizarTiposAcessibilidade_DeveRetornarOkQuandoSucesso() {
        Local local = criarLocal(3L, "Praça", StatusLocal.ATIVO);
        when(localService.atualizarTiposAcessibilidade(3L, Set.of(TipoAcessibilidade.RAMPA))).thenReturn(local);

        ResponseEntity<LocalResponseDTO> response = localController.atualizarTiposAcessibilidade(3L, Set.of(TipoAcessibilidade.RAMPA));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(3L, response.getBody().getIdLocal());
    }

    @Test
    void listarSubLocais_DeveRetornarOkComPaginaMapeada() {
        when(localService.listarSubLocais(10L, PageRequest.of(0, 20)))
            .thenReturn(new PageImpl<>(List.of(criarLocal(11L, "Sub", StatusLocal.ATIVO))));

        ResponseEntity<Page<LocalResponseDTO>> response = localController.listarSubLocais(10L, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
    }

    @Test
    void salvar_DeveRetornarBadRequestQuandoTiposNaoInformados() {
        LocalRequestDTO request = criarRequestLocal("novo local", null);

        ResponseEntity<LocalResponseDTO> response = localController.salvar(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(localService, never()).salvar(any());
    }

    @Test
    void salvar_DeveCapitalizarNomeERetornarCreated() {
        LocalRequestDTO request = criarRequestLocal("novo local", Set.of(TipoAcessibilidade.RAMPA));
        Local salvo = criarLocal(50L, "Novo Local", StatusLocal.EM_ANALISE);
        ArgumentCaptor<LocalRequestDTO> dtoCaptor = ArgumentCaptor.forClass(LocalRequestDTO.class);

        when(localService.salvar(any(LocalRequestDTO.class))).thenReturn(salvo);

        ResponseEntity<LocalResponseDTO> response = localController.salvar(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(localService).salvar(dtoCaptor.capture());
        assertEquals("Novo Local", dtoCaptor.getValue().getNome());
    }

    @Test
    void atualizar_DeveRetornarBadRequestQuandoTiposNaoInformados() {
        LocalRequestDTO request = criarRequestLocal("nome", null);

        ResponseEntity<LocalResponseDTO> response = localController.atualizar(8L, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void atualizar_DeveRetornarNotFoundQuandoLocalNaoExiste() {
        LocalRequestDTO request = criarRequestLocal("local atualizado", Set.of(TipoAcessibilidade.ELEVADOR));
        when(localService.atualizar(8L, request)).thenReturn(Optional.empty());

        ResponseEntity<LocalResponseDTO> response = localController.atualizar(8L, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void atualizar_DeveRetornarOkQuandoSucesso() {
        LocalRequestDTO request = criarRequestLocal("local atualizado", Set.of(TipoAcessibilidade.ELEVADOR));
        Local atualizado = criarLocal(8L, "Local atualizado", StatusLocal.ATIVO);
        when(localService.atualizar(8L, request)).thenReturn(Optional.of(atualizado));

        ResponseEntity<LocalResponseDTO> response = localController.atualizar(8L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(8L, response.getBody().getIdLocal());
    }

    @Test
    void deletar_DeveRetornarNoContent() {
        ResponseEntity<Void> response = localController.deletar(3L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(localService).deletar(3L);
    }

    @Test
    void buscarComFiltros_DeveRetornarOk() {
        BuscaFiltrosRequestDTO filtros = BuscaFiltrosRequestDTO.builder()
            .searchText("praça")
            .categorias(Set.of(Categoria.PUBLICO))
            .build();

        when(localService.buscarComFiltros(any(BuscaFiltrosRequestDTO.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(criarLocal(70L, "Praça Central", StatusLocal.ATIVO))));

        ResponseEntity<Page<LocalResponseDTO>> response = localController.buscarComFiltros(filtros, 0, 10, "avaliacaoMedia", "desc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
    }

    private LocalRequestDTO criarRequestLocal(String nome, Set<TipoAcessibilidade> tipos) {
        return LocalRequestDTO.builder()
            .nome(nome)
            .descricao("Descricao do local")
            .categoria(Categoria.PUBLICO)
            .idUsuario(1L)
            .tiposAcessibilidade(tipos)
            .build();
    }

    private Local criarLocal(Long id, String nome, StatusLocal status) {
        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .nome("Usuário Teste")
            .email("usuario@teste.com")
            .role(Role.ROLE_USER)
            .ativo(true)
            .build();

        Imagem imagem = Imagem.builder()
            .idImagem(id + 100)
            .idLocal(id)
            .caminhoRelativo("locais/imagem-" + id + ".jpg")
            .nomeOriginal("imagem.jpg")
            .ordem(1)
            .build();

        Local local = Local.builder()
            .idLocal(id)
            .nome(nome)
            .descricao("Descrição")
            .categoria(Categoria.PUBLICO)
            .status(status)
            .avaliacaoMedia(4.5)
            .usuario(usuario)
            .tiposAcessibilidade(Set.of(TipoAcessibilidade.RAMPA))
            .imagens(List.of(imagem))
            .subLocais(List.of())
            .build();

        return local;
    }
}
