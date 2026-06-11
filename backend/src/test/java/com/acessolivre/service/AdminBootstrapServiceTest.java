package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import com.acessolivre.dto.request.AdminBootstrapRequestDTO;
import com.acessolivre.dto.response.UsuarioAdminResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AdminBootstrapServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminBootstrapService adminBootstrapService;

    @Test
    void criarAdminSeInexistente_DeveLancarConflictQuandoJaExisteAdmin() {
        when(usuarioRepository.existsByRole(Role.ROLE_ADMIN)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> adminBootstrapService.criarAdminSeInexistente("segredo", criarRequest()));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Já existe um administrador cadastrado", ex.getReason());
    }

    @Test
    void criarAdminSeInexistente_DeveLancarInternalServerErrorQuandoSegredoNaoConfigurado() {
        when(usuarioRepository.existsByRole(Role.ROLE_ADMIN)).thenReturn(false);
        ReflectionTestUtils.setField(adminBootstrapService, "bootstrapSecret", "   ");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> adminBootstrapService.criarAdminSeInexistente("segredo", criarRequest()));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
        assertEquals("Segredo de bootstrap não configurado", ex.getReason());
    }

    @Test
    void criarAdminSeInexistente_DeveLancarForbiddenQuandoSegredoForInvalido() {
        when(usuarioRepository.existsByRole(Role.ROLE_ADMIN)).thenReturn(false);
        ReflectionTestUtils.setField(adminBootstrapService, "bootstrapSecret", "segredo-correto");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> adminBootstrapService.criarAdminSeInexistente(" segredo-errado ", criarRequest()));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("Segredo inválido ou ausente", ex.getReason());
    }

    @Test
    void criarAdminSeInexistente_DeveLancarConflictQuandoEmailJaExistir() {
        when(usuarioRepository.existsByRole(Role.ROLE_ADMIN)).thenReturn(false);
        when(usuarioRepository.findByEmail("admin@acessolivre.com")).thenReturn(Optional.of(Usuario.builder().idUsuario(99L).build()));
        ReflectionTestUtils.setField(adminBootstrapService, "bootstrapSecret", "segredo-correto");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> adminBootstrapService.criarAdminSeInexistente("segredo-correto", criarRequest()));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email já cadastrado", ex.getReason());
        verify(usuarioAutenticarRepository, never()).save(any());
    }

    @Test
    void criarAdminSeInexistente_DeveCriarAdminQuandoDadosForemValidos() {
        AdminBootstrapRequestDTO dto = criarRequest();
        ReflectionTestUtils.setField(adminBootstrapService, "bootstrapSecret", "segredo-correto");

        when(usuarioRepository.existsByRole(Role.ROLE_ADMIN)).thenReturn(false);
        when(usuarioRepository.findByEmail(dto.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(dto.getSenha())).thenReturn("senha-hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuario = invocation.getArgument(0);
            usuario.setIdUsuario(10L);
            usuario.setDataCadastro(LocalDateTime.of(2026, 6, 11, 18, 0));
            return usuario;
        });
        when(usuarioAutenticarRepository.save(any(UsuarioAutenticar.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioAdminResponseDTO response = adminBootstrapService.criarAdminSeInexistente("  segredo-correto  ", dto);

        assertNotNull(response);
        assertEquals(10L, response.getIdUsuario());
        assertEquals("Administrador", response.getNome());
        assertEquals("admin@acessolivre.com", response.getEmail());
        assertEquals("ROLE_ADMIN", response.getRole());
        assertEquals("2026-06-11T18:00", response.getDataCadastro());
        verify(usuarioRepository).save(any(Usuario.class));
        verify(usuarioAutenticarRepository).save(any(UsuarioAutenticar.class));
        verify(passwordEncoder).encode(dto.getSenha());
    }

    private AdminBootstrapRequestDTO criarRequest() {
        return AdminBootstrapRequestDTO.builder()
            .nome("Administrador")
            .email("admin@acessolivre.com")
            .senha("Senha@123")
            .build();
    }
}