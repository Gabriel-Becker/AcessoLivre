package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AvaliacaoServiceTest {

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private LocalRepository localRepository;

    @Mock
    private LocalService localService;

    @InjectMocks
    private AvaliacaoService avaliacaoService;

    @Test
    void listarTodos_DeveRetornarPaginaComAvaliacoes() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Avaliacao> page = new PageImpl<>(List.of(criarAvaliacao(1L)));
        when(avaliacaoRepository.findAll(pageable)).thenReturn(page);

        Page<Avaliacao> resultado = avaliacaoService.listarTodos(pageable);

        assertEquals(1, resultado.getSize());
        verify(avaliacaoRepository).findAll(pageable);
    }

    @Test
    void buscarPorId_DeveRetornarAvaliacaoQuandoExistir() {
        Avaliacao avaliacao = criarAvaliacao(5L);
        when(avaliacaoRepository.findById(5L)).thenReturn(Optional.of(avaliacao));

        Optional<Avaliacao> resultado = avaliacaoService.buscarPorId(5L);

        assertTrue(resultado.isPresent());
        assertEquals(5L, resultado.get().getIdAvaliacao());
    }

    @Test
    void listarPublicas_DeveRetornarApenasAvaliacoesModeradas() {
        List<Avaliacao> avaliacoes = new java.util.ArrayList<>();
        avaliacoes.add(criarAvaliacao(30L));
        when(avaliacaoRepository.findByModerado(true)).thenReturn(avaliacoes);

        List<Avaliacao> resultado = avaliacaoService.listarPublicas();

        assertEquals(1, resultado.size());
        verify(avaliacaoRepository).findByModerado(true);
    }

    @Test
    void buscarPublicasPorLocal_DeveRetornarAvaliacoesModeradasDoLocal() {
        List<Avaliacao> avaliacoes = new java.util.ArrayList<>();
        avaliacoes.add(criarAvaliacao(40L));
        when(avaliacaoRepository.findByLocalIdLocalAndModerado(200L, true)).thenReturn(avaliacoes);

        List<Avaliacao> resultado = avaliacaoService.buscarPublicasPorLocal(200L);

        assertEquals(1, resultado.size());
        verify(avaliacaoRepository).findByLocalIdLocalAndModerado(200L, true);
    }

    @Test
    void salvar_DeveLancarQuandoUsuarioJaAvaliouLocal() {
        AvaliacaoRequestDTO dto = criarRequest();
        when(avaliacaoRepository.existsByUsuarioIdUsuarioAndLocalIdLocal(1L, 1L)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> avaliacaoService.salvar(dto));

        assertEquals("Usuário já avaliou este local", ex.getMessage());
    }

    @Test
    void salvar_DeveLancarQuandoUsuarioNaoExistir() {
        AvaliacaoRequestDTO dto = criarRequest();
        when(avaliacaoRepository.existsByUsuarioIdUsuarioAndLocalIdLocal(1L, 1L)).thenReturn(false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> avaliacaoService.salvar(dto));

        assertTrue(ex.getMessage().contains("Usuário não encontrado"));
    }

    @Test
    void salvar_DeveLancarQuandoLocalNaoExistir() {
        AvaliacaoRequestDTO dto = criarRequest();
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("User").build();

        when(avaliacaoRepository.existsByUsuarioIdUsuarioAndLocalIdLocal(1L, 1L)).thenReturn(false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(localRepository.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> avaliacaoService.salvar(dto));

        assertTrue(ex.getMessage().contains("Local não encontrado"));
    }

    @Test
    void salvar_DevePersisteQuandoDadosValidos() {
        AvaliacaoRequestDTO dto = criarRequest();
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("User").build();
        Local local = Local.builder().idLocal(1L).nome("Local").build();

        when(avaliacaoRepository.existsByUsuarioIdUsuarioAndLocalIdLocal(1L, 1L)).thenReturn(false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(localRepository.findById(1L)).thenReturn(Optional.of(local));
        when(avaliacaoRepository.save(any(Avaliacao.class))).thenAnswer(inv -> inv.getArgument(0));

        Avaliacao resultado = avaliacaoService.salvar(dto);

        assertEquals(usuario, resultado.getUsuario());
        assertEquals(local, resultado.getLocal());
        verify(localService).recalcularMediaAvaliacoes(1L);
    }

    @Test
    void deletar_DeveRetornarFalseQuandoAvaliacaoNaoExistir() {
        when(avaliacaoRepository.findById(999L)).thenReturn(Optional.empty());

        boolean resultado = avaliacaoService.deletar(999L);

        assertFalse(resultado);
    }

    @Test
    void deletar_DeveRetornarTrueQuandoAvaliacaoDeletada() {
        Local local = Local.builder().idLocal(1L).build();
        Avaliacao avaliacao = criarAvaliacao(50L);
        avaliacao.setLocal(local);

        when(avaliacaoRepository.findById(50L)).thenReturn(Optional.of(avaliacao));

        boolean resultado = avaliacaoService.deletar(50L);

        assertTrue(resultado);
        verify(avaliacaoRepository).deleteById(50L);
        verify(localService).recalcularMediaAvaliacoes(1L);
    }

    private Avaliacao criarAvaliacao(Long id) {
        return Avaliacao.builder()
            .idAvaliacao(id)
            .notaAcessibilidadeVisual(4)
            .notaAcessibilidadeMotora(5)
            .notaAcessibilidadeAuditiva(3)
            .notaGeral(4.0)
            .moderado(true)
            .build();
    }

    private AvaliacaoRequestDTO criarRequest() {
        return AvaliacaoRequestDTO.builder()
            .notaAcessibilidadeVisual(4)
            .notaAcessibilidadeMotora(5)
            .notaAcessibilidadeAuditiva(3)
            .idUsuario(1L)
            .idLocal(1L)
            .build();
    }
}
