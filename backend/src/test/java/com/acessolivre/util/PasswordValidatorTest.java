package com.acessolivre.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    void isStrong_deveRetornarTrue_paraSenhaValida() {
        assertTrue(ValidadorSenha.ehForte("Password123!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaCurta() {
        assertFalse(ValidadorSenha.ehForte("Pass1!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemMaiuscula() {
        assertFalse(ValidadorSenha.ehForte("password123!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemMinuscula() {
        assertFalse(ValidadorSenha.ehForte("PASSWORD123!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemNumero() {
        assertFalse(ValidadorSenha.ehForte("Password!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemEspecial() {
        assertFalse(ValidadorSenha.ehForte("Password123"));
    }

    @Test
    void getStrengthMessage_deveRetornarMensagemQuandoSenhaNula() {
        assertEquals("Senha é obrigatória", ValidadorSenha.obterMensagemForca(null));
    }
}
