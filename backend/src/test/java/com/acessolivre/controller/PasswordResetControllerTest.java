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

import com.acessolivre.dto.request.EsqueciSenhaRequestDTO;
import com.acessolivre.dto.request.RedefinirSenhaRequestDTO;
import com.acessolivre.service.RecuperacaoSenhaService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PasswordResetControllerTest {

    @Mock
    private RecuperacaoSenhaService passwordResetService;

    @InjectMocks
    private RecuperacaoSenhaController passwordResetController;

    @Test
    void forgotPassword_DeveRetornarMensagemComStatus200() {
        EsqueciSenhaRequestDTO request = EsqueciSenhaRequestDTO.builder()
            .email("user@acessolivre.com")
            .build();

        String mensagem = "Se o email existir em nosso sistema, você receberá instruções.";
        when(passwordResetService.gerarCodigoRecuperacaoComValidacao("user@acessolivre.com"))
            .thenReturn(mensagem);

        ResponseEntity<String> resultado = passwordResetController.esqueceuSenha(request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(mensagem, resultado.getBody());
    }

    @Test
    void resetPassword_DeveRetornarMensagemComStatus200() {
        RedefinirSenhaRequestDTO request = RedefinirSenhaRequestDTO.builder()
            .email("user@acessolivre.com")
            .code("123456")
            .novaSenha("NovaSenha@123")
            .build();

        String mensagem = "Senha redefinida com sucesso";
        when(passwordResetService.redefinirSenhaComValidacao("user@acessolivre.com", "123456", "NovaSenha@123"))
            .thenReturn(mensagem);

        ResponseEntity<String> resultado = passwordResetController.redefinirSenha(request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(mensagem, resultado.getBody());
    }

    @Test
    void forgotPassword_DeveRetornarMensagemNeutraParaEmailInvalido() {
        EsqueciSenhaRequestDTO request = EsqueciSenhaRequestDTO.builder()
            .email("inexistente@test.com")
            .build();

        String mensagem = "Se o email existir em nosso sistema, você receberá instruções.";
        when(passwordResetService.gerarCodigoRecuperacaoComValidacao(anyString()))
            .thenReturn(mensagem);

        ResponseEntity<String> resultado = passwordResetController.esqueceuSenha(request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
    }
}
