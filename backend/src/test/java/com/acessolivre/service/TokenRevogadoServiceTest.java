package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.acessolivre.dto.request.TokenRevogadoRequestDTO;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TokenRevogadoServiceTest {

    @Mock
    private TokenRevogadoRepository tokenRevogadoRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private TokenRevogadoService tokenRevogadoService;

    @Test
    void listarTodos_DeveRetornarTodosOsTokens() {
        List<TokenRevogado> esperado = List.of(criarTokenRevogado(1L, "token-1"));
        when(tokenRevogadoRepository.findAll()).thenReturn(esperado);

        List<TokenRevogado> resultado = tokenRevogadoService.listarTodos();

        assertSame(esperado, resultado);
    }

    @Test
    void buscarPorId_DeveDelegarParaRepositorio() {
        TokenRevogado token = criarTokenRevogado(2L, "token-2");
        when(tokenRevogadoRepository.findById(2L)).thenReturn(Optional.of(token));

        Optional<TokenRevogado> resultado = tokenRevogadoService.buscarPorId(2L);

        assertTrue(resultado.isPresent());
        assertSame(token, resultado.get());
    }

    @Test
    void salvar_DeveLancarQuandoUsuarioNaoExistir() {
        TokenRevogadoRequestDTO dto = criarRequest("  token-inexistente  ", 99L);
        when(usuarioService.buscarPorId(99L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> tokenRevogadoService.salvar(dto));

        assertEquals("Usuário não encontrado", ex.getMessage());
        verify(tokenRevogadoRepository, never()).save(any());
    }

    @Test
    void salvar_DeveLancarQuandoTokenJaTiverSidoRevogado() {
        Usuario usuario = Usuario.builder().idUsuario(7L).build();
        TokenRevogadoRequestDTO dto = criarRequest("  token-duplicado  ", 7L);

        when(usuarioService.buscarPorId(7L)).thenReturn(Optional.of(usuario));
        when(tokenRevogadoRepository.existsByToken("token-duplicado")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> tokenRevogadoService.salvar(dto));

        assertEquals("Token já foi revogado", ex.getMessage());
        verify(tokenRevogadoRepository, never()).save(any());
    }

    @Test
    void salvar_DevePersistirTokenQuandoDadosForemValidos() {
        Usuario usuario = Usuario.builder().idUsuario(8L).nome("Gabriel").build();
        TokenRevogadoRequestDTO dto = criarRequest("  token-valido  ", 8L);

        when(usuarioService.buscarPorId(8L)).thenReturn(Optional.of(usuario));
        when(tokenRevogadoRepository.existsByToken("token-valido")).thenReturn(false);
        when(tokenRevogadoRepository.save(any(TokenRevogado.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TokenRevogado salvo = tokenRevogadoService.salvar(dto);

        assertEquals("token-valido", salvo.getToken());
        assertEquals(usuario, salvo.getUsuario());
        assertEquals(dto.getDataRevogacao(), salvo.getDataRevogacao());
        verify(tokenRevogadoRepository).existsByToken("token-valido");
        verify(tokenRevogadoRepository).save(any(TokenRevogado.class));
    }

    @Test
    void deletar_DeveLancarQuandoIdNaoExistir() {
        when(tokenRevogadoRepository.existsById(12L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> tokenRevogadoService.deletar(12L));

        assertEquals("Token revogado não encontrado", ex.getMessage());
        verify(tokenRevogadoRepository, never()).deleteById(any());
    }

    @Test
    void deletar_DeveExcluirQuandoIdExistir() {
        when(tokenRevogadoRepository.existsById(13L)).thenReturn(true);

        tokenRevogadoService.deletar(13L);

        verify(tokenRevogadoRepository).deleteById(13L);
    }

    @Test
    void isTokenRevogado_DeveConsultarRepositorioComTrim() {
        when(tokenRevogadoRepository.existsByToken("token-trimado")).thenReturn(true);

        boolean resultado = tokenRevogadoService.isTokenRevogado("  token-trimado  ");

        assertTrue(resultado);
        verify(tokenRevogadoRepository).existsByToken("token-trimado");
    }

    @Test
    void buscarPorUsuario_DeveRetornarTokensDoUsuario() {
        List<TokenRevogado> esperado = List.of(criarTokenRevogado(20L, "token-usuario"));
        when(tokenRevogadoRepository.findByUsuario_IdUsuario(5L)).thenReturn(esperado);

        List<TokenRevogado> resultado = tokenRevogadoService.buscarPorUsuario(5L);

        assertSame(esperado, resultado);
        verify(tokenRevogadoRepository).findByUsuario_IdUsuario(5L);
    }

    private TokenRevogadoRequestDTO criarRequest(String token, Long usuarioId) {
        return TokenRevogadoRequestDTO.builder()
            .dataRevogacao(LocalDateTime.of(2026, 6, 11, 17, 0))
            .token(token)
            .usuarioId(usuarioId)
            .build();
    }

    private TokenRevogado criarTokenRevogado(Long id, String token) {
        return TokenRevogado.builder()
            .id(id)
            .token(token)
            .dataRevogacao(LocalDateTime.of(2026, 6, 11, 16, 0))
            .usuario(Usuario.builder().idUsuario(1L).build())
            .build();
    }
}