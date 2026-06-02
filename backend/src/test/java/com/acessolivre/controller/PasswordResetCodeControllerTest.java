package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.acessolivre.dto.response.PasswordResetCodeResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.PasswordResetCode;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.PasswordResetCodeService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PasswordResetCodeControllerTest {

    @Mock
    private PasswordResetCodeService passwordResetCodeService;

    @InjectMocks
    private PasswordResetCodeController passwordResetCodeController;

    @Test
    void listarTodos_DeveRetornarOkQuandoSucesso() {
        when(passwordResetCodeService.listarTodos()).thenReturn(List.of(criarCodigo(1L, "ABC123", false)));

        ResponseEntity<List<PasswordResetCodeResponseDTO>> response = passwordResetCodeController.listarTodos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void listarTodos_DeveRetornar500QuandoErro() {
        when(passwordResetCodeService.listarTodos()).thenThrow(new RuntimeException("erro"));

        ResponseEntity<List<PasswordResetCodeResponseDTO>> response = passwordResetCodeController.listarTodos();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void buscarPorId_DeveRetornarOkQuandoEncontrado() {
        when(passwordResetCodeService.buscarPorId(2L)).thenReturn(Optional.of(criarCodigo(2L, "DEF456", false)));

        ResponseEntity<PasswordResetCodeResponseDTO> response = passwordResetCodeController.buscarPorId(2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2L, response.getBody().getId());
    }

    @Test
    void buscarPorId_DeveRetornarNotFoundQuandoAusente() {
        when(passwordResetCodeService.buscarPorId(9L)).thenReturn(Optional.empty());

        ResponseEntity<PasswordResetCodeResponseDTO> response = passwordResetCodeController.buscarPorId(9L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void salvar_DeveRetornarCreatedQuandoSucesso() {
        PasswordResetCodeRequestDTO request = criarRequest("ZXCVBN", 1L);
        when(passwordResetCodeService.salvar(any(PasswordResetCodeRequestDTO.class))).thenReturn(criarCodigo(3L, "ZXCVBN", false));

        ResponseEntity<?> response = passwordResetCodeController.salvar(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void salvar_DeveRetornarBadRequestQuandoRegraNegocioFalhar() {
        PasswordResetCodeRequestDTO request = criarRequest("ZXCVBN", 1L);
        when(passwordResetCodeService.salvar(any(PasswordResetCodeRequestDTO.class))).thenThrow(new IllegalArgumentException("Já existe código"));

        ResponseEntity<?> response = passwordResetCodeController.salvar(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Já existe código", body.get("error"));
    }

    @Test
    void deletar_DeveRetornarNotFoundQuandoCodigoNaoExiste() {
        org.mockito.Mockito.doThrow(new IllegalArgumentException("Código de reset não encontrado"))
            .when(passwordResetCodeService).deletar(55L);

        ResponseEntity<?> response = passwordResetCodeController.deletar(55L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void verificarCodigo_DeveRetornarBoolean() {
        when(passwordResetCodeService.isCodigoValido("VALIDO")).thenReturn(true);

        ResponseEntity<Boolean> response = passwordResetCodeController.verificarCodigo("VALIDO");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Boolean.TRUE, response.getBody());
    }

    @Test
    void marcarComoUsado_DeveRetornarBadRequestQuandoCodigoInvalido() {
        when(passwordResetCodeService.marcarComoUsado("COD", 1L)).thenThrow(new IllegalArgumentException("Código expirado"));

        ResponseEntity<?> response = passwordResetCodeController.marcarComoUsado("COD", 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void buscarCodigosValidosPorUsuario_DeveRetornarLista() {
        when(passwordResetCodeService.buscarCodigosValidosPorUsuario(1L)).thenReturn(List.of(criarCodigo(4L, "X1", false)));

        ResponseEntity<List<PasswordResetCodeResponseDTO>> response = passwordResetCodeController.buscarCodigosValidosPorUsuario(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void limparCodigosExpirados_DeveRetornarQuantidadeRemovida() {
        when(passwordResetCodeService.limparCodigosExpirados()).thenReturn(3);

        ResponseEntity<Map<String, Integer>> response = passwordResetCodeController.limparCodigosExpirados();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().get("removidos"));
    }

    private PasswordResetCodeRequestDTO criarRequest(String code, Long usuarioId) {
        return PasswordResetCodeRequestDTO.builder()
            .code(code)
            .createdAt(LocalDateTime.now().minusMinutes(1))
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .used(false)
            .usuarioId(usuarioId)
            .build();
    }

    private PasswordResetCode criarCodigo(Long id, String code, boolean used) {
        Usuario usuario = Usuario.builder()
            .idUsuario(1L)
            .nome("Admin")
            .email("admin@teste.com")
            .role(Role.ROLE_ADMIN)
            .ativo(true)
            .build();

        return PasswordResetCode.builder()
            .id(id)
            .code(code)
            .createdAt(LocalDateTime.now().minusMinutes(2))
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .used(used)
            .usuario(usuario)
            .build();
    }
}
