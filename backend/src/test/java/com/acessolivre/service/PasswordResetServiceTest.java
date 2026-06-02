package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.acessolivre.enums.Role;
import com.acessolivre.exception.PasswordResetException;
import com.acessolivre.exception.UsuarioException;
import com.acessolivre.model.PasswordResetCode;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.PasswordResetCodeRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PasswordResetServiceTest {

    @Mock
    private PasswordResetCodeRepository passwordResetCodeRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @Test
    void gerarCodigoRecuperacaoComValidacao_DeveRetornarMensagemNeutraQuandoEmailNaoExiste() {
        when(usuarioRepository.findByEmail("naoexiste@teste.com")).thenReturn(Optional.empty());

        String mensagem = passwordResetService.gerarCodigoRecuperacaoComValidacao("naoexiste@teste.com");

        assertTrue(mensagem.contains("Se o email existir"));
    }

    @Test
    void gerarCodigoRecuperacaoComValidacao_DeveLancarQuandoUsuarioInativo() {
        Usuario usuario = criarUsuario(1L, false);
        when(usuarioRepository.findByEmail("inativo@teste.com")).thenReturn(Optional.of(usuario));

        assertThrows(UsuarioException.UsuarioInativoException.class,
            () -> passwordResetService.gerarCodigoRecuperacaoComValidacao("inativo@teste.com"));
    }

    @Test
    void gerarCodigoRecuperacaoComValidacao_DeveLancarQuandoExcederTentativas() {
        Usuario usuario = criarUsuario(1L, true);
        when(usuarioRepository.findByEmail("ativo@teste.com")).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.countByUsuario_IdUsuarioAndCreatedAtAfter(anyLong(), any(LocalDateTime.class))).thenReturn(3L);

        PasswordResetException ex = assertThrows(PasswordResetException.class,
            () -> passwordResetService.gerarCodigoRecuperacaoComValidacao("ativo@teste.com"));

        assertTrue(ex.getMessage().contains("Muitas tentativas"));
    }

    @Test
    void gerarCodigoRecuperacaoComValidacao_DeveLancarQuandoEnvioEmailFalhar() {
        Usuario usuario = criarUsuario(1L, true);
        when(usuarioRepository.findByEmail("ativo@teste.com")).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.countByUsuario_IdUsuarioAndCreatedAtAfter(anyLong(), any(LocalDateTime.class))).thenReturn(0L);
        when(passwordResetCodeRepository.save(any(PasswordResetCode.class))).thenAnswer(inv -> inv.getArgument(0));
        org.mockito.Mockito.doThrow(new RuntimeException("smtp off")).when(emailService)
            .sendPasswordResetCode(any(), any(), any());

        assertThrows(PasswordResetException.EnvioEmailException.class,
            () -> passwordResetService.gerarCodigoRecuperacaoComValidacao("ativo@teste.com"));
    }

    @Test
    void gerarCodigoRecuperacaoComValidacao_DeveSalvarEEnviarQuandoSucesso() {
        Usuario usuario = criarUsuario(1L, true);
        when(usuarioRepository.findByEmail("ativo@teste.com")).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.countByUsuario_IdUsuarioAndCreatedAtAfter(anyLong(), any(LocalDateTime.class))).thenReturn(0L);
        when(passwordResetCodeRepository.save(any(PasswordResetCode.class))).thenAnswer(inv -> inv.getArgument(0));

        String mensagem = passwordResetService.gerarCodigoRecuperacaoComValidacao("ativo@teste.com");

        assertTrue(mensagem.contains("Se o email existir"));
        verify(passwordResetCodeRepository).markAllAsUsedByUsuarioId(1L);
        verify(emailService).sendPasswordResetCode(any(), any(), any());
    }

    @Test
    void redefinirSenhaComValidacao_DeveLancarQuandoCodigoInvalidoNoFormato() {
        PasswordResetException ex = assertThrows(PasswordResetException.class,
            () -> passwordResetService.redefinirSenhaComValidacao("u@teste.com", "abc", "Senha@12345"));

        assertTrue(ex.getMessage().contains("inválido"));
    }

    @Test
    void redefinirSenhaComValidacao_DeveLancarQuandoSenhaFraca() {
        PasswordResetException ex = assertThrows(PasswordResetException.class,
            () -> passwordResetService.redefinirSenhaComValidacao("u@teste.com", "123456", "123"));

        assertTrue(ex.getMessage().length() > 0);
    }

    @Test
    void redefinirSenhaComValidacao_DeveLancarQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByEmail("x@teste.com")).thenReturn(Optional.empty());

        PasswordResetException ex = assertThrows(PasswordResetException.class,
            () -> passwordResetService.redefinirSenhaComValidacao("x@teste.com", "123456", "Senha@12345"));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void redefinirSenhaComValidacao_DeveLancarQuandoCodigoJaUtilizado() {
        Usuario usuario = criarUsuario(2L, true);
        PasswordResetCode codigo = criarCodigo(usuario, true, LocalDateTime.now().plusMinutes(5));

        when(usuarioRepository.findByEmail("u2@teste.com")).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(eq("123456"), eq(2L), any(LocalDateTime.class)))
            .thenReturn(Optional.empty());
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario("123456", 2L)).thenReturn(Optional.of(codigo));

        assertThrows(PasswordResetException.CodigoJaUtilizadoException.class,
            () -> passwordResetService.redefinirSenhaComValidacao("u2@teste.com", "123456", "Senha@12345"));
    }

    @Test
    void redefinirSenhaComValidacao_DeveLancarQuandoCodigoExpirado() {
        Usuario usuario = criarUsuario(2L, true);
        PasswordResetCode codigo = criarCodigo(usuario, false, LocalDateTime.now().minusMinutes(1));

        when(usuarioRepository.findByEmail("u2@teste.com")).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(eq("123456"), eq(2L), any(LocalDateTime.class)))
            .thenReturn(Optional.empty());
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario("123456", 2L)).thenReturn(Optional.of(codigo));

        assertThrows(PasswordResetException.CodigoExpiradoException.class,
            () -> passwordResetService.redefinirSenhaComValidacao("u2@teste.com", "123456", "Senha@12345"));
    }

    @Test
    void redefinirSenhaComValidacao_DeveAtualizarSenhaEConsumirCodigoQuandoSucesso() {
        Usuario usuario = criarUsuario(2L, true);
        UsuarioAutenticar credencial = UsuarioAutenticar.builder().usuario(usuario).senhaHash("old").build();
        PasswordResetCode codigo = criarCodigo(usuario, false, LocalDateTime.now().plusMinutes(10));

        when(usuarioRepository.findByEmail("u2@teste.com")).thenReturn(Optional.of(usuario));
        when(passwordResetCodeRepository.findByCodeAndUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(eq("123456"), eq(2L), any(LocalDateTime.class)))
            .thenReturn(Optional.of(codigo));
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(2L)).thenReturn(Optional.of(credencial));
        when(passwordEncoder.encode("Senha@12345")).thenReturn("novaHash");

        String retorno = passwordResetService.redefinirSenhaComValidacao("u2@teste.com", "123456", "Senha@12345");

        assertEquals("Senha redefinida com sucesso", retorno);
        assertEquals("novaHash", credencial.getSenhaHash());
        assertTrue(codigo.getUsed());
        verify(usuarioAutenticarRepository).save(credencial);
        verify(passwordResetCodeRepository).save(codigo);
    }

    private Usuario criarUsuario(Long id, boolean ativo) {
        return Usuario.builder()
            .idUsuario(id)
            .nome("Usuário")
            .email(id == 1L ? "ativo@teste.com" : "u2@teste.com")
            .role(Role.ROLE_USER)
            .ativo(ativo)
            .build();
    }

    private PasswordResetCode criarCodigo(Usuario usuario, boolean used, LocalDateTime expiracao) {
        return PasswordResetCode.builder()
            .id(1L)
            .code("123456")
            .usuario(usuario)
            .createdAt(LocalDateTime.now().minusMinutes(2))
            .expiresAt(expiracao)
            .used(used)
            .build();
    }
}
