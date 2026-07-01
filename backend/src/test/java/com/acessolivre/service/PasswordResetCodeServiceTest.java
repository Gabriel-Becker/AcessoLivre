package com.acessolivre.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.acessolivre.dto.request.CodigoRecuperacaoSenhaRequestDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.CodigoRecuperacaoSenha;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoRecuperacaoSenhaRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PasswordResetCodeServiceTest {

    @Mock
    private CodigoRecuperacaoSenhaRepository passwordResetCodeRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private CodigoRecuperacaoSenhaService passwordResetCodeService;

    @Test
    void listarTodos_DeveDelegarRepositorio() {
        when(passwordResetCodeRepository.findAll()).thenReturn(List.of(criarCodigo(1L, false)));

        List<CodigoRecuperacaoSenha> resultado = passwordResetCodeService.listarTodos();

        assertEquals(1, resultado.size());
    }

    @Test
    void buscarPorId_DeveLancarQuandoIdNulo() {
        NullPointerException ex = assertThrows(NullPointerException.class, () -> passwordResetCodeService.buscarPorId(null));
        assertTrue(ex.getMessage().contains("id não pode ser nulo"));
    }

    @Test
    void salvar_DeveLancarQuandoUsuarioNaoExiste() {
        CodigoRecuperacaoSenhaRequestDTO dto = criarRequest(10L, "ABC");
        when(usuarioService.buscarPorId(10L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> passwordResetCodeService.salvar(dto));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void salvar_DeveLancarQuandoJaExisteCodigoValido() {
        CodigoRecuperacaoSenhaRequestDTO dto = criarRequest(10L, "ABC");
        when(usuarioService.buscarPorId(10L)).thenReturn(Optional.of(criarUsuario(10L)));
        when(passwordResetCodeRepository.findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(any(), any()))
            .thenReturn(List.of(criarCodigo(1L, false)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> passwordResetCodeService.salvar(dto));

        assertTrue(ex.getMessage().contains("Já existe código válido"));
    }

    @Test
    void salvar_DeveSalvarQuandoSucesso() {
        CodigoRecuperacaoSenhaRequestDTO dto = criarRequest(10L, "ABC");
        Usuario usuario = criarUsuario(10L);

        when(usuarioService.buscarPorId(10L)).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(any(), any()))
            .thenReturn(List.of());
        when(passwordResetCodeRepository.save(any(CodigoRecuperacaoSenha.class))).thenAnswer(inv -> {
            CodigoRecuperacaoSenha codigo = inv.getArgument(0);
            codigo.setId(99L);
            return codigo;
        });

        CodigoRecuperacaoSenha salvo = passwordResetCodeService.salvar(dto);

        assertNotNull(salvo);
        assertEquals(99L, salvo.getId());
    }

    @Test
    void deletar_DeveLancarQuandoIdNulo() {
        assertThrows(NullPointerException.class, () -> passwordResetCodeService.deletar(null));
    }

    @Test
    void deletar_DeveLancarQuandoNaoExiste() {
        when(passwordResetCodeRepository.existsById(1L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> passwordResetCodeService.deletar(1L));

        assertEquals("Código de reset não encontrado", ex.getMessage());
    }

    @Test
    void deletar_DeveRemoverQuandoExiste() {
        when(passwordResetCodeRepository.existsById(1L)).thenReturn(true);

        passwordResetCodeService.deletar(1L);

        verify(passwordResetCodeRepository).deleteById(1L);
    }

    @Test
    void marcarComoUsado_DeveLancarQuandoNaoEncontrado() {
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario("ABC", 1L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> passwordResetCodeService.marcarComoUsado(" ABC ", 1L));

        assertTrue(ex.getMessage().contains("não encontrado"));
    }

    @Test
    void marcarComoUsado_DeveLancarQuandoJaUsado() {
        CodigoRecuperacaoSenha codigo = criarCodigo(1L, true);
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario("ABC", 1L)).thenReturn(Optional.of(codigo));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> passwordResetCodeService.marcarComoUsado("ABC", 1L));

        assertTrue(ex.getMessage().contains("já foi utilizado"));
    }

    @Test
    void marcarComoUsado_DeveLancarQuandoExpirado() {
        CodigoRecuperacaoSenha codigo = criarCodigo(1L, false);
        codigo.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario("ABC", 1L)).thenReturn(Optional.of(codigo));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> passwordResetCodeService.marcarComoUsado("ABC", 1L));

        assertTrue(ex.getMessage().contains("expirado"));
    }

    @Test
    void marcarComoUsado_DeveMarcarEGuardarQuandoValido() {
        CodigoRecuperacaoSenha codigo = criarCodigo(1L, false);
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario("ABC", 1L)).thenReturn(Optional.of(codigo));

        boolean sucesso = passwordResetCodeService.marcarComoUsado("ABC", 1L);

        assertTrue(sucesso);
        assertTrue(codigo.getUsed());
        verify(passwordResetCodeRepository).save(codigo);
    }

    @Test
    void limparCodigosExpirados_DeveRemoverEContar() {
        when(passwordResetCodeRepository.findByExpiresAtBefore(any())).thenReturn(List.of(criarCodigo(1L, false), criarCodigo(2L, false)));

        int removidos = passwordResetCodeService.limparCodigosExpirados();

        assertEquals(2, removidos);
        verify(passwordResetCodeRepository).deleteAll(any(List.class));
    }

    private CodigoRecuperacaoSenhaRequestDTO criarRequest(Long usuarioId, String code) {
        return CodigoRecuperacaoSenhaRequestDTO.builder()
            .usuarioId(usuarioId)
            .code(code)
            .createdAt(LocalDateTime.now().minusMinutes(2))
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .used(false)
            .build();
    }

    private Usuario criarUsuario(Long id) {
        return Usuario.builder()
            .idUsuario(id)
            .nome("Usuário")
            .email("usuario@teste.com")
            .role(Role.ROLE_USER)
            .ativo(true)
            .build();
    }

    private CodigoRecuperacaoSenha criarCodigo(Long id, boolean usado) {
        return CodigoRecuperacaoSenha.builder()
            .id(id)
            .code("ABC")
            .usuario(criarUsuario(1L))
            .createdAt(LocalDateTime.now().minusMinutes(3))
            .expiresAt(LocalDateTime.now().plusMinutes(5))
            .used(usado)
            .build();
    }
}
