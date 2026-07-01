package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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

import com.acessolivre.dto.response.ConfiguracaoDoisFatoresResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoRecuperacaoDoisFatoresRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TwoFactorServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CodigoRecuperacaoDoisFatoresRepository twoFactorRecoveryCodeRepository;

    @InjectMocks
    private DoisFatoresService twoFactorService;

    @Test
    void isTwoFactorEnabledByEmail_DeveRetornarFalseQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByEmail("x@teste.com")).thenReturn(Optional.empty());

        assertFalse(twoFactorService.duasFatoresAtivadosPorEmail("x@teste.com"));
    }

    @Test
    void isTwoFactorEnabledByEmail_DeveRetornarStatusDoUsuario() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");
        usuario.setTwoFactorEnabled(true);
        when(usuarioRepository.findByEmail("u@teste.com")).thenReturn(Optional.of(usuario));

        assertTrue(twoFactorService.duasFatoresAtivadosPorEmail("u@teste.com"));
    }

    @Test
    void prepararConfiguracao_DeveGerarDadosESalvarCodigos() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        ConfiguracaoDoisFatoresResponseDTO dto = twoFactorService.prepararConfiguracao(1L);

        assertNotNull(dto);
        assertNotNull(dto.getSecretKey());
        assertNotNull(dto.getQrCode());
        assertEquals("AcessoLivre", dto.getIssuer());
        assertEquals(8, dto.getRecoveryCodes().size());
        verify(twoFactorRecoveryCodeRepository).deleteByUsuario(usuario);
        verify(twoFactorRecoveryCodeRepository).saveAll(any());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void habilitar_DeveLancarQuandoCodigoInvalido() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");
        usuario.setTwoFactorSecret("SECRET123");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        assertThrows(IllegalArgumentException.class, () -> twoFactorService.habilitar(1L, "000000"));
    }

    @Test
    void habilitar_DeveAtivarQuandoCodigoValido() {
        GoogleAuthenticator auth = new GoogleAuthenticator();
        String secret = auth.createCredentials().getKey();
        int codigoAtual = auth.getTotpPassword(secret);

        Usuario usuario = criarUsuario(1L, "u@teste.com");
        usuario.setTwoFactorSecret(secret);
        usuario.setTwoFactorEnabled(false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        boolean habilitado = twoFactorService.habilitar(1L, String.valueOf(codigoAtual));

        assertTrue(habilitado);
        assertTrue(usuario.getTwoFactorEnabled());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void desabilitar_DeveLancarQuandoCodigoNaoForValido() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");
        usuario.setTwoFactorSecret("SECRET123");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("abc", 1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> twoFactorService.desabilitar(1L, "abc"));
    }

    @Test
    void desabilitar_DeveDesativarUsandoCodigoRecuperacaoValido() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");
        usuario.setTwoFactorSecret("SECRET123");
        usuario.setTwoFactorEnabled(true);

        CodigoRecuperacaoDoisFatores recoveryCode = CodigoRecuperacaoDoisFatores.builder()
            .id(1L)
            .codigo("RCODE1")
            .usuario(usuario)
            .utilizado(false)
            .dataCriacao(LocalDateTime.now().minusDays(1))
            .dataExpiracao(LocalDateTime.now().plusDays(1))
            .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("RCODE1", 1L)).thenReturn(Optional.of(recoveryCode));

        boolean desabilitado = twoFactorService.desabilitar(1L, "RCODE1");

        assertTrue(desabilitado);
        assertFalse(usuario.getTwoFactorEnabled());
        assertEquals(null, usuario.getTwoFactorSecret());
        assertTrue(recoveryCode.getUtilizado());
        verify(usuarioRepository).save(usuario);
        verify(twoFactorRecoveryCodeRepository).deleteByUsuario(usuario);
    }

    @Test
    void validarCodigoAutenticador_DeveRetornarFalseParaEntradasInvalidas() {
        assertFalse(twoFactorService.validarCodigoAutenticador((Usuario) null, "123456"));

        Usuario usuario = criarUsuario(1L, "u@teste.com");
        usuario.setTwoFactorSecret(null);
        assertFalse(twoFactorService.validarCodigoAutenticador(usuario, "123456"));

        usuario.setTwoFactorSecret("ABC");
        assertFalse(twoFactorService.validarCodigoAutenticador(usuario, ""));
        assertFalse(twoFactorService.validarCodigoAutenticador(usuario, "abc"));
    }

    @Test
    void validarCodigoRecuperacao_DeveRetornarFalseQuandoCodigoNaoExistirOuInvalido() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");

        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("X", 1L)).thenReturn(Optional.empty());
        assertFalse(twoFactorService.validarCodigoRecuperacao(usuario, "X"));

        CodigoRecuperacaoDoisFatores usado = CodigoRecuperacaoDoisFatores.builder()
            .codigo("U")
            .usuario(usuario)
            .utilizado(true)
            .dataExpiracao(LocalDateTime.now().plusDays(1))
            .build();
        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("U", 1L)).thenReturn(Optional.of(usado));
        assertFalse(twoFactorService.validarCodigoRecuperacao(usuario, "U"));
    }

    @Test
    void validarCodigoRecuperacao_DeveMarcarComoUsadoQuandoValido() {
        Usuario usuario = criarUsuario(1L, "u@teste.com");
        CodigoRecuperacaoDoisFatores valido = CodigoRecuperacaoDoisFatores.builder()
            .codigo("R1")
            .usuario(usuario)
            .utilizado(false)
            .dataExpiracao(LocalDateTime.now().plusDays(1))
            .build();

        when(twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario("R1", 1L)).thenReturn(Optional.of(valido));

        boolean ok = twoFactorService.validarCodigoRecuperacao(usuario, "R1");

        assertTrue(ok);
        assertTrue(valido.getUtilizado());
        verify(twoFactorRecoveryCodeRepository).save(valido);
    }

    @Test
    void mascararEmail_DeveMascararCorretamente() {
        assertEquals("email informado", twoFactorService.mascararEmail(null));
        assertEquals("email informado", twoFactorService.mascararEmail("semarroba"));
        assertEquals("ab***@teste.com", twoFactorService.mascararEmail("abcdef@teste.com"));
        assertEquals("ab***@teste.com", twoFactorService.mascararEmail("ab@teste.com"));
    }

    @Test
    void validarCodigoAutenticadorPorEmail_DeveLancarQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByEmail("nao@teste.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> twoFactorService.validarCodigoAutenticador("nao@teste.com", "123456"));
    }

    private Usuario criarUsuario(Long id, String email) {
        return Usuario.builder()
            .idUsuario(id)
            .nome("Usuário")
            .email(email)
            .role(Role.ROLE_USER)
            .ativo(true)
            .twoFactorEnabled(false)
            .build();
    }
}
