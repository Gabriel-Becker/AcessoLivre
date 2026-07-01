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

import com.acessolivre.dto.request.CodigoRecuperacaoDoisFatoresRequestDTO;
import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoRecuperacaoDoisFatoresRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TwoFactorRecoveryCodeServiceTest {

    @Mock
    private CodigoRecuperacaoDoisFatoresRepository twoFactorRecoveryCodeRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private CodigoRecuperacaoDoisFatoresService twoFactorRecoveryCodeService;

    @Test
    void listarTodos_DeveRetornarTodosOsCodigos() {
        List<CodigoRecuperacaoDoisFatores> esperado = List.of(criarCodigo(1L, "ABC123", false, 30));
        when(twoFactorRecoveryCodeRepository.findAll()).thenReturn(esperado);

        List<CodigoRecuperacaoDoisFatores> resultado = twoFactorRecoveryCodeService.listarTodos();

        assertSame(esperado, resultado);
    }

    @Test
    void salvar_DeveLancarQuandoUsuarioNaoExistir() {
        CodigoRecuperacaoDoisFatoresRequestDTO dto = criarRequest("  REC123  ", 99L, 30);
        when(usuarioService.buscarPorId(99L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> twoFactorRecoveryCodeService.salvar(dto));

        assertEquals("Usuário não encontrado", ex.getMessage());
        verify(twoFactorRecoveryCodeRepository, never()).save(any());
    }

    @Test
    void salvar_DeveLancarQuandoCodigoJaExistir() {
        Usuario usuario = Usuario.builder().idUsuario(7L).nome("Teste").email("teste@email.com").build();
        CodigoRecuperacaoDoisFatoresRequestDTO dto = criarRequest("  DUP001  ", 7L, 20);

        when(usuarioService.buscarPorId(7L)).thenReturn(Optional.of(usuario));
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("DUP001", 7L))
            .thenReturn(Optional.of(criarCodigo(10L, "DUP001", false, 20)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> twoFactorRecoveryCodeService.salvar(dto));

        assertEquals("Código de recuperação já existe para este usuário", ex.getMessage());
        verify(twoFactorRecoveryCodeRepository, never()).save(any());
    }

    @Test
    void salvar_DevePersistirQuandoDadosValidos() {
        Usuario usuario = Usuario.builder().idUsuario(8L).nome("Teste").email("ok@email.com").build();
        CodigoRecuperacaoDoisFatoresRequestDTO dto = criarRequest("  NOVO001  ", 8L, 60);

        when(usuarioService.buscarPorId(8L)).thenReturn(Optional.of(usuario));
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("NOVO001", 8L))
            .thenReturn(Optional.empty());
        when(twoFactorRecoveryCodeRepository.save(any(CodigoRecuperacaoDoisFatores.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        CodigoRecuperacaoDoisFatores salvo = twoFactorRecoveryCodeService.salvar(dto);

        assertEquals("NOVO001", salvo.getCodigo());
        assertSame(usuario, salvo.getUsuario());
        assertEquals(Boolean.FALSE, salvo.getUtilizado());
        verify(twoFactorRecoveryCodeRepository).save(any(CodigoRecuperacaoDoisFatores.class));
    }

    @Test
    void deletar_DeveLancarQuandoIdNaoExistir() {
        when(twoFactorRecoveryCodeRepository.existsById(11L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> twoFactorRecoveryCodeService.deletar(11L));

        assertEquals("Código de recuperação não encontrado", ex.getMessage());
        verify(twoFactorRecoveryCodeRepository, never()).deleteById(any());
    }

    @Test
    void marcarComoUsado_DeveLancarQuandoCodigoNaoEncontrado() {
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("REC404", 5L))
            .thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> twoFactorRecoveryCodeService.marcarComoUsado("  REC404  ", 5L));

        assertEquals("Código não encontrado para este usuário", ex.getMessage());
    }

    @Test
    void marcarComoUsado_DeveLancarQuandoJaUtilizado() {
        CodigoRecuperacaoDoisFatores codigo = criarCodigo(20L, "REC777", true, 30);
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("REC777", 9L))
            .thenReturn(Optional.of(codigo));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> twoFactorRecoveryCodeService.marcarComoUsado("REC777", 9L));

        assertEquals("Código já foi utilizado", ex.getMessage());
        verify(twoFactorRecoveryCodeRepository, never()).save(any());
    }

    @Test
    void marcarComoUsado_DeveLancarQuandoCodigoExpirado() {
        CodigoRecuperacaoDoisFatores codigo = criarCodigo(21L, "REC888", false, -1);
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("REC888", 10L))
            .thenReturn(Optional.of(codigo));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> twoFactorRecoveryCodeService.marcarComoUsado("REC888", 10L));

        assertEquals("Código expirado", ex.getMessage());
        verify(twoFactorRecoveryCodeRepository, never()).save(any());
    }

    @Test
    void marcarComoUsado_DeveAtualizarStatusQuandoValido() {
        CodigoRecuperacaoDoisFatores codigo = criarCodigo(22L, "REC999", false, 30);
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("REC999", 11L))
            .thenReturn(Optional.of(codigo));

        boolean resultado = twoFactorRecoveryCodeService.marcarComoUsado("  REC999  ", 11L);

        assertTrue(resultado);
        assertEquals(Boolean.TRUE, codigo.getUtilizado());
        verify(twoFactorRecoveryCodeRepository).save(codigo);
    }

    @Test
    void isCodigoValido_DeveDelegarParaRepositorio() {
        when(twoFactorRecoveryCodeRepository.existsByCodigoAndUtilizadoFalseAndDataExpiracaoAfter(eq("ABC123"), any(LocalDateTime.class)))
            .thenReturn(true);

        boolean valido = twoFactorRecoveryCodeService.codigoEhValido("ABC123");

        assertTrue(valido);
    }

    @Test
    void buscarCodigosValidosPorUsuario_DeveRetornarLista() {
        List<CodigoRecuperacaoDoisFatores> esperado = List.of(criarCodigo(30L, "REC301", false, 50));
        when(twoFactorRecoveryCodeRepository.findByUsuario_IdUsuarioAndUtilizadoFalseAndDataExpiracaoAfter(eq(33L), any(LocalDateTime.class)))
            .thenReturn(esperado);

        List<CodigoRecuperacaoDoisFatores> resultado = twoFactorRecoveryCodeService.buscarCodigosValidosPorUsuario(33L);

        assertSame(esperado, resultado);
    }

    @Test
    void limparCodigosExpirados_DeveRemoverEInformarQuantidade() {
        List<CodigoRecuperacaoDoisFatores> expirados = List.of(
            criarCodigo(40L, "EXP001", false, -10),
            criarCodigo(41L, "EXP002", false, -3)
        );

        when(twoFactorRecoveryCodeRepository.findByDataExpiracaoBefore(any(LocalDateTime.class)))
            .thenReturn(expirados);

        int removidos = twoFactorRecoveryCodeService.limparCodigosExpirados();

        assertEquals(2, removidos);
        verify(twoFactorRecoveryCodeRepository).deleteAll(expirados);
    }

    private CodigoRecuperacaoDoisFatoresRequestDTO criarRequest(String codigo, Long usuarioId, int minutosAteExpirar) {
        LocalDateTime agora = LocalDateTime.now();
        return CodigoRecuperacaoDoisFatoresRequestDTO.builder()
            .codigo(codigo)
            .dataCriacao(agora)
            .dataExpiracao(agora.plusMinutes(minutosAteExpirar))
            .utilizado(false)
            .usuarioId(usuarioId)
            .build();
    }

    private CodigoRecuperacaoDoisFatores criarCodigo(Long id, String codigo, boolean utilizado, int minutosAteExpirar) {
        LocalDateTime agora = LocalDateTime.now();
        return CodigoRecuperacaoDoisFatores.builder()
            .id(id)
            .codigo(codigo)
            .dataCriacao(agora.minusMinutes(1))
            .dataExpiracao(agora.plusMinutes(minutosAteExpirar))
            .utilizado(utilizado)
            .usuario(Usuario.builder().idUsuario(1L).nome("Usuário Teste").email("usuario@teste.com").build())
            .build();
    }
}
