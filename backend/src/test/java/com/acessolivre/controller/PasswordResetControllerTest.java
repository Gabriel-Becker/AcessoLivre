package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.ForgotPasswordRequestDTO;
import com.acessolivre.dto.request.ResetPasswordRequestDTO;
import com.acessolivre.service.PasswordResetService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PasswordResetControllerTest {

    @Mock
    private PasswordResetService passwordResetService;

    @InjectMocks
    private PasswordResetController passwordResetController;

    @Test
    void forgotPassword_DeveRetornarMensagemComStatus200() {
        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
            .email("user@acessolivre.com")
            .build();

        String mensagem = "Se o email existir em nosso sistema, você receberá instruções.";
        when(passwordResetService.gerarCodigoRecuperacaoComValidacao("user@acessolivre.com"))
            .thenReturn(mensagem);

        ResponseEntity<String> resultado = passwordResetController.forgotPassword(request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(mensagem, resultado.getBody());
    }

    @Test
    void resetPassword_DeveRetornarMensagemComStatus200() {
        ResetPasswordRequestDTO request = ResetPasswordRequestDTO.builder()
            .email("user@acessolivre.com")
            .code("123456")
            .novaSenha("NovaSenha@123")
            .build();

        String mensagem = "Senha redefinida com sucesso";
        when(passwordResetService.redefinirSenhaComValidacao("user@acessolivre.com", "123456", "NovaSenha@123"))
            .thenReturn(mensagem);

        ResponseEntity<String> resultado = passwordResetController.resetPassword(request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(mensagem, resultado.getBody());
    }

    @Test
    void forgotPassword_DeveRetornarMensagemNeutraParaEmailInvalido() {
        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
            .email("inexistente@test.com")
            .build();

        String mensagem = "Se o email existir em nosso sistema, você receberá instruções.";
        when(passwordResetService.gerarCodigoRecuperacaoComValidacao(anyString()))
            .thenReturn(mensagem);

        ResponseEntity<String> resultado = passwordResetController.forgotPassword(request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
    }
}
