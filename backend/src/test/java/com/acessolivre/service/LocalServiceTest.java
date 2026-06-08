package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.acessolivre.dto.request.BuscaFiltrosRequestDTO;
import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.EnderecoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class LocalServiceTest {

    @Mock
    private LocalRepository localRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EnderecoRepository enderecoRepository;

    @Mock
    private EnderecoService enderecoService;

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private ImagemService imagemService;

    @InjectMocks
    private LocalService localService;

    @Test
    void listarTodos_DeveFiltrarLocaisInativos() {
        Pageable pageable = PageRequest.of(0, 10);
        Local ativo = criarLocal(1L, StatusLocal.ATIVO);
        Local inativo = criarLocal(2L, StatusLocal.INATIVO);

        when(localRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(ativo, inativo), pageable, 2));

        Page<Local> resultado = localService.listarTodos(pageable);

        assertEquals(1, resultado.getContent().size());
        assertEquals(1L, resultado.getContent().get(0).getIdLocal());
    }

    @Test
    void listarLocaisRaiz_DeveFiltrarLocaisInativos() {
        Pageable pageable = PageRequest.of(0, 10);
        when(localRepository.findByLocalPrincipalIsNull(pageable))
            .thenReturn(new PageImpl<>(List.of(criarLocal(3L, StatusLocal.INATIVO), criarLocal(4L, StatusLocal.ATIVO)), pageable, 2));

        Page<Local> resultado = localService.listarLocaisRaiz(pageable);

        assertEquals(1, resultado.getContent().size());
        assertEquals(4L, resultado.getContent().get(0).getIdLocal());
    }

    @Test
    void listarSubLocais_DeveLancarQuandoLocalNaoExiste() {
        when(localRepository.existsById(5L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> localService.listarSubLocais(5L, PageRequest.of(0, 10)));

        assertTrue(ex.getMessage().contains("Local não encontrado"));
    }

    @Test
    void listarSubLocais_DeveRetornarSubLocaisQuandoLocalExiste() {
        Pageable pageable = PageRequest.of(0, 10);
        when(localRepository.existsById(5L)).thenReturn(true);
        when(localRepository.findByLocalPrincipalIdLocal(5L, pageable))
            .thenReturn(new PageImpl<>(List.of(criarLocal(6L, StatusLocal.ATIVO), criarLocal(7L, StatusLocal.INATIVO)), pageable, 2));

        Page<Local> resultado = localService.listarSubLocais(5L, pageable);

        assertEquals(1, resultado.getContent().size());
        assertEquals(6L, resultado.getContent().get(0).getIdLocal());
    }

    @Test
    void buscarPorId_DeveRetornarVazioQuandoLocalInativo() {
        when(localRepository.findById(8L)).thenReturn(Optional.of(criarLocal(8L, StatusLocal.INATIVO)));

        Optional<Local> resultado = localService.buscarPorId(8L);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void buscarPorQualquerTipoAcessibilidade_DeveRetornarListaVaziaQuandoTiposNulos() {
        List<Local> resultado = localService.buscarPorQualquerTipoAcessibilidade(null);

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    void buscarPorQualquerTipoAcessibilidadePaginado_DeveRetornarPaginaVaziaQuandoTiposVazios() {
        Pageable pageable = PageRequest.of(0, 10);

        Page<Local> resultado = localService.buscarPorQualquerTipoAcessibilidadePaginado(Set.of(), pageable);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void buscarPorTodosTiposAcessibilidade_DeveRetornarListaVaziaQuandoTiposVazios() {
        List<Local> resultado = localService.buscarPorTodosTiposAcessibilidade(Set.of());

        assertTrue(resultado.isEmpty());
    }

    @Test
    void buscarPorTodosTiposAcessibilidadePaginado_DeveRetornarPaginaVaziaQuandoTiposNulos() {
        Page<Local> resultado = localService.buscarPorTodosTiposAcessibilidadePaginado(null, PageRequest.of(0, 10));

        assertTrue(resultado.isEmpty());
    }

    @Test
    void contarTiposAcessibilidadePorLocal_DeveRetornarContagem() {
        when(localRepository.existsById(10L)).thenReturn(true);
        when(localRepository.countTiposAcessibilidadeByLocalId(10L)).thenReturn(3);

        Integer resultado = localService.contarTiposAcessibilidadePorLocal(10L);

        assertEquals(3, resultado);
    }

    @Test
    void buscarHierarquiaCompleta_DeveRetornarDoRaizAoFilho() {
        Local raiz = criarLocal(1L, StatusLocal.ATIVO);
        Local filho = criarLocal(2L, StatusLocal.ATIVO);
        filho.setLocalPrincipal(raiz);

        when(localRepository.existsById(2L)).thenReturn(true);
        when(localRepository.findById(2L)).thenReturn(Optional.of(filho));

        List<Local> resultado = localService.buscarHierarquiaCompleta(2L);

        assertEquals(2, resultado.size());
        assertEquals(1L, resultado.get(0).getIdLocal());
        assertEquals(2L, resultado.get(1).getIdLocal());
    }

    @Test
    void buscarDescendentes_DeveValidarExistenciaEDelegar() {
        when(localRepository.existsById(3L)).thenReturn(true);
        when(localRepository.buscarTodosDescendentes(3L)).thenReturn(List.of(criarLocal(31L, StatusLocal.ATIVO)));

        List<Local> resultado = localService.buscarDescendentes(3L);

        assertEquals(1, resultado.size());
    }

    @Test
    void buscarAncestrais_DeveValidarExistenciaEDelegar() {
        when(localRepository.existsById(9L)).thenReturn(true);
        when(localRepository.buscarTodosAncestrais(9L)).thenReturn(List.of(criarLocal(1L, StatusLocal.ATIVO)));

        List<Local> resultado = localService.buscarAncestrais(9L);

        assertEquals(1, resultado.size());
    }

    @Test
    void atualizarTiposAcessibilidade_DeveLancarQuandoSemTipos() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> localService.atualizarTiposAcessibilidade(2L, Set.of()));

        assertTrue(ex.getMessage().contains("Pelo menos um tipo"));
    }

    @Test
    void atualizarTiposAcessibilidade_DeveAtualizarQuandoSucesso() {
        Local local = criarLocal(2L, StatusLocal.ATIVO);
        local.setTiposAcessibilidade(new HashSet<>(Set.of(TipoAcessibilidade.RAMPA)));

        when(localRepository.findById(2L)).thenReturn(Optional.of(local));
        when(localRepository.save(any(Local.class))).thenAnswer(inv -> inv.getArgument(0));

        Local atualizado = localService.atualizarTiposAcessibilidade(2L, Set.of(TipoAcessibilidade.ELEVADOR));

        assertEquals(1, atualizado.getTiposAcessibilidade().size());
        assertTrue(atualizado.getTiposAcessibilidade().contains(TipoAcessibilidade.ELEVADOR));
    }

    @Test
    void atualizarStatus_DeveLancarQuandoLocalNaoEncontrado() {
        when(localRepository.findById(40L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
            () -> localService.atualizarStatus(40L, StatusLocal.ATIVO));
    }

    @Test
    void atualizarStatus_DeveSalvarNovoStatus() {
        Local local = criarLocal(41L, StatusLocal.EM_ANALISE);
        when(localRepository.findById(41L)).thenReturn(Optional.of(local));

        localService.atualizarStatus(41L, StatusLocal.ATIVO);

        assertEquals(StatusLocal.ATIVO, local.getStatus());
        verify(localRepository).save(local);
    }

    @Test
    void moverLocal_DeveLancarQuandoCriarCiclo() {
        Local filho = criarLocal(50L, StatusLocal.ATIVO);
        Local pai = criarLocal(51L, StatusLocal.ATIVO);
        pai.setLocalPrincipal(filho);

        when(localRepository.findById(50L)).thenReturn(Optional.of(filho));
        when(localRepository.findById(51L)).thenReturn(Optional.of(pai));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> localService.moverLocal(50L, 51L));

        assertTrue(ex.getMessage().contains("ciclo"));
    }

    @Test
    void recalcularMediaAvaliacoes_DeveUsarZeroQuandoMediaNula() {
        Local local = criarLocal(60L, StatusLocal.ATIVO);
        when(localRepository.findById(60L)).thenReturn(Optional.of(local));
        when(avaliacaoRepository.calcularMediaPorLocal(60L)).thenReturn(null);

        localService.recalcularMediaAvaliacoes(60L);

        assertEquals(0.0, local.getAvaliacaoMedia());
        verify(localRepository).save(local);
    }

    @Test
    void obterEstatisticasGerais_DeveRetornarTotais() {
        when(usuarioRepository.count()).thenReturn(12L);
        when(localRepository.count()).thenReturn(30L);
        when(avaliacaoRepository.count()).thenReturn(90L);

        Map<String, Object> resultado = localService.obterEstatisticasGerais();

        assertEquals(12L, resultado.get("totalUsuarios"));
        assertEquals(30L, resultado.get("totalLocais"));
        assertEquals(90L, resultado.get("totalAvaliacoes"));
    }

    @Test
    void obterEstatisticasHierarquia_DeveRetornarIndicadores() {
        Local raiz = criarLocal(1L, StatusLocal.ATIVO);
        Local filho = criarLocal(2L, StatusLocal.ATIVO);
        filho.setLocalPrincipal(raiz);

        when(localRepository.existsById(2L)).thenReturn(true);
        when(localRepository.findById(2L)).thenReturn(Optional.of(filho));
        when(localRepository.buscarTodosDescendentes(2L)).thenReturn(List.of(criarLocal(3L, StatusLocal.ATIVO)));
        when(localRepository.countSubLocais(2L)).thenReturn(1L);

        Map<String, Object> resultado = localService.obterEstatisticasHierarquia(2L);

        assertEquals(1, resultado.get("profundidade"));
        assertEquals(1, resultado.get("totalDescendentes"));
        assertEquals(1L, resultado.get("totalSubLocaisDiretos"));
    }

    @Test
    void buscarComFiltros_DeveBuscarTodosQuandoNaoHaFiltro() {
        BuscaFiltrosRequestDTO filtros = BuscaFiltrosRequestDTO.builder()
            .searchText("   ")
            .categorias(Set.of())
            .recursos(Set.of())
            .notaMinima(0.0)
            .build();

        Pageable pageable = PageRequest.of(0, 10);
        when(localRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(criarLocal(70L, StatusLocal.ATIVO))));

        Page<Local> resultado = localService.buscarComFiltros(filtros, pageable);

        assertEquals(1, resultado.getTotalElements());
        verify(localRepository).findAll(pageable);
    }

    @Test
    void buscarComFiltros_DeveUsarBuscaAvancadaQuandoHaFiltros() {
        BuscaFiltrosRequestDTO filtros = BuscaFiltrosRequestDTO.builder()
            .searchText("praça")
            .categorias(Set.of(Categoria.PUBLICO))
            .recursos(Set.of(TipoAcessibilidade.RAMPA))
            .notaMinima(4.0)
            .build();

        Pageable pageable = PageRequest.of(0, 10);
        when(localRepository.buscarComFiltrosAvancados(any(), any(), any(), anyDouble(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(criarLocal(71L, StatusLocal.ATIVO))));

        Page<Local> resultado = localService.buscarComFiltros(filtros, pageable);

        assertEquals(1, resultado.getTotalElements());
    }

    @Test
    void salvar_DeveLancarQuandoTiposNaoInformados() {
        LocalRequestDTO dto = LocalRequestDTO.builder()
            .nome("Local")
            .descricao("Descricao")
            .categoria(Categoria.PUBLICO)
            .idUsuario(1L)
            .tiposAcessibilidade(Set.of())
            .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> localService.salvar(dto));

        assertTrue(ex.getMessage().contains("Pelo menos um tipo"));
    }

    @Test
    void atualizar_DeveLancarQuandoTiposNaoInformados() {
        LocalRequestDTO dto = LocalRequestDTO.builder()
            .nome("Local")
            .descricao("Descricao")
            .categoria(Categoria.PUBLICO)
            .idUsuario(1L)
            .tiposAcessibilidade(Set.of())
            .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> localService.atualizar(1L, dto));

        assertTrue(ex.getMessage().contains("Pelo menos um tipo"));
    }

    private Local criarLocal(Long id, StatusLocal status) {
        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .email("usuario@teste.com")
            .nome("Usuário")
            .build();

        return Local.builder()
            .idLocal(id)
            .nome("Local " + id)
            .status(status)
            .categoria(Categoria.PUBLICO)
            .avaliacaoMedia(4.0)
            .usuario(usuario)
            .tiposAcessibilidade(new HashSet<>(Set.of(TipoAcessibilidade.RAMPA)))
            .build();
    }
}
